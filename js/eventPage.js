falke_init();

function falke_init(){
	statusNEUTRAL();
	checkIP();

	chrome.alarms.create('ip_change_checker', {
		periodInMinutes: 5
	});

	chrome.alarms.onAlarm.addListener(function(alarm){
		if(alarm.name == 'ip_change_checker'){
			checkIP();
		}
	});

	chrome.runtime.onMessage.addListener( function(request,sender,sendResponse){
		if( request.greeting === "new_value" ){
			checkIP();
		}
	});
}

function checkIP(){
	//first, get the default ip which is saved in ui
	chrome.storage.local.get(['default_ip'], function(result){
		var defaultIP = ('default_ip' in result) ? result.default_ip : 'not_set';

		//retrieve public ip from web-api
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://api.ipify.org?format=json');
		xhr.onload = function() {
			if (xhr.status === 200) {
				//api call ok, save public ip to storage if it is contained in return
				var responseObj = JSON.parse(xhr.response);
				var publicIP = ('ip' in responseObj) ? responseObj.ip : 'not_accessible';
				chrome.storage.local.set({'public_ip': publicIP});

				checkResult();
			}else {
				//display warning in console if web-api is not accessible
				var publicIP = 'not_accessible';
				statusNEUTRAL();
				console.warn('Public IP Change Notification Error: api.ipify.org not accessible');

				checkResult();
			}
		};
		xhr.send();

		function checkResult(){
			chrome.storage.local.get(['public_ip'], function(result){
				var publicIP = ('public_ip' in result) ? result.public_ip : 'not_accessible';
				if(publicIP == 'not_accessible' || defaultIP == 'not_set'){
					statusNEUTRAL();
				}else if(defaultIP == publicIP){
					statusOK();
				}else{
					statusERROR();
				}
			});
		}
	});
}

function statusOK(){
	chrome.storage.local.set({'current_status': 'OK'});
	changeIcon('green');
}

function statusNEUTRAL(){
	chrome.storage.local.set({'current_status': 'NEUTRAL'});
	changeIcon('orange');
}

function statusERROR(){
	chrome.storage.local.set({'current_status': 'WRONG IP'});
	changeIcon('red');
	playWarning();
}

function changeIcon(newColor){
	chrome.browserAction.setIcon({
		path: {
			"16": "assets/16w/" + newColor + ".png",
			"48": "assets/48w/" + newColor + ".png",
			"128": "assets/128w/" + newColor + ".png"
		}
	});
}

function playWarning(){
	//is warning muted in settings?
	chrome.storage.local.get(['mute_until'], function(result){
		var muteUntil = ('mute_until' in result) ? result.mute_until : 0;
		if(muteUntil < Date.now()){
			var sound = new Audio();
			sound.src = "assets/foghorn-daniel_simon.mp3";
			sound.loop = false;
			sound.play();
		}
	});
}