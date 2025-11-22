<<<<<<< HEAD
const { XMLParser } = require('fast-xml-parser');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true
});

exports.parseXML = (xmlContent) => {
  try {
    return parser.parse(xmlContent);
  } catch (error) {
    throw new Error(`XML parsing failed: ${error.message}`);
  }
};

exports.extractMCQs = (parsedXML) => {
  const questions = [];
  const mcqs = parsedXML.mcqs?.question || parsedXML.questions?.question || [];
  const questionArray = Array.isArray(mcqs) ? mcqs : [mcqs];

  questionArray.forEach((q, index) => {
    try {
      const options = Array.isArray(q.options?.option) ? q.options.option : [q.options?.option];
      const correctOption = options.find(opt => opt['@_correct'] === true || opt['@_correct'] === 'true');

      questions.push({
        questionText: q.text || q.questionText || '',
        options: options.map(opt => ({
          text: typeof opt === 'string' ? opt : opt['#text'] || opt.text || '',
          isCorrect: opt === correctOption || opt['@_correct'] === true || opt['@_correct'] === 'true'
        })),
        explanation: q.explanation || '',
        difficulty: q.difficulty || q['@_difficulty'] || 'medium',
        subject: q.subject || q['@_subject'] || '',
        chapter: q.chapter || q['@_chapter'] || '',
        grade: q.grade || q['@_grade'] || '',
        marks: parseInt(q.marks || q['@_marks'] || 1),
        tags: q.tags ? (Array.isArray(q.tags) ? q.tags : q.tags.split(',').map(t => t.trim())) : []
      });
    } catch (error) {
      console.error(`Error parsing question ${index + 1}:`, error);
    }
  });

  return questions;
};

