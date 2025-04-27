import { Position } from '../types';
import { GameClientDetector } from './client-detector';
import { PixelDetector } from './pixel-detector';

interface GameElement {
    type: string;
    position: Position;
    confidence: number;
}

export class GameInteraction {
    private clientDetector: GameClientDetector;
    private pixelDetector: PixelDetector;
    private lastInteractionTime: number = 0;
    private readonly MIN_INTERACTION_DELAY = 600; // Minimum delay between actions in ms

    constructor() {
        this.clientDetector = new GameClientDetector();
        this.pixelDetector = new PixelDetector();
    }

    public async initialize(): Promise<void> {
        await this.clientDetector.waitForClient();
        console.log('Game client detected and ready for interaction');
    }

    public async findGameElement(elementType: string): Promise<GameElement | null> {
        const element = await this.pixelDetector.waitForGameElement(elementType);
        if (!element) {
            return null;
        }

        return {
            type: elementType,
            position: { x: element.x, y: element.y },
            confidence: element.confidence
        };
    }

    public async clickGameElement(elementType: string, rightClick: boolean = false): Promise<boolean> {
        const element = await this.findGameElement(elementType);
        if (!element) {
            console.log(`Could not find game element: ${elementType}`);
            return false;
        }

        await this.enforceDelay();
        await this.simulateMouseMovement(element.position);
        await this.click(element.position, rightClick);
        
        return true;
    }

    private async simulateMouseMovement(target: Position): Promise<void> {
        // Get current mouse position from game canvas
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        const currentY = rect.top + rect.height / 2;

        // Calculate path to target
        const path = this.generateMousePath(
            { x: currentX, y: currentY },
            { x: target.x, y: target.y }
        );

        // Move mouse along path
        for (const point of path) {
            await this.moveMouse(point);
            await this.wait(Math.random() * 10 + 5); // Small random delay
        }
    }

    private generateMousePath(start: Position, end: Position): Position[] {
        const path: Position[] = [];
        const steps = 10; // Number of points in the path

        for (let i = 0; i <= steps; i++) {
            // Add some randomness to the path
            const progress = i / steps;
            const randomOffset = {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            };

            path.push({
                x: start.x + (end.x - start.x) * progress + randomOffset.x,
                y: start.y + (end.y - start.y) * progress + randomOffset.y
            });
        }

        return path;
    }

    private async moveMouse(position: Position): Promise<void> {
        const event = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: position.x,
            clientY: position.y
        });

        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.dispatchEvent(event);
        }
    }

    private async click(position: Position, rightClick: boolean = false): Promise<void> {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        // Mouse down event
        const downEvent = new MouseEvent(rightClick ? 'contextmenu' : 'mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: position.x,
            clientY: position.y,
            button: rightClick ? 2 : 0
        });
        canvas.dispatchEvent(downEvent);

        // Small delay between down and up
        await this.wait(50 + Math.random() * 50);

        // Mouse up event
        const upEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: position.x,
            clientY: position.y,
            button: rightClick ? 2 : 0
        });
        canvas.dispatchEvent(upEvent);
    }

    public async typeText(text: string): Promise<void> {
        await this.enforceDelay();

        for (const char of text) {
            const keyDownEvent = new KeyboardEvent('keydown', {
                key: char,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(keyDownEvent);

            await this.wait(50 + Math.random() * 50);

            const keyUpEvent = new KeyboardEvent('keyup', {
                key: char,
                bubbles: true,
                cancelable: true
            });
            document.dispatchEvent(keyUpEvent);

            await this.wait(50 + Math.random() * 100);
        }
    }

    private async enforceDelay(): Promise<void> {
        const now = Date.now();
        const timeSinceLastInteraction = now - this.lastInteractionTime;
        
        if (timeSinceLastInteraction < this.MIN_INTERACTION_DELAY) {
            await this.wait(this.MIN_INTERACTION_DELAY - timeSinceLastInteraction);
        }
        
        this.lastInteractionTime = Date.now();
    }

    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Game-specific interactions
    public async attackNPC(npcType: string): Promise<boolean> {
        return await this.clickGameElement(npcType, true);
    }

    public async collectGroundItem(itemType: string): Promise<boolean> {
        return await this.clickGameElement(itemType);
    }

    public async navigateToLocation(location: Position): Promise<void> {
        await this.enforceDelay();
        const minimapScale = 3; // Conversion factor from game coords to minimap pixels
        
        // Calculate minimap position
        const minimapElement = await this.findGameElement('minimap');
        if (!minimapElement) {
            throw new Error('Could not find minimap');
        }

        const minimapX = minimapElement.position.x + (location.x / minimapScale);
        const minimapY = minimapElement.position.y + (location.y / minimapScale);

        await this.click({ x: minimapX, y: minimapY }, false);
    }

    public async isPlayerMoving(): Promise<boolean> {
        // Check if the player's position is changing
        const initialPosition = await this.getCurrentPosition();
        await this.wait(500);
        const newPosition = await this.getCurrentPosition();

        return initialPosition.x !== newPosition.x || initialPosition.y !== newPosition.y;
    }

    private async getCurrentPosition(): Promise<Position> {
        // This would need to be implemented based on how the game exposes player position
        // For now, return a dummy position
        return { x: 0, y: 0 };
    }
}
