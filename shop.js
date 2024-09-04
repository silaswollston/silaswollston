let lazy_loading = false;  // Toggle this variable to show or hide loading
if(get_client_width() < 800) {lazy_loading = true}

function active_listener(el, listen_item) {
    listen_item.addEventListener("mouseenter", (e) => { el.classList.add("active"); });
    listen_item.addEventListener("mouseleave", (e) => { el.classList.remove("active"); });
}

const settings = [
    {name: "Composer", style: "left: .2rem"},
    {name: "All", style: "left: 50%; transform: translate(-50%)"},
    {name: "Performer", style: "left: calc(66.666% - .25rem)"}
];

function update_toggle(toggle, setting) {
    const composer_items = document.querySelectorAll('.listen-item[aria-label="false"]');
    const performer_items = document.querySelectorAll('.listen-item[aria-label="true"]');
    const listen_container = document.querySelector('.listen-items');
    listen_container.classList.add("transition-fade");
    setTimeout(() => {
        listen_container.classList.remove("transition-fade");
    }, 1000)
    setTimeout(() => {
        if(setting === 0) {
            arr_add_class(performer_items, "temporary-toggle");
            arr_remove_class(composer_items, "temporary-toggle");
            performer_items.forEach(item => {item.style.transform = 'translateY(-2.5rem)';})
            if(get_client_width() <= 693) {
                composer_items[0].style.transform = 'translateY(0rem)';
            }
        } else if (setting === 2) {
            arr_add_class(composer_items, "temporary-toggle");
            arr_remove_class(performer_items, "temporary-toggle");
            performer_items.forEach(item => {item.style.transform = 'translateY(0rem)';})
        } else if (setting === 1) {
            arr_remove_class(performer_items, "temporary-toggle");
            arr_remove_class(composer_items, "temporary-toggle");
            performer_items.forEach(item => {item.style.transform = 'translateY(-2.5rem)';})
        }
    }, 500)

    const position = toggle.querySelector('.position');
    const old_text = position.textContent;
    const new_text = settings[setting].name;
    toggle.setAttribute("data-setting", setting);
    position.textContent = new_text;
    position.setAttribute("style", settings[setting].style);
    typewriter_transition(position, old_text, new_text, 50);
}

function composer_performer_logic() {
    let page_suffix = window.location.href.split('#')[1];
    const toggle = document.querySelector('.toggle');
        
    Array.from(toggle.children).forEach( function(button, index) {
        button.addEventListener("click", () => {
            update_toggle(toggle, index)
        })
    })

    const toggle_index = {
        composer: 0,
        performer: 2
    };

    update_toggle(toggle, toggle_index[page_suffix] ?? 1);
}

// Select elements
const loading_container = document.querySelector('.loading-container');
const container = document.querySelector('.listen-items');
const loading_percentage_span = document.querySelector('.loading-percentage');

// Immediately hide loading container if lazy_loading is true
if (lazy_loading) {
    loading_container.classList.add('hidden');
}

fetch_data("Listen").then(data => {
    if (!data) return;

    const iframes = [];
    let loaded_iframes = 0;
    let current_percentage = 0;

    function update_percentage(target_percentage) {
        const increment = target_percentage > current_percentage ? 1 : 0;

        const interval = setInterval(() => {
            current_percentage += increment;
            if (current_percentage >= target_percentage || current_percentage >= 100) {
                current_percentage = Math.min(target_percentage, 100);
                clearInterval(interval);
            }
            loading_percentage_span.textContent = `${current_percentage}%`;
        }, 20); // Adjust timing as needed for smoothness
    }

    const non_performers = data.filter(item => item.is_performer === "FALSE");
    const performers = data.filter(item => item.is_performer === "TRUE");
    
    const formatted_data = [...non_performers, ...performers];

    formatted_data.forEach(item => {
        const listen_item = create_element("div", "listen-item");
        if ((item.embed.substring(0, 1)) !== "<" && item.embed !== "n/a") {
            const clip_src = `./assets/listen/${item.embed}-clip.mp3`;
            const track_src = `./assets/listen/${item.embed}.mp3`;
            listen_item.classList.add('music-player-parent');

            const music_player = generate_music_player(listen_item, `./assets/shop/${item.cover_url}`, clip_src, track_src);
            active_listener(music_player, listen_item);
            listen_item.appendChild(music_player);
        }
        listen_item.ariaLabel = (item.is_performer).toLowerCase();
        const link = create_element("a", "buy-link");
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.href = item.link;

        let icon = "";
        if (String(item.is_buy) === "TRUE") {
            icon = "url(./assets/shopping-basket.png)";
        } else {
            icon = "url(./assets/open_link.svg)";
        }

        link.style.setProperty("--src", icon);

        listen_item.appendChild(link);

        if (((item.cover_url).split('.')[1]) !== 'mp4') {
            const cover_image = create_element("div", "cover-image, subtle-component");
            cover_image.style.setProperty("background-image", `url("./assets/shop/${item.cover_url}")`);
            listen_item.appendChild(cover_image);
        } else {
            const video = create_element("video", "video-embed, subtle-component");
            video.src = `./assets/shop/${item.cover_url}`;
            video.setAttribute("controls", true);
            listen_item.appendChild(video);
        }

        if (item.embed !== "n/a") {
            if (listen_item.classList.contains('music-player-parent')) {
                active_listener(listen_item.querySelector('.music-player'), listen_item);
            }
            listen_item.classList.add("has-embed");

            if (item.embed.substring(0, 1) === "<") {
                const embed = create_element("div", "embed");
                active_listener(embed, listen_item);
                listen_item.appendChild(embed);
                embed.innerHTML = item.embed;

                const iframe = embed.querySelector('iframe');
                if (iframe) {
                    iframes.push(new Promise(resolve => {
                        iframe.onload = () => {
                            loaded_iframes++;
                            const target_percentage = Math.floor((loaded_iframes / iframes.length) * 100);
                            update_percentage(target_percentage);
                            resolve();
                        };
                    }));
                }
            }
        } else {
            listen_item.classList.add("video-embed");
        }

        container.appendChild(listen_item);

        active_listener(link, listen_item);
    });

    if (!lazy_loading) {
        // Show the loading container if lazy_loading is false
        composer_performer_logic();
        loading_container.classList.remove('hidden');
    } else {
        composer_performer_logic();
    }

    if (!lazy_loading) {
        loading_container.classList.add('hidden');  // Hide the loading container on error
    }

    Promise.all(iframes).then(() => {
        update_percentage(100);  // Ensure the percentage reaches 100%
        if (!lazy_loading) {
            loading_container.classList.add('hidden');  // Hide the loading container

        }
    }).catch(error => {
    });
});