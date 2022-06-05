sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
Components.utils.import('resource://gre/modules/PageThumbUtils.jsm');



const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let lastActiveTab;
let activeTab;
//const TAB_DROP_TYPE = "application/x-moz-tabbrowser-tab";


let tabcenterUltimate = {


	init: function () {

		if (!window.gBrowser) {
			return;
		}
		console.log("Tabcenter Utimate - starting up");

		//----------- Move Tabbrowser into location / rearrange UI --------------------

		let tabbrowserArrowscrollbox = window.document.getElementById("tabbrowser-arrowscrollbox");
		tabbrowserArrowscrollbox.setAttribute("orient", "vertical");
		tabbrowserArrowscrollbox._smoothScroll = false;
		//tabbrowserArrowscrollbox.scrollbox.hasVisibleScrollbars = true;
		// console.log(tabbrowserArrowscrollbox);

		let tabs = window.document.getElementById("tabbrowser-tabs");
		tabs.setAttribute("orient", "vertical");
		tabs.setAttribute("data-vertical", true);
		//tabs.tabbox.orient = "horizontal"; // probably not necessary

		//------------- Duplicate sidebar and sidebarsplitter

		let ordinals = [4, 5] // [2,1]  4 and 5 for right side, 2 and 1 for left side

		let splitter = window.document.getElementById("sidebar-splitter");
		let splitter2 = splitter.cloneNode(false);
		//splitter2.id = "sidebar-splitter2";
		splitter2.style["-moz-box-ordinal-group"] = ordinals[0]; //oridnal group defines the order of elements from 1 up 
		splitter.parentElement.appendChild(splitter2);
		splitter2.hidden = false

		let sidebar = window.document.getElementById("sidebar-box");
		// console.log(sidebar);
		let sidebar2 = sidebar.cloneNode(false);
		//sidebar2.id = "sidebar-box2";
		sidebar2.style["-moz-box-ordinal-group"] = ordinals[1];
		//sidebar2.id = "verticaltabs-box";
		sidebar2.hidden = false
		// console.log(sidebar2);
		sidebar.parentElement.appendChild(sidebar2);

		//

		// Move the tabs toolbar into the tab strip
		let toolbar = window.document.getElementById("TabsToolbar-customization-target");

		setTimeout(function () {

			sidebar2.append(tabs)
			sidebar2.append(toolbar);
		}, 500);


		//------------ FILTERBOX -------------

		let filterBox = document.createElement("input");
		filterBox.setAttribute("id", "filterBox");
		filterBox.setAttribute("type", "search");
		filterBox.setAttribute("timeout", "500");
		filterBox.setAttribute("enablehistory", true);
		filterBox.addEventListener("input", this.filterTabs, false);
		toolbar.appendChild(filterBox);



		//------------NEW TAB BUTTON--CLICK-------------
		let new_tab_button = document.getElementById("new-tab-button");
		new_tab_button.children[1].value = "";
		// new_tab_button.removeAttribute("command");
		// new_tab_button.removeAttribute("oncommand");
		// new_tab_button.removeAttribute("removable");
		// new_tab_button.removeAttribute("onclick");
		// new_tab_button.removeAttribute("onmouseover");
		// new_tab_button.removeAttribute("onmouseout");
		// new_tab_button.setAttribute("context", "");
		// new_tab_button.setAttribute("tooltiptext", "LeftClick = New Tab at the End; MiddleClick = New Child Tab; RightClick = New Sibling Tab");
		//new_tab_button.setAttribute("oncommand", 'openNewTab();');
		//new_tab_button.addEventListener("click", openNewTab, false);

		//------------------PIN BUTTON !!!----------------------------------

		window.tabspinned = true;
		let pin_button = document.createElement("toolbarbutton");
		pin_button.setAttribute("id", "pinbutton");
		pin_button.style.display = "block";
		pin_button.onclick = function (event) {
			window.tabspinned = window.tabspinned == 'true' ? 'false' : 'true'; //toggle function :)
		}
		toolbar.appendChild(pin_button);

		//-------------- CONTEXT MENU -------------------------

		let tabContextMenu = window.document.getElementById("tabContextMenu");

		let sanitizeTreeItem = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "menuitem");
		sanitizeTreeItem.setAttribute("id", "contexttab-sanitizeTree");
		sanitizeTreeItem.setAttribute("label", "Sanitize Tree");
		tabContextMenu.appendChild(sanitizeTreeItem);
		sanitizeTreeItem.setAttribute("oncommand", "tabcenterUltimate.sanitizeTree();");

		//---------KEYSETS----------//

		let mainKeyset = window.document.getElementById("mainKeyset");
		let moveTabLeftKey = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "key");
		moveTabLeftKey.setAttribute("id", "moveTabLeftKey");
		moveTabLeftKey.setAttribute("modifiers", "accel,alt");
		moveTabLeftKey.setAttribute("keycode", "VK_LEFT");
		//moveTabLeftKey.setAttribute("key", "a")
		mainKeyset.appendChild(moveTabLeftKey);
		moveTabLeftKey.setAttribute("oncommand", 'tabcenterUltimate.moveTabLeft();');

		let moveTabRightKey = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "key");
		moveTabRightKey.setAttribute("id", "moveTabRightKey");
		moveTabRightKey.setAttribute("modifiers", "accel,alt");
		moveTabRightKey.setAttribute("keycode", "VK_RIGHT");
		//moveTabLeftKey.setAttribute("key", "d")
		mainKeyset.appendChild(moveTabRightKey);
		moveTabRightKey.setAttribute("oncommand", 'tabcenterUltimate.moveTabRight();');

		let moveSingleTabLeftKey = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "key");
		moveSingleTabLeftKey.setAttribute("id", "moveSingleTabLeftKey");
		moveSingleTabLeftKey.setAttribute("modifiers", "control,alt");
		moveSingleTabLeftKey.setAttribute("keycode", "VK_LEFT");
		mainKeyset.appendChild(moveSingleTabLeftKey);
		moveSingleTabLeftKey.setAttribute("oncommand", 'tabcenterUltimate.moveSingleTabLeft();');

		let moveSingleTabRightKey = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "key");
		moveSingleTabRightKey.setAttribute("id", "moveSingleTabRightKey");
		moveSingleTabRightKey.setAttribute("modifiers", "control,alt");
		moveSingleTabRightKey.setAttribute("keycode", "VK_RIGHT");
		mainKeyset.appendChild(moveSingleTabRightKey);
		moveSingleTabRightKey.setAttribute("oncommand", 'tabcenterUltimate.moveSingleTabRight();');

		let moveUpKey = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "key");
		moveUpKey.setAttribute("id", "moveUpKey");
		moveUpKey.setAttribute("modifiers", "accel,alt");
		moveUpKey.setAttribute("keycode", "VK_UP");
		// moveTabLeftKey.setAttribute("key", "w")
		mainKeyset.appendChild(moveUpKey);
		moveUpKey.setAttribute("oncommand", 'tabcenterUltimate.moveTabUp();');

		let moveDownKey = window.document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "key");
		moveDownKey.setAttribute("id", "moveDownKey");
		moveDownKey.setAttribute("modifiers", "accel,alt");
		moveDownKey.setAttribute("keycode", "VK_DOWN");
		// moveTabLeftKey.setAttribute("key", "s")
		mainKeyset.appendChild(moveDownKey);
		moveDownKey.setAttribute("oncommand", 'tabcenterUltimate.moveTabDown();');

		//-----------------------------------------------------------------------------


		// ------------ insert manifest from subfolder to have easy t ouse chrome:// urls --------------------

		let cmanifest = Cc['@mozilla.org/file/directory_service;1'].getService(Ci.nsIProperties).get('UChrm', Ci.nsIFile);
		cmanifest.append('tabcenterUltimate');
		cmanifest.append('chrome.manifest');
		Components.manager.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(cmanifest);


		//------------ framescript to create thumbnails--------------------------------

		window.messageManager.loadFrameScript("chrome://tabcenterultimate/content/framescript.js", true);
		window.messageManager.addMessageListener("tabCenterUltimate@Ulf3000:my-e10s-extension-message", tabcenterUltimate.updateThumbnail);

		//----------- gBrowser event listeners ----------------------------------------
		window.addEventListener("TabOpen", this.onTabOpen, false);
		window.addEventListener("TabSelect", this.onTabSelect, false);
		window.addEventListener("TabAttrModified", this.onTabAttrModified, false);

		//sss.loadAndRegisterSheet("chrome://tabcenterultimate/content/tabcenterultimate.css", sss.USER_SHEET);

		//window.document.addEventListener("SSTabRestoring", reTN, { once: true }); // hack for the first loaded tab which doesnt fire a tabOpen event 
		//window.addEventListener("SSWindowRestored", UUU, false); // hack around browser.sessionstore.restore_tabs_lazily
		document.addEventListener("DOMContentLoaded", function (event) {
			// console.log("DOM fully loaded and parsed");
			// console.log(gBrowser._tabs);
			tabcenterUltimate.addImageToTab(gBrowser._tabs[0]); // hack , the first loaded tab in a gBrowser doesnt fire a tabopen event, all other tabs loaded after it do though

			lastActiveTab = window.gBrowser.selectedTab;
			activeTab = lastActiveTab;
		});


		this.gBrowserMod();
	},
	//-----------------------------------------------------------------------------
	addImageToTab: async function (aTab) {
		await new Promise(resolve => setTimeout(resolve, 100)); //wait a little bit , maybe not needed 

		let tabThumbnail = aTab.getElementsByClassName("ThumbNail_HT")[0];


		if (!tabThumbnail) {
			console.log("NOOOOOOOOO thumbnail");
			let image = document.createElement("img");
			image.classList = "ThumbNail_HT";
			image.style.display = "block";
			image.style.minHeight = "36px";
			image.style.minWidth = "54px";

			// move img element to the front of the tab 
			let ggg = aTab.getElementsByClassName("tab-icon-stack");
			ggg[0].parentElement.insertBefore(image, ggg[0]);
			tabThumbnail = image;
		}
		// restore Thumbnail Image 
		let TN_URI = SessionStore.getCustomTabValue(aTab, "ThumbNail_HT");


		console.log(TN_URI);
		if (TN_URI == ""){
			console.log("emprty");
			aTab.linkedBrowser.messageManager.sendAsyncMessage("tabCenterUltimate@Ulf3000:message-from-chrome"); // request the screenshot / tab thumbnai
		}else{
			console.log("saved thumbnails");
			tabThumbnail.src = TN_URI;
		}
		


	},

	updateThumbnail: async function (message) {   // return the tab  thumbnail
		// console.log(message);
		let tab = gBrowser.getTabForBrowser(message.target);
		let img = tab.getElementsByClassName("ThumbNail_HT")[0];
		img.src = message.data;
		SessionStore.setCustomTabValue(tab, "ThumbNail_HT", message.data);
	},


	//-------------NEW TAB BUTTON!!!! ----------------------
	openNewTab: function (e) {
		e.preventDefault();

		let options = {
			// TODO fix allowInheritPrincipal
			// (this is required by javascript: drop to the new window) Bug 1475201
			allowInheritPrincipal: true,
			//allowThirdPartyFixup: true,
			triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
			//createLazyBrowser: true,
			skipAnimation: true
		};

		let newTab;
		if (e.button == 0) { // BUTTON 0  add new tab at the end on treelevel 1
			// console.log("button0 !!!!!!!!!!");

			newTab = gBrowser.addTab(AboutNewTab.newTabURL, options); //openUILinkIn("about:newtab", "tab", params);
			newTab.newTab = true;

			SessionStore.setCustomTabValue(newTab, "indentFactor", 0);

			//window.tabcenterUltimate.setTabAttribs(newTab, "indentFactor", 0)

		}

		if (e.button == 1) { // BUTTON 1  add new child
			// console.log("button1 !!!!!!!!!!");

			let selectedIndentFactor = SessionStore.getCustomTabValue(gBrowser.selectedTab, "indentFactor");
			let new_tPos = gBrowser.selectedTab._tPos + 1;
			let indentFactor = selectedIndentFactor + 1 || 0;
			if (indentFactor > 10) // max indent factor
				indentFactor = 10;
			if (indentFactor == "NaN")
				indentFactor = 0;


			newTab = gBrowser.addTab(AboutNewTab.newTabURL, options); //openUILinkIn("about:newtab", "tab", params);
			newTab.newTab = true;

			SessionStore.setCustomTabValue(newTab, "indentFactor", indentFactor);

			gBrowser.moveTabTo(newTab, new_tPos)
		}

		if (e.button == 2) { //BUTTON 2   add new sibling
			// console.log("button2 !!!!!!!!!!");

			let selectedIndentFactor = SessionStore.getCustomTabValue(gBrowser.selectedTab, "indentFactor");

			// check  TODO implement variable for the max indent factor
			let indentFactor = selectedIndentFactor || 0;
			if (indentFactor > 10)
				indentFactor = 10;
			if (indentFactor == "NaN")
				indentFactor = 0;

			// setup tab
			newTab = gBrowser.addTab(AboutNewTab.newTabURL, options); //openUILinkIn("about:newtab", "tab", params);
			newTab.newTab = true;
			SessionStore.setCustomTabValue(newTab, "indentFactor", indentFactor);

			//tabcenterUltimate.setTabAttribs(newTab, "indentFactor", indentFactor);

			// // subtree detection ... works !!!
			// let yyy = gBrowser.selectedTab.__indentFactor;
			// let xxx = gBrowser.selectedTab._tPos;
			// let tabs = gBrowser.tabs;
			// let subTreeLength = 1; // number of tabs in subtree, start at 1 instead of 0
			// for (let i = xxx; i < tabs.length; i++) {
			// 	if (tabs[xxx + subTreeLength].__indentFactor > yyy) { //travel down the tree , break at subtree end
			// 		subTreeLength++;
			// 	} else {
			// 		break;
			// 	}
			// }

			gBrowser.moveTabTo(newTab, gBrowser.selectedTab._tPos + subTreeLength) // move tab under selectedTab_subTree

			// TODO implement acsending descending swicth ... compare its position to a ...
			//gBrowser.moveTabTo(newTab, gBrowser.selectedTab._tPos + 1) // move tab under selectedTab
		}
		newTab.click(); // ??? .click() ??
		e.stopPropagation();
	},

	onTabSelect: function (e) {
		// console.log("TabSelect");
		lastActiveTab = activeTab;
		activeTab = e.target;
		let lastBrowser = lastActiveTab.linkedBrowser;
		lastBrowser.messageManager.sendAsyncMessage("tabCenterUltimate@Ulf3000:message-from-chrome"); // request the screenshot / tab thumbnail
	},

	onTabOpen: async function (e) {
		// console.log("TAB OPENED !!!!!!!!!!");
		// console.log(e);
		tabcenterUltimate.addImageToTab(e.target);
		//e.target.scrollIntoView();
		//tabcenterUltimate.ensureVisible(e);
	},


	// change thumbnail image

	onTabAttrModified: function (e) {
		// console.log(e.detail.changed);
		if (e.detail.changed[0] == "busy" && e.detail.changed[1] == "progress") {
			// console.log("BUSY!!!!!!!!!!!!!!!!!!");
			this.window.setTimeout(function () {
				e.target.linkedBrowser.messageManager.sendAsyncMessage("tabCenterUltimate@Ulf3000:message-from-chrome");
			}, 500);
		}
	},


	// filter tabs by label -------------------------------------------
	filterTabs: function (e) {

		let value = new RegExp(e.target.value, "ig");

		let list = gBrowser._visibleTabs;

		for (let xxx of list) {
			if (xxx.getAttribute("label").match(value)) {
				xxx.style.visibility = "initial";
				xxx.style.transform = "translate(0px) !important";
			} else {
				xxx.style.visibility = "collapse";
				xxx.style.transform = "unset";
			}
		}
	},

	ensureVisible: function(event){


		console.log('ensureVisible');
		let aTab = event?.target;
		setTimeout((aTab) => {
			tabcenterUltimate.ensureVisibleTab(aTab);
		}, gReduceMotion ? 0 : 150, aTab);
	},


	gBrowserMod: function () {

		gBrowser.tabContainer.clearDropIndicator = function () {
			var tabs = this.allTabs;
			for (let i = 0, len = tabs.length; i < len; i++) {
				tabs[i].style.removeProperty("transform");
				tabs[i].style.removeProperty("transform");
			}
		}
		gBrowser.tabContainer.addEventListener("dragleave", function (event) { this.clearDropIndicator(event); }, true);



		gBrowser.tabContainer.on_dragover = function (event) {
			//this.clearDropIndicator();
			var effects = this._getDropEffectForTabDrag(event);
			var ind = this._tabDropIndicator;
			if (effects == "" || effects == "none") {
				ind.hidden = true;
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			if (effects == "link") {
				let tab = this._getDragTargetTab(event, true);
				if (tab) {
					if (!this._dragTime) {
						this._dragTime = Date.now();
					}
					if (Date.now() >= this._dragTime + this._dragOverDelay) {
						this.selectedItem = tab;
					}
					ind.hidden = true;
					return;
				}
			}
			let newIndex = this._getDropIndex(event, effects == "link");
			let children = this.allTabs;
			if (newIndex == children.length) {
				// children[newIndex].style.setProperty("-moz-transition","1s", "ease-in-out");
				children[newIndex].style.setProperty("transform", "translateY(-22px)", "important");

			} else {
				// children[newIndex].style.setProperty("transition","1s", "ease-in-out");
				children[newIndex].style.setProperty("transform", "translateY(22px)", "important");
			}
		}

		gBrowser.tabContainer.on_drop = function (event) {
			this.clearDropIndicator();
			var dt = event.dataTransfer;
			var dropEffect = dt.dropEffect;
			var draggedTab;
			let movingTabs;
			if (dt.mozTypesAt(0)[0] == TAB_DROP_TYPE) {
				// tab copy or move
				draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);
				// not our drop then
				if (!draggedTab) {
					return;
				}
				movingTabs = draggedTab._dragData.movingTabs;
				draggedTab.container._finishGroupSelectedTabs(draggedTab);
			}
			this._tabDropIndicator.hidden = true;
			event.stopPropagation();
			if (draggedTab && dropEffect == "copy") {
				// copy the dropped tab (wherever it's from)
				let newIndex = this._getDropIndex(event, false);
				let draggedTabCopy;
				for (let tab of movingTabs) {
					let newTab = gBrowser.duplicateTab(tab);
					gBrowser.moveTabTo(newTab, newIndex++);
					if (tab == draggedTab) {
						draggedTabCopy = newTab;
					}
				}
				if (draggedTab.container != this || event.shiftKey) {
					this.selectedItem = draggedTabCopy;
				}
			} else if (draggedTab && draggedTab.container == this) {
				let oldTranslateX = Math.round(draggedTab._dragData.translateX);
				let tabWidth = Math.round(draggedTab._dragData.tabWidth);
				let translateOffset = oldTranslateX % tabWidth;
				let newTranslateX = oldTranslateX - translateOffset;
				if (oldTranslateX > 0 && translateOffset > tabWidth / 2) {
					newTranslateX += tabWidth;
				} else if (oldTranslateX < 0 && -translateOffset > tabWidth / 2) {
					newTranslateX -= tabWidth;
				}
				let dropIndex = this._getDropIndex(event, false);
				//  "animDropIndex" in draggedTab._dragData &&
				//  draggedTab._dragData.animDropIndex;
				let incrementDropIndex = true;
				if (dropIndex && dropIndex > movingTabs[0]._tPos) {
					dropIndex--;
					incrementDropIndex = false;
				}
				let animate = gBrowser.animationsEnabled;
				if (oldTranslateX && oldTranslateX != newTranslateX && animate) {
					for (let tab of movingTabs) {
						tab.setAttribute("tabdrop-samewindow", "true");
						tab.style.transform = "translateX(" + newTranslateX + "px)";
						let onTransitionEnd = transitionendEvent => {
							if (
								transitionendEvent.propertyName != "transform" ||
								transitionendEvent.originalTarget != tab
							) {
								return;
							}
							tab.removeEventListener("transitionend", onTransitionEnd);
							tab.removeAttribute("tabdrop-samewindow");
							this._finishAnimateTabMove();
							if (dropIndex !== false) {
								gBrowser.moveTabTo(tab, dropIndex);
								if (incrementDropIndex) {
									dropIndex++;
								}
							}
							gBrowser.syncThrobberAnimations(tab);
						};
						tab.addEventListener("transitionend", onTransitionEnd);
					}
				} else {
					this._finishAnimateTabMove();
					if (dropIndex !== false) {
						for (let tab of movingTabs) {
							gBrowser.moveTabTo(tab, dropIndex);
							if (incrementDropIndex) {
								dropIndex++;
							}
						}
					}
				}
			} else if (draggedTab) {
				let newIndex = this._getDropIndex(event, false);
				let newTabs = [];
				for (let tab of movingTabs) {
					let newTab = gBrowser.adoptTab(tab, newIndex++, tab == draggedTab);
					newTabs.push(newTab);
				}
				// Restore tab selection
				gBrowser.addRangeToMultiSelectedTabs(
					newTabs[0],
					newTabs[newTabs.length - 1]
				);
			} else {
				// Pass true to disallow dropping javascript: or data: urls
				let links;
				try {
					links = browserDragAndDrop.dropLinks(event, true);
				} catch (ex) { }
				if (!links || links.length === 0) {
					return;
				}
				let inBackground = Services.prefs.getBoolPref(
					"browser.tabs.loadInBackground"
				);
				if (event.shiftKey) {
					inBackground = !inBackground;
				}
				let targetTab = this._getDragTargetTab(event, true);
				let userContextId = this.selectedItem.getAttribute("usercontextid");
				let replace = !!targetTab;
				let newIndex = this._getDropIndex(event, true);
				let urls = links.map(link => link.url);
				let csp = browserDragAndDrop.getCSP(event);
				let triggeringPrincipal = browserDragAndDrop.getTriggeringPrincipal(
					event
				);
				(async () => {
					if (
						urls.length >=
						Services.prefs.getIntPref("browser.tabs.maxOpenBeforeWarn")
					) {
						// Sync dialog cannot be used inside drop event handler.
						let answer = await OpenInTabsUtils.promiseConfirmOpenInTabs(
							urls.length,
							window
						);
						if (!answer) {
							return;
						}
					}
					gBrowser.loadTabs(urls, {
						inBackground,
						replace,
						allowThirdPartyFixup: true,
						targetTab,
						newIndex,
						userContextId,
						triggeringPrincipal,
						csp,
					});
				})();
			}
			if (draggedTab) {
				delete draggedTab._dragData;
			}
		}

		gBrowser.tabContainer._getDropIndex = function (event, isLink) {
			var tabs = this.allTabs;
			var tab = this._getDragTargetTab(event, isLink);
			if (!RTL_UI) {
				for (let i = tab ? tab._tPos : 0; i < tabs.length; i++) {
					if (
						event.screenY <
						tabs[i].screenY + tabs[i].getBoundingClientRect().height / 2
					) {
						return i;
					}
				}
			} else {
				for (let i = tab ? tab._tPos : 0; i < tabs.length; i++) {
					if (
						event.screenY >
						tabs[i].screenY + tabs[i].getBoundingClientRect().height / 2
					) {
						return i;
					}
				}
			}
			return tabs.length;
		}

		gBrowser.tabContainer.addEventListener('TabSelect', ensureVisible, false);
		function ensureVisible(event) {
			console.log('ensureVisible');
			let aTab = event?.target;
			setTimeout((aTab) => {
				tabcenterUltimate.ensureVisibleTab(aTab);
			}, gReduceMotion ? 0 : 150, aTab);
		}

		gBrowser.tabContainer._positionPinnedTabs = function () {
			let tabs = this._getVisibleTabs();
			let numPinned = gBrowser._numPinnedTabs;
			let doPosition =
				this.getAttribute("overflow") == "true" &&
				tabs.length > numPinned &&
				numPinned > 0;
	
			this.toggleAttribute("haspinnedtabs", !!numPinned);
	
			if (doPosition) {
				this.setAttribute("positionpinnedtabs", "true");
	
				let layoutData = this._pinnedTabsLayoutCache;
				let uiDensity = document.documentElement.getAttribute("uidensity");
				if (!layoutData || layoutData.uiDensity != uiDensity) {
					let arrowScrollbox = this.arrowScrollbox;
					layoutData = this._pinnedTabsLayoutCache = {
						uiDensity,
						pinnedTabHeight: tabs[0].getBoundingClientRect().height,
						scrollStartOffset:
							arrowScrollbox.scrollbox.getBoundingClientRect().top -
							arrowScrollbox.getBoundingClientRect().top +
							parseFloat(
								getComputedStyle(arrowScrollbox.scrollbox).paddingTop
							),
					};
				}
	
				let height = 0;
				for (let i = numPinned - 1; i >= 0; i--) {
					let tab = tabs[i];
					height += layoutData.pinnedTabHeight;
					tab.style.setProperty(
						"margin-top",
						-(height + layoutData.scrollStartOffset) + "px",
						"important"
					);
					tab._pinnedUnscrollable = true;
				}
				this.style.paddingTop = height + "px";
			} else {
				this.removeAttribute("positionpinnedtabs");
	
				for (let i = 0; i < numPinned; i++) {
					let tab = tabs[i];
					tab.style.marginInlineStart = "";
					tab._pinnedUnscrollable = false;
				}
	
				this.style.paddingTop = "";
			}
	
			if (this._lastNumPinned != numPinned) {
				this._lastNumPinned = numPinned;
				this._handleTabSelect(true);
			}
		}
	



	},
	//---------------------------------------------------------------------------------
	// these functions are forked from https://searchfox.org/mozilla-central/source/browser/base/content/tabbrowser-tabs.js
	// which is loaded into your chrome in every browserwindow 
	// its the same functions but accomodated for vertical movement instead of horizontal  



	ensureVisibleTab: function (aTab, allowScrollUp = true) {
		let tab = gBrowser.selectedTab;
		if (tab != aTab)
			return;
		let tabContainer = gBrowser.tabContainer;
		if (tab.screenY + tab.getBoundingClientRect().height + 1 >
			tabContainer.screenY + tabContainer.getBoundingClientRect().height) {
			tab.scrollIntoView(false);
		} else if (tab.screenY < tabContainer.screenY && allowScrollUp) {
			tab.scrollIntoView(true);
		}
	}
};
tabcenterUltimate.init();
// gBrowser.tabContainer.on_dragover = function(event) {
// 	var effects = this._getDropEffectForTabDrag(event);

