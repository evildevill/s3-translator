var s3gt = {};
s3gt.current_tab_id = 0;
s3gt.key_ctrl_is_pressed = false;
s3gt.current_tab_domain = '';

//------------------------------------------------------------------------------
s3gt.init_0 = function() {
	document.getElementById('translate_allpages_auto').addEventListener("click", function() { s3gt.translate_allpages_auto(); });
	document.getElementById('translate_learning').addEventListener("click", function() { s3gt.translate_learning(); });
	document.getElementById('translate_go_google').addEventListener("click", function() { s3gt.translate_go_google(); });
	document.getElementById('s3gt_donate').addEventListener("click", function() { s3gt.translate_go_donate(); });

	document.getElementById('s3gt_settings').addEventListener("click", s3gt.open_options_window);
	//------------------------------------------------------------------------
	window.addEventListener("keydown", function(event) { 
		if (event.which == "17") {
			s3gt.key_ctrl_is_pressed = true;
		}
	}, true);
	window.addEventListener("keyup", function() { s3gt.key_ctrl_is_pressed = false; }, true);
	//------------------------------------------------------------------------
	s3gt.prefs.init(function(){
		s3gt.utils.i18n_parse(document);
		s3gt.init();
	});
}
//------------------------------------------------------------------------------
s3gt.init = function() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		s3gt.current_tab_id = tabs[0].id;
		s3gt.current_tab_domain = s3gt.utils.get_url_domain(tabs[0].url);
		var translate_hidden = (/^https?\:\/\/.*/.test(tabs[0].url)) ? false : true;

		chrome.tabs.executeScript(s3gt.current_tab_id, { 'file': '/content/tab_check.js', 'runAt' : 'document_start' }, function(callback) {
			//-----------------------------------------------------------
			if (chrome.runtime.lastError || translate_hidden) {
				document.getElementById('translate_page').setAttribute('is_inactive', true);
				document.getElementById('translate_auto').setAttribute('is_hidden', true);
				document.getElementById('translate_forget').setAttribute('is_hidden', true);
				document.getElementById('translate_custom').setAttribute('is_inactive', true);
				document.getElementById('translate_clipboard').setAttribute('is_inactive', true);
			}
			//-----------------------------------------------------------
			else {
				document.getElementById('translate_auto').removeAttribute('is_hidden', true);
				document.getElementById('translate_page').addEventListener("click", function() { s3gt.action('translate_page'); });
				document.getElementById('translate_auto').addEventListener("click", function() { s3gt.translate_auto(); });
				document.getElementById('translate_forget').addEventListener("click", function() { s3gt.translate_forget(); });
				document.getElementById('translate_custom').addEventListener("click", function() { s3gt.action('translate_custom'); });
				document.getElementById('translate_clipboard').addEventListener("click", function() { s3gt.action('translate_clipboard'); });
			}
			//-----------------------------------------------------------
			if (translate_hidden) {
				document.getElementById('translate_page_google').setAttribute('is_inactive', true);
			} else {
				document.getElementById('translate_page_google').addEventListener("click", function() { s3gt.action('translate_page_google'); });
			}

			//-----------------------------------------------------------
			//-----------------------------------------------------------
			s3gt.translate_allpages_auto_check();
			s3gt.translate_auto_set();
			s3gt.translate_auto_check();
			s3gt.translate_forget_check();
			s3gt.translate_learning_check();
			s3gt.translate_selection_check();
			s3gt.action_button_check(translate_hidden);
		});
	});
}
//------------------------------------------------------------------------------
s3gt.action_button_check = function(translate_hidden) {
	var action_button = s3gt.utils.prefs_get('action_button_click_icon');
	if (action_button == 'menu') {
	} else if (action_button == 'go_google') {
		s3gt.translate_go_google();
	} else if (! translate_hidden) {
		s3gt.action(action_button);
	}
}
//------------------------------------------------------------------------------
s3gt.action = function(method, no_close) {
	if ((method == 'translate_page') && s3gt.key_ctrl_is_pressed) {
		method = 'translate_page_google';
	}
	chrome.runtime.sendMessage({ 'translate_action' : true, 'method' : method, 'tabId' : s3gt.current_tab_id }, function(response) {
		if (! no_close) {
			window.close();
		}
	});
}
//------------------------------------------------------------------------------
s3gt.translate_allpages_auto_check = function() {
	if (s3gt.utils.prefs_get('autotranslate_allpages')) {
		document.getElementById('translate_allpages_auto').setAttribute('is_enable', true);
	} else {
		document.getElementById('translate_allpages_auto').removeAttribute('is_enable');
	}
}
//------------------------------------------------------------------------------
s3gt.translate_allpages_auto = function() {
	s3gt.pref_save('autotranslate_allpages', ! s3gt.utils.prefs_get('autotranslate_allpages'), s3gt.translate_allpages_auto_check);
}
//------------------------------------------------------------------------------
s3gt.translate_auto_set = function() {
	s3gt.utils.HTMLDOM_value(document.getElementById('translate_auto'), s3gt.utils.get_string('message.auto.translate.domain') + ' ' + s3gt.current_tab_domain);
	if ((s3gt.utils.prefs_get("autotranslate", 'check') == 'stop') || (s3gt.utils.prefs_get("autotranslate", 'check') == 'run')) {
		document.getElementById('translate_auto').setAttribute('is_hidden', true);
	}
}
//------------------------------------------------------------------------------
s3gt.translate_auto_check = function() {
	if (s3gt.utils.check_domain_translate(s3gt.current_tab_domain, true)) {
		document.getElementById('translate_auto').setAttribute('is_enable', true);
	} else {
		document.getElementById('translate_auto').removeAttribute('is_enable');
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate_auto = function() {
	var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
	var run_translate_page = false;

	if (document.getElementById('translate_auto').hasAttribute('is_enable')) {
		if (domain_translate_list[s3gt.current_tab_domain]) {
			domain_translate_list[s3gt.current_tab_domain].always_domain_translate = false;
		}
	} else {
		if (! domain_translate_list[s3gt.current_tab_domain]) { domain_translate_list[s3gt.current_tab_domain] = {}; }
		if ((s3gt.utils.prefs_get("autotranslate", 'check') != 'stop') && (s3gt.utils.prefs_get("autotranslate", 'check') != 'not-ask')) {
			domain_translate_list[s3gt.current_tab_domain].always_domain_question = false;
		}
		domain_translate_list[s3gt.current_tab_domain].always_domain_translate = true;
		run_translate_page = true;
	}
	s3gt.pref_save('domain_translate_list', domain_translate_list, function(){
		s3gt.translate_auto_check();
		s3gt.translate_forget_check();
		if (run_translate_page) {
			s3gt.action('translate_page', true);
		}
	});
}
//------------------------------------------------------------------------------
s3gt.translate_forget_check = function() {
	var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
	if (domain_translate_list[s3gt.current_tab_domain]) {
		document.getElementById('translate_forget').removeAttribute('is_hidden', true);
	} else {
		document.getElementById('translate_forget').setAttribute('is_hidden', true);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate_forget = function() {
	var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');

	if (domain_translate_list[s3gt.current_tab_domain]) {
		delete domain_translate_list[s3gt.current_tab_domain];
	}
	s3gt.pref_save('domain_translate_list', domain_translate_list, function(){
		s3gt.translate_auto_check();
		s3gt.translate_forget_check();
	});
}
//------------------------------------------------------------------------------
s3gt.translate_learning_check = function() {
	if (s3gt.utils.prefs_get('learning_lang_to') == 'auto') {
		document.getElementById('translate_learning').setAttribute('is_hidden', true);
		document.getElementById('translate_learning_separator').setAttribute('is_hidden', true);
	}

	if (s3gt.utils.prefs_get('learning_enable')) {
		document.getElementById('translate_learning').setAttribute('is_enable', true);
	} else {
		document.getElementById('translate_learning').removeAttribute('is_enable');
	}
}
//------------------------------------------------------------------------------
s3gt.translate_learning = function() {
	s3gt.pref_save('learning_enable', ! s3gt.utils.prefs_get('learning_enable'), s3gt.translate_learning_check);
}
//------------------------------------------------------------------------------
s3gt.translate_selection_check = function() {
	chrome.tabs.sendMessage(s3gt.current_tab_id, { 'translate_selection_check' : true }, function(response) {
		if (chrome.runtime.lastError) {};
		if (response && response.success) {
			document.getElementById('translate_selection').removeAttribute('is_inactive');
			document.getElementById('translate_selection_sound').removeAttribute('is_inactive');
			document.getElementById('translate_selection').addEventListener("click", function() { s3gt.action('translate_selection'); });
			document.getElementById('translate_selection_sound').addEventListener("click", function() { s3gt.action('translate_selection_sound'); });
		}
	});
}
//------------------------------------------------------------------------------
s3gt.translate_go_google = function() {
	chrome.runtime.sendMessage({ 'go_google': true, 'tab_id' : s3gt.current_tab_id }, function(response) {
		window.close();
	});
}
//------------------------------------------------------------------------------
s3gt.translate_go_donate = function() {
	chrome.runtime.sendMessage({ 'go_donate': true, 'tab_id' : s3gt.current_tab_id }, function(response) {
		window.close();
	});
}
//------------------------------------------------------------------------------
s3gt.pref_save = function(pref_name, pref_value, callback) {
	chrome.runtime.sendMessage({ 'action_prefs_set': true, 'pref_name' : pref_name, 'pref_value': pref_value }, function(response) {
		s3gt.utils.prefs_set(pref_name, pref_value);
		if (callback) { callback(); }
	});
}
//------------------------------------------------------------------------------
s3gt.open_options_window = function() {
	chrome.runtime.sendMessage({ 'action_open_settings': true }, function(response) {
		window.close();
	});
}
//------------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		//------------------------------------------------------------------
		if (! request) { return; }
		if (! request.action) { return; }

		//------------------------------------------------------------------
		if (request.action == 'capture_page_start') {
			s3gt.prepare_start_text();
		}
		//------------------------------------------------------------------
		else if ((request.action == 'capture_page') || (request.action == 'capture_page_drawWindow')) {
			if (! s3gt.action_canceled) {
				s3gt.prepare_start_text();
				document.getElementById('s3gt_action_prepare_percent').textContent = parseInt(request.complete * 100) + '%';
			}
		}
		//------------------------------------------------------------------
		else if (request.action == 'capture_page_end') {
			window.close();
		}
	}
);
//------------------------------------------------------------------------------
window.addEventListener("load", s3gt.init_0);
