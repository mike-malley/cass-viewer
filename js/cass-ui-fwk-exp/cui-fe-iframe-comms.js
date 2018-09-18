//**************************************************************************************************
// CASS UI Framework Explorer iFrame Communication Functions
//**************************************************************************************************

//**************************************************************************************************
// Action Exections
//**************************************************************************************************

function performInitIdentityAction(data) {
    setupIdentity(data.serverParm,data.nameParm,data.pemParm);
}

//**************************************************************************************************
// Message Listener
//**************************************************************************************************

function performAction(action,data) {
    debugMessage("iframe-comms: performAction: " + action);
    switch (action) {
        case "initIdentity":
            performInitIdentityAction(data);
            break;
        default:
            showPageError("Unknown message action: " + action);
            break;
    }
}

var messageListener = function (evt) {
    var data = evt.data;
    if (data != null && data != "") {
        data = JSON.parse(data);
        if (data != null && data != "") {
            if (data.action == null || data.action == "") {
                showPageError("Message data missing the 'action' key: " + data);
            }
            else performAction(data.action,data);
        }
        else {
            showPageError("Could not parse iframe message data as JSON: " + data);
        }
    }
    else {
        showPageError("Could not interpret iframe message data: " + data);
    }
}

if (window.addEventListener) {
    window.addEventListener("message", messageListener, false);
    debugMessage("addEventListener: messageListener");
}
else {
    window.attachEvent("onmessage", messageListener);
    debugMessage("attachEvent: messageListener");
}

//**************************************************************************************************
// Initial Page Load
//**************************************************************************************************
$(document).ready(function () {
    debugMessage("WUTWUT");
    if (queryParams.user == "wait") {
        debugMessage("Recieved user='wait' parameter...");
        showPageAsBusy("Initializing...");
        var message = {
            message: "waiting"
        };
        debugMessage("Responding with :" + message);
        parent.postMessage(message, queryParams.origin);
    }
    else {
        showPageError("Not sure what to do...");
    }
});