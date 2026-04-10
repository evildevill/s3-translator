s3gt.learning = {};
s3gt.learning.min_length = 50;
s3gt.learning.max_count = 1;

//-------------------------------------------------------------------------------------------
s3gt.learning.run = function() {
	var lang_to = s3gt.utils.prefs_get("learning_lang_to");
	var lang_from = s3gt.utils.prefs_get("learning_lang_from");
	if (lang_to == lang_from) { return; }
	if (lang_to == 'auto') { return; }

	//------------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("learning_only_http")) {
		var protocol = 'http:';
		try {
			protocol = document.location.protocol;
		} catch(e) {
		}
		if (protocol == 'https:') {
			return;
		}
	}
	//------------------------------------------------------------------------------------
	var body = document.getElementsByTagName('body')[0];
	s3gt.learning.min_length = s3gt.utils.prefs_get('learning_min_length', 50);
	var max_count = s3gt.utils.prefs_get('learning_max_count', 1);

	var result = [];
	if (body) {
		result = s3gt.learning.get_text_node_list(body, result);
	}
	if (result.length > 0) {
		for (var count=0; count<max_count; count++) {
			var content_el = result[Math.floor(Math.random()*result.length)];
			s3gt.learning.request(content_el, lang_to);
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.learning.request = function(content_el, lang_to) {
	var data = { 'text' : content_el.text, 'lang_from' : 'auto', 'lang_to' : lang_to, 'is_translate_reverse' : true };
	data.id_translate_session = Math.random();
	s3gt.wait_session[data.id_translate_session] = function(result) {
		s3gt.learning.translate_response(result, content_el);
	}
	s3gt.translate.google_request(data);
}
//-------------------------------------------------------------------------------------------
s3gt.learning.translate_response = function(data, content_el) {
	if (! data.result.is_ok) { return; }
	var result = data.result;
	if (result.text == content_el.text) { return; }
	var lang_from = s3gt.utils.prefs_get("learning_lang_from");
	if ((lang_from != 'auto') && (result.lang_from != lang_from)) { return; }

	try {
		var rng = document.createRange();
		var start_pos = content_el.node.nodeValue.indexOf(content_el.text);
		if (start_pos >= 0) {
			rng.setStart( content_el.node, start_pos );
			rng.setEnd( content_el.node, start_pos + content_el.text.length );
	
			var el_new = document.createElement('span');
			el_new.style.paddingLeft = '3px';
			el_new.style.paddingRight = '3px';
			el_new.style.cursor = 'help';
			if (s3gt.utils.prefs_get("learning_border",  false)) {
				el_new.style.border = '1px solid ' + s3gt.utils.prefs_get("learning_border_color");
			}
			if (s3gt.utils.prefs_get("learning_font",  false)) {
				el_new.style.color = s3gt.utils.prefs_get("learning_font_color");
			}
			if (s3gt.utils.prefs_get("learning_background",  false)) {
				el_new.style.backgroundColor = s3gt.utils.prefs_get("learning_background_color");
			}
			el_new.original_text = content_el.text;
			el_new.translate_text = result.text;
			el_new.lang_from = result.lang_from;
			el_new.lang_to = data.lang_to;
			el_new.addEventListener("mouseover", s3gt.learning.mouseover, true);
			el_new.appendChild(document.createTextNode(result.text));
			rng.deleteContents();
			rng.insertNode(el_new);
			el_new.setAttribute('title', el_new.original_text);
			el_new.document = document;
		}
	} catch(e) {
	}
}
//-------------------------------------------------------------------------------------------
s3gt.learning.mouseover = function(event) {
	var el = event.target;
	if (! el.original_text) { return; }

	//------------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("learning_show_translation_in_tooltip")) {
		if (s3gt.tooltip.pin_check(event, 'fly')) { return; }
	
		var tooltip = s3gt.tooltip.create_fly(event, el.translate_text || el.original_text);
		if (tooltip) {
			s3gt.tooltip.create_panel(tooltip, el.lang_to, el.lang_from, { 
				'learning' : function() { s3gt.learning.reset_text(el) },
				'create_panel' : function() { s3gt.learning.mouseover_panel(tooltip, el) }
			});
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.learning.mouseover_panel = function(tooltip, el) {
	var txt_to = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to');
	txt_to.set_value(el.original_text);
	tooltip.translate_text = el.original_text;

	s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_to_box'), false);

	if (s3gt.utils.prefs_get("view_reverse_translate_tooltip")) {
		s3gt.tooltip.please_wait(s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_txt_reverse_box'), true);

		var el_lang_reverse = s3gt.utils.get_element(tooltip, 's3gt_translate_tooltip_lang_reverse');
		var lang_to = el_lang_reverse.value;
		if (el_lang_reverse.value == 'reverse') {
			lang_to = el.lang_to;
		}

		var data = { 'text' : txt_to.get_value(), 'lang_from' : el.lang_from, 'lang_to' : lang_to, 'is_translate_reverse' : true };
		data.id_translate_session = Math.random();
		tooltip.id_translate_session = data.id_translate_session;
		s3gt.wait_session[data.id_translate_session] = function(result) {
			s3gt.translate.response_fly(result, tooltip);
		}
		s3gt.translate.google_request(data);
	}
	s3gt.tooltip.repos(tooltip);
}
//-------------------------------------------------------------------------------------------
s3gt.learning.reset_text = function(el) {
	if (! el.original_text) { return; }
	var span_txt = document.createElement('span');
	try {
		span_txt.appendChild(document.createTextNode(el.original_text));
		el.parentNode.replaceChild(span_txt, el);
	} catch(e) {
	}
}
//-------------------------------------------------------------------------------------------
s3gt.learning.get_text_node_list = function(el, result) {
	if (el.childNodes && (el.childNodes.length > 0)) {
		var el_list = el.childNodes;
		for (var i=0; i<el_list.length; i++) {
			if (result.length < 500) {
				s3gt.learning.get_text_node_list(el_list[i], result);
			}
		}
	} else if (/^(p|div|span|a|td|b|strong|li|u|i|s|dd)$/i.test(el.parentNode.nodeName) && (el.nodeType == Node.TEXT_NODE) && (el.nodeValue.length > s3gt.learning.min_length)) {
		try {
			var myRe = /.*?([\,\:\.\?\!]+|$)/g;
			var content_list = el.nodeValue.match(myRe);
			if (content_list == null) {
				content_list = [el.nodeValue];
			}
			var content_list_tmp = [];
			for (var content_id=0; content_id<content_list.length; content_id++) {
				var content_el = content_list[content_id].replace(/^\s+|\s+$/g, '');
				if ((content_el.length > s3gt.learning.min_length) && (/^[^\.\,\\\/\:\!\?\*\%\=\+]/.test(content_el))) {
					content_list_tmp.push(content_el);
				}
			}
			if (content_list_tmp.length > 0) {
				var text = content_list_tmp[Math.floor(Math.random()*content_list_tmp.length)];
				result.push({ 'node': el, 'text': text });
			}
		} catch(e) {
		}
	}
	return result;
}
