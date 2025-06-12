"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector("#hamburger");
    const menuList = document.querySelector("#list");
    const form = document.querySelector("#subscribe-form");
    const subscribe = document.querySelector("#subscribe-btn");
    const CTA_BTN = document.querySelectorAll(".cta_btn");
    const subscribeModal = document.querySelector("#subscribe-container");
    const overlay = document.querySelector(".overlay");
    // Footer form elements
    const footerForm = document.querySelector("#email-waitlist-form");
    const footerEmailInput = document.querySelector(".inline-email-input");
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
    // API submission function (shared between modal and footer forms)  
    const submitEmailToAPI = async (email, messageElement = null, isFooterForm = false) => {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (messageElement) {
                messageElement.textContent = "Please enter a valid email address";
                messageElement.style.color = "#ef4444";
            }
            else if (isFooterForm) {
                showFooterMessage("Please enter a valid email address", 'error');
            }
            return false;
        }
        // Show loading state
        if (messageElement) {
            messageElement.textContent = "Subscribing...";
            messageElement.style.color = "#666";
        }
        else if (isFooterForm) {
            showFooterMessage("Adding you to our waitlist...", 'loading');
        }
        try {
            console.log("Making request to:", "https://pathway-ai-landing-page.onrender.com");
            const response = await fetch("https://pathway-ai-landing-page.onrender.com/api/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
                mode: 'cors',
                credentials: 'include'
            });
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            if (response.ok) {
                if (messageElement) {
                    messageElement.textContent = data.message || "Successfully subscribed!";
                    messageElement.style.color = "#22c55e"; // Success green
                }
                else if (isFooterForm) {
                    showFooterMessage("🎉 Welcome to the waitlist! You'll be the first to know when Pathway AI launches.", 'success');
                }
                return true;
            }
            else {
                if (messageElement) {
                    // Handle "already subscribed" case differently
                    if (response.status === 409 && data.alreadySubscribed) {
                        messageElement.textContent = data.message || "This email is already subscribed!";
                        messageElement.style.color = "#f59e0b"; // Warning orange
                    }
                    else {
                        messageElement.textContent = data.message || "Subscription failed.";
                        messageElement.style.color = "#ef4444"; // Error red
                    }
                }
                else if (isFooterForm) {
                    if (response.status === 409 && data.alreadySubscribed) {
                        showFooterMessage("You're already on our waitlist! We'll be in touch soon.", 'success');
                        return true; // Treat as success for footer form
                    }
                    else {
                        showFooterMessage(data.message || "Subscription failed. Please try again.", 'error');
                    }
                }
                return response.status === 409 && data.alreadySubscribed;
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
            if (messageElement) {
                messageElement.textContent = errorMessage;
                messageElement.style.color = "#ef4444"; // Error red
            }
            else if (isFooterForm) {
                showFooterMessage(errorMessage, 'error');
            }
            return false;
        }
    };
    // Modal form submission handler
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Modal form submitted!"); // Debug log
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
        const success = await submitEmailToAPI(email, message);
        if (success) {
            emailInput.value = "";
            setTimeout(() => {
                closeModal();
            }, 2000);
        }
    };
    // Create and manage footer message element
    const createFooterMessage = () => {
        let messageEl = document.querySelector("#footer-message");
        if (!messageEl) {
            messageEl = document.createElement("p");
            messageEl.id = "footer-message";
            messageEl.className = "footer-message";
            messageEl.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                text-align: center;
                transition: all 0.3s ease;
                opacity: 0;
                transform: translateY(-10px);
            `;
            // Insert after the form
            footerForm?.parentNode?.insertBefore(messageEl, footerForm.nextSibling);
        }
        return messageEl;
    };
    const showFooterMessage = (message, type) => {
        const messageEl = createFooterMessage();
        // Set colors based on type
        const colors = {
            success: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
            error: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
            loading: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' }
        };
        const color = colors[type];
        messageEl.style.backgroundColor = color.bg;
        messageEl.style.color = color.text;
        messageEl.style.border = `1px solid ${color.border}`;
        messageEl.textContent = message;
        // Animate in
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        });
        // Auto-hide after delay (except for errors)
        if (type !== 'error') {
            setTimeout(() => {
                messageEl.style.opacity = '0';
                messageEl.style.transform = 'translateY(-10px)';
            }, type === 'success' ? 4000 : 3000);
        }
    };
    // Footer form submission handler
    const handleFooterFormSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Footer form submitted!"); // Debug log
        if (!footerEmailInput) {
            console.error("Footer email input not found");
            return;
        }
        const email = footerEmailInput.value.trim();
        if (!email) {
            showFooterMessage("Please enter an email address", 'error');
            return;
        }
        // Show loading message
        showFooterMessage("Adding you to our waitlist...", 'loading');
        const success = await submitEmailToAPI(email, null, true);
        if (success) {
            footerEmailInput.value = "";
        }
    };
    // Handle button click directly (backup for modal)
    const handleButtonClick = (e) => {
        e.preventDefault();
        console.log("Modal button clicked directly!"); // Debug log
        handleFormSubmit(e);
    };
    // Event listeners for modal form
    form?.addEventListener("submit", handleFormSubmit);
    subscribe?.addEventListener("click", handleButtonClick);
    // Event listener for footer form
    footerForm?.addEventListener("submit", handleFooterFormSubmit);
    // CTA buttons to open modal - but exclude the footer form button
    CTA_BTN.forEach(item => {
        // Check if this button is NOT part of the footer form
        if (!footerForm?.contains(item)) {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                openModal();
            });
        }
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
    const handleNavItemClick = (e) => {
        const target = e.target;
        if (target.classList.contains('list_item')) {
            const text = target.textContent?.toLowerCase();
            let targetSection = null;
            if (text === 'problem') {
                targetSection = document.querySelector('.why-section--problem');
            }
            else if (text === 'how it works') {
                targetSection = document.querySelector('.works-section__header');
            }
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (menuList?.classList.contains('open')) {
                    menuList.classList.remove('open');
                    hamburgerMenu?.classList.remove('open');
                }
            }
        }
    };
    hamburgerMenu?.addEventListener("click", toggleMenu);
    menuList?.addEventListener("click", handleNavItemClick);
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
