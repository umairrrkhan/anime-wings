// Multi-Genre Pipeline Manager
class PipelineManager {
    constructor() {
        this.animeList = [];
        this.selectedGenres = new Set();
        this.performanceOptimizer = new PerformanceOptimizer();
        this.init();
    }

    async init() {
        await this.loadAnimeData();
        this.setupEventListeners();
    }

    async loadAnimeData() {
        try {
            const response = await fetch('data/anime.json');
            this.animeList = await response.json();
        } catch (error) {
            console.error('Error loading anime data:', error);
        }
    }

    setupEventListeners() {
        // Setup is handled in HTML onclick handlers
    }

    toggleGenre(genre) {
        if (this.selectedGenres.has(genre)) {
            this.selectedGenres.delete(genre);
        } else {
            this.selectedGenres.add(genre);
        }
        
        this.updateGenreUI(genre);
    }

    updateGenreUI(genre) {
        const genreElement = document.querySelector(`[data-genre="${genre}"]`);
        const checkIndicator = genreElement.querySelector('.check-indicator');
        
        if (this.selectedGenres.has(genre)) {
            genreElement.classList.add('ring-4', 'ring-anime-red', 'bg-red-50');
            genreElement.classList.remove('bg-white');
            checkIndicator.classList.remove('hidden');
        } else {
            genreElement.classList.remove('ring-4', 'ring-anime-red', 'bg-red-50');
            genreElement.classList.add('bg-white');
            checkIndicator.classList.add('hidden');
        }
    }

    async processPipeline() {
        if (this.selectedGenres.size === 0) {
            this.showNotification('Please select at least one genre!', 'error');
            return;
        }

        // Show processing section
        const pipelineSection = document.getElementById('pipelineSection');
        pipelineSection.classList.remove('hidden');
        
        // Simulate processing with animation
        await this.simulateProcessing();
        
        // Generate recommendations
        const recommendations = await this.generatePipelineRecommendations();
        
        // Display results with animation
        this.displayPipelineResults(recommendations);
    }

