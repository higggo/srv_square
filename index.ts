(()=>{console.log("Test Log");
})();
interface Head
{
    num : number
    size : Number

}
interface DataForm
{
    ph : Head
    msg : string
}
const webSocket = require('ws')
const wss = new webSocket.Server({port: 8080}, ()=>{
    console.log('server started')
})

wss.on('connection', (ws : any)=>{
    ws.on('message', (data: string)=>{
        //console.log('data received %o', data.toString())
        const dataform = JSON.parse(data) as DataForm;
        console.log('ph : ' + JSON.stringify(dataform.ph));
        console.log('msg : ' + dataform.msg);
        
        ws.send(data.toString())
    })
})

wss.on('listening', ()=>{
    console.log('server is listening on port 8080')
})