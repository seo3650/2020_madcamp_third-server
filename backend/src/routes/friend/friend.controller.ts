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
    let blockAccount = null;
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
        return object == req.body.blockUserId;
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
    const updateResult = await Account.updateOne(
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
    let friendAccount = null;
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
    let friendContactInfo = null;
    try {
        friendContactInfo = await account.findFriendContactInfo(friendAccount._id);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!friendContactInfo) {
        await Account.updateOne(
            { _id: account._id },
            {
                $push: {
                    friends: {
                        id: friendAccount._id,
                        contactTime: [req.body.contactTime],
                        continueTime: [req.body.continueTime],
                    }
                }
            }
        )
        res.status(200).json({ message: true });
        return;
    }
    console.log(friendContactInfo);
    friendContactInfo.contactTime.push(req.body.contactTime);
    friendContactInfo.continueTime.push(req.body.continueTime);
    
    await Account.updateOne(
        { _id: account._id },
        {
            $pop: {
                friends: { id: friendAccount._id }
            }
        }
    )
    console.log(account);
    await Account.updateOne(
        { _id: account._id },
        {
            $push: {
                friends: friendContactInfo
            }
        }
    )
    console.log(account);

}