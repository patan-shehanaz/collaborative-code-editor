import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Map frontend language keys to Judge0 language IDs
const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 102, // JavaScript (Node.js 22.08.0)
  typescript: 101, // TypeScript (5.6.2)
  python: 100,     // Python (3.12.5)
  java: 91,        // Java (JDK 17.0.6)
  cpp: 105,        // C++ (GCC 14.1.0)
  c: 103,          // C (GCC 14.1.0)
};

export const runCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      res.status(400).json({
        status: 'fail',
        message: 'Language and code are required fields',
      });
      return;
    }

    const langId = LANGUAGE_ID_MAP[language.toLowerCase()];
    if (!langId) {
      logger.warn(`[CodeExecution] Unsupported language requested: ${language}`);
      res.status(400).json({
        status: 'fail',
        message: `Unsupported language: ${language}. Supported: javascript, typescript, python, java, cpp, c.`,
      });
      return;
    }

    logger.info(`[CodeExecution] Running ${language} (Judge0 ID: ${langId})`);

    // Call Judge0 CE sandboxed API
    const response = await fetch('https://ce.judge0.com/submissions?wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[CodeExecution] Judge0 API error (status ${response.status}): ${errorText}`);
      res.status(502).json({
        status: 'error',
        message: 'Failed to run code: execution sandbox returned an error status',
      });
      return;
    }

    const data = (await response.json()) as any;

    const stdout = data.stdout || '';
    const stderr = data.stderr || '';
    const compileOutput = data.compile_output || '';
    const exitCode = data.status?.id === 3 ? 0 : (data.status?.id || 1);

    logger.info(`[CodeExecution] Completed run. Status: ${data.status?.description || 'unknown'} (Exit code: ${exitCode})`);

    res.status(200).json({
      stdout,
      stderr,
      compile_output: compileOutput,
      exitCode,
    });
  } catch (error) {
    logger.error(`[CodeExecution] Exception: ${error}`);
    next(error);
  }
};
