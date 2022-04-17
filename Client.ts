
import { textChangeRangeIsUnchanged } from "typescript";
import Match from "./Match";
import * as iType from "./iType"
export enum CStatus
{
    Idle,
    Searching,
    Playing
}
export default class Client
{
    userIdx : number;
    socket : any;
    status : CStatus;
    match : Match | null;
    ready : boolean
    point : number;
    connect : boolean;
    packet_res = new Map<iType.PacketID, boolean>();
    
    constructor(userIdx : number, socket : any)
    {
        this.userIdx = userIdx;
        this.socket = socket;
        this.status = CStatus.Idle;

        this.match = null;
        this.ready = false;
        this.point = 0;
        this.connect = false;
    }
    public game_init()
    {
        this.ready = false;
        this.point = 0;

        this.packet_res.clear();
    }

    OnDisconnected()
    {
        this.connect = false;
    }
    OnConnected()
    {
        this.connect = true;
    }
}