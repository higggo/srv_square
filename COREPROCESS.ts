import Client, { CStatus } from "./Client";
import * as iType from "./iType"
import {server, Server} from "./Server";
export default class COREPROCESS
{
    CREATE_NEW_CLIENT(ws : any) : Client
    {
        const userIdx = server.lastUserIdx++;
        let client : Client = new Client(userIdx, ws);
        server.Clients.set(userIdx, client);
        return client;
    }

    RECIEVE_CS_PING(sender : Client, data : string)
    {
        sender.pingCount = 0;
    }

    RECIEVE_CS_GAME_MOVE(sender : Client, data : string)
    {
        const cs_game_move = JSON.parse(data) as iType.CS_Game_Move;
        this.SEND_SC_GAME_MOVE(sender, cs_game_move.position);
    }
    RECIEVE_CS_GAME_POSITION(sender : Client, data : string)
    {
        const cs_game_position = JSON.parse(data) as iType.CS_Game_Position;
        sender.position.Set(cs_game_position.position);
    }

    SEND_SC_START_PING(sender : Client)
    {
        let ph : iType.Head = {num : iType.PacketID.SC_PING, size : 5};
        let ping : iType.SC_Ping = {ph : ph};
        sender.socket.send(JSON.stringify(ping));
        sender.pingCount++;
        
        sender.pingTimer = setInterval(()=>{
            if(sender.pingCount > 3)
            {
                sender.OnDisconnected();
            }
            else
            {
                sender.socket.send(JSON.stringify({ph :  {num : iType.PacketID.SC_PING, size : 5}}));
                sender.pingCount++;
            }
        }, 3000);
    }

    SEND_SC_GAME_SPEACTATION(sender : Client)
    {
        let characters : iType.Character[] = [];
            
        for (const client of server.Clients.values()) 
        {
            characters.push({
                index : client.userIdx,
                position : client.position.Get()
                });
        }
        let specHead : iType.Head = {num : iType.PacketID.SC_GAME_SPECTATION, size : 5};
        let spectation : iType.SC_Game_Spectation = {ph : specHead, index : sender.userIdx, characters : characters};
        sender.socket.send(JSON.stringify(spectation));
    }

    SEND_SC_GAME_MOVE(sender : Client, position : iType.Position)
    {
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_MOVE, size : 5};
        let packet : iType.SC_Game_Move = {
            ph : ph,
            character : {index : sender.userIdx, position : position}
            };
        for(const client of server.Clients.values())
        {
            client.socket.send(JSON.stringify(packet));
        }
    }
    SEND_SC_GAME_OUT(sender : Client)
    {
        let ph : iType.Head = {num : iType.PacketID.SC_GAME_OUT, size : 5};
        let packet : iType.SC_Game_Out = {
            ph : ph,
            index : sender.userIdx
            };
        for(const client of server.Clients.values())
        {
            client.socket.send(JSON.stringify(packet));
        }
    }
}