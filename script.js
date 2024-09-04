// Styling Version
let version = 2;
const style_elements = document.querySelectorAll('h1, .gradient-outline, .standard-outline, .subtle-shadow, .default-component, .info-container, .continue-reading, .background-image > img');
style_elements.forEach(el => {
    if(version > 1) {
        el.classList.add(`v${version}`);
    }
})

// Page Load Animation
const animation_els = document.querySelectorAll("body > *:not(.background-image, nav, .no-anim, .cards-container, .loading-container, .read-panel)");

function staggered_animation(els, speed) {
    els.forEach(function(el, index) {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0%)';
        }, index * speed);
    })
}

function staggered_animation_3d(els, speed) {
    els.forEach(function(el, index) {
        el.style.transition = 'all 7.5s ease';
        el.style.transform = 'translateZ(-100rem)';
        setTimeout(() => {
            el.style.transform = 'translateZ(0rem)';
            el.style.opacity = '1';
            el.style.transition = 'all 250ms ease-out';
        }, (index * speed) + 1000);
    })
}

function typewriter(el, index, delay) {
    const arr = el.innerHTML.split('').map(char => {return char});
    el.innerHTML = '';
    setTimeout(() => {
        arr.forEach( function(char, index) {
            setTimeout(() => {
                el.innerHTML += char;
            }, index * delay);
        })
    }, index * delay * 100);
}

function wrap_children(parent) {
    if (parent && parent.hasChildNodes()) {
        const wrapper = create_element("div", "content");
        while (parent.firstChild) {
            wrapper.appendChild(parent.firstChild);
        }
        parent.appendChild(wrapper);

        return wrapper;
    }
}

function get_height_of_children(parent) {
    let height = 0;
    parent.childNodes[0].childNodes.forEach(child => {
        height += child.offsetHeight;
    })

    return height;
}

function get_scroll_progress(element) {
    if (!element || element.scrollHeight === element.clientHeight) {
        return 0;
    }
    return element.scrollTop / (element.scrollHeight - element.clientHeight);
}

function create_anchor_tags(text) {
    const url_pattern = /https?:\/\/[^\s]+/g;
    const result = text.replace(url_pattern, (url) => {
        return `<a href="${url}">${url}</a>`;
    });
    return result;
}

function generate_scroll_bar(parent) {
    if (parent.offsetHeight < parent.scrollHeight) {
        const content = wrap_children(parent);
        const scroll_bar_container = create_element("div", "scroll-bar-container");
        const thumb_track = create_element("div", "thumb-track");

        // Reset thumb track and scrollTop on page load
        function reset_scroll() {
            content.scrollTop = 0;
            thumb_track.style.top = `0px`;
        }

        function update_thumb_position() {
            const scroll_progress = get_scroll_progress(content);
            thumb_track.style.top = `${scroll_progress * (scroll_bar_container.offsetHeight - thumb_track.offsetHeight)}px`;
        }

        content.addEventListener("scroll", update_thumb_position);
        reset_scroll(); // Ensure initial state is correct

        let is_dragging = false;
        let start_y, start_top;

        thumb_track.addEventListener("mousedown", (e) => {
            e.preventDefault(); // Prevent default action to avoid accidental drag initiation
            is_dragging = true;
            start_y = e.clientY;
            start_top = parseFloat(thumb_track.style.top || 0);

            document.addEventListener("mousemove", on_mouse_move);
            document.addEventListener("mouseup", on_mouse_up);
        });

        function on_mouse_move(e) {
            if (is_dragging) {
                const container_rect = scroll_bar_container.getBoundingClientRect();
                const thumb_rect = thumb_track.getBoundingClientRect();
                const container_height = container_rect.height + 5; // Increase container height by 5px
                const thumb_height = thumb_rect.height + 5; // Increase thumb height by 5px

                // Calculate the new position for the thumb
                let new_top = start_top + (e.clientY - start_y);
                new_top = Math.max(0, Math.min(container_height - thumb_height, new_top));

                thumb_track.style.top = `${new_top}px`;

                // Calculate the scroll progress and set scrollTop
                const scroll_progress = new_top / (container_height - thumb_height);
                content.scrollTop = scroll_progress * (content.scrollHeight - content.offsetHeight);
            }
        }

        function on_mouse_up() {
            is_dragging = false;
            document.removeEventListener("mousemove", on_mouse_move);
            document.removeEventListener("mouseup", on_mouse_up);
        }

        thumb_track.addEventListener("mouseenter", () => {
            thumb_track.classList.add("active-hover");
        });

        thumb_track.addEventListener("mouseleave", () => {
            thumb_track.classList.remove("active-hover");
        });

        scroll_bar_container.appendChild(thumb_track);
        parent.appendChild(scroll_bar_container);
    }
}

