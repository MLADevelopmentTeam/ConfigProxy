'use strict';

var express = require('express');
var http = require('request');
var router = express.Router();

var overrides = {};

router.get('/:cloneName?/config/combined/:client/:platform/:language?', (req, res) => {
  var cloneName = req.params.cloneName;
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  var lang = req.params.language;
  console.log(req.params);
  if(!client || client == 'null' || client == 'undefined' || client == '') {
    res.status(400).json({error: 'missing client'});
    return;
  }
  if(!platform || platform == 'null' || platform == 'undefined' || platform == '') {
    res.status(400).json({error: 'missing platform'});
    return;
  }
  var toRespond = null;
  if(cloneName && overrides[cloneName.toLowerCase()] && overrides[cloneName.toLowerCase()][platform]) {
    toRespond = overrides[cloneName.toLowerCase()][platform];
    if(lang) {
      res.json(toRespond);
    } else {
      res.json(createArray(toRespond));
    }
    return;
  }
  if(overrides[client] && overrides[client][platform]) {
    toRespond = overrides[client][platform];
    if(lang) {
      res.json(toRespond);
    } else {
      res.json(createArray(toRespond));
    }
    return;
  }
  http
    .get(`https://msl.test2.mycardcare.com/config/combined/${client}/${platform}/en/`, (error, response, body) => {
      if(error || response.statusCode != 200) {
        console.log('Fail!', response);
        res.status(500).json({error});
      } else {
        var obj = JSON.parse(body);
        if(!lang) {
          obj = createArray(obj);
        }
        res.json(obj);
      }
    });
});

router.delete('/:cloneName?/config/combined/:client/:platform/:language?', (req, res) => {
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  var c = overrides[client];
  if(c) {
    delete c[platform];
    if(Object.keys(c).length == 0) {
      delete overrides[client];
    }
    res.json({
      result: mapData()
    });
    return;
  }
  res.status(404).JSON();
});

router.get('/config', (req, res) => {
  var response = mapData();
  res.json({
    result: response
  });
});

router.post('/:cloneName?/config/combined/:client/:platform', (req, res) => {
  var cloneName = req.params.cloneName;
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  var temp = null;
  var key = null;
  if(cloneName) {
    key = cloneName.toLowerCase();
    temp = overrides[key] || {};
  } else {
    key = client;
    temp = overrides[client] || {};
  }
  temp[platform] = req.body.document;
  overrides[key] = temp;
  res.status(200).json({
    result: mapData()
  });
});

function createArray(response) {
  var message = [];
  for(var prop in response) {
    var type = response[prop];
    var inner = [];
    for(var p in type) {
      var o = {
        key: p,
        value: type[p]
      };
      inner.push(o);
    }
    message.push({
      key: prop,
      value: inner
    });
  }
  return message;
}

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
