import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    connect(onMessageReceived) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.username) return;

        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = null; // Disable debug logs in console

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
            this.stompClient.disconnect();
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
