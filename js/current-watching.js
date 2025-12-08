// Current Watching Manager
class CurrentWatchingManager {
    constructor() {
        this.animeList = [];
        this.selectedAnimeTags = [];
        this.recommendations = [];
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
            console.log('Loaded', this.animeList.length, 'anime');
        } catch (error) {
            console.error('Error loading anime data:', error);
            this.showError('Failed to load anime data. Please refresh the page.');
        }
    }

    setupEventListeners() {
        const animeInputBox = document.getElementById('animeInputBox');
        if (animeInputBox) {
            animeInputBox.addEventListener('input', (e) => {
                this.handleInputChange(e.target.value);
            });
            
            animeInputBox.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    this.addCurrentInputAsTag();
                } else if (e.key === 'Backspace' && e.target.value === '' && this.selectedAnimeTags.length > 0) {
                    this.removeLastAnimeTag();
                }
            });
            
            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#animeInputBox') && !e.target.closest('#animeSuggestions')) {
                    this.hideSuggestions();
                }
            });
        }
    }

    handleInputChange(value) {
        // Show suggestions after 2 characters
        if (value.length >= 2) {
            this.showSuggestions(value);
        } else {
            this.hideSuggestions();
        }
    }

    showSuggestions(searchTerm) {
        const suggestionsDiv = document.getElementById('animeSuggestions');
        if (!suggestionsDiv) return;
        
        // Filter anime that match the search term and aren't already selected
        const filteredAnime = this.animeList.filter(anime => {
            const term = searchTerm.toLowerCase();
            const animeGenres = anime.genres || [anime.genre];
            const matchesSearch = anime.title.toLowerCase().includes(term) || 
                                animeGenres.some(g => g.toLowerCase().includes(term));
            const notAlreadySelected = !this.selectedAnimeTags.some(selected => selected.id === anime.id);
            
            return matchesSearch && notAlreadySelected;
        });
        
        if (filteredAnime.length === 0) {
            suggestionsDiv.innerHTML = '<div class="p-3 text-gray-500">No anime found</div>';
        } else {
            suggestionsDiv.innerHTML = filteredAnime.map(anime => `
                <div onclick="currentManager.selectAnimeFromSuggestions(${anime.id})" class="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-anime-red rounded-full mr-3 flex items-center justify-center">
                            <span class="text-white font-bold text-sm">${anime.title.charAt(0)}</span>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium">${anime.title}</div>
                            <div class="text-sm text-gray-500">${anime.genres ? anime.genres.join(', ') : anime.genre} • ${anime.year}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        suggestionsDiv.classList.remove('hidden');
    }

    hideSuggestions() {
        const suggestionsDiv = document.getElementById('animeSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.classList.add('hidden');
        }
    }

    selectAnimeFromSuggestions(animeId) {
        const anime = this.animeList.find(a => a.id === animeId);
        if (!anime) return;
        
        // Add to selected tags if not already there
        if (!this.selectedAnimeTags.some(selected => selected.id === animeId)) {
            this.selectedAnimeTags.push(anime);
            this.updateSelectedAnimeTags();
        }
        
        // Clear input and hide suggestions
        const inputBox = document.getElementById('animeInputBox');
        if (inputBox) {
            inputBox.value = '';
        }
        this.hideSuggestions();
    }

    addCurrentInputAsTag() {
        const inputBox = document.getElementById('animeInputBox');
        if (!inputBox) return;
        
        const value = inputBox.value.trim();
        if (!value) return;
        
        // Check if this matches any existing anime
        const matchedAnime = this.animeList.find(anime => 
            anime.title.toLowerCase() === value.toLowerCase()
        );
        
        if (matchedAnime) {
            // Add the matched anime if not already selected
            if (!this.selectedAnimeTags.some(selected => selected.id === matchedAnime.id)) {
                this.selectedAnimeTags.push(matchedAnime);
                this.updateSelectedAnimeTags();
            }
        } else {
            // Show error if anime not found in database
            this.showError(`"${value}" not found in database. Please select from the suggestions.`);
        }
        
        // Clear input and hide suggestions
        inputBox.value = '';
        this.hideSuggestions();
    }

    updateSelectedAnimeTags() {
        const tagsContainer = document.getElementById('selectedAnimeTags');
        if (!tagsContainer) return;
        
        tagsContainer.innerHTML = '';
        
        // Show empty message if no tags
        if (this.selectedAnimeTags.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.id = 'emptySelectionMessage';
            emptyMessage.className = 'text-gray-400 text-sm flex items-center';
            emptyMessage.textContent = 'No anime selected yet. Start typing to add anime to your watchlist.';
            tagsContainer.appendChild(emptyMessage);
            return;
        }
        
        this.selectedAnimeTags.forEach(anime => {
            const tag = document.createElement('div');
            tag.className = 'bg-anime-red text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-md';
            tag.innerHTML = `
                ${anime.title}
                <button onclick="currentManager.removeAnimeTag(${anime.id})" class="hover:bg-red-700 rounded-full w-4 h-4 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            `;
            tagsContainer.appendChild(tag);
        });
    }

    removeAnimeTag(animeId) {
        this.selectedAnimeTags = this.selectedAnimeTags.filter(anime => anime.id !== animeId);
        this.updateSelectedAnimeTags();
    }

    removeLastAnimeTag() {
        if (this.selectedAnimeTags.length > 0) {
            this.selectedAnimeTags.pop();
            this.updateSelectedAnimeTags();
        }
    }

    clearAllAnime() {
        this.selectedAnimeTags = [];
        this.updateSelectedAnimeTags();
        
        const inputBox = document.getElementById('animeInputBox');
        if (inputBox) {
            inputBox.value = '';
        }
        this.hideSuggestions();
    }

    getRecommendations() {
        // Check if there are any selected anime
        if (this.selectedAnimeTags.length === 0) {
            this.showError('Please add at least one anime to get recommendations');
            return;
        }
        
        // Get recommendations based on selected anime
        this.recommendations = this.getSimpleRecommendations();
        
        // Check if we have any recommendations
        if (this.recommendations.length === 0) {
            this.showError('No recommendations found. Try adding more anime or different genres.');
            return;
        }
        
        this.displayRecommendations();
    }

    getSimpleRecommendations() {
        // Get anime not currently selected
        const candidateAnime = this.animeList.filter(anime => 
            !this.selectedAnimeTags.some(selected => selected.id === anime.id)
        );
        
        // Get all genres from selected anime (remove duplicates)
        const selectedGenres = [...new Set(this.selectedAnimeTags.flatMap(a => a.genres || [a.genre]))];
        
        // Find anime with matching genres and calculate accuracy
        const matchingAnime = candidateAnime.map(anime => {
            const animeGenres = anime.genres || [anime.genre];
            
            // Calculate genre overlap using Jaccard similarity
            // Intersection: genres that appear in both selected and candidate anime
            const intersection = animeGenres.filter(genre => selectedGenres.includes(genre));
            
            // Union: all unique genres from both selected and candidate anime
            const union = [...new Set([...selectedGenres, ...animeGenres])];
            
            // Jaccard similarity = |Intersection| / |Union|
            const jaccardSimilarity = intersection.length / union.length;
            
            // Convert to percentage (using only genre similarity since rating is no longer available)
            const accuracy = Math.round(jaccardSimilarity * 100);
            
            return {
                ...anime,
                accuracy: accuracy,
                matchingGenres: intersection.length
            };
        }).filter(anime => anime.accuracy > 30); // Only keep anime with accuracy above 30%
        
        // Sort by accuracy (highest first) and return top recommendations
        matchingAnime.sort((a, b) => b.accuracy - a.accuracy);
        return matchingAnime.slice(0, 16);
    }



    displayRecommendations() {
        const container = document.getElementById('recommendedAnime');
        const recommendationsSection = document.getElementById('recommendationsSection');
        
        if (!container || !recommendationsSection) return;
        
        // Show recommendations section
        recommendationsSection.classList.remove('hidden');
        
        // Create modern table HTML with improved design
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div class="bg-gradient-to-r from-anime-red to-red-600 px-4 py-3 sm:px-6 sm:py-4">
                    <h3 class="text-white font-bold text-lg sm:text-xl">Recommended Anime</h3>
                </div>
                <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="w-12 px-4 py-3 text-center font-semibold text-sm text-gray-700 uppercase tracking-wider">#</th>
                                <th class="px-4 py-3 text-left font-semibold text-sm text-gray-700 uppercase tracking-wider">Anime Name</th>
                                <th class="w-48 px-4 py-3 text-left font-semibold text-sm text-gray-700 uppercase tracking-wider hidden sm:table-cell">Genre</th>
                                <th class="w-24 px-4 py-3 text-center font-semibold text-sm text-gray-700 uppercase tracking-wider">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.recommendations.map((anime, index) => `
                                <tr class="hover:bg-gray-50">
                                    <td class="w-12 px-4 py-3 text-center">
                                        <span class="text-sm font-bold text-gray-700">
                                            ${index + 1}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-medium text-gray-900 truncate">${anime.title}</span>
                                            <span class="text-xs text-gray-500 sm:hidden mt-1">${anime.genres ? anime.genres.join(', ') : anime.genre}</span>
                                        </div>
                                    </td>
                                    <td class="w-48 px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                                        <span class="px-2 py-1 bg-gray-100 rounded-full text-xs">${anime.genres ? anime.genres.join(', ') : anime.genre}</span>
                                    </td>
                                    <td class="w-24 px-4 py-3 text-center">
                                        <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${anime.accuracy >= 80 ? 'bg-green-100 text-green-800' : anime.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'}">
                                            ${anime.accuracy}%
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                </table>
            </div>
        `;
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// Initialize the manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.currentManager = new CurrentWatchingManager();
});