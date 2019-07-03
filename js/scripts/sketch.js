// Initialise canvas to div.
let canvasElement = document.getElementById("canvas");

// Mouse press fun stuff
let paths = [];
let painting = false;
let next = 0;
let current;
let previous;

// Instance mode because project is bigger in scope
var environment = function (env) {
    env.vars = {
        backgroundColor: [40, 40, 40],
        elementColor: [255, 255, 255],
        no_fsm_message: "FSM Animator",
        no_fsm_message_st: "(IF bored THEN hold left mouse button and drag around :])",
        fontsize: 150,
        fontsize_st: 20,
    };

    env.preload = function () {
        // is loaded before setup() and draw() are called
        env.CAPS_FONT   = env.loadFont('./assets/fonts/BebasNeue-Bold.otf');
        env.NORMAL_FONT = env.loadFont('./assets/fonts/Montserrat-Light.otf');
        env.GREEK_FONT  = env.loadFont('./assets/fonts/Greek Futura LDR.ttf');
    }

    env.setup = function (w = canvasElement.offsetWidth, h = canvasElement.offsetHeight) {
        // Set text characteristics
        env.textAlign(env.CENTER, env.CENTER);

        // mouse press fun stuff
        current  = env.createVector(0, 0);
        previous = env.createVector(0, 0);

        // Create canvas
        env.createCanvas(w, h); // okay p5!
    }

    env.noFSMSelectedDraw = function () {
        env.background(env.vars.backgroundColor);
        env.fill(...env.vars.elementColor);

        // title
        env.textFont(env.CAPS_FONT);
        env.textSize(env.vars.fontsize);
        let tw = env.textWidth(env.vars.no_fsm_message);
        let th = env.textSize(env.vars.no_fsm_message);
        env.text(env.vars.no_fsm_message, env.width / 2 - tw / 2, env.height / 2 + th / 2);

        // subtitle
        env.textFont(env.NORMAL_FONT);
        env.textSize(env.vars.fontsize_st);
        let stw = env.textWidth(env.vars.no_fsm_message_st);
        let sth = env.textSize(env.vars.no_fsm_message_st); // what?? text size doesnt do this
        env.text(env.vars.no_fsm_message_st, env.width / 2 - stw / 2, env.height / 2 + th + sth/2);

        // If it's time for a new point
        if (env.millis() > next && painting) {
            // Grab mouse position
            current.x = env.mouseX;
            current.y = env.mouseY;

            // New particle's force is based on mouse movement
            let force = p5.Vector.sub(current, previous);
            force.mult(0.05);

            // Add new particle
            paths[paths.length - 1].add(current, force);

            // Schedule next circle
            next = env.millis() + env.random(100);

            // Store mouse values
            previous.x = current.x;
            previous.y = current.y;
        }

        // Draw all paths
        for (let i = 0; i < paths.length; i++) {
            paths[i].update();
            paths[i].display();
        }
    }

    env.draw = function () {
        if (fsm === null) {
            env.noFSMSelectedDraw();
            return;
        }

        env.background(env.vars.backgroundColor);
        fsm.setup(env).draw(); // setup returns fsm after 1st call
    }

    env.callEventFunctions = function (id) {
        let mx = env.mouseX;
        let my = env.mouseY;

        let stateElements = fsm.GUIElement.states;
        let transitionElements = fsm.GUIElement.transitions;

        // states
        for (let stateSymbol in stateElements) {
            let stateElement = stateElements[stateSymbol];
            stateElement[id](mx, my);
        }

        // transitions
        for (let edgeSymbol in transitionElements) {
            let edgeObject = transitionElements[edgeSymbol];
            edgeObject[id](mx, my);
        }
    }

    env.mouseReleased = function () {
        if (fsm === null) {
            painting = false;
            return;
        }

        env.callEventFunctions("mouseReleased");
    }

    env.mousePressed = function () {
        if (fsm === null || !fsm.GUIElement) {
            painting = true;
            previous.x = env.mouseX;
            previous.y = env.mouseY;
            paths.push(new Path(env));
            return;
        }

        env.callEventFunctions("mousePressed");
    }
}

// Resize canvas when w/h changed! (may restart animation)
var canvas = new p5(environment, canvasElement);

window.onresize = function () {
    var w = canvasElement.offsetWidth;
    var h = canvasElement.offsetHeight;
    canvas.setup(w, h)
};
