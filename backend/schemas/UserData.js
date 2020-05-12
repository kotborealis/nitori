const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserDataSchema = Schema({
    userId: {
        type: Number,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    login: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        default: ''
    },
    groupId: {
        type: Number,
        required: false
    },
    groupName: {
        type: String,
        required: false
    },
});

module.exports.UserDataSchema = UserDataSchema;