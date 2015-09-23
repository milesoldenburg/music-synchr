var fs = require('fs');
var ipc = require('ipc');
var _ = require('underscore');
var $ = require('./bower_components/jquery/dist/jquery.min');

var trackTemplate = _.template(fs.readFileSync(__dirname + '/html/tracks.html', 'utf8'));
var Player = require('./js/player');

$(document).ready(function(){
    Player.init(null, 3000);
});

// Render template when a tracklist update is received
ipc.on('tracklist', function(_tracklist){
    $(document).ready(function() {
        $('.page-container').html(trackTemplate({
            tracklist: _tracklist
        }));
    });
});
