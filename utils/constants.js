module.exports = {
    WX_HEADER_CODE: 'X-WX-Code',
    WX_HEADER_ENCRYPTED_DATA: 'X-WX-Encrypted-Data',
    WX_HEADER_IV: 'X-WX-IV',
    WX_HEADER_ID: 'X-WX-Id',
    WX_HEADER_SKEY: 'X-WX-Skey',

    /**
     * token session id
     */
    WX_SESSION_ID: '__token',
    /**
     * USER INFO 存储
     */
    WX_USER_INFO: '__user_info',
    /**
     * USER_HISTORY
     */
    WX_USER_HISTORY: '__history',
    /**
     * WX_MARK_WORDS 存储
     */
    WX_MARK_WORDS: '__mark_words',
    /**
     * WX_SEARCH_CACHE 搜索词存储
     */
    WX_SEARCH_CACHE: '__search_cache',
    /**
     * WX_UPDATE_EXPIRE 更新用户信息时间存储
     */
    WX_UPDATE_EXPIRE: '__update_expire',



    /**
     * 参数失效错误
     */
    ERR_INVALID_PARAMS: -1,
    /**
     * 网络错误
     */
    ERR_NETWORK_FAILED: -2,
    /**
     * 获取数据失败
     */
    REQUEST_FAIL: 0,
    /**
     * 正确的获取数据
     */
    REQUEST_SUCCESS: 1,
    /**
     * token过期
     */
    ERR_INVALID_SESSION: 6,
    /**
     * 未订阅
     */
    ERR_NO_BUY: 11,
    /**
     * 未登录 未绑定
     */
    ERR_INVALID_LOGIN: 401,
    /**
     * 服务端错误
     */
    ERR_SERVICE_DATA: 500,
};
