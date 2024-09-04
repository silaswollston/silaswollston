fetch_data("About").then(data => {  
    const selected_works_container = document.querySelector('.selected-works-container');
    const works_container = document.querySelector('.info-container:nth-child(2)')
    const biography_buttons = document.querySelectorAll('.biography-specials > button');
    const biography_par = document.querySelector('p.biography-text');

    data.forEach( function(biography_obj, index) {
        biography_buttons[index].textContent = biography_obj.biography_type;
        biography_buttons[index].ariaLabel = index;
    })
    biography_par.innerHTML = data[0].biography_text;

    biography_buttons.forEach(button => {
        button.addEventListener("click", () => {
            biography_par.scrollTop = '0';
            const biography_obj = data[String(button.ariaLabel)];
            biography_par.innerHTML = biography_obj.biography_text;
        })
    })
})  


if(get_client_width() > 700) {
    copy_text(".copy-text")
}

function work_list() {
    fetch('./website_struct.md')
    .then(data => {
        return data.text();
    })
    .then(text => {
        const output = markdown_to_json(text);
        output.forEach(page => {
            if(page.page === "About") {
                let selected_works_arr = (page.content[0].data).split("-");
                selected_works_arr.forEach (function(el, index) {
                    selected_works_arr[index] = el.replace("###", "").replace("\n", "");
                })
                
                selected_works_arr.forEach(work => {
                    const work_arr = work.split(",");
                    if(work_arr.length >= 2) {
                        const title_text = work_arr[0];
                        const year_text = work_arr[1];
                        const info_text = work_arr[2];
    
                        const work_item = create_element("div", "work-item");
                            const title = create_element("h3", "work-title");
                            title.innerHTML = `${title_text} <span>${year_text}</span>`;
                            const info = create_element("h3", "work-info");
                            info.textContent = info_text;
    
                        append_children(work_item, [title, info]);
                        selected_works_container.appendChild(work_item)
                    }

                })
            }
        })
    })
}
