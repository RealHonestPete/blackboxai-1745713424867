// src/core/client-detector.ts
var _GameClientDetector = class _GameClientDetector {
  constructor() {
    this.gameWindow = null;
    this.isClientFound = false;
    this.checkInterval = null;
    this.manualClientBounds = null;
    this.isBrowserEnvironment = typeof window !== "undefined";
    if (this.isBrowserEnvironment) {
      const savedBounds = localStorage.getItem("gameClientBounds");
      if (savedBounds) {
        this.manualClientBounds = JSON.parse(savedBounds);
      }
      this.startDetection();
    }
  }
  async setClientBounds(bounds) {
    this.manualClientBounds = bounds;
    localStorage.setItem("gameClientBounds", JSON.stringify(bounds));
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
  startDetection() {
    if (!this.isBrowserEnvironment) {
      console.log("Client detection is only available in browser environment");
      return;
    }
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
    if (!this.isBrowserEnvironment)
      return;
    try {
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
        this.stopDetection();
        this.emitClientFound();
      }
    } catch (error) {
      console.error("Error detecting game client:", error);
    }
  }
  isGameClient(canvas) {
    if (!this.isBrowserEnvironment)
      return false;
    const matchesDimensions = canvas.width === _GameClientDetector.DEFAULT_CLIENT_SIZE.width && canvas.height === _GameClientDetector.DEFAULT_CLIENT_SIZE.height;
    const matchesTitle = document.title.includes(_GameClientDetector.CLIENT_TITLE);
    const hasGameElements = this.checkForGameElements();
    return matchesDimensions && matchesTitle && hasGameElements;
  }
  checkForGameElements() {
    if (!this.isBrowserEnvironment)
      return false;
    const hasGameInterface = document.querySelector("#game-interface") !== null;
    const hasMinimapArea = document.querySelector("#minimap-area") !== null;
    const hasChatbox = document.querySelector("#chatbox-area") !== null;
    const isGameDomain = window.location.hostname.includes("2004.lostcity.rs");
    return hasGameInterface || hasMinimapArea || hasChatbox || isGameDomain;
  }
  emitClientFound() {
    if (!this.isBrowserEnvironment)
      return;
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
    if (!this.isBrowserEnvironment) {
      return Promise.reject(new Error("Client detection is only available in browser environment"));
    }
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
        window.open("/client-selector", "_blank", "width=800,height=600");
        reject(new Error("Game client detection timed out. Please use manual selection."));
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
