s3gt.youtube = {};

//------------------------------------------------------------------------------
s3gt.youtube.onBeforeRequest = function(httpChannel) {
	var url = httpChannel.url;
	if (! s3gt.utils.prefs_get("translate_subtitles_youtube")) { return; }
	if (! (/\/api\/timedtext\/?\?/i.test(url))) { return; }

	//-----------------------------------------------------------------------
	var lang_to = s3gt.prefs.get_lang_to(true);
	var params = s3gt.utils.urlparse(url);
	var run_youtube = false;
	//-----------------------------------------------------------------------
//	if (params['type'] && (params['type'] == 'track') && params['lang'] && (s3gt.prefs.get_lang_from_string(params['lang']) != lang_to) && (! ('tlang' in params))) {
	if (params['lang'] && (s3gt.prefs.get_lang_from_string(params['lang']) != lang_to) && (! ('tlang' in params))) {
		run_youtube = true;
	}
	if (! run_youtube) { return; }

	return s3gt.youtube.youtube_request_1(url, lang_to);
}
//------------------------------------------------------------------------------
s3gt.youtube.youtube_request_1 = function(url, lang_to) {
	var new_uri = url  + '&tlang=';
	new_uri = new_uri.replace(/\&lang=[^\&]+/, '&lang=' + lang_to);
	var req = new XMLHttpRequest();
	req.open("GET", new_uri, false);
	req.send(null);
	if ((req.status !== 200) && (req.status !== 304)) {
		return s3gt.youtube.youtube_request_2(url, lang_to);
	} else if (req.responseText) {
		return { 'redirectUrl' : new_uri };
	} else {
		return s3gt.youtube.youtube_request_2(url, lang_to);
	}
}
//------------------------------------------------------------------------------
s3gt.youtube.youtube_request_2 = function(url, lang_to) {
	var new_uri = url  + '&tlang=' + lang_to;
//	new_uri = new_uri.replace(/\&fmt=srv\d+/, '&fmt=srv1');
	var req = new XMLHttpRequest();
	req.open("GET", new_uri, false);
	req.send(null);
	if ((req.status !== 200) && (req.status !== 304)) {
		return;
	} else if (req.responseText) {
		return { 'redirectUrl' : new_uri };
	} else {
		return;
	}
}
//------------------------------------------------------------------------------
chrome.webRequest.onBeforeRequest.addListener(
	s3gt.youtube.onBeforeRequest,
	{urls: [ "*://*.youtube.com/api/timedtext*" ]},
	["blocking"]
);
