const StudyPlan = require('../models/StudyPlan');
const User = require('../models/User');
const Evaluation = require('../models/Evaluation');

exports.generatePlan = async (req, res) => {
  try {
    const studentId = req.body.studentId || req.user._id;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const evals = await Evaluation.find({ student: studentId }).limit(5).sort({ createdAt: -1 });
    const weaknesses = evals.map(e => e.weaknesses).filter(Boolean).join(', ') || 'General improvement needed';

    let plan = {
      focusAreas: ['Indian Polity & Constitution', 'Current Affairs', 'Essay Writing'],
      suggestedStudyHours: 6,
      answerWritingTargets: '10 answers per day',
      revisionStrategy: 'Weekly revision of NCERT + Daily newspaper reading',
      detailedPlan: `Based on your average score of ${student.stats?.averageScore || 0}/100 and ${student.stats?.testsAttempted || 0} tests attempted, focus on: ${weaknesses}. Daily schedule: 6am-8am Current Affairs, 9am-12pm GS Study, 2pm-5pm Answer Writing Practice, 6pm-8pm Revision.`
    };

    // Try Claude API if key available
    if (process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY !== 'your_claude_api_key_here') {
      try {
        const prompt = `You are a UPSC coaching expert. Generate a weekly study plan for a student with average score ${student.stats?.averageScore || 0}/100, ${student.stats?.testsAttempted || 0} tests attempted, weaknesses: ${weaknesses}. Respond in JSON: { focusAreas: [], suggestedStudyHours: number, answerWritingTargets: string, revisionStrategy: string, detailedPlan: string }`;
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.CLAUDE_API_KEY, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
        });
        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) plan = { ...plan, ...JSON.parse(jsonMatch[0]) };
      } catch (aiErr) { console.log('AI fallback used:', aiErr.message); }
    }

    const saved = await StudyPlan.create({ student: studentId, plan, rawText: JSON.stringify(plan) });
    res.status(201).json({ success: true, data: { studyPlan: saved }, message: 'Study plan generated.' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getPlans = async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : {};
    const plans = await StudyPlan.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.readiness = async (req, res) => {
  try {
    const { studyHours = 0, mockTests = 0, stage = 'Beginner', subject = '' } = req.body;
    let score = Math.min(100, Math.round(
      (Number(studyHours) * 5) + (Number(mockTests) * 2) +
      (stage === 'Advanced' ? 30 : stage === 'Intermediate' ? 15 : 0)
    ));
    score = Math.min(score, 100);
    const recommendations = score >= 75
      ? ['Excellent preparation! Focus on answer quality and time management.', 'Attempt full mock tests under exam conditions.', 'Revise weak areas and consolidate strong subjects.']
      : score >= 50
      ? ['Increase daily study hours to 6-8 hours.', 'Attempt at least 2 mock tests per week.', 'Focus on NCERT for strong conceptual foundation.', 'Join answer writing program.']
      : ['Start with NCERT books from class 6-12.', 'Build a consistent daily routine of minimum 4 hours.', 'Join a test series and get evaluations done.', 'Focus on one subject at a time.'];
    res.json({ success: true, data: { score, level: score >= 75 ? 'High' : score >= 50 ? 'Moderate' : 'Low', recommendations } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
