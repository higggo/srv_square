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
const Client_1 = require("./Client");
const Match_1 = __importDefault(require("./Match"));
const iType = __importStar(require("./iType"));
const Server_1 = require("./Server");
class COREPROCESS {
    RECIEVE_CS_PING(client, data) {
        client.pingCount = 0;
    }
    RECIEVE_CS_LOBBY_SEARCHING_ENEMY(client, data) {
        var _a;
        if (Server_1.server.Match != null) {
            //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
            const dataform = JSON.parse(data);
            console.log(dataform);
            console.log(`Match.players.length ${Server_1.server.Match.players.size}`);
            if (client.status == Client_1.CStatus.Idle) {
                Server_1.server.Match.players.set(client.userIdx, client);
                if (Server_1.server.Match.players.size >= 2) {
                    console.log(`this.Match.players.length >= 2`);
                    let matchIdx = Server_1.server.roomIdx++;
                    let new_match = new Match_1.default(matchIdx);
                    for (const player of Server_1.server.Match.players.values()) {
                        new_match.players.set(player.userIdx, player);
                        player.match = new_match;
                    }
                    Server_1.server.Matches.set(matchIdx, new_match);
                    let ph = { num: iType.PacketID.SC_LOBBY_SEARCHING_RESULT, size: 5 };
                    let result = { ph: ph, result: 1 };
                    new_match.send_all(JSON.stringify(result));
                    new_match.SaveAllPlayerRes(iType.PacketID.CS_GAME_ENTRY, false);
                    Server_1.server.Match.players.clear();
                    if (client.match != null) {
                        client.match.SetTimer(1000, 5, iType.PacketID.CS_GAME_ENTRY);
                        (_a = client.match) === null || _a === void 0 ? void 0 : _a.RoomInit();
                        // state
                        client.status = Client_1.CStatus.Playing;
                        client.match.other(client).status = Client_1.CStatus.Playing;
                    }
                }
                else {
                    let ph = { num: iType.PacketID.SC_LOBBY_SEARCHING_ENEMY, size: 5 };
                    let result = { ph: ph };
                    client.socket.send(JSON.stringify(result));
                }
            }
            client.status = Client_1.CStatus.Searching;
        }
    }
    RECIEVE_CS_LOBBY_SEARCHING_RESULT(client, data) {
    }
    RECIEVE_CS_LOBBY_SEARCHING_CANCEL(client, data) {
        if (Server_1.server.Match != null) {
            for (const [idx, player] of Server_1.server.Match.players) {
                if (player.userIdx == client.userIdx) {
                    Server_1.server.Match.players.delete(idx);
                    client.status = Client_1.CStatus.Idle;
                    client.socket.send(JSON.stringify({ ph: { num: iType.PacketID.SC_LOBBY_SEARCHING_CANCEL, size: 5 } }));
                    break;
                }
            }
        }
    }
    RECIEVE_CS_GAME_READY(client, data) {
        let match = client.match;
        if (match != null) {
            const cs_game_ready = JSON.parse(data);
            // 준비단계 삭제
            /*
            client.ready = cs_game_ready.ready;
            if(match.all_ready())
            {
                this.SEND_SC_GAME_START(client, match);
            }
            else
            {
                this.SEND_SC_GAME_READY(client, match, data);
            }
            */
        }
        else {
            console.error("match가 존재하지 않음.");
        }
    }
    RECIEVE_CS_GAME_NEW_MATCH(client, data) {
        let match = client.match;
        if (match != null)
            this.SEND_SC_GAME_START(client, match);
    }
    RECIEVE_CS_GAME_START(client, data) {
        let match = client.match;
        if (match != null) {
            match.RoundInit();
            match.turn = client.userIdx;
            this.SEND_SC_GAME_TURN(client, match);
        }
        else {
            console.error("match가 존재하지 않음.");
        }
    }
    RECIEVE_CS_GAME_COMPUTE(client, data) {
        let match = client.match;
        if (match != null) {
            client.packet_res.set(iType.PacketID.SC_GAME_COMPUTE, true);
            if (match.CheckAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE)) {
                if (match.game.point_matrixes.length == 9) {
                    this.SEND_SC_GAME_RESULT(client, match);
                }
                else {
                    this.SEND_SC_GAME_TURN(client, match);
                }
            }
        }
    }
    RECIEVE_CS_GAME_TURN(client, data) {
    }
    RECIEVE_CS_GAME_SELECT(client, data) {
        let match = client.match;
        if (match != null) {
            this.SEND_SC_GAME_COMPUTE(client, match, data);
        }
        else {
            console.error("match가 존재하지 않음.");
        }
    }
    RECIEVE_CS_GAME_RESULT(client, data) {
        client.packet_res.set(iType.PacketID.SC_GAME_RESULT, true);
        let match = client.match;
        if (match === null || match === void 0 ? void 0 : match.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT)) {
            this.SEND_SC_GAME_END(client, match);
            /*
            // 3판 2선 삭제
            // New Match
            if(match.CurrentMatchRecord().match.End)
            {
                this.SEND_SC_GAME_NEW_MATCH(client, match);
            }
            // Next Round
            else
            {
                this.SEND_SC_GAME_START(client, match);
            }
            */
        }
    }
    RECIEVE_CS_GAME_END(client, data) {
    }
    RECIEVE_CS_GAME_ROUND_RESULT(client, match, data) {
    }
    RECIEVE_CS_GAME_MATCH_RESULT(client, match, data) {
    }
    RECIEVE_CS_GAME_OUT(client, data) {
    }
    RECIEVE_CS_GAME_TIMER(client, data) {
    }
    RECIEVE_CS_GAME_ENTRY(client, data) {
        let match = client.match;
        if (match != null) {
            this.SEND_SC_GAME_NEW_MATCH(client, match);
        }
    }
    SEND_SC_LOBBY_SEARCHING_ENEMY(client, match, data) {
        client.packet_res.set(iType.PacketID.CS_GAME_ENTRY, true);
        if (match.CheckAllPlayerRes(iType.PacketID.CS_GAME_ENTRY)) {
            match.timer.Clear();
        }
        let ph = { num: iType.PacketID.SC_GAME_ENTRY, size: 5 };
        let result = { ph: ph };
        match.send(client, JSON.stringify(result));
    }
    SEND_SC_LOBBY_SEARCHING_RESULT(client, match, data) {
    }
    SEND_SC_LOBBY_SEARCHING_CANCEL(client, match, data) {
    }
    SEND_SC_GAME_READY(client, match, data) {
        if (data != undefined) {
            const cs_game_ready = JSON.parse(data);
            let ph = { num: iType.PacketID.SC_GAME_READY, size: 5 };
            let result;
            result = { ph: ph, ready: cs_game_ready.ready };
            client.socket.send(JSON.stringify(result));
        }
    }
    SEND_SC_GAME_NEW_MATCH(client, match, data) {
        match.match_record.push({
            R1: { winner: 0, looser: 0 },
            R2: { winner: 0, looser: 0 },
            R3: { winner: 0, looser: 0 },
            End: false,
            Round: 1,
            Winner: 0
        });
        let ph = { num: iType.PacketID.SC_GAME_NEW_MATCH, size: 5 };
        let result = { ph: ph };
        client.socket.send(JSON.stringify(result));
    }
    SEND_SC_GAME_START(client, match, data) {
        let ph = { num: iType.PacketID.SC_GAME_START, size: 5 };
        let result;
        // 레디 단계 없어지면서 각자 보내는 걸로 변경
        /*
        match.players.forEach(player => {
            result = {
                ph : ph,
                userIdx : player.userIdx,
                match : match.CurrentMatchRecord().match_count,
                round : match.CurrentMatchRecord().match.Round
                };
            player.socket.send(JSON.stringify(result));
        });
        */
        result = {
            ph: ph,
            userIdx: client.userIdx,
            match: match.CurrentMatchRecord().match_count,
            round: match.CurrentMatchRecord().match.Round
        };
        client.socket.send(JSON.stringify(result));
    }
    SEND_SC_GAME_COMPUTE(client, match, data) {
        var _a;
        if (match.turn == client.userIdx) {
            const cs_game_select = JSON.parse(data);
            if (match.game.ActiveBar(cs_game_select.bar)) {
                let squares = match.game.CheckSquare(cs_game_select.bar);
                client.point += squares.length;
                let ph = { num: iType.PacketID.SC_GAME_COMPUTE, size: 5 };
                let result = { ph: ph, bar: cs_game_select.bar, userIdx: client.userIdx, matrixes: squares };
                match.send_all(JSON.stringify(result));
                match.SaveAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE, false);
                console.log(`squares.length : ${squares.length}`);
                if (squares.length <= 0) {
                    let otherIdx = (_a = match.other(client)) === null || _a === void 0 ? void 0 : _a.userIdx;
                    console.log("squares.length <= 0");
                    if (otherIdx != undefined) {
                        console.log(`client ${client.userIdx}, other ${otherIdx}`);
                        match.turn = otherIdx;
                    }
                }
            }
        }
    }
    SEND_SC_GAME_TURN(client, match, data) {
        let ph = { num: iType.PacketID.SC_GAME_TURN, size: 5 };
        let result = { ph: ph, userIdx: match.turn };
        match.send_all(JSON.stringify(result));
    }
    SEND_SC_GAME_SELECT(client, match, data) {
    }
    SEND_SC_GAME_RESULT(client, match, data) {
        let winner = match.winner();
        let looser = match.other(winner);
        let ph = { num: iType.PacketID.SC_GAME_RESULT, size: 5 };
        let result = {
            ph: ph,
            winner: match.winner().userIdx,
            winner_point: match.winner().point,
            looser_point: looser.point
        };
        match.RecordUpdate(winner.userIdx, looser.userIdx);
        match.SaveAllPlayerRes(iType.PacketID.SC_GAME_RESULT, false);
        match.send_all(JSON.stringify(result));
        // 모두 로비로 이동
        winner.GoToLobby();
        looser.GoToLobby();
        Server_1.server.Matches.delete(match.matchIdx);
    }
    SEND_SC_GAME_END(client, match, data) {
    }
    SEND_SC_GAME_OUT(client, match, data) {
    }
    SEND_SC_GAME_TIMER(client, match, data) {
    }
    SEND_SC_GAME_ENTRY(client, match, data) {
    }
}
exports.default = COREPROCESS;
