let waitForFinalEvent = (function() {
    let timers = {};

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

/* Helpers */
const getValue = function(elem, value) {
    let newValue = getComputedStyle(elem, null).getPropertyValue(value);

    return parseFloat(newValue.substring(0, newValue.length - 2));
};

class turtle {

    constructor(wrapper) {
        if (!(container instanceof HTMLElement)) {
            console.warn('Param needs to be an instance of HTMLElement');
            return false;
        }
        this.wrapper = wrapper;
        this.items = Array.from(wrapper.querySelectorAll('img'));
        this.totalItems = this.items.length;

        this.containerPadding = 0;
        this.wrapperWidth = 0;
        this.itemsArray = [];
        this.itemMargin = 0;
        this.count = [];
        this.maxWidth = 0;
        this.totalLoadedItems = 0;
    }


    init(callback) {
        this.userCallback = callback;

        /* Some styling */
        let style;
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.turtlejs-item { margin-left: 4px; height: 300px; display: inline-block; }';
        document.head.appendChild(style);

        /* Removes whitespace from within container */
        this.wrapper.innerHTML = this.wrapper.innerHTML.replace(/>\s+</g, '><');

        for (let i = 0; i < this.totalItems; i++) {
            this.items[i].classList.add('turtlejs-item');
            this.items[i].addEventListener('load', this.finishLoadingItems);
        }

        // Stop layout from paiting to many times
        window.addEventListener('resize', function(event) {
            let id = String(new Date().getTime());

            waitForFinalEvent(function() {
                initImages();
            }, 500, id);
        }, false);
    }

    finishLoadingItems() {
        this.totalLoadedItems += 1;

        if (this.totalLoadedItems == (totalNumberOfImages - 1)) {
            initImages();
        }
    }

    initImages() {
        this.containerPadding = getValue(this.wrapper, 'padding-left') * 2;
        this.wrapperWidth = getValue(this.wrapper, 'width');
        this.itemMargin = getValue(this.items[0], 'margin-left') * 2;
        items = this.items;

        for (let i = 0; i < items.length; i++) {
            items[i].style.height = '';
            items[i].style.width = '';
        };

        setImages();
    }

    setImages() {
        this.maxWidth = 0;
        this.count = [];
        let img;

        for (let i = 0; i < this.itemsArray.length; i++) {
            if (this.maxWidth < (this.wrapperWidth - this.containerPadding * 2 - this.itemMargin * 2)) {
                img = getValue(items[this.itemsArray[i]], 'width');

                this.maxWidth += img;
                this.count.push(i);
            }
        };

        if (this.itemsArray.length > 0) {
            fixImages();
        }
    }

    fixImages() {
        let diffWidth = 0; // init diff
        let diffHeight = 0; // init diff

        let imageWidth;
        let imageHeight;
        let firstImg;

        if (this.count.length === 1 && this.itemsArray.length === 1 && window.innerWidth > 400) {
            // Removes first item in array
            this.itemsArray.shift();
        } else {
            for (let i = 0; i < this.count.length; i++) {
                // calculates the new width

                firstImg = items[this.itemsArray[0]];

                imageWidth = getValue(firstImg, 'width');

                // get proportions

                let prop = firstImg.naturalHeight / firstImg.naturalWidth;

                imageHeight = imageWidth * prop;

                diffWidth = imageWidth * (this.wrapperWidth / this.maxWidth);
                diffHeight = imageHeight * (this.wrapperWidth / this.maxWidth);

                firstImg.style.width = diffWidth - (this.containerPadding / this.count.length) - this.itemMargin + 'px';
                firstImg.style.height = diffHeight - this.itemMargin + 'px';

                this.itemsArray.shift();
            };
        };

        if (this.itemsArray.length > 0) {
            setImages();
        } else {
            /* Finished */
            this.userCallback();
        }
    }
};

