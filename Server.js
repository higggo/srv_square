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
const iType = __importStar(require("./iType"));
//
const webSocket = require('ws');
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
            //
            const userIdx = this.lastUserIdx++;
            let client = new Client_1.default(userIdx, ws);
            this.Clients.set(userIdx, client);
            //
            ws.on('message', (data) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data);
                if (dataform.ph.num != 1033)
                    console.log('ph : ' + JSON.stringify(dataform.ph));
                let ph = { num: iType.PacketID.SC_PING, size: 5 };
                let ping = { ph: ph };
                switch (dataform.ph.num) {
                    case iType.PacketID.CS_PING:
                        ws.send(JSON.stringify(ping));
                        break;
                    case iType.PacketID.CS_SEARCHING_ENEMY:
                        //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
                        const dataform = JSON.parse(data);
                        console.log(dataform);
                        console.log(`Match.players.length ${this.Match.players.length}`);
                        if (client.status == Client_1.CStatus.Idle) {
                            this.EnterMatchQueue(client);
                        }
                        client.status = Client_1.CStatus.Searching;
                        break;
                    case iType.PacketID.CS_SEARCHING_CANCEL:
                        for (var i = 0; i < this.Match.players.length; i++) {
                            if (this.Match.players[i].userIdx == client.userIdx) {
                                this.Match.players.splice(i);
                                client.status = Client_1.CStatus.Idle;
                                client.socket.send(JSON.stringify({ ph: { num: iType.PacketID.SC_SEARCHING_CANCEL, size: 5 } }));
                                break;
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_READY:
                        const cs_game_ready = JSON.parse(data);
                        client.ready = cs_game_ready.ready;
                        let ph2 = { num: iType.PacketID.SC_GAME_READY, size: 5 };
                        let result2;
                        if (client.match != null) {
                            result2 = { ph: ph2, ready: cs_game_ready.ready };
                            client.socket.send(JSON.stringify(result2));
                        }
                        if ((_a = client.match) === null || _a === void 0 ? void 0 : _a.all_ready()) {
                            (_b = client.match) === null || _b === void 0 ? void 0 : _b.init();
                            let ph1 = { num: iType.PacketID.SC_GAME_START, size: 5 };
                            let result1;
                            client.match.players.forEach(player => {
                                result1 = { ph: ph1, userIdx: player.userIdx };
                                player.socket.send(JSON.stringify(result1));
                            });
                        }
                        break;
                    case iType.PacketID.CS_GAME_START:
                        if (client.match != null) {
                            client.match.turn = client.userIdx;
                            let ph2 = { num: iType.PacketID.SC_GAME_TURN, size: 5 };
                            let result2 = { ph: ph2, userIdx: client.match.turn };
                            (_c = client.match) === null || _c === void 0 ? void 0 : _c.send_all(JSON.stringify(result2));
                        }
                        break;
                    case iType.PacketID.CS_GAME_SELECT:
                        if (((_d = client.match) === null || _d === void 0 ? void 0 : _d.turn) == client.userIdx) {
                            const cs_game_select = JSON.parse(data);
                            if (client.match.game.ActiveBar(cs_game_select.bar)) {
                                let squares = (_e = client.match) === null || _e === void 0 ? void 0 : _e.game.CheckSquare(cs_game_select.bar);
                                client.point += squares.length;
                                let ph = { num: iType.PacketID.SC_GAME_COMPUTE, size: 5 };
                                let result = { ph: ph, bar: cs_game_select.bar, userIdx: client.userIdx, matrixes: squares };
                                (_f = client.match) === null || _f === void 0 ? void 0 : _f.send_all(JSON.stringify(result));
                                (_g = client.match) === null || _g === void 0 ? void 0 : _g.SaveAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE, false);
                                console.log(`squares.length : ${squares.length}`);
                                if (squares.length <= 0) {
                                    let otherIdx = (_h = client.match.other(client)) === null || _h === void 0 ? void 0 : _h.userIdx;
                                    if (otherIdx != undefined) {
                                        client.match.nextTurn = otherIdx;
                                    }
                                }
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_COMPUTE:
                        client.packet_res.set(iType.PacketID.SC_GAME_COMPUTE, true);
                        if ((_j = client.match) === null || _j === void 0 ? void 0 : _j.CheckAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE)) {
                            if (((_k = client.match) === null || _k === void 0 ? void 0 : _k.game.point_matrixes.length) == 9) {
                                let winner = (_l = client.match) === null || _l === void 0 ? void 0 : _l.winner();
                                let looser = (_m = client.match) === null || _m === void 0 ? void 0 : _m.other(winner);
                                let ph = { num: iType.PacketID.SC_GAME_RESULT, size: 5 };
                                let result = { ph: ph, winner: (_o = client.match) === null || _o === void 0 ? void 0 : _o.winner().userIdx, winner_point: (_p = client.match) === null || _p === void 0 ? void 0 : _p.winner().point, looser_point: looser === null || looser === void 0 ? void 0 : looser.point };
                                console.log("SC_Game_Result sadasdasss");
                                (_q = client.match) === null || _q === void 0 ? void 0 : _q.SaveAllPlayerRes(iType.PacketID.SC_GAME_RESULT, false);
                                (_r = client.match) === null || _r === void 0 ? void 0 : _r.send_all(JSON.stringify(result));
                            }
                            else {
                                client.match.turn = client.match.nextTurn;
                                let ph2 = { num: iType.PacketID.SC_GAME_TURN, size: 5 };
                                let result2 = { ph: ph2, userIdx: client.match.nextTurn };
                                (_s = client.match) === null || _s === void 0 ? void 0 : _s.send_all(JSON.stringify(result2));
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_RESULT:
                        client.packet_res.set(iType.PacketID.SC_GAME_RESULT, true);
                        if ((_t = client.match) === null || _t === void 0 ? void 0 : _t.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT)) {
                            client.ready = false;
                            let other = client.match.other(client);
                            if (other != null)
                                other.ready = false;
                            client.match.init();
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
            let ph = { num: iType.PacketID.SC_SEARCHING_RESULT, size: 5 };
            let result = { ph: ph, result: 1 };
            new_match.send_all(JSON.stringify(result));
            this.Match.players = [];
        }
        else {
            let ph = { num: iType.PacketID.SC_SEARCHING_ENEMY, size: 5 };
            let result = { ph: ph };
            client.socket.send(JSON.stringify(result));
        }
    }
}
module.exports = new Server();
