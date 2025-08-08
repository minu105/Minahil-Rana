class QuizApp {
    constructor() {
        this.currentPage = 'landing';
        this.quizManager = new QuizManager();
        this.currentQuizResult = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCurrentPage();
    }

    setupEventListeners() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.currentPage = e.state.page;
                this.renderCurrentPage();
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-navigate');
                this.navigateTo(page);
            }
        });
    }

    navigateTo(page, data = null) {
        this.currentPage = page;
        if (data) {
            this.pageData = data;
        }

        history.pushState({ page }, '', `#${page}`);
        
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        const mainContent = document.getElementById('main-content');
        
        switch (this.currentPage) {
            case 'landing':
                this.renderLandingPage();
                break;
            case 'signup':
                this.renderSignupPage();
                break;
            case 'signin':
                this.renderSigninPage();
                break;
            case 'profile':
                this.renderProfilePage();
                break;
            case 'quizzes':
                this.renderQuizzesPage();
                break;
            case 'quiz':
                this.renderQuizPage();
                break;
            case 'results':
                this.renderResultsPage();
                break;
            case 'review':
                this.renderReviewPage();
                break;
            default:
                this.renderLandingPage();
        }

        this.updateNavigation();
    }

updateNavigation() {
    const isAuthenticated = AuthManager.isAuthenticated();
    const currentUser = AuthManager.getCurrentUser();

    const desktopLinks = document.getElementById('nav-links');
    const desktopActions = document.getElementById('nav-actions');
    const mobileLinks = document.getElementById('mobile-nav-links');
    const mobileActions = document.getElementById('mobile-nav-actions');

    if (isAuthenticated) {
        const linksHTML = `
            <a href="#" data-navigate="landing" class="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Home</a>
            <a href="#" data-navigate="quizzes" class="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Quizzes</a>
            <a href="#" data-navigate="profile" class="block text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Profile</a>
        `;

        const profileIcon = currentUser.profileImage
            ? `<img src="${currentUser.profileImage}" alt="Profile" class="w-full h-full object-cover rounded-full">`
            : `<span class="text-white text-sm font-semibold flex items-center justify-center w-full h-full">${currentUser.name.charAt(0).toUpperCase()}</span>`;

        const actionsHTML = `
            <div class="flex items-center space-x-3">
                <div class="relative w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden cursor-pointer" data-navigate="profile">
                    ${profileIcon}
                </div>
                <button onclick="app.logout()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Logout
                </button>
            </div>
        `;

        desktopLinks.innerHTML = linksHTML;
        mobileLinks.innerHTML = linksHTML;

        desktopActions.innerHTML = actionsHTML;
        mobileActions.innerHTML = actionsHTML;
    } else {
        desktopLinks.innerHTML = '';
        mobileLinks.innerHTML = '';

        const actionsHTML = `
            <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-3">
                <a href="#" data-navigate="signin" class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">Sign In</a>
                <a href="#" data-navigate="signup" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Sign Up</a>
            </div>
        `;

        desktopActions.innerHTML = actionsHTML;
        mobileActions.innerHTML = actionsHTML;
    }
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.onclick = () => {
            mobileNav.classList.toggle('hidden');
        };
    }
}


