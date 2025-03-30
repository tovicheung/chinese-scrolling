
const FPS = 30;
const MSPF = 1000 / FPS; // milliseconds per frame
const PUNCTUATION = "，。？！；：︰「」『』";

// prepare(text_object) is called when the game is first loaded
// advance() is called everytime the user clicks
// end() is called by timer or called in advance()

const MODES = {
    mode0: {
        timer: false,

        prepare(text_object) {
            document.getElementById("main").innerHTML = this.pre_gen = text;
            var real_index = 0;
            var iter_index = 0;
            for (const [t_index, [_t_length, t_word]] of Object.entries(text_object["translations"])) {
                iter_index += t_index - real_index;
                real_index = t_index;
                const snippet = `<span class="small">${t_word}</span>`;
                this.pre_gen = this.pre_gen.substring(0, iter_index+1) + snippet + this.pre_gen.substring(iter_index+1);
                iter_index += snippet.length;
            }
        },

        advance() {
            this.show_translations = !this.show_translations;
            if (this.show_translations) {
                document.getElementById("main").innerHTML = this.pre_gen;
            } else {
                document.getElementById("main").innerHTML = text;
            }
        },

        end: function() {},

        pre_gen: "",
        show_translations: false,
    },
    mode1: {
        timer: true,

        prepare() {
            this.index = 0;
        },

        advance() {
            this.index++;
            document.getElementById("main").innerHTML = text.substring(0, this.index);
            if (this.index >= text.length) end();
        },

        end() {
            document.getElementById("main").innerHTML = text.substring(0, this.index) + `<span class="red">${text.substr(this.index)}</span>`;
        },

        index: 0,
    },
    mode2: {
        timer: true,

        prepare() {
            this.index = 0;
            // fill with full-width underscores
            this.hints = [...text].map(c => PUNCTUATION.includes(c) ? c : "\uff3f").join("");
        },

        advance() {
            this.index++;
            document.getElementById("main").innerHTML = text.substring(0, this.index) + this.hints.substring(this.index);
            if (this.index >= text.length) end();
            if (PUNCTUATION.includes(text[this.index])) this.advance();
        },

        end() {
            document.getElementById("main").innerHTML = text.substring(0, this.index) + `<span class="red">${text.substr(this.index)}</span>`;
        },

        hints: "",
        index: 0,
    },
    mode3: {
        timer: false,

        prepare(text_object) {
            this.trans = JSON.parse(JSON.stringify(text_object["translations"]));
            this.need_reveal = false;
        },

        advance() {
            if (this.need_reveal) {
                document.getElementById("main").innerHTML = text.substring(0, this.index) + `<span class="red">${text.substr(this.index, this.length)}(${this.word})</span>` + text.substring(this.index + this.length);
                delete this.trans[this.index];
                if (Object.keys(this.trans).length == 0) end();
            } else {
                let keys = Object.keys(this.trans);
                this.index = parseInt(keys[Math.floor(keys.length * Math.random())]);
                [this.length, this.word] = this.trans[this.index];
                document.getElementById("main").innerHTML = text.substring(0, this.index) + `<span class="redder">${text.substr(this.index, this.length)}</span>` + text.substring(this.index + this.length);
            }
            this.need_reveal = !this.need_reveal;
        },

        end: function() {},

        trans: null,
        index: 0,
        length: 0,
        word: "",
        need_reveal: false,
    },
};

