export interface Position {
    x: number;
    y: number;
}

export interface Player {
    position: Position;
    inventory: string[];
    skills: {
        attack: number;
        strength: number;
        defense: number;
    };
}

export interface NPC {
    id: number;
    name: string;
    position: Position;
}

export interface GameItem {
    id: number;
    name: string;
    quantity: number;
}
