//read out current status
chrome.storage.local.get(['current_status'], function(result){
	var currentStatus = ('current_status' in result) ? result.current_status : 'not_set';
	document.getElementById('statusHeading').innerHTML = currentStatus;
});

//read out default ip to check against
chrome.storage.local.get(['default_ip'], function(result){
	var defaultIP = ('default_ip' in result) ? result.default_ip : 'Fill in desired IP';
	if(defaultIP == 'not_set') defaultIP = 'Fill in desired IP';
	document.getElementById('default_ip_input').value = defaultIP;
});

//read out current public ip
chrome.storage.local.get(['public_ip'], function(result){
	var publicIP = ('public_ip' in result) ? result.public_ip : 'not_accessible';
	document.getElementById('public_ip_container').value = publicIP;
});

//read out mute status
chrome.storage.local.get(['mute_until'], function(result){
	var soundStatus = ('mute_until' in result) ? result.mute_until : 'active';
	var remainingText = soundStatus;
	if(soundStatus != 'active'){
		var remaining = new Date(soundStatus) - new Date();
		if(remaining <= 0){
			remainingText = 'active';
		}else{
			remainingText = 'active again in ... ' + msToHMS(remaining);
		}
	}
	document.getElementById('soundStatus').innerHTML = remainingText;
});

//save new ip value
document.getElementById('default_ip_button').addEventListener('click', saveValue);
function saveValue(){
	var newValue = default_ip_input.value;
	newValue = (newValue === '') ? 'not_set' : newValue;

	chrome.storage.local.set({'default_ip': newValue});

	chrome.storage.local.set({'current_status': 'checking ...'});
	chrome.storage.local.set({'public_ip': 'checking ...'});
	window.close();

	chrome.runtime.sendMessage({greeting: "new_value"});
}
document.getElementById('default_ip_input').addEventListener('keyup', saveValueKB);
function saveValueKB(event){
	if(event.keyCode == 13){
		saveValue();
	}
}

//save new sound mute
document.getElementById('mute_1h').addEventListener('click', function(){ mute(1);});
document.getElementById('mute_3h').addEventListener('click', function(){ mute(3);});
document.getElementById('mute_6h').addEventListener('click', function(){ mute(6);});
document.getElementById('mute_12h').addEventListener('click', function(){ mute(12);});
document.getElementById('mute_1d').addEventListener('click', function(){ mute(24);});
document.getElementById('unmute').addEventListener('click', function(){ mute(0);});
function mute(hours){
	var futureDate = Date.now() + hours * 60 * 60 * 1000;
	chrome.storage.local.set({'mute_until': futureDate});

	window.close();
}

//helper function
//source: https://stackoverflow.com/questions/29816872/how-can-i-convert-milliseconds-to-hhmmss-format-using-javascript
function msToHMS( ms ) {
    // 1- Convert to seconds:
    var seconds = parseInt( ms / 1000 );
    // 2- Extract hours:
    var hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt( seconds / 60 ); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return (hours+":"+minutes+":"+seconds);
}