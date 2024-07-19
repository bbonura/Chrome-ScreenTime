const colorThief = new ColorThief();

// i don't think i should set the storage back at the end. might cause issues (prob not but who knows)
// if i wanna edit options, prob just .set({"options": options_var})
var storageCache = {};
const initStorageCache = chrome.storage.sync.get().then((items) => {
    Object.assign(storageCache, items); 
});

async function fillTable() {

    await initStorageCache;

    var table = document.getElementById("timeTable");

    Object.keys(storageCache).forEach((key, index) => {
        if (key.slice(-1) != "/") {
            return; // effectively "continue" in this case
        }

        let row = table.insertRow(1);
        
        let urlCell         = row.insertCell(0);
        let startTimesCell  = row.insertCell(1);
        let endTimesCell    = row.insertCell(2);
        let elapsedTimesCell = row.insertCell(3);
        let totalElapsedTimesCell = row.insertCell(4);

        urlCell.innerHTML = key;

        let start_times = storageCache[key]["start_times"];
        let end_times = storageCache[key]["end_times"];
        
        let elapsedTimes = [];
        end_times.forEach((end_time, index) => {
            elapsedTimes.push(end_time - start_times[index]);
        });

        startTimesCell.innerHTML    = start_times.toString().split(",").join(", ");
        endTimesCell.innerHTML      = end_times.toString().split(",").join(", ");
        elapsedTimesCell.innerHTML  = elapsedTimes.toString().split(",").join(", ");

        let sum = 0;
        elapsedTimes.forEach((time) => {
            sum += time;
        });

        totalElapsedTimesCell.innerHTML = millisecondsToString(sum);
    });
}

