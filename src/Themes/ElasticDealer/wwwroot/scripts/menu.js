/*
This is a WIP.

Features:
1. Click based dropdown menu.
2. Plain vanilla JavaScript.
3. Mobile menu enabled, with opening animation.
4. Submenus account for right edge of browser.
5. Submenus have arrow indicators that point appropriately.
6. Scrolling disabled when mobile menu is opened.
7. Menu is directionally scroll-aware for MQ(M) or larger.


Items to improve- 
A. add js disabled styles for mobile view, MQ(S) and smaller


*/

(function () {
	//begin Self-Executing Anonymous Function
	"use strict";

	//equivalent to jQuery document ready event
	document.addEventListener("DOMContentLoaded", domContentLoaded);

	function domContentLoaded() {
		//setup keys to trigger a click on skip to main content link
				//keysTriggerClick(document.getElementById("skip-to-main-content"));

		//overall drop down menu
		let ddmenuMain = document.getElementById("ddmenu-main");

		//setup main navigation dropdown
		initDdmenu(ddmenuMain);
	} //end fxn domContentLoaded

	function getOffset(el) {
		//https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element-relative-to-the-browser-window#11396681
		//usage: xCoord = getOffset( document.getElementById('yourElId') ).left
		let _x = 0;
		let _y = 0;

		while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
			_x += el.offsetLeft - el.scrollLeft;
			_y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
		}

		return { top: _y, left: _x };
	} //end fxn getOffset

	function initDdmenu(ddMenu) {
		//begin setup hamburger menu anchors
		let hamburger = document.getElementById("hamburger");
		let hamburgerClose = document.getElementById("hamburger-close");
		let body = document.getElementsByTagName("body")[0];
		let html = document.getElementsByTagName("html")[0];
		let skipToMain = document.getElementById("skip-to-main-content");

		keysTriggerClick(hamburger);
		keysTriggerClick(hamburgerClose, ["Escape"]); //allow default keys and escape key to trigger click

		hamburger.addEventListener("click", function (e) {
			e.preventDefault();

			if (!ddMenu.classList.contains("opened")) {
				ddMenu.classList.add("opened");
				this.setAttribute("aria-pressed", "true");
				this.setAttribute("aria-expanded", "true");

				//set timeout to be no smaller than 50 to allow time for visibility of menu to change
				window.setTimeout(function () {
					hamburgerClose.focus();
				}, 50);

				//give class to prevent scrolling while mobile menu is open
				body.classList.add("mobile-menu-opened");
				html.classList.add("mobile-menu-opened");

				skipToMain.style.visibility = "hidden";
			} //end if
		}); //end hamburger click

		hamburgerClose.addEventListener("click", function (e) {
			e.preventDefault();

			if (ddMenu.classList.contains("opened")) {
				ddMenu.classList.remove("opened");
				hamburger.setAttribute("aria-pressed", "false");
				hamburger.setAttribute("aria-expanded", "false");

				//set timeout to be no smaller than 50 to allow time for visibility of menu to change
				window.setTimeout(function () {
					hamburger.focus();
				}, 50);

				body.classList.remove("mobile-menu-opened");
				html.classList.remove("mobile-menu-opened");

				skipToMain.style.visibility = "visible";
			} //end if
		}); //end hamburgerClose click

		//variables for window events
		let windowWidth = window.outerWidth;
		let windowHeight = window.outerHeight;
		let resizeTimer; //for window resize event setTimeout
		let resizeDelay = 20; //throttling delay for window resize event in milliseconds
		let scrollTimer; //for window scroll event setTimeout
		let scrollDelay; //throttling delay for window scroll event in milliseconds
		let yStart = window.pageYOffset; //initial scroll position
		let rangeBox = document.getElementById("rangeBox"); //el that changes height based on different MQs
		let rangeBoxHeight; //default heights for rangeBox at various media queries is within its definition in the stylesheet

		if (html.classList.contains("ff") && html.classList.contains("desktop")) {
			scrollDelay = 50; //ff for desktop has a problem with really low scrollDelay values
		} else if (
			html.classList.contains("safari") &&
			html.classList.contains("mobile")
		) {
			scrollDelay = 0; //safari under ios seems to require this
		} else {
			scrollDelay = 20;
		}

		window.addEventListener("load", function () {
			// get initial window dimensions for resize event check
			windowWidth = window.outerWidth;
			windowHeight = window.outerHeight;
		});
		//end window load event

		window.addEventListener(
			"resize",
			function () {
				/* https://stackoverflow.com/questions/8898412/iphone-ipad-triggering-unexpected-resize-events */
				// Check window width has actually changed and it's not just a buggy iOS triggering a resize event on scroll
				if (
					window.outerWidth != windowWidth ||
					window.outerHeight != windowHeight
				) {
					/* https://css-tricks.com/snippets/jquery/done-resizing-event/ */
					//run code after a time once resizing is done
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(function () {
						// Run code here, resizing has "stopped"

						//update the window dimensions for next use
						windowWidth = window.outerWidth;
						windowHeight = window.outerHeight;

						rangeBoxHeight = rangeBox.offsetHeight;

						if (ddMenu.classList.contains("opened")) {
							if (rangeBoxHeight > 150) {
								//MQ(M) or larger
								body.classList.remove("mobile-menu-opened");
								html.classList.remove("mobile-menu-opened");
							} else {
								//MQ(S) or smaller
								body.classList.add("mobile-menu-opened");
								html.classList.add("mobile-menu-opened");
							} //end if
						} //end if

						checkSubMenuBounds(subMenuUL);
					}, resizeDelay);
				} //end if window dimensions check
			},
			true
		);
		//end window resize event

		window.addEventListener(
			"scroll",
			function () {
				let yEnd; //ending scroll position after timeout has finished
				let scrollDir; //scrolling direction. >0 = scroll down, <0 = scroll up
				let header = document.getElementsByTagName("header");
				let main = document.getElementsByTagName("main");
				let cont = main[0].getElementsByClassName("container")[0]; //first bootstrap container within the main tag that gets paddingTop adjusted on scroll

				/* https://css-tricks.com/snippets/jquery/done-resizing-event/ */
				//run code after a time once resizing is done
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(function () {
					//Run code here, scrolling has "stopped"

					rangeBoxHeight = rangeBox.offsetHeight;
					if (rangeBoxHeight > 150) {
						//MQ(M) or larger
						yEnd = window.pageYOffset;
						scrollDir = yEnd - yStart;
						yStart = yEnd;

						if (yEnd > 0) {
							header[0].classList.add("sticky");

							resetDdmenu(ddMenu);

							if (scrollDir < 0) {
								//scroll direction is up
								cont.style.paddingTop = header[0].offsetHeight + "px"; //give padding equal to height of header
								header[0].classList.add("in");
								header[0].classList.remove("out");
							} else {
								//scroll direction is down
								header[0].classList.add("out");
							}
						} else {
							resetStickyMenu(header[0], cont);
						} //end if
					} else {
						//MQ(S) or smaller, don't use sticky menu as it takes up too much of the screen
						resetStickyMenu(header[0], cont);
					} //end if
				}, scrollDelay);
			},
			true
		);
		//end window scroll event

		//begin window orientation change event
		window.matchMedia("(orientation: portrait)").addListener(function (m) {
			if (m.matches) {
				//portrait
				window.dispatchEvent(new Event("resize"));
			} else {
				//landscape
				window.dispatchEvent(new Event("resize"));
			}
		});
		// end window orientation change event

		//add class that overrides default, CSS based hover behavior
		ddMenu.classList.add("js-enabled");

		//submenu ULs
		let subMenuUL = ddMenu.querySelectorAll("ul a + ul");

		//handle clicks outside of menu
		// document.body.addEventListener("click", function (e) {
		// 	if (
		// 		!e.target.closest("#" + ddMenu.getAttribute("id")) ||
		// 		e.target.tagName.toLowerCase() != "a"
		// 	) {
		// 		//if out of menu, or if within menu but not on an anchor
		// 		//this last check is because the entire menu can span from an apparent logo as the first menu item, for menus having the class of "with-logo", to the last apparent menu item
		// 		resetDdmenu(ddMenu);
		// 	}
		// }); //end handle clicks outside of menu

		//https://stackoverflow.com/questions/3369593/how-to-detect-escape-key-press-with-pure-js-or-jquery
		//handle escape key being pressed
		document.body.addEventListener("keydown", function (e) {
			e = e || window.e;
			if (e.key === "Escape") {
				resetDdmenu(ddMenu);
			}
		});
		//end handle escape key being pressed

		//begin menu items with internal links
		//get all links with hashtag
		let hashLinks = ddMenu.querySelectorAll('a[href^="#"]'); //href starting with #

		for (let hashLink of hashLinks) {
			if (hashLink.getAttribute("href").toString().length > 1) {
				//hashlink is internal link
				//allow internal links to respond to spacebar
				keysTriggerClick(hashLink);

				hashLink.addEventListener("click", function (e) {
					//reset menu
					resetDdmenu(ddMenu);

					//provide proper hash for URL
					let hashTarget = document.getElementById(
						hashLink.getAttribute("href").substring(1)
					);
					window.location.hash = hashTarget;

					hamburgerClose.click();

					// window.setTimeout(function () {
					// 	hashTarget.focus();
					// }, 60); //set timeout to be larger than timeout for hamburger focus timeout
				});
			} //end if
		}
		//end menu items with internal links

		//provide initial aria for subMenuUL
		subMenuUL.forEach(function (item) {
			item.setAttribute("aria-hidden", "true");
			item.setAttribute("aria-label", "submenu");
		});

		for (let subMenu of subMenuUL) {
			//get the anchor followed by a sub menu
			let subLink = subMenu.parentNode.querySelector("a:first-of-type");
			subLink.classList.add("hasSub");

			//setup initial aria for each subLink
			subLink.setAttribute("role", "button");
			subLink.setAttribute("aria-haspopup", "true");
			subLink.setAttribute("aria-pressed", "false");
			subLink.setAttribute("aria-expanded", "false");

			//setup keys to trigger a click
			keysTriggerClick(subLink);

			subLink.addEventListener(
				"click",
				function (e) {
					e.preventDefault();

					//handle open / closed glyphs for subLink, and aria
					if (this.classList.contains("opened")) {
						resetDdmenuSublink(this);
					} else {
						//if closed
						resetDdmenuSublink(this);
						this.classList.add("opened");
						this.setAttribute("aria-pressed", "true");
						this.setAttribute("aria-expanded", "true");
					} //end if

					//begin check to see if submenu UL is of class selected when clicked
					if (
						subLink.parentNode
							.querySelector("ul:first-of-type")
							.classList.contains("selected")
					) {
						//if selected, the submenu is opened, so close it
						resetDdmenuSubMenu(subLink);
						subLink.parentNode
							.querySelector("ul:first-of-type")
							.classList.remove("selected");
						subLink.parentNode
							.querySelector("ul:first-of-type")
							.setAttribute("aria-hidden", "true"); //hide from screen readers
					} else {
						//if NOT selected, the submenu is closed, so open it
						resetDdmenuSubMenu(subLink);
						subLink.parentNode
							.querySelector("ul:first-of-type")
							.classList.add("selected");
						subLink.parentNode
							.querySelector("ul:first-of-type")
							.setAttribute("aria-hidden", "false"); //show to screen readers
					} //end if
				},
				true
			); //subLink.addEventListener('click')
		} //for(let subMenu of subMenuUL)

		checkSubMenuBounds(subMenuUL);

		return;
	} //end fxn initDdmenu

	function resetStickyMenu(header, cont) {
		//removes sticky menu related classes from header and resets the padding of the first bootstrap element in main tag
		header.classList.remove("sticky");
		header.classList.remove("in");
		header.classList.remove("out");

		cont.style.paddingTop = "0px"; //reset

		return;
	} //end fxn resetStickyMenu

	function checkSubMenuBounds(subMenuUL) {
		//adjust class of subMenuUL if it extends beyond the right edge of browser window
		for (let subMenu of subMenuUL) {
			if (subMenu.classList.contains("shiftLeft")) {
				subMenu.classList.remove("shiftLeft"); //remove class that shifts subMenu to left side
			}

			let depth = 1;
			let currentMenu = subMenu;

			while (
				currentMenu.parentNode
					.querySelector("a:first-of-type")
					.classList.contains("hasSub")
			) {
				depth++;
				currentMenu = currentMenu.parentNode.parentNode; //walk up the subMenu tree
			}

			if (depth > 2) {
				//subMenu in question normally appears on right side

				//check its bounds
				let x = getOffset(subMenu).left; //left x coordinate of subMenu
				let w = subMenu.offsetWidth;
				let rc = x + w; //right x coordinate of subMenu
				let windowWidth = window.innerWidth;

				if (rc >= windowWidth - w / 2) {
					// the w/2 is arbitrary but serves to ensure that the submenus shift to the left properly for all MQ > MQ(s)
					//add class to shift subMenu to left side
					subMenu.classList.add("shiftLeft");
					subMenu.parentNode.parentNode.classList.add("shiftLeft");
				}
			} //end if
		} //for(let subMenu of subMenuUL)

		return;
	} //end fxn checkSubMenuBounds

	function resetDdmenuSublink(subLink) {
		//resets current sublink aria and class states
		subLink.parentNode.parentNode.querySelectorAll("a").forEach(function (item) {
			item.classList.remove("opened");
			item.setAttribute("aria-pressed", "false");
			item.setAttribute("aria-expanded", "false");
		});

		return;
	} //end fxn resetDdmenuSublink

	function resetDdmenuSubMenu(subLink) {
		//resets current submenu tree aria and class states
		subLink.parentNode.parentNode
			.querySelectorAll("li > a + ul:first-of-type")
			.forEach(function (item) {
				item.classList.remove("selected");
				item.setAttribute("aria-hidden", "true"); //hide from screen readers
			});

		return;
	} //end fxn resetDdmenuSubMenu

	function resetDdmenu(menu) {
		//resets aria attributes and classes for menu and link states
		menu.querySelectorAll('[aria-hidden="false"]').forEach(function (item) {
			item.setAttribute("aria-hidden", "true");
		});

		menu.querySelectorAll('[aria-expanded="true"]').forEach(function (item) {
			item.setAttribute("aria-expanded", "false");
		});

		menu.querySelectorAll('[aria-pressed="true"]').forEach(function (item) {
			item.setAttribute("aria-pressed", "false");
		});

		menu.querySelectorAll(".selected").forEach(function (item) {
			item.classList.remove("selected");
		});

		menu.querySelectorAll(".opened").forEach(function (item) {
			item.classList.remove("opened");
		});

		//https://stackoverflow.com/questions/2520650/how-do-you-clear-the-focus-in-javascript
		//remove focus from menu
		document.activeElement.blur();

		return;
	} //end fxn resetDdmenu

	function keysTriggerClick(el, keys = [], stopEvent = true, stopProp = true) {
		//allow for proper aria keydown events, by default, or other events to be triggered on keydown
		//https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role
		//el is the element triggering the click event. Must have an ID attribute set for itself in the DOM.
		//stopEvent & stopProp are booleans to stop event default or propagation
		//keys are additional keys that trigger the events and must be passed as an array: ['1', '2', 'x', 'y']

		//default keys to check:
		keys.push(" ", "Enter", "Spacebar"); //"Spacebar" for IE11 support

		el.addEventListener("keydown", function (e) {
			if (keys.includes(e.key)) {
				if (stopEvent) {
					e.preventDefault();
				}

				if (stopProp) {
					e.stopPropagation();
				}

				el.click();
			} //end keydown event for el

			return;
		}); //end keydown event
	} //end fxn keysTriggerClick
	
})(); //end Self-Executing Anonymous Function
