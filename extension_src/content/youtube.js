s3gt.youtube = {};

//------------------------------------------------------------------------------
// MV3: YouTube subtitle translation using declarativeNetRequest dynamic rules.
// Adds `tlang` query parameter to YouTube timedtext requests so subtitles are
// automatically translated to the user's target language.
s3gt.youtube.update_dnr_rules = function() {
	if (! s3gt.utils.prefs_get("translate_subtitles_youtube")) {
		chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [2]
		}, function() { if (chrome.runtime.lastError) {} });
		return;
	}

	var lang_to = s3gt.prefs.get_lang_to(true);
	if (! lang_to || lang_to === 'auto') { return; }

	chrome.declarativeNetRequest.updateDynamicRules({
		removeRuleIds: [2],
		addRules: [
			{
				id: 2,
				priority: 1,
				action: {
					type: 'redirect',
					redirect: {
						transform: {
							queryTransform: {
								addOrReplaceParams: [
									{ key: 'tlang', value: lang_to }
								]
							}
						}
					}
				},
				condition: {
					urlFilter: '*://*.youtube.com/api/timedtext*',
					resourceTypes: ['xmlhttprequest', 'other']
				}
			}
		]
	}, function() { if (chrome.runtime.lastError) {} });
};
