import Client, { CStatus } from "./Client";
import Game, {matrix} from "./Game";
import * as iType from "./iType"
import Timer from "./Timer";

export default class Match
{
    public players : Map<number, Client>;
    public game : Game;
    public turn : number;
    public nextTurn : number;
    // timer
    timer : Timer = new Timer();
    
    //public response = new Map<number,
    constructor()
    {
        this.players = new Map<number, Client>();
        this.game = new Game();
        this.turn = 0;
        this.nextTurn = 0;
    }

    init()
    {
        this.game.Init();
        this.players.forEach(player => {
            player.game_init();
        });

        this.timer.SetCallback(()=>{this.TimerEnd();}, ()=>{this.SendTimer();});
    }
    start()
    {

    }
    send_all(packet : string) : void
    {
        for (const player of this.players.values()) {
            player.socket.send(packet);
          }
    }
    send(client:Client, packet : string) : void
    {
        for (const player of this.players.values()) {
            if(client == player)
            {
                player.socket.send(packet);
                return;
            }
          }

          console.log("Not Exist That Client !");
          
          
    }
    all_ready() : boolean
    {
        let start : boolean = true;
        this.players.forEach(player => {
            if(!player.ready)
            {
                start = false;
            }
        });
        return start;
    }

    winner() : Client
    {
        let idx : number = 0;
        let point : number = 0;
        let client : any;


        for (const player of this.players.values()) {
            if(point == 0)
            {
                point = player.point;
                client = player;
                continue;
            }
            if(player.point > point)
            {
                point = player.point;
                client = player;
            }
          }
        return client;
    }
    other(client : Client) : Client
    {
        let other : Client;

        for (const player of this.players.values())
        {
            if(player.userIdx != client.userIdx)
                other = player;
        }
        return other!;
    }
    SaveAllPlayerRes(packetID : iType.PacketID , res : boolean)
    {
        for (const player of this.players.values())
        {
            player.packet_res.set(packetID, res);
        }
    }
    CheckAllPlayerRes(packetID : iType.PacketID) : boolean
    {
        let confirm : boolean = true;

        for (const player of this.players.values())
        {
            confirm = player.packet_res.get(packetID)!;
        }
        return confirm;
    }

    SetTimer(sec : number, exitCount : number, packetID : iType.PacketID)
    {
        this.timer.SetTimer(sec, exitCount, packetID);
    }

    TimerEnd()
    {
        console.log("TimerEnd");
        if(this.CheckAllPlayerRes(this.timer.packetID))
        {
            this.timer.Clear();
            return;
        }
        switch(this.timer.packetID)
        {
            case iType.PacketID.CS_GAME_ENTRY:
                let ph : iType.Head = {num : iType.PacketID.SC_GAME_ENTRY, size : 5};
                let result : iType.SC_Game_Entry = {ph : ph};
                this.send_all(JSON.stringify(result));
                break;
            default:
                break;
        }
    }

    SendTimer()
    {
        console.log("SendTimer");
        
        switch(this.timer.packetID)
        {
            case iType.PacketID.CS_GAME_ENTRY:
                let ph : iType.Head = {num : iType.PacketID.SC_GAME_TIMER, size : 5};
                let result : iType.SC_Game_Timer = {ph : ph, sec : this.timer.exitCount - this.timer.nowCount};
                this.send_all(JSON.stringify(result));
                break;
            default:
                break;
        }
    }
    
}