function innerCSS(css) {
    let styles = css.match(/{([^}]+)}/g);
    let styles_format = []; let bracket_indices = []; let element_array = [];
    let css_format = '';
    for(let i = 0; i<css.length; i++) {
        if([' ', '\n'].includes(css[i]) == false) {
            css_format+=css[i]
        }
    }
    bracket_indices = [...css_format].map((char, index) => {if (char === '{') {return index;} else {return null;}}).filter(index => index !== null);

    for(let i = 0; i<bracket_indices.length; i++) {
        let n = 1; 
        let element = '';
        let element_format = '';
        let start_search = bracket_indices[i];
        while(css_format[start_search - n] !== '}' && start_search - n >= 0) {
            let char = String(css_format[start_search - n]);
            element+=char
            n++
        }
        for(let i = 1; i<=element.length; i++) {
            let char = element[element.length - i];
            element_format+=char
        }
        element_array.push(element_format)
    }

    styles.forEach(style => {
        let new_style = ''
        for(let i = 0; i<style.length; i++) {
            if([' ', '\n', '{', '}'].includes(style[i]) === false) {
                new_style += style[i]
            }
        }
        styles_format.push(new_style)
    })

    element_array.forEach(function(el, index) {
        let items = document.querySelectorAll(el);
        items.forEach(item => {
            item.style.cssText += styles_format[index]
        })
    })
}
    

