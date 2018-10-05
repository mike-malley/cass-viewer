//**************************************************************************************************
// CASS UI Framework Explorer Main Functions
//**************************************************************************************************

//TODO implement prepFrameworkAlignmentWithFrameworkIds
//TODO addChildToGraphProfileSummary construct list view for multi node competency cluster
//TODO addChildToListView construct list view for multi node competency cluster
//TODO showCircleGraphSidebarDetails handle multi node packets
//TODO implement openAlignmentSetupModal
//todo implement openShareFrameworkModal
//todo implement openPublishFrameworkModal

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

var currentFrameworkCompetencyData;

var currentD3FrameworkNode;
var currentD3FrameworkNodeString;

var zoomToCompetencyOnOpen = false;
var screenToZoomOnOpen;
var compNameToZoom;
var competencyIdToSave;

var hasFinishedLoading;

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

//yes...this first if is weird...but it is an easy solution to a problem
// specifically if trying to get the competency name for a D3 circle ID and that D3 circle is the
// outer framework circle...
function getCompetencyName(compId) {
    if (compId == currentFrameworkName) return currentFrameworkName;
    if (currentFrameworkCompetencyData.competencyPacketDataMap[compId]) {
        return currentFrameworkCompetencyData.competencyPacketDataMap[compId].name;
    }
    else return "";
}

function getCassNodePacket(packetId) {
    if (currentFrameworkCompetencyData && currentFrameworkCompetencyData.competencyPacketDataMap &&
        currentFrameworkCompetencyData.competencyPacketDataMap[packetId]) {
        return currentFrameworkCompetencyData.competencyPacketDataMap[packetId].cassNodePacket;
    }
    else return null;
}

function getCompetencyD3NodeTracker(trackerId) {
    if (currentFrameworkCompetencyData && currentFrameworkCompetencyData.competencyD3NodeTrackerMap &&
        currentFrameworkCompetencyData.competencyD3NodeTrackerMap[trackerId]) {
        return currentFrameworkCompetencyData.competencyD3NodeTrackerMap[trackerId];
    }
    else return null;
}

function checkForFrameworkContentsSearchbarEnter(event) {
    if (event.which == 13 || event.keyCode == 13) {
        $(FWK_CONT_SRCH_INPT).autocomplete("close");
        findItemByFrameworkContentsSearchBar($(FWK_CONT_SRCH_INPT).val().trim());
    }
}

function openAlignmentSetupModal() {
    //TODO implement openAlignmentSetupModal
    alert("TODO openAlignmentSetupModal");
}

function prepFrameworkAlignmentWithFrameworkIds(fw1Id, fw2Id, forceDataRefresh) {
    //TODO implement prepFrameworkAlignmentWithFrameworkIds
    alert("TODO prepFrameworkAlignmentWithFrameworkIds");
}

//**************************************************************************************************
// Explorer Circle Graph Supporting Functions
//**************************************************************************************************

//d.data.name should be the competency ID or the framework name if the circle is the outer circle....
function getExplorerCgCircleText(d) {
    if (!d || !d.data || !d.data.name) return "UNDEFINED 'D'";
    else if (currentFrameworkCompetencyData.competencyD3NodeTrackerMap[d.data.name]) {
        var text = getCompetencyName(d.data.name);
        if (text == "") text = "UNDEFINED NODE PACKET";
        return text;
    }
    return "UNDEFINED NAME";
}

//**************************************************************************************************
// Share/Publish Framework Modal
//**************************************************************************************************

