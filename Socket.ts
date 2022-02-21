enum STATE{
    connected,
    disconnected
}
class Socket{
    constructor()
    {

    }
}

class ServerSocket extends Socket
{
    //
    public static instance : ServerSocket;

    //
    private state : STATE = STATE.disconnected;

    public Initialize() : boolean
    {
        if(this.state === STATE.connected)
            return false;
            
        try
        {
            return true;
        }
        catch
        {
            return false;
        }
    }
}