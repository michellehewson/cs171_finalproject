function loadSpotifyData() {
    d3.csv("data/spotify_top_charts_22.csv").then(csv=> {

        csv.forEach(function(d){
            // numerical values
            d.acousticness = +d.acousticness;
            d.danceability = +d.danceability;
            d.duration_ms = +d.duration_ms;
            d.energy = +d.energy;
            d.instrumentalness = +d.instrumentalness;
            d.key = +d.key;
            d.liveness = +d.liveness;
            d.loudness = +d.loudness;
            d.mode = +d.mode;
            d.peak_rank = +d.peak_rank;
            d.speechiness = +d.speechiness;
            d.tempo = +d.tempo;
            d.time_signature = +d.time_signature;
            d.weeks_on_chart = +d.weeks_on_chart;
        });
        //console.log(csv);
    });
}
function loadTikTokdata() {
    d3.csv("data/TikTok_songs_2022 2.csv").then(csv=> {

        csv.forEach(function(d){
            // numerical values
            d.acousticness = +d.acousticness;
            d.danceability = +d.danceability;
            d.duration_ms = +d.duration_ms;
            d.energy = +d.energy;
            d.instrumentalness = +d.instrumentalness;
            d.key = +d.key;
            d.liveness = +d.liveness;
            d.loudness = +d.loudness;
            d.mode = +d.mode;
            d.speechiness = +d.speechiness;
            d.tempo = +d.tempo;
            d.time_signature = +d.time_signature;
            d.track_pop = +d.track_pop;
            d.valence = +d.valence;
        });
        //console.log(csv);
    });
}


loadSpotifyData()
loadTikTokdata()

