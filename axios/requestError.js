
class RequestError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.msg = message || "未知错误";
  }
};

module.exports = RequestError;
