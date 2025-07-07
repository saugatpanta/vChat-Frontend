// Authentication module
function initAuth() {
    // Initialize form toggles
    document.getElementById('forgot-password-link').addEventListener('click', () => {
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('forgot-password-tab').classList.add('active');
        
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
    });
    
    document.getElementById('back-to-login').addEventListener('click', () => {
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('login-tab').classList.add('active');
        
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === 'login') {
                tab.classList.add('active');
            }
        });
    });
    
    // Password visibility toggle
    document.querySelectorAll('.show-password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });
    
    // Password strength indicator
    document.getElementById('register-password')?.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    document.getElementById('new-password')?.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('forgot-password-form').addEventListener('submit', handleForgotPassword);
    document.getElementById('reset-password-form').addEventListener('submit', handleResetPassword);
    
    // Social login buttons
    document.querySelector('.google-btn').addEventListener('click', handleGoogleLogin);
    document.querySelector('.facebook-btn').addEventListener('click', handleFacebookLogin);
}

function updatePasswordStrength(password) {
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    // Reset all bars
    strengthBars.forEach(bar => {
        bar.style.width = '0%';
        bar.style.backgroundColor = 'var(--border-color)';
    });
    
    if (!password) {
        strengthText.textContent = '';
        return;
    }
    
    // Calculate strength
    let strength = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const isLong = password.length >= 8;
    
    if (hasLower) strength++;
    if (hasUpper) strength++;
    if (hasNumber) strength++;
    if (hasSpecial) strength++;
    if (isLong) strength++;
    
    // Update UI
    let strengthLevel = 'Weak';
    let color = 'var(--error-color)';
    
    if (strength >= 4) {
        strengthLevel = 'Strong';
        color = 'var(--success-color)';
    } else if (strength >= 2) {
        strengthLevel = 'Medium';
        color = 'var(--warning-color)';
    }
    
    strengthText.textContent = strengthLevel;
    
    // Animate bars
    strengthBars.forEach((bar, index) => {
        if (index < strength) {
            setTimeout(() => {
                bar.style.width = '100%';
                bar.style.backgroundColor = color;
            }, index * 100);
        }
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    const button = form.querySelector('button');
    
    // Validate inputs
    if (!email || !password) {
        showNotification('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    button.classList.add('loading');
    
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
        
        // Save tokens and user data
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Initialize chat app
        initChatApp(data.accessToken, data.user);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login Failed', error.message, 'error');
    } finally {
        button.classList.remove('loading');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const username = form.querySelector('#register-username').value;
    const email = form.querySelector('#register-email').value;
    const password = form.querySelector('#register-password').value;
    const confirmPassword = form.querySelector('#register-confirm-password').value;
    const button = form.querySelector('button');
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        showNotification('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Error', 'Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Error', 'Password must be at least 8 characters', 'error');
        return;
    }
    
    // Show loading state
    button.classList.add('loading');
    
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
        
        // Save tokens and user data
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Initialize chat app
        initChatApp(data.accessToken, data.user);
        
        showNotification('Welcome!', 'Account created successfully', 'success');
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration Failed', error.message, 'error');
    } finally {
        button.classList.remove('loading');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#forgot-email').value;
    const button = form.querySelector('button');
    
    if (!email) {
        showNotification('Error', 'Please enter your email', 'error');
        return;
    }
    
    // Show loading state
    button.classList.add('loading');
    
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
            throw new Error(data.message || 'Failed to send reset link');
        }
        
        showNotification('Reset Link Sent', 'Check your email for password reset instructions', 'success');
        
        // Show reset password form
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('reset-password-tab').classList.add('active');
        
        // Set the reset token (in a real app, this would come from the email link)
        document.getElementById('reset-token').value = data.resetToken;
        
    } catch (error) {
        console.error('Forgot password error:', error);
        showNotification('Error', error.message, 'error');
    } finally {
        button.classList.remove('loading');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const token = form.querySelector('#reset-token').value;
    const newPassword = form.querySelector('#new-password').value;
    const confirmPassword = form.querySelector('#confirm-new-password').value;
    const button = form.querySelector('button');
    
    if (!newPassword || !confirmPassword) {
        showNotification('Error', 'Please fill in all fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('Error', 'Passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Error', 'Password must be at least 8 characters', 'error');
        return;
    }
    
    // Show loading state
    button.classList.add('loading');
    
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
            throw new Error(data.message || 'Failed to reset password');
        }
        
        showNotification('Password Reset', 'Your password has been updated successfully', 'success');
        
        // Go back to login
        document.querySelectorAll('.auth-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById('login-tab').classList.add('active');
        
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-tab') === 'login') {
                tab.classList.add('active');
            }
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        showNotification('Error', error.message, 'error');
    } finally {
        button.classList.remove('loading');
    }
}

async function handleGoogleLogin() {
    // In a real app, this would use Google OAuth
    showNotification('Coming Soon', 'Google login will be available soon', 'info');
}

async function handleFacebookLogin() {
    // In a real app, this would use Facebook OAuth
    showNotification('Coming Soon', 'Facebook login will be available soon', 'info');
}