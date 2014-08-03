/*global $*/
/*version 0.6*/

/****VARIABLES****/
/*DIRECTION, DEPARTURE STOP, COACH SERVICE: THREE NUMERICAL CODES ON WHICH LABELS AND PROCESSES ARE BASED*/
var DirectionCode; /*DIRECTION: most important -- all destination-based changes are based on this number. "1" means the journey query being constructed will be from London to Oxford. "0" means the opposite.*/
var MyStopID; /*DEPARTURE: used to select the right value from the arrays. Changes when a departure button is pressed*/
var ServiceCode = 2; /*SERVICE: indicates the service desired. 0 = OT, 1 = X90, 2 = both (default) */
var OTX90; //"0" (Oxford Tube) or "1" (X90). This variable is almost a duplicate of Service Code.

/*COMMON-NAME VARIABLES FOR DIRECTION, DEPARTURE STOP, COACH SERVICE (USED IN "DETAILS", "CHOICE", AND "SETTINGS" PANELS)*/
var destintextarray = ["London", "Oxford"]; /*DESTINATION (DETAILS, CHOICE): constants: containing the two possible destinations*/
var ToLoDepart = [ "Gloucester Green", "Speedwell", "High Street", "St Clement's", "Oxford Brookes", "Headington", "Green Road Roundabout", "Thornhill P&R", "Lewknor Turn"]; //DEPARTURE (DETAILS, CHOICE): array of names of stops to London
var ToOxDepart = [ "Victoria", "Grosvenor Gardens", "Marble Arch", "Marylebone", "Notting Hill Gate", "Shepherd's Bush", "Hillingdon", "Lewknor Turn", " - "]; //DEPARTURE (DETAILS, CHOICE): array of names of stops to Oxford
var departurearray = [ToLoDepart, ToOxDepart]; //DEPARTURE: used to select one of prior two arrays depending on direction
var servicearray = [ "Oxford Tube", "X90", "Oxford Tube and X90" ]; //SERVICE (DETAILS, CHOICE, SETTINGS, RESULT): array of services
var twitterhoursbackarray = [ 12, 24, 48 ];

/*HTML-ID-NAME VARIABLES FOR DIRECTION, DEPARTURE STOP, COACH SERVICE (USED IN "CHOICE", "SETTINGS", AND "RESULT" PANELS)*/
var departureselectors = [ "#departureselector0", "#departureselector1", "#departureselector2", "#departureselector3", "#departureselector4", "#departureselector5", "#departureselector6", "#departureselector7", "#departureselector8" ]; //DEPARTURE (CHOICE): array containing the HTML ids for Choice Panel list of departure stops
var coachservicesettingsarray = [ "#settings-oxford-tube", "#settings-X90", "#settings-both" ]; //SERVICE (SETTINGS): array containing HTML ids for Settings Panel list of coach service
var coachservicechoicearray = [ "#choose-oxford-tube", "#choose-X90", "#choose-both" ]; //SERVICE (CHOICE): array containing HTML ids for Choice Panel list of coach service
var twitterhoursbacksettingsarray = [ "#settings-12-hours", "#settings-24-hours", "#settings-48-hours" ]; //SERVICE (SETTINGS): array containing HTML ids for Settings Panel list of twitter hours back setting
var ResultPanelArray = [ "#resultOT", "#resultX90" ]; //(RESULT): array used to find correct place in result panel to give each result

/*RTPI INFORMATION variables*//* For Oxford Tube (OT) and then for X90: in each case, two arrays containing RTPI's (1) ID numbers, (2) X coordinate, and (3) Y coordinate for each stop, plus a third array used to select one of these two depending on direction*/
var RTPIOTToLo = [ [ "69326524", "451004", "206385" ], [ "69345627", "451308", "205789" ], [ "69345692", "451811", "206270" ], [ "69323265", "452503", "206025" ], [ "69347427", "453606", "206654" ], [ "69347625", "454635", "207168" ], [ "69325687", "455361", "207405" ], [ "69326542", "456602", "207326" ], [ "69345498", "472100", "197680"] ];
var RTPIOTToOx = [ [ "27245469", "528697", "178724" ], [ "27245473", "528784", "179163" ], [ "27247584", "527883", "180825" ], [ " - ", " - ", " - " ], [ "27245367", "525499", "180511" ], [ "27245482", "524040", "179977" ], [ "27245426", "507731", "184791" ], [ "69345497", "471775", "197477" ], [ " - ", " - ", " - " ] ];
var RTPIOTArray = [RTPIOTToLo, RTPIOTToOx];

