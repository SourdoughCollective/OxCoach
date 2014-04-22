/*global $*/

/*VARIABLES*/
/*most important -- used to change destintext, on which the changes are then based*/
var nextdestin;

/*Destination variables*/
/*constants: containing the two possible destinations*/
var destinOx = "Oxford";
var destinLo = "London";
/*changeable -- used for top RHS button label, and also for changes*/
var destintext = "Destination";

/*Departure variables*/
/*constants: two arrays containing the names of possible departure stops, and one array containing the id for the navbar buttons for which the names of the stops serve as labels.*/
var ToOxDepart = [ "Victoria", "Grosvenor Gardens", "Marble Arch", "Notting Hill Gate", "Shepherd's Bush", "Hillingdon", "Lewknor Turn", " - ", " - ", "Update" ];
var ToLoDepart = [ "Gloucester Green", "Speedwell", "High Street", "St Clement's", "Oxford Brookes", "Headington", "Green Road Roundabout", "Thornhill P&R", "Lewknor Turn", "Update" ];
var departurebuttons = [ "#departure-selector-1", "#departure-selector-2", "#departure-selector-3", "#departure-selector-4", "#departure-selector-5", "#departure-selector-6", "#departure-selector-7", "#departure-selector-8", "#departure-selector-9", "#departure-selector-10" ];

/*changeable -- takes on one of the constant departure stop name arrays. Then used in conjunction with the departure button id array to populate the departure buttons. Also used to fill in departure stop name in the Result Panel */
var departurearray;

/*Time variables*/
/*changeable -- all used in the result panel*/
var minutestogo; //minutes to go till next bus (used to create timetogo variable)
var timetogo; //time to go till next bus, either in minutes or in hours
var RTPIlastchecked; //when the estimated time of depature was last checked
var ETD; //estimated time of departure -- fetched from RTPI website as a five-character text string (HH:MM)
var mmtime;
var mmhhtime;
var fulltime;
var ETDFull; //estimated time of departure -- turned from ETD into full time string

/*Putting Together the RTPI URL for fetching data*/
/*constant: For each direction, three arrays: containing RTPI's (1) ID numbers, (2) X coordinate, and (3) Y coordinate for each stop.*/
var RTPIToOx = [ [ "27245469", "528697", "178724" ], [ "27245473", "528784", "179163"], [ "27247584", "527883", "180825"], [ "27245367", "525499", "180511"], [ "27245482", "524040", "179977" ], [ "27245426", "507731", "184791"], [ "69345497", "471775", "197477"], [ " - ", " - ", " - " ], [ " - ", " - ", " - "], [ "Update", "Update", "Update" ] ];
var RTPIToLo = [ [ "69326524", "451004", "206385" ], [ "69345627", "451308", "205789" ], [ "69345692", "451811", "206270" ], [ "69323265", "452503", "206025" ], [ "69347427", "453606", "206654" ], [ "69347625", "454635", "207168" ], [ "69325687", "455361", "207405" ], [ "69326542", "456602", "207326" ], [ "69345498", "472100", "197680"], [ "Update", "Update", "Update" ] ];
var RTPIArray;
//in each array, ten arrays = one for each stop in that direction. in each subarray, three items = StopID, Stop X coord, Stop Y coord.
/*the final URL, constructed using fixed elements interspersed with values from the above three changeable arrays*/
var RTPIURL;

/*making and processing the RTPI data call*/
var RTPIRequest; //function that makes the RTPI call
var textresponse; //the response in text form
var placefinder; // this variable helps locate the time of the next bus in the RTPI textresponse
var placefinder2; // this variable helps locate the time of the next bus in the RTPI textresponse
var placefinder3; // this variable helps locate the time of the next bus in the RTPI textresponse

var i; //helps with looping
var MyStopID; //used to select the right value from the arrays. Changes when a departure button is pressed.

/*Twitter*/
var TwitterRequest; //function that makes the Twitter call
var TwitterURL = "https://fierce-earth-8634.herokuapp.com/1.1/statuses/user_timeline.json?screen_name=Oxford_Tube&trim_user=t";
var TwitterResponse; //what comes back from the Twitter call
var TwitterTime; //parse Twitter call for Tweet time
var TwitterTweet; //parse Twitter call for tweet
var TwitterNow; //Time of Twitter call in suitable format
var TwitterThresholdCheck; //Time of Tweet in suitable format
var TwitterHoursBack = 24; //number of hours to look back at tweets

/*Panel Text*/
var ResultText; //This goes into the Result Panel
var TwitterText; //This goes into the Twitter Panel

