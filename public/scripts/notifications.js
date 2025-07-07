// Notifications module
function initNotifications(socket) {
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }

    // Handle incoming notifications from socket
    socket.on('notification', handleNotification);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Clear any notifications when page becomes visible
            clearNotifications();
        }
    });

    function handleNotification(data) {
        console.log('New notification:', data);
        
        // Show in-app notification
        showNotification(data.title, data.message, data.type);
        
        // Show browser notification if app is in background
        if (document.hidden && Notification.permission === 'granted') {
            showBrowserNotification(data.title, data.message);
        }
        
        // Play sound for important notifications
        if (data.important) {
            playNotificationSound();
        }
    }

    function showBrowserNotification(title, message) {
        // Check if browser supports notifications
        if (!('Notification' in window)) return;
        
        // Create notification
        const notification = new Notification(title, {
            body: message,
            icon: 'assets/icons/app-icon.png',
            vibrate: [200, 100, 200]  // vibration pattern for mobile devices
        });

        // Handle click on notification
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    function playNotificationSound() {
        // Create audio context (fallback to older webkitAudioContext)
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    function clearNotifications() {
        // In a real app, you might mark notifications as read
        console.log('Clearing notifications...');
    }

    // Export public methods if needed
    return {
        showBrowserNotification,
        playNotificationSound
    };
}