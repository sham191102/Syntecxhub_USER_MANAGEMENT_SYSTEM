import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/user.js';
import { asyncHandler } from '../middleware/async-handler.js';

function createAccessToken(user) {
  return jwt.sign({ sub: user.id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
}

function authenticationResponse(user, status) {
  return {
    status,
    body: {
      user: user.toJSON(),
      token: createAccessToken(user)
    }
  };
}

export const register = asyncHandler(async (request, response) => {
  const user = await User.create(request.validated.body);
  const result = authenticationResponse(user, 201);
  response.status(result.status).json(result.body);
});

export const login = asyncHandler(async (request, response) => {
  const credentials = request.validated.body;
  const user = await User.findOne({ email: credentials.email }).select('+password');
  if (!user || !(await user.verifyPassword(credentials.password))) {
    return response.status(401).json({ error: 'Invalid email or password' });
  }

  const result = authenticationResponse(user, 200);
  response.status(result.status).json(result.body);
});
