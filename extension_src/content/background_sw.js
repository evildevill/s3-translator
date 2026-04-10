// MV3 Service Worker entry point — imports all background modules in order
importScripts(
	'/content/background.js',
	'/content/translate_engine.js',
	'/content/youtube.js',
	'/content/utils.js',
	'/content/prefs.js',
	'/content/i18n.js',
	'/content/header.js',
	'/content/statistics_go.js'
);
