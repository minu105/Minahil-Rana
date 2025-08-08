class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.timer = null;
        this.timeRemaining = 30; 
        this.startTime = null;
    }

    startQuiz(quizId) {
        this.currentQuiz = QUIZ_DATA[quizId];
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.startTime = Date.now();
        this.resetTimer();
    }

    getCurrentQuestion() {
        if (!this.currentQuiz) return null;
        return this.currentQuiz.questions[this.currentQuestionIndex];
    }

    answerQuestion(answerIndex) {
        if (!this.currentQuiz) return;
        this.userAnswers[this.currentQuestionIndex] = answerIndex;
    }

    nextQuestion() {
        if (!this.currentQuiz) return false;
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.resetTimer();
            return true;
        }
        return false;
    }

    previousQuestion() {
        if (!this.currentQuiz) return false;
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.resetTimer();
            return true;
        }
        return false;
    }

    resetTimer() {
        this.timeRemaining = 30;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    startTimer(onTick, onTimeout) {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            onTick(this.timeRemaining);
            
            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                onTimeout();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    calculateResults() {
        if (!this.currentQuiz) return null;

        let score = 0;
        const incorrectAnswers = [];

        this.currentQuiz.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = userAnswer === question.correct;
            
            if (isCorrect) {
                score++;
            } else {
                incorrectAnswers.push({
                    question: question.question,
                    userAnswer: userAnswer !== null ? question.options[userAnswer] : 'No answer',
                    correctAnswer: question.options[question.correct],
                    questionIndex: index + 1
                });
            }
        });

        const result = {
            quizId: this.currentQuiz.id,
            quizTitle: this.currentQuiz.title,
            score,
            totalQuestions: this.currentQuiz.questions.length,
            percentage: Math.round((score / this.currentQuiz.questions.length) * 100),
            incorrectAnswers,
            timeSpent: Math.round((Date.now() - this.startTime) / 1000),
            userAnswers: this.userAnswers
        };
        StorageManager.saveQuizResult(result);

        return result;
    }

    getProgress() {
        if (!this.currentQuiz) return 0;
        return ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
    }

    isLastQuestion() {
        if (!this.currentQuiz) return false;
        return this.currentQuestionIndex === this.currentQuiz.questions.length - 1;
    }

    isFirstQuestion() {
        return this.currentQuestionIndex === 0;
    }


    
}
