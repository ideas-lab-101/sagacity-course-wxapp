
const Environment = 'development'

const version = '3.0.0'

/**
 * 数据服务器
 * @type {string}
 */
const host = Environment === 'development' ? "http://dev.linestorm.ltd" : "https://xiaode.ideas-lab.cn"

/**
 * 上传文件服务器
 * @type {string}
 */
const qiniuUploadUrl = Environment === 'development' ? "https://xiaode.ideas-lab.cn" : "https://xiaode.ideas-lab.cn"

/**
 * 图片服务器
 * @type {string}
 */
const resourseUrl = host + 'resource/'
const qiniuDomain = 'http://cloud-course.ideas-lab.cn/'

module.exports = {
    version,
    Environment,
    host,
    qiniuUploadUrl,
    resourseUrl,
    qiniuDomain
}
