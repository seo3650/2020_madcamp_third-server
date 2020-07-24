import express from 'express';
const router = express.Router();


const friendCtrl = require('./friend.controller');

router.put('/addBlockUser', friendCtrl.addBlockUser);
router.delete('/deleteBlockUser', friendCtrl.deleteBlockUser);

export default router;