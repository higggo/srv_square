
export enum CStatus
{
    Idle,
    Searching,
    Playing
}
export default class Client
{
    userIdx : Number;
    socket : any;
    status : CStatus;
    constructor(userIdx : Number, socket : any)
    {
        this.userIdx = userIdx;
        this.socket = socket;
        this.status = CStatus.Idle;


    }
}