/*global $*/
/*version 0.8*/

/****VARIABLES****/
/*DIRECTION, DEPARTURE STOP, COACH SERVICE: THREE NUMERICAL CODES ON WHICH LABELS AND PROCESSES ARE BASED*/
var DirectionCode; /*DIRECTION: most important -- all destination-based changes are based on this number. "1" means the journey query being constructed will be from London to Oxford. "0" means the opposite.*/
var MyStopID; /*DEPARTURE: used to select the right value from the arrays. Changes when a departure button is pressed*/
var TimesServiceCode = 2; /*JOURNEY-SERVICE: indicates the service desired. 0 = OT, 1 = X90, 2 = both (default) */
var UpdatesServiceCode = 2; /*UPDATES-SERVICE: indicates the service desired for updates. 0 = OT, 1 = X90, 2 = both (default) */
var UpdatesHoursBackCode = 1; /*UPDATES-HOURS: indicates hours-back desired for updates. 0 = 12, 1 = 24, 2 = 48 */
var OTX90; //"0" (Oxford Tube) or "1" (X90). This variable is almost a duplicate of Service Code.

/*COMMON-NAME VARIABLES FOR DIRECTION, DEPARTURE STOP, COACH SERVICE (USED IN "DETAILS", "CHOICE", AND "SETTINGS" PANELS)*/
var destintextarray = [ "London", "Oxford" ]; /*DESTINATION (DETAILS, CHOICE): constants: containing the two possible destinations*/
var ToLoDepart = [ "Gloucester Green", "Speedwell", "High Street", "St Clement's", "Oxford Brookes", "Headington", "Green Road Roundabout", "Thornhill P&R", "Lewknor Turn" ]; //DEPARTURE (DETAILS, CHOICE): array of names of stops to London
var ToOxDepart = [ "Victoria", "Grosvenor Gardens", "Marble Arch", "Marylebone", "Notting Hill Gate", "Shepherd's Bush", "Hillingdon", "Lewknor Turn", " - " ]; //DEPARTURE (DETAILS, CHOICE): array of names of stops to Oxford
var departurearray = [ToLoDepart, ToOxDepart]; //DEPARTURE: used to select one of prior two arrays depending on direction
var servicearray = [ "Oxford Tube", "X90", "Oxford Tube and X90" ]; //SERVICE (DETAILS, CHOICE, SETTINGS, RESULT): array of services
var updateshoursbackarray = [ "12 hours", "24 hours", "48 hours" ];

/*HTML-ID-NAME VARIABLES FOR DIRECTION, DEPARTURE STOP, COACH SERVICE (USED IN "CHOICE", "SETTINGS", AND "RESULT" PANELS)*/
var departureselectors = [ "#departureselector0", "#departureselector1", "#departureselector2", "#departureselector3", "#departureselector4", "#departureselector5", "#departureselector6", "#departureselector7", "#departureselector8" ]; //DEPARTURE (CHOICE): array containing the HTML ids for Choice Panel list of departure stops
var coachservicechoicearray = [ "#choose-oxford-tube", "#choose-X90", "#choose-both" ]; //JOURNEY-SERVICE (CHOICE): array containing HTML ids for Choice Panel list of coach service (for journey)
var updatescoachservicechoicearray = [ "#choose-updates-oxford-tube", "#choose-updates-X90", "#choose-updates-both" ]; //UPDATES-SERVICE (CHOICE): array containing HTML ids for Choice Panel list of coach service (for updates)
var updateshoursbackchoicearray = [ "#choose-12-hours", "#choose-24-hours", "#choose-48-hours" ]; //UPDATES-HOURS-BACK (CHOICE): array containing HTML ids for Settings Panel list of updates hours back setting
var JourneyResultPanelArray = [ "#resultOT", "#resultX90" ]; //JOURNEY (RESULT): array used to identify desired journey results panels
var UpdatesResultPanelArray = [ "#updatesOT", "#updatesX90" ]; //UDATES (RESULT): array used to identify desired updates results panels

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
var TwitterHoursBack = [12, 24, 48]; //How many hours back in time should the search for relevant twitter posts look
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

