import Client, { CStatus } from "./Client";
import Match from "./Match";
import * as iType from "./iType"
import { matrix } from "./Game";

//
const webSocket = require('ws')



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
            this.Clients.set(userIdx, client);
            
            //
            ws.on('message', (data: string)=>{
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data) as iType.DataForm;
                if(dataform.ph.num != 1033)
                    console.log('ph : ' + JSON.stringify(dataform.ph));
                
                let ph : iType.Head = {num : iType.PacketID.SC_PING, size : 5}
                let ping : iType.SC_Ping = {ph : ph}
                switch(dataform.ph.num)
                {
                    case iType.PacketID.CS_PING :
                        ws.send(JSON.stringify(ping))
                        break;
                    case iType.PacketID.CS_SEARCHING_ENEMY :
                        //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
                        const dataform = JSON.parse(data) as iType.CS_Searching_Enemy;
                        console.log(dataform);
                        console.log(`Match.players.length ${this.Match.players.length}`);

                        if(client.status == CStatus.Idle) 
                        {
                            this.EnterMatchQueue(client);
                        }
                        client.status = CStatus.Searching;
                        break;
                        
                    case iType.PacketID.CS_SEARCHING_CANCEL :
                        for(var i=0; i<this.Match.players.length; i++)
                        {
                            if(this.Match.players[i].userIdx == client.userIdx)
                            {
                                this.Match.players.splice(i);
                                
                                client.status = CStatus.Idle;
                                client.socket.send(JSON.stringify({ph : {num : iType.PacketID.SC_SEARCHING_CANCEL, size : 5}}));
                                break;
                            }
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
                            client.match?.init();

                            let ph1 : iType.Head = {num : iType.PacketID.SC_GAME_START, size : 5};
                            let result1 : iType.SC_Game_Start;
                            client.match.players.forEach(player => {
                                result1 = {ph : ph1, userIdx : player.userIdx};
                                player.socket.send(JSON.stringify(result1));
                            });

                            
                        }
                        break;

                    case iType.PacketID.CS_GAME_START:
                        if(client.match != null)
                        {
                            client.match.turn = client.userIdx;
                            let ph2 : iType.Head = {num : iType.PacketID.SC_GAME_TURN, size : 5};
                            let result2 : iType.SC_Game_Turn = {ph : ph2, userIdx : client.match.turn};
                            client.match?.send_all(JSON.stringify(result2));
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
                                    if(otherIdx != undefined)
                                    {
                                        client.match.nextTurn = otherIdx;
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
                                

                                console.log("SC_Game_Result sadasdasss");
                                client.match?.SaveAllPlayerRes(iType.PacketID.SC_GAME_RESULT, false);
                                client.match?.send_all(JSON.stringify(result));
                            }
                            else
                            {
                                client.match.turn = client.match.nextTurn;
                                let ph2 : iType.Head = {num : iType.PacketID.SC_GAME_TURN, size : 5};
                                let result2 : iType.SC_Game_Turn = {ph : ph2, userIdx : client.match.nextTurn};
                                client.match?.send_all(JSON.stringify(result2));
                            }
                        }
                    break;
                    case iType.PacketID.CS_GAME_RESULT:
                        client.packet_res.set(iType.PacketID.SC_GAME_RESULT, true);
                        if(client.match?.CheckAllPlayerRes(iType.PacketID.SC_GAME_RESULT))
                        {
                            client.ready = false;
                            let other = client.match.other(client);
                            if(other != null) other.ready = false;

                            client.match.init();
                        }
                        break;
                    default:
                        break;
                }
            })
            
            //
            ws.on('close', () =>{
                if(this.Clients.has(userIdx)) 
                {
                    this.Clients.delete(userIdx);
                    console.log(`deleted idx : ${userIdx}`);
                }
                console.log(`WS Closed userIdx : ${userIdx}, Clients Size : ${this.Clients.size}, Match.players.length ${this.Match.players.length}`);
            })
        })

        this.wss.on('listening', ()=>{
            console.log('server is listening on port 8080')
        })
    }

    EnterMatchQueue(client : Client)
    {
        this.Match.players.push(client);

        if(this.Match.players.length >= 2)
        {
            console.log(`this.Match.players.length >= 2`);

            let new_match = new Match();
            new_match.players.push(this.Match.players[0]);
            new_match.players.push(this.Match.players[1]);
            this.Match.players[0].match = new_match;
            this.Match.players[1].match = new_match;

            this.Matches.set(this.roomIdx++, new_match);
            let ph : iType.Head = {num : iType.PacketID.SC_SEARCHING_RESULT, size : 5};
            let result : iType.SC_Searching_Result = {ph : ph, result : 1};
            new_match.send_all(JSON.stringify(result));
            this.Match.players = [];
        }
        else
        {
            let ph : iType.Head = {num : iType.PacketID.SC_SEARCHING_ENEMY, size : 5};
            let result : iType.SC_Searching_Enemy = {ph : ph};
            client.socket.send(JSON.stringify(result));
        }
    }
}

export = new Server();