define(['jquery'], function($){

    var port = 3000;
    var isPlaying = false;

    var listen = function(){
        // When a track play button is clicked
        $(document).on('click', 'table.tracklist i', function(event){
            event.preventDefault();

            var player = $('#audio-player').get(0);

            // Set the status
            if ($(event.currentTarget).parents('tr').hasClass('now-playing')) { // Pushed play/pause on running track
                if (isPlaying) { // Pause if currently playing
                    player.pause();
                    isPlaying = false;
                    $('.player-controls button.play-control i').removeClass('fa-pause').addClass('fa-play');
                } else { // Play if currently paused
                    player.play();
                    isPlaying = true;
                    $('.player-controls button.play-control i').removeClass('fa-play').addClass('fa-pause');
                }
            } else { // Pushed play on a new track
                // Update icon to show that this track is currently playing
                $('table.tracklist tr').removeClass('info now-playing');
                $('table.tracklist i').removeClass('fa-play-circle').addClass('fa-play-circle-o');
                $(event.currentTarget).removeClass('fa-play-circle-o').addClass('fa-play-circle').parents('tr').addClass('info now-playing');
                $('.player-controls button.play-control i').removeClass('fa-play').addClass('fa-pause');

                // Get track data
                var address = $(event.currentTarget).attr('data-address');
                var track = $(event.currentTarget).attr('data-track');
                var path = 'http://' + address + ':' + port + '/stream/' + track;

                // Load track into player and play
                $('#audio-player source').attr('src', path);
                player.load();
                player.play();
                isPlaying = true;
            }
        });
    };

    return {
        'listen' : listen
    };

});
