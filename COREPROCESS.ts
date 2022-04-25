import Client, { CStatus } from "./Client";
import Match from "./Match";
import * as iType from "./iType"
import { matrix } from "./Game";

/*

    CS_PING = 1033,
    CS_SEARCHING_ENEMY = 1002,
    CS_SEARCHING_RESULT = 1003,
    CS_SEARCHING_CANCEL = 1004,
    CS_GAME_READY = 1005,
    CS_GAME_START = 1006,
    CS_GAME_COMPUTE = 1007,
    CS_GAME_TURN = 1008,
    CS_GAME_SELECT = 1009,
    CS_GAME_RESULT = 1010,
    CS_GAME_OUT = 1011,
    CS_GAME_TIMER = 1012,
    CS_GAME_ENTRY = 1013,

    SC_PING = 3033,
    SC_SEARCHING_ENEMY = 3002,
    SC_SEARCHING_RESULT = 3003,
    SC_SEARCHING_CANCEL = 3004,
    SC_GAME_READY = 3005,
    SC_GAME_START = 3006,
    SC_GAME_COMPUTE = 3007,
    SC_GAME_TURN = 3008,
    SC_GAME_SELECT = 3009,
    SC_GAME_RESULT = 3010,
    SC_GAME_OUT = 3011,
    SC_GAME_TIMER = 3012,
    SC_GAME_ENTRY = 3013,
*/
export default class COREPROCESS
{
    SC_SEARCHING_ENEMY(client : Client, match : Match, data? : string)
    {
        client.packet_res.set(iType.PacketID.CS_GAME_ENTRY, true);

        if(match.CheckAllPlayerRes(iType.PacketID.CS_GAME_ENTRY))
        {
            match.timer.Clear();
        }
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_ENTRY, size : 5};
        let result : iType.SC_Game_Entry = {ph : ph};
        match.send(client, JSON.stringify(result));
    }
    SC_SEARCHING_RESULT(client : Client, match : Match, data? : string)
    {
        
    }
    SC_SEARCHING_CANCEL(client : Client, match : Match, data? : string)
    {
        
    }
    SC_GAME_READY(client : Client, match : Match, data? : string)
    {
        if(data != undefined)
        {
            const cs_game_ready = JSON.parse(data) as iType.CS_Game_Ready;

            let ph : iType.Head = {num : iType.PacketID.SC_GAME_READY, size : 5};
            let result : iType.SC_Game_Ready;
            result = {ph : ph, ready : cs_game_ready.ready};
            client.socket.send(JSON.stringify(result));
        }
        else
        {
            console.error("SC_GAME_READY data undefined");
        }
    }
    SC_GAME_START(client : Client, match : Match, data? : string)
    {
        match.MatchInit();

        let ph : iType.Head = {num : iType.PacketID.SC_GAME_START, size : 5};
        let result : iType.SC_Game_Start;
        match.players.forEach(player => {
            result = {
                ph : ph,
                userIdx : player.userIdx,
                match : match.CurrentMatchRecord().match_count,
                round : match.CurrentMatchRecord().match.Round
                };
            player.socket.send(JSON.stringify(result));
        });
    }
    SC_GAME_COMPUTE(client : Client, match : Match, data : string)
    {
        if(match.turn == client.userIdx)
        {
            const cs_game_select = JSON.parse(data) as iType.CS_Game_Select;
            if(match.game.ActiveBar(cs_game_select.bar))
            {
                let squares : matrix[] = match.game.CheckSquare(cs_game_select.bar);
                client.point += squares.length;
                let ph : iType.Head = {num : iType.PacketID.SC_GAME_COMPUTE, size : 5};
                let result : iType.SC_Game_Compute = {ph : ph, bar : cs_game_select.bar, userIdx : client.userIdx, matrixes : squares};
                match.send_all(JSON.stringify(result));
                match.SaveAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE, false);

                console.log(`squares.length : ${squares.length}`);
                if(squares.length <= 0)
                {
                    let otherIdx : number | undefined = match.other(client)?.userIdx;
                    console.log("squares.length <= 0");
                    
                    if(otherIdx != undefined)
                    {
                        console.log(`client ${client.userIdx}, other ${otherIdx}`);
                        match.turn = otherIdx;
                    }
                }
            }
        }
        
    }
    SC_GAME_TURN(client : Client, match : Match, data? : string)
    {
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_TURN, size : 5};
        let result : iType.SC_Game_Turn = {ph : ph, userIdx : match.turn};
        match.send_all(JSON.stringify(result));
        
    }
    SC_GAME_SELECT(client : Client, match : Match, data? : string)
    {
        
    }
    SC_GAME_RESULT(client : Client, match : Match, data? : string)
    {
        let winner : Client = match.winner();
        let looser : Client = match.other(winner);
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_RESULT, size : 5};
        let result : iType.SC_Game_Result = {
            ph : ph, 
            winner : match.winner().userIdx, 
            winner_point : match.winner().point, 
            looser_point : looser.point
        };
        match.RecordUpdate(winner.userIdx, looser.userIdx);
        match.SaveAllPlayerRes(iType.PacketID.SC_GAME_RESULT, false);
        match.send_all(JSON.stringify(result));
    }
    SC_GAME_OUT(client : Client, match : Match, data? : string)
    {
        
    }
    SC_GAME_TIMER(client : Client, match : Match, data? : string)
    {
        
    }
    SC_GAME_ENTRY(client : Client, match : Match, data? : string)
    {
        
    }
}