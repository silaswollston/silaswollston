const panel_container = document.querySelector('.panel-container');
const the_vision = document.querySelector('.the-vision')
const stages = panel_container.querySelector('.the-vision > .stages')
const stage_els = stages.querySelectorAll('.stage');
const progress_bar = stages.querySelector('.progress-line');
const blog_container = document.querySelector('.updates-container');

const API_KEY = "AIzaSyAYlUEDXUhh4W-8heoe6cgXwrI2n83Xggc";
const LINK_ID = "1DZM5HIJawgD47Rtsj-fXQTchwOiNYH-wgFmV_rkG36M";

function handle_progress_bar() {
    fix_progress_bar(stages, progress_bar, true)

    stage_els.forEach(el => {
        el.addEventListener("mouseover", () => {
            the_vision.style.height = 'fit-content'
            the_vision.style.maxHeight = '200vh';
            setTimeout(() => {
                fix_progress_bar(stages, progress_bar, false)
            }, 500);
        })
    })
}   

function fix_progress_bar(container, progress_bar, first) {
    const children = Array.from(container.children);
    const height = Math.abs(children[0].offsetTop - children[3].offsetTop);
    if(first) {
        progress_bar.style.height = `${(height * 2) + 15}px`;
    } else {
        progress_bar.style.height = `${(height) + 15}px`;
    }
}

stage_els.forEach(el => {
    el.addEventListener("mouseover", () => {
        fit_content(the_vision);
    });
})

// handle_progress_bar();

function position_progress_bar(progress_bar, stage_el) {
    const computed_style = window.getComputedStyle(stage_el, ':after');
    const stage_el_pseudo_left = parseInt(computed_style.getPropertyValue('left'));
    console.log(stage_el_pseudo_left);
}

// position_progress_bar(progress_bar, stage_els[0]);

function create_blog_post(arr, is_arr_facing_right = false) {
    const update = create_element("div", "update")
        const title = create_element("span", "title");
        title.textContent = arr[0];
        const date = create_element("span", "date");
        date.textContent = convert_date(arr[1]);
        const divider = create_element("div", "vertical-divider");
        const blog_content = create_element("p", "blog-content");
        blog_content.innerHTML = arr[2];
        const read_more = create_element("button", "read-more");
            read_more.style.cursor = 'pointer';
            read_more.classList.add('text-shadow');
            const read_more_image = create_element("img", null);
            let path = './assets/read-more.svg';
            if(is_arr_facing_right) {path = './assets/right-arrow.svg'}
            read_more_image.src = path;

            read_more.addEventListener("click", open_pop_up);
        read_more.appendChild(read_more_image) 
    append_children(update, [title, date, divider, blog_content, read_more]);
    
    return update;
}

async function read_data(API_KEY, LINK_ID) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${LINK_ID}/values/Sheet1?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error reading data:', error);
        return null;
    }
}

function create_pop_up_structure(data_arr) {
    const pop_up_container = create_pop_up();
        const timeline = create_element("div", "timeline");
        const updates_container = create_element("div", "main-updates-container, custom-scroll-bar");
        const current_post = create_element("div", "current-post");
        const exit = create_element("img", "exit, dark-text-shadow");
            exit.src = './assets/exit.svg'
        exit.addEventListener("click", close_pop_up)
    
    append_children(pop_up_container, [timeline, updates_container, current_post, exit]);
    document.body.appendChild(pop_up_container);

    data_arr.forEach(update => {
        const new_post = create_blog_post(update);
        new_post.style.opacity = '1';
        updates_container.appendChild(new_post);
    });
}

const updates_container = panel_container.querySelector('.updates');
let updates_height = updates_container.offsetHeight;
let current_height = 0;
let max_updates = false;

let fired = 0;


read_data(API_KEY, LINK_ID)
    .then((data_arr) => {
        data_arr.values.shift();
        data_arr.values.forEach(function(update, index) {
            const new_update = create_blog_post(update);
            let max = 3;
            if(get_client_width() < 1340) {max = 2}
            if(index < max) {
                updates_container.appendChild(new_update);
            }
        })

        create_pop_up_structure(data_arr.values)
    })
    .catch((error) => {
        console.error('Error:', error);
    });

fix_height_in_pixels(blog_container)

setTimeout(() => {
    if(get_client_width() < 1340 && get_client_width() > 1000) {
        blog_container.style.height = `${the_vision.offsetHeight}px`
    }
    animate_children('.updates', 2000);
    animate_children('.stages', 400);
}, 2000)


