import express from 'express';
const router = express.Router();

const accountCtrl = require('./account.controller');

router.post('/register', accountCtrl.register);
router.post('/login', accountCtrl.login);
router.delete('/delete', accountCtrl.withdrawal);
router.get('/findUser', accountCtrl.findUser);
router.post('/updateProfile', accountCtrl.updateProfile);
router.get('/downloadProfile', accountCtrl.downloadProfile);
router.get('/getLike', accountCtrl.getLike);
router.get('/getStar', accountCtrl.getStar);
router.get('/getTodayProbability', accountCtrl.getTodayProbability);

export default router;