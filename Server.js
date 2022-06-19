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
exports.server = exports.Server = void 0;
const Client_1 = __importStar(require("./Client"));
const Match_1 = __importDefault(require("./Match"));
const iType = __importStar(require("./iType"));
const COREPROCESS_1 = __importDefault(require("./COREPROCESS"));
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
        this.process = new COREPROCESS_1.default();
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
            let match;
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
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data);
                if (dataform.ph.num != 1033)
                    console.log('ph : ' + JSON.stringify(dataform.ph));
                switch (dataform.ph.num) {
                    case iType.PacketID.CS_PING:
                        this.process.RECIEVE_CS_PING(client, data);
                        break;
                    case iType.PacketID.CS_LOBBY_SEARCHING_ENEMY:
                        this.process.RECIEVE_CS_LOBBY_SEARCHING_ENEMY(client, data);
                        break;
                    case iType.PacketID.CS_LOBBY_SEARCHING_CANCEL:
                        this.process.RECIEVE_CS_LOBBY_SEARCHING_CANCEL(client, data);
                        break;
                    case iType.PacketID.CS_GAME_ENTRY:
                        this.process.RECIEVE_CS_GAME_ENTRY(client, data);
                        break;
                    case iType.PacketID.CS_GAME_READY:
                        this.process.RECIEVE_CS_GAME_READY(client, data);
                        break;
                    case iType.PacketID.CS_GAME_NEW_MATCH:
                        this.process.RECIEVE_CS_GAME_NEW_MATCH(client, data);
                        break;
                    case iType.PacketID.CS_GAME_START:
                        this.process.RECIEVE_CS_GAME_START(client, data);
                        break;
                    case iType.PacketID.CS_GAME_SELECT:
                        this.process.RECIEVE_CS_GAME_SELECT(client, data);
                        break;
                    case iType.PacketID.CS_GAME_COMPUTE:
                        this.process.RECIEVE_CS_GAME_COMPUTE(client, data);
                        break;
                    case iType.PacketID.CS_GAME_RESULT:
                        this.process.RECIEVE_CS_GAME_RESULT(client, data);
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
}
exports.Server = Server;
exports.server = new Server();
