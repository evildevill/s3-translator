s3gt.hotkeys = {};
//------------------------------------------------------------------------------
s3gt.hotkeys.init = function() {
	s3gt.hotkeys.pause = false;
	window.addEventListener('keydown', function(e) {
		s3gt.hotkeys.press(e);
	});
	window.addEventListener('keyup', function(e) {
		s3gt.hotkeys.pause = false;
	});
}
//------------------------------------------------------------------------------
s3gt.hotkeys.press = function(event) {
	var time = (new Date()).getTime();
	if (! s3gt.hotkeys.pause) {
		s3gt.hotkeys.check(event, s3gt.utils.prefs_get("hotkeys"));
	}
}
//------------------------------------------------------------------------------
s3gt.hotkeys.check = function(event, hotkeys) {
	var is_run = false;

	for (var i=0; i<hotkeys.length; i++) {
		var key = hotkeys[i];
		if ((key.shiftKey == event.shiftKey) && (key.ctrlKey == event.ctrlKey) && (key.altKey == event.altKey) && (key.keyCode == event.keyCode)) {
		s3gt.hotkeys.pause = true;
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			var key_method = key.method;
			if (key_method == 'translate_selection_plus_page') {
				var text = s3gt.utils.search_selected();
				if (text.length == 0 || text == "") {
					key_method = 'translate_page';
				} else {
					key_method = 'translate_selection';
				}
			}
			is_run = true;
			chrome.runtime.sendMessage({ 'translate_action' : true, 'method' : key_method }, function(response) {});
			break;
		}
	}
	if (! is_run) {
		s3gt.hotkeys.pause = false;
	}
}
//------------------------------------------------------------------------------
