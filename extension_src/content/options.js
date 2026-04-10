var s3gt = {};
s3gt.form = null;

//------------------------------------------------------------------------------
s3gt.init_0 = function() {
	s3gt.prefs.init(function(){
		setTimeout(function(){ s3gt.utils.i18n_parse(document); }, 100);
		s3gt.form = document.getElementById('s3gt_form');
		//------------------------------------------------------------------------
		var current_locale = document.getElementById('current_locale');
		for (var i=0; i<s3gt.I18N_SUPPORTED.length; i++) {
			var el_lang = s3gt.I18N_SUPPORTED[i];
			var option = document.createElement("option");
			option.text = el_lang.name;
			option.value = el_lang.lang;
			current_locale.options.add(option);
		}
		//------------------------------------------------------------------------
		s3gt.init_events();
		setTimeout(function(){ s3gt.init(); }, 100);
	});
}
//------------------------------------------------------------------------------
s3gt.init = function() {
	var manifest = chrome.runtime.getManifest();
	document.getElementById('addon_version').textContent = manifest.version;

	s3gt.init_lang_list();
	s3gt.init_prefs();
	s3gt.check_learning_enable();
	s3gt.hotkeys_init();
	s3gt.check_selected_text_enable();
	s3gt.check_selected_text_middle_click_enable();
	s3gt.check_selected_text_long_click_enable();
	s3gt.check_selected_text_fly_auto_enable();

	document.getElementById('sound_playback_rate_label').textContent = document.getElementById('sound_playback_rate').value + '%';
	document.getElementById('translate_selection_timer_data').textContent = document.getElementById('translate_selection_timer').value;
	document.getElementById('translate_selection_long_click_timer_data').textContent = document.getElementById('translate_selection_long_click_timer').value;
	document.getElementById('translate_word_fly_long_click_timer_data').textContent = document.getElementById('translate_word_fly_long_click_timer').value;

	if (s3gt.prefs.list['domain_google_translator'] == '') {
		document.getElementById('domain_google_translator').value = s3gt.utils.get_string('domain_google_translator');
	}

	s3gt.statistics_status();

	//------------------------------------------------------------------------
	var show_tab = window.location.hash || '';
	if (show_tab) {
		if (/\-\-/.test(show_tab)) {
			tab_main.showTab(null, show_tab.replace(/^([^\-]+).*$/, '$1'));
			tab_text.showTab(null, show_tab);
		} else {
			tab_main.showTab(null, show_tab);
		}
	}
}
//------------------------------------------------------------------------------
s3gt.init_lang_list = function() {
	s3gt.prefs.init_lang_to();
	s3gt.set_default_lang_to_list();
	s3gt.set_disabled_lang_to_list();
	s3gt.set_learning_lang_list();
}
//------------------------------------------------------------------------------
s3gt.init_events = function() {
	s3gt.form.addEventListener('submit', function(event){
		event.preventDefault();
		event.stopPropagation();
	});

	var input_list = document.getElementsByTagName('input');
	for (var i=0; i<input_list.length; i++) {
		if (input_list[i].getAttribute('clickSelectsAll')) {
			input_list[i].addEventListener('click', function(event){
				this.select();
			});
		}
	}

	document.getElementById('languages_for_translation_all').addEventListener('click', function(){ s3gt.set_pref_disabled_lang_to_all(this.checked); });
	document.getElementById('s3gt-preference-remove-history-sites').addEventListener('click', function(){ s3gt.clear_history_domain(); });
	document.getElementById('s3gt-learning_enable').addEventListener('click', function(){ s3gt.check_learning_enable(); });
	document.getElementById('s3gt-learning_border').addEventListener('click', function(){ s3gt.check_learning_enable(); });
	document.getElementById('s3gt-learning_font').addEventListener('click', function(){ s3gt.check_learning_enable(); });
	document.getElementById('s3gt-learning_background').addEventListener('click', function(){ s3gt.check_learning_enable(); });

	document.getElementById("hotkey_button_plus").addEventListener('click', function(){ s3gt.hotkey_plus(); });
	document.getElementById('sound_playback_rate').addEventListener('change', function(event){ s3gt.sound_playback_rate_change(event.target.value); });
	document.getElementById('button_sound_on_1').addEventListener('click', function(event){ s3gt.test_sound_play_to(1); });
	document.getElementById('button_sound_on_2').addEventListener('click', function(event){ s3gt.test_sound_play_to(2); });
	document.getElementById('button_sound_on_3').addEventListener('click', function(event){ s3gt.test_sound_play_to(3); });
	document.getElementById('button_sound_on_4').addEventListener('click', function(event){ s3gt.test_sound_play_to(4); });
	document.getElementById('button_sound_on_5').addEventListener('click', function(event){ s3gt.test_sound_play_to(5); });

	document.getElementById('translate_selection_fly').addEventListener('click', function(){ s3gt.check_selected_text_enable(); });
	document.getElementById('translate_selection_fly_translate').addEventListener('click', function(){ s3gt.check_selected_text_enable(); });
	document.getElementById('translate_selection_timer').addEventListener('change', function(event){
		s3gt.translate_selection_timer_change(event.target.value);
	});
	document.getElementById('translate_selection_middle_click').addEventListener('click', function(){ s3gt.check_selected_text_middle_click_enable(); });
	document.getElementById('translate_selection_middle_click_action_translate').addEventListener('click', function(){ s3gt.check_selected_text_middle_click_enable(); });
	document.getElementById('translate_selection_middle_click_action_translate_on_it').addEventListener('click', function(){ s3gt.check_selected_text_middle_click_enable(); });
	document.getElementById('translate_selection_middle_click_action_tooltip').addEventListener('click', function(){ s3gt.check_selected_text_middle_click_enable(); });

	document.getElementById('translate_selection_long_click').addEventListener('click', function(){ s3gt.check_selected_text_long_click_enable(); });
	document.getElementById('translate_selection_long_click_action_translate').addEventListener('click', function(){ s3gt.check_selected_text_long_click_enable(); });
	document.getElementById('translate_selection_long_click_action_tooltip').addEventListener('click', function(){ s3gt.check_selected_text_long_click_enable(); });
	document.getElementById('translate_selection_long_click_timer').addEventListener('change', function(event){
		s3gt.translate_selection_long_click_timer_change(event.target.value);
	});

	document.getElementById('translate_selection_fly_auto').addEventListener('change', function(){ s3gt.check_selected_text_fly_auto_enable(); });

	document.getElementById('translate_word_fly_long_click_timer').addEventListener('change', function(event){
		s3gt.translate_word_fly_long_click_timer_change(event.target.value);
	});

	document.getElementById('save_settings').addEventListener('click', function(){ s3gt.save_settings('save'); });
	document.getElementById('copy_settings').addEventListener('click', function(){ s3gt.save_settings('copy'); });
	document.getElementById('load_settings').addEventListener('click', function(){ s3gt.load_settings(); });
	document.getElementById('load_settings_file').addEventListener('change', function(event){ s3gt.load_settings_file(event); });
	document.getElementById('reset_settings').addEventListener('click', function(){ s3gt.reset_settings(); });

	document.getElementById("statistics_change_status").addEventListener('click', function(){ s3gt.statistics_change_status(); });
}
//------------------------------------------------------------------------------
s3gt.window_close = function() {
	chrome.runtime.sendMessage({ action: 'window_close' }, function(response) {});
}
//------------------------------------------------------------------------------
s3gt.init_prefs = function() {
	for (var pref_name in s3gt.prefs.list) {
		var pref_value = s3gt.prefs.list[pref_name];
		var pref_el = s3gt.form[pref_name];
		if (pref_el) {
			if (pref_el.type && (pref_el.type == 'checkbox')) {
				pref_el.checked = pref_value;
			} else {
				pref_el.value = pref_value;
			}
			pref_el.type_of = typeof(pref_value);
		}
	}
	//------------------------------------------------------------------------
	s3gt.form.addEventListener('change', function(event){
		var pref_el = event.target;
		if (! pref_el.name) { return; }
		if (s3gt.prefs.list[pref_el.name] === undefined) { return; }
		//-----------------------------------------------------
		var callback = null;
		var pref_value = pref_el.value;
		//-----------------------------------------------------
		if (pref_el.type && (pref_el.type == 'checkbox')) {
			pref_value = pref_el.checked;
		}
		//-----------------------------------------------------
		else if (pref_el.name == 'current_locale') {
			callback = function() {
				s3gt.i18n.init(pref_value);
				s3gt.utils.i18n_parse(document);
				s3gt.init_lang_list();
			}
		}
		//-----------------------------------------------------
		else if (typeof(s3gt.prefs.list[pref_el.name]) == 'number') {
			pref_value = parseInt(pref_el.value);
		}
		//-----------------------------------------------------
		else if (typeof(s3gt.prefs.list[pref_el.name]) == 'boolean') {
			pref_value = (String(pref_el.value) == 'true');
		}
		//-----------------------------------------------------
		else if (pref_el.name == 'default_lang_to') {
			callback = function() {
				s3gt.init_lang_list();
			}
		}
		//-----------------------------------------------------
		s3gt.pref_save(pref_el.name, pref_value, callback);
		pref_el.blur();
	});
}
//------------------------------------------------------------------------------
s3gt.pref_save = function(pref_name, pref_value, callback) {
	if (pref_name == 'domain_google_translator') {
		pref_value = pref_value.replace(/\s/g, '');
		if (pref_value == '') {
			pref_value = s3gt.utils.get_string('domain_google_translator') || 'translate.google.com';
			document.getElementById("domain_google_translator").value = pref_value;
		}
	}
	chrome.runtime.sendMessage({ 'action_prefs_set': true, 'pref_name' : pref_name, 'pref_value': pref_value }, function(response) {
		s3gt.utils.prefs_set(pref_name, pref_value);
		if (callback) {
			callback();
		}
		s3gt.save_settings_message();
	});
}
//-------------------------------------------------------------------------------------------
s3gt.save_settings = function(mode) {
	chrome.runtime.sendMessage({ 'save_settings': true, 'mode' : mode }, function(response) {});
}
//-------------------------------------------------------------------------------------------
s3gt.load_settings = function() {
	document.getElementById('load_settings_file').click();
}
//-------------------------------------------------------------------------------------------
s3gt.load_settings_file = function(event) {
	var file = event.target.files[0];
	var reader = new FileReader();
	//----------------------------------------------------------------------
	reader.onload = function(e) {
		s3gt.load_settings_file_done(e.target.result || '');
	}
	reader.readAsText(file);
}
//-------------------------------------------------------------------------------------------
s3gt.load_settings_file_done = function(result_txt) {
 	//-----------------------------------------------------------------------
	var prefs_list = result_txt.split("\n");
	var pref_branch = s3gt.utils.clone_object(s3gt.prefs.list);
	//-----------------------------------------------------------------------
	for (var i=0; i<prefs_list.length; i++) {
		try {
			var pref = prefs_list[i].replace(/[\n\r]/g, '');
			var p = pref.match(/^(.*?)\=(.*)/);
			var pref_name = p[1] || '---';
			var pref_value = p[2];
			if (pref_name in pref_branch) {
				if (typeof(pref_branch[pref_name]) == 'boolean') {
					pref_value = (String(pref_value) == 'true');
				} else if (typeof(pref_branch[pref_name]) == 'number') {
					pref_value = parseInt(pref_value);
				} else if (typeof(pref_branch[pref_name]) == 'object') {
					pref_value = JSON.parse(pref_value);
				} else if (typeof(pref_branch[pref_name]) == 'array') {
					pref_value = JSON.parse(pref_value);
				}
			}
			chrome.runtime.sendMessage({ 'action_prefs_set': true, 'pref_name' : pref_name, 'pref_value': pref_value }, function(response) {
				s3gt.utils.prefs_set(pref_name, pref_value);
			});
		} catch(e) {
		}
	}
	//-----------------------------------------------------------------------
	alert(s3gt.utils.get_string('message.settings.loaded'));
	window.location.reload();
}
//------------------------------------------------------------------------------
s3gt.reset_settings = function() {
	if (confirm(s3gt.utils.get_string('confirm.warning'))) {
		chrome.runtime.sendMessage({ 'action_reset_defaults': true }, function(response) {
			s3gt.prefs.reset_defaults(function(){
				s3gt.utils.i18n_parse(document);
				s3gt.init();
				s3gt.save_settings_message();
				alert(s3gt.utils.get_string('message.settings.restored'));
				window.location.reload();
			});
		});
	}
}
//------------------------------------------------------------------------------
s3gt.save_settings_message = function() {
	document.getElementById("settings_saved").removeAttribute('is_hidden');
	document.getElementById('addon_version').setAttribute('is_hidden', true);
	setTimeout(function(){
		document.getElementById("settings_saved").setAttribute('is_hidden', true);
		document.getElementById("addon_version").removeAttribute('is_hidden');
	}, 500);
}
//------------------------------------------------------------------------------
s3gt.hotkeys_init = function() {
	for (var i=0; i<s3gt.prefs.list.hotkeys.length; i++) {
		var key = s3gt.prefs.list.hotkeys[i];
		var hotkeys_box = s3gt.hotkey_plus();
		hotkeys_box.s3gt_key = key;
		s3gt.utils.get_element(hotkeys_box, 'hotkeys_textbox').value = s3gt.hotkeys_string(key);
		s3gt.utils.get_element(hotkeys_box, 'hotkeys_list_method').value = key.method;
	}
}
//------------------------------------------------------------------------------
s3gt.hotkey_plus = function() {
	var hotkeys_box = document.getElementById('hotkeys_box').cloneNode(true);
	var table = document.getElementById('hotkeys_list');
	var row = table.insertRow(table.rows.length);
	var cell = row.insertCell(0);
	cell.appendChild(hotkeys_box);

	s3gt.utils.get_element(hotkeys_box, 'hotkey_button_minus').addEventListener('click', function() {
		s3gt.hotkey_minus(this);
	});
	s3gt.utils.get_element(hotkeys_box, 'hotkeys_textbox').addEventListener('click', function() {
		this.select();
	});
	s3gt.utils.get_element(hotkeys_box, 'hotkeys_textbox').addEventListener('keydown', function(event) {
		s3gt.hotkey_input(event, this);
	});
	s3gt.utils.get_element(hotkeys_box, 'hotkeys_list_method').addEventListener('click', function(event) {
		var hotkeys_box = this.parentNode;
		if (hotkeys_box.s3gt_key) {
			hotkeys_box.s3gt_key.method = this.value;
			s3gt.hotkey_save();
		}
	});
	s3gt.utils.get_element(hotkeys_box, 'hotkeys_list_method').addEventListener('change', function(event) {
		var hotkeys_box = this.parentNode;
		if (hotkeys_box.s3gt_key) {
			hotkeys_box.s3gt_key.method = this.value;
			s3gt.hotkey_save();
		}
	});

	return hotkeys_box;
}
//------------------------------------------------------------------------------
s3gt.hotkey_minus = function(el) {
	el.parentNode.s3gt_key = null;
	el.parentNode.style.display = 'none';
	s3gt.hotkey_save();
}
//------------------------------------------------------------------------------
s3gt.hotkey_input = function(event, el) {
	event.preventDefault();
	event.stopPropagation();
	event.stopImmediatePropagation();

	var hotkeys_box = el.parentNode;
	var key = {};

	key.shiftKey = event.shiftKey;
	key.ctrlKey = event.ctrlKey;
	key.altKey = event.altKey;
	key.keyCode = event.keyCode;
	key.key = event.key;
	key.method = s3gt.utils.get_element(hotkeys_box, 'hotkeys_list_method').value;

	if (key.ctrlKey || key.altKey) {
		if ((key.keyCode != 16) && (key.keyCode != 17) && (key.keyCode != 18)) {
			s3gt.utils.get_element(hotkeys_box, 'hotkeys_textbox').value = s3gt.hotkeys_string(key);
			hotkeys_box.s3gt_key = key;
			s3gt.hotkey_save();
		}
	}
}
//------------------------------------------------------------------------------
s3gt.hotkeys_string = function(key) {
	var str = [];

	if (key.ctrlKey) { str.push('Ctrl'); }
	if (key.altKey) { str.push('Alt'); }
	if (key.shiftKey) { str.push('Shift'); }

	if (key.key.length > 1) {
		str.push(key.key);
	}
	else if ((key.keyCode >= 32) && (key.keyCode < 127)) {
		str.push(String.fromCharCode(key.keyCode).toUpperCase());
	} 
	else if (key.key) {
		str.push(key.key.toUpperCase());
	}

	return str.join(' + ');
}
//------------------------------------------------------------------------------
s3gt.hotkey_save = function() {
	var table = document.getElementById('hotkeys_list');
	var hotkeys = [];

	for (var i=0; i<table.rows.length; i++) {
		var hotkeys_box = s3gt.utils.get_element(table.rows[i], 'hotkeys_box');
		if (hotkeys_box.s3gt_key) {
			hotkeys.push(hotkeys_box.s3gt_key);
		}
	}

	s3gt.pref_save('hotkeys', hotkeys);
}
//-------------------------------------------------------------------------------------------
s3gt.set_learning_lang_list = function() {
	var lang_from = document.getElementById('s3gt-learning_lang_from');
	while (lang_from.options.length) { lang_from.options.remove(0); }

	var lang_to = document.getElementById('s3gt-learning_lang_to');
	while (lang_to.options.length) { lang_to.options.remove(0); }

	s3gt.create_lang_list('s3gt-learning_lang_from', 'learning_lang_from', s3gt.utils.get_string('translang.any'), false, true);
	s3gt.create_lang_list('s3gt-learning_lang_to', 'learning_lang_to', '', false, false);
	lang_to.value = s3gt.utils.prefs_get('learning_lang_to');
}
//-------------------------------------------------------------------------------------------
s3gt.set_default_lang_to_list = function() {
	var default_lang_to = document.getElementById('default_lang_to');
	while (default_lang_to.options.length) {
		default_lang_to.options.remove(0);
	}
	s3gt.create_lang_list('default_lang_to', 'default_lang_to', '', true, true);
}
//-------------------------------------------------------------------------------------------
s3gt.create_lang_list = function(id_lang_to, default_lang_pref, auto_text, is_check_enable_lang, is_add_auto_text) {
	var default_lang_to = document.getElementById(id_lang_to);
	var is_auto_text = (auto_text) ? true : false;
	auto_text = (is_auto_text) ? auto_text : s3gt.utils.get_string('translang.auto');
	var lang_list = s3gt.prefs.get_lang_list();
	//---------------------------------------------------------------------------
	var default_lang = s3gt.utils.prefs_get(default_lang_pref);
	var list_disabled_lang_to = s3gt.utils.prefs_get('list_disabled_lang_to');

	//---------------------------------------------------------------------------
	if (! is_auto_text) {
		for (var i=0; i<lang_list.length; i++) {
			if (lang_list[i].lang == s3gt.prefs.lang_to_locale) {
				auto_text += ' (' + s3gt.utils.get_string(lang_list[i].label) + ')';
			}
		}
	}

	//---------------------------------------------------------------------------
	if (is_add_auto_text) {
		var auto_lang_item = document.createElement("option");
		auto_lang_item.text = auto_text;
		auto_lang_item.value = 'auto';
		default_lang_to.options.add(auto_lang_item);
		auto_lang_item.selected = true;

	} else if (default_lang == 'auto') {
		default_lang = s3gt.prefs.lang_to;
	}

	//---------------------------------------------------------------------------
	for (var i=0; i<lang_list.length; i++) {
		lang_list[i].label = s3gt.utils.get_string(lang_list[i].label);
	}

	//---------------------------------------------------------------------------
	lang_list = lang_list.sort(function(a, b){
		var label_a=a.label.toLowerCase(), label_b=b.label.toLowerCase();
		if (label_a < label_b) { return -1; }
		else if (label_a > label_b) { return 1; }
		else { return 0; }
	});

	//---------------------------------------------------------------------------
	for (var lang_id=0; lang_id<lang_list.length; lang_id++) {
		var lang = lang_list[lang_id];

		var item = document.createElement("option");
		item.text = lang.label;
		item.value = lang.lang;
		default_lang_to.options.add(item);
		item.setAttribute('title', lang.label);
		var is_lang_enabled = true;
		s3gt.utils.set_lang_icon(item, lang.lang);
		if (is_check_enable_lang) {
			is_lang_enabled = s3gt.utils.check_enable_lang_to(lang.lang, list_disabled_lang_to);
			item.setAttribute("is_hidden", ! is_lang_enabled);
		}
		if (is_lang_enabled && (default_lang == lang.lang)) {
			item.selected = true;
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.set_pref_disabled_lang_to_all = function(checked) {
	var disabled_lang_to = document.getElementById('s3gt-list-disabled-lang-to');
	var checkbox_tag_list = disabled_lang_to.getElementsByTagName('input');

	for (var i=0; i<checkbox_tag_list.length; i++) {
		var item = checkbox_tag_list[i];
		item.checked = checked;
	}
	s3gt.set_pref_disabled_lang_to();
}
//-------------------------------------------------------------------------------------------
s3gt.set_pref_disabled_lang_to = function() {
	var disabled_lang_to = document.getElementById('s3gt-list-disabled-lang-to');
	var disable_list = [];

	var checkbox_tag_list = disabled_lang_to.getElementsByTagName('input');
	//------------------------------------------------------------------------------------
	for (var i=0; i<checkbox_tag_list.length; i++) {
		var item = checkbox_tag_list[i];
		var is_checked = item.checked;
		is_checked = typeof is_checked == "boolean" ? is_checked : (is_checked == 'true' ? true : false);
		if (! is_checked) {
			var lang = item.getAttribute('value');
			if (lang && (lang != s3gt.prefs.lang_to)) {
				disable_list.push(lang);
			}
		}
	}

	//------------------------------------------------------------------------------------
	s3gt.pref_save('list_disabled_lang_to', disable_list.join(','), function(){
		s3gt.init_lang_list();
	});
}
//-------------------------------------------------------------------------------------------
s3gt.set_disabled_lang_to_list = function() {
	var disabled_lang_to = document.getElementById('s3gt-list-disabled-lang-to');
	var lang_list = s3gt.prefs.get_lang_list();
	var list_disabled_lang_to = s3gt.utils.prefs_get('list_disabled_lang_to');

	//------------------------------------------------------------------------------------
	while (disabled_lang_to.firstChild) {
		disabled_lang_to.removeChild(disabled_lang_to.firstChild);
	}

	//------------------------------------------------------------------------------------
	for (var lang_id=0; lang_id<lang_list.length; lang_id++) {
		var lang = lang_list[lang_id];
		lang.label = s3gt.utils.get_string(lang.label);
	}
	//------------------------------------------------------------------------------------
	var current_lang_to = s3gt.utils.prefs_get('default_lang_to');
	if (current_lang_to == 'auto') { current_lang_to = s3gt.prefs.lang_to; }

	//------------------------------------------------------------------------------------
	lang_list = lang_list.sort(function(a, b){
		var label_a = a.label.toLowerCase();
		var label_b = b.label.toLowerCase();
		var checked_a = s3gt.utils.check_enable_lang_to(a.lang, list_disabled_lang_to);
		var checked_b = s3gt.utils.check_enable_lang_to(b.lang, list_disabled_lang_to);

		if (checked_a == checked_b) {
			if (label_a < label_b) { return -1; }
			else if (label_a > label_b) { return 1; }
			else { return 0; }
		} else if (checked_a) {
			return -1;
		} else if (checked_b) {
			return 1;
		}
	});

	//------------------------------------------------------------------------------------
	for (var lang_id=0; lang_id<lang_list.length; lang_id++) {
		var lang = lang_list[lang_id];
		var template = document.getElementById('template_disabled_lang_list').cloneNode(true).firstChild;
		disabled_lang_to.appendChild(template);

		var checkbox = s3gt.utils.get_element(template, 'disabled_lang_list_checkbox');
		checkbox.checked = s3gt.utils.check_enable_lang_to(lang.lang, list_disabled_lang_to);
		checkbox.addEventListener('click', function() { s3gt.set_pref_disabled_lang_to(); });
		checkbox.value = lang.lang;

		var label = s3gt.utils.get_element(template, 'disabled_lang_list_label');
		label.appendChild(document.createTextNode(lang.label));
		s3gt.utils.set_lang_icon(label, lang.lang, true);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.clear_history_domain = function() {
	var confirm_txt = s3gt.utils.get_string('confirm.warning');
	if (! confirm(confirm_txt)) {
		return false;
	}

	//-----------------------------------------------------------------------------------
	s3gt.pref_save('domain_translate_list', {}, function(){
		alert(s3gt.utils.get_string('message.history.sites.removed'));
	});
	return true;
}
//------------------------------------------------------------------------------
s3gt.check_learning_enable = function() {
	var learning_enable = document.getElementById("s3gt-learning_enable").checked;
	var field_list = [
		'learning_only_http', 'learning_only_http_label',
		'learning_lang_from_label', 'learning_lang_from', 'learning_lang_to_label', 'learning_lang_to',
		'learning_max_count_label', 'learning_max_count', 'learning_min_length_label', 'learning_min_length',
		'learning_border_label', 'learning_border', 'learning_border_color',
		'learning_font_label', 'learning_font', 'learning_font_color',
		'learning_background_label', 'learning_background', 'learning_background_color',
		'learning_show_translation_in_tooltip_label', 'learning_show_translation_in_tooltip'
	];
	for (var id=0; id<field_list.length; id++) {
		if (learning_enable) {
			document.getElementById('s3gt-' + field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById('s3gt-' + field_list[id]).setAttribute("disabled", true);
		}
	}
	var field_list2 = ['border', 'font', 'background'];
	for (var id=0; id<field_list2.length; id++) {
		var is_enable = document.getElementById('s3gt-learning_' + field_list2[id]).checked;
		if (is_enable && learning_enable) {
			document.getElementById('s3gt-learning_' + field_list2[id] + '_color').removeAttribute("disabled");
		} else {
			document.getElementById('s3gt-learning_' + field_list2[id] + '_color').setAttribute("disabled", true);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound_playback_rate_change = function(value) {
	document.getElementById('sound_playback_rate_label').textContent = value + '%';
	document.getElementById('sound_playback_rate').value = value;
	s3gt.pref_save('sound_playback_rate', parseInt(value), function(){
		document.getElementById('sound_playback_rate').focus();
	});
}
//-------------------------------------------------------------------------------------------
s3gt.test_sound_play_to = function(num) {
	var text = String(document.getElementById('sound_playback_test_text_' + num).textContent);
	var lang = document.getElementById('sound_playback_test_text_' + num).getAttribute('lang');
	var button_sound = document.getElementById('button_sound_on_' + num);

	if (button_sound.hasAttribute("sound_stop")) {
		button_sound.removeAttribute("sound_stop");
		s3gt.sound.play_off();
	} else {
		button_sound.setAttribute("sound_stop", true);
		s3gt.sound.play_tts(lang, text, {
			'sound_stop' : function() {
				setTimeout(function(){
					button_sound.removeAttribute("sound_stop");
				}, 300);
			}
		}, document.getElementById('sound_playback_rate').value);
	}
}
//------------------------------------------------------------------------------
s3gt.check_selected_text_enable = function() {
	var is_enable = document.getElementById("translate_selection_fly").checked;
	var field_list = [
		'translate_selection_fly_translate_box',
		'translate_selection_fly_window_new_default', 'translate_selection_fly_window_new_always', 'translate_selection_fly_window_new_ctrl_fly', 'translate_selection_fly_window_new_ctrl_panel',
		'translate_selection_fly_translate_default', 'translate_selection_fly_translate_open_fly', 'translate_selection_fly_translate_open_panel',
		'translate_selection_fly_translate', 'translate_selection_fly_translate_plus', 'translate_selection_fly_sound', 'translate_selection_fly_copy',
		'translate_selection_timer', 'translate_selection_timer_label', 'translate_selection_timer_data', 'translate_selection_timer_ms'
	];
	for (var id=0; id<field_list.length; id++) {
		if (is_enable) {
			document.getElementById(field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById(field_list[id]).setAttribute("disabled", true);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate_selection_timer_change = function(value) {
	document.getElementById('translate_selection_timer_data').textContent = value;
	document.getElementById('translate_selection_timer').value = value;
	s3gt.pref_save('translate_selection_timer', parseInt(value), function(){
		document.getElementById('translate_selection_timer').focus();
	});
}
//-------------------------------------------------------------------------------------------
s3gt.check_selected_text_middle_click_enable = function() {
	var is_enable = document.getElementById("translate_selection_middle_click").checked;
	var field_list = [ 'translate_selection_middle_click_action', 
		'translate_selection_middle_click_window_new_default', 'translate_selection_middle_click_window_new_always', 'translate_selection_middle_click_window_new_ctrl_fly', 'translate_selection_middle_click_window_new_ctrl_panel',
		'translate_selection_middle_click_translate_default', 'translate_selection_middle_click_translate_open_fly', 'translate_selection_middle_click_translate_open_panel',
		'translate_selection_middle_click_action_translate', 'translate_selection_middle_click_action_translate_on_it', 'translate_selection_middle_click_action_tooltip'
	];
	for (var id=0; id<field_list.length; id++) {
		if (is_enable) {
			document.getElementById(field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById(field_list[id]).setAttribute("disabled", true);
		}
	}

	if (is_enable) {
		var action = s3gt.form['translate_selection_middle_click_action'].value;
		is_enable = (action == 'tooltip') ?  true : false;
	}
	field_list = [ 'translate_selection_middle_click_translate', 'translate_selection_middle_click_translate_plus', 'translate_selection_middle_click_sound', 'translate_selection_middle_click_copy' ];
	for (var id=0; id<field_list.length; id++) {
		if (is_enable) {
			document.getElementById(field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById(field_list[id]).setAttribute("disabled", true);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.check_selected_text_long_click_enable = function() {
	var is_enable = document.getElementById("translate_selection_long_click").checked;
	var field_list = [ 'translate_selection_long_click_action', 
		'translate_selection_long_click_window_new_default', 'translate_selection_long_click_window_new_always', 'translate_selection_long_click_window_new_ctrl_fly', 'translate_selection_long_click_window_new_ctrl_panel',
		'translate_selection_long_click_translate_default', 'translate_selection_long_click_translate_open_fly', 'translate_selection_long_click_translate_open_panel',
		'translate_selection_long_click_action_translate', 'translate_selection_long_click_action_tooltip',
		'translate_selection_long_click_timer', 'translate_selection_long_click_timer_label', 'translate_selection_long_click_timer_data', 'translate_selection_long_click_timer_ms'
	];
	for (var id=0; id<field_list.length; id++) {
		if (is_enable) {
			document.getElementById(field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById(field_list[id]).setAttribute("disabled", true);
		}
	}

	if (is_enable) {
		var action = s3gt.form['translate_selection_long_click_action'].value;
		is_enable = (action == 'translate') ? false : true;
	}
	field_list = [ 'translate_selection_long_click_translate', 'translate_selection_long_click_translate_plus', 'translate_selection_long_click_sound', 'translate_selection_long_click_copy' ];
	for (var id=0; id<field_list.length; id++) {
		if (is_enable) {
			document.getElementById(field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById(field_list[id]).setAttribute("disabled", true);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate_selection_long_click_timer_change = function(value) {
	document.getElementById('translate_selection_long_click_timer_data').textContent = value;
	document.getElementById('translate_selection_long_click_timer').value = value;
	s3gt.pref_save('translate_selection_long_click_timer', parseInt(value), function(){
		document.getElementById('translate_selection_long_click_timer').focus();
	});
}
//------------------------------------------------------------------------------
s3gt.check_selected_text_fly_auto_enable = function() {
	var is_enable = document.getElementById("translate_selection_fly_auto").value;
	var field_list = [
		'translate_selection_fly_auto_action',
		'translate_selection_fly_auto_window_new_default', 'translate_selection_fly_auto_window_new_always',
		'translate_selection_fly_auto_translate_default', 'translate_selection_fly_auto_translate_open_fly', 'translate_selection_fly_auto_translate_open_panel'
	];
	for (var id=0; id<field_list.length; id++) {
		if (is_enable != 'disabled') {
			document.getElementById(field_list[id]).removeAttribute("disabled");
		} else {
			document.getElementById(field_list[id]).setAttribute("disabled", true);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate_word_fly_long_click_timer_change = function(value) {
	document.getElementById('translate_word_fly_long_click_timer_data').textContent = value;
	document.getElementById('translate_word_fly_long_click_timer').value = value;
	s3gt.pref_save('translate_word_fly_long_click_timer', parseInt(value), function(){
		document.getElementById('translate_word_fly_long_click_timer').focus();
	});
}
//-------------------------------------------------------------------------------------------
s3gt.statistics_change_status = function() {
	window.location.replace('/content/statistics.html?from=opt');
}
//-------------------------------------------------------------------------------------------
s3gt.statistics_status = function() {
	if (s3gt.prefs.list.statistics == 'on') {
		document.getElementById('statistics_is_enabled').hidden = false;
		document.getElementById('statistics_is_disabled').hidden = true;
	} else {
		document.getElementById('statistics_is_enabled').hidden = true;
		document.getElementById('statistics_is_disabled').hidden = false;
	}
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
window.addEventListener("load", function(){
	s3gt.prefs.init(s3gt.init_0);
});
