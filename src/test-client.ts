import { RunescapeBot } from './core/bot';
import { GameClientDetector } from './core/client-detector';
import { PixelDetector } from './core/pixel-detector';

async function testClientDetection() {
    console.log('Starting client detection test...');
    
    try {
        // Initialize detectors
        const clientDetector = new GameClientDetector();
        const pixelDetector = new PixelDetector();
        
        console.log('Waiting for 2004Scape client...');
        const gameWindow = await clientDetector.waitForClient(30000); // 30 second timeout
        
        if (gameWindow) {
            console.log('Game client detected!');
            console.log('Window details:', gameWindow);
            
            // Test pixel detection
            console.log('Testing pixel detection...');
            const elements = await pixelDetector.findGameElements();
            
            console.log('\nDetected game elements:');
            for (const [elementType, matches] of Object.entries(elements)) {
                if (matches.length > 0) {
                    console.log(`- ${elementType}: ${matches.length} matches`);
                    console.log(`  Best match: x=${matches[0].x}, y=${matches[0].y}, confidence=${matches[0].confidence}`);
                }
            }
            
            // Initialize bot
            console.log('\nInitializing bot...');
            const bot = new RunescapeBot();
            
            // Set up event handling
            bot.setEventCallback((eventName, data) => {
                console.log(`Bot Event: ${eventName}`, data);
            });
            
            // Test bot initialization
            await bot.start();
            
            // Wait for a few seconds
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Stop the bot
            bot.stop();
            
            console.log('\nTest completed successfully!');
        } else {
            console.error('Failed to detect game client within timeout period');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
console.log('2004Scape Client Detection Test');
console.log('==============================');
console.log('This test will:');
console.log('1. Look for the 2004Scape client window');
console.log('2. Attempt to detect game UI elements');
console.log('3. Initialize the bot and verify interaction');
console.log('\nMake sure the 2004Scape client is running before proceeding.');
console.log('==============================\n');

testClientDetection().catch(console.error);

// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('\nTest interrupted, cleaning up...');
    process.exit(0);
});
