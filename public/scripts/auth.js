// DOM Elements
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const resetPasswordForm = document.getElementById('reset-password-form');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const forgotPasswordTab = document.getElementById('forgot-password-tab');
const resetPasswordTab = document.getElementById('reset-password-tab');
const tabButtons = document.querySelectorAll('.tab-btn');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLogin = document.getElementById('back-to-login');
const logoutBtn = document.getElementById('logout-btn');

// Tab Switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.getElementById(`${tab}-tab`).classList.add('active');
    });
});

// Forgot Password Link
forgotPasswordLink.addEventListener('click', () => {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    forgotPasswordTab.classList.add('active');
});

// Back to Login Link
backToLogin.addEventListener('click', () => {
    tabButtons[0].classList.add('active');
    tabButtons[1].classList.remove('active');
    loginTab.classList.add('active');
    forgotPasswordTab.classList.remove('active');
    resetPasswordTab.classList.remove('active');
});

// Check for reset token in URL
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('resetToken');
    
    if (resetToken) {
        document.getElementById('reset-token').value = resetToken;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        resetPasswordTab.classList.add('active');
    }
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        verifyToken(token);
    }
});

// Login Form
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Switch to chat section
        authSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        
        // Initialize chat
        initializeChat(data.user);
    } catch (error) {
        alert(error.message);
    }
});

// Register Form
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Save token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Switch to chat section
        authSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        
        // Initialize chat
        initializeChat(data.user);
    } catch (error) {
        alert(error.message);
    }
});

// Forgot Password Form
forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    try {
        const response = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
        }
        
        alert('Password reset link has been sent to your email');
        backToLogin.click();
    } catch (error) {
        alert(error.message);
    }
});

// Reset Password Form
resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    if (newPassword !== confirmNewPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
        }
        
        alert('Password has been reset successfully');
        backToLogin.click();
    } catch (error) {
        alert(error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
});

// Verify Token
async function verifyToken(token) {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid token');
        }
        
        const user = JSON.parse(localStorage.getItem('user'));
        authSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        initializeChat(user);
    } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// Initialize Chat (called from chat.js)
function initializeChat(user) {
    // Display username
    document.getElementById('username-display').textContent = user.username;
    document.getElementById('user-avatar').src = user.avatar || 'assets/icons/default-avatar.png';
    
    // Initialize socket connection
    initializeSocket(user.id);
    
    // Load contacts and other chat functionality
    loadContacts();
}