s3gt.thtml = {};
s3gt.thtml.animation_timer = null;
s3gt.thtml.animation_step = 20;

//------------------------------------------------------------------------------
s3gt.thtml.init = function(doc, tooltip, lang_from, lang_to) {
	doc.tooltip = tooltip;
	doc.tooltip_body = doc.getElementById("s3gt_translate_tooltip_body");

	doc.tooltip_body.addEventListener("focus", function() { tooltip.check_zindex_value(tooltip); });
	doc.tooltip_body.addEventListener("mousedown", function() { tooltip.check_zindex_value(tooltip); });
	doc.tooltip_body.addEventListener("keypress", function() { tooltip.check_zindex_value(tooltip); });

	tooltip.doc = doc;
	s3gt.thtml.set_style_panel(tooltip);

	if (! tooltip.original_text) {
		tooltip.view_source_translate_tooltip = true;
	}

	//----------------------------------------------------------------------
	doc.addEventListener("mousemove", function(event){ tooltip.tooltip_move(event); }, true);
	doc.addEventListener("mouseup", function(event){ s3gt.thtml.event_mouse_up(event); }, true);
	doc.addEventListener("mousedown", function(event){ tooltip.type_click = ''; }, true);
	doc.addEventListener('keydown', function(e) { s3gt.hotkeys.press(e); });
	doc.addEventListener('keyup', function(e) { s3gt.hotkeys.pause = false; });
	doc.addEventListener('keydown', s3gt.thtml.remove_click_esc, true);

	//----------------------------------------------------------------------
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head').addEventListener("mousedown", s3gt.thtml.move_mouse_down, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head').addEventListener("dblclick", function(event){ s3gt.thtml.tooltip_head_dblclick(event); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_logo').addEventListener("click", s3gt.thtml.remove_click, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_close').addEventListener("click", s3gt.thtml.remove_click, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_minimize').addEventListener("click", function(event){ s3gt.thtml.minimize(event, true); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_exchange').addEventListener("click", s3gt.thtml.exchange, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_settings').addEventListener("click", s3gt.thtml.settings_open, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_open').addEventListener("click", s3gt.thtml.open_prefs, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_close').addEventListener("click", s3gt.thtml.settings_close, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_theme_file').addEventListener("change", s3gt.thtml.settings_theme_file, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_donate').addEventListener("click", s3gt.thtml.go_donate, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_reverse').addEventListener("click", s3gt.thtml.view_reverse_click, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_source').addEventListener("click", s3gt.thtml.view_source_click, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_fly').addEventListener("click", s3gt.thtml.fly_click, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_pin').addEventListener("click", s3gt.thtml.pin_click, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_from').addEventListener("click", function(event) { s3gt.thtml.sound_play(event, 'from'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_google_from').addEventListener("click", function(event) { s3gt.thtml.go_google(event, 'from'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_transcription').addEventListener("click", s3gt.thtml.transcription_view_click, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_clear_text').addEventListener("click", s3gt.thtml.clear_text, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_correct_text').addEventListener("click", s3gt.thtml.correct_text, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_exchange').addEventListener("click", s3gt.thtml.translate_exchange, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_instant_translate').addEventListener("click", s3gt.thtml.instant_click, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_run').addEventListener("click", s3gt.thtml.translate_run, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').addEventListener("keydown", function(event) { return s3gt.thtml.keypress(event); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').addEventListener("input", s3gt.thtml.text_from_input, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').addEventListener("copy", function(event){ s3gt.thtml.copy_text(event, this, 'from'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').addEventListener("paste", function(event) { return s3gt.utils.paste_textplain(event); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').addEventListener("drop", function(event) { return s3gt.utils.drop_textplain(event); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').addEventListener("mouseup", s3gt.thtml.textbox_mouseup, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from').addEventListener("keyup", function(event) { s3gt.thtml.set_lang_icon(event.target) }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from').addEventListener("change", function(event) { s3gt.thtml.set_lang_icon(event.target) }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_from').addEventListener("click", function(event) { s3gt.thtml.save_last_lang_from_view_click(event, event.target) }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_move_top').addEventListener("click", s3gt.thtml.lang_list_from_top, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("keydown", function(event) { return s3gt.thtml.keypress_readonly(event); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("copy", function(event){ s3gt.thtml.copy_text(event, this, 'to'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("paste", function(event) { event.preventDefault(); return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("cut", function(event) { event.preventDefault(); return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("drop", function(event) { event.preventDefault(); return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("dragenter", function(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'none'; return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("dragover", function(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'none'; return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').addEventListener("mouseup", s3gt.thtml.textbox_mouseup, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_exchange_comby').addEventListener("click", s3gt.thtml.translate_exchange, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_to').addEventListener("click", function(event) { s3gt.thtml.sound_play(event, 'to'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_google_to').addEventListener("click", function(event) { s3gt.thtml.go_google(event, 'to'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_lowercase_to').addEventListener("click", function(event) { s3gt.thtml.lowercase_click(event, 'to'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_retry_to').addEventListener("click", s3gt.thtml.translate_run, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').addEventListener("keyup", function(event) { s3gt.thtml.set_lang_icon(event.target) }, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from_comby').addEventListener("keyup", function(event) { s3gt.thtml.set_lang_icon(event.target) }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_from_comby').addEventListener("click", function(event) { s3gt.thtml.save_last_lang_from_view_click(event, event.target) }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_move_top_comby').addEventListener("click", s3gt.thtml.lang_list_from_top, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to_comby').addEventListener("keyup", function(event) { s3gt.thtml.set_lang_icon(event.target) }, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("keydown", function(event) { return s3gt.thtml.keypress_readonly(event); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("copy", function(event){ s3gt.thtml.copy_text(event, this, 'reverse'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("paste", function(event) { event.preventDefault(); return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("cut", function(event) { event.preventDefault(); return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("drop", function(event) { event.preventDefault(); return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("dragenter", function(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'none'; return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("dragover", function(event) { event.preventDefault(); event.dataTransfer.dropEffect = 'none'; return false; }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').addEventListener("mouseup", s3gt.thtml.textbox_mouseup, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_reverse').addEventListener("click", function(event) { s3gt.thtml.sound_play(event, 'reverse'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_google_reverse').addEventListener("click", function(event) { s3gt.thtml.go_google(event, 'reverse'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_lowercase_reverse').addEventListener("click", function(event) { s3gt.thtml.lowercase_click(event, 'reverse'); }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_retry_reverse').addEventListener("click", s3gt.thtml.translate_reverse, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse').addEventListener("keyup", function(event) { s3gt.thtml.set_lang_icon(event.target) }, true);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_reverse').addEventListener("click", s3gt.thtml.save_last_lang_reverse_view_click, true);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_variant_box').addEventListener("blur", s3gt.thtml.variant_close, true);

	//----------------------------------------------------------------------
	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	txt_from.set_value = function(text) { return s3gt.utils.set_text_textbox(txt_from, text); }
	txt_from.get_value = function() { return s3gt.utils.get_text_textbox(txt_from); }
	txt_from.readOnly = false;
	//----------------------------------------------------------------------
	var txt_from_transcription = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_transcription');
	txt_from_transcription.set_value = function(text) { return s3gt.utils.set_text_textbox(txt_from_transcription, text); }
	txt_from_transcription.get_value = function() { return s3gt.utils.get_text_textbox(txt_from_transcription); }

	//----------------------------------------------------------------------
	var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	txt_to.set_value = function(text) { s3gt.utils.set_text_textbox(txt_to, text); }
	txt_to.get_value = function() { return s3gt.utils.get_text_textbox(txt_to); }
	txt_to.set_translate = function(result) { s3gt.thtml.set_translate(txt_to, result); };
	txt_to.readOnly = true;

	//----------------------------------------------------------------------
	var txt_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse');
	txt_reverse.set_value = function(text) { return s3gt.utils.set_text_textbox(txt_reverse, text); }
	txt_reverse.get_value = function() { return s3gt.utils.get_text_textbox(txt_reverse); }
	txt_reverse.set_translate = function(result) { s3gt.thtml.set_translate(txt_reverse, result); };
	txt_reverse.readOnly = true;

	//----------------------------------------------------------------------
	var button_move_top = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_move_top');
	button_move_top.setAttribute('title', s3gt.utils.get_string('translang.auto'));

	//---------------------------------------------------------------------
	var txt_list = { 'from':1, 'to':1, 'reverse':1 };
	for (var el_type in txt_list) {
		//-------------------------------------------------------------
		var txt_pane = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_' + el_type);
		txt_pane.resource = el_type;
		txt_pane.is_mutation = false;
		txt_pane.addEventListener("mousedown", function(event){ s3gt.thtml.set_textbox_resize_start(event, this); }, true);
//		txt_pane.addEventListener("mousemove", function(event){ s3gt.thtml.set_textbox_resize_move(event, this); }, true);
		txt_pane.addEventListener("mouseup", function(event){ s3gt.thtml.set_textbox_resize_end(event, this); }, true);

		//------------------------------------------------------------------------
		txt_pane.observer = new MutationObserver(function(mutations) {
			for (var i=0; i<mutations.length; i++) {
				var mutation = mutations[i];
				if (mutation.attributeName == 'style') {
					if (mutation.target.set_size) {
						continue;
					}
					s3gt.thtml.set_textbox_resize_observe(mutation.target);
				}
			}
		});
		txt_pane.observer.observe(txt_pane, { childList: false, subtree: false, attributes: true });
		//-------------------------------------------------------------
		var txt_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_' + el_type);
		txt_box.resource = el_type;
		txt_box.addEventListener("blur", s3gt.thtml.textbox_blur, true);

		//-------------------------------------------------------------
		var button_copy = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_copy_' + el_type);
		button_copy.resource = el_type;
		button_copy.addEventListener("click", function(event) {
			var txtbox_el = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_' + event.target.resource);
			txtbox_el.focus();
			s3gt.thtml.copy_text(event, txtbox_el, event.target.resource);
		}, true);

		//-------------------------------------------------------------
		var button_sound_off = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_off_' + el_type);
		button_sound_off.resource = el_type;
		button_sound_off.addEventListener("click", function(event) {
			var txtbox_el = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_' + event.target.resource);
			txtbox_el.focus();
			s3gt.sound.play_off(event);
		}, true);
		button_sound_off.is_wait_hide = true;
		button_sound_off.style.display = 'none';

		//-------------------------------------------------------------
		var button_flag = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_' + el_type);
		button_flag.resource = el_type;
		button_flag.no_wait = true;
		button_flag.addEventListener("click", function(event) {
			var flag_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_' + event.target.resource + '_box');
			flag_box.setAttribute('is_show', true);
			var control_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_' + event.target.resource + '_box');
			control_box.setAttribute('is_hide', true);

			var lang_list = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_' + event.target.resource);
			s3gt.thtml.set_lang_icon(lang_list);
		}, true);
		var lang_flag = lang_from;
		if (el_type == 'to') { lang_flag = lang_to; }
		if (el_type == 'reverse') {
			if (tooltip.save_last_lang_reverse) {
				lang_flag = s3gt.utils.prefs_get('reverse_lang_value', 'reverse');
			} else {
				lang_flag = 'reverse';
			}
			if (lang_flag == 'reverse') { lang_flag = lang_from; }
		}
		s3gt.thtml.set_flag_txt(tooltip, el_type, lang_flag);

		//-------------------------------------------------------------
		var button_lang_close = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_lang_close_' + el_type);
		button_lang_close.resource = el_type;
		button_lang_close.no_wait = true;
		button_lang_close.addEventListener("click", function(event) {
			var flag_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_' + event.target.resource + '_box');
			flag_box.removeAttribute('is_show');
			var control_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_' + event.target.resource + '_box');
			control_box.removeAttribute('is_hide');
		}, true);

		//-------------------------------------------------------------
		s3gt.thtml.box_name_view(doc, el_type);
	}

	//---------------------------------------------------------------------
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_move_top_comby').no_wait = true;
	//---------------------------------------------------------------------
	var button_flag_comby = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_comby');
	button_flag_comby.no_wait = true;
	button_flag_comby.addEventListener("click", function(event) {
		if (event.target && (event.target.nodeName.toUpperCase() == 'BUTTON')) {
			return;
		}
		var flag_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box_comby');
		flag_box.setAttribute('is_show', true);
		var control_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_to_box');
		control_box.setAttribute('is_hide', true);

		var lang_list = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to');
		s3gt.thtml.set_lang_icon(lang_list);
	}, true);
	//---------------------------------------------------------------------
	var button_lang_close_comby = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_lang_close_to_comby');
	button_lang_close_comby.no_wait = true;
	button_lang_close_comby.addEventListener("click", function(event) {
		var flag_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box_comby');
		flag_box.removeAttribute('is_show');
		var control_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_to_box');
		control_box.removeAttribute('is_hide');
	}, true);

	//---------------------------------------------------------------------
	var id_lang_list_from = ['s3gt_translate_tooltip_lang_from', 's3gt_translate_tooltip_lang_from_comby'];
	for (var i=0; i<id_lang_list_from.length; i++) {
		var el_lang_from = s3gt.utils.get_element(tooltip, id_lang_list_from[i]);
		var option_from = doc.createElement("option");
		option_from.text = s3gt.utils.get_string('translang.auto');
		option_from.value = 'auto';
		option_from.style.paddingRight = '24px';
		el_lang_from.options.add(option_from);
		s3gt.thtml.create_lang_list(el_lang_from);
		el_lang_from.value = lang_from;
		s3gt.thtml.set_lang_icon(el_lang_from);
		el_lang_from.addEventListener("change", function(event) {
			s3gt.thtml.set_lang_icon(el_lang_from);
	//		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_from_box').removeAttribute('is_show');
			s3gt.thtml.set_flag_txt(tooltip, 'from', el_lang_from.value);
			s3gt.thtml.translate_run(event);
		}, false);
	}
	//---------------------------------------------------------------------
	var id_lang_list_to = ['s3gt_translate_tooltip_lang_to', 's3gt_translate_tooltip_lang_to_comby'];
	for (var i=0; i<id_lang_list_to.length; i++) {
		var el_lang_to = s3gt.utils.get_element(tooltip, id_lang_list_to[i]);
		s3gt.thtml.create_lang_list(el_lang_to, true, lang_to);
		el_lang_to.value = lang_to;
		s3gt.thtml.set_lang_icon(el_lang_to);
		el_lang_to.addEventListener("change", function(event) {
			s3gt.thtml.set_lang_icon(event.target);
	//		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box').removeAttribute('is_show');
			s3gt.thtml.set_flag_txt(tooltip, 'to', event.target.value);
			s3gt.thtml.translate_run(event);
		}, false);
	}
	//---------------------------------------------------------------------
	var el_lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse');
	var option_reverse = doc.createElement("option");
	option_reverse.text = s3gt.utils.get_string('translang.reverse');
	option_reverse.value = 'reverse';
	option_reverse.style.paddingRight = '24px';
	el_lang_reverse.options.add(option_reverse);
	s3gt.thtml.create_lang_list(el_lang_reverse, true, lang_to);
	if (tooltip.save_last_lang_reverse) {
		el_lang_reverse.value = s3gt.utils.prefs_get('reverse_lang_value', 'reverse');
	}
	s3gt.thtml.set_lang_icon(el_lang_reverse);
	el_lang_reverse.addEventListener("change", function(event) {
		s3gt.thtml.set_lang_icon(el_lang_reverse);
		s3gt.main.pref_save('reverse_lang_value', el_lang_reverse.value);
//		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_reverse_box').removeAttribute('is_show');
		var lang_flag = el_lang_reverse.value;
		if (lang_flag == 'reverse') { lang_flag = el_lang_from.value; }
		s3gt.thtml.set_flag_txt(tooltip, 'reverse', lang_flag);
		s3gt.thtml.box_name_view_reverse(doc);
		s3gt.thtml.translate_reverse(event);
	}, false);

	//---------------------------------------------------------------------
	s3gt.thtml.view_source(doc);
	s3gt.thtml.animation_step = s3gt.utils.prefs_get('show_tooltip_animation_speed');

	if (tooltip.is_restore) {
		s3gt.thtml.set_style_theme(doc, function(){
			s3gt.thtml.show_body(doc); 
			s3gt.thtml.set_textbox_size(doc);
			txt_from.focus();
			txt_from.blur();
			s3gt.thtml.box_name_view_reverse(doc);
			s3gt.thtml.resize(doc);
		});
	} else {
		s3gt.thtml.set_style_theme(doc, function(){
			s3gt.thtml.show_body(doc); 
			s3gt.thtml.set_textbox_size(doc);
	//		s3gt.thtml.animation_run(tooltip, s3gt.thtml.animation_step);
			txt_from.focus();
			txt_from.blur();
			s3gt.thtml.box_name_view_reverse(doc);
			s3gt.thtml.resize(doc);
			s3gt.thtml.show_window(tooltip, false);
		});
	}
	//---------------------------------------------------------------------
	s3gt.thtml.settings_create_template(tooltip);
//	s3gt.thtml.show_window(tooltip, false);
}
//------------------------------------------------------------------------------
s3gt.thtml.set_style_panel = function(tooltip) {
	tooltip.doc.tooltip_body.setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_exchange').setAttribute('is_panel', tooltip.is_panel);
	var exchange_title = (tooltip.is_panel) ? s3gt.utils.get_string('translate.button.exchange.panel') : s3gt.utils.get_string('translate.button.exchange.tooltip');
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_exchange').setAttribute('title', exchange_title);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_box').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box').setAttribute('is_panel', tooltip.is_panel);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_from_box').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_reverse_box').setAttribute('is_panel', tooltip.is_panel);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_from').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_to').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_reverse').setAttribute('is_panel', tooltip.is_panel);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_from').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_to').setAttribute('is_panel', tooltip.is_panel);
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_reverse').setAttribute('is_panel', tooltip.is_panel);

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_box').setAttribute('is_panel', tooltip.is_panel);
}
//------------------------------------------------------------------------------
s3gt.thtml.show_window = function(tooltip, is_minimize) {
	s3gt.utils.i18n_parse(tooltip.doc);

	s3gt.thtml.set_style_panel(tooltip);
	s3gt.thtml.pin_view(tooltip.doc);
	s3gt.thtml.fly_view(tooltip.doc);
	s3gt.thtml.instant_view(tooltip.doc);
	s3gt.thtml.view_reverse(tooltip.doc, true);
	s3gt.thtml.save_last_lang_from_view(tooltip);
	s3gt.thtml.save_last_lang_reverse_view(tooltip);
	s3gt.thtml.set_style_font_size(tooltip.doc);
	s3gt.thtml.set_style_color(tooltip);
	s3gt.thtml.transcription_view(tooltip);
	s3gt.thtml.lowercase_view(tooltip, 'to');
	s3gt.thtml.lowercase_view(tooltip, 'reverse');

	tooltip.is_minimize = ! is_minimize;
	s3gt.thtml.show_body(tooltip.doc); 
	s3gt.thtml.set_textbox_size(tooltip.doc);
	s3gt.thtml.minimize(tooltip.doc, tooltip.is_init);
	s3gt.thtml.variant_close(tooltip.doc);
	s3gt.thtml.box_name_view_reverse(tooltip.doc);
	s3gt.thtml.settings_view(tooltip);
	s3gt.thtml.resize(tooltip.doc);

	tooltip.is_init = false;
}
//------------------------------------------------------------------------------
s3gt.thtml.show_body = function(doc) {
	doc.tooltip_body.removeAttribute('is_hide');
}
//------------------------------------------------------------------------------
s3gt.thtml.move_mouse_down = function(event) {
	var doc = s3gt.thtml.get_document(event);
	if (event.target) {
		if ((event.target.id != 's3gt_translate_tooltip_head') && (event.target.id != 's3gt_translate_tooltip_name_title')) { return; }
	}
	event.preventDefault();
	if (doc.tooltip.is_minimize) { return; }
	if (! event.target.hasAttribute('is_movable')) { return; }
	doc.tooltip.is_move_mouse_down = true;
	doc.tooltip.is_move_mouse_start_x = event.screenX;
	doc.tooltip.is_move_mouse_start_y = event.screenY;
	s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_head').setAttribute('is_move_mouse_down', true);
}
//------------------------------------------------------------------------------
s3gt.thtml.event_mouse_up = function(event) {
	var doc = s3gt.thtml.get_document(event);
	if (! doc) { return; }
	doc.tooltip.is_move_mouse_down = false;
	doc.tooltip.cursor_timer = setTimeout(function(){
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_head').setAttribute('is_move_mouse_down', false);
	}, 300);

	if ((doc.tooltip.type_click == 'fly_word') || (doc.tooltip.type_click == 'long_click')) {
		setTimeout(function(){
			try {
				var win = doc.tooltip.ownerDocument.defaultView;
				var event2 = new win.MouseEvent('mouseup', { 'view': null, 'bubbles': true, 'cancelable': true });
				win.dispatchEvent(event2);
			} catch(e) {
			}
		}, 200);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.tooltip_head_dblclick = function(event) {
	if (event.target.hasAttribute('is_dblclick')) {
		s3gt.thtml.minimize(event, true);
		try {
			clearTimeout(doc.tooltip.cursor_timer);
		} catch(e) {};
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.minimize = function(event, is_init) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	tooltip.is_minimize = ! tooltip.is_minimize;

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head').style.cursor = (tooltip.is_minimize) ? 'default' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_settings').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_pin').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_reverse').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_source').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_separator').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_box').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_fly').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_exchange').style.display = (tooltip.is_minimize) ? 'none' : '';

	if (tooltip.is_panel) {
		tooltip.style.top = '';
		tooltip.style.left = (tooltip.is_minimize) ? '' : '0px';
		tooltip.style.bottom = '0px';
//		tooltip.style.right = (tooltip.is_minimize) ? '0px' : '';

		doc.tooltip_body.style.marginRight = (tooltip.is_minimize) ? '0' : '';
		doc.tooltip_body.style.marginBottom = (tooltip.is_minimize) ? '0' : '';
		doc.tooltip_body.style.width = (tooltip.is_minimize) ? '250px' : '';
	} else {
		if (tooltip.is_minimize) {
			tooltip.minimize_top = tooltip.style.top;
			tooltip.minimize_left = tooltip.style.left;
			tooltip.style.width = '';
			tooltip.style.height = '';
		} else {
			tooltip.style.width = '1px';
			tooltip.style.height = '1px';
		}
		tooltip.style.top = (tooltip.is_minimize) ? '' : tooltip.minimize_top;
		tooltip.style.left = (tooltip.is_minimize) ? '' : tooltip.minimize_left;
		tooltip.style.bottom = (tooltip.is_minimize) ? '0px' : '';
		tooltip.style.right = (tooltip.is_minimize) ? '0px' : '';

		doc.tooltip_body.style.marginRight = (tooltip.is_minimize) ? '0' : '5px';
		doc.tooltip_body.style.marginBottom = (tooltip.is_minimize) ? '0' : '5px';
		doc.tooltip_body.style.width = (tooltip.is_minimize) ? '250px' : '';
	}

	if (! tooltip.is_minimize) {
		s3gt.thtml.view_source(doc);
		s3gt.thtml.view_reverse(doc, true);
		if (is_init) {
			s3gt.thtml.animation_step = s3gt.utils.prefs_get('show_tooltip_animation_speed');
			s3gt.thtml.animation_run(tooltip, s3gt.thtml.animation_step);
		}
	}

	//------------------------------------------------------------------------
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_name_title').style.display = (tooltip.is_minimize) ? 'none' : '';
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_name_text').style.display = (tooltip.is_minimize) ? '' : 'none';
	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	var txt_from_text = txt_from.get_value();
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_name_text').textContent = txt_from_text;

	//------------------------------------------------------------------------
	var button_minimize = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_head_minimize');
	button_minimize.setAttribute('title', s3gt.utils.get_string((tooltip.is_minimize) ? 'translate.button.restore' : 'translate.button.minimize'));

	if (tooltip.is_minimize) {
		var settings_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_box');
		settings_box.removeAttribute('is_show');
		tooltip.settings_open = false;
	}

	//------------------------------------------------------------------------
	setTimeout(function(){
		s3gt.thtml.resize(doc);
		s3gt.thtml.repos(tooltip, is_init);
		tooltip.recalc_minimize();
	}, 100);

	//------------------------------------------------------------------------
	if (! tooltip.is_restore) {
		tooltip.check_zindex_value(tooltip);
		tooltip.check_panel_value(tooltip, true);
		tooltip.set_work_data(tooltip);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.box_name_view = function(doc, resource) {
	if (s3gt.utils.prefs_get("tooltip_show_box_name")) {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_txt_' + resource).removeAttribute('before_is_hide');
	} else {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_txt_' + resource).setAttribute('before_is_hide', 'true');
	}
	if (resource == 'reverse') {
		s3gt.thtml.box_name_view_reverse(doc);
	} else {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_txt_' + resource).setAttribute('box_name', s3gt.utils.get_string('translate.box.' + resource));
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.box_name_view_reverse = function(doc) {
	var text_box = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_txt_reverse');
	var lang_reverse = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_lang_reverse').value;
	if (lang_reverse == 'reverse') {
		text_box.setAttribute('box_name', s3gt.utils.get_string('translate.box.reverse'));
	} else {
		text_box.setAttribute('box_name', s3gt.utils.get_string('translate.box.reverse_to'));
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.pin_view = function(doc) {
	s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_head_pin').setAttribute('pin_type', doc.tooltip.translate_tooltip_pin);
	s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_head_pin').setAttribute('title', s3gt.utils.get_string('translate.button.pin.' + doc.tooltip.translate_tooltip_pin));
}
//------------------------------------------------------------------------------
s3gt.thtml.pin_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	if (doc.tooltip.translate_tooltip_pin == 'close') {
		doc.tooltip.translate_tooltip_pin = 'onetab';
	} else if (doc.tooltip.translate_tooltip_pin == 'onetab') {
		doc.tooltip.translate_tooltip_pin = 'alltabs';
	} else {
		doc.tooltip.translate_tooltip_pin = 'close';
	}
	doc.tooltip.tab_id = s3gt.main.tab_id;
	doc.tooltip.set_work_data(doc.tooltip);
	s3gt.thtml.pin_view(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.fly_view = function(doc) {
	if (doc.tooltip.translate_selection_fly_tooltip) {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_head_fly').setAttribute('is_fly', true);
	} else {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_head_fly').removeAttribute('is_fly');
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.fly_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.translate_selection_fly_tooltip = ! doc.tooltip.translate_selection_fly_tooltip;
	if (doc.tooltip.is_panel) {
		s3gt.main.pref_save("translate_selection_fly_panel", doc.tooltip.translate_selection_fly_tooltip);
	} else {
		s3gt.main.pref_save("translate_selection_fly_tooltip", doc.tooltip.translate_selection_fly_tooltip);
	}
	doc.tooltip.set_work_data(doc.tooltip);
	s3gt.thtml.fly_view(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.instant_view = function(doc) {
	if (doc.tooltip.translate_instant_tooltip) {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_button_instant_translate').setAttribute('is_instant', true);
	} else {
		s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_button_instant_translate').removeAttribute('is_instant');
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.instant_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.translate_instant_tooltip = ! doc.tooltip.translate_instant_tooltip;
	if (doc.tooltip.is_panel) {
		s3gt.main.pref_save("translate_instant_panel", doc.tooltip.translate_instant_tooltip);
	} else {
		s3gt.main.pref_save("translate_instant_tooltip", doc.tooltip.translate_instant_tooltip);
	}
	doc.tooltip.set_work_data(doc.tooltip);
	s3gt.thtml.instant_view(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.view_source = function(doc) {
	var tooltip = doc.tooltip;
	if (tooltip.is_minimize) { return; }
	var to_box_comby = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box_comby');
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_to').setAttribute('is_show', tooltip.view_source_translate_tooltip);

	if (tooltip.view_source_translate_tooltip) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_box').style.display = '';
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_source').setAttribute('is_show', true);

		//-----------------------------------------------------------------
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_comby').setAttribute('is_hide', true);
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_exchange_comby').setAttribute('is_hide', true);
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to').removeAttribute('is_hide');

		//-----------------------------------------------------------------
		if (s3gt.utils.get_element(to_box_comby, 's3gt_translate_tooltip_lang_from')) {
			s3gt.thtml.replace_lang_comby(tooltip);
		}
		//-----------------------------------------------------------------
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').focus();
	} else {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_box').style.display = 'none';
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_source').removeAttribute('is_show');

		//-----------------------------------------------------------------
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_comby').removeAttribute('is_hide');
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_exchange_comby').removeAttribute('is_hide');
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to').setAttribute('is_hide', true);
		//-----------------------------------------------------------------
		if (s3gt.utils.get_element(to_box_comby, 's3gt_translate_tooltip_lang_from_comby')) {
			s3gt.thtml.replace_lang_comby(tooltip);
		}
	}
	s3gt.thtml.resize(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.view_source_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	tooltip.view_source_translate_tooltip = ! tooltip.view_source_translate_tooltip;
	if (tooltip.is_panel) {
		s3gt.main.pref_save("view_source_translate_panel", tooltip.view_source_translate_tooltip);
	} else {
		s3gt.main.pref_save("view_source_translate_tooltip", tooltip.view_source_translate_tooltip);
	}

	var flag_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box');
	flag_box.removeAttribute('is_show');

	var flag_box_comby = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_to_box_comby');
	flag_box_comby.removeAttribute('is_show');

	var control_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_to_box');
	control_box.removeAttribute('is_hide');

	s3gt.thtml.view_source(doc);
	s3gt.thtml.repos(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.replace_lang_comby = function(tooltip) {
	var id_list = ['from', 'to'];
	for (var i=0; i<id_list.length; i++) {
		var id = 's3gt_translate_tooltip_lang_' + id_list[i];
		var el = s3gt.utils.get_element(tooltip, id);
		var el_comby = s3gt.utils.get_element(tooltip, id + '_comby');
		el.id = id + '_comby';
		el_comby.id = id;
		if (el_comby.value != el.value) {
			el_comby.value = el.value;
			s3gt.thtml.set_flag_txt(tooltip, id_list[i], el_comby.value);
			s3gt.thtml.set_lang_icon(el_comby);
		}
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.view_reverse = function(doc, is_not_string) {
	var tooltip = doc.tooltip;
	if (tooltip.is_minimize) { return; }
	if (tooltip.view_reverse_translate_tooltip) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box').style.display = '';
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_reverse').setAttribute('is_show', 'true');
		if (! is_not_string) {
			s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').set_value(s3gt.utils.get_string('message.request.to.google'));
		}
	} else {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box').style.display = 'none';
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_reverse').removeAttribute('is_show');
	}
	s3gt.thtml.resize(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.view_reverse_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	var view_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_view_reverse');
	tooltip.view_reverse_translate_tooltip = ! tooltip.view_reverse_translate_tooltip;
	if (tooltip.is_panel) {
		s3gt.main.pref_save("view_reverse_translate_panel", tooltip.view_reverse_translate_tooltip);
	} else {
		s3gt.main.pref_save("view_reverse_translate_tooltip", tooltip.view_reverse_translate_tooltip);
	}
	s3gt.thtml.view_reverse(doc);
	if (tooltip.view_reverse_translate_tooltip) {
		tooltip.translate_reverse(event, tooltip);
	}
	s3gt.thtml.repos(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.lowercase_view = function(tooltip, resource) {
	if (tooltip['set_lowercase_tooltip_' + resource]) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_lowercase_' + resource).setAttribute('is_lowercase', 'true');
		tooltip['is_lowercase_' + resource] = true;
	} else {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_lowercase_' + resource).removeAttribute('is_lowercase');
		tooltip['is_lowercase_' + resource] = false;
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.lowercase_click = function(event, resource) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip['set_lowercase_tooltip_' + resource] = ! doc.tooltip['set_lowercase_tooltip_' + resource];
	if (doc.tooltip.is_panel) {
		s3gt.main.pref_save("set_lowercase_panel_" + resource, doc.tooltip['set_lowercase_tooltip_' + resource]);
	} else {
		s3gt.main.pref_save("set_lowercase_tooltip_" + resource, doc.tooltip['set_lowercase_tooltip_' + resource]);
	}
	s3gt.thtml.lowercase_view(doc.tooltip, resource);
	if (resource == 'reverse') {
		s3gt.thtml.translate_reverse(event);
	} else {
		s3gt.thtml.translate_run(event);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.lowercase_set = function(doc, text, resource) {
	if (resource == 'reverse') {
		if (doc.tooltip.is_lowercase_reverse) {
			text = text.toLowerCase();
		}
	} else if (doc.tooltip.is_lowercase_to) {
		text = text.toLowerCase();
	}
	return text;
}
//------------------------------------------------------------------------------
s3gt.thtml.sound_play = function(event, resource) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	var button_sound = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_' + resource);
	var button_sound_off = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_off_' + resource);

	var txtbox_el = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_' + resource);
	txtbox_el.focus();

	var text = s3gt.utils.get_text_textbox(txtbox_el, true);
	var lang = tooltip.get_lang_from(tooltip);
	if (resource == 'to') {
		lang = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value;
	} else if (resource == 'reverse') {
		lang = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse').value;
	}

	button_sound.style.display = 'none';
	button_sound_off.style.display = '';

	s3gt.sound.play_tts(lang, text, { 'sound_stop' : function() {
		button_sound.style.display = '';
		button_sound_off.style.display = 'none';
	} });
}
//------------------------------------------------------------------------------
s3gt.thtml.clear_text = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').set_value('');
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').set_value('');
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse').set_value('');
	tooltip.original_text = '';
	tooltip.set_work_data(tooltip, { 'last_result' : true });
	tooltip.clear_fly_last_text();
}
//------------------------------------------------------------------------------
s3gt.thtml.correct_text = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;

	var correct_buton = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_correct_text');
	if (correct_buton.correct_text) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').set_value(correct_buton.correct_text);
		s3gt.thtml.translate_run(event);
	}
	s3gt.thtml.correct_text_clear(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.correct_text_clear = function(tooltip) {
	var correct_buton = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_correct_text');
	correct_buton.correct_text = '';
	correct_buton.removeAttribute('is_correct_text');
	correct_buton.setAttribute('title', s3gt.utils.get_string('translate.button.correct.text'));
	tooltip.set_work_data(tooltip, { 'correct_text_clear' : true });
}
//------------------------------------------------------------------------------
s3gt.thtml.go_google = function(event, resource) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	var text = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from').get_value();
	var lang_res = s3gt.thtml.go_google_get_lang(tooltip, resource);

	if (resource == 'to') {
		text = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').get_value();
	}
	else if (resource == 'reverse') {
		var lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse').value;
		if (lang_reverse == 'reverse') {
			text = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to').get_value();
		}
	}

	tooltip.go_google(text, lang_res.lang_from, lang_res.lang_to);
}
//------------------------------------------------------------------------------
s3gt.thtml.go_google_get_lang = function(tooltip, resource) {
	var lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from').value;
	var lang_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value;

	if (resource == 'to') {
//		lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value;
//		lang_to = tooltip.get_lang_from(tooltip);
	}
	else if (resource == 'reverse') {
		var lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse').value;
		if (lang_reverse == 'reverse') {
			lang_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value;
			lang_to = tooltip.get_lang_from(tooltip);
		} else {
			lang_to = lang_reverse;
		}
	}
	return { 'lang_from' : lang_from, 'lang_to' : lang_to };
}
//------------------------------------------------------------------------------
s3gt.thtml.save_last_lang_from_view = function(tooltip) {
	if (tooltip.save_last_lang_from) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_from').checked = true;
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_from_comby').checked = true;
	} else {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_from').checked = false;
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_from_comby').checked = false;
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.save_last_lang_from_view_click = function(event, el) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.save_last_lang_from = el.checked;
	s3gt.main.pref_save("save_last_lang_from", doc.tooltip.save_last_lang_from);
	s3gt.thtml.save_last_lang_from_view(doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.save_last_lang_reverse_view = function(tooltip) {
	if (tooltip.save_last_lang_reverse) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_reverse').checked = true;
	} else {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_save_last_lang_reverse').checked = false;
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.save_last_lang_reverse_view_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.save_last_lang_reverse = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_save_last_lang_reverse').checked;
	s3gt.main.pref_save("save_last_lang_reverse", doc.tooltip.save_last_lang_reverse);
	s3gt.thtml.save_last_lang_reverse_view(doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.settings_create_template = function(tooltip) {
	var doc = tooltip.doc;
	//----------------------------------------------------------------------
	var theme = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_theme');
	theme.value = s3gt.utils.prefs_get('tooltip_theme', '');
	tooltip.current_theme = theme.value;
	var theme_func = function(event) {
		if (tooltip.current_theme == theme.value) { return; }
		tooltip.current_theme = theme.value;
		if (theme.value == 'custom_file') {
			var theme_file = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_theme_file');
			theme_file.click();
			return;
		}
		else if (theme.value == 'custom_url') {
			var theme_custom_path = s3gt.utils.prefs_get('tooltip_theme_custom_path', '');
			var result = prompt(s3gt.utils.get_string('prompt.theme_url'), theme_custom_path);
			if (result) {
				s3gt.main.pref_save('tooltip_theme_custom_path', result, function(){
					tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
				});
			}
			theme.value = 'custom';
			setTimeout(function() { tooltip.current_theme = theme.value; }, 50);
		}
		s3gt.main.pref_save('tooltip_theme', theme.value, function(){
			tooltip.set_style_cache('');
			s3gt.thtml.set_style_theme(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	};
	theme.addEventListener("change", theme_func, true);
	theme.addEventListener("keyup", theme_func, true);

	//----------------------------------------------------------------------
	var animation = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_animation');
	animation.addEventListener("change", function() {
		s3gt.main.pref_save('show_tooltip_animation', animation.value, function(){
			s3gt.thtml.animation_step = s3gt.utils.prefs_get('show_tooltip_animation_speed');
			s3gt.thtml.animation_run(tooltip, s3gt.thtml.animation_step);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	animation.addEventListener("keyup", function() {
		s3gt.main.pref_save('show_tooltip_animation', animation.value, function(){
			s3gt.thtml.animation_step = s3gt.utils.prefs_get('show_tooltip_animation_speed');
			s3gt.thtml.animation_run(tooltip, s3gt.thtml.animation_step);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);

	//----------------------------------------------------------------------
	var animation_speed = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_animation_speed');
	animation_speed.addEventListener("change", function() {
		s3gt.main.pref_save('show_tooltip_animation_speed', parseInt(animation_speed.value), function(){
			s3gt.thtml.animation_step = parseInt(animation_speed.value);
			s3gt.thtml.animation_run(tooltip, s3gt.thtml.animation_step);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	animation_speed.addEventListener("keyup", function() {
		s3gt.main.pref_save('show_tooltip_animation_speed', parseInt(animation_speed.value), function(){
			s3gt.thtml.animation_step = parseInt(animation_speed.value);
			s3gt.thtml.animation_run(tooltip, s3gt.thtml.animation_step);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);

	//----------------------------------------------------------------------
	var font_size = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_font_size');
	font_size.addEventListener("change", function() {
		s3gt.main.pref_save('font_size_tooltip_box', font_size.value, function(){
			s3gt.thtml.set_style_font_size(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	font_size.addEventListener("keyup", function() {
		s3gt.main.pref_save('font_size_tooltip_box', font_size.value, function(){
			s3gt.thtml.set_style_font_size(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);

	//----------------------------------------------------------------------
	var font_family = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_font_family');
	font_family.addEventListener("change", function() {
		s3gt.main.pref_save('font_family_tooltip_box', font_family.value, function(){
			s3gt.thtml.set_style_font_size(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	font_family.addEventListener("keyup", function() {
		s3gt.main.pref_save('font_family_tooltip_box', font_family.value, function(){
			s3gt.thtml.set_style_font_size(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);

	//----------------------------------------------------------------------
	var color_list = { 'font' : 1, 'background' : 1 };
	for (var color_set in color_list) {
		//--------------------------------------------------------------
		var color_enable = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_' + color_set + '_color_enable');
		color_enable.addEventListener("click", function(event) {
			var res = event.target.getAttribute('res');
			if (event.target.checked) {
				s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_' + res + '_color_value').removeAttribute('disabled');
			} else {
				s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_' + res + '_color_value').setAttribute('disabled', true);
			}
			s3gt.main.pref_save('tooltip_' + res + '_color_enable', event.target.checked, function(){
				s3gt.thtml.set_style_color(tooltip);
				tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
			});
		}, true);
		//--------------------------------------------------------------
		var color_value = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_' + color_set + '_color_value');
		color_value.value = s3gt.utils.prefs_get('tooltip_' + color_set + '_color_value')
		color_value.addEventListener("change", function(event) {
			var res = event.target.getAttribute('res');
			var color = event.target.value;
			s3gt.main.pref_save('tooltip_' + res + '_color_value', color, function(){
				s3gt.thtml.set_style_color(tooltip);
				tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
			});
//			event.target.style.backgroundColor = color;
		}, true);
	}

	//----------------------------------------------------------------------
	var tooltip_mini = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_tooltip_mini');
	tooltip_mini.style.position = 'static';
	tooltip_mini.style.display = 'inline-block';
	tooltip_mini.style.margin = 0;
	tooltip_mini.style.marginRight = '5px';
	tooltip_mini.style.opacity = '1';
	tooltip_mini.style.cursor = 'auto';
	tooltip_mini.style.verticalAlign = 'middle';

	var tooltip_size = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_tooltip_size');
	tooltip_size.addEventListener("change", function() {
		s3gt.main.pref_save('font_size_tooltip_logo', tooltip_size.value, function(){
			tooltip.set_style_mini_size(tooltip_mini);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	tooltip_size.addEventListener("keyup", function() {
		s3gt.main.pref_save('font_size_tooltip_logo', tooltip_size.value, function(){
			tooltip.set_style_mini_size(tooltip_mini);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	tooltip.set_style_mini_size(tooltip_mini);

	//----------------------------------------------------------------------
	var save_position = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_save_position');
	save_position.addEventListener("change", function() {
		s3gt.main.pref_save("tooltip_position_is_save", s3gt.utils.check_bool(save_position.value), function(){
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	save_position.addEventListener("keyup", function() {
		s3gt.main.pref_save("tooltip_position_is_save", s3gt.utils.check_bool(save_position.value), function(){
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);

	//----------------------------------------------------------------------
	var box_name = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_box_name');
	box_name.addEventListener("change", function() {
		s3gt.main.pref_save("tooltip_show_box_name", s3gt.utils.check_bool(box_name.value), function(){
			s3gt.thtml.resize(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	box_name.addEventListener("keyup", function() {
		s3gt.main.pref_save("tooltip_show_box_name", s3gt.utils.check_bool(box_name.value), function(){
			s3gt.thtml.resize(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}, true);
	//----------------------------------------------------------------------
	var webpage_zoom = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_webpage_zoom');
	webpage_zoom.addEventListener("change", function() {
		s3gt.main.pref_save("tooltip_use_webpage_zoom", s3gt.utils.check_bool(webpage_zoom.value), function(){
			tooltip.set_zoom();
			s3gt.thtml.resize(doc);
		});
	}, true);
	webpage_zoom.addEventListener("keyup", function() {
		s3gt.main.pref_save("tooltip_use_webpage_zoom", s3gt.utils.check_bool(webpage_zoom.value), function(){
			tooltip.set_zoom();
			s3gt.thtml.resize(doc);
		});
	}, true);
}
//------------------------------------------------------------------------------
s3gt.thtml.settings_theme_file = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	var file = event.target.files[0];

	var reader = new FileReader();
	//----------------------------------------------------------------------
	reader.onload = function(e) {
		var theme = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_theme');
		theme.value = 'custom';
		s3gt.main.pref_save('tooltip_theme', theme.value, function(){
			tooltip.set_style_cache(e.target.result);
			s3gt.thtml.set_style_theme(doc);
			tooltip.set_work_data(tooltip, { 'change_theme_settings' : true });
		});
	}
	reader.readAsText(file);
}
//------------------------------------------------------------------------------
s3gt.thtml.settings_view = function(tooltip) {
	if (tooltip.settings_open) {
		s3gt.thtml.settings_open(tooltip.doc);
	} else {
		s3gt.thtml.settings_close(tooltip.doc);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.settings_close = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var settings_box = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_settings_box');
	settings_box.removeAttribute('is_show');
	s3gt.thtml.resize(doc);
	doc.tooltip.settings_open = false;
	doc.tooltip.set_work_data(doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.settings_open = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	if (event.target && (event.target.id != 's3gt_translate_tooltip_head_settings')) { return; }
	var settings_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_box');
	if (settings_box.hasAttribute('is_show')) {
		s3gt.thtml.settings_close(event);
		return;
	}
	settings_box.setAttribute('is_show', 'true');
	s3gt.thtml.resize(doc);
	//----------------------------------------------------------------------
	s3gt.thtml.settings_set_values(tooltip);
	//----------------------------------------------------------------------
	tooltip.settings_open = true;
	tooltip.set_work_data(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.settings_set_values = function(tooltip) {
	var theme = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_theme');
	theme.value = s3gt.utils.prefs_get('tooltip_theme', '');
	tooltip.current_theme = theme.value;

	var animation = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_animation');
	animation.value = s3gt.utils.prefs_get('show_tooltip_animation', '');

	var animation_speed = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_animation_speed');
	animation_speed.value = s3gt.utils.prefs_get('show_tooltip_animation_speed', 20);

	var font_size = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_font_size');
	font_size.value = s3gt.utils.prefs_get('font_size_tooltip_box', '');

	var font_family = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_font_family');
	font_family.value = s3gt.utils.prefs_get('font_family_tooltip_box');

	//----------------------------------------------------------------------
	var color_list = { 'font' : 1, 'background' : 1 };
	for (var color_set in color_list) {
		//--------------------------------------------------------------
		var color_enable = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_' + color_set + '_color_enable');
		color_enable.checked = s3gt.utils.prefs_get('tooltip_' + color_set + '_color_enable');

		var color_value = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_' + color_set + '_color_value');
		color_value.value = s3gt.utils.prefs_get('tooltip_' + color_set + '_color_value');
//		color_value.style.backgroundColor = s3gt.utils.prefs_get('tooltip_' + color_set + '_color_value');
		if (color_enable.checked) {
			color_value.removeAttribute('disabled');
		} else {
			color_value.setAttribute('disabled', true);
		}
	}
	s3gt.thtml.set_style_color(tooltip);

	//----------------------------------------------------------------------
	var tooltip_size = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_tooltip_size');
	tooltip_size.value = s3gt.utils.prefs_get('font_size_tooltip_logo', '');
	//----------------------------------------------------------------------
	var tooltip_mini = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_tooltip_mini');
	tooltip.set_style_mini_size(tooltip_mini);
	//----------------------------------------------------------------------
	var save_position = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_save_position');
	save_position.value = s3gt.utils.prefs_get("tooltip_position_is_save");
	//----------------------------------------------------------------------
	var box_name = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_box_name');
	box_name.value = s3gt.utils.prefs_get("tooltip_show_box_name");
	//----------------------------------------------------------------------
	var webpage_zoom = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_webpage_zoom');
	webpage_zoom.value = s3gt.utils.prefs_get("tooltip_use_webpage_zoom");
}
//------------------------------------------------------------------------------
s3gt.thtml.set_style_theme = function(doc, callback) {
	doc.tooltip.set_style_theme(doc.tooltip, callback);
	s3gt.thtml.set_textbox_size(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.animation_run = function(tooltip, step) {
	if (tooltip && (step < 0)) {
//		tooltip.style.transform = '';
		var zoom_index = s3gt.utils.get_zoom_value();
		tooltip.style.transform = 'scale(' + 1/ zoom_index + ')';
		tooltip.style.transformOrigin = 'bottom right';
		tooltip.style.opacity = '';
	} else if (tooltip) {
		var timer_value = 5;
		var animation = s3gt.utils.prefs_get('show_tooltip_animation');
		var istep = s3gt.thtml.animation_step;
		if (animation == 'rotation') {
			var inc = Math.floor(180 / istep);
			tooltip.style.transform = 'rotateX(' + (step*inc) + 'deg) rotateY(' + (step*inc) + 'deg) scale(' + ((istep-step)/istep) + ')';
			tooltip.style.opacity = ((istep-step)/istep);
		} else if (animation == 'zooming') {
			tooltip.style.transform = 'scale(' + ((istep-step)/istep) + ')';
			tooltip.style.opacity = ((istep-step)/istep);
		} else if (animation == 'transparency') {
			tooltip.style.opacity = ((istep-step)/istep);
			timer_value = 10;
		}
		s3gt.thtml.animation_timer = setTimeout(function() { s3gt.thtml.animation_run(tooltip, step-1); }, timer_value);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.set_style_font_size = function(doc) {
	var s3gt_translate_tooltip = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip');
	var font_percent = parseInt(s3gt.utils.prefs_get('font_size_tooltip_box', ''));
	if (font_percent) {
		s3gt_translate_tooltip.style.fontSize = Math.ceil(14 * font_percent / 100) + 'px';
	} else {
		s3gt_translate_tooltip.style.fontSize = '';
	}

	var font_family = s3gt.utils.prefs_get('font_family_tooltip_box');
	if (font_family) {
		s3gt_translate_tooltip.style.fontFamily = font_family;
	} else {
		s3gt_translate_tooltip.style.fontFamily = '';
	}

	s3gt.thtml.resize(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.set_style_color = function(tooltip) {
	var s3gt_translate_tooltip = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip');
	var settings_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_settings_box');
	//----------------------------------------------------------------------
	var color_list = { 'font' : 'color', 'background' : 'backgroundColor' };
	for (var color_set in color_list) {
		var is_enable = s3gt.utils.prefs_get('tooltip_' + color_set + '_color_enable');
		var color_value = s3gt.utils.prefs_get('tooltip_' + color_set + '_color_value');

		if (is_enable && color_value) {
			s3gt_translate_tooltip.style[color_list[color_set]] = color_value;
			settings_box.style[color_list[color_set]] = color_value;
		} else {
			s3gt_translate_tooltip.style[color_list[color_set]] = '';
			settings_box.style[color_list[color_set]] = '';
		}
	}
	//----------------------------------------------------------------------
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_from').style.backgroundColor = s3gt_translate_tooltip.style.backgroundColor;
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_from').style.backgroundColor = s3gt_translate_tooltip.style.backgroundColor;

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_to').style.backgroundColor = s3gt_translate_tooltip.style.backgroundColor;
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_to').style.backgroundColor = s3gt_translate_tooltip.style.backgroundColor;

	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_reverse').style.backgroundColor = s3gt_translate_tooltip.style.backgroundColor;
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_control_reverse').style.backgroundColor = s3gt_translate_tooltip.style.backgroundColor;
}
//------------------------------------------------------------------------------
s3gt.thtml.set_textbox_size = function(doc) {
	var tooltip = doc.tooltip;

	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_from');
	var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_to');
	var txt_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_pane_reverse');
	if (! txt_from) { return; }

	if (tooltip.is_panel) {
		if (tooltip.tooltip_height_panel < tooltip.tooltip_height_panel_min) {
			tooltip.tooltip_height_panel = tooltip.tooltip_height_panel_min;
		}

		txt_from.style.width = '';
		txt_to.style.width = '';
		txt_reverse.style.width = '';

		var zoom_index = s3gt.utils.get_zoom_value(true);
		var tooltip_height_panel = tooltip.tooltip_height_panel / zoom_index;

		txt_from.style.height = tooltip_height_panel + 'px';
		txt_to.style.height = tooltip_height_panel + 'px';
		txt_reverse.style.height = tooltip_height_panel + 'px';
	} else {
		var tooltip_width = tooltip.tooltip_width;
		txt_from.style.width = tooltip_width + 'px';
		txt_to.style.width = tooltip_width + 'px';
		txt_reverse.style.width = tooltip_width + 'px';
	
		txt_from.style.height = tooltip.tooltip_height_from + 'px';
		txt_to.style.height = tooltip.tooltip_height_to + 'px';
		txt_reverse.style.height = tooltip.tooltip_height_reverse + 'px';
	}

	s3gt.thtml.resize(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.set_textbox_resize_start = function(event, self) {
	var doc = s3gt.thtml.get_document(event);
	if (doc.tooltip.is_panel) { return; }

	self.originalW = self.clientWidth;
	self.originalH = self.clientHeight;
	self.startResize = true;
	self.startMove = false;
}
//------------------------------------------------------------------------------
s3gt.thtml.set_textbox_resize_end = function(event, self) {
	var doc = s3gt.thtml.get_document(event);
	if (doc.tooltip.is_panel) { return; }

	self.startResize = false;
	self.startMove = false;
	var txt_box = self;
	setTimeout(function(){
		s3gt.thtml.set_textbox_size(doc);
		s3gt.thtml.offer_button_show(doc.tooltip, txt_box.resource);
	}, 50);
}
//------------------------------------------------------------------------------
s3gt.thtml.set_textbox_resize_observe = function(el) {
	var doc = s3gt.thtml.get_document(el);
	if (! el.startResize) { return; }
	if (doc.tooltip.is_panel) { return; }

	var width = parseInt(el.style.width);
	if (width < 400) { width = 400; }
	
	var height = parseInt(el.style.height);
	if (height < 50) { height = 50; }
	
	if ((doc.tooltip.tooltip_width != width) || (doc.tooltip['tooltip_height_' + el.resource] != height)) {
		doc.tooltip.tooltip_width = width;
		s3gt.main.pref_save('tooltip_width', width);
		
		doc.tooltip['tooltip_height_' + el.resource] = height;
		s3gt.main.pref_save('tooltip_height_' + el.resource, height);

		s3gt.thtml.set_textbox_size(doc);
		doc.tooltip.set_work_data(doc.tooltip);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.set_textbox_resize_move = function(event, self) {
	var doc = s3gt.thtml.get_document(event);
	if (! self.startResize) { return; }
	if (doc.tooltip.is_panel) { return; }
	if (self.startMove) {
		event.target.set_size = true;
		//-----------------------------------------------------------------
		var newW = self.originalW + event.clientX - self.originalX;
		if (newW < self.originalW) {
			self.style.width = newW + 'px';
		}
		var width = parseInt(self.style.width);
		if (width < 400) { width = 400; }
		//-----------------------------------------------------------------
		var newH = self.originalH + event.clientY - self.originalY;
		if (newH < self.originalH) {
			self.style.height = newH + 'px';
		}
		var height = parseInt(self.style.height);
		if (height < 50) { height = 50; }
		//-----------------------------------------------------------------
		doc.tooltip.tooltip_width = width;
		s3gt.main.pref_save('tooltip_width', width);

		doc.tooltip['tooltip_height_' + event.target.resource] = height;
		s3gt.main.pref_save('tooltip_height_' + event.target.resource, height);
		s3gt.thtml.set_textbox_size(doc);
		doc.tooltip.set_work_data(doc.tooltip);
		//-----------------------------------------------------------------
		setTimeout(function(){
			event.target.set_size = false;
		}, 100);

	} else {
		if (self.clientWidth !== self.originalW || self.clientHeight !== self.originalH) {
			self.originalX = event.clientX;
			self.originalY = event.clientY;
			self.startMove = true;
		}
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.textbox_blur = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var txt_box = event.currentTarget;
	s3gt.thtml.offer_button_hide(doc.tooltip, txt_box.resource);
}
//------------------------------------------------------------------------------
s3gt.thtml.offer_button_show = function(tooltip, resource) {
	var txt_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_' + resource);
	var text = s3gt.utils.get_text_textbox(txt_box, true, true);
	if (text) {
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_copy_' + txt_box.resource).setAttribute('is_offer', true);
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_' + txt_box.resource).setAttribute('is_offer', true);
	} else {
		s3gt.thtml.offer_button_hide(tooltip, resource);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.offer_button_hide = function(tooltip, resource) {
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_copy_' + resource).removeAttribute('is_offer');
	s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_sound_' + resource).removeAttribute('is_offer');
}
//------------------------------------------------------------------------------
s3gt.thtml.copy_text = function(event, txtbox, resource) {
	var activeElement = s3gt.utils.getFocusedElement();
	event.preventDefault();
	var doc = s3gt.thtml.get_document(event);

	var text = s3gt.utils.get_text_textbox(txtbox, true);
	if (event.target.resource) {
		s3gt.utils.copy_clipboard(text);
	} else {
		s3gt.utils.copy_clipboard(text, null, true);
	}
	activeElement.focus();
	setTimeout(function(){ s3gt.thtml.offer_button_hide(doc.tooltip, resource);}, 100);
}
//------------------------------------------------------------------------------
s3gt.thtml.resize = function(doc) {
	var tooltip = doc.tooltip;
	s3gt.thtml.box_name_view(doc, 'from');
	s3gt.thtml.box_name_view(doc, 'to');
	s3gt.thtml.box_name_view(doc, 'reverse');

	if (tooltip.is_panel) {
		var inc = (tooltip.is_minimize) ? 5 : 5;
		var zoom_index = s3gt.utils.get_zoom_value();

		tooltip.tframe.style.width = '100%';
		tooltip.tframe.style.height = (doc.tooltip_body.scrollHeight + inc) + 'px';

		tooltip.style.width =  100 * zoom_index + '%';
		tooltip.style.height = doc.tooltip_body.scrollHeight + 'px';

		var width = tooltip.clientWidth;
		var width_zoom = (width - width * zoom_index);
		tooltip.style.left = (width_zoom / zoom_index) + 'px';

		var width_txt_box = '100%';
		if (tooltip.view_source_translate_tooltip && tooltip.view_reverse_translate_tooltip) {
			width_txt_box = '33%';
		} else if (tooltip.view_source_translate_tooltip || tooltip.view_reverse_translate_tooltip) {
			width_txt_box = '50%';
		}
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_box').style.width = width_txt_box;
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box').style.width = width_txt_box;
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box').style.width = width_txt_box;
		tooltip.check_panel_value();
		tooltip.recalc_minimize();
	}
	else {
		var inc_w = (tooltip.is_minimize) ? 0 : 5;
		var inc_h = (tooltip.is_minimize) ? 0 : 5;

		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_box').style.width = '';
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box').style.width = '';
		s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box').style.width = '';

		tooltip.tframe.style.width = (doc.tooltip_body.scrollWidth + inc_w) + 'px';
		tooltip.tframe.style.height = (doc.tooltip_body.scrollHeight + inc_h) + 'px';
	
//		tooltip.style.width = (doc.tooltip_body.scrollWidth + inc_w) / s3gt.main.zoom_index + 'px';
//		tooltip.style.height = (doc.tooltip_body.scrollHeight + inc_h) / s3gt.main.zoom_index + 'px';
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.repos = function(tooltip, is_init) {
	tooltip.repos(tooltip, is_init);
}
//------------------------------------------------------------------------------
s3gt.thtml.translate_run = function(event) {
	var doc = s3gt.thtml.get_document(event);

	s3gt.sound.play_off();
	doc.tooltip.translate_run(event, doc.tooltip);
	s3gt.thtml.correct_text_clear(doc.tooltip);
	s3gt.thtml.transcription_clear(doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.exchange = function(event) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.exchange(event, doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.translate_reverse = function(event) {
	var doc = s3gt.thtml.get_document(event);
	s3gt.sound.play_off();
	doc.tooltip.translate_reverse(event, doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.translate_exchange = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;

	var text_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	var text_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	var text_to_value = text_to.get_value();
	text_to.set_value(text_from.get_value());
	text_from.set_value(text_to_value);

	var lang_from_el = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_from');
	var lang_to_el = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to');
	var lang_from = tooltip.get_lang_from(tooltip);

	lang_from_el.value = lang_to_el.value;
	if (lang_from == 'auto') {
		lang_from = s3gt.utils.get_lang('s3gt-panel-lang-list-to', s3gt.prefs.lang_to);
	}
	lang_to_el.value = lang_from;

	s3gt.thtml.set_lang_icon(lang_from_el);
	s3gt.thtml.set_lang_icon(lang_to_el);
	tooltip.translate_run(event, tooltip);
	s3gt.thtml.correct_text_clear(tooltip);
	s3gt.thtml.transcription_clear(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.create_lang_list = function(el, is_lang_to, default_lang) {
	var lang_list = s3gt.prefs.get_lang_list();
	var doc = s3gt.thtml.get_document(el);
	//---------------------------------------------------------------------------
	for (var i=0; i<lang_list.length; i++) {
		lang_list[i].label = s3gt.utils.get_string(lang_list[i].label);
	}
	lang_list = lang_list.sort(function(a, b){
		var label_a=a.label.toLowerCase(), label_b=b.label.toLowerCase();
		if (label_a < label_b) { return -1; }
		else if (label_a > label_b) { return 1; }
		else { return 0; }
	});
	//---------------------------------------------------------------------------
	var list_disabled_lang_to = s3gt.utils.prefs_get('list_disabled_lang_to');
	//---------------------------------------------------------------------------
	for (var lang_id=0; lang_id<lang_list.length; lang_id++) {
		var lang = lang_list[lang_id];

		var option = doc.createElement("option");
		option.text = lang.label;
		option.value = lang.lang;
		option.setAttribute('title', lang.label);
//		el.options.add(option);
		s3gt.utils.set_lang_icon(option, lang.lang, false, true);
		var is_add = true;
		if (is_lang_to) {
			if (default_lang != lang.lang) {
				if (! s3gt.utils.check_enable_lang_to(lang.lang, list_disabled_lang_to)) {
					is_add = false;
					option.style.display = 'none';
				}
			}
		}
		if (is_add) {
			el.options.add(option);
		}
	}

	return true;
}
//------------------------------------------------------------------------------
s3gt.thtml.set_lang_icon = function(el_select) {
	var item = el_select.options[el_select.selectedIndex];
	el_select.style.background = item.style.background;
	el_select.style.backgroundPosition = '2px 50%';
	el_select.style.paddingLeft = item.style.paddingLeft;
	el_select.style.paddingRight = item.style.paddingRight;
}
//------------------------------------------------------------------------------
s3gt.thtml.set_flag_txt = function(tooltip, type, lang) {
	s3gt.thtml.set_flag_txt_el(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_' + type), lang);
	s3gt.thtml.set_flag_txt_el(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_flag_' + type + '_comby'), lang);
	s3gt.thtml.set_flag_txt_google(tooltip, type, lang);
}
//------------------------------------------------------------------------------
s3gt.thtml.set_flag_txt_el = function(el, lang) {
	if (el && lang) {
		s3gt.utils.set_lang_icon(el, lang, false, true);
		var label = s3gt.prefs.get_lang_label(lang);
		if (label) {
			label = s3gt.utils.get_string(label);
		}
		el.setAttribute('title', label);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.set_flag_txt_google = function(tooltip, type, lang) {
	//--------------------------------------------------------------
	var el_google = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_google_' + type);
	if (el_google) {
		var lang_res = s3gt.thtml.go_google_get_lang(tooltip, type);
		var google_title = s3gt.utils.get_string('translate.go.google')
		var label_from = s3gt.prefs.get_lang_label(lang_res.lang_from);
		if (label_from) { label_from = s3gt.utils.get_string(label_from); }

		var label_to = s3gt.prefs.get_lang_label(lang_res.lang_to);
		if (label_to) { label_to = s3gt.utils.get_string(label_to); }
		el_google.setAttribute('title', google_title + "\n" + label_from + ' -> ' + label_to);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.lang_list_from_top = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var lang_from = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_lang_from');
	lang_from.selectedIndex = 0;
	s3gt.thtml.set_lang_icon(lang_from);
	doc.tooltip.translate_run(event, doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.remove_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.remove_click(doc.tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.remove_click_esc = function(event) {
	var doc = s3gt.thtml.get_document(event);
	if (event.which == "27") {
		if (! doc.tooltip.is_minimize) {
			doc.tooltip.remove_click(doc.tooltip);
		}
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.text_from_input = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;

	if (tooltip.translate_instant_tooltip) {
		try {
			clearTimeout(tooltip.translate_timer);
		} catch(e) {};
		tooltip.translate_timer = setTimeout(function(){ s3gt.thtml.translate_run(event); }, 100);
	}
	s3gt.sound.play_off();
	s3gt.thtml.correct_text_clear(tooltip);
	s3gt.thtml.transcription_clear(tooltip);
	s3gt.thtml.offer_button_show(tooltip, 'from');
	doc.tooltip.set_work_data(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.keypress = function(event) {
	var doc = s3gt.thtml.get_document(event);
	if ((event.keyCode == 13) && (event.ctrlKey)) {
		s3gt.thtml.translate_run(event);
		return false;
	}
	setTimeout(function(){ s3gt.thtml.offer_button_show(doc.tooltip, 'from'); }, 50);
	doc.tooltip.set_work_data(doc.tooltip);
	return s3gt.utils.keypress_enter(event);
}
//------------------------------------------------------------------------------
s3gt.thtml.textbox_mouseup = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var txt_box = event.currentTarget || event.target;
	setTimeout(function(){ s3gt.thtml.offer_button_show(doc.tooltip, txt_box.resource); }, 50);
}
//------------------------------------------------------------------------------
s3gt.thtml.keypress_readonly = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var txt_box = event.currentTarget || event.target;
	setTimeout(function(){ s3gt.thtml.offer_button_show(doc.tooltip, txt_box.resource); }, 50);
	if (s3gt.utils.keypress_readonly(event)) {
		return true;
	} else {
		event.preventDefault();
		return false;
	}
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
s3gt.thtml.go_donate = function(event) {
	event.preventDefault();
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.go_donate();
}
//------------------------------------------------------------------------------
s3gt.thtml.open_prefs = function(event) {
	var doc = s3gt.thtml.get_document(event);
	doc.tooltip.open_prefs();
}
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
s3gt.thtml.fly_div_repos = function(event, fly_div) {
	var doc = s3gt.thtml.get_document(event);

	fly_div.style.top = '';
	fly_div.style.left = '0px';
	fly_div.style.bottom = '';
	fly_div.style.right = '';

	if (fly_div.clientWidth > (doc.tooltip_body.clientWidth - event.pageX - 16)) {
		var right = ((doc.tooltip_body.clientWidth - event.pageX) + 16);
		if ((right + fly_div.clientWidth) > doc.tooltip_body.clientWidth) {
			fly_div.style.left = '8px';
		} else {
			fly_div.style.left = '';
			fly_div.style.right = '0px';
		}
	} else {
		fly_div.style.left = (event.pageX + 8) + 'px';
	}
	if (fly_div.clientHeight > (doc.tooltip_body.clientHeight - event.pageY - 8)) {
		var bottom = ((doc.tooltip_body.clientHeight - event.pageY) + 8);
		if ((bottom + fly_div.clientHeight) > doc.tooltip_body.clientHeight) {
			fly_div.style.top = '2px';
		} else {
			fly_div.style.bottom = bottom + 'px';
		}
	} else {
		fly_div.style.top = (event.pageY + 8) + 'px';
	}
	s3gt.thtml.resize(doc);
}
//------------------------------------------------------------------------------
s3gt.thtml.transcription_view = function(tooltip) {
	if (tooltip.transcription_from_show) {
		s3gt.thtml.transcription_show(tooltip);
	} else {
		s3gt.thtml.transcription_clear(tooltip, true);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.transcription_view_click = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;
	tooltip.transcription_from_show = ! tooltip.transcription_from_show;
	s3gt.thtml.transcription_view(tooltip);
	tooltip.set_work_data(tooltip);
}
//------------------------------------------------------------------------------
s3gt.thtml.transcription_show = function(tooltip) {
	var transcription = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_transcription');
	if (transcription.text) {
		var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
		txt_from.setAttribute('is_hide', true);
	
		var txt_from_transcription = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_transcription');
		txt_from_transcription.set_value(transcription.text);
		txt_from_transcription.setAttribute('is_hide', false);
		tooltip.transcription_from_show = true;

		transcription.setAttribute('is_view', true);
	} else {
		s3gt.thtml.transcription_clear(tooltip, true);
	}
	transcription.blur();
}
//------------------------------------------------------------------------------
s3gt.thtml.transcription_clear = function(tooltip, only_hide) {
	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from');
	txt_from.setAttribute('is_hide', false);

	var txt_from_transcription = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from_transcription');
	txt_from_transcription.set_value('');
	txt_from_transcription.setAttribute('is_hide', true);

	var transcription = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_button_transcription');
	transcription.setAttribute('is_view', false);
	transcription.blur();

	tooltip.transcription_from_show = false;

	if (! only_hide) {
		transcription.setAttribute('is_hide', true);
		transcription.text = '';
		tooltip.set_work_data(tooltip, { 'transcription_clear' : true });
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.set_translate = function(txt_box, result) {
	var doc = s3gt.thtml.get_document(txt_box);
	if (result.jrsp && result.jrsp.translate_list && (result.jrsp.translate_list.length > 0)) {
		s3gt.thtml.set_translate_with_variants(txt_box, result.jrsp.translate_list);
	} else {
		txt_box.set_value(result.text);
	}

	if (txt_box.resource == 'to') {
		if (result.correct_text) {
			var correct_buton = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_button_correct_text');
			correct_buton.correct_text = result.correct_text;
			correct_buton.setAttribute('is_correct_text', true);
			correct_buton.setAttribute('title', s3gt.utils.get_string('translate.button.correct.text.subject') + "\n" + result.correct_text);
		} else {
			s3gt.thtml.correct_text_clear(doc.tooltip);
		}

		if (result.transcription) {
			var transcription = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_button_transcription');
			transcription.text = result.transcription;
			transcription.removeAttribute('is_hide');
		} else {
			s3gt.thtml.transcription_clear(doc.tooltip);
		}
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.set_translate_with_variants = function(txt_box, translate_list) {
	var doc = s3gt.thtml.get_document(txt_box);

	var resource = txt_box.resource;
	while (txt_box.firstChild) {
		txt_box.removeChild(txt_box.firstChild);
	}
	var div = doc.createElement('div');
	txt_box.appendChild(div);
	div.style.paddingBottom = "30px";
	txt_box = div;

	for (var i=0; i<translate_list.length; i++) {
		var tr = translate_list[i];
		if (tr.is_space) {
			txt_box.appendChild(doc.createTextNode(' '));
		}
		var span = doc.createElement('span');
		span.id = 's3gt_translate_tooltip_variant_' + resource + '_id_' + i;
		span.resource = resource;

		txt_box.appendChild(span);
		span.translate_variant = tr.translate_variant;
		if (span.translate_variant) {
			span.className = 's3gt_translate_tooltip_variant';
			span.addEventListener("click", s3gt.thtml.variant_open, true);
		} else {
			span.translate_variant = [[ tr.translate_variant2 ]];
		}
		s3gt.thtml.set_translate_span(span, 0);
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.set_translate_span = function(span, id) {
	var text = span.translate_variant[id][0];
	text = s3gt.thtml.lowercase_set(s3gt.thtml.get_document(span), text, span.resource);
	s3gt.utils.set_text_textbox(span, text);
}
//------------------------------------------------------------------------------
s3gt.thtml.variant_open = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var tooltip = doc.tooltip;

	var variant_box = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_variant_box');
	var span = event.currentTarget;
	variant_box.current_span = span;

	while (variant_box.rows.length) {
		variant_box.deleteRow(0);
	}
	var tr_text_list = [];
	for (var i=0; i<span.translate_variant.length; i++) {
		var row = variant_box.insertRow(variant_box.rows.length);
		row.id = span.id + '_' + i;

		var tr = span.translate_variant[i];
		var template = doc.getElementById('s3gt_translate_tooltip_variant_box_template').cloneNode(true);

		var div_word = s3gt.utils.get_element(template, 'template_variant_word');
		div_word.appendChild(doc.createTextNode(tr[0]));
		tr_text_list.push( s3gt.thtml.lowercase_set(s3gt.thtml.get_document(span), tr[0], span.resource) );
		div_word.tr_id = i;
		div_word.addEventListener("click", function(event) {
			s3gt.thtml.set_translate_span(span, event.target.tr_id);
			if ((span.resource == 'to') && tooltip.view_reverse_translate_tooltip) {
				var el_lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse');
				if (el_lang_reverse.value == 'reverse') {
					s3gt.thtml.translate_reverse(event);
				}
			}
		}, true);

		var cell1 = row.insertCell(0);
		cell1.appendChild(div_word);
		var cell2 = row.insertCell(1);
		cell2.id = span.id + '_' + i + '.2';
	}

	var lang_from = tooltip.get_lang_from(tooltip);
	var lang_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_to').value;
	var lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse').value;
	var lang_from_value = lang_to;
	var lang_to_value = lang_from;
	if (span.resource == 'reverse') {
		if (lang_reverse == 'reverse') {
			lang_from_value = lang_from;
			lang_to_value = lang_to;
		} else {
			lang_from_value = lang_reverse;
		}
	}

	if (span.translate_short_result) {
		s3gt.thtml.variant_set_title(event, span.translate_short_result, span.id);
	} else {
		tooltip.google_text_short(tr_text_list, lang_from_value, lang_to_value, function(result_list) {
			if (span) {
				span.translate_short_result = result_list;
				s3gt.thtml.variant_set_title(event, result_list, span.id);
			}
		});
	}

	variant_box.setAttribute('is_show', true);
	s3gt.thtml.fly_div_repos(event, variant_box);
	variant_box.focus();
	variant_box.current_span.setAttribute('is_hover', true);
	s3gt.thtml.offer_button_show(tooltip, span.resource);
}
//------------------------------------------------------------------------------
s3gt.thtml.variant_close = function(event) {
	var doc = s3gt.thtml.get_document(event);
	var variant_box = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_variant_box');
	try {
		variant_box.removeAttribute('is_show');
		variant_box.current_span.removeAttribute('is_hover');
		s3gt.thtml.offer_button_hide(doc.tooltip, variant_box.current_span.resource);
	} catch(e) {
	}
}
//------------------------------------------------------------------------------
s3gt.thtml.variant_set_title = function(event, title_list, span_id) {
	var doc = s3gt.thtml.get_document(event);
	for (var i2=0; i2<title_list.length; i2++) {
		var cell2 = doc.getElementById(span_id + "_" + i2 + '.2');
		if (cell2) {
			var template = doc.getElementById('s3gt_translate_tooltip_variant_box_template').cloneNode(true);
			var div_translate = s3gt.utils.get_element(template, 'template_variant_translate');
			div_translate.appendChild(doc.createTextNode(title_list[i2]));
			cell2.appendChild(div_translate);
		}
	}
	var variant_box = s3gt.utils.get_element(doc.tooltip, 's3gt_translate_tooltip_variant_box');
	s3gt.thtml.fly_div_repos(event, variant_box);
}
//------------------------------------------------------------------------------
s3gt.thtml.get_document = function(data) {
	if (("doc" in data) && (data.doc)) {
		return data.doc;
	}
	else if (("documentElement" in data) && (data.documentElement)) {
		return data;
	}
	else if (("target" in data) && (data.target)) {
		data = data.target;
	}
	return data.ownerDocument;
}
//------------------------------------------------------------------------------
