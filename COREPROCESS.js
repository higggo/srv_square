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
const Client_1 = __importDefault(require("./Client"));
const iType = __importStar(require("./iType"));
const Server_1 = require("./Server");
class COREPROCESS {
    CREATE_NEW_CLIENT(ws) {
        const userIdx = Server_1.server.lastUserIdx++;
        let client = new Client_1.default(userIdx, ws);
        Server_1.server.Clients.set(userIdx, client);
        return client;
    }
    RECIEVE_CS_PING(sender, data) {
        sender.pingCount = 0;
    }
    RECIEVE_CS_GAME_MOVE(sender, data) {
        const cs_game_move = JSON.parse(data);
        this.SEND_SC_GAME_MOVE(sender, cs_game_move.position);
    }
    RECIEVE_CS_GAME_POSITION(sender, data) {
        const cs_game_position = JSON.parse(data);
        sender.position.Set(cs_game_position.position);
    }
    SEND_SC_START_PING(sender) {
        let ph = { num: iType.PacketID.SC_PING, size: 5 };
        let ping = { ph: ph };
        sender.socket.send(JSON.stringify(ping));
        sender.pingCount++;
        sender.pingTimer = setInterval(() => {
            if (sender.pingCount > 3) {
                sender.OnDisconnected();
            }
            else {
                sender.socket.send(JSON.stringify({ ph: { num: iType.PacketID.SC_PING, size: 5 } }));
                sender.pingCount++;
            }
        }, 3000);
    }
    SEND_SC_GAME_SPEACTATION(sender) {
        let characters = [];
        for (const client of Server_1.server.Clients.values()) {
            characters.push({
                index: client.userIdx,
                position: client.position.Get()
            });
        }
        let specHead = { num: iType.PacketID.SC_GAME_SPECTATION, size: 5 };
        let spectation = { ph: specHead, index: sender.userIdx, characters: characters };
        sender.socket.send(JSON.stringify(spectation));
    }
    SEND_SC_GAME_HELLO_NEWCLIENT(sender) {
        let characters = [];
        for (const client of Server_1.server.Clients.values()) {
            characters.push({
                index: client.userIdx,
                position: client.position.Get()
            });
        }
        let head = { num: iType.PacketID.SC_GAME_HELLO_NEWCLIENT, size: 5 };
        let packet = { ph: head, character: { index: sender.userIdx, position: sender.position.Get() } };
        for (const client of Server_1.server.Clients.values()) {
            if (sender.userIdx != client.userIdx)
                client.socket.send(JSON.stringify(packet));
        }
    }
    SEND_SC_GAME_MOVE(sender, position) {
        let ph = { num: iType.PacketID.SC_GAME_MOVE, size: 5 };
        let packet = {
            ph: ph,
            character: { index: sender.userIdx, position: position }
        };
        for (const client of Server_1.server.Clients.values()) {
            client.socket.send(JSON.stringify(packet));
        }
    }
    SEND_SC_GAME_OUT(sender) {
        let ph = { num: iType.PacketID.SC_GAME_OUT, size: 5 };
        let packet = {
            ph: ph,
            index: sender.userIdx
        };
        for (const client of Server_1.server.Clients.values()) {
            client.socket.send(JSON.stringify(packet));
        }
    }
}
exports.default = COREPROCESS;
