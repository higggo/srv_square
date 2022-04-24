
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
    pingCount : number = 0;
    pingTimer : NodeJS.Timer | undefined;
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
    
    OnDisconnected()
    {
        this.connect = false;
        if(this.pingTimer != undefined) clearInterval(this.pingTimer);
        if(this.socket.readyState === this.socket.OPEN || this.socket.readyState === this.socket.CONNECTING){ 
            this.socket.close();
        }
    }
    OnConnected()
    {
        this.connect = true;
        this.pingCount = 0;
    }
}