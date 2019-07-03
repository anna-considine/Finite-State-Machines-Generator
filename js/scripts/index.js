// Global Variable for the visualised FSM entity & Accept function promise.
var fsm           = null;
var acceptPromise = null;

// Page core elements
let generateButton = document.getElementById("generate");
let acceptButton   = document.getElementById("accept");
let acceptInput    = document.getElementById("accept-input");
let settingsButton = document.getElementById("settings-button");

// Generator elements
let generator            = document.getElementById('generator');
let generatorContent     = document.getElementById("generator-content");
let closeGeneratorButton = document.getElementById("generator-close");
let fsmSelect            = document.getElementById("generator-fsm-select");
let alphabetInput        = document.getElementById("generator-alphabet-input");
let statesInput          = document.getElementById("generator-states-input");
let startingStateInput   = document.getElementById("generator-startingstate-input");
let acceptingStateInput  = document.getElementById("generator-acceptingstate-input");
let transitionElement    = document.getElementById("generator-transition-element");
let saveButton           = document.getElementById("generator-save");
let loadButton           = document.getElementById("generator-load");
let generateFSMButton    = document.getElementById("generator-generate");

// Settings elements
let settings                    = document.getElementById("settings");
let settingsContent             = document.getElementById("settings-content");
let closeSettingsButton         = document.getElementById("settings-close");
let speedInput                  = document.getElementById("settings-speed-input");
let stateRadiusInput            = document.getElementById("settings-state-radius");
let stateElementColorInput      = document.getElementById("settings-state-element-color");
let stateTextColorInput         = document.getElementById("settings-state-text-color");
let stateTextSizeInput          = document.getElementById("settings-state-text-size");
let transitionElementColorInput = document.getElementById("settings-transition-element-color");
let transitionTextColorInput    = document.getElementById("settings-transition-text-color");
let transitionTextSizeInput     = document.getElementById("settings-transition-text-size");
let transitionThicknessInput    = document.getElementById("settings-transition-thickness");
let settingsSaveButton          = document.getElementById("settings-save");

// Load elements
let loadfsm                 = document.getElementById('loadfsm');
let loadfsmContent          = document.getElementById('loadfsm-content');
let loadfsmClose            = document.getElementById('loadfsm-close');
let loadfsmSelect           = document.getElementById('loadfsm-select');
let loadfsmClearCacheButton = document.getElementById('loadfsm-clearcache');
let loadfsmRandomFSMButton  = document.getElementById('loadfsm-randomfsm');
let loadfsmLoadButton       = document.getElementById('loadfsm-load');

/******************************
 *      Page Logic
******************************/

settingsButton.onclick = function () {
    settings.style.display = "block";
}

generateButton.onclick = function () {
    generator.style.display = "block";
    acceptButton.className  = "hvr-underline-from-center pure-button button-accept";
    acceptInput.className   = "accept-input";

    updatetransitionTable();
}

acceptButton.onclick = function () {
    if (fsm === null) {
        alert("Must generate a FSM first!");
        return;
    }

    acceptPromise = fsm.accept(acceptInput.value).then((r) => (console.log(r) || true) && alert(`Accepted: ${r.accepted}\nMessage: ${r.message}`));
}

/******************************
 *      Settings Logic
******************************/
// Default Values - Configurable in settings popup
const SETTINGS = {
    sleep_interval           : 700,
    state_element_color      : [240, 240, 240],
    state_text_color         : [40, 40, 40],
    state_text_size          : 80,
    state_radius             : 100,
    transition_element_color : [80, 80, 80],
    transition_text_color    : [255, 255, 255],
    transition_text_size    : 60,
    transition_thickness     : 15,
}; // before IIFE always semi-colon!

// Load Defaults
(function (){
    speedInput.value                  = SETTINGS.sleep_interval;
    stateRadiusInput.value            = SETTINGS.state_radius;
    stateTextSizeInput.value          = SETTINGS.state_text_size;
    stateElementColorInput.value      = rgbToHex(...SETTINGS.state_element_color);
    stateTextColorInput.value         = rgbToHex(...SETTINGS.state_text_color);
    transitionElementColorInput.value = rgbToHex(...SETTINGS.transition_element_color);
    transitionTextColorInput.value    = rgbToHex(...SETTINGS.transition_text_color);
    transitionTextSizeInput.value     = SETTINGS.transition_text_size;
    transitionThicknessInput.value    = SETTINGS.transition_thickness;
})();

