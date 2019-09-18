
const Environment = 'development'

const version = '2.2.6'

/**
 * 数据服务器
 * @type {string}
 */
const host = Environment === 'development'? "http://m.dev.cdqidi.cn" : "https://m.cdqidi.cn"

/**
 * 上传文件服务器
 * @type {string}
 */
const qiniuUploadUrl= Environment === 'development'? "https://up-z2.qbox.me" : "https://up-z2.qbox.me"

/**
 * 图片服务器
 * @type {string}
 */
const resourseUrl = host + 'resource/'
const qiniuDomain= 'http://cloud-course.ideas-lab.cn/'

module.exports = {
    version,
    Environment,
    host,
    qiniuUploadUrl,
    resourseUrl,
    qiniuDomain
}
