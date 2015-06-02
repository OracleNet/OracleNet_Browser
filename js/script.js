//server list
var servers = [];
var serverList = [];
var variants = [];
var maps = [];
//order for sorting and sorting basis
var reverse = true;
var BasisEnum = {
	NAME: 0,
	MAP: 1,
	VARIANT: 2,
	PLAYERS: 3,
	VARIANTTYPE: 4,
	PING: 5,
	HOST: 6
}
var basis = BasisEnum.NAME;

function serverSort(a,b){
	var result = 0;
	switch(basis){
		case BasisEnum.NAME:
			result = a.name.localeCompare(b.name);
		break;
		case BasisEnum.HOST:
			result = a.name.localeCompare(b.host);
		break;
		case BasisEnum.MAP:
			result = a.map.localeCompare(b.map);
		break;
		case BasisEnum.VARIANT:
			result = a.variant.localeCompare(b.variant);
		break;
		case BasisEnum.PLAYERS:
			result = a.numPlayers - b.numPlayers;
		break;
		case BasisEnum.VARIANTTYPE:
			result = a.variantType.localeCompare(b.variantType);
		break;
		case BasisEnum.PING:
			result = b.ping - a.ping;
		break;
		default:
		
	}
	return (reverse ? result : -1 * result);
}

var filters = {
	name: "",
	map: "",
	variant: "",
	excludeEmpty: false,
	excludeFull: false,
	variantType: "",
	maxPing: 1000
}

function filtered(server){
	if(server.name.toLowerCase().search(filters.name.toLowerCase()) == -1){
		return true;
	}
	if(server.map.toLowerCase().search(filters.map.toLowerCase()) == -1){
		return true;
	}
	if(server.variant.toLowerCase().search(filters.variant.toLowerCase()) == -1){
		return true;
	}
	if(filters.excludeEmpty && server.numPlayers == 0){
		return true;
	}
	if(filters.excludeFull && server.numPlayers == server.maxPlayers){
		return true;
	}
	if(server.variantType.toLowerCase().search(filters.variantType.toLowerCase()) == -1){
		return true;
	}
	if(server.ping > filters.maxPing){
		return true;
	}
	return false;
}

function finishMaps(){
	var inside = "<option value=\"\">" + "all" + "</option>";
	for(x in maps){
    map = maps[x].map;
		inside = inside + "<option value=\"" + map + "\">" + map + "</option>";
	}
	document.getElementById("maps").innerHTML = inside;
	reFilter();
}

function finishVariants(){
	var inside = "<option value=\"\">" + "all" + "</option>";
	for(x in variants){
		inside = inside + "<option value=\"" + variants[x].variant + "\">" + variants[x].variant + "</option>";
	}
	document.getElementById("variant").innerHTML = inside;
	reFilter();
}

function continueRefresh(response){
	var jsonResponse = JSON.parse(response);
	serverList = jsonResponse;
	for(server in serverList){
		requestServerInfo(serverList[server]);
	}
	finishRefresh();
}

function continueServerInfo(response, server, n){
	var d = new Date();
	var ping = d.getTime() - n;
	console.log(response);
	var jsonResponse = JSON.parse(response);
	console.log(jsonResponse);
	jsonResponse.ip = server.ip;
	jsonResponse.httpPort = server.port;
	jsonResponse.ping = ping;
	servers.push(jsonResponse);
	finishRefresh();
}

//up: &#9650; down: &#9660;
function markSorting(cat){
	if(cat == basis){
		return (reverse ? "<br><i class=\"fa fa-sort-desc\"></i>" : "<br><i class=\"fa fa-sort-asc\"></i>");
	}
	else{
		return "<br><i class=\"fa fa-sort\"></i>";
	}
}

