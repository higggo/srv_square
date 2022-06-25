"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketID = void 0;
var PacketID;
(function (PacketID) {
    PacketID[PacketID["CS_PING"] = 1001] = "CS_PING";
    PacketID[PacketID["CS_GAME_MOVE"] = 1002] = "CS_GAME_MOVE";
    PacketID[PacketID["CS_GAME_POSITION"] = 1003] = "CS_GAME_POSITION";
    PacketID[PacketID["CS_GAME_TIMER"] = 1004] = "CS_GAME_TIMER";
    PacketID[PacketID["SC_PING"] = 3001] = "SC_PING";
    PacketID[PacketID["SC_GAME_SPECTATION"] = 3002] = "SC_GAME_SPECTATION";
    PacketID[PacketID["SC_GAME_MOVE"] = 3003] = "SC_GAME_MOVE";
    PacketID[PacketID["SC_GAME_OUT"] = 3004] = "SC_GAME_OUT";
    PacketID[PacketID["SC_GAME_HELLO_NEWCLIENT"] = 3005] = "SC_GAME_HELLO_NEWCLIENT";
    PacketID[PacketID["SC_GAME_TIMER"] = 3006] = "SC_GAME_TIMER";
})(PacketID = exports.PacketID || (exports.PacketID = {}));
