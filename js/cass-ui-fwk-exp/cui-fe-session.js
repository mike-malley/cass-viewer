//**************************************************************************************************
// CASS UI Framework Explorer Session Functions
//**************************************************************************************************

//**************************************************************************************************
// Variables

var repo;
var selectedServer;
var loggedInIdentityName;
var loggedInPk;
var loggedInPkPem;
var loggedInPpkPem;

//**************************************************************************************************
// Repository Intialization
//**************************************************************************************************
function initRepo() {
    debugMessage("Initializing repository...");
    repo = new EcRepository();
    repo.selectedServer = selectedServer;
    debugMessage("Repository initialized.");
}

//**************************************************************************************************
// Identity Intialization
//**************************************************************************************************
function initSessionIdentity() {
    debugMessage("Initializing identity...");
    var eci = new EcIdentity();
    eci.source = selectedServer;
    eci.displayName = loggedInIdentityName;
    var eciPpk = EcPpk.fromPem(loggedInPpkPem);
    eci.ppk = eciPpk;
    EcIdentityManager.ids.push(eci);
    loggedInPk = EcIdentityManager.ids[0].ppk.toPk();
    loggedInPkPem = loggedInPk.toPem();
    debugMessage("Identity intialized:");
    debugMessage("Display Name: " + EcIdentityManager.ids[0].displayName);
    debugMessage("Public Key: " + loggedInPkPem);
}

function setupIdentity(serverParm,nameParm,pemParm) {
    debugMessage("Setting up identity...");
    selectedServer = serverParm;
    initRepo();
    loggedInIdentityName = nameParm;
    loggedInPpkPem = pemParm;
    initSessionIdentity();
    debugMessage("Identity set up.");
}