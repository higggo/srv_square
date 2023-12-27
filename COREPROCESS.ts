import Client, { CStatus } from "./Client";
import Match from "./Match";
import * as iType from "./iType"
import { matrix } from "./Game";
import {server, Server} from "./Server";
export default class COREPROCESS
{
    RECIEVE_CS_PING(client : Client, data : string)
    {
        client.pingCount = 0;
    }

    RECIEVE_CS_LOBBY_SEARCHING_ENEMY(client : Client, data : string)
    {
        if(server.Match != null)
        {
            //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
            const dataform = JSON.parse(data) as iType.CS_Lobby_Searching_Enemy;
            console.log(dataform);
            console.log(`Match.players.length ${server.Match.players.size}`);

            if(client.status == CStatus.Idle) 
            {
                server.Match.players.set(client.userIdx, client);
            
                if(server.Match.players.size >= 2)
                {
                    console.log(`this.Match.players.length >= 2`);
        
                    let new_match = new Match();
                    for (const player of server.Match.players.values()) 
                    {
                        new_match.players.set(player.userIdx, player);
                        player.match = new_match;
                    }
                    
                    server.Matches.set(server.roomIdx++, new_match);
                    let ph : iType.Head = {num : iType.PacketID.SC_LOBBY_SEARCHING_RESULT, size : 5};
                    let result : iType.SC_Lobby_Searching_Result = {ph : ph, result : 1};
                    new_match.send_all(JSON.stringify(result));
                    new_match.SaveAllPlayerRes(iType.PacketID.CS_GAME_ENTRY, false);
                    server.Match.players.clear();
        
                    if(client.match != null)
                    {
                        client.match.SetTimer(1000, 5, iType.PacketID.CS_GAME_ENTRY);
                        client.match?.RoomInit();
        
                        // state
                        client.status = CStatus.Playing;
                        client.match.other(client).status = CStatus.Playing;
                    }
                }
                else
                {
                    let ph : iType.Head = {num : iType.PacketID.SC_LOBBY_SEARCHING_ENEMY, size : 5};
                    let result : iType.SC_Lobby_Searching_Enemy = {ph : ph};
                    client.socket.send(JSON.stringify(result));
                }
            }
            client.status = CStatus.Searching;
        }
    }

    RECIEVE_CS_LOBBY_SEARCHING_RESULT(client : Client, data : string)
    {
        
    }

    RECIEVE_CS_LOBBY_SEARCHING_CANCEL(client : Client, data : string)
    {
        if(server.Match != null)
        {
            for (const [idx, player] of server.Match.players) 
            {
                if(player.userIdx == client.userIdx)
                {
                    server.Match.players.delete(idx);
                    
                    client.status = CStatus.Idle;
                    client.socket.send(JSON.stringify({ph : {num : iType.PacketID.SC_LOBBY_SEARCHING_CANCEL, size : 5}}));
                    break;
                }
            }
        }
    }

    RECIEVE_CS_GAME_READY(client : Client, data : string)
    {
        let match : Match | null = client.match;
        if(match != null)
        {
            const cs_game_ready = JSON.parse(data) as iType.CS_Game_Ready;
            client.ready = cs_game_ready.ready;
            if(match.all_ready())
            {
                this.SEND_SC_GAME_START(client, match);
            }
            else
            {
                this.SEND_SC_GAME_READY(client, match, data);
            }
        }
        else
        {
            console.error("match가 존재하지 않음.");
        }
    }

    RECIEVE_CS_GAME_NEW_MATCH(client : Client, data : string)
    {

    }

    RECIEVE_CS_GAME_START(client : Client, data : string)
    {
        let match : Match | null = client.match;
        if(match != null)
        {
            match.RoundInit();
            match.turn = client.userIdx;
            this.SEND_SC_GAME_TURN(client, match);
        }
        else
        {
            console.error("match가 존재하지 않음.");
        }
    }

