import express from 'express';
const router = express.Router();


const friendCtrl = require('./friend.controller');

router.put('/addBlockUser', friendCtrl.addBlockUser);
router.delete('/deleteBlockUser', friendCtrl.deleteBlockUser);
router.post('/addContact', friendCtrl.addContact);
router.get('/getIntimacy', friendCtrl.getIntimacy);
router.get('/getContactID', friendCtrl.getContactID);

export default router;