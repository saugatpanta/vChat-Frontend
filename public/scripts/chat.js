// DOM Elements
const contactsList = document.getElementById('contacts-list');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const noChatSelected = document.getElementById('no-chat-selected');
const activeChat = document.getElementById('active-chat');
const chatUserName = document.getElementById('chat-user-name');
const chatUserAvatar = document.getElementById('chat-user-avatar');
const chatUserStatus = document.getElementById('chat-user-status');
const searchContacts = document.getElementById('search-contacts');
const voiceMessageBtn = document.getElementById('voice-message-btn');
const voiceMessageModal = document.getElementById('voice-message-modal');
const closeVoiceModal = document.getElementById('close-voice-modal');

// Variables
let currentUser = null;
let selectedContact = null;
let socket = null;

// Initialize Socket
function initializeSocket(userId) {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to socket server');
        socket.emit('join', userId);
    });
    
    socket.on('receiveMessage', (message) => {
        if (selectedContact && message.sender._id === selectedContact.id) {
            displayMessage(message);
            scrollToBottom();
        } else {
            // Update contact list with new message
            updateContactList(message);
        }
    });
}

// Load Contacts
async function loadContacts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load contacts');
        }
        
        const contacts = await response.json();
        displayContacts(contacts);
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Display Contacts
function displayContacts(contacts) {
    contactsList.innerHTML = '';
    
    contacts.forEach(contact => {
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.dataset.id = contact._id;
        
        contactItem.innerHTML = `
            <img src="${contact.avatar || 'assets/icons/default-avatar.png'}" alt="${contact.username}" class="contact-avatar">
            <div class="contact-info">
                <div class="contact-name">${contact.username}</div>
                <div class="contact-last-message">Last message...</div>
            </div>
            <div class="contact-meta">
                <div class="contact-time">Just now</div>
                <div class="unread-count hidden">1</div>
            </div>
        `;
        
        contactItem.addEventListener('click', () => selectContact(contact));
        contactsList.appendChild(contactItem);
    });
}

// Select Contact
async function selectContact(contact) {
    selectedContact = contact;
    
    // Update UI
    document.querySelectorAll('.contact-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.id === contact._id) {
            item.classList.add('active');
        }
    });
    
    chatUserName.textContent = contact.username;
    chatUserAvatar.src = contact.avatar || 'assets/icons/default-avatar.png';
    chatUserStatus.textContent = contact.status || 'offline';
    chatUserStatus.className = 'status ' + (contact.status === 'online' ? 'online' : 'offline');
    
    noChatSelected.classList.add('hidden');
    activeChat.classList.remove('hidden');
    
    // Load messages
    await loadMessages(contact._id);
    scrollToBottom();
}

// Load Messages
async function loadMessages(contactId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/messages/${contactId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        const messages = await response.json();
        displayMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Display Messages
function displayMessages(messages) {
    messagesContainer.innerHTML = '';
    
    messages.forEach(message => {
        displayMessage(message);
    });
}

// Display Single Message
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    const user = JSON.parse(localStorage.getItem('user'));
    const isSent = message.sender._id === user.id;
    
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;
    
    let content = message.content;
    if (message.type === 'voice') {
        content = `
            <audio controls>
                <source src="${message.content}" type="audio/wav">
                Your browser does not support the audio element.
            </audio>
        `;
    }
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${content}
        <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Send Message
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !selectedContact) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    const message = {
        senderId: user.id,
        receiverId: selectedContact.id,
        content,
        type: 'text'
    };
    
    socket.emit('sendMessage', message);
    
    // Display message immediately
    const tempMessage = {
        sender: { _id: user.id, username: user.username, avatar: user.avatar },
        receiver: { _id: selectedContact.id, username: selectedContact.username, avatar: selectedContact.avatar },
        content,
        type: 'text',
        timestamp: new Date(),
        read: false
    };
    
    displayMessage(tempMessage);
    scrollToBottom();
    
    // Clear input
    messageInput.value = '';
}

