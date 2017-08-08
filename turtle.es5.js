'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var Turtle = function () {
    function Turtle(wrapper, config) {
        classCallCheck(this, Turtle);

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
            resize: false
        }, config);

        /* MaxWidth cannot be less than minWidth */
        if (this.config.minWidth > this.config.maxWidth) {
            this.config.maxWidth = this.config.minWidth;
        }

        /* Get the space over for images:
           Wrapper width - padding */
        this.wrapperWidthForUse = this.wrapperWidth - this.config.wrapperPadding * 2;

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


    createClass(Turtle, [{
        key: 'init',
        value: function init(callback) {
            if (typeof callback === 'function') {
                this.userCallback = callback;
            }

            /* Some styling */
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.turtlejs { padding: ' + this.config.wrapperPadding + 'px; } .turtlejs-item { margin-left: ' + this.config.itemMargin + 'px; margin-bottom: ' + this.config.itemMargin + 'px; display: inline-block; vertical-align: top; }';
            document.head.appendChild(style);

            this.wrapper.classList.add('turtlejs');

            /* Adds class for styling
               Wait for images to load */
            for (var i = 0; i < this.totalItems; i++) {
                this.items[i].classList.add('turtlejs-item');
                this.items[i].addEventListener('load', this.finishLoadingItems);

                /* Inits object to store values specific to item */
                // REVIEW: use Symbol() to prevent possible overwrite?
                this.items[i].turtle = {
                    ratio: {
                        width: 0,
                        height: 0
                    }
                };
            }

            this.itemsMap = new WeakMap();
            this.items.forEach(function (element) {
                this.itemsMap.set(element, element);
            }, this);
        }

        /**
         *
         * Event callback
         * Runs on every item
         * Runs initItems() when all images been loaded
         *
         * @memberOf Turtle
         */

    }, {
        key: 'finishLoadingItems',
        value: function finishLoadingItems() {
            this.totalLoadedItems += 1;

            if (this.totalLoadedItems == this.totalItems - 1) {
                this.initItems();
            }
        }

        /**
         * Gets the values
         * Runs after all images are loaded
         *
         * @memberOf Turtle
         */

    }, {
        key: 'initItems',
        value: function initItems() {
            var items = this.items;

            for (var _i = 0; _i < items.length; _i++) {
                /* Sets the height ratio compared to the width */
                // items[i].turtle.ratio.height = items[i].naturalHeight / items[i].naturalWidth;
                items[_i].turtle.ratio.height = 1;
                items[_i].turtle.ratio.width = items[_i].naturalWidth / items[_i].naturalHeight;
            }

            /* Keeps track of items left to process
               Entries are removed after they processed */
            this.unprocessedItems = JSON.parse(JSON.stringify(this.items));
            var i = 0;
            this.unprocessedItems.map(function (n) {
                return n.key = i++;
            });

            /* Run setItems() if there's enough space for 2 images */
            if (this.wrapperWidthForUse >= this.config.minWidth * 2) {
                this.fix();
            } else {
                // set every img to width 100%
            }
        }
    }, {
        key: 'fix',
        value: function fix() {
            var diffWidth = 0;
            var diffHeight = 0;

            var imageWidth = void 0;
            var imageHeight = void 0;

            if (this.unprocessedItems.length === 1) {
                // Removes the last item in the array
                /* No need to process one item */
                this.unprocessedItems.shift();
            } else {

                /**
                 *
                 * @param {Array:HTMLImageElement} items
                 * @returns {Boolean} if items fit in wrapper
                 */
                var calcNumberOfImagesForCurrentRow = function calcNumberOfImagesForCurrentRow(items) {
                    var itemsCount = items;
                    var passed = true;

                    // TODO: Need to check if all can fix with the same height

                    /* Get all ratios */
                    for (var i = 0; i < itemsCount; i++) {
                        /* check the real item */
                        var currentItem = this.items[this.unprocessedItems[i].key];

                        /* Height ratio ex. 0.46 */
                        var ratio = currentItem.turtle.ratio;

                        /* Get real ratio height
                           width for one item = Wrapper space (padding included) - margin for each item, devided by items
                           height = width * ratio */
                        imageHeight = (this.wrapperWidthForUse - this.config.itemMargin * itemsCount) / itemsCount * ratio.height;

                        if (imageHeight > this.config.minHeight && imageHeight < this.config.maxHeight) {} else {
                            /* Set to false if any of the images can't fill the criterias */
                            passed = false;
                        }
                    }

                    // TODO: Clean this up
                    // Check if last row, then it doesn't need to fill the whole space


                    /* if items fit in wrapper */
                    if (!passed && itemsToTry > Math.min(this.minItems, 2)) {
                        /* Try width one less item */
                        itemsToTry -= 1;
                        /* return true to continue while loop */
                        return true;
                    }

                    setImagesWidthHeight(itemsToTry);
                    /* return false to stop while loop */
                    return false;
                };

                /**/

                // get maxItems of images and check the height compared to the ratio
                // to see if its more than minHeight and less than maxHeight
                // Otherwise take maxItems - 1, but not less than minItems.
                // repeat process

                // Save values in array and set all images at the same time
                // Copy wrapper to virtual and append everything at the same time

                /**/

                // New for to replace above
                var itemsToTry = Math.min(this.maxItems, this.unprocessedItems.length);

                var setImagesWidthHeight = function setImagesWidthHeight(items) {
                    var itemsCount = items;
                    var totalWithRatio = 0;

                    /* + 1 to get the margin on the right side of the last one */
                    var spaceOver = this.wrapperWidthForUse - this.config.itemMargin * (itemsCount + 1);

                    /* get total with ratio */
                    for (var i = 0; i < itemsCount; i++) {
                        totalWithRatio += this.items[this.unprocessedItems[i].key].turtle.ratio.width;
                    }

                    for (var _i2 = 0; _i2 < itemsCount; _i2++) {
                        // TODO: set percent instead
                        this.items[this.unprocessedItems[0].key].style.width = spaceOver / totalWithRatio * this.items[this.unprocessedItems[0].key].turtle.ratio.width + 'px';
                        this.items[this.unprocessedItems[0].key].style.height = spaceOver / totalWithRatio + 'px';

                        /* Remove item from unprocessed */
                        this.unprocessedItems.splice(0, 1);
                        if (this.unprocessedItems.length === 0) return false;
                    }
                };
                setImagesWidthHeight = setImagesWidthHeight.bind(this);
                calcNumberOfImagesForCurrentRow = calcNumberOfImagesForCurrentRow.bind(this);

                /* runs until all have been tested */
                while (itemsToTry >= this.minItems && calcNumberOfImagesForCurrentRow(itemsToTry)) {}

                if (itemsToTry < this.config.minItems) {
                    /* Should not happen */
                    console.warn('An error occurred');
                    return false;
                }
            }

            /* Run until all rows been processed */
            if (this.unprocessedItems.length > 0) {
                this.fix();
            } else {
                /* Finished */
                // TODO: append wrapper to old wrapper
                this.wrapper.innerHTML = '';
                this.items.forEach(function (element) {
                    this.wrapper.appendChild(element);
                }, this);
                /* Removes whitespace from within container */
                this.wrapper.innerHTML = this.wrapper.innerHTML.replace(/>\s+</g, '><');

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

    }, {
        key: 'reset',
        value: function reset() {
            this.totalLoadedItems = 0;
            this.unprocessedItems = [];
        }
    }]);
    return Turtle;
}();
