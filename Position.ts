import { IndexType } from "typescript";
import * as iType from "./iType"

export default class Position
{
    x : number = 0;
    y : number = 0;
    z : number = 0;

    Get() : iType.Position
    {
        let pos : iType.Position = {x : this.x, y : this.y, z : this.z};
        return pos;
    }

    Set(pos : iType.Position)
    {
        this.x = pos.x;
        this.y = pos.y;
        this.z = pos.z;
    }
    
}