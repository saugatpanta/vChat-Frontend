// main.js - Entry point for vChat application

// DOM Elements
const appContainer = document.querySelector('.app-container');

// Application State
let currentUser = null;
let selectedContact = null;
let socket = null;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    checkAuthStatus();
    
    // Initialize all event listeners
    initializeEventListeners();
    
    // Load any saved preferences
    loadPreferences();
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            showChatInterface();
            initializeSocketConnection();
            loadContacts();
        } catch (error) {
            console.error('Error parsing user data:', error);
            showAuthInterface();
        }
    } else {
        showAuthInterface();
    }
}

// Show authentication interface
function showAuthInterface() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('chat-section').classList.add('hidden');
}

// Show chat interface
function showChatInterface() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('chat-section').classList.remove('hidden');
    
    // Update user profile in sidebar
    if (currentUser) {
        document.getElementById('username-display').textContent = currentUser.username;
        document.getElementById('user-avatar').src = currentUser.avatar || 'assets/icons/default-avatar.png';
    }
}

// Initialize Socket.io connection
function initializeSocketConnection() {
    if (!currentUser) return;
    
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to socket server with ID:', socket.id);
        socket.emit('join', currentUser.id);
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
    });
    
    // Initialize chat and call event handlers
    initializeChatEvents();
    initializeCallEvents();
}

// Initialize all event listeners
function initializeEventListeners() {
    // Auth event listeners are initialized in auth.js
    
    // Chat navigation
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Theme switcher (example - would need additional CSS)
    const themeSwitcher = document.createElement('div');
    themeSwitcher.className = 'theme-switcher';
    themeSwitcher.innerHTML = `
        <button id="light-theme"><i class="fas fa-sun"></i></button>
        <button id="dark-theme"><i class="fas fa-moon"></i></button>
    `;
    document.querySelector('.sidebar-header').appendChild(themeSwitcher);
    
    document.getElementById('light-theme').addEventListener('click', () => {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    });
    
    document.getElementById('dark-theme').addEventListener('click', () => {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    });
}

// Handle logout
function handleLogout() {
    if (socket) {
        socket.disconnect();
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    selectedContact = null;
    
    showAuthInterface();
}

// Load user preferences
function loadPreferences() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Initialize chat event handlers
function initializeChatEvents() {
    if (!socket) return;
    
    socket.on('receiveMessage', (message) => {
        if (selectedContact && message.sender._id === selectedContact.id) {
            displayMessage(message);
            scrollToBottom();
        } else {
            updateContactList(message);
        }
    });
    
    socket.on('userStatusChange', (data) => {
        updateUserStatus(data.userId, data.status);
    });
}

// Initialize call event handlers
function initializeCallEvents() {
    if (!socket) return;
    
    socket.on('incomingCall', ({ from, signal, callType }) => {
        showIncomingCall(from, callType);
    });
    
    socket.on('callAccepted', (signal) => {
        if (peerConnection) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        }
    });
    
    socket.on('callRejected', () => {
        endCall();
        alert('Call was rejected');
    });
    
    socket.on('callEnded', () => {
        endCall();
        alert('Call ended by the other party');
    });
    
    socket.on('iceCandidate', (candidate) => {
        if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    });
}

// Load contacts from server
async function loadContacts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load contacts');
        
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
        alert('Failed to load contacts. Please try again.');
    }
}

// Display contacts in the sidebar
function displayContacts(contacts) {
    const contactsList = document.getElementById('contacts-list');
    contactsList.innerHTML = '';
    
    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact-item';
        contactElement.dataset.id = contact._id;
        
        contactElement.innerHTML = `
            <img src="${contact.avatar || 'assets/icons/default-avatar.png'}" 
                 alt="${contact.username}" class="contact-avatar">
            <div class="contact-info">
                <div class="contact-name">${contact.username}</div>
                <div class="contact-last-message">${contact.status || 'offline'}</div>
            </div>
            <div class="contact-meta">
                <div class="contact-time">${formatLastSeen(contact.lastSeen)}</div>
                <div class="unread-count hidden">0</div>
            </div>
        `;
        
        contactElement.addEventListener('click', () => selectContact(contact));
        contactsList.appendChild(contactElement);
    });
}

// Format last seen time
function formatLastSeen(timestamp) {
    if (!timestamp) return '';
    const now = new Date();
    const lastSeen = new Date(timestamp);
    const diff = now - lastSeen;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

// Select a contact to chat with
async function selectContact(contact) {
    selectedContact = contact;
    
    // Update UI
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === contact._id) {
            item.classList.add('active');
        }
    });
    
    document.getElementById('chat-user-name').textContent = contact.username;
    document.getElementById('chat-user-avatar').src = contact.avatar || 'assets/icons/default-avatar.png';
    document.getElementById('chat-user-status').textContent = contact.status || 'offline';
    document.getElementById('chat-user-status').className = 'status ' + (contact.status === 'online' ? 'online' : 'offline');
    
    document.getElementById('no-chat-selected').classList.add('hidden');
    document.getElementById('active-chat').classList.remove('hidden');
    
    // Load messages
    await loadMessages(contact._id);
    scrollToBottom();
}

// Load messages for a contact
async function loadMessages(contactId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/messages/${contactId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load messages');
        
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Display messages in the chat area
function displayMessages(messages) {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        displayMessage(message);
    });
}

// Display a single message
function displayMessage(message) {
    const messagesContainer = document.getElementById('messages-container');
    const isCurrentUser = message.sender._id === currentUser.id;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
    
    let content = message.content;
    if (message.type === 'voice') {
        content = `
            <audio controls>
                <source src="${message.content}" type="audio/wav">
                Your browser does not support audio elements.
            </audio>
        `;
    }
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        ${content}
        <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
}

// Scroll to bottom of messages container
function scrollToBottom() {
    const messagesContainer = document.getElementById('messages-container');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update contact list when a new message is received
function updateContactList(message) {
    const contactItem = document.querySelector(`.contact-item[data-id="${message.sender._id}"]`);
    if (contactItem) {
        const lastMessage = contactItem.querySelector('.contact-last-message');
        const timeElement = contactItem.querySelector('.contact-time');
        const unreadCount = contactItem.querySelector('.unread-count');
        
        lastMessage.textContent = message.content.length > 30 
            ? message.content.substring(0, 30) + '...' 
            : message.content;
        
        timeElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (!unreadCount.classList.contains('hidden')) {
            unreadCount.textContent = parseInt(unreadCount.textContent) + 1;
        } else {
            unreadCount.classList.remove('hidden');
            unreadCount.textContent = '1';
        }
    }
}

// Update user status in the contact list
function updateUserStatus(userId, status) {
    const contactItem = document.querySelector(`.contact-item[data-id="${userId}"]`);
    if (contactItem) {
        const statusElement = contactItem.querySelector('.contact-last-message');
        statusElement.textContent = status;
        
        if (selectedContact && selectedContact.id === userId) {
            document.getElementById('chat-user-status').textContent = status;
            document.getElementById('chat-user-status').className = 'status ' + (status === 'online' ? 'online' : 'offline');
        }
    }
}

// Export functions that need to be accessed by other modules
window.app = {
    currentUser: () => currentUser,
    selectedContact: () => selectedContact,
    socket: () => socket,
    showAuthInterface,
    showChatInterface,
    initializeSocketConnection,
    loadContacts,
    updateUserStatus
};