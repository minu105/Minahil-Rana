class StorageManager {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    static saveUser(userData) {
        this.setItem('currentUser', userData);
        const users = this.getItem('users') || [];
        const existingUserIndex = users.findIndex(user => user.email === userData.email);
        
        if (existingUserIndex >= 0) {
            users[existingUserIndex] = userData;
        } else {
            users.push(userData);
        }
        
        this.setItem('users', users);
    }

    static getCurrentUser() {
        return this.getItem('currentUser');
    }

    static getUserByEmail(email) {
        const users = this.getItem('users') || [];
        return users.find(user => user.email === email);
    }

    static logout() {
        this.removeItem('currentUser');
    }
    static saveQuizResult(result) {
        const results = this.getItem('quizResults') || [];
        results.push({
            ...result,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        this.setItem('quizResults', results);
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.quizHistory = currentUser.quizHistory || [];
            currentUser.quizHistory.push({
                quizId: result.quizId,
                score: result.score,
                totalQuestions: result.totalQuestions,
                date: new Date().toISOString().split('T')[0],
                percentage: Math.round((result.score / result.totalQuestions) * 100)
            });
            this.saveUser(currentUser);
        }
    }

    static getQuizResults() {
        return this.getItem('quizResults') || [];
    }

    static getUserQuizHistory(userEmail) {
        const user = this.getUserByEmail(userEmail);
        return user ? (user.quizHistory || []) : [];
    }
}
