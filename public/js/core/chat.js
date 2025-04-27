// src/core/chat.ts
var ChatSystem = class {
  constructor() {
    this.noobPhrases = [
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
    this.greetings = [
      "Hi!",
      "Hello!",
      "Hey there!",
      "Sup!",
      "Hi everyone!"
    ];
    this.responses = [
      "Thanks for the help!",
      "Oh cool, I didn't know that!",
      "I'm still learning the game",
      "This is my first time playing",
      "That's awesome!"
    ];
    this.questions = [
      "What level are you?",
      "How long have you been playing?",
      "What's the best way to make money?",
      "Where should I train?",
      "Can you show me around?"
    ];
    this.lastMessageTime = 0;
    this.MESSAGE_COOLDOWN = 5e3;
  }
  // 5 seconds cooldown between messages
  generateGreeting() {
    return this.getRandomPhrase(this.greetings);
  }
  generateNoobChat() {
    return this.getRandomPhrase(this.noobPhrases);
  }
  generateResponse() {
    return this.getRandomPhrase(this.responses);
  }
  generateQuestion() {
    return this.getRandomPhrase(this.questions);
  }
  async sendMessage(message) {
    const currentTime = Date.now();
    if (currentTime - this.lastMessageTime >= this.MESSAGE_COOLDOWN) {
      console.log(`[BOT] ${message}`);
      this.lastMessageTime = currentTime;
    }
  }
  async handlePlayerDetected() {
    if (Math.random() < 0.3) {
      const messageType = Math.random();
      let message;
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
  getRandomPhrase(phrases) {
    const index = Math.floor(Math.random() * phrases.length);
    return phrases[index];
  }
};
export {
  ChatSystem
};
//# sourceMappingURL=chat.js.map
