var express = require('express');
var router = express.Router();

// get user list
router.get('/', function(req, res) {
  console.log('GET /user');
  var respBody = require('./user-list.json');
  res.json(respBody);
});

// get user by userId
router.get('/:userId', function(req, res) {
	const userId = req.params.userId;
  console.log('GET /user/' + userId);
  var respBody = require('./user-data.json');
  res.json(respBody);
});

// add user
router.post('/', function(req, res) {
  console.log('POST /user');
  console.log(req.body);
	var respBody = require('./user-add.json');
  res.json(respBody);
});

// edit user
router.post('/:userId', function(req, res) {
	const userId = req.params.userId;
	console.log('POST /user/' + userId);
	var respBody = require('./user-edit.json');
  res.json(respBody);
});

// delete user
router.post('/status', function(req, res) {
  console.log('POST /user/status');
  const op = req.body.op;
  if (op == 'delete') {
    var respBody = require('./user-delete.json');
    res.status(400);
    res.json(respBody);
  } else {
    res.json({
      errorCode: -1,
      errorMessage: 'Unsupport op'
    });
  }
});

module.exports = router;
