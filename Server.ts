import Client, { CStatus } from "./Client";
import Match from "./Match";
import * as iType from "./iType"
import COREPROCESS from "./COREPROCESS";
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

    process: COREPROCESS = new COREPROCESS();


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

            let match : Match | null;

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
                        this.process.RECIEVE_CS_PING(client, data);
                        break;

                    case iType.PacketID.CS_LOBBY_SEARCHING_ENEMY :
                        this.process.RECIEVE_CS_LOBBY_SEARCHING_ENEMY(client, data);
                        break;
                        
                    case iType.PacketID.CS_LOBBY_SEARCHING_CANCEL :
                        this.process.RECIEVE_CS_LOBBY_SEARCHING_CANCEL(client, data);
                        break;

                    case iType.PacketID.CS_GAME_ENTRY:
                        this.process.RECIEVE_CS_GAME_ENTRY(client, data);
                        break;

                    case iType.PacketID.CS_GAME_READY:
                        this.process.RECIEVE_CS_GAME_READY(client, data);
                        break;

                    case iType.PacketID.CS_GAME_NEW_MATCH:
                        this.process.RECIEVE_CS_GAME_NEW_MATCH(client, data);
                        break;

                    case iType.PacketID.CS_GAME_START:
                        this.process.RECIEVE_CS_GAME_START(client, data);
                        break;

                    case iType.PacketID.CS_GAME_SELECT:
                        this.process.RECIEVE_CS_GAME_SELECT(client, data);
                        break;

                    case iType.PacketID.CS_GAME_COMPUTE:
                        this.process.RECIEVE_CS_GAME_COMPUTE(client, data);
                        break;

                    case iType.PacketID.CS_GAME_RESULT:
                        this.process.RECIEVE_CS_GAME_RESULT(client, data);
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
}

export = new Server();