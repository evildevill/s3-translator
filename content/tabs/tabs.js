var tab_main = null;
var tab_text = null;

//-----------------------------------------------------------------------------------
function tabs_init() {
	tab_main = new tabs('tabs');
	tab_text = new tabs('tabs-translateText');
}
//-----------------------------------------------------------------------------------
var tabs = function(tabs_id) {
	this.tabLinks = new Array();
	this.contentDivs = new Array();
	this.init(tabs_id);
}
//-----------------------------------------------------------------------------------
tabs.prototype = {
	init : function(tabs_id) {
		// Grab the tab links and content divs from the page
		var tabListItems = document.getElementById(tabs_id).childNodes;
		for ( var i = 0; i < tabListItems.length; i++ ) {
			if ( tabListItems[i].nodeName == "LI" ) {
				var tabLink = this.getFirstChildWithTagName( tabListItems[i], 'A' );
				var id = this.getHash( tabLink.getAttribute('href') );
				this.tabLinks[id] = tabLink;
				this.contentDivs[id] = document.getElementById( id );
			}
		}
		// Assign onclick events to the tab links, and
		// highlight the first tab
		var i = 0;
		var self = this;
		for ( var id in this.tabLinks ) {
			this.tabLinks[id].onclick = function(event){ self.showTab(event); };
			this.tabLinks[id].onfocus = function() { this.blur() };
			if ( i == 0 ) this.tabLinks[id].className = 'selected';
			i++;
		}

		// Hide all content divs except the first
		var i = 0;

		for ( var id in this.contentDivs ) {
			if ( i != 0 ) this.contentDivs[id].className = 'tabContent hide';
			i++;
		}
		document.getElementById('tabsBox').width = document.getElementById('tabsBox').clientWidth + 'px';
	},
	//-----------------------------------------------------------------------------
	showTab : function(event, href) {
		try {
			event.preventDefault();
			event.stopPropagation();
		} catch(e) {
		}

		var selectedId = this.getHash( href || event.target.getAttribute('href') );
		if (! this.contentDivs[selectedId]) { return; }

		// Highlight the selected tab, and dim all others.
		// Also show the selected content div, and hide all others.
		for ( var id in this.contentDivs ) {
			if ( id == selectedId ) {
				this.tabLinks[id].className = 'selected';
				this.contentDivs[id].className = 'tabContent';
			} else {
				this.tabLinks[id].className = '';
				this.contentDivs[id].className = 'tabContent hide';
			}
		}
		window.location.replace(href || event.target.getAttribute('href'));
		window.scrollTo(0, 0);
	},
	//-----------------------------------------------------------------------------
	getFirstChildWithTagName : function( element, tagName ) {
		for ( var i = 0; i < element.childNodes.length; i++ ) {
			if ( element.childNodes[i].nodeName == tagName ) return element.childNodes[i];
		}
	},
	//-----------------------------------------------------------------------------
	getHash : function( url ) {
		var hashPos = url.lastIndexOf ( '#' );
		return url.substring( hashPos + 1 );
	}
};

window.addEventListener("load", tabs_init);
