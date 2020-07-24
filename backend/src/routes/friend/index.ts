import express from 'express';
const router = express.Router();


const friendCtrl = require('./friend.controller');

router.put('/addBlockUser', friendCtrl.addBlockUser);
router.delete('/deleteBlockUser', friendCtrl.deleteBlockUser);
router.post('/addContact', friendCtrl.addContact);
// router.post('/getIntimacy', friendCtrl.getIntimacy);

export default router;