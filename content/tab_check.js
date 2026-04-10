// its empty js-file. only for check tab: google-chrome-market, chrome-urls, etc
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if (request && request.translate_selection_check) {
		var getSelection = window.getSelection();
		var text = (getSelection) ? getSelection.toString() : '';
		sendResponse({ 'success' : text.length ? true : false });
	}
});
