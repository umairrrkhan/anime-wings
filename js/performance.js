class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = {};
        this.batchSize = 100;
        this.throttleDelay = 300;
    }

    // Caching system for expensive calculations
    memoize(key, calculateFn) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const result = calculateFn();
        this.cache.set(key, result);
        
        // Limit cache size for memory management
        if (this.cache.size > 1000) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        return result;
    }

    // Debounce function for search/filter operations
    debounce(key, fn, delay = this.throttleDelay) {
        if (this.debounceTimers[key]) {
            clearTimeout(this.debounceTimers[key]);
        }
        
        this.debounceTimers[key] = setTimeout(() => {
            fn();
            delete this.debounceTimers[key];
        }, delay);
    }

    // Process large datasets in batches
    async processBatch(items, processor, batchSize = this.batchSize) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(processor));
            results.push(...batchResults);
            
            // Allow UI to update between batches
            if (i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        return results;
    }

    // Priority-based filtering for large datasets
    applyPriorityFiltering(animeList, userPreferences) {
        // Create priority tiers
        const tiers = {
            high: [],
            medium: [],
            low: []
        };
        
        animeList.forEach(anime => {
            let priority = 'medium';
            
            // High priority: recent, high-rated, matching preferences
            if (anime.rating >= 8.5 && 
                anime.year >= 2020 && 
                this.matchesUserPreferences(anime, userPreferences)) {
                priority = 'high';
            }
            // Low priority: old, low-rated, no preference match
            else if (anime.rating < 7.0 || anime.year < 2015) {
                priority = 'low';
            }
            
            tiers[priority].push(anime);
        });
        
        // Process high priority first, then medium, then low
        return [...tiers.high, ...tiers.medium, ...tiers.low];
    }

    matchesUserPreferences(anime, preferences) {
        if (!preferences) return false;
        
        return preferences.some(pref => 
            anime.genre === pref.genre ||
            anime.year >= pref.yearRange[0] && anime.year <= pref.yearRange[1] ||
            Math.abs(anime.rating - pref.ratingRange[0]) <= 1.5
        );
    }

    // Lazy loading for large datasets
    createLazyLoadContainer(animeList, itemsPerPage = 20) {
        let currentPage = 0;
        const totalPages = Math.ceil(animeList.length / itemsPerPage);
        
        return {
            getNextPage: () => {
                if (currentPage >= totalPages) return [];
                
                const start = currentPage * itemsPerPage;
                const end = Math.min(start + itemsPerPage, animeList.length);
                const page = animeList.slice(start, end);
                currentPage++;
                
                return page;
            },
            hasMorePages: () => currentPage < totalPages,
            reset: () => { currentPage = 0; },
            getTotalPages: () => totalPages,
            getCurrentPage: () => currentPage
        };
    }

    // Smart preloading based on user behavior
    preloadRelatedAnime(currentAnime, allAnime, maxPreload = 10) {
        const relatedAnime = allAnime
            .filter(anime => 
                anime.id !== currentAnime.id &&
                (anime.genre === currentAnime.genre || 
                 Math.abs(anime.year - currentAnime.year) <= 3)
            )
            .sort((a, b) => b.rating - a.rating)
            .slice(0, maxPreload);
        
        // Preload images for better UX
        relatedAnime.forEach(anime => {
            const img = new Image();
            img.src = anime.image;
        });
        
        return relatedAnime;
    }

    // Efficient similarity calculation for large datasets
    calculateSimilarityMatrix(animeList, sampleSize = 50) {
        // For very large datasets, use sampling to calculate similarity
        const sample = animeList.slice(0, sampleSize);
        const matrix = {};
        
        sample.forEach(anime1 => {
            matrix[anime1.id] = {};
            sample.forEach(anime2 => {
                if (anime1.id !== anime2.id) {
                    matrix[anime1.id][anime2.id] = this.calculateAnimeSimilarity(anime1, anime2);
                }
            });
        });
        
        return matrix;
    }

    calculateAnimeSimilarity(anime1, anime2) {
        // Fast similarity calculation
        let similarity = 0;
        
        // Genre similarity (40%)
        similarity += (anime1.genre === anime2.genre ? 1 : 0) * 0.4;
        
        // Rating similarity (30%)
        similarity += (1 - Math.abs(anime1.rating - anime2.rating) / 10) * 0.3;
        
        // Year similarity (30%)
        similarity += (1 - Math.abs(anime1.year - anime2.year) / 20) * 0.3;
        
        return similarity;
    }

    // Clear cache to prevent memory leaks
    clearCache() {
        this.cache.clear();
        Object.keys(this.debounceTimers).forEach(key => {
            clearTimeout(this.debounceTimers[key]);
            delete this.debounceTimers[key];
        });
    }
}