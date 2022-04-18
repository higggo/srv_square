"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const iType = __importStar(require("./iType"));
class Timer {
    constructor() {
        this.nowCount = 0;
        this.exitCount = 0;
        this.packetID = iType.PacketID.CS_PING;
        this.finalFunc = function () {
            console.log("aaaaaaa");
        };
        this.intervalFunc = function () {
            console.log("bbbbbb");
        };
    }
    Clear() {
        this.nowCount = 0;
        this.exitCount = 0;
        if (this.timer != undefined)
            clearInterval(this.timer);
    }
    SetTimer(sec, exitCount, packetID) {
        this.nowCount = 0;
        this.exitCount = exitCount;
        this.packetID = packetID;
        this.timer = setInterval(() => { this.IntervalCallback(); }, sec);
    }
    SetCallback(finalFunc, intervalFunc) {
        this.finalFunc = finalFunc;
        this.intervalFunc = intervalFunc;
    }
    IntervalCallback() {
        console.log("1");
        this.intervalFunc.call(this);
        console.log("2");
        this.intervalFunc;
        console.log("3");
        this.intervalFunc();
        console.log("4");
        console.log("timer count " + this.nowCount);
        this.nowCount++;
        if (this.nowCount == this.exitCount) {
            if (this.timer != undefined)
                clearInterval(this.timer);
            this.finalFunc.call(this);
        }
    }
}
exports.default = Timer;
