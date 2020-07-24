const Joi = require('joi');
var Account = require('../../../models/account');
const debug = require('debug')('account');

exports.register = async (req: any, res: any) => {
    console.log(req.body);
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
        res.status(409).json({ message: "Duplicated userID" });
        return;
    }

    /* Create account */
    let account = null;
    try {
        account = await Account.register(req.body);
    } catch (e) {
        res.status(500).json({message: e.message});
        return;
    }

    res.status(200).json({ userID: account });
}

exports.login = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        password: Joi.string().required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }

    /* Try login */
    const { id, password } = req.body;
    let account = null;
    try {
        account = await Account.findByID(id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }

    if (!account || !account.validatePassword(password)) {
        res.status(401).json({ message: "Invalid ID or PW" })
        return;
    }
    res.status(200).json({ userID: account.id, name: account.name })
}

exports.withdrawal = async (req: any, res: any) => {
    /* Verifiy data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        password: Joi.string().required(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }
    /* Get account */
    let account = null;
    try {
        account = await Account.findByID(req.body.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
        return;
    }

    const password = req.body.password;
    if (!account || !account.validatePassword(password)) {
        res.status(401).json({ message: "Invalid PW" })
        return;
    }

    const remove = await account.withdrawal();
    if (remove.error) {
        res.status(500).json({ message: remove.error });
        return;
    }
    res.status(200).json({ message: true })
    return;
}