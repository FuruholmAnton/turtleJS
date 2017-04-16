/* Helpers */
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

const getValue = function(elem, value) {
    let newValue = getComputedStyle(elem, null).getPropertyValue(value);

    return parseFloat(newValue.substring(0, newValue.length - 2));
};

class Turtle {

    constructor(wrapper, config) {
        if (!(wrapper instanceof HTMLElement)) {
            console.error('Param needs to be an instance of HTMLElement');
            return false;
        }

        /* Binds this to event callback */
        this.finishLoadingItems = this.finishLoadingItems.bind(this);

        /* Clones the wrapper, to later append everything at one time */
        this.wrapper = wrapper.cloneNode(true);
        this.oldWrapperReference = wrapper;
        this.items = Array.from(this.wrapper.querySelectorAll('img'));

        this.totalItems = this.items.length;

        /* Keeps track of images that have finished loaded by image index,
           Images need to finish to get the natural height/width */
        this.totalLoadedItems = 0;

        this.wrapperWidth = wrapper.getBoundingClientRect().width;

        /* Users settings overrides default */
        this.config = Object.assign({
            wrapperPadding: 0,
            itemMargin: 4,
            minWidth: 100,
            maxWidth: 400,
            minHeight: 50,
            maxHeight: 400,
            resize: false,
        }, config);

        /* MaxWidth cannot be less than minWidth */
        if (this.config.minWidth > this.config.maxWidth) {
            this.config.maxWidth = this.config.minWidth;
        }

        /* Get the space over for images:
           Wrapper width - padding */
        this.wrapperWidthForUse = (this.wrapperWidth - (this.config.wrapperPadding * 2));

        /* Calc how many items can fit in wrapper */
        this.maxItems = Math.floor(this.wrapperWidth / this.config.minWidth);
        this.minItems = Math.floor(this.wrapperWidth / this.config.maxWidth);
    }


    /**
     * Initalize images
     * NOTE: Runs before images have loaded
     *
     * @param {funtion} callback
     *
     * @memberOf Turtle
     */
    init(callback) {
        if (typeof callback === 'function') {
            this.userCallback = callback;
        }

        /* Some styling */
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML =`.turtlejs { padding: ${this.config.wrapperPadding}px; } .turtlejs-item { margin-left: ${this.config.itemMargin}px; display: inline-block; }`;
        document.head.appendChild(style);

        /* Removes whitespace from within container */
        this.wrapper.innerHTML = this.wrapper.innerHTML.replace(/>\s+</g, '><');
        this.wrapper.classList.add('turtlejs');

        /* Adds class for styling
           Wait for images to load */
        for (let i = 0; i < this.totalItems; i++) {
            this.items[i].classList.add('turtlejs-item');
            this.items[i].addEventListener('load', this.finishLoadingItems);

            /* Inits object to store values specific to item */
            // REVIEW: use Symbol() to prevent possible overwrite?
            this.items[i].turtle = {
                ratio: {
                    width: 0,
                    height: 0,
                },
            };
        }

        this.itemsMap = new WeakMap();
        this.items.forEach(function(element) {
            this.itemsMap.set(element, element);
        }, this);

        if (this.config.resize === true) {
            const _this = this;
            // Stop layout from repaiting to many times on resize
            window.addEventListener('resize', function(event) {
                let id = String(new Date().getTime());

                waitForFinalEvent(function() {
                    _this.initItems();
                }, 500, id);
            }, false);
        }
    }

    /**
     *
     * Event callback
     * Runs on every item
     * Runs initItems() when all images been loaded
     *
     * @memberOf Turtle
     */
    finishLoadingItems() {
        this.totalLoadedItems += 1;

        if (this.totalLoadedItems == (this.totalItems - 1)) {
            this.initItems();
        }
    }