var uielements = [ ".ui-panel-journeydetails", ".ui-panel-updatesdetails", ".ui-panel-page-container-c", ".ui-panel-destination-instructions", ".ui-panel-departure-instructions", ".ui-coach-service-instructions", ".ui-updates-coach-service-instructions", ".ui-updates-HoursBack-instructions", ".ui-panel-twitter", ".ui-links", ".ui-panel-menu" ];

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
            $(JourneyResultPanelArray[OTX90]).html(ResultText[OTX90]); //use all this information to change the Result Panel
            $("#last-checked-dynatext").html(LastCheckedText); //last checked info goes in the journeydetails box
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
            $(UpdatesResultPanelArray[OTX90]).empty();
            $(UpdatesResultPanelArray[OTX90]).append(servicearray[OTX90]);
            $(TwitterResponse[OTX90]).each(function () {
                TwitterThresholdCheck[OTX90] = new Date(this.created_at);
                TwitterNow[OTX90] = new Date();
                if ((TwitterThresholdCheck[OTX90] > (TwitterNow[OTX90].setHours(TwitterNow[OTX90].getHours() - TwitterHoursBack[UpdatesHoursBackCode]))) && ((this.text.indexOf(TwitterSearchTerms[OTX90][0][0]) > 0) || (this.text.indexOf(TwitterSearchTerms[OTX90][0][1]) > 0) || (this.text.indexOf(TwitterSearchTerms[OTX90][0][2]) > 0)) && (this.text.indexOf(TwitterSearchTerms[OTX90][1][0]) > 0)) {
                    TwitterTime[OTX90] = this.created_at.substring(0, 19);
                    TwitterTweet[OTX90] = this.text;
                    $(UpdatesResultPanelArray[OTX90]).append("<p style='font-size:small'>" + TwitterTime[OTX90] + ": " + TwitterTweet[OTX90] + "<br></p>");
                }
            });
            $(UpdatesResultPanelArray[OTX90]).append("<p style='font-size:xx-small'><a href='#' id='update'>Update?</a></p><br>");
        }
    };
    TwitterRequest[OTX90].send();
}

/**SHOW AND HIDE**/
function showPanels(PanelsToShow) { /*Hide all panels then show selected ones*/
    "use strict";
    var i;
    for (i = 0; i < uielements.length; i++) {
        $(uielements[i]).css('display', 'none');
    }
    for (i = 0; i < PanelsToShow.length; i++) {
        $(PanelsToShow[i]).css('display', 'block');
    }
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
    showPanels([ ".ui-panel-journeydetails", ".ui-panel-departure-instructions" ]);
}

function showByService(ServiceToShow, DetailsPanel, PanelArray) { //shows details and results panels (depending on coach service selected)
    "use strict";
    if (ServiceToShow === 2) {
        $(PanelArray[1]).css('top', "50%"); //this doesn't really work and there really has to be a better way to get the two panels to follow each other nicely.
        showPanels([ DetailsPanel, PanelArray[0], PanelArray[1] ]);
    } else {
        $(PanelArray[1]).css('top', "20%");
        showPanels([ DetailsPanel, PanelArray[ServiceToShow] ]);
    }
}

