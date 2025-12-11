// script.js — FIXED & OPTIMIZED
document.addEventListener('DOMContentLoaded', function () {
    // === ELEMENTS ===
    const loader = document.getElementById('loader');
    const mainContent = document.getElementById('main-content');
    const scrollBtn = document.getElementById('scrollToTopButton');
    const form = document.getElementById('signup-form');
    const nameInput = document.getElementById('textarea');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    // === 1. FORM VALIDATION ===
    if (form) {
        form.addEventListener('submit', function (event) {
            let isValid = true;

            if (nameInput && nameInput.value.trim() === '') {
                isValid = false;
                alert('You did not type anything in the comment section area! Please Try Typing Something.');
            }

            if (emailInput && emailInput.value.trim() === '') {
                isValid = false;
                if (emailError) emailError.textContent = 'Please enter your email.';
            } else {
                if (emailError) emailError.textContent = '';
            }

            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    // === 2. SCROLL TO TOP BUTTON ===
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.pointerEvents = 'auto';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.pointerEvents = 'none';
            }
        });
    }

    // === 3. LOADER LOGIC (First visit = 5s, Return = instant) ===
    if (loader && mainContent) {
        if (!localStorage.getItem('visitedBefore')) {
            // First visit: show loader for 5 seconds
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    mainContent.style.display = 'block';
                }, 300); // fade out
                localStorage.setItem('visitedBefore', 'true');
            }, 5000);
        } else {
            // Return visitor: skip loader
            loader.style.display = 'none';
            mainContent.style.display = 'block';
        }
    }

    // === 4. RESPONSIVE BACKGROUND IMAGE ===
    function setBackgroundImage() {
        const screenWidth = window.innerWidth;
        let imgSrc = '';

        if (screenWidth >= 1025) {
            imgSrc = '../images/wave for pc.webp';
        } else if (screenWidth <= 1024 && screenWidth > 480) {
            imgSrc = '../images/wave for tablet.webp';
        } else if (screenWidth <= 480) {
            imgSrc = '../images/wave for phone.jpg';
        }

        const img = new Image();
        img.onload = () => {
            document.documentElement.style.backgroundImage = `url('${imgSrc}')`;
            document.documentElement.style.backgroundSize = 'cover';
            document.documentElement.style.backgroundPosition = 'center';
            document.documentElement.style.backgroundAttachment = 'fixed';
        };
        img.onerror = () => {
            console.error('Background image failed to load:', imgSrc);
            document.documentElement.style.backgroundColor = '#000';
        };
        img.src = imgSrc;
    }

    // Run once on load
    setBackgroundImage();

    // Update on resize
    window.addEventListener('resize', setBackgroundImage);

    // === 5. MOBILE TOO SMALL? ===
    if (window.innerWidth < 360) {
        document.body.innerHTML = `
            <p style="color:#fff; text-align:center; padding:2rem; font-family:system-ui;">
                <strong>Device Not Supported</strong><br>
                Please use a device with a bigger screen.
            </p>`;
    }
});