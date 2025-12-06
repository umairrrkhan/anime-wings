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
            // Extended personality traits for better matching
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
            
            // Initialize optimizations for large datasets
            if (this.waifuList.length > 500) {
                this.initializeLargeDatasetOptimizations();
            }
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

    initializeLargeDatasetOptimizations() {
        // Pre-calculate personality clusters for faster matching
        this.personalityClusters = this.createPersonalityClusters();
        
        // Pre-index waifus by traits for fast lookup
        this.traitIndex = this.createTraitIndex();
        
        // Create similarity matrix for most popular waifus
        const popularWaifus = this.waifuList
            .filter(w => w.rating >= 8.5)
            .slice(0, 100);
        this.popularityMatrix = this.createWaifuSimilarityMatrix(popularWaifus);
    }

    createPersonalityClusters() {
        const clusters = {
            tsundere: [],
            deredere: [],
            kuudere: [],
            loli: []
        };
        
        this.waifuList.forEach(waifu => {
            if (clusters[waifu.personality]) {
                clusters[waifu.personality].push(waifu);
            }
        });
        
        // Sort clusters by trait compatibility
        Object.keys(clusters).forEach(personality => {
            clusters[personality].sort((a, b) => {
                const aScore = this.calculateTraitCompatibility(a.traits);
                const bScore = this.calculateTraitCompatibility(b.traits);
                return bScore - aScore;
            });
        });
        
        return clusters;
    }

    createTraitIndex() {
        const traitIndex = {};
        
        this.waifuList.forEach(waifu => {
            waifu.traits.forEach(trait => {
                if (!traitIndex[trait]) {
                    traitIndex[trait] = [];
                }
                traitIndex[trait].push(waifu);
            });
        });
        
        return traitIndex;
    }

    createWaifuSimilarityMatrix(waifus) {
        const matrix = {};
        
        waifus.forEach(waifu1 => {
            matrix[waifu1.id] = {};
            waifus.forEach(waifu2 => {
                if (waifu1.id !== waifu2.id) {
                    matrix[waifu1.id][waifu2.id] = this.calculateWaifuSimilarity(waifu1, waifu2);
                }
            });
        });
        
        return matrix;
    }

    calculateTraitCompatibility(traits) {
        // Score traits based on general appeal
        const traitScores = {
            'strong': 0.9, 'protective': 0.95, 'loyal': 0.9, 'independent': 0.8,
            'shy': 0.75, 'kind': 0.95, 'determined': 0.9, 'gentle': 0.85,
            'elegant': 0.9, 'caring': 0.95, 'leader': 0.85,
            'devoted': 0.9, 'humble': 0.8, 'confident': 0.9, 'intelligent': 0.95,
            'mature': 0.9, 'rebellious': 0.75, 'passionate': 0.85, 'loyal': 0.9,
            'mysterious': 0.85, 'wise': 0.9, 'playful': 0.8, 'ancient': 0.7,
            'noble': 0.85, 'clumsy': 0.7
        };
        
        return traits.reduce((total, trait) => total + (traitScores[trait] || 0.5), 0) / traits.length;
    }

    calculateWaifuSimilarity(waifu1, waifu2) {
        // Calculate similarity between two waifus
        let similarity = 0;
        
        // Personality similarity (60%)
        similarity += waifu1.personality === waifu2.personality ? 0.6 : 0.2;
        
        // Trait similarity (40%)
        const commonTraits = waifu1.traits.filter(trait => waifu2.traits.includes(trait));
        similarity += (commonTraits.length / Math.max(waifu1.traits.length, waifu2.traits.length)) * 0.4;
        
        return similarity;
    }

    calculateWaifuMatch() {
        // Optimized matching for large datasets
        const cacheKey = JSON.stringify(this.userAnswers);
        
        return this.performanceOptimizer.memoize(cacheKey, () => {
            this.initializePersonalityMatrix();
            this.calculateAdvancedPersonalityScores();
            
            // For large datasets, use optimized matching strategy
            if (this.waifuList.length > 500) {
                return this.calculateOptimizedMatch();
            } else {
                return this.calculateStandardMatch();
            }
        });
    }

    calculateOptimizedMatch() {
        // Step 1: Find dominant personality with confidence scoring
        const dominantPersonality = this.getConfidentDominantPersonality();
        
        // Step 2: Get pre-filtered candidates from personality clusters
        const candidates = this.getOptimizedCandidates(dominantPersonality);
        
        // Step 3: Apply advanced scoring to top candidates only
        const scoredCandidates = candidates.slice(0, 50).map(waifu => ({
            waifu: waifu,
            score: this.calculateAdvancedCompatibility(waifu),
            breakdown: this.getCompatibilityBreakdown(waifu)
        }));
        
        // Step 4: Apply user preference filtering
        const filteredCandidates = this.applyUserPreferences(scoredCandidates);
        
        // Step 5: Select best match with fallback mechanism
        return this.findOptimalMatch(filteredCandidates);
    }

    getConfidentDominantPersonality() {
        // Calculate confidence score for each personality type
        const scores = {
            tsundere: this.personalityScores.tsundere,
            deredere: this.personalityScores.deredere,
            kuudere: this.personalityScores.kuudere,
            loli: this.personalityScores.loli
        };
        
        const maxScore = Math.max(...Object.values(scores));
        const dominantType = Object.keys(scores).find(type => scores[type] === maxScore);
        
        // Calculate confidence (how clear the personality is)
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const confidence = maxScore / totalScore;
        
        return {
            type: dominantType,
            confidence: confidence,
            scores: scores
        };
    }

    getOptimizedCandidates(dominantPersonality) {
        // Multi-tier candidate selection
        
        // Tier 1: Exact personality matches (top 30%)
        let candidates = this.personalityClusters[dominantPersonality.type] || [];
        const exactMatches = candidates.slice(0, Math.ceil(candidates.length * 0.3));
        
        // Tier 2: Compatible personalities (based on trait similarity)
        const compatibleTypes = this.getCompatiblePersonalityTypes(dominantPersonality.type);
        compatibleTypes.forEach(type => {
            const compatibleWaifus = this.personalityClusters[type] || [];
            const topCompatible = compatibleWaifus.slice(0, Math.ceil(compatibleWaifus.length * 0.2));
            candidates.push(...topCompatible);
        });
        
        // Tier 3: Trait-based matches (if low confidence)
        if (dominantPersonality.confidence < 0.4) {
            const traitBasedMatches = this.findTraitBasedMatches();
            candidates.push(...traitBasedMatches.slice(0, 20));
        }
        
        // Remove duplicates and sort by trait compatibility
        const uniqueCandidates = candidates.filter((waifu, index, self) =>
            index === self.findIndex(w => w.id === waifu.id)
        );
        
        return uniqueCandidates.sort((a, b) => 
            this.calculateTraitCompatibility(b.traits) - this.calculateTraitCompatibility(a.traits)
        );
    }

    getCompatiblePersonalityTypes(primaryType) {
        const compatibilityMatrix = {
            'tsundere': ['kuudere', 'deredere'],
            'deredere': ['loli', 'tsundere'],
            'kuudere': ['tsundere', 'loli'],
            'loli': ['deredere', 'kuudere']
        };
        
        return compatibilityMatrix[primaryType] || [];
    }

    findTraitBasedMatches() {
        // Find waifus based on user's dominant traits
        const dominantTraits = this.getDominantTraits();
        let matches = [];
        
        dominantTraits.forEach(trait => {
            const traitMatches = this.traitIndex[trait] || [];
            matches.push(...traitMatches);
        });
        
        return matches.filter((waifu, index, self) =>
            index === self.findIndex(w => w.id === waifu.id)
        );
    }

    getDominantTraits() {
        const traitScores = {
            'protective': this.personalityScores.protective,
            'independent': this.personalityScores.independent,
            'caring': this.personalityScores.caring,
            'playful': this.personalityScores.playful,
            'mature': this.personalityScores.mature,
            'mysterious': this.personalityScores.mysterious
        };
        
        return Object.entries(traitScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([trait]) => trait);
    }

    applyUserPreferences(scoredCandidates) {
        // Filter candidates based on user preferences and history
        let filtered = scoredCandidates;
        
        // Exclude disliked traits
        if (this.userPreferences.dislikedTraits.length > 0) {
            filtered = filtered.filter(candidate => 
                !candidate.waifu.traits.some(trait => 
                    this.userPreferences.dislikedTraits.includes(trait)
                )
            );
        }
        
        // Boost liked traits
        if (this.userPreferences.likedTraits.length > 0) {
            filtered = filtered.map(candidate => {
                const likedTraitBonus = candidate.waifu.traits.filter(trait => 
                    this.userPreferences.likedTraits.includes(trait)
                ).length * 0.1;
                
                return {
                    ...candidate,
                    score: candidate.score + likedTraitBonus
                };
            });
        }
        
        // Boost seasonal preferences
        if (this.userPreferences.currentSeasonalPreference) {
            filtered = filtered.map(candidate => {
                const seasonalBonus = this.checkSeasonalMatch(
                    candidate.waifu, 
                    this.userPreferences.currentSeasonalPreference
                );
                
                return {
                    ...candidate,
                    score: candidate.score + seasonalBonus
                };
            });
        }
        
        return filtered;
    }

    checkSeasonalMatch(waifu, seasonalPreference) {
        // Check if waifu matches seasonal preferences
        if (!seasonalPreference) return 0;
        
        const seasonalTraits = {
            'winter': ['mature', 'elegant', 'mysterious'],
            'spring': ['gentle', 'caring', 'kind'],
            'summer': ['playful', 'energetic', 'confident'],
            'autumn': ['wise', 'intelligent', 'humble']
        };
        
        const matchingTraits = waifu.traits.filter(trait => 
            seasonalTraits[seasonalPreference].includes(trait)
        );
        
        return matchingTraits.length * 0.05;
    }

    calculateStandardMatch() {
        // Standard matching for smaller datasets
        this.normalizeScores();
        const compatibilityScores = this.calculateAdvancedCompatibilityScores();
        const bestMatch = this.findOptimalMatch(compatibilityScores);
        return bestMatch;
    }

    initializePersonalityMatrix() {
        // Reset scores with advanced weights for different personality types
        this.personalityScores = {
            tsundere: 0,
            deredere: 0,
            kuudere: 0,
            loli: 0,
            // Secondary traits for better matching
            protective: 0,
            independent: 0,
            caring: 0,
            playful: 0,
            mature: 0,
            mysterious: 0
        };
        
        // Question weights based on psychological significance
        this.questionWeights = [
            1.2, 1.1, 1.3, 1.4, 1.2, // Questions 1-5: Core personality
            1.1, 1.0, 1.1, 1.2, 1.1, // Questions 6-10: Behavioral patterns
            1.0, 1.1, 1.2, 1.0, 1.1, // Questions 11-15: Social interaction
            1.3 // Question 16: Life philosophy (highest weight)
        ];
    }

    calculateAdvancedPersonalityScores() {
        this.userAnswers.forEach((answer, questionIndex) => {
            // Use default weight of 1.0 if question index is out of bounds
            const weight = questionIndex < this.questionWeights.length ? 
                          this.questionWeights[questionIndex] : 1.0;
            this.applyAdvancedScoring(answer, weight);
        });
        
        // Apply normalization to ensure fair comparison
        this.normalizeScores();
    }

    applyAdvancedScoring(answer, weight) {
        // Advanced scoring based on psychological patterns
        switch(answer) {
            case 0: // Independence/strength indicators
                this.personalityScores.tsundere += 2.5 * weight;
                this.personalityScores.kuudere += 1.2 * weight;
                this.personalityScores.protective += 1.8 * weight;
                this.personalityScores.independent += 2.1 * weight;
                break;
            case 1: // Directness/emotional openness
                this.personalityScores.deredere += 2.8 * weight;
                this.personalityScores.caring += 2.3 * weight;
                this.personalityScores.tsundere += 0.8 * weight;
                break;
            case 2: // Reserved/analytical approach
                this.personalityScores.kuudere += 3.1 * weight;
                this.personalityScores.mature += 2.0 * weight;
                this.personalityScores.mysterious += 1.5 * weight;
                break;
            case 3: // Playful/energetic approach
                this.personalityScores.loli += 2.9 * weight;
                this.personalityScores.playful += 2.4 * weight;
                this.personalityScores.deredere += 1.1 * weight;
                break;
        }
    }

    normalizeScores() {
        // Apply min-max normalization to prevent bias
        const maxScore = Math.max(...Object.values(this.personalityScores));
        const normalizationFactor = maxScore > 0 ? 100 / maxScore : 1;
        
        Object.keys(this.personalityScores).forEach(key => {
            this.personalityScores[key] *= normalizationFactor;
        });
    }

    calculateAdvancedCompatibilityScores() {
        const compatibilityScores = [];
        
        this.waifuList.forEach(waifu => {
            const score = this.calculateAdvancedCompatibility(waifu);
            compatibilityScores.push({
                waifu: waifu,
                score: score,
                breakdown: this.getCompatibilityBreakdown(waifu)
            });
        });
        
        return compatibilityScores;
    }

    calculateAdvancedCompatibility(waifu) {
        // Multi-factor compatibility calculation
        let personalityMatch = this.calculatePersonalityMatch(waifu);
        let traitMatch = this.calculateTraitMatch(waifu);
        let psychologicalMatch = this.calculatePsychologicalMatch(waifu);
        
        // Weighted combination (70% personality, 20% traits, 10% psychological)
        const totalScore = (personalityMatch * 0.7) + (traitMatch * 0.2) + (psychologicalMatch * 0.1);
        
        return totalScore;
    }

    calculatePersonalityMatch(waifu) {
        // Primary personality matching with weighted scoring
        const primaryScore = this.personalityScores[waifu.personality] || 0;
        
        // Secondary personality traits consideration
        let secondaryScore = 0;
        switch(waifu.personality) {
            case 'tsundere':
                secondaryScore = (this.personalityScores.protective || 0) * 0.8 + 
                               (this.personalityScores.independent || 0) * 0.7;
                break;
            case 'deredere':
                secondaryScore = (this.personalityScores.caring || 0) * 0.9 + 
                               (this.personalityScores.playful || 0) * 0.6;
                break;
            case 'kuudere':
                secondaryScore = (this.personalityScores.mature || 0) * 0.85 + 
                               (this.personalityScores.mysterious || 0) * 0.75;
                break;
            case 'loli':
                secondaryScore = (this.personalityScores.playful || 0) * 0.95 + 
                               (this.personalityScores.caring || 0) * 0.5;
                break;
        }
        
        return (primaryScore * 0.7 + secondaryScore * 0.3) / 100;
    }

    calculateTraitMatch(waifu) {
        // Advanced trait matching with semantic understanding
        let traitScore = 0;
        const traitWeights = {
            'strong': 0.9, 'protective': 0.85, 'loyal': 0.8, 'independent': 0.75,
            'shy': 0.7, 'kind': 0.95, 'determined': 0.9, 'gentle': 0.8,
            'elegant': 0.75, 'caring': 0.95, 'leader': 0.8,
            'devoted': 0.9, 'humble': 0.7, 'confident': 0.85, 'intelligent': 0.9,
            'mature': 0.8, 'rebellious': 0.75, 'loyal': 0.8, 'passionate': 0.85,
            'mysterious': 0.8, 'wise': 0.9, 'playful': 0.85, 'ancient': 0.6,
            'noble': 0.8, 'clumsy': 0.5
        };
        
        waifu.traits.forEach(trait => {
            const traitKey = trait.toLowerCase();
            let score = 0;
            
            // Map traits to personality scores
            if (traitKey.includes('strong') || traitKey.includes('protective')) {
                score = (this.personalityScores.tsundere + this.personalityScores.protective) / 200;
            } else if (traitKey.includes('kind') || traitKey.includes('caring')) {
                score = (this.personalityScores.deredere + this.personalityScores.caring) / 200;
            } else if (traitKey.includes('mature') || traitKey.includes('intelligent')) {
                score = (this.personalityScores.kuudere + this.personalityScores.mature) / 200;
            } else if (traitKey.includes('playful') || traitKey.includes('mysterious')) {
                score = (this.personalityScores.loli + this.personalityScores.playful) / 200;
            }
            
            traitScore += score * (traitWeights[traitKey] || 0.5);
        });
        
        return Math.min(traitScore / waifu.traits.length, 1);
    }

    calculatePsychologicalMatch(waifu) {
        // Psychological compatibility based on answer patterns
        let psychologicalScore = 0;
        
        // Analyze answer patterns for psychological insights
        const answerPatterns = this.analyzeAnswerPatterns();
        
        // Match patterns with waifu characteristics
        if (answerPatterns.independent && waifu.traits.includes('independent')) {
            psychologicalScore += 0.3;
        }
        if (answerPatterns.emotional && waifu.traits.includes('caring')) {
            psychologicalScore += 0.3;
        }
        if (answerPatterns.reserved && waifu.traits.includes('mysterious')) {
            psychologicalScore += 0.3;
        }
        if (answerPatterns.energetic && waifu.traits.includes('playful')) {
            psychologicalScore += 0.3;
        }
        
        return Math.min(psychologicalScore, 1);
    }

    analyzeAnswerPatterns() {
        // Advanced pattern analysis of user responses
        const patterns = {
            independent: false,
            emotional: false,
            reserved: false,
            energetic: false
        };
        
        // Analyze answer distribution
        const answerCounts = [0, 0, 0, 0];
        this.userAnswers.forEach(answer => {
            answerCounts[answer]++;
        });
        
        // Determine dominant patterns
        const totalAnswers = this.userAnswers.length;
        patterns.independent = answerCounts[0] / totalAnswers > 0.3;
        patterns.emotional = answerCounts[1] / totalAnswers > 0.3;
        patterns.reserved = answerCounts[2] / totalAnswers > 0.3;
        patterns.energetic = answerCounts[3] / totalAnswers > 0.3;
        
        return patterns;
    }

    getCompatibilityBreakdown(waifu) {
        const personalityMatch = this.calculatePersonalityMatch(waifu);
        const traitMatch = this.calculateTraitMatch(waifu);
        const psychologicalMatch = this.calculatePsychologicalMatch(waifu);
        const overallScore = this.calculateAdvancedCompatibility(waifu);

        // Calculate user preference boost
        let userPreferenceBoost = 0;
        if (this.userPreferences.likedTraits.length > 0) {
            userPreferenceBoost = waifu.traits.filter(trait =>
                this.userPreferences.likedTraits.includes(trait)
            ).length * 0.1;
        }

        // Calculate seasonal match
        const seasonalMatch = this.checkSeasonalMatch(waifu, this.userPreferences.currentSeasonalPreference);

        return {
            personalityMatch: personalityMatch,
            traitMatch: traitMatch,
            psychologicalMatch: psychologicalMatch,
            overallScore: overallScore,
            userPreferenceBoost: userPreferenceBoost,
            seasonalMatch: seasonalMatch
        };
    }

    findOptimalMatch(compatibilityScores) {
        // Sort by compatibility score and find best match
        compatibilityScores.sort((a, b) => b.score - a.score);
        
        // Apply confidence threshold - ensure match is meaningful
        const topMatch = compatibilityScores[0];
        if (topMatch.score < 0.4) {
            // If no good match, find closest personality type
            return this.findFallbackMatch();
        }
        
        return topMatch.waifu;
    }

    findFallbackMatch() {
        // Fallback to dominant personality type if advanced scoring fails
        const maxScore = Math.max(
            this.personalityScores.tsundere,
            this.personalityScores.deredere,
            this.personalityScores.kuudere,
            this.personalityScores.loli
        );
        
        let dominantType = 'deredere';
        if (this.personalityScores.tsundere === maxScore) dominantType = 'tsundere';
        else if (this.personalityScores.deredere === maxScore) dominantType = 'deredere';
        else if (this.personalityScores.kuudere === maxScore) dominantType = 'kuudere';
        else if (this.personalityScores.loli === maxScore) dominantType = 'loli';
        
        const matchingWaifus = this.waifuList.filter(waifu => waifu.personality === dominantType);
        return matchingWaifus.length > 0 ? matchingWaifus[0] : this.waifuList[0];
    }

    displayResult(waifu) {
        const resultContainer = document.getElementById('waifuResult');
        
        resultContainer.innerHTML = `
            <div class="max-w-4xl mx-auto bg-gray-800 text-gray-100 rounded-xl shadow-2xl overflow-hidden my-8" id="waifu-card">
                <!-- Image Section - Prominent and at the top -->
                <div class="relative bg-gray-900 p-8 pb-20">
                    <img src="${waifu.image}" alt="${waifu.name}" 
                         class="w-full h-72 object-cover object-top rounded-lg shadow-xl mb-6"
                         onerror="this.src='https://picsum.photos/seed/${waifu.name}/800/600.jpg'">
                    <div class="absolute bottom-0 left-0 right-0 px-8 py-6 bg-gradient-to-t from-gray-900 to-transparent">
                        <h2 class="text-4xl font-extrabold leading-tight">${waifu.name}</h2>
                        <p class="text-xl text-gray-300 mt-1">${waifu.anime}</p>
                    </div>
                </div>
    
                <!-- Main Content Area -->
                <div class="p-8">
                    <!-- Personality and Traits Section -->
                    <div class="mb-8">
                        <h3 class="text-2xl font-bold text-purple-400 mb-4">Personality & Traits</h3>
                        <div class="flex flex-wrap gap-3 mb-5">
                            <span class="bg-purple-600 text-white px-5 py-2 rounded-full text-base font-semibold shadow-md">${waifu.personality}</span>
                            ${waifu.traits.map(trait => `
                                <span class="bg-gray-700 text-gray-200 px-5 py-2 rounded-full text-base font-medium">${trait}</span>
                            `).join('')}
                        </div>
                        <p class="text-gray-300 leading-relaxed text-lg">${waifu.description}</p>
                    </div>
    
                    <!-- Metrics Grid Section -->
                    <div class="mb-8">
                        <h3 class="text-2xl font-bold text-green-400 mb-4">Your Compatibility</h3>
                        <div id="metrics-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Metrics will be injected here by generateMetricsGrid -->
                        </div>
                    </div>
    
                    <!-- Action Buttons -->
                    <div class="flex flex-wrap gap-4 justify-center mt-8">
                        <button onclick="downloadWaifuCardAsJPG('${waifu.name}')" 
                                class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                            Download JPG
                        </button>
                        <button onclick="downloadWaifuCardAsGIF('${waifu.name}')" 
                                class="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                            Download GIF (PNG Fallback)
                        </button>
                    </div>
                </div>
            </div>
        `;
        // After setting the innerHTML, inject the metrics grid
        this.generateMetricsGrid(waifu);
    }

    // Simplified metrics for clean design
    generateMetricsGrid(waifu) {
            const metricsGrid = document.getElementById('metrics-grid');
            if (!metricsGrid) return;

            const breakdown = this.getCompatibilityBreakdown(waifu);

            const metrics = [
                { label: 'Personality Match', score: breakdown.personalityMatch, icon: '❤️' },
                { label: 'Trait Compatibility', score: breakdown.traitMatch, icon: '✨' },
                { label: 'Psychological Alignment', score: breakdown.psychologicalMatch, icon: '🧠' },
                { label: 'Overall Compatibility', score: breakdown.overallScore, icon: '🌟' },
                { label: 'User Preference Boost', score: breakdown.userPreferenceBoost, icon: '👍' },
                { label: 'Seasonal Match', score: breakdown.seasonalMatch, icon: '🌸' }
            ];

            metricsGrid.innerHTML = metrics.map(metric => `
                <div class="bg-gray-700 p-5 rounded-lg shadow-md flex items-center space-x-4">
                    <span class="text-3xl">${metric.icon}</span>
                    <div>
                        <p class="text-base font-medium text-gray-300">${metric.label}</p>
                        <p class="text-xl font-bold text-white">${(metric.score * 100).toFixed(1)}%</p>
                    </div>
                </div>
            `).join('');
        }

    // Simplified metrics for clean design
    generateDefaultMetricsGrid() {
        return ""; // Empty since we're showing simple text metrics in the main display
    }

    animateMetrics() {
        // Animation removed for cleaner design
    }
}