function showInstructionsOrResults() { //show relevant instructions if details missing; if none missing, show results
    "use strict";
    if (DirectionCode === undefined) {
        showPanels([ ".ui-panel-journeydetails", ".ui-panel-destination-instructions" ]);
    } else if (MyStopID === undefined) {
        showDepartureInstructions();
    } else {
        showByService(TimesServiceCode, ".ui-panel-journeydetails", JourneyResultPanelArray);
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
    if (TimesServiceCode !== 1) {
        whatquery(0);
    }
    if (TimesServiceCode !== 0) {
        whatquery(1);
    }
}

/**FILL-DYNATEXT FUNCTIONS**/
function fillDynatext(dynatextIDandlabel) { //Takes arrays (dynatextIDandlabel) of the format [dynatextID, label]. Replaces a piece of text (html id: dynatextID) with a new label (label).
    "use strict";
    var j;
    for (j = 0; j < dynatextIDandlabel.length; j++) {
        $(dynatextIDandlabel[j][0]).html(dynatextIDandlabel[j][1]);
    }
}

function shoot() {
    "use strict";
    queryByService(queryRTPI);
    showByService(TimesServiceCode, ".ui-panel-journeydetails", JourneyResultPanelArray);
}

function changeMyStopIDandshoot(NewStopID) {
    "use strict";
    MyStopID = NewStopID;
    fillDynatext([ [ "#departure-dynatext", departurearray[DirectionCode][MyStopID] ] ]);
    shoot();
}

function indicateChoice(ChoiceMatrix) { //Takes arrays (Choice Matrix) of the format [ListToChange, arrayofnames, chosenitem]. It changes the list of options (real names: arrayofnames. html ids: ListToChange) to indicate the item chosen (chosenitem).
    "use strict";
    var j;
    for (j = 0; j < ChoiceMatrix.length; j++) {
        var i;
        for (i = 0; i < ChoiceMatrix[j][0].length; i++) {
            if (i !== ChoiceMatrix[j][2]) {
                $(ChoiceMatrix[j][0][i]).html(ChoiceMatrix[j][1][i] + "  ( )");
            } else {
                $(ChoiceMatrix[j][0][ChoiceMatrix[j][2]]).html(ChoiceMatrix[j][1][ChoiceMatrix[j][2]] + "  (/)");
            }
        }
    }
}

function timesProcedure(DynatextToChange, ArrayContainingNames, CodeToSelectName) {
    "use strict";
    fillDynatext([ [ DynatextToChange, ArrayContainingNames[CodeToSelectName] ] ]);
    showInstructionsOrResults();
}

function updatesProcedure() {
    "use strict";
    fillDynatext([ [ "#updates-coach-service-dynatext", servicearray[UpdatesServiceCode] ], [ "#updates-HoursBack-dynatext", updateshoursbackarray[UpdatesHoursBackCode] ] ]);
    indicateChoice([ [updatescoachservicechoicearray, servicearray, UpdatesServiceCode], [updateshoursbackchoicearray, updateshoursbackarray, UpdatesHoursBackCode] ]);
    queryByService(queryTwitter);
    showByService(UpdatesServiceCode, ".ui-panel-updatesdetails", UpdatesResultPanelArray);
}

function formatSettingsVsChoices(PanelsToChange) { //because the same choice boxes are used for settings panel and for choice panels, need to change their screen height. This does that. PanelsToChange is an array.
    "use strict";
    $(PanelsToChange[0]).css('top', "10%");
    $(PanelsToChange[1]).css('top', "40%");
    $(PanelsToChange[2]).css('top', "70%");
}

/****RULES****/
/*1 -- Clicking the Destination Button changes the destination and returns departure to undefined... */
$("#destination-dynatext").click(function () {
    "use strict";
    DirectionCode = undefined;
    MyStopID = undefined;
    fillDynatext([ [ "#destination-dynatext", "Destination"], [ "#departure-dynatext", "Departure" ] ]);
    showInstructionsOrResults();
});

/*2 -- Clicking the Departure Button returns departure to undefined... */
$("#departure-dynatext").click(function () {
    "use strict";
    MyStopID = undefined;
    fillDynatext([ [ "#departure-dynatext", "Departure" ] ]);
    showInstructionsOrResults();
});

/*3 -- Clicking the Coach Service Button shows coach service selection instructions... */
$("#coach-service-dynatext").click(function () {
    "use strict";
    indicateChoice([[coachservicechoicearray, servicearray, TimesServiceCode]]);
    $(".ui-coach-service-instructions").css('top', "20%");
    showPanels([ ".ui-panel-journeydetails", ".ui-coach-service-instructions" ]);
});

/*3 -- In Updates Panel, clicking the Coach Service Button shows updates coach service selection instructions... */
$("#updates-coach-service-dynatext").click(function () {
    "use strict";
    indicateChoice([[updatescoachservicechoicearray, servicearray, UpdatesServiceCode]]);
    $(".ui-updates-coach-service-instructions").css('top', "20%");
    showPanels([ ".ui-panel-updatesdetails", ".ui-updates-coach-service-instructions" ]);
});

/*3 -- In Updates Panel, clicking the UpdatesHoursBack Button shows UpdatesHoursBack selection instructions... */
$("#updates-HoursBack-dynatext").click(function () {
    "use strict";
    indicateChoice([[updateshoursbackchoicearray, updateshoursbackarray, UpdatesHoursBackCode]]);
    $(".ui-updates-HoursBack-instructions").css('top', "20%");
    showPanels([ ".ui-panel-updatesdetails", ".ui-updates-HoursBack-instructions" ]);
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
    timesProcedure("#destination-dynatext", destintextarray, DirectionCode);
});

$("#choose-london").click(function () {
    "use strict";
    DirectionCode = 0;
    timesProcedure("#destination-dynatext", destintextarray, DirectionCode);
});

$("#choose-oxford-tube").click(function () {
    "use strict";
    TimesServiceCode = 0;
    timesProcedure("#coach-service-dynatext", servicearray, TimesServiceCode);
});

$("#choose-X90").click(function () {
    "use strict";
    TimesServiceCode = 1;
    timesProcedure("#coach-service-dynatext", servicearray, TimesServiceCode);
});

$("#choose-both").click(function () {
    "use strict";
    TimesServiceCode = 2;
    timesProcedure("#coach-service-dynatext", servicearray, TimesServiceCode);
});

$("#choose-updates-oxford-tube").click(function () {
    "use strict";
    UpdatesServiceCode = 0;
    updatesProcedure();
});

$("#choose-updates-X90").click(function () {
    "use strict";
    UpdatesServiceCode = 1;
    updatesProcedure();
});

$("#choose-updates-both").click(function () {
    "use strict";
    UpdatesServiceCode = 2;
    updatesProcedure();
});

$("#choose-12-hours").click(function () {
    "use strict";
    UpdatesHoursBackCode = 0;
    updatesProcedure();
});

$("#choose-24-hours").click(function () {
    "use strict";
    UpdatesHoursBackCode = 1;
    updatesProcedure();
});

$("#choose-48-hours").click(function () {
    "use strict";
    UpdatesHoursBackCode = 2;
    updatesProcedure();
});

//THE UPDATE BUTTON
$("#go").click(function () {
    "use strict";
    if (DirectionCode !== undefined && MyStopID !== undefined) {
        shoot();
    }
    showInstructionsOrResults();
});

$("#update-updates").click(function () {
    "use strict";
    queryByService(queryTwitter);
    showByService(UpdatesServiceCode, ".ui-panel-updatesdetails", UpdatesResultPanelArray);
});

//THE RESET BUTTON
$("#reset").click(function () {
    "use strict";
    DirectionCode = undefined;
    MyStopID = undefined;
    TimesServiceCode = 2;
    fillDynatext([ [ "#destination-dynatext", "Destination" ], [ "#departure-dynatext", "Departure" ], [ "#coach-service-dynatext", servicearray[TimesServiceCode] ] ]);
    showInstructionsOrResults();
});

//Getting to the Menu
$("#menu-panel-button").click(function () {
    "use strict";
    showPanels([ ".ui-panel-menu" ]);
});

/*CLICKING MENU STUFF SHOWS STUFF*/
$("#coach-times-menu-button").click(function () {
    "use strict";
    showInstructionsOrResults();
});

$("#service-updates-menu-button").click(function () {
    "use strict";
    queryByService(queryTwitter);
    showByService(UpdatesServiceCode, ".ui-panel-updatesdetails", UpdatesResultPanelArray);
});

$("#links-menu-button").click(function () {
    "use strict";
    showPanels([ ".ui-links" ]);
});

$("#settings-menu-button").click(function () {
    "use strict";
    indicateChoice([[coachservicechoicearray, servicearray, TimesServiceCode], [updatescoachservicechoicearray, servicearray, UpdatesServiceCode], [updateshoursbackchoicearray, updateshoursbackarray, UpdatesHoursBackCode]]);
    formatSettingsVsChoices([ ".ui-coach-service-instructions", ".ui-updates-coach-service-instructions", ".ui-updates-HoursBack-instructions" ]);
    showPanels([ ".ui-coach-service-instructions", ".ui-updates-coach-service-instructions", ".ui-updates-HoursBack-instructions" ]);
});