var RTPIX90ToLo = [ [ "69326498", "451005", "206394" ], [ "69345627", "451308", "205789" ], [ "69345728", "451821", "206268" ], [ "69323265", "452503", "206025" ], [ "69347427", "453606", "206654" ], [ "69347625", "454635", "207168" ], [ "69325687", "455361", "207405" ], [ "69326542", "456602", "207326" ], [ " - ", " - ", " - "] ];
var RTPIX90ToOx = [ [ "27248536", "528733", "178814" ], [ "27245427", "528800", "178999"], [ "27247584", "527883", "180825"], [ "27248283", "527653", "181867"], [ " - ", " - ", " - " ], [ " - ", " - ", " - " ], [ "27245426", "507731", "184791" ], [ " - ", " - ", " - " ], [ " - ", " - ", " - "] ];
var RTPIX90Array = [RTPIX90ToLo, RTPIX90ToOx];
var RTPIArray = [RTPIOTArray, RTPIX90Array]; /*array used to select one of the aforegoing arrays based on coach service selection*/
var TUBEX90Array = ["TUBE", "X90"]; /*array used to insert RTPI url segment referring to coach service*/

/*making and processing the RTPI data call; all arrays to allow for customisation by coach service*/
var RTPIURL = [];
var RTPIRequest = [];
var textresponse = []; //the response in text form
var placefinder = []; // this variable helps locate the time of the next bus in the RTPI textresponse
var placefinder2 = []; // this variable helps locate the time of the next bus in the RTPI textresponse
var placefinder3 = []; // this variable helps locate the time of the next bus in the RTPI textresponse
var placefinder4 = []; // this variable helps locate the time of the next bus in the RTPI textresponse
var i; //helps with looping

/*TWITTER variables*/
var TwitterRequest = [];
var TwitterURLOT = "https://fierce-earth-8634.herokuapp.com/1.1/statuses/user_timeline.json?screen_name=Oxford_Tube&trim_user=t";
var TwitterURLX90 = "https://fierce-earth-8634.herokuapp.com/1.1/statuses/user_timeline.json?screen_name=oxfordbusco&trim_user=t";
var TwitterURL = [ TwitterURLOT, TwitterURLX90 ];
var TwitterResponse = [];
var TwitterTime = [];
var TwitterTweet = [];
var TwitterNow = [];
var TwitterThresholdCheck = [];
var TwitterHoursBack = 24; //How many hours back in time should the search for relevant twitter posts look
var TwitterResultPanel = [ "#twitterOT", "#twitterX90" ];
var TwitterSearchTerms = [ [ [ "service", "normal", "delay" ], [ " " ] ], [ [ "service", "normal", "delay" ], [ "X90" ] ] ]; // array of arrays: first level separates OT (0) from X90 (1), second separates OR (0) from AND (1), third array contains the various words one might want.

/*PANEL TEXT*/
var LastCheckedText;
var ResultText = []; //This goes into the Result Panel. (Array to allow for OT and X90 results.)
var ToOxjourneytime =  [ "100", "95", "90", "85", "80", "60", "30", " - ", " - " ]; //these two arrays provide the estimate of journey time.
var ToLojourneytime = [ "100", "95", "90", "85", "80", "75", "70", "65", "50" ];
var Journeytimearray = [ToLojourneytime, ToOxjourneytime]; //this array chooses time-estimate arrays based on direction
/*TIME variables*//*changeable -- all used in the result panel*/
var minutestogo = []; //minutes to go till next bus (used to create timetogo variable)
var timetogo = []; //time to go till next bus, either in minutes or in hours
var RTPIlastchecked = []; //when the estimated time of departure was last checked
var ETD = []; //estimated time of departure -- fetched from RTPI website as a five-character text string (HH:MM)
var mmtime = [];
var mmhhtime = [];
var fulltime = [];
var ETDFull = []; //estimated time of departure -- turned from ETD into full time string

