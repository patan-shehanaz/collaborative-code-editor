import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

// In-memory database representation
const users = new Map<string, User>();

export const findUserByUsername = async (username: string): Promise<User | undefined> => {
  const normalized = username.toLowerCase().trim();
  return Array.from(users.values()).find(
    (user) => user.username.toLowerCase() === normalized
  );
};

export const createUser = async (username: string, passwordPlain: string): Promise<User> => {
  const normalized = username.trim();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);
  
  const user: User = {
    id: Math.random().toString(36).substring(2, 11),
    username: normalized,
    passwordHash,
    createdAt: new Date(),
  };
  
  users.set(user.id, user);
  return user;
};

// For testing purposes: list users (not exposed to API directly)
export const getAllUsers = (): User[] => {
  return Array.from(users.values());
};