async function downloadWaifuCardAsJPG(waifuName) {
    try {
        // Show loading indicator
        const downloadBtn = event.target;
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Loading...';
        downloadBtn.disabled = true;
        
        // Find waifu data
        const waifuData = this.waifuList.find(w => w.name === waifuName);
        
        // Position clone off-screen for capture
        cardClone.style.position = 'absolute';
        cardClone.style.left = '-9999px';
        cardClone.style.top = '0';
        cardClone.style.width = originalCard.offsetWidth + 'px';
        
        // Reset all colors to avoid oklch color issues
        const allElements = cardClone.querySelectorAll('*');
        allElements.forEach(element => {
            element.style.color = '';
            element.style.backgroundColor = '';
            element.style.border = '';
        });
        
        // Apply safe colors to the clone
        cardClone.style.backgroundColor = '#ffffff';
        cardClone.style.color = '#000000';
        
        // Fix specific elements that might have problematic colors
        const bgElements = cardClone.querySelectorAll('.bg-anime-red');
        bgElements.forEach(el => {
            el.style.backgroundColor = '#DC2626';
            el.style.color = '#ffffff';
        });
        
        const textElements = cardClone.querySelectorAll('h1, h2, h3, p, span');
        textElements.forEach(el => {
            if (!el.style.color) {
                el.style.color = '#000000';
            }
        });
        
        document.body.appendChild(cardClone);
        
        // Use html2canvas library to capture the entire card
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }
        
        // Configure canvas options for high quality
        const canvas = await html2canvas(cardClone, {
            scale: 2, // Higher resolution
            useCORS: true, // Enable cross-origin image loading
            allowTaint: false,
            backgroundColor: '#ffffff',
            logging: false,
            ignoreElements: (element) => {
                // Ignore elements with problematic color functions
                const style = window.getComputedStyle(element);
                return style.color && style.color.includes('oklch') || 
                       style.backgroundColor && style.backgroundColor.includes('oklch');
            }
        });
        
        // Remove the clone
        document.body.removeChild(cardClone);
        
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
        // Show detailed error message
        alert(`Failed to download card. Error: ${error.message || 'Unknown error'}. Please try again.`);
        
        // Restore button
        if (event.target) {
            event.target.textContent = 'Download';
            event.target.disabled = false;
        }
    }
}

