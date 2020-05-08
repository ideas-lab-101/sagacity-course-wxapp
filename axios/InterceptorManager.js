'use strict';

const InterceptorManager = function InterceptorManager(target) {

  const that = this

  let handler = {

    get: function(target, key, receiver) {
      return Reflect.get(target, key, receiver)
    },

    apply: function(target, thisBinding, args) {
      return Reflect.apply(target, thisBinding, args)
    },

    construct: function(target, args) {
      console.log('construct', target)
      return Reflect.construct(target, args)
    }
  }

  return new Proxy(target, handler)
}

InterceptorManager.prototype.use = function() {
  console.log('use')
}

module.exports = new InterceptorManager;
