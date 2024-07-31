
// document.getElementById("container").addEventListener("scroll", e => {
//     // console.log(document.getElementById("primary").getBoundingClientRect())
//     var at_snapping_point = e.target.scrollTop % e.target.offsetHeight === 0;
//     var timeout = at_snapping_point ? 0 : 150;
// 
//     clearTimeout(e.target.scrollTimeout);
//     
//     e.target.scrollTimeout = setTimeout(() => {
//         // alert();
//         // return;
//         // scroll snapped!
//         document.getElementById("secondary").id = "primary";
//         e = document.createElement("section")
//         e.innerText = "hello" + Date.now().toString();
//         e.id = "secondary";
//         document.getElementById("container").appendChild(e)
//     }, timeout);
// })

const queue = [];
var showing_answer = false;
var filter_parent = null;

const QTYPE_TO_NAME = {
   0: "譯字",
   1: "資料",
   2: "問答",
}

const parents = [...new Set(QUESTIONS.map(q => q.parent))];

function choice(arr) {
   return arr[Math.floor(Math.random() * arr.length)]
}

function fullscreen() {
   let doc = document.documentElement;
   var request = doc.requestFullScreen
           || doc.webkitRequestFullScreen
           || doc.mozRequestFullScreen
   ;
   request.call(doc);

}

function modal() {
   const modal = document.getElementById("modal");
   // console.log(modal.style.display);
   modal.style.display = modal.style.display == "none" || modal.style.display == "" ? "block" : "none";
}

function reveal() {
   if (showing_answer) return;
   showing_answer = true;
   // [q] <a>
   document.getElementById("container").children[0].children[2].style.opacity = 1;
   // [a] <a>
   document.getElementById("container").children[1].remove();
   // [a]
   if (document.getElementById("container").children.length == 1) {
      new_question();
      // [a] <q> <a>
   }
   update();
}

function choose_question() {
   if (filter_parent == null || filter_parent == "All") {
      return choice(QUESTIONS);
   }
   return choice(QUESTIONS.filter(q => q.parent == filter_parent));
}

function new_question() {
   q = choose_question();
   e = document.createElement("section")

   // header
   header = document.createElement("h5");
   header.innerText = q.parent + " - " + QTYPE_TO_NAME[q.type];
   e.appendChild(header)

   // content
   // e.innerText = Date.now().toString();
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

   // document.getElementById("container").appendChild(e);
   // document.getElementById("container").appendChild(ans);

   queue.push(e);
   queue.push(ans);
}

function update() {
   const container = document.getElementById("container");
   while (container.children.length < 2) {
      container.appendChild(queue.shift());
   }
}

function select_parent_changed() {
   filter_parent = document.getElementById("select_parent").value;
}

document.addEventListener("DOMContentLoaded", () => {
   const select_parent = document.getElementById("select_parent");
   parents.forEach(p => {
      option = document.createElement("option");
      option.value = p;
      option.innerText = p;
      select_parent.appendChild(option);
   })


   document.body.style.overflow = 'hidden';
   const container = document.getElementById("container");
   new_question();
   update();
   // [q] <a>
   
   container.addEventListener("scrollend", e => {
      // if (!showing_answer) return;
      // alert();
      if (container.children[1].getBoundingClientRect().y < 100) {
         // <q> [a]  or  <a> [q] <a>
         container.removeChild(container.children[0]);
         // [a] or [q] <a>
         showing_answer = !showing_answer;
         if (showing_answer) new_question(); // [a] <q> <a>
         update();
      }
   })
})
