/**
 * NFA extending parent class.
 */
class NFA extends FiniteStateMachine {
    constructor(alphabet, states, starting) {
        super(alphabet, states, starting);
    }

    async accept(string) {
        // Initialise tables
        let n = string.length;
        let S = [this.starting];
        let C = [];
        
        for (let i = 0; i < n; i++)
            C[i] = [];

        for (let i = 0; i < n; i++) {
            let inputSymbol = string.charAt(i);
            console.log(inputSymbol, C, S);
            if (!this.isValidSymbol(inputSymbol))
                return new AcceptanceResult(string, false, "An invalid symbol was found in the input! (does not belong in alpahabet)");
            
            for (let currentStateSymbol of S) {
                let currentState              = this.getState(currentStateSymbol);
                let reachableStatesWithSymbol = currentState.transition[inputSymbol];

                if (typeof reachableStatesWithSymbol === "undefined")
                    continue;

                C[i] = [...new Set([...C[i], ...reachableStatesWithSymbol])]; // concatonate two arrays -> make a set -> make array of set
            }

            S = C[i];

            if (S.length <= 0)
                return new AcceptanceResult(string, false, "NFA has no where to go!");
        }
        
        for (let stateSymbol of C[n-1]) {
            let state = this.getState(stateSymbol);
            if (state.accepting)
                return new AcceptanceResult(string, true, "NFA has accepted the input! (There exists one possible accepting result)");
        }

        return new AcceptanceResult(string, false, "NFA has rejected input!")
    }

    convertToDFA() {
        return new DFA();
    }
}

window.NFA = NFA;