// import Chart from 'chart.js/auto';

var colorStore;

// I can change this variable to change all off my hash-derived colors :D
var colorScheme = ""

function barStacked100(context, inputData) {
    let brokenTimes = breakIntoHours(inputData);

    // just split every time into its own dataset

    let myDatasets = [];
    let hourLabels = [];

    brokenTimes.forEach((hourObj, hourIndex) => {

        let hour = Object.keys(hourObj)[0];
        hourLabels.push(hour);
        
        hourObj[hour].forEach((urlObj, urlIndex) => {

            let url = Object.keys(urlObj)[0];

            urlObj[url]["start_times"].forEach((start_time, timeIndex) => {
                end_time = urlObj[url]["end_times"][timeIndex];
                
                let dataset = {};
                dataset.label = url;
                dataset.data = []
                dataset.data[hourIndex] = [start_time, end_time];
                dataset.borderWidth = 0;
                dataset.stack = 0;
                dataset.backgroundColor = [];

                let color = md5.array(url + colorScheme).slice(0,3);

                dataset.backgroundColor[hourIndex] = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`
                myDatasets.push(dataset);

            })


        });
    });


    let chartData = {
        labels: hourLabels,
        datasets: myDatasets
    };

    let config = {
        type: "bar",
        data: chartData,
        options: {
            //responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    //position: 'top',
                },
                title: {
                    display: true,
                    text: 'First Bar Chart'
                },
            
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let hourOffset = Number(context.label.split(":")[0]) * 3600000;
                            return `${millisecondsToString(context.parsed._custom.start+hourOffset)} - ${millisecondsToString(context.parsed._custom.end+hourOffset)}`;
                        },
                        title: function(context) {
                            return context[0].dataset.label;
                        }
                    }
        
                }
            }, 
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: false,
                    max: 3600000,
                    ticks: {
                        callback: function(value) {
                            return millisecondsToString(value);
                        },
                        stepSize: 300000,
                    }
                }
            }
    
        },
        
    };

    const chart1 = new Chart(context, config);

}


function totalTimeSort(a, b) {
    let av = Object.values(a)[0];
    let bv = Object.values(b)[0];
    return bv-av;
}

function objToArr(obj) {
    let arr = [];
    Object.keys(obj).forEach((key) => {
        arr.push( {[key]: obj[key]} )
    });
    return arr;
}


function barStacked(context, inputData) {
    let hours = breakIntoHours(inputData);


    let totalTimesPerHour = [];

    for (var hour in hours) {
        let urlList = hours[hour][ Object.keys(hours[hour])[0] ];
        let urls = {};
        for (var index in urlList) {
            urls[Object.keys(urlList[index])[0]] = urlList[index][Object.keys(urlList[index])[0]];
        } 

        totalTimesPerHour.push( { [Object.keys(hours[hour])[0]] : calcTotalTimes(urls)} );
        
    }

    // need to rearrange to url: [timehour0, timehour1, etc];
    // actually I just need to do the thing from chart 1, but sort the urls by total time (for each hour) before adding them 

    let myDatasets = [];
    let hourLabels = [];

    totalTimesPerHour.forEach((hourObj, hourIndex) => {

        let hour = Object.keys(hourObj)[0];
        hourLabels.push(hour);

        let urlList = objToArr(hourObj[hour]).sort( totalTimeSort );

        urlList.forEach((urlObj, urlIndex) => {

            let url = Object.keys(urlObj)[0];

            let dataset = {};
            dataset.label = url;
            dataset.data = []
            dataset.data[hourIndex] = urlObj[url];
            dataset.borderWidth = 0;
            dataset.stack = 0;
            dataset.backgroundColor = [];

            let color = md5.array(url + colorScheme).slice(0,3);

            dataset.backgroundColor[hourIndex] = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`
            myDatasets.push(dataset);



        });
    });

    
    let chartData = {
        labels: hourLabels,
        datasets: myDatasets
    };

    let config = {
        type: "bar",
        data: chartData,
        options: {
            //responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    //position: 'top',
                },
                title: {
                    display: true,
                    text: 'Second Bar Chart'
                },
            
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return millisecondsToString(context.parsed.y);
                        },
                        title: function(context) {
                            return context[0].dataset.label;
                        }
                    }
        
                }
            }, 
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return millisecondsToString(value);
                        },
                        stepSize: 300000,
                    }
                }
            }
    
        },
        
    };

    const chart2 = new Chart(context, config);


}

                                    // here option works as max num bars to display and labelAxes
