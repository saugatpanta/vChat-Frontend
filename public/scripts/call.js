// Call module
function initCalls(socket, userData) {
    // DOM elements
    const callsList = document.getElementById('calls-list');
    const voiceCallBtn = document.getElementById('voice-call-btn');
    const videoCallBtn = document.getElementById('video-call-btn');
    const callModal = document.getElementById('call-modal');
    const incomingCallSection = document.getElementById('incoming-call');
    const ongoingCallSection = document.getElementById('ongoing-call');
    const acceptCallBtn = document.getElementById('accept-call');
    const rejectCallBtn = document.getElementById('reject-call');
    const endCallBtn = document.getElementById('end-call');
    const muteCallBtn = document.getElementById('mute-call');
    const videoToggleBtn = document.getElementById('video-toggle');
    const speakerToggleBtn = document.getElementById('speaker-toggle');
    const remoteVideo = document.getElementById('remote-video');
    const localVideo = document.getElementById('local-video');
    const callDuration = document.getElementById('call-duration');
    
    // Call state
    let currentCall = null;
    let peerConnection = null;
    let localStream = null;
    let remoteStream = null;
    let callStartTime = null;
    let durationInterval = null;
    let isMuted = false;
    let isVideoOff = false;
    let isSpeakerOn = false;
    
    // Load call history
    loadCallHistory();
    
    // Event listeners
    voiceCallBtn.addEventListener('click', () => {
        if (!currentCall) {
            initiateCall('voice');
        }
    });
    
    videoCallBtn.addEventListener('click', () => {
        if (!currentCall) {
            initiateCall('video');
        }
    });
    
    acceptCallBtn.addEventListener('click', acceptCall);
    rejectCallBtn.addEventListener('click', endCall);
    endCallBtn.addEventListener('click', endCall);
    muteCallBtn.addEventListener('click', toggleMute);
    videoToggleBtn.addEventListener('click', toggleVideo);
    speakerToggleBtn.addEventListener('click', toggleSpeaker);
    
    // Socket events
    socket.on('incomingCall', handleIncomingCall);
    socket.on('callResponse', handleCallResponse);
    socket.on('callSignal', handleCallSignal);
    socket.on('callIceCandidate', handleCallIceCandidate);
    socket.on('callEnded', handleCallEnded);
    
    function loadCallHistory() {
        fetch('/api/calls/history', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
        .then(response => response.json())
        .then(calls => {
            if (calls.length === 0) {
                callsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-phone"></i>
                        <p>No call history</p>
                    </div>
                `;
                return;
            }
            
            callsList.innerHTML = '';
            
            calls.forEach(call => {
                const callItem = document.createElement('div');
                callItem.className = 'call-item';
                callItem.dataset.callId = call.callId;
                
                const isIncoming = call.caller.userId !== userData.userId;
                const otherUser = isIncoming ? call.caller : call.receiver;
                const callType = call.type === 'video' ? 'Video Call' : 'Voice Call';
                const callTime = formatTime(call.createdAt);
                const duration = call.duration ? formatDuration(call.duration) : '';
                
                let statusIcon = '';
                let statusClass = '';
                
                if (call.status === 'completed') {
                    statusIcon = isIncoming ? 'fa-phone-alt' : 'fa-phone-alt';
                    statusClass = isIncoming ? 'incoming' : 'outgoing';
                } else if (call.status === 'missed') {
                    statusIcon = 'fa-phone-slash';
                    statusClass = 'missed';
                } else if (call.status === 'rejected') {
                    statusIcon = 'fa-phone-slash';
                    statusClass = 'missed';
                }
                
                callItem.innerHTML = `
                    <div class="user-avatar-container">
                        <img src="${otherUser.avatar || 'assets/icons/default-avatar.png'}" 
                             alt="${otherUser.username}" class="call-avatar">
                    </div>
                    <div class="call-info">
                        <div class="call-name">${otherUser.username}</div>
                        <div class="call-details">
                            <span class="call-type">${callType}</span>
                            <span class="call-time">${callTime}</span>
                        </div>
                    </div>
                    <div class="call-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${duration ? `<span class="call-duration">${duration}</span>` : ''}
                    </div>
                `;
                
                callItem.addEventListener('click', () => {
                    // In a real app, this might redial or show call details
                    showNotification('Call Info', `${callType} with ${otherUser.username}`, 'info');
                });
                
                callsList.appendChild(callItem);
            });
        })
        .catch(error => {
            console.error('Error loading call history:', error);
            callsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load call history</p>
                </div>
            `;
        });
    }
    
    function initiateCall(type) {
        if (!currentCall) {
            const activeChat = document.querySelector('.contact-item.active');
            if (!activeChat) return;
            
            const userId = activeChat.dataset.userId;
            const username = activeChat.querySelector('.contact-name').textContent;
            const avatar = activeChat.querySelector('.contact-avatar').src;
            
            // Create call record
            fetch('/api/calls/initiate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receiverId: userId, type })
            })
            .then(response => response.json())
            .then(data => {
                currentCall = {
                    callId: data.callId,
                    receiverId: userId,
                    type: type,
                    status: 'initiated'
                };
                
                // Show calling UI
                showOngoingCall({
                    callId: data.callId,
                    name: username,
                    avatar: avatar,
                    type: type,
                    status: 'Calling...'
                });
                
                // Initialize WebRTC
                initializeWebRTC(true, type);
            })
            .catch(error => {
                console.error('Error initiating call:', error);
                showNotification('Call Failed', 'Could not initiate call', 'error');
            });
        }
    }
    
    function handleIncomingCall(data) {
        if (!currentCall) {
            currentCall = {
                callId: data.callId,
                callerId: data.caller.userId,
                type: data.type,
                status: 'incoming'
            };
            
            // Show incoming call UI
            showIncomingCall(data);
            
            // Play ringtone
            playRingtone();
        }
    }
    
    function acceptCall() {
        if (currentCall && currentCall.status === 'incoming') {
            stopRingtone();
            
            // Update call status
            currentCall.status = 'ongoing';
            callStartTime = new Date();
            startDurationTimer();
            
            // Show ongoing call UI
            showOngoingCall({
                callId: currentCall.callId,
                name: document.getElementById('caller-name').textContent,
                avatar: document.getElementById('caller-avatar').src,
                type: document.getElementById('call-type').textContent,
                status: 'Call in progress'
            });
            
            // Send accept response
            fetch('/api/calls/respond', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ callId: currentCall.callId, accept: true })
            })
            .then(response => response.json())
            .then(data => {
                // Initialize WebRTC as callee
                initializeWebRTC(false, currentCall.type);
            })
            .catch(error => {
                console.error('Error accepting call:', error);
                showNotification('Call Failed', 'Could not accept call', 'error');
                endCall();
            });
        }
    }
    
    function endCall() {
        if (currentCall) {
            stopRingtone();
            clearInterval(durationInterval);
            
            // Send end call request if call was connected
            if (currentCall.status === 'ongoing' || currentCall.status === 'initiated') {
                fetch('/api/calls/end', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ callId: currentCall.callId })
                })
                .catch(error => console.error('Error ending call:', error));
            }
            
            // Close peer connection
            if (peerConnection) {
                peerConnection.close();
                peerConnection = null;
            }
            
            // Stop local stream
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
                localStream = null;
            }
            
            // Hide call modal
            callModal.classList.remove('active');
            incomingCallSection.classList.add('hidden');
            ongoingCallSection.classList.add('hidden');
            
            // Clear remote video
            remoteVideo.srcObject = null;
            localVideo.srcObject = null;
            
            // Reset call state
            currentCall = null;
            callStartTime = null;
            isMuted = false;
            isVideoOff = false;
            isSpeakerOn = false;
            
            // Update buttons
            muteCallBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            videoToggleBtn.innerHTML = '<i class="fas fa-video"></i>';
            speakerToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            
            // Reload call history
            loadCallHistory();
        }
    }
    
    function toggleMute() {
        if (localStream) {
            const audioTracks = localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                isMuted = !audioTracks[0].enabled;
                audioTracks[0].enabled = !isMuted;
                muteCallBtn.innerHTML = isMuted ? '<i class="fas fa-microphone-slash"></i>' : '<i class="fas fa-microphone"></i>';
            }
        }
    }
    
    function toggleVideo() {
        if (localStream) {
            const videoTracks = localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                isVideoOff = !videoTracks[0].enabled;
                videoTracks[0].enabled = !isVideoOff;
                videoToggleBtn.innerHTML = isVideoOff ? '<i class="fas fa-video-slash"></i>' : '<i class="fas fa-video"></i>';
                localVideo.style.opacity = isVideoOff ? '0.5' : '1';
            }
        }
    }
    
    function toggleSpeaker() {
        // Note: This is a simplified version. In a real app, you'd use the Web Audio API
        isSpeakerOn = !isSpeakerOn;
        speakerToggleBtn.innerHTML = isSpeakerOn ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
        remoteVideo.volume = isSpeakerOn ? 1 : 0;
    }
    
    function handleCallResponse(data) {
        if (currentCall && currentCall.callId === data.callId) {
            if (data.accepted) {
                // Call was accepted
                currentCall.status = 'ongoing';
                callStartTime = new Date();
                startDurationTimer();
                
                // Update UI
                document.getElementById('ongoing-call-status').textContent = 'Call in progress';
            } else {
                // Call was rejected
                showNotification('Call Rejected', 'The call was rejected', 'info');
                endCall();
            }
        }
    }
    
    function handleCallSignal(data) {
        if (currentCall && currentCall.callId === data.callId) {
            if (peerConnection) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal))
                .then(() => {
                    if (data.signal.type === 'offer') {
                        return peerConnection.createAnswer()
                            .then(answer => {
                                return peerConnection.setLocalDescription(answer);
                            })
                            .then(() => {
                                // Send the answer to the other peer
                                socket.emit('callSignal', {
                                    callId: currentCall.callId,
                                    signal: peerConnection.localDescription,
                                    to: data.from
                                });
                            });
                    }
                })
                .catch(error => {
                    console.error('Error handling signal:', error);
                    showNotification('Call Error', 'Connection failed', 'error');
                    endCall();
                });
            }
        }
    }
    
    function handleCallIceCandidate(data) {
        if (currentCall && currentCall.callId === data.callId && peerConnection) {
            const candidate = new RTCIceCandidate(data.candidate);
            peerConnection.addIceCandidate(candidate)
                .catch(error => {
                    console.error('Error adding ICE candidate:', error);
                });
        }
    }
    
    function handleCallEnded(data) {
        if (currentCall && currentCall.callId === data.callId) {
            showNotification('Call Ended', `Call ended after ${formatDuration(data.duration)}`, 'info');
            endCall();
        }
    }
    
    function initializeWebRTC(isCaller, type) {
        // Create peer connection
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                // In a real app, you'd add TURN servers here
            ]
        };
        
        peerConnection = new RTCPeerConnection(configuration);
        
        // Set up event handlers
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                const targetUserId = isCaller ? currentCall.receiverId : currentCall.callerId;
                socket.emit('callIceCandidate', {
                    callId: currentCall.callId,
                    candidate: event.candidate,
                    to: targetUserId
                });
            }
        };
        
        peerConnection.ontrack = (event) => {
            remoteVideo.srcObject = event.streams[0];
            remoteStream = event.streams[0];
        };
        
        // Get local media
        const mediaConstraints = {
            audio: true,
            video: type === 'video' ? {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 }
            } : false
        };
        
        navigator.mediaDevices.getUserMedia(mediaConstraints)
            .then(stream => {
                localStream = stream;
                
                // Add local stream tracks to peer connection
                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream);
                });
                
                // Display local video
                if (type === 'video') {
                    localVideo.srcObject = stream;
                }
                
                // Create offer if caller
                if (isCaller) {
                    peerConnection.createOffer()
                        .then(offer => {
                            return peerConnection.setLocalDescription(offer);
                        })
                        .then(() => {
                            // Send the offer to the other peer
                            socket.emit('callSignal', {
                                callId: currentCall.callId,
                                signal: peerConnection.localDescription,
                                to: currentCall.receiverId
                            });
                        })
                        .catch(error => {
                            console.error('Error creating offer:', error);
                            showNotification('Call Error', 'Failed to start call', 'error');
                            endCall();
                        });
                }
            })
            .catch(error => {
                console.error('Error getting user media:', error);
                showNotification('Call Error', 'Could not access camera/microphone', 'error');
                endCall();
            });
    }
    
    function showIncomingCall(data) {
        callModal.classList.add('active');
        incomingCallSection.classList.remove('hidden');
        ongoingCallSection.classList.add('hidden');
        
        document.getElementById('caller-avatar').src = data.caller.avatar || 'assets/icons/default-avatar.png';
        document.getElementById('caller-name').textContent = data.caller.username;
        document.getElementById('call-type').textContent = data.type === 'video' ? 'Video Call' : 'Voice Call';
    }
    
    function showOngoingCall(data) {
        callModal.classList.add('active');
        incomingCallSection.classList.add('hidden');
        ongoingCallSection.classList.remove('hidden');
        
        document.getElementById('ongoing-call-avatar').src = data.avatar || 'assets/icons/default-avatar.png';
        document.getElementById('ongoing-call-name').textContent = data.name;
        document.getElementById('ongoing-call-status').textContent = data.status;
        
        // Show/hide video elements based on call type
        if (data.type === 'Video Call') {
            document.querySelector('.video-container').style.display = 'block';
            localVideo.style.display = 'block';
        } else {
            document.querySelector('.video-container').style.display = 'none';
            localVideo.style.display = 'none';
        }
    }
    
    function startDurationTimer() {
        clearInterval(durationInterval);
        updateDuration();
        durationInterval = setInterval(updateDuration, 1000);
    }
    
    function updateDuration() {
        if (callStartTime) {
            const seconds = Math.floor((new Date() - callStartTime) / 1000);
            callDuration.textContent = formatDuration(seconds);
        }
    }
    
    function playRingtone() {
        // In a real app, you would play an actual ringtone
        console.log('Playing ringtone...');
    }
    
    function stopRingtone() {
        // In a real app, you would stop the ringtone
        console.log('Stopping ringtone...');
    }
    
    // Helper functions
    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}