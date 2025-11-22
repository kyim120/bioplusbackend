const xmlParser = require('fast-xml-parser');
const Question = require('../models/Question');
const { v4: uuidv4 } = require('uuid');

exports.importMCQsFromXML = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No XML file uploaded' });
    }

    const xmlContent = req.file.buffer.toString('utf8');
    
    const parser = new xmlParser.XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });
    
    const result = parser.parse(xmlContent);
    
    if (!result.quiz || !result.quiz.questions) {
      return res.status(400).json({ error: 'Invalid XML structure. Expected <quiz><questions>...</questions></quiz>' });
    }

    const metadata = result.quiz.metadata || {};
    const questionsData = Array.isArray(result.quiz.questions.question)
      ? result.quiz.questions.question
      : [result.quiz.questions.question];

    const batchId = uuidv4();
    const questions = [];
    const errors = [];

    for (let i = 0; i < questionsData.length; i++) {
      try {
        const q = questionsData[i];
        
        const options = Array.isArray(q.options.option)
          ? q.options.option
          : [q.options.option];
        
        const correctIndex = options.findIndex(opt => 
          opt['@_correct'] === 'true' || opt['@_correct'] === true
        );

        if (correctIndex === -1) {
          errors.push({
            questionNumber: i + 1,
            error: 'No correct answer specified'
          });
          continue;
        }

        const questionDoc = {
          question: q.text,
          options: options.map(opt => ({
            text: typeof opt === 'string' ? opt : opt['#text'] || opt,
            isCorrect: opt['@_correct'] === 'true' || opt['@_correct'] === true
          })),
          correctAnswerIndex: correctIndex,
          explanation: q.explanation || '',
          difficulty: q.difficulty || metadata.difficulty || 'medium',
          subject: metadata.subject,
          chapter: metadata.chapter,
          grade: metadata.grade,
          topic: q.topic || '',
          marks: parseInt(q.marks) || 1,
          tags: q.tags?.tag ? (Array.isArray(q.tags.tag) ? q.tags.tag : [q.tags.tag]) : [],
          importSource: 'xml',
          importBatchId: batchId,
          status: 'active',
          stats: {
            timesUsed: 0,
            correctAttempts: 0,
            totalAttempts: 0
          },
          createdBy: req.user._id
        };

        questions.push(questionDoc);
      } catch (err) {
        errors.push({
          questionNumber: i + 1,
          error: err.message
        });
      }
    }

    const insertedQuestions = await Question.insertMany(questions);

    res.status(200).json({
      success: true,
      message: 'XML import completed',
      batchId,
      total: questionsData.length,
      imported: insertedQuestions.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('XML Import Error:', error);
    res.status(500).json({ error: 'Failed to import XML', details: error.message });
  }
};

exports.getImportHistory = async (req, res) => {
  try {
    const batches = await Question.aggregate([
      { $match: { importSource: 'xml' } },
      { 
        $group: {
          _id: '$importBatchId',
          count: { $sum: 1 },
          firstImported: { $min: '$createdAt' },
          subject: { $first: '$subject' },
          grade: { $first: '$grade' }
        }
      },
      { $sort: { firstImported: -1 } }
    ]);

    res.json({ success: true, batches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getQuestionsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const questions = await Question.find({ importBatchId: batchId });
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
