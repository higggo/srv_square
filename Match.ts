import Client, { CStatus } from "./Client";
import Game, {matrix} from "./Game";
import * as iType from "./iType"
import Timer from "./Timer";

interface RoundPlayers
{
    winner : number;
    looser : number;
}
interface MatchRecord
{
    // winner idx
    R1 : RoundPlayers;
    R2 : RoundPlayers;
    R3 : RoundPlayers;

    End : boolean;
    Round : number;
    Winner : number;

}

export default class Match
{
    public matchIdx : number;
    public players : Map<number, Client>;
    public game : Game;
    public turn : number;

    public match_record : Array<MatchRecord>;
    // timer
    timer : Timer = new Timer();
    
    //public response = new Map<number,
    constructor(matchIdx : number)
    {
        this.matchIdx = matchIdx;
        this.players = new Map<number, Client>();
        this.game = new Game();
        this.turn = 0;
        this.match_record = new Array<MatchRecord>();
    }

    RoomInit()
    {
        this.players.forEach(player => {
            player.point = 0;
            player.packet_res.clear();
        });

        this.timer.SetCallback(()=>{this.TimerEnd();}, ()=>{this.SendTimer();});
    }
    MatchInit()
    {
        this.players.forEach(player => {
        });

    }
    RoundInit()
    {
        this.game.Init();

        this.players.forEach(player => {
            player.point = 0;
        });
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
    /*
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
    */
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
            if( player.packet_res.get(packetID)! == false)
            {
                confirm = player.packet_res.get(packetID)!;
                break;
            }
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
    RecordUpdate(winner : number, looser : number)
    {
        // 단판으로 변경
        let lastIdx = this.match_record.length-1;
        lastIdx = lastIdx < 0 ? 0 : lastIdx;
        this.match_record[lastIdx].R3 = {winner : winner, looser : looser};
        this.match_record[lastIdx].End = true;
        this.match_record[lastIdx].Winner = winner;
        
        /*
        // 3판 2선
        if(this.match_record[lastIdx].Round == 1)
        {            
            this.match_record[lastIdx].R1 = {winner : winner, looser : looser};
            this.match_record[lastIdx].Round++;
        }
        else if(this.match_record[lastIdx].Round == 2)
        {
            this.match_record[lastIdx].R2 = {winner : winner, looser : looser};
            if(this.match_record[lastIdx].R1.winner == winner)
            {
                this.match_record[lastIdx].End = true;
                this.match_record[lastIdx].Winner = winner;
            }
            else
            {
                this.match_record[lastIdx].Round++;
            }
        }
        else if(this.match_record[lastIdx].Round == 3)
        {
            this.match_record[lastIdx].R3 = {winner : winner, looser : looser};
            this.match_record[lastIdx].End = true;
            this.match_record[lastIdx].Winner = winner;
        }
        */
    }

    CurrentMatchRecord() : {match : MatchRecord, match_count : number}
    {
        const lastIdx = this.match_record.length-1;
        let record : MatchRecord = this.match_record[lastIdx];
        let cnt = lastIdx + 1;
        return {match : record, match_count : cnt};
    }
}