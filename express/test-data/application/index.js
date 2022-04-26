var express = require('express');
var router = express.Router();

// get app list
router.get('/', function(req, res) {
  console.log('GET /application');
  var respBody = require('./app-list.json');
  res.json(respBody);
});

// get app by appId
router.get('/:appId', function(req, res) {
	const appId = req.params.appId;
  console.log('GET /application/' + appId);
  var respBody = require('./app-info.json');
  res.json(respBody);
});

// get app auth key by appId
router.get('/:appId/key', function(req, res) {
	const appId = req.params.appId;
  console.log('GET /application/' + appId);
  var respBody = require('./app-key.json');
  res.json(respBody);
});

// add app
router.post('/', function(req, res) {
  console.log('POST /application');
  console.log(req.body);
	var respBody = require('./app-add.json');
  res.json(respBody);
});

// edit app
router.post('/:appId', function(req, res) {
	const appId = req.params.appId;
	console.log('POST /application/' + appId);
	var respBody = require('./app-edit.json');
  res.json(respBody);
});

// delete app
router.post('/status', function(req, res) {
  console.log('POST /application/status');
  const op = req.body.op;
  if (op == 'delete') {
    var respBody = require('./app-delete.json');
    res.status(400);
    res.json(respBody);
  } else {
    res.json({
      errorCode: -1,
      errorMessage: 'Unsupport op'
    });
  }
});

// import app file
router.post('/importFile', function(req, res) {
  console.log('POST /importFile/');
  res.json({
    errorCode: 0,
    errorMessage: 'Import application success.',
    data: {
      importFile: ''
    }
  })
})

// export app file
router.get('/:appId/exportFile', function(req, res) {
  const appId = req.params.appId;
	console.log('GET /exportFile/' + appId);
  res.json({
    errorCode: 0,
    errorMessage: 'Export application success.',
    data: {
      exportFile: ''
    }
  })
})

module.exports = router;
