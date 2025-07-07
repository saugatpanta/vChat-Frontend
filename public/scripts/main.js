// Main application controller
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Initialize socket connection
    let socket;
    
    // Check authentication status
    const token = localStorage.getItem('accessToken');
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (token && userData) {
        // User is logged in
        initChatApp(token, userData);
    } else {
        // Show auth section
        document.getElementById('auth-section').classList.remove('hidden');
        initAuth();
    }
    
    // Initialize service worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});

function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'system';
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (theme) => {
        if (theme === 'dark' || (theme === 'system' && darkModeMediaQuery.matches)) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };
    
    // Apply saved theme
    applyTheme(savedTheme);
    
    // Listen for system theme changes
    darkModeMediaQuery.addListener((e) => {
        const theme = localStorage.getItem('theme') || 'system';
        if (theme === 'system') {
            applyTheme(theme);
        }
    });
    
    // Theme toggle in settings
    document.getElementById('dark-mode-toggle')?.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    });
}

function initChatApp(token, userData) {
    // Connect to Socket.IO
    socket = io('https://your-backend-url.com', {
        auth: {
            token: token
        },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
    });
    
    // Handle socket connection
    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        
        // Update UI
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('chat-section').classList.remove('hidden');
        
        // Display user info
        document.getElementById('username-display').textContent = userData.username;
        document.getElementById('user-avatar').src = userData.avatar || 'assets/icons/default-avatar.png';
        document.getElementById('user-status').textContent = 'Online';
        document.getElementById('user-status').className = 'status online';
        
        // Initialize modules
        initChat(socket, userData);
        initFriends(socket, userData);
        initCalls(socket, userData);
        initSettings(socket, userData);
        initNotifications(socket);
    });
    
    socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        if (reason === 'io server disconnect') {
            // The server forcibly disconnected the socket, try to reconnect
            socket.connect();
        }
        // Update status to offline
        document.getElementById('user-status').textContent = 'Offline';
        document.getElementById('user-status').className = 'status offline';
    });
    
    socket.on('connect_error', (err) => {
        console.log('Connection error:', err.message);
        showNotification('Connection error', 'Unable to connect to the server', 'error');
    });
    
    // Handle token expiration
    socket.on('tokenExpired', () => {
        showNotification('Session expired', 'Please log in again', 'error');
        logout();
    });
    
    // Initialize tab switching
    initTabs();
}

function initAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tabs .tab-btn');
    const authContents = document.querySelectorAll('.auth-tab-content');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            authContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Initialize with login tab active
    document.querySelector('.auth-tabs .tab-btn[data-tab="login"]').classList.add('active');
    document.getElementById('login-tab').classList.add('active');
}

function logout() {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    // Disconnect socket
    if (socket) socket.disconnect();
    
    // Show auth section
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('chat-section').classList.add('hidden');
    
    // Reset auth forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    
    // Show login tab
    document.querySelectorAll('.auth-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('login-tab').classList.add('active');
    
    document.querySelectorAll('.auth-tabs .tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('.auth-tabs .tab-btn[data-tab="login"]').classList.add('active');
}

// Global notification function
function showNotification(title, message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set icon based on type
    let icon = 'fa-info-circle';
    let bgColor = 'var(--primary-color)';
    
    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            bgColor = 'var(--success-color)';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            bgColor = 'var(--error-color)';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            bgColor = 'var(--warning-color)';
            break;
    }
    
    toastIcon.className = `fas ${icon}`;
    toast.querySelector('.toast-icon').style.backgroundColor = bgColor;
    
    // Show toast
    toast.classList.add('active');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

// Close notification handler
document.querySelector('.toast-close').addEventListener('click', () => {
    document.getElementById('notification-toast').classList.remove('active');
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', logout);

// Settings button
document.getElementById('settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.toggle('active');
});

// Close settings button
document.getElementById('close-settings-btn').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.remove('active');
});