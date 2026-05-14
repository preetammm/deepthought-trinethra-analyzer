const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');

const app = express();
const port = process.env.PORT || 5000;
const ollama = new Ollama();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Health check — also verifies Ollama connectivity
app.get('/api/health', async (req, res) => {
  try {
    await ollama.list();
    res.json({ status: 'ok', ollama: true, timestamp: new Date().toISOString() });
  } catch {
    res.json({ status: 'degraded', ollama: false, timestamp: new Date().toISOString() });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required and must be a non-empty string.' });
    }

    // Trim very long transcripts to prevent overload
    const trimmed = transcript.trim().slice(0, 15000);

    const systemPrompt = `You are an expert transcript analyst. Your task is to analyze the provided transcript and return a STRICTLY VALID JSON object. Follow these rules absolutely:

RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no explanatory text.
2. Every claim must be supported by evidence directly from the transcript.
3. Do NOT hallucinate or fabricate information not present in the transcript.
4. Keep all text concise (1-2 sentences max per item).
5. Scores must be integers from 1 to 10 with honest, evidence-based justification.
6. If the transcript is too short or unclear, still return the JSON structure with honest assessments.

Return this EXACT JSON structure:
{
  "summary": "A concise 2-3 sentence overview of the transcript content and context.",
  "strengths": ["strength 1 with evidence", "strength 2 with evidence", "strength 3 with evidence"],
  "weaknesses": ["weakness 1 with evidence", "weakness 2 with evidence"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "follow_up_questions": ["relevant question 1", "relevant question 2", "relevant question 3"],
  "scores": {
    "communication": { "score": 7, "reason": "Brief evidence-based reason" },
    "professionalism": { "score": 8, "reason": "Brief evidence-based reason" },
    "engagement": { "score": 6, "reason": "Brief evidence-based reason" }
  },
  "extracted_evidence": ["direct quote or paraphrase 1", "direct quote or paraphrase 2"],
  "gap_analysis": ["missed opportunity 1", "missed opportunity 2"]
}`;

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this transcript:\n\n${trimmed}` }
      ],
      format: 'json',
      options: {
        temperature: 0.3,
        num_predict: 2048,
      },
    });

    clearTimeout(timeout);

    let analysisResult;
    try {
      analysisResult = JSON.parse(response.message.content);
    } catch {
      // If Ollama returns malformed JSON, try to extract JSON from the response
      const jsonMatch = response.message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI returned invalid JSON response.');
      }
    }

    // Ensure all expected fields exist with defaults
    const safeResult = {
      summary: analysisResult.summary || 'No summary available.',
      strengths: Array.isArray(analysisResult.strengths) ? analysisResult.strengths : [],
      weaknesses: Array.isArray(analysisResult.weaknesses) ? analysisResult.weaknesses : [],
      recommendations: Array.isArray(analysisResult.recommendations) ? analysisResult.recommendations : [],
      follow_up_questions: Array.isArray(analysisResult.follow_up_questions) ? analysisResult.follow_up_questions : [],
      scores: {
        communication: {
          score: Math.min(10, Math.max(1, analysisResult.scores?.communication?.score || 5)),
          reason: analysisResult.scores?.communication?.reason || 'No assessment available.'
        },
        professionalism: {
          score: Math.min(10, Math.max(1, analysisResult.scores?.professionalism?.score || 5)),
          reason: analysisResult.scores?.professionalism?.reason || 'No assessment available.'
        },
        engagement: {
          score: Math.min(10, Math.max(1, analysisResult.scores?.engagement?.score || 5)),
          reason: analysisResult.scores?.engagement?.reason || 'No assessment available.'
        }
      },
      extracted_evidence: Array.isArray(analysisResult.extracted_evidence) ? analysisResult.extracted_evidence : [],
      gap_analysis: Array.isArray(analysisResult.gap_analysis) ? analysisResult.gap_analysis : [],
      analyzed_at: new Date().toISOString()
    };

    res.json(safeResult);
  } catch (error) {
    console.error('Error analyzing transcript:', error.message);

    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      return res.status(504).json({
        error: 'Analysis timed out. The AI model took too long to respond. Please try with a shorter transcript.'
      });
    }

    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      return res.status(503).json({
        error: 'Ollama is not running. Please start Ollama with "ollama serve" and ensure llama3 model is pulled.'
      });
    }

    res.status(500).json({
      error: 'Failed to analyze transcript. Please try again.'
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Trinethra Backend running on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/api/health`);
});