// LANDING PAGE //
renderLandingPage() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <style>
            /* Custom keyframes for animation */
            @keyframes fadeInUp {
                0% {
                    opacity: 0;
                    transform: translateY(20px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .animate-fade-in-up {
                animation: fadeInUp 0.8s ease-out forwards;
            }
        </style>

        <!-- Hero Section -->
        <section class="w-full px-4 mt-10 max-w-7xl mx-auto py-8 animate-fade-in-up">
            <div class="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-lg relative group transition-transform duration-500">
                <img src="./images/bg.png" alt="QuizMaster Background" class="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-black/30 flex items-center justify-center px-6">
                    <div class="text-white text-center max-w-2xl mt-16">
                        <h1 class="text-4xl md:text-5xl font-bold mb-4 transition-opacity duration-700">Welcome to QuizMaster</h1>
                        <p class="text-base md:text-lg mb-6 opacity-90">
                            Test your knowledge with our engaging quizzes. Compete with friends and climb the leaderboard. Start your quiz journey today!
                        </p>
                        <button data-navigate="${AuthManager.isAuthenticated() ? 'quizzes' : 'signup'}"
                            class="bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white text-sm md:text-base font-semibold px-5 py-3 rounded-md shadow hover:shadow-lg transform hover:scale-105">
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="w-full bg-white py-20 px-4 animate-fade-in-up">
            <div class="max-w-5xl mx-auto">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Key Features</h2>
                <p class="text-gray-600 text-sm md:text-base mb-12">
                    Explore the exciting features that make QuizMaster the ultimate quiz app.
                </p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Feature 1 -->
                    <div class="bg-white p-5 border border-gray-200 rounded-lg shadow-sm text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                        <div class="mb-4">
                            <img src="./images/landing1.png" alt="Timer Icon" class="w-6 h-6">
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Timed Quizzes</h3>
                        <p class="text-gray-600 text-sm">
                            Challenge yourself with timed quizzes to test your speed and accuracy.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div class="bg-white p-5 border border-gray-200 rounded-lg shadow-sm text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                        <div class="mb-4">
                            <img src="./images/landing2.png" alt="Trophy Icon" class="w-6 h-6">
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Leaderboard</h3>
                        <p class="text-gray-600 text-sm">
                            Compete with friends and other users to see who can achieve the highest scores.
                        </p>
                    </div>

                    <!-- Feature 3 -->
                    <div class="bg-white p-5 border border-gray-200 rounded-lg shadow-sm text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                        <div class="mb-4">
                            <img src="./images/landing3.png" alt="Progress Icon" class="w-6 h-6">
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
                        <p class="text-gray-600 text-sm">
                            Track your progress and see how you improve over time with detailed performance reports.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    `;
}


// SIGN UP PAGE  //
    renderSignupPage() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                        <p class="text-gray-600">Join QuizMaster and start your learning journey</p>
                    </div>
                    
                    <form id="signup-form" class="mt-8 space-y-6">
                        <div class="space-y-4">
                            <div>
                                <input type="text" id="signup-name" name="name" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Full Name">
                            </div>
                            <div>
                                <input type="email" id="signup-email" name="email" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Email">
                            </div>
                            <div>
                                <input type="password" id="signup-password" name="password" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Password">
                            </div>
                            <div>
                                <input type="password" id="signup-confirm-password" name="confirmPassword" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Confirm Password">
                            </div>
                        </div>

                        <div id="signup-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>

                        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            Sign Up
                        </button>

                        <div class="text-center">
                            <span class="text-gray-600">Already have an account? </span>
                            <a href="#" data-navigate="signin" class="text-blue-500 hover:text-blue-600 font-medium">Sign in</a>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }

    // SIGNIN PAGE //
    renderSigninPage() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-md w-full space-y-8">
                    <div class="text-center">
                        <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                        <p class="text-gray-600">Sign in to continue your quiz journey</p>
                    </div>
                    
                    <form id="signin-form" class="mt-8 space-y-6">
                        <div class="space-y-4">
                            <div>
                                <input type="email" id="signin-email" name="email" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Email">
                            </div>
                            <div>
                                <input type="password" id="signin-password" name="password" required
                                       class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Password">
                            </div>
                        </div>

                        <div class="text-right">
                            <a href="#" class="text-sm text-blue-500 hover:text-blue-600">Forgot password?</a>
                        </div>

                        <div id="signin-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"></div>

                        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            Log in
                        </button>

                        <div class="text-center">
                            <span class="text-gray-600">Don't have an account? </span>
                            <a href="#" data-navigate="signup" class="text-blue-500 hover:text-blue-600 font-medium">Sign up</a>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('signin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignin();
        });
    }


// PROFILE PAGE //
renderProfilePage() {
    if (!AuthManager.isAuthenticated()) {
        this.navigateTo('signin');
        return;
    }

    const user = AuthManager.getCurrentUser();
    const quizHistory = user.quizHistory || [];

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <style>
            @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out forwards;
            }
        </style>

        <div class="max-w-7xl mx-auto py-8 px-4 animate-fade-in-up">
            <div class="bg-white rounded-lg shadow-sm p-8 mb-8 transition-all duration-500 hover:shadow-md">
                <div class="text-center">
                    <div class="relative w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden cursor-pointer transition-transform transform hover:scale-105 duration-300" id="profile-image-wrapper">
                        ${user.profileImage
                            ? `<img src="${user.profileImage}" class="w-full h-full object-cover rounded-full" alt="Profile">`
                            : `
                                <span class="text-3xl text-white font-bold">${user.name.charAt(0).toUpperCase()}</span>
                                <div class="absolute bottom-1 right-1 bg-white bg-opacity-80 text-xs text-gray-800 px-6 py-0.5 rounded shadow">
                                    Upload
                                </div>
                            `}
                        <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" id="profile-image-upload" />
                    </div>

                    <h1 class="text-3xl font-bold text-gray-900 mb-2 transition-opacity duration-500">${user.name}</h1>
                    <p class="text-gray-600 mb-2">Quiz Enthusiast</p>
                    <p class="text-sm text-gray-500">Joined ${user.joinDate}</p>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-sm transition-all duration-500 hover:shadow-md">
                <div class="border-b border-gray-200">
                    <nav class="flex space-x-8 px-8">
                        <button class="profile-tab active py-4 px-1 border-b-2 border-blue-500 font-medium text-blue-600 transition duration-300 hover:text-blue-700" data-tab="profile">
                            Profile
                        </button>
                        <button class="profile-tab py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 hover:text-gray-700 transition duration-300" data-tab="activity">
                            Activity
                        </button>
                    </nav>
                </div>
                <div id="profile-tab-content" class="tab-content p-8">
                    <div id="profileInfoSection">
                        <h3 class="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
                        <div id="profile-view" class="grid md:grid-cols-2 gap-6 mb-8 transition-opacity duration-300">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <p class="text-gray-900">${user.name}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <p class="text-gray-900">${user.email}</p>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <p class="text-gray-900">${user.bio || '—'}</p>
                            </div>
                            <div class="md:col-span-2 text-right">
                                <button id="editProfileBtn" class="text-blue-500 hover:text-blue-700 transition duration-200 transform hover:scale-105">✏️ Edit Profile</button>
                            </div>
                        </div>

                        <div id="profile-edit" class="hidden">
                            <div class="grid md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input id="editName" type="text" value="${user.name}" class="w-full px-3 py-2 border rounded-md text-gray-900">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <p class="text-gray-900">${user.email}</p>
                                </div>
                            </div>

                            <div class="mb-8">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea id="editBio" rows="3" class="w-full px-3 py-2 border rounded-md text-gray-700">${user.bio || ''}</textarea>
                            </div>

                            <div class="text-right">
                                <button id="saveProfileBtn" class="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition duration-200 transform hover:scale-105">Save Changes</button>
                            </div>
                        </div>

                        <div id="profileUpdateMessage" class="mt-4 text-green-600 text-sm font-medium hidden">
                            ✅ Profile updated successfully!
                        </div>
                    </div>

                    <h3 class="text-xl font-semibold text-gray-900 mb-6">Quiz History</h3>

                    ${
                        quizHistory.length > 0
                            ? `
                        <div class="overflow-x-auto transition-opacity duration-300">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz Name</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    ${quizHistory
                                        .slice(-5)
                                        .reverse()
                                        .map(
                                            quiz => `
                                        <tr class="hover:bg-gray-100  transform hover:scale-[1.01]">
                                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${QUIZ_DATA[quiz.quizId]?.title || 'Unknown Quiz'}
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${quiz.score}/${quiz.totalQuestions} (${quiz.percentage}%)
                                            </td>
                                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ${quiz.date}
                                            </td>
                                        </tr>
                                    `
                                        )
                                        .join('')}
                                </tbody>
                            </table>
                        </div>
                    `
                            : `
                        <div class="text-center py-8">
                            <p class="text-gray-500">No quiz history yet. <a href="#" data-navigate="quizzes" class="text-blue-500 hover:text-blue-600 transition duration-200">Take your first quiz!</a></p>
                        </div>
                    `
                    }
                </div>

                <div id="activity-tab-content" class="tab-content p-8 hidden">
                    <h3 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>

                    ${
                        quizHistory.length > 0
                            ? `
                        <div class="space-y-4">
                            ${quizHistory
                                .slice(-10)
                                .reverse()
                                .map(
                                    quiz => `
                                <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:shadow-lg transition-transform duration-300 transform hover:scale-[1.01]">
                                    <div class="flex-shrink-0">
                                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span class="text-white text-sm font-bold">🎯</span>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-900">
                                            Completed ${QUIZ_DATA[quiz.quizId]?.title || 'Unknown Quiz'}
                                        </p>
                                        <p class="text-sm text-gray-500">
                                            Scored ${quiz.score}/${quiz.totalQuestions} (${quiz.percentage}%) • ${quiz.date}
                                        </p>
                                    </div>
                                </div>
                            `
                                )
                                .join('')}
                        </div>
                    `
                            : `
                        <div class="text-center py-8">
                            <p class="text-gray-500">No activity yet. Start taking quizzes to see your activity here!</p>
                        </div>
                    `
                    }
                </div>
            </div>

            <div class="mt-16 text-center border-t pt-8 animate-fade-in-up">
                <h3 class="text-xl font-semibold text-red-600 mb-4">Danger Zone</h3>
                <p class="text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button id="deleteAccountBtn" class="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 transition duration-200 transform hover:scale-105">
                    Delete My Account
                </button>
            </div>
        </div>
    `;
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', e => {
            const tabName = e.target.getAttribute('data-tab');
            document.querySelectorAll('.profile-tab').forEach(t => {
                t.classList.remove('active', 'border-blue-500', 'text-blue-600');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            e.target.classList.add('active', 'border-blue-500', 'text-blue-600');
            e.target.classList.remove('border-transparent', 'text-gray-500');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
            document.getElementById(`${tabName}-tab-content`).classList.remove('hidden');
        });
    });
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('profile-view').classList.add('hidden');
            document.getElementById('profile-edit').classList.remove('hidden');
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const updatedUser = {
                ...user,
                name: document.getElementById('editName').value.trim(),
                bio: document.getElementById('editBio').value.trim()
            };
            AuthManager.updateUser(updatedUser);

            const msg = document.getElementById('profileUpdateMessage');
            msg.classList.remove('hidden');
            msg.textContent = '✅ Profile updated successfully!';

            setTimeout(() => {
                this.renderProfilePage();
            }, 1000);
        });
    }
    const profileImageInput = document.getElementById('profile-image-upload');

    if (profileImageInput) {
        profileImageInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    user.profileImage = event.target.result;
                    AuthManager.updateUser(user);

                    const imgElement = document.querySelector('#profile-image-wrapper img');
                    if (imgElement) {
                        imgElement.src = event.target.result;
                    }

                    setTimeout(() => {
                        mainContent.scrollIntoView({ behavior: 'smooth' });
                        this.renderProfilePage();
                    }, 200);
                }.bind(this);
                reader.readAsDataURL(file);
            }
        });
    }
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const confirmed = confirm('⚠️ Are you sure you want to delete your account? This action is irreversible.');
            if (confirmed) {
                AuthManager.logout();
                if (typeof AuthManager.deleteUser === 'function') {
                    AuthManager.deleteUser(user);
                }
                localStorage.removeItem('auth_user');
                alert('Your account has been deleted.');
                this.navigateTo('signin');
            }
        });
    }
}