settingsSaveButton.onclick = function () {
    SETTINGS.sleep_interval           = Number(speedInput.value);
    SETTINGS.state_radius             = Number(stateRadiusInput.value);
    SETTINGS.state_text_size          = Number(stateTextSizeInput.value);
    SETTINGS.state_element_color      = hexToRgb(stateElementColorInput.value);
    SETTINGS.state_text_color         = hexToRgb(stateTextColorInput.value);
    SETTINGS.transition_element_color = hexToRgb(transitionElementColorInput.value);
    SETTINGS.transition_text_color    = hexToRgb(transitionTextColorInput.value)
    SETTINGS.transition_text_size     = Number(transitionTextSizeInput.value);
    SETTINGS.transition_thickness     = Number(transitionThicknessInput.value);

    settings.style.display = "none";
}

// Event Functions
closeSettingsButton.onclick = async function () {
    settingsContent.classList.add("slide-out");
    await setTimeout(() => { settings.style.display = "none";  settingsContent.classList.remove("slide-out")}, 600);
}

/******************************
 *      Generator Logic
******************************/

// Biggest mess ever created BUT HEY IT WORKS FAM
let transition = {}; // { '1' = { 'a' : [el1, el2], ... } }
let updatetransitionTable = function () {
    let alphabet = [];
    let states   = [];

    // parse alphabet
    let alphabetString = alphabetInput.value.trim();

    if (alphabetString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in alphabet string input!");

    alphabet = alphabetString.split(',');

    // parse states
    let statesString = statesInput.value.trim();

    if (statesString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in states string input!");

    states = statesString.split(',');

    // Delete current child elements
    transition = { };
    while (transitionElement.firstChild) {
        transitionElement.removeChild(transitionElement.firstChild);
    }

    let createStateTransitionElement = function (div, state, symbol){
        let stateTransitionInputElement = document.createElement("div");
        stateTransitionInputElement.classList.add('transition-table-row-element');

        let label              = document.createElement("p");
        label.innerHTML        = `Symbol: '${symbol}'`;
        label.style.margin     = 0;
        label.style.marginLeft = "2%";
       
        let inputElement = document.createElement("input");
        inputElement.classList.add('transition-table-row-element-input');

        stateTransitionInputElement.appendChild(label);
        stateTransitionInputElement.appendChild(inputElement);
        div.appendChild(stateTransitionInputElement);

        return inputElement;
    }

    for (let state of states) {
        transition[state] = {};

        let div = document.createElement("div");
        div.classList.add('transition-table-row');
        
        let label              = document.createElement("h3");
        label.innerHTML        = "Transition function for " + state;
        label.style.textAlign  = "center";
        label.style.paddingTop = "1.5%";

        div.appendChild(label);
        
        for (let symbol of alphabet) {
            transition[state][symbol] = createStateTransitionElement(div, state, symbol);
        }

        if (fsmSelect.value === "E_NFA") {
            transition[state][E_NFA.EMPTY_STRING] = createStateTransitionElement(div, state, E_NFA.EMPTY_STRING);
        }

        transitionElement.appendChild(div);
    }

    console.log(transition);
}
 
closeGeneratorButton.onclick = async function () {
    generatorContent.classList.add("slide-out");
    
    await setTimeout(() => { 
        generator.style.display = "none";  
        generatorContent.classList.remove("slide-out")
    }, 600);
    
    if (fsm) return; // so that we can continue to test input on current DFA
    acceptButton.className = "hvr-underline-from-center pure-button button-accept pure-button-disabled";
    acceptInput.className  = "accept-input input-disable";
}

generateFSMButton.onclick = function () {
    let fsmType             = fsmSelect.value;
    let fsmConstructor      = window[fsmType]; // LMAO - YOU DID NOT SEE THIS - MOVE A LONG - NOTHING HERE
    let alphabet            = [];
    let states              = {};
    let startingStateSymbol = "";

    console.log(">>>>", fsmConstructor, fsmType);

    if (typeof fsmConstructor === "undefined")
        return alert("Invalid FSM Selected!");

    // parse alphabet
    let alphabetString = alphabetInput.value.trim();

    if (alphabetString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in alphabet string input!");

    alphabet = alphabetString.split(',');

    if (alphabet.length[0] === "")
        return alert("The FSM must have a non empty alphabet set.");

    // parse states
    let statesString = statesInput.value.trim();

    if (statesString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in states string input!");

    let statesArray = statesString.split(',');

    if (statesArray[0] === "")
        return alert("The FSM must have a non empty states set.");

    for (let stateSymbol of statesArray) {
        states[stateSymbol] = {
            transition : { },
            accepting : false,
        }
    }

    // starting state
    startingStateSymbol = startingStateInput.value.trim();

    if (startingStateSymbol === "")
        return alert("There must be one starting state!");

    if (!statesArray.includes(startingStateSymbol))
        return alert("Starting state is invalid!");
    
    // accepting states
    let acceptingStateString = acceptingStateInput.value.trim();

    if (acceptingStateString.indexOf(' ') >= 0)
        return alert("Please do not have spaces in states string input!");

    let acceptingStatesArray = acceptingStateString.split(',');

    if (acceptingStatesArray[0] === "")
        return alert("The FSM must have at least one accepting state!");

    if (!acceptingStatesArray.every(s => statesArray.includes(s)))
        return alert("There exists one or more invalid accepting states!");

    for (let acceptingStateSymbol of acceptingStatesArray) {
        states[acceptingStateSymbol].accepting = true;
    }

    // transition
    let transitionData = transition;

    for (let stateSymbol in transitionData) {
        let transitionElement = transitionData[stateSymbol];
        for (let transitionSymbol in transitionElement) {
            let inputElement = transitionElement[transitionSymbol];
            if (inputElement.value === "")
                continue;
            
            let transitionArray = inputElement.value.split(',');

            if (transitionArray.length > 1 && fsmType === "DFA") 
                return alert(`Found a non-deterministic transition in a DFA!\n(State Symbol: ${stateSymbol} transition Symbol: ${transitionSymbol})`);

            if (!transitionArray.every(s => statesArray.includes(s)))
                return alert("There exists one or more invalid transition function states!");

            states[stateSymbol].transition[transitionSymbol] = transitionArray;
        }
    }

    console.log(states);

    // Finally, initialise fsm object
    fsm = new fsmConstructor(
        alphabet,
        states,
        startingStateSymbol
    );

    generator.style.display = "none";
}

const FSM_PREFIX_KEY = "#FSM#";

saveButton.onclick = function () {
    if (fsm === null )
        return alert("Generate a FSM object before saving!");

    let saveID = prompt("Enter an ID to save the FSM object as:", "Ozy makes my sweat");
    if (saveID === null )
        return;
    
    let shallowCloneFSM        = { ...fsm };
    shallowCloneFSM.GUIElement = null;  
    shallowCloneFSM.CLASS_NAME = fsm.constructor.name;
    
    localStorage[FSM_PREFIX_KEY+saveID] = JSON.stringify(shallowCloneFSM);
    alert(`Saved FSM object as '${saveID}'. You may now load it via the load function.`);
}

loadButton.onclick = function () {
    loadfsm.style.display   = "block";
    loadfsmSelect.innerHTML = "";

    for (let storedFSMKey in localStorage) {
        if(!storedFSMKey.startsWith(FSM_PREFIX_KEY))
            continue;

        let key     = storedFSMKey.substring(FSM_PREFIX_KEY.length);
        let option  = document.createElement("option");
        option.text = key;
        loadfsmSelect.add(option);
    }
}

// Events to trigger transition table element update
alphabetInput.onblur = updatetransitionTable;
statesInput.onblur   = updatetransitionTable;
fsmSelect.onchange   = updatetransitionTable;

/******************************
 *   Load FSM Frame Logic
******************************/

loadfsmLoadButton.onclick = function () {
    let key = loadfsmSelect.value;

    if (key === "")
        return alert("There are no stored FSM objects to load!");

    let storedFSMObject = JSON.parse(localStorage[FSM_PREFIX_KEY+key]);

    if (storedFSMObject === null)
        return alert("Invalid stored FSM object!");
    
    console.log(localStorage[FSM_PREFIX_KEY+key]);
    console.log("//////////////////////")
    console.log(storedFSMObject)

    // Selects are great fun yay
    let className = storedFSMObject.CLASS_NAME;
    console.log(className, ":b");
    let selectIndex;

    switch(className) {
        case "DFA":
            selectIndex = 0;
        break;
        case "NFA":
            selectIndex = 1;
        break;
        case "E_NFA":
            selectIndex = 2;
        break
        default:
            throw "Problem identifying class of the stored FSM object! (check class names, select order and validity of object)";
    }

    fsmSelect.selectedIndex  = selectIndex;
    alphabetInput.value      = Object.keys(storedFSMObject.alphabet) + "";
    statesInput.value        = Object.keys(storedFSMObject.states) + "";
    startingStateInput.value = storedFSMObject.starting;

    let acceptinginput = [];
    for (let key in storedFSMObject.states) {
        let state = storedFSMObject.states[key];
        if (state.accepting)
            acceptinginput.push(state.symbol);
    }
    
    acceptingStateInput.value = acceptinginput + "";

    // update before we add stuff! 
    updatetransitionTable();

    for (let stateSymbol in transition) {
        let inputTransitionElements = transition[stateSymbol];
        for (let alphabetSymbol in inputTransitionElements) {
            let state = storedFSMObject.states[stateSymbol];

            if (!state || !state.transition[alphabetSymbol]) // object doesnt have these states/transitions
                continue;

            let inputElement   = inputTransitionElements[alphabetSymbol];
            inputElement.value = state.transition[alphabetSymbol] + "";
            console.log(inputElement, state.transition[alphabetSymbol], "<<<<<<<<<<<<<<")
        }
    }

    loadfsm.style.display = "none";
}

loadfsmClearCacheButton.onclick = function () {
    localStorage.clear();
    loadButton.onclick();
    alert("Cleared local cache! (along with all stored FSM objects)");
}

let randomInteger = (min, max) => {
    let int = Math.floor((Math.random() * ((max - min) + 1)) + min);
    return int;
}

let LetterGenerator = function () {
    return {
        letters  : [],
        generate : function () {
            const ASCII_LETTER_LOWER = 97;
            const ASCII_LETTER_UPPER = 123;

            let n = this.letters.length;
            let difference = ASCII_LETTER_UPPER - ASCII_LETTER_LOWER;
            let offset = n % difference;

            let letter = String.fromCharCode(ASCII_LETTER_LOWER + offset);
            
            // suffix
            if (n >= difference)
                letter = letter + (n - difference); 

            this.letters.push(letter);
            return letter;
        }
    }
}

let NumberGenerator = function () {
    return {
        counter : 0,
        generate : function () {
            return this.counter++ + "";
        }
    }
}

loadfsmRandomFSMButton.onclick = function () {
    fsmSelect.selectedIndex  = randomInteger(0, 2);

    let aaUpperBound = prompt("Enter upper bound for random alphabet array generator:");
    if (isNaN(aaUpperBound))
        return alert("Input was not a number! Aborting...");

    let alphabetSize = randomInteger(1, aaUpperBound);
    let letterGen    = LetterGenerator();
    let randomAlphabetArray = [];
    
    for (let i = 0; i < alphabetSize; i++) {
        let symbol = letterGen.generate();
        randomAlphabetArray.push(symbol);
    }

    alphabetInput.value = randomAlphabetArray + ""; 

    let saUpperBound = prompt("Enter upper bound for random state array generator:");
    if (isNaN(saUpperBound))
        return alert("Input was not a number! Aborting...");

    let stateSize = randomInteger(1, saUpperBound);
    let numberGen = NumberGenerator();
    let randomStateArray = [];

    for (let i = 0; i < stateSize; i++) {
        let symbol = numberGen.generate();
        randomStateArray.push(symbol);
    }

    statesInput.value = randomStateArray + "";

    let n = randomStateArray.length-1;

    let randomIndex          = randomInteger(0, n);
    startingStateInput.value = randomStateArray[randomIndex];

    let randomIndex2          = randomInteger(0, n);
    acceptingStateInput.value = randomStateArray[randomIndex2];
    
    loadfsm.style.display = "none";
}

loadfsmClose.onclick = function () {
    loadfsm.style.display = "none";
}