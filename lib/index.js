// Dependencies
var express = require('express');
var app = express();
var http = require('http').Server(app);

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
    console.log('scanning for .mp3s on host');

    // Dependencies
    var path = require('path');
    var glob = require('glob');
    var id3 = require('id3js');
    var async = require('async');

    // Glob all .mp3s
    glob(path.join(process.env.HOME, 'Music/music-synchr', '**/*.mp3'), function(er, files){
        // Map list of file paths by using id3js
        async.map(files, function(file, callback){
            // Get tag info from file
            id3({
                'file' : file,
                'type' : id3.OPEN_LOCAL
            }, function(err, tags){
                if (err) {
                    return callback(err);
                } else {
                    return callback(null, tags);
                }
            });
        }, function(err, results){
            if (err) {
                console.log('Error occured when tagging track');
                console.log(err);
            } else {
                // Return array of tagged tracks
                res.send(results);
            }
        });
    });
});
