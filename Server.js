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
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.Server = void 0;
const iType = __importStar(require("./iType"));
const COREPROCESS_1 = __importDefault(require("./COREPROCESS"));
//
const webSocket = require('ws');
/////
class Server {
    constructor() {
        //
        this.lastUserIdx = 0;
        this.Clients = new Map();
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
            let client = this.process.CREATE_NEW_CLIENT(ws);
            client.OnConnected();
            this.process.SEND_SC_START_PING(client);
            this.process.SEND_SC_GAME_SPEACTATION(client);
            this.process.SEND_SC_GAME_HELLO_NEWCLIENT(client);
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
                    case iType.PacketID.CS_GAME_MOVE:
                        this.process.RECIEVE_CS_GAME_MOVE(client, data);
                        break;
                    case iType.PacketID.CS_GAME_POSITION:
                        this.process.RECIEVE_CS_GAME_POSITION(client, data);
                        break;
                    default:
                        break;
                }
            });
            //
            ws.on('close', () => {
                if (this.Clients.has(client.userIdx)) {
                    client.OnDisconnected();
                    this.Clients.delete(client.userIdx);
                    this.process.SEND_SC_GAME_OUT(client);
                }
                console.log(`WS Closed userIdx : ${client.userIdx}, Clients Size : ${this.Clients.size}`);
            });
        });
        this.wss.on('listening', () => {
            console.log('server is listening on port 8080');
        });
    }
}
exports.Server = Server;
exports.server = new Server();
