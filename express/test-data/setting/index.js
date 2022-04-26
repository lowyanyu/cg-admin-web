var express = require('express');
var router = express.Router();

// get setting list
router.get('/', function(req, res) {
  console.log('GET /setting');
  var respBody = require('./setting-list.json');
  res.json(respBody);
});

// edit user
router.post('/', function(req, res) {
  console.log('POST /setting');
  console.log(req.body);
  res.json({
    errorCode: 0,
    errorMessage: 'Update setting success',
    data: {}
  })
});

module.exports = router;
