//**************************************************************************************************
// CASS UI Framework Explorer Main Functions
//**************************************************************************************************

//**************************************************************************************************
// Constants

const CREATE_IMPLIED_RELATIONS_ON_COLLAPSE = true;

//**************************************************************************************************
// Variables

var availableFrameworkList = [];
var frameworkdIdFrameworkMap = {};
var frameworkNameFrameworkMap = {};

var currentFrameworkName;
var currentFrameworkId;
var currentFrameworkFull;
var currentFrameworkRelatedFrameworks;

var userOwnsCurrentFramework;

//**************************************************************************************************
// Utility Functions
//**************************************************************************************************

function getFirstFrameworkIdForName(name) {
    if (name) {
        var n = name.trim();
        if (frameworkNameFrameworkMap[n] && frameworkNameFrameworkMap[n].length > 0) {
            return frameworkNameFrameworkMap[n][0].shortId();
        }
    }
    return null;
}

function getFrameworkName(frameworkId) {
    var fw = frameworkdIdFrameworkMap[frameworkId];
    if (fw) return fw.name;
    else return "Framework not found";
}

function getFrameworkDescription(frameworkId) {
    var fw = frameworkdIdFrameworkMap[frameworkId];
    if (fw) return fw.description;
    else return "";
}

//**************************************************************************************************
// Open Framework Auto Complete/Modal
//**************************************************************************************************

function openFrameworkOpenModal() {
    clearOpenFrameworkSearchBar();
    $(OPEN_FWK_MODAL).foundation('open');
}

function buildOpenFrameworkSearchAutoCompleteData() {
    var data = [];
    for (var frameworkId in frameworkdIdFrameworkMap) {
        if (frameworkdIdFrameworkMap.hasOwnProperty(frameworkId)) {
            data.push({
                label:frameworkdIdFrameworkMap[frameworkId].name,
                value:frameworkId
            });
        }
    }
    return data;
}

function fillInOpenFrameworkSearchAutoComplete() {
    $(OPEN_FWK_SRCH_INPT).autocomplete({
        appendTo: OPEN_FWK_MODAL,
        source: buildOpenFrameworkSearchAutoCompleteData(),
        select: function (event, ui) {
            event.preventDefault();
            $(OPEN_FWK_SRCH_INPT).val(ui.item.label);
            $(OPEN_FWK_SRCH_INPT).autocomplete("close");
            $(OPEN_FWK_MODAL).foundation('close');
            loadAndOpenFramework(ui.item.value);
        },
        focus: function(event, ui) {
            event.preventDefault();
            $(OPEN_FWK_SRCH_INPT).val(ui.item.label);
        }
    });
}

function checkForOpenFrameworkSearchbarEnter(event) {
    if (event.which == 13 || event.keyCode == 13) {
        var firstFwId = getFirstFrameworkIdForName($(OPEN_FWK_SRCH_INPT).val().trim());
        if (firstFwId) {
            $(OPEN_FWK_SRCH_INPT).autocomplete("close");
            $(OPEN_FWK_MODAL).foundation('close');
            loadAndOpenFramework(firstFwId);
        }
    }
}

//**************************************************************************************************
// Framework Display Preparation
//**************************************************************************************************

function prepForFrameworkDisplay(fnpg) {
    //TODO left off here

    // buildFrameworkCompetencyClusterNodeData(fnpg);
    // buildCurrentD3FrameworkNode();
    // buildFrameworkDisplays();
}

//**************************************************************************************************
// Framework Collapsing
//**************************************************************************************************

function doesFrameworkHaveCircularDependency(fnpg) {
    for (var i=0;i<fnpg.getNodePacketList().length;i++) {
        var np = fnpg.getNodePacketList()[i];
        if (np.getNodeCount() > 1) return true;
    }
    return false;
}

function frameworkCollapsedCorrectly(fnpg) {
    if (!fnpg || fnpg == null || fnpg.getNodePacketList() == null || fnpg.getNodePacketList().length == 0) {
        return false;
    }
    return true;
}

function handleCollapseFrameworkSuccess(frameworkId,fnpg) {
    debugMessage("Framework collapsed:" + frameworkId);
    debugMessage(fnpg);
    if (!frameworkCollapsedCorrectly(fnpg)) {
        showPageError("Could not determine framework competencies.  Check framework permissions.");
    }
    else if (doesFrameworkHaveCircularDependency(fnpg)) {
        showFrameworkHasCircularDependencyWarning();
    }
    else {
        //frameworkNodePacketGraph = fnpg;
        prepForFrameworkDisplay(fnpg);
    }
}

function handleCollapseFrameworkFailure(err) {
    showPageError("Could not collapse framework (" + getFrameworkName(currentFrameworkId) + "): " + err);
}

function collapseCurrentFramework() {
    showPageAsBusy("Collapsing framework...");
    var fc = new FrameworkCollapser();
    fc.collapseFramework(repo, currentFrameworkFull, CREATE_IMPLIED_RELATIONS_ON_COLLAPSE, handleCollapseFrameworkSuccess, handleCollapseFrameworkFailure);
}

