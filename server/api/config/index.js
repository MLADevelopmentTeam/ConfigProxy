'use strict';

var express = require('express');
var http = require('request');
var router = express.Router();

router.get('/:client/:platform', (req, res) => {
  var client = req.params.client;
  var platform = req.params.platform;
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

module.exports = router;
