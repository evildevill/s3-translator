s3gt.sound = {};

s3gt.sound.audio_current = null;
s3gt.sound.audio_list = [];
s3gt.sound.string_list = [];
s3gt.sound.lang = '';
s3gt.sound.callback = null;
s3gt.sound.playback_rate = 100;
s3gt.sound.captcha_check = false;
s3gt.sound.captcha_detected = false;
s3gt.sound.playPromise = undefined;

//-------------------------------------------------------------------------------------------
s3gt.sound.init = function() {
//	window.removeEventListener("load", s3gt.sound.init, false);
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play_tts = function(lang, text, callback, playback_rate) {
	s3gt.sound.play_off();
	s3gt.sound.captcha_check = false;
	s3gt.sound.captcha_detected = false;

	s3gt.sound.playback_rate = playback_rate || s3gt.utils.prefs_get('sound_playback_rate');
	if ((s3gt.sound.playback_rate >= 50) && (s3gt.sound.playback_rate <= 150)) {
	} else {
		s3gt.sound.playback_rate = 100;
	}

	if (lang && text) {
		s3gt.sound.play_tts_google(lang, text, callback);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play_tts_google = function(lang, text, callback) {
	var string_limit = s3gt.prefs.translate_text_tts_max_length;
	s3gt.sound.callback = callback;
	//-----------------------------------------------------------------------------------
	var myRe = /.+?([\,\.\?\!\:\n]+|$)/g;
	text = text.replace(/\r/g, '');
	var string_list = text.match(myRe);
	if (string_list == null) {
		string_list = [text];
	}

	var string_list_tmp = [];
	for (var string_id=0; string_id<string_list.length; string_id++) {
		var string = string_list[string_id];
		while (string.length > string_limit) {
			var str_tmp = string.substring(0, string_limit);
			str_tmp = str_tmp.replace(/[\S]+$/, '');
			if (str_tmp.length > 0) {
				string = string.substring(str_tmp.length);
				string_list_tmp.push(str_tmp);
			} else {
				string_list_tmp.push(string.substring(0, string_limit));
				string = string.substring(string_limit);
			}
		}
		string_list_tmp.push(string);
	}

	//-----------------------------------------------------------------------------------
	s3gt.sound.string_list = string_list_tmp;
	s3gt.sound.lang = lang;
	s3gt.sound.clear();
	s3gt.sound.play();
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play = function() {
	var no_while = true;
	var audio_list_length = s3gt.sound.audio_list.length;

	while ((audio_list_length < 5) && (s3gt.sound.string_list.length > 0)) {
		no_while = false;
		var string = s3gt.sound.string_list.shift();
		string = string.replace(/^\s+|\s+$/g, '');
		audio_list_length = audio_list_length + 1;
//		if (string == '') { continue; }

		var is_last = true;
		if ((audio_list_length < 5) && (s3gt.sound.string_list.length > 0)) {
			is_last = false;
		}

		var audio = new Audio();
		audio.preload = "auto";
		audio.addEventListener("ended", s3gt.sound.ended, true);
		audio.playbackRate = 1 * s3gt.sound.playback_rate / 100;
	
		audio.addEventListener("error", s3gt.sound.error, true);
		s3gt.sound.audio_list.push(audio);

		s3gt.sound.play_get_url(audio, string, is_last, function(is_last_audio) {
			if (is_last_audio) {
				s3gt.sound.play2();
			}
		});
	}

	if (no_while) {
		s3gt.sound.play2();
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play2 = function() {
	s3gt.sound.audio_current  = s3gt.sound.audio_list.shift();
	//-------------------------------------------------------------------------------------
	if (s3gt.sound.audio_current) {
		s3gt.sound.audio_current.playbackRate = 1 * s3gt.sound.playback_rate / 100;
		if (! s3gt.sound.audio_current.error) {
			s3gt.sound.playPromise = s3gt.sound.audio_current.play();
			s3gt.sound.playPromise.then(function() {
				// Automatic playback started!
			}).catch(function(error) {
				var tooltip = s3gt.tooltip.get_tooltip_from_doc('mini');
				if (tooltip) {
					var tooltip_sound = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_mini_sound');
					if (tooltip_sound) {
						tooltip_sound.sound_lang = s3gt.sound.lang;
					}
				}
				s3gt.sound.play_off();
			});
		} else {
			s3gt.sound.play();
		}
	} else {
		s3gt.sound.play_off();
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play_get_url = function(audio, string, is_last_audio, callback) {
	var tkk = s3gt.work_data.google_value_tk || s3gt.utils.prefs_get('google_value_tk') || '';
	if (tkk && (! /^ZZZ\|\|\|/.test(tkk))) {
		s3gt.sound.play_get_url_tkk(audio, string, is_last_audio, callback);
	} else {
		s3gt.sound.play_get_url_batchexecute(audio, string, is_last_audio, tkk, callback);
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play_get_url_batchexecute = function(audio, string, is_last_audio, tkk, callback) {
	chrome.runtime.sendMessage({ 'sound_play_get_url_batchexecute': true, 'string' : string, 'tkk' : tkk, 'sound_lang' : s3gt.sound.lang }, function(response) {
		audio.src =  response.url;
		callback(is_last_audio);
	});
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play_get_url_tkk = function(audio, string, is_last_audio, callback) {
	var url = s3gt.work_data.url_sound_tts_google;
	url = url.replace("LANG", s3gt.sound.lang);
	url = url.replace("TEXT_LENGTH", string.length);
	url = url.replace("TEXT_REQ", s3gt.utils.urlencode(string));
	url = url.replace(/GOOGLE_TK/g, s3gt.sound.google_value_tk(string));

	audio.src =  url;

	callback(is_last_audio);
}
//-------------------------------------------------------------------------------------------
s3gt.sound.error = function(event) {
	//-------------------------------------------------------------------------------------
	chrome.runtime.sendMessage({ 'google_value_tk_load': true }, function(response) {});
	//-------------------------------------------------------------------------------------
	if (! s3gt.sound.captcha_check) {
		s3gt.sound.captcha_check = true;
		var url = event.target.src;
		var req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				s3gt.sound.error_detect(url, req.responseText);
			}
		};
		req.open("GET", url, true);
		req.send(null);
	}
	//-------------------------------------------------------------------------------------
	if (s3gt.sound.captcha_detected) {
		s3gt.sound.play_off();
	}
	//-------------------------------------------------------------------------------------
	if (! event.target.paused) {
		s3gt.sound.play();
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.error_detect = function(url, responseText) {
	var error_text = '';
	var error_title = '';
	//----------------------------------------------------------------------------------------
	var found = responseText.match(/<div style\=\"margin\-left: 4em;\"><h1>(.*?)<\/p><\/div>/);
	if (found) {
		error_text = found[1].replace(/<\/h1><p>/,"\n");
	} else if (/action\="CaptchaRedirect"/.test(responseText)) {
		error_text = s3gt.utils.get_string('message.captcha.detected_text');
		error_title = s3gt.utils.get_string('message.captcha.detected_title');
	}
	if (error_text != '') {
		s3gt.sound.captcha_detected = true;
		s3gt.sound.play_off();
		chrome.runtime.sendMessage({ 'notification_box': true, 'msg' : error_text + "\n" + url, 'title' : error_title, 'url' : url }, function(response) {});
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.ended = function() {
	s3gt.sound.play();
}
//-------------------------------------------------------------------------------------------
s3gt.sound.clear = function() {
	for (var audio in s3gt.sound.audio_list) {
		try {
			audio.pause();
			audio.load();
		} catch(e) {
		}
	}
	if (s3gt.sound.audio_current) {
		if (s3gt.sound.playPromise) {
			try {
				s3gt.sound.audio_current.pause();
				s3gt.sound.audio_current.load();
			} catch(e) {
			}
		}
		s3gt.sound.audio_current = null;
	}
	s3gt.sound.audio_list = [];
}
//-------------------------------------------------------------------------------------------
s3gt.sound.play_off = function() {
	s3gt.sound.clear();
	if (s3gt.sound.callback && s3gt.sound.callback.sound_stop) {
		try {
			s3gt.sound.callback.sound_stop();
		} catch(e) {
		}
		s3gt.sound.callback.sound_stop = null;
	}
}
//-------------------------------------------------------------------------------------------
s3gt.sound.google_value_tk = function(text) {
	var res = s3gt.utils.google_value_tk(text);
	return res;
}
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
// window.addEventListener("load", s3gt.sound.init, false);
