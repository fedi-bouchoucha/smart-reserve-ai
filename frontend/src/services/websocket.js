import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(onMessageReceived) {
        let user;
        try {
            user = JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            console.warn('Could not parse user from local storage:', e);
            return;
        }

        if (!user || !user.username) {
            return;
        }

        // Cleanup existing connection if any
        this.disconnect();

        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = () => {}; // No-op for debug to keep console clean

        this.stompClient.connect({}, (frame) => {
            // Subscribe to user-specific notification topic
            const subscription = this.stompClient.subscribe(
                `/user/${user.username}/topic/notifications`, 
                (message) => {
                    if (message.body) {
                        onMessageReceived(JSON.parse(message.body));
                    }
                }
            );
            this.subscriptions.set('notifications', subscription);
        }, (error) => {
            console.error('WebSocket connection error:', error);
            // Reconnect after 5 seconds
            setTimeout(() => this.connect(onMessageReceived), 5000);
        });
    }

    disconnect() {
        if (this.stompClient !== null) {
            if (this.stompClient.connected) {
                try {
                    this.stompClient.disconnect();
                } catch(e) { }
            }
            this.stompClient = null;
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
