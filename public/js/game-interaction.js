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
export {
  GameInteraction
};
//# sourceMappingURL=game-interaction.js.map