// 	var ind = this._tabDropIndicator;
// 	if (effects == "" || effects == "none") {
// 	  ind.hidden = true;
// 	  return;
// 	}
// 	event.preventDefault();
// 	event.stopPropagation();

// 	var arrowScrollbox = this.arrowScrollbox;

// 	// autoscroll the tab strip if we drag over the scroll
// 	// buttons, even if we aren't dragging a tab, but then
// 	// return to avoid drawing the drop indicator
// 	var pixelsToScroll = 0;
// 	if (this.getAttribute("overflow") == "true") {
// 	  switch (event.originalTarget) {
// 		case arrowScrollbox._scrollButtonUp:
// 		  pixelsToScroll = arrowScrollbox.scrollIncrement * -1;
// 		  break;
// 		case arrowScrollbox._scrollButtonDown:
// 		  pixelsToScroll = arrowScrollbox.scrollIncrement;
// 		  break;
// 	  }
// 	  if (pixelsToScroll) {
// 		arrowScrollbox.scrollByPixels(
// 		  (RTL_UI ? -1 : 1) * pixelsToScroll,
// 		  true
// 		);
// 	  }
// 	}

// 	let draggedTab = event.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
// 	if (
// 	  (effects == "move" || effects == "copy") &&
// 	  this == draggedTab.container
// 	) {
// 	  ind.hidden = true;

