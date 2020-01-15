const { fetch } = require('../axios/fetch')


/**
 * 通过CODE  验证用户是否登录  token失效
 * appId code
 */
export function WXSSMain(data) {
    return fetch({
        url: 'wxapp/system/WXSSMain',
        data: data || {},
        method: 'GET'
    }, { title: '正在初始化...'})
}


/**
 * 通过CODE  验证用户是否登录  token失效
 * appId code
 */
export function getWXPhoneNumber(data) {
    return fetch({
        url: 'wxapp/system/v2/getWXPhoneNumber',
        data: data || {},
        method: 'GET'
    }, { title: '正在初始化...'})
}