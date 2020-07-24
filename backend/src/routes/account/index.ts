import express from 'express';
const router = express.Router();

const accountCtrl = require('./account.controller');

router.post('/register', accountCtrl.register);
// account.post('/login', accountCtrl.login);
// account.post('/delete', accountCtrl.delete);

export default router;