/****FUNCTIONS****/
/**RTPI**/
/*Fetch RTPI Data*/
function queryRTPI(OTX90) {
    "use strict";
    RTPIURL[OTX90] = "http://www.oxontime.com/Naptan.aspx?t=departure&sa=" + RTPIArray[OTX90][DirectionCode][MyStopID][0] + "&dc=&ac=96&vc=" + TUBEX90Array[OTX90] + "&x=" + RTPIArray[OTX90][DirectionCode][MyStopID][1] + "&y=" + RTPIArray[OTX90][DirectionCode][MyStopID][2] + "&format=xhtml"; //This is the URL we call for the data
    RTPIRequest[OTX90] = new XMLHttpRequest({mozSystem: true});
    RTPIRequest[OTX90].open("GET", RTPIURL[OTX90], true);
    RTPIRequest[OTX90].onreadystatechange = function () {
        if (RTPIRequest[OTX90].readyState !== 4 || RTPIRequest[OTX90].status !== 200) {
            //
        } else if (RTPIRequest[OTX90].readyState === 4 && RTPIRequest[OTX90].status === 200) { //This shows the request has come back
            textresponse[OTX90] = RTPIRequest[OTX90].responseText; //Take the response as a text string
            if (textresponse[OTX90].indexOf('<td class="sortable-text hidden">') < 0) {
                ResultText[OTX90] = "<p style='font-size:small'>Unfortunately there are currently no " + servicearray[OTX90] + " departures from " + departurearray[DirectionCode][MyStopID] + " to " + destintextarray[DirectionCode] + "</p>";
            } else {
                placefinder[OTX90] = textresponse[OTX90].indexOf('<td>' + TUBEX90Array[OTX90] + '</td>'); //Find first row with "Tube" or "X90" in it (i.e. not other bus route)
                placefinder2[OTX90] = textresponse[OTX90].indexOf('<td class="sortable-text hidden">', placefinder[OTX90]); //Find some text just before the time of the next bus
                placefinder3[OTX90] = textresponse[OTX90].substring((placefinder2[OTX90] + 33), (placefinder2[OTX90] + 42)); //Get string where expect time text to be
                placefinder4[OTX90] = placefinder3[OTX90].search(/\d\d:\d\d/); //Find time text
                ETD[OTX90] = placefinder3[OTX90].substring((placefinder4[OTX90]), (placefinder4[OTX90] + 5)); //discard rest of text
                RTPIlastchecked[OTX90] = new Date(); //get the time of "now"
                ETDFull[OTX90] = new Date(RTPIlastchecked[OTX90].getFullYear(), RTPIlastchecked[OTX90].getMonth(), RTPIlastchecked[OTX90].getDate(), ETD[OTX90].substring(0, 2), ETD[OTX90].substring(3, 5), RTPIlastchecked[OTX90].getSeconds(), RTPIlastchecked[OTX90].getMilliseconds());
                minutestogo[OTX90] = ((ETDFull[OTX90] - RTPIlastchecked[OTX90]) / 60000); //substract 'now' from ETD to obtain how long to wait
                if (minutestogo[OTX90] < 0) {
                    minutestogo[OTX90] = (minutestogo[OTX90] + 24);
                }
                if (minutestogo[OTX90] > 60) {
                    timetogo[OTX90] = " in " + (Math.floor(minutestogo[OTX90] / 60)) + " hours " + (minutestogo[OTX90] - (Math.floor(minutestogo[OTX90] / 60) * 60)) + " minutes ";
                } else if (minutestogo[OTX90] === 60) {
                    timetogo[OTX90] = " in 1 hour ";
                } else if (minutestogo[OTX90] < 1) {
                    timetogo[OTX90] = " now ";
                } else {
                    timetogo[OTX90] = " in " + minutestogo[OTX90] + " minutes ";
                }
                ResultText[OTX90] = "<p style='font-size:small'>The next " + servicearray[OTX90] + " to " + destintextarray[DirectionCode] + " leaves " + departurearray[DirectionCode][MyStopID] + timetogo[OTX90] + " (at " + ETD[OTX90] + "). <br><br> Journey time takes around " + Journeytimearray[DirectionCode][MyStopID] + " minutes.</p>";
                LastCheckedText = "<p style='font-size:xx-small'> Last updated on " + RTPIlastchecked[OTX90] + ".</p>";
            }
            $(ResultPanelArray[OTX90]).html(ResultText[OTX90]); //use all this information to change the Result Panel
            $("#last-checked-dynatext").html(LastCheckedText); //last checked info goes in the details box
        }
    };
    RTPIRequest[OTX90].send();
}

