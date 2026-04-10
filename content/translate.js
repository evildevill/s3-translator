s3gt.translate = {};
s3gt.translate.fly_last_text = '';
s3gt.translate.last_activeElement = null;
s3gt.translate.last_selection = null;
s3gt.translate.mini_click_workaround_timer = null;

//-------------------------------------------------------------------------------------------
s3gt.translate.page = function(lang_from, lang_to) {
	//-----------------------------------------------------------------------------------
	// check protocol
	//-----------------------------------------------------------------------------------
	if (s3gt.utils.get_http_protocol() == 'https://') {
		if (s3gt.utils.prefs_get("promt_https")) {
			if (! confirm(s3gt.utils.get_string('confirm.translate.full.page.https') + "\n" + s3gt.utils.get_string('confirm.continue'))) {
				return false;
			}
		}
	}

	//-----------------------------------------------------------------------------------
	// confirm - Connect & load script from translate.google.com. Continue?
	//-----------------------------------------------------------------------------------
	var run_trans_full_page = s3gt.utils.prefs_get("run_trans_full_page");

	if (! run_trans_full_page) {
		var google_link = s3gt.work_data.protocol_google_translator + s3gt.work_data.domain_google_translator;
		var confirm_text = s3gt.utils.get_string('confirm.translate.full.page') + "\n" + s3gt.utils.get_string('confirm.continue');
		confirm_text = confirm_text.replace(/\%TRANSLATE_GOOGLE_DOMAIN\%/i, google_link);
		if (! confirm( confirm_text )) {
			s3gt.translate.page_google_site(lang_from, lang_to);
			return false;
		}
		if (confirm(s3gt.utils.get_string('confirm.save.choice'))) {
			run_trans_full_page = true;
			s3gt.main.pref_save("run_trans_full_page", true);
		}
	}

	//-----------------------------------------------------------------------------------
	// always translate this domain
	//-----------------------------------------------------------------------------------
	if (run_trans_full_page) {
		var domain = s3gt.utils.get_http_domain();
		var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
		if (! domain_translate_list[domain]) { domain_translate_list[domain] = {}; }

		//---------------------------------------------------------------------------
		if (domain && (domain_translate_list[domain].always_domain_question || (domain_translate_list[domain].always_domain_question == undefined))) {
			if ((s3gt.utils.prefs_get("autotranslate") != 'stop') && (s3gt.utils.prefs_get("autotranslate") != 'not-ask')) {
				domain_translate_list[domain].always_domain_question = false;
				s3gt.main.pref_save('domain_translate_list', domain_translate_list);
			}

			//-------------------------------------------------------------------
			if (s3gt.utils.prefs_get("autotranslate") == 'check') {
				var confirm_txt = s3gt.utils.get_string('confirm.always.translate.domain');
				confirm_txt = confirm_txt.replace("DOMAIN", domain);
				if (confirm(confirm_txt)) {
					domain_translate_list[domain].always_domain_translate = true;
					s3gt.main.pref_save('domain_translate_list', domain_translate_list);
				}
			}
		}
	}

	//-----------------------------------------------------------------------------------
	s3gt.translate.page_run(lang_from, lang_to);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.page_run = function(lang_from, lang_to, no_check_csp) {
	var elm = document.getElementsByTagName("body")[0];
	if (!elm) { return; }

	//-----------------------------------------------------------------------------------
	if (lang_from == 'auto') {
		var content_text = s3gt.utils.get_elem_text(document.documentElement).replace(/\s+/g, ' ');
		if (content_text.length > 200) {
			content_text = content_text.substr(Math.floor((Math.random()*(content_text.length-200))+1), 200);
			content_text = content_text.replace(/^\S+|\S+$/g, '');
			content_text = content_text.replace(/^[\s\d\.\:\,\-\_]+|[\s\d\.\:\,\-\_]+$/g, '');
		}
		var data = { 'text' : content_text, 'only_get_lang_src' : true, 'lang_from' : lang_from, 'lang_to' : lang_to};
		data.id_translate_session = Math.random();
		s3gt.wait_session[data.id_translate_session] = function(rdata) {
			var lang_from_pre = 'error';
			if (rdata.result.is_ok && (rdata.result.lang_from != 'auto')) {
				lang_from_pre = rdata.result.lang_from;
			}
			s3gt.translate.page_run(lang_from_pre, lang_to);
		}
		s3gt.translate.google_request(data);
		return;
	}
	//-----------------------------------------------------------------------------------
	if (lang_from == 'error') {
		lang_from == 'auto';
	}

	//-----------------------------------------------------------------------------------
	s3gt.translate.page_original();
	//-----------------------------------------------------------------------------------
	var lang_list_google = [];
	//---------------------------------------------------------------------------
	if (s3gt.utils.prefs_get('translate_page_show_only_selected_languages')) {
		var lang_list = s3gt.prefs.get_lang_list();
		var list_disabled_lang_to = s3gt.utils.prefs_get('list_disabled_lang_to');
		var default_lang = s3gt.utils.prefs_get('default_lang_to');
		if (default_lang == 'auto') { default_lang = s3gt.prefs.lang_to; }
		//---------------------------------------------------------------------
		for (var lang_id=0; lang_id<lang_list.length; lang_id++) {
			var lang = lang_list[lang_id];
			if (default_lang == lang.lang) {
				lang_list_google.push(lang.lang);
			} else if (s3gt.utils.check_enable_lang_to(lang.lang, list_disabled_lang_to)) {
				lang_list_google.push(lang.lang);
			}
		}
	}
	//-----------------------------------------------------------------------------------
	var s1 = document.createElement("script");
	s1.type = "text/javascript";
	var script_clean = s3gt.translate.page_func.replace("LANG_TO", lang_to).replace("LANG_FROM", lang_from).replace("LANG_LIST_TO", lang_list_google.join(','));

	var clean_site = s3gt.utils.prefs_get("clean_site_after_google");
	if (clean_site) {
		if (! document.s3gt_clean_site_interval) {
			script_clean += s3gt.translate.page_clean1 + s3gt.translate.page_clean2 + s3gt.translate.page_clean_go + s3gt.translate.page_clean_stop + s3gt.translate.page_clean_start;
		}
	} else {
		script_clean += s3gt.translate.page_clean_stop;
	}
	s1.appendChild(document.createTextNode(script_clean));

	//------------------------------------------------------------------------------------
	var s2 = document.createElement("script");
	s2.type = "text/javascript";
	s2.src = s3gt.utils.get_http_protocol() + s3gt.work_data.url_translate_page.replace("LANG_TO", lang_to).replace("LANG_FROM", lang_from);

	//-----------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("translate_page_hide_header")) {
		s2.onload = function(){
			var mouseout_timer = null;
			//----------------------------------------------------------------------
			function hide_google_container(el) {
				el.style.height = '33px';
				el.style.width = '30px';
				el.style.opacity = '0.5';
				el.style.marginLeft = '-23px';
				el.style.left = '10px';
				el.style.marginTop = '-12px';
				var body_style = document.defaultView.getComputedStyle(document.body, "");
				if (body_style) {
					var body_top = parseInt(body_style.getPropertyValue('top') || '0');
					body_top = body_top - 40;
					if (body_top < 0) { body_top = 0; }
					document.body.style.top = body_top + 'px';
				}
				mouseout_timer = null;
			}
			//----------------------------------------------------------------------
			function show_google_container(el) {
				el.style.height = '';
				el.style.width = '';
				el.style.opacity = '';
				el.style.marginLeft = '';
				el.style.left = '';
				el.style.marginTop = '';
				if (mouseout_timer == null) {
					var body_style = document.defaultView.getComputedStyle(document.body, "");
					if (body_style) {
						var body_top = parseInt(body_style.getPropertyValue('top') || '0');
						body_top = body_top + 40;
						document.body.style.top = body_top + 'px';
					}
				} else {
					try { clearTimeout(mouseout_timer); } catch(e) {};
				}
			}
			//----------------------------------------------------------------------
			window.setTimeout(function() {
				var elifr = document.getElementById(':0.container');
				if (elifr) {
					elifr.addEventListener('mouseover', function(e) {
						try { clearTimeout(mouseout_timer); } catch(e) {};
						show_google_container(elifr);
					});
					elifr.addEventListener('mouseout', function(e) {
						mouseout_timer = setTimeout(function(){ hide_google_container(elifr); }, 700);
					});
					hide_google_container(elifr);
				}
			}, 3000);
		}
	}
	//-----------------------------------------------------------------------------------
	if (! no_check_csp) {
//		s2.onerror = function(){
//			// about:config  ;  privacy.trackingprotection.enabled
//			s3gt.translate.page_run_csp(lang_from, lang_to);
//		}
		s2.onload = function(){
			window.setTimeout(function() {
				s3gt.translate.page_run_csp(lang_from, lang_to);
			}, 3000);
		}
	}
	//-----------------------------------------------------------------------------------
	elm.appendChild(s1);
	elm.appendChild(s2);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.page_original = function() {
	var elm = document.getElementsByTagName("body")[0];
	if (!elm) { return; }

	//-----------------------------------------------------------------------------------
	for (var ifr_id in {'0':0, '1':0,'2':0, '3':0}) {
		var ifr_google = document.getElementById(':' + ifr_id + '.container');
		if (ifr_google) {
			for (var ifr_button_name in {'cancel':0,'restore':0, 'close':0}) {
				var ifr_button = ifr_google.contentDocument.getElementById(':' + ifr_id + '.' + ifr_button_name);
				if (ifr_button) {
					ifr_button.click();
				}
			}
			ifr_google.parentNode.removeChild(ifr_google);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.page_run_csp = function(lang_from, lang_to) {
	//-----------------------------------------------------------------------------------
	if (document.getElementById(':0.container')) {
		//------------------------------------------------------------------------------
		// normal work
		//------------------------------------------------------------------------------
	}
	else {
		s3gt.translate.page_google_site(lang_from, lang_to);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request = function(data) {
	chrome.runtime.sendMessage({ 'google_request': true, 'data' : data });
}
//-------------------------------------------------------------------------------------------
s3gt.translate.page_google_site = function(lang_from, lang_to) {
	var url = s3gt.work_data.url_translate_page_google_site;
	url = url.replace("LANG_FROM", lang_from);
	url = url.replace("LANG_TO", lang_to);

	var url_loc = window.location;
	url = url.replace("URL", s3gt.utils.urlencode(url_loc));

	//-----------------------------------------------------------------------------------
	chrome.runtime.sendMessage({ 'open_url': true, 'url' : url, 'pos_after_active' : true });
}
//-------------------------------------------------------------------------------------------
// showBanner(autoTrans=true)
//-------------------------------------------------------------------------------------------
s3gt.translate.page_func = "function googleTranslateElementInit() { var s3GTElem = new google.translate.TranslateElement({ autoDisplay: false, pageLanguage: 'LANG_FROM', includedLanguages: 'LANG_LIST_TO', multilanguagePage: true }); setTimeout(function() { s3GTElem.showBanner(true); }, 100);}";
//-------------------------------------------------------------------------------------------
s3gt.translate.page_clean1 = "function googleTranslateElementClean1() { var elifr = document.getElementById(':0.container'); if (elifr) { var el = elifr.contentDocument.getElementById(':0.finishSection'); if (el) { googleTranslateElementClean2(); }} var gttt = document.getElementById('goog-gt-tt'); if (gttt) { gttt.style.display = 'none'; gttt.style.visibility = 'hidden'; }}";
// s3gt.translate.page_clean2 = "function googleTranslateElementClean2() { var els = document.body.getElementsByTagName('font'); for (var i=0; i<els.length; i++) { delete(els[i]['111b']); for (var k in els[i]) { if (/^_11gt_/.test(k)) { delete(els[i][k]); } if (/^closure_uid_/.test(k)) { delete(els[i][k]); }}}}";
s3gt.translate.page_clean2 = "function googleTranslateElementClean2() { var els = document.body.getElementsByTagName('font'); for (var i=0; i<els.length; i++) { els[i]['b']=999999; for (var k in els[i]) { if (/^_gt_/.test(k)) { els[i][k]=999999; } if (/^closure_uid_/.test(k)) { els[i][k]=999999; }}}}";
s3gt.translate.page_clean_go = "function googleTranslateElementCleanGo() { if (document.s3gt_clean_site) { document.s3gt_clean_site = false; googleTranslateElementClean1(); document.s3gt_clean_site = true; } }";
s3gt.translate.page_clean_start = "document.s3gt_clean_site = true; document.s3gt_clean_site_interval = setInterval(googleTranslateElementCleanGo, 1000);";
s3gt.translate.page_clean_stop = "if (document.s3gt_clean_site_interval) { clearInterval(document.s3gt_clean_site_interval); }";
//------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
s3gt.translate.selection_fly = function(lang_from, lang_to, event, is_fly_auto, text, type_click) {
	if (text === undefined) {
		text = s3gt.utils.search_selected(event);
		//-----------------------------------------------------------------------------------
		if (text.length == 0 || text == "") {
			s3gt.tooltip.remove();
			return;
		}
	}
	//-----------------------------------------------------------------------------------
	if (s3gt.tooltip.remove_timer) {
		clearTimeout(s3gt.tooltip.remove_timer);
	}
	s3gt.tooltip.remove();
	//-----------------------------------------------------------------------------------
	if (! type_click) { type_click = 'normal'; }
	//-----------------------------------------------------------------------------------
	if (! event) { event = {}; }
	//-----------------------------------------------------------------------------------
	event.type_click = type_click;
	event.key_ctrl_is_pressed = s3gt.key_ctrl_is_pressed;
	//-----------------------------------------------------------------------------------
	if (text.length == 0 || text == "") {
		var tooltip = s3gt.tooltip.create_fly_switch(event, '', false, lang_from, lang_to);
		s3gt.tooltip.create_panel(tooltip, lang_from, lang_to);
		return;
	}

	//-----------------------------------------------------------------------------------
	s3gt.translate.last_activeElement = s3gt.utils.getFocusedElement();
	//-----------------------------------------------------------------------------------
	if (! is_fly_auto) {
		var tooltip = s3gt.tooltip.create_mini(event, text, type_click);
		if (tooltip) {
			var range = s3gt.utils.save_selection();
			s3gt.tooltip.remove_timer = setTimeout(function() { s3gt.tooltip.remove_timer_run(tooltip, 9); }, 1000);
			//----------------------------------------------------------------------
			var tooltip_logo = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_mini_logo');
			if (tooltip_logo) {
				//---------------------------------------------------------------
				//-- event "mouseup" its workaround for instagram and other sites...
				//---------------------------------------------------------------
				tooltip_logo.addEventListener('mouseup', function(event_click) {
					s3gt.translate.mini_click_workaround_timer = setTimeout(function(){
						tooltip_logo.click_function(event_click);
					}, 100);
				}, true);
				//---------------------------------------------------------------
				tooltip_logo.addEventListener('click', function(event_click) {
					tooltip_logo.click_function(event_click);
				}, true);
				//---------------------------------------------------------------
				tooltip_logo.click_function = function(event_click) {
					//---------------------------------------------------------
					try { clearTimeout(s3gt.translate.mini_click_workaround_timer); } catch(e) {};
					//---------------------------------------------------------
					s3gt.key_ctrl_is_pressed = event_click.ctrlKey;
					event.key_ctrl_is_pressed = s3gt.key_ctrl_is_pressed;
					//---------------------------------------------------------
					if (s3gt.tooltip.check_window_new(event.type_click)) {
						var tooltip_fly = s3gt.tooltip.create_fly_switch(event, text, true, lang_from, lang_to);
						s3gt.tooltip.create_panel(tooltip_fly, lang_from, lang_to, { 'create_panel' : function() { s3gt.translate.selection_fly_run(text, lang_from, lang_to, event, tooltip_fly); } });
						s3gt.tooltip.remove(true);
					} else {
						s3gt.translate.selection_fly_run(text, lang_from, lang_to, event);
					}
					//---------------------------------------------------------
					clearTimeout(s3gt.tooltip.remove_timer);
					s3gt.tooltip.remove_timer = null;
					s3gt.utils.restore_selection(range);
				}
			}
			//----------------------------------------------------------------------
			var tooltip_logo_plus = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_mini_logo_plus');
			if (tooltip_logo_plus) {
				//---------------------------------------------------------------
				//-- event "mouseup" its workaround for instagram and other sites...
				//---------------------------------------------------------------
				tooltip_logo_plus.addEventListener('mouseup', function(event_click) {
					s3gt.translate.mini_click_workaround_timer = setTimeout(function(){
						tooltip_logo_plus.click_function(event_click);
					}, 100);
				}, true);
				//---------------------------------------------------------------
				tooltip_logo_plus.addEventListener('click', function(event_click) {
					tooltip_logo_plus.click_function(event_click);
				}, true);
				//---------------------------------------------------------------
				tooltip_logo_plus.click_function = function(event_click) {
					//---------------------------------------------------------
					try { clearTimeout(s3gt.translate.mini_click_workaround_timer); } catch(e) {};
					//---------------------------------------------------------
					var fly_last_text = s3gt.translate.fly_last_text;
					var tooltip_fly = s3gt.tooltip.get_tooltip_from_doc('fly');
					if (tooltip_fly) {
						fly_last_text = s3gt.utils.get_element(tooltip_fly, 's3gt_translate_tooltip_txt_from').get_value();
					}
					var text_plus = (fly_last_text) ? fly_last_text + "\n" + text : text;
					s3gt.translate.selection_fly_run(text_plus, lang_from, lang_to, event, null, true);
					clearTimeout(s3gt.tooltip.remove_timer);
					s3gt.tooltip.remove_timer = null;
					s3gt.utils.restore_selection(range);
				}
			}
			//----------------------------------------------------------------------
			var tooltip_sound = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_mini_sound');
			if (tooltip_sound) {
				//---------------------------------------------------------------
				//-- event "mouseup" its workaround for instagram and other sites...
				//---------------------------------------------------------------
				tooltip_sound.addEventListener('mouseup', function(event_click) {
					s3gt.translate.mini_click_workaround_timer = setTimeout(function(){
						tooltip_sound.click_function(event_click);
					}, 100);
				}, true);
				//---------------------------------------------------------------
				tooltip_sound.addEventListener('click', function(event_click) {
					tooltip_sound.click_function(event_click);
				}, true);
				//---------------------------------------------------------------
				tooltip_sound.click_function = function(event_click) {
					//---------------------------------------------------------
					try { clearTimeout(s3gt.translate.mini_click_workaround_timer); } catch(e) {};
					//---------------------------------------------------------
					if (tooltip_sound.sound_lang) {
						s3gt.translate.speech_fly_response(text, tooltip_sound.sound_lang, tooltip, tooltip_sound);
					} else {
						s3gt.translate.speech_fly_run(text, lang_from, lang_to, tooltip);
					}
					clearTimeout(s3gt.tooltip.remove_timer);
					s3gt.tooltip.remove_timer = null;
					s3gt.utils.restore_selection(range);
				}
			}
			//----------------------------------------------------------------------
			var tooltip_copy = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_mini_copy');
			if (tooltip_copy) {
				//---------------------------------------------------------------
				//-- event "mouseup" its workaround for instagram and other sites...
				//---------------------------------------------------------------
				tooltip_copy.addEventListener('mouseup', function(event_click) {
					s3gt.translate.mini_click_workaround_timer = setTimeout(function(){
						tooltip_copy.click_function(event_click);
					}, 100);
				}, true);
				//---------------------------------------------------------------
				tooltip_copy.addEventListener('click', function(event_click) {
					tooltip_copy.click_function(event_click);
				}, true);
				//---------------------------------------------------------------
				tooltip_copy.click_function = function(event_click) {
					//---------------------------------------------------------
					try { clearTimeout(s3gt.translate.mini_click_workaround_timer); } catch(e) {};
					//---------------------------------------------------------
					var text_html = (event_click && event_click.ctrlKey) ? '' : s3gt.utils.search_selected(event, true);
					s3gt.utils.copy_clipboard(text, text_html);
					clearTimeout(s3gt.tooltip.remove_timer);
					s3gt.tooltip.remove_timer = null;
					s3gt.tooltip.remove_click(tooltip);
					s3gt.utils.restore_selection(range);
				}
			}
			//----------------------------------------------------------------------
			tooltip.addEventListener('mouseover', function() {
				clearTimeout(s3gt.tooltip.remove_timer);
				s3gt.tooltip.remove_timer = null;
				tooltip.style.opacity = '';
			}, true);
			s3gt.tooltip.repos(tooltip);
			//----------------------------------------------------------------------
			tooltip.addEventListener('mouseout', function() {
				if (s3gt.tooltip.remove_timer) {
					clearTimeout(s3gt.tooltip.remove_timer);
				}
				if (! tooltip.sound_play) {
					s3gt.tooltip.remove_timer = setTimeout(function() { s3gt.tooltip.remove_timer_run(tooltip, 9); }, 1000);
				}
			}, true);
			s3gt.tooltip.repos(tooltip);
		}
		return;
	}
	//-----------------------------------------------------------------------------------
	if (s3gt.tooltip.check_window_new(event.type_click)) {
		var tooltip_fly = s3gt.tooltip.create_fly_switch(event, text, true, lang_from, lang_to);
		s3gt.tooltip.create_panel(tooltip_fly, lang_from, lang_to, { 'create_panel' : function() { s3gt.translate.selection_fly_run(text, lang_from, lang_to, event, tooltip_fly); } });
	} else {
		s3gt.translate.selection_fly_run(text, lang_from, lang_to, event);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.selection_fly_run = function(text, lang_from, lang_to, event, tooltip, is_add_text) {
	s3gt.tooltip.remove(true);

	if (! tooltip) {
		tooltip = s3gt.tooltip.get_tooltip_from_doc('fly', false, s3gt.tooltip.check_basic_functions_in_panel(event));
	}
	if (tooltip && tooltip.is_minimize) {
		tooltip = null;
	}
	if (! tooltip) {
		tooltip = s3gt.tooltip.create_fly_switch(event, text, false, lang_from, lang_to);
		s3gt.tooltip.create_panel(tooltip, lang_from, lang_to, { 'create_panel' : function() { s3gt.translate.selection_fly_run_func(text, lang_from, lang_to, event, tooltip);} });
	} else {
		s3gt.translate.selection_fly_run_func(text, lang_from, lang_to, event, tooltip);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.selection_fly_run_func = function(text, lang_from, lang_to, event, tooltip) {
	if (! tooltip) { return; }

	tooltip.original_text = text;
	tooltip.translate_text = '';

	var txt_from = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_from')
	if (txt_from.get_value() != tooltip.original_text) { txt_from.set_value(tooltip.original_text); }

	s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box'), true);
	s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box'), true);

	s3gt.tooltip.repos(tooltip, true);

	if (text) {
		if (tooltip.is_lowercase_to) {
			text = text.toLowerCase();
		}
		s3gt.translate.fly_last_text = text;
	}

	var data = { 'text' : text, 'lang_from' : lang_from, 'lang_to' : lang_to, 'is_check_lang_pair' : true, 'run_speech_source' : event.run_speech_source };
	data.id_translate_session = Math.random();
	tooltip.id_translate_session = data.id_translate_session;
	s3gt.wait_session[data.id_translate_session] = function(result) {
		s3gt.translate.response_fly(result, tooltip);
	}
	s3gt.translate.google_request(data);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.speech_fly_run = function(text, lang_from, lang_to, tooltip) {
	var tooltip_sound = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_mini_sound');
	if (tooltip.sound_play) {
		tooltip_sound.removeAttribute('is_sound_off');
		tooltip_sound.setAttribute('title', tooltip_sound.getAttribute('title_play'));
		s3gt.sound.play_off();
		return;
	}
	var lang_from_pre = lang_from;
	//-----------------------------------------------------------------------------------
	if ((lang_from_pre == '') || (lang_from_pre == 'auto')) {
		var text_pre = text;
		if (text_pre.length > 200) {
			text_pre = text_pre.substr(Math.floor((Math.random()*(text.length-200))+1), 200);
			text_pre = text_pre.replace(/^\S+|\S+$/g, '');
			text_pre = text_pre.replace(/^[\s\d\.\:\,\-\_]+|[\s\d\.\:\,\-\_]+$/g, '');
		}
		//-----------------------------------------------------------------------------
		var data = { 'text' : text_pre, 'lang_from' : lang_from, 'lang_to' : lang_to, 'only_get_lang_src' : true };
		data.id_translate_session = Math.random();
		s3gt.wait_session[data.id_translate_session] = function(data) {
			s3gt.translate.speech_fly_response(text, data.result.lang_from, tooltip, tooltip_sound);
		}
		s3gt.translate.google_request(data);
		return;
	}
	//-----------------------------------------------------------------------------------
	if (lang_from_pre) {
		s3gt.translate.speech_fly_response(text, lang_from_pre, tooltip, tooltip_sound);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.speech_fly_response = function(text, lang_from, tooltip, tooltip_sound) {
	if (! tooltip) { return; }
	if (! tooltip_sound) { return; }

	tooltip_sound.setAttribute('is_sound_off', true);
	tooltip_sound.setAttribute('title', tooltip_sound.getAttribute('title_stop'));
	tooltip.sound_play = true;
	s3gt.sound.play_tts(lang_from, text, { 'sound_stop' : function() {
		setTimeout(function(){
			tooltip.sound_play = false;
			tooltip_sound.removeAttribute('is_sound_off');
			tooltip_sound.setAttribute('title', tooltip_sound.getAttribute('title_play'));
		}, 200);
	} });
}
//-------------------------------------------------------------------------------------------
s3gt.translate.speech_custom_run = function(text, lang_from, lang_to) {
	s3gt.sound.play_off();
	var text_pre = text;
	if (text_pre.length > 200) {
		text_pre = text_pre.substr(Math.floor((Math.random()*(text.length-200))+1), 200);
		text_pre = text_pre.replace(/^\S+|\S+$/g, '');
		text_pre = text_pre.replace(/^[\s\d\.\:\,\-\_]+|[\s\d\.\:\,\-\_]+$/g, '');
	}
	//-----------------------------------------------------------------------------------
	var data = { 'text' : text_pre, 'lang_from' : lang_from, 'lang_to' : lang_to, 'only_get_lang_src' : true };
	data.id_translate_session = Math.random();
	s3gt.wait_session[data.id_translate_session] = function(data) {
		s3gt.sound.play_tts(data.result.lang_from, text);
	}
	s3gt.translate.google_request(data);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.response_fly = function(data, tooltip) {
	//-----------------------------------------------------------------------------------
	if (tooltip.id_translate_session != data.id_translate_session) { return; }
	if (! tooltip.thtml)  { return; }

	//-----------------------------------------------------------------------------------
	if (! data.is_translate_reverse) {
		s3gt.tooltip.create_panel(tooltip, data.result.lang_from, data.lang_to, { 'create_panel' : function() { s3gt.translate.response_fly_func(data, tooltip); } });
	} else {
		s3gt.translate.response_fly_func(data, tooltip);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.response_fly_func = function(data, tooltip) {
	if (tooltip.id_translate_session != data.id_translate_session) { return; }
	//-----------------------------------------------------------------------------------
	if (data.result.is_ok) {
		if (data.is_translate_reverse) {
			if (tooltip.is_lowercase_reverse) {
				data.result.text = data.result.text.toLowerCase();
			}
		} else if (tooltip.is_lowercase_to) {
			data.result.text = data.result.text.toLowerCase();
		}
	} else {
		data.result.text = data.result.response_error;
	}
	//-----------------------------------------------------------------------------------
	if (data.is_translate_reverse) {
		s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box'), false);
		var txt_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse');
		txt_reverse.set_translate(data.result);
		s3gt.tooltip.set_flag_txt(tooltip, 'reverse', data.lang_to);
		data.result.lang_reverse = data.lang_to;
		tooltip.last_result_reverse = data.result;
	} else {
		s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box'), false);
		tooltip.translate_text = data.result.text;
	
		var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
		txt_to.set_translate(data.result);
		s3gt.tooltip.set_flag_txt(tooltip, 'from', data.result.lang_from);
		s3gt.tooltip.set_flag_txt(tooltip, 'to', data.lang_to);
		tooltip.last_result = data.result;
		if (tooltip.view_reverse_translate_tooltip) {
			s3gt.tooltip.translate_reverse(null, tooltip);
		}
		//----------------------------------------------------------------------------
		if (data.run_speech_source) {
			if (data.result.detected_lang_from == data.lang_to) {
				s3gt.tooltip.sound_play(tooltip, 'to');
			} else {
				s3gt.tooltip.sound_play(tooltip, 'from');
			}
		}
	}

	s3gt.tooltip.set_work_data(tooltip);

	return true;
}
//-------------------------------------------------------------------------------------------
s3gt.translate.clear_fly_last_text = function() {
	s3gt.translate.fly_last_text = '';
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_text_short = function(text_list, lang_from, lang_to, func) {
	var data = { 'text_list' : text_list, 'lang_from' : lang_from, 'lang_to' : lang_to };
	data.id_translate_session = Math.random();
	s3gt.wait_session[data.id_translate_session] = function(result) {
		if (result.jrsp) {
			func(result.jrsp);
		}
	}
	chrome.runtime.sendMessage({ 'google_request_text_short': true, 'data' : data });
}
//-------------------------------------------------------------------------------------------
s3gt.translate.go_google = function(text, lang_from, lang_to) {
	var url = (text) ? s3gt.work_data.url_google_site_text : s3gt.work_data.url_google_site;
	url = url.replace("LANG_FROM", lang_from);
	url = url.replace("LANG_TO", lang_to);

	url += s3gt.utils.urlencode(text);

	chrome.runtime.sendMessage({ 'open_url': true, 'url' : url, 'pos_after_active' : true });
}
//-------------------------------------------------------------------------------------------
