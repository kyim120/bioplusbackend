const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

exports.getStudyRecommendations = async (req, res) => {
  try {
    const { performance, weakTopics, grade, subject } = req.body;

    const prompt = `You are an educational AI assistant for Bio Plus, a biology learning platform.

Student Profile:
- Grade: ${grade}
- Subject: ${subject}
- Weak Topics: ${weakTopics.join(', ')}
- Recent Performance: ${performance}

Generate 5 personalized study recommendations to help this student improve. Each recommendation should:
1. Target their weak areas
2. Be specific and actionable
3. Include estimated time commitment
4. Suggest specific resources (notes, tests, videos)

Format as JSON array with: title, description, priority (high/medium/low), estimatedTime, resources[]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert biology tutor creating personalized study plans.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const recommendations = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

exports.explainConcept = async (req, res) => {
  try {
    const { concept, grade, detail } = req.body;

    const prompt = `Explain the following biology concept for a grade ${grade} student:

Concept: ${concept}

Detail level: ${detail || 'medium'}

Provide:
1. Simple definition
2. Key points (3-5 bullet points)
3. Real-world example
4. Common misconceptions to avoid

Keep it engaging and age-appropriate.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a biology teacher explaining concepts clearly to students.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    res.json({
      success: true,
      explanation: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('AI Explanation Error:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
};

exports.generateQuizQuestions = async (req, res) => {
  try {
    const { topic, grade, difficulty, count } = req.body;

    const prompt = `Generate ${count || 5} multiple choice questions about ${topic} for grade ${grade} students.

Difficulty: ${difficulty || 'medium'}

Format each question as JSON:
{
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0-3 (index),
  "explanation": "Why this is correct"
}

Return as JSON array.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at creating educational quiz questions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const questions = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('AI Question Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
};

exports.analyzePerformance = async (req, res) => {
  try {
    const { testResults, studentId } = req.body;

    const prompt = `Analyze this student's test performance and provide insights:

Test Results Summary:
- Total Tests: ${testResults.totalTests}
- Average Score: ${testResults.averageScore}%
- Strong Topics: ${testResults.strongTopics.join(', ')}
- Weak Topics: ${testResults.weakTopics.join(', ')}
- Time Management: ${testResults.averageTimePerQuestion}s per question

Provide:
1. Overall performance assessment
2. Strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Specific action items (3-5 items)
5. Motivational message

Format as JSON with these sections.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an educational analyst providing constructive feedback.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze performance' });
  }
};