// 	  if (!this._isGroupTabsAnimationOver()) {
// 		// Wait for grouping tabs animation to finish
// 		return;
// 	  }
// 	  this._finishGroupSelectedTabs(draggedTab);

// 	  if (effects == "move") {
// 		this._animateTabMove(event);
// 		return;
// 	  }
// 	}

// 	this._finishAnimateTabMove();

// 	if (effects == "link") {
// 	  let tab = this._getDragTargetTab(event, true);
// 	  if (tab) {
// 		if (!this._dragTime) {
// 		  this._dragTime = Date.now();
// 		}
// 		if (Date.now() >= this._dragTime + this._dragOverDelay) {
// 		  this.selectedItem = tab;
// 		}
// 		ind.hidden = true;
// 		return;
// 	  }
// 	}

// 	var rect = arrowScrollbox.getBoundingClientRect();
// 	var newMargin;
// 	if (pixelsToScroll) {
// 	  // if we are scrolling, put the drop indicator at the edge
// 	  // so that it doesn't jump while scrolling
// 	  let scrollRect = arrowScrollbox.scrollClientRect;
// 	  let minMargin = scrollRect.top - rect.top;
// 	  let maxMargin = Math.min(
// 		minMargin + scrollRect.height,
// 		scrollRect.bottom
// 	  );
// 	  if (RTL_UI) {
// 		[minMargin, maxMargin] = [
// 		  this.clientHeight - maxMargin,
// 		  this.clientHeight - minMargin,
// 		];
// 	  }
// 	  newMargin = pixelsToScroll > 0 ? maxMargin : minMargin;
// 	} else {
// 	  let newIndex = this._getDropIndex(event, effects == "link");
// 	  let children = this.allTabs;
// 	  if (newIndex == children.length) {
// 		let tabRect = children[newIndex - 1].getBoundingClientRect();
// 		if (RTL_UI) {
// 		  newMargin = rect.top - tabRect.bottom;
// 		} else {
// 		  newMargin = tabRect.bottom - rect.top;
// 		}
// 	  } else {
// 		let tabRect = children[newIndex].getBoundingClientRect();
// 		if (RTL_UI) {
// 		  newMargin = rect.top - tabRect.top;
// 		} else {
// 		  newMargin = tabRect.top - rect.top;
// 		}
// 	  }
// 	}

