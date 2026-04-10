s3gt.translate = {};
s3gt.translate.sound_complete_beep = null;
s3gt.translate.id_translate_session = null;
//-------------------------------------------------------------------------------------------
s3gt.translate.page_google = function(tab_id) {
	chrome.tabs.get(tab_id, function(tab) {
		var url = s3gt.work_data.url_translate_page_google_site;
		url = url.replace("LANG_FROM", s3gt.prefs.get_lang_from(true));
		url = url.replace("LANG_TO", s3gt.prefs.get_lang_to(true));
	
		var url_loc = tab.url;
		url = url.replace("URL", s3gt.utils.urlencode(url_loc));
		//------------------------------------------------------------------------------
		s3gt.open_url(url, tab_id, true);
	});
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request_pre = function(data) {
	s3gt.translate.google_request(data);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request = function(data) {
	var is_set_last_lang = true;
	if (data.is_translate_reverse) {
		is_set_last_lang = false;
	}
	if (data.only_get_lang_src) {
		is_set_last_lang = false;
	}
	if (is_set_last_lang) {
		s3gt.utils.set_last_lang_from(data.lang_from);
		s3gt.utils.set_last_lang_to(data.lang_to);
		if (data.tab_id) {
			if (data.frame_id) {
				chrome.tabs.sendMessage(data.tab_id, { 'action' : 'set_prefs_list', 'prefs_list' : s3gt.prefs.list }, { 'frameId' : data.frame_id }, function(response) { if (chrome.runtime.lastError) {} });
			} else {
				chrome.tabs.sendMessage(data.tab_id, { 'action' : 'set_prefs_list', 'prefs_list' : s3gt.prefs.list }, function(response) { if (chrome.runtime.lastError) {} });
			}
		}
	}
	//-----------------------------------------------------------------------------------
	s3gt.translate.id_translate_session = data.id_translate_session;
	//-----------------------------------------------------------------------------------
	var tkk = s3gt.work_data.google_value_tk || s3gt.utils.prefs_get('google_value_tk') || '';
	if (tkk && (! /^ZZZ\|\|\|/.test(tkk))) {
		s3gt.translate.google_request_tkk(data);
	} else {
		s3gt.translate.google_request_batchexecute(data, tkk);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request_batchexecute = function(data, tkk) {
	var tkk_key = '';

	var res = /^ZZZ\|\|\|(.*?)\:(.*)$/i.exec(tkk);
	if (res != null) {
		tkk_key = res[1] + '%3A' + res[2];
		tkk_key = '&at=' + tkk_key + '&';
	}

	var url = s3gt.work_data.url_translate_text_batchexecute;
	url = url.replace(/LANG_TO/g, data.lang_to);
	url = url.replace(/GOOGLE_KEY/g, s3gt.work_data.google_value_tk_newkey);

	var data_text = JSON.stringify([[data.text, data.lang_from,data.lang_to,true],[null]]);
	var data_request = JSON.stringify([[[s3gt.work_data.google_value_tk_newkey,data_text,null,"generic"]]]);

	var req = new XMLHttpRequest();
	req.timeout = 10000;

	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			s3gt.translate.response_batchexecute(req.responseText, data);
		}
	};

	req.open("POST", url, true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
	req.setRequestHeader("x-secfetchsite", 'same-origin');
	req.send('f.req=' + encodeURIComponent(data_request) + tkk_key);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request_tkk = function(data) {
	var url = s3gt.work_data.url_translate_text;
	url = url.replace("LANG_FROM", data.lang_from);
	url = url.replace(/LANG_TO/g, data.lang_to);
	url = url.replace(/GOOGLE_TK/g, s3gt.translate.google_value_tk(data.text));

	url += s3gt.utils.urlencode(data.text);
	var url_part = url.split('?', 2);

	var req = new XMLHttpRequest();
	req.timeout = 10000;
	var text_length = unescape(encodeURIComponent(url_part[1])).length;

	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			s3gt.translate.response(req.responseText, data);
		}
	};

	if (text_length>750) {
		req.open("POST", url_part[0], true);
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		req.setRequestHeader("x-secfetchsite", 'same-origin');
		req.send(url_part[1]);
	} else {
		req.open("GET", url, true);
		req.setRequestHeader("x-secfetchsite", 'same-origin');
		req.send(null);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.response_batchexecute = function(jsonResp, data) {
	var jrsp_tmp;
	var complete_beep = s3gt.utils.prefs_get("complete_beep");
	jsonResp = jsonResp.replace(/\n|\r/g, '');
	var is_error = false;

	var res = /\[\[\"wrb\.fr",\".*?\",\"(.*?)\"[^\"]+\"generic\"\]/i.exec(jsonResp);
	if (res == null) {
		is_error = true;
	} else {
		try {
			var jrsp1 = JSON.parse('["' + res[1] + '"]');
			jsonResp = jrsp1[0];
		} catch (e) {
			is_error = true;
		}
	}

	//-----------------------------------------------------------------------------------
	//-----------------------------------------------------------------------------------
	data.result = { 'is_ok' : false, 'jsonResp' : jsonResp, 'text' : '', 'lang_from' : '', 'lang_to': '' };
	//-----------------------------------------------------------------------------------
	try {
		jrsp_tmp = JSON.parse(jsonResp);
	} catch (e) {
		is_error = true;
	}

	//-----------------------------------------------------------------------------------
	try {
		if (jrsp_tmp) {
			var jrsp = {};
			var result_text = '';
			jrsp.server_time = 777;
			jrsp.src = jrsp_tmp[1][3];
			jrsp.src_2 = jrsp_tmp[2];
			jrsp.transcription = jrsp_tmp[1][0][0][1];
			if (jrsp_tmp[0][1] && jrsp_tmp[0][1][0]) {
				jrsp.correct_text = jrsp_tmp[0][1][0][0][1];
				jrsp.correct_text = jrsp.correct_text.replace(/<\/?.*?>/g, '');
			}
			if (jrsp_tmp[0][1] && jrsp_tmp[0][1][1]) {
//				jrsp.src_2 = jrsp_tmp[0][1][1][0];
			}
			if (jrsp_tmp[1][0][0][5]) {
				var translate_list = jrsp_tmp[1][0][0][5];
				jrsp.translate_list = [];
				var is_exists_word_pre = false;
				for (var i=0; i<translate_list.length; i++) {
					var translate_variant = undefined;
					var is_space = false;
					if (translate_list[i][1]) {
						is_space = is_exists_word_pre;
						translate_variant = [];
						for (var i2=0; i2<translate_list[i][1].length; i2++) {
							translate_variant.push([ translate_list[i][1][i2] ]);
						}
						is_exists_word_pre = true;
					} else {
						is_exists_word_pre = false;
					}
					jrsp.translate_list.push({
						'translate_variant' : translate_variant,
						'translate_variant2' : translate_list[i][0],
						'is_space' : is_space
					});
					result_text = result_text + translate_list[i][0] + (is_space ? ' ' : '');
				}
			}
			jrsp.sentences = { 'trans' : result_text };
			s3gt.translate.response_finish(data, jrsp);
		}
	} catch (e) {
		is_error = true;
	}

	//-----------------------------------------------------------------------------------
	if (is_error) {
		s3gt.google_value_tk_load();
		if (data.callback) {
			if (! data.only_get_lang_src) {
				if (complete_beep) {
					if (s3gt.translate.id_translate_session == data.id_translate_session) {
						s3gt.translate.sound_complete(false);
					}
				}
			}
			data.result.response_error = s3gt.translate.get_response_error(jsonResp);
			return data.callback(s3gt.utils.clone_object(data));
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.response = function(jsonResp, data) {
/*
 {
	"sentences":
		[
			{"trans":"̨󯣱멥\r\n","orig":"Lithuanian","translit":"Litovskie\r\n","src_translit":""},
			{"trans":"- ͠릤ﮱ멩\r\n","orig":"- Macedonian","translit":"- Makedonskii?\r\n","src_translit":""},
			{"trans":"- ͠졩򫩩","orig":"- Malay","translit":"- Malai?skii?","src_translit":""}
		],
	"src":"en",
	"server_time":100
}
*/
	var jrsp;
	var complete_beep = s3gt.utils.prefs_get("complete_beep");

	//-----------------------------------------------------------------------------------
	while (/,,/.test(jsonResp)) {
		jsonResp = jsonResp.replace(/,,/g, ',968523512269854,')
	}
	jsonResp = jsonResp.replace(/\[,/g, '[968523512269854,').replace(/,\]/g, ',968523512269854]');
	jsonResp = jsonResp.replace(/\~\~HEAD\=(p|d)obj/g, '').replace(/\~\~(p|d)obj/g, '').replace(/\~\~number\=plural/g, '');
	//-----------------------------------------------------------------------------------
	data.result = { 'is_ok' : false, 'jsonResp' : jsonResp, 'text' : '', 'lang_from' : '', 'lang_to': '' };
	//-----------------------------------------------------------------------------------
	try {
		jrsp = JSON.parse(jsonResp);
	} catch (e) {
		s3gt.google_value_tk_load();
		if (data.callback) {
			if (! data.only_get_lang_src) {
				if (complete_beep) {
					if (s3gt.translate.id_translate_session == data.id_translate_session) {
						s3gt.translate.sound_complete(false);
					}
				}
			}
			data.result.response_error = s3gt.translate.get_response_error(jsonResp);
			return data.callback(s3gt.utils.clone_object(data));
		}
	}

	//-----------------------------------------------------------------------------------
	if (jrsp) {
		jrsp = s3gt.translate.response_normalize(jrsp);
	}
	s3gt.translate.response_finish(data, jrsp);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.response_finish = function(data, jrsp) {
	//-----------------------------------------------------------------------------------
	var complete_beep = s3gt.utils.prefs_get("complete_beep");
	//-----------------------------------------------------------------------------------
	if (jrsp) {
		if (jrsp.server_time) {
			//------------------------------------------------------------------
			if (jrsp.sentences) {
				data.result.is_ok = true;
				//-----------------------------------------------------------
				data.result.text = jrsp.sentences.trans;
				//-----------------------------------------------------------
				if (jrsp.src) {
					data.result.detected_lang_from = jrsp.src_2;
					if (jrsp.src_2 && (data.lang_from == 'auto')) {
						data.result.lang_from = jrsp.src_2;
					} else {
						data.result.lang_from = jrsp.src;
					}
				}
			}
			//------------------------------------------------------------------
			if (jrsp.transcription) {
				data.result.transcription = jrsp.transcription;
			}
			//------------------------------------------------------------------
			if (jrsp.correct_text) {
				data.result.correct_text = jrsp.correct_text;
			}
			//------------------------------------------------------------------
			data.result.jrsp = jrsp;
		}
	}
	//-----------------------------------------------------------------------------------
	if ((! data.is_translate_reverse) && data.is_check_lang_pair) {
		if (data.result.lang_from && (data.lang_to == data.result.lang_from)) {
			var lang_from = data.result.lang_from;
			var lang_to = data.lang_to;
			var is_repeat = false;

			if (lang_to != s3gt.prefs.lang_to) {
				lang_to = s3gt.prefs.lang_to;
				is_repeat = true;
			}
			else if (s3gt.utils.prefs_get("learning_enable")) {
				var learning_lang_to = s3gt.utils.prefs_get("learning_lang_to");
				var learning_lang_from = s3gt.utils.prefs_get("learning_lang_from");
				if (learning_lang_to != 'auto') {
					if ((learning_lang_from == lang_from) && (learning_lang_to != lang_to)) {
						lang_to = learning_lang_to;
						is_repeat = true;
					}
				}
			}
			if (is_repeat) {
				data.lang_to = lang_to;
				s3gt.translate.google_request(data);
				return;
			}
		}
	}
	if (! data.only_get_lang_src) {
		if (complete_beep) {
			if (s3gt.translate.id_translate_session == data.id_translate_session) {
				s3gt.translate.sound_complete(data.result.is_ok);
			}
		}
	}

	if (! data.result.is_ok) {
		data.result.response_error = s3gt.translate.get_response_error(jsonResp);
	}

	data.callback(s3gt.utils.clone_object(data));
}
//-------------------------------------------------------------------------------------------
s3gt.translate.response_clear_968523512269854 = function(ary) {
	if (ary && (ary instanceof Array)) {
		for (var i=0; i<ary.length; i++) {
			ary[i] = s3gt.translate.response_clear_968523512269854(ary[i]);
		}
	} else if (ary == '968523512269854') {
		ary = '';
	} else if (/968523512269854/.test(ary)) {
		try {
			ary = ary.replace(/968523512269854/g, '');
		} catch(e) {
		}
	}
	return ary;
}
//----------------------------------------------------------------
s3gt.translate.response_normalize = function(jrsp) {
	var res = {};
	var trans_text = '';
	var orig_text = '';
	var transcription_text = '';

	jrsp = s3gt.translate.response_clear_968523512269854(jrsp);

	//-------------------------------------
	// [0]
	//-------------------------------------
	try {
		for (var i=0; i<jrsp[0].length; i++) {
			var tr = jrsp[0][i];
			if ((tr[0] != '') && (tr[1] != '') && (tr[0] != null) && (tr[1] != null)) {
				trans_text += tr[0];
				orig_text += tr[1];
			}
			// transcription for source text
			else if (tr[3]) {
				transcription_text += tr[3];
			}
			// transcription for translate text
			else if (tr[2]) {
			//	transcription_text += tr[2];
			}
		}
	} catch(e) {
	}

	res.fast_translate = {
		'source' : orig_text,
		'translate' : trans_text,
		'transcription' : transcription_text,
	};

	//-------------------------------------
	// [1]
	//-------------------------------------
	// [2]
	//-------------------------------------
	res.lang_src = jrsp[2];
	
	//-------------------------------------
	// [5]
	//-------------------------------------
	res.translate = [];
	var trans_text2 = '';
	if (! (jrsp[5] && (typeof jrsp[5] == "object") && (jrsp[5] instanceof Array))) {
		jrsp[5] = [];
	}
	for (var i=0; i<jrsp[5].length; i++) {
		try {
			var tr = jrsp[5][i];
			if (! tr[3][0]) { continue; }

			var is_space = false;
			if (tr[2] && (typeof tr[2] == "object") && (tr[2] instanceof Array)) {
				tr[2] = tr[2].sort(function(a, b){return b[1]-a[1]});
				is_space = (/\n\s*$/.test(trans_text2)) ? false : (trans_text2) ? tr[2][0][2] : false;
				trans_text2 += ((is_space && trans_text2) ? ' ' : '') + tr[2][0][0];
			} else {
				tr[2] = null;
				trans_text2 += tr[4];
			}
			res.translate.push({
				'source_text' : tr[0],
				'translate_variant' : tr[2],
				'translate_variant2' : tr[4],
				'pos_source_start' : tr[3][0][0],
				'pos_source_end' : tr[3][0][1],
				'is_space' : is_space
			});
		} catch(e) {
		}
	}
	res.fast_translate.translate = (trans_text2 != '') ? trans_text2 : trans_text;
	//-------------------------------------
	// [7]
	//-------------------------------------
	if (jrsp[7] && (typeof jrsp[7] == "object") && (jrsp[7] instanceof Array)) {
		res.correct_text = jrsp[7][1];
	}
	//-------------------------------------
	// [8]
	//-------------------------------------
	if (jrsp[8] && (typeof jrsp[8] == "object") && (jrsp[8] instanceof Array)) {
		var lang = jrsp[8][0];
		if (lang && (typeof lang == "object") && (lang instanceof Array)) {
			if (lang.length == 1) {
				res.lang_src_2 = lang[0];
			}
		}
	}

	//-------------------------------------------------------------------------------------
	var result = {
		"sentences" : {"trans" : res.fast_translate.translate, "orig" : res.fast_translate.source },
		"src" : res.lang_src,
		"src_2" : res.lang_src_2,
		"server_time" : 99999,
		"translate_object" : res,
		"correct_text" : res.correct_text,
		"transcription" : res.fast_translate.transcription,
		"translate_list" : res.translate
	};

	return result;
}
//-------------------------------------------------------------------------------------------
s3gt.translate.get_response_error = function(responseText) {
	var google_link = s3gt.protocol_google_translator + s3gt.domain_google_translator;
	var error_text = s3gt.utils.get_string('alert.request.error.requst.to.google.server');
	error_text = error_text.replace(/\%TRANSLATE_GOOGLE_DOMAIN\%/i, google_link);
	var found = responseText.match(/<div style\=\"margin\-left: 4em;\"><h1>(.*?)<\/p><\/div>/);
	if (found) {
		error_text = found[1].replace(/<\/h1><p>/,"\n");
	} else if (/action\="CaptchaRedirect"/.test(responseText)) {
		error_text = s3gt.utils.get_string('message.captcha.detected_title') + "\n" + s3gt.utils.get_string('message.captcha.detected_text') + ' ' + google_link;
	}
	return error_text;
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request_text_short = function(data) {
	//-----------------------------------------------------------------------------------
	var tkk = s3gt.work_data.google_value_tk || s3gt.utils.prefs_get('google_value_tk') || '';
	if (tkk && (! /^ZZZ\|\|\|/.test(tkk))) {
		s3gt.translate.google_request_text_short_tkk(data);
	} else {
		s3gt.translate.google_request_text_short_batchexecute(data, tkk);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request_text_short_batchexecute = function(data, tkk) {
	var tkk_key = '';

	var res = /^ZZZ\|\|\|(.*?)\:(.*)$/i.exec(tkk);
	if (res != null) {
		tkk_key = res[1] + '%3A' + res[2];
		tkk_key = '&at=' + tkk_key + '&';
	}

	var url = s3gt.work_data.url_translate_text_batchexecute_short;
	url = url.replace(/LANG_TO/g, data.lang_to);
	url = url.replace(/GOOGLE_KEY/g, s3gt.work_data.google_value_tk_newkey_short);

	var data_text = JSON.stringify([data.lang_from,data.lang_to,data.text_list]);
	var data_request = JSON.stringify([[[s3gt.work_data.google_value_tk_newkey_short,data_text,null,"generic"]]]);

	var req = new XMLHttpRequest();
	req.timeout = 10000;

	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			var jsonResp = req.responseText;
			jsonResp = jsonResp.replace(/\n|\r/g, '');
			var res = /\[\[\"wrb\.fr",\".*?\",\"(.*?)\"[^\"]+\"generic\"\]/i.exec(jsonResp);
			if (res != null) {
				try {
					var jrsp1 = JSON.parse('["' + res[1] + '"]');
					jsonResp = jrsp1[0];
					var jrsp = JSON.parse(jsonResp);
					if (jrsp) {
						if (! ((typeof jrsp == "object") && (jrsp instanceof Array))) {
							jrsp = [jrsp];
						} else {
							jrsp = jrsp[0];
						}
						data.jrsp = jrsp;
						data.callback(s3gt.utils.clone_object(data));
					}
				} catch (e) {
				}
			}
		}
	};

	req.open("POST", url, true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
	req.setRequestHeader("x-secfetchsite", 'same-origin');
	req.send('f.req=' + encodeURIComponent(data_request) + tkk_key);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_request_text_short_tkk = function(data) {
	var url = s3gt.work_data.url_translate_text_short;
	url = url.replace("LANG_FROM", data.lang_from);
	url = url.replace(/LANG_TO/g, data.lang_to);
	url = url.replace(/GOOGLE_TK/g, s3gt.translate.google_value_tk(data.text_list.join('')));

	for (var i=0; i<data.text_list.length; i++) {
		url += '&q=' + s3gt.utils.urlencode(data.text_list[i]);
	}
	var url_part = url.split('?', 2);

	var req = new XMLHttpRequest();
	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			try {
				var jrsp = JSON.parse(req.responseText);
				if (jrsp) {
					if (! ((typeof jrsp == "object") && (jrsp instanceof Array))) {
						jrsp = [jrsp];
					}
					data.jrsp = jrsp;
					data.callback(s3gt.utils.clone_object(data));
				}
			} catch (e) {
			}
		}
	};

/*
	if (unescape(encodeURIComponent(url_part[1])).length>1700) {
		req.open("POST", url_part[0], true);
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		req.send(url_part[1]);
	} else {
		req.open("GET", url, true);
		req.send(null);
	}
*/
	req.open("GET", url, true);
	req.setRequestHeader("x-secfetchsite", 'same-origin');
	req.send(null);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_speech_request_batchexecute = function(tkk, sound_lang, string) {
	var tkk_key = '';
	
	var res = /^ZZZ\|\|\|(.*?)\:(.*)$/i.exec(tkk);
	if (res != null) {
		tkk_key = res[1] + '%3A' + res[2];
		tkk_key = '&at=' + tkk_key + '&';
	}
	
	var url = s3gt.work_data.url_sound_tts_google_batchexecute;
	url = url.replace(/LANG_TO/g, sound_lang);
	url = url.replace(/GOOGLE_KEY/g, s3gt.work_data.google_value_tk_newkey_sound);
	
	var data_text = JSON.stringify([string, sound_lang, null, "null"]);
	var data_request = JSON.stringify([[[s3gt.work_data.google_value_tk_newkey_sound,data_text,null,"generic"]]]);
	
	var req = new XMLHttpRequest();
//	req.timeout = 10000;
	
	req.onreadystatechange = function () {
		if (req.readyState == 4) {
//			return s3gt.translate.google_speech_response_batchexecute(req.responseText);
		}
	};

	req.open("POST", url, false);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
	req.setRequestHeader("x-secfetchsite", 'same-origin');
	req.send('f.req=' + encodeURIComponent(data_request) + tkk_key);

	return s3gt.translate.google_speech_response_batchexecute(req.responseText);
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_speech_response_batchexecute = function(jsonResp) {
	var jrsp_tmp;
	jsonResp = jsonResp.replace(/\n|\r/g, '');

	var res = /\[\[\"wrb\.fr",\".*?\",\"(.*?)\"[^\"]+\"generic\"\]/i.exec(jsonResp);
	if (res == null) {
	} else {
		try {
			var jrsp1 = JSON.parse( '"' + res[1] + '"' );
			jsonResp = 'data:audio/wav;base64,' + JSON.parse(jrsp1)[0];
			return jsonResp;
		} catch (e) {
		}
	}
	return '';
}
//-------------------------------------------------------------------------------------------
s3gt.translate.sound_complete = function(is_ok) {
	if (! s3gt.translate.sound_complete_beep) {
		s3gt.translate.sound_complete_beep = new Audio();
		s3gt.translate.sound_complete_beep.preload = 'none';
	}

	var soundLoc;

	if (is_ok) {
		soundLoc = s3gt.work_data.url_extension + '/skin/complete_beep_ok.wav';
	} else {
		soundLoc = s3gt.work_data.url_extension + '/skin/complete_beep_error.wav';
	}

	s3gt.translate.sound_complete_beep.src = soundLoc;
	s3gt.translate.sound_complete_beep.load();
	s3gt.translate.sound_complete_beep.play();
}
//-------------------------------------------------------------------------------------------
s3gt.translate.google_value_tk = function(text) {
	var res = s3gt.utils.google_value_tk(text);
	return res;
}
//-------------------------------------------------------------------------------------------
