//------------------------------------------------------------------------------
s3gt.action = {};
s3gt.action.translate_selection_fly_timer = null;
s3gt.action.translate_selection_long_click_range = null;
s3gt.action.translate_selection_middle_click_range = null;
s3gt.action.is_fly_auto = false;
s3gt.action.is_fly_word = false;
s3gt.action.last_move_frame_timer = 0;
s3gt.action.save_move_timer = null;
s3gt.action.page_language = '';

//-------------------------------------------------------------------------------------------
s3gt.action.init = function() {
	//-------------------------------------------------------------------------------------
	window.addEventListener("mouseup", function(event) {
		s3gt.action.translate_selection_tooltip_clear(event, true);
		s3gt.action.clear_fly_timer();
		var timer_value  = (s3gt.tooltip.get_tooltip_from_doc('mini')) ? 10 : 70;
//		var timer_value = 10;
		var translate_selection_timer = s3gt.utils.prefs_get('translate_selection_timer');
		if (translate_selection_timer > timer_value) {
			timer_value = translate_selection_timer;
		}
//		s3gt.key_ctrl_is_pressed = false;
		s3gt.action.translate_selection_fly_timer = { 'action' : 'mouseup' };
		s3gt.action.translate_selection_fly_timer.timeout = setTimeout(function() {
			s3gt.action.translate_selection_fly(event); 
		}, timer_value);
	}, true);
	//-------------------------------------------------------------------------------------
	window.addEventListener("mousedown", function(event) {
		var rangeParent = event.rangeParent;
		var rangeOffset = event.rangeOffset;
		s3gt.action.clear_fly_timer();
		s3gt.sound.play_off();
		var timer_value  = (s3gt.tooltip.get_tooltip_from_doc('mini')) ? 10 : 70;
//		var timer_value = 10;
		s3gt.action.translate_selection_fly_timer = { 'action' : 'mousedown' };
		s3gt.action.translate_selection_fly_timer.timeout = setTimeout(function() {
			s3gt.action.translate_selection_long_click(event, rangeParent, rangeOffset); 
			s3gt.action.translate_selection_middle_click(event, rangeParent, rangeOffset); 
		}, timer_value);

		//-----------------------------------------------------------------------------
		if ((event.button == 1) && s3gt.utils.prefs_get("translate_selection_middle_click",  false)) {
			var text = s3gt.utils.search_selected();
			if (text.length > 0) {
				try {
					event.preventDefault();
					event.stopPropagation();
				} catch(e) {
				}
			}
		}
	}, true);
	//-------------------------------------------------------------------------------------
	window.addEventListener("mousedown", s3gt.action.save_mouse_position, true);
	window.addEventListener("mousedown", s3gt.action.translate_selection_tooltip_clear, true);
	window.addEventListener("keydown", s3gt.action.translate_selection_tooltip_keydown, true);
	window.addEventListener("drag", s3gt.action.translate_selection_long_click_stop_drag, true);
//	window.addEventListener("dblclick", s3gt.action.translate_selection_long_click_stop_dblclick, true);
	window.addEventListener("click", s3gt.action.translate_selection_long_click_stop_click, true);
	window.addEventListener("click", s3gt.action.translate_selection_middle_click_stop_click, true);
	window.addEventListener("click", s3gt.action.translate_selection_fly_word_stop_click, true);
	window.addEventListener("mousemove", s3gt.action.translate_selection_tooltip_move, true);
	window.addEventListener("keydown", s3gt.action.translate_close_box, true);
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_fly = function(event) {
	s3gt.action.is_fly_word = false;
	//-----------------------------------------------------------------------------------
	if (! event.isTrusted) { return; }
	if (event.button != 0) { return; }
	//-----------------------------------------------------------------------------------
	var text = s3gt.utils.search_selected(event);
	//-----------------------------------------------------------------------------------
	if (s3gt.utils.check_cyrillic(text)) { return; }
	//-----------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("tooltip_check_page_language",  false)) {
		if (s3gt.prefs.get_lang_to(true) == s3gt.action.page_language) {
			return;
		}
	}
	//-----------------------------------------------------------------------------------
	if (s3gt.action.translate_selection_long_click_range) {
		try {
			event.stopPropagation();
		} catch(e) {
		}
		setTimeout(function() {
			var getSelection = s3gt.utils.get_selection_data();
			getSelection.removeAllRanges();
			getSelection.addRange(s3gt.action.translate_selection_long_click_range);
			s3gt.action.translate_selection_long_click_range = null;
		}, 10);
		return;
	}
	//-----------------------------------------------------------------------------------
	s3gt.action.clear_fly_timer();
	var type_click = 'normal';
	//-----------------------------------------------------------------------------------
	try {
		if (event.originalTarget) {
			if (event.originalTarget.id && (event.originalTarget.id.substring(0,5) == "s3gt-")) {
				return;
			}
		}
	} catch(e) {};
	//-----------------------------------------------------------------------------------
	if (s3gt.tooltip.get_tooltip(event.target)) { return; }
	//-----------------------------------------------------------------------------------
	var tooltip = s3gt.tooltip.get_tooltip_from_doc('fly');
	var lang_from_tooltip = s3gt.prefs.get_lang_from();
	var lang_to_tooltip = s3gt.prefs.get_lang_to();
	//-----------------------------------------------------------------------------------
	if (tooltip) {
		if (tooltip.is_move_mouse_down) { return; }
		//---------------------------------------------------------------------------
		lang_from_tooltip = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from').value;
		lang_to_tooltip = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value;
		//---------------------------------------------------------------------------
		if (! tooltip.is_minimize) {
			if (tooltip.translate_selection_fly_tooltip) {
				if (text.length > 0) {
					s3gt.translate.selection_fly_run(text, lang_from_tooltip, lang_to_tooltip, event);
					return;
				}
			}
		}
	}

	//-----------------------------------------------------------------------------------
	var fly_auto = s3gt.utils.prefs_get('translate_selection_fly_auto', 'disabled');
	s3gt.action.is_fly_auto = false;
	var is_word_auto = false;
	if (text.length == 0) {
		if (s3gt.utils.prefs_get("translate_word_fly",  false)) {
			fly_auto = s3gt.utils.prefs_get('translate_word_fly_key', 'disabled');
			is_word_auto = true;
		}
	}

	//-----------------------------------------------------------------------------------
	if ((fly_auto == 'alt') && event.altKey && (! event.shiftKey) && (! event.ctrlKey)) {
		s3gt.action.is_fly_auto = true;
	}
	else if ((fly_auto == 'alt_shift') && event.altKey && event.shiftKey && (! event.ctrlKey)) {
		s3gt.action.is_fly_auto = true;
	}
	else if ((fly_auto == 'ctrl') && (! event.altKey) && (! event.shiftKey) && event.ctrlKey) {
		s3gt.action.is_fly_auto = true;
	}

	//-----------------------------------------------------------------------------------
	if (s3gt.action.is_fly_auto) {
		type_click = 'fly_auto';
		try {
			event.preventDefault();
			event.stopPropagation();
		} catch(e) {
		}
		//----------------------------------------------------------------------------
		if (is_word_auto) {
			text = s3gt.utils.word_at_point(event);
			if (text.length != 0) {
				type_click = 'fly_word';
				s3gt.action.is_fly_word = true;
				event.run_speech_source = s3gt.utils.prefs_get("translate_word_fly_sound", false);
				s3gt.translate.selection_fly(lang_from_tooltip, lang_to_tooltip, event, true, text, type_click);
				return;
			}
		}
	}
	//-----------------------------------------------------------------------------------
	if (s3gt.action.is_fly_auto || s3gt.utils.get_pref_translate_selection_fly()) {
		s3gt.action.translate_selection_fly_timer = { 'action' : 'translate_fly' };
		s3gt.action.translate_selection_fly_timer.timeout = setTimeout(function() {
			s3gt.action.translate_selection_fly_timer = null;
			s3gt.translate.selection_fly(lang_from_tooltip, lang_to_tooltip, event, s3gt.action.is_fly_auto, undefined, type_click);
		}, 100);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.clear_fly_timer = function() {
	if (s3gt.action.translate_selection_fly_timer != null) {
		try {
			clearTimeout(s3gt.action.translate_selection_fly_timer.timeout);
		} catch(e){};
		s3gt.action.translate_selection_fly_timer = null;
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_tooltip_move = function(event) {
	//-----------------------------------------------------------------------------------
	if (s3gt.action.translate_selection_fly_timer) {
		if (/^long_click/.test(s3gt.action.translate_selection_fly_timer.action)) {
//			if (((event.movementY != undefined) && (event.movementY < 5)) || ((event.movementX != undefined) && (event.movementX < 5))) {
//			} else {
				s3gt.action.clear_fly_timer();
//			}
		}
	}
	//-----------------------------------------------------------------------------------
	if (s3gt.utils.check_isFrame()) {
		var event_move = s3gt.utils.clone_object_event(event);
		event_move.is_frame = true;
		event_move.last_move_frame_timer = (new Date).getTime();
		chrome.runtime.sendMessage({ 'move_fly_iframe': true, 'data' : { 'event' : event_move } });
	} else {
		//-----------------------------------------------------------------------------
		if (event.is_frame) {
			if (s3gt.action.last_move_frame_timer > event.last_move_frame_timer) {
				return;
			} else {
				s3gt.action.last_move_frame_timer = event.last_move_frame_timer;
			}
		} else {
			s3gt.action.last_move_frame_timer = (new Date).getTime();
		}
		//-----------------------------------------------------------------------------
		var tooltip = s3gt.tooltip.get_tooltip_from_list('is_move_mouse_down');
		if (tooltip && tooltip.is_move_mouse_down) {
			if (tooltip.is_panel) {
				s3gt.action.translate_selection_tooltip_move_panel(event, tooltip);
			} else {
				s3gt.action.translate_selection_tooltip_move_fly(event, tooltip);
			}
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_tooltip_move_fly = function(event, tooltip) {
	var movementX = event.screenX - tooltip.is_move_mouse_start_x;
	var movementY = event.screenY - tooltip.is_move_mouse_start_y;

	var e_pageX = tooltip.e_pageX + movementX;
	var e_pageY = tooltip.e_pageY + movementY;

//	var width = tooltip.clientWidth;
	var width = tooltip.doc.tooltip_body.scrollWidth;

//	var clientWidth = document.documentElement.clientWidth;
//	var clientHeight = document.documentElement.clientHeight;
	var clientWidth = window.innerWidth;
	var clientHeight = window.innerHeight;

	//-------------------------------------------------------------------------------------
	if (((clientWidth * s3gt.main.zoom_index) - e_pageX) < Math.floor(width/2))  {
		e_pageX = (clientWidth * s3gt.main.zoom_index) - Math.floor(width/2);
	} else if ((e_pageX + width/2) < 0) {
		e_pageX = 0 - Math.floor(width/2);
	} else {
		tooltip.e_pageX = e_pageX;
		tooltip.is_move_mouse_start_x = event.screenX;
	}
	//-------------------------------------------------------------------------------------
	if (((clientHeight * s3gt.main.zoom_index) - e_pageY) < 50) {
		e_pageY = (clientHeight * s3gt.main.zoom_index) - 50;
	} else if (e_pageY < 0) {
		e_pageY = 0;
	} else {
		tooltip.e_pageY = e_pageY;
		tooltip.is_move_mouse_start_y = event.screenY;
	}
	//-------------------------------------------------------------------------------------
	tooltip.style.top = s3gt.utils.get_real_pos_y(tooltip, e_pageY) + "px";
	tooltip.style.left = s3gt.utils.get_real_pos_x(tooltip, e_pageX) + "px";
	//-------------------------------------------------------------------------------------
	try {
		clearTimeout(s3gt.action.save_move_timer);
	} catch(e) {};
	//-------------------------------------------------------------------------------------
	s3gt.action.save_move_timer = setTimeout(function(){
		s3gt.main.pref_save('tooltip_position_x', e_pageX);
		s3gt.main.pref_save('tooltip_position_y', e_pageY);
		s3gt.tooltip.set_work_data(tooltip);
	}, 200);
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_tooltip_move_panel = function(event, tooltip) {
	var movementY = tooltip.is_move_mouse_start_y - event.screenY;
	var tooltip_height_panel = tooltip.tooltip_height_panel + movementY;

//	var clientHeight = document.documentElement.clientHeight;
	var clientHeight = window.innerHeight;
	var tooltip_bottom = parseInt(tooltip.style.bottom);

	if ((movementY > 0) && ((tooltip.clientHeight+tooltip_bottom) > ((clientHeight * s3gt.main.zoom_index) - 20))) {
		tooltip_height_panel = tooltip.tooltip_height_panel;
//		tooltip.is_move_mouse_down = false;
	}
	else if (tooltip_height_panel < tooltip.tooltip_height_panel_min) {
		tooltip_height_panel = tooltip.tooltip_height_panel_min;
//		tooltip.is_move_mouse_down = false;
	} else {
		tooltip.tooltip_height_panel = tooltip_height_panel;
		tooltip.is_move_mouse_start_y = event.screenY;
	}
	//-------------------------------------------------------------------------------------
	tooltip.thtml.set_textbox_size(tooltip.doc);
	//-------------------------------------------------------------------------------------
	try {
		clearTimeout(s3gt.action.save_move_timer);
	} catch(e) {};
	//-------------------------------------------------------------------------------------
	s3gt.action.save_move_timer = setTimeout(function(){
		s3gt.main.pref_save('tooltip_height_panel', tooltip_height_panel);
		s3gt.tooltip.set_work_data(tooltip);
	}, 200);
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_tooltip_clear = function(event, is_mini) {
	var tooltip = s3gt.tooltip.get_tooltip(event.target);
	//-----------------------------------------------------------------------------------
	if (is_mini) {
		if (tooltip && tooltip.is_mini) {
			return; 
		} else if (s3gt.action.translate_selection_long_click_range) {
			if (s3gt.utils.prefs_get('translate_selection_long_click_action', 'tooltip') != 'translate') {
				return; 
			}
		} else if (s3gt.action.translate_selection_middle_click_range) {
			return; 
		} else {
			s3gt.tooltip.remove(true);
		}
	}
	//-----------------------------------------------------------------------------------
	if (tooltip) { return; }
	//-----------------------------------------------------------------------------------
	s3gt.tooltip.remove();
	if (s3gt.utils.check_isFrame()) {
		chrome.runtime.sendMessage({ 'remove_fly_iframe': true });
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_middle_click = function(event, rangeParent, rangeOffset) {
	s3gt.action.translate_selection_middle_click_range = null;
	//-----------------------------------------------------------------------------------
	if (s3gt.tooltip.get_tooltip(event.target)) { return; }

	//-----------------------------------------------------------------------------------
	if (event.button != 1) { return; }
	var text = s3gt.utils.search_selected();
	//-----------------------------------------------------------------------------------
	if (text.length == 0) {
		return;
	}
	//-----------------------------------------------------------------------------------
	if (! s3gt.utils.prefs_get("translate_selection_middle_click",  false)) { return; }

	//-----------------------------------------------------------------------------------
	var middle_click_action = s3gt.utils.prefs_get('translate_selection_middle_click_action', 'tooltip');
	if (middle_click_action == 'translate_on_it') {
		var getSelection = s3gt.utils.get_selection_data();
		var is_return = true;
		try {
			if (rangeParent) {
				if (!getSelection.isCollapsed && getSelection.getRangeAt(0).isPointInRange(rangeParent, rangeOffset)) {
					is_return = false;
				}
			} else if (document.caretRangeFromPoint) {
				var range = document.caretRangeFromPoint(event.clientX, event.clientY);
				if (!getSelection.isCollapsed && getSelection.getRangeAt(0).isPointInRange(range.startContainer, range.startOffset)) {
					is_return = false;
				}
			}
		} catch(e) {
		}
		if (is_return) { return; } 
	}

	//-----------------------------------------------------------------------------------
	var is_fly_auto = (middle_click_action == 'tooltip') ? false : true;
	var getSelection = s3gt.utils.get_selection_data();
	s3gt.action.translate_selection_middle_click_range = (getSelection) ? getSelection.getRangeAt(0).cloneRange() : null;
	s3gt.translate.selection_fly(s3gt.prefs.get_lang_from(), s3gt.prefs.get_lang_to(), event, is_fly_auto, text, 'middle_click');
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_long_click = function(event, rangeParent, rangeOffset) {
	s3gt.action.translate_selection_long_click_range = null;
	//-----------------------------------------------------------------------------------
	if (s3gt.tooltip.get_tooltip(event.target)) { return; }

	//-----------------------------------------------------------------------------------
	if (event.button != 0) { return; }
	var text = s3gt.utils.search_selected();
	//-----------------------------------------------------------------------------------
	if (text.length == 0) {
		if (s3gt.utils.prefs_get("translate_word_fly_long_click",  false)) {
			text = s3gt.utils.word_at_point(event);
			if (text.length != 0) {
				s3gt.action.clear_fly_timer();
				var long_click_timer_word = s3gt.utils.prefs_get('translate_word_fly_long_click_timer');
				if (! long_click_timer_word) { long_click_timer_word = 700; }
				s3gt.action.translate_selection_fly_timer = { 'action' : 'long_click_word' };
				s3gt.action.translate_selection_fly_timer.timeout = setTimeout(function() {
					s3gt.action.translate_selection_fly_timer = null;
					event.run_speech_source = s3gt.utils.prefs_get("translate_word_fly_sound", false);
					s3gt.action.is_fly_word = true;
					s3gt.translate.selection_fly(s3gt.prefs.get_lang_from(), s3gt.prefs.get_lang_to(), event, true, text, 'fly_word');
				}, long_click_timer_word);
			}
		}
		return;
	}
	//-----------------------------------------------------------------------------------
	if (! s3gt.utils.prefs_get("translate_selection_long_click",  false)) { return; }
	//-----------------------------------------------------------------------------------
	var getSelection = s3gt.utils.get_selection_data();
	var is_return = true;
	try {
		if (rangeParent) {
			if (!getSelection.isCollapsed && getSelection.getRangeAt(0).isPointInRange(rangeParent, rangeOffset)) {
				is_return = false;
			}
		} else if (document.caretRangeFromPoint) {
			var range = document.caretRangeFromPoint(event.clientX, event.clientY);
			if (!getSelection.isCollapsed && getSelection.getRangeAt(0).isPointInRange(range.startContainer, range.startOffset)) {
				is_return = false;
			}
		}
	} catch(e) {
	}
	//-------------------------------------------------------------------------------------
	if (is_return) { return; } 

	//-------------------------------------------------------------------------------------
	s3gt.action.clear_fly_timer();
	var long_click_timer = s3gt.utils.prefs_get('translate_selection_long_click_timer');
	if (! long_click_timer) { long_click_timer = 700; }

	s3gt.action.translate_selection_fly_timer = { 'action' : 'long_click' };
	s3gt.action.translate_selection_fly_timer.timeout = setTimeout(function() {
		var is_fly_auto = (s3gt.utils.prefs_get('translate_selection_long_click_action', 'tooltip') == 'translate') ? true : false;
		s3gt.action.translate_selection_fly_timer = null;
		s3gt.action.translate_selection_long_click_range = getSelection.getRangeAt(0).cloneRange();
		s3gt.translate.selection_fly(s3gt.prefs.get_lang_from(), s3gt.prefs.get_lang_to(), event, is_fly_auto, text, 'long_click');
	}, long_click_timer);
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_long_click_stop_drag = function(event) {
	s3gt.action.translate_selection_long_click_range = null;
	s3gt.action.clear_fly_timer();
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_long_click_stop_dblclick = function(event) {
	s3gt.action.translate_selection_long_click_range = null;
	s3gt.action.clear_fly_timer();
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_long_click_stop_click = function(event) {
	if (s3gt.action.translate_selection_long_click_range) {
		try {
			event.preventDefault();
			event.stopPropagation();
		} catch(e) {
		}
		return;
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_middle_click_stop_click = function(event) {
	if (s3gt.utils.prefs_get("translate_selection_middle_click",  false)) {
		if (s3gt.action.translate_selection_middle_click_range) {
			try {
				event.preventDefault();
				event.stopPropagation();
			} catch(e) {
			}
			return;
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_fly_word_stop_click = function(event) {
	if (s3gt.action.is_fly_word) {
		s3gt.action.is_fly_word = false;
		try {
			event.preventDefault();
			event.stopPropagation();
		} catch(e) {
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_selection_tooltip_keydown = function(event) {
	if ((! event.keyCode) || (event.keyCode <= 40)) {
		return;
	}
	s3gt.action.translate_selection_tooltip_clear(event);
}
//-------------------------------------------------------------------------------------------
s3gt.action.save_mouse_position = function(event) {
	if (event.button == 0) {
		s3gt.tooltip.mouse_move_y = event.pageY;
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.translate_close_box = function(event) {
	if (event.which == "27") {
		var tooltip = s3gt.tooltip.get_tooltip_from_doc('fly');
		if (tooltip) {
			s3gt.tooltip.remove_click(tooltip);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.action.go_donate = function() {
	chrome.runtime.sendMessage({ 'open_url': true, 'url' : s3gt.work_data.go_donate, 'pos_after_active' : true });
}
//------------------------------------------------------------------------------
s3gt.action.open_prefs = function() {
	chrome.runtime.sendMessage({ 'action_open_settings': true });
}
//-------------------------------------------------------------------------------------------
s3gt.action.load_tab = function(language) {
	//-----------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("tooltip_check_page_language")) {
		language = s3gt.utils.check_page_language(language);
	}
	s3gt.action.page_language = language;
	//-----------------------------------------------------------------------------------
//	if (document instanceof HTMLDocument) {
//		if (document.defaultView.frameElement) {
//			return;
//		}
//	}
	//-----------------------------------------------------------------------------------
	if (document.contentType && (! /html/i.test(document.contentType))) {
		return 0;
	}
	//-----------------------------------------------------------------------------------
	if (! (document.location && document.location.hostname)) {
		return 0;
	}
	//-----------------------------------------------------------------------------------
	var domain = document.location.hostname;
	var is_trans_full_page = false;
	//-----------------------------------------------------------------------------------
	// translate full page
	//-----------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("run_trans_full_page")) {
		if (s3gt.utils.check_domain_translate(domain)) {
			is_trans_full_page = true;
			s3gt.translate.page_run(s3gt.prefs.get_lang_from(true), s3gt.prefs.get_lang_to(true), true);
		}
		//----------------------------------------------------------------------
		else if (s3gt.utils.prefs_get("autotranslate_allpages") && (s3gt.utils.get_http_protocol() != 'https://')) {
			var doc_lang = s3gt.utils.check_page_language(language);
			s3gt.action.page_language = doc_lang;
			if (doc_lang) {
				var lang_to = s3gt.prefs.get_lang_to(true);
				if (doc_lang != lang_to) {
					is_trans_full_page = true;
					s3gt.translate.page_run(doc_lang, lang_to, true);
				}
			}
		}
	}
	//-----------------------------------------------------------------------------------
	// language learning
	//-----------------------------------------------------------------------------------
	if (! is_trans_full_page) {
		if (s3gt.utils.prefs_get("learning_enable",  false)) {
			s3gt.learning.run();
		}
	}
}
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
