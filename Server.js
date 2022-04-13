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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const Client_1 = __importStar(require("./Client"));
const Match_1 = __importDefault(require("./Match"));
//
const webSocket = require('ws');
//
var PacketID;
(function (PacketID) {
    PacketID[PacketID["CS_PING"] = 1033] = "CS_PING";
    PacketID[PacketID["CS_SEARCHING_ENEMY"] = 1002] = "CS_SEARCHING_ENEMY";
    PacketID[PacketID["CS_SEARCHING_RESULT"] = 1003] = "CS_SEARCHING_RESULT";
    PacketID[PacketID["CS_SEARCHING_CANCEL"] = 1004] = "CS_SEARCHING_CANCEL";
    PacketID[PacketID["CS_GAME_READY"] = 1005] = "CS_GAME_READY";
    PacketID[PacketID["CS_GAME_START"] = 1006] = "CS_GAME_START";
    PacketID[PacketID["CS_GAME_COMPUTE"] = 1007] = "CS_GAME_COMPUTE";
    PacketID[PacketID["CS_GAME_TURN"] = 1008] = "CS_GAME_TURN";
    PacketID[PacketID["CS_GAME_SELECT"] = 1009] = "CS_GAME_SELECT";
    PacketID[PacketID["CS_GAME_RESULT"] = 1010] = "CS_GAME_RESULT";
    PacketID[PacketID["CS_GAME_OUT"] = 1011] = "CS_GAME_OUT";
    PacketID[PacketID["SC_PING"] = 3033] = "SC_PING";
    PacketID[PacketID["SC_SEARCHING_ENEMY"] = 3002] = "SC_SEARCHING_ENEMY";
    PacketID[PacketID["SC_SEARCHING_RESULT"] = 3003] = "SC_SEARCHING_RESULT";
    PacketID[PacketID["SC_SEARCHING_CANCEL"] = 3004] = "SC_SEARCHING_CANCEL";
    PacketID[PacketID["SC_GAME_READY"] = 3005] = "SC_GAME_READY";
    PacketID[PacketID["SC_GAME_START"] = 3006] = "SC_GAME_START";
    PacketID[PacketID["SC_GAME_COMPUTE"] = 3007] = "SC_GAME_COMPUTE";
    PacketID[PacketID["SC_GAME_TURN"] = 3008] = "SC_GAME_TURN";
    PacketID[PacketID["SC_GAME_SELECT"] = 3009] = "SC_GAME_SELECT";
    PacketID[PacketID["SC_GAME_RESULT"] = 3010] = "SC_GAME_RESULT";
    PacketID[PacketID["SC_GAME_OUT"] = 3011] = "SC_GAME_OUT";
})(PacketID || (PacketID = {}));
/////
class Server {
    constructor() {
        //
        this.Matches = new Map();
        this.Match = new Match_1.default();
        //
        this.lastUserIdx = 0;
        this.Clients = new Map();
        this.roomIdx = 0;
        this.port = 8080;
        this.wss = new webSocket.Server({ port: this.port }, () => {
            console.log('server started');
        });
    }
    STANDBY() {
    }
    RUNNING() {
        this.wss.on('connection', (ws) => {
            console.log("aaaaaa");
            //
            const userIdx = this.lastUserIdx++;
            let client = new Client_1.default(userIdx, ws);
            this.Clients.set(userIdx, client);
            //
            ws.on('message', (data) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data);
                console.log('useridx : ' + userIdx);
                console.log('ph : ' + JSON.stringify(dataform.ph));
                let ph = { num: PacketID.SC_PING, size: 5 };
                let ping = { ph: ph };
                switch (dataform.ph.num) {
                    case PacketID.CS_PING:
                        ws.send(JSON.stringify(ping));
                        break;
                    case PacketID.CS_SEARCHING_ENEMY:
                        //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
                        const dataform = JSON.parse(data);
                        console.log(dataform);
                        console.log(`Match.players.length ${this.Match.players.length}`);
                        if (client.status == Client_1.CStatus.Idle) {
                            this.EnterMatchQueue(client);
                        }
                        client.status = Client_1.CStatus.Searching;
                        break;
                    case PacketID.CS_SEARCHING_CANCEL:
                        for (var i = 0; i < this.Match.players.length; i++) {
                            if (this.Match.players[i].userIdx == client.userIdx) {
                                this.Match.players.splice(i);
                                client.status = Client_1.CStatus.Idle;
                                client.socket.send(JSON.stringify({ ph: { num: PacketID.SC_SEARCHING_CANCEL, size: 5 } }));
                                break;
                            }
                        }
                        break;
                    case PacketID.CS_GAME_READY:
                        const cs_game_ready = JSON.parse(data);
                        client.ready = cs_game_ready.ready;
                        if ((_a = client.match) === null || _a === void 0 ? void 0 : _a.all_ready()) {
                            (_b = client.match) === null || _b === void 0 ? void 0 : _b.init();
                            let ph1 = { num: PacketID.SC_GAME_START, size: 5 };
                            let result1;
                            client.match.players.forEach(player => {
                                result1 = { ph: ph, userIdx: player.userIdx };
                                player.socket.send(JSON.stringify(result1));
                            });
                            client.match.turn = client.userIdx;
                            let ph2 = { num: PacketID.SC_GAME_TURN, size: 5 };
                            let result2 = { ph: ph, userIdx: client.match.turn };
                            (_c = client.match) === null || _c === void 0 ? void 0 : _c.send_all(JSON.stringify(result2));
                        }
                        break;
                    case PacketID.CS_GAME_SELECT:
                        if (((_d = client.match) === null || _d === void 0 ? void 0 : _d.turn) == client.userIdx) {
                            const cs_game_select = JSON.parse(data);
                            let squares = (_e = client.match) === null || _e === void 0 ? void 0 : _e.game.CheckSquare(cs_game_select.bar);
                            client.point += squares.length;
                            let ph = { num: PacketID.SC_GAME_COMPUTE, size: 5 };
                            let result = { ph: ph, bar: cs_game_select.bar, userIdx: client.userIdx, matrixes: squares };
                            (_f = client.match) === null || _f === void 0 ? void 0 : _f.send_all(JSON.stringify(result));
                        }
                        break;
                    case PacketID.CS_GAME_COMPUTE:
                        if (((_g = client.match) === null || _g === void 0 ? void 0 : _g.game.point_matrixes.length) == 9) {
                            let ph = { num: PacketID.SC_GAME_RESULT, size: 5 };
                            let result = { ph: ph, winner: (_h = client.match) === null || _h === void 0 ? void 0 : _h.winner() };
                            (_j = client.match) === null || _j === void 0 ? void 0 : _j.send_all(JSON.stringify(result));
                        }
                        break;
                    default:
                        break;
                }
            });
            //
            ws.on('close', () => {
                if (this.Clients.has(userIdx)) {
                    this.Clients.delete(userIdx);
                    console.log(`deleted idx : ${userIdx}`);
                }
                console.log(`WS Closed userIdx : ${userIdx}, Clients Size : ${this.Clients.size}, Match.players.length ${this.Match.players.length}`);
            });
        });
        this.wss.on('listening', () => {
            console.log('server is listening on port 8080');
        });
    }
    EnterMatchQueue(client) {
        this.Match.players.push(client);
        if (this.Match.players.length >= 2) {
            console.log(`this.Match.players.length >= 2`);
            let new_match = new Match_1.default();
            new_match.players.push(this.Match.players[0]);
            new_match.players.push(this.Match.players[1]);
            this.Match.players[0].match = new_match;
            this.Match.players[1].match = new_match;
            this.Matches.set(this.roomIdx++, new_match);
            let ph = { num: PacketID.SC_SEARCHING_RESULT, size: 5 };
            let result = { ph: ph, result: 1 };
            new_match.send_all(JSON.stringify(result));
            this.Match.players = [];
        }
        else {
            let ph = { num: PacketID.SC_SEARCHING_ENEMY, size: 5 };
            let result = { ph: ph };
            client.socket.send(JSON.stringify(result));
        }
    }
}
module.exports = new Server();
