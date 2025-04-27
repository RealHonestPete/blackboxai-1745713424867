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
export {
  PathfindingSystem
};
//# sourceMappingURL=pathfinding.js.map
