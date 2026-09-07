const main = $("main")[0]
const events_container = $(".events-container")[0];
const performances = $(".performances")[0];
const press = $(".press")[0];
const recording = $(".recording")[0];
const portrait = $(".portrait")[0];
const expand = $("main > .performances > .expand")[0];
const modal = $(".modal")[0];

const get_tallest = (els) => els.reduce((tallest, el) => (el.offsetHeight > (tallest?.offsetHeight || 0) ? el : tallest), null);

let original_width;
let original_height;
let expanded_width;
let expanded_height;

function make_info_clickable(container) {
    container.querySelectorAll('[class*="info"]').forEach(info => {

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

async function fetch_named_range(
    named_range,
    spreadsheet_id = "1FauXTMjWxaPddvDzqazbUtSWVtY7sgNjVk4arYobhFY"
) {
    const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}` +
        `?ranges=${encodeURIComponent(named_range)}` +
        `&includeGridData=true` +
        `&key=AIzaSyAM07AIfBXXRU0Y8MbpzySSVtCAG3xjHr0`
    );

    const data = await res.json();
    const rows = data.sheets?.[0]?.data?.[0]?.rowData ?? [];

    function parse_bold(text, runs = []) {
        if (!runs.length) return text;

        let output = "";

        for (let i = 0; i < runs.length; i++) {
            const start = runs[i].startIndex;
            const end = runs[i + 1]?.startIndex ?? text.length;
            const segment = text.slice(start, end);

            if (runs[i].format?.bold === true) {
                output += `<b>${segment}</b>`;
            } else {
                output += segment;
            }
        }

        return output;
    }

    let output = [];

    rows.forEach(row => {
        const values = row.values || [];
        let row_has_content = false;
        let row_cells = [];

        for (let i = 0; i < values.length; i++) {
            const cell = values[i];
            const text = cell?.formattedValue;

            if (!text || text.trim() === "") {
                row_cells.push({
                    text: "n/a",
                    heading: false
                });
                continue;
            }

            row_has_content = true;

            row_cells.push({
                text: parse_bold(text, cell.textFormatRuns),
                heading: cell?.userEnteredFormat?.textFormat?.bold === true
            });
        }

        if (!row_has_content) {
            output.push({ type: "row_break" });
        } else {
            output.push({
                type: "row",
                cells: row_cells
            });
        }
    });

    return output;
}

function parse_table(json) {
    const rows = json
        .filter(item => item.type === "row")
        .map(item => item.cells.map(cell => cell.text));

        
    const trunc = rows.filter(
        arr => arr.length > 0 && !arr.some(el => el === "") && !arr.includes('FALSE')
    );

    const parsed = [];

    trunc.forEach((arr, i) => {
        const obj = {};

        arr.forEach((el, j) => {
            let formatted_el = el;

            const key = trunc[0][j];

            const bool_map = {
                "TRUE": true,
                "FALSE": false
            };

            if (el in bool_map) {
                formatted_el = bool_map[el];
            }

            if (key.includes("Date") && el !== key) {
                formatted_el = parse_gb_date(el);
            }

            if (key.includes("comma-separated")) {
                formatted_el = el.split(",");
            }

            obj[key] = formatted_el;
        });

        if (i > 0) {
            parsed.push(obj);
        }
    });

    console.log(parsed)

    return parsed;
}

function get_image_link(obj) {

    const link = Object.entries(obj)
        .filter(arr => arr[0].split(" ").includes("Image"))
        .find(el => el[1] !== "n/a");

    let f_link = link[1];

    if (f_link.includes("drive.google.com")) {
        const id = f_link.match(/\/d\/([^/]+)/)?.[1];

        if (id) {
            f_link = `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
        }
    }

    return f_link;
}

function set_href(str) {
    return str === "n/a" ? "#" : str
}

make_info_clickable(recording);
make_info_clickable(press);

function parse_superscript(str) {
    return String(str).replace(
        /(\d+)(st|nd|rd|th)\b/gi,
        (_, number, suffix) => {
            const span = $el("sup");
            span.textContent = suffix;
            
            return number + span.outerHTML;
        }
    );
}

function format_date(date_val) {
    const date = new Date(Number(date_val));

    const day = date.getDate();
    const suffix =
        day % 100 >= 11 && day % 100 <= 13 ? "th" :
        day % 10 === 1 ? "st" :
        day % 10 === 2 ? "nd" :
        day % 10 === 3 ? "rd" : "th";

    const month = date.toLocaleString("en-GB", { month: "long" });
    const year = date.getFullYear();

    return `${day}${suffix} ${month} ${year}`;
}

