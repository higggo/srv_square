"use strict";
(() => {
    console.log("Test Log");
})();
const webSocket = require('ws');
const wss = new webSocket.Server({ port: 8080 }, () => {
    console.log('server started');
});
wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        //console.log('data received %o', data.toString())
        const dataform = JSON.parse(data);
        console.log('ph : ' + JSON.stringify(dataform.ph));
        console.log('msg : ' + dataform.msg);
        ws.send(data.toString());
    });
});
wss.on('listening', () => {
    console.log('server is listening on port 8080');
});
