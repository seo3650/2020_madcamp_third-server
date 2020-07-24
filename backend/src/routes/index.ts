import { Router } from 'express';
import UserRouter from './Users';
import AccountRouter from './account/index';
import FriendRouter from './friend/index';
import ImageRouter from './image/index';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/account', AccountRouter);
router.use('/friend', FriendRouter);
router.use('/image', ImageRouter);
// Export the base-router
export default router;