// QUIZZES PAGE //
renderQuizzesPage() {
    if (!AuthManager.isAuthenticated()) {
        this.navigateTo('signin');
        return;
    }

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <style>
            @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out forwards;
            }
        </style>

        <div class="max-w-7xl mx-auto py-8 px-4 animate-fade-in-up">
            <!-- Page Title + Filters -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Select a Quiz</h1>
                <div class="flex flex-wrap gap-2 mb-6">
                    <button class="category-filter active px-4 py-2 rounded-full text-sm font-medium bg-blue-500 text-white transition transform hover:scale-105" data-category="all">
                        All
                    </button>
                    <button class="category-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105" data-category="web-development">
                        Web Development
                    </button>
                    <button class="category-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition transform hover:scale-105" data-category="programming">
                        Programming
                    </button>
                </div>
            </div>

            <!-- Featured Quizzes -->
            <div class="mb-12">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">Featured Quizzes</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    ${FEATURED_QUIZZES.map(quizId => {
                        const quiz = QUIZ_DATA[quizId];
                        return `
                            <div class="quiz-card bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition transform hover:scale-[1.02] hover:shadow-md" onclick="app.startQuiz('${quizId}')">
                                <div class="h-32 bg-cover bg-center" style="background-image: url('${quiz.image}')"></div>
                                <div class="p-6">
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
                                    <p class="text-sm text-gray-600 mb-4">${quiz.description}</p>
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${quiz.category}</span>
                                        <span class="text-xs text-gray-500">${quiz.questions.length} questions</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- All Quizzes -->
            <div>
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">All Quizzes</h2>
                <div id="quiz-grid" class="flex flex-col gap-6">
                    ${Object.values(QUIZ_DATA).map(quiz => `
                        <div class="quiz-card flex flex-col md:flex-row items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition transform hover:scale-[1.01] hover:shadow-md"
                             data-category="${quiz.category.toLowerCase().replace(' ', '-')}"
                             onclick="app.startQuiz('${quiz.id}')">
                             
                            <!-- Text Content -->
                            <div class="p-6 flex-1 text-left w-full">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
                                <p class="text-sm text-gray-600 mb-4">${quiz.description}</p>
                                <div class="flex items-center justify-between">
                                    <span class="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">${quiz.category}</span>
                                    <span class="text-xs text-gray-500">${quiz.questions.length} questions</span>
                                </div>
                            </div>

                            <!-- Image -->
                            <div class="md:w-48 w-full h-32 md:h-24 flex-shrink-0 p-2 md:p-0 md:pr-4">
                                <img src="${quiz.image}" alt="${quiz.title}" class="w-full h-full object-cover rounded-lg md:rounded-r-lg md:rounded-l-none">
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            const category = e.target.getAttribute('data-category');
            document.querySelectorAll('.category-filter').forEach(f => {
                f.classList.remove('active', 'bg-blue-500', 'text-white');
                f.classList.add('bg-gray-200', 'text-gray-700');
            });
            e.target.classList.add('active', 'bg-blue-500', 'text-white');
            e.target.classList.remove('bg-gray-200', 'text-gray-700');
            const quizCards = document.querySelectorAll('#quiz-grid .quiz-card');
            quizCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// QUIZ PAGE //
