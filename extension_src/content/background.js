var s3gt = {};
s3gt.notification_list = {};

s3gt.context_menu_timer = null;
s3gt.work_data = {};
s3gt.protocol_google_translator = 'https://';
s3gt.domain_google_translator = 'translate.google.com';

//------------------------------------------------------------------------------
s3gt.init = function() {
	s3gt.prefs.init(function(){
		s3gt.work_data.current_id = s3gt.utils.random_string(8);
		s3gt.work_data.tab_id_scp = {};
		//-----------------------------------------------------------------
		if (s3gt.utils.prefs_get('translate_box_restore_restart')) {
			s3gt.work_data.tooltip = s3gt.utils.prefs_get("work_data_tooltip");
			var tooltip_list_tmp = [];
			for (var i=0; i<s3gt.work_data.tooltip.length; i++) {
				var tooltip = s3gt.work_data.tooltip[i];
				if (tooltip.translate_tooltip_pin == 'alltabs') {
					tooltip_list_tmp.push(tooltip);
				}
			}
			s3gt.work_data.tooltip = tooltip_list_tmp;
		} else {
			s3gt.work_data.tooltip = [];
		}
		s3gt.utils.prefs_set('work_data_tooltip', s3gt.work_data.tooltip);

		//-----------------------------------------------------------------
		s3gt.work_data.url_extension = chrome.runtime.getURL('/').replace(/\/+$/, '');
		s3gt.work_data.go_donate = 'https://www.s3blog.org/addon-contribute/s3-translator.html?donate';
		//-----------------------------------------------------------------
		if (s3gt.utils.prefs_get("is_first_run")) {
			s3gt.utils.prefs_set("is_first_run", false);
			chrome.runtime.openOptionsPage();
		}
		//-----------------------------------------------------------------
		s3gt.init_domain_google_translator(function(){
			chrome.contextMenus.create({
				id: 's3gt_browser_action_translate_page',
				type : 'normal',
				title : s3gt.utils.get_string('translate.page'),
				contexts: ["browser_action"],
				onclick: function(event){ s3gt.context_browser_action_click(event); }
			});
			chrome.contextMenus.create({
				id: 's3gt_browser_action_translate_learning',
				type : 'checkbox',
				title : s3gt.utils.get_string('preference.tab.learning'),
				contexts: ["browser_action"],
				onclick: function(event){ s3gt.context_browser_action_click(event); }
			});
			chrome.contextMenus.create({
				id: 's3gt_browser_action_translate_allpages_auto',
				type : 'checkbox',
				title : s3gt.utils.get_string('translate.allpages_auto').replace(/\n/g, ' ').replace(/\s+/g, ' '),
				contexts: ["browser_action"],
				onclick: function(event){ s3gt.context_browser_action_click(event); }
			});
			chrome.contextMenus.create({
				id: 's3gt_browser_action_go_google',
				type : 'normal',
				title : s3gt.utils.get_string('translate.go.google'),
				contexts: ["browser_action"],
				onclick: function(event){ s3gt.context_browser_action_click(event); }
			});
			chrome.contextMenus.create({
				id: 's3gt_browser_action_settings',
				type : 'normal',
				title : s3gt.utils.get_string('preference.label'),
				contexts: ["browser_action"],
				onclick: function(event){ chrome.runtime.openOptionsPage(); }
			});
		});
	});
}
//------------------------------------------------------------------------------
s3gt.init_main_data = function(changeInfo, tab_id) {
//	if (changeInfo && (changeInfo.status === undefined)) { return; }
	if (changeInfo && (changeInfo.status !== 'loading')) { return; }
//	if (changeInfo && (changeInfo.status !== 'complete')) { return; }

	if (changeInfo && (changeInfo.source == 'webNavigation')) {
		if (! changeInfo.frame_id) { return; }
		s3gt.set_content_scripts(changeInfo.tab_id, changeInfo.frame_id, function(tab_id) {
			chrome.tabs.sendMessage(tab_id, { 'action' : 'set_work_data', 'work_data' : s3gt.work_data, 'prefs_list' : s3gt.prefs.list, 'frame_id' : changeInfo.frame_id }, { 'frameId' : changeInfo.frame_id }, function(response) { if (chrome.runtime.lastError) {}; });
		});
		return;
	}

	//------------------------------------------------------------------------
	var init_main_data_sub = function(tab_list) {
		if (tab_list && tab_list.length) {
			for (var i in  tab_list) {
				if (tab_list[i].id && ((tab_id === undefined) || (tab_list[i].id == tab_id))) {
					s3gt.set_content_scripts(tab_list[i].id, 0, function(tab_id) {
						chrome.tabs.sendMessage(tab_id, { 'action' : 'set_work_data', 'work_data' : s3gt.work_data, 'prefs_list' : s3gt.prefs.list }, { 'frameId' : 0 }, function(response) { if (chrome.runtime.lastError) {}; });
						chrome.tabs.sendMessage(tab_id, { 'action' : 'set_prefs_list', 'prefs_list' : s3gt.prefs.list }, function(response) { if (chrome.runtime.lastError) {}; });
						//----------------------------------------
						chrome.webNavigation.getAllFrames({ 'tabId' : tab_id }, function(frame_list) {
							if (frame_list) {
								for (var f=0; f<frame_list.length; f++) {
									if (frame_list[f].frameId) {
										s3gt.init_main_data({ 'status' : 'loading' , 'source' : 'webNavigation', 'tab_id' : tab_id, 'frame_id' : frame_list[f].frameId }, tab_id);
									}
								}
							}
						});
						//----------------------------------------
					});
				}
			}
		}
	}
	//------------------------------------------------------------------------
	if (tab_id) {
		chrome.tabs.get(tab_id, function(tab_list) { init_main_data_sub([tab_list]); });
	} else {
		chrome.tabs.query({  active: true }, function(tab_list) { init_main_data_sub(tab_list); });
	}

	s3gt.context_menu_init_timer();
}
//------------------------------------------------------------------------------
s3gt.set_content_scripts = function(tab_id, frame_id, callback, set_all_script) {
	if (tab_id <= 0) { return; }
	chrome.tabs.sendMessage(tab_id, { check_content: true }, { 'frameId' : frame_id }, function(response) {
		if (chrome.runtime.lastError) {
		} else if (response && response.success) {
			if (callback) {
				callback(tab_id);
			}
			return;
		}

		var js_list = (set_all_script) ?
			[ "/content/s3gt_main.js", "/content/action.js", "/content/translate.js", "/content/learning.js", "/content/hotkeys.js", "/content/tooltip.js", "/content/thtml.js", "/content/i18n.js", "/content/sound.js", "/content/utils.js", "/content/prefs.js" ]
			:
			[ "/content/tab_loader.js" ];

		var executeScript = function(js_list) {
			var js_file = js_list.shift();
			var data = {};
			data.file = js_file;
			if (frame_id) {
				data.matchAboutBlank= true;
				data.frameId = frame_id;
			}
			if (set_all_script) {
				data.runAt = 'document_start';
			}
			chrome.tabs.executeScript(tab_id, data, function() {
				if (chrome.runtime.lastError) {}
				if (js_list.length > 0) {
					executeScript(js_list);
				} else if (callback) {
					callback(tab_id);
				}
			});
		}
		executeScript(js_list);
	 });
}
//------------------------------------------------------------------------------
s3gt.context_menu_init_timer = function() {
	if (s3gt.context_menu_timer) {
		clearTimeout(s3gt.context_menu_timer);
	}
	s3gt.context_menu_timer = setTimeout(function(){ s3gt.context_menu_init(); }, 500);
}
//------------------------------------------------------------------------------
s3gt.context_menu_init = function() {
	s3gt.context_menu_timer = null;
	//------------------------------------------------------------------------
	var menu_list = [ 
		{ 'type': 'normal', 'is_inactive' : true, 'pref' : 'context_menu_translate_page', 'id' : 'translate_page', 'title' : s3gt.utils.get_string('translate.page'),  },
		{ 'type': 'normal', 'is_inactive' : false, 'pref' : 'context_menu_translate_page_google', 'id' : 'translate_page_google', 'title' : s3gt.utils.get_string('translate.page.google'),  },
		{ 'type': 'checkbox', 'is_inactive' : true, 'pref' : 'context_menu_translate_auto', 'id' : 'translate_auto', 'title' : s3gt.utils.get_string('translate.auto') },
		{ 'type': 'normal', 'is_inactive' : true, 'pref' : 'context_menu_translate_forget', 'id' : 'translate_forget', 'title' : s3gt.utils.get_string('translate.forget') },

		{ 'type': 'separator', 'pref' : 'context_menu_translate_allpages_auto_separator', 'id' : 'menu_allpages_auto_separator' },
		{ 'type': 'checkbox', 'is_inactive' : false, 'pref' : 'context_menu_translate_allpages_auto', 'id' : 'translate_allpages_auto', 'title' : s3gt.utils.get_string('translate.allpages_auto') },

		{ 'type': 'separator', 'pref' : 'context_menu_translate_learning_separator', 'id' : 'menu_learning_separator' },
		{ 'type': 'checkbox', 'is_inactive' : false, 'pref' : 'context_menu_translate_learning', 'id' : 'translate_learning', 'title' : s3gt.utils.get_string('preference.tab.learning') },

		{ 'type': 'separator', 'pref' : 'context_menu_translate_text_separator', 'id' : 'menu_text_separator' },
		{ 'type': 'normal', 'is_inactive' : true, 'pref' : 'context_menu_translate_clipboard', 'id' : 'translate_clipboard', 'title' : s3gt.utils.get_string('translate.clipboard') },
		{ 'type': 'normal', 'is_inactive' : true, 'pref' : 'context_menu_translate_custom', 'id' : 'translate_custom', 'title' : s3gt.utils.get_string('translate.custom') },
		{ 'type': 'normal', 'is_inactive' : false, 'pref' : 'context_menu_translate_selection', 'id' : 'translate_selection', 'title' : s3gt.utils.get_string('translate.selection') },
		{ 'type': 'normal', 'is_inactive' : true, 'pref' : 'context_menu_translate_selection_sound', 'id' : 'translate_selection_sound', 'title' : s3gt.utils.get_string('translate.button.sound.play') },

		{ 'type': 'separator', 'pref' : 'context_menu_translate_go_google_separator', 'id' : 'menu_go_google_separator' },
		{ 'type': 'normal', 'is_inactive' : false, 'pref' : 'context_menu_translate_go_google', 'id' : 'translate_go_google', 'title' : s3gt.utils.get_string('translate.go.google') },

		{ 'type': 'separator', 'pref' : 'context_menu_translate_settings_separator', 'id' : 'menu_settings_separator' },
		{ 'type': 'normal', 'is_inactive' : false, 'pref' : 'context_menu_translate_settings', 'id' : 's3gt_settings', 'title' : s3gt.utils.get_string('preference.label') }
	];
	//------------------------------------------------------------------------
	var menu_list_ary = [];
	//------------------------------------------------------------------------
	for (var i=0; i<menu_list.length; i++) {
		menu_list_ary.push(menu_list[i].id);
	}
	//------------------------------------------------------------------------
	s3gt.context_menu_remove(menu_list_ary, function(){ s3gt.context_menu_set(menu_list); });
}
//------------------------------------------------------------------------------
s3gt.context_menu_remove = function(menu_list, callback) {
	var menu_id = menu_list.shift();

	try {
		chrome.contextMenus.remove(menu_id, function(){
			if (chrome.runtime.lastError) {};
			if (menu_list.length > 0) {
				s3gt.context_menu_remove(menu_list, callback);
			} else if (callback) {
				callback();
			}
		});
	} catch(e) {
		if (menu_list.length > 0) {
			s3gt.context_menu_remove(menu_list, callback);
		} else if (callback) {
			callback();
		}
	}
}
//------------------------------------------------------------------------------
s3gt.context_menu_set = function(menu_list) {
	//------------------------------------------------------------------------
	chrome.contextMenus.update('s3gt_browser_action_translate_learning', { 'checked' : s3gt.utils.prefs_get('learning_enable') });
	chrome.contextMenus.update('s3gt_browser_action_translate_allpages_auto', { 'checked' : s3gt.utils.prefs_get('autotranslate_allpages') });
	//------------------------------------------------------------------------
	chrome.tabs.query({  active: true, currentWindow: true }, function(tab_list) {
		if (tab_list && tab_list.length && tab_list[0].id) {
			var current_tab_domain = s3gt.utils.get_url_domain(tab_list[0].url);
			var translate_hidden = (/^https?\:\/\/.*/.test(tab_list[0].url)) ? false : true;
			var is_create_separator = false;
			//-----------------------------------------------------------
			chrome.tabs.executeScript(tab_list[0].id, { 'file' : '/content/tab_check.js', 'runAt' : 'document_start' }, function(callback) {
				var menu_is_active = ! translate_hidden;
				//-----------------------------------------------------
				if (chrome.runtime.lastError) {
					menu_is_active = false;
				}
				//-----------------------------------------------------
				for (var i=0; i<menu_list.length; i++) {
					var menu = menu_list[i];
					//-----------------------------------------------
					if (! s3gt.utils.prefs_get(menu.pref)) {
						continue;
					}
					//-----------------------------------------------
					var context_list = ['page', 'frame', 'image', 'video', 'audio' ];
					if ((menu.id == 'translate_selection') || (menu.id == 'translate_selection_sound')) {
						context_list = ['selection'];
					}
					//-----------------------------------------------
					if (menu.type == 'separator') {
						if (! is_create_separator) { continue; }
						//-----------------------------------------
						if (menu.id == 'menu_learning_separator') {
							if (s3gt.utils.prefs_get('learning_lang_to') == 'auto') {
								continue;
							}
						}
						//-----------------------------------------
						chrome.contextMenus.create({
							id: menu.id,
							type : menu.type,
//							parentId: 's3gt_context_popup',
							contexts: context_list
						}, function(){ if (chrome.runtime.lastError) {}; });
						is_create_separator = false;
					}
					//-----------------------------------------------
					else {
						var menu_data = {
							id: menu.id,
							type : menu.type,
							title : menu.title.replace(/\n/g, ' ').replace(/\s+/g, ' '),
//							parentId: 's3gt_context_popup',
							contexts: context_list,
							enabled: (! menu_is_active && menu.is_inactive) ? false : true,
							onclick: function(event){ s3gt.context_menu_click(event, tab_list[0].id, current_tab_domain); }
						};
						//-----------------------------------------
						if (menu.id == 'translate_page') {
							menu_data.enabled = ! translate_hidden;
						}
						//-----------------------------------------
						else if (menu.id == 'translate_page_google') {
							menu_data.enabled = ! translate_hidden;
						}
						//-----------------------------------------
						else if (menu.id == 'translate_allpages_auto') {
							menu_data.checked = s3gt.utils.prefs_get('autotranslate_allpages');
						}
						//-----------------------------------------
						else if (menu.id == 'translate_auto') {
							if (menu_is_active) {
								menu_data.checked = s3gt.utils.check_domain_translate(current_tab_domain, true);
							} else {
								continue;
							}
							menu_data.title = s3gt.utils.get_string('message.auto.translate.domain') + ' ' + current_tab_domain;
						}
						//-----------------------------------------
						else if (menu.id == 'translate_forget') {
							if (menu_is_active) {
								var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
								if (! domain_translate_list[current_tab_domain]) {
									continue;
								}
							} else {
								continue;
							}
						}
						//-----------------------------------------
						else if (menu.id == 'translate_learning') {
							if (s3gt.utils.prefs_get('learning_lang_to') == 'auto') {
								continue;
							} else {
								menu_data.checked = s3gt.utils.prefs_get('learning_enable');
							}
						}
						//-----------------------------------------
						chrome.contextMenus.create(menu_data, function(){ if (chrome.runtime.lastError) {}; });
						is_create_separator = true;
					}
					//-----------------------------------------------
				}
			});
		}
	});
}
//------------------------------------------------------------------------------
s3gt.context_browser_action_click = function(event) {
	//------------------------------------------------------------------------
	chrome.tabs.query({  active: true, currentWindow: true }, function(tab_list) {
		if (tab_list && tab_list.length && tab_list[0].id) {
			var current_tab_domain = s3gt.utils.get_url_domain(tab_list[0].url);
			var tab_id = tab_list[0].id;
			var event_new = { 'checked' : event.checked };
			//-----------------------------------------------------------
			if (event.menuItemId == 's3gt_browser_action_translate_page') {
				event_new.menuItemId = 'translate_page';
				s3gt.context_menu_click(event_new, tab_id, current_tab_domain);
			} else if (event.menuItemId == 's3gt_browser_action_translate_learning') {
				event_new.menuItemId = 'translate_learning';
				s3gt.context_menu_click(event_new, tab_id, current_tab_domain);
			} else if (event.menuItemId == 's3gt_browser_action_translate_allpages_auto') {
				event_new.menuItemId = 'translate_allpages_auto';
				s3gt.context_menu_click(event_new, tab_id, current_tab_domain);
			} else if (event.menuItemId == 's3gt_browser_action_go_google') {
				event_new.menuItemId = 'translate_go_google';
				s3gt.context_menu_click(event_new, tab_id, current_tab_domain);
			}
		}
	});
}
//------------------------------------------------------------------------------
s3gt.context_menu_click = function(event, tab_id, current_tab_domain) {
	var action_id = event.menuItemId;
 
	//------------------------------------------------------------------------
	if (action_id == 'translate_page_google') {
		s3gt.translate.page_google(tab_id);
	}
	//------------------------------------------------------------------------
	else if (action_id == 'translate_auto') {
		var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
		//------------------------------------------------------------------
		if (event.checked) {
			if (! domain_translate_list[current_tab_domain]) { domain_translate_list[current_tab_domain] = {}; }
			if ((s3gt.utils.prefs_get("autotranslate", 'check') != 'stop') && (s3gt.utils.prefs_get("autotranslate", 'check') != 'not-ask')) {
				domain_translate_list[current_tab_domain].always_domain_question = false;
			}
			domain_translate_list[current_tab_domain].always_domain_translate = true;
			s3gt.utils.prefs_set('domain_translate_list', domain_translate_list);
			s3gt.translate_action('translate_page', tab_id, event.selectionText);
		} else {
			if (domain_translate_list[current_tab_domain]) {
				domain_translate_list[current_tab_domain].always_domain_translate = false;
			}
			s3gt.utils.prefs_set('domain_translate_list', domain_translate_list);
		}
	}
	//------------------------------------------------------------------------
	else if (action_id == 'translate_forget') {
		var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
		//------------------------------------------------------------------
		if (domain_translate_list[current_tab_domain]) {
			delete domain_translate_list[current_tab_domain];
		}
		//------------------------------------------------------------------
		s3gt.utils.prefs_set('domain_translate_list', domain_translate_list)
	}
	//------------------------------------------------------------------------
	else if (action_id == 'translate_allpages_auto') {
		s3gt.utils.prefs_set('autotranslate_allpages', ! s3gt.utils.prefs_get('autotranslate_allpages'));
	}
	//------------------------------------------------------------------------
	else if (action_id == 'translate_learning') {
		s3gt.utils.prefs_set('learning_enable', ! s3gt.utils.prefs_get('learning_enable'));
	}
	//------------------------------------------------------------------------
	else if (action_id == 'translate_go_google') {
		s3gt.open_url(s3gt.work_data.url_google_site, tab_id, true);
	}
	//------------------------------------------------------------------------
	else if (action_id == 's3gt_settings') {
		chrome.runtime.openOptionsPage();
	}
	//------------------------------------------------------------------------
	else {
		s3gt.translate_action(action_id, tab_id, event.selectionText);
	}
	//------------------------------------------------------------------------
	s3gt.context_menu_init();
}
//------------------------------------------------------------------------------
s3gt.translate_action = function(action, tab_id, selection_text) {
	chrome.tabs.sendMessage(tab_id, { 'action' : 'set_prefs_list', 'prefs_list' : s3gt.prefs.list }, function(response) {
		if (chrome.runtime.lastError) {};

		chrome.tabs.sendMessage(tab_id, { 'action' : action, 'work_data' : s3gt.work_data, 'selection_text' : selection_text }, { 'frameId' : 0 }, function(response) {
			if (chrome.runtime.lastError || (! response)) {
				if (action == 'translate_page') {
					s3gt.translate.page_google(tab_id);
				}
				//----------------------------------------------------------
				else if (action == 'translate_selection') {
					var url = (selection_text) ? s3gt.work_data.url_google_site_text : s3gt.work_data.url_google_site;
					url = url.replace("LANG_FROM", s3gt.prefs.get_lang_from());
					url = url.replace("LANG_TO", s3gt.prefs.get_lang_to());
					url += s3gt.utils.urlencode(selection_text);
					//-----------------------------------------------
					if (s3gt.utils.prefs_get('translate_selection_impossible_target') == 'notifycation') {
						var data = { 'text' : selection_text, 'lang_from' : s3gt.prefs.get_lang_from(), 'lang_to' : s3gt.prefs.get_lang_to(), 'is_check_lang_pair' : true };
						data.callback = function(d) {
							var result_text = (d.result.is_ok) ? d.result.text : d.result.response_error;
							s3gt.utils.notification_box(result_text, null, url, true);
						};
						s3gt.translate.google_request(data);
					}
					//-----------------------------------------------
					else {
						s3gt.open_url(url, tab_id, true);
					}
				}
			}
		});
	});
}
//-----------------------------------------------------------------------------------
//-- this fix-code for Chinese users
//-----------------------------------------------------------------------------------
// Because of the GFW (https://en.wikipedia.org/wiki/Great_Firewall), unable to access google.com in China.
// But because of Google cooperating with Chinese companies, restored access google.cn in China
// But GWF is blocking google.cn translate SSL site.
// But google.cn non-SSL site is not stable.
//
// same for Italian and others country
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
s3gt.init_domain_google_translator = function(callback) {
	try {
		var domain_google_translator = s3gt.utils.prefs_get('domain_google_translator');
		if (! domain_google_translator) {
			var domain_google_properties = s3gt.utils.get_string('domain_google_translator');
			if (domain_google_properties == 'domain_google_translator') {
				domain_google_properties = '';
			}
			domain_google_translator = domain_google_properties || s3gt.domain_google_translator;
			s3gt.utils.prefs_set('domain_google_translator', domain_google_translator);
		}
		//-----------------------------------------------------------------------
		var tmp_domain_google_translator = s3gt.domain_google_translator;
		s3gt.domain_google_translator = domain_google_translator;
		s3gt.init_urls();
		s3gt.domain_google_translator = tmp_domain_google_translator;
		//-----------------------------------------------------------------------
		if (domain_google_translator && (domain_google_translator != s3gt.domain_google_translator)) {
			s3gt.protocol_google_translator = 'https://';

			s3gt.utils.check_google(
				'https://', 
				domain_google_translator, 
				function(status) {
					if (status) {
						s3gt.domain_google_translator = domain_google_translator;
					}
					s3gt.init_urls(callback, true);
				}, 
				function(status) {
					if (status) {
						s3gt.domain_google_translator = domain_google_translator;
						s3gt.protocol_google_translator = 'http://';
					}
					s3gt.init_urls(callback, true);
				}
			);
		}
		//-----------------------------------------------------------------------
		else {
			s3gt.init_urls(callback, true);
		}
	} catch(e) {
		s3gt.init_urls(callback, true);
	}
}
//-----------------------------------------------------------------------------------
s3gt.init_urls = function(callback, init_tk) {
	s3gt.work_data.protocol_google_translator = s3gt.protocol_google_translator;
	s3gt.work_data.domain_google_translator = s3gt.domain_google_translator;
	s3gt.work_data.url_translate_text = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/translate_a/single?client=gtx&sl=LANG_FROM&tl=LANG_TO&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&otf=2&srcrom=1&ssel=0&tsel=0&kc=1&tk=GOOGLE_TK&q=';
	s3gt.work_data.url_translate_text_short = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/translate_a/t?client=mt&sl=LANG_FROM&tl=LANG_TO&v=1.0&source=baf&tk=GOOGLE_TK';
	s3gt.work_data.url_google_site_off = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/#LANG_FROM/LANG_TO/';
	s3gt.work_data.url_google_site = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/';
	s3gt.work_data.url_google_site_text = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/#LANG_FROM/LANG_TO/';
	s3gt.work_data.url_sound_tts_google = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/translate_tts?ie=UTF-8&q=TEXT_REQ&tl=LANG&total=1&idx=0&textlen=TEXT_LENGTH&tk=GOOGLE_TK&client=webapp&prev=input';
	s3gt.work_data.url_translate_page = s3gt.domain_google_translator + '/translate_a/element.js?cb=googleTranslateElementInit&hl=LANG_TO';
	s3gt.work_data.url_translate_page_google_site = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/translate?sl=LANG_FROM&tl=LANG_TO&js=y&u=URL';

	s3gt.work_data.url_translate_text_batchexecute = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/_/TranslateWebserverUi/data/batchexecute?rpcids=GOOGLE_KEY&hl=LANG_TO&rt=c';
	s3gt.work_data.url_translate_text_batchexecute_short = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/_/TranslateWebserverUi/data/batchexecute?rpcids=GOOGLE_KEY&hl=LANG_TO&rt=c';
	s3gt.work_data.url_sound_tts_google_batchexecute = s3gt.protocol_google_translator + s3gt.domain_google_translator + '/_/TranslateWebserverUi/data/batchexecute?rpcids=GOOGLE_KEY&hl=LANG_TO&soc-app=1&soc-platform=1&soc-device=1&rt=c';

	s3gt.work_data.google_value_tk_newkey = 'MkEWBc';
	s3gt.work_data.google_value_tk_newkey_short = 'QShL0';
	s3gt.work_data.google_value_tk_newkey_sound = 'jQ1olc';

	if (init_tk) { s3gt.google_value_tk_init(); }
	if (callback) { callback(); }
}
//-----------------------------------------------------------------------------------
s3gt.google_value_tk_init = function() {
	s3gt.work_data.google_value_tk = s3gt.utils.prefs_get('google_value_tk');
	s3gt.google_value_tk_load();
}
//-----------------------------------------------------------------------------------
s3gt.google_value_tk_load = function(callback) {
	var req = new XMLHttpRequest();
	var url = s3gt.protocol_google_translator + s3gt.domain_google_translator + "/";
	var timeout_value = s3gt.utils.prefs_get('google_value_tk_timeout') || 2;
	var timeout = setTimeout( function(){ req.abort(); }, timeout_value * 1000);
	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			clearTimeout(timeout);
			if (req.status == 200) {
				s3gt.google_value_tk_parse(req.responseText, callback);
			}
		}
	};
	req.open("GET", url, true);
	req.setRequestHeader("x-accept", 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
	req.setRequestHeader("x-secfetchdest", 'document');
	req.setRequestHeader("x-secfetchsite", 'none');
	req.send(null);
}
//-----------------------------------------------------------------------------------
s3gt.google_value_tk_parse = function(responseText, callback) {
	//-----------------------------------------------------------------------------
	// verson 1
	// TKK=eval('((function(){var a\x3d4264492758;var b\x3d-1857761911;return 406375+\x27.\x27+(a+b)})())');
	//-----------------------------------------------------------------------------
	// verson 2
	// TKK='427233.3134777927';
	//-----------------------------------------------------------------------------
	var res = /;TKK=(.*?\'\));/i.exec(responseText);
	var result = '';
	//-----------------------------------------------------------------------------
	if (res == null) {
		//-----------------------------------------------------------------------
		// version 3
		//-----------------------------------------------------------------------
		res = /\,tkk\:(\'.*?\')/i.exec(responseText);
	}
	//-----------------------------------------------------------------------------
	if (res != null) {
		//-----------------------------------------------------------------------
		// verson 2
		//-----------------------------------------------------------------------
		if (/^\'\d+\.\d+/.test(res[1])) {
			var res2 = /^\'(\d+\.\d+)/i.exec(res[1]);
			if (res2 != null) {
				result = res2[1];
			}
		}
		//-----------------------------------------------------------------------
		// verson 1
		//-----------------------------------------------------------------------
		else {
			var res2 = /var a=(.*?);.*?var b=(.*?);.*?return (\d+)/i.exec(res[1].replace(/\\x3d/g, '='));
			if (res2 != null) {
				result = Number(res2[3]) + '.' + (Number(res2[1]) + Number(res2[2]));
			}
		}
	}
	//-----------------------------------------------------------------------------
	// for batchexecute
	//-----------------------------------------------------------------------------
	else {
		//-----------------------------------------------------------------------------
		// version 2
		//-----------------------------------------------------------------------------
		res = /https\:\\\/\\\/myactivity\.google\.com\\\/product\\\/google_translate\?utm_source\\x3dtranslate_web\'\,\'([^\']+)/i.exec(responseText);
		if (res != null) {
			result = 'ZZZ|||' + res[1];
		}
		//-----------------------------------------------------------------------------
		// version 1
		//-----------------------------------------------------------------------------
		if (res == null) {
			res = /https\:\\\/\\\/myactivity\.google\.com\\\/myactivity\?product\\x3d58\'\,\'([^\']+)/i.exec(responseText);
			if (res != null) {
				result = 'ZZZ|||' + res[1];
			} else {
				res = /https\:\\\/\\\/myactivity\.google\.com\\\/myactivity\?product\\x3d58\'\,\s*(null)/i.exec(responseText);
				if (res != null) {
					result = 'ZZZ|||';
				}
			}
		}
	}
	//-----------------------------------------------------------------------------
	//-----------------------------------------------------------------------------
	if (result) {
		s3gt.utils.prefs_set('google_value_tk', result);
		s3gt.work_data.google_value_tk = result;
		if (callback) {
			callback(s3gt.work_data.google_value_tk);
		}
	}
}
//-----------------------------------------------------------------------------------
s3gt.open_url = function(url, tab_id, pos_after_active) {
	if (pos_after_active && tab_id) {
		chrome.tabs.get(tab_id, function(tab) {
			chrome.tabs.create({ 'url' : url, 'active' : true, 'index' : tab.index+1 }, function(tab_new) { if (chrome.runtime.lastError) {} }); 
		});
	} else {
		chrome.tabs.create({ 'url' : url, active: true }, function(tab) { if (chrome.runtime.lastError) {} }); 
	}
}
//-----------------------------------------------------------------------------------
s3gt.send_work_data = function(tab_id) {
	s3gt.work_data.current_id = s3gt.utils.random_string(8);
	chrome.tabs.sendMessage(tab_id, { 'action' : 'set_work_data', 'work_data' : s3gt.work_data, 're_init' : true }, { 'frameId' : 0 }, function(response) { if (chrome.runtime.lastError) {}; });
}
//------------------------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { return s3gt.onMessage(request, sender, sendResponse); });
//------------------------------------------------------------------------------
s3gt.onMessage = function(request, sender, sendResponse) {
	//------------------------------------------------------------------------
	if (! request) { return; }
	//------------------------------------------------------------------------
	if (sender.tab) {
		request.tab_id = sender.tab.id;
	}
	else if (request.tabId) {
		request.tab_id = request.tabId;
	}
	//------------------------------------------------------------------------
	if (request.action_prefs_set && request.pref_name) {
		s3gt.utils.prefs_set(request.pref_name, request.pref_value);
		if (request.pref_name == 'current_locale') {
			s3gt.i18n.init(request.pref_value);
			s3gt.context_menu_init_timer();
			s3gt.send_work_data(request.tab_id);
		}
		else if (/^context_menu_/.test(request.pref_name)) {
			s3gt.context_menu_init_timer();
		}
		else if (request.pref_name == 'autotranslate_allpages') {
			s3gt.context_menu_init_timer();
		}
		else if (request.pref_name == 'learning_enable') {
			s3gt.context_menu_init_timer();
		}
		else if (request.pref_name == 'domain_translate_list') {
			s3gt.context_menu_init_timer();
		}
		else if (request.pref_name == 'list_disabled_lang_to') {
			s3gt.send_work_data(request.tab_id);
		}
		else if (request.pref_name == 'default_lang_to') {
			s3gt.prefs.init_lang_to();
			s3gt.send_work_data(request.tab_id);
		}
		else if (request.pref_name == 'domain_google_translator') {
			s3gt.init_domain_google_translator(function(){
				s3gt.send_work_data(request.tab_id);
			});
		}
		else if ((request.pref_name == 'autotranslate_allpages') && (request.pref_value)) {
			chrome.tabs.query({  active: true, currentWindow: true }, function(tab_list) {
				if (tab_list && tab_list.length && tab_list[0].id) {
					chrome.tabs.sendMessage(tab_list[0].id, { 'action' : 'translate_page_run', 'work_data' : s3gt.work_data }, function(response) { if (chrome.runtime.lastError) {} });
				}
			});
		}
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action_prefs_get) {
		sendResponse({ 'prefs_list' : s3gt.prefs.list });
	}
	//------------------------------------------------------------------------
	else if (request.action_reset_defaults) {
		s3gt.prefs.reset_defaults(function(){
			s3gt.i18n.init();
			s3gt.context_menu_init_timer();
		});
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.save_settings) {
		var result = [];
		//------------------------------------------------------------------
		var prefs_list = s3gt.utils.clone_object(s3gt.prefs.list);
		var exclude_prefs = { 'current_version' : 1,	'not_open_contribute_page' : 1, 'is_first_run' : 1, 'show_page_timer' : 1, 'work_data_tooltip' : 1, 'google_value_tk' : 1, 'google_value_tk_timeout' : 1, '_end' : 1 };
		//------------------------------------------------------------------
		for (var pref_name in prefs_list) {
			if (exclude_prefs[pref_name]) { continue; }
		 	//------------------------------------------------------------
			if (typeof(prefs_list[pref_name]) == 'object') {
				result.push(pref_name + '='  + JSON.stringify(prefs_list[pref_name]));
			} else if (typeof(prefs_list[pref_name]) == 'array') {
				result.push(pref_name + '='  + JSON.stringify(prefs_list[pref_name]));
			} else {
				result.push(pref_name + '='  + prefs_list[pref_name]);
			}
		}
	 	//-------------------------------------------------------------------
		var result_txt = result.join("\n") + "\n";
	 	//-------------------------------------------------------------------
		if (request.mode == "copy") {
			s3gt.utils.copy_clipboard(result_txt, '', true);
			s3gt.utils.notification_box(s3gt.utils.get_string('message.settings.copied'));
		}
	 	//-------------------------------------------------------------------
		else if(request.mode == "save") {
			var blob1 = new Blob([result_txt], { type: "text/plain" });
			var result_url = URL.createObjectURL(blob1);
			var date = new Date();
			var dd = date.getDate(); if (dd < 10) { dd = '0' + dd; }
			var mm = date.getMonth() + 1; if (mm < 10) { mm = '0' + mm; }
			var hh = date.getHours(); if (hh < 10) { hh = '0' + hh; }
			var mn = date.getMinutes(); if (mn < 10) { mn = '0' + mn; }
			var ss = date.getSeconds(); if (ss < 10) { ss = '0' + ss; }

			var filename = 'S3Translator.' + date.getFullYear() + '.' + mm + '.'  + dd + '.'  + hh + '.'  + mn + '.'  + ss + '.txt';
	
			chrome.downloads.download({
				url: result_url,
				filename: filename,
				saveAs: true
			}, function (downloadId) {
			});
		}
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action_open_settings) {
		chrome.runtime.openOptionsPage();
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.action_get_strings && request.string_list) {
		for (var i in request.string_list) {
			request.string_list[i] = s3gt.utils.get_string(i);
		}
		sendResponse({ 'string_list' : request.string_list });
	}
	//------------------------------------------------------------------------
	else if (request.init_content_scripts) {
		s3gt.set_content_scripts(sender.tab.id, sender.frameId, undefined, true);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	//------------------------------------------------------------------------
	else if (request.set_work_data) {
		request.data.tab_id = request.tab_id;
		//------------------------------------------------------------------
		if (request.data.tooltip) {
			chrome.tabs.query({  active: true }, function(tab_list) {
				if (tab_list && tab_list.length) {
					for (var i in  tab_list) {
						if (tab_list[i].id == request.data.tab_id) {
							s3gt.work_data.current_id = request.data.current_id;
							s3gt.work_data.tooltip = request.data.tooltip;
							//----------------------------------
							if (s3gt.utils.prefs_get('translate_box_restore_restart')) {
								s3gt.utils.prefs_set("work_data_tooltip", request.data.tooltip);
							} else {
								s3gt.utils.prefs_set("work_data_tooltip", []);
							}
						}
					}
				}
			});
		}
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.get_work_data) {
		sendResponse({ 'work_data' : s3gt.work_data, 'tab_id' : request.tab_id });
	}
	//------------------------------------------------------------------------
	else if (request.google_request) {
		request.data.tab_id = request.tab_id;
		request.data.frame_id = sender.frameId;
		//------------------------------------------------------------------
		request.data.callback = function(data) {
			chrome.tabs.sendMessage(data.tab_id, { 'action' : 'google_response', 'data' : data }, { 'frameId' : sender.frameId }, function(response) { if (chrome.runtime.lastError) {} });
		}
		//------------------------------------------------------------------
		s3gt.translate.google_request(request.data);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.google_request_text_short) {
		request.data.tab_id = request.tab_id;
		request.data.frame_id = sender.frameId;
		//------------------------------------------------------------------
		request.data.callback = function(data) {
			chrome.tabs.sendMessage(data.tab_id, { 'action' : 'google_response', 'data' : data }, { 'frameId' : sender.frameId }, function(response) { if (chrome.runtime.lastError) {} });
		}
		//------------------------------------------------------------------
		s3gt.translate.google_request_text_short(request.data);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.google_value_tk_load) {
		s3gt.google_value_tk_load(function(tkk){
			chrome.tabs.sendMessage(request.tab_id, { 'action' : 'google_value_tk', 'result' : tkk }, { 'frameId' : sender.frameId }, function(response) { if (chrome.runtime.lastError) {} });
		});
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.create_fly_iframe) {
		chrome.tabs.sendMessage(request.tab_id, { 'action' : 'create_fly_custom', 'work_data' : s3gt.work_data, 'prefs_list' : s3gt.prefs.list, 'data' : request.data }, { 'frameId' : 0 }, function(response) { if (chrome.runtime.lastError) {} });
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.remove_fly_iframe) {
		chrome.tabs.sendMessage(request.tab_id, { 'action' : 'remove_fly_custom' }, { 'frameId' : 0 }, function(response) { if (chrome.runtime.lastError) {} });
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.move_fly_iframe) {
		chrome.tabs.sendMessage(request.tab_id, { 'action' : 'move_fly_custom', 'data' : request.data }, { 'frameId' : 0 }, function(response) { if (chrome.runtime.lastError) {} });
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.style_theme_load) {
		var req = new XMLHttpRequest();
		req.open("GET", request.url, true);
		req.overrideMimeType("text/css");
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				chrome.tabs.sendMessage(request.tab_id, { 'action' : 'style_theme_load', 'result' : req.responseText, 'id_session' : request.id_session }, { 'frameId' : sender.frameId }, function(response) { if (chrome.runtime.lastError) {} });
			}
		};
		req.send(null);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.open_url) {
		s3gt.open_url(request.url, request.tab_id, request.pos_after_active);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.notification_box) {
		s3gt.utils.notification_box(request.msg, request.title, request.url);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.translate_action) {
		if (request.method == 'translate_page_google') {
			s3gt.translate.page_google(request.tab_id);
		} else {
			s3gt.translate_action(request.method, request.tab_id);
		}
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.go_google) {
		s3gt.open_url(s3gt.work_data.url_google_site, request.tab_id, true);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.go_donate) {
		s3gt.open_url(s3gt.work_data.go_donate, request.tab_id, true);
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.s3gt_main_init) {
		chrome.tabs.getZoom(request.tab_id, function(zoom_index) {
			chrome.tabs.sendMessage(request.tab_id, { 'action' : 's3gt_main_init', 'work_data' : s3gt.work_data, 'tab_id' : request.tab_id, 'zoom_index' : zoom_index}, function(response) { if (chrome.runtime.lastError) {} });
		});
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.get_zoom_tab) {
		chrome.tabs.getZoom(request.tab_id, function(zoom_index) {
			chrome.tabs.sendMessage(request.tab_id, { 'action_change_zoom' : true, 'zoom_index' : zoom_index}, function(response) { if (chrome.runtime.lastError) {} });
		});
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.detect_language) {
		chrome.tabs.query({  active: true, currentWindow: true }, function(tab_list) {
			if (tab_list && tab_list.length && tab_list[0].id && (tab_list[0].id == request.tab_id)) {
				chrome.tabs.detectLanguage(request.tab_id, function(language) {
					if (chrome.runtime.lastError) {
					} else {
						language = (language == 'und') ? '' : language;
						chrome.tabs.sendMessage(request.tab_id, { 'action' : 'load_tab', 'work_data' : s3gt.work_data, 'language' : language }, function(response) { if (chrome.runtime.lastError) {} });
					}
				});
			} else {
				chrome.tabs.sendMessage(request.tab_id, { 'action' : 'load_tab', 'work_data' : s3gt.work_data, 'language' : '' }, function(response) { if (chrome.runtime.lastError) {} });
			}
		});
		sendResponse({ 'success' : true });
	}
	//------------------------------------------------------------------------
	else if (request.sound_play_get_url_batchexecute) {
		var url = s3gt.translate.google_speech_request_batchexecute(request.tkk, request.sound_lang, request.string);
		sendResponse({ 'success' : true, 'url' : url });
	}
	//------------------------------------------------------------------------
	else if (request.action_window_close) {
		chrome.tabs.remove(request.tab_id);
		sendResponse({ 'success' : true });
	}
}
//------------------------------------------------------------------------------
//chrome.webRequest.onCompleted.addListener(function(details) {
/*
	if (details.tabId < 0) { return; }
	if (details.statusCode != 200) { return; }

	setTimeout(function(){
		//-----------------------------------------------------------------
		var check_detect_timer = setTimeout(function(){
			s3gt.set_content_scripts(details.tabId, 0, function(tab_id) {
				chrome.tabs.sendMessage(tab_id, { 'action' : 'load_tab', 'work_data' : s3gt.work_data, 'language' : '' }, function(response) { if (chrome.runtime.lastError) {} });
			});
			check_detect_timer = null;
		}, 2000);
		//-----------------------------------------------------------------
		chrome.tabs.detectLanguage(details.tabId, function(language) {
			if (chrome.runtime.lastError) {
			} else {
				if (check_detect_timer) {
					language = (language == 'und') ? '' : language;
					s3gt.set_content_scripts(details.tabId, 0, function(tab_id) {
						chrome.tabs.sendMessage(tab_id, { 'action' : 'load_tab', 'work_data' : s3gt.work_data, 'language' : language }, function(response) { if (chrome.runtime.lastError) {} });
					});
					clearTimeout(check_detect_timer);
				}
			}
		});
	}, 2000);
*/
//}, {
//	urls: ["http://*/*", "https://*/*"],
//	types: ["main_frame"]
//});
//------------------------------------------------------------------------------
var extraInfoSpec = ['blocking', 'requestHeaders'];
if (chrome.webRequest.OnBeforeSendHeadersOptions.hasOwnProperty('EXTRA_HEADERS')) {
	extraInfoSpec.push('extraHeaders');
}
//------------------------------------------------------------------------------
chrome.webRequest.onBeforeSendHeaders.addListener(
	function(info) {
		// Replace the Referer header
		var headers = info.requestHeaders;
		var is_translate_google = false;
		var x_referer = '';
		var x_accept = '';
		var x_secfetchdest = '';
		var x_secfetchsite = '';
		//-----------------------------------------------------------------
		if (/^https?\:\/\/translate\.google/.test(info.url)) {
			is_translate_google = true;
			x_referer = s3gt.work_data.url_google_site;
		}
		//-----------------------------------------------------------------
		var header = null;
		var new_headers = [];
		while (header = headers.shift()) {
			if (is_translate_google && /^X\-/.test(header.name)) {
			}
			else if (is_translate_google && /DNT/.test(header.name)) {
			}
			else if (is_translate_google && /Origin/.test(header.name)) {
			}
			else if (header.name === 'x-referer') {
				x_referer = header.value;
			}
			else if (header.name === 'x-accept') {
				x_accept = header.value;
			}
			else if (header.name === 'x-secfetchdest') {
				x_secfetchdest = header.value;
			}
			else if (header.name === 'x-secfetchsite') {
				x_secfetchsite = header.value;
			} else {
				new_headers.push(header);
			}
		}
		headers = new_headers;

		//-----------------------------------------------------------------
		if (x_referer || x_accept || x_secfetchdest || x_secfetchsite) {
			for (var i = 0; i < headers.length; i++) {
				if (x_referer && (headers[i].name.toLowerCase() == 'referer')) { 
					headers[i].value = x_referer;
					x_referer = '';
				}
				else if (x_accept && (headers[i].name.toLowerCase() == 'accept')) { 
					headers[i].value = x_accept;
					x_accept = '';
				}
				else if (x_secfetchdest && (headers[i].name.toLowerCase() == 'sec-fetch-dest')) { 
					headers[i].value = x_secfetchdest;
					x_secfetchdest = '';
				}
				else if (x_secfetchsite && (headers[i].name.toLowerCase() == 'sec-fetch-site')) { 
					headers[i].value = x_secfetchsite;
					x_secfetchsite = '';
				}

			}
			if (x_referer) {
				headers.push({ 'name' : 'Referer', 'value' : x_referer });
			}
			if (x_accept) {
				headers.push({ 'name' : 'Accept', 'value' : x_accept });
			}
			if (x_secfetchdest) {
				headers.push({ 'name' : 'Sec-Fetch-Dest', 'value' : x_secfetchdest });
			}
			if (x_secfetchsite) {
				headers.push({ 'name' : 'Sec-Fetch-Site', 'value' : x_secfetchsite });
			}
		}
		//-----------------------------------------------------------------
		return { requestHeaders: headers };
	},
	{urls: ["http://*/*", "https://*/*"]},
	extraInfoSpec
);
//------------------------------------------------------------------------------
// check Content Security Policy  "style-src" for styles fly-window and bottom panel
//------------------------------------------------------------------------------
chrome.webRequest.onHeadersReceived.addListener(
	function(httpChannel) {
		var headers = httpChannel.responseHeaders;
		//-----------------------------------------------------------------
		for (var i = 0; i < headers.length; i++) {
			if (headers[i].name.toLowerCase() === 'content-security-policy') {
				var policy_list = headers[i].value.split(/\;/);
				for (var p=0; p<policy_list.length; p++) {
					if (/^\s*style\-src/.test(policy_list[p])) {
						s3gt.work_data.tab_id_scp[httpChannel.tabId] = true;
						break;
					}
				}
				break;
			}
		}
		return;
	},
	{
		urls: ["http://*/*", "https://*/*"],
		types: ["main_frame"]
	},
	["responseHeaders"]
);
//------------------------------------------------------------------------------
// chrome.tabs.onHighlighted.addListener(function(){ s3gt.init_general_data(); });
//-------------------------------------------------------------------------------------------
chrome.tabs.onActivated.addListener(function(activeInfo){ s3gt.init_main_data(null, activeInfo.tabId); });
//-------------------------------------------------------------------------------------------
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){
	if (! changeInfo) { return; }
	s3gt.init_main_data(changeInfo, tabId);
});
//-------------------------------------------------------------------------------------------
chrome.tabs.onRemoved.addListener(function(tab_id, removeInfo) {
	s3gt.work_data.tooltip = s3gt.utils.prefs_get("work_data_tooltip");
	var tooltip_list_tmp = [];
	for (var i=0; i<s3gt.work_data.tooltip.length; i++) {
		var tooltip = s3gt.work_data.tooltip[i];
		if (tooltip.translate_tooltip_pin == 'alltabs') {
			tooltip_list_tmp.push(tooltip);
		} else if (tooltip.tab_id != tab_id) {
			tooltip_list_tmp.push(tooltip);
		}
	}
	s3gt.work_data.tooltip = tooltip_list_tmp;
	s3gt.utils.prefs_set('work_data_tooltip', s3gt.work_data.tooltip);
});
//-------------------------------------------------------------------------------------------
try {
	chrome.windows.onFocusChanged.addListener(function(windowId){ setTimeout(function(){ s3gt.init_main_data(); }, 200); });
} catch(e) {};
//-------------------------------------------------------------------------------------------
chrome.webNavigation.onDOMContentLoaded.addListener(function(details){ s3gt.init_main_data({ d: details, 'status' : 'loading' , 'source' : 'webNavigation', 'tab_id' : details.tabId, 'frame_id' : details.frameId }, details.tabId); });
//-------------------------------------------------------------------------------------------
try {
	chrome.tabs.onZoomChange.addListener(function(zoom) {
		chrome.tabs.sendMessage(zoom.tabId, { 'action_change_zoom' : true, 'zoom_index' : zoom.newZoomFactor}, function(response) { if (chrome.runtime.lastError) {} });
	});
} catch(e) {};
//-------------------------------------------------------------------------------------------
chrome.notifications.onClicked.addListener(function(notification_id) {
	if (s3gt.notification_list[notification_id] && s3gt.notification_list[notification_id].url) {
		chrome.tabs.query({  active: true, currentWindow: true }, function(tab_list) {
			if (tab_list && tab_list.length && tab_list[0].id) {
				s3gt.open_url(s3gt.notification_list[notification_id].url, tab_list[0].id, true);
			} else {
				s3gt.open_url(s3gt.notification_list[notification_id].url);
			}
			chrome.notifications.clear(notification_id);
		});
	}
});
//-------------------------------------------------------------------------------------------
chrome.notifications.onClosed.addListener(function(notification_id) {
	delete s3gt.notification_list[notification_id];
});
//------------------------------------------------------------------------------
chrome.runtime.onUpdateAvailable.addListener(function(){
//	chrome.runtime.reload();
});
//------------------------------------------------------------------------------
setTimeout(s3gt.init, 1000);
//------------------------------------------------------------------------------
