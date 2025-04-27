import { Player } from '../types';
import { PathfindingSystem } from '../core/pathfinding';
import { ChatSystem } from '../core/chat';
import { CharacterCustomization, CharacterAppearance } from '../core/character';

export class TutorialIsland {
    private pathfinding: PathfindingSystem;
    private chat: ChatSystem;

    constructor(private player: Player) {
        this.pathfinding = new PathfindingSystem(player.position);
        this.chat = new ChatSystem();
    }

    public async completeTutorial(): Promise<void> {
        console.log('Starting Tutorial Island...');

        try {
            await this.characterCreation();
            await this.meetGuide();
            await this.survivalSection();
            await this.cookingSection();
            await this.questSection();
            await this.miningSection();
            await this.combatSection();
            await this.bankSection();
            await this.priestSection();
            await this.wizardSection();
            await this.finalSection();

            console.log('Tutorial Island completed successfully!');
        } catch (error) {
            console.error('Error completing tutorial:', error);
            throw error;
        }
    }

    private async characterCreation(): Promise<void> {
        console.log('Character creation...');
        
        // Generate random male appearance
        const appearance = CharacterCustomization.generateRandomMaleAppearance();
        console.log('Generated random male appearance:', appearance);
        
        // Apply appearance settings
        await this.applyCharacterAppearance(appearance);
        
        // Confirm character creation
        await this.wait(1000);
    }

    private async applyCharacterAppearance(appearance: CharacterAppearance): Promise<void> {
        console.log('Applying character appearance...');
        
        // Set gender (male)
        console.log('Setting gender: male');
        
        // Set head style
        console.log(`Setting head style: ${appearance.head}`);
        
        // Set jaw style
        console.log(`Setting jaw style: ${appearance.jaw}`);
        
        // Set torso style
        console.log(`Setting torso style: ${appearance.torso}`);
        
        // Set arms style
        console.log(`Setting arms style: ${appearance.arms}`);
        
        // Set hands style
        console.log(`Setting hands style: ${appearance.hands}`);
        
        // Set legs style
        console.log(`Setting legs style: ${appearance.legs}`);
        
        // Set feet style
        console.log(`Setting feet style: ${appearance.feet}`);
        
        // Set colors
        console.log(`Setting hair color: ${appearance.hairColor}`);
        console.log(`Setting torso color: ${appearance.torsoColor}`);
        console.log(`Setting legs color: ${appearance.legsColor}`);
        console.log(`Setting feet color: ${appearance.feetColor}`);
        console.log(`Setting skin color: ${appearance.skinColor}`);
        
        // Wait for appearance updates to apply
        await this.wait(500);
    }

    private async meetGuide(): Promise<void> {
        console.log('Meeting the guide...');
        await this.pathfinding.moveToTutorialSection('GUIDE');
        // Talk to guide dialogue
        await this.wait(2000);
    }

    private async survivalSection(): Promise<void> {
        console.log('Survival section...');
        await this.pathfinding.moveToTutorialSection('SURVIVAL_EXPERT');
        
        // Fishing spot interaction
        await this.wait(1000);
        
        // Make fire
        await this.wait(1500);
        
        // Cook shrimps
        await this.wait(2000);
    }

    private async cookingSection(): Promise<void> {
        console.log('Cooking section...');
        // Navigate to cooking area
        await this.wait(1500);
        
        // Make bread
        await this.wait(2000);
    }

    private async questSection(): Promise<void> {
        console.log('Quest section...');
        // Talk to quest guide
        await this.wait(1500);
        
        // Open quest menu
        await this.wait(1000);
    }

    private async miningSection(): Promise<void> {
        console.log('Mining section...');
        // Mine tin
        await this.wait(2000);
        
        // Mine copper
        await this.wait(2000);
        
        // Smelt bronze
        await this.wait(2000);
        
        // Smith dagger
        await this.wait(2000);
    }

    private async combatSection(): Promise<void> {
        console.log('Combat section...');
        await this.pathfinding.moveToTutorialSection('COMBAT_AREA');
        
        // Equip gear
        await this.wait(1000);
        
        // Attack rat
        await this.wait(3000);
    }

    private async bankSection(): Promise<void> {
        console.log('Banking section...');
        await this.pathfinding.moveToTutorialSection('BANK');
        
        // Open bank
        await this.wait(1500);
        
        // Learn about PIN
        await this.wait(1000);
    }

    private async priestSection(): Promise<void> {
        console.log('Prayer section...');
        // Visit church
        await this.wait(2000);
        
        // Learn about prayer
        await this.wait(1500);
    }

    private async wizardSection(): Promise<void> {
        console.log('Magic section...');
        // Learn about magic
        await this.wait(2000);
        
        // Cast wind strike
        await this.wait(1500);
    }

    private async finalSection(): Promise<void> {
        console.log('Final section...');
        // Final guide conversation
        await this.wait(1500);
        
        // Complete tutorial
        await this.wait(1000);
    }

    private async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