// 	ind.hidden = false;
// 	newMargin += ind.clientHeight / 2;
// 	if (RTL_UI) {
// 	  newMargin *= -1;
// 	}
// 	ind.style.transform = "translate(" + Math.round(newMargin) + "px)";
//   }



//   gBrowser.tabContainer.on_dragend = function(event) {
// 	var dt = event.dataTransfer;
// 	var draggedTab = dt.mozGetDataAt(TAB_DROP_TYPE, 0);

// 	// Prevent this code from running if a tabdrop animation is
// 	// running since calling _finishAnimateTabMove would clear
// 	// any CSS transition that is running.
// 	if (draggedTab.hasAttribute("tabdrop-samewindow")) {
// 	  return;
// 	}

// 	this._finishGroupSelectedTabs(draggedTab);
// 	this._finishAnimateTabMove();

// 	if (
// 	  dt.mozUserCancelled ||
// 	  dt.dropEffect != "none" ||
// 	  this._isCustomizing
// 	) {
// 	  delete draggedTab._dragData;
// 	  return;
// 	}

// 	// Check if tab detaching is enabled
// 	if (!Services.prefs.getBoolPref("browser.tabs.allowTabDetach")) {
// 	  return;
// 	}

// 	// Disable detach within the browser toolbox
// 	var eX = event.screenX;
// 	var eY = event.screenY;
// 	var wX = window.screenX;
// 	var wY = window.screenY;
// 	// check if the drop point is horizontally within the window
// 	if (eY > wX && eY < wY + window.outerHeight) {
// 	  // also avoid detaching if the the tab was dropped too close to
// 	  // the tabbar (half a tab)
// 	  let rect = window.windowUtils.getBoundsWithoutFlushing(
// 		this.arrowScrollbox
// 	  );
// 	  let detachTabThresholdX = window.screenX + 1.5 * rect.width;
// 	  if (eX < detachTabThresholdX && eX > window.screenX) {
// 		return;
// 	  }
// 	}

