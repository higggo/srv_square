import Client, { CStatus } from "./Client";
import Match from "./Match";
import * as iType from "./iType"
import { matrix } from "./Game";

//
const webSocket = require('ws')

//
enum PacketID
{
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
    SC_GAME_OUT = 3011
}

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
            console.log("aaaaaa");
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
                
                let ph : iType.Head = {num : PacketID.SC_PING, size : 5}
                let ping : iType.SC_Ping = {ph : ph}
                switch(dataform.ph.num)
                {
                    case PacketID.CS_PING :
                        ws.send(JSON.stringify(ping))
                        break;
                    case PacketID.CS_SEARCHING_ENEMY :
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
                        
                    case PacketID.CS_SEARCHING_CANCEL :
                        for(var i=0; i<this.Match.players.length; i++)
                        {
                            if(this.Match.players[i].userIdx == client.userIdx)
                            {
                                this.Match.players.splice(i);
                                
                                client.status = CStatus.Idle;
                                client.socket.send(JSON.stringify({ph : {num : PacketID.SC_SEARCHING_CANCEL, size : 5}}));
                                break;
                            }
                        }
                        break;
                    case PacketID.CS_GAME_READY:
                        const cs_game_ready = JSON.parse(data) as iType.CS_Game_Ready;
                        client.ready = cs_game_ready.ready;

                        let ph2 : iType.Head = {num : PacketID.SC_GAME_READY, size : 5};
                        let result2 : iType.SC_Game_Ready;
                        if(client.match != null)
                        {
                            client.match.players.forEach(player => {
                                result2 = {ph : ph2, ready : cs_game_ready.ready};
                                player.socket.send(JSON.stringify(result2));
                            });
                        }

                        if(client.match?.all_ready())
                        {
                            client.match?.init();

                            let ph1 : iType.Head = {num : PacketID.SC_GAME_START, size : 5};
                            let result1 : iType.SC_Game_Start;
                            client.match.players.forEach(player => {
                                result1 = {ph : ph1, userIdx : player.userIdx};
                                player.socket.send(JSON.stringify(result1));
                            });

                            
                        }
                        break;

                    case PacketID.CS_GAME_START:
                        if(client.match != null)
                        {
                            client.match.turn = client.userIdx;
                            let ph2 : iType.Head = {num : PacketID.SC_GAME_TURN, size : 5};
                            let result2 : iType.SC_Game_Turn = {ph : ph2, userIdx : client.match.turn};
                            client.match?.send_all(JSON.stringify(result2));
                        }
                        break;
                    case PacketID.CS_GAME_SELECT:
                        if(client.match?.turn == client.userIdx)
                        {
                            const cs_game_select = JSON.parse(data) as iType.CS_Game_Select;
                            let squares : matrix[] = client.match?.game.CheckSquare(cs_game_select.bar);
                            client.point += squares.length;
                            let ph : iType.Head = {num : PacketID.SC_GAME_COMPUTE, size : 5};
                            let result : iType.SC_Game_Compute = {ph : ph, bar : cs_game_select.bar, userIdx : client.userIdx, matrixes : squares};
                            client.match?.send_all(JSON.stringify(result));
                        }
                        break;
                    case PacketID.CS_GAME_COMPUTE:
                        if(client.match?.game.point_matrixes.length == 9)
                        {
                            let ph : iType.Head = {num : PacketID.SC_GAME_RESULT, size : 5};
                            let result : iType.SC_Game_Result = {ph : ph, winner : client.match?.winner()};
                            client.match?.send_all(JSON.stringify(result));
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
            let ph : iType.Head = {num : PacketID.SC_SEARCHING_RESULT, size : 5};
            let result : iType.SC_Searching_Result = {ph : ph, result : 1};
            new_match.send_all(JSON.stringify(result));
            this.Match.players = [];
        }
        else
        {
            let ph : iType.Head = {num : PacketID.SC_SEARCHING_ENEMY, size : 5};
            let result : iType.SC_Searching_Enemy = {ph : ph};
            client.socket.send(JSON.stringify(result));
        }
    }
}

export = new Server();