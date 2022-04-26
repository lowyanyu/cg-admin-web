var express = require('express');
var router = express.Router();

// get role list
router.get('/role', function(req, res) {
  console.log('GET /role');
  var respBody = require('./role.json');
  res.json(respBody);
});

// get api permissions by appId
router.get('/permission/:appId', function(req, res) {
  console.log('GET /permission BY appId');
  var respBody = require('../application/permission-list.json');
  res.json(respBody);
});

// get permission list
router.get('/permission', function(req, res) {
  console.log('GET /permission?type=api');
	const type = req.query.type;
  console.log('type = [' + type + ']');
  if (type === 'web') {
    var respBody = require('../role/permission-list.json');
  } else if (type === 'api') {
    var respBody = require('../application/permission-list.json');
  }

  res.json(respBody);
});

module.exports = router;
