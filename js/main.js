// Initialize managers when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    window.animeManager = new AnimeManager();
    window.quizManager = new QuizManager();
    window.waifuMatcher = new WaifuMatcher();
    
    // Wait for data to load
    await Promise.all([
        window.animeManager.init(),
        window.quizManager.init(),
        window.waifuMatcher.loadWaifuData()
    ]);
    
    // Initialize stats
    initializeStats();
    
    // Add smooth scrolling
    initializeSmoothScrolling();
    
    // Add mobile menu toggle
    initializeMobileMenu();
    
    // Initialize animations
    initializeAnimations();
});

function initializeStats() {
    // Load quiz count from localStorage
    const quizCount = document.getElementById('quizCount');
    if (quizCount) {
        quizCount.textContent = localStorage.getItem('quizCount') || '0';
    }
    
    // Load genre statistics if page has the element
    if (window.animeManager) {
        window.animeManager.loadStatistics();
    }
}

function initializeSmoothScrolling() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
}

function initializeMobileMenu() {
    // Mobile menu toggle function
    window.toggleMobileMenu = function() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    };
}

function initializeAnimations() {
    // Add scroll animations for elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe anime cards and other elements
    document.querySelectorAll('.anime-card').forEach(el => {
        observer.observe(el);
    });
    
    // Add parallax effect to hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.relative.bg-gradient-to-b');
        if (heroSection) {
            heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Add custom CSS for animations
const style = document.createElement('style');
style.textContent = `
    .anime-card {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .anime-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fade-in-up {
        animation: fadeInUp 0.8s ease forwards;
    }
    
    .btn {
        transition: all 0.3s ease;
        transform: translateY(0);
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    /* Ensure high performance */
    * {
        box-sizing: border-box;
    }
    
    img {
        will-change: transform;
    }
    
    /* Loading animation */
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255,255,255,.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Performance optimization
function optimizeImages() {
    // Lazy load images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

// SEO optimization
function optimizeSEO() {
    // Add structured data for search engines
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "AnimeVerse",
        "description": "Anime recommendations and waifu personality matcher",
        "url": window.location.origin,
        "potentialAction": {
            "@type": "SearchAction",
            "target": window.location.origin + "?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Add meta tags for better SEO
    const metaTags = [
        { name: 'keywords', content: 'anime, recommendations, waifu, personality test, anime characters' },
        { name: 'author', content: 'AnimeVerse' },
        { property: 'og:title', content: 'AnimeVerse - Anime Recommendations & Waifu Matcher' },
        { property: 'og:description', content: 'Discover your next favorite anime and find your perfect waifu match' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' }
    ];
    
    metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.property) {
            meta.setAttribute('property', tag.property);
            meta.content = tag.content;
        } else {
            meta.name = tag.name;
            meta.content = tag.content;
        }
        document.head.appendChild(meta);
    });
}

// Initialize optimizations
optimizeImages();
optimizeSEO();

// Add error handling
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg';
    errorDiv.textContent = 'Something went wrong. Please refresh the page.';
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Arrow keys for quiz navigation
    if (window.quizManager && window.quizManager.isQuizActive) {
        if (e.key === 'ArrowRight' && !e.target.matches('input')) {
            e.preventDefault();
            nextQuestion();
        } else if (e.key === 'ArrowLeft' && !e.target.matches('input')) {
            e.preventDefault();
            previousQuestion();
        } else if (e.key >= '1' && e.key <= '4' && e.target.matches('input')) {
            // Allow number keys for quiz answers
            const answerIndex = parseInt(e.key) - 1;
            window.quizManager.selectAnswer(answerIndex);
        }
    }
});

// Add print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        nav, footer, button {
            display: none !important;
        }
        
        body {
            background: white !important;
        }
        
        .anime-card {
            break-inside: avoid;
        }
    }
`;
document.head.appendChild(printStyles);