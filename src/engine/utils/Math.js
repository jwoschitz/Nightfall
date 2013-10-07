define(function() {
    Math.vector = {
        add: function(v1,v2) {
            return [v1[0]+v2[0],v1[1]+v2[1]];
        },

        scalar: function(v,s) {
            return [v[0]*s,v[1]*s];
        },

        dot: function(v1,v2) {
            return v1[0]*v2[0]+v1[1]*v2[1];
        },

        cross: function(v1,v2) {
            return v1[0]*v2[1]-v1[1]*v2[0];
        },

        getMagnitude: function(v) {
            var x = v[0],
                y = v[1];
            return Math.sqrt(x*x+y*y);
        },

        getMagnitude2: function(v) {
            var x = v[0],
                y = v[1];

            return x*x+y*y
        },

        setMagnitude: function(v,mag) {
            if (mag === 0) {
                v[0] = 0;
                v[1] = 0;

                return v;
            }

            var x = v[0],
                y = v[1];

            if (x !== 0 || y !== 0) {
                var oldMag = Math.vector.getMagnitude(v),
                    xRatio = oldMag/x,
                    yRatio = oldMag/y;

                v[0] = mag/xRatio;
                v[1] = mag/yRatio;
            }

            return v;
        },

        normalize: function(vector) {
            var x = vector[0],
                y = vector[1],
                len = Math.sqrt(x*x+y*y);

            vector[0] = x/len;
            vector[1] = y/len;

            return vector;
        },

        project: function(a,b) {
            var newVector = [b[0],b[1]];

            Math.vector.setMagnitude(newVector,Math.vector.projectMagnitude(a,b));

            return newVector;
        },

        projectMagnitude: function(a,b) {
            return Math.vector.scalar(b,Math.vector.dot(a,b)/Math.vector.getMagnitude2(b));
        },

        leftNormal: function(v) {
            return [-v[1],v[0]];
        },

        rightNormal: function(v) {
            return [v[1],-v[0]];
        }
    };

    Math.choose = function() {
        return arguments[Math.floor(Math.random()*arguments.length)];
    };

    Math.pointDirection = function(x1,y1,x2,y2) {
        var angle = Math.atan2(y2-y1,x2-x1);

        if (angle < 0) {
            angle += 6.283185307179586;
        }

        return angle;
    };

    Math.pointDistance = function(x1,y1,x2,y2) {
        var s1 = x1-x2,
            s2 = y1-y2;
        return Math.sqrt(s1*s1+s2*s2);
    };

    Math.pointDistance2 = function(x1,y1,x2,y2) {
        var s1 = x1-x2,
            s2 = y1-y2;
        return s1*s1+s2*s2;
    };

    Math.degToRad = function(deg) {
        return deg*0.017453292519943295;
    };

    Math.radToDeg = function(rad) {
        return rad*57.29577951308232;
    };

    Math.polarToRectX = function(angle,length) {
        return Math.cos(angle)*length;
    };

    Math.polarToRectY = function(angle,length) {
        return Math.sin(angle)*length;
    };

});