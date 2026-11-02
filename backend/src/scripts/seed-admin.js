import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { User } from '../models/user.js';

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const resetExistingAdmin = process.argv.includes('--reset');

if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env');
}

if (ADMIN_NAME.trim().length < 2 || ADMIN_NAME.trim().length > 80) {
  throw new Error('ADMIN_NAME must be between 2 and 80 characters');
}

const adminEmail = ADMIN_EMAIL.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail) || adminEmail.length > 254) {
  throw new Error('ADMIN_EMAIL must be a valid email address of at most 254 characters');
}

if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 128) {
  throw new Error('ADMIN_PASSWORD must be between 12 and 128 characters');
}

try {
  await mongoose.connect(config.MONGODB_URI);
  const existingAdmins = await User.find({ role: 'admin' });
  if (existingAdmins.length && !resetExistingAdmin) {
    throw new Error('An administrator already exists; use `npm run reset:admin` to update its login');
  }

  const existingAdmin = resetExistingAdmin
    ? existingAdmins.length === 1
      ? existingAdmins[0]
      : existingAdmins.find(({ email }) => email === adminEmail)
    : undefined;
  if (resetExistingAdmin && existingAdmins.length > 1 && !existingAdmin) {
    throw new Error('Multiple administrators exist; set ADMIN_EMAIL to the email of the admin to reset');
  }
  const accountWithEmail = await User.findOne({ email: adminEmail });
  if (accountWithEmail && !accountWithEmail._id.equals(existingAdmin?._id)) {
    throw new Error('ADMIN_EMAIL is already used by another account');
  }

  if (resetExistingAdmin && existingAdmin) {
    existingAdmin.name = ADMIN_NAME;
    existingAdmin.email = adminEmail;
    existingAdmin.password = ADMIN_PASSWORD;
    await existingAdmin.save();
    console.log(`Updated administrator account: ${existingAdmin.email}`);
  } else {
    const admin = await User.create({
      name: ADMIN_NAME,
      email: adminEmail,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log(`Created administrator account: ${admin.email}`);
  }
} finally {
  await mongoose.disconnect();
}