// function handleSaveFrameworkForShareSuccess() {
//     $(FWK_SHARE_BUSY_CTR).hide();
//     $(FWK_SHARE_MODAL).foundation('close');
// }
//
// function handleSaveFrameworkForShareFailure(err) {
//     $(FWK_SHARE_BUSY_CTR).hide();
//     $(FWK_SHARE_ERROR_TXT).html(err);
//     $(FWK_SHARE_ERROR_CTR).show();
// }
//
// function setFrameworkShareState() {
//     for (var i=0;i<contactDisplayList.length;i++) {
//         var cdo = contactDisplayList[i];
//         if (cdo.pkPem != loggedInPkPem){
//             var editCheckBoxId = buildFrameworkShareEditCheckBoxId(cdo.pkPem);
//             var viewCheckBoxId = buildFrameworkShareViewCheckBoxId(cdo.pkPem);
//             var isAssignedEdit = $("#" + editCheckBoxId).prop("checked");
//             var isAssignedView = $("#" + viewCheckBoxId).prop("checked");
//             if (isAssignedEdit) currentFrameworkFull.addOwner(cdo.pk);
//             else currentFrameworkFull.removeOwner(cdo.pk);
//             if (isAssignedView) currentFrameworkFull.addReader(cdo.pk);
//             else currentFrameworkFull.removeReader(cdo.pk);
//         }
//     }
// }
//
// function saveFrameworkShare() {
//     $(FWK_SHARE_BUSY_CTR).show();
//     setFrameworkShareState();
//     currentFrameworkFull.save(handleSaveFrameworkForShareSuccess,handleSaveFrameworkForShareFailure,repo);
// }
//
// function buildFrameworkShareContactListLineItem(cntName,viewCheckBoxId,editCheckBoxId,viewChecked,editChecked) {
//     var cntLi = $("<li/>");
//     var cntGridDiv = $("<div/>");
//     cntGridDiv.addClass("grid-x");
//     var cntNameLi  = $("<div/>");
//     cntNameLi.addClass("cell medium-8");
//     cntNameLi.html("<span>" + cntName + "</span>");
//     cntGridDiv.append(cntNameLi);
//     var cntViewDiv  = $("<div/>");
//     cntViewDiv.addClass("cell medium-2 centerText");
//     var cntViewDivHtml = "<input id=\"" + viewCheckBoxId + "\" type=\"checkbox\"";
//     if (viewChecked) cntViewDivHtml += " checked ";
//     cntViewDivHtml += "></input>";
//     cntViewDiv.html(cntViewDivHtml);
//     cntGridDiv.append(cntViewDiv);
//     var cntEditDiv  = $("<div/>");
//     cntEditDiv.addClass("cell medium-2 centerText");
//     var cntEditDivHtml = "<input id=\"" + editCheckBoxId + "\" type=\"checkbox\"";
//     if (editChecked) cntEditDivHtml += " checked ";
//     cntEditDivHtml += "></input>";
//     cntEditDiv.html(cntEditDivHtml);
//     cntGridDiv.append(cntEditDiv);
//     cntLi.append(cntGridDiv);
//     return cntLi;
// }
//
// function buildFrameworkShareEditCheckBoxId(contPkPem) {
//     return FWK_SHARE_CONT_ED_CB_ID_PREFIX + buildIDableString(contPkPem);
// }
//
// function buildFrameworkShareViewCheckBoxId(contPkPem) {
//     return FWK_SHARE_CONT_VW_CB_ID_PREFIX + buildIDableString(contPkPem);
// }
//
// function buildContactListForFrameworkShare() {
//     $(FWK_SHARE_CONT_LIST).empty();
//     for (var i=0;i<contactDisplayList.length;i++) {
//         var cdo = contactDisplayList[i];
//         if (cdo.pkPem != loggedInPkPem && !cdo.hide){
//             var cntName = cdo.displayName;
//             var editCheckBoxId = buildFrameworkShareEditCheckBoxId(cdo.pkPem);
//             var viewCheckBoxId = buildFrameworkShareViewCheckBoxId(cdo.pkPem);
//             var viewChecked = currentFrameworkFull.hasReader(cdo.pk);;
//             var editChecked = currentFrameworkFull.hasOwner(cdo.pk);
//             var cntLi = buildFrameworkShareContactListLineItem(cntName,viewCheckBoxId,editCheckBoxId,viewChecked,editChecked);
//             $(FWK_SHARE_CONT_LIST).append(cntLi);
//         }
//     }
// }
//
// function setUpFrameworkShareModalView() {
//     $(FWK_SHARE_BUSY_CTR).hide();
//     $(FWK_SHARE_ERROR_CTR).hide();
//     $(FWK_SHARE_FWK_NAME).html(currentFrameworkName);
//     if (contactDisplayList && contactDisplayList.length > 0) {
//         buildContactListForFrameworkShare();
//         $(FWK_SHARE_NO_CONT_CTR).hide();
//         $(FWK_SHARE_CONT_LIST_HDR_CTR).show();
//         $(FWK_SHARE_CONT_LIST_CTR).show();
//         $(FWK_SHARE_SAVE_BTN).show();
//     }
//     else {
//         $(FWK_SHARE_CONT_LIST_HDR_CTR).hide();
//         $(FWK_SHARE_CONT_LIST_CTR).hide();
//         $(FWK_SHARE_SAVE_BTN).hide();
//         $(FWK_SHARE_NO_CONT_CTR).show();
//     }
// }

