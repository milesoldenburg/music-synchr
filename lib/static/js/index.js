var fs = require('fs');
var ipc = require('ipc');
var _ = require('underscore');
var $ = require('./bower_components/jquery/dist/jquery.min');

var trackTemplate = _.template(fs.readFileSync(__dirname + '/html/tracks.html', 'utf8'));

ipc.on('tracklist', function(tracklist){
    console.log(tracklist);
    $('.page-container').html(trackTemplate({tracklist}));
});