function _blank(a) {
    a.rel = "noopener noreferrer"
    a.target = "_blank"
}

function activate(el) {
    el.classList.remove("pre-render");
}

async function load_recording_container(recording_obj) {
    recording.querySelector("a").href = set_href(recording_obj["Release Link"]);
    recording.querySelector(".cd-info").textContent = recording_obj["Release Text"];
    const recording_img = recording.querySelector("a > img");
    const recording_img_link = get_image_link(recording_obj);
    await new Promise((resolve, reject) => {
        recording_img.onload = resolve;
        recording_img.onerror = reject;
        recording_img.src = recording_img_link;
    });
}

async function load_press_container(press_obj) {
    press.querySelector("a").href = set_href(press_obj["Publication Link"]);
    press.querySelector(".press-info").textContent = press_obj["Publication Text"];
    console.log(press_obj)
    const press_img_link = get_image_link(press_obj);
    await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            press.querySelector("a.cover-img")
                .style.setProperty(
                    "--img-src",
                    `url("${press_img_link}")`
                );
            resolve();
        };
        img.onerror = reject;
        img.src = press_img_link;
    });
}

async function load_performances_container(performances_obj) {
    performances_obj.forEach(event_obj => {
        if(event_obj["Date (UK)"] > Date.now()) {
            const event = $el(".event");
        const heading = $el("a.heading");
        heading.innerHTML = parse_superscript(event_obj["Event Heading"]);
        heading.href = set_href(event_obj["Relevant Event Page"]);
        _blank(heading)
        const short = $el("span.shortened-info");
        short.innerHTML = parse_superscript(event_obj["Shortened Event Info"]);
        const date = $el("span.date");
        const date_val = event_obj["Date (UK)"];
        date.innerHTML = parse_superscript(format_date(date_val));
        const location = $el("span.location");
        location.textContent = event_obj["Location"];
        const group = $el("a.group");
        group.href = set_href(event_obj["Performing Group's Website"]);
        group.textContent = event_obj["Performing Group"]
        _blank(group)

        event.appendChildren(heading, short, date, location, group);

        if(event_obj["Additional Line"] !== "n/a") {
            event.classList.add("featured")
            const additional = $el("span.additional-line");
            additional.innerHTML = event_obj["Additional Line"];
            event.appendChild(additional);
        }

        events_container.appendChild(event);
        }
    })
}

async function load_content() {
    const par_res = await fetch_named_range("intro_paragraph");
    const par_obj = parse_table(par_res);
    const p = $("main > p.info")[0];
    p.textContent = par_obj[0]["Introductory Paragraph"];
    fix_width_in_pixels(p);
    p.style.setProperty("--height", p.offsetHeight + "px");

    fix_width_in_pixels(main.querySelector("h1"));
    main.querySelector("h1").classList.remove("pre-render");

    requestAnimationFrame(() => {
        activate(p)
    });

    p.addEventListener("animationend", () => {
        p.classList.add("disable-mask")
    })

    const performances_res = await fetch_named_range("performances");
    const performances_obj = parse_table(performances_res);
    load_performances_container(performances_obj)
    .then(() => {
        events_container.style.setProperty("--container-height", events_container.offsetHeight + "px");
        activate(performances)
    })

    const recording_res = await fetch_named_range("recording");
    const recording_obj = parse_table(recording_res)[0];
    load_recording_container(recording_obj)
    .then(() => activate(recording));

    const press_res = await fetch_named_range("press");
    const press_obj = parse_table(press_res)[0];
    load_press_container(press_obj)
    .then(() => activate(press));
}

function visual_layer_integration() {
    fix_width_in_pixels(main);
    recording.style.setProperty("--margin-top", 
        -1 * ((performances.offsetTop + performances.offsetHeight) - (portrait.offsetTop + portrait.offsetHeight)) + "px"
    )

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
        modal.querySelector("h3").innerHTML = "Upcoming Performances";
        events_container_clone.style.setProperty("--expanded-container-height", events_container_clone.offsetHeight + "px");

        const expand_clone = performances_clone.querySelector(".expand");
        expand_clone.querySelector("img").src = "../assets/exit.svg";
        expand.onclick = () => modal.classList.add("visible");
        expand_clone.onclick = () => modal.classList.remove("visible");
    }
}

load_content().then(() => visual_layer_integration())

let resize_timeout;

window.addEventListener("resize", (e) => {
    clearTimeout(resize_timeout);
    resize_timeout = setTimeout(() => {
        window.location.reload();
    }, 250);
});