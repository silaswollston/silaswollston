// Toggle lazy loading based on screen width
let lazy_loading = false;
if (get_client_width() < 800) {
    lazy_loading = true;
    console.log("Lazy loading activated due to small screen width");
}

// Active listener function
function active_listener(el, listen_item) {
    listen_item.addEventListener("mouseenter", (e) => {
        el.classList.add("active");
        console.log("Element activated on mouse enter:", el);
    });
    listen_item.addEventListener("mouseleave", (e) => {
        el.classList.remove("active");
        console.log("Element deactivated on mouse leave:", el);
    });
}

const settings = [
    {name: "Composer", style: "left: .2rem"},
    {name: "All", style: "left: 50%; transform: translate(-50%)"},
    {name: "Performer", style: "left: calc(66.666% - .25rem)"}
];

// Updated function with improved order of operations
async function update_toggle(toggle, setting) {
    console.time("update_toggle");
    // Debounce to avoid glitches
    await new Promise(resolve => setTimeout(resolve, 300));

    const composer_items = document.querySelectorAll('.listen-item[aria-label="false"]');
    const performer_items = document.querySelectorAll('.listen-item[aria-label="true"]');
    const listen_container = document.querySelector('.listen-items');

    listen_container.classList.add("transition-fade");
    setTimeout(() => {
        listen_container.classList.remove("transition-fade");
        console.log("Transition fade ended");
    }, 1000);

    setTimeout(() => {
        console.log("Setting updated to:", settings[setting].name);
        if (setting === 0) {
            arr_add_class(performer_items, "temporary-toggle");
            arr_remove_class(composer_items, "temporary-toggle");
            performer_items.forEach(item => {
                item.style.transform = 'translateY(-2.5rem)';
            });
            
        } else if (setting === 2) {
            arr_add_class(composer_items, "temporary-toggle");
            arr_remove_class(performer_items, "temporary-toggle");
            performer_items.forEach(item => {
                item.style.transform = 'translateY(0rem)';
            });
        } else if (setting === 1) {
            arr_remove_class(performer_items, "temporary-toggle");
            arr_remove_class(composer_items, "temporary-toggle");
            performer_items.forEach(item => {
                item.style.transform = 'translateY(-2.5rem)';
            });
        }
        
        if (setting === 0 || setting === 1) {
            if (get_client_width() <= 693) {
                composer_items[0].style.transform = 'translateY(0rem)';
            }
        }

    }, 500);

    const position = toggle.querySelector('.position');
    const old_text = position.textContent;
    const new_text = settings[setting].name;
    toggle.setAttribute("data-setting", setting);
    position.textContent = new_text;
    position.setAttribute("style", settings[setting].style);
    typewriter_transition(position, old_text, new_text, 50);

    console.timeEnd("update_toggle");
}

function composer_performer_logic() {
    let page_suffix = window.location.href.split('#')[1];
    console.log("Page suffix detected:", page_suffix);

    const toggle = document.querySelector('.toggle');

    Array.from(toggle.children).forEach(function(button, index) {
        button.addEventListener("click", () => {
            console.log("Toggle clicked:", settings[index].name);
            update_toggle(toggle, index);
        });
    });

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
    console.log("Loading container hidden due to lazy loading");
}

// Function to start loading process
async function start_loading_process() {
    // Array to track all tasks for loading percentage
    const tasks = [];

    // Task: Fetch data and process items
    const data_task = fetch_data("Listen").then(data => {
        if (!data) {
            console.log("No data received from fetch");
            return;
        }

        console.log("Data fetched successfully:", data);
        const iframes = [];
        let loaded_iframes = 0;

        const non_performers = data.filter(item => item.is_performer === "FALSE");
        const performers = data.filter(item => item.is_performer === "TRUE");

        console.log("Non-performers and performers separated:", {non_performers, performers});

        const formatted_data = [...non_performers, ...performers];

        formatted_data.forEach(item => {
            console.log("Processing item:", item);
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
                        // Add iframe load task to tasks array
                        tasks.push(new Promise(resolve => {
                            iframe.onload = () => {
                                console.log("Iframe loaded:", iframe);
                                update_loading_percentage();
                                resolve();
                            };
                            iframe.onerror = () => {
                                console.error("Error loading iframe:", iframe);
                                update_loading_percentage();
                                resolve(); // Continue even if iframe fails to load
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

        // Initialize composer/performer logic after data is processed
        composer_performer_logic();
    });

    tasks.push(data_task);

    // Task: Load non-iframe processes (e.g., images, styles)
    tasks.push(new Promise(resolve => {
        console.log("Loading non-iframe processes...");
        setTimeout(() => {
            console.log("Non-iframe processes loaded.");
            update_loading_percentage();
            resolve();
        }, 500); // Simulated delay
    }));

    // Start loading processes
    if (!lazy_loading) {
        loading_container.classList.remove('hidden');
        console.log("Loading container shown");
    }

    // Total tasks for percentage calculation
    let total_tasks = tasks.length;
    let completed_tasks = 0;

    function update_loading_percentage() {
        completed_tasks++;
        const percentage = Math.floor((completed_tasks / total_tasks) * 100);
        console.log(`Updating percentage to: ${percentage}`);
        loading_percentage_span.textContent = `${percentage}%`;

        if (percentage >= 100 && !lazy_loading) {
            hide_loading_container();
        }
    }

    function hide_loading_container() {
        loading_container.style.transition = 'transform 0.5s ease-in-out';
        loading_container.style.transform = 'translateY(-100%)'; // Slide up effect
        loading_container.addEventListener('transitionend', () => {
            loading_container.style.display = 'none'; // Hide after animation
            console.log('Loading container hidden.');
        });
    }

    // Wait for all tasks to complete
    await Promise.all(tasks);
    console.log('All tasks completed.');
}

// Start the loading process
start_loading_process();