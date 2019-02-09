const WebSocketServer = require('websocket').server
const Http = require('http')
const clients = []

const server = Http.createServer()
server.listen(1337, function() { 
    console.log((new Date()) + " Server is listening on port 1337")
})
  
// create the server
wsServer = new WebSocketServer({
    httpServer: server
});
  
// WebSocket server
wsServer.on('request', function(request) {
    const connection = request.accept(null, request.origin);
    clients.push(connection);

    connection.on('message', function(message) {
        clients.forEach(function(client) {
          client.send(message.utf8Data);
        });
    });
})