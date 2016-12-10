'use strict';

var express = require('express');
var http = require('request');
var router = express.Router();
var data = require('../../components/services/data');

router.get('/:cloneName?/config/combined/:client/:platform/:language?', (req, res) => {
  var cloneName = req.params.cloneName;
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  var lang = req.params.language;
  if(!client || client == 'null' || client == 'undefined' || client == '') {
    res.status(400).json({
      error: 'missing client'
    });
    return;
  }
  if(!platform || platform == 'null' || platform == 'undefined' || platform == '') {
    res.status(400).json({
      error: 'missing platform'
    });
    return;
  }
  data.find().then(result => {
    var overrides = result[0] || {};
    var toRespond = null;
    if(cloneName && overrides[cloneName.toLowerCase()] && overrides[cloneName.toLowerCase()][platform]) {
      toRespond = overrides[cloneName.toLowerCase()][platform];
      if(lang) {
        res.json(toRespond);
      } else {
        res.json(createArray(toRespond));
      }
    } else if(overrides[client] && overrides[client][platform]) {
      toRespond = overrides[client][platform];
      if(lang) {
        res.json(toRespond);
      } else {
        res.json(createArray(toRespond));
      }
    } else {
      http.get(`https://msl.test2.mycardcare.com/config/combined/${client}/${platform}/en/`, (error, response, body) => {
        if(error || response.statusCode != 200) {
          console.error('Fail!', response);
          res.status(500).json({
            error
          });
        } else {
          var obj = JSON.parse(body);
          if(!lang) {
            obj = createArray(obj);
          }
          res.json(obj);
        }
      });
    }
  })
  .then(null, error => {
    res.status(500).json({
      error
    });
  });
});

router.delete('/:cloneName?/config/combined/:client/:platform/:language?', (req, res) => {
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  data.find().then(result => {
    var overrides = result[0] || {};
    var c = overrides[client];
    if(c) {
      delete c[platform];
      if(Object.keys(c).length == 0) {
        delete overrides[client];
      }
      return data.update(overrides)
        .then(() => {
          res.status(200).json({
            result: mapData(overrides)
          });
        });
    } else {
      res.status(404).JSON();
    }
  })
  .then(null, error => {
    res.status(500).json({
      error
    });
  });
});

router.get('/config', (req, res) => {
  let platform = req.query.platform;
  data.find().then(result => {
    var overrides = result[0] || {};
    var response = mapData(overrides);
    if(platform) {
      response = response.filter(i => i.platform == platform).map(i => i.client);
    }
    res.json({
      result: response
    });
  })
  .then(null, error => {
    res.status(500).json({
      error
    });
  });
});

router.post('/:cloneName?/config/combined/:client/:platform', (req, res) => {
  var cloneName = req.params.cloneName;
  var client = req.params.client.toLowerCase();
  var platform = req.params.platform.toLowerCase();
  var temp = null;
  var key = null;
  data.find().then(result => {
    var overrides = result[0] || {};
    if(cloneName) {
      key = cloneName.toLowerCase();
      temp = overrides[key] || {};
    } else {
      key = client;
      temp = overrides[client] || {};
    }
    temp[platform] = req.body.document;
    overrides[key] = temp;
    return data.update(overrides)
      .then(() => {
        res.status(200).json({
          result: mapData(overrides)
        });
      });
  })
  .then(null, error => {
    res.status(500).json({
      error
    });
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

function mapData(o) {
  var response = [];
  for(var prop in o) {
    if(prop.startsWith('_')) {
      continue;
    }
    var type = o[prop];
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
