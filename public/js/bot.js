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

// src/core/combat.ts
var CombatSystem = class {
  constructor(player) {
    this.player = player;
    this.ATTACK_RANGE = 1;
    // Melee attack range
    this.ATTACK_DELAY = 2400;
    // Attack speed in milliseconds
    this.lastAttackTime = 0;
  }
  async attackTarget(target) {
    const currentTime = Date.now();
    if (currentTime - this.lastAttackTime < this.ATTACK_DELAY) {
      return;
    }
    if (this.isTargetInRange(target.position)) {
      console.log(`Attacking ${target.name}`);
      await this.performAttack(target);
      this.lastAttackTime = currentTime;
    } else {
      console.log(`${target.name} is not in range`);
    }
  }
  async killChickens() {
    const chickenLocations = this.getLumbridgeChickenLocations();
    for (const location of chickenLocations) {
      const chicken = {
        id: 1,
        name: "Chicken",
        position: location
      };
      await this.attackTarget(chicken);
      await this.collectDrops(location);
    }
  }
  async trainSwordCombat() {
    console.log("Training sword combat skills...");
    await this.checkEquipment();
    await this.killChickens();
  }
  async performAttack(target) {
    const damage = this.calculateDamage();
    console.log(`Hit ${target.name} for ${damage} damage`);
  }
  calculateDamage() {
    const baseMax = 4;
    return Math.floor(Math.random() * baseMax) + 1;
  }
  isTargetInRange(targetPosition) {
    const distance = this.calculateDistance(this.player.position, targetPosition);
    if (distance > this.ATTACK_RANGE) {
      this.moveTowardTarget(targetPosition);
      return false;
    }
    return true;
  }
  moveTowardTarget(targetPosition) {
    const dx = targetPosition.x - this.player.position.x;
    const dy = targetPosition.y - this.player.position.y;
    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    this.player.position = {
      x: this.player.position.x + stepX,
      y: this.player.position.y + stepY
    };
    console.log(`Moving closer to target: ${this.player.position.x}, ${this.player.position.y}`);
  }
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  getLumbridgeChickenLocations() {
    return [
      { x: 3235, y: 3295 },
      // Behind Lumbridge Castle
      { x: 3235, y: 3294 },
      { x: 3236, y: 3296 },
      { x: 3233, y: 3295 }
    ];
  }
  async checkEquipment() {
    console.log("Checking equipment...");
  }
  async collectDrops(position) {
    console.log("Collecting feathers...");
  }
};

