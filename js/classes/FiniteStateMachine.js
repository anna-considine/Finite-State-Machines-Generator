class FiniteStateMachine {
    constructor(alphabet, states, starting) {
        this.alphabet = {};
        this.states   = states;
        this.starting = starting;

        Object.defineProperty(this, "numberOfStates", {
            get() {
                let size = 0;
                for (let symbol in this.states)
                    if (this.states.hasOwnProperty(symbol))
                        size++;
                return size;
            }
        })

        // Setup quick look-up of state symbol
        for (let symbol in this.states)
            if (this.states.hasOwnProperty(symbol))
                this.states[symbol].symbol = symbol;

        // Setup quick look-up of alphabet
        for (let symbol of alphabet)
            this.alphabet[symbol] = symbol;
    }

    getState(symbol) {
        return this.states[symbol];
    }

    getStatesSymbolArray() {
        return Object.keys(this.states);
    }

    getSymbolFromState(state) {
        return state.symbol;
    }

    getTransitionState(state, symbol) {
        let nextSymbol = state.transition[symbol];
        return typeof nextSymbol === "undefined" ? false : this.getState(nextSymbol);
    }

    isValidSymbol(symbol) {
        return symbol in this.alphabet;
    }

    isStartingStateSymbol(symbol) {
        return symbol === this.starting;
    }

    isAcceptingState(state) {
        return state.accepting;
    }

    hasGUIElementInitialised() {
        return !(typeof this.GUIElement === "undefined");
    }

    getStateGUIElementBySymbol(symbol) {
        return this.GUIElement.states[symbol];
    }

    getTransistionGUIElement(stateSymbolFrom, stateSymbolTo) {
        return this.GUIElement.transitions[stateSymbolFrom + "," + stateSymbolTo];
    }

    accept() {
        throw "This method is not implemented";
    }

    setup(env) {
        if (!this.hasGUIElementInitialised()) {
            this.GUIElement = {
                states:      {},
                transitions: {},
            }

            Object.defineProperty(this.GUIElement, 'env', {
                value: env,
                enumerable: false,
                configurable: true,
                writable: false,
            });

            // State Elements first >>>> CHANGE RANDOM POSITIONING HERE <<<
            let i = 0;
            for (let stateSymbol in this.states) {
                let state      = this.getState(stateSymbol);
                let offset     = 150; // change this lol
                let isStarting = this.isStartingStateSymbol(state.symbol);
                let stateGUI   = new StateElementGUI(state.symbol, state.accepting, isStarting, {
                    x: env.random(offset, env.width - offset),
                    y: env.random(offset, env.height - offset),
                }, i, env);

                this.GUIElement.states[stateSymbol] = stateGUI;
                i++;
            }

            // Now Transition Elements - (dependant)
             // Format this.GUIElement.transitions = { "1,2" : { "a" : [el1, el2], "b" : [el3], (...) } }
            for (let stateSymbol in this.states) {
                let state = this.getState(stateSymbol);
                for (let transitionSymbol in state.transition) {
                    let transitionStateSymbolArray = state.transition[transitionSymbol].constructor === Array
                                                        ? state.transition[transitionSymbol] : [state.transition[transitionSymbol]];
                    for (let transitionStateSymbol of transitionStateSymbolArray) {
                        let edgeSymbol = `${stateSymbol},${transitionStateSymbol}`;
                        let edgeObject = this.GUIElement.transitions[edgeSymbol];

                        if ( typeof edgeObject === "undefined") {
                            let fromState   = this.GUIElement.states[stateSymbol];
                            let toState     = this.GUIElement.states[transitionStateSymbol];
                            let direction   = fromState.index > toState.index ? TransistionElementGUI.FORWARD : TransistionElementGUI.BACKWARD;

                            // Call me Mr. Hacky Boy - pls never show this to anyone - k thx bye
                            let offsetSymbol = swapSubstrings(edgeSymbol, stateSymbol, transitionStateSymbol);
                            let needsOffset  = typeof this.GUIElement.transitions[offsetSymbol] === "undefined" ? false : true;

                            if (needsOffset)
                                this.GUIElement.transitions[offsetSymbol].needsOffset = true;

                            this.GUIElement.transitions[edgeSymbol] = new TransistionElementGUI(transitionSymbol, fromState, toState, direction, needsOffset, env);
                        } else {
                            let newTransistionSymbol = edgeObject.symbol + "," + transitionSymbol;
                            this.GUIElement.transitions[edgeSymbol].symbol = newTransistionSymbol;
                        }
                    }
                }
            }
        }
        return this;
    }

    draw() {
        // easy lookup
        const env = this.GUIElement.env;

        let stateElements      = this.GUIElement.states;
        let transitionElements = this.GUIElement.transitions;

        // console.log(transitionElements);
        // draw transitions (so that they go in the back of state elements)
        for (let edgeSymbol in transitionElements) {
            let edgeObject = transitionElements[edgeSymbol];
            edgeObject.draw(env);
        }

        // draw states
        for (let stateSymbol in stateElements) {
            let stateElement = stateElements[stateSymbol];
            stateElement.draw(env);
        }
    }
}

/**
 * Class that holds information about the end state of the acceptance algorithm for the FSMs
 */
class AcceptanceResult {
    constructor(input, accepted, message) {
        this.accepted = accepted;
        this.input    = input;
        this.message  = message;
    }
}