function barNormal(context, inputData, {max, labelAxes} = {max: 0, labelAxes: true}) {
    let totalTimes = calcTotalTimes(inputData);

    /* SORT ALPHABETICALLY (could be useful later)
    let sortedUrls = Object.keys(totalTimes).sort(function(a,b){return a[1]-b[1]});
    let sortedTimes = Object.values(totalTimes).sort(function(a,b){return a[1]-b[1]});
    */

    // SORT NUMERICALLY
    let sortable = [];
    for (var url in totalTimes) {
        sortable.push([url, totalTimes[url]]);
    }
    sortable.sort(function(a,b){return b[1]-a[1]});

    let sortedTimes = [];
    let sortedUrls = [];
    let sortedColors = [];
    for (var item in sortable) {
        sortedUrls.push(sortable[item][0]);
        sortedTimes.push(sortable[item][1]);

        let colors = md5.array(sortable[item][0] + colorScheme).slice(0,3);
        sortedColors.push(`rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 0.5)`);
    }

    if (max != 0) {
        sortedTimes = sortedTimes.slice(0, max);
        sortedUrls = sortedUrls.slice(0, max);
        sortedColors = sortedColors.slice(0, max);        
    }



    let chartData = {
        labels: sortedUrls,
        datasets: [{
            label: "chart 3",
            data: sortedTimes,
            borderWidth: 1,
            backgroundColor: sortedColors,
        }]
    };

    let config = {
        type: "bar",
        data: chartData,
        options: {
            //responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    //position: 'top',
                },
                title: {
                    display: labelAxes,
                    text: 'Third Bar Chart'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return millisecondsToString(context.parsed.y);
                        }
                    }
        
                }
            }, 
            scales: {
                x: {
                    ticks: {
                        display: labelAxes,
                    }
                },
                y: {
                    ticks: {
                        display: labelAxes,
                        callback: function(value) {
                            return millisecondsToString(value);
                        }
                    }
                }
            } 
        },
        
    };

    const chart3 = new Chart(context, config);

}




/// I canNOt believe that this worked after only like the 4th try

// all take list of urls

//returns list of hour objects. Each contains urls and time ranges for that hour
//times returned range from 0 (start of hour) to 3600000 (end of hour)
function breakIntoHours(input) {

    let inputData = Object.assign({}, input); 


    //also need to break on the hour if a session stradles those times
    const d = new Date();
    let topHour = d.getHours() + 1;

    let topHourDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), topHour, 0, 0)

    let nextHourMilli = topHourDate.getTime();

    // 3600000 ms / h
    // nextHourMilli - milliseconds from epoch to the next full hour

    let urlsByHour = [];
    let urlsByHourIndex = 0;
                                    //  * 23 ?
    for (let i = nextHourMilli - (3600000 * 24); i < nextHourMilli; i += 3600000) {
        // 'i' is the starting time for each hour

        let hourDate = new Date(i);

        urlsByHour.push( { [hourDate.toLocaleTimeString()] : [] } );

        Object.keys(inputData).forEach((url, urlIndex) => {

            let urlTimesToAdd = { "start_times": [], "end_times": [] } ;

            inputData[url]["end_times"].forEach((end_time, index) => {
                let start_time = inputData[url]["start_times"][index];

                
                if (start_time >= i && start_time < i + 3600000) {
                    // start_time is in range

                
                    if (end_time > i && end_time < i + 3600000) {
                        // end_time is also in range. things should be simple here
                        
                        urlTimesToAdd.start_times.push(start_time - i);
                        urlTimesToAdd.end_times.push(end_time - i);

                    } else {
                        // need to somehow split the timme segment
                        // maybe push the start_time and the end of the hour to the urlsByHour
                        // then push the end of the hour to the end time to the end of the input data

                        urlTimesToAdd.start_times.push(start_time - i);
                        urlTimesToAdd.end_times.push(3600000);

                        inputData[url]["start_times"].push(i+3600000);
                        inputData[url]["end_times"].push(end_time);

                    }
                } // else do nothing

            });

            // have no idea if this is right
            urlsByHour[urlsByHourIndex][hourDate.toLocaleTimeString()].push({[url]: urlTimesToAdd});
            //urlsByHour[urlsByHourIndex][hourDate.toLocaleTimeString()][urlIndex][url] = urlTimesToAdd;

        });

        urlsByHourIndex++;

    }

    return urlsByHour;

}

//returns object of parameters in the form of "url": totalTime
function calcTotalTimes(inputData) {   

    // should probably check if its in the past day or not
    let totalTimes = {};

    Object.keys(inputData).forEach((key) => {
        let time = 0;

        inputData[key]["end_times"].forEach((end_time, index) => {
            time += end_time - inputData[key]["start_times"][index];
        });
        totalTimes[key] = time;

    });

    return totalTimes;
}
 
                                            // can be max bars, etc. i guess. kinda dumb solution
function createBarChart(type, context, input, option) {
    
    // make copy (cause there is no way to pass an obj by value (easily))
    let inputData = {};
    Object.keys(input).forEach((url) => {
        inputData[url] = {start_times: [], end_times: []};
        input[url].start_times.forEach((start_time) => {
            inputData[url].start_times.push(start_time);
        });
        input[url].end_times.forEach((end_time) => {
            inputData[url].end_times.push(end_time);
        });
    });
    

    console.log(`Creating ${type}`)
    switch (type) {
        case "stacked100":
            barStacked100(context, inputData);
            break;
        case "stacked":
            barStacked(context, inputData);
            break;
        case "normal":
            barNormal(context, inputData, option);
            break;
        default:
            console.log("Bar chart case not found.");
            return;
    }
}



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