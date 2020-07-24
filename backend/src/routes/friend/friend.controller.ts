import { emit } from "process";

var Joi = require('joi');
var Account = require('../../../models/account');

exports.addBlockUser = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        blockUserId: Joi.string().required(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }

    /* Find account */
    let account = null;
    try {
        account = await Account.findByID(req.body.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
    }

    /* Find block user */
    let blockAccount: any = null;
    try {
        blockAccount = await Account.findByID(req.body.blockUserId);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!blockAccount) {
        res.status(404).json({ message: "Can't countpart account" });
        return;
    }

    /* Check duplicate */
    let blockUser = await account.blockList.filter(function(object: string) {
        console.log(object.toString());
        console.log(req.body.blockUserId);
        return object.toString() == blockAccount._id;
    }) 
    if (blockUser.length != 0) {
        res.status(409).json({ message: "Already blocked user." });
        return;
    }

    /* Add blockUser */
    const updateResult = await Account.updateOne(
        { _id: account._id },
        {
            $push: {
                blockList: blockAccount._id
            }
        }
    )
    console.log(updateResult)
    res.status(201).json({ blockUserId: blockAccount.id });
}

exports.deleteBlockUser = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        unblockUserId: Joi.string().required(),
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }

    /* Find account */
    let account = null;
    try {
        account = await Account.findByID(req.body.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
    }

    /* Find block user */
    let blockAccount: any = null;
    try {
        blockAccount = await Account.findByID(req.body.unblockUserId);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!blockAccount) {
        res.status(404).json({ message: "Can't countpart account" });
        return;
    }

    /* Check duplicate */
    let blockUser = await account.blockList.filter(function(object: string) {
        return object == <string>blockAccount._id;
    }) 
    if (blockUser.length == 0) {
        res.status(409).json({ message: "Already unblocked user." });
        return;
    }

    /* Delete blockUser */
    await Account.updateOne(
        { _id: account._id },
        {
            $pull: {
                blockList: blockAccount._id
            }
        }
    )
    res.status(201).json({ blockUserId: blockAccount.id });
}

exports.addContact = async(req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        friendID: Joi.string().required(),
        contactTime: Joi.number().required(),
        continueTime: Joi.number().required()
    });
    const result = schema.validate(req.body);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }
    
    /* Find account */
    let account = null;
    try {
        account = await Account.findByID(req.body.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
    }

    /* Find friend account */
    let friendAccount: any = null;
    try {
        friendAccount = await Account.findByID(req.body.friendID);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!friendAccount) {
        res.status(404).json({ message: "Can't find friend account" });
        return;
    }

    /* Add contact */
    let friendContactInfo: Array<any> = [];
    try {
        friendContactInfo = await account.friends.filter(function(object: any) {
            return object.friendID.toString() == <string>friendAccount._id;
        })
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }

    if (friendContactInfo.length == 0) {
        await Account.updateOne(
            { _id: account._id },
            {
                $push: {
                    friends: {
                        friendID: friendAccount._id,
                        contactTime: [req.body.contactTime],
                        continueTime: [req.body.continueTime],
                    }
                }
            }
        )
        res.status(200).json({ message: true });
        return;
    }
    friendContactInfo[0].contactTime.push(req.body.contactTime);
    friendContactInfo[0].continueTime.push(req.body.continueTime);
    await Account.updateOne(
        { _id: account._id },
        {
            $pull: {
                friends: { friendID: friendAccount._id }
            }
        }
    )
    await Account.updateOne(
        { _id: account._id },
        {
            $push: {
                friends: friendContactInfo
            }
        }
    )
    res.status(200).json({ message: true });
}

exports.getIntimacy = async(req: any, res: any) => {
    console.log(req.query)
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        friendID: Joi.string().required(),
    });
    const result = schema.validate(req.query);
    if (result.error) {
        res.status(400).json({ message: result.error.message });
        return;
    }
    
    /* Find account */
    let account = null;
    try {
        account = await Account.findByID(req.query.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!account) {
        res.status(404).json({ message: "Can't find account" });
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
        res.status(404).json({ message: "Can't find friend account" });
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

    if (friendContactInfo.length == 0) {
        res.status(404).json({ message: "Can't find friend contact info." });
        return;
    }
    
    /* Get intimacy score */
    let intimacyScore = 0;
    let contactTimes = friendContactInfo[0].continueTime
    for (var i = 0; i < contactTimes.length; i++) {
        intimacyScore += contactTimes[i];
    }
    
    res.status(200).json({ 
        intimacyScore: intimacyScore,
        conatctTime: friendContactInfo[0].contactTime,
        continueTime: friendContactInfo[0].continueTime});
}