// 	// screen.availLeft et. al. only check the screen that this window is on,
// 	// but we want to look at the screen the tab is being dropped onto.
// 	var screen = event.screen;
// 	var availX = {},
// 	  availY = {},
// 	  availWidth = {},
// 	  availHeight = {};
// 	// Get available rect in desktop pixels.
// 	screen.GetAvailRectDisplayPix(availX, availY, availWidth, availHeight);
// 	availX = availX.value;
// 	availY = availY.value;
// 	availWidth = availWidth.value;
// 	availHeight = availHeight.value;

// 	// Compute the final window size in desktop pixels ensuring that the new
// 	// window entirely fits within `screen`.
// 	let ourCssToDesktopScale =
// 	  window.devicePixelRatio / window.desktopToDeviceScale;
// 	let screenCssToDesktopScale =
// 	  screen.defaultCSSScaleFactor / screen.contentsScaleFactor;

// 	// NOTE(emilio): Multiplying the sizes here for screenCssToDesktopScale
// 	// means that we'll try to create a window that has the same amount of CSS
// 	// pixels than our current window, not the same amount of device pixels.
// 	// There are pros and cons of both conversions, though this matches the
// 	// pre-existing intended behavior.
// 	var winWidth = Math.min(
// 	  window.outerWidth * screenCssToDesktopScale,
// 	  availWidth
// 	);
// 	var winHeight = Math.min(
// 	  window.outerHeight * screenCssToDesktopScale,
// 	  availHeight
// 	);

