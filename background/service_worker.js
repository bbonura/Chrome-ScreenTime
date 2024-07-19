// HOLY FUCKING SHIT I SPENT LIKE A FULL DAY TRYING TO GET THIS TO WORK
// ONLY TO REALIZE I USED A - INSTEAD OF A _ IN THE MANIFEST.JSON AAAAA

console.log("SW LOADED")

//importScripts("color-thief.umd.js")

//var colorThief = new ColorThief();
//var canvas = new OffscreenCanvas(64, 64);


// get storage.sync  -  see data structure at EOF
var urlStorageCache = {};
const initStorageCache = chrome.storage.sync.get().then((items) => {
    Object.assign(urlStorageCache, items); 
});


// logic for whether to add en end time, not to, remove the start time, or remove the object as a whole
// w - website (string name)
function endTimeLogic(w, time) {
    let start_times_length = urlStorageCache[w]["start_times"].length;

    // TODO - remove
    // console.log(`Time open: ${time - urlStorageCache[w]["start_times"][start_times_length - 1]}`)

    // check if end time was already added
    if ( start_times_length == urlStorageCache[w]["end_times"].length ) {
        console.log(`End time already set for previous website: ${w}`);

    // check if tab was open for less than a second. remove that start time if so (basically ignore that whole session)
    } else if ( time - urlStorageCache[w]["start_times"][start_times_length - 1] < 1000) {
        
        // if there was only one entry in start times, (which were gonna pop anyway), delete the url from storage
        if (start_times_length == 1) {
            delete urlStorageCache[w];
            // need to also delete it in storage itself, cuz the write only writesitems in storage cache, 
            // so if they ain't there, they won't be overwritten/deleted 
            chrome.storage.sync.remove([w]);
        } else {
            urlStorageCache[w]["start_times"].pop();
        }

    // add the end time if all checks come back clean
    } else {
        urlStorageCache[w]["end_times"].push(time);
    }

}


// general function for updating data when url is changed or tab is selected
function tabChanged() {

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async ([tab]) => {
        if (tab.url == "") {
            return
        }

        // website is the url before the page stuff (ex. a google search shortens to "https://www.google.com/")
        let website;
        try {
            website = (tab.url).match(".*?://.*?/")[0];
        } catch {
            console.log(`Invalid URL: ${tab.url}`)
        }
        // console.log(`Website: ${website}`);

        await initStorageCache;

        // here check if website changed (should add to this)
        if (website == urlStorageCache.last_website) {
            console.log("Website not changed");
            return;
        } else {
            console.log(`New Website: ${website}`)
        }
        let prev_website = urlStorageCache.last_website
        urlStorageCache.last_website = website

        let time = Date.now();

        // ignores logic if its new tab and set last_website to ""
        // other wise do start_time logic as normal
        if (website == "chrome://newtab/") {
            urlStorageCache.last_website = "";
        } else {
            console.log(urlStorageCache)

            // create website object if it does not exist
            urlStorageCache[website] = urlStorageCache[website] || {};

            // create start_times / end_times list if it does not exist
            urlStorageCache[website]["start_times"] = urlStorageCache[website]["start_times"] || [];
            urlStorageCache[website]["end_times"] = urlStorageCache[website]["end_times"] || [];

            urlStorageCache[website]["start_times"].push(time);

            
            // FAVICON TIME
            // i don't think theyll work
            
            // CANT DO THIS BECAUSE new Image() is the same as document.createElement("img")
            // and since service workers can't access the DOM, this doesn't work

            // also offscreen canvas is annoyinh

            // also, mainly, websites just won't let me copy the image

            // instead just pick a random color for each website?
            // bro wouldn't it be funny to hash each website into a hex holdup

        }
        
        try {
            endTimeLogic(prev_website, time);
        } catch (error) {
            console.log(`previous website does not exist yet:  ${error}`)
        }

        console.log(urlStorageCache)

        chrome.storage.sync.set(urlStorageCache).then(() => {
            console.log(`Updated stored urls. Prev website: ${prev_website}. Current website: ${website}`);
        });
          
    });
}


// function for adding an end time to the last website in the event where no new website is loaded
// (ex. switching away from Google Chrome to a different app)
async function addEndTime() {
    // unlikely that this is necessary but good to be cautious... i think
    await initStorageCache;

    if (urlStorageCache.last_website == "") {
        return;
    }
    let prev_website = urlStorageCache.last_website;
    urlStorageCache.last_website = "";

    let time = Date.now()

    urlStorageCache[prev_website]["end_times"] = urlStorageCache[prev_website]["end_times"] || [];

    endTimeLogic(prev_website, time);

    chrome.storage.sync.set(urlStorageCache).then(() => {
        console.log("Updated stored urls");
    });

}


