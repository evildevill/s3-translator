var s3gt = {};
s3gt.from_settings = false;

//------------------------------------------------------------------------------
s3gt.init_0 = function() {
	setTimeout(function(){ s3gt.utils.i18n_parse(document); }, 100);
	s3gt.init();
}
//------------------------------------------------------------------------------
s3gt.init = function() {
	document.getElementById('statistics_accept').addEventListener('click', function(){ s3gt.statistics_on(); });
	document.getElementById('statistics_cancel').addEventListener('click', function(){ s3gt.statistics_off(); });
	s3gt.prefs.init(s3gt.dialog_init);
}
//------------------------------------------------------------------------------
s3gt.dialog_init = function() {
	if (/from\=opt/.test(window.location.href)) {
		s3gt.from_settings = true;
	}
}
//------------------------------------------------------------------------------
s3gt.statistics_on = function() {
	s3gt.pref_save("statistics", "on", s3gt.window_close);
}
//------------------------------------------------------------------------------
s3gt.statistics_off = function() {
	s3gt.pref_save("statistics", "off", s3gt.window_close);
}
//------------------------------------------------------------------------------
s3gt.pref_save = function(pref_name, pref_value, callback) {
	chrome.runtime.sendMessage({ 'action_prefs_set': true, 'pref_name' : pref_name, 'pref_value': pref_value }, function(response) {
		s3gt.utils.prefs_set(pref_name, pref_value);
		if (callback) {
			callback();
		}
	});
}
//------------------------------------------------------------------------------
s3gt.window_close = function() {
	if (s3gt.from_settings) {
		window.location.replace('/content/options.html#translateOthersTab');
	} else {
		chrome.runtime.sendMessage({ 'action_window_close' : true }, function(response) {});
	}
}
//------------------------------------------------------------------------------
window.addEventListener("load", s3gt.init_0, false);
