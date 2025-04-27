import { Position } from '../types';

interface GameWindow {
    title: string;
    position: Position;
    dimensions: {
        width: number;
        height: number;
    };
}

interface ClientBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class GameClientDetector {
    private static readonly CLIENT_TITLE = "2004Scape";
    private static readonly DEFAULT_CLIENT_SIZE = {
        width: 765,
        height: 503
    };

    private gameWindow: GameWindow | null = null;
    private isClientFound: boolean = false;
    private checkInterval: any = null;
    private isBrowserEnvironment: boolean;
    private manualClientBounds: ClientBounds | null = null;

    constructor() {
        this.isBrowserEnvironment = typeof window !== 'undefined';
        if (this.isBrowserEnvironment) {
            // Try to load saved client bounds
            const savedBounds = localStorage.getItem('gameClientBounds');
            if (savedBounds) {
                this.manualClientBounds = JSON.parse(savedBounds);
            }
            this.startDetection();
        }
    }

    public async setClientBounds(bounds: ClientBounds): Promise<void> {
        this.manualClientBounds = bounds;
        localStorage.setItem('gameClientBounds', JSON.stringify(bounds));
        
        // Update game window with manual bounds
        this.gameWindow = {
            title: document.title,
            position: {
                x: bounds.x,
                y: bounds.y
            },
            dimensions: {
                width: bounds.width,
                height: bounds.height
            }
        };
        
        this.isClientFound = true;
        this.emitClientFound();
    }

    public startDetection(): void {
        if (!this.isBrowserEnvironment) {
            console.log('Client detection is only available in browser environment');
            return;
        }

        if (this.checkInterval) {
            return;
        }

        console.log('Starting game client detection...');
        this.checkInterval = setInterval(() => this.detectClient(), 1000);
    }

    public stopDetection(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    private detectClient(): void {
        if (!this.isBrowserEnvironment) return;

        try {
            // If we have manual bounds, use those
            if (this.manualClientBounds) {
                this.isClientFound = true;
                this.gameWindow = {
                    title: document.title,
                    position: {
                        x: this.manualClientBounds.x,
                        y: this.manualClientBounds.y
                    },
                    dimensions: {
                        width: this.manualClientBounds.width,
                        height: this.manualClientBounds.height
                    }
                };
                this.stopDetection();
                this.emitClientFound();
                return;
            }

            // Otherwise try automatic detection
            const gameCanvas = document.querySelector('canvas');
            if (gameCanvas && this.isGameClient(gameCanvas)) {
                this.isClientFound = true;
                this.gameWindow = {
                    title: document.title,
                    position: {
                        x: window.screenX,
                        y: window.screenY
                    },
                    dimensions: {
                        width: gameCanvas.width,
                        height: gameCanvas.height
                    }
                };
                this.stopDetection();
                this.emitClientFound();
            }
        } catch (error) {
            console.error('Error detecting game client:', error);
        }
    }

    private isGameClient(canvas: HTMLCanvasElement): boolean {
        if (!this.isBrowserEnvironment) return false;

        // Check if canvas dimensions match the game client
        const matchesDimensions = 
            canvas.width === GameClientDetector.DEFAULT_CLIENT_SIZE.width &&
            canvas.height === GameClientDetector.DEFAULT_CLIENT_SIZE.height;

        // Check if title contains 2004Scape
        const matchesTitle = document.title.includes(GameClientDetector.CLIENT_TITLE);

        // Check for game-specific elements
        const hasGameElements = this.checkForGameElements();

        return matchesDimensions && matchesTitle && hasGameElements;
    }

    private checkForGameElements(): boolean {
        if (!this.isBrowserEnvironment) return false;

        // Check for specific game UI elements
        const hasGameInterface = document.querySelector('#game-interface') !== null;
        const hasMinimapArea = document.querySelector('#minimap-area') !== null;
        const hasChatbox = document.querySelector('#chatbox-area') !== null;

        // Check for game-specific URLs or resources
        const isGameDomain = window.location.hostname.includes('2004.lostcity.rs');

        return hasGameInterface || hasMinimapArea || hasChatbox || isGameDomain;
    }

    private emitClientFound(): void {
        if (!this.isBrowserEnvironment) return;

        const event = new CustomEvent('gameClientFound', {
            detail: this.gameWindow
        });
        window.dispatchEvent(event);
    }

    public isClientDetected(): boolean {
        return this.isClientFound;
    }

    public getGameWindow(): GameWindow | null {
        return this.gameWindow;
    }

    public async waitForClient(timeout: number = 30000): Promise<GameWindow> {
        if (!this.isBrowserEnvironment) {
            return Promise.reject(new Error('Client detection is only available in browser environment'));
        }

        // If we already have manual bounds, use those immediately
        if (this.manualClientBounds && this.gameWindow) {
            return Promise.resolve(this.gameWindow);
        }

        return new Promise((resolve, reject) => {
            if (this.isClientFound && this.gameWindow) {
                resolve(this.gameWindow);
                return;
            }

            const timeoutId = setTimeout(() => {
                this.stopDetection();
                // Open client selector if automatic detection fails
                window.open('/client-selector', '_blank', 'width=800,height=600');
                reject(new Error('Game client detection timed out. Please use manual selection.'));
            }, timeout);

            window.addEventListener('gameClientFound', ((event: CustomEvent) => {
                clearTimeout(timeoutId);
                resolve(event.detail);
            }) as EventListener);

            this.startDetection();
        });
    }
}
