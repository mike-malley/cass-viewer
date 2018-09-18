//**************************************************************************************************
// CASS UI Framework Explorer Utility Functions
//**************************************************************************************************

//TODO implement goToDisplayRoot

//**************************************************************************************************
// Constants

const DEBUG_CONSOLE = true;
const DEBUG_ALERT = false;

const FRAMEWORK_EXP_THEME_CLASS = "theme-burgendy";

// Page Element IDs
const CASSUI_MAIN_BUSY_CTR = "#cassUiMainBusyContainer";
const CASSUI_MAIN_BUSY_TXT = "#cassUiMainBusyText";
const CASSUI_MAIN_ERR_CTR = "#cassUiMainErrorContainer";
const CASSUI_MAIN_ERR_TXT = "#cassUiMainErrorText";
const CASSUI_HIGH_LVL_WARNING = ".cassUiHighLevelWarning";
const CASSUI_MAIN_CONTENTS_CTR = "#cassUiMainContentsContainer";
const SHOW_GRAPH_VIEW_BTN = "#showGraphViewBtn";
const SHOW_LIST_VIEW_BTN = "#showListViewBtn";
const FRAMEWORK_EXP_MENU = "#frameworkExplorerMenu";
const FWK_CONT_SRCH_CTR = "#frameworkContentsSearchContainer";
const FWK_CONT_SRCH_INPT = "#frameworkContentsSearchInput";
const FRAMEWORK_EXP_NAME = "#frameworkExplorerName";
const NO_FRAMEWORKS_AVAILABLE_CTR = "#noFrameworksAvailableWarningContainer";
const CIRC_DEPEND_WARNING_CTR = "#circularDependencyWarningContainer";
const OPEN_FWK_SRCH_INPT = "#openFrameworkSearchInput";

// Modal IDs
const OPEN_FWK_MODAL = "#modal-open-framework";

//**************************************************************************************************
// Variables

var currentScreen;

//**************************************************************************************************
// Utility Functions
//**************************************************************************************************

queryParams = function () {
    if (window.document.location.search == null)
        return {};
    var hashSplit = (window.document.location.search.split("?"));
    if (hashSplit.length > 1) {
        var o = {};
        var paramString = hashSplit[1];
        var parts = (paramString).split("&");
        for (var i = 0; i < parts.length; i++)
            o[parts[i].split("=")[0]] = decodeURIComponent(parts[i].replace(parts[i].split("=")[0] + "=", ""));
        return o;
    }
    return {};
};

queryParams = queryParams();

function debugMessage(msg) {
    if (DEBUG_CONSOLE) console.log(msg);
    if (DEBUG_ALERT) alert(msg);
}

function showScreen(newScreen) {
    $('.screen:visible').fadeOut('fast', function () {
        $('#' + newScreen).fadeIn('fast');
    });
}

function showPageMainContentsContainer() {
    if (!$(CASSUI_MAIN_CONTENTS_CTR).is(":visible")) {
        $(CASSUI_MAIN_BUSY_CTR).hide();
        $(CASSUI_MAIN_ERR_CTR).hide();
        $(CASSUI_MAIN_CONTENTS_CTR).show();
    }
}

function hidePageMainContentsContainer() {
    $(CASSUI_MAIN_CONTENTS_CTR).hide();
}

function showListViewMainContentsScreen() {
    showPageMainContentsContainer();
    showScreen("list-screen");
    currentScreen = "list-screen";
}

function showGraphViewMainContentsScreen() {
    showPageMainContentsContainer();
    showScreen("graph-screen");
    $("html, body").animate({ scrollTop: 0 }, 500);
    currentScreen = "graph-screen";
}

function showPageAsBusy(text) {
    $(CASSUI_MAIN_ERR_CTR).hide();
    $(CASSUI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(CASSUI_MAIN_BUSY_TXT).html(text);
    $(CASSUI_MAIN_BUSY_CTR).show();
}

function showPageError(text) {
    $(CASSUI_MAIN_BUSY_CTR).hide();
    $(CASSUI_HIGH_LVL_WARNING).hide();
    hidePageMainContentsContainer();
    $(CASSUI_MAIN_ERR_TXT).html(text);
    $(CASSUI_MAIN_ERR_CTR).show();
    disableViewToggleButtons();
}

function showFrameworkExplorerMenu() {
    $(FRAMEWORK_EXP_MENU).show();
}

function disableViewToggleButtons() {
    $(SHOW_GRAPH_VIEW_BTN).attr("disabled", "true");
    $(SHOW_LIST_VIEW_BTN).attr("disabled", "true");
}

function enableViewToggleButtons() {
    $(SHOW_GRAPH_VIEW_BTN).removeAttr("disabled");
    $(SHOW_LIST_VIEW_BTN).removeAttr("disabled");
}

function hideFrameworkContentsSearchBar() {
    $(FWK_CONT_SRCH_CTR).hide();
}

function showFrameworkContentsSearchBar() {
    $(FWK_CONT_SRCH_CTR).show();
}

function clearFrameworkContentsSearchBar() {
    $(FWK_CONT_SRCH_INPT).val("");
}

function setPageColorTheme() {
    $('body').addClass(FRAMEWORK_EXP_THEME_CLASS);
}

function setPageFrameworkExplorerName(name) {
    $(FRAMEWORK_EXP_NAME).html(name);
}

function showNoFrameworksAvailableWarning() {
    $(CASSUI_MAIN_BUSY_CTR).hide();
    $(CASSUI_MAIN_ERR_CTR).hide();
    $(CASSUI_HIGH_LVL_WARNING).hide();
    setPageFrameworkExplorerName("No frameworks available");
    $(NO_FRAMEWORKS_AVAILABLE_CTR).show();
}

function showFrameworkHasCircularDependencyWarning() {
    $(CASSUI_MAIN_BUSY_CTR).hide();
    $(CASSUI_MAIN_ERR_CTR).hide();
    $(CASSUI_HIGH_LVL_WARNING).hide();
    $(CIRC_DEPEND_WARNING_CTR).show();
}

function clearOpenFrameworkSearchBar() {
    $(OPEN_FWK_SRCH_INPT).val("");
}

function goToDisplayRoot() {
    //TODO implement goToDisplayRoot
    alert("IMPLEMENT goToDisplayRoot");
    // if (hasFinishedLoading) {
    //     //Node ID for a framework is its name..since that is the only node with a name ID, it should be fine...
    //     zoomExpCgByD3NodeId(currentFrameworkName, true);
    // }
}

//**************************************************************************************************
// JQuery Functions
//**************************************************************************************************

jQuery.fn.scrollTo = function (elem, speed) {
    $(this).animate({
        scrollTop: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top
    }, speed == undefined ? 1000 : speed);
    return this;
};

//**************************************************************************************************
// Foundation
//**************************************************************************************************

$(document).foundation();
