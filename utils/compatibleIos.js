/**
 * 解决IOS版本过低出现的不兼容问题
 */
const compatible = function () {
    if (!Object.values) {
        Object.values = function (obj) {
            if (obj !== Object(obj)) {
                throw new TypeError('Object.values called on a non-object')
            }
            var val = []
            var key
            for (key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    val.push(obj[key])
                }
            }
            return val
        }
    }

    if (!Object.entries) {
        Object.entries = function( obj ){
            if (obj !== Object(obj)) {
                throw new TypeError('Object.values called on a non-object')
            }
            var ownProps = Object.keys( obj ),
                i = ownProps.length,
                resArray = new Array(i); // preallocate the Array
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]];

            return resArray
        }
    }

}


module.exports = {
    compatible: compatible
}