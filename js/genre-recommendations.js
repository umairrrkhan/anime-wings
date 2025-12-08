// Genre Recommendations Manager - Simplified
class GenreRecommendationsManager {
    constructor() {
        this.animeList = [];
        this.selectedGenres = [];
        this.init();
    }

    async init() {
        await this.loadAnimeData();
        this.setupEventListeners();
    }

    async loadAnimeData() {
        try {
            const response = await fetch('data/anime.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            this.animeList = await response.json();
            
            // Validate data
            if (!Array.isArray(this.animeList) || this.animeList.length === 0) {
                this.showNotification('No anime data available');
                return;
            }
            
            // Filter valid anime entries
            this.animeList = this.animeList.filter(anime => 
                anime && 
                typeof anime.id === 'number' && 
                typeof anime.title === 'string' && 
                (anime.genres || anime.genre)
            );
            
            if (this.animeList.length === 0) {
                this.showNotification('No valid anime data found');
            }
        } catch (error) {
            console.error('Error loading anime data:', error);
            this.showNotification('Failed to load anime data');
        }
    }

    setupEventListeners() {
        // Genre selection checkboxes
        const genreCheckboxes = document.querySelectorAll('.genre-checkbox');
        const findBtn = document.getElementById('findRecommendationsBtn');
        
        genreCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Enable/disable find button
                const selectedCount = document.querySelectorAll('.genre-checkbox:checked').length;
                if (findBtn) {
                    findBtn.disabled = selectedCount === 0;
                }
            });
        });
    }

    selectGenres() {
        const selectedCheckboxes = document.querySelectorAll('.genre-checkbox:checked');
        
        if (selectedCheckboxes.length === 0) {
            this.showNotification('Please select at least one genre');
            return;
        }
        
        // Get selected genres
        this.selectedGenres = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
        
        // Show recommendations section
        const recommendationsSection = document.getElementById('recommendationsSection');
        if (recommendationsSection) {
            recommendationsSection.classList.remove('hidden');
        }
        
        // Load recommendations
        this.loadGenreRecommendations();
    }

    loadGenreRecommendations() {
        // Filter anime that match the selected genres
        let filteredAnime = this.animeList.filter(anime => 
            anime.genres && Array.isArray(anime.genres) && 
            this.selectedGenres.some(selectedGenre => anime.genres.includes(selectedGenre))
        );
        
        // Check if no anime found
        if (filteredAnime.length === 0) {
            this.displayRecommendations(false);
            return;
        }
        
        // Calculate genre match score for each anime
        filteredAnime = filteredAnime.map(anime => {
            const matchingGenres = anime.genres.filter(genre => this.selectedGenres.includes(genre));
            const genreMatchScore = matchingGenres.length / this.selectedGenres.length;
            
            return {
                ...anime,
                genreMatchScore,
                matchingGenres
            };
        });
        
        // Filter to only show anime with 43% or higher match
        filteredAnime = filteredAnime.filter(anime => anime.genreMatchScore >= 0.43);
        
        // Check if no anime meets the 43% threshold
        if (filteredAnime.length === 0) {
            this.displayRecommendations(false);
            return;
        }
        
        // Sort by genre match score (highest first), then by rating
        filteredAnime.sort((a, b) => {
            if (b.genreMatchScore !== a.genreMatchScore) {
                return b.genreMatchScore - a.genreMatchScore;
            }
            return (b.rating || 0) - (a.rating || 0);
        });
        
        this.currentRecommendations = filteredAnime;
        this.displayRecommendations(true);
    }

    displayRecommendations(hasResults) {
        try {
            const tableBody = document.getElementById('recommendedAnimeTable');
            const noAnimeFoundMessage = document.getElementById('noAnimeFoundMessage');
            
            if (!tableBody) {
                console.error('Table body element not found');
                return;
            }
            
            // Clear existing content
            tableBody.innerHTML = '';
            
            // Hide message first
            if (noAnimeFoundMessage) {
                noAnimeFoundMessage.classList.add('hidden');
            }
            
            if (!hasResults || !this.currentRecommendations || this.currentRecommendations.length === 0) {
                // Show no anime found message
                if (noAnimeFoundMessage) {
                    noAnimeFoundMessage.classList.remove('hidden');
                }
                return;
            }
            
            // Display recommendations
            this.currentRecommendations.forEach(anime => {
                if (anime && anime.id && anime.title) {
                    const row = this.createAnimeTableRow(anime);
                    tableBody.appendChild(row);
                }
            });
        } catch (error) {
            console.error('Error displaying recommendations:', error);
            this.showNotification('Error displaying recommendations');
        }
    }

    createAnimeTableRow(anime) {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50 transition-colors';
        
        // Calculate genre match accuracy percentage
        const matchPercentage = Math.round((anime.genreMatchScore || 0) * 100);
        
        // Determine match color based on percentage
        let matchColorClass = 'text-red-600'; // Low match
        if (matchPercentage >= 75) {
            matchColorClass = 'text-green-600'; // High match
        } else if (matchPercentage >= 50) {
            matchColorClass = 'text-yellow-600'; // Medium match
        }
        
        // Create genre tags with highlighting for matching genres
        const genreTags = anime.genres.map(g => {
            const isMatching = this.selectedGenres.includes(g);
            const tagClass = isMatching ? 'bg-anime-red text-white' : 'bg-gray-200 text-gray-700';
            return `<span class="${tagClass} px-2 py-1 rounded-full text-xs mr-1">${g.charAt(0).toUpperCase() + g.slice(1)}</span>`;
        }).join('');
        
        row.innerHTML = `
            <td class="px-4 py-3 font-medium md:px-6 md:py-4">${anime.title}</td>
            <td class="px-4 py-3 md:px-6 md:py-4">
                <div class="flex flex-wrap gap-1">
                    ${genreTags}
                </div>
            </td>
            <td class="px-4 py-3 md:px-6 md:py-4">
                <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div class="bg-anime-red h-2 rounded-full" style="width: ${matchPercentage}%"></div>
                    </div>
                    <span class="${matchColorClass} font-medium">${matchPercentage}%</span>
                </div>
            </td>
        `;
        
        return row;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-anime-red text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    resetGenreSelection() {
        // Hide recommendations section
        document.getElementById('recommendationsSection').classList.add('hidden');
        
        // Hide no anime found message
        const noAnimeFoundMessage = document.getElementById('noAnimeFoundMessage');
        if (noAnimeFoundMessage) {
            noAnimeFoundMessage.classList.add('hidden');
        }
        
        // Reset selected genres
        this.selectedGenres = [];
        
        // Uncheck all checkboxes
        const genreCheckboxes = document.querySelectorAll('.genre-checkbox');
        genreCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Disable find button
        const findBtn = document.getElementById('findRecommendationsBtn');
        if (findBtn) {
            findBtn.disabled = true;
        }
    }
}

// Initialize manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.genreManager = new GenreRecommendationsManager();
});

// Helper functions for HTML onclick handlers
function findRecommendations() {
    if (window.genreManager) {
        window.genreManager.selectGenres();
    }
}

function resetGenreSelection() {
    if (window.genreManager) {
        window.genreManager.resetGenreSelection();
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}