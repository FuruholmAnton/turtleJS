var turtle = (function () {
    'use strict';

    var container 			= QS('.turtlejs'), // Container of the images,
	    containerPadding 	= 0,
	    containerWidth 		= 0,
	    itemsArray 			= [],
	    itemMargin 			= 0,
	    items 				= [], // Array of all the <img>
	    count 				= [],
	    maxWidth 			= 0,
	    totalNumberOfImages	= 0,
	    currentNumberOfImage	= 0;


	var turtle = {};

    function init(callback) {
    	turtle.runAtFinish = callback;

        if (container instanceof HTMLElement) {

        	var tmpContainer,
        		images,
        		style,
        		i;

            /**
			 * Create easy to overwrite css
			 * @type {[type]}
			 */
            style = document.createElement('style');

            style.type = 'text/css';
            style.innerHTML = '.turtlejs-item { margin-left: 4px; height: 300px; display: inline-block; }';
            document.getElementsByTagName('head')[0].appendChild(style);

            tmpContainer = container.innerHTML.replace(/>\s+</g, '><');
            container.innerHTML = tmpContainer;

            images = container.querySelectorAll('img');
            totalNumberOfImages = images.length;
            for (i = 0; i < images.length; i++) {
                images[i].classList.add('turtlejs-item');
            	images[i].addEventListener("load", function() {
            		currentNumberOfImage++;
            		if(currentNumberOfImage == (totalNumberOfImages - 1)) {
            			initImages();
            		}

            	});
            }

            // Stop layout from paiting to many times
            window.addEventListener('resize', function(event) {
                var id = String(new Date().getTime());

                waitForFinalEvent(function() {
                    initImages();
                }, 500, id);
            }, false);

        }
    }

    function initImages() {

        containerPadding = getValue(QS('.turtlejs'),'padding-left') * 2;
        containerWidth = getValue(QS('.turtlejs'), 'width');
        itemMargin = getValue(QS('.turtlejs-item'), 'margin-left') * 2;
        items = QSA('.turtlejs-item');

        for (var i = 0; i < items.length; i++) {
            itemsArray.push(i);
            items[i].style.height = '';
            items[i].style.width = '';

        };

        setImages();
    }

    function setImages() {
        maxWidth = 0;
        count = [];
        var img;

        for (var i = 0; i < itemsArray.length; i++) {
            if (maxWidth < (containerWidth - containerPadding * 2 - itemMargin * 2)) {

                img = getValue(items[itemsArray[i]], 'width');

                maxWidth += img;
                count.push(i);

            }

        };

        if (itemsArray.length > 0) {
            fixImages();

        }
    }

    function fixImages() {

        var diffWidth = 0; // init diff
        var diffHeight = 0; // init diff

        var img;
        var imageWidth;
        var imageHeight;
        var firstImg;

        if (count.length === 1 && itemsArray.length === 1 && window.innerWidth > 400) {
            // Removes first item in array
            itemsArray.shift();

        }else {

            for (var i = 0; i < count.length; i++) {
                // calculates the new width

                firstImg = items[itemsArray[0]];

                imageWidth = getValue(firstImg, 'width');

                //get porpotions

                var prop = firstImg.naturalHeight / firstImg.naturalWidth;

                imageHeight = imageWidth * prop;

                diffWidth = imageWidth * (containerWidth / maxWidth);
                diffHeight = imageHeight * (containerWidth / maxWidth);

                firstImg.style.width = diffWidth - (containerPadding / count.length) - itemMargin + 'px';
                firstImg.style.height = diffHeight - itemMargin + 'px';

                itemsArray.shift();

            };

        };

        if (itemsArray.length > 0) {
            setImages();

        }else {
            console.log('finished');
            // ID('loadingMessage').style.display = 'none';
            var allImages = QSA('.turtlejs-item');

            for (var i = 0; i < allImages.length; i++) {
                allImages[i].style.opacity = '1';
            };
            turtle.runAtFinish();

        }
    }

    /**
    	 * Helpers
    	 * @param {[type]} element [description]
    	 */

    var waitForFinalEvent = (function() {
        var timers = {};

        return function(callback, ms, uniqueId) {
            if (!uniqueId) {
                uniqueId = 'Don\'t call this twice without a uniqueId';

            }

            if (timers[uniqueId]) {
                clearTimeout(timers[uniqueId]);

            }

            timers[uniqueId] = setTimeout(callback, ms);
        };
    })();

    function getValue(elem, value) {
        var newValue = getComputedStyle(elem, null).getPropertyValue(value);

        return parseFloat(newValue.substring(0, newValue.length - 2));
    }

    function QS(element) {
        return document.querySelector(element);
    }

    function QSA(element) {
        return document.querySelectorAll(element);
    }

    function ID(elementID) {
        return document.getElementById(elementID);
    }

    return {
        init: init
    };

})();

