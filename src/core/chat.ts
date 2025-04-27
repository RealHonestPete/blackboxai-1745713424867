export class ChatSystem {
    private readonly noobPhrases = [
        "How do I train combat?",
        "Where can I find chickens?",
        "Anyone want to be friends?",
        "I just started playing!",
        "How do I make money?",
        "This game is fun!",
        "Can someone help me?",
        "Where can I buy a sword?",
        "How do I level up fast?",
        "What should I do next?"
    ];

    private readonly greetings = [
        "Hi!",
        "Hello!",
        "Hey there!",
        "Sup!",
        "Hi everyone!"
    ];

    private readonly responses = [
        "Thanks for the help!",
        "Oh cool, I didn't know that!",
        "I'm still learning the game",
        "This is my first time playing",
        "That's awesome!"
    ];

    private readonly questions = [
        "What level are you?",
        "How long have you been playing?",
        "What's the best way to make money?",
        "Where should I train?",
        "Can you show me around?"
    ];

    private lastMessageTime: number = 0;
    private readonly MESSAGE_COOLDOWN: number = 5000; // 5 seconds cooldown between messages

    public generateGreeting(): string {
        return this.getRandomPhrase(this.greetings);
    }

    public generateNoobChat(): string {
        return this.getRandomPhrase(this.noobPhrases);
    }

    public generateResponse(): string {
        return this.getRandomPhrase(this.responses);
    }

    public generateQuestion(): string {
        return this.getRandomPhrase(this.questions);
    }

    public async sendMessage(message: string): Promise<void> {
        const currentTime = Date.now();
        if (currentTime - this.lastMessageTime >= this.MESSAGE_COOLDOWN) {
            console.log(`[BOT] ${message}`);
            this.lastMessageTime = currentTime;
        }
    }

    public async handlePlayerDetected(): Promise<void> {
        // 30% chance to initiate conversation when seeing another player
        if (Math.random() < 0.3) {
            const messageType = Math.random();
            let message: string;

            if (messageType < 0.3) {
                message = this.generateGreeting();
            } else if (messageType < 0.6) {
                message = this.generateQuestion();
            } else {
                message = this.generateNoobChat();
            }

            await this.sendMessage(message);
        }
    }

    private getRandomPhrase(phrases: string[]): string {
        const index = Math.floor(Math.random() * phrases.length);
        return phrases[index];
    }
}
