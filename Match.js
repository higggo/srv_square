"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = __importDefault(require("./Game"));
class Match {
    //public response = new Map<number,
    constructor() {
        this.players = new Array();
        this.game = new Game_1.default();
        this.turn = 0;
        this.nextTurn = 0;
    }
    init() {
        this.game.Init();
        this.players.forEach(player => {
            player.game_init();
        });
    }
    start() {
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
    all_ready() {
        let start = true;
        this.players.forEach(player => {
            if (!player.ready) {
                start = false;
            }
        });
        return start;
    }
    winner() {
        let idx = 0;
        let point = 0;
        let client;
        for (var i = 0; i < this.players.length; i++) {
            if (point == 0) {
                point = this.players[i].point;
                client = this.players[i];
                continue;
            }
            if (this.players[i].point > point) {
                point = this.players[i].point;
                client = this.players[i];
            }
        }
        return client;
    }
    other(client) {
        let player = null;
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].userIdx != client.userIdx)
                player = this.players[i];
        }
        return player;
    }
    SaveAllPlayerRes(packetID, res) {
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].packet_res.set(packetID, res);
        }
    }
    CheckAllPlayerRes(packetID) {
        let confirm = true;
        for (var i = 0; i < this.players.length; i++) {
            confirm = this.players[i].packet_res.get(packetID);
        }
        return confirm;
    }
}
exports.default = Match;
