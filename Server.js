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
            client.OnConnected();
            this.Clients.set(userIdx, client);
            // send ping
            let ph = { num: iType.PacketID.SC_PING, size: 5 };
            let ping = { ph: ph };
            ws.send(JSON.stringify(ping));
            client.pingCount++;
            client.pingTimer = setInterval(() => {
                if (client.pingCount > 3) {
                    client.OnDisconnected();
                }
                else {
                    ws.send(JSON.stringify({ ph: { num: iType.PacketID.SC_PING, size: 5 } }));
                    client.pingCount++;
                }
            }, 3000);
            //
            ws.on('message', (data) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data);
                if (dataform.ph.num != 1033)
                    console.log('ph : ' + JSON.stringify(dataform.ph));
                switch (dataform.ph.num) {
                    case iType.PacketID.CS_PING:
                        client.pingCount = 0;
                        break;
                    case iType.PacketID.CS_SEARCHING_ENEMY:
                        //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
                        const dataform = JSON.parse(data);
                        console.log(dataform);
                        console.log(`Match.players.length ${this.Match.players.size}`);
                        if (client.status == Client_1.CStatus.Idle) {
                            this.EnterMatchQueue(client);
                        }
                        client.status = Client_1.CStatus.Searching;
                        break;
                    case iType.PacketID.CS_SEARCHING_CANCEL:
                        for (const [idx, player] of this.Match.players) {
                            if (player.userIdx == client.userIdx) {
                                this.Match.players.delete(idx);
                                client.status = Client_1.CStatus.Idle;
                                client.socket.send(JSON.stringify({ ph: { num: iType.PacketID.SC_SEARCHING_CANCEL, size: 5 } }));
                                break;
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_ENTRY:
                        client.packet_res.set(iType.PacketID.CS_GAME_ENTRY, true);
                        let ph = { num: iType.PacketID.SC_GAME_ENTRY, size: 5 };
                        let result = { ph: ph };
                        (_a = client.match) === null || _a === void 0 ? void 0 : _a.send(client, JSON.stringify(result));
                        if ((_b = client.match) === null || _b === void 0 ? void 0 : _b.CheckAllPlayerRes(iType.PacketID.CS_GAME_ENTRY)) {
                            client.match.timer.Clear();
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
                        if ((_c = client.match) === null || _c === void 0 ? void 0 : _c.all_ready()) {
                            (_d = client.match) === null || _d === void 0 ? void 0 : _d.init();
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
                            (_e = client.match) === null || _e === void 0 ? void 0 : _e.send_all(JSON.stringify(result2));
                        }
                        break;
                    case iType.PacketID.CS_GAME_SELECT:
                        if (((_f = client.match) === null || _f === void 0 ? void 0 : _f.turn) == client.userIdx) {
                            const cs_game_select = JSON.parse(data);
                            if (client.match.game.ActiveBar(cs_game_select.bar)) {
                                let squares = (_g = client.match) === null || _g === void 0 ? void 0 : _g.game.CheckSquare(cs_game_select.bar);
                                client.point += squares.length;
                                let ph = { num: iType.PacketID.SC_GAME_COMPUTE, size: 5 };
                                let result = { ph: ph, bar: cs_game_select.bar, userIdx: client.userIdx, matrixes: squares };
                                (_h = client.match) === null || _h === void 0 ? void 0 : _h.send_all(JSON.stringify(result));
                                (_j = client.match) === null || _j === void 0 ? void 0 : _j.SaveAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE, false);
                                console.log(`squares.length : ${squares.length}`);
                                if (squares.length <= 0) {
                                    let otherIdx = (_k = client.match.other(client)) === null || _k === void 0 ? void 0 : _k.userIdx;
                                    console.log("squares.length <= 0");
                                    if (otherIdx != undefined) {
                                        console.log(`client ${client.userIdx}, other ${otherIdx}`);
                                        client.match.turn = otherIdx;
                                    }
                                }
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_COMPUTE:
                        client.packet_res.set(iType.PacketID.SC_GAME_COMPUTE, true);
                        if ((_l = client.match) === null || _l === void 0 ? void 0 : _l.CheckAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE)) {
                            if (((_m = client.match) === null || _m === void 0 ? void 0 : _m.game.point_matrixes.length) == 9) {
                                let winner = (_o = client.match) === null || _o === void 0 ? void 0 : _o.winner();
                                let looser = (_p = client.match) === null || _p === void 0 ? void 0 : _p.other(winner);
                                let ph = { num: iType.PacketID.SC_GAME_RESULT, size: 5 };
                                let result = { ph: ph, winner: (_q = client.match) === null || _q === void 0 ? void 0 : _q.winner().userIdx, winner_point: (_r = client.match) === null || _r === void 0 ? void 0 : _r.winner().point, looser_point: looser === null || looser === void 0 ? void 0 : looser.point };
                                (_s = client.match) === null || _s === void 0 ? void 0 : _s.SaveAllPlayerRes(iType.PacketID.SC_GAME_RESULT, false);
                                (_t = client.match) === null || _t === void 0 ? void 0 : _t.send_all(JSON.stringify(result));
                            }
                            else {
                                let ph2 = { num: iType.PacketID.SC_GAME_TURN, size: 5 };
                                let result2 = { ph: ph2, userIdx: client.match.turn };
                                (_u = client.match) === null || _u === void 0 ? void 0 : _u.send_all(JSON.stringify(result2));
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_RESULT:
                        client.packet_res.set(iType.PacketID.SC_GAME_RESULT, true);
                        console.log(`chk : ${(_v = client.match) === null || _v === void 0 ? void 0 : _v.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT)}, client ${client.userIdx}: ${client.packet_res.get(iType.PacketID.SC_GAME_RESULT)}`);
                        if ((_w = client.match) === null || _w === void 0 ? void 0 : _w.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT)) {
                            client.ready = false;
                            let other = client.match.other(client);
                            if (other != null)
                                other.ready = false;
                            client.match.init();
                        }
                        break;
                    case iType.PacketID.CS_GAME_TIMER:
                        break;
                    default:
                        break;
                }
            });
            //
            ws.on('close', () => {
                if (this.Clients.has(userIdx)) {
                    client.OnDisconnected();
                    switch (client.status) {
                        case Client_1.CStatus.Idle:
                            this.Clients.delete(client.userIdx);
                            break;
                        case Client_1.CStatus.Searching:
                            this.Match.players.delete(client.userIdx);
                            break;
                        case Client_1.CStatus.Playing:
                            break;
                        default:
                            break;
                    }
                }
                console.log(`WS Closed userIdx : ${userIdx}, Clients Size : ${this.Clients.size}, Match.players.length ${this.Match.players.size}`);
            });
        });
        this.wss.on('listening', () => {
            console.log('server is listening on port 8080');
        });
    }
    EnterMatchQueue(client) {
        var _a;
        this.Match.players.set(client.userIdx, client);
        if (this.Match.players.size >= 2) {
            console.log(`this.Match.players.length >= 2`);
            let new_match = new Match_1.default();
            for (const player of this.Match.players.values()) {
                new_match.players.set(player.userIdx, player);
                player.match = new_match;
            }
            this.Matches.set(this.roomIdx++, new_match);
            let ph = { num: iType.PacketID.SC_SEARCHING_RESULT, size: 5 };
            let result = { ph: ph, result: 1 };
            new_match.send_all(JSON.stringify(result));
            new_match.SaveAllPlayerRes(iType.PacketID.CS_GAME_ENTRY, false);
            this.Match.players.clear();
            if (client.match != null) {
                client.match.SetTimer(1000, 5, iType.PacketID.CS_GAME_ENTRY);
                (_a = client.match) === null || _a === void 0 ? void 0 : _a.init();
                // state
                client.status = Client_1.CStatus.Playing;
                client.match.other(client).status = Client_1.CStatus.Playing;
            }
        }
        else {
            let ph = { num: iType.PacketID.SC_SEARCHING_ENEMY, size: 5 };
            let result = { ph: ph };
            client.socket.send(JSON.stringify(result));
        }
        //
    }
}
module.exports = new Server();
