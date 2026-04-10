//------------------------------------------------------------------------------
s3gt.tooltip = {};
//------------------------------------------------------------------------------
s3gt.tooltip.init = function() {
	s3gt.tooltip.tooltip_list = [];
	s3gt.tooltip.remove_timer = null;
	s3gt.tooltip.mouse_move_y = 0;
	s3gt.tooltip.style_cache = '';
	s3gt.tooltip.wait_init_func = null;
	s3gt.tooltip.zindex_maximum = 2147470000;
	s3gt.tooltip.panel_maximum = 1;
	s3gt.tooltip.set_work_data_stop = false;
	s3gt.tooltip.get_work_data_stop = false;
	s3gt.tooltip.body_margin_bottom = null;
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_fly_switch = function(event, original_text, is_new, lang_from, lang_to) {
	var basic_functions_in_panel = s3gt.tooltip.check_basic_functions_in_panel(event, s3gt.utils.prefs_get('basic_functions_in_panel'));
	//------------------------------------------------------------------------
	if (! event) { event = {}; }
	//------------------------------------------------------------------------
	var map_pref_window = {
		'normal' : 'translate_selection_fly_window_new',
		'middle_click' : 'translate_selection_middle_click_window_new',
		'long_click' : 'translate_selection_long_click_window_new',
		'fly_auto' : 'translate_selection_fly_auto_window_new',
		'fly_word' : 'translate_word_fly_window_new',
		'clipboard' : 'translate_clipboard_window_new'
	};
	var window_new = s3gt.utils.prefs_get(map_pref_window[event.type_click] || 'unknown');
	//------------------------------------------------------------------------
	if (event.key_ctrl_is_pressed && ! s3gt.action.is_fly_auto) {
		if (window_new == 'ctrl_fly') {
			basic_functions_in_panel = false;
		} else if (window_new == 'ctrl_panel') {
			basic_functions_in_panel = true;
		} else {
			basic_functions_in_panel = ! basic_functions_in_panel;
		}
	}
	//------------------------------------------------------------------------
	if (basic_functions_in_panel) {
		return s3gt.tooltip.create_fly_panel(event, original_text, is_new, lang_from, lang_to);
	} else {
		return s3gt.tooltip.create_fly(event, original_text, is_new, lang_from, lang_to);
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.check_basic_functions_in_panel = function(event, basic_functions_in_panel) {
	//------------------------------------------------------------------------
	if (! event) { event = {}; }
	//------------------------------------------------------------------------
	var map_pref_tooltip = {
		'normal' : 'translate_selection_fly_translate_open',
		'middle_click' : 'translate_selection_middle_click_translate_open',
		'long_click' : 'translate_selection_long_click_translate_open',
		'fly_auto' : 'translate_selection_fly_auto_translate_open',
		'fly_word' : 'translate_word_fly_translate_open',
		'clipboard' : 'translate_clipboard_translate_open'
	};
	var window_tooltip = s3gt.utils.prefs_get(map_pref_tooltip[event.type_click] || 'unknown');
	//------------------------------------------------------------------------
	if (window_tooltip == 'fly') {
		basic_functions_in_panel = false;
	} else if (window_tooltip == 'panel') {
		basic_functions_in_panel = true;
	}
	//------------------------------------------------------------------------
	return basic_functions_in_panel;
}
//------------------------------------------------------------------------------
s3gt.tooltip.check_window_new = function(type_click) {
	if (! type_click) { return false; }

	var map_pref_window = {
		'normal' : 'translate_selection_fly_window_new',
		'middle_click' : 'translate_selection_middle_click_window_new',
		'long_click' : 'translate_selection_long_click_window_new',
		'fly_auto' : 'translate_selection_fly_auto_window_new',
		'fly_word' : 'translate_word_fly_window_new',
		'clipboard' : 'translate_clipboard_window_new'
	};
	var window_new = s3gt.utils.prefs_get(map_pref_window[type_click] || 'unknown');

	if (window_new == 'always') {
		return true;
	} else if (s3gt.key_ctrl_is_pressed) {
		if ((window_new == 'ctrl_fly') || (window_new == 'ctrl_panel')) {
			return true;
		}
	}

	return false;
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_fly = function(event, original_text, is_new, lang_from, lang_to) {
	var tooltip;

	if (s3gt.utils.check_isFrame()) {
		chrome.runtime.sendMessage({ 'create_fly_iframe': true, 'data' : { 'event' : s3gt.utils.clone_object_event(event), 'text' : original_text, 'is_new' : is_new, 'lang_from' : lang_from, 'lang_to' : lang_to } });
		s3gt.key_ctrl_is_pressed = false;
		return false;
	}
	if (is_new) {
		tooltip = s3gt.tooltip.get_tooltip_from_list('is_hidden');
	}
	else {
		s3gt.tooltip.remove();
		tooltip = s3gt.tooltip.get_tooltip_from_doc('fly', true, false);
	}
	if (! tooltip) {
		tooltip = s3gt.tooltip.create_fly_basic();
	}

	tooltip.is_panel = false;
	tooltip.style.bottom = "";
//	tooltip.style.width = "";
	tooltip.tframe.style.width = "";

	s3gt.tooltip.create_fly_basic2(event, tooltip, original_text);

	var zoom_index = s3gt.utils.get_zoom_value();
	tooltip.style.transform = 'scale(' + 1/ zoom_index + ')';
	tooltip.style.transformOrigin = 'bottom right';

	tooltip.style.left = s3gt.utils.get_real_pos_x(tooltip, tooltip.e_pageX) + 'px';
	tooltip.style.top = s3gt.utils.get_real_pos_y(tooltip, tooltip.e_pageY) + 'px';

	tooltip.minimize_top = tooltip.style.top;
	tooltip.minimize_left = tooltip.style.left;

	return tooltip;
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_fly_panel = function(event, original_text, is_new, lang_from, lang_to) {
	var tooltip;

	if (s3gt.utils.check_isFrame()) {
		chrome.runtime.sendMessage({ 'create_fly_iframe': true, 'data' : { 'event' : s3gt.utils.clone_object_event(event), 'text' : original_text, 'is_new' : is_new, 'lang_from' : lang_from, 'lang_to' : lang_to } });
		s3gt.key_ctrl_is_pressed = false;
		return false;
	}

	if (is_new) {
		tooltip = s3gt.tooltip.get_tooltip_from_list('is_hidden');
	}
	else {
		s3gt.tooltip.remove();
		tooltip = s3gt.tooltip.get_tooltip_from_doc('panel', true, true);
	}

	if (! tooltip) {
		tooltip = s3gt.tooltip.create_fly_basic();
	}

	tooltip.is_panel = true;
	tooltip.style.left = "0px";
	tooltip.style.top = "";
	tooltip.style.bottom = "0px";
	tooltip.style.width = "100%";
	tooltip.tframe.style.width = "100%";

	s3gt.tooltip.create_fly_basic2(event, tooltip, original_text);

	return tooltip;
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_fly_basic = function() {
	var tooltip = document.createElement('div');
	s3gt.utils.reset_style(tooltip);
	tooltip.tframe = document.createElement('iframe');
	s3gt.utils.reset_style(tooltip.tframe);
	tooltip.tframe.setAttribute('tabindex', 0);
	tooltip.appendChild(tooltip.tframe);
	if (document.body) {
		tooltip = document.body.appendChild(tooltip);
	} else {
		tooltip = window.document.documentElement.appendChild(tooltip);
	}

	tooltip.id = 's3gt_translate_tooltip_fly_box_' + s3gt.utils.random_string(8);
	tooltip.className = 's3gt_translate_tooltip notranslate';
	tooltip.style.position = 'fixed';
	tooltip.style.backgroundColor = 'transparent';

/*
	tooltip.observer = new MutationObserver(function(mutations) {
		for (var i=0; i<mutations.length; i++) {
			var mutation = mutations[i];
			if (mutation.attributeName == "style") {
				if ((tooltip.style.display != 'none') && (tooltip.style.display != 'initial')) {
					tooltip.style.display = 'initial';
				}
			}
		}
	});
	tooltip.observer.observe(tooltip, { childList: false, subtree: false, attributes: true });
*/

	tooltip.style.width = "450px";
	tooltip.style.height = "300px";

	tooltip.tframe.style.width = "450px";
	tooltip.tframe.style.height = "300px";
	tooltip.tframe.style.backgroundColor = 'transparent';
	tooltip.tframe.style.padding = 0;
	tooltip.tframe.style.margin = 0;
	tooltip.tframe.style.border = 'none';
//	tooltip.tframe.style.overflow = 'none';
	
	tooltip.set_style_mini_size = s3gt.tooltip.set_style_mini_size;
	tooltip.repos = s3gt.tooltip.repos;
	tooltip.check_zindex_value = s3gt.tooltip.check_zindex_value;
	tooltip.check_panel_value = s3gt.tooltip.check_panel_value;

	tooltip.translate_run = s3gt.tooltip.translate_run;
	tooltip.translate_reverse = s3gt.tooltip.translate_reverse;
	tooltip.exchange = s3gt.tooltip.exchange;
	tooltip.set_style_theme = s3gt.tooltip.set_style_theme;
	tooltip.remove_click = s3gt.tooltip.remove_click;
	tooltip.go_donate = s3gt.action.go_donate;
	tooltip.open_prefs = s3gt.action.open_prefs;
	tooltip.go_google = s3gt.translate.go_google;
	tooltip.google_text_short = s3gt.translate.google_text_short;
	tooltip.clear_fly_last_text = s3gt.translate.clear_fly_last_text;
	tooltip.get_lang_from = s3gt.tooltip.get_lang_from;
	tooltip.set_style_cache = s3gt.tooltip.set_style_cache;
	tooltip.tooltip_move = s3gt.action.translate_selection_tooltip_move;
	tooltip.recalc_minimize = s3gt.tooltip.recalc_minimize;
	tooltip.set_work_data = s3gt.tooltip.set_work_data;
	tooltip.set_zoom = s3gt.tooltip.set_zoom;
	s3gt.tooltip.tooltip_list.push(tooltip);
	s3gt.tooltip.set_style_print(tooltip);

	return tooltip;
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_fly_basic2 = function(event, tooltip, original_text) {
	tooltip.minimize_top = tooltip.style.top;
	tooltip.minimize_left = tooltip.style.left;
	tooltip.panel_value = 0;
	tooltip.is_init = true;
	tooltip.tab_id = s3gt.main.tab_id;

	s3gt.tooltip.check_panel_value(tooltip, true);
	s3gt.tooltip.check_zindex_value(tooltip);

	tooltip.original_text = original_text;
	tooltip.is_move_mouse_down = false;
	tooltip.id_translate_session = Math.random();
	tooltip.settings_open = false;

	if (tooltip.is_panel) {
		tooltip.view_reverse_translate_tooltip = s3gt.utils.prefs_get("view_reverse_translate_panel");
		tooltip.view_source_translate_tooltip = s3gt.utils.prefs_get("view_source_translate_panel");
		tooltip.translate_selection_fly_tooltip = s3gt.utils.prefs_get("translate_selection_fly_panel");
		tooltip.translate_tooltip_pin = s3gt.utils.prefs_get("translate_panel_pin");
		tooltip.translate_instant_tooltip = s3gt.utils.prefs_get("translate_instant_panel");
		tooltip.set_lowercase_tooltip_from = s3gt.utils.prefs_get("set_lowercase_panel_from");
		tooltip.set_lowercase_tooltip_to = s3gt.utils.prefs_get("set_lowercase_panel_to");
		tooltip.set_lowercase_tooltip_reverse = s3gt.utils.prefs_get("set_lowercase_panel_reverse");
	} else {
		tooltip.view_reverse_translate_tooltip = s3gt.utils.prefs_get("view_reverse_translate_tooltip");
		tooltip.view_source_translate_tooltip = s3gt.utils.prefs_get("view_source_translate_tooltip");
		tooltip.translate_selection_fly_tooltip = s3gt.utils.prefs_get("translate_selection_fly_tooltip");
		tooltip.translate_tooltip_pin = s3gt.utils.prefs_get("translate_tooltip_pin");
		tooltip.translate_instant_tooltip = s3gt.utils.prefs_get("translate_instant_tooltip");
		tooltip.set_lowercase_tooltip_from = s3gt.utils.prefs_get("set_lowercase_tooltip_from");
		tooltip.set_lowercase_tooltip_to = s3gt.utils.prefs_get("set_lowercase_tooltip_to");
		tooltip.set_lowercase_tooltip_reverse = s3gt.utils.prefs_get("set_lowercase_tooltip_reverse");
	}

	tooltip.save_last_lang_reverse = s3gt.utils.prefs_get("save_last_lang_reverse");
	tooltip.save_last_lang_from = s3gt.utils.prefs_get("save_last_lang_from");
	tooltip.tooltip_width = s3gt.utils.prefs_get('tooltip_width');
	tooltip.tooltip_height_from = s3gt.utils.prefs_get('tooltip_height_from');
	tooltip.tooltip_height_to = s3gt.utils.prefs_get('tooltip_height_to');
	tooltip.tooltip_height_reverse = s3gt.utils.prefs_get('tooltip_height_reverse');

	var pos_x = ((tooltip.is_panel) ? s3gt.utils.get_pos_x() : s3gt.utils.get_pos_x(event)) *  s3gt.main.zoom_index;
	var pos_y = ((tooltip.is_panel) ? s3gt.utils.get_pos_y() : s3gt.utils.get_pos_y(event)) *  s3gt.main.zoom_index;
	if (s3gt.utils.prefs_get("tooltip_position_is_save")) {
		pos_x = s3gt.utils.prefs_get('tooltip_position_x');
		pos_y = s3gt.utils.prefs_get('tooltip_position_y');
	}
	var pos_result = s3gt.tooltip.check_position(pos_x, pos_y);
	pos_x += pos_result;
	pos_y += pos_result;
	if (pos_x < 10) { pos_x = 10; }
	if (pos_y < 10) { pos_y = 10; }

	s3gt.main.pref_save('tooltip_position_x', pos_x);

	tooltip.e_pageX = pos_x;
	tooltip.e_pageY = pos_y;
	s3gt.main.pref_save('tooltip_position_y', tooltip.e_pageY);

	tooltip.tooltip_height_panel = s3gt.utils.prefs_get('tooltip_height_panel');
	tooltip.tooltip_height_panel_min = 75;

	tooltip.type_click = event.type_click;
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_mini = function(event, original_text, type_click) {
	s3gt.tooltip.remove(true);

	var pos_x = event.pageX;
	var pos_y = event.pageY;

	var tooltip = document.createElement('div');
	s3gt.utils.reset_style(tooltip);
	tooltip.id = 's3gt_translate_tooltip_mini';
	tooltip.className = 's3gt_translate_tooltip_mini_box';
	tooltip.style.position = 'absolute';

	if (s3gt.tooltip.style_cache) {
		tooltip.setAttribute('is_hide', true);
	}

	//------------------------------------------------------------------------
	if (! type_click) { type_click = 'normal'; }
	//------------------------------------------------------------------------
	var map_pref = {
		'normal' : { 'show_translate' : 'translate_selection_fly_translate', 'show_translate_plus' : 'translate_selection_fly_translate_plus', 'show_sound' : 'translate_selection_fly_sound', 'show_copy' : 'translate_selection_fly_copy' },
		'long_click' : { 'show_translate' : 'translate_selection_long_click_translate', 'show_translate_plus' : 'translate_selection_long_click_translate_plus', 'show_sound' : 'translate_selection_long_click_sound', 'show_copy' : 'translate_selection_long_click_copy' },
		'middle_click' : { 'show_translate' : 'translate_selection_middle_click_translate', 'show_translate_plus' : 'translate_selection_middle_click_translate_plus', 'show_sound' : 'translate_selection_middle_click_sound', 'show_copy' : 'translate_selection_middle_click_copy' }
	};

	//------------------------------------------------------------------------
	var is_show_translate = s3gt.utils.prefs_get(map_pref[type_click].show_translate,  false);
	if (is_show_translate) {
		var tooltip_logo = document.createElement('div');
		tooltip_logo.id = 's3gt_translate_tooltip_mini_logo';
		tooltip_logo.className = 's3gt_translate_tooltip_mini';
		tooltip.appendChild(tooltip_logo);
		tooltip_logo.setAttribute('title', s3gt.utils.get_string('translate.selection'));
	}

	var is_show_translate_plus = s3gt.utils.prefs_get(map_pref[type_click].show_translate_plus,  false);
	if (is_show_translate_plus) {
		var tooltip_logo_plus = document.createElement('div');
		tooltip_logo_plus.id = 's3gt_translate_tooltip_mini_logo_plus';
		tooltip_logo_plus.className = 's3gt_translate_tooltip_mini';
		tooltip.appendChild(tooltip_logo_plus);
		tooltip_logo_plus.setAttribute('title', s3gt.utils.get_string('translate.button.plus'));
	}

	var is_show_sound = s3gt.utils.prefs_get(map_pref[type_click].show_sound,  false);
	if (is_show_sound) {
		var tooltip_sound = document.createElement('div');
		tooltip_sound.id = 's3gt_translate_tooltip_mini_sound';
		tooltip_sound.className = 's3gt_translate_tooltip_mini';
		tooltip.appendChild(tooltip_sound);
		tooltip_sound.setAttribute('title', s3gt.utils.get_string('translate.button.sound.play'));
		tooltip_sound.setAttribute('title_play', s3gt.utils.get_string('translate.button.sound.play'));
		tooltip_sound.setAttribute('title_stop', s3gt.utils.get_string('translate.button.sound.stop'));
	}

	var is_show_copy = s3gt.utils.prefs_get(map_pref[type_click].show_copy,  false);
	if (is_show_copy) {
		var tooltip_copy = document.createElement('div');
		tooltip_copy.id = 's3gt_translate_tooltip_mini_copy';
		tooltip_copy.className = 's3gt_translate_tooltip_mini';
		tooltip.appendChild(tooltip_copy);
		tooltip_copy.setAttribute('title', s3gt.utils.get_string('translate.button.copy.text'));
	}

	if (! is_show_translate && ! is_show_translate_plus && ! is_show_sound && ! is_show_copy) { return; }

	tooltip.e_pageX = pos_x;
	tooltip.e_pageY = pos_y;
	tooltip.style.left = pos_x + "px";
	tooltip.style.top = pos_y + "px";
	tooltip.doc = document;
	tooltip.original_text = original_text;
	tooltip.is_mini = true;

	var body = document.getElementsByTagName('body')[0];
	if (! body) { return null; }
	tooltip = body.appendChild(tooltip);

	if (body.style.position == 'fixed') {
		tooltip.style.position = 'fixed';
	}

	s3gt.tooltip.set_style(tooltip, function(){
		tooltip.removeAttribute('is_hide');
	});

	var clientWidth = document.documentElement.clientWidth;
	if ((pos_y + (tooltip.clientHeight) < 31) || ((pos_x + tooltip.clientWidth + 20) > clientWidth)) {
		tooltip.setAttribute('is_bottom', true);
	} else if ((s3gt.tooltip.mouse_move_y + 5) <= pos_y) {
		tooltip.setAttribute('is_bottom', true);
	}
	tooltip.setAttribute('is_mini', true);
	s3gt.tooltip.tooltip_list.push(tooltip);
	return tooltip;
}
//------------------------------------------------------------------------------
s3gt.tooltip.check_panel_value = function(tooltip_base, is_open) {
	if (tooltip_base && tooltip_base.is_panel) {
		if (! tooltip_base.is_minimize) {
			if (is_open) {
				s3gt.tooltip.panel_maximum++;
				tooltip_base.panel_value = s3gt.tooltip.panel_maximum;
			}
		}
	}
	//--------------------------------------------------------------------------
	var panel_list = [];
	//--------------------------------------------------------------------------
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if (tooltip.is_mini) { continue; }
		if (! tooltip.tframe) { continue; }
		if (! tooltip.doc) { continue; }
		if (tooltip.tframe.is_hidden) { continue; }
		if (tooltip.is_minimize) { continue; }
		if (! tooltip.is_panel) { continue; }

		panel_list.push(tooltip);
	}
	//--------------------------------------------------------------------------
	panel_list.sort(function(a, b){ return a.panel_value - b.panel_value });
	var is_scroll_bottom = (((document.documentElement.scrollHeight - window.innerHeight) == window.scrollY) && (window.scrollY > 0)) ? true : false;
	var panel_bottom = 0;

	//--------------------------------------------------------------------------
	if (s3gt.utils.check_isPDF()) {
		s3gt.tooltip.doc_style_height = 'none';
		s3gt.tooltip.body_margin_bottom = 0;
	}
	//--------------------------------------------------------------------------
	if (tooltip_base && ! s3gt.tooltip.doc_style_height) {
		try {
			var doc_style = document.defaultView.getComputedStyle(document.documentElement, "");
			if (doc_style) {
				var old_style = document.documentElement.style.display;
				var scrollX = window.scrollX;
				var scrollY = window.scrollY;
				document.documentElement.style.display = 'none';
				s3gt.tooltip.doc_style_height = doc_style.getPropertyValue('height') || '';
				document.documentElement.style.display = old_style;
				window.scrollTo(scrollX, scrollY);
			} else {
				s3gt.tooltip.doc_style_height = 'none';
			}
		} catch(e) {
			s3gt.tooltip.doc_style_height = 'none';
		}
	}
	//--------------------------------------------------------------------------
	//------------------------------------------------------------------------
	if (tooltip_base && s3gt.tooltip.body_margin_bottom == null) {
		try {
			var node_style = document.defaultView.getComputedStyle(document.body, "");
			if (node_style) {
				s3gt.tooltip.body_margin_bottom = parseInt(node_style.getPropertyValue('margin-bottom') || 0);
			} else {
				s3gt.tooltip.body_margin_bottom = 0;
			}
		} catch(e) {
			s3gt.tooltip.body_margin_bottom = 0;
		}
	}
	//--------------------------------------------------------------------------
	var zoom_index = s3gt.utils.get_zoom_value();
	//--------------------------------------------------------------------------
	for (var i=0; i<panel_list.length; i++) {
		var tooltip = panel_list[i];
		tooltip.style.bottom = panel_bottom / zoom_index + 'px';
		panel_bottom += tooltip.clientHeight + 3;
	}
	//--------------------------------------------------------------------------
	if ((s3gt.tooltip.doc_style_height == 'auto')) {
		document.body.style.marginBottom = s3gt.tooltip.body_margin_bottom + panel_bottom + 'px';
		if (is_scroll_bottom && (panel_bottom > 0)) {
			window.scrollTo(window.scrollX, document.documentElement.scrollHeight);
		}
	}
	s3gt.tooltip.set_work_data();
}
//------------------------------------------------------------------------------
s3gt.tooltip.check_zindex_value = function(tooltip_base, only_panel) {
	if (tooltip_base) {
		if (! tooltip_base.is_minimize) {
			if (tooltip_base.style.zIndex != s3gt.tooltip.zindex_maximum) {
				s3gt.tooltip.zindex_maximum++;
				tooltip_base.style.zIndex = s3gt.tooltip.zindex_maximum;
			}
		}
	}
	//--------------------------------------------------------------------------
	var tooltip_main = null;
	var tooltip_zindex = 0;
	//--------------------------------------------------------------------------
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if (tooltip.is_mini) { continue; }
		if (! tooltip.tframe) { continue; }
		if (! tooltip.doc) { continue; }
		if (tooltip.tframe.is_hidden) { continue; }

		if (tooltip.is_minimize) {
			tooltip.doc.tooltip_body.removeAttribute('is_background');
			tooltip.is_move_mouse_down = false;
		} else {
			if (tooltip.style.zIndex != s3gt.tooltip.zindex_maximum) {
				s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').blur();
				tooltip.is_move_mouse_down = false;
			}
			tooltip.doc.tooltip_body.setAttribute('is_background', true);
			//--------------------------------------------------------------------------
			if ((only_panel !== undefined) && (only_panel != tooltip.is_panel)) { continue; }
			//--------------------------------------------------------------------------
			if (tooltip.style.zIndex > tooltip_zindex) {
				tooltip_main = tooltip;
				tooltip_zindex = tooltip.style.zIndex;
			}
		}
	}

	if (tooltip_main) {
		if (tooltip_base && tooltip_base.is_minimize) {
			if (tooltip_main.style.zIndex != s3gt.tooltip.zindex_maximum) {
				s3gt.tooltip.zindex_maximum++;
				tooltip_main.style.zIndex = s3gt.tooltip.zindex_maximum;
			}
		}
		tooltip_main.doc.tooltip_body.removeAttribute('is_background');
		s3gt.tooltip.set_work_data(tooltip_main);
	}
	return tooltip_main;
}
//------------------------------------------------------------------------------
s3gt.tooltip.recalc_minimize = function() {
	var minimize_list = [];
	var bottom_start = 0;
	//--------------------------------------------------------------------------
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if (tooltip.is_mini) { continue; }
		if (! tooltip.tframe) { continue; }
		if (! tooltip.doc) { continue; }
		if (tooltip.tframe.is_hidden) { continue; }

		if (tooltip.is_minimize) {
			minimize_list.push(tooltip);
			tooltip.zindex = tooltip.style.zIndex;
		} else if (tooltip.is_panel) {
			bottom_start += tooltip.clientHeight + 3;
		}
	}
	//--------------------------------------------------------------------------
	minimize_list.sort(function(a, b){
		if (b.is_panel && a.is_panel) {
			return b.style.zIndex - a.style.zIndex;
		} else {
			return b.is_panel - a.is_panel || a.style.zIndex - b.style.zIndex;
		}
	}); 
	//--------------------------------------------------------------------------
	var zoom_index = s3gt.utils.get_zoom_value();
	//--------------------------------------------------------------------------
	for (var i=0; i<minimize_list.length; i++) {
		var tooltip = minimize_list[i];
		tooltip.style.bottom = ((i * (tooltip.clientHeight + 3)) + bottom_start) / zoom_index + 'px';
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.check_position = function(pos_x, pos_y) {
	var result = 0;
	//--------------------------------------------------------------------------
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if (tooltip.is_mini) { continue; }
		if (tooltip.is_panel) { continue; }
		if (! tooltip.tframe) { continue; }
		if (! tooltip.doc) { continue; }
		if (tooltip.tframe.is_hidden) { continue; }

		if ((tooltip.e_pageX >= (pos_x + result - 5)) && (tooltip.e_pageX <= (pos_x + result + 5))) {
			if ((tooltip.e_pageY >= (pos_y - 5)) && (tooltip.e_pageY <= (pos_y + 5))) {
				result = Math.floor((Math.random()*15 +1) * (Math.random()*5 +1));
				if (Math.random() > 0.5) {
					result *= -1;
				}
			}
		}
	}
	//--------------------------------------------------------------------------
	return result;
}
//------------------------------------------------------------------------------
s3gt.tooltip.repos = function(tooltip, is_init) {
	if (tooltip.is_minimize) { return; }
	if (tooltip.is_mini) {
		s3gt.tooltip.repos_mini(tooltip);
	} else {
		s3gt.tooltip.repos_fly(tooltip, is_init);
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.repos_mini = function(tooltip) {
	//--------------------------------------------------------------------------
	var width = tooltip.clientWidth + 20;
	var left = tooltip.e_pageX;
	var clientWidth = document.documentElement.clientWidth + document.documentElement.scrollLeft;
	if ((left + width) > clientWidth) { left = clientWidth - width; }
	if (left < 0) { left = 10; }

	//--------------------------------------------------------------------------
	var height = tooltip.clientHeight + 20;
	var top = tooltip.e_pageY;

	//--------------------------------------------------------------------------
	var clientHeight = 0;
	var scrollTop = 0;
	//--------------------------------------------------------------------------
	if (document.documentElement.scrollTop > 0) {
		clientHeight = document.documentElement.clientHeight;
		scrollTop = document.documentElement.scrollTop;
	}
	else if (document.body && (document.body.scrollTop > 0)) {
		clientHeight = document.body.clientHeight;
		scrollTop = document.body.scrollTop;
	}
	else if (document.body && (document.body.clientHeight > document.documentElement.clientHeight)) {
		clientHeight = document.body.clientHeight;
	}
	else {
		clientHeight = document.documentElement.clientHeight;
	}
	//--------------------------------------------------------------------------
	if ((top + height) > (clientHeight + scrollTop)) {
		top = (clientHeight + scrollTop) - height;
	}
	//--------------------------------------------------------------------------
	// style-class .s3gt_translate_tooltip[is_mini='true'] {	margin: -30px 5px;
	//--------------------------------------------------------------------------
	if (top < (scrollTop + 35)) {
		top = scrollTop + 35;
	}

	tooltip.style.left = left + "px";
	tooltip.style.top = top + "px";

	tooltip.e_pageX = left;
	tooltip.e_pageY = top;
}
//------------------------------------------------------------------------------
s3gt.tooltip.repos_fly = function(tooltip, is_init) {
	if (tooltip.is_panel) {
		s3gt.tooltip.repos_fly_panel(tooltip, is_init);
		return;
	}
	//--------------------------------------------------------------------------
	tooltip.thtml.resize(tooltip.doc);
	//--------------------------------------------------------------------------
//	var width = tooltip.clientWidth;
	var width = tooltip.doc.tooltip_body.scrollWidth;
	var left = tooltip.e_pageX;
//	var clientWidth = document.documentElement.clientWidth;
	var clientWidth = window.innerWidth;
	if (is_init) {
		if ((left + width) > clientWidth) {
			left = clientWidth - width;
		}
		if (left < 0) { left = 0; }
	} else {
		if ((clientWidth - left) < Math.floor(width/2)) {
			left = clientWidth - Math.floor(width/2);
		}
		if ((left + width/2) < 0) {
			left = Math.floor(width/2);
		}
	}

	//--------------------------------------------------------------------------
//	var height = tooltip.clientHeight;
//	var height = tooltip.scrollHeight;
	var height = tooltip.doc.tooltip_body.scrollHeight;

	var top = tooltip.e_pageY;
//	var clientHeight = document.documentElement.clientHeight;
	var clientHeight = window.innerHeight;

	if (is_init) {
		if ((top + height) > clientHeight) { top = clientHeight - height; }
	} else {
		if ((clientHeight - top) < 50) { top = clientHeight - 50; }
	}
	if (top < 0) { top = 0; }

	//--------------------------------------------------------------------------
	tooltip.style.left = left / s3gt.main.zoom_index + "px";
	tooltip.style.top = top / s3gt.main.zoom_index + "px";
	//--------------------------------------------------------------------------
	tooltip.minimize_top = tooltip.style.top;
	tooltip.minimize_left = tooltip.style.left;

	tooltip.e_pageX = left;
	tooltip.e_pageY = top;
	s3gt.tooltip.set_work_data(tooltip);
}
//------------------------------------------------------------------------------
s3gt.tooltip.repos_fly_panel = function(tooltip, is_init) {
	//--------------------------------------------------------------------------
	tooltip.thtml.resize(tooltip.doc);
	//--------------------------------------------------------------------------
	var height = tooltip.clientHeight;
//	var clientHeight = document.documentElement.clientHeight;
	var clientHeight = window.innerHeight;
	var tooltip_bottom = parseInt(tooltip.style.bottom);

	if ((height+tooltip_bottom) > (clientHeight + 1)) {
		tooltip.tooltip_height_panel = tooltip.tooltip_height_panel_min;
	}
	if (tooltip.tooltip_height_panel < tooltip.tooltip_height_panel_min) {
		tooltip.tooltip_height_panel = tooltip.tooltip_height_panel_min;
	}

	//--------------------------------------------------------------------------
	tooltip.thtml.resize(tooltip.doc);
	s3gt.thtml.set_textbox_size(tooltip.doc);
	s3gt.tooltip.set_work_data(tooltip);
}
//------------------------------------------------------------------------------
s3gt.tooltip.check_tooltip_id = function(id) {
	if (! id) {
		return false;
	}
	else if (id == 's3gt_translate_tooltip_mini') {
		return true;
	}
	else if (id == 's3gt_translate_tooltip_body') {
		return true;
	}
	else if (id.substr(0, 30) == 's3gt_translate_tooltip_fly_box') {
		return true;
	}
	return false;
}
//------------------------------------------------------------------------------
s3gt.tooltip.get_tooltip = function(el) {
	try {
		while ((! s3gt.tooltip.check_tooltip_id(el.id)) && el.parentNode) {
			el = el.parentNode;
		}
		if (s3gt.tooltip.check_tooltip_id(el.id)) {
			if (el.tframe && el.tframe.is_hidden) {
				return false;
			} else {
				return el;
			}
		}
	} catch(e) {
	}

	return false;
}
//------------------------------------------------------------------------------
s3gt.tooltip.get_tooltip_from_list = function(property) {
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if ((property == 'is_hidden') && tooltip.tframe && tooltip.tframe.is_hidden) {
			return tooltip;
		}
		else if (tooltip[property] && tooltip.tframe && ! tooltip.tframe.is_hidden) {
			return tooltip;
		}
	}
	return undefined;
}
//------------------------------------------------------------------------------
s3gt.tooltip.get_tooltip_from_doc = function(type, is_hidden, only_panel) {
	if (! type) { type = 'fly'; }

	if (type == 'fly') {
		var tooltip = s3gt.tooltip.check_zindex_value(null, only_panel);
		if (! tooltip) {
			if (is_hidden) {
				tooltip = s3gt.tooltip.get_tooltip_from_list('is_hidden');
			}
		}
		return tooltip;
	}

	var el = document.getElementById('s3gt_translate_tooltip_' + type);
	if (el && el.tframe && el.tframe.is_hidden && (! is_hidden)) {
		return undefined;
	} else {
		return el;
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.remove = function(only_mini, manual_tooltip) {
	var tooltip = null;
	var tooltip_list_new = [];
	//------------------------------------------------------------------------
	while (tooltip = s3gt.tooltip.tooltip_list.shift()) {
		try {
			if (tooltip) {
				var is_remove = true;
				if (only_mini && (! tooltip.is_mini)) {
					is_remove = false;
				}
				else if (! tooltip.is_mini) {
					if (manual_tooltip && (manual_tooltip == tooltip)) {
//						if (s3gt.tooltip.set_work_data_stop) {
//							is_remove = false;
//						}
//					} else if ((tooltip.translate_tooltip_pin == 'close') && s3gt.tooltip.set_work_data_stop) {
//						is_remove = false;
					} else if (tooltip.translate_tooltip_pin != 'close') {
						is_remove = false;
					} else if (tooltip.translate_selection_fly_tooltip) {
						is_remove = false;
					}
					if (tooltip.is_minimize) {
						is_remove = false;
					}
				}

				if (is_remove) {
					if (tooltip.tframe) {
						if (! tooltip.tframe.is_hidden) {
							tooltip.tframe.is_hidden = true;
							tooltip.style.display = 'none';
							tooltip.is_move_mouse_down = false;
							tooltip.id_translate_session = Math.random();
							tooltip.type_click = '';
						}
						tooltip_list_new.push(tooltip);
					} else {
						try {
							if (tooltip.parentNode) {
								tooltip.parentNode.removeChild(tooltip);
							}
						} catch(e) {
						}
					}
				} else {
					tooltip_list_new.push(tooltip);
				}
			}
		} catch(e) {
		}
	}
	//------------------------------------------------------------------------
	s3gt.tooltip.tooltip_list = tooltip_list_new;
	//------------------------------------------------------------------------
	if (! only_mini) {
		s3gt.tooltip.check_zindex_value();
		s3gt.tooltip.check_panel_value();
		s3gt.tooltip.set_work_data();
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.remove_click = function(tooltip) {
//	tooltip.translate_tooltip_pin = 'close';
	tooltip.translate_selection_fly_tooltip = false;
	tooltip.transcription_from_show = false;
	tooltip.is_minimize = false;
	tooltip.id_translate_session = Math.random();

	s3gt.tooltip.remove(false, tooltip);
	s3gt.tooltip.recalc_minimize();

	if (tooltip.callback && tooltip.callback.learning) {
		tooltip.callback.learning();
		tooltip.callback.learning = null;
	}
	//------------------------------------------------------------------------
	setTimeout(function(){
		try {
			if (s3gt.translate.last_activeElement) {
//				var range = s3gt.utils.save_selection();
				s3gt.translate.last_activeElement.focus();
//				s3gt.utils.restore_selection(range);
			}
		} catch(e) {};
	}, 200);
}
//------------------------------------------------------------------------------
s3gt.tooltip.remove_timer_run = function(tooltip, count) {
	if (tooltip && (count > 0)) {
		count = count-0.5;
		tooltip.style.opacity = count/10;
		s3gt.tooltip.remove_timer = setTimeout(function() { s3gt.tooltip.remove_timer_run(tooltip, count); }, 250);
	} else {
		s3gt.tooltip.remove(true);
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.pin_check = function(event, type) {
	var tooltip = s3gt.tooltip.get_tooltip_from_doc(type);
	if (tooltip) {
		if (! tooltip.is_mini) {
			if (tooltip.translate_tooltip_pin != 'close') { return true; }
		}
	}
	return false;
}
//------------------------------------------------------------------------------
s3gt.tooltip.exchange = function(event, tooltip) {
	tooltip.is_panel = ! tooltip.is_panel;

	if (tooltip.is_panel) {
		tooltip.style.left = "0px";
		tooltip.style.top = "";
		tooltip.style.bottom = "0px";
		tooltip.style.width = "100%";
		tooltip.tframe.style.width = "100%";
	} else {
		tooltip.style.left = s3gt.utils.get_real_pos_x(tooltip, tooltip.e_pageX) + 'px';
		tooltip.style.top = s3gt.utils.get_real_pos_y(tooltip, tooltip.e_pageY) + 'px';
		tooltip.style.bottom = "";
		tooltip.minimize_top = tooltip.style.top;
		tooltip.minimize_left = tooltip.style.left;
		tooltip.style.width = "1px";
		tooltip.tframe.style.width = "";
	}
	s3gt.tooltip.check_panel_value(tooltip, true);
	tooltip.is_init = true;
	tooltip.thtml.show_window(tooltip, tooltip.is_minimize);
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_style = function(tooltip, callback) {
	var style = tooltip.doc.createElement("link");
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = s3gt.work_data.url_extension + '/skin/s3gt_tooltip_mini.css';
	tooltip.appendChild(style);

	s3gt.tooltip.set_style_theme(tooltip, callback);
	s3gt.tooltip.set_style_mini_size(tooltip);
	s3gt.tooltip.set_style_print(tooltip);
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_style_print = function(tooltip) {
	var style_print = document.createElement('style');
	style_print.setAttribute('type', 'text/css');
	style_print.setAttribute('media', 'print');
	style_print.appendChild(document.createTextNode('#' + tooltip.id + ' { display: none !important; }'));
	tooltip.appendChild(style_print);
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_style_theme = function(tooltip, callback) {
	var theme = s3gt.utils.prefs_get('tooltip_theme');
	var style_tag_list = [];	
	if (tooltip.is_mini) {
		style_tag_list = tooltip.doc.getElementsByTagName('style');
	} else if (tooltip.thtml) {
		style_tag_list = tooltip.doc.tooltip_body.getElementsByTagName('style');
		style_tag_list = Array.prototype.slice.call(style_tag_list, 0);

		var style_tag_list2 = tooltip.doc.tooltip_body.getElementsByTagName('link');
		style_tag_list2 = Array.prototype.slice.call(style_tag_list2, 0);
		style_tag_list = style_tag_list.concat(style_tag_list2);
	}
	var style_list = [];
	for (i=0; i<style_tag_list.length; i++) {
		if (style_tag_list[i].id && (style_tag_list[i].id == 's3gt_style_custom')) {
			style_list.push(style_tag_list[i]);
		}
		else if (style_tag_list[i].id && (style_tag_list[i].id == 's3gt_style_blob')) {
			style_list.push(style_tag_list[i]);
		}
	}
	while (style_list.length) {
		var el = style_list.shift();
		el.parentNode.removeChild(el);
	}

	var style_path = '';

	if (theme == 'dark') {
		style_path = s3gt.work_data.url_extension + '/skin/tooltip_theme/dark.css';
	}
	else if (theme == 'custom') {
		s3gt.tooltip.style_cache = s3gt.utils.prefs_get('tooltip_theme_cache', '');
		if (s3gt.tooltip.style_cache) {
			s3gt.tooltip.set_style_theme_apply(tooltip, s3gt.tooltip.style_cache, callback);
		} else {
			var theme_custom_path = s3gt.utils.prefs_get('tooltip_theme_custom_path', '');
			if (/^((https?)|(ftps?)|(file)):\/\//i.test(theme_custom_path)) {
				style_path = theme_custom_path;
			}
		}
	}

	if (style_path) {
		s3gt.tooltip.set_style_theme_load(tooltip, style_path, callback);
	} else if (callback) {
		try {
			callback();
		} catch(e){};
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_style_theme_load = function(tooltip, path, callback) {
	var id_session = Math.random();
	s3gt.wait_session[id_session] = function(responseText) {
		if (tooltip) {
			s3gt.tooltip.set_style_cache(responseText);
			s3gt.tooltip.set_style_theme_apply(tooltip, responseText, callback);
		}
	}
	chrome.runtime.sendMessage({ 'style_theme_load': true, 'url' : path, 'id_session' : id_session });
} 
//------------------------------------------------------------------------------
s3gt.tooltip.set_style_cache = function(css_text) {
	s3gt.tooltip.style_cache = css_text || '';
	s3gt.main.pref_save('tooltip_theme_cache', s3gt.tooltip.style_cache);
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_style_theme_apply = function(tooltip, css_text, callback) {
	try {
		var style_custom = tooltip.doc.createElement("style");
		style_custom.type = 'text/css';
		style_custom.id = 's3gt_style_custom';
		if (style_custom.styleSheet){
			style_custom.styleSheet.cssText = css_text;
		} else {
			style_custom.appendChild(tooltip.doc.createTextNode(css_text));
		}

		if (tooltip.is_mini) {
			tooltip.appendChild(style_custom);
		} else if (tooltip.thtml) {
			//-----------------------------------------------------------
			//-- for Content Security Policy  "style-src blob:"
			//-----------------------------------------------------------
			if (s3gt.work_data.tab_id_scp[s3gt.main.tab_id]) {
				var style_link = tooltip.doc.createElement('link');
				style_link.type = 'text/css';
				style_link.rel = 'stylesheet';
				style_link.id = 's3gt_style_blob';
				var style_link_blob = new Blob([ css_text ], { type: 'text/plain' });
				style_link.href =  URL.createObjectURL(style_link_blob);
				tooltip.doc.tooltip_body.appendChild(style_link);
			}
			tooltip.doc.tooltip_body.appendChild(style_custom);
			tooltip.thtml.set_textbox_size(tooltip.doc);
		}
		if (callback) {
			try {
				callback();
			} catch(e){};
		}
		s3gt.tooltip.repos(tooltip);
	} catch(e) {
		if (callback) {
			try {
				callback();
			} catch(e){};
		}
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_style_mini_size = function(tooltip) {
	var percent = parseInt(s3gt.utils.prefs_get('font_size_tooltip_logo', ''));
	var items = { 's3gt_translate_tooltip_mini_logo' : 1, 's3gt_translate_tooltip_mini_logo_plus' : 1, 's3gt_translate_tooltip_mini_sound' : 1, 's3gt_translate_tooltip_mini_copy' : 1 };
	for (var item_id in items) {
		var tooltip_item = s3gt.utils.get_element(tooltip, item_id);
		if (! tooltip_item) { continue; }

		if (percent) {
			tooltip_item.style.width = Math.ceil(15 * percent / 100) + 'px';
			tooltip_item.style.height = Math.ceil(15 * percent / 100) + 'px';
			tooltip_item.style.borderRadius = Math.ceil(5 * percent / 100) + 'px';
		} else {
			tooltip_item.style.width = '';
			tooltip_item.style.height = '';
			tooltip_item.style.borderRadius = '';
		}
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_panel = function(tooltip, lang_from, lang_to, callback) {
	//------------------------------------------------------------------------
	if (! s3gt.tooltip.main_css_theme) {
		var id_session = Math.random();
		var id_session2 = Math.random();
		s3gt.wait_session[id_session] = function(responseText) {
			if (tooltip) {
				s3gt.tooltip.main_css_theme = responseText.replace(/\/skin\//g, s3gt.work_data.url_extension + '/skin/');
				chrome.runtime.sendMessage({ 'style_theme_load': true, 'url' : '/skin/s3gt_tooltip_mini.css', 'id_session' : id_session2 });
			}
		}
		s3gt.wait_session[id_session2] = function(responseText) {
			if (tooltip) {
				s3gt.tooltip.main_css_theme += responseText.replace(/\/skin\//g, s3gt.work_data.url_extension + '/skin/');
				s3gt.tooltip.create_panel(tooltip, lang_from, lang_to, callback);
			}
		}
		chrome.runtime.sendMessage({ 'style_theme_load': true, 'url' : '/skin/s3gt_tooltip_fly.css', 'id_session' : id_session });
		return;
	}
	//------------------------------------------------------------------------
	if (! tooltip) { return; }
	//------------------------------------------------------------------------
	s3gt.key_ctrl_is_pressed = false;
	s3gt.action.is_fly_auto = false;
	//------------------------------------------------------------------------
	if (tooltip.thtml) {
		try {
//			var el_lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from');
//			el_lang_from.value = lang_from;
//			tooltip.thtml.set_lang_icon(el_lang_from);
			tooltip.lang_from_auto = lang_from;
	
			//----------------------------------------------------------
			var el_lang_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to');
			if (el_lang_to) {
				el_lang_to.value = lang_to;
				tooltip.thtml.set_lang_icon(el_lang_to);
			}
			tooltip.thtml.view_source(tooltip.doc);
			//----------------------------------------------------------
			if (tooltip.tframe.is_hidden) {
				s3gt.tooltip.create_panel_init(tooltip);
				tooltip.tframe.is_hidden = false;
				tooltip.style.display = 'initial';
				tooltip.thtml.show_window(tooltip, false);

				//----------------------------------------------------
				var id_lang_list_from = ['s3gt_translate_tooltip_lang_from', 's3gt_translate_tooltip_lang_from_comby'];
				for (var i=0; i<id_lang_list_from.length; i++) {
					var el_lang_from = s3gt.utils.get_element(tooltip, id_lang_list_from[i]);
					el_lang_from.value = lang_from;
					tooltip.thtml.set_lang_icon(el_lang_from);
				}
				//----------------------------------------------------
				var id_lang_list_to = ['s3gt_translate_tooltip_lang_to', 's3gt_translate_tooltip_lang_to_comby'];
				for (var i=0; i<id_lang_list_to.length; i++) {
					var el_lang_to = s3gt.utils.get_element(tooltip, id_lang_list_to[i]);
					el_lang_to.value = lang_to;
					tooltip.thtml.set_lang_icon(el_lang_to);
				}
				//----------------------------------------------------
				var el_lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse');
				tooltip.thtml.set_lang_icon(el_lang_reverse);
			}
			//----------------------------------------------------------
			tooltip.callback = callback;
			if (callback && callback.create_panel) {
				callback.create_panel();
			}
		} catch(e) {
		}
		return;
	} else {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'document';
		xhr.open('GET', s3gt.work_data.url_extension + '/content/tooltip_fly.html');
		xhr.onload = function() {
			var doc = xhr.response;
			tooltip.tframe.contentDocument.replaceChild(doc.documentElement, tooltip.tframe.contentDocument.documentElement);

			var doc2 = tooltip.tframe.contentDocument;
			var el_head = doc2.getElementsByTagName("head")[0];
			var style = doc2.createElement('style');
			style.type = 'text/css';
			if (style.styleSheet){
				style.styleSheet.cssText = s3gt.tooltip.main_css_theme;
			} else {
				style.appendChild(doc2.createTextNode(s3gt.tooltip.main_css_theme));
			}
			el_head.appendChild(style);

			//-----------------------------------------------------------
			//-- for Content Security Policy  "style-src blob:"
			//-----------------------------------------------------------
			if (s3gt.work_data.tab_id_scp[s3gt.main.tab_id]) {
				var style_link = doc2.createElement('link');
				style_link.type = 'text/css';
				style_link.rel = 'stylesheet';
				var style_link_blob = new Blob([ s3gt.tooltip.main_css_theme ], { type: 'text/plain' });
				style_link.href =  URL.createObjectURL(style_link_blob);
				el_head.appendChild(style_link);
			}
			//-----------------------------------------------------------
			s3gt.tooltip.create_panel_load(tooltip, lang_from, lang_to, callback);
		}
		xhr.send();
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_panel_load = function(tooltip, lang_from, lang_to, callback) {
	if ((! tooltip.tframe) || (! tooltip.tframe.contentWindow)) {
		s3gt.tooltip.remove_click(tooltip);
		return;
	}
	tooltip.thtml = s3gt.thtml;
	tooltip.thtml.init(tooltip.tframe.contentDocument, tooltip, lang_from, lang_to);
	tooltip.callback = callback;

	s3gt.tooltip.create_panel_init(tooltip);
	if (callback && callback.create_panel) {
		callback.create_panel();
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.create_panel_init = function(tooltip) {
	//---------------------------------------------------------------------
	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	txt_from.set_value(tooltip.original_text);

	var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	txt_to.set_value(s3gt.utils.get_string('message.request.to.google'));

	var txt_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse');
	txt_reverse.set_value(s3gt.utils.get_string('message.request.to.google'));

	if (! tooltip.original_text) {
		txt_to.set_value('');
		txt_reverse.set_value('');
		s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box'), false);
		s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box'), false);
		txt_from.focus();
	}
	s3gt.tooltip.check_zindex_value(tooltip);
}
//------------------------------------------------------------------------------
s3gt.tooltip.please_wait = function(el, is_wait) {
	var child_list = el.childNodes;
	if (! child_list) { return; }

	//------------------------------------------------------------------------
	for (var i in child_list) {
		var child = child_list[i];
		if (child.no_wait) {

		} else if (child.nodeName && (child.nodeName.toUpperCase() == 'BUTTON')) {
			if (is_wait) {
				child.style.display = 'none';
			} else {
				if (! child.is_wait_hide) {
					child.style.display = '';
				}
			}
		} else if (child.id == 's3gt_translate_tooltip_wait') {
			child.style.display = (is_wait) ? '' : 'none';
			child.setAttribute('title', s3gt.utils.get_string('message.request.to.google'));
		} else if (child.firstChild) {
			s3gt.tooltip.please_wait(child, is_wait);
		}
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.translate_run = function(event, tooltip) {
	var lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from');
	var lang_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to');
	if (lang_from && lang_to) {
		var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
		s3gt.translate.selection_fly_run(txt_from.get_value(), lang_from.value, lang_to.value, event, tooltip);
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.translate_reverse = function(event, tooltip) {
	var el_lang_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to');
	var el_lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse');
	var lang_from = s3gt.tooltip.get_lang_from(tooltip);
	var lang_to = el_lang_reverse.value;
	var text_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');

	if (el_lang_reverse.value == 'reverse') {
		lang_to = lang_from;
		lang_from = el_lang_to.value;
		text_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	}

	var text = text_box.get_value();
	if (tooltip.is_lowercase_reverse) {
		text = text.toLowerCase();
	}

	s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box'), true);

	var data = { 'text' : text, 'lang_from' : lang_from, 'lang_to' : lang_to, 'is_translate_reverse' : true };
	data.id_translate_session = Math.random();
	tooltip.id_translate_session = data.id_translate_session;
	s3gt.wait_session[data.id_translate_session] = function(result) {
		s3gt.translate.response_fly(result, tooltip);
	}
	s3gt.translate.google_request(data);
}
//------------------------------------------------------------------------------
s3gt.tooltip.sound_play = function(tooltip, resource) {
	if (tooltip.thtml) {
		tooltip.thtml.sound_play(tooltip.doc, resource);
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_flag_txt = function(tooltip, type, lang) {
	if (tooltip.thtml) {
		tooltip.thtml.set_flag_txt(tooltip, type, lang);
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.get_lang_from = function(tooltip) {
	var el_lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from');
	if ((el_lang_from.value == 'auto') && tooltip.lang_from_auto) {
		return tooltip.lang_from_auto;
	}
	return el_lang_from.value;
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_zoom = function() {
	if (s3gt.tooltip && s3gt.tooltip.tooltip_list) {
		//-----------------------------------------------------------------
		var zoom_index = s3gt.utils.get_zoom_value();
		//-----------------------------------------------------------------
		for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
			var tooltip = s3gt.tooltip.tooltip_list[i];
			if (tooltip.is_mini) { continue; }
			if (! tooltip.tframe) { continue; }
			if (! tooltip.doc) { continue; }
	
			tooltip.style.transform = 'scale(' + 1/ zoom_index + ')';
			tooltip.style.transformOrigin = 'bottom right';

//			tooltip.doc.tooltip_body.style.transform = 'scale(' + 1/ s3gt.main.zoom_index + ')';
//			tooltip.doc.tooltip_body.style.transformOrigin = 'bottom right';

			if (tooltip.is_panel) {
				tooltip.style.width =  100 * zoom_index + '%';
				var width = tooltip.clientWidth;
				var width_zoom = (width - width * zoom_index);
				tooltip.style.left = ((width_zoom / zoom_index) ) + 'px';
			}
			if (! tooltip.is_minimize) {
				if (tooltip.is_panel) {
					tooltip.style.height = tooltip.doc.tooltip_body.scrollHeight + 'px';
				} else {
//					tooltip.style.width =  tooltip.doc.tooltip_body.scrollWidth + 'px';
//					tooltip.style.height = tooltip.doc.tooltip_body.scrollHeight + 'px';

					tooltip.style.left = s3gt.utils.get_real_pos_x(tooltip, tooltip.e_pageX) + 'px';
					tooltip.style.top = s3gt.utils.get_real_pos_y(tooltip, tooltip.e_pageY) + 'px';
				}
			}
		}
		s3gt.tooltip.recalc_minimize();
		s3gt.tooltip.check_panel_value();
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_work_data = function(tooltip_base, vars) {
	if (s3gt.utils.check_isFrame()) { return; }
	if (s3gt.tooltip.set_work_data_stop) { return; }

	chrome.runtime.sendMessage({ 'get_work_data' : true }, function(response) {
		s3gt.work_data = response.work_data;
		s3gt.tooltip.set_work_data_run(tooltip_base, vars);
	});
}
//------------------------------------------------------------------------------
s3gt.tooltip.set_work_data_run = function(tooltip_base, vars) {
	var change_theme_settings = (vars && vars.change_theme_settings) ? true : false;

	//--------------------------------------------------------------------------
	if (tooltip_base) {
		if (tooltip_base.is_mini) { return; }
		if (! tooltip_base.tframe) { return; }
		//--------------------------------------------------------------------------
		if (tooltip_base.last_result) {
			if (vars && vars.last_result) {
				tooltip_base.last_result = {};
				tooltip_base.last_result_reverse = {};
			}
			if (vars && vars.transcription_clear) {
				tooltip_base.last_result.transcription = '';
			}
			if (vars && vars.correct_text_clear) {
				tooltip_base.last_result.correct_text = '';
			}
		}
	}

	//--------------------------------------------------------------------------
	var work_data_tooltip = [];
	for (var i=0; i<s3gt.work_data.tooltip.length; i++) {
		var tooltip = s3gt.work_data.tooltip[i];
		if ((tooltip.translate_tooltip_pin != 'alltabs') && (tooltip.tab_id != s3gt.main.tab_id)) {
			tooltip.zindex_maximum = s3gt.tooltip.zindex_maximum;
			work_data_tooltip.push(tooltip);
		}
	}
	//--------------------------------------------------------------------------
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if (tooltip.is_mini) { continue; }
		if (! tooltip.tframe) { continue; }
		if (! tooltip.doc) { continue; }
		if (tooltip.tframe.is_hidden) { continue; }

		if (change_theme_settings) {
			tooltip.thtml.settings_set_values(tooltip);
			tooltip.thtml.set_style_theme(tooltip.doc);
			tooltip.thtml.set_style_font_size(tooltip.doc);
			tooltip.thtml.set_style_color(tooltip);
		}

		var data = s3gt.tooltip.make_work_data(tooltip);
		work_data_tooltip.push(data);
	}
	//--------------------------------------------------------------------------
	s3gt.work_data.current_id = s3gt.utils.random_string(8);
	chrome.runtime.sendMessage({ 'set_work_data': true, 'data' : { 'tooltip' : work_data_tooltip, 'current_id' : s3gt.work_data.current_id } });
}
//------------------------------------------------------------------------------
s3gt.tooltip.make_work_data = function(tooltip) {
	var lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from');
	var lang_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to');
	var lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse');
	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	var txt_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse');

	var data = {
		'id' : tooltip.id,
		'tab_id' : tooltip.tab_id,
		'is_panel' : tooltip.is_panel,
		'zindex_value' : tooltip.style.zIndex,
		'zindex_maximum' : s3gt.tooltip.zindex_maximum,
		'panel_value' : tooltip.panel_value,
		'panel_maximum' : s3gt.tooltip.panel_maximum,
		'id_translate_session' : tooltip.id_translate_session,
		'settings_open' : tooltip.settings_open,

		'translate_tooltip_pin' : tooltip.translate_tooltip_pin,
		'transcription_from_show' : tooltip.transcription_from_show,
		'view_reverse_translate_tooltip' : tooltip.view_reverse_translate_tooltip,
		'save_last_lang_reverse' : tooltip.save_last_lang_reverse,
		'view_source_translate_tooltip' : tooltip.view_source_translate_tooltip,
		'translate_selection_fly_tooltip' : tooltip.translate_selection_fly_tooltip,
		'translate_instant_tooltip' : tooltip.translate_instant_tooltip,
		'set_lowercase_tooltip_from' : tooltip.set_lowercase_tooltip_from,
		'set_lowercase_tooltip_to' : tooltip.set_lowercase_tooltip_to,
		'set_lowercase_tooltip_reverse' : tooltip.set_lowercase_tooltip_reverse,
		'save_last_lang_from' : tooltip.save_last_lang_from,
		'tooltip_width' : tooltip.tooltip_width,
		'tooltip_height_from' : tooltip.tooltip_height_from,
		'tooltip_height_to' : tooltip.tooltip_height_to,
		'tooltip_height_reverse' : tooltip.tooltip_height_reverse,
		'tooltip_height_panel' : tooltip.tooltip_height_panel,

		'is_minimize' : tooltip.is_minimize || false,
		'e_pageX' : tooltip.e_pageX,
		'e_pageY' : tooltip.e_pageY,

		'last_result' : tooltip.last_result || {},
		'last_result_reverse' : tooltip.last_result_reverse || {},
		'lang_from' : lang_from.value,
		'lang_from_auto' : tooltip.lang_from_auto,
		'lang_to' : lang_to.value,
		'lang_reverse' : lang_reverse.value,

		'is_lowercase_from' : tooltip.is_lowercase_from,
		'is_lowercase_to' : tooltip.is_lowercase_to,
		'is_lowercase_reverse' : tooltip.is_lowercase_reverse,

		'txt_from' : txt_from.get_value(),
		'txt_to' : txt_to.get_value(),
		'txt_reverse' : txt_reverse.get_value(),
		'txt_transcription' : tooltip.result_transcription
	};

	return data;
}
//------------------------------------------------------------------------------
s3gt.tooltip.get_work_data = function(tooltip_list, re_init) {
	if (s3gt.tooltip.get_work_data_stop) { return; }
	if (s3gt.tooltip.set_work_data_stop) { return; }
	s3gt.tooltip.set_work_data_stop = true;

	//--------------------------------------------------------------------------
	s3gt.translate.last_activeElement = s3gt.utils.getFocusedElement();
	//--------------------------------------------------------------------------
	var tooltip_list_tmp = [];
	for (var i=0; i<tooltip_list.length; i++) {
		var tooltip = tooltip_list[i];
		if (tooltip.zindex_maximum > s3gt.tooltip.zindex_maximum) {
			s3gt.tooltip.zindex_maximum = tooltip.zindex_maximum;
		}
		if (tooltip.panel_maximum > s3gt.tooltip.panel_maximum) {
			s3gt.tooltip.panel_maximum = tooltip.panel_maximum;
		}
		if (tooltip.translate_tooltip_pin == 'alltabs') {
			tooltip_list_tmp.push(tooltip);
		}
		else if (tooltip.tab_id == s3gt.main.tab_id) {
			tooltip_list_tmp.push(tooltip);
		}
	}
	tooltip_list = tooltip_list_tmp;
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	s3gt.tooltip.set_work_data_length = tooltip_list.length;
	var tooltip_list_is_empty = (s3gt.tooltip.set_work_data_length > 0) ? false : true;
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	var tooltip_new = tooltip_list.shift();
	//--------------------------------------------------------------------------
	if (re_init) {
		while (s3gt.tooltip.tooltip_list.length) {
			var tooltip = s3gt.tooltip.tooltip_list.shift();
			if (tooltip.is_mini) { continue; }
			if (! tooltip.tframe) { continue; }
			//-------------------------------------------------------------
			try {
				tooltip.parentNode.removeChild(tooltip);
			} catch(e) {
			}
		}
	}
	//--------------------------------------------------------------------------
	for (var i=0; i<s3gt.tooltip.tooltip_list.length; i++) {
		var tooltip = s3gt.tooltip.tooltip_list[i];
		if (tooltip.is_mini) { continue; }
		if (! tooltip.tframe) { continue; }

		if (! tooltip.tframe.is_hidden) {
			s3gt.tooltip.remove_click(tooltip);
		}
		if (! tooltip_new) { continue; }
	
		tooltip.is_restore = true;
		tooltip.is_init = false;
		s3gt.tooltip.restore_data(tooltip, tooltip_new);
		tooltip.thtml.set_style_theme(tooltip.doc);
		tooltip_new = tooltip_list.shift();
	}
	//--------------------------------------------------------------------------
	while (tooltip_new) {
		s3gt.tooltip.get_work_data_tooltip(tooltip_new);
		tooltip_new = tooltip_list.shift();
	}
	//--------------------------------------------------------------------------
	if (tooltip_list_is_empty) {
		s3gt.tooltip.set_work_data_stop = false;
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.get_work_data_tooltip = function(tooltip_new) {
	var tooltip = s3gt.tooltip.create_fly_switch({ 'clientX' : tooltip_new.e_pageX, 'clientY' : tooltip_new.e_pageY }, tooltip_new.txt_from, true);
	if (tooltip) {
		tooltip.is_restore = true;
		tooltip.is_init = false;
		var data = s3gt.utils.clone_object(tooltip_new);
		s3gt.tooltip.create_panel(tooltip, tooltip_new.lang_from, tooltip_new.lang_to, { 
			'create_panel' : function() { s3gt.tooltip.restore_data(tooltip, data); }
		});
	}
}
//------------------------------------------------------------------------------
s3gt.tooltip.restore_data = function(tooltip, data) {
	s3gt.tooltip.set_work_data_length--;
	//--------------------------------------------------------------------------
	if (tooltip.is_mini) { return; }
	if (! tooltip.tframe) { return; }

	//--------------------------------------------------------------------------
	tooltip.id = data.id;
	tooltip.tab_id = data.tab_id || s3gt.main.tab_id,
	tooltip.is_panel = data.is_panel;
	tooltip.id_translate_session = data.id_translate_session;
	tooltip.tframe.is_hidden = false;
	tooltip.style.display = 'initial';
	tooltip.settings_open = data.settings_open;

	tooltip.translate_tooltip_pin = data.translate_tooltip_pin;
	tooltip.transcription_from_show = data.transcription_from_show;
	tooltip.view_reverse_translate_tooltip = data.view_reverse_translate_tooltip;
	tooltip.save_last_lang_reverse = data.save_last_lang_reverse;
	tooltip.view_source_translate_tooltip = data.view_source_translate_tooltip;
	tooltip.translate_selection_fly_tooltip = data.translate_selection_fly_tooltip;
	tooltip.translate_instant_tooltip = data.translate_instant_tooltip;
	tooltip.set_lowercase_tooltip_from = data.set_lowercase_tooltip_from;
	tooltip.set_lowercase_tooltip_to = data.set_lowercase_tooltip_to;
	tooltip.set_lowercase_tooltip_reverse = data.set_lowercase_tooltip_reverse;
	tooltip.save_last_lang_from = data.save_last_lang_from;
	tooltip.tooltip_width = data.tooltip_width;
	tooltip.tooltip_height_from = data.tooltip_height_from;
	tooltip.tooltip_height_to = data.tooltip_height_to;
	tooltip.tooltip_height_reverse = data.tooltip_height_reverse;
	tooltip.tooltip_height_panel = data.tooltip_height_panel;

	tooltip.panel_value = data.panel_value;
	tooltip.style.zIndex = data.zindex_value;

	if (tooltip.is_panel) {
		tooltip.style.left = "0px";
		tooltip.style.top = "";
		tooltip.style.bottom = "0px";

		tooltip.style.width = "100%";
		tooltip.tframe.style.width = "100%";
	} else {
		tooltip.style.left = s3gt.utils.get_real_pos_x(tooltip, data.e_pageX) + 'px';
		tooltip.style.top = s3gt.utils.get_real_pos_y(tooltip, data.e_pageY) + 'px';
		tooltip.style.bottom = "";
		tooltip.e_pageX = data.e_pageX;
		tooltip.e_pageY = data.e_pageY;
		tooltip.minimize_top = tooltip.style.top;
		tooltip.minimize_left = tooltip.style.left;
		tooltip.style.width = "1px";
		tooltip.tframe.style.width = "";
	}

	tooltip.is_lowercase_from = data.is_lowercase_from;
	tooltip.is_lowercase_to = data.is_lowercase_to;
	tooltip.is_lowercase_reverse = data.is_lowercase_reverse;

	//--------------------------------------------------------------------------
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from').value = data.lang_from;
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value = data.lang_to;
	tooltip.lang_from_auto = data.lang_from_auto;

	//--------------------------------------------------------------------------
	tooltip.last_result = data.last_result || {};
	tooltip.last_result_reverse = data.last_result_reverse || {};

	//--------------------------------------------------------------------------
	s3gt.tooltip.set_flag_txt(tooltip, 'from', data.last_result.lang_from || data.lang_from);
	s3gt.tooltip.set_flag_txt(tooltip, 'to', data.lang_to);

	//--------------------------------------------------------------------------
	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	txt_from.set_value(data.txt_from);
	//--------------------------------------------------------------------------
	var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	txt_to.set_translate(data.last_result);
	//--------------------------------------------------------------------------
	tooltip.thtml.show_window(tooltip, data.is_minimize);
	//--------------------------------------------------------------------------
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse').value = data.lang_reverse;
	var txt_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse');
	s3gt.tooltip.set_flag_txt(tooltip, 'reverse', data.last_result_reverse.lang_reverse || data.lang_reverse);
	txt_reverse.set_translate(data.last_result_reverse);

	//--------------------------------------------------------------------------
	s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box'), false);
	s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box'), false);
	//--------------------------------------------------------------------------
	s3gt.tooltip.set_style_print(tooltip);
	//--------------------------------------------------------------------------

	//--------------------------------------------------------------------------
	if (s3gt.tooltip.set_work_data_length <= 0) {
		s3gt.tooltip.set_work_data_stop = false;
		s3gt.tooltip.check_zindex_value();
//		s3gt.tooltip.check_panel_value();
		s3gt.tooltip.set_zoom();

		if (s3gt.translate.last_activeElement) {
			s3gt.translate.last_activeElement.focus();
		}
	}
	tooltip.is_restore = false;
}
//------------------------------------------------------------------------------
