// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Certificate carousel elements
const slides = document.querySelectorAll('.certificate-slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// Contact form element
const contactForm = document.querySelector('.contact-form form');

// Current slide index
let currentSlide = 0;

// Responsive breakpoints
const breakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1440
};

// Current screen size
let currentScreenSize = getCurrentScreenSize();

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCarousel();
    initializeContactForm();
    initializeSmoothScrolling();
    initializeScrollAnimations();
    initializeResponsiveFeatures();
    handleOrientationChange();
});

// Get current screen size
function getCurrentScreenSize() {
    const width = window.innerWidth;
    if (width <= breakpoints.mobile) return 'mobile';
    if (width <= breakpoints.tablet) return 'tablet';
    if (width <= breakpoints.desktop) return 'desktop';
    return 'largeDesktop';
}

// Navigation Functions
function initializeNavigation() {
    // Mobile menu toggle
    hamburger?.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (hamburger && navMenu && 
            !hamburger.contains(e.target) && 
            !navMenu.contains(e.target) && 
            navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Handle escape key for mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
    
    // Animate hamburger bars
    const bars = hamburger.querySelectorAll('.bar');
    if (hamburger.classList.contains('active')) {
        bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
    } else {
        bars[0].style.transform = 'rotate(0) translate(0, 0)';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'rotate(0) translate(0, 0)';
    }
}

function closeMobileMenu() {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset hamburger bars
    const bars = hamburger?.querySelectorAll('.bar');
    if (bars) {
        bars[0].style.transform = 'rotate(0) translate(0, 0)';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'rotate(0) translate(0, 0)';
    }
}

// Responsive Features
function initializeResponsiveFeatures() {
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const newScreenSize = getCurrentScreenSize();
            if (newScreenSize !== currentScreenSize) {
                currentScreenSize = newScreenSize;
                handleScreenSizeChange();
            }
            adjustLayoutForScreenSize();
        }, 250);
    });

    // Initial layout adjustment
    adjustLayoutForScreenSize();
}

function handleScreenSizeChange() {
    // Close mobile menu if switching to desktop
    if (currentScreenSize === 'desktop' || currentScreenSize === 'largeDesktop') {
        closeMobileMenu();
    }
    
    // Adjust carousel for different screen sizes
    updateCarouselForScreenSize();
    
    // Adjust animations
    updateAnimationsForScreenSize();
}

function adjustLayoutForScreenSize() {
    const screenWidth = window.innerWidth;
    
    // Adjust font sizes dynamically for very small screens
    if (screenWidth < 350) {
        document.documentElement.style.fontSize = '14px';
    } else if (screenWidth < 400) {
        document.documentElement.style.fontSize = '15px';
    } else {
        document.documentElement.style.fontSize = '16px';
    }
    
    // Adjust container padding for ultra-wide screens
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
        if (screenWidth > 1600) {
            container.style.maxWidth = '1500px';
        } else if (screenWidth > 1440) {
            container.style.maxWidth = '1400px';
        }
    });
}

// Carousel Functions with responsive features
function initializeCarousel() {
    if (!slides.length) return;
    
    // Auto slide with responsive timing
    const autoSlideInterval = currentScreenSize === 'mobile' ? 6000 : 5000;
    setInterval(nextSlide, autoSlideInterval);
    
    // Navigation buttons
    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);
    
    // Dots event listeners
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Touch/swipe support for mobile with improved sensitivity
    initializeTouchSupport();
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (document.querySelector('.certificates').getBoundingClientRect().top < window.innerHeight) {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        }
    });
}

function initializeTouchSupport() {
    let startX = 0;
    let endX = 0;
    let startY = 0;
    let endY = 0;
    const carousel = document.querySelector('.certificate-wrapper');
    
    if (!carousel) return;
    
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    carousel.addEventListener('touchmove', function(e) {
        // Prevent default scrolling during horizontal swipe
        const moveX = e.touches[0].clientX - startX;
        const moveY = e.touches[0].clientY - startY;
        if (Math.abs(moveX) > Math.abs(moveY)) {
            e.preventDefault();
        }
    }, { passive: false });
    
    carousel.addEventListener('touchend', function(e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = currentScreenSize === 'mobile' ? 30 : 50;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only register horizontal swipes
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }
}

function updateCarouselForScreenSize() {
    // Adjust carousel navigation button sizes
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        if (currentScreenSize === 'mobile') {
            btn.style.width = '45px';
            btn.style.height = '45px';
            btn.style.fontSize = '1.1rem';
        } else if (currentScreenSize === 'tablet') {
            btn.style.width = '55px';
            btn.style.height = '55px';
            btn.style.fontSize = '1.3rem';
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarousel() {
    // Update slides
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlide) {
            slide.classList.add('active');
        }
    });
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentSlide) {
            dot.classList.add('active');
        }
    });
}

// Contact Form Functions
function initializeContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Add input animations
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const phone = contactForm.querySelector('input[type="tel"]').value;
    const message = contactForm.querySelector('textarea').value;
    
    // Basic validation
    if (!name || !email || !message) {
        showNotification('Zəhmət olmasa bütün sahələri doldurun!', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Zəhmət olmasa düzgün email daxil edin!', 'error');
        return;
    }
    
    // Show success message
    showNotification('Mesajınız uğurla göndərildi! Tezliklə sizinlə əlaqə saxlayacağıq.', 'success');
    
    // Reset form
    contactForm.reset();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Smooth Scrolling
function initializeSmoothScrolling() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    closeMobileMenu();
                }
            }
        });
    });
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.service-card, .stat-item, .contact-item, .about-text, .matrix-text'
    );
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Button Click Effects
document.addEventListener('click', function(e) {
    if (e.target.matches('button') || e.target.closest('button')) {
        const button = e.target.matches('button') ? e.target : e.target.closest('button');
        
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.8s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove background opacity based on scroll
    if (scrollTop > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
    
    lastScrollTop = scrollTop;
});

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Animate elements on load
    setTimeout(() => {
        const matrixSection = document.querySelector('.matrix-section');
        if (matrixSection) {
            matrixSection.classList.add('animate-in');
        }
    }, 300);
});

// Service button interactions
document.querySelectorAll('.service-btn, .matrix-btn, .matrix-button').forEach(btn => {
    btn.addEventListener('click', function() {
        // Add some interactive feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
        
        // You can add specific actions for each button here
        console.log('Button clicked:', this.textContent);
    });
});

// Statistics counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const number = parseInt(target.replace(/\D/g, ''));
        const suffix = target.replace(/[0-9]/g, '');
        
        if (number) {
            let current = 0;
            const increment = number / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    counter.textContent = number + suffix;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current) + suffix;
                }
            }, 20);
        }
    });
}

// Trigger counter animation when stats section comes into view
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.about-stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}


//---Certficate new
const swiper = new Swiper('.certificates-swiper', {
    slidesPerView: 1,         // Hər slide-da yalnız 1 sertifikat
    spaceBetween: 30,         // Slide-lar arası boşluq
    loop: true,               // Dövrü slayder
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// ============================================
// FAQ ACCORDION FUNKSİYASI
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Aktiv elementi tapırıq
            const isActive = item.classList.contains('active');
            
            // Bütün açıq FAQ-ları bağlayırıq
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Əgər kliklədiyin FAQ aktiv deyildisə, onu aç
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});