var ToOxjourneytimearray =  [ "100", "95", "90", "85", "80", "60", "30", " - ", " - ", " - " ];
var ToLojourneytimearray = [ "100", "95", "90", "85", "80", "75", "70", "65", "50", " - " ];
var Journeytimearray;


/*FUNCTIONS*/
/*Changes the variable "destintext" to the new destination (with reference to variable "nextdestin")*/
function changeDestinTextVar() {
    "use strict";
    if (nextdestin === undefined || nextdestin === "ToLon") {
        destintext = destinOx;
    } else if (nextdestin === "ToOxf") {
        destintext = destinLo;
    }
}

/*Changes the destination button label the new destination (with reference to "destintext")*/
/*Plus the instructions in Result Panel upon choosing a new destination*/
function changeDestinationButtonAndText() {
    "use strict";
    $("#destination-button").html("To " + destintext);
    $("#result").html("Select a stop towards " + destintext);
}
             
/*Replaces the navbar labels with new departure-stop options (with reference to "departurearray"). Also updates the current destination-specific arrays which will be used to call RTPI data when the departure stop is selected*/
function departureSelector() {
    "use strict";
    var i;
    if (nextdestin === undefined || nextdestin === "ToLon") {
        departurearray = ToOxDepart;
        RTPIArray = RTPIToOx;
        Journeytimearray = ToOxjourneytimearray;
    } else if (nextdestin === "ToOxf") {
        departurearray = ToLoDepart;
        RTPIArray = RTPIToLo;
        Journeytimearray = ToLojourneytimearray;
    }
    for (i = 0; i < departurebuttons.length; i++) {
        $(departurebuttons[i]).html(departurearray[i]);
    }
}

/*Toggles variable "nextdestin" (I use this at the end of the process -- so it sets the variable up for the next click)*/
function changeDestinVar() {
    "use strict";
    if (nextdestin === undefined || nextdestin === "ToLon") {
        nextdestin = "ToOxf";
    } else if (nextdestin === "ToOxf") {
        nextdestin = "ToLon";
    }
}

/*Changes the Result Panel text once RTPI has been queried for next departure time*/
function changeResultText() {
    "use strict";
    $("#result").html(ResultText); //This text appears in the Result Panel
}

/*Fetch RTPI Data*/
function queryRTPI() {
    "use strict";
    RTPIURL = "http://www.oxontime.com/Naptan.aspx?t=departure&sa=" + RTPIArray[MyStopID][0] + "&dc=&ac=96&vc=TUBE&x=" + RTPIArray[MyStopID][1] + "&y=" + RTPIArray[MyStopID][2] + "&format=xhtml"; //This is the URL we call for the data
    RTPIRequest = new XMLHttpRequest({mozSystem: true});
    RTPIRequest.open("GET", RTPIURL, true);
    RTPIRequest.onreadystatechange = function () {
        if (RTPIRequest.readyState !== 4 || RTPIRequest.status !== 200) {
            //alert(RTPIRequest.readyState + ":" + RTPIRequest.status + ":" + RTPIRequest.statusText);
        } else if (RTPIRequest.readyState === 4 && RTPIRequest.status === 200) { //This shows the request has come back
            textresponse = RTPIRequest.responseText; //Take the response as a text string
            if (textresponse.indexOf('<td class="sortable-text hidden">') < 0) {
                ResultText = "<p style='font-size:small'>Unfortunately there are currently no departures from " + departurearray[MyStopID] + " to " + destintext + "</p>";
            } else {
                placefinder = textresponse.search('<td class="sortable-text hidden">'); //Find some text a bit before the time of the next bus
                placefinder2 = textresponse.substring((placefinder + 33), (placefinder + 42)); //Move to just before where time of next bus is
                placefinder3 = placefinder2.search(/\d\d:\d\d/); //Find time text
                ETD = placefinder2.substring((placefinder3), (placefinder3 + 5)); //discard test of text
                RTPIlastchecked = new Date(); //get the time of "now"
                ETDFull = new Date(RTPIlastchecked.getFullYear(), RTPIlastchecked.getMonth(), RTPIlastchecked.getDate(), ETD.substring(0, 2), ETD.substring(3, 5), RTPIlastchecked.getSeconds(), RTPIlastchecked.getMilliseconds());
                minutestogo = ((ETDFull - RTPIlastchecked) / 60000); //substract 'now' from ETD to obtain how long to wait
                if (minutestogo > 60) {
                    timetogo = " in " + (Math.floor(minutestogo / 60)) + " hours " + (minutestogo - (Math.floor(minutestogo / 60) * 60)) + " minutes ";
                } else if (minutestogo === 60) {
                    timetogo = " in 1 hour ";
                } else if (minutestogo < 1) {
                    timetogo = " now ";
                } else {
                    timetogo = " in " + minutestogo + " minutes ";
                }
                ResultText = "<p style='font-size:small'>The next bus to " + destintext + " leaves " + departurearray[MyStopID] + timetogo + " (at " + ETD + "). <br><br> Journey time takes around " + Journeytimearray[MyStopID] + " minutes. <br><br></p><p style='font-size:xx-small'> Last updated on " + RTPIlastchecked + ". <a href='#' id='update'>Update?</a></p>";
            }
            changeResultText(); //use all this information to change the Result Panel
        }
    };
    RTPIRequest.send();
}

