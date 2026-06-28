import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { findUserByUsername, createUser } from '../models/userModel';
import { logger } from '../config/logger';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Username and password are required',
      });
      return;
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      res.status(400).json({
        status: 'fail',
        message: 'Username must be at least 3 characters long',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const existingUser = await findUserByUsername(trimmedUsername);
    if (existingUser) {
      res.status(409).json({
        status: 'fail',
        message: 'Username is already taken',
      });
      return;
    }

    const user = await createUser(trimmedUsername, password);
    logger.info(`[Auth] User registered: "${user.username}" (${user.id})`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Username and password are required',
      });
      return;
    }

    const user = await findUserByUsername(username);
    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid username or password',
      });
      return;
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.info(`[Auth] User login successful: "${user.username}"`);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      data: {
        userId: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
};
