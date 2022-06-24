"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Position {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    Get() {
        let pos = { x: this.x, y: this.y, z: this.z };
        return pos;
    }
    Set(pos) {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }
}
exports.default = Position;
