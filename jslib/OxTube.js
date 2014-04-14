/*global $*/

/*VARIABLES*/
/*most important -- used to change destintext, on which the changes are then based*/
var nextdestin;

/*Destination variables*/
/*constants: containing the two possible desinations*/
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
var minutestogo; //minutes to go till next bus
var RTPIlastchecked; //when the estimated time of depature was last checked
var ETD; //estimated time of departure -- fetched from RTPI website as a five-character text string (HH:MM)

/*these variables allow us to construct a full date from the ETD text string*/
var ETDYear;
var ETDMonth;
var ETDDay;
var ETDHours;
var ETDMinutes;
var ETDSeconds;
var ETDMilliseconds;
var ETDFull;

/*estimated time of arrival -- not functional yet. Inserting "ETA.getHours() + ETA.getMinutes()" in the Result Panel didn't work*/
//var ETAMinutes = (ETDMinutes + 80);
//var ETA = new Date(ETDYear, ETDMonth, ETDDay, ETDHours, ETAMinutes, ETDSeconds, ETDMilliseconds);

/*Putting Together the RTPI URL for fetching data*/
/*constant: For each direction, three arrays: containing RTPI's (1) ID numbers, (2) X coordinate, and (3) Y coordinate for each stop.*/
var RTPIToOxStopID = [ "27245469", "27245473", "27247584", "27245367", "27245482", "27245426", "69345497", " - ", " - ", "Update" ];
var RTPIToOxStopX = [ "528697", "528784", "527883", "525499", "524040", "507731", "471775", " - ", " - ", "Update" ];
var RTPIToOxStopY = [ "178724", "179163", "180825", "180511", "179977", "184791", "197477", " - ", " - ", "Update" ];
var RTPIToLoStopID = [ "69326524", "69345627", "69345692", "69323265", "69347427", "69347625", "69325687", "69326542", "69345498 ", "Update" ];
var RTPIToLoStopX = [ "451004", "451308", "451811", "452503", "453606", "454635", "455361", "456602", "472100", "Update" ];
var RTPIToLoStopY = [ "206385", "205789", "206270", "206025", "206654", "207168", "207405", "207326", "197680", "Update" ];
/*changeable: threse three arrays change depending on direction, taking the values of their related direction-constant arrays. They're then used in the URL*/
var RTPIStopIDarray;
var RTPIStopXarray;
var RTPIStopYarray;
/*the final URL, constructed using fixed elements interspersed with values from the above three changeable arrays*/
var RTPIURL;

/*making and processing the RTPI data call*/
var RTPIRequest; //function that makes the RTPI call
var textresponse; //the response in text form
var placefinder; // this variable helps locate the time of the next bus in the RTPI textresponse

var i; //helps with looping
var MyStopID; //used to select the right value from the arrays. Changes when a departure button is pressed.

/*Facebook*/
var FacebookRequest; //function that makes the Facebook call
var FacebookURL;
var FacebookResponse;
var FacebookTime;
var FacebookTweet;
var Facebooklastchecked;




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

/*Changes the direction button label the new destination (with reference to "destintext")*/
function directionButtonText() {
    "use strict";
    $("#direction-button").html("To " + destintext);
}
             
/*Replaces the navbar labels with new departure-stop options (with reference to "departurearray"). Also updates the current direction-specific arrays which will be used to call RTPI data when the departure stop is selected*/
function departureSelector() {
    "use strict";
    var i;
    if (nextdestin === undefined || nextdestin === "ToLon") {
        departurearray = ToOxDepart;
        RTPIStopIDarray = RTPIToOxStopID;
        RTPIStopXarray = RTPIToOxStopX;
        RTPIStopYarray = RTPIToOxStopY;
    } else if (nextdestin === "ToOxf") {
        departurearray = ToLoDepart;
        RTPIStopIDarray = RTPIToLoStopID;
        RTPIStopXarray = RTPIToLoStopX;
        RTPIStopYarray = RTPIToLoStopY;
    }
    for (i = 0; i < departurebuttons.length; i++) {
        $(departurebuttons[i]).html(departurearray[i]);
    }
}

/*Instructions in Result Panel upon choosing a new destination*/
function instructionText() {
    "use strict";
    $("#result").html("Select a stop towards " + destintext);
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
    $("#result").html("<p style='font-size:small'>The next bus to " + destintext + " leaves " + departurearray[MyStopID] + " in " + minutestogo + " minutes (at " + ETD + "). <br><br> Journey time takes around 100 minutes. <br><br></p><p style='font-size:xx-small'> Last updated on " + RTPIlastchecked + ". <a href='#' id='update'>Update?</a></p>"); //This text appears in the Result Panel
}