// 	// This is slightly tricky: _dragData.offsetX/Y is an offset in CSS
// 	// pixels. Since we're doing the sizing above based on those, we also need
// 	// to apply the offset with pixels relative to the screen's scale rather
// 	// than our scale.
// 	var left = Math.min(
// 	  Math.max(
// 		eX * ourCssToDesktopScale -
// 		  draggedTab._dragData.offsetX * screenCssToDesktopScale,
// 		availX
// 	  ),
// 	  availX + availWidth - winWidth
// 	);
// 	var top = Math.min(
// 	  Math.max(
// 		eY * ourCssToDesktopScale -
// 		  draggedTab._dragData.offsetY * screenCssToDesktopScale,
// 		availY
// 	  ),
// 	  availY + availHeight - winHeight
// 	);

// 	// Convert back left and top to our CSS pixel space.
// 	left /= ourCssToDesktopScale;
// 	top /= ourCssToDesktopScale;

// 	delete draggedTab._dragData;

// 	if (gBrowser.tabs.length == 1) {
// 	  // resize _before_ move to ensure the window fits the new screen.  if
// 	  // the window is too large for its screen, the window manager may do
// 	  // automatic repositioning.
// 	  //
// 	  // Since we're resizing before moving to our new screen, we need to use
// 	  // sizes relative to the current screen. If we moved, then resized, then
// 	  // we could avoid this special-case and share this with the else branch
// 	  // below...
// 	  winWidth /= ourCssToDesktopScale;
// 	  winHeight /= ourCssToDesktopScale;

