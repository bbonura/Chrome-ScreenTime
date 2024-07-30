
// i don't think i should set the storage back at the end. might cause issues (prob not but who knows)
// if i wanna edit options, prob just .set({"options": options_var})
var storageCache = {};
const initStorageCache = chrome.storage.sync.get().then((items) => {
    Object.assign(storageCache, items); 
});

async function createChart() {
    await initStorageCache;

    let chart = document.getElementById("chart-canvas").getContext('2d'); 

    let urls = {};

    Object.keys(storageCache).forEach((key) => {
        if (key.slice(-1) === "/") {
            urls[key] = storageCache[key];
        }
    });

    console.log("Urls");
    console.log(urls);
    
    createBarChart("normal", chart, urls, {max: 8, labelAxes: false});
    
}

createChart();
