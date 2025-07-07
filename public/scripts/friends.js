// Friends module
function initFriends(socket, userData) {
    // DOM elements
    const friendsList = document.getElementById('friends-list');
    const requestsList = document.getElementById('requests-list');
    const searchResults = document.getElementById('search-results');
    const friendSearchInput = document.getElementById('friend-search');
    const searchFriendBtn = document.getElementById('search-friend-btn');
    
    // Load friends and requests
    loadFriends();
    loadFriendRequests();
    
    // Event listeners
    friendSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchFriends();
        }
    });
    
    searchFriendBtn.addEventListener('click', searchFriends);
    
    // Socket events
    socket.on('friendRequest', handleFriendRequest);
    socket.on('friendRequestResponse', handleFriendRequestResponse);
    socket.on('friendRemoved', handleFriendRemoved);
    
    function loadFriends() {
        fetch('/api/friends', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(friends => {
            if (friends.length === 0) {
                friendsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-friends"></i>
                        <p>No friends yet</p>
                    </div>
                `;
                return;
            }
            
            friendsList.innerHTML = '';
            
            friends.forEach(friend => {
                const friendItem = document.createElement('div');
                friendItem.className = 'friend-item';
                friendItem.dataset.userId = friend.userId;
                
                friendItem.innerHTML = `
                    <div class="user-avatar-container">
                        <img src="${friend.avatar || 'assets/icons/default-avatar.png'}" 
                             alt="${friend.username}" class="friend-avatar">
                        <span class="status-indicator ${friend.status || 'offline'}"></span>
                    </div>
                    <div class="friend-info">
                        <div class="friend-name">${friend.username}</div>
                        <div class="friend-status">${friend.status || 'offline'}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="friend-action-btn" title="Message">
                            <i class="fas fa-comment-dots"></i>
                        </button>
                        <button class="friend-action-btn danger" title="Remove">
                            <i class="fas fa-user-minus"></i>
                        </button>
                    </div>
                `;
                
                // Add event listeners
                const messageBtn = friendItem.querySelector('.fa-comment-dots').closest('button');
                const removeBtn = friendItem.querySelector('.fa-user-minus').closest('button');
                
                messageBtn.addEventListener('click', () => {
                    openChat(friend.userId, friend.username, friend.avatar, friend.status);
                    // Switch to chats tab
                    document.querySelector('.sidebar-tab[data-tab="chats"]').click();
                });
                
                removeBtn.addEventListener('click', () => {
                    removeFriend(friend.userId);
                });
                
                friendsList.appendChild(friendItem);
            });
        })
        .catch(error => {
            console.error('Error loading friends:', error);
            friendsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load friends</p>
                </div>
            `;
        });
    }
    
    function loadFriendRequests() {
        fetch('/api/friends/requests', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(requests => {
            if (requests.length === 0) {
                requestsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-plus"></i>
                        <p>No friend requests</p>
                    </div>
                `;
                return;
            }
            
            requestsList.innerHTML = '';
            
            requests.forEach(request => {
                const requestItem = document.createElement('div');
                requestItem.className = 'request-item';
                requestItem.dataset.requestId = request._id;
                
                requestItem.innerHTML = `
                    <div class="user-avatar-container">
                        <img src="${request.from.avatar || 'assets/icons/default-avatar.png'}" 
                             alt="${request.from.username}" class="request-avatar">
                    </div>
                    <div class="request-info">
                        <div class="request-name">${request.from.username}</div>
                        <div class="request-time">${formatTime(request.createdAt)}</div>
                    </div>
                    <div class="request-actions">
                        <button class="request-action-btn accept">Accept</button>
                        <button class="request-action-btn reject">Reject</button>
                    </div>
                `;
                
                // Add event listeners
                const acceptBtn = requestItem.querySelector('.accept');
                const rejectBtn = requestItem.querySelector('.reject');
                
                acceptBtn.addEventListener('click', () => {
                    respondToRequest(request._id, true);
                });
                
                rejectBtn.addEventListener('click', () => {
                    respondToRequest(request._id, false);
                });
                
                requestsList.appendChild(requestItem);
            });
        })
        .catch(error => {
            console.error('Error loading friend requests:', error);
            requestsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load requests</p>
                </div>
            `;
        });
    }
    
    function searchFriends() {
        const searchTerm = friendSearchInput.value.trim();
        if (!searchTerm) return;
        
        searchResults.innerHTML = '<div class="loading-spinner"></div>';
        
        fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(users => {
            // Filter out current user and existing friends
            const currentUserId = userData.userId;
            
            fetch('/api/friends', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            .then(response => response.json())
            .then(friends => {
                const friendIds = friends.map(f => f.userId);
                
                const filteredUsers = users.filter(user => 
                    user.userId !== currentUserId && !friendIds.includes(user.userId));
                
                if (filteredUsers.length === 0) {
                    searchResults.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <p>No users found</p>
                        </div>
                    `;
                    return;
                }
                
                searchResults.innerHTML = '';
                
                filteredUsers.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.className = 'search-result-item';
                    userItem.dataset.userId = user.userId;
                    
                    userItem.innerHTML = `
                        <div class="user-avatar-container">
                            <img src="${user.avatar || 'assets/icons/default-avatar.png'}" 
                                 alt="${user.username}" class="search-result-avatar">
                        </div>
                        <div class="search-result-info">
                            <div class="search-result-name">${user.username}</div>
                            <div class="search-result-email">${user.email}</div>
                        </div>
                        <div class="search-result-action">
                            <button class="add-friend-btn">Add</button>
                        </div>
                    `;
                    
                    const addBtn = userItem.querySelector('.add-friend-btn');
                    addBtn.addEventListener('click', () => {
                        sendFriendRequest(user.userId);
                        addBtn.textContent = 'Requested';
                        addBtn.classList.add('added');
                        addBtn.disabled = true;
                    });
                    
                    searchResults.appendChild(userItem);
                });
            });
        })
        .catch(error => {
            console.error('Error searching users:', error);
            searchResults.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to search users</p>
                </div>
            `;
        });
    }
    
    function sendFriendRequest(userId) {
        fetch('/api/friends/request', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Request Sent', 'Friend request sent successfully', 'success');
        })
        .catch(error => {
            console.error('Error sending friend request:', error);
            showNotification('Error', 'Failed to send friend request', 'error');
        });
    }
    
    function respondToRequest(requestId, accept) {
        fetch('/api/friends/respond', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requestId, accept })
        })
        .then(response => response.json())
        .then(data => {
            if (accept) {
                showNotification('Request Accepted', `${data.friend.username} is now your friend`, 'success');
                // Reload friends list
                loadFriends();
            } else {
                showNotification('Request Rejected', 'Friend request rejected', 'info');
            }
            
            // Remove request from list
            const requestItem = requestsList.querySelector(`[data-request-id="${requestId}"]`);
            if (requestItem) {
                requestItem.remove();
            }
            
            // Update requests count
            if (requestsList.children.length === 0) {
                requestsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-plus"></i>
                        <p>No friend requests</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error responding to friend request:', error);
            showNotification('Error', 'Failed to respond to request', 'error');
        });
    }
    
    function removeFriend(userId) {
        if (!confirm('Are you sure you want to remove this friend?')) return;
        
        fetch(`/api/friends/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            showNotification('Friend Removed', 'Friend removed successfully', 'info');
            // Reload friends list
            loadFriends();
        })
        .catch(error => {
            console.error('Error removing friend:', error);
            showNotification('Error', 'Failed to remove friend', 'error');
        });
    }
    
    function handleFriendRequest(data) {
        // Show notification
        showNotification('New Friend Request', `${data.username} sent you a friend request`, 'info');
        
        // Reload requests if on that tab
        const activeTab = document.querySelector('.friends-tab-btn.active').dataset.tab;
        if (activeTab === 'friend-requests') {
            loadFriendRequests();
        }
    }
    
    function handleFriendRequestResponse(data) {
        if (data.accepted) {
            showNotification('Request Accepted', `Your friend request to ${data.to} was accepted`, 'success');
            // Reload friends list
            loadFriends();
        } else {
            showNotification('Request Rejected', `Your friend request to ${data.to} was rejected`, 'info');
        }
    }
    
    function handleFriendRemoved(data) {
        showNotification('Friend Removed', `${data.userId} removed you from their friends`, 'info');
        // Reload friends list
        loadFriends();
    }
    
    // Helper function
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}