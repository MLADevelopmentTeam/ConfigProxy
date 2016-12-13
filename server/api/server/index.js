'use strict';

var url = require('url');
var express = require('express');
var http = require('request');
var DB = require('../../components/services/data').DB;
var data = new DB('template');
var ObjectId = require('mongodb').ObjectID;
var intercepts = new DB('intercept');

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
    data.find({uri}).then(result => {
      let template = result[0];
      if(!template) {
        template = {
          uri,
          request: req.body,
          response: null
        };
      }
      http(options, (error, response, body) => {
        if(error) {
          resp.status(500).json({});
        } else {
          template.response = body;
          let promise = null;
          if(template._id) {
            promise = data.update({id: template._id}, template);
          } else {
            promise = data.insert(template);
          }
          promise.then(null, er => {
            console.error(er);
          });
          resp.status(response.statusCode).json(body);
        }
      });
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
    var promise = null;
    if(req.body._id) {
      promise = data.update({id: req._id}, req.body);
    } else {
      promise = data.insert(req.body);
    }
    promise.then(() => findAll())
    .then(null, error => {
      console.error(error);
      res.status(500).json({ error });
    });
  });
  return router;
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
