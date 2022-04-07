import Client, { CStatus } from "./Client";
export default class Match
{
    public players : Array<Client>;
    constructor()
    {
        this.players = new Array<Client>();
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
}