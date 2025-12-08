// Database management for AnimeVerse
class DatabaseManager {
    constructor() {
        this.animeData = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderAnimeTable();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            const animeResponse = await fetch('data/anime.json');
            
            // Load data and limit to 50 entries
            const fullAnimeData = await animeResponse.json();
            
            this.animeData = fullAnimeData.slice(0, 50);
        } catch (error) {
            console.error('Error loading data:', error);
            // Show error message
            this.showErrorMessage('Failed to load database. Please refresh the page.');
        }
    }

    renderAnimeTable() {
        const tableBody = document.getElementById('animeTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.animeData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-3 text-center text-gray-500">No anime data found</td></tr>';
            return;
        }
        
        this.animeData.forEach(anime => {
            const row = document.createElement('tr');
            row.className = 'table-row-hover border-b';
            row.innerHTML = `
                <td class="px-6 py-4 font-medium">${anime.id || 'N/A'}</td>
                <td class="px-6 py-4 font-semibold">${anime.title || 'N/A'}</td>
                <td class="px-6 py-3">
                    ${anime.genres ? anime.genres.map(genre => 
                        `<span class="badge-action" style="margin-right: 4px;">${genre}</span>`
                    ).join('') : '<span class="text-gray-500">N/A</span>'}
                </td>
                <td class="px-6 py-3">${anime.year || '<span class="text-gray-500">N/A</span>'}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.renderTables();
        }
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderAnimeTable();
            return;
        }

        const filteredAnime = this.animeData.filter(anime => 
            anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (anime.genres && anime.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            anime.id.toString().includes(searchTerm.toLowerCase())
        );

        this.renderFilteredAnimeTable(filteredAnime);
    }

    renderFilteredAnimeTable(filteredAnime) {
        // Store original data
        const originalAnime = this.animeData;

        // Temporarily replace with filtered data
        this.animeData = filteredAnime;

        // Render table with filtered data
        this.renderAnimeTable();

        // Restore original data
        this.animeData = originalAnime;
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    exportAnimeData() {
        const dataStr = JSON.stringify(this.animeData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'anime-database.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    
}

// Initialize database manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.databaseManager = new DatabaseManager();
});

// Helper functions for HTML onclick handlers
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        window.databaseManager.handleSearch('');
    }
}

function showAnimeTab() {
    if (window.databaseManager) {
        window.databaseManager.showAnimeTable();
    }
}

function exportAnimeData() {
    if (window.databaseManager) {
        window.databaseManager.exportAnimeData();
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
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
});