const bar = {
    time: 5000, // in ms
    full: 5000, // in ms
    interval: null,
    onclick_go_options: false,
    danger: false,

    set_timer(millis) {
        this.time = this.full = millis;
    },
    
    start_timer() {
        this.danger = false;
        document.getElementById("container").classList.remove("danger");
        document.getElementById("bar-inner").classList.remove("cyan");

        this.interval = setInterval(() => {
            this.time -= MSPF
            if (this.time < 0) return end();
            if (this.time < 2000 && !this.danger) {
                document.getElementById("container").classList.add("danger");
                this.danger = true;
            }
            if (this.time >= 2000 && this.danger) {
                document.getElementById("container").classList.remove("danger");
                this.danger = false;
            }
            document.getElementById("bar-inner").style.width = `${this.time / this.full * 100}%`;
        }, MSPF);
    },

    stop_timer() {
        clearInterval(this.interval);
        this.interval = null;
        this.onclick_go_options = true;
        document.getElementById("bar-inner").style.width = "100%";
        document.getElementById("bar-inner").classList.add("cyan");
        document.getElementById("bar-inner").innerText = "Done";

        this.danger = false;
        document.getElementById("container").classList.remove("danger");
    },

    idle() {
        this.onclick_go_options = false;
        document.getElementById("bar-inner").style.width = "100%";
        document.getElementById("bar-inner").classList.add("cyan");
    },
}

// current state
var mode = null;
var started = false;
var running = false; // do clicks triger advance()?
var text = "";


function prepareId(textId) {
    hide_options();
    
    const text_object = TEXTS[textId];
    text = text_object.text;

    mode = MODES[document.querySelector('input[type = radio][name = mode]:checked').value];

    document.getElementById("main").innerHTML = "<span style='color: grey;'>點擊開始 ...</span>";
    document.getElementById("bar-inner").innerText = "";
    
    // title
    document.getElementById("title-textId").innerText = textId;
    document.getElementById("title-mode").innerText = document.querySelector('input[type = radio][name = mode]:checked').labels[0].innerText;

    bar.set_timer(parseInt(document.getElementById("secs").innerText) * 1000);
    bar.idle();

    running = true;
    started = false;
    
    if (text_object.long) {
        document.getElementById("main").classList.add("long");
    } else {
        document.getElementById("main").classList.remove("long");
    }

    document.body.requestFullscreen();

    mode.prepare(text_object);
}

function end() {
    running = false;
    bar.stop_timer();
    mode?.end();
    mode = null;
}

function show_options() {
    document.getElementById("options").style.display = "block";
    document.getElementById("container").style.display = "none";
    document.exitFullscreen();
    window.location.href = "#";
}

function hide_options() {
    document.getElementById("options").style.display = "none";
    document.getElementById("container").style.display = "flex";
    window.location.href = "#runner";
}

function radioChange() {
    loadTextButtons(document.querySelector('input[type = radio][name = mode]:checked').value == "mode3");
}

addEventListener(
    window.matchMedia("(any-hover: none)").matches
        ? "touchstart" // no hovering = no mouse
        : "mousedown",
    () => {
        if (!running) return
        
        if (!started) {
            // first click
            if (mode.timer) bar.start_timer();
            started = true;
        }
        
        bar.time = Math.min(bar.time + 1000, bar.full);
        mode.advance();
    }
);

function isEmpty(obj) {
    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }
    return true;
}

function loadTextButtons(special=false) {
    let div = document.getElementById("text-buttons");
    while (div.hasChildNodes()) div.removeChild(div.lastChild);
    let last_prefix = "";
    for (key in TEXTS) {
        if (special && isEmpty(TEXTS[key].translations)) continue;
        let prefix = key.split("-")[0];
        if (prefix != last_prefix) {
            last_prefix = prefix;
            div.appendChild(document.createElement("hr"));
        }
        let btn = document.createElement("button");
        btn.innerText = key;
        btn.onclick = e => {
            prepareId(e.target.innerText);
        }
        div.appendChild(btn);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // bar click listener

    document.getElementById("bar-inner").onclick = ("click", () => {
        if (bar.onclick_go_options) {
            document.getElementById("bar-inner").innerText = "";
            bar.onclick_go_options = false;
            show_options();
        }
    });

    loadTextButtons();
    show_options();
});

window.onhashchange = () => {
    if (window.location.hash == "") {
        end();
        show_options();
    }
};
