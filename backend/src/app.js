import cors from 'cors';
import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config/env.js';
import authRoutes from './routes/auth-routes.js';
import userRoutes from './routes/user-routes.js';
import { isDuplicateKeyError } from './controllers/user-controller.js';

export const app = express();
const frontendDirectory = fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
const frontendIndex = fileURLToPath(new URL('../../frontend/dist/index.html', import.meta.url));

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' }
}), authRoutes);
app.use('/api/users', userRoutes);

if (config.NODE_ENV === 'production' && existsSync(frontendIndex)) {
  app.use(express.static(frontendDirectory));
  app.get('/{*path}', (request, response, next) => {
    if (request.path === '/api' || request.path.startsWith('/api/')) return next();
    response.sendFile(frontendIndex, (error) => {
      if (error) next(error);
    });
  });
}

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

app.use((error, _request, response, _next) => {
  if (isDuplicateKeyError(error)) {
    return response.status(409).json({ error: 'A user with that email already exists' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: 'User data failed validation' });
  }

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid identifier' });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const body = { error: status === 500 ? 'Internal server error' : error.message };
  if (error.details) body.details = error.details;
  if (status === 500) console.error(error);
  response.status(status).json(body);
});
