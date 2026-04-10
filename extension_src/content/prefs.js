s3gt.prefs = {};
s3gt.prefs.list = {};
s3gt.prefs.is_init = false;
s3gt.prefs.lang_from = 'auto';
s3gt.prefs.lang_to = 'auto';
s3gt.prefs.translate_text_tts_max_length = 150;
s3gt.prefs.lang_to_locale = 'en';

//------------------------------------------------------------------------------
s3gt.prefs.init = function(callback) {
	//------------------------------------------------------------------------
	if (s3gt.prefs.is_init) {
		if (callback) {
			callback();
		}
		return;
	}
	//------------------------------------------------------------------------
	chrome.storage.local.get(function(items) {
		try {
			s3gt.prefs.list = items;
	
			if (s3gt.i18n) {
				s3gt.i18n.init(items.current_locale);
			}
	
			s3gt.prefs.check_defaults();
			s3gt.prefs.is_init = true;
			s3gt.prefs.init_lang_to();
			if (callback) {
				callback();
			}
		} catch(e) {};
	});
}
//------------------------------------------------------------------------------
s3gt.prefs.set = function(pref) {
	var pref_hash = {};
	pref_hash[pref.name] = pref.value;
	chrome.storage.local.set(pref_hash);
	s3gt.prefs.list[pref.name] = pref.value;
}
//------------------------------------------------------------------------------
s3gt.prefs.get = function(pref_name) {
	return s3gt.prefs.list[pref_name];
}
//------------------------------------------------------------------------------
s3gt.prefs.check_defaults = function() {
	var defaults = s3gt.utils.clone_object(s3gt.prefs.defaults);

	for (var pref_name in defaults) {
		if (s3gt.prefs.list[pref_name] === undefined) {
			s3gt.prefs.list[pref_name] = defaults[pref_name];
		}
		else if (typeof(s3gt.prefs.list[pref_name]) != typeof(defaults[pref_name])) {
			s3gt.prefs.list[pref_name] = defaults[pref_name];
		}
	}
}
//------------------------------------------------------------------------------
s3gt.prefs.reset_defaults = function(callback) {
	chrome.storage.local.clear(function() {
		s3gt.prefs.list = {};
		s3gt.prefs.check_defaults();
		if (s3gt.i18n) {
			s3gt.i18n.init();
		}
		if (callback) {
			callback();
		}
	});
}
//-------------------------------------------------------------------------------------------
s3gt.prefs.get_lang_list = function() {
	//------------------------------------------------------------------------------------
	// https://developers.google.com/translate/v2/using_rest
	//------------------------------------------------------------------------------------
	var lang_list = new Array(
		{ lang: 'az',	label: 'translang.Azerbaijani' },
		{ lang: 'sq',	label: 'translang.Albanian' },
		{ lang: 'en',	label: 'translang.English' },
		{ lang: 'ar',	label: 'translang.Arabic' },
		{ lang: 'hy',	label: 'translang.Armenian' },
		{ lang: 'af',	label: 'translang.Afrikaans' },
		{ lang: 'eu',	label: 'translang.Basque' },
		{ lang: 'be',	label: 'translang.Belarusian' },
		{ lang: 'bg',	label: 'translang.Bulgarian' },
		{ lang: 'cy',	label: 'translang.Welsh' },
		{ lang: 'hu',	label: 'translang.Hungarian' },
		{ lang: 'vi',	label: 'translang.Vietnamese' },
		{ lang: 'gl',	label: 'translang.Galician' },
		{ lang: 'nl',	label: 'translang.Dutch' },
		{ lang: 'el',	label: 'translang.Greek' },
		{ lang: 'ka',	label: 'translang.Georgian' },
		{ lang: 'da',	label: 'translang.Danish' },
		{ lang: 'iw',	label: 'translang.Hebrew' },
		{ lang: 'yi',	label: 'translang.Yiddish' },
		{ lang: 'id',	label: 'translang.Indonesian' },
		{ lang: 'ga',	label: 'translang.Irish' },
		{ lang: 'is',	label: 'translang.Icelandic' },
		{ lang: 'es',	label: 'translang.Spanish' },
		{ lang: 'it',	label: 'translang.Italian' },
		{ lang: 'ca',	label: 'translang.Catalan' },
		{ lang: 'zh-CN',	label: 'translang.ChineseSimplified' },
		{ lang: 'zh-TW',	label: 'translang.ChineseTraditional' },
		{ lang: 'ht',	label: 'translang.HaitianCreole' },
		{ lang: 'ko',	label: 'translang.Korean' },
		{ lang: 'lv',	label: 'translang.Latvian' },
		{ lang: 'la',	label: 'translang.Latin' },
		{ lang: 'lt',		label: 'translang.Lithuanian' },
		{ lang: 'mk',	label: 'translang.Macedonian' },
		{ lang: 'ms',	label: 'translang.Malay' },
		{ lang: 'mt',	label: 'translang.Maltese' },
		{ lang: 'de',	label: 'translang.German' },
		{ lang: 'no',	label: 'translang.Norwegian' },
		{ lang: 'fa',	label: 'translang.Persian' },
		{ lang: 'pl',	label: 'translang.Polish' },
		{ lang: 'pt',	label: 'translang.Portuguese' },
		{ lang: 'ro',	label: 'translang.Romanian' },
		{ lang: 'ru',	label: 'translang.Russian' },
		{ lang: 'sr',	label: 'translang.Serbian' },
		{ lang: 'sk',	label: 'translang.Slovak' },
		{ lang: 'sl',	label: 'translang.Slovenian' },
		{ lang: 'sw',	label: 'translang.Swahili' },
		{ lang: 'th',	label: 'translang.Thai' },
		{ lang: 'tr',	label: 'translang.Turkish' },
		{ lang: 'uk',	label: 'translang.Ukrainian' },
		{ lang: 'ur',	label: 'translang.Urdu' },
		{ lang: 'tl',		label: 'translang.Filipino' },
		{ lang: 'fi',	label: 'translang.Finnish' },
		{ lang: 'fr',	label: 'translang.French' },
		{ lang: 'hi',	label: 'translang.Hindi' },
		{ lang: 'hr',	label: 'translang.Croatian' },
		{ lang: 'cs',	label: 'translang.Czech' },
		{ lang: 'et',	label: 'translang.Estonian' },
		{ lang: 'ja',	label: 'translang.Japanese' },
		{ lang: 'sv',	label: 'translang.Swedish' },
		{ lang: 'bn',	label: 'translang.Bengali'},
		{ lang: 'bs',	label: 'translang.Bosnian'},
		{ lang: 'gu',	label: 'translang.Gujarati'},
		{ lang: 'zu',	label: 'translang.Zulu'},
		{ lang: 'ig',	label: 'translang.Igbo'},
		{ lang: 'yo',	label: 'translang.Yoruba'},
		{ lang: 'kn',	label: 'translang.Kannada'},
		{ lang: 'km',	label: 'translang.Khmer'},
		{ lang: 'lo',	label: 'translang.Lao'},
		{ lang: 'mi',	label: 'translang.Maori'},
		{ lang: 'mr',	label: 'translang.Marathi'},
		{ lang: 'mn',	label: 'translang.Mongolian'},
		{ lang: 'ne',	label: 'translang.Nepali'},
		{ lang: 'pa',	label: 'translang.Punjabi'},
		{ lang: 'ceb',	label: 'translang.Cebuano'},
		{ lang: 'so',	label: 'translang.Somali'},
		{ lang: 'ta',	label: 'translang.Tamil'},
		{ lang: 'te',	label: 'translang.Telugu'},
		{ lang: 'ha',	label: 'translang.Hausa'},
		{ lang: 'hmn',	label: 'translang.Hmong'},
		{ lang: 'eo',	label: 'translang.Esperanto'},
		{ lang: 'jw',	label: 'translang.Javanese'},
		{ lang: 'uz',	label: 'translang.Uzbek'},
		{ lang: 'my',	label: 'translang.Burmese'},
		{ lang: 'kk',	label: 'translang.Kazakh'},
		{ lang: 'mg',	label: 'translang.Malagasy'},
		{ lang: 'ml',	label: 'translang.Malayalam'},
		{ lang: 'st',	label: 'translang.Sesotho'},
		{ lang: 'si',	label: 'translang.Sinhala'},
		{ lang: 'su',	label: 'translang.Sundanese'},
		{ lang: 'tg',	label: 'translang.Tajik'},
		{ lang: 'ny',	label: 'translang.Chichewa'},
		{ lang: 'am',	label: 'translang.Amharic'},
		{ lang: 'haw',	label: 'translang.Hawaiian'},
		{ lang: 'ky',	label: 'translang.Kyrgyz'},
		{ lang: 'co',	label: 'translang.Corsican'},
		{ lang: 'ku',	label: 'translang.KurdishKurmanji'},
		{ lang: 'xh',	label: 'translang.Xhosa'},
		{ lang: 'lb',	label: 'translang.Luxembourgish'},
		{ lang: 'ps',	label: 'translang.Pashto'},
		{ lang: 'sm',	label: 'translang.Samoan'},
		{ lang: 'sd',	label: 'translang.Sindhi'},
		{ lang: 'fy',	label: 'translang.Frisian'},
		{ lang: 'sn',	label: 'translang.Shona'},
		{ lang: 'gd',	label: 'translang.ScotsGaelic'}
	);
	return lang_list;
}
//------------------------------------------------------------------------------
s3gt.prefs.get_lang_label = function(lang) {
	if (lang == 'auto') {
		return 'translang.auto';
	}

	var lang_list = s3gt.prefs.get_lang_list();
	var result = '';

	for (var i=0; i<lang_list.length; i++) {
		if (lang_list[i].lang == lang) {
			result = lang_list[i].label;
			break;
		}
	}
	return result;
}
//------------------------------------------------------------------------------
s3gt.prefs.get_lang_from = function(is_default_lang) {
	if (is_default_lang) {
		return s3gt.prefs.lang_from;
	} else {
		return s3gt.utils.check_last_lang_from(s3gt.prefs.lang_from);
	}
}
//------------------------------------------------------------------------------
s3gt.prefs.get_lang_to = function(is_default_lang) {
	if (is_default_lang) {
		return s3gt.prefs.lang_to;
	} else {
		return s3gt.utils.check_last_lang_to(s3gt.prefs.lang_to);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.prefs.check_lang_list = function(lang_name) {
	var result = false;
	var lang_list = s3gt.prefs.get_lang_list();
	//---------------------------------------------------------------------------
	for (var i=0; i<lang_list.length; i++) {
		if (lang_list[i].lang == lang_name) {
			result = true;
		}
	}

	return result;
}
//------------------------------------------------------------------------------
s3gt.prefs.init_lang_to = function() {
	var lang_pref = s3gt.utils.prefs_get('default_lang_to');
	var lang_list = s3gt.prefs.get_lang_list();

	//---------------------------------------------------------------------------
	s3gt.prefs.lang_to_locale = s3gt.utils.check_lang(s3gt.prefs.get_ua_locale());
	if (! s3gt.utils.check_lang(s3gt.prefs.lang_to_locale)) {
		s3gt.prefs.lang_to_locale = 'en';
	}
	//---------------------------------------------------------------------------
	if (! s3gt.prefs.check_lang_list(lang_pref)) {
		lang_pref = s3gt.prefs.lang_to_locale;
	}

	//---------------------------------------------------------------------------
	if (lang_pref == '') {
		lang_pref = 'en';
	}

	s3gt.prefs.lang_to = lang_pref;
}
//------------------------------------------------------------------------------
s3gt.prefs.get_lang_from_string = function(str) {
	var result = str;
	if (str == 'zh-CN') {
		result = str;
	}
	else if (s3gt.prefs.check_lang_list(str) == true) {
		result = str;
	} else {
		str = str.replace(/\s/g, '');
		str = str.replace(/^(\w+).*$/, "$1");

		if (s3gt.prefs.check_lang_list(str) == true) {
			result = str;
		}
	}
	return result;
}
//------------------------------------------------------------------------------
s3gt.prefs.get_ua_locale = function() {
	var local_lang = '';

	try {
  		local_lang = window['navigator'].language;
	} catch (e) {
		local_lang = 'en';
	}

	return local_lang;
}
//------------------------------------------------------------------------------
s3gt.prefs.defaults = {
	'current_version' : '0',
	'not_open_contribute_page' : false,
	"is_first_run" : true,
	'show_page_timer' : 0, 
	"statistics" : "wait", // wait , check , request , on , off
	"statistics_timer" : 0,
	"work_data_tooltip" : [],

	"domain_translate_list" : {},

	"default_lang_to" : "auto",
	"last_lang_to" : "",
	"last_lang_from" : "",
	"reverse_lang_value" : "reverse",
	"save_last_lang_from" : false,
	"save_last_lang_reverse" : false,

	"translate_subtitles_youtube" : true,
	"translate_selection_timer" : 0,

	"translate_selection_fly" : true,
	"translate_selection_fly_translate" : true,
	"translate_selection_fly_translate_plus" : false,
	"translate_selection_fly_sound" : true,
	"translate_selection_fly_copy" : true,
	"translate_selection_fly_window_new" : 'default',
	"translate_selection_fly_translate_open" : 'default',

	"translate_selection_middle_click" : false,
	"translate_selection_middle_click_action" : "translate",
	"translate_selection_middle_click_translate" : true,
	"translate_selection_middle_click_translate_plus" : false,
	"translate_selection_middle_click_sound" : true,
	"translate_selection_middle_click_copy" : true,
	"translate_selection_middle_click_window_new" : 'default',
	"translate_selection_middle_click_translate_open" : 'default',

	"translate_selection_long_click" : false,
	"translate_selection_long_click_action" : "tooltip",
	"translate_selection_long_click_translate" : true,
	"translate_selection_long_click_translate_plus" : false,
	"translate_selection_long_click_sound" : true,
	"translate_selection_long_click_copy" : true,
	"translate_selection_long_click_timer" : 700,
	"translate_selection_long_click_window_new" : 'default',
	"translate_selection_long_click_translate_open" : 'default',

	"translate_selection_fly_auto" : "disabled",
	"translate_selection_fly_auto_window_new" : 'default',
	"translate_selection_fly_auto_translate_open" : 'default',

	"translate_word_fly" : false,
	"translate_word_fly_key" : "alt",
	"translate_word_fly_long_click" : false,
	"translate_word_fly_long_click_timer" : 700,
	"translate_word_fly_sound" : false,
	"translate_word_fly_window_new" : 'default',
	"translate_word_fly_translate_open" : 'default',

	"translate_clipboard_window_new" : 'default',
	"translate_clipboard_translate_open" : 'default',

	"list_disabled_lang_to" : "",
	"translate_page_hide_header" : false,
	"translate_page_show_only_selected_languages" : false,

	"font_size_tooltip_box" : "",
	"font_size_tooltip_logo" : "",
	"font_family_tooltip_box" : "",

	'hotkeys' : [{ shiftKey:true, ctrlKey:false, altKey:true, keyCode:83, key:'S', method:'translate_page' }, { shiftKey:false, ctrlKey:false, altKey:true, keyCode:86, "key":"V", method:'translate_clipboard'}],
	'action_button_click_icon' : 'menu',

	"run_trans_full_page" : false,
	"autotranslate" : "check",
	"autotranslate_allpages" : false,
	"clean_site_after_google" : false,
	"promt_https" : true,

	"learning_enable" : false,
	"learning_only_http" : true,
	"learning_min_length" : 50,
	"learning_max_count" : 1,
	"learning_border" : true,
	"learning_border_color" : "#006600",
	"learning_background" : true,
	"learning_background_color" : "#CCFFFF",
	"learning_font" : true,
	"learning_font_color" : "#000000",
	"learning_lang_to" : "auto",
	"learning_lang_from" : "auto",
	"learning_show_translation_in_tooltip" : false,

	"context_menu_translate_page" : true,
	"context_menu_translate_page_google" : true,
	"context_menu_translate_auto" : true,
	"context_menu_translate_forget" : true,
	"context_menu_translate_allpages_auto_separator" : true,
	"context_menu_translate_allpages_auto" : true,
	"context_menu_translate_learning_separator" : true,
	"context_menu_translate_learning" : true,
	"context_menu_translate_text_separator" : true,
	"context_menu_translate_clipboard" : true,
	"context_menu_translate_custom" : true,
	"context_menu_translate_selection" : true,
	"context_menu_translate_selection_sound" : true,
	"context_menu_translate_go_google_separator" : true,
	"context_menu_translate_go_google" : true,
	"context_menu_translate_settings_separator" : true,
	"context_menu_translate_settings" : true,

	"translate_selection_impossible_target" : 'notifycation', // google

	"translate_selection_fly_tooltip" : false,
	"translate_instant_tooltip" : true,
	"translate_tooltip_pin" : 'onetab', // close , onetab , alltabs
	"view_source_translate_tooltip" : true,
	"view_reverse_translate_tooltip" : false,
	"set_lowercase_tooltip_from" : false,
	"set_lowercase_tooltip_to" : false,
	"set_lowercase_tooltip_reverse" : false,

	"translate_selection_fly_panel" : false,
	"translate_instant_panel" : true,
	"translate_panel_pin" : 'onetab', // close , onetab , alltabs
	"view_source_translate_panel" : true,
	"view_reverse_translate_panel" : false,
	"set_lowercase_panel_from" : false,
	"set_lowercase_panel_to" : false,
	"set_lowercase_panel_reverse" : false,

	"domain_google_translator" : "",

	"show_tooltip_animation" : "transparency",
	"show_tooltip_animation_speed" : 20,
	"tooltip_theme" : "light",
	"tooltip_theme_custom_path" : "",

	"tooltip_height_panel" : 200,

	"tooltip_width" : 350,
	"tooltip_height_from" : 80,
	"tooltip_height_to" : 80,
	"tooltip_height_reverse" : 80,
	"tooltip_position_is_save" : false,
	"tooltip_position_x" : 100,
	"tooltip_position_y" : 100,
	"tooltip_show_box_name" : true,
	"tooltip_font_color_enable" : false,
	"tooltip_font_color_value" : "#000000",
	"tooltip_background_color_enable" : false,
	"tooltip_background_color_value" : "#FFFFFF",
	"tooltip_use_webpage_zoom" : true,

	"basic_functions_in_panel" : false,
	"translate_box_restore_restart" : true,
	"sound_playback_rate" : 100,
	"tooltip_check_cyrillic" : false,
	"tooltip_check_page_language" : false,
	"copy_clipboard_notification" : true,

	"complete_beep" : false,
	"ignore_pdf_linebreaks" : false,

	"google_value_tk" : "",
	"google_value_tk_timeout" : 4,

	'_end' : '_end'
};
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
s3gt.prefs.init();
