var PapaParseParams = function() {};
PapaParseParams = stjs.extend(PapaParseParams, null, [], function(constructor, prototype) {
    prototype.complete = null;
    prototype.header = null;
    prototype.error = null;
}, {complete: {name: "Callback1", arguments: ["Object"]}, error: {name: "Callback1", arguments: ["Object"]}}, {});
/**
 *  Base class for all importers, can hold helper functions
 *  that are useful for all importers
 * 
 *  @author devlin.junker@eduworks.com
 *  @module org.cassproject
 *  @class Importer
 *  @abstract
 */
var Importer = function() {};
Importer = stjs.extend(Importer, null, [], function(constructor, prototype) {
    constructor.isObject = function(obj) {
        return Object.prototype.toString.call(obj) == "[object Object]";
    };
    constructor.isArray = function(obj) {
        return Object.prototype.toString.call(obj) == "[object Array]";
    };
}, {}, {});
/**
 *  Base class for all exporters, can hold helper functions
 *  that are useful for all exporters
 * 
 *  @author devlin.junker@eduworks.com
 *  @module org.cassproject
 *  @class Exporter
 *  @abstract
 */
var Exporter = function() {};
Exporter = stjs.extend(Exporter, null, [], null, {}, {});
/**
 *  Export methods to handle exporting two CSV file , one of competencies
 *  and one of relationships representing a framework
 * 
 *  @author devlin.junker@eduworks.com
 *  @author fritz.ray@eduworks.com
 *  @module org.cassproject
 *  @class CSVExport
 *  @static
 *  @extends Exporter
 */
var CSVExport = function() {
    Exporter.call(this);
};
CSVExport = stjs.extend(CSVExport, Exporter, [], function(constructor, prototype) {
    constructor.frameworkCompetencies = null;
    constructor.frameworkRelations = null;
    constructor.exportObjects = function(objects, fileName) {
        var compExport = new CSVExport.CSVExportProcess();
        compExport.buildExport(objects);
        compExport.downloadCSV(fileName);
    };
    /**
     *  Method to export the CSV files of competencies and relationships for a framework
     * 
     *  @param {String}            frameworkId
     *                             Id of the framework to export
     *  @param {Callback0}         success
     *                             Callback triggered after both files have been successfully exported
     *  @param {Callback1<String>} failure
     *                             Callback triggered if an error occurs during export
     *  @memberOf CSVExport
     *  @method export
     *  @static
     */
    constructor.exportFramework = function(frameworkId, success, failure) {
        if (frameworkId == null) {
            failure("Framework not selected.");
            return;
        }
        CSVExport.frameworkCompetencies = [];
        CSVExport.frameworkRelations = [];
        EcRepository.get(frameworkId, function(data) {
            if (data.isAny(new EcFramework().getTypes())) {
                var fw = new EcFramework();
                fw.copyFrom(data);
                if (fw.competency == null || fw.competency.length == 0) 
                    failure("No Competencies in Framework");
                for (var i = 0; i < fw.competency.length; i++) {
                    var competencyUrl = fw.competency[i];
                    EcRepository.get(competencyUrl, function(competency) {
                        CSVExport.frameworkCompetencies.push(competency);
                        if (CSVExport.frameworkCompetencies.length == fw.competency.length) {
                            var compExport = new CSVExport.CSVExportProcess();
                            compExport.buildExport(CSVExport.frameworkCompetencies);
                            compExport.downloadCSV(fw.getName() + " - Competencies.csv");
                        } else {}
                    }, function(s) {
                        CSVExport.frameworkCompetencies.push(null);
                        if (CSVExport.frameworkCompetencies.length == fw.competency.length) {
                            var compExport = new CSVExport.CSVExportProcess();
                            compExport.buildExport(CSVExport.frameworkCompetencies);
                            compExport.downloadCSV(fw.getName() + " - Competencies.csv");
                        } else {}
                    });
                }
                for (var i = 0; i < fw.relation.length; i++) {
                    var relationUrl = fw.relation[i];
                    EcRepository.get(relationUrl, function(relation) {
                        CSVExport.frameworkRelations.push(relation);
                        if (CSVExport.frameworkRelations.length == fw.relation.length) {
                            var compExport = new CSVExport.CSVExportProcess();
                            compExport.buildExport(CSVExport.frameworkRelations);
                            compExport.downloadCSV(fw.getName() + " - Relations.csv");
                            if (success != null && success != undefined) 
                                success();
                        } else {}
                    }, function(s) {
                        CSVExport.frameworkRelations.push(null);
                        if (CSVExport.frameworkRelations.length == fw.relation.length) {
                            var compExport = new CSVExport.CSVExportProcess();
                            compExport.buildExport(CSVExport.frameworkRelations);
                            compExport.downloadCSV(fw.getName() + " - Relations.csv");
                            if (success != null && success != undefined) 
                                success();
                        } else {}
                    });
                }
            }
        }, failure);
    };
    constructor.CSVExportProcess = function() {
        this.csvOutput = [];
    };
    constructor.CSVExportProcess = stjs.extend(constructor.CSVExportProcess, null, [], function(constructor, prototype) {
        prototype.csvOutput = null;
        prototype.flattenObject = function(flattenedObject, object, prefix) {
            var data = new EcRemoteLinkedData((object)["@context"], (object)["@type"]);
            data.copyFrom(object);
            var tempObj = JSON.parse(data.toJson());
            var props = (tempObj);
            for (var prop in props) {
                var id;
                if (prefix != null && prefix != undefined) 
                    id = prefix + "." + prop;
                 else 
                    id = prop;
                if (props[prop] != null && props[prop] != "" && stjs.isInstanceOf(props[prop].constructor, Object)) {
                    this.flattenObject(flattenedObject, props[prop], id);
                } else {
                    (flattenedObject)[id] = props[prop];
                }
            }
        };
        prototype.addCSVRow = function(object) {
            var flattenedObject = new EcRemoteLinkedData(object.context, object.type);
            this.flattenObject(flattenedObject, object, null);
            this.csvOutput.push(JSON.parse(flattenedObject.toJson()));
            var props = (JSON.parse(flattenedObject.toJson()));
            for (var prop in props) {
                if (props[prop] != null && props[prop] != "") {
                    for (var i = 0; i < this.csvOutput.length; i++) {
                        var row = this.csvOutput[i];
                        if (!(row).hasOwnProperty(prop)) {
                            (row)[prop] = "";
                        }
                    }
                }
            }
        };
        prototype.buildExport = function(objects) {
            for (var i = 0; i < objects.length; i++) 
                if (objects[i] != null) {
                    var object = objects[i];
                    this.addCSVRow(object);
                }
        };
        prototype.downloadCSV = function(name) {
            var csv = Papa.unparse(this.csvOutput);
            var pom = window.document.createElement("a");
            pom.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
            pom.setAttribute("download", name);
            if ((window.document)["createEvent"] != null) {
                var event = ((window.document)["createEvent"]).call(window.document, "MouseEvents");
                ((event)["initEvent"]).call(event, "click", true, true);
                pom.dispatchEvent(event);
            } else {
                ((pom)["click"]).call(pom);
            }
        };
    }, {csvOutput: {name: "Array", arguments: ["Object"]}}, {});
}, {frameworkCompetencies: {name: "Array", arguments: ["EcRemoteLinkedData"]}, frameworkRelations: {name: "Array", arguments: ["EcRemoteLinkedData"]}}, {});
/**
 *  Import methods to handle an ASN JSON file containing a framework,
 *  competencies and relationships, and store them in a CASS instance
 * 
 *  @author devlin.junker@eduworks.com
 *  @author fritz.ray@eduworks.com
 *  @module org.cassproject
 *  @class ASNImport
 *  @static
 *  @extends Importer
 */
