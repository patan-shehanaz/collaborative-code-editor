const axios = require('axios');
const { JUDGE0_API_URL, JUDGE0_API_KEY } = require('../config/env');

// Sandboxed code execution via Judge0 (or any compatible execution API).
// Never execute user-submitted code directly on this server.
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

const runCode = async ({ language, sourceCode, stdin = '' }) => {
  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    const err = new Error(`Unsupported language for execution: ${language}`);
    err.statusCode = 400;
    throw err;
  }

  if (!JUDGE0_API_URL) {
    const err = new Error('Execution service is not configured (JUDGE0_API_URL missing)');
    err.statusCode = 500;
    throw err;
  }

  const { data } = await axios.post(
    `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
    { source_code: sourceCode, language_id: languageId, stdin },
    {
      headers: JUDGE0_API_KEY
        ? { 'X-RapidAPI-Key': JUDGE0_API_KEY, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
    }
  );

  return {
    stdout: data.stdout,
    stderr: data.stderr,
    compileOutput: data.compile_output,
    status: data.status?.description,
  };
};

module.exports = { runCode };
