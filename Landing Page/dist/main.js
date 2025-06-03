"use strict";
console.log("Hello, TypeScript!");
// show menu
const hamburgerMenu = document.querySelector("#hamburger");

const toggleMenu = () => {
    document.querySelector("#hamburger").classList.toggle("open");
};

hamburgerMenu === null || hamburgerMenu === void 0 ? void 0 : hamburgerMenu.addEventListener("click", toggleMenu);
