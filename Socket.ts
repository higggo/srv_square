
class Socket{
    constructor()
    {

    }
}

class ServerSocket extends Socket
{
    // //
    // public static instance : ServerSocket;
    // private wss : any;
    // constructor()
    // {
    //     super();
    //     if(!ServerSocket.instance)
    //     {
    //         ServerSocket.instance = new ServerSocket();
            
    //         const webSocket = require('ws')
    //         this.wss = new webSocket.Server({port: 8080}, ()=>{
    //             console.log('server started')
    //         })

    //     }
    // }
    // public Initialize() : boolean
    // {
    //     try
    //     {
    //         const webSocket = require('ws')
    //         const wss = new webSocket.Server({port: 8080}, ()=>{
    //             console.log('server started')
    //         })

    //         wss.on('connection', (ws : any)=>{
    //             ws.on('message', (data: string)=>{
    //                 //console.log('data received %o', data.toString())
    //                 const dataform = JSON.parse(data) as DataForm;
    //                 console.log('ph : ' + JSON.stringify(dataform.ph));
    //                 console.log('msg : ' + dataform.msg);
                    
    //                 ws.send(data.toString())
    //             })
    //         })

    //         wss.on('listening', ()=>{
    //             console.log('server is listening on port 8080')
    //         })
    //         return true;
    //     }
    //     catch(e)
    //     {
    //         console.log(e);
    //         return false;
    //     }
    // }
}