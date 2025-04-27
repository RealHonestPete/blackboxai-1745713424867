class BotUI {
    constructor() {
        this.startTime = null;
        this.timerInterval = null;
        this.isRunning = false;
        this.clientSelectorWindow = null;
        this.stats = {
            chickensKilled: 0,
            feathersCollected: 0,
            currentLocation: 'Not Started'
        };

        // Initialize UI elements
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketConnection();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clientSelectorBtn = document.getElementById('clientSelectorBtn');
        this.timerDisplay = document.getElementById('timer');
        this.botStatus = document.getElementById('botStatus');
        this.logMessages = document.getElementById('logMessages');
        this.chickensKilled = document.getElementById('chickensKilled');
        this.feathersCollected = document.getElementById('feathersCollected');
        this.currentLocation = document.getElementById('currentLocation');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startBot());
        this.stopBtn.addEventListener('click', () => this.stopBot());
        this.clientSelectorBtn.addEventListener('click', () => this.openClientSelector());

        // Listen for messages from client selector window
        window.addEventListener('message', (event) => {
            if (event.data.type === 'clientBoundsSet') {
                this.addLogMessage('Client bounds set successfully', 'success');
                localStorage.setItem('gameClientBounds', JSON.stringify(event.data.bounds));
            }
        });
    }

    setupSocketConnection() {
        this.socket = io();

        this.socket.on('connect', () => {
            this.addLogMessage('Connected to server', 'success');
        });

        this.socket.on('disconnect', () => {
            this.addLogMessage('Disconnected from server', 'error');
            this.stopBot();
        });

        this.socket.on('botStarted', () => {
            this.isRunning = true;
            this.startTime = Date.now();
            this.startTimer();
            this.updateButtonStates();
            this.addLogMessage('Bot started', 'success');
            this.botStatus.textContent = 'Bot is running';
        });

        this.socket.on('botStopped', (data) => {
            this.isRunning = false;
            this.stopTimer();
            this.updateButtonStates();
            this.addLogMessage('Bot stopped', 'warning');
            this.botStatus.textContent = 'Bot is stopped';
            
            if (data.runTime) {
                this.addLogMessage(`Total run time: ${this.formatTime(data.runTime)}`, 'normal');
            }
        });

        this.socket.on('botError', (data) => {
            this.addLogMessage(`Error: ${data.message}`, 'error');
            this.stopBot();
        });

        this.socket.on('statsUpdate', (data) => {
            this.updateStats(data);
        });
    }

    startBot() {
        // Check if client bounds are set
        const clientBounds = localStorage.getItem('gameClientBounds');
        if (!clientBounds) {
            this.addLogMessage('Please select game client window first', 'error');
            return;
        }

        this.socket.emit('startBot');
    }

    stopBot() {
        this.socket.emit('stopBot');
    }

    openClientSelector() {
        // Close existing selector window if open
        if (this.clientSelectorWindow && !this.clientSelectorWindow.closed) {
            this.clientSelectorWindow.focus();
            return;
        }

        // Open selector in a new window
        const width = 800;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        this.clientSelectorWindow = window.open(
            '/client-selector',
            'clientSelector',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,menubar=no,toolbar=no,location=no`
        );

        // Monitor window close
        const checkWindow = setInterval(() => {
            if (this.clientSelectorWindow && this.clientSelectorWindow.closed) {
                clearInterval(checkWindow);
                this.clientSelectorWindow = null;
            }
        }, 500);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.updateTimer(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer(elapsed) {
        this.timerDisplay.textContent = `Time Running: ${this.formatTime(Math.floor(elapsed / 1000))}`;
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${this.padNumber(hours)}:${this.padNumber(minutes)}:${this.padNumber(secs)}`;
    }

    padNumber(num) {
        return num.toString().padStart(2, '0');
    }

    updateButtonStates() {
        this.startBtn.disabled = this.isRunning;
        this.stopBtn.disabled = !this.isRunning;
        this.clientSelectorBtn.disabled = this.isRunning;
    }

    addLogMessage(message, type = 'normal') {
        const messageElement = document.createElement('div');
        messageElement.textContent = `[${this.getCurrentTime()}] ${message}`;
        messageElement.className = `message-${type}`;
        
        this.logMessages.appendChild(messageElement);
        this.logMessages.scrollTop = this.logMessages.scrollHeight;
    }

    getCurrentTime() {
        const now = new Date();
        return `${this.padNumber(now.getHours())}:${this.padNumber(now.getMinutes())}:${this.padNumber(now.getSeconds())}`;
    }

    updateStats(stats) {
        if (stats.chickensKilled !== undefined) {
            this.chickensKilled.textContent = stats.chickensKilled;
        }
        if (stats.feathersCollected !== undefined) {
            this.feathersCollected.textContent = stats.feathersCollected;
        }
        if (stats.currentLocation) {
            this.currentLocation.textContent = `(${stats.currentLocation.x}, ${stats.currentLocation.y})`;
        }
    }
}

// Initialize the UI when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.botUI = new BotUI();
});
</create_file>
