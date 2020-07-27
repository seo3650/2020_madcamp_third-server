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

    /* Find block user */
    let blockAccount: any = null;
    try {
        blockAccount = await Account.findByID(req.query.unblockUserId);
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
        contactID: Joi.number().required(),
        position: Joi.string().required(),
        contactTime: Joi.string().required(),
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
    let friends: Array<{
        friendID: any,
        contactInfo: Array<any>
    }> = [];
    try {
        friends = await account.friends.filter(function(object: any) {
            return object.friendID.toString() == <string>friendAccount._id;
        })
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    /* Calculate contact info */
    const contactTime = req.body.contactTime;
    const continueTime = 5;
    const intimacyScore = calculateIntimacy(5, req.body.contactTime);
    const contactID = req.body.contactID;

    /* First meet friend */
    if (friends.length == 0) {
        await Account.updateOne(
            { _id: account._id },
            {
                $push: {
                    friends: {
                        friendID: friendAccount._id,
                        contactInfo: [{
                            contactTime: [contactTime],
                            continueTime: continueTime,
                            intimacyScore: intimacyScore
                        }]
                    }
                }
            }
        )
        res.status(200).json({ intimacyScore: intimacyScore });
        return;
    }

    let contactInfos = null;
    if (friends[0].contactInfo.length < contactID) {
        res.status(400).json({ message: "Invalid contactID" });
        return;
    } else if (friends[0].contactInfo.length == contactID) { // New meet with exist friend
        friends[0].contactInfo.push ({
            contactTime: [],
            continueTime: 0,
            intimacyScore: 0
        });
    }
    contactInfos = friends[0].contactInfo[contactID];

    /* Set contact time */
    
    console.log("Start add contact time, current contactInfos: ");
    console.log(contactInfos);
    let contactTimes: Array<any> = [];
    try {
        contactTimes = await contactInfos.contactTime.filter(function(object: any) {
            return object.toString() == <string>contactTime;
        })
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (contactTimes.length == 0) { // Meet at new contact Time
        contactInfos.contactTime.push(contactTime);
    }

    contactInfos.continueTime += continueTime;
    contactInfos.intimacyScore += intimacyScore;
    
    /* Update account's friends */
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
                friends: friends
            }
        }
    )
    res.status(200).json({ intimacyScore: intimacyScore });
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

function calculateIntimacy (long: number, when: string) {
    console.log(when)
    if (when == "day") {
        return long;
    } else if (when == "dinner") {
        return long * 1.5;
    } else {
        return long * 2;
    }
}