/*Fetch Twitter Data*/
    //could also load from http://www.oxfordtube.com/serviceinfo.aspx or facebook
function queryTwitter() {
    "use strict";
    TwitterRequest = new XMLHttpRequest({mozSystem: true}); //need the bit in curly brackets to make cross-domain request work, maybe only in the simulator?    
    TwitterRequest.open("Get", TwitterURL, true);
    TwitterRequest.onreadystatechange = function () {
        if (TwitterRequest.readyState !== 4 || TwitterRequest.status !== 200) {
            TwitterTime = "Twitter";
            TwitterTweet = "Unavailable";
        } else if (TwitterRequest.readyState === 4 && TwitterRequest.status === 200) { //This shows the request has come back
            TwitterResponse = JSON.parse(TwitterRequest.response);
            $("#twitter").empty();
            $("#twitter").append("Important Service Announcements<br>(<a href='http://www.twitter.com/Oxford_Tube' id='update'>Tweets</a> in the last " + TwitterHoursBack + " hours)");
            $(TwitterResponse).each(function () {
                TwitterThresholdCheck = new Date(this.created_at);
                TwitterNow = new Date();
                if ((TwitterThresholdCheck > (TwitterNow.setHours(TwitterNow.getHours() - TwitterHoursBack))) && ((this.text.indexOf("service") > 0) || (this.text.indexOf("normal") > 0))) {
                    TwitterTime = this.created_at.substring(0, 19);
                    TwitterTweet = this.text;
                    $("#twitter").append("<p style='font-size:small'>" + TwitterTime + ": " + TwitterTweet + "<br></p>");
                }
            });
            $("#twitter").append("<p style='font-size:xx-small'><a href='#' id='update'>Update?</a></p><br>");
        }
    };
    TwitterRequest.send();

}

/*rules*/
                     
/*1 -- Clicking the Direction Button changes... */
$("#destination-button").click(function () {
    "use strict";
/*..."destintext" i.e. the variable for destination button label*/
    changeDestinTextVar();
/*...the top right hand side destination button label and the instruction text*/
    changeDestinationButtonAndText();
/*...the horizontal departure stop selection menu labels*/
    departureSelector();
/*..."nextdestin" so that it will work next time*/
    changeDestinVar();
});
                        
/*2 -- Clicking a Departure Selector tab changes the MyStopID variable, which allows the data-fetch and so on to be tailored to the request*/
$(departurebuttons[0]).click(function () {
    "use strict";
    MyStopID = 0;
});
                
$(departurebuttons[1]).click(function () {
    "use strict";
    MyStopID = 1;
});
                
$(departurebuttons[2]).click(function () {
    "use strict";
    MyStopID = 2;
});
                
$(departurebuttons[3]).click(function () {
    "use strict";
    MyStopID = 3;
});

$(departurebuttons[4]).click(function () {
    "use strict";
    MyStopID = 4;
});
                
$(departurebuttons[5]).click(function () {
    "use strict";
    MyStopID = 5;
});
                
$(departurebuttons[6]).click(function () {
    "use strict";
    MyStopID = 6;
});
                
$(departurebuttons[7]).click(function () {
    "use strict";
    MyStopID = 7;
});
                               
$(departurebuttons[8]).click(function () {
    "use strict";
    MyStopID = 8;
});
                
$(departurebuttons[9]).click(function () {
    "use strict";
    MyStopID = 9;
});

/*clicking any navbar button will trigger one of the following as well, and this is what fetches the data etc. looks like this is "bubbling" rather than "capturing" as the broader event happens after the narrower even?*/
$("#departure-selector-A").click(function () {
    "use strict";
    queryRTPI();
    queryTwitter();
});

$("#departure-selector-B").click(function () {
    "use strict";
    queryRTPI();
    queryTwitter();
});

/*This is supposed to update the page if the update text is clicked... but currently not.*/
$("#update").click(function () {
    "use strict";
    queryRTPI();
    queryTwitter();
});
