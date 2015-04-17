// Dependencies
var path = require('path');
var glob = require('glob');
var id3 = require('id3js');
var async = require('async');
var _ = require('underscore');
var ip = require('ip');

var tracks = [];
var paths = [];

function scan(_callback){
    console.log('scanning for .mp3s on host');

    // Glob all .mp3s
    glob(path.join(process.env.HOME, 'Music/music-synchr', '**/*.mp3'), function(er, files){
        paths = files;

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
                    console.log("ip.address is: ", ip.address());
                    return callback(null, _.extend(tags, {
                        'path' : new Buffer(file).toString('base64'),
                        'address' : ip.address()
                    }));
                }
            });
        }, function(err, results){
            if (err) {
                console.log('Error occured when tagging track');
                console.log(err);
            } else {
                // Return array of tagged tracks
                tracks = results;

                // Callback if needed
                if (_callback !== undefined && _callback !== null) {
                    _callback();
                }
            }
        });
    });
}

function getTracks(){
    return tracks;
}

function getTrackPaths(){
    return paths;
}

exports.scan = scan;
exports.getTracks = getTracks;
exports.getTrackPaths = getTrackPaths;
