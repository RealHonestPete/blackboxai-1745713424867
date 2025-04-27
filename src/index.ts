import { RunescapeBot } from './core/bot';

async function main() {
    console.log('Initializing RuneScape Bot...');
    
    try {
        // Create bot instance
        const bot = new RunescapeBot();
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\nReceived SIGINT. Stopping bot...');
            bot.stop();
            process.exit(0);
        });

        // Start the bot
        await bot.start();
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the bot
main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
