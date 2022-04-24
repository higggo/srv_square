import Client, { CStatus } from "./Client";
import Match from "./Match";
import * as iType from "./iType"
import { matrix } from "./Game";
import { EndOfLineState } from "typescript";
//
const webSocket = require('ws');



/////
class Server
{

    //
    port : number
    wss : any;

    //
    Matches = new Map<number, Match>();
    Match : Match = new Match();

    //
    lastUserIdx : number = 0;
    Clients = new Map<number, Client>();

    roomIdx : number = 0;


    constructor()
    {
        this.port = 8080;
        this.wss = new webSocket.Server({port: this.port}, ()=>{
            console.log('server started')
        });
    }

    STANDBY()
    {

    }

    RUNNING()
    {
        this.wss.on('connection', (ws : any)=>{
            //
            const userIdx = this.lastUserIdx++;
            let client : Client = new Client(userIdx, ws);
            client.OnConnected();
            this.Clients.set(userIdx, client);

            // send ping
            let ph : iType.Head = {num : iType.PacketID.SC_PING, size : 5};
            let ping : iType.SC_Ping = {ph : ph};
            ws.send(JSON.stringify(ping));
            client.pingCount++;
            
            client.pingTimer = setInterval(()=>{
                if(client.pingCount > 3)
                {
                    client.OnDisconnected();
                }
                else
                {
                    ws.send(JSON.stringify({ph :  {num : iType.PacketID.SC_PING, size : 5}}));
                    client.pingCount++;
                }
            }, 3000);

            //
            ws.on('message', (data: string)=>{
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data) as iType.DataForm;
                if(dataform.ph.num != 1033)
                    console.log('ph : ' + JSON.stringify(dataform.ph));
                switch(dataform.ph.num)
                {
                    case iType.PacketID.CS_PING :
                        client.pingCount = 0;

                        break;
                    case iType.PacketID.CS_SEARCHING_ENEMY :
                        //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
                        const dataform = JSON.parse(data) as iType.CS_Searching_Enemy;
                        console.log(dataform);
                        console.log(`Match.players.length ${this.Match.players.size}`);

                        if(client.status == CStatus.Idle) 
                        {
                            this.EnterMatchQueue(client);
                        }
                        client.status = CStatus.Searching;
                        break;
                        
                    case iType.PacketID.CS_SEARCHING_CANCEL :
                        for (const [idx, player] of this.Match.players) 
                        {
                            if(player.userIdx == client.userIdx)
                            {
                                this.Match.players.delete(idx);
                                
                                client.status = CStatus.Idle;
                                client.socket.send(JSON.stringify({ph : {num : iType.PacketID.SC_SEARCHING_CANCEL, size : 5}}));
                                break;
                            }
                        }
                        break;

                    case iType.PacketID.CS_GAME_ENTRY:
                        client.packet_res.set(iType.PacketID.CS_GAME_ENTRY, true);

                        let ph : iType.Head = {num : iType.PacketID.SC_GAME_ENTRY, size : 5};
                        let result : iType.SC_Game_Entry = {ph : ph};
                        client.match?.send(client, JSON.stringify(result));
                        if(client.match?.CheckAllPlayerRes(iType.PacketID.CS_GAME_ENTRY))
                        {
                            client.match.timer.Clear();
                        }

                        
                        break;
                    case iType.PacketID.CS_GAME_READY:
                        const cs_game_ready = JSON.parse(data) as iType.CS_Game_Ready;
                        client.ready = cs_game_ready.ready;

                        let ph2 : iType.Head = {num : iType.PacketID.SC_GAME_READY, size : 5};
                        let result2 : iType.SC_Game_Ready;
                        if(client.match != null)
                        {
                            result2 = {ph : ph2, ready : cs_game_ready.ready};
                            client.socket.send(JSON.stringify(result2));
                        }

                        if(client.match?.all_ready())
                        {
                            client.match?.MatchInit();
                            let match : Match = client.match;
                            
                            let ph : iType.Head = {num : iType.PacketID.SC_GAME_START, size : 5};
                            let result : iType.SC_Game_Start;
                            if(match != undefined)
                            {
                                client.match.players.forEach(player => {
                                    result = {
                                        ph : ph,
                                        userIdx : player.userIdx,
                                        match : match.CurrentMatchRecord().match_count,
                                        round : match.CurrentMatchRecord().match.Round
                                        };
                                    player.socket.send(JSON.stringify(result));
                                });
                            }
                        }
                        break;

                    case iType.PacketID.CS_GAME_START:
                        if(client.match != null)
                        {
                            client.match.RoundInit();
                            client.match.turn = client.userIdx;
                            let ph : iType.Head = {num : iType.PacketID.SC_GAME_TURN, size : 5};
                            let result : iType.SC_Game_Turn = {ph : ph, userIdx : client.match.turn};
                            client.match?.send_all(JSON.stringify(result));
                        }
                        break;
                    case iType.PacketID.CS_GAME_SELECT:
                        if(client.match?.turn == client.userIdx)
                        {
                            const cs_game_select = JSON.parse(data) as iType.CS_Game_Select;
                            if(client.match.game.ActiveBar(cs_game_select.bar))
                            {
                                let squares : matrix[] = client.match?.game.CheckSquare(cs_game_select.bar);
                                client.point += squares.length;
                                let ph : iType.Head = {num : iType.PacketID.SC_GAME_COMPUTE, size : 5};
                                let result : iType.SC_Game_Compute = {ph : ph, bar : cs_game_select.bar, userIdx : client.userIdx, matrixes : squares};
                                client.match?.send_all(JSON.stringify(result));
                                client.match?.SaveAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE, false);
    
                                console.log(`squares.length : ${squares.length}`);
                                if(squares.length <= 0)
                                {
                                    let otherIdx : number | undefined = client.match.other(client)?.userIdx;
                                    console.log("squares.length <= 0");
                                    
                                    if(otherIdx != undefined)
                                    {
                                        console.log(`client ${client.userIdx}, other ${otherIdx}`);
                                        client.match.turn = otherIdx;
                                    }
                                }
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_COMPUTE:
                        client.packet_res.set(iType.PacketID.SC_GAME_COMPUTE, true);
                        if(client.match?.CheckAllPlayerRes(iType.PacketID.SC_GAME_COMPUTE))
                        {
                            if(client.match?.game.point_matrixes.length == 9)
                            {
                                let winner = client.match?.winner();
                                let looser : any = client.match?.other(winner);
                                let ph : iType.Head = {num : iType.PacketID.SC_GAME_RESULT, size : 5};
                                let result : iType.SC_Game_Result = {ph : ph, winner : client.match?.winner().userIdx , winner_point : client.match?.winner().point, looser_point : looser?.point};
                                client.match?.RecordUpdate(winner.userIdx, looser.userIdx);
                                client.match?.SaveAllPlayerRes(iType.PacketID.SC_GAME_RESULT, false);
                                client.match?.send_all(JSON.stringify(result));
                            }
                            else
                            {
                                let ph : iType.Head = {num : iType.PacketID.SC_GAME_TURN, size : 5};
                                let result : iType.SC_Game_Turn = {ph : ph, userIdx : client.match.turn};
                                client.match?.send_all(JSON.stringify(result));
                            }
                        }
                    break;
                    case iType.PacketID.CS_GAME_RESULT:
                        client.packet_res.set(iType.PacketID.SC_GAME_RESULT, true);
                        console.log(`chk : ${client.match?.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT)}, client ${client.userIdx}: ${client.packet_res.get(iType.PacketID.SC_GAME_RESULT)}`);
                        
                        if(client.match?.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT))
                        {
                            client.ready = false;
                            let other = client.match.other(client);
                            if(other != null) other.ready = false;
                            
                            if(client.match.CurrentMatchRecord().match.End)
                            {
                                client.match.match_record.push({
                                    R1 : {winner : 0, looser : 0},
                                    R2 : {winner : 0, looser : 0},
                                    R3 : {winner : 0, looser : 0},
                                    End : false,
                                    Round : 1,
                                    Winner : 0
                                });
                                let ph : iType.Head = {num : iType.PacketID.SC_GAME_READY, size : 5};
                                let result : iType.SC_Game_Ready = {ph : ph, ready : false};
                                if(client.match != null)
                                {
                                    client.match.send_all(JSON.stringify(result));
                                }
                            }
                            else
                            {
                                let ph : iType.Head = {num : iType.PacketID.SC_GAME_START, size : 5};
                                let result : iType.SC_Game_Start;
                                let match = client.match;
                                if(match != undefined)
                                {
                                    client.match.players.forEach(player => {
                                        console.log("useridx : " + player.userIdx);
                                        
                                        result = {
                                            ph : ph,
                                            userIdx : player.userIdx,
                                            match : match.CurrentMatchRecord().match_count,
                                            round : match.CurrentMatchRecord().match.Round
                                        };
                                        player.socket.send(JSON.stringify(result));
                                    });
                                }
                            }
                        }
                        break;
                    case iType.PacketID.CS_GAME_TIMER:
                        break;
                    default:
                        break;
                }
            })
            
            //
            ws.on('close', () =>{
                if(this.Clients.has(userIdx)) 
                {
                    client.OnDisconnected();
                    switch(client.status)
                    {
                        case CStatus.Idle:
                            this.Clients.delete(client.userIdx);
                            break;
                        case CStatus.Searching:
                            this.Match.players.delete(client.userIdx);
                            break;
                        case CStatus.Playing:
                            break;
                        default :
                            break;
                    }
                }
                console.log(`WS Closed userIdx : ${userIdx}, Clients Size : ${this.Clients.size}, Match.players.length ${this.Match.players.size}`);
            })
        })

        this.wss.on('listening', ()=>{
            console.log('server is listening on port 8080')
        })
    }

    EnterMatchQueue(client : Client)
    {
        this.Match.players.set(client.userIdx, client);

        if(this.Match.players.size >= 2)
        {
            console.log(`this.Match.players.length >= 2`);

            let new_match = new Match();
            for (const player of this.Match.players.values()) 
            {
                new_match.players.set(player.userIdx, player);
                player.match = new_match;
            }

            this.Matches.set(this.roomIdx++, new_match);
            let ph : iType.Head = {num : iType.PacketID.SC_SEARCHING_RESULT, size : 5};
            let result : iType.SC_Searching_Result = {ph : ph, result : 1};
            new_match.send_all(JSON.stringify(result));
            new_match.SaveAllPlayerRes(iType.PacketID.CS_GAME_ENTRY, false);
            this.Match.players.clear();

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
            let ph : iType.Head = {num : iType.PacketID.SC_SEARCHING_ENEMY, size : 5};
            let result : iType.SC_Searching_Enemy = {ph : ph};
            client.socket.send(JSON.stringify(result));
        }


        //


    }

}

export = new Server();