function openShareFrameworkModal() {
    //todo implement openShareFrameworkModal
    alert("TODO implement openShareFrameworkModal");
    // setUpFrameworkShareModalView();
    // $(FWK_SHARE_MODAL).foundation('open');
}

// function isValidPublishDataFromFrameworkPublish() {
//     var dest = $(FWK_PUBLISH_DEST).val();
//     if (!dest || dest.length == 0) {
//         $(FWK_PUBLISH_ERROR_TXT).html("You must select at least one destination");
//         $(FWK_PUBLISH_ERROR_CTR).show();
//         return false;
//     }
//     return true;
// }
//
// //This function doesn't really do anything at the moment
// // Just a place holder for future functionality
// function saveFrameworkPublish() {
//     $(FWK_PUBLISH_ERROR_CTR).hide();
//     if (isValidPublishDataFromFrameworkPublish()) {
//         $(FWK_PUBLISH_BUSY_TXT).html("Publishing Frameworks...");
//         $(FWK_PUBLISH_BUSY_CTR).show();
//         setTimeout(function() {$(FWK_PUBLISH_BUSY_CTR).hide();}, 3000);
//     }
// }
//
// function setUpFrameworkPublishModalView() {
//     $(FWK_PUBLISH_DEST).val([]);
//     $(FWK_PUBLISH_DEST + ":selected").prop("selected", false);
//     $(FWK_PUBLISH_BUSY_CTR).hide();
//     $(FWK_PUBLISH_ERROR_CTR).hide();
//     $(FWK_PUBLISH_FWK_NAME).html(currentFrameworkName);
// }