/*Changes the Facebook Panel text once RTPI has been queried for next departure time*/
function changeFacebookText() {
    "use strict";
    $("#facebook").html("<p style='font-size:small'>" + FacebookTime + ": " + FacebookTweet + "<br></p><p style='font-size:xx-small'> Last updated on " + Facebooklastchecked + ". <a href='#' id='update'>Update?</a></p>"); //This text appears in the Facebook Panel
}

/*Fetch RTPI Data*/
function queryRTPI() {
    "use strict";
    RTPIURL = "http://www.oxontime.com/Naptan.aspx?t=departure&sa=" + RTPIStopIDarray[MyStopID] + "&dc=&ac=96&vc=TUBE&x=" + RTPIStopXarray[MyStopID] + "&y=" + RTPIStopYarray[MyStopID] + "&format=xhtml"; //This is the URL we call for the data
    RTPIRequest = new XMLHttpRequest({mozSystem: true});
    RTPIRequest.open("GET", RTPIURL, true);
    RTPIRequest.onreadystatechange = function () {
        if (RTPIRequest.readyState !== 4 || RTPIRequest.status !== 200) {
            //alert(RTPIRequest.readyState + ":" + RTPIRequest.status + ":" + RTPIRequest.statusText);
        } else if (RTPIRequest.readyState === 4 && RTPIRequest.status === 200) { //This shows the request has come back
            textresponse = RTPIRequest.responseText; //Take the response as a text string
            placefinder = textresponse.search('<td class="sortable-text hidden">'); //Find some text a bit before the time of the next bus
            ETD = textresponse.substring((placefinder + 33), (placefinder + 38)); //Move forward to where time of next bus is
            ETDHours = ETD.substring(0, 2); //extract the hour
            ETDMinutes = ETD.substring(3, 5); //extract the minutes
            RTPIlastchecked = new Date(); //get the time of "now"
            ETDYear = RTPIlastchecked.getFullYear(); //get now's Year
            ETDMonth = RTPIlastchecked.getMonth(); //get now's Month
            ETDDay = RTPIlastchecked.getDate(); //get now's Day
            ETDSeconds = RTPIlastchecked.getSeconds(); //get now's Second
            ETDMilliseconds = RTPIlastchecked.getMilliseconds(); //get now's Milisecond
            ETDFull = new Date(ETDYear, ETDMonth, ETDDay, ETDHours, ETDMinutes, ETDSeconds, ETDMilliseconds); //use this information from now to fill in blanks and turn RTPI time text string into a proper time. Weakness: when asking a question across midnight, new month, new year. Need to solve.
            minutestogo = ((ETDFull - RTPIlastchecked) / 60000); //substract now from ETD to obtain how long to wait
            changeResultText(); //use all this information to change the Result Panel
        }
    };
    RTPIRequest.send();
}

/*Fetch Facebook*/
function queryFacebook() {
    "use strict";
    FacebookURL = "https://graph.facebook.com/Oxford-Tube"; //This is the URL we call for the data
    FacebookRequest = new XMLHttpRequest({mozSystem: true}); //need the bit in curly brackets to make cross-domain request work, maybe only in the simulator?
    FacebookRequest.open("Get", FacebookURL, true);
    FacebookRequest.onreadystatechange = function () {
        if (FacebookRequest.readyState !== 4 || FacebookRequest.status !== 200) {
            FacebookTime = "no";
            FacebookTweet = "no";
            Facebooklastchecked = new Date(); //get the time of "now"
            //alert(FacebookRequest.readyState + ":" + FacebookRequest.status + ":" + xmlhttp.statusText);
        } else if (FacebookRequest.readyState === 4 && FacebookRequest.status === 200) { //This shows the request has come back
            FacebookResponse = FacebookRequest.responseText; //Take the response as a text string
            FacebookTime = FacebookResponse.created_at;
            FacebookTweet = FacebookResponse.text;
            Facebooklastchecked = new Date(); //get the time of "now"
            changeFacebookText(); //use all this information to change the Facebook Panel
        }
    };
    FacebookRequest.send();
}


//could also load from http://www.oxfordtube.com/serviceinfo.aspx

/*rules*/
                     
/*1 -- Clicking the Direction Button changes... */
$("#direction-button").click(function () {
    "use strict";
/*..."destintext" i.e. the variable for direction button label*/
    changeDestinTextVar();
/*...the top right hand side direction button label*/
    directionButtonText();
/*...the horizontal departure stop selection menu labels*/
    departureSelector();
/*...the instruction text*/
    instructionText();
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
    queryFacebook();
});

$("#departure-selector-B").click(function () {
    "use strict";
    queryRTPI();
    queryFacebook();
});

/*This is supposed to update the page if the update text is clicked... but currently not.*/
$("#update").click(function () {
    "use strict";
    queryRTPI();
    queryFacebook();
});
