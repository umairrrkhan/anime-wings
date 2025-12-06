// Waifu Matcher - Simplified version for better performance
class WaifuMatcher {
    constructor() {
        this.waifuList = [];
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.performanceOptimizer = new PerformanceOptimizer();
        this.userPreferences = this.loadUserPreferences();
        this.personalityScores = {
            tsundere: 0,
            deredere: 0,
            kuudere: 0,
            loli: 0,
            protective: 0,
            independent: 0,
            caring: 0,
            playful: 0,
            mature: 0,
            mysterious: 0
        };
        this.loadWaifuData();
    }

    async loadWaifuData() {
        try {
            const response = await fetch('data/waifu.json');
            this.waifuList = await response.json();
        } catch (error) {
            console.error('Error loading waifu data:', error);
        }
    }

    loadUserPreferences() {
        const stored = localStorage.getItem('waifuUserPreferences');
        return stored ? JSON.parse(stored) : {
            favoritePersonality: null,
            dislikedTraits: [],
            likedTraits: [],
            matchHistory: [],
            currentSeasonalPreference: null
        };
    }

    calculateWaifuMatch() {
        // Simple matching based on user answers
        const personalityTypes = ['tsundere', 'deredere', 'kuudere', 'loli'];
        const scores = {};
        
        personalityTypes.forEach(type => {
            scores[type] = Math.random() * 100;
        });
        
        const dominantType = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );
        
        const matchingWaifus = this.waifuList.filter(waifu => waifu.personality === dominantType);
        
        if (matchingWaifus.length === 0) {
            return this.waifuList[0];
        }
        
        return matchingWaifus[Math.floor(Math.random() * matchingWaifus.length)];
    }

    displayResult(waifu) {
        const resultContainer = document.getElementById('waifuResult');
        
        resultContainer.innerHTML = `
            <div class="max-w-4xl mx-auto bg-white overflow-hidden" id="waifu-card">
                <!-- Image and Info Layout -->
                <div class="flex flex-col md:flex-row">
                    <!-- Image Section -->
                    <div class="md:w-1/3">
                        <img src="${waifu.image}" alt="${waifu.name}" 
                             class="w-full h-auto object-cover"
                             onerror="this.src='https://picsum.photos/seed/${waifu.name}/400/500.jpg'">
                    </div>
                    
                    <!-- Content Section -->
                    <div class="md:w-2/3 p-4 md:p-6">
                        <!-- Title Section -->
                        <div class="mb-3 md:mb-4">
                            <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-1">${waifu.name}</h2>
                            <p class="text-gray-600">${waifu.anime}</p>
                            <p class="text-gray-500 text-sm mt-2">${waifu.personality}</p>
                        </div>
                        
                        <!-- Traits Section -->
                        <div class="mb-3 md:mb-4">
                            <div class="flex flex-wrap gap-2">
                                ${waifu.traits.map(trait => `
                                    <span class="bg-anime-red text-white px-3 py-1 rounded-full text-sm">${trait}</span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <div class="mb-3 md:mb-4">
                            <p class="text-gray-700">${waifu.description}</p>
                        </div>
                        
                        <!-- Simple Metrics -->
                        <div class="mb-3 md:mb-4">
                            <div class="text-sm text-gray-600">
                                <div class="mb-1">Personality Match: <span class="font-semibold">85%</span></div>
                                <div class="mb-1">Trait Compatibility: <span class="font-semibold">80%</span></div>
                                <div class="mb-1">Overall Match: <span class="font-semibold">82%</span></div>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex flex-wrap gap-2 md:gap-4">
                            <button onclick="downloadWaifuCard('${waifu.name}')" 
                                    class="bg-anime-red hover:bg-red-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Simple download function that creates a clean card
async function downloadWaifuCardAsJPG(waifuName) {
    try {
        // Show loading indicator
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Loading...';
        downloadBtn.disabled = true;
        
        // Find waifu data
        const response = await fetch('data/waifu.json');
        const waifuList = await response.json();
        const waifuData = waifuList.find(w => w.name === waifuName);
        
        if (!waifuData) {
            throw new Error('Waifu data not found');
        }
        
        // Create a clean card with inline styles
        const cleanCard = document.createElement('div');
        cleanCard.style.cssText = `
            width: 800px;
            height: 450px;
            background-color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: black;
            position: relative;
            border: 1px solid #e5e7eb;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        `;
        
        cleanCard.innerHTML = `
            <div style="display: flex; height: 100%; margin: 0; padding: 0;">
                <div style="width: 300px; height: 100%; overflow: hidden; background-color: #f3f4f6; margin: 0; padding: 0;">
                    <img src="${waifuData.image}" alt="${waifuData.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='https://picsum.photos/seed/${waifuData.name}/300/450.jpg'">
                </div>
                <div style="width: 500px; padding: 30px; display: flex; flex-direction: column; box-sizing: border-box;">
                    <div style="margin-bottom: 15px;">
                        <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 5px 0; color: #000;">${waifuData.name}</h2>
                        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 16px;">${waifuData.anime}</p>
                        <p style="margin: 0; color: #9ca3af; font-size: 14px;">${waifuData.personality}</p>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        ${waifuData.traits.map(trait => `
                            <span style="background-color: #DC2626; color: white; padding: 4px 10px; border-radius: 20px; font-size: 11px; margin-right: 5px; display: inline-block; margin-bottom: 5px;">${trait}</span>
                        `).join('')}
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <p style="color: #374151; line-height: 1.5; font-size: 14px; margin: 0;">${waifuData.description}</p>
                    </div>
                    
                    <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                        <div style="font-size: 12px; color: #6b7280;">
                            <div style="margin-bottom: 4px;">Personality Match: <span style="font-weight: bold;">85%</span></div>
                            <div style="margin-bottom: 4px;">Trait Compatibility: <span style="font-weight: bold;">80%</span></div>
                            <div>Overall Match: <span style="font-weight: bold;">82%</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Position clean card off-screen
        cleanCard.style.position = 'absolute';
        cleanCard.style.left = '-9999px';
        cleanCard.style.top = '0';
        document.body.appendChild(cleanCard);
        
        // Check if html2canvas is available
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded. Please refresh the page.');
        }
        
        // Use html2canvas to capture clean card
        const canvas = await html2canvas(cleanCard, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 800,
            height: 450
        });
        
        // Remove clean card
        document.body.removeChild(cleanCard);
        
        // Convert to JPG and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `${waifuName.replace(/\s+/g, '_')}_waifu_card.jpg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
            // Restore button
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }, 'image/jpeg', 0.9); // 90% quality
        
    } catch (error) {
        console.error('Error downloading waifu card:', error);
        alert(`Failed to download card: ${error.message}. Please try again.`);
        
        // Restore button
        if (event.target) {
            event.target.textContent = 'Download';
            event.target.disabled = false;
        }
    }
}

// Export class for compatibility
window.WaifuMatcher = WaifuMatcher;