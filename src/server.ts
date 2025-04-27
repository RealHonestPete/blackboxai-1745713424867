import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { RunescapeBot } from './core/bot';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve static files from the ui directory
app.use(express.static(path.join(__dirname, 'ui')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'test.html'));
});

app.get('/client-selector', (req, res) => {
    res.sendFile(path.join(__dirname, 'ui', 'client-selector.html'));
});

// Store bot instance
let bot: RunescapeBot | null = null;
let startTime: number | null = null;

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('startBot', async () => {
        if (!bot) {
            bot = new RunescapeBot();
            startTime = Date.now();
            
            // Start the bot
            try {
                await bot.start();
                
                // Set up stat update interval
                setInterval(() => {
                    if (bot) {
                        const stats = {
                            chickensKilled: bot.getStats().chickensKilled,
                            feathersCollected: bot.getStats().feathersCollected,
                            currentLocation: bot.getPlayer().position
                        };
                        socket.emit('statsUpdate', stats);
                    }
                }, 1000);

                socket.emit('botStarted');
            } catch (error: any) {
                console.error('Bot error:', error);
                socket.emit('botError', { 
                    message: error?.message || 'An unknown error occurred'
                });
            }
        }
    });

    socket.on('stopBot', () => {
        if (bot) {
            bot.stop();
            const runTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
            socket.emit('botStopped', { runTime });
            bot = null;
            startTime = null;
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        if (bot) {
            bot.stop();
            bot = null;
            startTime = null;
        }
    });
});

// Start the server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to view the bot UI`);
    console.log(`Open http://localhost:${PORT}/test in your browser to run the client detection test`);
    console.log(`Open http://localhost:${PORT}/client-selector to manually select the game client`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    if (bot) {
        bot.stop();
    }
    process.exit(0);
});
