export interface CharacterAppearance {
    gender: 'male';
    head: number;
    jaw: number;
    torso: number;
    arms: number;
    hands: number;
    legs: number;
    feet: number;
    hairColor: number;
    torsoColor: number;
    legsColor: number;
    feetColor: number;
    skinColor: number;
}

export class CharacterCustomization {
    // Valid style IDs for male characters
    private static readonly MALE_STYLES = {
        heads: [0, 1, 2, 3, 4, 5, 6, 7],
        jaws: [0, 1, 2, 3, 4, 5, 6, 7],
        torsos: [0, 1, 2, 3],
        arms: [0, 1, 2, 3],
        hands: [0],
        legs: [0, 1, 2, 3],
        feet: [0, 1, 2, 3]
    };

    // Valid color IDs
    private static readonly COLORS = {
        hair: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        torso: [0, 1, 2, 3, 4, 5, 6, 7],
        legs: [0, 1, 2, 3, 4, 5, 6, 7],
        feet: [0, 1, 2, 3, 4],
        skin: [0, 1, 2, 3, 4, 5, 6, 7]
    };

    public static generateRandomMaleAppearance(): CharacterAppearance {
        return {
            gender: 'male',
            head: this.getRandomElement(this.MALE_STYLES.heads),
            jaw: this.getRandomElement(this.MALE_STYLES.jaws),
            torso: this.getRandomElement(this.MALE_STYLES.torsos),
            arms: this.getRandomElement(this.MALE_STYLES.arms),
            hands: this.getRandomElement(this.MALE_STYLES.hands),
            legs: this.getRandomElement(this.MALE_STYLES.legs),
            feet: this.getRandomElement(this.MALE_STYLES.feet),
            hairColor: this.getRandomElement(this.COLORS.hair),
            torsoColor: this.getRandomElement(this.COLORS.torso),
            legsColor: this.getRandomElement(this.COLORS.legs),
            feetColor: this.getRandomElement(this.COLORS.feet),
            skinColor: this.getRandomElement(this.COLORS.skin)
        };
    }

    private static getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}
