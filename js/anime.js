class AnimeManager {
    constructor() {
        this.animeList = [];
        this.currentGenre = 'all';
        this.currentlyWatching = [];
        this.performanceOptimizer = new PerformanceOptimizer();
        this.userPreferences = this.loadUserPreferences();
        this.init();
    }

    async init() {
        await this.loadAnimeData();
        this.loadCurrentlyWatching();
        this.loadRecommendations();
        this.loadStatistics();
        
        // Initialize performance optimizations for large datasets
        if (this.animeList.length > 500) {
            this.initializeLargeDatasetOptimizations();
        }
    }

    async loadAnimeData() {
        try {
            const response = await fetch('data/anime.json');
            this.animeList = await response.json();
            this.currentlyWatching = this.animeList.filter(anime => anime.currentlyWatching);
        } catch (error) {
            console.error('Error loading anime data:', error);
        }
    }

    loadCurrentlyWatching() {
        const container = document.getElementById('currentlyWatching');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.currentlyWatching.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">No anime currently watching</p>
                    <button onclick="addRandomToWatching()" class="mt-4 bg-anime-red hover:bg-red-700 text-white px-4 py-2 rounded-lg">
                        Add Random Anime
                    </button>
                </div>
            `;
            return;
        }

        this.currentlyWatching.forEach(anime => {
            const animeCard = this.createAnimeCard(anime, true);
            container.appendChild(animeCard);
        });
    }

    loadRecommendations(genre = 'all') {
        const container = document.getElementById('recommendedAnime');
        if (!container) return;

        container.innerHTML = '';
        
        // Advanced recommendation algorithm
        const recommendations = this.calculateAdvancedRecommendations(genre);

        recommendations.forEach(anime => {
            const animeCard = this.createAnimeCard(anime, false, true);
            container.appendChild(animeCard);
        });

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-500">No recommendations found for this genre</p>
                </div>
            `;
        }
    }

    calculateAdvancedRecommendations(genre) {
        // Get anime user isn't currently watching
        let candidateAnime = this.animeList.filter(anime => !anime.currentlyWatching);

        // Filter by genre if specified
        if (genre !== 'all') {
            candidateAnime = candidateAnime.filter(anime => anime.genre === genre);
        }

        // For large datasets (>500 anime), apply performance optimizations
        if (this.animeList.length > 500) {
            candidateAnime = this.applyLargeDatasetOptimizations(candidateAnime, genre);
        }

        // Advanced scoring algorithm for recommendations
        const scoredAnime = candidateAnime.map(anime => {
            const score = this.calculateRecommendationScore(anime);
            return { ...anime, recommendationScore: score };
        });

        // Sort by recommendation score
        scoredAnime.sort((a, b) => b.recommendationScore - a.recommendationScore);

        // Return top recommendations (adaptive limit based on dataset size)
        const limit = Math.min(20, Math.max(10, Math.floor(candidateAnime.length * 0.1)));
        return scoredAnime.slice(0, limit);
    }

    applyLargeDatasetOptimizations(candidateAnime, genre) {
        // Performance optimizations for large datasets
        
        // 1. Pre-filter by popularity threshold for initial recommendations
        const popularityThreshold = this.calculatePopularityThreshold();
        candidateAnime = candidateAnime.filter(anime => anime.rating >= popularityThreshold);
        
        // 2. Apply collaborative filtering if user has sufficient history
        if (this.currentlyWatching.length >= 3) {
            candidateAnime = this.applyCollaborativeFiltering(candidateAnime);
        }
        
        // 3. Content-based filtering for similarity
        candidateAnime = this.applyContentBasedFiltering(candidateAnime);
        
        // 4. Remove duplicates and maintain diversity
        candidateAnime = this.ensureDiversity(candidateAnime);
        
        return candidateAnime;
    }

    calculatePopularityThreshold() {
        // Dynamic threshold based on user's current watching preferences
        if (this.currentlyWatching.length === 0) {
            return 7.5; // Default threshold for new users
        }
        
        const avgRating = this.currentlyWatching.reduce((sum, anime) => sum + anime.rating, 0) / this.currentlyWatching.length;
        return Math.max(6.5, avgRating - 0.5); // User's preferred range with slight flexibility
    }

    applyCollaborativeFiltering(candidateAnime) {
        // Simulate collaborative filtering based on similar users' preferences
        // In a real app, this would query a backend with actual user data
        const collaborativeWeights = {
            'action': 1.2,
            'romance': 1.1,
            'comedy': 1.15,
            'fantasy': 1.0
        };
        
        return candidateAnime.map(anime => ({
            ...anime,
            collaborativeBoost: collaborativeWeights[anime.genre] || 1.0
        }));
    }

    applyContentBasedFiltering(candidateAnime) {
        // Content-based filtering using similarity to currently watching anime
        const watchedAnime = this.currentlyWatching;
        
        return candidateAnime.map(anime => {
            let similarityScore = 0;
            
            watchedAnime.forEach(watched => {
                // Calculate content similarity
                const genreSimilarity = watched.genre === anime.genre ? 1.0 : 0.3;
                const ratingSimilarity = 1 - Math.abs(watched.rating - anime.rating) / 10;
                const yearSimilarity = 1 - Math.abs(watched.year - anime.year) / 20;
                
                similarityScore += (genreSimilarity * 0.4 + ratingSimilarity * 0.3 + yearSimilarity * 0.3);
            });
            
            return {
                ...anime,
                contentSimilarity: similarityScore / watchedAnime.length
            };
        });
    }

    ensureDiversity(candidateAnime) {
        // Ensure genre diversity in recommendations
        const genreDistribution = {};
        const maxPerGenre = Math.max(2, Math.floor(candidateAnime.length * 0.3));
        
        return candidateAnime.filter(anime => {
            genreDistribution[anime.genre] = (genreDistribution[anime.genre] || 0) + 1;
            return genreDistribution[anime.genre] <= maxPerGenre;
        });
    }

    calculateRecommendationScore(anime) {
        // Enhanced multi-factor recommendation scoring for large datasets
        let score = 0;
        
        // Factor 1: Rating (35% weight) - reduced for large datasets
        score += (anime.rating / 10) * 35;
        
        // Factor 2: Recency/Popularity (25% weight) - increased for large datasets
        const currentYear = new Date().getFullYear();
        const ageInYears = currentYear - anime.year;
        const recencyScore = Math.max(0, 1 - (ageInYears / 15));
        score += recencyScore * 25;
        
        // Factor 3: Episode count optimization (15% weight)
        let episodeScore = this.calculateEpisodeScore(anime.episodes);
        score += episodeScore * 15;
        
        // Factor 4: Genre balance (10% weight) - reduced for large datasets
        const genreBalance = this.calculateGenreBalanceScore(anime);
        score += genreBalance * 10;
        
        // Factor 5: User history analysis (15% weight) - increased for large datasets
        const userHistoryScore = this.calculateUserHistoryScore(anime);
        score += userHistoryScore * 15;
        
        // Factor 6: Content similarity (if available) - New factor for large datasets
        if (anime.contentSimilarity !== undefined) {
            score += anime.contentSimilarity * 15;
        }
        
        // Factor 7: Collaborative filtering (if available) - New factor for large datasets
        if (anime.collaborativeBoost !== undefined) {
            score *= anime.collaborativeBoost;
        }
        
        return Math.min(score, 100); // Cap at 100
    }

    calculateEpisodeScore(episodes) {
        // More sophisticated episode scoring for large datasets
        if (episodes <= 12) {
            return 0.95; // Very short - high recommendation
        } else if (episodes <= 26) {
            return 0.9; // Standard season length
        } else if (episodes <= 52) {
            return 0.75; // Full year
        } else if (episodes <= 100) {
            return 0.65; // Moderate commitment
        } else if (episodes <= 200) {
            return 0.45; // High commitment
        } else {
            return 0.25; // Very high commitment
        }
    }

    calculateGenreBalanceScore(anime) {
        // Calculate genre distribution in user's currently watching list
        const genreCounts = {};
        this.currentlyWatching.forEach(watching => {
            genreCounts[watching.genre] = (genreCounts[watching.genre] || 0) + 1;
        });
        
        const totalWatching = this.currentlyWatching.length;
        let balanceScore = 0.5; // Default score
        
        if (totalWatching > 0) {
            const genreRatio = (genreCounts[anime.genre] || 0) / totalWatching;
            
            // Promote genre diversity
            if (genreRatio < 0.3) {
                balanceScore = 0.9; // Low in this genre - recommend
            } else if (genreRatio < 0.6) {
                balanceScore = 0.7; // Moderate - okay
            } else {
                balanceScore = 0.3; // High in this genre - less priority
            }
        }
        
        return balanceScore;
    }

    calculateUserHistoryScore(anime) {
        // Analyze user's viewing history for preferences
        let historyScore = 0.5; // Default score
        
        // Check if user has watched similar anime
        const similarAnime = this.animeList.filter(a => 
            a.genre === anime.genre && 
            a.year >= anime.year - 3 && 
            a.year <= anime.year + 3
        );
        
        const watchedSimilar = similarAnime.filter(a => 
            this.currentlyWatching.some(w => w.id === a.id)
        ).length;
        
        if (watchedSimilar > 0) {
            // User has watched similar anime - higher score
            historyScore = 0.8;
        }
        
        return historyScore;
    }

    createAnimeCard(anime, isCurrentlyWatching, showRecommendationScore = false) {
        const card = document.createElement('div');
        card.className = 'anime-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105';
        
        // Calculate recommendation percentage if needed
        const recommendationPercentage = showRecommendationScore ? 
            Math.round(anime.recommendationScore || 0) : null;
        
        card.innerHTML = `
            <div class="relative">
                <img src="${anime.image}" alt="${anime.title}" class="w-full h-48 object-cover">
                <div class="absolute top-2 right-2 bg-anime-black text-white px-2 py-1 rounded-full text-xs font-bold">
                    ${anime.rating}
                </div>
                ${isCurrentlyWatching ? '<div class="absolute top-2 left-2 bg-anime-red text-white px-2 py-1 rounded-full text-xs font-bold">Watching</div>' : ''}
                ${showRecommendationScore && recommendationPercentage ? 
                    `<div class="absolute bottom-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ${recommendationPercentage}% Match
                    </div>` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg mb-1 truncate">${anime.title}</h3>
                <p class="text-gray-600 text-sm mb-2">${anime.genre} • ${anime.year} • ${anime.episodes} eps</p>
                <p class="text-gray-700 text-sm line-clamp-2 mb-3">${anime.description}</p>
                <div class="flex justify-between">
                    <button onclick="animeManager.toggleCurrentlyWatching(${anime.id})" class="bg-anime-red hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                        ${isCurrentlyWatching ? 'Drop' : 'Watch'}
                    </button>
                    <button onclick="animeManager.showAnimeDetails(${anime.id})" class="bg-anime-black hover:bg-gray-800 text-white px-3 py-1 rounded text-sm">
                        Details
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    showAnimeDetails(animeId) {
        const anime = this.animeList.find(a => a.id === animeId);
        if (!anime) return;
        
        // Create modal with detailed information
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="relative">
                    <img src="${anime.image}" alt="${anime.title}" class="w-full h-64 object-cover rounded-t-lg">
                    <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 bg-anime-red text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700">
                        ✕
                    </button>
                </div>
                <div class="p-6">
                    <h2 class="text-2xl font-bold mb-2">${anime.title}</h2>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-anime-red text-white px-3 py-1 rounded-full text-sm">${anime.genre}</span>
                        <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">${anime.year}</span>
                        <span class="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">${anime.episodes} episodes</span>
                        <span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">★ ${anime.rating}</span>
                        <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${anime.status}</span>
                    </div>
                    <p class="text-gray-700 mb-6">${anime.description}</p>
                    
                    ${this.generateDetailedAnalytics(anime)}
                    
                    <div class="flex justify-end gap-3">
                        <button onclick="animeManager.toggleCurrentlyWatching(${anime.id}); this.closest('.fixed').remove();" class="bg-anime-red hover:bg-red-700 text-white px-6 py-2 rounded-lg">
                            ${anime.currentlyWatching ? 'Drop from Watching' : 'Add to Watching'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    generateDetailedAnalytics(anime) {
        // Generate recommendation factors for this anime
        const factors = this.calculateRecommendationFactors(anime);
        
        return `
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 class="font-bold text-lg mb-3">Recommendation Factors</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Rating Score</span>
                        <div class="flex items-center gap-2">
                            <div class="w-32 bg-gray-200 rounded-full h-2">
                                <div class="bg-anime-red h-2 rounded-full" style="width: ${factors.rating}%"></div>
                            </div>
                            <span class="text-sm font-medium">${factors.rating}%</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Recency Score</span>
                        <div class="flex items-center gap-2">
                            <div class="w-32 bg-gray-200 rounded-full h-2">
                                <div class="bg-purple-500 h-2 rounded-full" style="width: ${factors.recency}%"></div>
                            </div>
                            <span class="text-sm font-medium">${factors.recency}%</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Episode Score</span>
                        <div class="flex items-center gap-2">
                            <div class="w-32 bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${factors.episode}%"></div>
                            </div>
                            <span class="text-sm font-medium">${factors.episode}%</span>
                        </div>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Genre Balance</span>
                        <div class="flex items-center gap-2">
                            <div class="w-32 bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: ${factors.genre}%"></div>
                            </div>
                            <span class="text-sm font-medium">${factors.genre}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateRecommendationFactors(anime) {
        // Calculate individual factor scores for analytics
        const ratingScore = Math.round((anime.rating / 10) * 100);
        const recencyScore = Math.round(Math.min((anime.year - 2000) / 25, 1) * 100);
        
        let episodeScore = 0;
        if (anime.episodes <= 26) {
            episodeScore = 90;
        } else if (anime.episodes <= 100) {
            episodeScore = 70;
        } else {
            episodeScore = 50;
        }
        
        const genreScore = Math.round(this.calculateGenreBalanceScore(anime) * 100);
        
        return {
            rating: ratingScore,
            recency: recencyScore,
            episode: episodeScore,
            genre: genreScore
        };
    }

    toggleCurrentlyWatching(animeId) {
        const anime = this.animeList.find(a => a.id === animeId);
        if (anime) {
            anime.currentlyWatching = !anime.currentlyWatching;
            this.currentlyWatching = this.animeList.filter(a => a.currentlyWatching);
            
            // Update user preferences based on viewing patterns
            this.updateUserPreferences(anime);
            
            this.loadCurrentlyWatching();
            this.loadRecommendations(this.currentGenre);
            this.updateStatistics();
            
            // Trigger collaborative data update (in real app, this would sync with backend)
            this.updateCollaborativeData(animeId, anime.currentlyWatching);
        }
    }

    loadUserPreferences() {
        const stored = localStorage.getItem('userPreferences');
        return stored ? JSON.parse(stored) : {
            favoriteGenres: [],
            ratingRange: [7.0, 10.0],
            yearRange: [2015, new Date().getFullYear()],
            episodePreference: 'medium'
        };
    }

    updateUserPreferences(anime) {
        if (anime.currentlyWatching) {
            // Update favorite genres based on viewing history
            if (!this.userPreferences.favoriteGenres.includes(anime.genre)) {
                this.userPreferences.favoriteGenres.push(anime.genre);
                // Keep only top 5 favorite genres
                this.userPreferences.favoriteGenres = this.userPreferences.favoriteGenres.slice(-5);
            }
            
            // Update rating range based on what user watches
            const avgRating = this.currentlyWatching.reduce((sum, a) => sum + a.rating, 0) / this.currentlyWatching.length;
            this.userPreferences.ratingRange[0] = Math.max(6.5, avgRating - 1.0);
            this.userPreferences.ratingRange[1] = Math.min(10.0, avgRating + 0.5);
        }
        
        // Save preferences to localStorage
        localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
    }

    updateCollaborativeData(animeId, isWatching) {
        // In a real app, this would send data to server
        // For now, we simulate collaborative data updates
        const collaborativeData = JSON.parse(localStorage.getItem('collaborativeData') || '{}');
        
        if (!collaborativeData[animeId]) {
            collaborativeData[animeId] = { watchCount: 0, similarityScore: 0 };
        }
        
        collaborativeData[animeId].watchCount += isWatching ? 1 : -1;
        localStorage.setItem('collaborativeData', JSON.stringify(collaborativeData));
    }

    initializeLargeDatasetOptimizations() {
        // Pre-calculate similarity matrix for faster recommendations
        this.performanceOptimizer.memoize('similarityMatrix', () => {
            return this.performanceOptimizer.calculateSimilarityMatrix(this.animeList);
        });
        
        // Preload high-rated anime
        const highRatedAnime = this.animeList.filter(anime => anime.rating >= 8.5);
        highRatedAnime.forEach(anime => {
            this.performanceOptimizer.preloadRelatedAnime(anime, this.animeList, 5);
        });
    }

    addRandomToWatching() {
        const availableAnime = this.animeList.filter(anime => !anime.currentlyWatching);
        if (availableAnime.length > 0) {
            const randomAnime = availableAnime[Math.floor(Math.random() * availableAnime.length)];
            this.toggleCurrentlyWatching(randomAnime.id);
        }
    }

    loadStatistics() {
        const genreStats = document.getElementById('genreStats');
        if (!genreStats) return;

        const genres = {};
        this.animeList.forEach(anime => {
            if (!genres[anime.genre]) {
                genres[anime.genre] = 0;
            }
            genres[anime.genre]++;
        });

        genreStats.innerHTML = '';
        Object.keys(genres).forEach(genre => {
            const percentage = (genres[genre] / this.animeList.length) * 100;
            const statItem = document.createElement('div');
            statItem.className = 'flex items-center justify-between';
            statItem.innerHTML = `
                <div class="flex items-center">
                    <span class="w-3 h-3 bg-anime-red rounded-full mr-2"></span>
                    <span class="capitalize font-medium">${genre}</span>
                </div>
                <div class="flex items-center">
                    <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-anime-red h-2 rounded-full" style="width: ${percentage}%"></div>
                    </div>
                    <span class="text-sm font-medium">${genres[genre]}</span>
                </div>
            `;
            genreStats.appendChild(statItem);
        });
    }

    updateStatistics() {
        const quizCount = document.getElementById('quizCount');
        if (quizCount) {
            const currentCount = parseInt(localStorage.getItem('quizCount') || '0');
            quizCount.textContent = currentCount;
        }
        this.loadStatistics();
    }
}

function filterByGenre(genre) {
    const buttons = document.querySelectorAll('.genre-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-anime-red', 'text-white');
        btn.classList.add('bg-gray-200');
    });
    
    event.target.classList.remove('bg-gray-200');
    event.target.classList.add('bg-anime-red', 'text-white');
    
    if (window.animeManager) {
        window.animeManager.currentGenre = genre;
        window.animeManager.loadRecommendations(genre);
    }
}

function addRandomToWatching() {
    if (window.animeManager) {
        window.animeManager.addRandomToWatching();
    }
}