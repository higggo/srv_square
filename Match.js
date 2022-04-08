"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Match {
    constructor() {
        this.players = new Array();
    }
    send_all(packet) {
        this.players[0].socket.send(packet);
        this.players[1].socket.send(packet);
    }
    send(client, packet) {
        if (client == this.players[0])
            this.players[0].socket.send(packet);
        if (client == this.players[1])
            this.players[1].socket.send(packet);
    }
}
exports.default = Match;
