import { resolveSoa } from "dns";

var Joi = require('joi');
var Account = require('../../../models/account');

exports.register = async (req: any, res: any) => {
    console.log(req.body);
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().alphanum().min(3).max(15).required(),
        name: Joi.string().required(),
        password: Joi.string().required().min(4).max(15),
        phoneNumber: Joi.string().min(10).max(13).required(),
        macAddress: Joi.string().required(),
        gender: Joi.string().required(),
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
// TODO: delete image file
exports.withdrawal = async (req: any, res: any) => {
    /* Verifiy data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        password: Joi.string().required(),
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
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
        return;
    }

    const password = req.query.password;
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

exports.findUser = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        macAddress: Joi.string().required()
    });
    const result = schema.validate(req.query);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }

    /* Get account */
    let account = null;
    try {
        account = await Account.findOne({ macAddress: req.query.macAddress });
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
        return;
    }
    console.log(account)

    res.status(200).json({ userID: account.id, userName: account.name });

}

exports.updateProfile = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        age: Joi.number().required(),
        region: Joi.string().required(),
        height: Joi.number().required(),
        job: Joi.string().required(),
        hobby: Joi.string().required(),
        smoke: Joi.boolean().required(),
        drink: Joi.number().min(0).max(3).required(),
        self_instruction: Joi.string().required()
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

    /* Update profile */
    await Account.updateOne(
        { _id: account._id },
        {
            $set: {
                age: req.body.age,
                region: req.body.region,
                height: req.body.height,
                job: req.body.job,
                hobby: req.body.hobby,
                smoke: req.body.smoke,
                drink: req.body.drink,
                self_instruction: req.body.self_instruction
            }
        }
    )

    res.status(200).json({ message: true });
}

exports.downloadProfile = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
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
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
        return;
    }

    res.status(200).json({ 
        age: account.age,
        region: account.region,
        height: account.height,
        job: account.job,
        hobby: account.hobby,
        smoke: account.smoke,
        drink: account.drink,
        self_instruction: account.self_instruction
    });
}

exports.getContactID = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        friendID: Joi.string().required()
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
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
        return;
    }

    /* Find friend account */
    let friendAccount: any = null;
    try {
        friendAccount = await Account.findByID(req.query.friendID);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!friendAccount) {
        res.status(200).json({ contactID: 0 });
        return;
    }

    /* Get friend contact info */
    let friendContactInfo: Array<any> = [];
    try {
        friendContactInfo = await account.friends.filter(function(object: any) {
            return object.friendID.toString() == <string>friendAccount._id;
        })
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }


    res.status(200).json({ contactID: friendContactInfo.length })
}