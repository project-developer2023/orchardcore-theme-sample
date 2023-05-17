document.addEventListener("DOMContentLoaded", function() {
	const header = document.querySelector('header');
	const main = document.querySelector('main');

	const introSelector = header.getAttribute('data-intro-section');

	window.addEventListener('scroll', function() {
	    if (window.scrollY > 75) {
			header.classList.add('fixed-top');
	        // add padding top to show content behind navbar
	        document.body.style.paddingTop = header.querySelector('.navbar').offsetHeight + 'px';

	        if(introSelector) {
	        	// move intro to main.
	        	let intro = document.querySelector(introSelector);

	        	if(intro) {
	        		for(let i = 0; i < header.classList.length; i++) {
	        			if(header.classList[i] != 'fixed-top') {		        			
		        			intro.classList.add(header.classList[i]);
		        		}
	        		}

	        		var fragment = document.createDocumentFragment();
	        		fragment.appendChild(intro);
	        		main.prepend(fragment);
	        	}
	        }
	    } else {
	        header.classList.remove('fixed-top');
	        // remove padding top from body
	        document.body.style.paddingTop = '0';

	        if(introSelector) {
	        	// restore intro position.
	        	let intro = document.querySelector(introSelector);

	        	if(intro) {
	        		for(let i = 0; i < header.classList.length; i++) {
	        			intro.classList.remove(header.classList[i]);
	        		}

	        		var fragment = document.createDocumentFragment();
	        		fragment.appendChild(intro);
	        		header.append(fragment);
	        	}
	        }
		} 
	});
});
