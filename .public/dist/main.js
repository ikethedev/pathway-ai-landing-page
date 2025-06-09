"use strict";
const hamburgerMenu = document.querySelector("#hamburger");
const menuList = document.querySelector("#list");
const form = document.querySelector("#subscribe-form");
const toggleMenu = () => {
    menuList?.classList.toggle("open");
    hamburgerMenu?.classList.toggle("open");
};
const closeMenuOnOutSideClick = (e) => {
    if (!e.target || !(e.target instanceof Element)) {
        return;
    }
    if (!menuList?.contains(e.target) && !hamburgerMenu?.contains(e.target)) {
        if (menuList?.classList.contains("open")) {
            menuList?.classList.remove("open");
            hamburgerMenu?.classList.remove("open");
        }
    }
};
const disableTransitions = () => {
    menuList?.classList.add("no-transitions");
};
const enableTransition = () => {
    menuList?.classList.remove("no-transitions");
};
// Form submission handler
const handleFormSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Form submit handler called");
    const emailInput = document.querySelector("#email");
    const message = document.querySelector("#response-message");
    if (!emailInput) {
        console.error("Email input not found");
        if (message)
            message.textContent = "Email input not found";
        return;
    }
    const email = emailInput.value.trim();
    if (!email) {
        if (message)
            message.textContent = "Please enter an email address";
        return;
    }
    // Show loading state
    if (message)
        message.textContent = "Subscribing...";
    try {
        const response = await fetch("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
            if (message)
                message.textContent = data.message || "Successfully subscribed!";
            emailInput.value = ""; // Clear the form
        }
        else {
            if (message)
                message.textContent = data.message || "Subscription failed.";
        }
    }
    catch (error) {
        console.error("Fetch error:", error);
        if (message)
            message.textContent = "Something went wrong. Please try again.";
    }
};
// Event listeners
// Remove the alert and use the dedicated handler
form?.addEventListener("submit", handleFormSubmit);
hamburgerMenu?.addEventListener("click", toggleMenu);
menuList?.addEventListener("click", () => {
    console.log("Menu clicked"); // Changed from alert to console.log
});
document?.addEventListener("click", closeMenuOnOutSideClick);
window?.addEventListener("resize", () => {
    disableTransitions();
    if (window.innerWidth > 768) {
        menuList?.classList.remove("open");
        hamburgerMenu?.classList.remove("open");
    }
    setTimeout(() => {
        enableTransition();
    }, 250);
});