    async simulateProcessing() {
        // Simulate different processing stages
        const stages = [
            "Analyzing genre patterns...",
            "Cross-referencing anime database...",
            "Calculating preference weights...",
            "Generating personalized recommendations..."
        ];
        
        const stageText = document.querySelector('#pipelineSection p.text-gray-600');
        
        for (let stage of stages) {
            stageText.textContent = stage;
            await this.delay(800);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async generatePipelineRecommendations() {
        // Get anime that match selected genres
        let candidateAnime = this.animeList.filter(anime => 
            this.selectedGenres.has(anime.genre)
        );
        
        // Apply advanced filtering for better recommendations
        candidateAnime = this.applyPipelineFiltering(candidateAnime);
        
        // Calculate pipeline scores
        const scoredAnime = candidateAnime.map(anime => ({
            ...anime,
            pipelineScore: this.calculatePipelineScore(anime)
        }));
        
        // Sort by pipeline score
        scoredAnime.sort((a, b) => b.pipelineScore - a.pipelineScore);
        
        // Add pipeline metadata
        scoredAnime.forEach(anime => {
            anime.pipelineConfidence = Math.round((anime.pipelineScore / 100) * 100);
            anime.pipelineFactors = this.getPipelineFactors(anime);
        });
        
        return scoredAnime.slice(0, 12);
    }

    applyPipelineFiltering(animeList) {
        let filtered = [...animeList];
        
        // 1. Quality filter (exclude low-rated)
        filtered = filtered.filter(anime => anime.rating >= 6.5);
        
        // 2. Multi-genre diversity bonus
        filtered = filtered.map(anime => {
            const genreCount = this.selectedGenres.size;
            const diversityBonus = Math.min(genreCount / 4, 1) * 10;
            return { ...anime, diversityBonus };
        });
        
        // 3. User preference simulation
        filtered = filtered.map(anime => {
            const userPrefScore = this.calculateUserPreferenceScore(anime);
            return { ...anime, userPreferenceScore: userPrefScore };
        });
        
        return filtered;
    }

    calculatePipelineScore(anime) {
        // Advanced scoring for multi-genre pipeline
        let score = 0;
        
        // Factor 1: Genre match (40%)
        const genreMatch = this.selectedGenres.has(anime.genre) ? 1 : 0;
        score += genreMatch * 40;
        
        // Factor 2: Rating (30%)
        score += (anime.rating / 10) * 30;
        
        // Factor 3: Recency (15%)
        const currentYear = new Date().getFullYear();
        const recencyScore = Math.max(0, 1 - ((currentYear - anime.year) / 20));
        score += recencyScore * 15;
        
        // Factor 4: Pipeline diversity (10%)
        score += (anime.diversityBonus || 0);
        
        // Factor 5: User preference simulation (5%)
        score += (anime.userPreferenceScore || 0) * 5;
        
        return score;
    }

    calculateUserPreferenceScore(anime) {
        // Simulate user preference based on genre popularity
        const genrePopularity = {
            'action': 0.9,
            'romance': 0.8,
            'comedy': 0.85,
            'fantasy': 0.7
        };
        
        let preferenceScore = genrePopularity[anime.genre] || 0.5;
        
        // Boost based on episode count preferences
        if (anime.episodes <= 26) preferenceScore += 0.1;
        else if (anime.episodes <= 100) preferenceScore += 0.05;
        
        return Math.min(preferenceScore, 1);
    }

    getPipelineFactors(anime) {
        return {
            genreMatch: this.selectedGenres.has(anime.genre),
            ratingScore: anime.rating / 10,
            recencyScore: Math.max(0, 1 - ((new Date().getFullYear() - anime.year) / 20)),
            episodeScore: anime.episodes <= 26 ? 0.9 : anime.episodes <= 100 ? 0.7 : 0.5,
            diversityScore: (anime.diversityBonus || 0) / 10
        };
    }

    displayPipelineResults(recommendations) {
        // Hide processing, show results
        document.getElementById('pipelineSection').classList.add('hidden');
        document.getElementById('pipelineResults').classList.remove('hidden');
        
        const container = document.getElementById('pipelineRecommendations');
        container.innerHTML = '';
        
        recommendations.forEach((anime, index) => {
            setTimeout(() => {
                const card = this.createPipelineCard(anime);
                container.appendChild(card);
                
                // GSAP animation for card entrance
                gsap.from(card, {
                    duration: 0.6,
                    y: 50,
                    opacity: 0,
                    ease: "power2.out"
                });
            }, index * 100);
        });
    }

    createPipelineCard(anime) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:scale-105 transition-all duration-300';
        
        // Create gradient background based on score
        const scoreColor = anime.pipelineScore >= 80 ? 'from-anime-red to-anime-pink' :
                           anime.pipelineScore >= 60 ? 'from-anime-purple to-anime-pink' :
                           'from-gray-500 to-gray-600';
        
        card.innerHTML = `
            <div class="relative">
                <img src="${anime.image}" alt="${anime.title}" class="w-full h-48 object-cover">
                <div class="absolute top-2 right-2 bg-anime-black text-white px-2 py-1 rounded-full text-xs font-bold">
                    ★ ${anime.rating}
                </div>
                <div class="absolute bottom-2 left-2 bg-gradient-to-r ${scoreColor} text-white px-3 py-1 rounded-full text-xs font-bold">
                    ${anime.pipelineConfidence}% Match
                </div>
                <div class="absolute top-2 left-2">
                    <span class="bg-white/90 text-anime-black px-2 py-1 rounded text-xs font-medium">
                        ${anime.genre.toUpperCase()}
                    </span>
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1 truncate">${anime.title}</h3>
                <p class="text-gray-600 text-sm mb-2">${anime.year} • ${anime.episodes} episodes</p>
                <div class="mb-3 space-y-1">
                    ${this.createPipelineFactorsDisplay(anime.pipelineFactors)}
                </div>
                <p class="text-gray-700 text-sm line-clamp-2 mb-3">${anime.description}</p>
                <div class="flex justify-between">
                    <button onclick="pipelineManager.addToWatchlist(${anime.id})" class="bg-anime-red hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                        Add Anime
                    </button>
                    <button onclick="pipelineManager.showDetails(${anime.id})" class="bg-anime-black hover:bg-gray-800 text-white px-3 py-1 rounded text-sm">
                        Details
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    createPipelineFactorsDisplay(factors) {
        return `
            <div class="flex gap-2 flex-wrap">
                ${factors.genreMatch ? '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Genre Match</span>' : ''}
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Rating: ${Math.round(factors.ratingScore * 10)}%</span>
                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Recency: ${Math.round(factors.recencyScore * 10)}%</span>
                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Episodes: ${Math.round(factors.episodeScore * 10)}%</span>
            </div>
        `;
    }

    addToWatchlist(animeId) {
        const anime = this.animeList.find(a => a.id === animeId);
        if (anime) {
            // Get current watching from localStorage
            let watchingList = JSON.parse(localStorage.getItem('currentWatchingList') || '[]');
            
            // Check if already added
            if (!watchingList.some(a => a.id === animeId)) {
                watchingList.push(anime);
                localStorage.setItem('currentWatchingList', JSON.stringify(watchingList));
                this.showNotification(`${anime.title} added successfully!`);
            } else {
                this.showNotification(`${anime.title} is already added!`);
            }
        }
    }

    showDetails(animeId) {
        const anime = this.animeList.find(a => a.id === animeId);
        if (!anime) return;
        
        // Create modal with detailed pipeline information
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="relative">
                    <img src="${anime.image}" alt="${anime.title}" class="w-full h-64 object-cover rounded-t-xl">
                    <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 bg-anime-red text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700">
                        ✕
                    </button>
                </div>
                <div class="p-6">
                    <h2 class="text-2xl font-bold mb-4">${anime.title}</h2>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-anime-red text-white px-3 py-1 rounded-full text-sm">${anime.genre}</span>
                        <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">${anime.year}</span>
                        <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">${anime.episodes} episodes</span>
                        <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">★ ${anime.rating}</span>
                        <span class="bg-gradient-to-r from-anime-red to-anime-pink text-white px-3 py-1 rounded-full text-sm font-bold">
                            ${anime.pipelineConfidence}% Pipeline Match
                        </span>
                    </div>
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 class="font-bold text-lg mb-3">Pipeline Analysis</h3>
                        <div class="space-y-2">
                            ${Object.entries(anime.pipelineFactors).map(([key, value]) => `
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600 capitalize">${key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                    <div class="flex items-center gap-2">
                                        <div class="w-32 bg-gray-200 rounded-full h-2">
                                            <div class="bg-anime-red h-2 rounded-full" style="width: ${value * 100}%"></div>
                                        </div>
                                        <span class="text-sm font-medium">${Math.round(value * 100)}%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <p class="text-gray-700 mb-6">${anime.description}</p>
                    
                    <div class="flex justify-end gap-3">
                        <button onclick="this.closest('.fixed').remove()" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg">
                            Close
                        </button>
                        <button onclick="pipelineManager.addToWatchlist(${anime.id}); this.closest('.fixed').remove();" class="bg-anime-red hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                            Add Anime
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // GSAP animation for modal
        gsap.from(modal.querySelector('.bg-white'), {
            duration: 0.5,
            scale: 0.8,
            opacity: 0,
            ease: "back.out(1.7)"
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-500' : 'bg-anime-red';
        notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.pipelineManager = new PipelineManager();
});

// Helper functions for HTML onclick handlers
function toggleGenre(genre) {
    if (window.pipelineManager) {
        window.pipelineManager.toggleGenre(genre);
    }
}

function processPipeline() {
    if (window.pipelineManager) {
        window.pipelineManager.processPipeline();
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}