async function createCharts() {
    await initStorageCache;

    let stacked100_context = document.getElementById("stackedBarChart100%").getContext('2d'); 
    let stacked_context = document.getElementById("stackedBarChart").getContext('2d'); 
    let normal_context = document.getElementById("barChart").getContext('2d'); 

    let urls = {};

    Object.keys(storageCache).forEach((key) => {
        if (key.slice(-1) === "/") {
            urls[key] = storageCache[key];
        }
    });

    console.log("Urls");
    console.log(urls);


    // gives a color to each url based on its favicon. 
    // if it fails to find a favicon, it defaults to first 3 bytes of the md5 hash of the array lol
    let colors = {};
    Object.keys(urls).forEach(async (url, index) => {
        try {
            //colors[url] = [];
            colors[url] = await getFaviconColor(url);
        } catch (e) {
            console.log(e);
            console.log(`SETTING URL ${url} TO MD5 FOR COLOR`)
            colors[url] = md5.array(url).slice(0,3);
        }
    });

    //make it wait for all the colors to be finished
    // let still_empty = true;
    // let iterations = 0;
    // while (still_empty) {
    //     still_empty = false;
    //     Object.keys(colors).forEach((url, index) => {
    //         console.log(colors[url].length);
    //         if (colors[url].length != 3) {
    //             still_empty = true;
    //             console.log(colors[url].length);
    //         }
    //     });
    //     if (iterations = 1000000000000) {
    //         still_empty = false;
    //     }
    //     iterations += 1;
    // }

    console.log("-------------COLORS v1------------------")
    console.log(colors);

    createBarChart("stacked100", stacked100_context, urls, colors);
    createBarChart("stacked",    stacked_context,    urls, colors);
    createBarChart("normal",     normal_context,     urls, colors);
    
    // console.log("-------------COLORS v2------------------")
    // console.log(colors);

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  


function start() {

    let d = new Date();
    let t = d.toTimeString().split(' ')
    t[0] = ""
    let timezone = t.join(" ")
    document.getElementById("timezone").innerHTML=timezone;
  
    // let website = "https://www.apple.com/"
    // var img = new Image();
    // // img.src = "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=" + website + "&size=16";
    // //img.src = "http://www.google.com/s2/favicons?domain=" + website;
    
    // // this seems to work, but idk if the image is loading or if ColorThief is just messed up
    // img.src = "http://favicon.yandex.net/favicon/" + website;
    
    // // img.src = "https://icons.duckduckgo.com/ip2/" + website;

    // console.log(img);

    // img.crossOrigin = "Anonymous";
    // // //]getColor(img.src);

    // // const img = document.createElement('img');
    // // img.src = faviconURL("https://www.google.com") 

    // console.log(colorThief);
    // let color;
    // if (img.complete) {
    //     color = colorThief.getColor(img);
    // } else {
    //     console.log(' it was not complete .. .. .. .')
    //     img.addEventListener('load', function() {
    //         color = colorThief.getColor(img);
    //         console.log(" this happened tho");
    //         // make sure to put code in here to ensure that the img loaded.
    //     });
    // }
    // console.log("--------Color--------");
    // console.log(color);
    
    // //colorThief.getColor(img);

}

// function update(startTime) {
//     const d = new Date();
//     let time = d.getTime()

//     let strTime = d.toLocaleTimeString()
//     document.getElementById("currentTime").innerHTML=strTime;

//     let elapsed = (time - startTime)
//     let strElapsed = millisecondsToString(elapsed)
//     document.getElementById("elapsedTime").innerHTML=strElapsed;

//     //console.log(startTime)
// }

function millisecondsToString(milli) {
    let totalSeconds = Math.floor(milli/1000)
    let seconds = totalSeconds % 60
    let totalMinutes = Math.floor(totalSeconds / 60)
    let minutes = totalMinutes % 60
    let totalHours = Math.floor(totalMinutes / 60)
    
    if (seconds < 10) {
        seconds = "0" + seconds
    }
    if (minutes < 10) {
        minutes = "0" + minutes
    }

    if (totalHours > 0) {
        return (`${totalHours}:${minutes}:${seconds}`)
    }
    else {
        return (`${minutes}:${seconds}`)
    }
}



function getFaviconColor(url) {

    console.log(`finding fav of ${url} `);

    var img = new Image();

    img.src = "http://favicon.yandex.net/favicon/" + url;

    //console.log(img);

    img.crossOrigin = "Anonymous";

    let color;
    if (img.complete) {
        color = colorThief.getColor(img);
        //colorCache[url] = color;
        //console.log("returning color");
        //console.log(color);
        return color;
    } else {
        img.addEventListener('load', function() {
            color = colorThief.getColor(img);
            //colorCache[url] = color;
            //console.log("returning color after wait");
            //console.log(color);
            return color;
        });
    }
}




start()
fillTable();
createCharts();












// chart.js for bar charts?
// chart.js for STARCKED BAR CHARTS??? https://www.chartjs.org/docs/latest/samples/bar/stacked.html
// or plotly but its less known https://plotly.com/javascript/bar-charts/#stacked-bar-chart 

// I want three bar charts:
//   - first stacked 100%
//      - 24 bars, 24 hours
//      - shows exactly where your time was spent in the day
//      - trim bars on the sides for hours unspent?
//      - need floating bars, then stack them: https://www.chartjs.org/docs/latest/samples/bar/floating.html
//  - second stacked
//      - Apple style
//      - 24 bars, 24 hours
//      - Shows how much of your time went to each website each hour
//  - third normal
//      - Bar for each website
//      - basically ranking of how much time was spent in each
//      - also should include expandable list of times (like Apple, i know)

// for the stacked ones:
// select color by averaging the icon
//   - maybe use mode not mean
// make seperating line?


// then i'm done? NO
// store data to draw charts 2 and 3 for previous days (total time per website per hour per day)
// pile data that's over a week old into a set of huge counters 
//  - might need to do it in minutes not milliseconds
//  - only store if I got over a minute in that session (will work automatically with above implementation of mod%)

// maybe also store old data locally cause local is so much bigger than sync
// also I'll have a week to (accidentally/unknowingly) download the data to other devices
// but idk.