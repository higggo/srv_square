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
    public match_idx : number;
    constructor(userIdx : Number, socket : any)
    {
        this.userIdx = userIdx;
        this.socket = socket;
        this.status = CStatus.Idle;

        this.match_idx = 0;
    }

}