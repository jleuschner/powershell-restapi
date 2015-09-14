var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ipfilter = require('express-ip-access-control');

var config = require('./config.json');

var app = express();
app.set('port',config.server.port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// IP Filter
app.use(ipfilter({mode: 'allow',allows: config.ipWhitelist, statusCode: 401, message:{'error': { 'name': 'UnauthorizedName', 'message': 'UnauthorizedMsg' }} }));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var PSCommandService = require('powershell-command-executor');
var StatefulProcessCommandProxy = require('stateful-process-command-proxy');
var CommandRegistry = require('./commandregistry');

var logger = function(severity,origin,message) {
	if (severity.toUpperCase() != "VERBOSE") {
		console.log("LOGGER: "+severity.toUpperCase() + ' ' + origin + ' ' + message);
	}
}

var CommandProxy = new StatefulProcessCommandProxy({
  name: "CommandProxy",
  max: config.powershell.max,
  min: config.powershell.min,
  idleTimeoutMS: config.powershell.idleTimeout,
	logFunction: logger,
  processCommand: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
  processArgs:    ['-Command','-'],
  processRetainMaxCmdHistory : 20,
  processInvalidateOnRegex : {
    'any':[],
    'stdout':[],
    'stderr':[{'regex':'.*error.*'}] // anything comes in on stderr, w/ "error"... invalidate it
  },
  processCwd : null,
  processEnvMap : null,
  processUid : null,
  processGid : null,
	initCommands : CommandRegistry.PSInitCommands(),
  validateFunction: function(processProxy) {
    return processProxy.isValid();
  },
  /*
	preDestroyCommands: CommandRegistry.PSDestroyCommands(),
	processCmdBlacklistRegex: CommandRegistry.BlacklistedCommands(),
	processCmdWhitelistRegex: CommandRegistry.WhitelistedCommands()
	autoInvalidationConfig: CommandRegistry..AutoInvalidationConfig(30000),
	*/
  });

var myLogFunction = function(severity,origin,message) {
	if (severity.toUpperCase() != "VERBOSE") {
		console.log("CS: "+severity.toUpperCase() + ' ' + origin + ' ' + message);
	}
}

var CommandService = new PSCommandService(CommandProxy,CommandRegistry.Commands,myLogFunction);

// GET command-service status
app.get('/command-service/status', function(req, res, next) {
    var status = CommandService.getStatus();
    res.send(status);
});

// GET command-service status
app.get('/command-proxy/status', function(req, res, next) {
    var status = CommandProxy.getStatus();
    res.send(status);
});

// GET commands
app.get('/command/:commandName?', function(req, res, next) {

  if (req.params.commandName) {
      res.send(CommandRegistry.Commands[req.params.commandName]);
  } else {
      res.send(CommandService.getAvailableCommands());
  }
});

// POST (generate command statement)
app.post('/command/generate/:commandName', function(req, res, next) {
    var command = CommandService.generateCommand(req.params.commandName,req.body);
    res.send({'command': command});
});

// POST (execute command)
app.post('/command/execute/:commandName', function(req, res, next) {
	//console.log("BODY: ");
	//console.log(JSON.stringify(req.body));
	CommandService.execute(req.params.commandName,JSON.parse(JSON.stringify(req.body)))
      .then(function(cmdResult) {
          res.send(cmdResult);
      }).catch(function(error) {
          res.send({'error': { 'name': error.name, 'message': error.message, 'stack':error.stack}});
      });
});


/* GET - console page */
app.get('/', function(req, res, next) {
  res.sendFile('console.html', { root: './public'});
});

// catch 404 and forward to error handler

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
		
        res.render('error', {
            message: err.message,
            error: err
        });
		/*
		res.send(err.message);
		*/
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//console.log(process.env);

module.exports = app;