//**************************************************************************************************
// Selected Framework Loading
//**************************************************************************************************

function handleFetchFrameworkSuccess(framework) {
    currentFrameworkFull = framework;
    userOwnsCurrentFramework = currentFrameworkFull.hasOwner(loggedInPk);
    collapseCurrentFramework();
}

function handleFetchFrameworkFailure(err) {
    showPageError("Could not fetch framework (" + getFrameworkName(currentFrameworkId) + "): " + err);
}

function findCurrentFrameworkRelatedFrameworks() {
    currentFrameworkRelatedFrameworks = [];
    var curFw = frameworkdIdFrameworkMap[currentFrameworkId];
    if (curFw){
        var curFwRels =  curFw.relation;
        if (curFwRels) {
            for (var i=0;i<curFwRels.length;i++) {
                for (var frameworkId in frameworkdIdFrameworkMap) {
                    if (frameworkdIdFrameworkMap.hasOwnProperty(frameworkId) && frameworkId != currentFrameworkId && !currentFrameworkRelatedFrameworks.includes(frameworkId)) {
                        var lkFwRels = frameworkdIdFrameworkMap[frameworkId].relation;
                        if(lkFwRels && lkFwRels.includes(curFwRels[i])) {
                            currentFrameworkRelatedFrameworks.push(frameworkId);
                        }
                    }
                }
            }
        }
    }
}

function loadAndOpenFramework(frameworkId) {
    //showAllCassUiPageMenus();
    showFrameworkExplorerMenu();
    disableViewToggleButtons();
    hideFrameworkContentsSearchBar();
    showGraphViewMainContentsScreen();
    currentFrameworkId = frameworkId;
    currentFrameworkName = getFrameworkName(currentFrameworkId);
    setPageFrameworkExplorerName(currentFrameworkName);
    showPageAsBusy("Finding related frameworks...");
    findCurrentFrameworkRelatedFrameworks();
    showPageAsBusy("Loading framework data...");
    EcFramework.get(currentFrameworkId, handleFetchFrameworkSuccess, handleFetchFrameworkFailure);
}

//**************************************************************************************************
// Available Framework Fetching
//**************************************************************************************************

function createSortedAvailableFrameworkList(ownedFrameworkList,unownedFrameworkList) {
    availableFrameworkList = [];
    ownedFrameworkList.sort(function (a, b) {return a.name.localeCompare(b.name);});
    unownedFrameworkList.sort(function (a, b) {return a.name.localeCompare(b.name);});
    for (var i=0;i<ownedFrameworkList.length;i++) {
        availableFrameworkList.push(ownedFrameworkList[i]);
    }
    for (var i=0;i<unownedFrameworkList.length;i++) {
        availableFrameworkList.push(unownedFrameworkList[i]);
    }
}

function buildFrameworkLists(arrayOfEcFrameworks) {
    var ownedFrameworkList = [];
    var unownedFrameworkList = [];
    frameworkdIdFrameworkMap = {};
    for (var i=0;i<arrayOfEcFrameworks.length;i++) {
        var cecf = arrayOfEcFrameworks[i];
        if (cecf.name && cecf.name.trim().length > 0) {
            frameworkdIdFrameworkMap[cecf.shortId()] = cecf;
            if (!frameworkNameFrameworkMap[cecf.name.trim()]) {
                frameworkNameFrameworkMap[cecf.name.trim()] = [];
            }
            frameworkNameFrameworkMap[cecf.name.trim()].push(cecf);
            if (cecf.hasOwner(loggedInPk)) {
                ownedFrameworkList.push(cecf);
            }
            else unownedFrameworkList.push(cecf);
        }
    }
    if ((ownedFrameworkList.length + unownedFrameworkList.length) <= 0) {
        showNoFrameworksAvailableWarning();
    }
    else {
        showPageError("CONTINUE CODING");
        createSortedAvailableFrameworkList(ownedFrameworkList,unownedFrameworkList);
        loadAndOpenFramework(availableFrameworkList[0].shortId());
    }
}

function handleFetchFrameworksFromRepositorySuccess(arrayOfEcFrameworks) {
    buildFrameworkLists(arrayOfEcFrameworks);
    fillInOpenFrameworkSearchAutoComplete();
}

function handleFetchFrameworksFromRepositoryFailure(err) {
    showPageError("Could not fetch framework list: " + err);
}

function fetchAvailableFrameworks() {
    showFrameworkExplorerMenu();
    //showAllCassUiPageMenus();
    disableViewToggleButtons();
    hideFrameworkContentsSearchBar();
    showGraphViewMainContentsScreen();
    setPageFrameworkExplorerName("Loading...");
    showPageAsBusy("Loading available frameworks...");
    EcFramework.search(repo, null, handleFetchFrameworksFromRepositorySuccess, handleFetchFrameworksFromRepositoryFailure, {});
}


//**************************************************************************************************
// Page Load
//**************************************************************************************************

function loadPageContents() {
    setPageColorTheme();
    fetchAvailableFrameworks();
}
