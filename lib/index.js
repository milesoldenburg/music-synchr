// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var scanner = require('./scanner');

// Start of file system
scanner.scan();

// Setup server
var port = 3000;

// Set server to listen on port 3000
http.listen(port, function(){
    console.log('server listening on port', port);
});

// Route static requests to public
app.use(express.static('public'));

// Returns json array of all .mp3 in the client ~/Music/music-synchr dir
app.get('/tracks', function(req, res){
    res.send(scanner.getTracks());
});

// Test HTTP streaming by picking the first track found
app.get('/streamtest', function(req, res){
    var fs = require('fs');
    var readStream = fs.createReadStream(scanner.getTrackPaths()[0]);
    readStream.pipe(res);
});

// When a browser makes a connection send them all the tracks we have on this node
io.on('connection', function(socket){
    socket.emit('tracklist', {
        'tracks' : scanner.getTracks()
    });
});
