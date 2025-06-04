const hamburgerMenu = document.querySelector("#hamburger")
const menuList = document.querySelector("#list")

const toggleMenu = () => {
    menuList?.classList.toggle("open")
    hamburgerMenu?.classList.toggle("open")  
}

const closeMenuOnOutSideClick = (e: MouseEvent) => {
    if (!e.target || !(e.target instanceof Element)) {
        return;
    }
    
    if (!menuList?.contains(e.target) && !hamburgerMenu?.contains(e.target)) {
        if(menuList?.classList.contains("open")){
            menuList?.classList.remove("open") // Fixed: was "remove"
            hamburgerMenu?.classList.remove("open") // Also close hamburger animation
        }
    }
}

const disableTransitions = () => {
    menuList?.classList.add("no-transitions")
}

const enableTransition = () => {
    menuList?.classList.remove("no-transitions")
}

// event listeners
hamburgerMenu?.addEventListener("click", toggleMenu)

menuList?.addEventListener("click", () => {
    alert("hello")
})
document?.addEventListener("click", closeMenuOnOutSideClick)

window?.addEventListener("resize", () => {
    disableTransitions()
    
    if (window.innerWidth > 768) {
        menuList?.classList.remove("open");
        hamburgerMenu?.classList.remove("open");
    }

    setTimeout(() => {
        enableTransition()
    }, 250)
})