function tableHeader(){
	return "<tr><th onclick=\"order(BasisEnum.NAME)\">Server" + markSorting(BasisEnum.NAME) + "</th><th onclick=\"order(BasisEnum.HOST)\">Host" + markSorting(BasisEnum.HOST) + "</th><th onclick=\"order(BasisEnum.MAP)\">Map" + markSorting(BasisEnum.MAP) + "</th><th onclick=\"order(BasisEnum.VARIANT)\">Type" + markSorting(BasisEnum.VARIANT) + "</th><th onclick=\"order(BasisEnum.PLAYERS)\">Players" + markSorting(BasisEnum.PLAYERS) + "</th><th onclick=\"order(BasisEnum.VARIANTTYPE)\">Tags" + markSorting(BasisEnum.VARIANTTYPE) + "</th><th onclick=\"order(BasisEnum.PING)\">Ping" + markSorting(BasisEnum.PING) + "</th></tr>";
}

function tableRow(server){
	return "<tr><td onclick=&quot;ConnectorGlobal.connectCallback(" + servers[server].ip + ":" + servers[server].port + " " + servers[server].xnaddr + " " + servers[server].xnkid + ")&quot;><a href=\"#\">" + servers[server].name + "</a></td><td><a href=\"#\">" + servers[server].hostPlayer + "</a></td><td><a href=\"#\">" + servers[server].map + "</a></td><td><a href=\"#\">" + servers[server].variant + "</a></td><td><a href=\"#\">" + servers[server].numPlayers + "/" + servers[server].maxPlayers + "</a></td><td><a href=\"#\">" + servers[server].variantType + "</a></td><td><a href=\"#\">" + servers[server].ping + "</a></td></tr>";
}

function finishRefresh(){
	servers.sort(function(a,b){return serverSort(a,b);});
	var contentsString = tableHeader();
	for(server in servers){
		if(!filtered(servers[server])){
			contentsString = contentsString + tableRow(server);
		}
	}
	document.getElementById("serverList").innerHTML = contentsString;
}

function reFilter(){
	var filterForm = document.getElementById("filter-form").elements;
	filters.name = filterForm.namedItem("name").value;
	filters.map = filterForm.namedItem("map").value;
	filters.variant = filterForm.namedItem("variant").value;
	filters.excludeEmpty = filterForm.namedItem("empty").checked;
	filters.excludeFull = filterForm.namedItem("full").checked;
	filters.variantType = filterForm.namedItem("variantType").value;
	filters.maxPing = parseInt(filterForm.namedItem("maxPing").value);
	finishRefresh();
}

function order(b){
	reverse = ((basis == b) ? !reverse : true);
	basis = b;
	finishRefresh();
}

function requestServers(){
	servers = [];
	var request = new XMLHttpRequest();
	var url = "ajax/serverlist.json"; //"ajax/serverlist.json.php"
	
	request.onreadystatechange=function() {
		if (request.readyState == 4 && request.status == 200){
			continueRefresh(request.responseText);
		}
	}
	request.open("GET" , url, true);
	request.send();	
}

function requestServerInfo(server){
	var url = "http://" + server.ip + ":8000/example.json";
	var request = new XMLHttpRequest();
	var d = new Date();
	var n = d.getTime();
	request.onreadystatechange=function() {
		if (request.readyState == 4 && request.status == 200){
			continueServerInfo(request.responseText, server, n);
		}
	}
	request.open("GET" , url, true);
	request.send();	
}

function refresh(){
	document.getElementById("serverList").innerHTML = tableHeader();
	requestServers();
}

$(document).ready(function() {
  refresh();
  $('#showFilter').click(function(){
    $('#showFilter').toggleClass('active');
    $('#filters').toggleClass('active');
  });
  $('#refresh').click(function() {
    refresh();
  });
  
  //For the auto refresh.
  window.setInterval(function(){
    refresh();
  }, 25000);
  
  // For background
  //$('.heading').mousemove(function(e){
  //    var amountMovedX = (e.pageX * -1 / 6);
  //    var amountMovedY = (e.pageY * -1 / 6);
  //    $(this).css('background-position', amountMovedX + 'px ' + amountMovedY + 'px');
  //});
});