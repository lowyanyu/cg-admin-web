const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const e = require('express');

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());

router.use(cors());

router.all('/', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// login
router.post('/management/login', function(req, res) {
	console.log('POST /login');
	const account = req.body.account;
	const pwd = req.body.pwd;
	console.log('User[' + account + '] login!');
	var respBody = require('../test-data/login.json');
  res.json(respBody);
});

// refresh
const newAccessToken = 'test.accessToken.123';
router.post('/management/refresh', function(req, res) {
	console.log('POST /refresh');
	const accessToken = req.body.accessToken;
	const refreshToken = req.body.refreshToken;
	console.log('accessToken = [' + accessToken + ']');
	console.log('refreshToken = [' + refreshToken + ']');
	var respBody = require('../test-data/refresh.json');
  res.json(respBody);
});

// ----------------------------------------------------- Config
router.get('/management/config', function(req, res) {
  console.log('GET / config');
  var respBody = require('../test-data/config/config.json');
  res.json(respBody);
});

// ----------------------------------------------------- User
var user = require('../test-data/user/index');
router.use('/management/user', user);

// ----------------------------------------------------- Role
var role = require('../test-data/role/index');
router.use('/management/role', role);

// ----------------------------------------------------- permission
// get role permission list
router.get('/management/permission', function(req, res) {
  console.log('GET /permission?type=web');
	const type = req.query.type;
	console.log('type = [' + type + ']');
  var respBody = require('../test-data/role/permission-list.json');
  res.json(respBody);
});

// ----------------------------------------------------- metadata
var metadata = require('../test-data/metadata/index');
router.use('/management/metadata', metadata);

// ----------------------------------------------------- application
var application = require('../test-data/application/index');
router.use('/management/application', application);

// download api key
router.get('/management/application/apikey/:appId', function(req, res) {
  const appId = req.params.appId;
  console.log('DOWNLOAD /apikey/' + appId);
  res.json({
    errorCode: 0,
    errorMessage: 'Get application apikey success : ',
    data: {
      apikey: ''
    }
  });
});

// application token
router.get('/management/token/:appId', function(req, res) {
  const appId = req.params.appId;
  console.log('GET /token/' + appId);
  var respBody = require('../test-data/application/app-token.json');
  res.json(respBody);
});

router.post('/management/token/status', function(req, res) {
  console.log('POST /token/status');
  const op = req.body.op;
  if (op == 'delete') {
    var respBody = require('../test-data/application/app-token-delete.json');
    res.status(400);
    res.json(respBody);
  } else {
    res.json({
      errorCode: -1,
      errorMessage: 'Unsupport op'
    });
  }
});

// ----------------------------------------------------- Agent
var agent = require('../test-data/agent/index');
router.use('/management/agent', agent);

// ----------------------------------------------------- Setting
var setting = require('../test-data/setting/index');
router.use('/management/setting', setting);

// ----------------------------------------------------- Manager Log
// get manager log list
router.get('/management/managerLog', function(req, res) {
  console.log('GET /managerLog');
	const pageIndex = req.query.pageIndex;
	const pageSize = req.query.pageSize;
	console.log('pageIndex = [' + pageIndex + ']');
	console.log('pageSize = [' + pageSize + ']');
  var respBody = require('../test-data/log/manager-log-list.json');
  res.json(respBody);
});

// ----------------------------------------------------- Service Log
// get service log list
router.get('/management/serviceLog', function(req, res) {
  console.log('GET /serviceLog');
	const pageIndex = req.query.pageIndex;
	const pageSize = req.query.pageSize;
	console.log('pageIndex = [' + pageIndex + ']');
	console.log('pageSize = [' + pageSize + ']');
  var respBody = require('../test-data/log/service-log-list.json');
  res.json(respBody);
});

// get service log by id
router.get('/management/serviceLog/:logId', function(req, res) {
  console.log('GET /serviceLog by id');
  console.log(req.query);
  var respBody = require('../test-data/log/service-log-by-id.json');
  res.json(respBody);
});

// ----------------------------------------------------- Debug Log
// get debug log list
router.get('/management/debugLog', function(req, res) {
  console.log('GET /debugLog');
	const pageIndex = req.query.pageIndex;
  const pageSize = req.query.pageSize;
  console.log(req.query);
	console.log('pageIndex = [' + pageIndex + ']');
	console.log('pageSize = [' + pageSize + ']');
  var respBody = require('../test-data/log/debug-log-list.json');
  res.json(respBody);
});

// download debug log file
router.get('/management/debugLog/file', function(req, res) {
  console.log('DOWNLOAD /debugLog file');
  console.log(req.query);
  var respBody = require('../test-data/log/debug-log-download.json');
  res.json(respBody);
})

module.exports = router;
