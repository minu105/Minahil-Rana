class AuthManager {
    static signup(userData) {
        const { name, email, password, confirmPassword } = userData;

        if (!name || !email || !password || !confirmPassword) {
            throw new Error('All fields are required');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        const existingUser = StorageManager.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const newUser = {
            name,
            email,
            password,
            joinDate: new Date().toISOString().split('T')[0],
            quizHistory: [],
            bio: 'Quiz enthusiast and knowledge seeker!'
        };

        StorageManager.saveUser(newUser);
        return newUser;
    }

    static signin(credentials) {
        const { email, password } = credentials;

        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = StorageManager.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        StorageManager.saveUser(user);
        return user;
    }

    static logout() {
        StorageManager.logout();
    }

    static getCurrentUser() {
        return StorageManager.getCurrentUser();
    }

    static isAuthenticated() {
        return !!this.getCurrentUser();
    }

    static updateUser(updatedUser) {
        StorageManager.saveUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    static deleteUser(userToDelete) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(u => u.email !== userToDelete.email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        localStorage.removeItem('auth_user');
        localStorage.removeItem('currentUser');
    }
}