// TODO - see if I can just put 'tab' in the paranthesis then pass that on as a parameter
//        instead of doing the whole async query call

// tab updates (ex. url changes)
chrome.tabs.onUpdated.addListener(() => {
    console.log("Tab updated");
    tabChanged()
});

// tab selected/changed
chrome.tabs.onActivated.addListener(() => {
    console.log("Tab activated");
    tabChanged()
});

// tab selected but not yet changed to? (may not be necessary)
// chrome.tabs.onHighlighted.addListener(() => {
//     console.log("Tab highlighted")
//     tabChanged()
// });

// window focus change
chrome.windows.onFocusChanged.addListener((result) => {
    if (result == chrome.windows.WINDOW_ID_NONE) {
        console.log("chrome unfocused")
        addEndTime()
    } else {
        console.log("chrome focused")
        tabChanged()
    }
});

// chrome starts up (not needed cause so many changes happen when you open chrome)
// instead use this time to fix the failure of not putting an end time on the last tab when Chrome was closed
chrome.runtime.onStartup.addListener(() => {

    chrome.sessions.getRecentlyClosed(async (sessions) => {

        await initStorageCache;

        if (urlStorageCache.last_website == "") {
            return;
        }
        let prev_website = urlStorageCache.last_website;
        urlStorageCache.last_website = "";

        // lastModified returns seconds since epoch not milliseconds
        let time = sessions[0].lastModified * 1000;

        urlStorageCache[prev_website]["end_times"] = urlStorageCache[prev_website]["end_times"] || [];

        endTimeLogic(prev_website, time);

        chrome.storage.sync.set(urlStorageCache).then(() => {
            console.log("Updated stored urls");
        });

    });
    
});

chrome.system.display.onDisplayChanged.addListener(() => {
    let info = chrome.system.display.getInfo();
    console.log("-------------------------- INFO --------------------------");
    console.log(info);
});

// chrome.idle.onStateChanged.addListener(() => {
//     console.log("---------------- IDLE STATE CHANGED HALLEUHUAH -----------")
// })


// copied from the internet
chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener( function (state) {
    console.log("---------------- IDLE STATE CHANGED HALLEUHUAH -----------")
});
// chrome.system.display.onDisplayChanged() - might be able to check when the laptop screen is off,
//                                            and add an end_time then. Also need to check for on


// NEW TAB IS JUST BROKEN, AND I DON"T REALLY NEED IT, SO I THINK IM JUST GONNA TRASH IT

// TODO - warn somewhere that I only look at website up for more than a second

// Done - figure out a way to find the time the browser closed then on the next startup i take that value 
//        and make it the latest end_time for the last website
// chrome.sessions has a "lastModified" property which is the time the browser was closed (in sec ab-epoch)
// chrome.session.getRecentlyClosed() --> Session[] sessions
// sessions[0].lastModified --> exactly the time I need

// note to self - i can get the favicon icon for the URLs which would be nice

// or just do this http://www.google.com/s2/favicons?domain=www.domain.com


chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.")

    // TODO - REMOVE (or at least check for a fresh install somehow)

    chrome.storage.sync.clear().then(() => {
        console.log("cleared")
    });

    // little workaround
    urlStorageCache = { last_website: "" };

    tabChanged();

});


// 60 lines of comments/unneeded whitespace. 164 lines of actual code and useful whitespace. That's a full powered beacon


// ----- FINAL DATA STRUCTURE -----
//
//  // puts all urls directly in sync to circumvent the object size limit
//  // could also store times in seconds rather than milliseconds to save storage?
//
// chrome.storage.sync
//     
//  - "https://www.otheroption.com/": {     < GONNA TRY THIS ONE
//      - "start_times": [
//          - time,
//          - time3
//      - ]
//      - "end_times": [
//          - time2,
//          - time4
//      - ]
//  - },
//  - "https://www.youtube.com/": {
//      - "start_times": [
//          - time,
//          - time3
//      - ]
//      - "end_times": [
//          - time2,
//          - time4
//      - ]
//  - },
//  - "https://en.wikipedia.org/": {
//      - "start_times": [
//          - time,
//          - time3
//      - ]
//      - "end_times": [
//          - time2
//      - ]
//  - },
//
//  - "last_website": "https://en.wikipedia.org/",
//
//  - "settings"/"options" (???)
//
