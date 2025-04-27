import { Position } from '../types';

export class PathfindingSystem {
    private readonly WALK_DELAY = 600; // Milliseconds between steps
    private lastMoveTime: number = 0;

    // Common locations
    private readonly LOCATIONS = {
        TUTORIAL_ISLAND: {
            START: { x: 3098, y: 3107 },
            GUIDE: { x: 3099, y: 3109 },
            SURVIVAL_EXPERT: { x: 3106, y: 3115 },
            COMBAT_AREA: { x: 3110, y: 3122 },
            BANK: { x: 3120, y: 3124 }
        },
        LUMBRIDGE: {
            SPAWN: { x: 3222, y: 3219 },
            CHICKEN_COOP: { x: 3235, y: 3295 },
            BANK: { x: 3208, y: 3220 }
        }
    };

    constructor(private currentPosition: Position) {}

    public async moveTo(destination: Position): Promise<void> {
        const path = this.calculatePath(this.currentPosition, destination);
        
        for (const point of path) {
            if (!await this.step(point)) {
                console.log('Path blocked or unable to move');
                break;
            }
        }
    }

    public async moveToTutorialSection(section: keyof typeof this.LOCATIONS.TUTORIAL_ISLAND): Promise<void> {
        const destination = this.LOCATIONS.TUTORIAL_ISLAND[section];
        await this.moveTo(destination);
    }

    public async moveToLumbridgeLocation(location: keyof typeof this.LOCATIONS.LUMBRIDGE): Promise<void> {
        const destination = this.LOCATIONS.LUMBRIDGE[location];
        await this.moveTo(destination);
    }

    private async step(position: Position): Promise<boolean> {
        const currentTime = Date.now();
        
        // Respect walk delay
        if (currentTime - this.lastMoveTime < this.WALK_DELAY) {
            await this.wait(this.WALK_DELAY - (currentTime - this.lastMoveTime));
        }

        // Update position
        this.currentPosition = position;
        this.lastMoveTime = Date.now();
        
        console.log(`Moved to position: ${position.x}, ${position.y}`);
        return true;
    }

    private calculatePath(start: Position, end: Position): Position[] {
        // Simple A* pathfinding implementation
        const path: Position[] = [];
        
        // For now, just return direct path
        // TODO: Implement proper A* pathfinding with collision detection
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        
        for (let i = 1; i <= steps; i++) {
            path.push({
                x: start.x + Math.floor((dx * i) / steps),
                y: start.y + Math.floor((dy * i) / steps)
            });
        }
        
        return path;
    }

    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    public getLocation(area: 'TUTORIAL_ISLAND' | 'LUMBRIDGE', location: string): Position {
        return this.LOCATIONS[area][location as keyof typeof this.LOCATIONS[typeof area]];
    }

    public async navigateToNearestBank(): Promise<void> {
        // Find and move to nearest bank
        const nearestBank = this.findNearestBank();
        await this.moveTo(nearestBank);
    }

    private findNearestBank(): Position {
        // For now, just return Lumbridge bank
        // TODO: Implement actual nearest bank calculation
        return this.LOCATIONS.LUMBRIDGE.BANK;
    }

    public isAtLocation(position: Position, targetPosition: Position, tolerance: number = 1): boolean {
        const dx = Math.abs(position.x - targetPosition.x);
        const dy = Math.abs(position.y - targetPosition.y);
        return dx <= tolerance && dy <= tolerance;
    }
}