// src/core/pathfinding.ts
var PathfindingSystem = class {
  constructor(currentPosition) {
    this.currentPosition = currentPosition;
    this.WALK_DELAY = 600;
    // Milliseconds between steps
    this.lastMoveTime = 0;
    // Common locations
    this.LOCATIONS = {
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
  }
  async moveTo(destination) {
    const path = this.calculatePath(this.currentPosition, destination);
    for (const point of path) {
      if (!await this.step(point)) {
        console.log("Path blocked or unable to move");
        break;
      }
    }
  }
  async moveToTutorialSection(section) {
    const destination = this.LOCATIONS.TUTORIAL_ISLAND[section];
    await this.moveTo(destination);
  }
  async moveToLumbridgeLocation(location) {
    const destination = this.LOCATIONS.LUMBRIDGE[location];
    await this.moveTo(destination);
  }
  async step(position) {
    const currentTime = Date.now();
    if (currentTime - this.lastMoveTime < this.WALK_DELAY) {
      await this.wait(this.WALK_DELAY - (currentTime - this.lastMoveTime));
    }
    this.currentPosition = position;
    this.lastMoveTime = Date.now();
    console.log(`Moved to position: ${position.x}, ${position.y}`);
    return true;
  }
  calculatePath(start, end) {
    const path = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    for (let i = 1; i <= steps; i++) {
      path.push({
        x: start.x + Math.floor(dx * i / steps),
        y: start.y + Math.floor(dy * i / steps)
      });
    }
    return path;
  }
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  getLocation(area, location) {
    return this.LOCATIONS[area][location];
  }
  async navigateToNearestBank() {
    const nearestBank = this.findNearestBank();
    await this.moveTo(nearestBank);
  }
  findNearestBank() {
    return this.LOCATIONS.LUMBRIDGE.BANK;
  }
  isAtLocation(position, targetPosition, tolerance = 1) {
    const dx = Math.abs(position.x - targetPosition.x);
    const dy = Math.abs(position.y - targetPosition.y);
    return dx <= tolerance && dy <= tolerance;
  }
};

// src/core/character.ts
var CharacterCustomization = class {
  static generateRandomMaleAppearance() {
    return {
      gender: "male",
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
  static getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
};
// Valid style IDs for male characters
CharacterCustomization.MALE_STYLES = {
  heads: [0, 1, 2, 3, 4, 5, 6, 7],
  jaws: [0, 1, 2, 3, 4, 5, 6, 7],
  torsos: [0, 1, 2, 3],
  arms: [0, 1, 2, 3],
  hands: [0],
  legs: [0, 1, 2, 3],
  feet: [0, 1, 2, 3]
};
// Valid color IDs
CharacterCustomization.COLORS = {
  hair: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  torso: [0, 1, 2, 3, 4, 5, 6, 7],
  legs: [0, 1, 2, 3, 4, 5, 6, 7],
  feet: [0, 1, 2, 3, 4],
  skin: [0, 1, 2, 3, 4, 5, 6, 7]
};

// src/tasks/tutorial.ts
var TutorialIsland = class {
  constructor(player) {
    this.player = player;
    this.pathfinding = new PathfindingSystem(player.position);
    this.chat = new ChatSystem();
  }
  async completeTutorial() {
    console.log("Starting Tutorial Island...");
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
      console.log("Tutorial Island completed successfully!");
    } catch (error) {
      console.error("Error completing tutorial:", error);
      throw error;
    }
  }
  async characterCreation() {
    console.log("Character creation...");
    const appearance = CharacterCustomization.generateRandomMaleAppearance();
    console.log("Generated random male appearance:", appearance);
    await this.applyCharacterAppearance(appearance);
    await this.wait(1e3);
  }
  async applyCharacterAppearance(appearance) {
    console.log("Applying character appearance...");
    console.log("Setting gender: male");
    console.log(`Setting head style: ${appearance.head}`);
    console.log(`Setting jaw style: ${appearance.jaw}`);
    console.log(`Setting torso style: ${appearance.torso}`);
    console.log(`Setting arms style: ${appearance.arms}`);
    console.log(`Setting hands style: ${appearance.hands}`);
    console.log(`Setting legs style: ${appearance.legs}`);
    console.log(`Setting feet style: ${appearance.feet}`);
    console.log(`Setting hair color: ${appearance.hairColor}`);
    console.log(`Setting torso color: ${appearance.torsoColor}`);
    console.log(`Setting legs color: ${appearance.legsColor}`);
    console.log(`Setting feet color: ${appearance.feetColor}`);
    console.log(`Setting skin color: ${appearance.skinColor}`);
    await this.wait(500);
  }
  async meetGuide() {
    console.log("Meeting the guide...");
    await this.pathfinding.moveToTutorialSection("GUIDE");
    await this.wait(2e3);
  }
  async survivalSection() {
    console.log("Survival section...");
    await this.pathfinding.moveToTutorialSection("SURVIVAL_EXPERT");
    await this.wait(1e3);
    await this.wait(1500);
    await this.wait(2e3);
  }
  async cookingSection() {
    console.log("Cooking section...");
    await this.wait(1500);
    await this.wait(2e3);
  }
  async questSection() {
    console.log("Quest section...");
    await this.wait(1500);
    await this.wait(1e3);
  }
  async miningSection() {
    console.log("Mining section...");
    await this.wait(2e3);
    await this.wait(2e3);
    await this.wait(2e3);
    await this.wait(2e3);
  }
  async combatSection() {
    console.log("Combat section...");
    await this.pathfinding.moveToTutorialSection("COMBAT_AREA");
    await this.wait(1e3);
    await this.wait(3e3);
  }
  async bankSection() {
    console.log("Banking section...");
    await this.pathfinding.moveToTutorialSection("BANK");
    await this.wait(1500);
    await this.wait(1e3);
  }
  async priestSection() {
    console.log("Prayer section...");
    await this.wait(2e3);
    await this.wait(1500);
  }
  async wizardSection() {
    console.log("Magic section...");
    await this.wait(2e3);
    await this.wait(1500);
  }
  async finalSection() {
    console.log("Final section...");
    await this.wait(1500);
    await this.wait(1e3);
  }
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/tasks/chicken.ts
var ChickenTraining = class {
  constructor(player) {
    this.player = player;
    this.isTraining = false;
    // Lumbridge chicken coop area boundaries and optimal positions
    this.CHICKEN_AREA = {
      minX: 3225,
      maxX: 3236,
      minY: 3285,
      maxY: 3298,
      // Optimal positions for chicken killing
      positions: [
        { x: 3233, y: 3295 },
        // Center of chicken coop
        { x: 3231, y: 3294 },
        // Near fence
        { x: 3235, y: 3293 },
        // Near gate
        { x: 3234, y: 3296 }
        // Back corner
      ]
    };
    this.currentPositionIndex = 0;
    this.pathfinding = new PathfindingSystem(player.position);
    this.combat = new CombatSystem(player);
    this.chat = new ChatSystem();
  }
  async startTraining() {
    console.log("Starting chicken training routine...");
    this.isTraining = true;
    try {
      await this.goToChickenArea();
      while (this.isTraining) {
        await this.trainOnChickens();
        if (await this.isInventoryFull()) {
          await this.handleFullInventory();
        }
        await this.wait(1e3);
      }
    } catch (error) {
      console.error("Error during chicken training:", error);
      this.isTraining = false;
      throw error;
    }
  }
  stopTraining() {
    this.isTraining = false;
    console.log("Stopping chicken training...");
  }
  async goToChickenArea() {
    console.log("Moving to Lumbridge chicken coop...");
    await this.pathfinding.moveToLumbridgeLocation("CHICKEN_COOP");
  }
  async trainOnChickens() {
    const currentPosition = this.CHICKEN_AREA.positions[this.currentPositionIndex];
    if (!this.isAtPosition(this.player.position, currentPosition)) {
      await this.pathfinding.moveTo(currentPosition);
    }
    await this.combat.killChickens();
    await this.collectDrops();
    this.currentPositionIndex = (this.currentPositionIndex + 1) % this.CHICKEN_AREA.positions.length;
    await this.wait(500);
  }
  isAtPosition(current, target, tolerance = 1) {
    return Math.abs(current.x - target.x) <= tolerance && Math.abs(current.y - target.y) <= tolerance;
  }
  async collectDrops() {
    console.log("Collecting drops...");
    await this.wait(500);
  }
  async isInventoryFull() {
    return this.player.inventory.length >= 28;
  }
  async handleFullInventory() {
    console.log("Inventory full, banking items...");
    await this.pathfinding.moveToLumbridgeLocation("BANK");
    await this.bankItems();
    await this.goToChickenArea();
  }
  async bankItems() {
    console.log("Banking feathers and drops...");
    await this.wait(1e3);
  }
  async sendRandomTrainingMessage() {
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
  isInChickenArea(position) {
    return position.x >= this.CHICKEN_AREA.minX && position.x <= this.CHICKEN_AREA.maxX && position.y >= this.CHICKEN_AREA.minY && position.y <= this.CHICKEN_AREA.maxY;
  }
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

// src/core/client-detector.ts
var _GameClientDetector = class _GameClientDetector {
  constructor() {
    this.gameWindow = null;
    this.isClientFound = false;
    this.checkInterval = null;
    this.startDetection();
  }
  startDetection() {
    if (this.checkInterval) {
      return;
    }
    console.log("Starting game client detection...");
    this.checkInterval = setInterval(() => this.detectClient(), 1e3);
  }
  stopDetection() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  detectClient() {
    try {
      if (typeof window !== "undefined") {
        const gameCanvas = document.querySelector("canvas");
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
          console.log("2004Scape client detected:", this.gameWindow);
          this.stopDetection();
          this.emitClientFound();
        }
      }
    } catch (error) {
      console.error("Error detecting game client:", error);
    }
  }
  isGameClient(canvas) {
    const matchesDimensions = canvas.width === _GameClientDetector.DEFAULT_CLIENT_SIZE.width && canvas.height === _GameClientDetector.DEFAULT_CLIENT_SIZE.height;
    const matchesTitle = document.title.includes(_GameClientDetector.CLIENT_TITLE);
    const hasGameElements = this.checkForGameElements();
    return matchesDimensions && matchesTitle && hasGameElements;
  }
  checkForGameElements() {
    const hasGameInterface = document.querySelector("#game-interface") !== null;
    const hasMinimapArea = document.querySelector("#minimap-area") !== null;
    const hasChatbox = document.querySelector("#chatbox-area") !== null;
    const isGameDomain = window.location.hostname.includes("2004.lostcity.rs");
    return hasGameInterface || hasMinimapArea || hasChatbox || isGameDomain;
  }
  emitClientFound() {
    const event = new CustomEvent("gameClientFound", {
      detail: this.gameWindow
    });
    window.dispatchEvent(event);
  }
  isClientDetected() {
    return this.isClientFound;
  }
  getGameWindow() {
    return this.gameWindow;
  }
  async waitForClient(timeout = 3e4) {
    return new Promise((resolve, reject) => {
      if (this.isClientFound && this.gameWindow) {
        resolve(this.gameWindow);
        return;
      }
      const timeoutId = setTimeout(() => {
        this.stopDetection();
        reject(new Error("Game client detection timed out"));
      }, timeout);
      window.addEventListener("gameClientFound", (event) => {
        clearTimeout(timeoutId);
        resolve(event.detail);
      });
      this.startDetection();
    });
  }
};
_GameClientDetector.CLIENT_TITLE = "2004Scape";
_GameClientDetector.DEFAULT_CLIENT_SIZE = {
  width: 765,
  height: 503
};
var GameClientDetector = _GameClientDetector;

// src/core/pixel-detector.ts
var PixelDetector = class {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    if (typeof window !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
    }
  }
  async captureGameScreen() {
    if (!this.canvas || !this.ctx) {
      return null;
    }
    try {
      const gameCanvas = document.querySelector("canvas");
      if (!gameCanvas) {
        return null;
      }
      this.canvas.width = gameCanvas.width;
      this.canvas.height = gameCanvas.height;
      this.ctx.drawImage(gameCanvas, 0, 0);
      return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    } catch (error) {
      console.error("Error capturing game screen:", error);
      return null;
    }
  }
  findColorMatch(imageData, targetColor, tolerance = 5) {
    const matches = [];
    const data = imageData.data;
    const width = imageData.width;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (this.isColorMatch({ r, g, b }, targetColor, tolerance)) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        const confidence = this.calculateConfidence({ r, g, b }, targetColor);
        matches.push({ x, y, confidence });
      }
    }
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
  isColorMatch(color1, color2, tolerance) {
    return Math.abs(color1.r - color2.r) <= tolerance && Math.abs(color1.g - color2.g) <= tolerance && Math.abs(color1.b - color2.b) <= tolerance;
  }
  calculateConfidence(color1, color2) {
    const rDiff = Math.abs(color1.r - color2.r);
    const gDiff = Math.abs(color1.g - color2.g);
    const bDiff = Math.abs(color1.b - color2.b);
    const maxDiff = 255 * 3;
    const totalDiff = rDiff + gDiff + bDiff;
    return 1 - totalDiff / maxDiff;
  }
  // Game-specific color detection methods
  async findGameElements() {
    const imageData = await this.captureGameScreen();
    if (!imageData) {
      return {};
    }
    return {
      // Common UI elements
      minimap: this.findColorMatch(imageData, { r: 0, g: 0, b: 0 }, 10),
      // Black border
      chatbox: this.findColorMatch(imageData, { r: 65, g: 54, b: 38 }, 10),
      // Brown background
      // Game objects
      chickens: this.findColorMatch(imageData, { r: 255, g: 255, b: 255 }, 15),
      // White feathers
      feathers: this.findColorMatch(imageData, { r: 238, g: 238, b: 238 }, 10),
      // Ground items
      // Combat elements
      healthBar: this.findColorMatch(imageData, { r: 255, g: 0, b: 0 }, 10),
      // Red health
      attackOptions: this.findColorMatch(imageData, { r: 255, g: 255, b: 0 }, 10)
      // Yellow text
    };
  }
  async waitForGameElement(elementType, timeout = 5e3) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const elements = await this.findGameElements();
      const matches = elements[elementType] || [];
      if (matches.length > 0) {
        return matches[0];
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return null;
  }
};

// src/core/game-interaction.ts
var GameInteraction = class {
  // Minimum delay between actions in ms
  constructor() {
    this.lastInteractionTime = 0;
    this.MIN_INTERACTION_DELAY = 600;
    this.clientDetector = new GameClientDetector();
    this.pixelDetector = new PixelDetector();
  }
  async initialize() {
    await this.clientDetector.waitForClient();
    console.log("Game client detected and ready for interaction");
  }
  async findGameElement(elementType) {
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
  async clickGameElement(elementType, rightClick = false) {
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
  async simulateMouseMovement(target) {
    const canvas = document.querySelector("canvas");
    if (!canvas)
      return;
    const rect = canvas.getBoundingClientRect();
    const currentX = rect.left + rect.width / 2;
    const currentY = rect.top + rect.height / 2;
    const path = this.generateMousePath(
      { x: currentX, y: currentY },
      { x: target.x, y: target.y }
    );
    for (const point of path) {
      await this.moveMouse(point);
      await this.wait(Math.random() * 10 + 5);
    }
  }
  generateMousePath(start, end) {
    const path = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
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
  async moveMouse(position) {
    const event = new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      clientX: position.x,
      clientY: position.y
    });
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.dispatchEvent(event);
    }
  }
  async click(position, rightClick = false) {
    const canvas = document.querySelector("canvas");
    if (!canvas)
      return;
    const downEvent = new MouseEvent(rightClick ? "contextmenu" : "mousedown", {
      bubbles: true,
      cancelable: true,
      clientX: position.x,
      clientY: position.y,
      button: rightClick ? 2 : 0
    });
    canvas.dispatchEvent(downEvent);
    await this.wait(50 + Math.random() * 50);
    const upEvent = new MouseEvent("mouseup", {
      bubbles: true,
      cancelable: true,
      clientX: position.x,
      clientY: position.y,
      button: rightClick ? 2 : 0
    });
    canvas.dispatchEvent(upEvent);
  }
  async typeText(text) {
    await this.enforceDelay();
    for (const char of text) {
      const keyDownEvent = new KeyboardEvent("keydown", {
        key: char,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyDownEvent);
      await this.wait(50 + Math.random() * 50);
      const keyUpEvent = new KeyboardEvent("keyup", {
        key: char,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(keyUpEvent);
      await this.wait(50 + Math.random() * 100);
    }
  }
  async enforceDelay() {
    const now = Date.now();
    const timeSinceLastInteraction = now - this.lastInteractionTime;
    if (timeSinceLastInteraction < this.MIN_INTERACTION_DELAY) {
      await this.wait(this.MIN_INTERACTION_DELAY - timeSinceLastInteraction);
    }
    this.lastInteractionTime = Date.now();
  }
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // Game-specific interactions
  async attackNPC(npcType) {
    return await this.clickGameElement(npcType, true);
  }
  async collectGroundItem(itemType) {
    return await this.clickGameElement(itemType);
  }
  async navigateToLocation(location) {
    await this.enforceDelay();
    const minimapScale = 3;
    const minimapElement = await this.findGameElement("minimap");
    if (!minimapElement) {
      throw new Error("Could not find minimap");
    }
    const minimapX = minimapElement.position.x + location.x / minimapScale;
    const minimapY = minimapElement.position.y + location.y / minimapScale;
    await this.click({ x: minimapX, y: minimapY }, false);
  }
  async isPlayerMoving() {
    const initialPosition = await this.getCurrentPosition();
    await this.wait(500);
    const newPosition = await this.getCurrentPosition();
    return initialPosition.x !== newPosition.x || initialPosition.y !== newPosition.y;
  }
  async getCurrentPosition() {
    return { x: 0, y: 0 };
  }
};

// src/core/bot.ts
var RunescapeBot = class {
  constructor() {
    this.isRunning = false;
    this.stats = {
      chickensKilled: 0,
      feathersCollected: 0
    };
    this.eventCallback = null;
    this.player = {
      position: { x: 3098, y: 3107 },
      // Tutorial Island starting position
      inventory: [],
      skills: {
        attack: 1,
        strength: 1,
        defense: 1
      }
    };
    this.chatSystem = new ChatSystem();
    this.combatSystem = new CombatSystem(this.player);
    this.pathfinding = new PathfindingSystem(this.player.position);
    this.tutorialIsland = new TutorialIsland(this.player);
    this.chickenTraining = new ChickenTraining(this.player);
    this.clientDetector = new GameClientDetector();
    this.gameInteraction = new GameInteraction();
    this.pixelDetector = new PixelDetector();
  }
  async start() {
    try {
      this.emitEvent("progress", { message: "Detecting game client..." });
      await this.gameInteraction.initialize();
      this.emitEvent("progress", { message: "Game client detected!" });
      const canInteract = await this.verifyGameInteraction();
      if (!canInteract) {
        throw new Error("Unable to interact with game client");
      }
      this.isRunning = true;
      this.emitEvent("botStarted", {});
      console.log("Bot started");
      await this.completeTutorialIsland();
      await this.startChickenTraining();
    } catch (error) {
      console.error("Bot error:", error);
      this.emitEvent("botError", { error });
      this.stop();
    }
  }
  async verifyGameInteraction() {
    try {
      const gameElements = await this.pixelDetector.findGameElements();
      const hasMinimapElement = gameElements.minimap && gameElements.minimap.length > 0;
      const hasChatboxElement = gameElements.chatbox && gameElements.chatbox.length > 0;
      if (!hasMinimapElement || !hasChatboxElement) {
        console.error("Could not find essential game elements");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error verifying game interaction:", error);
      return false;
    }
  }
  stop() {
    this.isRunning = false;
    this.chickenTraining.stopTraining();
    this.clientDetector.stopDetection();
    this.emitEvent("botStopped", {});
    console.log("Bot stopped");
  }
  async completeTutorialIsland() {
    console.log("Starting Tutorial Island...");
    this.emitEvent("progress", { message: "Starting Tutorial Island..." });
    try {
      await this.handleTutorialIsland();
      this.emitEvent("progress", { message: "Tutorial Island completed!" });
      console.log("Tutorial Island completed!");
    } catch (error) {
      console.error("Error completing Tutorial Island:", error);
      throw error;
    }
  }
  async handleTutorialIsland() {
    const steps = [
      { type: "npc", name: "Guide", dialogue: ["Yes, I want to play RuneScape."] },
      { type: "npc", name: "Survival Expert", dialogue: ["I want to learn survival skills."] }
      // Add more tutorial steps as needed
    ];
    for (const step of steps) {
      if (!this.isRunning)
        break;
      try {
        await this.handleTutorialStep(step);
      } catch (error) {
        console.error(`Error in tutorial step:`, error);
        throw error;
      }
    }
  }
  async handleTutorialStep(step) {
    switch (step.type) {
      case "npc":
        await this.gameInteraction.clickGameElement(step.name);
        await this.wait(1e3);
        for (const text of step.dialogue) {
          await this.gameInteraction.typeText(text + String.fromCharCode(13));
          await this.wait(500);
        }
        break;
    }
  }
  async startChickenTraining() {
    console.log("Starting chicken training...");
    this.emitEvent("progress", { message: "Starting chicken training..." });
    while (this.isRunning) {
      try {
        const chickenFound = await this.gameInteraction.attackNPC("chicken");
        if (chickenFound) {
          await this.wait(3e3);
          const feathersFound = await this.gameInteraction.collectGroundItem("feather");
          if (feathersFound) {
            this.incrementFeathersCollected();
          }
        }
        await this.wait(500);
      } catch (error) {
        console.error("Error in chicken training:", error);
      }
    }
  }
  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // UI Integration Methods
  getStats() {
    return this.stats;
  }
  getPlayer() {
    return this.player;
  }
  isActive() {
    return this.isRunning;
  }
  setEventCallback(callback) {
    this.eventCallback = callback;
  }
  emitEvent(eventName, data) {
    if (this.eventCallback) {
      this.eventCallback(eventName, data);
    }
  }
  // Stats tracking methods
  incrementChickensKilled() {
    this.stats.chickensKilled++;
    this.emitEvent("statsUpdate", { stats: this.stats });
  }
  incrementFeathersCollected(count = 1) {
    this.stats.feathersCollected += count;
    this.emitEvent("statsUpdate", { stats: this.stats });
  }
};
export {
  RunescapeBot
};
//# sourceMappingURL=bot.js.map
