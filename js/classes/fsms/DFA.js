
/*
 * DFA extending parent class
 * Currently I do not represent dead states. Leave it like that? Matters on NFA --> DFA conversion too!
 */
class DFA extends FiniteStateMachine {
    constructor(alphabet, states, starting) {
        super(alphabet, states, starting);
    }

    async accept(string) {
        let state = this.getState(this.starting);

        // highlight starting state
        if (this.hasGUIElementInitialised()) {
            let stateElement = this.getStateGUIElementBySymbol(state.symbol);
            stateElement.highlight([255, 100, 100]);
            await sleep(SETTINGS.sleep_interval);
            stateElement.highlight([200, 200, 200]);
        }

        for (let i = 0; i < string.length; i++) {
            let symbol = string.charAt(i);
            // Check if symbol is in alphabet
            if (!this.isValidSymbol(symbol))
                return new AcceptanceResult(string, false, "An invalid symbol was found in the input! (not belong in alpahabet)");

            // Check if there is a valid transition
            let transitionState = this.getTransitionState(state, symbol);
            if (!transitionState)
                return new AcceptanceResult(string, false, "DFA reached a dead state!")

            // highlight (transition) next state
            if (this.hasGUIElementInitialised()) {
                let transitionStateElement = this.getStateGUIElementBySymbol(transitionState.symbol);
                let transitionGUIElement   = this.getTransistionGUIElement(state.symbol, transitionState.symbol) // ITS A DFA SO ONLY 1 EVER - NOT THE CASE FOR NFA!!!!Q

                let prevColorS = transitionStateElement.color;
                let prevColorT = transitionGUIElement.color;

                // Highlight Transition
                transitionGUIElement.highlight([255, 100, 100]);
                await sleep(SETTINGS.sleep_interval);
                transitionGUIElement.highlight(prevColorT);

                // Highlight Next Node
                transitionStateElement.highlight([255, 100, 100]);
                await sleep(SETTINGS.sleep_interval);
                transitionStateElement.highlight(prevColorS);
            }

            state = transitionState;
        }

        return new AcceptanceResult(string, this.isAcceptingState(state), "DFA has processed the input correctly!");
    }
}

window.DFA = DFA;