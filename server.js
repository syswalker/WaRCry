// HTTP Server:
const express = require("express");
const app = express();

// This will serve the static files in the /public folder on our server
app.use(express.static("public"));

const server = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + server.address().port);
});
// Websocket Server:
// We are using the external library 'ws' to set up the websockets on the server
// https://www.npmjs.com/package/ws
// In our code this is stored in the variable WebSocket.
var WebSocket = require("ws");

// Connect our Websocket server to our server variable to serve requests on the same port:
var wsServer = new WebSocket.Server({ server });

var users = 0;

// This function will send a message to all clients connected to the websocket:
function broadcast(data, userid) {
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(Buffer.from(data + "<br>"));      
    } else if(userid != "" && userid != "default" && userid != undefined && userid != "undefined"){
      client.send(Buffer.from(userid + ": " + data.toString() + "<br>"));
    } else {
      client.send(Buffer.from(data.toString() + "<br>"));
    }
  });
}
// This outer function will run each time the Websocket
// server connects to a new client:
wsServer.on("connection", ws => {
  // We will store the id for this connection in the id property.
  ws.id = "";
  users++;
  var con_clients = [];
  wsServer.clients.forEach(client => {
    con_clients.push(client.userid);
  });
  //broadcast(Buffer.from("<br>Connected users: " + users + " -- " + con_clients.join(", ") + "<br>"));
  
  // This function will run every time the server recieves a message with that client.
  ws.on("message", data => {
    // Broadcast the received message back to all clients.
    
    data = JSON.parse(data);
    
    if(data.init){
      ws.username = data.username;
      ws.usercolor = data.color;
      
      if(ws.usercolor == undefined){
        ws.usercolor = "#ffff00";
      }
      
      ws.userid = "<span style='color:" + ws.usercolor + "'>"+ ws.username + "</span>";
      broadcast(Buffer.from("<br>Connected users: " + users + " -- " + con_clients.join(", ") + ws.userid));
      broadcast(Buffer.from("User joined: " + ws.userid + "<br>"));
      console.log("Connected: " + ws.username + ", with key: " + ws.id);
      console.log("-----");
    } else { //handle sent messages
      console.log("Message Received: " + data.message);
      console.log("on key: " + ws.id);
      console.log("from user: " + ws.username);
      console.log("-----");
      
      let message = data.message;
      message = ws.userid + ": " + message;
      
      broadcast(Buffer.from(message), ws.userid);
    }
  });

  ws.on("close", () => {
    console.log("Disconnected: " + ws.username);
    console.log("-----");
    users--;
    
    if(ws.usercolor == undefined){
      ws.usercolor = "#ffff00";
    }
    
    broadcast(Buffer.from("<br>Connected users: " + users));
    broadcast(Buffer.from("User disconnected: " + ws.userid + "<br>"));
  });
});