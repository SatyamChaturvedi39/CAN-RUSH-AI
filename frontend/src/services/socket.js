import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect() {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket.io connected');
            });

            this.socket.on('disconnect', () => {
                console.log('❌ Socket.io disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Join rooms
    joinVendorRoom(vendorId) {
        if (this.socket) {
            this.socket.emit('join:vendor', vendorId);
        }
    }

    joinStudentRoom(studentId) {
        if (this.socket) {
            this.socket.emit('join:student', studentId);
        }
    }

    trackOrder(orderId) {
        if (this.socket) {
            this.socket.emit('track:order', orderId);
        }
    }

    // Event listeners
    onNewOrder(callback) {
        if (this.socket) {
            this.socket.on('order:new', callback);
        }
    }

    onOrderUpdate(callback) {
        if (this.socket) {
            this.socket.on('order:update', callback);
        }
    }

    onOrderReady(callback) {
        if (this.socket) {
            this.socket.on('order:ready', callback);
        }
    }

    onPenalty(callback) {
        if (this.socket) {
            this.socket.on('penalty:issued', callback);
        }
    }

    onQueueUpdate(callback) {
        if (this.socket) {
            this.socket.on('queue:update', callback);
        }
    }

    // Remove listeners
    removeListener(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export default new SocketService();