/**TWITTER**/
/*Fetch Twitter Data*/ //could also load from http://www.oxfordtube.com/serviceinfo.aspx or facebook
function queryTwitter(OTX90) {
    "use strict";
    TwitterRequest[OTX90] = new XMLHttpRequest({mozSystem: true}); //need the bit in curly brackets to make cross-domain request work, maybe only in the simulator?    
    TwitterRequest[OTX90].open("Get", TwitterURL[OTX90], true);
    TwitterRequest[OTX90].onreadystatechange = function () {
        if (TwitterRequest[OTX90].readyState !== 4 || TwitterRequest[OTX90].status !== 200) {
            TwitterTime[OTX90] = "Twitter";
            TwitterTweet[OTX90] = "Unavailable";
        } else if (TwitterRequest[OTX90].readyState === 4 && TwitterRequest[OTX90].status === 200) { //This shows the request has come back
            TwitterResponse[OTX90] = JSON.parse(TwitterRequest[OTX90].response);
            $(TwitterResultPanel[OTX90]).empty();
            $(TwitterResultPanel[OTX90]).append(servicearray[OTX90] + " Service Announcements<br>(<a href='" + TwitterURL[OTX90] + "' id='update'>Tweets</a> in the last " + TwitterHoursBack + " hours)");
            $(TwitterResponse[OTX90]).each(function () {
                TwitterThresholdCheck[OTX90] = new Date(this.created_at);
                TwitterNow[OTX90] = new Date();
                if ((TwitterThresholdCheck[OTX90] > (TwitterNow[OTX90].setHours(TwitterNow[OTX90].getHours() - TwitterHoursBack))) && ((this.text.indexOf(TwitterSearchTerms[OTX90][0][0]) > 0) || (this.text.indexOf(TwitterSearchTerms[OTX90][0][1]) > 0) || (this.text.indexOf(TwitterSearchTerms[OTX90][0][2]) > 0)) && (this.text.indexOf(TwitterSearchTerms[OTX90][1][0]) > 0)) {
                    TwitterTime[OTX90] = this.created_at.substring(0, 19);
                    TwitterTweet[OTX90] = this.text;
                    $(TwitterResultPanel[OTX90]).append("<p style='font-size:small'>" + TwitterTime[OTX90] + ": " + TwitterTweet[OTX90] + "<br></p>");
                }
            });
            $(TwitterResultPanel[OTX90]).append("<p style='font-size:xx-small'><a href='#' id='update'>Update?</a></p><br>");
        }
    };
    TwitterRequest[OTX90].send();
}

/**SHOW AND HIDE**/
function showPanels(Panel1, Panel2, Panel3) { /*Hide all panels then show selected ones*/
    "use strict";
    $(".ui-panel-page-container-a").hide();
    $(Panel1).show();
    $(Panel2).show();
    $(Panel3).show();
}

function showDestinationInstructions() { //shows details and destination instructions
    "use strict";
    showPanels("#details", "#destination-instructions");
}
 
function showDepartureInstructions() { //shows details and departure instructions
    "use strict";
    $("#DepInsDestintext").html(destintextarray[DirectionCode]);
    var i;
    for (i = 0; i < departureselectors.length; i++) {
        if (departurearray[DirectionCode][i] !== " - ") {
            $(departureselectors[i]).html(departurearray[DirectionCode][i]);
            $(departureselectors[i]).show();
        } else {
            $(departureselectors[i]).hide(); //hides any empty list items
        }
    }
    showPanels("#details", "#departure-instructions");
}

