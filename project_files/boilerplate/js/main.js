// READ THIS!!!!!!!!!!!!

// DATA:
// spotify_artist_counts.csv -- counts the number of times an artist appeared in the spotify data (THEY MUST BE THE FIRST ARTIST OF A SONG, WE'RE ASSUMING THAT MEANS THEY ARE THE 'OWNER' OF THE SONG)
// tiktok_artist_counts.csv -- counts the number of times an artist appeared in the TikTok data (THEY MUST BE THE FIRST ARTIST OF A SONG, WE'RE ASSUMING THAT MEANS THEY ARE THE 'OWNER' OF THE SONG)
// spotify_clean.csv -- cleaned spotify dataset (the track names do not contain '(' or '-' for simplicity AND the artist_name is now just one artist instead of several for simplicity)
// tiktok_clean.csv -- cleaned TikTok dataset (the track names do not contain '(' or '-' for simplicity)
// TikTok_songs_2022.csv -- ORIGINAL TIKTOK DATASET, NOT COMPLETELY CLEANED BUT CAN STILL BE USED FOR SOME VISUALIZATIONS
// spotify_top_charts_22.csv -- ORIGINAL SPOTIFY DATASET, NOT COMPLETELY CLEANED BUT CAN STILL BE USED FOR SOME VISUALIZATIONS
// tiktok_spotify_merged -- the merged spotify and TikTok datasets (they were merged on track_name) and contain all of the columns of both datasets (not 100% clean... some songs are repeated because they are remixes, be careful with this data)
//


let bubbleChart;
let promises = [
    d3.csv("data/spotify_clean.csv").then(csv=> {

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
        console.log(csv);
        return csv;
    }),

    d3.csv("data/tiktok_clean.csv").then(csv=> {

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
        return csv;

        })
    ]

Promise.all(promises)
    .then(function (data) {
        console.log(data)
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function initMainPage(dataArray) {
   // bubbleChart = new BubbleGraph('bubblechart', dataArray[0], dataArray[1])
    pianoChart = new Piano('piano')
}
