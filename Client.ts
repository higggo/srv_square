
import { textChangeRangeIsUnchanged } from "typescript";
import Match from "./Match";
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
    
    constructor(userIdx : number, socket : any)
    {
        this.userIdx = userIdx;
        this.socket = socket;
        this.status = CStatus.Idle;

        this.match = null;
        this.ready = false;
        this.point = 0;
    }
    public game_init()
    {
        this.ready = false;
        this.point = 0;
    }
}