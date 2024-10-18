
// document.getElementById("container").addEventListener("scroll", e => {
//      // console.log(document.getElementById("primary").getBoundingClientRect())
//      var at_snapping_point = e.target.scrollTop % e.target.offsetHeight === 0;
//      var timeout = at_snapping_point ? 0 : 150;
// 
//      clearTimeout(e.target.scrollTimeout);
//      
//      e.target.scrollTimeout = setTimeout(() => {
//            // alert();
//            // return;
//            // scroll snapped!
//            document.getElementById("secondary").id = "primary";
//            e = document.createElement("section")
//            e.innerText = "hello" + Date.now().toString();
//            e.id = "secondary";
//            document.getElementById("container").appendChild(e)
//      }, timeout);
// })


// quick redirect

if (window.location.hash == "") {
    window.location.href = "mem.html";
}


// Variables


const parents = [...new Set(QUESTIONS.map(q => q.parent))];
const qtype_to_name = {
    0: "譯字",
    1: "資料",
    2: "問答",
}

const queue = [];

var showing_answer = false;
var allowed_parents = new Set(parents.slice());
var score = 0;


// Logic


function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function choose_question() {
    return choice(QUESTIONS.filter(q => allowed_parents.has(q.parent)));
}

function fullscreen() {
    let doc = document.documentElement;
    var request = doc.requestFullScreen
              || doc.webkitRequestFullScreen
              || doc.mozRequestFullScreen
    ;
    request.call(doc);
}

function new_question() {
    q = choose_question();
    e = document.createElement("section")

    // header
    header = document.createElement("h5");
    header.innerText = "〈" + q.parent + "〉" + qtype_to_name[q.type];
    e.appendChild(header)

    // content
    
    main = document.createElement("h3");
    main.innerHTML = q.question.replace("。", "");
    e.appendChild(main);

    // answer
    
    answer = document.createElement("h3")
    answer.innerText = q.answer;
    answer.classList.add("red");
    answer.style.opacity = 0;
    e.appendChild(answer);

    ans = e.cloneNode(deep=true);
    ans.children[2].style.opacity = 1;

    queue.push(e);
    queue.push(ans);
}

function push_questions() {
    // pushes questions from queue to scroller
    const scroller = document.getElementById("scroller");
    while (scroller.children.length < 2) {
        scroller.appendChild(queue.shift());
    }
}


// Handlers


function update_settings() {
    allowed_parents = new Set([... document.querySelectorAll("fieldset div input[type = checkbox]")].filter(e => e.checked).map(e => e.value));
}

function toggle_modal() {
    const modal = document.getElementById("modal");
    modal.style.display = modal.style.display == "none" || modal.style.display == "" ? "block" : "none";
    update_settings();
}

function reveal() {
    if (showing_answer) return;
    showing_answer = true;
    // [q] <a>
    document.getElementById("scroller").children[0].children[2].style.opacity = 1;
    // [a] <a>
    document.getElementById("scroller").children[1].remove();
    // [a]

    score++;

    if (document.getElementById("scroller").children.length == 1) {
        new_question();
        // [a] <q> <a>
    }
    push_questions();
}

function set_checkboxes(val) {
    document.querySelectorAll("fieldset div input[type = checkbox]")
    .forEach(
        e => e.checked = val
    )
}


// Listeners


var showing_stats = false;

document.addEventListener("DOMContentLoaded", () => {
    const select_parent = document.getElementById("select_parent");
    parents.forEach(p => {
        div = document.createElement("div");
        input = document.createElement("input");
        input.id = "parent-" + p;
        input.type = "checkbox";
        input.value = p;
        input.checked = true;
        div.appendChild(input);
        label = document.createElement("label");
        label.htmlFor = "parent-" + p;
        label.innerText = p;
        div.appendChild(label);
        select_parent.appendChild(div);
    });


    document.body.style.overflow = 'hidden';
    const scroller = document.getElementById("scroller");
    new_question();
    push_questions();
    // [q] <a>

    addEventListener("scroll", e => {
        if (showing_stats) {
            e.stopPropagation();
            e.preventDefault();
        }
    })
    
    scroller.addEventListener("scrollend", e => {
        if (scroller.children[1].getBoundingClientRect().y < 100) {
            // <q> [a]  or  <a> [q] <a>
            scroller.removeChild(scroller.children[0]);
            // [a] or [q] <a>
            showing_answer = !showing_answer;
            if (showing_answer) {
                // [a] <q> <a>
                new_question();
                score++;
            };
            push_questions();
        }
    });

    update_settings();

})
