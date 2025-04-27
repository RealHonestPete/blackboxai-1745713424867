import { Player, Position } from '../types';
import { PathfindingSystem } from '../core/pathfinding';
import { CombatSystem } from '../core/combat';
import { ChatSystem } from '../core/chat';

export class ChickenTraining {
    private pathfinding: PathfindingSystem;
    private combat: CombatSystem;
    private chat: ChatSystem;
    private isTraining: boolean = false;

    // Lumbridge chicken coop area boundaries and optimal positions
    private readonly CHICKEN_AREA = {
        minX: 3225,
        maxX: 3236,
        minY: 3285,
        maxY: 3298,
        // Optimal positions for chicken killing
        positions: [
            { x: 3233, y: 3295 }, // Center of chicken coop
            { x: 3231, y: 3294 }, // Near fence
            { x: 3235, y: 3293 }, // Near gate
            { x: 3234, y: 3296 }  // Back corner
        ]
    };

    private currentPositionIndex: number = 0;

    constructor(private player: Player) {
        this.pathfinding = new PathfindingSystem(player.position);
        this.combat = new CombatSystem(player);
        this.chat = new ChatSystem();
    }

    public async startTraining(): Promise<void> {
        console.log('Starting chicken training routine...');
        this.isTraining = true;

        try {
            // First, get to the chicken area
            await this.goToChickenArea();

            while (this.isTraining) {
                // Main training loop
                await this.trainOnChickens();
                
                // Check inventory
                if (await this.isInventoryFull()) {
                    await this.handleFullInventory();
                }

                // Chat disabled
                // if (Math.random() < 0.1) { // 10% chance per loop
                //     await this.sendRandomTrainingMessage();
                // }

                // Small delay between iterations
                await this.wait(1000);
            }
        } catch (error) {
            console.error('Error during chicken training:', error);
            this.isTraining = false;
            throw error;
        }
    }

    public stopTraining(): void {
        this.isTraining = false;
        console.log('Stopping chicken training...');
    }

    private async goToChickenArea(): Promise<void> {
        console.log('Moving to Lumbridge chicken coop...');
        await this.pathfinding.moveToLumbridgeLocation('CHICKEN_COOP');
    }

    private async trainOnChickens(): Promise<void> {
        // Move to next optimal position
        const currentPosition = this.CHICKEN_AREA.positions[this.currentPositionIndex];
        
        // Move to position if not already there
        if (!this.isAtPosition(this.player.position, currentPosition)) {
            await this.pathfinding.moveTo(currentPosition);
        }

        // Find and attack chickens
        await this.combat.killChickens();
        
        // Collect feathers and other drops
        await this.collectDrops();

        // Rotate through positions
        this.currentPositionIndex = (this.currentPositionIndex + 1) % this.CHICKEN_AREA.positions.length;
        
        // Small delay before next position
        await this.wait(500);
    }

    private isAtPosition(current: Position, target: Position, tolerance: number = 1): boolean {
        return Math.abs(current.x - target.x) <= tolerance && 
               Math.abs(current.y - target.y) <= tolerance;
    }

    private async collectDrops(): Promise<void> {
        console.log('Collecting drops...');
        // Implement drop collection logic
        await this.wait(500);
    }

    private async isInventoryFull(): Promise<boolean> {
        // Check if inventory is full (28 slots)
        return this.player.inventory.length >= 28;
    }

    private async handleFullInventory(): Promise<void> {
        console.log('Inventory full, banking items...');
        
        // Go to Lumbridge bank
        await this.pathfinding.moveToLumbridgeLocation('BANK');
        
        // Bank items
        await this.bankItems();
        
        // Return to chicken area
        await this.goToChickenArea();
    }

    private async bankItems(): Promise<void> {
        console.log('Banking feathers and drops...');
        // Implement banking logic
        await this.wait(1000);
    }

    private async sendRandomTrainingMessage(): Promise<void> {
        const trainingMessages = [
            "These chickens are great for training!",
            "Anyone know where I can sell these feathers?",
            "My combat skills are getting better!",
            "This is a good spot for beginners like me",
            "How many feathers should I collect?"
        ];

        const message = trainingMessages[Math.floor(Math.random() * trainingMessages.length)];
        await this.chat.sendMessage(message);
    }

    private isInChickenArea(position: Position): boolean {
        return position.x >= this.CHICKEN_AREA.minX &&
               position.x <= this.CHICKEN_AREA.maxX &&
               position.y >= this.CHICKEN_AREA.minY &&
               position.y <= this.CHICKEN_AREA.maxY;
    }

    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