function showByService(omnipanel, OTpanel, X90panel) { //shows details and results panels (depending on coach service selected)
    "use strict";
    if (ServiceCode === 0) {
        showPanels(omnipanel, OTpanel);
    }
    if (ServiceCode === 1) {
        showPanels(omnipanel, X90panel);
    }
    if (ServiceCode === 2) {
        showPanels(omnipanel, OTpanel, X90panel);
    }
}

function showInstructionsOrResults() { //show relevant instructions if details missing; if none missing, show results
    "use strict";
    if (DirectionCode === undefined) {
        showDestinationInstructions();
    } else if (MyStopID === undefined) {
        showDepartureInstructions();
    } else {
        showByService("#details", ResultPanelArray[0], ResultPanelArray[1]);
    }
}

/**NUMERICAL-CODE-MANIPULATING FUNCTIONS**/
function destinationToggle() { //Toggles variable "DirectionCode"
    "use strict";
    if (DirectionCode === 1 || DirectionCode === undefined) {
        DirectionCode = 0;
    } else if (DirectionCode === 0) {
        DirectionCode = 1;
    }
}

/**QUERY FUNCTION**/
function queryByService(whatquery) { //passes the query on for the selected coach services
    "use strict";
    if (ServiceCode === 0 || ServiceCode === 2) {
        whatquery(0);
    }
    if (ServiceCode === 1 || ServiceCode === 2) {
        whatquery(1);
    }
}

/**FILL-DYNATEXT FUNCTIONS**/
function fillDynatext(dynatextID, label) {
    "use strict";
    $(dynatextID).html(label);
}

function shoot() {
    "use strict";
    queryByService(queryRTPI);
    showByService("#details", ResultPanelArray[0], ResultPanelArray[1]);
}

function changeMyStopID(NewStopID) { /*changes the MyStopID variable*/
    "use strict";
    MyStopID = NewStopID;
}

function changeMyStopIDandshoot(NewStopID) {
    "use strict";
    changeMyStopID(NewStopID);
    fillDynatext("#departure-dynatext", departurearray[DirectionCode][MyStopID]); //should this be in changeMyStopID?
    shoot();
}

function indicateChoice(arraytobechanged, arrayofnames, chosenitem) {
    "use strict";
    var i;
    for (i = 0; i < arraytobechanged.length; i++) {
        $(arraytobechanged[i]).html(arrayofnames[i] + "  ( )");
    }
    $(arraytobechanged[chosenitem]).html(arrayofnames[chosenitem] + "  (/)");
}

/****RULES****/
/*1 -- Clicking the Destination Button changes the destination and returns departure to undefined... */
$("#destination-dynatext").click(function () {
    "use strict";
    destinationToggle();
    fillDynatext("#destination-dynatext", destintextarray[DirectionCode]);
    MyStopID = undefined;
    fillDynatext("#departure-dynatext", "Departure");
    showInstructionsOrResults();
});

/*2 -- Clicking the Departure Button returns departure to undefined... */
$("#departure-dynatext").click(function () {
    "use strict";
    MyStopID = undefined;
    fillDynatext("#departure-dynatext", "Departure");
    showInstructionsOrResults();
});

/*3 -- Clicking the Coach Service Button shows coach service selection instructions... */
$("#coach-service-dynatext").click(function () {
    "use strict";
    indicateChoice(coachservicesettingsarray, servicearray, ServiceCode);
    showPanels("#details", "#coach-service-instructions");
});

/*4 -- Clicking a Departure Selector tab starts changeMyStopID AND shoots a resuest off*/
$(departureselectors[0]).click(function () {
    "use strict";
    changeMyStopIDandshoot(0);
});

$(departureselectors[1]).click(function () {
    "use strict";
    changeMyStopIDandshoot(1);
});

$(departureselectors[2]).click(function () {
    "use strict";
    changeMyStopIDandshoot(2);
});
        
