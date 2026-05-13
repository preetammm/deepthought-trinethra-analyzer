const express = require('express');
const cors = require('cors');
const { Ollama } = require('ollama');

const app = express();
const port = process.env.PORT || 5000;
const ollama = new Ollama();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const systemPrompt = `You are an AI transcript analyzer. Analyze the following transcript and return a strictly valid JSON object with EXACTLY the following structure. Do NOT include markdown formatting or any other text outside the JSON object.
{
  "extracted_evidence": ["list of key points or quotes mentioned"],
  "rubric_scoring": {
    "clarity": "score/10 - brief reason",
    "engagement": "score/10 - brief reason",
    "professionalism": "score/10 - brief reason"
  },
  "kpi_mapping": {
    "customer_needs_identified": "brief explanation of needs found",
    "action_items_established": "brief explanation of actions agreed upon"
  },
  "gap_analysis": ["list of missed opportunities or missing information"],
  "follow_up_questions": ["list of relevant follow up questions"]
}`;

    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript }
      ],
      format: 'json',
    });

    const analysisResult = JSON.parse(response.message.content);
    res.json(analysisResult);
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
