'use strict';

var url = require('url');
var express = require('express');
var http = require('request');
var DB = require('../../components/services/data').DB;
var data = new DB('template');
var ObjectId = require('mongodb').ObjectID;
var intercepts = new DB('intercept');
var q = require('q');

const baseUrl = '/axes103/rest';
const originalUrl = 'https://retailuat.alldata.net/axes103/rest';

export default function() {
  var router = express.Router();
  router.all(`${baseUrl}/:servicex/:service/:func`, (req, resp) => {
    const servicex = req.params.servicex;
    const service = req.params.service;
    const func = req.params.func;
    const uri = `${originalUrl}/${servicex}/${service}/${func}`;
    let options = {
      method: req.method.toUpperCase(),
      headers: req.headers,
      body: req.body,
      rejectUnauthorized: false,
      json: true,
      uri
    };
    let request = clone(req.body);
    delete request.mediation.clientHeader.timeStamp;
    var templatePromise = data.find({uri});
    var interceptPromise = intercepts.find({uri, active: true});
    q.all([templatePromise, interceptPromise])
    .then(values => {
      let template = values[0][0];
      if(!template) {
        template = {
          uri,
          request,
          response: null
        };
      }
      let intercept = values[1][0];
      http(options, (error, response, body) => {
        if(error) {
          resp.status(500).json({});
        } else {
          if(!intercept) {
            let bodyClone = clone(body);
            delete bodyClone.response.sessionID;
            template.response = bodyClone;
            data.save(template)
            .then(null, er => {
              console.error(er);
            });
          } else {
            let interceptResponse = JSON.parse(intercept.response);
            interceptResponse.response.sessionID = body.response.sessionID;
            body = interceptResponse;
          }
          resp.status(response.statusCode).json(body);
        }
      });
    })
    .then(null, error => {
      console.error(error);
      resp.status(500).json({ error });
    });
  });
  router.get(`${baseUrl}/templates`, (req, res) => {
    findAll(res)
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  router.get(`${baseUrl}/templates/:id`, (req, res) => {
    data.find({_id: new ObjectId(req.params.id)})
    .then(result => {
      res.json(result[0]);
    })
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  router.post(`${baseUrl}/templates`, (req, res) => {
    data.save(req.body)
    .then(() => findAll())
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  router.delete(`${baseUrl}/templates`, (req, res) => {
    data.delete(req.body._id)
    .then(() => findAll())
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  router.get(`${baseUrl}/intercept`, (req, res) => {
    const id = req.query.id;
    const uri = req.query.uri;
    let filter = null;
    if(id) {
      filter = {_id: new ObjectId(req.params.id)};
    } else if(uri) {
      filter = {uri};
    }
    intercepts.find(filter)
    .then(result => {
      res.json(result);
    })
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  router.post(`${baseUrl}/intercept`, (req, res) => {
    if(req.body.active) {
      intercepts.update({uri: req.body.uri}, {active: false});
    }
    intercepts.save(req.body)
    .then(() => intercepts.find({uri: req.body.uri}))
    .then(result => {
      res.json(result);
    })
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  router.delete(`${baseUrl}/intercept/:id`, (req, res) => {
    const id = req.params.id;
    const uri = req.query.uri;
    intercepts.delete(id)
    .then(() => intercepts.find({uri}))
    .then(result => {
      res.json(result);
    })
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  return router;
}
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function findAll(res) {
  return data.find().then(result => {
    res.json(result.map(i => {
      return {
        name: url.parse(i.uri).pathname.split('/')[5],
        uri: i.uri,
        id: i._id
      };
    }));
  });
}