// 	  window.resizeTo(winWidth, winHeight);
// 	  window.moveTo(left, top);
// 	  window.focus();
// 	} else {
// 	  // We're opening a new window in a new screen, so make sure to use sizes
// 	  // relative to the new screen.
// 	  winWidth /= screenCssToDesktopScale;
// 	  winHeight /= screenCssToDesktopScale;

// 	  let props = { screenX: left, screenY: top, suppressanimation: 1 };
// 	  if (AppConstants.platform != "win") {
// 		props.outerWidth = winWidth;
// 		props.outerHeight = winHeight;
// 	  }
// 	  gBrowser.replaceTabsWithWindow(draggedTab, props);
// 	}
// 	event.stopPropagation();
//   }


//   gBrowser.tabContainer._getDropIndex = function(event, isLink) {
// 	var tabs = this.allTabs;
// 	var tab = this._getDragTargetTab(event, isLink);
// 	if (!RTL_UI) {
// 	  for (let i = tab ? tab._tPos : 0; i < tabs.length; i++) {
// 		if (
// 		  event.screenY <
// 		  tabs[i].screenY + tabs[i].getBoundingClientRect().height / 2
// 		) {
// 		  return i;
// 		}
// 	  }
// 	} else {
// 	  for (let i = tab ? tab._tPos : 0; i < tabs.length; i++) {
// 		if (
// 		  event.screenY >
// 		  tabs[i].screenY + tabs[i].getBoundingClientRect().height / 2
// 		) {
// 			console.log(i);
// 		  return i;
// 		}
// 	  }
// 	}
// 	return tabs.length;
//   }




	// gBrowser.tabContainer._animateTabMove =function(event) {
	// 	let draggedTab = event.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
	// 	let movingTabs = draggedTab._dragData.movingTabs;

	// 	if (this.getAttribute("movingtab") != "true") {
	// 	  this.setAttribute("movingtab", "true");
	// 	  gNavToolbox.setAttribute("movingtab", "true");
	// 	  if (!draggedTab.multiselected) {
	// 		this.selectedItem = draggedTab;
	// 	  }
	// 	}

	// 	if (!("animLastScreenY" in draggedTab._dragData)) {
	// 	  draggedTab._dragData.animLastScreenY = draggedTab._dragData.screenY;
	// 	}

	// 	let screenY = event.screenY;
	// 	if (screenY == draggedTab._dragData.animLastScreenY) {
	// 	  return;
	// 	}

	// 	// Direction of the mouse movement.
	// 	let ltrMove = screenY > draggedTab._dragData.animLastScreenY;

	// 	draggedTab._dragData.animLastScreenY = screenY;

	// 	let pinned = draggedTab.pinned;
	// 	let numPinned = gBrowser._numPinnedTabs;
	// 	let tabs = this._getVisibleTabs().slice(
	// 	  pinned ? 0 : numPinned,
	// 	  pinned ? numPinned : undefined
	// 	);

	// 	if (RTL_UI) {
	// 	  tabs.reverse();
	// 	  // Copy moving tabs array to avoid infinite reversing.
	// 	  movingTabs = [...movingTabs].reverse();
	// 	}
	// 	let tabHeight = draggedTab.getBoundingClientRect().height;
	// 	let shiftWidth = tabHeight * movingTabs.length;
	// 	draggedTab._dragData.tabHeight = tabHeight;

	// 	// Move the dragged tab based on the mouse position.

	// 	let leftTab = tabs[0];
	// 	let rightTab = tabs[tabs.length - 1];
	// 	let rightMovingTabScreenY = movingTabs[movingTabs.length - 1].screenY;
	// 	let leftMovingTabScreenY = movingTabs[0].screenY;
	// 	let translateY = screenY - draggedTab._dragData.screenY;
	// 	if (!pinned) {
	// 	  translateY +=
	// 		this.arrowScrollbox.scrollbox.scrollTop -
	// 		draggedTab._dragData.scrollY;
	// 	}
	// 	let leftBound = leftTab.screenY - leftMovingTabScreenY;
	// 	let rightBound =
	// 	  rightTab.screenY +
	// 	  rightTab.getBoundingClientRect().height -
	// 	  (rightMovingTabScreenY + tabHeight);
	// 	translateY = Math.min(Math.max(translateY, leftBound), rightBound);

	// 	for (let tab of movingTabs) {
	// 	  tab.style.transform = "translateY(" + translateY + "px)";
	// 	}

	// 	draggedTab._dragData.translateY = translateY;

	// 	// Determine what tab we're dragging over.
	// 	// * Single tab dragging: Point of reference is the center of the dragged tab. If that
	// 	//   point touches a background tab, the dragged tab would take that
	// 	//   tab's position when dropped.
	// 	// * Multiple tabs dragging: All dragged tabs are one "giant" tab with two
	// 	//   points of reference (center of tabs on the extremities). When
	// 	//   mouse is moving from left to right, the right reference gets activated,
	// 	//   otherwise the left reference will be used. Everything else works the same
	// 	//   as single tab dragging.
	// 	// * We're doing a binary search in order to reduce the amount of
	// 	//   tabs we need to check.

	// 	tabs = tabs.filter(t => !movingTabs.includes(t) || t == draggedTab);
	// 	let leftTabCenter = leftMovingTabScreenY + translateY + tabHeight / 2;
	// 	let rightTabCenter = rightMovingTabScreenY + translateY + tabHeight / 2;
	// 	let tabCenter = ltrMove ? rightTabCenter : leftTabCenter;
	// 	let newIndex = -1;
	// 	let oldIndex =
	// 	  "animDropIndex" in draggedTab._dragData
	// 		? draggedTab._dragData.animDropIndex
	// 		: movingTabs[0]._tPos;
	// 	let low = 0;
	// 	let high = tabs.length - 1;
	// 	while (low <= high) {
	// 	  let mid = Math.floor((low + high) / 2);
	// 	  if (tabs[mid] == draggedTab && ++mid > high) {
	// 		break;
	// 	  }
	// 	  screenY = tabs[mid].screenY + getTabShift(tabs[mid], oldIndex);
	// 	  if (screenY > tabCenter) {
	// 		high = mid - 1;
	// 	  } else if (
	// 		screenY + tabs[mid].getBoundingClientRect().width <
	// 		tabCenter
	// 	  ) {
	// 		low = mid + 1;
	// 	  } else {
	// 		newIndex = tabs[mid]._tPos;
	// 		break;
	// 	  }
	// 	}
	// 	if (newIndex >= oldIndex) {
	// 	  newIndex++;
	// 	}
	// 	if (newIndex < 0 || newIndex == oldIndex) {
	// 	  return;
	// 	}
	// 	draggedTab._dragData.animDropIndex = newIndex;

	// 	// Shift background tabs to leave a gap where the dragged tab
	// 	// would currently be dropped.

	// 	for (let tab of tabs) {
	// 	  if (tab != draggedTab) {
	// 		let shift = getTabShift(tab, newIndex);
	// 		tab.style.transform = shift ? "translateY(" + shift + "px)" : "";
	// 	  }
	// 	}

	// 	function getTabShift(tab, dropIndex) {
	// 	  if (tab._tPos < draggedTab._tPos && tab._tPos >= dropIndex) {
	// 		return RTL_UI ? -shiftWidth : shiftWidth;
	// 	  }
	// 	  if (tab._tPos > draggedTab._tPos && tab._tPos < dropIndex) {
	// 		return RTL_UI ? shiftWidth : -shiftWidth;
	// 	  }
	// 	  return 0;
	// 	}
	//   }
