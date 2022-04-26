var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  console.log('GET /agent');
  console.log(req.body);
  res.json({
    errorCode:0,
    errorMessage:"Get agents success",
    data:{
      result:[
        {
          agentId:200,
          agentIp:"192.123.123.12",
          desc:"aaa"
        }
      ],
      amount:1
    }
  });
});

// add app agent
router.post('/', function(req, res) {
  console.log('POST /agent');
  console.log(req.body);
	var respBody = require('./app-agent-add.json');
  res.json(respBody);
});

// delete app agent
router.post('/status', function(req, res) {
  console.log('POST /agent/status');
  const op = req.body.op;
  if (op == 'delete') {
    var respBody = require('./app-agent-delete.json');
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
