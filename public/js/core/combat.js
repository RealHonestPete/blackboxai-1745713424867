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
export {
  CombatSystem
};
//# sourceMappingURL=combat.js.map
