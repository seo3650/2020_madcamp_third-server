import express from 'express';
const router = express.Router();

const imageCtrl = require('./image.controller');

/* Image upload setting */
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req: any, file: any, cb: any){
        cb(null, '../public/images');
    },

    filename: function(req: any, file: any, cb: any) {
        if (!req.query.id || !req.query.imageKind) {
            return;
        }
        cb(null, req.query.id
            + "_" + req.query.imageKind
            + "_" + file.originalname);
    }
})
const upload = multer({ storage: storage });

router.post('/uploadProfile', upload.single('image'), imageCtrl.uploadProfile);
router.get('/downloadProfile', imageCtrl.downloadProfile);

export default router;