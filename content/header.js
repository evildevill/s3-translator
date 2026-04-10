s3gt.header = {};
 
//------------------------------------------------------------------------------
s3gt.addon = {
	version : '0',
	old_version : '0',
	donateURL: 'https://www.s3blog.org/addon-contribute/s3-translator.html'
};
//------------------------------------------------------------------------------
s3gt.header.init = function() {
	s3gt.prefs.init(s3gt.addon.get_version);
}
//------------------------------------------------------------------------------
s3gt.addon.get_version = function() {
	var manifest = chrome.runtime.getManifest();
	s3gt.addon.version = manifest.version;
	if ((manifest.version != '') && (manifest.version != '0')) {
		setTimeout(function() { s3gt.addon.checkPrefs(); }, 2000);
	}
}
//------------------------------------------------------------------------------
s3gt.addon.addonDonate = function() {
	var donateURL = s3gt.addon.donateURL + '?v=' + s3gt.addon.version + '-' + s3gt.addon.old_version;
	chrome.tabs.create({ url: donateURL, active: true },
		function(tab) {
			// if the browser starts a long time, then instead of creating the tab, there will be an error
			if (chrome.runtime.lastError) {
				setTimeout(function() { s3gt.addon.addonDonate(); }, 2000);
			}
		}
	);
}
//------------------------------------------------------------------------------
s3gt.addon.checkPrefs = function() {
	var old_version = s3gt.utils.prefs_get("current_version");
	s3gt.addon.old_version = old_version;
	var not_open_contribute_page = s3gt.utils.prefs_get("not_open_contribute_page");
	var current_day = Math.ceil((new Date()).getTime() / (1000*60*60*24));
	var is_set_timer = false;
	var show_page_timer =  s3gt.utils.prefs_get("show_page_timer");

	//----------------------------------------------------------------------
	if (s3gt.addon.version != old_version) {
		s3gt.utils.prefs_set("current_version", s3gt.addon.version);
		var result = ((old_version == '') || (old_version == '0')) ? false : true;
		//--------------------------------------------------------------
		if (result) {
			if (! not_open_contribute_page) {
				is_set_timer = true;
				if ((show_page_timer + 5) < current_day) {
					s3gt.addon.addonDonate();
				}
			}
		}
	}
	//----------------------------------------------------------------------
	if (s3gt.addon.version == old_version) {
		if (show_page_timer > 0) {
			show_page_timer -= Math.floor(Math.random() * 15);
			if ((show_page_timer + 60) < current_day) {
				if (! not_open_contribute_page) {
					is_set_timer = true;
					s3gt.addon.addonDonate();
				}
			}
		} else {
			is_set_timer = true;
		}
	}
	//----------------------------------------------------------------------
	if (is_set_timer) {
		s3gt.utils.prefs_set("show_page_timer", current_day);
	}
}
//-----------------------------------------------------------------------------
setTimeout(function() { s3gt.header.init(); }, 1000);