var ASNImport = function() {
    Importer.call(this);
};
ASNImport = stjs.extend(ASNImport, Importer, [], function(constructor, prototype) {
    constructor.INCREMENTAL_STEP = 5;
    constructor.jsonFramework = null;
    constructor.frameworkUrl = null;
    constructor.jsonCompetencies = null;
    constructor.competencyCount = 0;
    constructor.relationCount = 0;
    constructor.importedFramework = null;
    constructor.competencies = null;
    constructor.progressObject = null;
    constructor.savedCompetencies = 0;
    constructor.savedRelations = 0;
    /**
     *  Recursive function that looks through the file and saves each
     *  competency object in a map for use during importing. It also counts
     *  the number of competencies and relationships that it finds
     * 
     *  @param {Object} obj
     *                  The current JSON object we're examining for comepetencies and reationships
     *  @param {String} key
     *                  The ASN identifier of the current object
     *  @memberOf ASNImport
     *  @method asnJsonPrime
     *  @private
     *  @static
     */
    constructor.asnJsonPrime = function(obj, key) {
        var value = (obj)[key];
        if (Importer.isObject(value)) {
            if ((value)["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] != null) {
                var stringVal = (((value)["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"])["0"])["value"];
                if (stringVal == "http://purl.org/ASN/schema/core/Statement") {
                    ASNImport.jsonCompetencies[key] = value;
                    ASNImport.competencyCount++;
                    var children = (value)["http://purl.org/gem/qualifiers/hasChild"];
                    if (children != null) 
                        for (var j = 0; j < children.length; j++) {
                            ASNImport.relationCount++;
                            ASNImport.asnJsonPrime(obj, (children[j])["value"]);
                        }
                }
            }
        }
    };
    /**
     *  Does the actual legwork of looking for competencies and relationships.
     *  <p>
     *  This function finds the framework information, and pulls out the competency
     *  objects array to be scanned by asnJsonPrime
     * 
     *  @param {Object} obj
     *                  ASN JSON Object from file that contains framework information and competencies/relationships
     *  @memberOf ASNImport
     *  @method lookThroughSource
     *  @private
     *  @static
     */
    constructor.lookThroughSource = function(obj) {
        ASNImport.competencyCount = 0;
        ASNImport.relationCount = 0;
        for (var key in (obj)) {
            var value = (obj)[key];
            if (Importer.isObject(value)) {
                if ((value)["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"] != null) {
                    var stringVal = (((value)["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"])["0"])["value"];
                    if (stringVal == "http://purl.org/ASN/schema/core/StandardDocument") {
                        ASNImport.jsonFramework = value;
                        ASNImport.frameworkUrl = key;
                        var children = (value)["http://purl.org/gem/qualifiers/hasChild"];
                        if (children != null) 
                            for (var j = 0; j < children.length; j++) {
                                ASNImport.asnJsonPrime(obj, (children[j])["value"]);
                            }
                    }
                }
            }
        }
    };
    /**
     *  Analyzes an ASN File for competencies and relationships.
     *  <p>
     *  This should be called before import, the success callback returns an object
     *  indicating the number of competencies and relationships found.
     * 
     *  @param {Object}            file
     *                             ASN JSON file
     *  @param {Callback1<Object>} success
     *                             Callback triggered on successful analysis of file
     *  @param {Callback1<Object>} [failure]
     *                             Callback triggered if there is an error during analysis of the file
     *  @memberOf ASNImport
     *  @method analyzeFile
     *  @static
     */
    constructor.analyzeFile = function(file, success, failure) {
        if (file == null) {
            failure("No file to analyze");
            return;
        }
        if ((file)["name"] == null) {
            failure("Invalid file");
            return;
        } else if (!((file)["name"]).endsWith(".json")) {
            failure("Invalid file type");
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var result = ((e)["target"])["result"];
            var jsonObj = JSON.parse(result);
            ASNImport.jsonCompetencies = {};
            ASNImport.jsonFramework = null;
            ASNImport.frameworkUrl = "";
            ASNImport.lookThroughSource(jsonObj);
            if (ASNImport.jsonFramework == null) {
                failure("Could not find StandardDocument.");
            } else {
                success(ASNImport.jsonCompetencies);
            }
        };
        reader.readAsText(file);
    };
    /**
     *  Method to import the competencies from an ASN JSON file,
     *  should be called after analyzing the file
     * 
     *  @param {String}                        serverUrl
     *                                         URL Prefix for the competencies to be imported
     *  @param {EcIdentity}                    owner
     *                                         EcIdentity that will own the new competencies
     *  @param {boolean}                       createFramework
     *                                         Flag to create a framework and include the competencies and relationships created
     *  @param {Callback2<Array<EcCompetency>, EcFramework>} success
     *                                         Callback triggered after the competencies (and framework?) are created
     *  @param {Callback1<Object>}             failure
     *                                         Callback triggered if an error occurs while creating the competencies
     *  @param {Callback1<Object>}             [incremental]
     *                                         Callback triggered incrementally during the creation of competencies to indicate progress,
     *                                         returns an object indicating the number of competencies (and relationships?) created so far
     *  @memberOf ASNImport
     *  @method importCompetencies
     *  @static
     */
    constructor.importCompetencies = function(serverUrl, owner, createFramework, success, failure, incremental, repo) {
        ASNImport.competencies = {};
        if (createFramework) {
            ASNImport.importedFramework = new EcFramework();
            ASNImport.importedFramework.competency = [];
            ASNImport.importedFramework.relation = [];
        } else {
            ASNImport.importedFramework = null;
        }
        ASNImport.progressObject = null;
        ASNImport.createCompetencies(serverUrl, owner, function() {
            ASNImport.createRelationships(serverUrl, owner, ASNImport.jsonFramework, null, function() {
                if (createFramework) {
                    ASNImport.createFramework(serverUrl, owner, success, failure, repo);
                } else {
                    var compList = [];
                    for (var key in ASNImport.competencies) {
                        compList.push(ASNImport.competencies[key]);
                    }
                    if (success != null) 
                        success(compList, null);
                }
            }, failure, incremental, repo);
        }, failure, incremental, repo);
    };
    /**
     *  Handles creating the competencies found during analysis, iterates through the
     *  competency ASN objects saved and creates them in the CASS repository at the URL given.
     * 
     *  @param {String}            serverUrl
     *                             URL Prefix for the competencies to be imported
     *  @param {EcIdentity}        owner
     *                             EcIdentity that will own the new competencies
     *  @param {Callback0}         success
     *                             Callback triggered after the competencies are created
     *  @param {Callback1<Object>} failure
     *                             Callback triggered if an error occurs while creating the competencies
     *  @param {Callback1<Object>} [incremental]
     *                             Callback triggered incrementally during the creation of competencies to indicate progress
     *  @memberOf ASNImport
     *  @method createCompetencies
     *  @private
     *  @static
     */
    constructor.createCompetencies = function(serverUrl, owner, success, failure, incremental, repo) {
        ASNImport.savedCompetencies = 0;
        for (var key in ASNImport.jsonCompetencies) {
            var comp = new EcCompetency();
            var jsonComp = ASNImport.jsonCompetencies[key];
            if ((jsonComp)["http://purl.org/dc/elements/1.1/title"] == null) 
                comp.name = (((jsonComp)["http://purl.org/dc/terms/description"])["0"])["value"];
             else 
                comp.name = (((jsonComp)["http://purl.org/dc/elements/1.1/title"])["0"])["value"];
            comp.sameAs = key;
            if ((jsonComp)["http://purl.org/dc/terms/description"] != null) 
                comp.description = (((jsonComp)["http://purl.org/dc/terms/description"])["0"])["value"];
            if (repo == null || repo.selectedServer.indexOf(serverUrl) != -1) 
                comp.generateId(serverUrl);
             else 
                comp.generateShortId(serverUrl);
            if (owner != null) 
                comp.addOwner(owner.ppk.toPk());
            if (ASNImport.importedFramework != null) 
                ASNImport.importedFramework.addCompetency(comp.shortId());
            ASNImport.competencies[key] = comp;
            ASNImport.saveCompetency(success, failure, incremental, comp, repo);
        }
    };
    constructor.saveCompetency = function(success, failure, incremental, comp, repo) {
        Task.asyncImmediate(function(o) {
            var keepGoing = o;
            comp.save(function(p1) {
                ASNImport.savedCompetencies++;
                if (ASNImport.savedCompetencies % ASNImport.INCREMENTAL_STEP == 0) {
                    if (ASNImport.progressObject == null) 
                        ASNImport.progressObject = new Object();
                    (ASNImport.progressObject)["competencies"] = ASNImport.savedCompetencies;
                    incremental(ASNImport.progressObject);
                }
                if (ASNImport.savedCompetencies == ASNImport.competencyCount) {
                    if (ASNImport.progressObject == null) 
                        ASNImport.progressObject = new Object();
                    (ASNImport.progressObject)["competencies"] = ASNImport.savedCompetencies;
                    incremental(ASNImport.progressObject);
                    success();
                }
                keepGoing();
            }, function(p1) {
                failure("Failed to save competency");
                keepGoing();
            }, repo);
        });
    };
    /**
     *  Handles creating the relationships from the file analyzed earlier.
     *  Recursively travels through looking for the hasChild field and creates
     *  relationships based off of that.
     * 
     *  @param {String}            serverUrl
     *                             URL Prefix for the relationships to be imported
     *  @param {EcIdentity}        owner
     *                             EcIdentity that will own the new relationships
     *  @param {Object}            node
     *  @param {String}            nodeId
     *  @param {Callback0}         success
     *                             Callback triggered after the relationships are created
     *  @param {Callback1<Object>} failure
     *                             Callback triggered if an error occurs while creating the relationships
     *  @param {Callback1<Object>} incremental
     *                             Callback triggered incrementally during the creation of relationships to indicate progress
     *  @memberOf ASNImport
     *  @method createRelationships
     *  @private
     *  @static
     */
    constructor.createRelationships = function(serverUrl, owner, node, nodeId, success, failure, incremental, repo) {
        ASNImport.savedRelations = 0;
        if (ASNImport.relationCount == 0) {
            success();
        }
        var children = (node)["http://purl.org/gem/qualifiers/hasChild"];
        if (children != null) 
            for (var j = 0; j < children.length; j++) {
                if (nodeId != null) {
                    var relation = new EcAlignment();
                    relation.target = ASNImport.competencies[nodeId].shortId();
                    relation.source = ASNImport.competencies[(children[j])["value"]].shortId();
                    relation.relationType = "narrows";
                    relation.name = "";
                    relation.description = "";
                    if (repo == null || repo.selectedServer.indexOf(serverUrl) != -1) 
                        relation.generateId(serverUrl);
                     else 
                        relation.generateShortId(serverUrl);
                    if (owner != null) 
                        relation.addOwner(owner.ppk.toPk());
                    if (ASNImport.importedFramework != null) 
                        ASNImport.importedFramework.addRelation(relation.shortId());
                    ASNImport.saveRelation(success, failure, incremental, relation, repo);
                }
                ASNImport.createRelationships(serverUrl, owner, ASNImport.jsonCompetencies[(children[j])["value"]], (children[j])["value"], success, failure, incremental, repo);
            }
    };
    constructor.saveRelation = function(success, failure, incremental, relation, repo) {
        Task.asyncImmediate(function(o) {
            var keepGoing = o;
            relation.save(function(p1) {
                ASNImport.savedRelations++;
                if (ASNImport.savedRelations % ASNImport.INCREMENTAL_STEP == 0) {
                    if (ASNImport.progressObject == null) 
                        ASNImport.progressObject = new Object();
                    (ASNImport.progressObject)["relations"] = ASNImport.savedRelations;
                    incremental(ASNImport.progressObject);
                }
                if (ASNImport.savedRelations == ASNImport.relationCount) {
                    success();
                }
                keepGoing();
            }, function(p1) {
                failure("Failed to save Relationship");
                keepGoing();
            }, repo);
        });
    };
    /**
     *  Handles creating the framework if the createFramework flag was set
     * 
     *  @param {String}                        serverUrl
     *                                         URL Prefix for the framework to be imported
     *  @param {EcIdentity}                    owner
     *                                         EcIdentity that will own the new framework
     *  @param {Callback2<Array<EcCompetency>, EcFramework>} success
     *                                         Callback triggered after the framework is created
     *  @param {Callback1<Object>}             failure
     *                                         Callback triggered if there is an error during the creation of framework
     *  @meberOf ASNImport
     *  @method createFramework
     *  @private
     *  @static
     */
    constructor.createFramework = function(serverUrl, owner, success, failure, repo) {
        ASNImport.importedFramework.name = (((ASNImport.jsonFramework)["http://purl.org/dc/elements/1.1/title"])["0"])["value"];
        ASNImport.importedFramework.description = (((ASNImport.jsonFramework)["http://purl.org/dc/terms/description"])["0"])["value"];
        if (repo == null || repo.selectedServer.indexOf(serverUrl) != -1) 
            ASNImport.importedFramework.generateId(serverUrl);
         else 
            ASNImport.importedFramework.generateShortId(serverUrl);
        ASNImport.importedFramework.sameAs = ASNImport.frameworkUrl;
        if (owner != null) 
            ASNImport.importedFramework.addOwner(owner.ppk.toPk());
        ASNImport.importedFramework.save(function(p1) {
            var compList = [];
            for (var key in ASNImport.competencies) {
                compList.push(ASNImport.competencies[key]);
            }
            if (success != null) 
                success(compList, ASNImport.importedFramework);
        }, function(p1) {
            failure("Failed to save framework");
        }, repo);
    };
}, {jsonFramework: "Object", jsonCompetencies: {name: "Map", arguments: [null, "Object"]}, importedFramework: "EcFramework", competencies: {name: "Map", arguments: [null, "EcCompetency"]}, progressObject: "Object"}, {});
/**
 *  Importer methods to copy or link to competencies that already
 *  exist in another framework in a CASS instance.
 * 
 *  @author devlin.junker@eduworks.com
 *  @module org.cassproject
 *  @class FrameworkImport
 *  @static
 *  @extends Importer
 */
var FrameworkImport = function() {};
FrameworkImport = stjs.extend(FrameworkImport, null, [], function(constructor, prototype) {
    constructor.savedComp = 0;
    constructor.savedRel = 0;
    constructor.targetUsable = null;
    constructor.competencies = null;
    constructor.relations = null;
    constructor.compMap = null;
    /**
     *  Copies or links competencies that exist in one framework in a CASS instance,
     *  to another different framework in the same CASS instance.
     * 
     *  @param {EcFramework}                    source
     *                                          Framework to copy or link the competencies from
     *  @param {EcFramework}                    target
     *                                          Framework to add the copied or linked competencies to
     *  @param {boolean}                        copy
     *                                          Flag indicating whether or not to copy or link the competencies in the source framework
     *  @param {String}                         serverUrl
     *                                          URL Prefix for the created competencies if copied
     *  @param {EcIdentity}                     owner
     *                                          EcIdentity that will own the created competencies if copied
     *  @param {Callback1<Array<EcCompetency>>} success
     *                                          Callback triggered after succesfully copying or linking all of the competencies,
     *                                          returns an array of the new or linked competencies
     *  @param {Callback1<Object>}              [failure]
     *                                          Callback triggered if an error occurred while creating the competencies
     *  @memberOf FrameworkImport
     *  @method importCompetencies
     *  @static
     */
    constructor.importCompetencies = function(source, target, copy, serverUrl, owner, success, failure, repo) {
        if (source == null) {
            failure("Source Framework not set");
            return;
        }
        if (target == null) {
            failure("Target Framework not Set");
            return;
        }
        FrameworkImport.targetUsable = target;
        if (source.competency == null || source.competency.length == 0) {
            failure("Source Has No Competencies");
            return;
        }
        FrameworkImport.competencies = [];
        FrameworkImport.relations = [];
        if (copy) {
            FrameworkImport.compMap = {};
            FrameworkImport.savedComp = 0;
            FrameworkImport.savedRel = 0;
            for (var i = 0; i < source.competency.length; i++) {
                var id = source.competency[i];
                EcCompetency.get(id, function(comp) {
                    var competency = new EcCompetency();
                    competency.copyFrom(comp);
                    if (repo == null || repo.selectedServer.indexOf(serverUrl) != -1) 
                        competency.generateId(serverUrl);
                     else 
                        competency.generateShortId(serverUrl);
                    FrameworkImport.compMap[comp.shortId()] = competency.shortId();
                    if (owner != null) 
                        competency.addOwner(owner.ppk.toPk());
                    var id = competency.id;
                    Task.asyncImmediate(function(o) {
                        var keepGoing = o;
                        competency.save(function(str) {
                            FrameworkImport.savedComp++;
                            FrameworkImport.targetUsable.addCompetency(id);
                            if (FrameworkImport.savedComp == FrameworkImport.competencies.length) {
                                FrameworkImport.targetUsable.save(function(p1) {
                                    for (var i = 0; i < source.relation.length; i++) {
                                        var id = source.relation[i];
                                        EcAlignment.get(id, function(rel) {
                                            var relation = new EcAlignment();
                                            relation.copyFrom(rel);
                                            if (repo == null || repo.selectedServer.indexOf(serverUrl) != -1) 
                                                relation.generateId(serverUrl);
                                             else 
                                                relation.generateShortId(serverUrl);
                                            relation.source = FrameworkImport.compMap[rel.source];
                                            relation.target = FrameworkImport.compMap[rel.target];
                                            if (owner != null) 
                                                relation.addOwner(owner.ppk.toPk());
                                            var id = relation.id;
                                            Task.asyncImmediate(function(o) {
                                                var keepGoing2 = o;
                                                relation.save(function(str) {
                                                    FrameworkImport.savedRel++;
                                                    FrameworkImport.targetUsable.addRelation(id);
                                                    if (FrameworkImport.savedRel == FrameworkImport.relations.length) {
                                                        FrameworkImport.targetUsable.save(function(p1) {
                                                            success(FrameworkImport.competencies, FrameworkImport.relations);
                                                        }, function(p1) {
                                                            failure(p1);
                                                        }, repo);
                                                    }
                                                    keepGoing2();
                                                }, function(str) {
                                                    failure("Trouble Saving Copied Competency");
                                                    keepGoing2();
                                                }, repo);
                                            });
                                            FrameworkImport.relations.push(relation);
                                        }, function(str) {
                                            failure(str);
                                        });
                                    }
                                }, function(p1) {
                                    failure(p1);
                                }, repo);
                            }
                            keepGoing();
                        }, function(str) {
                            failure("Trouble Saving Copied Competency");
                            keepGoing();
                        }, repo);
                    });
                    FrameworkImport.competencies.push(competency);
                }, function(str) {
                    failure(str);
                });
            }
        } else {
            for (var i = 0; i < source.competency.length; i++) {
                if (target.competency == null || (target.competency.indexOf(source.competency[i]) == -1 && target.competency.indexOf(EcRemoteLinkedData.trimVersionFromUrl(source.competency[i])) == -1)) {
                    EcCompetency.get(source.competency[i], function(comp) {
                        FrameworkImport.competencies.push(comp);
                        FrameworkImport.targetUsable.addCompetency(comp.id);
                        if (FrameworkImport.competencies.length == source.competency.length) {
                            delete (FrameworkImport.targetUsable)["competencyObjects"];
                            FrameworkImport.targetUsable.save(function(p1) {
                                for (var i = 0; i < source.relation.length; i++) {
                                    if (target.relation == null || (target.relation.indexOf(source.relation[i]) == -1 && target.relation.indexOf(EcRemoteLinkedData.trimVersionFromUrl(source.competency[i])) == -1)) {
                                        EcAlignment.get(source.relation[i], function(relation) {
                                            FrameworkImport.relations.push(relation);
                                            FrameworkImport.targetUsable.addRelation(relation.id);
                                            if (FrameworkImport.relations.length == source.relation.length) {
                                                delete (FrameworkImport.targetUsable)["competencyObjects"];
                                                Task.asyncImmediate(function(o) {
                                                    var keepGoing = o;
                                                    FrameworkImport.targetUsable.save(function(p1) {
                                                        success(FrameworkImport.competencies, FrameworkImport.relations);
                                                        keepGoing();
                                                    }, function(p1) {
                                                        failure(p1);
                                                        keepGoing();
                                                    }, repo);
                                                });
                                            }
                                        }, function(p1) {
                                            failure(p1);
                                        });
                                    }
                                }
                            }, function(p1) {
                                failure(p1);
                            }, repo);
                        }
                    }, function(p1) {
                        failure(p1);
                    });
                }
            }
        }
    };
}, {targetUsable: "EcFramework", competencies: {name: "Array", arguments: ["EcCompetency"]}, relations: {name: "Array", arguments: ["EcAlignment"]}, compMap: {name: "Map", arguments: [null, null]}}, {});
/**
 *  Importer methods to create competencies based on a
 *  Medbiquitous competency XML file
 * 
 *  @author devlin.junker@eduworks.com
 *  @author fritz.ray@eduworks.com
 *  @module org.cassproject
 *  @class MedbiqImport
 *  @static
 *  @extends Importer
 */
var MedbiqImport = function() {
    Importer.call(this);
};
MedbiqImport = stjs.extend(MedbiqImport, Importer, [], function(constructor, prototype) {
    constructor.INCREMENTAL_STEP = 5;
    constructor.medbiqXmlCompetencies = null;
    constructor.progressObject = null;
    constructor.saved = 0;
    /**
     *  Does the legwork of looking for competencies in the XML
     * 
     *  @param {Object} obj
     *                  Parsed XML Object
     *  @memberOf MedbiqImport
     *  @method medbiqXmlLookForCompetencyObject
     *  @private
     *  @static
     */
    constructor.medbiqXmlLookForCompetencyObject = function(obj) {
        if (Importer.isObject(obj) || Importer.isArray(obj)) 
            for (var key in (obj)) {
                if (key == "CompetencyObject") 
                    MedbiqImport.medbiqXmlParseCompetencyObject((obj)[key]);
                 else 
                    MedbiqImport.medbiqXmlLookForCompetencyObject((obj)[key]);
            }
    };
    /**
     *  Does the legwork of parsing the competencies out of the parsed XML
     * 
     *  @param {Object} obj
     *                  Parsed XML Object
     *  @memberOf MedbiqImport
     *  @method medbiqXmlParseCompetencyObject
     *  @private
     *  @static
     */
    constructor.medbiqXmlParseCompetencyObject = function(obj) {
        if (Importer.isArray(obj)) {
            for (var key in (obj)) {
                MedbiqImport.medbiqXmlParseCompetencyObject((obj)[key]);
            }
        } else {
            var newCompetency = new EcCompetency();
            if ((obj)["lom"] != null && ((obj)["lom"])["general"] != null) {
                newCompetency.name = ((((obj)["lom"])["general"])["title"])["string"].toString();
                if ((((obj)["lom"])["general"])["description"] != null) 
                    newCompetency.description = ((((obj)["lom"])["general"])["description"])["string"].toString();
                if ((((obj)["lom"])["general"])["identifier"] != null) 
                    newCompetency.url = ((((obj)["lom"])["general"])["identifier"])["entry"].toString();
                if (newCompetency.description == null) 
                    newCompetency.description = "";
                MedbiqImport.medbiqXmlCompetencies.push(newCompetency);
            }
        }
    };
    /**
     *  Analyzes a Medbiquitous XML file for competencies and saves them for use in the import process
     * 
     *  @param {Object}                         file
     *                                          Medbiquitous XML file
     *  @param {Callback1<Array<EcCompetency>>} success
     *                                          Callback triggered on succesfully analyzing competencies,
     *                                          returns an array of all of the competencies found
     *  @param {Callback1<String>}              [failure]
     *                                          Callback triggered on error analyzing file
     *  @memberOf MedbiqImport
     *  @method analyzeFile
     *  @static
     */
    constructor.analyzeFile = function(file, success, failure) {
        if (file == null) {
            failure("No file to analyze");
            return;
        }
        if ((file)["name"] == null) {
            failure("Invalid file");
            return;
        } else if (!((file)["name"]).endsWith(".xml")) {
            failure("Invalid file type");
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var result = ((e)["target"])["result"];
            var jsonObject = new X2JS().xml_str2json(result);
            MedbiqImport.medbiqXmlCompetencies = [];
            MedbiqImport.medbiqXmlLookForCompetencyObject(jsonObject);
            success(MedbiqImport.medbiqXmlCompetencies);
        };
        reader.onerror = function(p1) {
            failure("Error Reading File");
        };
        reader.readAsText(file);
    };
    /**
     *  Method for actually creating the competencies in the CASS repository after a
     *  Medbiquitous XML file has been parsed. Must be called after analyzeFile
     * 
     *  @param {String}                         serverUrl
     *                                          URL Prefix for the created competencies (and relationships?)
     *  @param {EcIdentity}                     owner
     *                                          EcIdentity that will own the created competencies (and relationships?)
     *  @param {Callback1<Array<EcCompetency>>} success
     *                                          Callback triggered after successfully creating the competencies from the XML file
     *  @param {Callback1<Object>}              [failure]
     *                                          Callback triggered if there is an error while creating the competencies
     *  @param {Callback1<Object>}              [incremental]
     *                                          Callback triggered incrementally while the competencies are being created to show progress,
     *                                          returns an object indicating the number of competencies created so far
     *  @memberOf MedbiqImport
     *  @method importCompetencies
     *  @static
     */
    constructor.importCompetencies = function(serverUrl, owner, success, failure, incremental, repo) {
        MedbiqImport.progressObject = null;
        MedbiqImport.saved = 0;
        for (var i = 0; i < MedbiqImport.medbiqXmlCompetencies.length; i++) {
            var comp = MedbiqImport.medbiqXmlCompetencies[i];
            if (repo == null || repo.selectedServer.indexOf(serverUrl) != -1) 
                comp.generateId(serverUrl);
             else 
                comp.generateShortId(serverUrl);
            if (owner != null) 
                comp.addOwner(owner.ppk.toPk());
            MedbiqImport.saveCompetency(success, failure, incremental, comp, repo);
        }
    };
    constructor.saveCompetency = function(success, failure, incremental, comp, repo) {
        Task.asyncImmediate(function(o) {
            var keepGoing = o;
            var scs = function(p1) {
                MedbiqImport.saved++;
                if (MedbiqImport.saved % MedbiqImport.INCREMENTAL_STEP == 0) {
                    if (MedbiqImport.progressObject == null) 
                        MedbiqImport.progressObject = new Object();
                    (MedbiqImport.progressObject)["competencies"] = MedbiqImport.saved;
                    incremental(MedbiqImport.progressObject);
                }
                if (MedbiqImport.saved == MedbiqImport.medbiqXmlCompetencies.length) {
                    if (MedbiqImport.progressObject == null) 
                        MedbiqImport.progressObject = new Object();
                    (MedbiqImport.progressObject)["competencies"] = MedbiqImport.saved;
                    incremental(MedbiqImport.progressObject);
                    success(MedbiqImport.medbiqXmlCompetencies);
                }
                keepGoing();
            };
            var err = function(p1) {
                failure("Failed to Save Competency");
                keepGoing();
            };
            comp.save(scs, err, repo);
        });
    };
}, {medbiqXmlCompetencies: {name: "Array", arguments: ["EcCompetency"]}, progressObject: "Object"}, {});
var CTDLASNCSVImport = function() {};
CTDLASNCSVImport = stjs.extend(CTDLASNCSVImport, null, [], function(constructor, prototype) {
    constructor.analyzeFile = function(file, success, failure) {
        if (file == null) {
            failure("No file to analyze");
            return;
        }
        if ((file)["name"] == null) {
            failure("Invalid file");
        } else if (!((file)["name"]).endsWith(".csv")) {
            failure("Invalid file type");
        }
        Papa.parse(file, {complete: function(results) {
            var tabularData = (results)["data"];
            var colNames = tabularData[0];
            var nameToCol = new Object();
            for (var i = 0; i < colNames.length; i++) 
                (nameToCol)[colNames[i]] = i;
            var frameworkCounter = 0;
            var competencyCounter = 0;
            var typeCol = (nameToCol)["@type"];
            if (typeCol == null) {
                this.error("No @type in CSV.");
                return;
            }
            for (var i = 0; i < tabularData.length; i++) {
                if (i == 0) 
                    continue;
                var col = tabularData[i];
                if (col[typeCol] == "ceasn:CompetencyFramework") 
                    frameworkCounter++;
                 else if (col[typeCol] == "ceasn:Competency") 
                    competencyCounter++;
                 else if (col[typeCol] == null || col[typeCol] == "") 
                    continue;
                 else {
                    this.error("Found unknown type:" + col[typeCol]);
                    return;
                }
            }
            success(frameworkCounter, competencyCounter);
        }, error: failure});
    };
    constructor.importFrameworksAndCompetencies = function(repo, file, success, failure, ceo) {
        if (file == null) {
            failure("No file to analyze");
            return;
        }
        if ((file)["name"] == null) {
            failure("Invalid file");
        } else if (!((file)["name"]).endsWith(".csv")) {
            failure("Invalid file type");
        }
        Papa.parse(file, {header: true, complete: function(results) {
            var tabularData = (results)["data"];
            var frameworks = new Object();
            var frameworkArray = new Array();
            var frameworkRows = new Object();
            var competencies = new Array();
            var competencyRows = new Object();
            var relations = new Array();
            var relationById = new Object();
            for (var i = 0; i < tabularData.length; i++) {
                var e = tabularData[i];
                if ((e)["@type"] == "ceasn:CompetencyFramework") {
                    var f = new EcFramework();
                    if ((e)["@owner"] != null) {
                        var id = new EcIdentity();
                        id.ppk = EcPpk.fromPem((e)["@owner"]);
                        if (ceo != null) 
                            f.addOwner(ceo.ppk.toPk());
                        f.addOwner(id.ppk.toPk());
                        EcIdentityManager.addIdentityQuietly(id);
                    }
                    f.id = (e)["@id"];
                    (frameworks)[f.id] = f;
                    (frameworkRows)[f.id] = e;
                    frameworkArray.push(f);
                    f.competency = new Array();
                    f.relation = new Array();
                    f.name = (e)["ceasn:name"];
                    if ((e)["ceasn:creator"] != null) 
                        (e)["ceasn:creator"] = ((e)["ceasn:creator"]).toLowerCase();
                    (f)["schema:creator"] = (e)["ceasn:creator"];
                    (f)["ceasn:derivedFrom"] = (e)["ceasn:derivedFrom"];
                    (f)["dc:source"] = (e)["ceasn:source"];
                } else if ((e)["@type"] == "ceasn:Competency") {
                    var f = new EcCompetency();
                    if ((e)["@id"] == null) 
                        continue;
                    f.id = (e)["@id"];
                    if ((e)["ceasn:isPartOf"] != null) {
                        ((frameworks)[(e)["ceasn:isPartOf"]]).competency.push(f.shortId());
                    } else {
                        var parent = e;
                        var done = false;
                         while (!done && parent != null){
                            if ((parent)["ceasn:isChildOf"] != null && (parent)["ceasn:isChildOf"] != "") {
                                parent = (competencyRows)[(parent)["ceasn:isChildOf"]];
                            } else if ((parent)["ceasn:isTopChildOf"] != null && (parent)["ceasn:isTopChildOf"] != "") {
                                parent = (frameworkRows)[(parent)["ceasn:isTopChildOf"]];
                                done = true;
                            }
                        }
                        if (!done) {
                            this.error("Could not find framework:" + (e)["@type"]);
                            return;
                        }
                        if (parent != null) {
                            if ((parent)["@type"] == "ceasn:CompetencyFramework") {
                                (e)["ceasn:isPartOf"] = (parent)["@id"];
                                ((frameworks)[(parent)["@id"]]).competency.push(f.shortId());
                            } else {
                                this.error("Object cannot trace to framework:" + (e)["@type"]);
                                return;
                            }
                        } else {
                            this.error("Object has no framework:" + (e)["@type"]);
                            return;
                        }
                    }
                    if ((e)["@owner"] == null) {
                        if (((frameworkRows)[(e)["ceasn:isPartOf"]])["@owner"] != null) 
                            (e)["@owner"] = ((frameworkRows)[(e)["ceasn:isPartOf"]])["@owner"];
                    }
                    var id = new EcIdentity();
                    if ((e)["@owner"] != null) {
                        id.ppk = EcPpk.fromPem((e)["@owner"]);
                        if (ceo != null) 
                            f.addOwner(ceo.ppk.toPk());
                        if (id.ppk != null) 
                            f.addOwner(id.ppk.toPk());
                        EcIdentityManager.addIdentityQuietly(id);
                    }
                    f.name = (e)["ceasn:competencyText"];
                    if (f.name == null || f.name == "") 
                        f.name = (e)["ceasn:name"];
                    if ((e)["ceasn:comment"] != null) 
                        f.description = (e)["ceasn:comment"];
                    (f)["schema:creator"] = (e)["ceasn:creator"];
                    (f)["ceasn:codedNotation"] = (e)["ceasn:codedNotation"];
                    (f)["ceasn:listID"] = (e)["ceasn:listID"];
                    if ((e)["ceasn:isChildOf"] != null) {
                        var r = new EcAlignment();
                        r.generateId(repo.selectedServer);
                        if (ceo != null) 
                            r.addOwner(ceo.ppk.toPk());
                        if (id.ppk != null) 
                            r.addOwner(id.ppk.toPk());
                        r.source = (e)["@id"];
                        r.relationType = Relation.NARROWS;
                        r.target = (e)["ceasn:isChildOf"];
                        relations.push(r);
                        (relationById)[r.shortId()] = r;
                        ((frameworks)[(e)["ceasn:isPartOf"]]).relation.push(r.shortId());
                    }
                    (f)["ceasn:derivedFrom"] = (e)["ceasn:derivedFrom"];
                    competencies.push(f);
                    (competencyRows)[f.id] = e;
                } else if ((e)["@type"] == null || (e)["@type"] == "") 
                    continue;
                 else {
                    this.error("Found unknown type:" + (e)["@type"]);
                    return;
                }
            }
            success(frameworkArray, competencies, relations);
        }, error: failure});
    };
}, {}, {});
