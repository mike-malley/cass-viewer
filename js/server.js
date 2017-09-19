var repo = new EcRepository();
repo.selectedServer = "";

EcRepository.caching = true;

var frameworkId = "";

var servers = ["https://sandbox.cassproject.org/api/custom"];

if (queryParams.server != null)
    servers = [queryParams.server];

for (var i = 0; i < servers.length; i++) {
    var r = new EcRepository();
    r.selectedServer = servers[i];
    r.autoDetectRepository();
    servers[i] = r;
}