staggered_animation(animation_els, 200);

const cards = document.querySelectorAll('.card');
staggered_animation_3d(cards, 100);

function create_element(type, class_name) {
    const el = document.createElement(type);
    if(class_name != null) {
        const classes = class_name.split(", ");
        classes.forEach(cls => {
            el.classList.add(cls.replace(/_/g, "-"));
        });
    }
    return el;
}

function do_bounding_boxes_intersect(element1, element2) {
    // Get the bounding boxes of the two elements
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    console.log('Element 1:', rect1);
    console.log('Element 2:', rect2);

    // Check if the bounding boxes intersect
    const is_intersecting = !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );

    console.log('Is intersecting:', is_intersecting);
    return is_intersecting;
}

function get_average_light_dark_colors(image_src, callback) {
    const img_element = new Image();

    img_element.src = image_src;
    img_element.crossOrigin = "Anonymous"; // This is needed if the image is from a different origin
    img_element.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img_element.width;
        canvas.height = img_element.height;
        ctx.drawImage(img_element, 0, 0, canvas.width, canvas.height);

        const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = image_data.data;

        let light_color = [0, 0, 0];
        let dark_color = [0, 0, 0];
        let light_count = 0;
        let dark_count = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = (r + g + b) / 3;

            if (brightness > 127) {
                light_color[0] += r;
                light_color[1] += g;
                light_color[2] += b;
                light_count++;
            } else {
                dark_color[0] += r;
                dark_color[1] += g;
                dark_color[2] += b;
                dark_count++;
            }
        }

        if (light_count > 0) {
            light_color = light_color.map(channel => Math.round(channel / light_count));
        }

        if (dark_count > 0) {
            dark_color = dark_color.map(channel => Math.round(channel / dark_count));
        }

        const result = {
            light_color: `rgb(${light_color[0]}, ${light_color[1]}, ${light_color[2]})`,
            dark_color: `rgb(${dark_color[0]}, ${dark_color[1]}, ${dark_color[2]})`
        };

        callback(result);
    };

    img_element.onerror = function() {
        console.error('Image failed to load');
    };
}

