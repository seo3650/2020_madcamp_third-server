const Joi = require('joi');
var Account = require('../../../models/account');

exports.register = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().alphanum().min(3).max(15).required(),
        name: Joi.string().required(),
        password: Joi.string().required().min(4).max(15),
        phoneNumber: Joi.string().min(10).max(13).required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }

    /* Check duplicate */
    let existing = null;
    try {
        existing = await Account.findByID(req.body.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    } 
    if (existing) {
        res.stauts(409).json({ message: "Duplicated userID" });
        return;
    }

    /* Create account */
    let account = null;
    try {
        account = await Account.register(req.body);
    } catch (e) {
        res.status(500).json({message: e.message});
    }

    res.status(200).json({ userID: account });
}