async function downloadWaifuCardAsGIF(waifuName) {
    try {
        // Use html2canvas library to capture the entire card
        const cardElement = document.getElementById('waifu-card');
        
        // Check if html2canvas is available, if not, load it
        if (typeof html2canvas === 'undefined') {
            await loadHtml2Canvas();
        }
        
        // Configure canvas options for high quality
        const canvas = await html2canvas(cardElement, {
            scale: 2, // Higher resolution
            useCORS: true, // Enable cross-origin image loading
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: cardElement.offsetWidth,
            height: cardElement.offsetHeight
        });
        
        // Convert to PNG first (as GIF conversion is more complex)
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `${waifuName.replace(/\s+/g, '_')}_waifu_card.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
            // Note: True GIF conversion would require additional libraries
            // For now, we're downloading as PNG which can be converted to GIF
            alert('Downloaded as PNG. You can convert to GIF using an image editor.');
        }, 'image/png', 0.9); // 90% quality
        
    } catch (error) {
        console.error('Error downloading waifu card:', error);
        // Show user-friendly error message
        alert('Failed to download card. Please try again later.');
    }
}

async function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        // Check if already loading
        if (window.html2CanvasLoading) {
            // Wait for it to finish
            const checkInterval = setInterval(() => {
                if (!window.html2CanvasLoading) {
                    clearInterval(checkInterval);
                    if (typeof html2canvas !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('Failed to load html2canvas'));
                    }
                }
            }, 100);
            return;
        }
        
        window.html2CanvasLoading = true;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.onload = () => {
            window.html2CanvasLoading = false;
            resolve();
        };
        script.onerror = () => {
            window.html2CanvasLoading = false;
            reject(new Error('Failed to load html2canvas library'));
        };
        document.head.appendChild(script);
    });
}

function shareResult(waifuName) {
    if (navigator.share) {
        navigator.share({
            title: `My Waifu Match: ${waifuName}`,
            text: `I got matched with ${waifuName} in the AnimeVerse waifu personality quiz! Find your perfect waifu match too!`,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        const text = `I got matched with ${waifuName} in the AnimeVerse waifu personality quiz! Find your perfect waifu match too!`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Share text copied to clipboard!');
        });
    }
}