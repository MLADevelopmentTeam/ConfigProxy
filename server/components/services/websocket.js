'use strict';

var service = {
  socketServer: null,
  broadcast(filter, message) {
    this.socketServer.clients.forEach(function each(client) {
      if(!client.filter) {
        return;
      }
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
        console.log('received: %s', message);
        try {
          ws.filter = JSON.parse(message);
        } catch(error) {
          console.error(error);
        }
      });
      ws.on('close', () => {
        console.log('connection closed');
      });
    });
  }
};

module.exports = service;