    /**
     * Gets the values
     * Runs after all images are loaded
     *
     * @memberOf Turtle
     */
    initItems() {
        let items = this.items;

        for (let i = 0; i < items.length; i++) {
            /* Sets the height ratio compared to the width */
            // items[i].turtle.ratio.height = items[i].naturalHeight / items[i].naturalWidth;
            items[i].turtle.ratio.height = 1;
            items[i].turtle.ratio.width = items[i].naturalWidth / items[i].naturalHeight;
        };

        /* Keeps track of items left to process
           Entries are removed after they processed */
        this.unprocessedItems = JSON.parse(JSON.stringify(this.items));
        let i = 0;
        this.unprocessedItems.map((n) => {
            return n.key = i++;
        });

        /* Run setItems() if there's enough space for 2 images */
        if (this.wrapperWidthForUse >= (this.config.minWidth * 2)) {
            this.fix();
        } else {
            // set every img to width 100%
        }
    }

    setItems() {
        // for (let i = 0; i < this.unprocessedItems.length; i++) {
        //     this.totalUnprocessed.push(i);
        // }

        // /* Run fix until every row has finished layout */
        // if (this.unprocessedItems.length > 0) {
        //     this.fix();
        // }
        this.fix();
    }

    fix() {
        let diffWidth = 0;
        let diffHeight = 0;

        let imageWidth;
        let imageHeight;

        if (this.unprocessedItems.length === 1 && window.innerWidth > 400) {
            // Removes the last item in the array
            /* No need to process one item */
            this.unprocessedItems.shift();
        } else {
            // for (let i = 0; i < this.totalUnprocessed.length; i++) {
            //     // calculates the new width

            //     currentItem = items[this.unprocessedItems[0]];

            //     // TODO: base on user input
            //     imageWidth = this.config.maxWidth;

            //     /* Ratio ex. 0.46 */
            //     let ratio = currentItem.naturalHeight / currentItem.naturalWidth;
            //     /* get real ratio height */
            //     imageHeight = imageWidth * ratio;

            //     if (imageHeight > this.config.minHeight
            //             && imageHeight < this.config.maxHeight) {

            //     }

            //     diffWidth = imageWidth * (this.wrapperWidth / this.maxWidth);
            //     diffHeight = imageHeight * (this.wrapperWidth / this.maxWidth);

            //     currentItem.style.width = diffWidth - (this.wrapperPadding / this.totalUnprocessed.length) - this.itemMargin + 'px';
            //     currentItem.style.height = diffHeight - this.itemMargin + 'px';

            //     this.unprocessedItems.shift();
            // };

            /**/

                // get maxItems of images and check the height compared to the ratio
                // to see if its more than minHeight and less than maxHeight
                // Otherwise take maxItems - 1, but not less than minItems.
                // repeat process

                // TODO: Save values in array and set all images at the same time
                // Copy wrapper to virtual and append everything at the same time

            /**/

            // New for to replace above
            let itemsToTry = Math.min(this.maxItems, this.unprocessedItems.length);

            let setImagesWidthHeight = function(items) {
                let itemsCount = items;

                // for (let i = 0; i < itemsCount; i++) {
                //     let currentItem = this.items[this.unprocessedItems[0].key];

                //     let ratio = currentItem.turtle.ratio;

                //     /* Get real ratio height */
                //     /* + 1 to get the margin on the right side of the last one */
                //     let spaceForOne = ((this.wrapperWidthForUse - (this.config.itemMargin * (itemsCount + 1))) / itemsCount);
                //     imageHeight = ratio.height * spaceForOne;
                //     imageWidth = ratio.width * spaceForOne;

                //     // diffWidth = imageWidth * (this.wrapperWidth / itemsCount);
                //     // diffHeight = imageHeight * (this.wrapperWidth / itemsCount);

                //     // currentItem.style.width = diffWidth - (this.config.wrapperPadding / this.unprocessedItems.length) - this.itemMargin + 'px';
                //     // currentItem.style.height = diffHeight - this.itemMargin + 'px';

                //     currentItem.style.width = imageWidth + 'px';
                //     currentItem.style.height = imageHeight + 'px';

                //     /* Remove item from unprocessed */
                //     this.unprocessedItems.splice(0, 1);
                //     if (this.unprocessedItems.length === 0) return false;
                // }

                let totalWithRatio = 0;
                let spaceOver = (this.wrapperWidthForUse - (this.config.itemMargin * (itemsCount + 1)));

                for (let i = 0; i < itemsCount; i++) {
                    totalWithRatio += this.items[this.unprocessedItems[i].key].turtle.ratio.width;
                }

                for (let i = 0; i < itemsCount; i++) {
                    this.items[this.unprocessedItems[0].key].style.width = (spaceOver / totalWithRatio) * this.items[this.unprocessedItems[0].key].turtle.ratio.width + 'px';
                    this.items[this.unprocessedItems[0].key].style.height = (spaceOver / totalWithRatio) + 'px';

                    /* Remove item from unprocessed */
                    this.unprocessedItems.splice(0, 1);
                    if (this.unprocessedItems.length === 0) return false;
                }
            };
            setImagesWidthHeight = setImagesWidthHeight.bind(this);

            /**
             *
             *
             * @param {Array:HTMLImageElement} items
             * @returns {Boolean} if items fit in wrapper
             */
            function calcNumberOfImagesForCurrentRow(items) {
                let itemsCount = items;
                let passed = true;

                // TODO: Need to check if all can fix with the same height

                /* Get all ratios */
                for (let i = 0; i < itemsCount; i++) {
                    /* check the real item */
                    let currentItem = this.items[this.unprocessedItems[i].key];

                    /* Height ratio ex. 0.46 */
                    let ratio = currentItem.turtle.ratio;

                    /* Get real ratio height
                       width for one item = Wrapper space (padding included) - margin for each item, devided by items
                       height = width * ratio */
                    imageHeight = ((this.wrapperWidthForUse - (this.config.itemMargin * itemsCount)) / itemsCount) * ratio.height;

                    if (imageHeight > this.config.minHeight
                        && imageHeight < this.config.maxHeight) {

                    } else {
                        /* Set to false if any of the images can't fill the criterias */
                        passed = false;
                    }
                }

                if (itemsToTry <= Math.min(this.minItems, 2)) {
                    setImagesWidthHeight(itemsToTry);
                    return false;
                }

                /* if items fit in wrapper */
                if (passed) {
                    // TODO: save values
                    setImagesWidthHeight(itemsToTry);


                    /* return false to stop while loop */
                    return false;
                } else {
                    if (itemsToTry = 1) {
                        setImagesWidthHeight(itemsToTry);
                        return false;
                    }
                    /* Try width one less item */
                    itemsToTry -= 1;
                    /* return true to do while loop */
                    return true;
                }
            }
            calcNumberOfImagesForCurrentRow = calcNumberOfImagesForCurrentRow.bind(this);

            /* runs until all have been tested */
            while (itemsToTry >= this.minItems && calcNumberOfImagesForCurrentRow(itemsToTry));

            if (itemsToTry < this.config.minItems) {
                /* Should not happen */
                console.warn('An error occurred');
                return false;
            }
        };

        /* Run until all rows been processed */
        if (this.unprocessedItems.length > 0) {
            this.fix();
        } else {
            /* Finished */
            // TODO: append wrapper to old wrapper
            this.wrapper.innerHTML = '';
            this.items.forEach(function(element) {
                this.wrapper.appendChild(element);
            }, this);
            this.oldWrapperReference.innerHTML = this.wrapper.innerHTML;
            if (typeof this.userCallback === 'function') {
                this.userCallback();
            }
        }
    }

    /**
     * Resets values to recalculate
     *
     *
     * @memberOf Turtle
     */
    reset() {
        this.totalLoadedItems = 0;
        this.unprocessedItems = [];
    }
};

