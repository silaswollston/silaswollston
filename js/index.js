const main = document.querySelector("main")
const events_container = document.querySelector(".events-container");
const performances = document.querySelector(".performances");
const press = document.querySelector(".press");
const recording = document.querySelector(".recording");
const portrait = document.querySelector(".portrait");
const expand = document.querySelector("main > .performances > .expand");
const modal = document.querySelector(".modal");
events_container.style.setProperty("--container-height", events_container.offsetHeight + "px");
document.querySelector(".recording").style.setProperty("--margin-top", 
    -1 * ((performances.offsetTop + performances.offsetHeight) - (portrait.offsetTop + portrait.offsetHeight)) + "px"
)

const get_tallest = (els) => els.reduce((tallest, el) => (el.offsetHeight > (tallest?.offsetHeight || 0) ? el : tallest), null);

let original_width;
let original_height;
let expanded_width;
let expanded_height;

function make_info_clickable(container) {
    container.querySelectorAll('[class*="info"]').forEach(info => {
        console.log("Found info:", info);

        const link = info.parentElement.querySelector("a");

        if (!link) {
            console.log("No link found for:", info);
            return;
        }

        info.style.cursor = "pointer";

        info.addEventListener("click", () => {
            link.click();
        });
    });
}

make_info_clickable(recording);
make_info_clickable(press);

window.addEventListener("DOMContentLoaded", () => {
    const p = main.querySelector("p")
    fix_width_in_pixels(main);
    fix_width_in_pixels(main.querySelector("h1"));
    fix_width_in_pixels(p);
    p.style.setProperty("--height", p.offsetHeight + "px")
    

    if(window.innerWidth <= 950 && window.innerWidth > 840) {
        const order_arr = [press, recording];
        order_arr.forEach(el => el.classList.add("auto-order"));
        // const taller = get_tallest(order_arr);
        press.classList.add("taller");
    }

    if(window.innerWidth > 950) {
        expand.onclick = () => {

        const is_expanded = performances.classList.contains("expanded");

        if (!is_expanded) {
            expand.querySelector("img").src = "../assets/contract.svg";

            if (original_width === undefined) {

                original_width = performances.offsetWidth;
                original_height = performances.offsetHeight;
                
                performances.classList.add("expanded");
                
                expanded_width = performances.offsetWidth;
                expanded_height = performances.offsetHeight;
                events_container.style.setProperty("--expanded-container-height", events_container.offsetHeight + "px");

                performances.classList.remove("expanded");

            }

            performances.style.transition = "none";
            performances.style.width = original_width + "px";
            performances.style.height = original_height + "px";

            performances.classList.add("expanded");

            performances.querySelector("h3").innerHTML = "Upcoming Performances";
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    
                    performances.style.transition = "width 500ms ease-in-out, height 500ms ease-in-out";
                    
                    performances.offsetWidth;
                    
                    performances.style.width = expanded_width + "px";
                    performances.style.height = expanded_height + "px";

                });
            });

        } else {
            expand.querySelector("img").src = "../assets/expand.svg";

            performances.style.transition = "none";
            performances.style.width = expanded_width + "px";
            performances.style.height = expanded_height + "px";

            performances.querySelector("h3").innerHTML = "Upcoming <br> Performances";

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {

                    performances.style.transition = "width 500ms ease-in-out, height 500ms ease-in-out";

                    performances.offsetWidth;

                    performances.style.width = original_width + "px";
                    performances.style.height = original_height + "px";

                    const finished = new Set();

                    const transition_end = event => {

                        if (event.propertyName !== "width" && event.propertyName !== "height") return;

                        finished.add(event.propertyName);

                        if (finished.has("width") && finished.has("height")) {

                            performances.removeEventListener("transitionend", transition_end);

                            performances.classList.remove("expanded");

                            performances.style.width = "";
                            performances.style.height = "";
                            performances.style.transition = "";
                        }

                    };

                    performances.addEventListener("transitionend", transition_end);
                });
            });

        }

    }
        
    } else {
        const performances_clone = performances.cloneNode(true);
        performances_clone.classList.add("expanded");
        modal.appendChild(performances_clone);

        const events_container_clone = modal.querySelector(".events-container");
        modal.querySelector("h3").innerHTML = "Upcoming Performances"
        events_container_clone.style.setProperty("--expanded-container-height", events_container_clone.offsetHeight + "px");

        const expand_clone = performances_clone.querySelector(".expand");
        expand_clone.querySelector("img").src = "../assets/exit.svg";
        expand.onclick = () => modal.classList.add("visible");
        expand_clone.onclick = () => modal.classList.remove("visible");
    }
})

// 950-840