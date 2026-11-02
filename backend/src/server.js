import mongoose from 'mongoose';
import { app } from './app.js';
import { config } from './config/env.js';

try {
  await mongoose.connect(config.MONGODB_URI);
  const server = app.listen(config.PORT, () => {
    console.log(`User Management API listening on port ${config.PORT}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });
  }
} catch (error) {
  console.error('Failed to start the User Management API:', error);
  process.exitCode = 1;
}