function openPublishFrameworkModal() {
    //todo implement openPublishFrameworkModal
    alert("TODO implement openPublishFrameworkModal");
    // setUpFrameworkPublishModalView();
    // $(FWK_PUBLISH_MODAL).foundation('open');
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
// Framework Contents Search Auto Complete
//**************************************************************************************************

function findItemByFrameworkContentsSearchBar(selectedValue) {
    if (competencySearchAutoCompleteMap.hasOwnProperty(selectedValue)) {
        if ($(GRAPH_SCREEN).attr("style").indexOf("none") < 0) {
            zoomExpCircleGraphByAutoComplete(selectedValue);
        } else {
            scrollToCompInListView(selectedValue);
        }
    }
}

function buildFrameworkContentsSearchAutoCompleteDataFromAutoCompleteMap() {
    var data = [];
    for (var property in competencySearchAutoCompleteMap) {
        if (competencySearchAutoCompleteMap.hasOwnProperty(property)) {
            if (property != "Framework not found") data.push(property);
        }
    }
    return data;
}

function fillInFrameworkContentsSearchAutoComplete() {
    $(FWK_CONT_SRCH_INPT).autocomplete({
        source: buildFrameworkContentsSearchAutoCompleteDataFromAutoCompleteMap(),
        select: function (event, ui) {
            findItemByFrameworkContentsSearchBar(ui.item.label);
        }
    });
}

//**************************************************************************************************
// List View
//**************************************************************************************************

function expandListViewToObject(expObj) {
    if (expObj.hasClass("collapsed") || expObj.hasClass("expanded")) {
        expObj.removeClass('collapsed').addClass('expanded');
        expObj.children('.title').children('.fa-li').removeClass('fa-caret-right').addClass('fa-caret-down');
        if (expObj.parent("ul") && expObj.parent("ul").hasClass("fa-ul")) {
            expObj.parent("ul").attr('style', 'display:block');
        }
        if (expObj.parent("ul").parent("li")) {
            expandListViewToObject(expObj.parent("ul").parent("li"));
        }
    }
}

function expandListViewToName(name) {
    var obj = $("#" + buildIDableString(name) + "_lvi");
    obj.attr('style', 'display:block');
    if (obj.parent("ul") && obj.parent("ul").hasClass("fa-ul")) {
        obj.parent("ul").attr('style', 'display:block');
    }
    if (obj.parent("ul").parent("li")) {
        expandListViewToObject(obj.parent("ul").parent("li"));
    }
}

function scrollToCompInListView(compName) {
    if ($('#' + buildIDableString(compName) + "_lvi").length > 0) {
        expandListViewToName(compName);
        $('html, body').animate({
            scrollTop: ($('#' + buildIDableString(compName) + "_lvi").offset().top - LIST_VIEW_SCROLL_ITEM_OFFSET)
        }, 500);
    }
}

function generateCompetencyLineItemHtmlForListView(cpt, compNode, hasChildren) {
    var liHtml = "<span class=\"competency-type\">" +
        "<a onclick=\"showCompetencyDetailsModal('" + compNode.getId().trim() + "');\">" +
        "<i class=\"fa fa-info-circle\" title=\"Show more details\" aria-hidden=\"true\"></i></a></span>" +
        "<h4 class=\"title\">";
    if (hasChildren) liHtml += "<i class=\"fa-li fa fa-caret-right\"></i>";
    if (compNode.getName() != null) liHtml += compNode.getName().trim() + "</h4>";
    else liHtml += "</h4>";
    if (compNode.getDescription() != null) liHtml += "<p>" + compNode.getDescription().trim() + "</p>";
    return liHtml;
}

//TODO addChildToListView construct list view for multi node competency cluster
function addChildToListView(parentUl, childCcn) {
    var childLi = $("<li/>");
    var cpt = currentFrameworkCompetencyData.competencyPacketDataMap[childCcn.id];
    if (cpt.cassNodePacket.getNodeList().length > 1) childLi.html("<i>TODO: construct list view for multi node competency cluster</i>");
    else {
        var compNode = cpt.cassNodePacket.getNodeList()[0];
        if (childCcn.children && childCcn.children.length > 0) childLi.addClass("collapsed");
        childLi.attr("id", buildIDableString(compNode.getName().trim()) + "_lvi");
        var hasChildren = childCcn.children && childCcn.children.length > 0;
        childLi.html(generateCompetencyLineItemHtmlForListView(cpt, compNode, hasChildren));
        if (hasChildren) {
            childCcn.children.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            var childsChildUl = $("<ul/>");
            childsChildUl.attr("class", "fa-ul");
            childsChildUl.attr("style", "display:none");
            $(childCcn.children).each(function (i, cc) {
                addChildToListView(childsChildUl, cc);
            });
            childLi.append(childsChildUl);
        }
    }
    parentUl.append(childLi);
}

function addFrameworkCompetenciesToListView() {
    $(FWK_CONTENTS_LIST).empty();
    var d3fn = currentD3FrameworkNode;
    if (!d3fn || d3fn == null) return;
    if (d3fn.children && d3fn.children.length > 0) {
        d3fn.children.sort(function (a, b) {return a.name.localeCompare(b.name);});
        $(d3fn.children).each(function (i, c) {
            addChildToListView($(FWK_CONTENTS_LIST), c);
        });
    }
}

function buildListView() {
    addFrameworkCompetenciesToListView();
    setCompetencyListViewActions();
}

//**************************************************************************************************
// Graph View Sidebar (Right-Hand Side)
//**************************************************************************************************

//d.data.name should be the competency ID or the framework name if the circle is the outer circle....
function addCompetencyGraphSidebarParentToList(cl, d3Node) {
    if (d3Node.parent) {
        var compName = getCompetencyName( d3Node.parent.data.name.trim());
        var cLiHtml = " <li title=\"Find '" + escapeSingleQuote(compName) + "'\" onclick=\"zoomExpCgByD3NodeId('" + d3Node.parent.data.name.trim() + "',true)\">" +
            "<i class=\"fa-li fa fa-arrow-circle-up\"></i><a><strong>" + compName + "</strong></a></li>";
        cl.append(cLiHtml);
    }
}

//d.data.name should be the competency ID or the framework name if the circle is the outer circle....
function addCompetencyGraphSidebarChildrenToList(cl, d3Node) {
    if (d3Node.children) {
        $(d3Node.children).each(function (i, c) {
            var compName = getCompetencyName(c.data.name.trim());
            var cLiHtml = " <li title=\"Find '" + escapeSingleQuote(compName) + "'\" onclick=\"zoomExpCgByD3NodeId('" + c.data.name.trim() + "',true)\">" +
                "<i class=\"fa-li fa fa-arrow-circle-o-right\"></i><a>" + compName + "</a></li>";
            cl.append(cLiHtml);
        });
    }
}

function buildCompetencyGraphSidebarRelatedList(d3Node) {
    var cl = $(CIR_FCS_DTL_REL_LIST);
    cl.empty();
    if (d3Node && (d3Node.children || d3Node.parent)) {
        addCompetencyGraphSidebarParentToList(cl, d3Node);
        addCompetencyGraphSidebarChildrenToList(cl, d3Node);
    }
}

function showCompetencyGraphSidebarSingleNodePacketDetails(cpt) {
    var compNode = cpt.cassNodePacket.getNodeList()[0];
    scrollCompNodeInGraphViewSummary(compNode);
    $(CIR_FCS_COMP_TOOLS).show();
    $(CIR_FCS_DTL_COMP_DTL_LINK).off("click").click(function () {
        showCompetencyDetailsModal(compNode.getId().trim());
    });
    $(CIR_FCS_DTL_SING_NAME).html(compNode.getName().trim());
    if (compNode.getDescription() && compNode.getDescription().trim().length > 0) {
        $(CIR_FCS_DTL_SING_DESC).html(compNode.getDescription().trim());
    }
    else $(CIR_FCS_DTL_SING_DESC).html("<i>No description available</i>");
    //use the D3Node instead of the competencyPacketData here because the root competencies point back to the framework as a parent
    var d3n = currentFrameworkCompetencyData.competencyD3NodeTrackerMap[cpt.id];
    buildCompetencyGraphSidebarRelatedList(d3n.d3Node);
    showCircleSidebarDetails();
}

//TODO showCircleGraphSidebarDetails handle multi node packets
function showCircleGraphSidebarDetails(compId) {
    hideCirlceSidebarDetails();
    if (!compId || compId == null) return;
    var cpt = currentFrameworkCompetencyData.competencyPacketDataMap[compId];
    if (!cpt || cpt == null) debugMessage("Cannot locate competency tracker for: " + compId);
    else if (cpt.isFramework) {
        hideCirlceSidebarDetails();
        removeAllGraphViewSummaryHighLighting();
    }
    else {
        if (!cpt.cassNodePacket || cpt.cassNodePacket == null) debugMessage("cpt.cassNodePacket is null: " + compId);
        else if (!cpt.cassNodePacket.getNodeList() || cpt.cassNodePacket.getNodeList() == null) debugMessage("cpt.cassNodePacket.getNodePacketList() is null: " + compId);
        else if (cpt.cassNodePacket.getNodeList().length == 1) showCompetencyGraphSidebarSingleNodePacketDetails(cpt);
        //else showCompetencyGraphSidebarMultiNodePacketDetails(cpt);
    }
}

//**************************************************************************************************
// Graph View Summary (Left-Hand Side)
//**************************************************************************************************

function expandGraphViewSummaryToObject(expObj) {
    if (expObj.hasClass("gpsiChild")) {
        expObj.attr("style", "display:block");
        if (expObj.parent().children().eq(0) && expObj.parent().children().eq(0).find("i:first")) {
            var ic = expObj.parent().children().eq(0).find("i:first");
            if (ic && (ic.hasClass("fa-chevron-circle-down") || ic.hasClass("fa-chevron-circle-right"))) {
                ic.attr("class", "fa fa-chevron-circle-down");
            }
        }
        if (expObj.parent() && expObj.parent().parent()) {
            expandGraphViewSummaryToObject(expObj.parent().parent());
        }
    }
}

function removeAllGraphViewSummaryHighLighting() {
    $(".psiItem.active").removeClass("active");
}

function expandGraphViewSummaryToCompNode(compNode) {
    var obj = $("#" + buildProfileSummaryItemElementId(compNode));
    removeAllGraphViewSummaryHighLighting();
    obj.addClass("active");
    var objPP = obj.parent().parent();
    expandGraphViewSummaryToObject(objPP);
}

function scrollCompNodeInGraphViewSummary(compNode) {
    if ($("#" + buildProfileSummaryItemElementId(compNode)).length > 0) {
        expandGraphViewSummaryToCompNode(compNode);
        $(CIR_FCS_SUM_LIST_CTR).scrollTo("#" + buildProfileSummaryItemElementId(compNode), 500);
    }
}

function buildProfileSummaryItemElementId(compNode) {
    return buildIDableString(compNode.getId().trim()) + "_psi";
}

function toggleGraphProfileSummaryChild(ce) {
    if (ce.find('i:first').hasClass("fa-chevron-circle-right")) {
        ce.find('i:first').attr("class", "fa fa-chevron-circle-down");
        ce.parent().find('ul:first').attr("style", "display:block");
    } else {
        ce.find('i:first').attr("class", "fa fa-chevron-circle-right");
        ce.parent().find('ul:first').attr("style", "display:none");
    }
}

function generateCompetencyLineItemHtmlForGraphProfileSummary(compNode, hasChildren) {
    var liHtml = "";
    if (hasChildren) {
        liHtml += "<a onclick=\"toggleGraphProfileSummaryChild($(this))\"><i class=\"fa fa-chevron-circle-right " + CIR_FCS_SUM_ITEM_CLASS_ID + "\" aria-hidden=\"true\"></i></a>";
    }
    else {
        liHtml += "<i class=\"fa fa-circle " + CIR_FCS_SUM_ITEM_CLASS_ID + "\" aria-hidden=\"true\"></i>";
    }
    liHtml += "&nbsp;&nbsp;<a class=\"psiItem\" id=\"" + buildProfileSummaryItemElementId(compNode) + "\" " +
        "onclick=\"zoomExpCgByD3NodeId('" + escapeSingleQuote(compNode.getId().trim()) + "',true)\">" +
        compNode.getName().trim() + "</a>";
    return liHtml;
}

//TODO addChildToGraphProfileSummary construct list view for multi node competency cluster
function addChildToGraphProfileSummary(parentUl, childCcn, isRootComp) {
    var childLi = $("<li/>");
    if (isRootComp) childLi.addClass("gpsiRootComp");
    else childLi.addClass("gpsiNonRootComp");
    var cpt = currentFrameworkCompetencyData.competencyPacketDataMap[childCcn.id];
    if (cpt.cassNodePacket.getNodeList().length > 1) childLi.html("<i>TODO: construct list view for multi node competency cluster</i>");
    else {
        var compNode = cpt.cassNodePacket.getNodeList()[0];
        var hasChildren = childCcn.children && childCcn.children.length > 0;
        childLi.html(generateCompetencyLineItemHtmlForGraphProfileSummary(compNode, hasChildren));
        if (hasChildren) {
            childCcn.children.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            var childsChildUl = $("<ul/>");
            childsChildUl.attr("class", "fa-ul gpsiChild");
            childsChildUl.attr("style", "display:none");
            $(childCcn.children).each(function (i, cc) {
                addChildToGraphProfileSummary(childsChildUl, cc, false);
            });
            childLi.append(childsChildUl);
        }
    }
    parentUl.append(childLi);
}

function addFrameworkCompetenciesToGraphProfileSummary() {
    $(CIR_FCS_SUM_LIST_CTR).empty();
    var d3fn = currentD3FrameworkNode;
    if (!d3fn || d3fn == null) return;
    if (d3fn.children && d3fn.children.length > 0) {
        d3fn.children.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        var childUl = $("<ul/>");
        childUl.attr("class", "fa-ul gpsiChild");
        $(d3fn.children).each(function (i, c) {
            addChildToGraphProfileSummary(childUl, c, true);
        });
        $(CIR_FCS_SUM_LIST_CTR).append(childUl);
    }
}

function buildRelatedFrameworksGraphProfileSummaryList() {
    $(FWK_REL_FWK_LIST).empty();
    for (var i=0;i<currentFrameworkRelatedFrameworks.length;i++) {
        var fw = frameworkdIdFrameworkMap[currentFrameworkRelatedFrameworks[i]];
        if (fw) {
            var relFwLi = $("<li/>");
            var relFwLink = $("<a/>");
            relFwLink.attr("onclick","prepFrameworkAlignmentWithFrameworkIds('" + currentFrameworkId + "','" + fw.shortId() + "',false);");
            relFwLink.html(fw.name);
            relFwLi.append(relFwLink);
            $(FWK_REL_FWK_LIST).append(relFwLi);
        }
    }
}

function addRelatedFrameworksToGraphProfileSummary() {
    if (currentFrameworkRelatedFrameworks.length <= 0) {
        $(FWK_REL_FWK_LIST_CTR).hide();
    }
    else {
        buildRelatedFrameworksGraphProfileSummaryList();
        $(FWK_REL_FWK_LIST_CTR).show();
    }
}

function buildGraphProfileSummary() {
    var frameworkDesc = getFrameworkDescription(currentFrameworkId);
    if (!frameworkDesc || frameworkDesc.trim().length == 0) frameworkDesc = DEFAULT_FRAMEWORK_DESCRIPTION;
    $(CIR_FCS_SUM_DESC).html(frameworkDesc);
    addFrameworkCompetenciesToGraphProfileSummary();
    addRelatedFrameworksToGraphProfileSummary();
}

//**************************************************************************************************
// Build Framework Display
//**************************************************************************************************

function checkForPostDisplayZoom() {
    if (zoomToCompetencyOnOpen) {
        zoomToCompetencyOnOpen = false;
        if (screenToZoomOnOpen && screenToZoomOnOpen == "list-screen") currentScreen = "list-screen";
        $('.screen:visible').fadeOut('fast', function () {
            $("#" + currentScreen).fadeIn('fast',function () {
                findItemByFrameworkContentsSearchBar(compNameToZoom);
            });
        });
    }
}

function buildFrameworkDisplays() {
    showPageAsBusy("Building framework display...");
    clearFrameworkExpCircleSvg();
    buildExpGraphCircles(null, JSON.parse(currentD3FrameworkNodeString));
    buildGraphProfileSummary();
    buildListView();
    hideCirlceSidebarDetails();
    showPageMainContentsContainer();
    fillInFrameworkContentsSearchAutoComplete();
    $(FWK_CONT_SRCH_INPT).val("");
    showFrameworkContentsSearchBar();
    hasFinishedLoading = true;
    enableViewToggleButtons();
    setUpAndShowFrameworkExpTools();
    checkForPostDisplayZoom();
}

//**************************************************************************************************
// Framework Display Preparation
//**************************************************************************************************

function prepForFrameworkDisplay(fnpg) {
    showPageAsBusy("Processing collapsed data...");
    currentFrameworkCompetencyData = buildFrameworkCompetencyData(currentFrameworkId,currentFrameworkName,fnpg);
    showPageAsBusy("Prepping framework display nodes...");
    currentD3FrameworkNode = setUpD3FrameworkNodes(currentFrameworkName,currentFrameworkCompetencyData);
    currentD3FrameworkNodeString = buildD3JsonString(currentD3FrameworkNode);
    debugMessage("currentFrameworkCompetencyData");
    debugMessage(currentFrameworkCompetencyData);
    debugMessage("currentD3FrameworkNode:");
    debugMessage(currentD3FrameworkNode);
    debugMessage("currentD3FrameworkNode JSON String:");
    debugMessage(currentD3FrameworkNodeString);
    buildFrameworkDisplays();
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
    hideFrameworkExpTools();
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
    hideFrameworkExpTools();
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
