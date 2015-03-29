// Dependencies
var path = require('path');
var glob = require('glob');
var id3 = require('id3js');
var async = require('async');

var tracks = [];

function scan(){
    console.log('scanning for .mp3s on host');

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
                tracks = results;
            }
        });
    });
}

function getTracks(){
    return tracks;
}

exports.scan = scan;
exports.getTracks = getTracks;
