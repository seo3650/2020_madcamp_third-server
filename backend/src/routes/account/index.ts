import express from 'express';
const router = express.Router();

const accountCtrl = require('./account.controller');

router.post('/register', accountCtrl.register);
router.post('/login', accountCtrl.login);
router.post('/delete', accountCtrl.withdrawal);

export default router;