    RECIEVE_CS_GAME_COMPUTE(client : Client, data : string)
    {
        let match : Match | null = client.match;
        if(match != null)
        {
            client.packet_res.set(iType.PacketID.SC_GAME_COMPUTE, true);
            if(match.CheckAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE))
            {
                if(match.game.point_matrixes.length == 9)
                {
                    this.SEND_SC_GAME_RESULT(client, match);
                }
                else
                {
                    this.SEND_SC_GAME_TURN(client, match);
                }
            }
        }
    }

    RECIEVE_CS_GAME_TURN(client : Client, data : string)
    {
        
    }

    RECIEVE_CS_GAME_SELECT(client : Client, data : string)
    {
        let match : Match | null = client.match;
        if(match != null)
        {
            this.SEND_SC_GAME_COMPUTE(client, match, data);
        }
        else
        {
            console.error("match가 존재하지 않음.");
        }
    }

    RECIEVE_CS_GAME_RESULT(client : Client, data : string)
    {
        client.packet_res.set(iType.PacketID.SC_GAME_RESULT, true);

        let match : Match | null = client.match;
        if(match?.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT))
        {
            client.ready = false;
            let other = match.other(client);
            if(other != null) other.ready = false;
            
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

    RECIEVE_CS_GAME_END(client : Client, data : string)
    {
        
    }

    RECIEVE_CS_GAME_ROUND_RESULT(client : Client, match : Match, data? : string)
    {

    }

    RECIEVE_CS_GAME_MATCH_RESULT(client : Client, match : Match, data? : string)
    {

    }

    RECIEVE_CS_GAME_OUT(client : Client, data : string)
    {
        
    }

    RECIEVE_CS_GAME_TIMER(client : Client, data : string)
    {
        
    }

    RECIEVE_CS_GAME_ENTRY(client : Client, data : string)
    {
        let match : Match | null = client.match;
        if(match != null)
        {
            this.SEND_SC_GAME_NEW_MATCH(client, match);
        }
    }

    SEND_SC_LOBBY_SEARCHING_ENEMY(client : Client, match : Match, data? : string)
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

    SEND_SC_LOBBY_SEARCHING_RESULT(client : Client, match : Match, data? : string)
    {
        
    }

    SEND_SC_LOBBY_SEARCHING_CANCEL(client : Client, match : Match, data? : string)
    {
        
    }

    SEND_SC_GAME_READY(client : Client, match : Match, data? : string)
    {
        if(data != undefined)
        {
            const cs_game_ready = JSON.parse(data) as iType.CS_Game_Ready;

            let ph : iType.Head = {num : iType.PacketID.SC_GAME_READY, size : 5};
            let result : iType.SC_Game_Ready;
            result = {ph : ph, ready : cs_game_ready.ready};
            client.socket.send(JSON.stringify(result));
        }
    }

    SEND_SC_GAME_NEW_MATCH(client : Client, match : Match, data? : string)
    {
        match.match_record.push({
            R1 : {winner : 0, looser : 0},
            R2 : {winner : 0, looser : 0},
            R3 : {winner : 0, looser : 0},
            End : false,
            Round : 1,
            Winner : 0
        });
        
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_NEW_MATCH, size : 5};
        let result : iType.SC_Game_NewMatch = {ph : ph};
        match.send_all(JSON.stringify(result));
    }

    SEND_SC_GAME_START(client : Client, match : Match, data? : string)
    {
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

    SEND_SC_GAME_COMPUTE(client : Client, match : Match, data : string)
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

    SEND_SC_GAME_TURN(client : Client, match : Match, data? : string)
    {
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_TURN, size : 5};
        let result : iType.SC_Game_Turn = {ph : ph, userIdx : match.turn};
        match.send_all(JSON.stringify(result));
        
    }

    SEND_SC_GAME_SELECT(client : Client, match : Match, data? : string)
    {
        
    }

    SEND_SC_GAME_RESULT(client : Client, match : Match, data? : string)
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

    SEND_SC_GAME_END(client : Client, match : Match, data? : string)
    {
        
    }

    SEND_SC_GAME_OUT(client : Client, match : Match, data? : string)
    {
        
    }

    SEND_SC_GAME_TIMER(client : Client, match : Match, data? : string)
    {
        
    }

    SEND_SC_GAME_ENTRY(client : Client, match : Match, data? : string)
    {
        
    }
}