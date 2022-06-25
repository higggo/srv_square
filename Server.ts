import Client, { CStatus } from "./Client";
import * as iType from "./iType"
import COREPROCESS from "./COREPROCESS";
//
const webSocket = require('ws');



/////
export class Server
{
    //
    port : number
    wss : any;

    //
    lastUserIdx : number = 0;
    Clients = new Map<number, Client>();
    
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
            let client = this.process.CREATE_NEW_CLIENT(ws);
            client.OnConnected();
            this.process.SEND_SC_START_PING(client);
            this.process.SEND_SC_GAME_SPEACTATION(client);
            this.process.SEND_SC_GAME_HELLO_NEWCLIENT(client);

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

                    case iType.PacketID.CS_GAME_MOVE:
                        this.process.RECIEVE_CS_GAME_MOVE(client, data);
                        break;
            
                    case iType.PacketID.CS_GAME_POSITION:
                        this.process.RECIEVE_CS_GAME_POSITION(client, data);
                        break;
            
                    default:
                        break;
                }
            })
            
            //
            ws.on('close', () =>{
                if(this.Clients.has(client.userIdx)) 
                {
                    client.OnDisconnected();
                    this.Clients.delete(client.userIdx);
                    
                    this.process.SEND_SC_GAME_OUT(client);
                }
                console.log(`WS Closed userIdx : ${client.userIdx}, Clients Size : ${this.Clients.size}`);
            })
        })

        this.wss.on('listening', ()=>{
            console.log('server is listening on port 8080')
        })
    }
}

export const server = new Server();