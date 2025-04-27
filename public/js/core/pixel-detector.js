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
export {
  PixelDetector
};
//# sourceMappingURL=pixel-detector.js.map