// Send Voice Message
function sendVoiceMessage(audioBlob) {
    if (!selectedContact) return;
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    // In a real app, you would upload the blob to a server and get a URL
    // For this example, we'll just create a fake URL
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const message = {
        senderId: user.id,
        receiverId: selectedContact.id,
        content: audioUrl,
        type: 'voice'
    };
    
    socket.emit('sendMessage', message);
    
    // Display message immediately
    const tempMessage = {
        sender: { _id: user.id, username: user.username, avatar: user.avatar },
        receiver: { _id: selectedContact.id, username: selectedContact.username, avatar: selectedContact.avatar },
        content: audioUrl,
        type: 'voice',
        timestamp: new Date(),
        read: false
    };
    
    displayMessage(tempMessage);
    scrollToBottom();
}

// Scroll to Bottom
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update Contact List
function updateContactList(message) {
    const contactItem = contactsList.querySelector(`[data-id="${message.sender._id}"]`);
    if (contactItem) {
        const lastMessage = contactItem.querySelector('.contact-last-message');
        const time = contactItem.querySelector('.contact-time');
        const unreadCount = contactItem.querySelector('.unread-count');
        
        lastMessage.textContent = message.type === 'text' ? message.content : 'Voice message';
        time.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (!unreadCount.classList.contains('hidden')) {
            const count = parseInt(unreadCount.textContent) + 1;
            unreadCount.textContent = count;
        } else {
            unreadCount.classList.remove('hidden');
            unreadCount.textContent = '1';
        }
    }
}

// Search Contacts
searchContacts.addEventListener('input', () => {
    const searchTerm = searchContacts.value.toLowerCase();
    const contactItems = contactsList.querySelectorAll('.contact-item');
    
    contactItems.forEach(item => {
        const name = item.querySelector('.contact-name').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Event Listeners
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

voiceMessageBtn.addEventListener('click', () => {
    voiceMessageModal.classList.remove('hidden');
});

closeVoiceModal.addEventListener('click', () => {
    voiceMessageModal.classList.add('hidden');
});

// Initialize Voice Recorder
let mediaRecorder;
let audioChunks = [];
let recordingInterval;
let recordingSeconds = 0;

const startRecordingBtn = document.getElementById('start-recording');
const stopRecordingBtn = document.getElementById('stop-recording');
const playRecordingBtn = document.getElementById('play-recording');
const sendRecordingBtn = document.getElementById('send-recording');
const recordingTimer = document.getElementById('recording-timer');
const voiceVisualizer = document.getElementById('voice-visualizer');

startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);
playRecordingBtn.addEventListener('click', playRecording);
sendRecordingBtn.addEventListener('click', sendRecording);

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // For visualization, we would typically use the Web Audio API
            // This is a simplified version
            voiceVisualizer.innerHTML = `
                <audio controls>
                    <source src="${audioUrl}" type="audio/wav">
                    Your browser does not support the audio element.
                </audio>
            `;
        };
        
        audioChunks = [];
        mediaRecorder.start();
        
        // Start timer
        recordingSeconds = 0;
        updateTimer();
        recordingInterval = setInterval(updateTimer, 1000);
        
        // Update UI
        startRecordingBtn.classList.add('hidden');
        stopRecordingBtn.classList.remove('hidden');
        recordingTimer.classList.remove('hidden');
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not access microphone. Please check permissions.');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(recordingInterval);
        
        // Update UI
        stopRecordingBtn.classList.add('hidden');
        playRecordingBtn.classList.remove('hidden');
        sendRecordingBtn.classList.remove('hidden');
    }
}

function playRecording() {
    const audio = voiceVisualizer.querySelector('audio');
    if (audio) {
        audio.play();
    }
}

function sendRecording() {
    if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendVoiceMessage(audioBlob);
        
        // Reset
        voiceMessageModal.classList.add('hidden');
        voiceVisualizer.innerHTML = '';
        playRecordingBtn.classList.add('hidden');
        sendRecordingBtn.classList.add('hidden');
        startRecordingBtn.classList.remove('hidden');
        recordingTimer.classList.add('hidden');
    }
}

function updateTimer() {
    recordingSeconds++;
    const minutes = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
    const seconds = (recordingSeconds % 60).toString().padStart(2, '0');
    recordingTimer.textContent = `${minutes}:${seconds}`;
}