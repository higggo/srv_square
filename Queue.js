"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Queue {
    constructor() {
        this.data = [];
    }
    push(item) {
        this.data.push(item);
    }
    pop() {
        return this.data.shift();
    }
    length() {
        return this.data.length;
    }
    get() {
        try {
            return this.data[0];
        }
        catch (_a) {
            console.log("Queue get Error !");
            return undefined;
        }
    }
}
exports.default = Queue;
//export = Queue;
