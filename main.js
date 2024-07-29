
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

var can_scroll = false;

const QTYPE_TO_NAME = {
   0: "譯字",
   1: "資料",
   2: "問答",
}

function choice(arr) {
   return arr[Math.floor(Math.random() * arr.length)]
}

function reveal() {
   can_scroll = true;
   document.getElementById("container").children[0].children[2].style.opacity = 1;
   if (container.children.length == 1) {
      container.appendChild(makeScreen());
   }
}

function makeScreen() {
   q = choice(QUESTIONS);
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
   answer.style.opacity = 0;
   e.appendChild(answer);

   return e;
}

document.addEventListener("DOMContentLoaded", () => {
   const container = document.getElementById("container");
   container.appendChild(makeScreen());
   
   container.addEventListener("scrollend", e => {
      if (!can_scroll) return;
      console.log(container.children[1].getBoundingClientRect());
      // document.getElementById("info").innerText = container.children[1].getBoundingClientRect().y.toString();
      if (container.children[1].getBoundingClientRect().y < 50) {
         container.removeChild(container.children[0]);
         can_scroll = false;
      }
   })
})
