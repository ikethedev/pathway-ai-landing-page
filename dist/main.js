"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector("#hamburger");
    const menuList = document.querySelector("#list");
    const form = document.querySelector("#subscribe-form");
    const subscribe = document.querySelector("#subscribe-btn");
    const CTA_BTN = document.querySelectorAll(".cta_btn");
    const subscribeModal = document.querySelector("#subscribe-container");
    const overlay = document.querySelector(".overlay");
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
    // Function to open modal
    const openModal = () => {
        subscribeModal?.classList.remove("hidden");
        document.body.classList.add("modal-open");
    };
    // Function to close modal
    const closeModal = () => {
        subscribeModal?.classList.add("hidden");
        document.body.classList.remove("modal-open");
        // Clear form and response message
        const emailInput = document.querySelector("#email");
        const message = document.querySelector("#response-message");
        if (emailInput)
            emailInput.value = "";
        if (message)
            message.textContent = "";
    };
    // Form submission handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Form submitted!"); // Debug log
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
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (message)
                message.textContent = "Please enter a valid email address";
            return;
        }
        // Show loading state
        if (message) {
            message.textContent = "Subscribing...";
            message.style.color = "#666";
        }
        try {
            console.log("Making request to:", "https://pathway-ai-landing-page.onrender.com");
            const response = await fetch("https://pathway-ai-landing-page.onrender.com/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
                // Add these for better CORS handling
                mode: 'cors',
                credentials: 'include'
            });
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);
            const data = await response.json();
            console.log("Response data:", data);
            if (response.ok) {
                if (message) {
                    message.textContent = data.message || "Successfully subscribed!";
                    message.style.color = "#22c55e"; // Success green
                }
                emailInput.value = "";
                setTimeout(() => {
                    closeModal();
                }, 2000);
            }
            else {
                if (message) {
                    // Handle "already subscribed" case differently
                    if (response.status === 409 && data.alreadySubscribed) {
                        message.textContent = data.message || "This email is already subscribed!";
                        message.style.color = "#f59e0b"; // Warning orange
                        // Close modal after showing message for already subscribed
                        setTimeout(() => {
                            closeModal();
                        }, 2500);
                    }
                    else {
                        message.textContent = data.message || "Subscription failed.";
                        message.style.color = "#ef4444"; // Error red
                    }
                }
            }
        }
        catch (error) {
            console.error("Fetch error:", error);
            let errorMessage = "Something went wrong. Please try again.";
            if (error instanceof TypeError) {
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = "Network error. Please check your connection.";
                }
                else if (error.message.includes('CORS')) {
                    errorMessage = "Connection issue. Please try again.";
                }
            }
            if (message) {
                message.textContent = errorMessage;
                message.style.color = "#ef4444"; // Error red
            }
        }
    };
    // Handle button click directly (backup)
    const handleButtonClick = (e) => {
        e.preventDefault();
        console.log("Button clicked directly!"); // Debug log
        handleFormSubmit(e);
    };
    // Event listeners - Add multiple ways to handle the submission
    form?.addEventListener("submit", handleFormSubmit);
    // Also add click listener directly to the submit button as backup
    subscribe?.addEventListener("click", handleButtonClick);
    // CTA buttons to open modal
    CTA_BTN.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            openModal();
        });
    });
    // Close modal when clicking overlay (but NOT the form container)
    overlay?.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    });
    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !subscribeModal?.classList.contains("hidden")) {
            closeModal();
        }
    });
    hamburgerMenu?.addEventListener("click", toggleMenu);
    menuList?.addEventListener("click", () => {
        console.log("Menu clicked");
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
    // Debug: Check if elements exist
    console.log("Form element:", form);
    console.log("Submit button:", subscribe);
    console.log("Modal container:", subscribeModal);
    // Test CORS endpoint
    const testCORS = async () => {
        try {
            const response = await fetch("https://pathway-ai-landing-page.onrender.com/api/test", {
                method: "GET",
                mode: 'cors'
            });
            const data = await response.json();
            console.log("CORS test successful:", data);
        }
        catch (error) {
            console.error("CORS test failed:", error);
        }
    };
    // Run CORS test after a short delay
    setTimeout(testCORS, 1000);
});
