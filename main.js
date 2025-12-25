
function switchScreen(n) {
    const active = document.querySelector(".screen-active");
    if (active) active.classList.remove("screen-active");
    const el = document.getElementById(`screen${n}`);
    if (el) {
        el.classList.add("screen-active");
    } else {
        switchScreen(404);
    }
}

const MODE_LANDING = 0;
const MODE_VIEW = 1;
const MODE_QUIZ2 = 2;

var state = {
    mode: MODE_LANDING,
    text: null,
};

const ORDER = [
    "論仁",
    "論孝",
    "論君子",
    
    "念奴嬌",
    "聲聲慢",
    "青玉案",
    "山居秋暝",
    "月下獨酌",
    "登樓",

    "勸學",
    "師說",
    "魚我所欲也",
    "廉頗藺相如列傳",
    "岳陽樓記",

    "六國論",
    "出師表",

    "逍遙遊",
    "始得西山宴遊記",
];

const GROUPS = [
    [["論仁", "論孝", "論君子"], "#faf8ca"],
    [["念奴嬌", "聲聲慢", "青玉案"], "#f8d4fc"],
    [["山居秋暝", "月下獨酌", "登樓"], "#e0fbff"],
    // [["逍遙遊", "始得西山宴遊記"], "#d6ffe0"],
];

for (const name of ORDER) {
    let color = "";
    for (const group of GROUPS) {
        if (group[0].includes(name)) {
            color = group[1];
        }
    }
    document.getElementById("card-container").innerHTML += `
        <div class="card" style="background-color: ${color}" onclick="setState({ mode: ${MODE_VIEW}, text: '${name}' })">
            <b>${name}</b>
        </div>
    `;
}

function setState(newState, replace = false) {
    console.log("setstate", newState);
    state.mode = newState.mode;
    state.text = state.mode === MODE_LANDING ? null : newState.text;

    let newUrl = window.location.pathname;

    // in quiz mode, .text is an object

    if (state.mode === MODE_VIEW) {
        if (state.text !== null && !(state.text in TEXTS)) {
            state.text = null;
        }

        const encoded = state.text !== null ? encodeURIComponent(state.text) : "";
        newUrl = window.location.pathname + (encoded ? "#" + encoded : "");
    } else if (state.mode === MODE_QUIZ2) {
        newUrl = window.location.pathname + "#quiz";
    }

    if (replace) {
        history.replaceState(state, "", newUrl);
        setup();
    } else {
        history.pushState(state, "", newUrl);
        setup();
    }
}

var running = false;

function setup() {
    // state is changed
    window.scrollTo(0, 0);
    exit();
    if (state.mode === MODE_LANDING) {
        switchScreen(0);
        return;
    }
    
    if (state.mode === MODE_VIEW) {
        switchScreen(1);

        document.getElementById("text-title").innerText = state.text;

        const tmp = document.getElementById("para-list");
        tmp.innerHTML = "";
        for (const p in TEXTS[state.text]) {
            tmp.innerHTML += `
                <hr>
                <div class="para-pre">
                    <span>第${p}段</span>
                    <div class="para-pre-normal">
                        <button onclick="startMode2(${p})">背</button>
                        <button onclick="startQuiz2(${p})">背+</button>
                        <button onclick="startMode3(${p})">譯</button>
                    </div>
                    <div class="para-pre-active">
                        <button onclick="exit()">退出</button>
                    </div>
                </div>
                <div class="para" data-para="${p}">
                    ${TEXTS[state.text][p].text}
                </div>
                <div class="m3-controls">
                    <p class="m3-ans"></p>
                    <button class="m3-btn" onclick="mode3click()"></button>
                </div>
            `;
        }
    }

    if (state.mode === MODE_QUIZ2) {
        switchScreen(2);
        document.getElementById("quiz2-timer-inner").style.width = "100%";
        quiz2cnt = 0;
        quiz2s = Array.from({length: state.text.content.length}, (v, i) => 0);

        document.getElementById("quiz2-title").innerText = state.text.title;
        document.getElementById("quiz2-text").innerHTML = "<span></span>";
        const btns = document.getElementById("quiz2-buttons");
        btns.innerHTML = "";
        let init = shuffle(state.text.content.slice(0, 9));
        for (let i = 0; i < 9; i++) {
            const btn = document.createElement("button");
            btn.innerText = init[i];
            btn.setAttribute("data-n", String(i));
            btn.onclick = () => quiz2click(i);
            btns.appendChild(btn);
            quiz2s[i] = 1;
        }
    }
}

