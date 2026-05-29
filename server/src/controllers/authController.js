import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/tokens.js';
import { createUser, findUserByEmail, sanitizeUser } from '../models/userModel.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'seller', 'agent']).default('buyer'),
  phone: z.string().min(7).optional().or(z.literal(''))
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const existing = await findUserByEmail(data.email);
  if (existing) throw new ApiError(409, 'Email already exists');

  const password = await bcrypt.hash(data.password, 10);
  const user = await createUser({ ...data, password });
  const token = signToken(user);
  res.status(201).json({ user, token });
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await findUserByEmail(data.email);
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (user.is_suspended) {
    throw new ApiError(403, 'Your account has been suspended by the administrator');
  }
  const safeUser = sanitizeUser(user);
  res.json({ user: safeUser, token: signToken(safeUser) });
}

export async function me(req, res) {
  res.json({ user: req.user });
}
