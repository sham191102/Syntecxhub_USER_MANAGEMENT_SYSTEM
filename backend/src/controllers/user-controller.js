import mongoose from 'mongoose';
import { User } from '../models/user.js';
import { asyncHandler } from '../middleware/async-handler.js';

export const getProfile = asyncHandler(async (request, response) => {
  response.json({ user: request.user.toJSON() });
});

export const updateProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user.id);
  if (!user) return response.status(404).json({ error: 'User not found' });
  Object.assign(user, request.validated.body);
  await user.save();
  response.json({ user });
});

export const deleteProfile = asyncHandler(async (request, response) => {
  await User.findByIdAndDelete(request.user.id);
  response.status(204).end();
});

export const listUsers = asyncHandler(async (request, response) => {
  const { page, limit, search, role } = request.validated.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  response.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const getUserStats = asyncHandler(async (_request, response) => {
  const [total, admins, members] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'user' })
  ]);
  response.json({ total, admins, members });
});

export const createUser = asyncHandler(async (request, response) => {
  const user = await User.create(request.validated.body);
  response.status(201).json({ user });
});

export const getUser = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id);
  if (!user) return response.status(404).json({ error: 'User not found' });
  response.json({ user });
});

export const updateUser = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id);
  if (!user) return response.status(404).json({ error: 'User not found' });
  Object.assign(user, request.validated.body);
  await user.save();
  response.json({ user });
});

export const deleteUser = asyncHandler(async (request, response) => {
  const user = await User.findByIdAndDelete(request.params.id);
  if (!user) return response.status(404).json({ error: 'User not found' });
  response.status(204).end();
});

export function isDuplicateKeyError(error) {
  return error instanceof mongoose.mongo.MongoServerError && error.code === 11000;
}