let quiz2s; // 0 = no; 1 = shown as option
let quiz2cnt = 0;

function quiz2gen() {
    let i = quiz2cnt;
    while (quiz2s[i]) i++;
    let len = i - quiz2cnt;
    let sample = new Array();

    while (sample.length < len && i < quiz2s.length) {
        if (quiz2s[i] == 0) sample.push(i);
        i++;
    }
    // let sample = state.text.content.slice(quiz2cnt + i, quiz2cnt + i * 2);
    let index = sample[Math.floor(Math.random() * sample.length)];
    // let chosen = sample[index];
    quiz2s[index] = 1;
    return state.text.content[index] ?? "X";
}

function shuffle(string) {
    let a = string.split("");
    let n = a.length;

    for (let i = n - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function quiz2click(n) {
    const btn = document.querySelector(`#quiz2-buttons button[data-n = '${n}']`);
    if (btn.innerText === state.text.content[quiz2cnt]) {
        quiz2cnt++;
        document.getElementById("quiz2-text").innerHTML = state.text.content.slice(0, quiz2cnt) + "<span></span>";
        btn.classList.add("success");
        const char = quiz2gen(); // pre generated to prevent funny issuess
        setTimeout(() => {
            btn.classList.remove("success");
            btn.innerText = char;
        }, 300);

        if (quiz2cnt >= state.text.content.length) {
            document.getElementById("quiz2-buttons").innerHTML = "";
        }
    } else {
        btn.classList.add("failure");
        setTimeout(() => {
            btn.classList.remove("failure");
        }, 300);

    }
}

function start() {
    document.querySelectorAll(".para-pre-normal button").forEach(btn => btn.disabled = true);
    running = true;
}

function exit() {
    clearInterval(m2interval);
    window.removeEventListener("click", mode2click);
    if (activePara) {
        activePara.classList.remove("active");
        activePara.classList.remove("active3");
        activePara.innerText = TEXTS[state.text][parseInt(activePara.getAttribute("data-para"))].text;
        activePara = null;
    }

    document.querySelectorAll(".para-pre-normal button").forEach(btn => btn.disabled = false);
    running = false;
}

let m2para = "";
let m2index = 0;
let m2time = 0;
let m2totalTime = 7000;
let m2interval = null;

let activePara = null;

function startMode2(para) {
    if (running) return;

    m2index = -1;
    m2time = 0;
    m2totalTime = 7000;
    m2interval = null;
    m2para = TEXTS[state.text][para].text;

    activePara = document.querySelector(`.para[data-para = "${para}"]`);
    activePara.classList.add("active");
    activePara.innerText = "";

    setTimeout(() => window.addEventListener("click", mode2click), 300);

    start();
    mode2click();
}

function mode2click() {
    if (m2index >= m2para.length) {
        return;
    }
    // m2time = Math.min(m2time + 3000, m2totalTime);
    // if (m2index == 0) {
    //     m2time = m2totalTime;
    //     m2interval = setInterval(() => {
    //         m2time -= 20;
    //         document.getElementById("timer-inner").style.width = `${m2time / m2totalTime * 100}%`;
    //         
    //         if (m2time <= 0) {
    //             document.getElementById("timer-inner").style.width = "0%";
    //             clearInterval(m2interval);
    //             mode2Update();
    //         }
    //     }, 20);
    // }
    m2index++;
    activePara.innerHTML = m2para.substring(0, m2index) + "<span style='font-size: 0.75em; color: gray;'>…點擊繼續</span>";
    if (m2index >= m2para.length) {
        activePara.classList.add("success");
        // document.getElementById("timer-inner").style.width = "100%";

        let tmp = activePara; // ugly haha
        setTimeout(() => {
            tmp.classList.remove("success");
            running = false;
        }, 1000);
        
        exit();
    }
}

let m3text = "";
let m3mode = 1; // is showing qs now?
let m3trans = null;
let m3data = {};
let m3controls = null;

function startMode3(para) {
    if (running) return;

    m3text = TEXTS[state.text][para].text;
    m3mode = 0;
    m3trans = JSON.parse(JSON.stringify(TEXTS[state.text][para].translations));
    if (Object.keys(m3trans).length == 0) {
        alert("Sorry. Translations for this text was not inserted yet!");
        return;
    }
    m3data = {};

    activePara = document.querySelector(`.para[data-para = "${para}"]`);
    activePara.classList.add("active");
    activePara.classList.add("active3");
    m3controls = document.querySelector(`.para[data-para = "${para}"] + .m3-controls`);
    m3controls.querySelector(".m3-btn").disabled = false;

    start();
    mode3click(); // simulate
}

function mode3click() {
    if (m3mode == 0) {
        // generate a new question
        m3controls.querySelector(".m3-ans").innerText = "";
        m3controls.querySelector(".m3-ans").classList.remove("m3-red-anim");
        let keys = Object.keys(m3trans);
        m3data.index = parseInt(keys[Math.floor(keys.length * Math.random())]);
        [m3data.length, m3data.word] = m3trans[m3data.index];
        activePara.innerHTML = 
            m3text.substring(0, m3data.index)
            + `<span class="m3-red-anim" style="color: red; font-weight: bold;">${m3text.substr(m3data.index, m3data.length)}</span>`
            + m3text.substring(m3data.index + m3data.length);
        m3controls.querySelector(".m3-btn").innerText = "揭曉";
    } else {
        m3controls.querySelector(".m3-ans").innerText = m3data.word;
        m3controls.querySelector(".m3-ans").classList.add("m3-red-anim");
        delete m3trans[m3data.index];
        m3controls.querySelector(".m3-btn").innerText = "繼續";
        if (Object.keys(m3trans).length == 0) {
            m3controls.querySelector(".m3-btn").disabled = true;
        }
    }
    m3mode = 1 - m3mode;
}

function startQuiz2(para) {
    const title = `${state.text} 第${para}段`;
    const content = TEXTS[state.text][para].text;
    setState({ mode: MODE_QUIZ2, text: {
        title,
        content,
    } });
}

window.addEventListener("popstate", e => {
    // when nav is used
    if (e.state) {
        state.mode = e.state.mode;
        state.text = e.state.text;
    } else {
        // fallback: derive from hash
        const h = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : null;
        state.text = h && h in TEXTS ? h : null;
        state.mode = state.text === null ? MODE_LANDING : MODE_VIEW;
    }
    setup();
});

const NUMPAD_MAP = [null, 6, 7, 8, 3, 4, 5, 0, 1, 2];

document.addEventListener("keydown", e => {
    if (state.mode === MODE_QUIZ2 && e.code.startsWith("Numpad")) {
        e.preventDefault();
        let n = NUMPAD_MAP[parseInt(e.code[6])];
        if (n === null) return;
        document.querySelector(`#quiz2-buttons button[data-n = '${n}']`).click();
    }
});

// on direct load, not pushState
(() => {
    const h = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : null;
    if (h && h in TEXTS) {
        setState({ mode: MODE_VIEW, text: h }, true);
    } else {
        setState(state, true);
    }
})();
