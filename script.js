const checkPermission = () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }
    if (!('Notification' in window)) {
        throw new Error('Notification not supported');
    }
};

const registerServiceWorker = async () => {
    const registerServiceWorker = await navigator.serviceWorker.register('sw.js');
    return registerServiceWorker;
};

const requestNotificationPermission = async () => {
//     // Check if permission already granted
//     if (localStorage.getItem('notificationGranted')) {
//         alert('Notification already enabled.');
//         return;
//     }

    const permission = await window.Notification.requestPermission();

    if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification');
    } else {
        alert('Your Exam will be available soon');
        localStorage.setItem('notificationGranted', 'true'); // Save permission granted flag
        new Notification("Welcome to Exam Portal", {
            body: "Your Exam will be available soon"
        });
    }
};

// Initial setup
checkPermission();
registerServiceWorker();