exports.validateMCQ = (mcq) => {
  const errors = [];

  if (!mcq.questionText || mcq.questionText.trim() === '') {
    errors.push('Question text is required');
  }

  if (!mcq.options || mcq.options.length < 2) {
    errors.push('At least 2 options are required');
  }

  const correctOptions = mcq.options?.filter(opt => opt.isCorrect);
  if (!correctOptions || correctOptions.length !== 1) {
    errors.push('Exactly one correct option must be specified');
  }

  if (!mcq.subject || mcq.subject.trim() === '') {
    errors.push('Subject is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
=======
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

// Parse XML file and extract questions
exports.parseQuestionsXML = async (filePath) => {
  try {
    // Read XML file
    const xmlContent = fs.readFileSync(filePath, 'utf8');

    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Extract questions
    const questions = [];
    const questionNodes = xmlDoc.getElementsByTagName('question');

    for (let i = 0; i < questionNodes.length; i++) {
      const questionNode = questionNodes[i];
      const question = parseQuestionNode(questionNode);

      if (question) {
        questions.push(question);
      }
    }

    return {
      success: true,
      questions,
      totalParsed: questions.length,
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      questions: [],
      totalParsed: 0,
      errors: [error.message]
    };
  }
};

// Parse individual question node
function parseQuestionNode(questionNode) {
  try {
    const question = {
      question: getNodeText(questionNode, 'text'),
      options: [],
      correctAnswerIndex: 0,
      explanation: getNodeText(questionNode, 'explanation') || '',
      difficulty: getNodeText(questionNode, 'difficulty') || 'medium',
      subject: getNodeText(questionNode, 'subject') || '',
      chapter: getNodeText(questionNode, 'chapter') || '',
      grade: getNodeText(questionNode, 'grade') || '',
      topic: getNodeText(questionNode, 'topic') || '',
      marks: parseInt(getNodeText(questionNode, 'marks')) || 1,
      negativeMarking: parseFloat(getNodeText(questionNode, 'negativeMarking')) || 0,
      tags: [],
      imageUrl: getNodeText(questionNode, 'imageUrl') || '',
      importSource: 'xml'
    };

    // Parse options
    const optionsNode = questionNode.getElementsByTagName('options')[0];
    if (optionsNode) {
      const optionNodes = optionsNode.getElementsByTagName('option');

      for (let i = 0; i < optionNodes.length && i < 4; i++) {
        const optionNode = optionNodes[i];
        const optionText = optionNode.textContent || '';
        const isCorrect = optionNode.getAttribute('correct') === 'true';

        question.options.push({
          text: optionText.trim(),
          isCorrect
        });

        if (isCorrect) {
          question.correctAnswerIndex = i;
        }
      }
    }

    // Parse tags
    const tagsNode = questionNode.getElementsByTagName('tags')[0];
    if (tagsNode) {
      const tagNodes = tagsNode.getElementsByTagName('tag');
      for (let i = 0; i < tagNodes.length; i++) {
        const tag = tagNodes[i].textContent?.trim();
        if (tag) {
          question.tags.push(tag);
        }
      }
    }

    // Validate question
    if (!question.question || question.options.length < 2) {
      return null;
    }

    return question;

  } catch (error) {
    console.error('Error parsing question node:', error);
    return null;
  }
}

// Parse test XML
exports.parseTestXML = async (filePath) => {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const testNode = xmlDoc.getElementsByTagName('test')[0];
    if (!testNode) {
      throw new Error('Invalid test XML: No test element found');
    }

    const test = {
      title: getNodeText(testNode, 'title'),
      description: getNodeText(testNode, 'description') || '',
      subject: getNodeText(testNode, 'subject'),
      chapter: getNodeText(testNode, 'chapter'),
      grade: getNodeText(testNode, 'grade'),
      duration: parseInt(getNodeText(testNode, 'duration')) || 60,
      totalMarks: parseInt(getNodeText(testNode, 'totalMarks')) || 0,
      passingMarks: parseInt(getNodeText(testNode, 'passingMarks')) || 0,
      instructions: getNodeText(testNode, 'instructions') || '',
      questions: []
    };

    // Parse questions within test
    const questionsNode = testNode.getElementsByTagName('questions')[0];
    if (questionsNode) {
      const questionNodes = questionsNode.getElementsByTagName('question');

      for (let i = 0; i < questionNodes.length; i++) {
        const questionNode = questionNodes[i];
        const questionId = questionNode.getAttribute('id');

        if (questionId) {
          test.questions.push(questionId);
        }
      }
    }

    return {
      success: true,
      test,
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      test: null,
      errors: [error.message]
    };
  }
};

// Parse subject XML
exports.parseSubjectXML = async (filePath) => {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const subjectNode = xmlDoc.getElementsByTagName('subject')[0];
    if (!subjectNode) {
      throw new Error('Invalid subject XML: No subject element found');
    }

    const subject = {
      name: getNodeText(subjectNode, 'name'),
      code: getNodeText(subjectNode, 'code'),
      grade: getNodeText(subjectNode, 'grade'),
      description: getNodeText(subjectNode, 'description') || '',
      order: parseInt(getNodeText(subjectNode, 'order')) || 0,
      chapters: []
    };

    // Parse chapters
    const chaptersNode = subjectNode.getElementsByTagName('chapters')[0];
    if (chaptersNode) {
      const chapterNodes = chaptersNode.getElementsByTagName('chapter');

      for (let i = 0; i < chapterNodes.length; i++) {
        const chapterNode = chapterNodes[i];
        const chapter = {
          name: getNodeText(chapterNode, 'name'),
          chapterNumber: parseInt(getNodeText(chapterNode, 'chapterNumber')) || i + 1,
          description: getNodeText(chapterNode, 'description') || '',
          learningObjectives: []
        };

        // Parse learning objectives
        const objectivesNode = chapterNode.getElementsByTagName('learningObjectives')[0];
        if (objectivesNode) {
          const objectiveNodes = objectivesNode.getElementsByTagName('objective');
          for (let j = 0; j < objectiveNodes.length; j++) {
            const objective = objectiveNodes[j].textContent?.trim();
            if (objective) {
              chapter.learningObjectives.push(objective);
            }
          }
        }

        subject.chapters.push(chapter);
      }
    }

    return {
      success: true,
      subject,
      errors: []
    };

  } catch (error) {
    return {
      success: false,
      subject: null,
      errors: [error.message]
    };
  }
};

// Utility function to get text content of a node
function getNodeText(parentNode, tagName) {
  const node = parentNode.getElementsByTagName(tagName)[0];
  return node ? node.textContent?.trim() : '';
}

// Validate XML structure
exports.validateXMLStructure = (filePath) => {
  try {
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    const parser = new DOMParser();

    // Try to parse XML
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parser errors
    const parserErrors = xmlDoc.getElementsByTagName('parsererror');
    if (parserErrors.length > 0) {
      return {
        valid: false,
        errors: ['Invalid XML syntax']
      };
    }

    // Check root element
    const rootElement = xmlDoc.documentElement;
    const validRoots = ['questions', 'question', 'test', 'subject'];

    if (!validRoots.includes(rootElement.tagName)) {
      return {
        valid: false,
        errors: [`Invalid root element. Expected one of: ${validRoots.join(', ')}`]
      };
    }

    return {
      valid: true,
      rootElement: rootElement.tagName,
      errors: []
    };

  } catch (error) {
    return {
      valid: false,
      errors: [error.message]
    };
  }
};

// Generate XML template
exports.generateXMLTemplate = (type) => {
  const templates = {
    questions: `<?xml version="1.0" encoding="UTF-8"?>
<questions>
  <question>
    <text>What is the powerhouse of the cell?</text>
    <options>
      <option correct="true">Mitochondria</option>
      <option>Nucleus</option>
      <option>Ribosome</option>
      <option>Endoplasmic Reticulum</option>
    </options>
    <explanation>The mitochondria is known as the powerhouse of the cell because it produces ATP energy.</explanation>
    <difficulty>easy</difficulty>
    <subject>Cell Biology</subject>
    <chapter>Cell Structure</chapter>
    <grade>10</grade>
    <topic>Organelles</topic>
    <marks>1</marks>
    <negativeMarking>0</negativeMarking>
    <tags>
      <tag>cell</tag>
      <tag>organelles</tag>
      <tag>mitochondria</tag>
    </tags>
  </question>
</questions>`,

    test: `<?xml version="1.0" encoding="UTF-8"?>
<test>
  <title>Cell Biology Quiz</title>
  <description>A comprehensive quiz on cell structure and function</description>
  <subject>Cell Biology</subject>
  <chapter>Cell Structure</chapter>
  <grade>10</grade>
  <duration>60</duration>
  <totalMarks>20</totalMarks>
  <passingMarks>12</passingMarks>
  <instructions>Please answer all questions. Each question carries 1 mark.</instructions>
  <questions>
    <question id="507f1f77bcf86cd799439011"/>
    <question id="507f1f77bcf86cd799439012"/>
  </questions>
</test>`,

    subject: `<?xml version="1.0" encoding="UTF-8"?>
<subject>
  <name>Cell Biology</name>
  <code>CELL</code>
  <grade>10</grade>
  <description>Study of cell structure and function</description>
  <order>1</order>
  <chapters>
    <chapter>
      <name>Cell Structure</name>
      <chapterNumber>1</chapterNumber>
      <description>Introduction to cell components</description>
      <learningObjectives>
        <objective>Identify major cell organelles</objective>
        <objective>Understand cell membrane structure</objective>
        <objective>Describe cellular transport mechanisms</objective>
      </learningObjectives>
    </chapter>
  </chapters>
</subject>`
  };

  return templates[type] || templates.questions;
>>>>>>> 4bef707 (Add complete owner dashboard pages with full functionality)
};
