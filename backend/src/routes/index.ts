import { Router } from 'express';
import UserRouter from './Users';
import AccountRouter from './account/index'

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/account', AccountRouter);
// Export the base-router
export default router;
