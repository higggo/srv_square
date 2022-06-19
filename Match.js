"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = __importDefault(require("./Game"));
const iType = __importStar(require("./iType"));
const Timer_1 = __importDefault(require("./Timer"));
class Match {
    //public response = new Map<number,
    constructor() {
        // timer
        this.timer = new Timer_1.default();
        this.players = new Map();
        this.game = new Game_1.default();
        this.turn = 0;
        this.match_record = new Array();
    }
    RoomInit() {
        this.players.forEach(player => {
            player.ready = false;
            player.point = 0;
            player.packet_res.clear();
        });
        this.timer.SetCallback(() => { this.TimerEnd(); }, () => { this.SendTimer(); });
    }
    MatchInit() {
        this.players.forEach(player => {
            player.ready = false;
        });
    }
    RoundInit() {
        this.game.Init();
        this.players.forEach(player => {
            player.point = 0;
        });
    }
    start() {
    }
    send_all(packet) {
        for (const player of this.players.values()) {
            player.socket.send(packet);
        }
    }
    send(client, packet) {
        for (const player of this.players.values()) {
            if (client == player) {
                player.socket.send(packet);
                return;
            }
        }
        console.log("Not Exist That Client !");
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
        for (const player of this.players.values()) {
            if (point == 0) {
                point = player.point;
                client = player;
                continue;
            }
            if (player.point > point) {
                point = player.point;
                client = player;
            }
        }
        return client;
    }
    other(client) {
        let other;
        for (const player of this.players.values()) {
            if (player.userIdx != client.userIdx)
                other = player;
        }
        return other;
    }
    SaveAllPlayerRes(packetID, res) {
        for (const player of this.players.values()) {
            player.packet_res.set(packetID, res);
        }
    }
    CheckAllPlayerRes(packetID) {
        let confirm = true;
        for (const player of this.players.values()) {
            if (player.packet_res.get(packetID) == false) {
                confirm = player.packet_res.get(packetID);
                break;
            }
        }
        return confirm;
    }
    SetTimer(sec, exitCount, packetID) {
        this.timer.SetTimer(sec, exitCount, packetID);
    }
    TimerEnd() {
        console.log("TimerEnd");
        if (this.CheckAllPlayerRes(this.timer.packetID)) {
            this.timer.Clear();
            return;
        }
        switch (this.timer.packetID) {
            case iType.PacketID.CS_GAME_ENTRY:
                let ph = { num: iType.PacketID.SC_GAME_ENTRY, size: 5 };
                let result = { ph: ph };
                this.send_all(JSON.stringify(result));
                break;
            default:
                break;
        }
    }
    SendTimer() {
        console.log("SendTimer");
        switch (this.timer.packetID) {
            case iType.PacketID.CS_GAME_ENTRY:
                let ph = { num: iType.PacketID.SC_GAME_TIMER, size: 5 };
                let result = { ph: ph, sec: this.timer.exitCount - this.timer.nowCount };
                this.send_all(JSON.stringify(result));
                break;
            default:
                break;
        }
    }
    RecordUpdate(winner, looser) {
        const lastIdx = this.match_record.length - 1;
        if (this.match_record[lastIdx].Round == 1) {
            this.match_record[lastIdx].R1 = { winner: winner, looser: looser };
            this.match_record[lastIdx].Round++;
        }
        else if (this.match_record[lastIdx].Round == 2) {
            this.match_record[lastIdx].R2 = { winner: winner, looser: looser };
            if (this.match_record[lastIdx].R1.winner == winner) {
                this.match_record[lastIdx].End = true;
                this.match_record[lastIdx].Winner = winner;
            }
            else {
                this.match_record[lastIdx].Round++;
            }
        }
        else if (this.match_record[lastIdx].Round == 3) {
            this.match_record[lastIdx].R3 = { winner: winner, looser: looser };
            this.match_record[lastIdx].End = true;
            this.match_record[lastIdx].Winner = winner;
        }
    }
    CurrentMatchRecord() {
        const lastIdx = this.match_record.length - 1;
        let record = this.match_record[lastIdx];
        let cnt = lastIdx + 1;
        return { match: record, match_count: cnt };
    }
}
exports.default = Match;
