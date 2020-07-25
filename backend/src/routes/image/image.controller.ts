var Joi = require('Joi');
var Account = require('../../../models/account');

exports.uploadProfile = async (req: any, res: any) => {
    /* Verify data  */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        imageKind: Joi.string().required()
    });
    const result = schema.validate(req.query);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }
    
    /* Get account */
    let account = null;
    try {
        account = await Account.findByID(req.query.id);
    } catch (e) {
        console.log(e.message);
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find user" });
        return;
    }

    /* Add profile image */
    const fileName = req.query.id
        + "_" + req.query.imageKind
        + "_" + req.file.originalname;
    const updateResult = await Account.updateOne(
        { _id: account._id },
        {
            $set: {
                profileImage: fileName
            }
        }
    )
    console.log("Upload: " + fileName);

    res.status(200).json({ message: true })
}

exports.downloadProfile = async (req: any, res: any) => {
    /* Find account */
    let account = null;
    try {
        account = await Account.findByID(req.query.id);
    } catch (e) {
        res.status(404).json({ message: e.message });
        return;
    }

    /* Download register */
    const fileName =
        req.query.id
        + "_" + req.query.imageKind
        + "_" + req.query.name;

    res.sendFile(fileName, { root: __dirname + "/../../../../public/images/" });
    console.log("Download: " + fileName);
    return;
}
