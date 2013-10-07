define(function() {

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(needle) {
            var len = this.length;
            for (var i = 0; i < len; i++) {
                if (this[i] === needle) {
                    return i;
                }
            }

            return -1;
        };
    }

});