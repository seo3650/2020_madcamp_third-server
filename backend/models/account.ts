import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import crypto from 'crypto';

function hash(password: string) {
    return crypto.createHmac('sha256', <string>process.env.SECRET_KEY)
        .update(password).digest('hex');
}

const Account = new Schema({
    id: String,
    password: String,
    name: String,
    phoneNumber: String,
    friends: [JSON],
    blockList: [String],
    profileImage: String,
    macAddress: String,
    gender: String,
    age: Number,
    region: String,
    height: Number,
    job: String,
    hobby: String,
    smoke: Boolean,
    drink: Boolean,
    self_instruction: String,
    school: String,
    major: String,
    score: [Number],
    likeList: [String],
    matchingList: [String],
    create_date: { type: Date, default: Date.now },
})

Account.statics.findByID = function(id: string) {
    return this.findOne({'id': id}).exec();
}

Account.statics.register = function({ id, password, name, phoneNumber, macAddress, gender }: any): string {
    const account = new this({
        id: id,
        password: hash(password),
        name: name,
        phoneNumber: phoneNumber,
        friends: [],
        blockList: [],
        profileImage: null,
        macAddress: macAddress,
        gender: gender,
        score: [0, 0],
        likeList: [],
    });
    account.save();
    return id;
}

Account.methods.validatePassword = function(password: string) {
    const hashed = hash(password);
    return this.password === hashed;
}

Account.methods.withdrawal = function() {
    return this.remove();
}

Account.methods.getTotalIntimacy = function() {
    let score = 0;
    for (let i = 0; i < this.friends.length; i++) {
        for (let j = 0; j < this.friends[i].contactInfo.length; j++) {
            score += this.friends[i].contactInfo[j].intimacyScore;
        }
    }
    return score;
}

module.exports = mongoose.model("Account", Account);