const constants = require('./constants');
const SESSION_KEY = 'XDL_session_' + constants.WX_SESSION_ID;
const SESSION_USER_INFO = 'XDL_session_' + constants.WX_USER_INFO;
const SESSION_MARK_WORDS = 'XDL_session_' + constants.WX_MARK_WORDS;
const SESSION_UPDATE_EXPIRE = 'XDL_session_' + constants.WX_UPDATE_EXPIRE;
const SESSION_USER_HISTORY = 'XDL_session_' + constants.WX_USER_HISTORY;

const Session = {
    get: function () {
        try {
            return wx.getStorageSync(SESSION_KEY) || null;
        } catch (e) {}
    },

    set: function (session) {
        try {
            wx.setStorageSync(SESSION_KEY, session);
        } catch (e) {}
    },

    getUserInfo: function () {
        try {
            return wx.getStorageSync(SESSION_USER_INFO) || null;
        } catch (e) {}
    },

    setUserInfo: function (session) {
        try {
            wx.setStorageSync(SESSION_USER_INFO, session);
        } catch (e) {}
    },

    getUserHistory: function () {
        try {
            return wx.getStorageSync(SESSION_USER_HISTORY) || null;
        } catch (e) {}
    },

    setUserHistory: function (session) {
        try {
            wx.setStorageSync(SESSION_USER_HISTORY, session);
        } catch (e) {}
    },

    getMarkWords: function () {
        try {
            return wx.getStorageSync(SESSION_MARK_WORDS) || null;
        } catch (e) {}
    },

    setMarkWords: function (session) {
        try {
            wx.setStorageSync(SESSION_MARK_WORDS, session);
        } catch (e) {}
    },

    getUpdateExpire: function () {
        try {
            return wx.getStorageSync(SESSION_UPDATE_EXPIRE) || null;
        } catch (e) {}
    },

    setUpdateExpire: function (session) {
        try {
            wx.setStorageSync(SESSION_UPDATE_EXPIRE, session);
        } catch (e) {}
    },

    clear: function () {
        try {
            wx.clearStorageSync()
        } catch (e) {}
    }
}

module.exports = Session;
