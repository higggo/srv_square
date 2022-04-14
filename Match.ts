import Client, { CStatus } from "./Client";
import Game, {matrix} from "./Game";
import * as iType from "./iType"

export default class Match
{
    public players : Array<Client>;
    public game : Game;
    public turn : number;
    public nextTurn : number;
    
    //public response = new Map<number,
    constructor()
    {
        this.players = new Array<Client>();
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
    }
    start()
    {

    }
    send_all(packet : string) : void
    {
        this.players[0].socket.send(packet);
        this.players[1].socket.send(packet);
    }
    send(client:Client, packet : string) : void
    {
        if(client == this.players[0])
            this.players[0].socket.send(packet);

        if(client == this.players[1])
            this.players[1].socket.send(packet);
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

        for(var i = 0; i < this.players.length; i++)
        {
            if(point == 0)
            {
                point = this.players[i].point;
                client = this.players[i];
                continue;
            }

            if(this.players[i].point > point)
            {
                point = this.players[i].point;
                client = this.players[i];
            }
        }

        return client;
    }
    other(client : Client) : Client | null
    {
        let player : Client | null = null;
        for(var i=0; i < this.players.length; i++)
        {
            if(this.players[i].userIdx != client.userIdx)
                player = this.players[i];
        }
        return player;
    }
    SaveAllPlayerRes(packetID : iType.PacketID , res : boolean)
    {
        for(var i=0; i < this.players.length; i++)
        {
            this.players[i].packet_res.set(packetID, res);
        }
    }
    CheckAllPlayerRes(packetID : iType.PacketID) : boolean
    {
        let confirm : boolean = true;
        for(var i=0; i < this.players.length; i++)
        {
            confirm = this.players[i].packet_res.get(packetID)!;
        }
        return confirm;
    }
}