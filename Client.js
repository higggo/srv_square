"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CStatus = void 0;
var CStatus;
(function (CStatus) {
    CStatus[CStatus["Idle"] = 0] = "Idle";
    CStatus[CStatus["Searching"] = 1] = "Searching";
    CStatus[CStatus["Playing"] = 2] = "Playing";
})(CStatus = exports.CStatus || (exports.CStatus = {}));
class Client {
    constructor(userIdx, socket) {
        this.userIdx = userIdx;
        this.socket = socket;
        this.status = CStatus.Idle;
        this.match = null;
        this.ready = false;
        this.point = 0;
    }
    game_init() {
        this.ready = false;
        this.point = 0;
    }
}
exports.default = Client;
