const events_container = document.querySelector(".events-container");
const performances = document.querySelector(".performances");
const portrait = document.querySelector(".portrait")
events_container.style.setProperty("--container-height", events_container.offsetHeight + "px");
document.querySelector(".recording").style.setProperty("--margin-top", 
    -1 * ((performances.offsetTop + performances.offsetHeight) - (portrait.offsetTop + portrait.offsetHeight)) + "px"
)