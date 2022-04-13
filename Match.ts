import Client, { CStatus } from "./Client";
import Game, {matrix} from "./Game";
export default class Match
{
    public players : Array<Client>;
    public game : Game;
    public turn : number;
    constructor()
    {
        this.players = new Array<Client>();
        this.game = new Game();
        this.turn = 0;
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

    winner() : number
    {
        let idx : number = 0;
        let point : number = 0;

        for(var i = 0; i < this.players.length; i++)
        {
            if(point == 0)
            {
                point = this.players[i].point;
                idx = this.players[i].userIdx;
                continue;
            }

            if(this.players[i].point > point)
            {
                point = this.players[i].point;
                idx = this.players[i].userIdx;
            }
        }

        return idx;
    }
}