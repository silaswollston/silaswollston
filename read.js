const book_container = document.querySelector('.book-container');

function generate_book(obj, text_image=obj.text_image, text_name=obj.text_name, text_description=obj.text_description, text_extra=obj.text_extra, text_published=obj.text_published) {
    const book = create_element("div", "book");
        const cover = create_element("div", "book-cover");
        cover.style.backgroundImage = `url(./assets/read/${text_image})`;
        const container = create_element("div", "container");
            const title = create_element("h2", "text-name");
            title.textContent = text_name;
            const date = create_element("span", "text-date");
            date.textContent = text_published;
            const description = create_element("p", "text-description");
            description.innerHTML = itallics(text_description);
            const button = create_element("button", "continue-reading, standard-outline");
            button.textContent = "Read More";
            button.addEventListener("click", () => {
                update_read_panel(obj, read_panel);
                read_panel.style.opacity = '1';
                setTimeout(() => {
                    read_panel.classList.remove("minimised")
                    if(read_panel.offsetHeight > (document.body.offsetHeight - 100)) {
                        document.body.style.overflowY = "hidden";
                    }
                }, 250);
            })
        append_children(container, [title, date, description, button]);
    append_children(book, [cover, container]);

    return book;
}

function generate_read_panel() {
    const panel = create_element("div", "read-panel, standard-outline, minimised");
        const background_image = create_element("div", "backdrop");
        const title = create_element("span", "text-title, text-name");
        const text_abstract = create_element("div", "text-abstract, scroll-container");
        const mobile_exit = create_element("img", "exit");
        mobile_exit.src = "./assets/exit.svg";

        mobile_exit.addEventListener("click", () => {
            panel.classList.add("minimised");
            document.body.style.overflowY = "auto";
        })

    append_children(panel, [background_image, title, text_abstract, mobile_exit]);
    panel.style.opacity = '0';
    return panel;
}

const read_panel = generate_read_panel();
document.body.appendChild(read_panel);

function update_read_panel(current_obj, read_panel) {
    try{read_panel.querySelector(".read-in-website").remove();} catch(err) {}
    read_panel.querySelector(".backdrop").style.backgroundImage = `url(./assets/read/${current_obj.text_image})`;
    read_panel.querySelector(".text-title").textContent = current_obj.text_name;

    let pars = current_obj.text_extra.split('\n');
    const abstract_container = read_panel.querySelector(".text-abstract");
    abstract_container.innerHTML = '';
    pars.forEach( function(par, index) {
        if(par != "") {
            let new_par = create_element("p");
            new_par.innerHTML = create_anchor_tags(itallics(par));
            abstract_container.appendChild(new_par);
        }
    })

    if(current_obj.text_source != null) {
        const read_in_website = create_element("a", "read-in-website, continue-reading, standard-outline");
        read_in_website.textContent = "Link to Full Article";
        read_in_website.setAttribute("noopener", true);
        read_in_website.setAttribute("nonreferrer", true);
        read_in_website.setAttribute("target", "_blank");
        read_in_website.href = current_obj.text_source;

        read_panel.appendChild(read_in_website);
    }


    document.body.addEventListener("DOMContentLoaded", generate_scroll_bar(abstract_container));
}

fetch_data("Read").then(data => {
    let filler_text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ultrices, sapien ut iaculis rutrum, enim orci suscipit augue, sed maximus nulla risus vel urna. Nam et lacus quis ante blandit pellentesque sit amet eget purus. Proin egestas iaculis velit, a eleifend leo rutrum in. Phasellus eget fermentum justo. In hac habitasse platea dictumst. Fusce molestie urna a mauris tempor, quis egestas magna cursus. Morbi elementum pellentesque lacus id feugiat. Ut hendrerit, metus ut sodales tempus, nibh leo rhoncus arcu, a ultrices mauris lacus non lorem. Integer in lorem pretium libero porttitor ornare.
    
    Fusce sollicitudin mauris nisl, nec blandit leo rhoncus sed. Quisque feugiat augue eget varius tristique. Sed quis nisi sagittis, porta dui a, sodales nisi. Phasellus accumsan diam a velit fermentum, ac egestas velit aliquam. Sed mi neque, suscipit id ante nec, molestie lacinia ligula. Suspendisse augue ante, pharetra vel tempus in, ultricies ac metus. Interdum et malesuada fames ac ante ipsum primis in faucibus. Ut semper congue purus, ac sodales tellus consectetur id. Sed tincidunt accumsan libero, in feugiat massa ornare ac. Phasellus vitae nunc ut ipsum aliquam pellentesque.
    
    Etiam massa sapien, fringilla iaculis odio non, imperdiet cursus ipsum. Nullam sed orci eget nisl consequat bibendum. Proin aliquet mauris et maximus commodo. Nullam non est velit. Sed augue massa, vestibulum ut lectus sit amet, luctus cursus elit. Vivamus auctor dui erat, vel volutpat nunc laoreet id. Quisque ultrices dignissim metus ac rutrum. Ut consectetur quam ut egestas consectetur.
    
    Morbi sed libero nibh. Mauris tempus tellus et purus aliquam, et tincidunt velit tempus. Suspendisse maximus nisi vitae bibendum rhoncus. Vivamus vitae blandit libero. Donec efficitur tempus diam, in lobortis nulla rhoncus eu. Vivamus feugiat tempor sem et laoreet. Nam sit amet nunc leo. Fusce lacinia purus sit amet libero fringilla, in vulputate purus tempus. Etiam suscipit massa sed metus auctor pulvinar. Integer in turpis hendrerit, malesuada velit vitae, imperdiet nulla. Phasellus vitae sem a justo euismod sodales. Ut rhoncus tortor ut tristique sollicitudin. Donec finibus nec mi at semper.`
    const formatted_data = data
    .map(book => ({ ...book, text_extra: book.text_extra ?? filler_text }))
    .sort((a, b) => a.book_order - b.book_order);

    update_read_panel(formatted_data[0], read_panel);
    let overlap = get_client_width() - read_panel.offsetWidth - book_container.offsetWidth - 750 ;
    if(overlap < 20) {
        read_panel.classList.add("mobile");
    }

    formatted_data.forEach(book => {
        book_container.appendChild(generate_book(book))
    })
})

