// READ THIS!!!!!!!!!!!!

// DATA:
// spotify_artist_counts.csv -- counts the number of times an artist appeared in the spotify data (THEY MUST BE THE FIRST ARTIST OF A SONG, WE'RE ASSUMING THAT MEANS THEY ARE THE 'OWNER' OF THE SONG)
// tiktok_artist_counts.csv -- counts the number of times an artist appeared in the TikTok data (THEY MUST BE THE FIRST ARTIST OF A SONG, WE'RE ASSUMING THAT MEANS THEY ARE THE 'OWNER' OF THE SONG)
// spotify_clean.csv -- cleaned spotify dataset (the track names do not contain '(' or '-' for simplicity AND the artist_name is now just one artist instead of several for simplicity)
// tiktok_clean.csv -- cleaned TikTok dataset (the track names do not contain '(' or '-' for simplicity)
// TikTok_songs_2022.csv -- ORIGINAL TIKTOK DATASET, NOT COMPLETELY CLEANED BUT CAN STILL BE USED FOR SOME VISUALIZATIONS
// spotify_top_charts_22.csv -- ORIGINAL SPOTIFY DATASET, NOT COMPLETELY CLEANED BUT CAN STILL BE USED FOR SOME VISUALIZATIONS
// tiktok_spotify_merged -- the merged spotify and TikTok datasets (they were merged on track_name) and contain all of the columns of both datasets (not 100% clean... some songs are repeated because they are remixes, be careful with this data)
// tiktok_keys -- how many songs on tiktok are in each key (count, percentage)
// spotify_keys -- how many songs on spotify are in each key (count, percentage)
// tiktok_user_stats -- tiktok download statistics via https://www.statista.com/statistics/1377008/tiktok-worldwide-downloads-quarterly/
// common_artists -- dataset that has all of the artists that are in both the spotify and tiktok datasets. also has the count of how many songs of theirs are in the spotify dataset



// https://www.codespeedy.com/display-html-element-after-n-seconds/

let bubbleChart;
let pianoChart;
let spotHistogram;
let tiktokHistogram;
let TikscatterChart;
let SpotscatterChart;
let promises = [
    // LOADING IN THE DATA
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
     //   console.log(csv);
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
            d.loudness = +d.loudness
            d.mode = +d.mode;
            d.speechiness = +d.speechiness;
            d.tempo = +d.tempo;
            d.time_signature = +d.time_signature;
            d.track_pop = +d.track_pop;
            d.valence = +d.valence;
        });
    //    console.log(csv);
        return csv;

    }),

    d3.csv("data/tiktok_spotify_merged.csv").then(csv=> {
    //    console.log("merged", csv)
        return csv;
        }),

    d3.csv("data/spotify_keys.csv").then(csv=> {

        csv.forEach(function(d){
            d.key = +d.key;
            d.count = +d.count;
            d.percentage = Math.round(+d.percentage);
        });
    //    console.log(csv);
        return csv;
    }),

    d3.csv("data/tiktok_keys.csv").then(csv=> {

        csv.forEach(function(d){
            d.key = +d.key;
            d.count = +d.count;
            d.percentage = Math.round(+d.percentage);
        });
    //    console.log(csv);
        return csv;
    }),

    d3.csv("data/tiktok_user_stats.csv").then(csv => {
        csv.forEach(function(d) {
            let time = d['Time'];
            let value = parseFloat(d['Value']);
        //    console.log("Time:", time);
        //    console.log("Value:", value);
        });
        return csv;
    }),

    d3.csv("data/common_artists.csv").then(csv => {
        csv.forEach(function(d) {
            d.count = + d.count;
        });
        return csv;
    }),

    d3.csv("data/tiktok_artist_counts.csv").then(csv => {
        csv.forEach(function(d) {
            d.count = + d.count;
        });
        return csv;
    }),

    d3.csv("data/spotify_artist_counts.csv").then(csv => {
        csv.forEach(function(d) {
            d.count = + d.count;
        });
        return csv;
    })


]

Promise.all(promises)
    .then(function (data) {
       // console.log(data)
        initMainPage(data)
    })
    .catch(function (err) {
      //  console.log(err)
    });

function initMainPage(dataArray) {

    bubbleChart = new BubbleGraph('bubblechart', dataArray[0], dataArray[1], dataArray[7], dataArray[8])
    spotifyradarChart = new RadarChart('spotifyradarchart', dataArray[0], 'spotify')
    tiktokradarChart = new RadarChart('tiktokradarchart', dataArray[1], 'tiktok')
    pianoChart = new Piano('piano', dataArray[3], dataArray[4])
    faceplot = new FacePlot('faceplot', dataArray[0], dataArray[1])
    //barChart = new BarChart('barchart', dataArray[5])

    tiktokHistogram = new Histogram("tiktokHist", dataArray[1], "Tiktok")
    spotHistogram = new Histogram("spotHist",  dataArray[0], "Spotify")

    TikscatterChart = new ScatterChart("tikScatterDiv", dataArray[1] , "Tiktok")
    console.log(dataArray[0])
    SpotscatterChart = new ScatterChart("spotScatterDiv",dataArray[0], "Spotify")
}

/*let carousel = new bootstrap.Carousel(document.getElementById('stateCarousel'), {interval: false})
function switchView() {
    carousel.next();
    document.getElementById('switchView').innerHTML === 'tiktok view' ? document.getElementById('switchView').innerHTML = 'spotify view' : document.getElementById('switchView').innerHTML = 'tiktok view';
}
*/

function categoryChange() {
    //let selectedCategory = document.getElementById('categorySelector').value;
    if (tiktokHistogram ) {
        tiktokHistogram.updateVis();
    } else {
        console.error('Vis object is undefined.');
    }
    tiktokHistogram.updateVis()
    spotHistogram.updateVis()
}


function XcategoryChange() {

    TikscatterChart.updateVis()
    SpotscatterChart.updateVis()
}

function YcategoryChange() {

    TikscatterChart.updateVis()
    SpotscatterChart.updateVis()
}