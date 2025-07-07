// Chat module
function initChat(socket, userData) {
    let currentChat = null;
    let messages = [];
    let typingTimeout = null;
    
    // DOM elements
    const contactsList = document.getElementById('contacts-list');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const noChatSelected = document.getElementById('no-chat-selected');
    const activeChat = document.getElementById('active-chat');
    const chatUserName = document.getElementById('chat-user-name');
    const chatUserAvatar = document.getElementById('chat-user-avatar');
    const chatUserStatus = document.getElementById('chat-user-status');
    const chatUserLastSeen = document.getElementById('chat-user-last-seen');
    const searchContactsInput = document.getElementById('search-contacts');
    const voiceMessageBtn = document.getElementById('voice-message-btn');
    const attachFileBtn = document.getElementById('attach-file-btn');
    const emojiPickerBtn = document.getElementById('emoji-picker-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    
    // Load conversations
    loadConversations();
    
    // Event listeners
    messageInput.addEventListener('input', handleTyping);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendMessageBtn.addEventListener('click', sendMessage);
    voiceMessageBtn.addEventListener('click', showVoiceRecorder);
    attachFileBtn.addEventListener('click', showFileUpload);
    emojiPickerBtn.addEventListener('click', toggleEmojiPicker);
    
    searchContactsInput.addEventListener('input', searchContacts);
    
    // Socket events
    socket.on('receiveMessage', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('messageReaction', handleMessageReaction);
    socket.on('typing', handleTypingIndicator);
    socket.on('userStatusChanged', updateUserStatus);
    
    // Load emoji picker
    initEmojiPicker();
    
    function loadConversations() {
        // Show loading state
        contactsList.innerHTML = '<div class="loading-spinner"></div>';
        
        fetch('/api/messages/conversations', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(conversations => {
            if (conversations.length === 0) {
                contactsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-comment-alt"></i>
                        <p>No conversations yet</p>
                    </div>
                `;
                return;
            }
            
            contactsList.innerHTML = '';
            
            conversations.forEach(conversation => {
                const contactItem = document.createElement('div');
                contactItem.className = 'contact-item';
                contactItem.dataset.userId = conversation.userId;
                
                const lastMessageTime = formatTime(conversation.lastMessage.createdAt);
                const lastMessageContent = conversation.lastMessage.type === 'text' 
                    ? conversation.lastMessage.content 
                    : `[${conversation.lastMessage.type}]`;
                
                contactItem.innerHTML = `
                    <div class="user-avatar-container">
                        <img src="${conversation.avatar || 'assets/icons/default-avatar.png'}" 
                             alt="${conversation.username}" class="contact-avatar">
                        <span class="status-indicator ${conversation.status || 'offline'}"></span>
                    </div>
                    <div class="contact-info">
                        <div class="contact-name">${conversation.username}</div>
                        <div class="contact-last-message">${lastMessageContent}</div>
                    </div>
                    <div class="contact-meta">
                        <div class="contact-time">${lastMessageTime}</div>
                        ${conversation.unreadCount > 0 ? 
                            `<div class="unread-count">${conversation.unreadCount}</div>` : ''}
                    </div>
                `;
                
                contactItem.addEventListener('click', () => {
                    openChat(conversation.userId, conversation.username, 
                            conversation.avatar, conversation.status);
                });
                
                contactsList.appendChild(contactItem);
            });
            
            // Open first conversation by default
            if (conversations.length > 0 && !currentChat) {
                const firstConversation = conversations[0];
                openChat(firstConversation.userId, firstConversation.username, 
                        firstConversation.avatar, firstConversation.status);
            }
        })
        .catch(error => {
            console.error('Error loading conversations:', error);
            contactsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load conversations</p>
                </div>
            `;
        });
    }
    
    function openChat(userId, username, avatar, status) {
        currentChat = userId;
        
        // Update UI
        noChatSelected.classList.add('hidden');
        activeChat.classList.remove('hidden');
        
        chatUserName.textContent = username;
        chatUserAvatar.src = avatar || 'assets/icons/default-avatar.png';
        chatUserStatus.className = `status-indicator ${status || 'offline'}`;
        chatUserLastSeen.textContent = status === 'online' ? 'Online' : 'Last seen recently';
        
        // Highlight active contact
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.userId === userId) {
                item.classList.add('active');
                // Clear unread count
                const unreadCount = item.querySelector('.unread-count');
                if (unreadCount) unreadCount.remove();
            }
        });
        
        // Load messages
        loadMessages(userId);
    }
    
    function loadMessages(userId) {
        messagesContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        fetch(`/api/messages/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(messages => {
            this.messages = messages;
            renderMessages(messages);
            
            // Scroll to bottom
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        })
        .catch(error => {
            console.error('Error loading messages:', error);
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load messages</p>
                </div>
            `;
        });
    }
    
    function renderMessages(messages) {
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="empty-state">
                    <p>No messages yet</p>
                </div>
            `;
            return;
        }
        
        let currentDate = null;
        
        messages.forEach(message => {
            // Add date separator if needed
            const messageDate = new Date(message.createdAt).toDateString();
            if (messageDate !== currentDate) {
                currentDate = messageDate;
                const dateElement = document.createElement('div');
                dateElement.className = 'message-date';
                dateElement.innerHTML = `<span>${formatDate(message.createdAt)}</span>`;
                messagesContainer.appendChild(dateElement);
            }
            
            const isSent = message.sender.userId === userData.userId;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
            
            let contentHtml = '';
            if (message.type === 'text') {
                contentHtml = `<div class="message-content">${message.content}</div>`;
            } else if (message.type === 'image') {
                contentHtml = `
                    <div class="message-file">
                        <img src="${message.fileUrl}" alt="Image">
                    </div>
                `;
            } else if (message.type === 'video') {
                contentHtml = `
                    <div class="message-file">
                        <video controls>
                            <source src="${message.fileUrl}" type="video/mp4">
                        </video>
                    </div>
                `;
            } else if (message.type === 'voice') {
                contentHtml = `
                    <div class="message-content">
                        <i class="fas fa-microphone"></i> Voice message
                        <audio controls src="${message.fileUrl}"></audio>
                    </div>
                `;
            } else if (message.type === 'file') {
                contentHtml = `
                    <div class="message-file">
                        <div class="file-info">
                            <i class="fas fa-file"></i>
                            <div class="file-name">${message.content}</div>
                            <a href="${message.fileUrl}" download><i class="fas fa-download"></i></a>
                        </div>
                    </div>
                `;
            }
            
            // Add reactions if any
            let reactionsHtml = '';
            if (message.reactions && message.reactions.length > 0) {
                // Group reactions by emoji
                const reactionGroups = {};
                message.reactions.forEach(reaction => {
                    if (!reactionGroups[reaction.emoji]) {
                        reactionGroups[reaction.emoji] = 0;
                    }
                    reactionGroups[reaction.emoji]++;
                });
                
                reactionsHtml = '<div class="message-reactions">';
                for (const [emoji, count] of Object.entries(reactionGroups)) {
                    reactionsHtml += `
                        <div class="message-reaction">
                            <span>${emoji}</span>
                            <span class="message-reaction-count">${count}</span>
                        </div>
                    `;
                }
                reactionsHtml += '</div>';
            }
            
            messageElement.innerHTML = `
                ${contentHtml}
                <div class="message-time">${formatTime(message.createdAt)}</div>
                ${reactionsHtml}
                <button class="add-reaction-btn">+</button>
            `;
            
            messagesContainer.appendChild(messageElement);
            
            // Add reaction handler
            const addReactionBtn = messageElement.querySelector('.add-reaction-btn');
            if (addReactionBtn) {
                addReactionBtn.addEventListener('click', () => {
                    // In a real app, this would open an emoji picker
                    const emoji = '👍'; // Default reaction
                    addReaction(message.messageId, emoji);
                });
            }
        });
    }
    
    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content || !currentChat) return;
        
        // Create message object
        const message = {
            receiverId: currentChat,
            content: content,
            type: 'text'
        };
        
        // Clear input
        messageInput.value = '';
        
        // Send via socket
        socket.emit('sendMessage', message);
        
        // Optimistically add to UI
        const tempMessage = {
            messageId: 'temp-' + Date.now(),
            sender: { userId: userData.userId, username: userData.username, avatar: userData.avatar },
            receiver: { userId: currentChat },
            content: content,
            type: 'text',
            createdAt: new Date().toISOString(),
            read: false,
            delivered: false
        };
        
        messages.push(tempMessage);
        renderMessages(messages);
        
        // Scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
    
    function handleNewMessage(message) {
        if (message.sender.userId === currentChat || message.receiver.userId === currentChat) {
            // Add to current chat
            messages.push(message);
            renderMessages(messages);
            
            // Scroll to bottom
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
            
            // Mark as read if it's the active chat
            if (message.sender.userId === currentChat) {
                socket.emit('messagesRead', { userId: currentChat });
            }
        } else {
            // Update conversation list
            const contactItem = contactsList.querySelector(`[data-user-id="${message.sender.userId}"]`);
            if (contactItem) {
                const lastMessage = contactItem.querySelector('.contact-last-message');
                const messageTime = contactItem.querySelector('.contact-time');
                const unreadCount = contactItem.querySelector('.unread-count');
                
                lastMessage.textContent = message.type === 'text' ? message.content : `[${message.type}]`;
                messageTime.textContent = formatTime(message.createdAt);
                
                if (!unreadCount) {
                    const unreadDiv = document.createElement('div');
                    unreadDiv.className = 'unread-count';
                    unreadDiv.textContent = '1';
                    contactItem.querySelector('.contact-meta').appendChild(unreadDiv);
                } else {
                    unreadCount.textContent = parseInt(unreadCount.textContent) + 1;
                }
                
                // Move to top
                contactsList.prepend(contactItem);
            }
            
            // Show notification
            if (document.hidden || !document.hasFocus()) {
                showNotification('New Message', 
                    `From ${message.sender.username}: ${message.type === 'text' ? message.content : `[${message.type}]`}`);
            }
        }
    }
    
    function handleMessagesRead(data) {
        if (data.by === currentChat) {
            // Update read status for messages
            messages.forEach(msg => {
                if (msg.sender.userId === userData.userId && !msg.read) {
                    msg.read = true;
                }
            });
            renderMessages(messages);
        }
    }
    
    function handleMessageReaction(message) {
        // Update the message in our local array
        const index = messages.findIndex(m => m.messageId === message.messageId);
        if (index !== -1) {
            messages[index] = message;
            renderMessages(messages);
        }
    }
    
    function handleTyping() {
        if (!currentChat) return;
        
        // Notify server that user is typing
        socket.emit('typing', {
            receiverId: currentChat,
            isTyping: true
        });
        
        // Reset typing indicator after delay
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', {
                receiverId: currentChat,
                isTyping: false
            });
        }, 2000);
    }
    
    function handleTypingIndicator(data) {
        if (data.senderId === currentChat) {
            const typingIndicator = document.getElementById('typing-indicator') || 
                document.createElement('div');
            
            typingIndicator.id = 'typing-indicator';
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>Typing...</span>
            `;
            
            if (data.isTyping) {
                if (!document.getElementById('typing-indicator')) {
                    messagesContainer.appendChild(typingIndicator);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            } else {
                if (document.getElementById('typing-indicator')) {
                    typingIndicator.remove();
                }
            }
        }
    }
    
    function updateUserStatus(data) {
        // Update in contacts list
        const contactItem = contactsList.querySelector(`[data-user-id="${data.userId}"]`);
        if (contactItem) {
            const statusIndicator = contactItem.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.className = `status-indicator ${data.status}`;
            }
        }
        
        // Update in active chat
        if (currentChat === data.userId) {
            chatUserStatus.className = `status-indicator ${data.status}`;
            chatUserLastSeen.textContent = data.status === 'online' ? 'Online' : 'Last seen recently';
        }
    }
    
    function searchContacts() {
        const searchTerm = searchContactsInput.value.toLowerCase();
        if (!searchTerm) {
            loadConversations();
            return;
        }
        
        const contactItems = contactsList.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            const name = item.querySelector('.contact-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.contact-last-message').textContent.toLowerCase();
            
            if (name.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    function showVoiceRecorder() {
        document.getElementById('voice-message-modal').classList.add('active');
        initVoiceRecorder();
    }
    
    function showFileUpload() {
        document.getElementById('file-upload-modal').classList.add('active');
        initFileUpload();
    }
    
    function toggleEmojiPicker() {
        emojiPicker.classList.toggle('active');
    }
    
    function initEmojiPicker() {
        // In a real app, this would use an emoji library
        // This is a simplified version
        const emojiGrid = document.getElementById('emoji-grid');
        const emojis = ['😀', '😂', '😍', '👍', '❤️', '🔥', '🎉', '🤔', '👋', '🎶'];
        
        emojis.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => {
                messageInput.value += emoji;
                emojiPicker.classList.remove('active');
            });
            emojiGrid.appendChild(emojiItem);
        });
    }
    
    function addReaction(messageId, emoji) {
        socket.emit('messageReact', {
            messageId: messageId,
            emoji: emoji
        });
    }
    
    // Helper functions
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    }
}