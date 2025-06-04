"use strict";
const hamburgerMenu = document.querySelector("#hamburger");
const menuList = document.querySelector("#list");
const toggleMenu = () => {
    menuList === null || menuList === void 0 ? void 0 : menuList.classList.toggle("open");
    hamburgerMenu === null || hamburgerMenu === void 0 ? void 0 : hamburgerMenu.classList.toggle("open");
};
const closeMenuOnOutSideClick = (e) => {
    if (!e.target || !(e.target instanceof Element)) {
        return;
    }
    if (!(menuList === null || menuList === void 0 ? void 0 : menuList.contains(e.target)) && !(hamburgerMenu === null || hamburgerMenu === void 0 ? void 0 : hamburgerMenu.contains(e.target))) {
        if (menuList === null || menuList === void 0 ? void 0 : menuList.classList.contains("open")) {
            menuList === null || menuList === void 0 ? void 0 : menuList.classList.remove("open"); // Fixed: was "remove"
            hamburgerMenu === null || hamburgerMenu === void 0 ? void 0 : hamburgerMenu.classList.remove("open"); // Also close hamburger animation
        }
    }
};
const disableTransitions = () => {
    menuList === null || menuList === void 0 ? void 0 : menuList.classList.add("no-transitions");
};
const enableTransition = () => {
    menuList === null || menuList === void 0 ? void 0 : menuList.classList.remove("no-transitions");
};
// event listeners
hamburgerMenu === null || hamburgerMenu === void 0 ? void 0 : hamburgerMenu.addEventListener("click", toggleMenu);
menuList === null || menuList === void 0 ? void 0 : menuList.addEventListener("click", () => {
    alert("hello");
});
document === null || document === void 0 ? void 0 : document.addEventListener("click", closeMenuOnOutSideClick);
window === null || window === void 0 ? void 0 : window.addEventListener("resize", () => {
    disableTransitions();
    if (window.innerWidth > 768) {
        menuList === null || menuList === void 0 ? void 0 : menuList.classList.remove("open");
        hamburgerMenu === null || hamburgerMenu === void 0 ? void 0 : hamburgerMenu.classList.remove("open");
    }
    setTimeout(() => {
        enableTransition();
    }, 250);
});
