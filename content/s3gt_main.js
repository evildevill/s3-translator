//------------------------------------------------------------------------------
s3gt.main = {};
//------------------------------------------------------------------------------
s3gt.main.init_0 = function(init_count) {
	var lib_list = ['action', 'translate', 'learning', 'hotkeys', 'tooltip', 'thtml', 'utils', 'prefs', 'i18n', 'sound' ];
	var lib_load_ok = true;
	//------------------------------------------------------------------------
	for (var i=0; i<lib_list.length; i++) {
		if (! s3gt[lib_list[i]]) {
			lib_load_ok = false;
			break;
		}
	}
	//------------------------------------------------------------------------
	if (! lib_load_ok) {
		init_count--;
		if (init_count > 0) {
			setTimeout(function(){ s3gt.main.init_0(init_count); }, 50);
		}
		return;
	}
	//------------------------------------------------------------------------
	if (! s3gt.body_margin_bottom) {
		s3gt.body_margin_bottom = 0;
	}
	try {
		chrome.runtime.onMessage.removeListener(s3gt.main.onMessage);
	} catch(e) {
	}
	//------------------------------------------------------------------------
	window.addEventListener("keydown", function(event) { 
		if (event.which == "17") {
			s3gt.key_ctrl_is_pressed = true;
		}
	}, true);
	window.addEventListener("keyup", function() { s3gt.key_ctrl_is_pressed = false; }, true);

	//------------------------------------------------------------------------
	s3gt.prefs.init(function(){
		s3gt.main.init();
		s3gt.tooltip.init();
		s3gt.hotkeys.init();
	});
}
//------------------------------------------------------------------------------
s3gt.main.init = function() {
	s3gt.main.zoom_index = 1;
	s3gt.main.tab_id = 0;

	//------------------------------------------------------------------------
	chrome.runtime.sendMessage({ 's3gt_main_init' : true }, function(response) {
		chrome.runtime.onMessage.addListener(s3gt.main.onMessage);
	});
}
//------------------------------------------------------------------------------
s3gt.main.set_zoom = function(zoom_index) {
	s3gt.main.zoom_index = zoom_index;
	s3gt.tooltip.set_zoom();
}
//------------------------------------------------------------------------------
s3gt.main.pref_save = function(pref_name, pref_value, callback) {
	chrome.runtime.sendMessage({ 'action_prefs_set': true, 'pref_name' : pref_name, 'pref_value': pref_value }, function(response) {
		if (callback) {
			callback();
		}
	});
	s3gt.utils.prefs_set(pref_name, pref_value);
}
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
s3gt.main.onMessage = function(request, sender, sendResponse) {
	//------------------------------------------------------------------------
	if (! request) { return; }
	//------------------------------------------------------------------------
	if ((! s3gt.main.is_init) && (request.action != 's3gt_main_init')) { return; }
	//------------------------------------------------------------------------
	//------------------------------------------------------------------------
	if (request.check_content) {
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 's3gt_main_init') {
		//------------------------------------------------------------------
		if (s3gt.main.is_init) { return; }
		//------------------------------------------------------------------
		s3gt.main.zoom_index = request.zoom_index;
		s3gt.work_data = request.work_data;
		s3gt.wait_session = {};
		s3gt.action.init();
		s3gt.main.tab_id = request.tab_id;
		s3gt.main.is_init = true;
		if (s3gt.utils.check_isFrame()) { return; }
		if (s3gt.work_data.tooltip) {
			s3gt.tooltip.get_work_data(s3gt.work_data.tooltip);
		}
		s3gt.main.set_zoom(s3gt.main.zoom_index);
		chrome.runtime.sendMessage({ 'detect_language' : true });
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'translate_page') {
		if (s3gt.utils.check_isFrame()) { return; }

		s3gt.work_data = request.work_data;
		if (s3gt.key_ctrl_is_pressed) {
			s3gt.key_ctrl_is_pressed = false;
			s3gt.translate.page_google_site(s3gt.prefs.get_lang_from(true), s3gt.prefs.get_lang_to(true));
		} else {
			s3gt.translate.page(s3gt.prefs.get_lang_from(true), s3gt.prefs.get_lang_to(true));
		}
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'translate_page_run') {
		if (s3gt.utils.check_isFrame()) { return; }

		s3gt.work_data = request.work_data;
		s3gt.translate.page_run(s3gt.prefs.get_lang_from(true), s3gt.prefs.get_lang_to(true), true);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'translate_selection') {
		if (s3gt.utils.check_isFrame()) { return; }
		s3gt.work_data = request.work_data;
		var text = request.selection_text || '';
		var text2 = s3gt.utils.search_selected();
		if (text2.length > text.length) { text = text2; }
		if (text.length == 0 || text == "") { return; }
		s3gt.translate.selection_fly(s3gt.prefs.get_lang_from(), s3gt.prefs.get_lang_to(), null, true, text);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'create_fly_custom') {
		if (s3gt.utils.check_isFrame()) { return; }

		s3gt.work_data = request.work_data;
		s3gt.prefs.list = request.prefs_list;
		var data = request.data;

		var lang_from = data.lang_from || s3gt.prefs.get_lang_from();
		var lang_to = data.lang_to || s3gt.prefs.get_lang_to();
		s3gt.key_ctrl_is_pressed = data.event.key_ctrl_is_pressed;

		if (data.is_new || s3gt.tooltip.check_window_new(data.event ? data.event.type_click : '')) {
			var tooltip_fly = s3gt.tooltip.create_fly_switch(data.event, data.text, true, lang_from, lang_to);
			s3gt.tooltip.create_panel(tooltip_fly, lang_from, lang_to, { 'create_panel' : function() { s3gt.translate.selection_fly_run(data.text, lang_from, lang_to, data.event, tooltip_fly); } });
		} else {
			s3gt.translate.selection_fly_run(data.text, lang_from, lang_to, data.event);
		}
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'remove_fly_custom') {
		s3gt.tooltip.remove();
	}
	//------------------------------------------------------------------------
	else if (request.action == 'move_fly_custom') {
		if (s3gt.utils.check_isFrame()) { return; }

		s3gt.action.translate_selection_tooltip_move(request.data.event);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'translate_selection_sound') {
		s3gt.work_data = request.work_data;
		var text = request.selection_text || s3gt.utils.search_selected();
		if (text.length == 0 || text == "") { return; }
		setTimeout(function(){
			s3gt.translate.speech_custom_run(text, 'auto', s3gt.prefs.get_lang_to());
		}, 500);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'translate_custom') {
		if (s3gt.utils.check_isFrame()) { return; }

		s3gt.work_data = request.work_data;
		var text = '';

		s3gt.tooltip.get_work_data_stop = true;
		var tooltip_fly = s3gt.tooltip.create_fly_switch(null, text, true, s3gt.prefs.get_lang_from(), s3gt.prefs.get_lang_to());
		s3gt.tooltip.create_panel(tooltip_fly, s3gt.prefs.get_lang_from(), s3gt.prefs.get_lang_to(), { 'create_panel' : function(){
			if (! tooltip_fly.view_source_translate_tooltip) {
				tooltip_fly.thtml.view_source_click(tooltip_fly);
			}
			setTimeout(function(){
				s3gt.tooltip.get_work_data_stop = false;
			}, 2000);
		} });
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'translate_clipboard') {
		if (s3gt.utils.check_isFrame()) { return; }
		s3gt.work_data = request.work_data;
		s3gt.utils.read_clipboard(function(text){
			if (text.length == 0 || text == "") { return; }
			var lang_from = s3gt.prefs.get_lang_from();
			var lang_to = s3gt.prefs.get_lang_to();
			s3gt.translate.selection_fly(lang_from, lang_to, null, true, text, 'clipboard');
		});
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'google_response') {
		if (s3gt.wait_session[request.data.id_translate_session]) {
			s3gt.wait_session[request.data.id_translate_session](request.data);
			delete s3gt.wait_session[request.data.id_translate_session];
			sendResponse({ 'success' : true });
		}
	}
	//------------------------------------------------------------------------
	else if (request.action == 'google_value_tk') {
		s3gt.work_data.google_value_tk = request.result;
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'load_tab') {
		if (s3gt.utils.check_isFrame()) { return; }
		s3gt.work_data = request.work_data;
		s3gt.action.load_tab(request.language);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action == 'style_theme_load') {
		if (s3gt.wait_session[request.id_session]) {
			s3gt.wait_session[request.id_session](request.result);
			delete s3gt.wait_session[request.id_session];
			sendResponse({ 'success' : true });
		}
	}
	//------------------------------------------------------------------------
	else if (request.action == 'set_work_data') {
		if (s3gt.work_data.current_id != request.work_data.current_id) {
			s3gt.work_data = request.work_data;
			if (request.prefs_list) {
				s3gt.prefs.list = request.prefs_list;
				s3gt.prefs.init_lang_to();
			}
			if (request.frame_id) { return; }
			if (s3gt.utils.check_isFrame()) { return; }
			if (s3gt.work_data.tooltip) {
				s3gt.tooltip.get_work_data(s3gt.work_data.tooltip, request.re_init);
			}
		}
	}
	//------------------------------------------------------------------------
	else if (request.action == 'set_prefs_list') {
		if (request.prefs_list) {
			s3gt.prefs.list = request.prefs_list;
			s3gt.prefs.init_lang_to();
		}
	}
	//------------------------------------------------------------------------
	else if (request.action_change_zoom) {
		s3gt.main.set_zoom(request.zoom_index);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	//------------------------------------------------------------------------
	//------------------------------------------------------------------------
	//------------------------------------------------------------------------
	else if (request.action_change_zoom) {
		s3gt.main.set_zoom(request.zoom_index);
		sendResponse({ 'success' : true });
	}
}
//------------------------------------------------------------------------------
try{ s3gt.main.init_0(60); }catch(e){ };
