/*
 Copyright 2017 Eduworks Corporation and other contributing parties.

 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

if (queryParams.select == "true")
    $("#selectButton").css("visibility", "visible");
if (queryParams.select != null)
    $("#selectButton").show().text(queryParams.select);

var loading = 0;
var searchCompetencies = [];

function searchFrameworks() {
    var searchTerm = $("#search").val();
    if (searchTerm == null || searchTerm == "")
        searchTerm = "*";
    hideAll();
    $("#frameworks").html("");
    searchCompetencies = [];
    for (var i = 0; i < servers.length; i++) {
        frameworkSearch(servers[i], searchTerm);
        if (searchTerm != "*") {
            frameworkSearchByCompetency(servers[i], searchTerm);
        }
    }
}

function frameworkSearchByCompetency(server, searchTerm) {
    loading++;
    EcCompetency.search(server, searchTerm, function (competencies) {
        var subSearch = "";
        for (var v = 0; v < competencies.length; v++) {
            searchCompetencies.push(competencies[v].shortId());
            if (subSearch != "")
                subSearch += " OR ";
            subSearch += "competency:\"" + competencies[v].shortId() + "\"";
        }
        if (subSearch != "")
            frameworkSearch(server, subSearch, searchTerm);
        loading--;
        if (loading == 0) {
            if ($("#frameworks").html() == "")
                $("#frameworks").html("<center>No frameworks found.</center>");
            showAll();
        }
    }, console.log, {
        size: 5000
    });
}

function frameworkSearch(server, searchTerm, subsearchTerm) {
    loading++;
    EcFramework.search(server, searchTerm, function (frameworks) {
        for (var v = 0; v < frameworks.length; v++) {
            var framework = frameworks[v];
            if (framework.name === undefined || framework.name == null || framework.name == "")
                continue;
            if ($("[id='" + framework.shortId() + "']").length == 0) {
                var p = $("#frameworks").append("<p><a/><span/></p>").children().last();
                p.attr("id", framework.shortId());
                p.attr("subsearch", subsearchTerm);
                p.click(click);
                var title = p.children().first();
                title.text(framework.name);
                if (subsearchTerm != null)
                    p.prepend("<span style='float:right'>*Matches inside. <span>");
                var desc = p.children().last();
                desc.text(framework.description);
                if (searchTerm != "*" && subsearchTerm == null)
                    p.mark(searchTerm);
            }
        }
        loading--;
        if (loading == 0) {
            if ($("#frameworks").html() == "")
                $("#frameworks").html("<center>No frameworks found.</center>");
            showAll();
        }
    }, console.log, {
        size: 5000
    });
}

function select() {
    var ary = [];
    $("input:checked").parent().each(function (f) {
        ary.push($(this).attr("id"));
    })
    parent.postMessage(ary, queryParams.origin);
}

function click(evt) {
    var subsearchTerm = $(evt.target).attr("subsearch");
    if (subsearchTerm == null)
        subsearchTerm = $(evt.target).parent().attr("subsearch");
    frameworkId = $(evt.target).attr("id");
    if (frameworkId == null)
        frameworkId = $(evt.target).parent().attr("id");
    repo = null;
    $("#mainbar").find("#loading").show();
    $("#tree").hide();
    $("#sidebar").hide({
        complete: function () {
            $("#mainbar").show({
                complete: function () {}
            });
        }
    });
    for (var i = 0; i < servers.length; i++)
        if (frameworkId.startsWith(servers[i])) {
            repo = servers[i];
        }
    if (repo == null) {
        repo = servers[0];
    }
    refreshFramework(subsearchTerm);
}

function refreshFramework(subsearch) {
    var me = this;
    $("#tree").html("");
    me.fetches = 0;
    EcRepository.get(frameworkId, function (framework) {
        $("#title").text(framework.name);
        if (framework.competency == null)
            framework.competency = [];
        if (framework.relation == null)
            framework.relation = [];
        if (queryParams.link == "true")
            $("#frameworkLink").attr("href", framework.shortId()).show();
        repo.precache(framework.competency.concat(framework.relation), function (success) {
            if (framework.competency.length == 0) {
                if ($("#tree").html() == "")
                    $("#tree").html("<br><br><center><h3>This framework is empty.</h3></center>");
                showAll();
            } else {
                me.fetches += framework.competency.length;
                for (var i = 0; i < framework.competency.length; i++) {
                    EcCompetency.get(framework.competency[i], function (competency) {
                        me.fetches--;
                        if (subsearch != null)
                            if (!EcArray.has(searchCompetencies, competency.shortId())) {
                                if (me.fetches == 0) {
                                    if ($("#tree").html() == "")
                                        $("#tree").html("<br><br><center><h3>This framework is empty.</h3></center>");
                                    showAll();
                                }
                                return;
                            }
                        var treeNode = $("#tree").append("<li class = 'competency'><ul></ul></li>").children().last();
                        treeNode.attr("id", competency.shortId());
                        if (competency.description != null && competency.description != "NULL" && competency.description != competency.name)
                            treeNode.prepend("<small/>").children().first().text(competency.description);
                        if (queryParams.link == "true")
                            treeNode.prepend(" <a target='_blank'>🔗</a>").children().first().attr("href", competency.shortId());
                        treeNode.prepend("<span/>").children().first().text(competency.name).click(function (evt) {
                            $(evt.target).parent().children("ul").slideToggle();
                        });
                        if (queryParams.select != null)
                            treeNode.prepend("<input type='checkbox'>").children().first().click(function (evt) {
                                console.log(evt);
                                $(evt.target).parent().find("input").prop("checked", evt.target.checked);
                            });
                        if (subsearch != null)
                            treeNode.mark(subsearch);
                        if (me.fetches == 0) {
                            if (framework.relation != undefined && framework.relation.length > 0) {
                                for (var i = 0; i < framework.relation.length; i++) {
                                    me.fetches++;
                                    EcAlignment.get(framework.relation[i], function (relation) {
                                        me.fetches--;
                                        if (relation.source !== undefined) {
                                            if (relation.relationType == "narrows") {
                                                $("[id=\"" + relation.target + "\"]").children().last().append($("[id=\"" + relation.source + "\"]"));
                                            }
                                            if (me.fetches == 0) {
                                                for (var i = 0; i < framework.relation.length; i++) {
                                                    me.fetches++;
                                                    EcAlignment.get(framework.relation[i], function (relation) {
                                                        me.fetches--;
                                                        if (relation.source !== undefined) {
                                                            if (relation.relationType == "requires") {
                                                                if ($("[id=\"" + relation.target + "\"]").prevAll("[id=\"" + relation.source + "\"]").length > 0)
                                                                    $("[id=\"" + relation.target + "\"]").insertBefore($("[id=\"" + relation.source + "\"]"));
                                                            }
                                                        }
                                                        if (me.fetches == 0) {
                                                            if ($("#tree").html() == "")
                                                                $("#tree").html("<br><br><center><h3>This framework is empty.</h3></center>");
                                                            showAll();
                                                        }
                                                    }, console.log);
                                                }
                                            }
                                        }
                                    }, console.log);
                                }
                            } else {
                                if ($("#tree").html() == "")
                                    $("#tree").html("<br><br><center><h3>This framework is empty.</h3></center>");
                                showAll();
                            }

                        }
                    }, console.log);
                }
            }
        });
    }, console.log);
}


function showAll() {
    $("#mainbar").find("#loading").hide({
        complete: function () {
            $("#tree").show({});
        }
    });
    $("#sidebar").find("#loading").hide({
        complete: function () {
            $("#frameworks").show({});
        }
    });
}

function hideAll() {
    $("#tree").hide({
        complete: function () {
            $("#sidebar").find("#loading").show({});
        }
    });
    $("#frameworks").hide({
        complete: function () {
            $("#mainbar").find("#loading").show({});
        }
    });
}

$("#search").keyup(function (event) {
    if (event.keyCode == '13') {
        searchFrameworks();
    }
    return false;
});

$("#sidebar").show({});
searchFrameworks();
