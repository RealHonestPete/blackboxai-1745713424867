import { Player, Position } from '../types';
import { ChatSystem } from './chat';
import { CombatSystem } from './combat';
import { PathfindingSystem } from './pathfinding';
import { TutorialIsland } from '../tasks/tutorial';
import { ChickenTraining } from '../tasks/chicken';
import { GameClientDetector } from './client-detector';
import { GameInteraction } from './game-interaction';
import { PixelDetector } from './pixel-detector';

interface BotStats {
    chickensKilled: number;
    feathersCollected: number;
}

export class RunescapeBot {
    private player: Player;
    private isRunning: boolean = false;
    private chatSystem: ChatSystem;
    private combatSystem: CombatSystem;
    private pathfinding: PathfindingSystem;
    private tutorialIsland: TutorialIsland;
    private chickenTraining: ChickenTraining;
    private clientDetector: GameClientDetector;
    private gameInteraction: GameInteraction;
    private pixelDetector: PixelDetector;
    private stats: BotStats = {
        chickensKilled: 0,
        feathersCollected: 0
    };
    private eventCallback: ((eventName: string, data: any) => void) | null = null;

    constructor() {
        this.player = {
            position: { x: 3098, y: 3107 }, // Tutorial Island starting position
            inventory: [],
            skills: {
                attack: 1,
                strength: 1,
                defense: 1
            }
        };

        // Initialize systems
        this.chatSystem = new ChatSystem();
        this.combatSystem = new CombatSystem(this.player);
        this.pathfinding = new PathfindingSystem(this.player.position);
        this.tutorialIsland = new TutorialIsland(this.player);
        this.chickenTraining = new ChickenTraining(this.player);
        this.clientDetector = new GameClientDetector();
        this.gameInteraction = new GameInteraction();
        this.pixelDetector = new PixelDetector();
    }

    public async start(): Promise<void> {
        try {
            // Initialize game interaction
            this.emitEvent('progress', { message: 'Detecting game client...' });
            await this.gameInteraction.initialize();
            this.emitEvent('progress', { message: 'Game client detected!' });

            // Verify we can interact with the game
            const canInteract = await this.verifyGameInteraction();
            if (!canInteract) {
                throw new Error('Unable to interact with game client');
            }

            this.isRunning = true;
            this.emitEvent('botStarted', {});
            console.log('Bot started');

            // Complete Tutorial Island
            await this.completeTutorialIsland();

            // Start chicken training
            await this.startChickenTraining();

        } catch (error) {
            console.error('Bot error:', error);
            this.emitEvent('botError', { error });
            this.stop();
        }
    }

    private async verifyGameInteraction(): Promise<boolean> {
        try {
            // Check for essential game elements
            const gameElements = await this.pixelDetector.findGameElements();
            const hasMinimapElement = gameElements.minimap && gameElements.minimap.length > 0;
            const hasChatboxElement = gameElements.chatbox && gameElements.chatbox.length > 0;

            if (!hasMinimapElement || !hasChatboxElement) {
                console.error('Could not find essential game elements');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error verifying game interaction:', error);
            return false;
        }
    }

    public stop(): void {
        this.isRunning = false;
        this.chickenTraining.stopTraining();
        this.clientDetector.stopDetection();
        this.emitEvent('botStopped', {});
        console.log('Bot stopped');
    }

    private async completeTutorialIsland(): Promise<void> {
        console.log('Starting Tutorial Island...');
        this.emitEvent('progress', { message: 'Starting Tutorial Island...' });
        
        try {
            // Tutorial island steps using game interaction
            await this.handleTutorialIsland();
            
            this.emitEvent('progress', { message: 'Tutorial Island completed!' });
            console.log('Tutorial Island completed!');
        } catch (error) {
            console.error('Error completing Tutorial Island:', error);
            throw error;
        }
    }

    private async handleTutorialIsland(): Promise<void> {
        // Tutorial Island steps
        const steps = [
            { type: 'npc', name: 'Guide', dialogue: ['Yes, I want to play RuneScape.'] },
            { type: 'npc', name: 'Survival Expert', dialogue: ['I want to learn survival skills.'] },
            // Add more tutorial steps as needed
        ];

        for (const step of steps) {
            if (!this.isRunning) break;

            try {
                await this.handleTutorialStep(step);
            } catch (error) {
                console.error(`Error in tutorial step:`, error);
                throw error;
            }
        }
    }

    private async handleTutorialStep(step: any): Promise<void> {
        switch (step.type) {
            case 'npc':
                await this.gameInteraction.clickGameElement(step.name);
                await this.wait(1000);
                for (const text of step.dialogue) {
                    await this.gameInteraction.typeText(text + String.fromCharCode(13)); // Enter key
                    await this.wait(500);
                }
                break;
            // Add more step types as needed
        }
    }

    private async startChickenTraining(): Promise<void> {
        console.log('Starting chicken training...');
        this.emitEvent('progress', { message: 'Starting chicken training...' });
        
        while (this.isRunning) {
            try {
                // Find and attack chickens
                const chickenFound = await this.gameInteraction.attackNPC('chicken');
                if (chickenFound) {
                    await this.wait(3000); // Wait for combat
                    
                    // Collect feathers
                    const feathersFound = await this.gameInteraction.collectGroundItem('feather');
                    if (feathersFound) {
                        this.incrementFeathersCollected();
                    }
                }
                
                await this.wait(500);
            } catch (error) {
                console.error('Error in chicken training:', error);
                // Continue running but log the error
            }
        }
    }

    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // UI Integration Methods
    public getStats(): BotStats {
        return this.stats;
    }

    public getPlayer(): Player {
        return this.player;
    }

    public isActive(): boolean {
        return this.isRunning;
    }

    public setEventCallback(callback: (eventName: string, data: any) => void): void {
        this.eventCallback = callback;
    }

    public emitEvent(eventName: string, data: any): void {
        if (this.eventCallback) {
            this.eventCallback(eventName, data);
        }
    }

    // Stats tracking methods
    public incrementChickensKilled(): void {
        this.stats.chickensKilled++;
        this.emitEvent('statsUpdate', { stats: this.stats });
    }

    public incrementFeathersCollected(count: number = 1): void {
        this.stats.feathersCollected += count;
        this.emitEvent('statsUpdate', { stats: this.stats });
    }
}
