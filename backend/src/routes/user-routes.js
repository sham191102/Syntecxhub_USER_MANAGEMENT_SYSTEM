import { Router } from 'express';
import {
  createUser,
  deleteProfile,
  deleteUser,
  getProfile,
  getUser,
  getUserStats,
  listUsers,
  updateProfile,
  updateUser
} from '../controllers/user-controller.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateProfileSchema,
  updateUserSchema,
  userIdSchema
} from '../validation/schemas.js';

const router = Router();

router.use(requireAuth);
router.get('/me', getProfile);
router.patch('/me', validate({ body: updateProfileSchema }), updateProfile);
router.delete('/me', deleteProfile);

router.use(requireAdmin);
router.get('/', validate({ query: listUsersQuerySchema }), listUsers);
router.get('/stats', getUserStats);
router.post('/', validate({ body: createUserSchema }), createUser);
router.get('/:id', validate({ params: userIdSchema }), getUser);
router.patch('/:id', validate({ params: userIdSchema, body: updateUserSchema }), updateUser);
router.delete('/:id', validate({ params: userIdSchema }), deleteUser);

export default router;
