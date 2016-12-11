'use strict';
var service = {
  socketServer: null,
  broadcast(filter, message) {
    this.socketServer.clients.forEach(function each(client) {
      if(filter.client == client.filter.client && filter.platform == client.filter.platform) {
        client.send(message);
      }
    });
  },
  setup(wss) {
    this.socketServer = wss;
    wss.on('connection', ws => {
      console.log('connection opened');
      ws.on('message', message => {
        ws.filter = JSON.parse(message);
        console.log('received: %s', message);
      });
      ws.on('close', () => {
        console.log('connection closed');
      });
    });
  }
};

module.exports = service;
