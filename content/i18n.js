s3gt.i18n = {};
s3gt.i18n.current_locale = '';
s3gt.i18n.default_locale = 'en';
s3gt.i18n.data_locale = null;

//------------------------------------------------------------------------------
s3gt.i18n.init = function(current_locale) {
	//------------------------------------------------------------------------
	if (! current_locale) {
		current_locale = s3gt.utils.prefs_get('current_locale');
	}
	if (! current_locale) {
		current_locale = window.navigator.language; // chrome.i18n.getMessage('@@ui_locale');
	}
	if (! current_locale) {
		current_locale = s3gt.i18n.default_locale;
	}
	//------------------------------------------------------------------------
	s3gt.i18n.data_locale = null;
	s3gt.i18n.current_locale = current_locale;

	//------------------------------------------------------------------------
	var url = '/locale/s3gt-' + current_locale + '.json';
	var req = new XMLHttpRequest();
	req.overrideMimeType("application/json");
	req.open("GET", chrome.runtime.getURL(url), false);
	try{
		req.send(null);
	} catch(e) {
	}

	//------------------------------------------------------------------------
	if (req.responseText) {
		try {
			s3gt.i18n.data_locale = JSON.parse(req.responseText);
		} catch(e) {
		}
	}

	//------------------------------------------------------------------------
	if (s3gt.i18n.data_locale) {
		s3gt.utils.prefs_set('current_locale', current_locale);
		return true;
	} else if (current_locale != s3gt.i18n.default_locale) {
		if (/[\_\-]/.test(current_locale)) {
			current_locale = current_locale.replace(/[\_\-].*$/, '') || s3gt.i18n.default_locale;
		} else {
			current_locale = s3gt.i18n.default_locale;
		}
		return s3gt.i18n.init(current_locale);
	} else {
		return false;
	}
}
//------------------------------------------------------------------------------
s3gt.i18n.get_string = function(name, params) {
	if (! s3gt.i18n.data_locale) {
		if (s3gt.i18n.init(s3gt.i18n.current_locale)) {
			return s3gt.i18n.get_string(name, params);
		} else {
			return name;
		}
	}
	else if (s3gt.i18n.data_locale[name]) {
		var result = s3gt.i18n.data_locale[name];
		if (/\%S/.test(result) && params && (params.length == 1)) {
			result = result.replace(/\%S/, params[0]);
		}
		result = result.replace(/\\n/g, "\n");
//		result = result.replace(/\s*\"?\%S\"?\s*/g, " ");
		return result;
	}
	else {
		return name;
	}
}
//------------------------------------------------------------------------------
s3gt.i18n.has_string = function(name) {
	if (! s3gt.i18n.data_locale) {
		if (s3gt.i18n.init(s3gt.i18n.current_locale)) {
			return s3gt.i18n.get_string(name, params);
		} else {
			return false;
		}
	}
	else if (s3gt.i18n.data_locale[name]) {
		return true;
	}
	else {
		return false;
	}
}
//------------------------------------------------------------------------------
s3gt.i18n.parse_html = function(doc) {
	var el_list = doc.getElementsByTagName('*');
	for (var i=0; i<el_list.length; i++) {
		var el = el_list[i];
		//------------------------------------------------------------------
		if (el.hasAttribute('i18n')) {
			s3gt.utils.HTMLDOM_value(el, s3gt.i18n.parse_string(el.getAttribute('i18n')));
		}
		//------------------------------------------------------------------
		else {
			var i18n_label = el.getAttribute('label');
			if (i18n_label) {
				var i18n_label_nobr = el.hasAttribute('label_nobr');
				el.removeAttribute('label');
				//-----------------------------------------------------
				if ((el.tagName == 'INPUT') && ((el.type == 'checkbox') || (el.type == 'radio'))) {
					var newLabel = doc.createElement("label");
					var newSpan = doc.createElement("span");
					newSpan.setAttribute('i18n', i18n_label);
					if (i18n_label_nobr) {
						newSpan.setAttribute('label_nobr', true);
					}
					newLabel.appendChild(newSpan);
					el.parentNode.insertBefore(newLabel, el.nextSibling);
					s3gt.utils.HTMLDOM_value(newSpan, s3gt.i18n.parse_string(i18n_label));
					if (el.id) {
						newLabel.setAttribute('for', el.id);
					}
					el.parentNode.removeChild(el);
					newLabel.insertBefore(el, newLabel.firstChild);
					if (el.getAttribute('title')) {
						newLabel.setAttribute('title', s3gt.i18n.parse_string(el.getAttribute('title')));
					}
					continue;
				}
				//-----------------------------------------------------
				else if ((el.tagName == 'INPUT') && (el.type == 'text')) {
					el.setAttribute('label', i18n_label);
					el.setAttribute('placeholder', s3gt.i18n.parse_string(i18n_label));
					continue;
				}
				//-----------------------------------------------------
				else if ((el.tagName == 'INPUT') && (el.type == 'button')) {
					el.setAttribute('label', i18n_label);
					el.setAttribute('value', s3gt.i18n.parse_string(i18n_label));
					continue;
				}
				//-----------------------------------------------------

				el.setAttribute('i18n', i18n_label);
				s3gt.utils.HTMLDOM_value(el, s3gt.i18n.parse_string(i18n_label));
			}
		}
		//------------------------------------------------------------------
		if (el.i18n_title) {
			el.setAttribute('title', el.i18n_title);
		}
		var i18n_title = el.getAttribute('title');
		if (i18n_title) {
			el.i18n_title = i18n_title;
			el.setAttribute('title', s3gt.i18n.parse_string(i18n_title));
		}
	}
}
//------------------------------------------------------------------------------
s3gt.i18n.parse_string = function(str) {
	var text_list1 = str.split(/\n/);
	for (var i1=0; i1<text_list1.length; i1++) {
		var text_list2 = text_list1[i1].split(/\s+/);
		for (var i2=0; i2<text_list2.length; i2++) {
			text_list2[i2] = s3gt.i18n.get_string(text_list2[i2]);
		}
		text_list1[i1] = text_list2.join(" ");
	}
	return text_list1.join("\n");
}
//------------------------------------------------------------------------------
s3gt.i18n.locale = function() {
	return s3gt.i18n.current_locale;
}
//------------------------------------------------------------------------------
