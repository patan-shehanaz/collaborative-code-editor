const axios = require('axios');

// Judge0 language IDs
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js
  typescript: 74,
  python:     71,  // Python 3
  java:       62,
  cpp:        54,  // C++ (GCC 9.2.0)
  go:         60,
};

const JUDGE0_URL  = process.env.JUDGE0_API_URL  || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY  = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

// POST /api/execute
async function executeCode(req, res) {
  try {
    const { code, language, stdin } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'code is required' });
    }

    const languageId = LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript;

    if (!JUDGE0_KEY) {
      return res.status(503).json({
        message: 'JUDGE0_API_KEY not configured. Set it in .env to enable code execution.',
      });
    }

    // Step 1 — Submit
    const submitRes = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin || '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_KEY,
          'X-RapidAPI-Host': JUDGE0_HOST,
        },
      }
    );

    const token = submitRes.data.token;

    // Step 2 — Poll for result (max 10 attempts × 1 s)
    let result = null;
    for (let i = 0; i < 10; i++) {
      await sleep(1000);

      const pollRes = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_KEY,
            'X-RapidAPI-Host': JUDGE0_HOST,
          },
        }
      );

      const { status } = pollRes.data;
      // status.id: 1 = In Queue, 2 = Processing, 3+ = done
      if (status.id >= 3) {
        result = pollRes.data;
        break;
      }
    }

    if (!result) {
      return res.status(408).json({ message: 'Execution timed out' });
    }

    return res.json({
      stdout:      result.stdout      || '',
      stderr:      result.stderr      || '',
      compile_output: result.compile_output || '',
      time:        result.time,
      memory:      result.memory,
      status:      result.status,
    });
  } catch (err) {
    console.error('executeCode error:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Code execution failed' });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { executeCode };
