// import Chart from 'chart.js/auto';


// I can change this variable to change all off my hash-derived colors :D
var colorScheme = ""

function barStacked100(context, inputData) {
    let brokenTimes = breakIntoHours(inputData);
    // console.log(brokenTimes);

    //console.log(md5('test'));


    // think i might just split every time into its own dataset


    let myDatasets = [];
    let hourLabels = [];

    // since list of objects, key and index are the same
    Object.keys(brokenTimes).forEach((hourIndex) => {
        // console.log(`Hour Index: ${hourIndex}`);

        let hour = Object.keys(brokenTimes[hourIndex])[0];
        //console.log(`Hour: ${hour}`);
        hourLabels.push(hour);
        
        // since list of objects, key and index are the same
        Object.keys(brokenTimes[hourIndex][hour]).forEach((urlIndex) => {

            let url = Object.keys(brokenTimes[hourIndex][hour][urlIndex])[0];

            brokenTimes[hourIndex][hour][urlIndex][url]["start_times"].forEach((start_time, timeIndex) => {
                end_time = brokenTimes[hourIndex][hour][urlIndex][url]["end_times"][timeIndex];
                
                let dataset = {};
                dataset.label = url;
                dataset.data = []
                dataset.data[hourIndex] = [start_time, end_time];
                dataset.borderWidth = 0;
                dataset.stack = 0;
                dataset.backgroundColor = [];
                let colors = md5.array(url + colorScheme).slice(0,3);
                dataset.backgroundColor[hourIndex] = `rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 0.5)`
                myDatasets.push(dataset);

            })


        });
    });

    // console.log(myDatasets)

    let chartData = {
        labels: hourLabels,
        datasets: myDatasets
    };

    // console.log("FIRST CHART DATA");
    // console.log(chartData);


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
            
                // tooltip: {
                //     callbacks: {
                //         label: function(context) {
                //             return millisecondsToString(context.parsed.y);
                //         }
                //     }
        
                // }
            }, 
            // scales: {
            //     y: {
            //         ticks: {
            //             callback: function(value) {
            //                 return millisecondsToString(value);
            //             }
            //         }
            //     }
            // } 
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


    // let chartData = {
    //     labels: , // local times
    //     datasets: myDatasets,
    // };



}

function barStacked(context, inputData) {
    //breakIntoHours();
    // calcTotalTimes();
    // or
    //calcTimesPerHour();
}


function barNormal(context, inputData) {
    // console.log(inputData);
    let totalTimes = calcTotalTimes(inputData);
    // console.log(totalTimes);

    // copied off the internet, should sort things
    /* SORT ALPHABETICALLY
    let sortedUrls = Object.keys(totalTimes).sort(function(a,b){return a[1]-b[1]});
    let sortedTimes = Object.values(totalTimes).sort(function(a,b){return a[1]-b[1]});
    
    console.log("sorted times");
    console.log(sortedTimes);
    console.log("sorted urls");
    console.log(sortedUrls);
    */

    // SORT NUMERICALLY
    let sortable = [];
    for (var url in totalTimes) {
        sortable.push([url, totalTimes[url]]);
    }
    sortable.sort(function(a,b){return b[1]-a[1]});
    // console.log("SORTABLE");
    // console.log(sortable);

    let sortedTimes = [];
    let sortedUrls = [];
    let sortedColors = [];
    for (var item in sortable) {
        sortedUrls.push(sortable[item][0]);
        sortedTimes.push(sortable[item][1]);

        let colors = md5.array(sortable[item][0] + colorScheme).slice(0,3);
        sortedColors.push(`rgba(${colors[0]}, ${colors[1]}, ${colors[2]}, 0.5)`);
    }

    // console.log("sorted times");
    // console.log(sortedTimes);
    // console.log("sorted urls");
    // console.log(sortedUrls);
    // console.log("sorted colors");
    // console.log(sortedColors);


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
                    display: true,
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
                y: {
                    ticks: {
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
function breakIntoHours(inputData) {
    //also need to break on the hour if a session stradles those times
    const d = new Date();
    let topHour = d.getHours() + 1;

    let topHourDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), topHour, 0, 0)

    let nextHourMilli = topHourDate.getTime();
    //console.log(nextHourMilli);
    //console.log(topHourDate.toString());


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

                if (start_time >= i && start_time <= i + 3600000) {
                    // start_time is in range
                    if (end_time >= i && end_time <= i + 3600000) {
                        // end_time is also in range. things should be simple here
                        //console.log(`Pushing Start Time: ${start_time - i}`);
                        //console.log(`Pushing End Time: ${end_time - i}`);
                        
                        urlTimesToAdd.start_times.push(start_time - i);
                        urlTimesToAdd.end_times.push(end_time - i);

                    } else {
                        // need to somehow split the timme segment
                        // maybe push the start_time and the end of the hour to the urlsByHour
                        // then push the end of the hour to the end time to the end of the input data

                        //console.log(`Pushing Start Time: ${start_time - i}`);
                        //console.log(`Pushing End Time: ${3600000}`);

                        urlTimesToAdd.start_times.push(start_time - i);
                        urlTimesToAdd.end_times.push(i+3600000 - i);

                        inputData[url]["start_times"].push(i+3600000);
                        inputData[url]["end_times"].push(end_time);

                    }
                } // else do nothing

            });

            // have no idea if this is right
            //console.log(urlTimesToAdd);
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



//returns list of hour objects, each with a list of objects and their total times per horu
//should call breakIntoHours then calcTotalTimes on each hour
function calcTimesPerHour(inputData) {

}




// data parameter?
function createBarChart(type, context, inputData) {
    console.log(`Creating ${type}`)
    switch (type) {
        case "stacked100":
            barStacked100(context, inputData);
            break;
        case "stacked":
            barStacked(context, inputData);
            break;
        case "normal":
            barNormal(context, inputData);
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
    //console.log("converted");

    if (totalHours > 0) {
        return (`${totalHours}:${minutes}:${seconds}`)
    }
    else {
        return (`${minutes}:${seconds}`)
    }
}