async function fetch_data(sheet_name, api_key = "AIzaSyAM07AIfBXXRU0Y8MbpzySSVtCAG3xjHr0", link = "https://docs.google.com/spreadsheets/d/1FauXTMjWxaPddvDzqazbUtSWVtY7sgNjVk4arYobhFY/edit?usp=sharing") {
    try {
        const sheet_id = link.match(/\/d\/(.*?)\//)[1];
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${sheet_name}!A1:Z1000?key=${api_key}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const headers = data.values[0];
        const rows = data.values.slice(1);

        return rows.map(row => {
            let obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || null;
            });
            return obj;
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function itallics(text_input) {
    let text = '';
    Array.from(text_input.split("*")).forEach( function(item, index) {
        if(index % 2 === 1) {
            text += `<span class="read-accent">${item}</span>`
        } else {text += item}
    })
    return text;
}

function convert_date(date) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const [month, day, year] = date.split('-').map(Number);
    const suffix = (day === 1 || day === 21 || day === 31) ? 'st' : (day === 2 || day === 22) ? 'nd' : (day === 3 || day === 23) ? 'rd' : 'th';

    return `${day}${suffix} ${months[month - 1]} ${year}`;
}

function conv_px_to_em(px_value, base_font_size = 16) {
    return px_value / base_font_size;
}

function create_pop_up() {
    const pop_up_container = create_element("div", "pop-up-container, no-anim, hidden");
    return pop_up_container;
}

function open_pop_up() {
    const pop_up = document.querySelector(".pop-up-container");
    document.body.style.overflow = 'hidden';
    pop_up.classList.remove('hidden');
}

function close_pop_up() {
    const pop_up = document.querySelector(".pop-up-container");
    document.body.style.overflow = 'auto';
    pop_up.classList.add('hidden');
}

function fit_content(el) {el.style.height = 'fit-content'}

function fix_height_in_pixels(el) {
    el.style.height = `${el.style.offsetHeight}px`;
    console.log('Fixed Height of' + el)
}

function animate_children(container_query, speed) {
    const direct_children = document.querySelectorAll(`${container_query} > *:not(.no-anim)`);
    direct_children.forEach( function(child, index) {
        child.style.opacity = '0';
        child.style.transition = '500ms ease all';
        child.style.transform = 'translateX(-20%) rotateX(50deg)';
        setTimeout(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateX(0%) rotateX(0deg)';
        }, index * speed);
    })
}

function get_overflow_height(el) {
    return el.offsetHeight;
}

// Read More
function read_more() {
    const read_mores = document.querySelectorAll('.read-more');
    read_mores.forEach(read_more => {
        const read_more_button = create_element("img", "read-more-button");
        read_more_button.src = './assets/read-more.svg'
        read_more.appendChild(read_more_button);
    })
}

function responsive_background() {
    const background = document.querySelector('.gradient');
    if(background) {
        window.addEventListener("mousemove", (e) => {
            let scaledX = e.clientX / 250;
            let scaledY = e.clientY / 250;
            background.style.transform = `translate(${scaledX}%, ${scaledY}%) rotate(${e.clientY / 50}deg)`
        })
    }
}

function copy_text(selector) {
    const els = document.querySelectorAll(selector);
    els.forEach(el => {
        const outer_container = create_element("div", "outer-container");
        outer_container.style.position = "relative";
        const copy_icon = create_element("img", "copy-icon, subtle-shadow");
        copy_icon.src = './assets/copy.svg';

        copy_icon.addEventListener("click", () => {
            let copy_text = el.textContent;
            let anim_duration = 2;

            let first_keyframe = anim_duration * 250;
            let second_keyframe = anim_duration * 750;

            console.log(first_keyframe, second_keyframe)

            navigator.clipboard.writeText(copy_text);
            let anim = `image-change ${anim_duration / 2}s linear 0s 2 forwards`;
            copy_icon.style.animation = anim;
            
            setTimeout(() => {
                copy_icon.src = './assets/copy-tick.svg'
            }, first_keyframe);
            setTimeout(() => {
                copy_icon.src = './assets/copy.svg';
            }, second_keyframe);
            setTimeout(() => {
                copy_icon.style.animation = '';
            }, anim_duration * 1000);
        })

        el.parentElement.appendChild(outer_container)
        append_children(outer_container, [el, copy_icon]);
    })
}

responsive_background();

const navigation_container = document.querySelector('nav');

const navigation_layout = [
    {pages: [
        {text: null, image: './assets/Home.svg', link: './index.html'}
    ]},
    {pages: [
        {text: 'Listen', link: './listen.html'},
        {text: 'Read', link: './read.html'},
        {text: 'About', link: './about.html'},
        {text: 'Contact', link: './contact.html'}
    ]}
]

function append_children(container, children) {
    children.forEach(child => {container.appendChild(child)})
}

function create_computer_nav(navigation_container, navigation_layout, test_pages) {
    navigation_layout.forEach(item => {
        const container = create_element("div", "nav-item");
        item.pages.forEach(sub_item => {
            const page = create_element("a", "page-link");
            page.textContent = sub_item.text;
            if(test_pages) {page.href = '#'} else {page.href = sub_item.link;}
            container.appendChild(page);
            if(sub_item.text == null) {
                const image = create_element("img", "home-icon");
                image.src = sub_item.image;
                page.appendChild(image)
            }
        });
        navigation_container.appendChild(container)
    })
}

function create_mobile_nav(navigation_container, navigation_layout) {
    const hamburger = create_element("img", "nav-button");

    const home = create_element("a", "home-link");
    home.href = './index.html'
    const home_image = create_element("img", null);
    home_image.src = './assets/Home.svg'
    home.appendChild(home_image)

    hamburger.src = './assets/hamburger.svg';
    hamburger.classList.add('image-shadow')
    navigation_container.appendChild(home);
    navigation_container.appendChild(hamburger);
        
    const navigation = create_element("div", "mobile-navigation, default-component");
    
    navigation_container.appendChild(navigation);
    

    const exit = create_element("img", "exit-button");
    exit.src = './assets/exit.svg'
    navigation.appendChild(exit)

        const nav_items = navigation_layout[1].pages;
        nav_items.forEach(item => {
            const nav_item = create_element("a", "page-link");
            nav_item.href = item.link;
            nav_item.textContent = item.text;
            navigation.appendChild(nav_item)
        })

    hamburger.addEventListener("click", () => {navigation.classList.add('active')})
    exit.addEventListener("click", () => {navigation.classList.remove('active')})
}

function get_client_width() {
    return parseInt(document.body.offsetWidth)
}

function shorten_text(text_query, length) {
    const long_text = document.querySelector(text_query);
    let text_content = long_text.textContent;
    long_text.textContent = `${text_content.substring(0, length)} ...`;
}

function typewriter_transition(el, old_text, new_text, speed) {
    el.textContent = old_text;

    let current_index = 0;
    let is_deleting = true;

    function type() {
        if (is_deleting) {
            el.textContent = old_text.substring(0, current_index);
            current_index--;

            if (current_index < 0) {
                is_deleting = false;
                current_index = 0;
                old_text = new_text;
            }
        } else {
            el.textContent = new_text.substring(0, current_index);
            current_index++;

            if (current_index > new_text.length) {
                return;
            }
        }
        setTimeout(type, speed);
    }
    type();
}

function arr_add_class(els, class_name) {
    els.forEach(el => {
        el.classList.add(class_name);
    })
}

function arr_remove_class(els, class_name) {
    els.forEach(el => {
        el.classList.remove(class_name);
    })
}

function get_page_name() {
    let page = window.location.pathname.split('/').pop();
    return page;
}

if(get_client_width() > 700) {
    create_computer_nav(navigation_container, navigation_layout, false)
} else {
    navigation_container.classList.add('mobile-view')
    create_mobile_nav(navigation_container, navigation_layout);
}

// if(get_page_name() === 'index.html') {
//     if(get_client_width() < 900) {
//         shorten_text('.info-container > p', 500)
//     }
//     if (get_client_width() < 600) {
//         shorten_text('.info-container > p', 250)
//     }
// }

const pages = ['INDEX', 'LISTEN', 'READ', 'ABOUT', 'CONTACT'];

// Get Text Data
function markdown_to_json(input) {
    const lines = input.split('\n');
    let output = [];
    let current_page = {};
    let current_content = null;
    lines.forEach(line => {
        if (line.startsWith('# ')) {
            if (current_page.page) {
                output.push(current_page);
            }
            current_page = { page: line.slice(2).trim(), content: [] };
            current_content = null;
        } else if (line.startsWith('## ')) {
            const page_info = line.slice(3).trim();
            current_content = { data_heading: page_info, data: '' };
            current_page.content.push(current_content);
        } else if (line.trim() !== '') {
            if (current_content) {
                // Remove '###' from the beginning of the data field
                const cleanedLine = line.replace(/^###\s*/, '');
                if (current_content.data === '') {
                    current_content.data += cleanedLine.trim() + ' ';
                } else {
                    current_content.data += '\n' + cleanedLine.trim() + ' ';
                }
            }
        }
    });
    if (current_page.page) {
        output.push(current_page);
    }
    return output;
}

function get_elements(attribute_query) {
    const els = document.querySelectorAll(`[data-${attribute_query}]`);
    if(els) {return els} else {return null}
}

let fetch_json = true;

if(['index.html', null, undefined, '', ' '].includes(get_page_name())) {fetch_json = false;}

if(fetch_json) {
    fetch('./website_struct.md')
    .then(data => {
        return data.text();
    })
    .then(text => {
        const output = markdown_to_json(text);
        const page_title = get_page_name().replace('.html', '').toUpperCase();
        const content_items = output[pages.indexOf(page_title)].content;

        if(content_items) {
            content_items.forEach(item => {
                const html_els = get_elements(item.data_heading);
                html_els.forEach(el => {el.innerHTML = item.data})
            })
        }
    })
}   

const hover_cards = document.querySelectorAll('.cards-container > .card');

hover_cards.forEach((card, index) => {
    const base_transform = (index !== 1) ? "translateZ(0)" : "translateZ(1.125rem)";
    const is_index_two = index === 2;

    card.addEventListener("mousemove", (e) => {
        const valX = (e.offsetX / card.offsetWidth) - 0.5;
        const valY = (e.clientY / card.offsetHeight) - 1;
        const rotation_x = valY * 10;
        const rotation_y = valX * 10;

        const new_style = `${base_transform} translateZ(5rem) rotateX(${rotation_x}deg) rotateY(${rotation_y}deg) scale(0.95)`;

        if (card.style.transform !== new_style) {
            card.style.transform = new_style;
        }
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = `${base_transform} translateZ(0rem) rotateX(0deg) rotateY(0deg)`;
    });
});











