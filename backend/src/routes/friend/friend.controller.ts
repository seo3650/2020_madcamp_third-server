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
        date: Joi.number().required(),
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
        console.log("Can't find account");
        console.log(req.body);
        res.status(404).json({ message: "Can't find account" });
        return;
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
        console.log("Can't find friend account");
        console.log(req.body);
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
    const position = req.body.position;
    const date = req.body.date;

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
                            intimacyScore: intimacyScore,
                            position: [position, position],
                            date: date
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
            intimacyScore: 0,
            position: [position, position],
            date: date
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
    contactInfos.position[1] = position;
    
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
    let friendContactInfo = friends[0].contactInfo
    
    /* Get intimacy score */
    let intimacyScore = 0;
    let contactTime: Array<Array<String>> = [];
    let continueTime: Array<Number> = [];
    for (var i = 0; i < friendContactInfo.length; i++) {
        intimacyScore += friendContactInfo[i].intimacyScore;
        contactTime.push(friendContactInfo[i].contactTime);
        continueTime.push(friendContactInfo[i].continueTime);
    }
    let totalIntimacyScore = account.getTotalIntimacy();
    
    res.status(200).json({ 
        intimacyScore: intimacyScore / totalIntimacyScore,
        contactTime,
        continueTime});
}

exports.getContactID = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        friendID: Joi.string().required(),
        date: Joi.number().required(),
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
    let friends: Array<{
        friendID: String,
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
    const number = friends[0].contactInfo.length;
    if (number > 0 && friends[0].contactInfo[number - 1].date == req.query.date) {
        res.status(200).json({ contactID: number - 1});
        return;
    }

    res.status(200).json({ contactID: number })
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

exports.sendLike = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        friendID: Joi.string().required()
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

    /* Check duplicate */
    let likeUser = await account.likeList.filter(function(object: string) {
        return object.toString() == req.body.friendID;
    }) 
    if (likeUser.length != 0) {
        res.status(409).json({ message: "Already selected user." });
        return;
    }

    await Account.updateOne(
        { _id: account._id },
        {
            $push: {
                likeList: req.body.friendID
            }
        }
    );
    res.status(200).json({ message: true });
}

exports.sendStar = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        score: Joi.number().required()
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
    let score = account.score[0];
    let number = account.score[1];
    let newScore = (score * number + req.body.score) / (number + 1);
    
    await Account.updateOne(
        { _id: account._id },
        {
            $set: {
                score: [newScore, number + 1]
            }
        }
    );
    res.status(200).json({ score: newScore });
}

exports.getTodayFriend = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        date: Joi.number().required()
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

    /* Get today friend */
    const date = req.query.date;
    let friendIDList: Array<String> = [];
    let friendNameList: Array<String> = [];
    let positionList: Array<Array<String>> = [];
    let intimacyList: Array<Number> = [];
    let contactTimeList: Array<Array<String>> = [];

    for (let i = 0; i < account.friends.length; i++) {
        let contactInfo = account.friends[i].contactInfo;
        for (let j = 0; j < contactInfo.length; j++) {
            if (date == contactInfo[j].date) {
                /* Get friend account */
                let friend = null;
                try {
                    friend = await Account.findOne({ _id: account.friends[i].friendID });
                } catch (e) {
                    res.status(500).json({ message: e.message });
                    return;
                }
                if (!friend) {
                    res.status(404).json({ message: "Can't find friend account" });
                    return;
                }
                console.log(friend)

                friendIDList.push(friend.id);
                friendNameList.push(friend.name);
                positionList.push(contactInfo[j].position);
                let intimacyScore = contactInfo[j].intimacyScore / account.getTotalIntimacy();
                intimacyList.push(intimacyScore * 100);
                contactTimeList.push(contactInfo[j].contactTime);
            }
        }
    }

    res.status(200).json({
        friendID: friendIDList,
        friendName: friendNameList,
        position: positionList,
        intimacyScore: intimacyList,
        contactTime: contactTimeList,
    });
}

exports.registerMatch = async (req: any, res: any) => {
    /* Verify data */
    const schema = Joi.object().keys({
        id: Joi.string().required(),
        friendID: Joi.string().required()
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

    /* Get friend account */
    let friend: any = null;
    try {
        friend = await Account.findByID(req.body.friendID);
    } catch (e) {
        res.status(500).json({ message: e.message });
        return;
    }
    if (!friend) {
        res.status(404).json({ message: "Can't find friend account" });
        return;
    }

    /* Check duplicate */
    let matchingUser = await account.matchingList.filter(function(object: string) {
        return object.toString() == friend._id;
    }) 
    if (matchingUser.length != 0) {
        res.status(409).json({ message: "Already matched user." });
        return;
    }

    /* Add match user */
    await Account.updateOne(
        { _id: account._id },
        {
            $push: {
                matchingList: friend._id
            }
        }
    );

    res.status(200).json({ message: true });
}