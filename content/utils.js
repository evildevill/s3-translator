s3gt.utils = {};

//------------------------------------------------------------------------------
s3gt.utils.console_log = function(msg) {
	console.log('%O', msg);
}
//------------------------------------------------------------------------------
s3gt.utils.prefs_get = function(pref_name, default_value) {
	var pref_value = s3gt.prefs.get(pref_name);
	if (pref_value === undefined) {
		return default_value;
	}
	try {
		return s3gt.utils.clone_object(pref_value);
	} catch(e) {
		return pref_value;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.prefs_set = function(pref_name, pref_value) {
	s3gt.prefs.set({ 'name' : pref_name, 'value' : pref_value });
	return true;
}
//------------------------------------------------------------------------------
s3gt.utils.get_string = function(name, params, only_result) {
	var result = '';
	if (! params) { params = [] }

	try {
		result = s3gt.i18n.get_string(name, params);
	} catch(e) {
		result = name + e;
	}
	if (only_result) {
		return result;
	} else {
		return result || name;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.check_bool = function(bool_value) {
	return (String(bool_value) == 'true');
}
//------------------------------------------------------------------------------
s3gt.utils.clone_object = function(object) {
	return JSON.parse(JSON.stringify(object));
}
//------------------------------------------------------------------------------
s3gt.utils.clone_object_event = function(event) {
	var ev = {};
	for (var i in event) {
		if ((typeof(event[i]) != 'object') && (typeof(event[i]) != 'function')) {
			ev[i] = event[i];
		}
	}
	return s3gt.utils.clone_object(ev);
}
//------------------------------------------------------------------------------
s3gt.utils.get_element = function(parent, search_id) {
	var doc = document;
	if (parent.tframe && parent.tframe.contentDocument) {
		doc = parent.tframe.contentDocument;
		parent = parent.tframe.contentDocument.documentElement;
	}
	if (parent == null) { return null; };

	var node_list = doc.createNodeIterator(parent, NodeFilter.SHOW_ELEMENT, null, false);
	var node_current;
	while (node_current = node_list.nextNode()) {
		if (node_current.id == search_id) {
			return node_current;
		}
	}
	return null;
}
//------------------------------------------------------------------------------
s3gt.utils.get_element_2 = function(parent, search_id) {
	if (parent.tframe && parent.tframe.contentDocument) {
		parent = parent.tframe.contentDocument.documentElement;
	}
	if (parent == null) { return null; };

	for (var i=0; i<parent.childNodes.length; i++) {
		var el = parent.childNodes[i];
		if (el.id == search_id) {
			return el;
		}
		if (el.hasChildNodes()) {
			var res = s3gt.utils.get_element(el, search_id);
			if (res != null) {
				return res;
			}
		}
	}
	return null;
}
//------------------------------------------------------------------------------
s3gt.utils.get_pos_x = function(event) {
	event = event || {};
	if (event.OFF_mozMovementX !== undefined) {
		return event.mozMovementX;
	} else if (event.OFF_movementX !== undefined) {
		return event.movementX;
	} else if (event.clientX) {
		return event.clientX;
	} else {
		var client_width = document.documentElement.clientWidth / 2;
		var tooltip_width = s3gt.utils.prefs_get('tooltip_width') / 2;
		return client_width - tooltip_width;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.get_pos_y = function(event) {
	event = event || {};
	if (event.OFF_mozMovementY !== undefined) {
		return event.mozMovementY;
	} else if (event.OFF_movementY !== undefined) {
		return event.movementY;
	} else if (event.clientY) {
		return event.clientY;
	} else {
		var client_height = Math.floor(document.documentElement.clientHeight / 2);
		var tooltip_height = Math.floor(((s3gt.utils.prefs_get('tooltip_height_from') * 3) + 20) / 2);
		return client_height - tooltip_height;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.get_real_pos_x = function(tooltip, e_pageX) {
//	var width = tooltip.clientWidth;
//	var width_zoom = (width - width * s3gt.main.zoom_index);
//	return (e_pageX + width_zoom) / s3gt.main.zoom_index;
	var zoom_index = s3gt.main.zoom_index;
//	var zoom_index = window.devicePixelRatio || 1;

	return e_pageX / zoom_index;
}
//------------------------------------------------------------------------------
s3gt.utils.get_real_pos_y = function(tooltip, e_pageY) {
//	var height = tooltip.clientHeight;
//	var height_zoom = (height - height * s3gt.main.zoom_index);
//	return (e_pageY + height_zoom) / s3gt.main.zoom_index;
	var zoom_index = s3gt.main.zoom_index;
//	var zoom_index = window.devicePixelRatio || 1;

	return e_pageY / zoom_index;
}
//------------------------------------------------------------------------------
s3gt.utils.get_zoom_value = function(reverse) {
	if (reverse) {
		return (s3gt.utils.prefs_get("tooltip_use_webpage_zoom")) ? s3gt.main.zoom_index : 1;
	} else {
		return (s3gt.utils.prefs_get("tooltip_use_webpage_zoom")) ? 1 : s3gt.main.zoom_index;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.HTMLDOM_value = function(html_element, value) {
	var tagName = (html_element.tagName) ? html_element.tagName.toUpperCase() : '#text';
	var is_input_tag = ((tagName == 'INPUT') || (tagName == 'TEXTAREA')) ? true : false;

	if (value === undefined) {
		return (is_input_tag) ? html_element.value : html_element.textContent;
	} else {
		if (is_input_tag) {
			html_element.value = value;
		} else {
			while (html_element.firstChild) {
				html_element.removeChild(html_element.firstChild);
			}
			//-----------------------------------------------------------
			if (html_element.hasAttribute('label_nobr')) {
				value = value.replace(/\n/g, ' ').replace(/\s+/g, ' ');
			}
			//-----------------------------------------------------------
			var text_list = value.split(/\n/);
			for (var i=0; i<text_list.length; i++) {
				var txt = text_list[i]
				if ((i < text_list.length) && (text_list.length > 1)) {
					txt += "\n";
				}
				html_element.appendChild(document.createTextNode(txt));
				if ((i < text_list.length) && (text_list.length > 1)) {
					html_element.appendChild(document.createElement('br'));
				}
			}
		}
		return;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.i18n_parse = function(doc) {
	s3gt.i18n.parse_html(doc);
}
//------------------------------------------------------------------------------
s3gt.utils.urlencode = function(str) {
	str = (str + '').toString();
	return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}
//------------------------------------------------------------------------------
s3gt.utils.urlparse = function(str) {
	var arr = str.split('#');
 	var result = {};
	var part = arr[0];
	var qindex = part.indexOf('?');
	if( qindex==-1 ) {
		return result;
	}
	var args = part.substring(qindex+1);
	args = args.split('&');
	for (var i=0; i<args.length; i++) {
		var val = args[i];
		var keyval = val.split('=');
		if (keyval && keyval.length > 1) {
			keyval[0] = decodeURIComponent(keyval[0].replace(/\+/g, ' ')).replace(/\%21/g, '!').replace(/\%27/g, "'").replace(/\%28/g, '(').replace(/\%29/g, ')').replace(/\%2A/g, '*');
			keyval[1] = decodeURIComponent(keyval[1].replace(/\+/g, ' ')).replace(/\%21/g, '!').replace(/\%27/g, "'").replace(/\%28/g, '(').replace(/\%29/g, ')').replace(/\%2A/g, '*');
			result[keyval[0]] = keyval[1];
		}
	}
	return result;
}
//------------------------------------------------------------------------------
s3gt.utils.get_request = function(params) {
	var url_part = params.url.split('?', 2);

	var req = new XMLHttpRequest();
	if (params.timeout) {
		req.timeout = params.timeout;
	}

	if (! params.type) {
		var text_length = url_part[1].length;
		params.type = (text_length>750) ? 'POST' : 'GET';
	}

	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			if (req.status == 200) {
				if (params.success) {
					params.success(req.responseText);
				}
			} else {
				if (params.error) {
					params.error(req.statusText);
				}
			}
		}
	};

	if (params.type == 'POST') {
		req.open("POST", url_part[0], true);
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		req.send(url_part[1]);
	} else {
		req.open("GET", params.url, true);
		req.send(null);
	}

	return req;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.random_string = function(size) {
	var size = size || 5;
	var a = 'qwertyuiopasdfghjklzxcvbnm0123456789';
	var result = '';
	for (var i=0; i<size; i++) {
		result += a.substr(Math.floor(Math.random() * a.length), 1);
	}
	return result;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.set_last_lang_to = function(lang) {
	s3gt.utils.prefs_set('last_lang_to', lang);
}
//-------------------------------------------------------------------------------------------
s3gt.utils.set_last_lang_from = function(lang) {
	s3gt.utils.prefs_set('last_lang_from', lang);
}
//-------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------
s3gt.utils.parse_document = function(doc, data) {
	if (doc.childNodes && doc.childNodes.length) {
		for (var i=0; i<doc.childNodes.length; i++) {
			var el = doc.childNodes[i];
			if (el.hasChildNodes()) {
				s3gt.utils.parse_document(el, data);
			}
			else {
				var value = s3gt.utils.HTMLDOM_value(el);
				value = s3gt.utils.parse_template(value, data);
				s3gt.utils.HTMLDOM_value(el, value);
			}
		}
	}
}
//-------------------------------------------------------------------------------------------
s3gt.utils.parse_template = function(str, data) {
	// str = "asd ${a1} ${bbb}"
	// data = { 'a1' : '555', 'bbb' : 'wow!'}

	for (var d in data) {
		var regexp = new RegExp("\\${" + d + "}", "g");
		str = str.replace(regexp, data[d]);
	}

	function replacer(str, p1, p2, offset, s) {
		var keys = p2.split('-');
		if (keys.length>1) {
			var d = data;
			for (var i=0; i<keys.length; i++) {
				var key = keys[i];
				if (d[key] != undefined) {
					d = d[key];
				} else {
					return p1;
				}
			}
			if (d != undefined) {
				return d;
			}
		}
		return p1;
	}

	str = str.replace(/(\$\{([^\}]+)\})/g, replacer);
	return str;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.get_http_protocol = function() {
	if (window.location.protocol) {
		return window.location.protocol + '//';
	} else {
		return 'http://';
	}
}
//-------------------------------------------------------------------------------------------
s3gt.utils.get_http_domain = function() {
	if (window.location.hostname) {
		return window.location.hostname;
	} else {
		return '';
	}
}
//-------------------------------------------------------------------------------------------
s3gt.utils.get_url_domain = function(url) {
	if (/^https?:\/\/.*/.test(url)) {
		return url.replace(/^https?:\/\/([^\/]+).*$/gi, '$1');
	}
	else if (/^ftps?:\/\/.*/.test(url)) {
		return url.replace(/^ftps?:\/\/([^\/]+).*$/gi, '$1');
	}
	else {
		return '';
	}
}
//-------------------------------------------------------------------------------------------
s3gt.utils.get_elem_text = function(node) {  
	var _result = '';
	if (node == null) {
		return _result;
	}
	var childrens = node.childNodes;
	var i = 0;
	while (i < childrens.length) {
		var child = childrens.item(i);
		if ((child.nodeType == 1) || (child.nodeType == 5)) {
			if ((child.parentElement.nodeName != "SCRIPT") && (child.parentElement.nodeName != "NOSCRIPT") && (child.parentElement.nodeName != "STYLE") && (child.parentElement.nodeName != "HEAD") && (child.parentElement.nodeName != "CODE")) {
				_result += arguments.callee(child);
			}
		}
		if ((child.nodeType == 2) || (child.nodeType == 3) || (child.nodeType == 4)) {
			if ((child.parentElement.nodeName != "SCRIPT") && (child.parentElement.nodeName != "NOSCRIPT") && (child.parentElement.nodeName != "STYLE") && (child.parentElement.nodeName != "HEAD") && (child.parentElement.nodeName != "CODE")) {
				_result += child.nodeValue;
			}
		}
		i++;
	}
	return _result;
}
//------------------------------------------------------------------------------
s3gt.utils.check_last_lang_to = function(default_lang) {
	var lang_last = s3gt.utils.prefs_get('last_lang_to');
	if (s3gt.utils.check_enable_lang_to(lang_last, s3gt.utils.prefs_get('list_disabled_lang_to'))) {
		return lang_last;
	} else {
		return default_lang;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.check_last_lang_from = function(default_lang) {
	var lang_last = s3gt.utils.prefs_get('last_lang_from');
	var lang_result = default_lang;

	//-----------------------------------------------------------------------------------
	if (s3gt.utils.prefs_get("save_last_lang_from",  false)) {
		var lang_list = s3gt.prefs.get_lang_list();
		//---------------------------------------------------------------------------
		for (var i=0; i<lang_list.length; i++) {
			if (lang_list[i].lang == lang_last) {
				lang_result = lang_last;
			}
		}
	}
	//-----------------------------------------------------------------------------------
	return lang_result;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.check_enable_lang_to = function(lang, disable_list_txt) {
	if (lang == 'auto') { return true; }
	if (lang == '') { return false; }
	if (lang == s3gt.prefs.lang_to) { return true; }

	var result = true;
	var disable_list = disable_list_txt.split(',');
	if (disable_list && disable_list.length > 0) {
		for (var lang_disable=0; lang_disable<disable_list.length; lang_disable++) {
			if (disable_list[lang_disable] == lang) {
				result = false;
			}
		}
	}

	return result;
}
//------------------------------------------------------------------------------
s3gt.utils.check_lang = function(lang) {
	var lang_ok = false;

	if (lang == 'zh-CN') {
		lang_ok = true;
	}
	else if (s3gt.prefs.check_lang_list(lang) == true) {
		lang_ok = true;
	} else {
		lang = lang.replace(/\s/g, '');
		lang = lang.replace(/^(\w+).*$/, "$1");

		if (s3gt.prefs.check_lang_list(lang) == true) {
			lang_ok = true;
		}
	}

	//---------------------------------------------------------------------------
	if (lang_ok == false) {
		lang = '';
	}

	return lang;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.check_domain_translate = function(domain, is_checkbox) {
	var domain_translate_list = s3gt.utils.prefs_get('domain_translate_list');
	var result = false;
	var is_domain_question = false;

	if (domain_translate_list[domain]) {
		if (domain_translate_list[domain].always_domain_translate) {
			result = true;
		}
		if (domain_translate_list[domain].always_domain_question !== undefined) {
			is_domain_question = true;
		}
	}

	var autotranslate = s3gt.utils.prefs_get("autotranslate");

	if (autotranslate == 'stop') {
		return false;
	}
	else if (! is_checkbox && is_domain_question && ((autotranslate == 'run') || (s3gt.utils.prefs_get("autotranslate_allpages")))) {
		return true;
	}
	else {
		return result;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.set_lang_icon = function(item, lang, is_checkbox) {
	if (lang != 'any') {
		item.style.background = 'url(' + chrome.runtime.getURL('/skin/flag/' + lang + '.png') + ') no-repeat';
		item.style.paddingLeft = '21px';
		item.style.marginLeft = '3px';
		item.style.backgroundPosition = '0 50%';
	}
}
//------------------------------------------------------------------------------
s3gt.utils.get_text_textbox = function(txt_box, use_selection, only_selection) {
	var text = '';

	if (txt_box.tagName.toUpperCase() == 'TEXTAREA') {
		try {
			if (use_selection) {
				text = txt_box.value.substr(txt_box.selectionStart, txt_box.selectionEnd - txt_box.selectionStart);
			}
		} catch(e) {
		}
		if (! only_selection) {
			text = (text.length > 0) ? text : txt_box.value;
		}
	}
	else {
		if (use_selection) {
			try {
				var doc = txt_box.ownerDocument;
				var win = doc.defaultView || doc.parentWindow;
				var range = win.getSelection().getRangeAt(0);
				var priorRange = range.cloneRange();
				priorRange.selectNodeContents(txt_box);
				var check_start = range.compareBoundaryPoints(range.START_TO_START, priorRange);
				var check_end = range.compareBoundaryPoints(range.END_TO_END, priorRange);
				if ((check_start >=0) && (check_end <=0)) {
					text = range.toString();
				}
			} catch(e) {
			}
		}
		if (! only_selection) {
			text = (text.length > 0) ? text : String(txt_box.textContent);
		}
	}

	return text;
}
//------------------------------------------------------------------------------
s3gt.utils.set_text_textbox = function(txt_box, text) {
	if (! text) { text = ''; }
	if (txt_box.tagName.toUpperCase() == 'TEXTAREA') {
		txt_box.value = text;
	}
	else {
		while (txt_box.firstChild) {
			txt_box.removeChild(txt_box.firstChild);
		}
		txt_box.appendChild(document.createTextNode(text));
	}
}
//------------------------------------------------------------------------------
s3gt.utils.keypress_enter = function(event) {
	if (event.keyCode === 13) {
		try {
			var win = event.target.ownerDocument.defaultView;
			s3gt.utils.insert_text("\n", win);
			document.execCommand('insertHTML', false, '<span></span>');
			s3gt.thtml.text_from_input(event);
			event.preventDefault();
			return false;
		} catch(e) {
		}
	}
	return true;
}
//------------------------------------------------------------------------------
s3gt.utils.keypress_readonly = function(event) {
	// onkeypress or onkeydown
	// allow Ctrl-A, Ctrl-(any arrow key) combinations
	if (event.ctrlKey) {
		return true;
	}
	// keycode: http://www.programming-magic.com/file/20080205232140/keycode_table.html
	if (33 <= event.keyCode && event.keyCode <= 40) {
		return true;
	}
	return false;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.getFocusedElement = function () { 
	try {
		return document.activeElement;
	} catch(e) {
	}
} 
//-------------------------------------------------------------------------------------------
s3gt.utils.get_selection_data = function(event) {
	return window.getSelection();
}
//-------------------------------------------------------------------------------------------
s3gt.utils.search_selected = function(event, is_html) {
	var getSelection = s3gt.utils.get_selection_data(event);
	if (getSelection && is_html) {
		var search_text = '';
		try {
			var range = getSelection.getRangeAt && getSelection.getRangeAt(0);
			var container = document.createElement("div");
                        container.appendChild(range.cloneContents());
			search_text = container.innerHTML;
		} catch(e) {
		}
		return search_text;
	}

	//-------------------------------------------------------------------------------------
	var searchStr = (getSelection) ? getSelection.toString() : '';
//	if ((searchStr == null) || (searchStr == '')) {
		try {
			var focusedElement = s3gt.utils.getFocusedElement();
			if (focusedElement && (focusedElement.type == 'password')) {
				searchStr = '';
			}
			else if (focusedElement && (focusedElement.type != 'password')) {
				if ((focusedElement.tagName.toUpperCase() == 'INPUT') || (focusedElement.tagName.toUpperCase() == 'TEXTAREA')) {
					searchStr = focusedElement.value.substr(focusedElement.selectionStart, focusedElement.selectionEnd - focusedElement.selectionStart);
				}
			}
		} catch(e) {
		}
//	}

	searchStr = searchStr.toString();
	searchStr = searchStr.replace( /^\s+/, "" );
	searchStr = searchStr.replace(/\s+$/,"");

	if (s3gt.utils.prefs_get('ignore_pdf_linebreaks')) {
		if (s3gt.utils.check_isPDF()) {
			searchStr = searchStr.replace(/\r/g, '').replace(/\n/g, ' ').replace(/\s+/g, ' ');
		}
	}

	return searchStr;
}
//------------------------------------------------------------------------------
s3gt.utils.save_selection = function() {
	try {
		var selection = window.getSelection();
		return selection.getRangeAt(0);
	} catch(e) {
		return null;
	}
}
//------------------------------------------------------------------------------
s3gt.utils.restore_selection = function(range) {
	if (range) {
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
}
//------------------------------------------------------------------------------
s3gt.utils.word_at_point = function(event) {
	var el = event.target;
	var textNode = null;

	try {
		if (document.caretPositionFromPoint) {
			var range = document.caretPositionFromPoint(event.clientX, event.clientY);
			textNode = range.offsetNode;
		} else if (document.caretRangeFromPoint) {
			var range = document.caretRangeFromPoint(event.clientX, event.clientY);
			textNode = range.startContainer;
		}
	} catch(e) {
	}

	return s3gt.utils.word_at_point_go(textNode || el, event.clientX, event.clientY);
}
//------------------------------------------------------------------------------
s3gt.utils.word_at_point_go = function(el, x, y) {
	if (el.nodeType == el.TEXT_NODE) {
		return s3gt.utils.word_at_point_text(el, x, y);
	} else {
		for(var i = 0; i < el.childNodes.length; i++) {
			var range = document.createRange();
			range.selectNodeContents(el.childNodes[i]);
			if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x && range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
				range.detach();
				return s3gt.utils.word_at_point_go(el.childNodes[i], x, y);
			} else {
				range.detach();
			}
		}
	}
	return '';
}
//------------------------------------------------------------------------------
s3gt.utils.word_at_point_text = function(el, mouse_x, mouse_y) {
	var range = el.ownerDocument.createRange();
	range.selectNodeContents(el);
	var start_pos = 0;
	var end_pos = range.endOffset;
	while ((start_pos + 1) < end_pos) {
		range.setStart(el, start_pos);
		range.setEnd(el, start_pos + 1);
		var rect = range.getBoundingClientRect();
		if ((rect.left <= mouse_x) && (rect.right >= mouse_x) && (rect.top <= mouse_y) && (rect.bottom >= mouse_y)) {
			start_pos = s3gt.utils.word_at_point_start(el, range);
			end_pos = s3gt.utils.word_at_point_end(el, range, end_pos);
			try {
				range.setStart(el, start_pos);
				range.setEnd(el, end_pos);
				var searchStr = range.toString();
				range.detach();
				return searchStr;
			} catch(e) {
				break;
			}
		}
		start_pos += 1;
	}
	return '';
}
s3gt.utils.word_at_point_start = function(el, range) {
	var start_pos = range.startOffset;
	while (start_pos > 0) {
		range.setStart(el, start_pos);
		var str = range.toString();
		if (/\s/.test(str.charAt(0))) {
			start_pos -= 1;
		} else {
			break;
		}
	}
	while (start_pos > 0) {
		range.setStart(el, start_pos);
		var str = range.toString();
		if (/[\/\\\:\*\?\'\"\<\>\|\s\+\.\,\@\#\^\(\)\=\!\;]/.test(str.charAt(0))) {
			return start_pos+1;
			break;
		}
		start_pos -= 1;
	}
	return start_pos;
}
s3gt.utils.word_at_point_end = function(el, range, endOffset) {
	var end_pos = range.endOffset;
	while (end_pos < endOffset) {
		range.setEnd(el, end_pos);
		var str = range.toString();
		if (/\s/.test(str.charAt(str.length - 1))) {
			end_pos += 1;
		} else {
			break;
		}
	}
	while (end_pos < endOffset) {
		range.setEnd(el, end_pos);
		var str = range.toString();
		if (/[\/\\\:\*\?\'\"\<\>\|\s\+\.\,\@\#\^\(\)\=\!\;]/.test(str.charAt(str.length - 1))) {
			return end_pos-1;
			break;
		}
		end_pos += 1;
	}
	return end_pos;
}
//------------------------------------------------------------------------------
s3gt.utils.get_pref_translate_selection_fly = function() {
	var is_fly = s3gt.utils.prefs_get("translate_selection_fly",  false);
	if (is_fly) {
		is_fly = s3gt.utils.prefs_get("translate_selection_fly_translate",  false) || 
			s3gt.utils.prefs_get("translate_selection_fly_translate_plus",  false) || 
			s3gt.utils.prefs_get("translate_selection_fly_sound",  false);
	}
	return is_fly;
}
//------------------------------------------------------------------------------
s3gt.utils.insert_text = function(text, win) {
	win = win || window;
	var selection = win.getSelection();
	var range = selection.getRangeAt(0);
	var text_el = win.document.createTextNode(text);
	range.deleteContents();
	range.insertNode(text_el);
	range.setStartAfter(text_el);
	range.setEndAfter(text_el);
	range.collapse(false);
	selection.removeAllRanges();
	selection.addRange(range);
}
//------------------------------------------------------------------------------
s3gt.utils.paste_textplain = function(event) {
	var clipboardData = event.clipboardData; 
	var win = event.target.ownerDocument.defaultView;
	var text = clipboardData.getData('text/plain');
	if (text) {
		try {
//			document.execCommand('insertText', false, text);
			s3gt.utils.insert_text(text, win);
//			win.document.execCommand('insertHTML', false, '<span></span>');
			s3gt.thtml.text_from_input(event);
		} catch(e) {
		}
	}
	event.preventDefault();
	return false;
}
//------------------------------------------------------------------------------
s3gt.utils.drop_textplain = function(event) {
	var text = event.dataTransfer.getData('text/plain');
	var win = event.target.ownerDocument.defaultView;
	if (text) {
		var range = null;
		if (win.document.caretRangeFromPoint) {
			range = win.document.caretRangeFromPoint(event.clientX, event.clientY);
		} else {
			range = win.document.createRange();
			range.setStart(event.rangeParent, event.rangeOffset);
		}
	
		var sel = win.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
		// event.target.focus();
		try {
			document.execCommand('insertText', false, text);
			s3gt.utils.insert_text(text, win);
//			document.execCommand('insertHTML', false, '<span></span>');
			s3gt.thtml.text_from_input(event);
		} catch(e) {
		}
	}
	event.preventDefault();
	return false;
}
//------------------------------------------------------------------------------
s3gt.utils.copy_clipboard = function(text, text_html, hide_notify) {
	var old_handler = document.oncopy;
	var handler = function(event) {
		event.clipboardData.setData('text/plain', text);
		if (text_html) {
			event.clipboardData.setData('text/html', text_html);
		}
		event.preventDefault();
		document.oncopy = old_handler;
		if ((! hide_notify) && s3gt.utils.prefs_get("copy_clipboard_notification")) {
			chrome.runtime.sendMessage({ 'notification_box': true, 'msg' : s3gt.utils.get_string('message.text.in.clipboard') }, function(response) {});
		}
	};
	document.oncopy = handler;

	var textarea = document.createElement("textarea");
	var scrollX = window.scrollX;
	var scrollY = window.scrollY;

	textarea.style.position = "absolute";
	textarea.style.left = scrollX + "px";
	textarea.style.top = scrollY + "px";
	textarea.style.width = "1px";
	textarea.style.height = "1px";

	document.body.appendChild(textarea);
	textarea.focus();
	document.execCommand("copy", false, null);
	document.body.removeChild(textarea);
}
//------------------------------------------------------------------------------
s3gt.utils.read_clipboard = function(callback) {
	var textbox = document.createElement("div");
	var scrollX = window.scrollX;
	var scrollY = window.scrollY;

	textbox.setAttribute('contenteditable', true);
	textbox.style.position = "absolute";

	textbox.style.left = scrollX + "px";
	textbox.style.top = scrollY + "px";
	textbox.style.width = "1px";
	textbox.style.height = "1px";

	var range = s3gt.utils.save_selection();
	document.body.appendChild(textbox);
	textbox.focus();

	textbox.addEventListener("paste", function(e) {
		e.preventDefault();
		var text = e.clipboardData.getData("text/plain");
		callback(text);
		document.body.removeChild(textbox);
		s3gt.utils.restore_selection(range);
	});

	document.execCommand('paste', false, null);
}
//-------------------------------------------------------------------------------------------
s3gt.utils.notification_box = function(msg, title, url, no_timer) {
	if (! title) {
		title = s3gt.utils.get_string('extension_name');
	}
	//-------------------------------------------------------------------------------------
	var params = {
		'type' : 'basic',
		'isClickable' : url ? true : false,
		'iconUrl' : '/skin/s3gt_logo_48.png',
		'title' : title,
		'message' : String(msg)
	};
	//-------------------------------------------------------------------------------------
//	chrome.notifications.create(title + " notification." + Math.random(), params, function(notificationId){
	chrome.notifications.create(title + " notification", params, function(notificationId){
		s3gt.notification_list[notificationId] = { 'url' : url };
		if (! no_timer) {
			setTimeout(function() {  chrome.notifications.clear(notificationId); }, 2000);
		}
	});
}
//------------------------------------------------------------------------------
s3gt.utils.check_cyrillic = function(text) {
	if (! text) { return false; }
	if (s3gt.utils.prefs_get("tooltip_check_cyrillic",  false)) {
		var cyrillic = 'фисвуапршолдьтщзйкыегмцчняФИСВУАПРШОЛДЬТЩЗЙКЫЕГМЦЧНЯёЁхХъЪбБюЮжЖэЭ';
		for (var i in text) {
			var ch = text[i];
			if (cyrillic.indexOf(ch) >= 0) {
				return true;
			}
		}
	}
	return false;
}
//------------------------------------------------------------------------------
s3gt.utils.check_page_language = function(language) {
	var doc_lang = language;
	if (! doc_lang) {
		var html_tag = document.getElementsByTagName('html')[0];
		//----------------------------------------------------------------
		if (html_tag && html_tag.hasAttribute('lang')) {
			doc_lang = html_tag.getAttribute('lang');
		}
		//----------------------------------------------------------------
		else if (html_tag && html_tag.hasAttribute('xml:lang')) {
			doc_lang = html_tag.getAttribute('xml:lang');
		}
		//----------------------------------------------------------------
		else {
			var meta_tag_list = document.getElementsByTagName('meta');
			for (var i=0; i<meta_tag_list.length; i++) {
				var meta_tag = meta_tag_list[i];
				if (meta_tag.hasAttribute('property') && meta_tag.hasAttribute('content')) {
					var property = meta_tag.getAttribute('property');
					if (/locale/i.test(property)) {
						doc_lang = meta_tag.getAttribute('content');
						break;
					}
				}
				else if (meta_tag.hasAttribute('http-equiv') && meta_tag.hasAttribute('content')) {
					var http_equiv = meta_tag.getAttribute('http-equiv');
					if (/language/i.test(http_equiv)) {
						doc_lang = meta_tag.getAttribute('content');
						break;
					}
				}
			}
		}
	}
	//----------------------------------------------------------------
	if (doc_lang) {
		doc_lang = s3gt.utils.check_lang(doc_lang);
	}
	//----------------------------------------------------------------
	return doc_lang;
}
//------------------------------------------------------------------------------
s3gt.utils.reset_style = function(el) {
	el.style.setProperty ("background", "initial", "important");
	el.style.setProperty ("border", "initial", "important");
	el.style.setProperty ("border-radius", "initial", "important");
	el.style.setProperty ("border-spacing", "initial", "important");
	el.style.setProperty ("border-collapse", "initial", "important");
	el.style.setProperty ("direction", "ltr", "important");
	el.style.setProperty ("flex-direction", "initial", "important");
	el.style.setProperty ("font-weight", "initial", "important");
	el.style.setProperty ("height", "initial", "important");
	el.style.setProperty ("letter-spacing", "initial", "important");
	el.style.setProperty ("min-width", "initial", "important");
	el.style.setProperty ("max-width", "initial", "important");
	el.style.setProperty ("min-height", "initial", "important");
	el.style.setProperty ("max-height", "initial", "important");
	el.style.setProperty ("margin", "auto", "important");
	el.style.setProperty ("outline", "initial", "important");
	el.style.setProperty ("padding", "initial", "important");
	el.style.setProperty ("position", "initial", "important");
	el.style.setProperty ("table-layout", "initial", "important");
	el.style.setProperty ("text-align", "initial", "important");
	el.style.setProperty ("text-shadow", "initial", "important");
	el.style.setProperty ("width", "initial", "important");
	el.style.setProperty ("word-break", "initial", "important");
	el.style.setProperty ("word-spacing", "initial", "important");
	el.style.setProperty ("word-wrap", "initial", "important");

	if (el.tagName == 'TABLE') {
		if (s3gt.utils.check_isFirefox()) {
			el.style.setProperty ("box-sizing", "border-box", "important"); // -- for Firefox
		} else {
			el.style.setProperty ("box-sizing", "content-box", "important"); // -- for Chrome
		}
	} else {
		el.style.setProperty ("box-sizing", "initial", "important");
	}
	if (el.tagName == 'IMG') {
		el.style.setProperty ("display", "initial", "important");
	}
	if ((el.tagName != 'TABLE') && (el.tagName != 'TR') && (el.tagName != 'TD')) {
		el.style.setProperty ("display", "initial", "important");
	}

	el.style.setProperty ("color", "inherit", "important");
	el.style.setProperty ("font-size", "13px", "important");
	el.style.setProperty ("font-family", "X-LocaleSpecific, sans-serif, Tahoma, Helvetica", "important");
	el.style.setProperty ("line-height", "13px", "important");
	el.style.setProperty ("vertical-align", "top", "important");
	el.style.setProperty ("white-space", "inherit", "important");
}
//------------------------------------------------------------------------------
s3gt.utils.check_google = function(protocol, domain, callback_1, callback_2) {
	var req = new XMLHttpRequest();
	var url = protocol + domain;
	var timeout = setTimeout( function(){ req.abort(); }, 4000);
	req.onreadystatechange = function () {
		if (req.readyState == 4) {
			clearTimeout(timeout);
			if (req.status == 200) {
				if (callback_1) {
					callback_1(true);
				}
			} else if (callback_2) {
				s3gt.utils.check_google('http://', domain, callback_2);
			} else if (callback_1) {
				callback_1(false);
			}
		}
	};
	req.open("GET", url, true);
	req.send(null);
}
//------------------------------------------------------------------------------
s3gt.utils.google_value_tk = function(text) {
	// view-source:https://translate.google.com/translate/releases/twsfe_w_20151214_RC03/r/js/desktop_module_main.js && TKK from HTML
	var uM = s3gt.work_data.google_value_tk || s3gt.utils.prefs_get('google_value_tk') || null;
	var cb="&";
	var k="";
	var Gf="=";
	var Vb="+-a^+6";
	var t="a";
	var Yb="+";
	var Zb="+-3^+b+-f";
	var jd=".";
	var sM=function(a){return function(){return a}}
	var tM=function(a,b){for(var c=0;c<b.length-2;c+=3){var d=b.charAt(c+2),d=d>=t?d.charCodeAt(0)-87:Number(d),d=b.charAt(c+1)==Yb?a>>>d:a<<d;a=b.charAt(c)==Yb?a+d&4294967295:a^d}return a};
	var vM=function(a){
		var b;
		if(null!==uM) {
			b=uM; 
		}else{
			b=sM(String.fromCharCode(84));var c=sM(String.fromCharCode(75));b=[b(),b()];
			b[1]=c();
			b=(uM=window[b.join(c())]||k)||k
		}
		var d=sM(String.fromCharCode(116)),c=sM(String.fromCharCode(107)),d=[d(),d()];
		d[1]=c();
		c=cb+d.join(k)+Gf;
		d=b.split(jd);
		b=Number(d[0])||0;
	
		for(var e=[],f=0,g=0;g<a.length;g++){
			var m=a.charCodeAt(g);
			128>m?e[f++]=m:(2048>m?e[f++]=m>>6|192:(55296==(m&64512)&&g+1<a.length&&56320==(a.charCodeAt(g+1)&64512)?(m=65536+((m&1023)<<10)+(a.charCodeAt(++g)&1023),e[f++]=m>>18|240,e[f++]=m>>12&63|128):e[f++]=m>>12|224,e[f++]=m>>6&63|128),e[f++]=m&63|128)
		}
		a=b||0;
		for(f=0;f<e.length;f++) { a+=e[f],a=tM(a,Vb)};
		a=tM(a,Zb);
		a^=Number(d[1])||0;
		0>a&&(a=(a&2147483647)+2147483648);
		a%=1E6;
//		return c+(a.toString()+jd+(a^b))
		return a.toString()+jd+(a^b);
	};

	s3gt.work_data.google_value_tk = uM;
	return vM(text);
}
//-------------------------------------------------------------------------------------------
s3gt.utils.check_isMac = function() {
	var text = window.navigator.platform;
	return (text.indexOf('Mac') >= 0) ? true : false;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.check_isFirefox = function() {
	var text = window.navigator.userAgent;
	return (text.indexOf("Firefox") >=0) ? true : false;
}
//-------------------------------------------------------------------------------------------
s3gt.utils.check_isPDF = function() {
	if (document.contentType && (/pdf/i.test(document.contentType))) {
		return true;
	} else {
		return false;
	}
}
//-------------------------------------------------------------------------------------------
s3gt.utils.check_isFrame = function() {
	var isFramed = false;

	try {
		isFramed = window != window.top || document != top.document || self.location != top.location;
	} catch (e) {}

	return isFramed;
}
//-------------------------------------------------------------------------------------------
