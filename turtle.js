
class Turtle {
	constructor(wrapper) {
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

		this.wrapperWidth = wrapper.getBoundingClientRect().width;
	}


    /**
     * Initalize images
     * NOTE: Runs before images have loaded
     *
     * @param {funtion} callback
     *
     * @memberOf Turtle
     */
	init(config, callback) {
		if (typeof callback === 'function') {
			this.userCallback = callback;
		}

		/* Users settings overrides default */
		this.config = Object.assign({
			wrapperPadding: 0,
			itemMargin: 4,
			itemMarginUnit: 'px',
			minWidth: 100,
			maxWidth: 400,
			minHeight: 50,
			maxHeight: 400,
			resize: false,
		}, config);

		this.reset();

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


		/* Some styling */
		if (this.styleTag) this.styleTag.remove();
		const style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = `.turtlejs { padding: ${this.config.wrapperPadding}px; } .turtlejs-item { margin: 0 ${(this.config.itemMargin / 2) + this.config.itemMarginUnit} ${(this.config.itemMargin) + this.config.itemMarginUnit}; display: inline-block; vertical-align: top; }`;
		document.head.appendChild(style);
		this.styleTag = style;

		this.wrapper.classList.add('turtlejs');

        /* Adds class for styling
           Wait for images to load */
		for (let i = 0; i < this.totalItems; i++) {
			this.items[i].classList.add('turtlejs-item');
			if (this.items[i].complete) {
				this.finishLoadingItems();
			} else {
				this.items[i].addEventListener('load', this.finishLoadingItems);
			}

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
		this.items.forEach((element) => {
			this.itemsMap.set(element, element);
		});
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
        /* Keeps track of images that have finished loaded by image index,
           Images need to finish to get the natural height/width */
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

	fix() {
		let diffWidth = 0;
		let diffHeight = 0;

		let imageWidth;
		let imageHeight;

		if (this.unprocessedItems.length === 1) {
			// Removes the last item in the array
			/* No need to process one item */
			this.unprocessedItems.shift();
		} else {
			/**/

			// get maxItems of images and check the height compared to the ratio
			// to see if its more than minHeight and less than maxHeight
			// Otherwise take maxItems - 1, but not less than minItems.
			// repeat process

			// Save values in array and set all images at the same time
			// Copy wrapper to virtual and append everything at the same time

			/**/

			// New for to replace above
			let itemsToTry = Math.min(this.maxItems, this.unprocessedItems.length);

			const setImagesWidthHeight = (items) => {
				let itemsCount = items;
				let totalWithRatio = 0;

				/* + 1 to get the margin on the right side of the last one */
				// let spaceOver = (this.wrapperWidthForUse /* - (this.config.itemMargin * (itemsCount + 1))*/);

				/* get total with ratio */
				for (let i = 0; i < itemsCount; i++) {
					totalWithRatio += this.items[this.unprocessedItems[i].key].turtle.ratio.width;
				}

				for (let i = 0; i < itemsCount; i++) {
					const newRatio = this.items[this.unprocessedItems[0].key].turtle.ratio.width / totalWithRatio;

					if (this.config.itemMarginUnit == 'px') {
						this.items[this.unprocessedItems[0].key].style.width = `calc(${newRatio * 100}% - ${(this.config.itemMargin * itemsCount) * newRatio + this.config.itemMarginUnit})`;
					} else if (this.config.itemMarginUnit == '%') {
						this.items[this.unprocessedItems[0].key].style.width = `calc(${newRatio * 100}% - (100% * ${(this.config.itemMargin * itemsCount) * (newRatio / 100)}))`;
					}

					/* Remove item from unprocessed */
					this.unprocessedItems.splice(0, 1);
					if (this.unprocessedItems.length === 0) return false;
				}
			};

            /**
             *
             * @param {Array:HTMLImageElement} items
             * @returns {Boolean} if items fit in wrapper
             */
			const calcNumberOfImagesForCurrentRow = (items) => {
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
			// calcNumberOfImagesForCurrentRow = calcNumberOfImagesForCurrentRow.bind(this);

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
	reset() {
		this.totalLoadedItems = 0;
		this.unprocessedItems = [];
	}
};

