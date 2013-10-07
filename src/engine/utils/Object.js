define(function() {

    Object.accessors = function(obj,name,get,set) {
        if (Object.defineProperty !== undefined) { // ECMAScript 5
            Object.defineProperty(obj,name,{
                get: get,
                set: set
            });
        } else if (Object.prototype.__defineGetter__ !== undefined) { // Nonstandard
            obj.__defineGetter__(name,get);
            obj.__defineSetter__(name,set);
        }
    };

    if (!Object.prototype.watch) {
        Object.prototype.watch = function (prop, handler) {
            var oldvalue = this[prop], newvalue = oldvalue,
                getter = function () {
                    return newvalue;
                },
                setter = function (value) {
                    oldvalue = newvalue;
                    newvalue = handler.call(this, prop, oldvalue, value);
                    return newvalue;
                };

            if (delete this[prop]) { // can't watch constants
                if (Object.defineProperty) { // ECMAScript 5
                    Object.defineProperty(this, prop, {
                        get: getter,
                        set: setter
                    });
                } else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
                    Object.prototype.__defineGetter__.call(this, prop, getter);
                    Object.prototype.__defineSetter__.call(this, prop, setter);
                }
            }
        };
    }

    if (!Object.prototype.unwatch) {
        Object.prototype.unwatch = function (prop) {
            var value = this[prop];
            delete this[prop]; // remove accessors
            this[prop] = value;
        };
    }

    if (!Object.create) {
        Object.create = (function() {
            var F = function() {};

            return function (obj) {
                F.prototype = obj;
                return new F();
            };
        })();
    }

    Object.accessors(Object.prototype,'proto',function() {
        if (Object.getPrototypeOf !== undefined) {
            return Object.getPrototypeOf(this);
        } else {
            return this.__proto__;
        }
    },function(value) {
        this.__proto__ = value;
        return value;
    });

    if(!Object.extend){
        Object.extend = function(obj, extObj) {
            var cloneObj = Object.create(extObj);
            if (arguments.length > 2) {
                for (var a = 1; a < arguments.length; a++) {
                    this.extend(obj, arguments[a]);
                }
            } else {
                for (var i in cloneObj) {
                    obj[i] = cloneObj[i];
                }
            }
            return obj;
        };
    }
});