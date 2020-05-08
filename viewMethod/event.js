

const eventSkip = function () {
    if (!getApp().user.ckLogin()) {
        return false
    }
    return true
}

export default eventSkip;