$(departureselectors[3]).click(function () {
    "use strict";
    changeMyStopIDandshoot(3);
});

$(departureselectors[4]).click(function () {
    "use strict";
    changeMyStopIDandshoot(4);
});
                
$(departureselectors[5]).click(function () {
    "use strict";
    changeMyStopIDandshoot(5);
});
                
$(departureselectors[6]).click(function () {
    "use strict";
    changeMyStopIDandshoot(6);
});
                
$(departureselectors[7]).click(function () {
    "use strict";
    changeMyStopIDandshoot(7);
});
                               
$(departureselectors[8]).click(function () {
    "use strict";
    changeMyStopIDandshoot(8);
});

//CHOICES IN PANELS
$("#choose-oxford").click(function () {
    "use strict";
    DirectionCode = 1;
    fillDynatext("#destination-dynatext", destintextarray[DirectionCode]);
    showInstructionsOrResults();
});

$("#choose-london").click(function () {
    "use strict";
    DirectionCode = 0;
    fillDynatext("#destination-dynatext", destintextarray[DirectionCode]);
    showInstructionsOrResults();
});

$("#choose-oxford-tube").click(function () {
    "use strict";
    ServiceCode = 0;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    showInstructionsOrResults();
});

$("#choose-X90").click(function () {
    "use strict";
    ServiceCode = 1;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    showInstructionsOrResults();
});

$("#choose-both").click(function () {
    "use strict";
    ServiceCode = 2;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    showInstructionsOrResults();
});

$("#settings-oxford-tube").click(function () {
    "use strict";
    ServiceCode = 0;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    indicateChoice(coachservicesettingsarray, servicearray, 0);
    indicateChoice(coachservicechoicearray, servicearray, 0);
});

$("#settings-X90").click(function () {
    "use strict";
    ServiceCode = 1;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    indicateChoice(coachservicesettingsarray, servicearray, 1);
    indicateChoice(coachservicechoicearray, servicearray, 1);
});

$("#settings-both").click(function () {
    "use strict";
    ServiceCode = 2;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    indicateChoice(coachservicesettingsarray, servicearray, 2);
    indicateChoice(coachservicechoicearray, servicearray, 2);
});

$("#settings-12-hours").click(function () {
    "use strict";
    TwitterHoursBack = 12;
    indicateChoice(twitterhoursbacksettingsarray, twitterhoursbackarray, 0);
});

$("#settings-24-hours").click(function () {
    "use strict";
    TwitterHoursBack = 24;
    indicateChoice(twitterhoursbacksettingsarray, twitterhoursbackarray, 1);
});

$("#settings-48-hours").click(function () {
    "use strict";
    TwitterHoursBack = 48;
    indicateChoice(twitterhoursbacksettingsarray, twitterhoursbackarray, 2);
});

//THE UPDATE BUTTON
$("#go").click(function () {
    "use strict";
    if (DirectionCode !== undefined && MyStopID !== undefined) {
        shoot();
    }
    showInstructionsOrResults();
});

//THE RESET BUTTON
$("#reset").click(function () {
    "use strict";
    DirectionCode = undefined;
    fillDynatext("#destination-dynatext", "Destination");
    MyStopID = undefined;
    fillDynatext("#departure-dynatext", "Departure");
    ServiceCode = 2;
    fillDynatext("#coach-service-dynatext", servicearray[ServiceCode]);
    showInstructionsOrResults();
});

/*CLICKING MENU STUFF SHOWS STUFF*/
$("#coach-times-menu-button").click(function () {
    "use strict";
    showInstructionsOrResults();
});

$("#service-updates-menu-button").click(function () {
    "use strict";
    queryByService(queryTwitter);
    showByService("#details", TwitterResultPanel[0], TwitterResultPanel[1]);
});

$("#links-menu-button").click(function () {
    "use strict";
    showPanels("#links");
});

$("#settings-menu-button").click(function () {
    "use strict";
    indicateChoice(coachservicesettingsarray, servicearray, ServiceCode);
    indicateChoice(coachservicechoicearray, servicearray, ServiceCode);
    showPanels("#settings");
});
