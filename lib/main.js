// Dependencies
var app = require('app');
var BrowserWindow = require('browser-window');
var express = require('express');
var ip = require('ip');
var webapp = express();
var http = require('http').Server(webapp);
var scanner = require('./scanner');
var globals = require('./globals');

// Report crashes to our server
require('crash-reporter').start();

var mainWindow = null;

// Quit when all windows are closed
app.on('window-all-closed', function(){
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function(){
    // Create the browser window.
    mainWindow = new BrowserWindow({width : 1000, height : 600});

    // Scan file system for tracks and send list to window when ready
    scanner.scan(function(){
        console.log('scan complete');

        mainWindow.webContents.on('did-finish-load', function(){
            mainWindow.webContents.send('tracklist', scanner.getTracks());
        });
    });

    // Set http server to listen on port
    http.listen(globals.port, function(){
        console.log('http server listening on', ip.address(), 'port', globals.port);
    });

    // Returns json array of all .mp3 in the client ~/Music/music-synchr dir
    webapp.get('/tracks', function(req, res){
        res.send(scanner.getTracks());
    });

    // Test HTTP streaming by picking the first track found
    webapp.get('/streamtest', function(req, res){
        var fs = require('fs');
        var readStream = fs.createReadStream(scanner.getTrackPaths()[0]);
        readStream.pipe(res);
    });

    // Streams the requested track over HTTP
    // The trackpath parameter must be base64 encoded
    webapp.get('/stream/:trackpath', function(req, res){
        var fs = require('fs');

        // Deocde path
        var trackpath = new Buffer(req.params.trackpath, 'base64').toString();
        console.log('User ' + req.connection.remoteAddress + ' requested track: ' + trackpath);
        // Read file from path and stream back
        var readStream = fs.createReadStream(trackpath);
        readStream.pipe(res);
    });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/static/index.html');

    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function(){
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
