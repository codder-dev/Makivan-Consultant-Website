document.addEventListener("DOMContentLoaded", () => {
    function trackEvent(name, data = {}) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: name, ...data });
    }

    const navToggle = document.getElementById("hamburger");
    const navMenu = document.getElementById("navmenu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("active");
            navToggle.classList.toggle("active", isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                navToggle.classList.remove("active");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    const backToTop = document.getElementById("backToTop");
    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.classList.toggle("show", window.scrollY > 650);
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const whatsappButton = document.getElementById("whatsappLiveChatBtn");
    if (whatsappButton) {
        const phone = "254718950180";
        const message = "Hello Makivan Consultants. I need assistance with your services.";
        whatsappButton.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        whatsappButton.addEventListener("click", () => trackEvent("whatsapp_click", { location: "floating_button" }));
    }

    document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
        link.addEventListener("click", () => trackEvent("phone_click", { phone: link.getAttribute("href") }));
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
        link.addEventListener("click", () => trackEvent("email_click", { email: link.getAttribute("href") }));
    });

    document.querySelectorAll(".btn").forEach((button) => {
        button.addEventListener("click", () => trackEvent("cta_click", { label: button.textContent.trim(), href: button.getAttribute("href") || "" }));
    });

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (slides.length && dots.length) {
        let currentSlide = 0;
        let carouselTimer;

        function showSlide(index) {
            currentSlide = index;
            slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
            dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
        }

        function nextSlide() {
            showSlide((currentSlide + 1) % slides.length);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                showSlide(index);
                trackEvent("hero_carousel_click", { slide: index + 1 });
                if (!reduceMotion) {
                    clearInterval(carouselTimer);
                    carouselTimer = setInterval(nextSlide, 5200);
                }
            });
        });

        if (!reduceMotion) {
            carouselTimer = setInterval(nextSlide, 5200);
        }
    }

    const form = document.getElementById("contactForm");
    if (!form) return;

    const messageBox = document.getElementById("messageBox");
    const fields = {
        name: document.getElementById("name"),
        email: document.getElementById("email"),
        phone: document.getElementById("phone"),
        service: document.getElementById("service"),
        message: document.getElementById("message")
    };

    const errors = {
        name: document.getElementById("nameError"),
        email: document.getElementById("emailError"),
        phone: document.getElementById("phoneError"),
        service: document.getElementById("serviceError"),
        message: document.getElementById("messageError")
    };

    const validators = {
        name: (value) => value.trim().length >= 2 || "Please enter your full name.",
        email: (value) => /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(value.trim()) || "Please enter a valid email address.",
        phone: (value) => /^(0[17]\d{8}|254[17]\d{8}|\+254[17]\d{8})$/.test(value.replace(/[\s()-]/g, "")) || "Use a valid Kenyan phone number.",
        service: (value) => value.trim() !== "" || "Please select a service.",
        message: (value) => value.trim().length >= 10 || "Please write at least 10 characters."
    };

    function setError(key, message) {
        if (errors[key]) errors[key].textContent = typeof message === "string" ? message : "";
        if (fields[key]) {
            fields[key].style.borderColor = typeof message === "string" ? "#b3261e" : "#1e7668";
        }
    }

    function validateField(key) {
        const result = validators[key](fields[key].value);
        setError(key, result);
        return result === true;
    }

    Object.keys(fields).forEach((key) => {
        fields[key].addEventListener(key === "service" ? "change" : "input", () => validateField(key));
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const isValid = Object.keys(fields).every(validateField);

        if (!messageBox) return;

        if (isValid) {
            messageBox.className = "message-box success";
            const subject = encodeURIComponent(`Consultation request: ${fields.service.value}`);
            const body = encodeURIComponent(
                `Name: ${fields.name.value}\nEmail: ${fields.email.value}\nPhone: ${fields.phone.value}\nService: ${fields.service.value}\n\nMessage:\n${fields.message.value}`
            );
            const mailto = `mailto:info@makivanconsultants.co.ke?subject=${subject}&body=${body}`;
            messageBox.innerHTML = `Thank you. Your message is ready. <a href="${mailto}">Click here to send it by email</a>, or use the WhatsApp live chat button for faster support.`;
            trackEvent("contact_form_valid", { service: fields.service.value });
            form.reset();
            Object.keys(fields).forEach((key) => {
                fields[key].style.borderColor = "";
                if (errors[key]) errors[key].textContent = "";
            });
        } else {
            messageBox.className = "message-box warning";
            messageBox.textContent = "Please complete the highlighted fields before sending.";
        }
    });
});
