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
export {
  GameClientDetector
};
//# sourceMappingURL=client-detector.js.map
