// DOM Elements
const callModal = document.getElementById('call-modal');
const incomingCallSection = document.getElementById('incoming-call');
const ongoingCallSection = document.getElementById('ongoing-call');
const acceptCallBtn = document.getElementById('accept-call');
const rejectCallBtn = document.getElementById('reject-call');
const endCallBtn = document.getElementById('end-call');
const muteCallBtn = document.getElementById('mute-call');
const videoToggleBtn = document.getElementById('video-toggle');
const remoteVideo = document.getElementById('remote-video');
const localVideo = document.getElementById('local-video');
const callerName = document.getElementById('caller-name');
const callerAvatar = document.getElementById('caller-avatar');
const callType = document.getElementById('call-type');
const ongoingCallName = document.getElementById('ongoing-call-name');
const ongoingCallAvatar = document.getElementById('ongoing-call-avatar');
const ongoingCallStatus = document.getElementById('ongoing-call-status');
const callDuration = document.getElementById('call-duration');
const voiceCallBtn = document.getElementById('voice-call-btn');
const videoCallBtn = document.getElementById('video-call-btn');

// Variables
let peerConnection;
let localStream;
let remoteStream;
let callStartTime;
let callInterval;
let currentCallType;

// Initialize Socket Events
function initializeCallEvents() {
    if (!socket) return;
    
    // Incoming call
    socket.on('incomingCall', ({ from, signal, callType: type }) => {
        showIncomingCall(from, type);
        
        // In a real app, you would get user details from your database
        const caller = {
            id: from,
            username: 'Caller',
            avatar: 'assets/icons/default-avatar.png'
        };
        
        // Set caller info
        callerName.textContent = caller.username;
        callerAvatar.src = caller.avatar || 'assets/icons/default-avatar.png';
        callType.textContent = type === 'video' ? 'Video Call' : 'Voice Call';
        currentCallType = type;
        
        // Create peer connection when call is accepted
        acceptCallBtn.addEventListener('click', () => {
            createPeerConnection(false);
            peerConnection.setRemoteDescription(new RTCSessionDescription(signal))
                .then(() => peerConnection.createAnswer())
                .then(answer => peerConnection.setLocalDescription(answer))
                .then(() => {
                    socket.emit('acceptCall', { to: from, signal: peerConnection.localDescription });
                    showOngoingCall(caller, type);
                });
        }, { once: true });
    });
    
    // Call accepted
    socket.on('callAccepted', (signal) => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
    });
    
    // Call rejected
    socket.on('callRejected', () => {
        endCall();
        alert('Call rejected');
    });
    
    // Call ended
    socket.on('callEnded', () => {
        endCall();
        alert('Call ended by the other party');
    });
    
    // ICE candidates
    socket.on('iceCandidate', (candidate) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });
}

// Create Peer Connection
function createPeerConnection(isCaller) {
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
            // In a production app, you would add TURN servers as well
        ]
    };
    
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream to connection
    if (localStream) {
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
    }
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            const user = JSON.parse(localStorage.getItem('user'));
            const contactId = isCaller ? selectedContact.id : null;
            
            socket.emit('iceCandidate', {
                to: isCaller ? selectedContact.id : user.id,
                candidate: event.candidate
            });
        }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        switch (peerConnection.connectionState) {
            case 'disconnected':
            case 'failed':
                endCall();
                break;
        }
    };
}

// Start Call
function startCall(type) {
    if (!selectedContact) return;
    
    currentCallType = type;
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Get user media
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
    }).then(stream => {
        localStream = stream;
        
        if (type === 'video') {
            localVideo.srcObject = stream;
        }
        
        // Create peer connection
        createPeerConnection(true);
        
        // Create offer
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                socket.emit('callUser', {
                    from: user.id,
                    to: selectedContact.id,
                    signal: peerConnection.localDescription,
                    callType: type
                });
                
                showOngoingCall(selectedContact, type);
            });
    }).catch(error => {
        console.error('Error accessing media devices:', error);
        alert('Could not access camera/microphone. Please check permissions.');
    });
}

// End Call
function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
        remoteStream = null;
    }
    
    if (callInterval) {
        clearInterval(callInterval);
        callInterval = null;
    }
    
    // Reset video elements
    remoteVideo.srcObject = null;
    localVideo.srcObject = null;
    
    // Notify the other party
    const user = JSON.parse(localStorage.getItem('user'));
    if (selectedContact) {
        socket.emit('endCall', { to: selectedContact.id });
    }
    
    // Hide modal
    callModal.classList.add('hidden');
    incomingCallSection.classList.add('hidden');
    ongoingCallSection.classList.add('hidden');
}

// Show Incoming Call
function showIncomingCall(from, type) {
    callModal.classList.remove('hidden');
    incomingCallSection.classList.remove('hidden');
    ongoingCallSection.classList.add('hidden');
    
    // Set call type
    callType.textContent = type === 'video' ? 'Video Call' : 'Voice Call';
    currentCallType = type;
}

// Show Ongoing Call
function showOngoingCall(contact, type) {
    callModal.classList.remove('hidden');
    incomingCallSection.classList.add('hidden');
    ongoingCallSection.classList.remove('hidden');
    
    // Set contact info
    ongoingCallName.textContent = contact.username;
    ongoingCallAvatar.src = contact.avatar || 'assets/icons/default-avatar.png';
    ongoingCallStatus.textContent = type === 'video' ? 'Video Call' : 'Voice Call';
    
    // Start call timer
    callStartTime = new Date();
    updateCallDuration();
    callInterval = setInterval(updateCallDuration, 1000);
}

// Update Call Duration
function updateCallDuration() {
    const now = new Date();
    const duration = Math.floor((now - callStartTime) / 1000);
    const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    callDuration.textContent = `${minutes}:${seconds}`;
}

// Mute Call
function toggleMute() {
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        
        muteCallBtn.classList.toggle('muted');
    }
}

// Toggle Video
function toggleVideo() {
    if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !track.enabled;
        });
        
        videoToggleBtn.classList.toggle('disabled');
    }
}

// Event Listeners
rejectCallBtn.addEventListener('click', endCall);
endCallBtn.addEventListener('click', endCall);
muteCallBtn.addEventListener('click', toggleMute);
videoToggleBtn.addEventListener('click', toggleVideo);

voiceCallBtn.addEventListener('click', () => startCall('voice'));
videoCallBtn.addEventListener('click', () => startCall('video'));

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCallEvents);