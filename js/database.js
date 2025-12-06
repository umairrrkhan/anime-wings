// Database management for AnimeVerse
class DatabaseManager {
    constructor() {
        this.animeData = [];
        this.waifuData = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderTables();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            const [animeResponse, waifuResponse] = await Promise.all([
                fetch('data/anime.json'),
                fetch('data/waifu.json')
            ]);
            
            // Load data and limit to 50 entries each
            const fullAnimeData = await animeResponse.json();
            const fullWaifuData = await waifuResponse.json();
            
            this.animeData = fullAnimeData.slice(0, 50);
            this.waifuData = fullWaifuData.slice(0, 50);
        } catch (error) {
            console.error('Error loading data:', error);
            // Show error message
            this.showErrorMessage('Failed to load database. Please refresh the page.');
        }
    }

    renderTables() {
        this.renderAnimeTable();
        this.renderWaifuTable();
        this.updateCounts();
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

    renderWaifuTable() {
        const tableBody = document.getElementById('waifuTableBody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (this.waifuData.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="px-4 py-3 text-center text-gray-500">No waifu data found</td></tr>';
            return;
        }
        
        this.waifuData.forEach(waifu => {
            const row = document.createElement('tr');
            row.className = 'table-row-hover border-b';
            row.innerHTML = `
                <td class="px-6 py-4 font-semibold">${waifu.name || '<span class="text-gray-500">N/A</span>'}</td>
                <td class="px-6 py-3">${waifu.anime || '<span class="text-gray-500">N/A</span>'}</td>
                <td class="px-6 py-3">
                    <span class="px-2 py-1 bg-anime-pink bg-opacity-10 text-anime-pink rounded-full text-xs font-medium">
                        ${waifu.personality || '<span class="text-gray-500">N/A</span>'}
                    </span>
                </td>
                <td class="px-6 py-3">
                    ${waifu.traits ? waifu.traits.map(trait => 
                        `<span class="badge-action" style="margin-right: 4px;">${trait}</span>`
                    ).join('') : '<span class="text-gray-500">N/A</span>'}
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateCounts() {
        const animeCount = document.getElementById('animeCount');
        const waifuCount = document.getElementById('waifuCount');
        
        if (animeCount) animeCount.textContent = this.animeData.length;
        if (waifuCount) waifuCount.textContent = this.waifuData.length;
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
            this.renderTables();
            return;
        }

        const filteredAnime = this.animeData.filter(anime => 
            anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (anime.genres && anime.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (anime.creator && anime.creator.toLowerCase().includes(searchTerm.toLowerCase())) ||
            anime.id.toString().includes(searchTerm.toLowerCase())
        );

        const filteredWaifus = this.waifuData.filter(waifu =>
            waifu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            waifu.anime.toLowerCase().includes(searchTerm.toLowerCase()) ||
            waifu.personality.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (waifu.traits && waifu.traits.some(trait => trait.toLowerCase().includes(searchTerm.toLowerCase())))
        );

        this.renderFilteredTables(filteredAnime, filteredWaifus);
        this.updateFilteredCounts(filteredAnime.length, filteredWaifus.length);
    }

    showAnimeTable() {
        document.getElementById('anime-table').style.display = 'block';
        document.getElementById('waifu-table').style.display = 'none';
        
        // Update tab buttons
        document.getElementById('animeTabBtn').className = 'px-6 py-2 text-sm font-medium rounded-md bg-anime-red text-white transition-all';
        document.getElementById('waifuTabBtn').className = 'px-6 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 transition-all';
    }

    showWaifuTable() {
        document.getElementById('anime-table').style.display = 'none';
        document.getElementById('waifu-table').style.display = 'block';
        
        // Update tab buttons
        document.getElementById('waifuTabBtn').className = 'px-6 py-2 text-sm font-medium rounded-md bg-anime-pink text-white transition-all';
        document.getElementById('animeTabBtn').className = 'px-6 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 transition-all';
    }

    renderFilteredTables(filteredAnime, filteredWaifus) {
        // Store original data
        const originalAnime = this.animeData;
        const originalWaifus = this.waifuData;

        // Temporarily replace with filtered data
        this.animeData = filteredAnime;
        this.waifuData = filteredWaifus;

        // Render tables with filtered data
        this.renderAnimeTable();
        this.renderWaifuTable();

        // Restore original data
        this.animeData = originalAnime;
        this.waifuData = originalWaifus;
    }

    updateFilteredCounts(animeCount, waifuCount) {
        const animeCountElement = document.getElementById('animeCount');
        const waifuCountElement = document.getElementById('waifuCount');
        
        if (animeCountElement) animeCountElement.textContent = animeCount;
        if (waifuCountElement) waifuCountElement.textContent = waifuCount;
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

    exportWaifuData() {
        const dataStr = JSON.stringify(this.waifuData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'waifu-database.json';
        
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

function showWaifuTab() {
    if (window.databaseManager) {
        window.databaseManager.showWaifuTable();
    }
}

function exportAnimeData() {
    if (window.databaseManager) {
        window.databaseManager.exportAnimeData();
    }
}

function exportWaifuData() {
    if (window.databaseManager) {
        window.databaseManager.exportWaifuData();
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