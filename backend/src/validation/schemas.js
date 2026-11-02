import { z } from 'zod';

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().trim().min(2).max(80);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema
}).strict();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128)
}).strict();

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['user', 'admin']).default('user')
}).strict();

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: z.enum(['user', 'admin']).optional()
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one field to update'
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional()
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'Provide at least one field to update'
});

export const userIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'A valid user ID is required')
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  role: z.enum(['user', 'admin']).optional()
}).strict();
