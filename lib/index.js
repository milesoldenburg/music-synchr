// Setup server
var express = require('express');
var app = express();
var http = require('http').Server(app);

// Globals
var port = 3000;

// Set server to listen on port 3000
http.listen(port, function(){
    console.log('server listening on port', port);
});

// Route static requests to public
app.use(express.static('public'));

// Returns json array of all .mp3 in the client ~/Music/music-synchr dir
app.get('/tracks', function(req, res){
    console.log('scanning for .mp3s on host');
    
    // Dependencies
    var path = require('path');
    var glob = require('glob');
    
    // Glob all .mp3s and return as json array
    glob(path.join(process.env.HOME, 'Music/music-synchr', '**/*.mp3'), function(er, files){
        res.send(files);
    });
});
