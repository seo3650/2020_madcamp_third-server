import express from 'express';
const router = express.Router();

const accountCtrl = require('./account.controller');

router.post('/register', accountCtrl.register);
router.post('/login', accountCtrl.login);
router.delete('/delete', accountCtrl.withdrawal);
router.get('/findUser', accountCtrl.findUser);

export default router;