const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import crypto from 'crypto';

function hash(password: string) {
    return crypto.createHmac('sha256', <string>process.env.SECRET_KEY)
        .update(password).digest('hex');
}

const Account = new Schema({
    id: String,
    name: String,
    password: String,
    phoneNumber: String,
    friends: [JSON],
    create_date: { type: Date, default: Date.now },
})

Account.statics.findByID = function(id: string) {
    return this.findOne({'id': id}).exec();
}

Account.statics.register = function({ id, name, password, phoneNumber }: any) {
    const account = new this({
        id: id,
        name: name,
        password: hash(password),
        phoneNumber: phoneNumber,
    });
    return account.save();
}

Account.methods.withdrawl = function() {
    return this.remove();
}

module.exports = mongoose.model("Account", Account);