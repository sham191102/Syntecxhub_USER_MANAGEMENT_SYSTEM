import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/user.js';
import { asyncHandler } from './async-handler.js';

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization');
  const [scheme, token] = authorization?.split(' ') ?? [];

  if (scheme !== 'Bearer' || !token) {
    return next({ status: 401, message: 'A bearer token is required' });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.JWT_SECRET);
  } catch {
    return next({ status: 401, message: 'The access token is invalid or expired' });
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    return next({ status: 401, message: 'The account for this token no longer exists' });
  }

  request.user = user;
  next();
});

export function requireAdmin(request, _response, next) {
  if (request.user?.role !== 'admin') {
    return next({ status: 403, message: 'Administrator access is required' });
  }

  next();
}
