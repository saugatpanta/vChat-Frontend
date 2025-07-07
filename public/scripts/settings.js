// Notifications module
function initNotifications(socket) {
    // Request notification permission
    if ('Notification' in window) {
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
        // Show in-app notification
        showNotification(data.title, data.message, data.type);
        
        // Show browser notification if app is in background
        if (document.hidden && Notification.permission === 'granted') {
            new Notification(data.title, {
                body: data.message,
                icon: 'assets/icons/app-icon.png'
            });
        }
        
        // Play sound for important notifications
        if (data.type === 'error' || data.type === 'incoming') {
            playNotificationSound();
        }
    }
    
    function playNotificationSound() {
        // In a real app, you would play an actual sound
        console.log('Playing notification sound...');
    }
    
    function clearNotifications() {
        // In a real app, you might mark notifications as read
        console.log('Clearing notifications...');
    }
}