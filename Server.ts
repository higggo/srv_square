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

    SC_PING = 3033,
    SC_SEARCHING_ENEMY = 3002
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
                console.log('msg : ' + dataform.msg);
                
                let ph : iType.Head = {num : PacketID.SC_PING, size : 5}
                let ping : iType.SC_Ping = {ph : ph}
                switch(dataform.ph.num)
                {
                    case PacketID.CS_PING :
                        ws.send(JSON.stringify(ping))
                        break;
                    case PacketID.CS_SEARCHING_ENEMY :
                        //let ping : iType.SC_SEARCHING_ENEMY = {ph : ph}
                        client.status == CStatus.Idle ? this.EnterMatchQueue(client) : null;
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
                console.log(`WS Closed userIdx : ${userIdx}, Clients Size : ${this.Clients.size}`);
            })
        })

        this.wss.on('listening', ()=>{
            console.log('server is listening on port 8080')
        })
    }

    EnterMatchQueue(client : Client)
    {
        this.Match.players.push(client);

        if(this.Match.players.length > 2)
        {
            this.Match.players[0].match_idx = this.roomIdx;
            this.Match.players[1].match_idx = this.roomIdx;

            let new_match = new Match();
            new_match.players.push(this.Match.players[0]);
            new_match.players.push(this.Match.players[1]);

            this.Matches.set(this.roomIdx++, new_match);
            new_match.send_all("packet");
            this.Match.players = [];
        }
    }
}

export = new Server();