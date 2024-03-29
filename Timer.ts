import * as iType from "./iType"

export default class Timer
{
    nowCount : number = 0;
    exitCount : number = 0;
    timer : NodeJS.Timer | undefined;
    packetID: iType.PacketID = iType.PacketID.CS_PING;
    finalFunc : Function = function() { console.log("aaaaaaa");
    };
    intervalFunc : Function = function() { console.log("bbbbbb");
    };
    

    Clear()
    {
        this.nowCount = 0;
        this.exitCount = 0;
        if(this.timer != undefined)
            clearInterval(this.timer);
    }

    SetTimer(sec : number, exitCount : number, packetID : iType.PacketID)
    {
        this.nowCount = 0;
        this.exitCount = exitCount;
        this.packetID = packetID;
        this.timer = setInterval(()=>{this.IntervalCallback();}, sec);
    }
    SetCallback(finalFunc : Function, intervalFunc : Function)
    {
        this.finalFunc = finalFunc;
        this.intervalFunc = intervalFunc;
    }
    IntervalCallback()
    {
        console.log("1");
        
        this.intervalFunc.call(this);
        console.log("2");
        this.intervalFunc;
        console.log("3");
        this.intervalFunc();
        console.log("4");
        console.log("timer count " + this.nowCount);
        
        this.nowCount++;
        if(this.nowCount == this.exitCount)
        {
            if(this.timer != undefined)
                clearInterval(this.timer);
            this.finalFunc.call(this);
        }
    }
}