renderQuizPage() {
    if (!AuthManager.isAuthenticated()) {
        this.navigateTo('signin');
        return;
    }

    const question = this.quizManager.getCurrentQuestion();
    if (!question) {
        this.navigateTo('quizzes');
        return;
    }

    const progress = this.quizManager.getProgress();
    const questionNumber = this.quizManager.currentQuestionIndex + 1;
    const totalQuestions = this.quizManager.currentQuiz.questions.length;
    const userAnswer = this.quizManager.userAnswers[this.quizManager.currentQuestionIndex];

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="max-w-4xl mx-auto py-8 px-4">
            <!-- Progress Bar -->
            <div class="mb-8">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-gray-700">Question ${questionNumber} of ${totalQuestions}</span>
                    <span class="text-sm text-gray-500">${Math.round(progress)}% Complete</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="progress-bar bg-black h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                </div>
            </div>

            <!-- Timer -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center space-x-6 bg-white rounded-lg shadow-sm p-6 w-full max-w-xl mx-auto">
                    <div class="text-center">
                        <div id="timer-hours" class="timer-display text-3xl font-bold text-gray-900">00</div>
                        <div class="text-xs text-gray-500">Hours</div>
                    </div>
                    <div class="text-center">
                        <div id="timer-minutes" class="timer-display text-3xl font-bold text-gray-900">00</div>
                        <div class="text-xs text-gray-500">Minutes</div>
                    </div>
                    <div class="text-center">
                        <div id="timer-seconds" class="timer-display text-3xl font-bold text-gray-900 timer-pulse">30</div>
                        <div class="text-xs text-gray-500">Seconds</div>
                    </div>
                </div>
            </div>

            <!-- Question -->
            <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
                <h2 class="question-text text-2xl font-semibold text-gray-900 mb-8">${question.question}</h2>
                <div class="space-y-4">
                    ${question.options.map((option, index) => `
                        <button class="option-button w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                                data-index="${index}">
                            <div class="flex items-center">
                                <div class="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center mr-4 option-circle ${userAnswer === index ? 'bg-black border-black' : ''}">
                                    ${userAnswer === index ? '<div class="w-2 h-2 bg-white rounded-full"></div>' : ''}
                                </div>
                                <span class="text-gray-900">${option}</span>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between items-center">
                <button id="prev-btn" 
                        onclick="app.previousQuestion()"
                        class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${this.quizManager.isFirstQuestion() ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${this.quizManager.isFirstQuestion() ? 'disabled' : ''}>
                    Previous
                </button>

                <div class="flex gap-4">
                    <button id="skip-btn" 
                            class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200">
                        Skip
                    </button>

                    <button id="next-btn"
                            class="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors duration-200">
                        ${this.quizManager.isLastQuestion() ? 'Finish Quiz' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.querySelectorAll('.option-button').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            this.selectAnswer(index);
        });
    });
    const nextBtn = document.getElementById('next-btn');
    nextBtn.addEventListener('click', () => {
        const selectedAnswer = this.quizManager.userAnswers[this.quizManager.currentQuestionIndex];
        if (selectedAnswer === null || selectedAnswer === undefined) {
            alert('Please select an option or click "Skip" to continue.');
            return;
        }
        this.nextQuestion();
    });
    document.getElementById('skip-btn').addEventListener('click', () => {
        this.nextQuestion();
    });
    this.quizManager.startTimer(
        (timeRemaining) => {
            const seconds = document.getElementById('timer-seconds');
            if (seconds) {
                seconds.textContent = timeRemaining.toString().padStart(2, '0');
                seconds.classList.toggle('text-red-500', timeRemaining <= 10);
            }
        },
        () => {
            this.nextQuestion();
        }
    );
}


// QUIZ RESULTS PAGE //
    renderResultsPage() {
        if (!this.currentQuizResult) {
            this.navigateTo('quizzes');
            return;
        }

        const result = this.currentQuizResult;
        const percentage = result.percentage;
        let performanceMessage = '';
        let performanceColor = '';

        if (percentage >= 80) {
            performanceMessage = 'Excellent work! You have a strong understanding of the subject matter. Keep up the excellent work!';
            performanceColor = 'text-green-600';
        } else if (percentage >= 60) {
            performanceMessage = 'Good job! You have a solid understanding of most concepts. Review the areas you missed to improve further.';
            performanceColor = 'text-blue-600';
        } else {
            performanceMessage = 'Keep practicing! Review the material and try again. Every attempt helps you learn and improve.';
            performanceColor = 'text-orange-600';
        }

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="max-w-4xl mx-auto py-8 px-4">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
                </div> 
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-700">Quiz Completed</span>
                        <span class="text-sm text-gray-500">100%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: 100%"></div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
                    <div class="text-center mb-6">
                       
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Score</h2>
                        <div class="text-4xl font-bold ${performanceColor} mb-4">${result.score}/${result.totalQuestions}</div>
                        <p class="text-lg ${performanceColor}">${performanceMessage}</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    ${result.incorrectAnswers.length > 0 ? `
                        <button onclick="app.reviewAnswers()" 
                                class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                            Review Answers
                        </button>
                    ` : ''}
                    
                    <button onclick="app.navigateTo('quizzes')" 
                            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                        Take Another Quiz
                    </button>
                </div>
            </div>
        `;
    }


   // REVIEW PAGE //
    renderReviewPage() {
        if (!this.currentQuizResult || !this.currentQuizResult.incorrectAnswers.length) {
            this.navigateTo('quizzes');
            return;
        }

        const result = this.currentQuizResult;
        const mainContent = document.getElementById('main-content');
        
        mainContent.innerHTML = `
            <div class="max-w-4xl mx-auto py-8 px-4">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Review Incorrect Answers</h1>
                    <p class="text-gray-600">Review the questions you got wrong to improve your understanding</p>
                </div>

                <div class="space-y-6">
                    ${result.incorrectAnswers.map((item, index) => `
                        <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Question ${item.questionIndex}</h3>
                            <p class="text-gray-800 mb-4">${item.question}</p>
                            
                            <div class="space-y-2 mb-4">
                                <div class="flex items-start">
                                    <span class="text-sm font-medium text-red-600 mr-2">Your answer:</span>
                                    <span class="text-sm text-red-600">${item.userAnswer}</span>
                                </div>
                                <div class="flex items-start">
                                    <span class="text-sm font-medium text-green-600 mr-2">Correct answer:</span>
                                    <span class="text-sm text-green-600">${item.correctAnswer}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="mt-8 text-center">
                    <button onclick="app.navigateTo('quizzes')" 
                            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                        Back to Quizzes
                    </button>
                </div>
            </div>
        `;
    }

    // Event Handlers
    handleSignup() {
        const form = document.getElementById('signup-form');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);
        const errorDiv = document.getElementById('signup-error');

        try {
            const user = AuthManager.signup(userData);
            this.navigateTo('quizzes');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    }

    handleSignin() {
        const form = document.getElementById('signin-form');
        const formData = new FormData(form);
        const credentials = Object.fromEntries(formData);
        const errorDiv = document.getElementById('signin-error');

        try {
            const user = AuthManager.signin(credentials);
            this.navigateTo('quizzes');
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    }

    logout() {
        AuthManager.logout();
        this.navigateTo('landing');
    }

    startQuiz(quizId) {
        this.quizManager.startQuiz(quizId);
        this.navigateTo('quiz');
    }

    selectAnswer(answerIndex) {
        this.quizManager.answerQuestion(answerIndex);
        document.querySelectorAll('.option-button').forEach((btn, index) => {
            if (index === answerIndex) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    nextQuestion() {
        this.quizManager.stopTimer();
        
        if (this.quizManager.isLastQuestion()) {
            this.currentQuizResult = this.quizManager.calculateResults();
            this.navigateTo('results');
        } else {
            this.quizManager.nextQuestion();
            this.renderQuizPage();
        }
    }

    previousQuestion() {
        if (!this.quizManager.isFirstQuestion()) {
            this.quizManager.stopTimer();
            this.quizManager.previousQuestion();
            this.renderQuizPage();
        }
    }

    reviewAnswers() {
        this.navigateTo('review');
    }
}

const app = new QuizApp();
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && hash !== 'landing') {
        app.navigateTo(hash);
    }

document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileNav = document.getElementById("mobile-nav");

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileNav.classList.toggle("hidden");
        });
    }
});

});
