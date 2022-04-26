var express = require('express');
var router = express.Router();

// get role list
router.get('/', function(req, res) {
  console.log('GET /role');
  var respBody = require('./role-list.json');
  res.json(respBody);
});

// add role
router.post('/', function(req, res) {
  console.log('POST /role');
  console.log(req.body);
	var respBody = require('./role-add.json');
  res.json(respBody);
});

// delete role
router.post('/status', function(req, res) {
  console.log('POST /role/status');
  const op = req.body.op;
  if (op == 'delete') {
    var respBody = require('./role-delete.json');
    res.json(respBody);
  } else {
    res.json({
      errorCode: -1,
      errorMessage: 'Unsupport op'
    });
  }
});

// get role
router.get('/:roleId', function(req, res) {
  const roleId = req.params.roleId;
  console.log('GET /role/' + roleId);
  var respBody = require('./role-data.json');
  res.json(respBody);
});

// edit role
router.post('/:roleId', function(req, res) {
	const roleId = req.params.roleId;
	console.log('POST /role/' + roleId);
	var respBody = require('./role-edit.json');
  res.json(respBody);
});


module.exports = router;
