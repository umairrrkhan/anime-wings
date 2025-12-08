// Configuration: Customize the number of questions in the quiz
// Change this value to set how many questions to use (1-16)
const QUIZ_QUESTION_COUNT = 16; // Default: 16 questions

class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.waifuMatcher = null;
        this.isQuizActive = false;
        this.init();
    }

    async init() {
        await this.loadQuestionData();
        await this.loadSavedProgress();
    }

    async loadQuestionData() {
        try {
            const response = await fetch('data/questions.json');
            const allQuestions = await response.json();
            
            // Use only the specified number of questions
            this.questions = allQuestions.slice(0, QUIZ_QUESTION_COUNT);
            
            console.log(`Loaded ${this.questions.length} questions for the quiz`);
        } catch (error) {
            console.error('Error loading question data:', error);
        }
    }

    async startQuiz() {
        // Initialize waifuMatcher if not already initialized
        if (!this.waifuMatcher) {
            this.waifuMatcher = new WaifuMatcher();
            await this.waifuMatcher.loadWaifuData();
        }
        
        this.isQuizActive = true;
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.questions.length);
        this.showQuestion();
        this.updateUI();
        
        // Hide start container, show quiz container
        document.getElementById('startContainer').classList.add('hidden');
        document.getElementById('quizContainer').classList.remove('hidden');
        document.getElementById('resultsContainer').classList.add('hidden');
    }

    showQuestion() {
        const questionContainer = document.getElementById('questionContainer');
        const currentQuestion = this.questions[this.currentQuestionIndex];
        
        questionContainer.innerHTML = `
            <div class="space-y-4">
                <h4 class="text-lg md:text-xl font-semibold mb-4">${currentQuestion.question}</h4>
                <div class="space-y-3">
                    ${currentQuestion.options.map((option, index) => `
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer ${this.userAnswers[this.currentQuestionIndex] === index ? 'bg-red-50 border-anime-red' : 'border-gray-300'}">
                            <input type="radio" name="answer" value="${index}" ${this.userAnswers[this.currentQuestionIndex] === index ? 'checked' : ''} onchange="quizManager.selectAnswer(${index})" class="mr-3">
                            <span class="text-sm md:text-base">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Update progress
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;
        document.getElementById('progressBar').style.width = `${((this.currentQuestionIndex + 1) / this.questions.length) * 100}%`;
        
        // Update button states
        document.getElementById('prevBtn').disabled = this.currentQuestionIndex === 0;
        document.getElementById('nextBtn').textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Get Result' : 'Next';
        
        // Save progress
        this.saveProgress();
    }

    selectAnswer(answerIndex) {
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
        
        // Update visual feedback
        const labels = document.querySelectorAll('#questionContainer label');
        labels.forEach((label, index) => {
            if (index === answerIndex) {
                label.classList.add('bg-red-50', 'border-anime-red');
                label.classList.remove('border-gray-300');
            } else {
                label.classList.remove('bg-red-50', 'border-anime-red');
                label.classList.add('border-gray-300');
            }
        });
        
        // Save progress
        this.saveProgress();
    }

    nextQuestion() {
        // Check if current question is answered
        if (this.userAnswers[this.currentQuestionIndex] === undefined) {
            this.showNotification('Please select an answer before continuing');
            return;
        }
        
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.calculateAndShowResult();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    calculateAndShowResult() {
        // Filter out undefined answers (can happen when reducing question count)
        const filteredAnswers = this.userAnswers.filter(answer => answer !== undefined);
        
        // Make sure we have answers for all questions
        if (filteredAnswers.length < this.questions.length) {
            this.showNotification('Please answer all questions before getting results');
            return;
        }
        
        // Calculate waifu match
        this.waifuMatcher.userAnswers = filteredAnswers;
        const matchedWaifu = this.waifuMatcher.calculateWaifuMatch();
        
        // Show result
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');
        this.waifuMatcher.displayResult(matchedWaifu);
        
        // Removed metrics animation for cleaner design
        
        // Update quiz count
        this.updateQuizCount();
        
        // Clear saved progress
        this.clearProgress();
        
        // Save result to history
        this.saveResult(matchedWaifu);
    }

    updateUI() {
        document.getElementById('currentQuestion').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.questions.length;
        document.getElementById('progressBar').style.width = `${((this.currentQuestionIndex + 1) / this.questions.length) * 100}%`;
        
        // Update button text on last question
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.textContent = this.currentQuestionIndex === this.questions.length - 1 ? 'Get Result' : 'Next';
        }
        
        // Update previous button state
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
    }

    saveProgress() {
        const progress = {
            currentQuestionIndex: this.currentQuestionIndex,
            userAnswers: this.userAnswers,
            isQuizActive: this.isQuizActive
        };
        localStorage.setItem('waifuQuizProgress', JSON.stringify(progress));
    }

    async loadSavedProgress() {
        const savedProgress = localStorage.getItem('waifuQuizProgress');
        if (savedProgress) {
            try {
                // Initialize waifuMatcher if not already initialized
                if (!this.waifuMatcher) {
                    this.waifuMatcher = new WaifuMatcher();
                    await this.waifuMatcher.loadWaifuData();
                }
                
                const progress = JSON.parse(savedProgress);
                if (progress.isQuizActive) {
                    // Make sure the currentQuestionIndex is valid for the current quiz
                    this.currentQuestionIndex = Math.min(progress.currentQuestionIndex, this.questions.length - 1);
                    
                    // Make sure userAnswers array matches the current quiz length
                    this.userAnswers = progress.userAnswers ? 
                        progress.userAnswers.slice(0, this.questions.length) : 
                        new Array(this.questions.length);
                    
                    this.isQuizActive = true;
                    
                    // Resume quiz if it was in progress
                    document.getElementById('startContainer').classList.add('hidden');
                    document.getElementById('quizContainer').classList.remove('hidden');
                    this.showQuestion();
                }
            } catch (e) {
                console.error('Error loading saved progress:', e);
                // Clear corrupted progress
                this.clearProgress();
            }
        }
    }

    clearProgress() {
        localStorage.removeItem('waifuQuizProgress');
        this.isQuizActive = false;
    }

    updateQuizCount() {
        const currentCount = parseInt(localStorage.getItem('quizCount') || '0');
        const newCount = currentCount + 1;
        localStorage.setItem('quizCount', newCount.toString());
        
        // Update display if statistics section exists
        const quizCountElement = document.getElementById('quizCount');
        if (quizCountElement) {
            quizCountElement.textContent = newCount;
        }
    }

    saveResult(waifu) {
        const results = JSON.parse(localStorage.getItem('waifuResults') || '[]');
        results.push({
            waifuName: waifu.name,
            waifuId: waifu.id,
            date: new Date().toISOString(),
            answers: [...this.userAnswers]
        });
        
        // Keep only last 10 results
        if (results.length > 10) {
            results.shift();
        }
        
        localStorage.setItem('waifuResults', JSON.stringify(results));
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-anime-red text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

async function startQuiz() {
    // Initialize quizManager if not already initialized
    if (!window.quizManager) {
        window.quizManager = new QuizManager();
    }
    
    // Start the quiz
    await window.quizManager.startQuiz();
}

function nextQuestion() {
    if (window.quizManager) {
        window.quizManager.nextQuestion();
    }
}

function previousQuestion() {
    if (window.quizManager) {
        window.quizManager.previousQuestion();
    }
}

function retakeQuiz() {
    if (window.quizManager) {
        // Reset quiz state
        window.quizManager.currentQuestionIndex = 0;
        window.quizManager.userAnswers = [];
        window.quizManager.isQuizActive = false;
        
        // Show start container, hide results
        document.getElementById('startContainer').classList.remove('hidden');
        document.getElementById('quizContainer').classList.add('hidden');
        document.getElementById('resultsContainer').classList.add('hidden');
        
        // Clear any saved progress
        window.quizManager.clearProgress();
    }
}

