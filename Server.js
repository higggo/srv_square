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
    PacketID[PacketID["SC_PING"] = 3033] = "SC_PING";
    PacketID[PacketID["SC_SEARCHING_ENEMY"] = 3002] = "SC_SEARCHING_ENEMY";
    PacketID[PacketID["SC_SEARCHING_RESULT"] = 3003] = "SC_SEARCHING_RESULT";
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
            //
            const userIdx = this.lastUserIdx++;
            let client = new Client_1.default(userIdx, ws);
            this.Clients.set(userIdx, client);
            //
            ws.on('message', (data) => {
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
                        client.status == Client_1.CStatus.Idle ? this.EnterMatchQueue(client) : null;
                        client.status = Client_1.CStatus.Searching;
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
                console.log(`WS Closed userIdx : ${userIdx}, Clients Size : ${this.Clients.size}`);
            });
        });
        this.wss.on('listening', () => {
            console.log('server is listening on port 8080');
        });
    }
    EnterMatchQueue(client) {
        let ph1 = { num: PacketID.SC_SEARCHING_RESULT, size: 5 };
        let result1 = { ph: ph1, result: 1 };
        client.socket.send(JSON.stringify(result1));
        console.log(`EnterMatchQueue ${client.userIdx}`);
        this.Match.players.push(client);
        if (this.Match.players.length >= 2) {
            console.log(`this.Match.players.length >= 2`);
            this.Match.players[0].match_idx = this.roomIdx;
            this.Match.players[1].match_idx = this.roomIdx;
            let new_match = new Match_1.default();
            new_match.players.push(this.Match.players[0]);
            new_match.players.push(this.Match.players[1]);
            this.Matches.set(this.roomIdx++, new_match);
            let ph = { num: PacketID.SC_SEARCHING_RESULT, size: 5 };
            let result = { ph: ph, result: 1 };
            new_match.send_all(JSON.stringify(result));
            //this.Match.players = [];
        }
    }
}
module.exports = new Server();
