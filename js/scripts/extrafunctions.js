window.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// The time has come to lay down my pride and face the fact javascript is single threaded.
window.busySleep = function (ms) {
    var now = new Date().getTime();
    while (new Date().getTime() < now + ms) {
        /* do nothing */
    }
}

let componentToHex = function (c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

window.rgbToHex = function (r, g, b) {
    return "" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

window.hexToRgb = function (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec("#" + hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

window.d2d3 = function (x1, y1, x2, y2, x3, y3) {
    return Math.abs((y2 - y1) * x3 - (x2 - x1) * y3 + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
}

window.drawArrow = function (sx, sy, ang, offset, env) {
    env.push() // start new drawing state
    env.translate(sx, sy); // translates to the destination vertex
    env.rotate(ang); // rotates the arrow point
    env.triangle(-offset * 0.5, offset, offset * 0.5, offset, 0, -offset / 2); // draws the arrow point as a triangle
    env.pop();
}

window.curveBetween = function (x1, y1, x2, y2, d, h, flip, env) {
    // find two control points off this line
    var original = p5.Vector.sub(p5.createVector(x2, y2), env.createVector(x1, y1));
    var inline = original.copy().normalize().mult(original.mag() * d);
    var rotated = inline.copy().rotate(env.radians(90) + flip * env.radians(180)).normalize().mult(original.mag() * h);
    var p1 = p5.Vector.add(p5.Vector.add(inline, rotated), env.createVector(x1, y1));

    // line(x1, y1, p1.x, p1.y); //show control line
    rotated.mult(-1);
    var p2 = p5.Vector.add(p5.Vector.add(inline, rotated).mult(-1), env.createVector(x2, y2));

    // line(x2, y2, p2.x, p2.y); //show control line
    env.bezier(x1, y1, p1.x, p1.y, p2.x, p2.y, x2, y2)
}

window.swapSubstrings = function (str, ss1, ss2) {
    let exp = new RegExp(`(${ss1}|${ss2})`, "g");
    return str.replace(exp, function ($1) {
        return $1 === ss1 ? ss2 : ss1;
    });
}

window.drawParralelLine = function (x1, y1, x2, y2, n, a, env) {
    let x1b = x1 + n * Math.cos(a);
    let y1b = y1 - n * Math.sin(a);
    let x2b = x2 + n * Math.cos(a);
    let y2b = y2 - n * Math.sin(a);

    env.line(x1b, y1b, x2b, y2b);
}

window.isCyclic = function (obj) {
    var seenObjects = [];

    function detect(obj) {
        if (obj && typeof obj === 'object') {
            if (seenObjects.indexOf(obj) !== -1) {
                return true;
            }
            seenObjects.push(obj);
            for (var key in obj) {
                if (obj.hasOwnProperty(key) && detect(obj[key])) {
                    console.log(obj, 'cycle at ' + key);
                    return true;
                }
            }
        }
        return false;
    }

    return detect(obj);
}

// Changes string prototype so that we can add "abc".replaceAt(1, "X") to become "aXc"
String.prototype.replaceAt = function (index, replacement) {   
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}