import Client, { CStatus } from "./Client";
import Queue from "./Queue";
import Match from "./Match";
import * as iType from "./iType"

//
const webSocket = require('ws')

//
enum PacketID
{
    CS_PING = 1033,
    CS_SEARCHING_ENEMY = 1002,
    CS_SEARCHING_RESULT = 1003,
    CS_SEARCHING_CANCEL = 1004,

    SC_PING = 3033,
    SC_SEARCHING_ENEMY = 3002,
    SC_SEARCHING_RESULT = 3003,
    SC_SEARCHING_CANCEL = 3004,
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
            //
            const userIdx = this.lastUserIdx++;
            let client : Client = new Client(userIdx, ws);
            this.Clients.set(userIdx, client);

            //
            ws.on('message', (data: string)=>{
                //console.log('data received %o', data.toString())
                const dataform = JSON.parse(data) as iType.DataForm;
                console.log('useridx : ' + userIdx);
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
            this.Match.players[0].match_idx = this.roomIdx;
            this.Match.players[1].match_idx = this.roomIdx;

            let new_match = new Match();
            new_match.players.push(this.Match.players[0]);
            new_match.players.push(this.Match.players[1]);

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