import { Position, NPC, Player } from '../types';

export class CombatSystem {
    private readonly ATTACK_RANGE = 1; // Melee attack range
    private readonly ATTACK_DELAY = 2400; // Attack speed in milliseconds
    private lastAttackTime: number = 0;

    constructor(private player: Player) {}

    public async attackTarget(target: NPC): Promise<void> {
        const currentTime = Date.now();
        
        // Check if we can attack again (cooldown)
        if (currentTime - this.lastAttackTime < this.ATTACK_DELAY) {
            return;
        }

        // Check if target is in range
        if (this.isTargetInRange(target.position)) {
            console.log(`Attacking ${target.name}`);
            await this.performAttack(target);
            this.lastAttackTime = currentTime;
        } else {
            console.log(`${target.name} is not in range`);
        }
    }

    public async killChickens(): Promise<void> {
        const chickenLocations = this.getLumbridgeChickenLocations();
        
        for (const location of chickenLocations) {
            // Find nearest chicken
            const chicken: NPC = {
                id: 1,
                name: 'Chicken',
                position: location
            };

            // Attack chicken until dead
            await this.attackTarget(chicken);
            
            // Collect feathers
            await this.collectDrops(location);
        }
    }

    public async trainSwordCombat(): Promise<void> {
        // Train with sword on chickens for optimal xp
        console.log('Training sword combat skills...');
        
        // Ensure we have a sword equipped
        await this.checkEquipment();
        
        // Find and attack chickens
        await this.killChickens();
    }

    private async performAttack(target: NPC): Promise<void> {
        // Calculate hit chance and damage
        const damage = this.calculateDamage();
        console.log(`Hit ${target.name} for ${damage} damage`);
    }

    private calculateDamage(): number {
        // Basic damage calculation based on stats and weapon
        const baseMax = 4; // Basic sword max hit
        return Math.floor(Math.random() * baseMax) + 1;
    }

    private isTargetInRange(targetPosition: Position): boolean {
        const distance = this.calculateDistance(this.player.position, targetPosition);
        if (distance > this.ATTACK_RANGE) {
            // Move closer to target if not in range
            this.moveTowardTarget(targetPosition);
            return false;
        }
        return true;
    }

    private moveTowardTarget(targetPosition: Position): void {
        // Calculate step toward target
        const dx = targetPosition.x - this.player.position.x;
        const dy = targetPosition.y - this.player.position.y;
        
        // Normalize movement to 1 tile at a time
        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);
        
        // Update player position
        this.player.position = {
            x: this.player.position.x + stepX,
            y: this.player.position.y + stepY
        };
        
        console.log(`Moving closer to target: ${this.player.position.x}, ${this.player.position.y}`);
    }

    private calculateDistance(pos1: Position, pos2: Position): number {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getLumbridgeChickenLocations(): Position[] {
        // Known chicken locations in Lumbridge
        return [
            { x: 3235, y: 3295 }, // Behind Lumbridge Castle
            { x: 3235, y: 3294 },
            { x: 3236, y: 3296 },
            { x: 3233, y: 3295 }
        ];
    }

    private async checkEquipment(): Promise<void> {
        // Check if sword is equipped
        console.log('Checking equipment...');
        // TODO: Implement equipment checking logic
    }

    private async collectDrops(position: Position): Promise<void> {
        console.log('Collecting feathers...');
        // TODO: Implement drop collection logic
    }
}
