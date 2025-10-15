// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed header if any
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.timeline-item, .value-card, .skill-category, .education-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add hover effects to skill tags
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Add click tracking for CTA buttons
    const ctaButtons = document.querySelectorAll('.btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add a subtle click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Add typing effect to hero title with proper HTML handling
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalHTML = heroTitle.innerHTML;
        heroTitle.innerHTML = '';
        
        // Create a temporary element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHTML;
        
        // Get text content for typing
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        let currentIndex = 0;
        
        const typeWriter = () => {
            if (currentIndex < textContent.length) {
                // Rebuild HTML with current text
                const currentText = textContent.substring(0, currentIndex + 1);
                
                // Reconstruct the HTML with spans
                let newHTML = '';
                let textIndex = 0;
                
                // Parse through original HTML and rebuild
                for (let i = 0; i < originalHTML.length; i++) {
                    if (originalHTML[i] === '<') {
                        // Find the end of the tag
                        let tagEnd = originalHTML.indexOf('>', i);
                        if (tagEnd !== -1) {
                            newHTML += originalHTML.substring(i, tagEnd + 1);
                            i = tagEnd;
                        }
                    } else if (originalHTML[i] !== ' ' || textIndex < currentText.length) {
                        if (textIndex < currentText.length) {
                            newHTML += currentText[textIndex];
                            textIndex++;
                        }
                    }
                }
                
                heroTitle.innerHTML = newHTML;
                currentIndex++;
                setTimeout(typeWriter, 80);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add smooth parallax effect to hero section
    let ticking = false;
    let lastScrollY = 0;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            // Subtle parallax effect to prevent overlapping
            const parallaxOffset = scrolled * 0.08; // Just enough to see, not enough to overlap
            const smoothedOffset = lastScrollY + (parallaxOffset - lastScrollY) * 0.3; // Smooth interpolation
            hero.style.transform = `translateY(${smoothedOffset}px)`;
            lastScrollY = smoothedOffset;
        }
        ticking = false;
    }
    
    function requestParallaxUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true });

    // Add counter animation for statistics
    const animateCounter = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    };

    // Trigger counter animations when stats come into view
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number, .highlight-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    const number = parseInt(text.replace(/[^\d]/g, ''));
                    if (number && !stat.classList.contains('animated')) {
                        stat.classList.add('animated');
                        animateCounter(stat, number);
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSections = document.querySelectorAll('.profile-stats, .timeline-highlights');
    statsSections.forEach(section => {
        statsObserver.observe(section);
    });

    // Add mobile menu functionality if needed
    const createMobileMenu = () => {
        const nav = document.createElement('nav');
        nav.className = 'mobile-nav';
        nav.innerHTML = `
            <div class="mobile-nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="mobile-nav-menu">
                <a href="#experience">Experience</a>
                <a href="#contact">Contact</a>
            </div>
        `;
        
        document.body.insertBefore(nav, document.body.firstChild);
        
        const toggle = nav.querySelector('.mobile-nav-toggle');
        const menu = nav.querySelector('.mobile-nav-menu');
        
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    };

    // Create mobile navigation
    createMobileMenu();

    // Add form validation if contact form is added later
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Add loading animation
    const addLoadingAnimation = () => {
        const loader = document.createElement('div');
        loader.className = 'page-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="loader-spinner"></div>
                <p>Loading...</p>
            </div>
        `;
        
        document.body.appendChild(loader);
        
        window.addEventListener('load', () => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        });
    };

    // Initialize loading animation
    addLoadingAnimation();

    // Add scroll-to-top functionality
    const addScrollToTop = () => {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '↑';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        
        document.body.appendChild(scrollBtn);
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    // Initialize scroll to top
    addScrollToTop();

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Track page view on load
    trackPageView();

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            if (scrollDepth >= 25 && scrollDepth < 50) {
                trackEvent('scroll_depth_25', { event_category: 'engagement' });
            } else if (scrollDepth >= 50 && scrollDepth < 75) {
                trackEvent('scroll_depth_50', { event_category: 'engagement' });
            } else if (scrollDepth >= 75 && scrollDepth < 90) {
                trackEvent('scroll_depth_75', { event_category: 'engagement' });
            } else if (scrollDepth >= 90) {
                trackEvent('scroll_depth_90', { event_category: 'engagement' });
            }
        }
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackEvent('time_on_page', {
            event_category: 'engagement',
            value: timeOnPage
        });
    });

    // Add performance monitoring
    const logPerformance = () => {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                trackEvent('page_load_time', {
                    event_category: 'performance',
                    value: Math.round(perfData.loadEventEnd - perfData.loadEventStart)
                });
            });
        }
    };

    logPerformance();
});

// Analytics tracking
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4 tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Console logging for debugging
    console.log('Event tracked:', eventName, eventData);
    
    // Optional: Send to custom analytics endpoint
    // fetch('/api/analytics', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ event: eventName, data: eventData, timestamp: new Date().toISOString() })
    // }).catch(err => console.log('Analytics error:', err));
}

// Track page views
function trackPageView() {
    trackEvent('page_view', {
        page_title: 'Jason Taylor Resume',
        page_location: window.location.href
    });
}

// Download resume functionality with tracking
function downloadResume() {
    // Track download attempt
    trackEvent('resume_download_attempt', {
        event_category: 'engagement',
        event_label: 'resume_download'
    });
    
    // First, test if the file is accessible
    fetch('./resume.pdf', { method: 'HEAD' })
        .then(response => {
            if (!response.ok) {
                throw new Error(`File not found: ${response.status}`);
            }
            console.log('Resume file is accessible');
        })
        .catch(error => {
            console.error('Resume file not accessible:', error);
            alert('Resume file not found. Please check that resume.pdf is in the project folder.');
            return;
        });
    
    try {
        // Show download animation
        const downloadBtn = document.querySelector('.btn-large');
        const originalText = downloadBtn.innerHTML;
        
        downloadBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spinning">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Downloading...
        `;
        
        // Try multiple download methods for better compatibility
        const resumeUrl = './resume.pdf';
        
        // Method 1: Try direct download first
        try {
            const link = document.createElement('a');
            link.href = resumeUrl;
            link.download = 'Jason-Taylor-Resume.pdf';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.log('Direct download failed, trying alternative method');
        }
        
        // Method 2: Open in new tab as fallback
        setTimeout(() => {
            try {
                window.open(resumeUrl, '_blank');
            } catch (e) {
                console.log('Window open failed, trying fetch method');
                // Method 3: Fetch and download
                fetch(resumeUrl)
                    .then(response => response.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'Jason-Taylor-Resume.pdf';
                        link.click();
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(err => {
                        console.error('All download methods failed:', err);
                        alert('Download failed. Please try right-clicking the button and selecting "Save link as..."');
                    });
            }
        }, 200);
        
        // Track successful download
        trackEvent('resume_download_success', {
            event_category: 'engagement',
            event_label: 'resume_download_success'
        });
        
        // Show success message
        setTimeout(() => {
            downloadBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                </svg>
                Downloaded!
            `;
            
            // Reset after 2 seconds
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
            }, 2000);
        }, 1000);
        
    } catch (error) {
        console.error('Download failed:', error);
        
        // Track download failure
        trackEvent('resume_download_error', {
            event_category: 'error',
            event_label: 'resume_download_failed',
            error_message: error.message
        });
        
        // Reset button on error
        const downloadBtn = document.querySelector('.btn-large');
        downloadBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
        `;
    }
}

// Add CSS for additional interactive elements
const additionalStyles = `
    .page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    }
    
    .loader-content {
        text-align: center;
    }
    
    .loader-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    }
    
    .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
    }
    
    .scroll-to-top:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .mobile-nav {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        padding: 1rem;
    }
    
    .mobile-nav-toggle {
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        width: 30px;
        height: 30px;
    }
    
    .mobile-nav-toggle span {
        width: 100%;
        height: 3px;
        background: #667eea;
        transition: all 0.3s ease;
    }
    
    .mobile-nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .mobile-nav-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .mobile-nav-menu.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
    }
    
    .mobile-nav-menu a {
        display: block;
        padding: 1rem;
        color: #333;
        text-decoration: none;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .mobile-nav-menu a:hover {
        background: #f8fafc;
        color: #667eea;
    }
    
    .spinning {
        animation: spin 1s linear infinite;
    }
    
    @media (max-width: 767px) {
        .mobile-nav {
            display: block;
        }
        
        .hero {
            padding-top: 80px;
        }
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid #667eea !important;
        outline-offset: 2px !important;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
