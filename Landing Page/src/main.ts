console.log("Hello, TypeScript!");
// show menu
const hamburgerMenu = document.querySelector("#hamburger")

const toggleMenu = () => {
   const menuItems = document.querySelectorAll(".hamburger__line")
   menuItems.forEach(item => item.classList.toggle("open"))

}

hamburgerMenu?.addEventListener("click", toggleMenu)

