//회원정보(user) Schema
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        minlength: 3,
        unique: true,
    },

    password: {
        type: String,
        minlength: 4,
    },
});

UserSchema.virtual("userId").get(function () {
    return this._id.toHexString();
  });
  UserSchema.set("toJSON", {
    virtuals: true,
  });


module.exports = mongoose.model('User', UserSchema);