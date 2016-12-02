'use strict';

var express = require('express');
var http = require('request');
var router = express.Router();

var overrides = {};

router.get('/config/combined/:client/:platform/:language?', (req, res) => {
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  if(overrides[client] && overrides[client][platform]) {
    res.json(overrides[client][platform]);
    return;
  }
  http
    .get(`https://msl.test2.mycardcare.com/config/combined/${client}/${platform}/en/`, (error, response, body) => {
      if(error || response.statusCode != 200) {
        console.log('Fail!', response);
        res.status(500).json({error});
      } else {
        res.json(JSON.parse(body));
      }
    });
});

router.get('/config', (req, res) => {
  var response = mapData();
  res.json({
    result: response
  });
});

router.post('/config/combined/:client/:platform', (req, res) => {
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  var temp = overrides[client] || {
  };
  temp[platform] = req.body.document;
  overrides[client] = temp;
  res.status(200).json({
    result: mapData()
  });
});

function mapData() {
  var response = [];
  for(var prop in overrides) {
    var type = overrides[prop];
    for(var p in type) {
      response.push({
        client: prop,
        platform: p
      });
    }
  }
  return response;
}

module.exports = router;
