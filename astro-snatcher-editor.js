

var column1 = document.getElementById("column1"),
	palettePanel = document.getElementById("palettePanel"),
	scriptPanel = document.getElementById("scriptPanel");

var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

var tabs = document.querySelectorAll(".tab"),
	tabPanels = document.querySelectorAll(".tabPanel");

var currentTab = 0,
	draggingBlock = false,
	draggingBlockX,
	draggingBlockY,
	draggingBlockParent,
	currentDropTarget;



tabs.forEach((tab, i) => tab.addEventListener("click", () => {
	tabs[currentTab].classList.remove("selected");
	tabPanels[currentTab].classList.remove("selected");
	currentTab = i;
	tab.classList.add("selected");
	tabPanels[i].classList.add("selected");
}));



updateCanvasSize();

window.addEventListener("resize", updateCanvasSize);

function updateCanvasSize() {
	var {width, height} = canvas.getBoundingClientRect();
	canvas.width = Math.floor(width);
	canvas.height = Math.floor(height);
}



function Block(props) {
	Object.assign(this, props);
	this.children = {};
}

Block.prototype = {
	getDropBoxes() {
		return [
			...this.cStackBoxes.map((cBox, i) => ({
				box: cBox.getBoundingClientRect(),
				block: this,
				type: "cSlot",
				index: i
			})),
			{
				box: this.bottomStackBox.getBoundingClientRect(),
				block: this,
				type: "stacked"
			}
		];
	},
	getDropTarget() {
		var thisBox = this.topStackBox.getBoundingClientRect(),
			result;
		for (let block of scriptBlocks) {
			if (block !== this) {
				let boxes = block.getDropBoxes();
				for (let box of boxes) {
					if (rectsCollide(thisBox, box.box)) {
						if (result) {
							if (overlapArea(thisBox, box.box) > overlapArea(thisBox, result.box))
								result = box;
						} else result = box;
					}
				}
			}
		}
		return result;
	},
	highlightDropTarget({type, index}) {
		if (type === "stacked") {
			this.bottomPiece.classList.add("bottomIsDropTarget");
		} else if (type === "cSlot") {
			this.preCPieces[index].classList.add("bottomIsDropTarget");
		}
	},
	dehighlightDropTarget({type, index}) {
		if (type === "stacked") {
			this.bottomPiece.classList.remove("bottomIsDropTarget");
		} else if (type === "cSlot") {
			this.preCPieces[index].classList.remove("bottomIsDropTarget");
		}
	},
	delete() {
		for (let type in this.children) {
			let block = this.children[type];
			if (block) block.delete();
		}
		scriptBlocks.splice(scriptBlocks.indexOf(this), 1);
		var rootIdx = scriptRoots.indexOf(this);
		if (rootIdx !== -1) scriptRoots.splice(rootIdx, 1);
		this.wrapper.remove();
	},
	detach() {
		if (this.parent) {
			this.parent.removeChild(this);
			this.parent = false;
		}
	},
	removeChild(type) {
		if (typeof type !== "string") type = this.getChildType(type);
		this.children[type] = false;
	},
	getChildType(child) {
		for (let type in this.children) {
			if (this.children[type] === child) return type;
		}
	},
	drop(target) {
		this.wrapper.style.removeProperty("left");
		this.wrapper.style.removeProperty("top");
		scriptRoots.splice(scriptRoots.indexOf(this), 1);
		this.parent = target.block;
		target.block.addChild(this, target);
	},
	addChild(block, {type, index}) {
		if (type === "stacked") {
			if (this.children.stacked) {
				let oldStacked = this.children.stacked;
				this.removeChild("stacked");
				block.stackAtBottom(oldStacked);
			}
			this.children.stacked = block;
			this.wrapper.appendChild(block.wrapper);
		} else if (type === "cSlot") {
			type += index;
			if (this.children[type]) {
				let oldStacked = this.children[type];
				this.removeChild(type);
				block.stackAtBottom(oldStacked);
			}
			this.children[type] = block;
			this.cElems[index].appendChild(block.wrapper);
		}
	},
	stackAtBottom(block) {
		if (this.children.stacked)
			this.children.stacked.stackAtBottom(block);
		else this.addChild(block, {type: "stacked"});
	}
}


function rectsCollide(a, b) {
	return a.right >= b.left && b.right >= a.left && a.bottom >= b.top && b.bottom >= a.top;
}

function overlapArea(rect1, rect2) {
	return overlapLength(rect1.left, rect1.right, rect2.left, rect2.right) * overlapLength(rect1.top, rect1.bottom, rect2.top, rect2.bottom);
}

function overlapLength(...nums) {
	nums.sort((a, b) => a - b);
	return nums[2] - nums[1];
}


var paletteBlocks = [
	{
		items: [
			{type: "label", value: "when the level starts"}
		],
		shape: "hat"
	},
	{
		items: [
			{type: "label", value: "launch game script"},
			{type: "c"}
		]
	},
	{
		items: [
			{type: "label", value: "launch game loop"},
			{type: "c"}
		]
	},
	{
		items: [
			{type: "label", value: "wait"},
			{type: "number"},
			{type: "label", value: "milliseconds"}
		]
	},
	{
		items: [
			{type: "label", value: "slide to ("},
			{type: "number"},
			{type: "label", value: ","},
			{type: "number"},
			{type: "label", value: ") in"},
			{type: "number"},
			{type: "label", value: "milliseconds"}
		]
	},
	{
		items: [
			{type: "label", value: "copy object"},
			{type: "object"}
		],
		shape: "reporter"
	},
	{
		items: [
			{type: "label", value: "insert object"},
			{type: "object"},
			{type: "label", value: "at ("},
			{type: "number"},
			{type: "label", value: ","},
			{type: "number"},
			{type: "label", value: ")"}
		]
	},
	{
		items: [
			{type: "label", value: "relative x"},
			{type: "number"}
		],
		shape: "reporter"
	},
	{
		items: [
			{type: "label", value: "relative y"},
			{type: "number"}
		],
		shape: "reporter"
	},
	{
		items: [
			{type: "label", value: "add score"},
			{type: "number"}
		]
	},
	{
		items: [
			{type: "label", value: "win level"}
		]
	},
	{
		items: [
			{type: "label", value: "console.log"},
			{type: "text"}
		]
	}
];


var scriptBlocks = [],
	scriptRoots = [];

function updateBlockZIndices() {
	scriptRoots.forEach(({wrapper}, i) => {
		wrapper.style.zIndex = i + 1;
	});
}


{
	let spacing = 1,
		nextPxX = 0,
		nextEmX = spacing;
	
	paletteBlocks.forEach(blockDef => {
		var block = makeBlock(blockDef, true).wrapper;
		block.style.left = `calc(${Math.round(nextPxX)}px + ${nextEmX}em)`;
		block.style.top = spacing + "em";
		palettePanel.appendChild(block);
		var {width} = block.getBoundingClientRect();
		nextPxX += width;
		nextEmX += spacing;
	});
}


document.addEventListener("mousemove", e => {
	if (draggingBlock) {
		let draggingElem = draggingBlock.wrapper;
		e.preventDefault();
		updatePosition(draggingElem);
		let {left: panelLeft, top: panelTop} = scriptPanel.getBoundingClientRect(),
			{left: blockLeft, top: blockTop} = draggingElem.getBoundingClientRect();
		if (blockLeft < panelLeft || blockTop < panelTop) {
			if (draggingBlockParent === scriptPanel) {
				draggingBlockParent = document.body;
				draggingBlockParent.appendChild(draggingElem);
				updatePosition(draggingElem);
			}
		} else {
			if (draggingBlockParent !== scriptPanel) {
				draggingBlockParent = scriptPanel;
				draggingBlockParent.appendChild(draggingElem);
				updatePosition(draggingElem);
			}
		}
		
		var foundDropTarget = draggingBlock.getDropTarget();
		if (foundDropTarget !== currentDropTarget) {
			if (currentDropTarget) {
				currentDropTarget.block.dehighlightDropTarget(currentDropTarget);
			}
			currentDropTarget = foundDropTarget;
			if (currentDropTarget) {
				currentDropTarget.block.highlightDropTarget(currentDropTarget);
			}
		}
	}
	
	function updatePosition(draggingElem) {
		let {left: parentLeft, top: parentTop} = draggingBlockParent.getBoundingClientRect();
		draggingElem.style.left = (e.pageX - parentLeft + draggingBlockX) + "px";
		draggingElem.style.top = (e.pageY - parentTop + draggingBlockY) + "px";
	}
});
	
document.addEventListener("mouseup", e => {
	if (draggingBlock) {
		let draggingElem = draggingBlock.wrapper,
			{left: panelLeft, top: panelTop} = scriptPanel.getBoundingClientRect();
		if (e.clientX < panelLeft || e.clientY < panelTop) {
			draggingBlock.delete();
			draggingBlock = false;
		} else {
			let dropTarget = draggingBlock.getDropTarget();
			if (dropTarget) {
				if (currentDropTarget) currentDropTarget.block.dehighlightDropTarget(currentDropTarget);
				draggingBlock.drop(dropTarget);
			} else {
				let {left: blockLeft, top: blockTop} = draggingElem.getBoundingClientRect();
				if (blockLeft < panelLeft || blockTop < panelTop) {
					scriptPanel.appendChild(draggingElem);
					if (blockLeft < panelLeft) draggingElem.style.left = "0";
					else draggingElem.style.left = (blockLeft - panelLeft) + "px";
					if (blockTop < panelTop) draggingElem.style.top = "0";
					else draggingElem.style.top = (blockTop - panelTop) + "px";
				}
			}
			draggingElem.classList.remove("dragged");
			draggingBlock = false;
		}
	}
});


function makeBlock(info, inPalette) {
	var {items, shape = "stack"} = info,
		wrapper = document.createElement("div"),
		elem = document.createElement("div"),
		blockAbove = document.createElement("div"),
		topStackBox = document.createElement("div"),
		blockBelow = document.createElement("div"),
		bottomStackBox = document.createElement("div"),
		cStackBoxes = [], cElems = [], preCPieces = [],
		firstPiece,
		currentPiece, currentPieceItems;
		
	wrapper.classList.add("blockWrapper");
	elem.classList.add("block");
	blockAbove.classList.add("blockAbove");
	topStackBox.classList.add("blockTopStackBox");
	blockBelow.classList.add("blockBelow");
	bottomStackBox.classList.add("blockBottomStackBox");
	
	blockAbove.appendChild(topStackBox);
	wrapper.appendChild(blockAbove);
	wrapper.appendChild(elem);
	blockBelow.appendChild(bottomStackBox);
	wrapper.appendChild(blockBelow);
	
	if (shape === "hat") {
		let hatElem = document.createElement("div"),
			hatBorder = document.createElement("div"),
			hatInner = document.createElement("div");
		hatElem.classList.add("blockHat");
		hatBorder.classList.add("blockHatBorder");
		hatInner.classList.add("blockHatInner");
		hatElem.appendChild(hatBorder);
		hatElem.appendChild(hatInner);
		elem.appendChild(hatElem);
		elem.classList.add("hasHat");
	} else if (shape === "reporter") {
		elem.classList.add("reporter");
	}
	
	newPiece();
	firstPiece = currentPiece;
	
	items.forEach(item => {
		if (item.type === "c") {
			let cTooth = makeTooth(),
				cStackBox = document.createElement("div");
			cTooth.classList.add("blockCTooth");
			cStackBox.classList.add("blockCStackBox");
			currentPiece.appendChild(cTooth);
			currentPiece.appendChild(cStackBox);
			cStackBoxes.push(cStackBox);
			preCPieces.push(currentPiece);
			currentPiece = false;
			let cElem = document.createElement("div"),
				cAbove = document.createElement("div"),
				cBelow = document.createElement("div"),
				cEdge = document.createElement("div"),
				cSpace = document.createElement("div");
			
			cElem.classList.add("blockC");
			cAbove.classList.add("blockCAbove");
			cBelow.classList.add("blockCBelow");
			cEdge.classList.add("blockCEdge");
			cSpace.classList.add("blockCSpace");
			
			cElem.appendChild(cEdge);
			cElem.appendChild(cAbove);
			cElem.appendChild(cBelow);
			cElem.appendChild(cSpace);
			elem.appendChild(cElem);
			
			cElems.push(cElem);
			
			newPiece();
		} else {
			let itemElem = makeBlockItem(item);
			if (itemElem) {
				if (!currentPiece) newPiece();
				currentPieceItems.appendChild(itemElem);
			}
		}
	});
	
	function newPiece() {
		currentPiece = document.createElement("div");
		currentPieceItems = document.createElement("div");
		currentPiece.classList.add("blockPiece");
		currentPieceItems.classList.add("blockPieceItems");
		currentPiece.appendChild(currentPieceItems);
		elem.appendChild(currentPiece);
	}
	
	
	currentPiece.appendChild(makeTooth());
	
	var toothSlotElem = document.createElement("div"),
		toothSlotEdgeLeft = document.createElement("div"),
		toothSlotSlopeLeft = document.createElement("div"),
		toothSlotSlopeLeftBorder = document.createElement("div"),
		toothSlotSlopeLeftInner = document.createElement("div"),
		toothSlotSlopeRight = document.createElement("div"),
		toothSlotSlopeRightBorder = document.createElement("div"),
		toothSlotSlopeRightInner = document.createElement("div"),
		toothSlotEdgeRight = document.createElement("div");
	
	toothSlotElem.classList.add("blockToothSlot");
	toothSlotEdgeLeft.classList.add("blockToothSlotEdgeLeft");
	toothSlotSlopeLeft.classList.add("blockToothSlotSlopeLeft");
	toothSlotSlopeLeftBorder.classList.add("blockToothSlotSlopeLeftBorder");
	toothSlotSlopeLeftInner.classList.add("blockToothSlotSlopeLeftInner");
	toothSlotSlopeRight.classList.add("blockToothSlotSlopeRight");
	toothSlotSlopeRightBorder.classList.add("blockToothSlotSlopeRightBorder");
	toothSlotSlopeRightInner.classList.add("blockToothSlotSlopeRightInner");
	toothSlotEdgeRight.classList.add("blockToothSlotEdgeRight");
	
	toothSlotElem.appendChild(toothSlotEdgeLeft);
	toothSlotSlopeLeft.appendChild(toothSlotSlopeLeftBorder);
	toothSlotSlopeLeft.appendChild(toothSlotSlopeLeftInner);
	toothSlotElem.appendChild(toothSlotSlopeLeft);
	toothSlotSlopeRight.appendChild(toothSlotSlopeRightBorder);
	toothSlotSlopeRight.appendChild(toothSlotSlopeRightInner);
	toothSlotElem.appendChild(toothSlotSlopeRight);
	toothSlotElem.appendChild(toothSlotEdgeRight);
	firstPiece.insertBefore(toothSlotElem, firstPiece.children[0]);
	
	if (shape !== "reporter") wrapper.classList.add("hasTooth");
	
	if (shape === "stack") wrapper.classList.add("hasToothSlot");
	
	
	function makeTooth() {
		var toothElem = document.createElement("div"),
			toothBorder = document.createElement("div"),
			toothInner = document.createElement("div");
		
		toothElem.classList.add("blockTooth");
		toothBorder.classList.add("blockToothBorder");
		toothInner.classList.add("blockToothInner");
		
		toothElem.appendChild(toothBorder);
		toothElem.appendChild(toothInner);
		return toothElem;
	}
	
	
	var blockObj = new Block({
		wrapper, elem,
		bottomStackBox, topStackBox,
		bottomPiece: currentPiece,
		cStackBoxes, cElems, preCPieces
	});
	
	
	wrapper.addEventListener("mousedown", e => {
		e.stopPropagation();
		var dragObj;
		if (inPalette) {
			dragObj = makeBlock(info);
			draggingBlockParent = document.body;
		} else {
			dragObj = blockObj;
			draggingBlockParent = wrapper.parentElement === document.body ? document.body : scriptPanel;
		}
		var dragElem = dragObj.wrapper;
		draggingBlock = dragObj;
		draggingBlockX = -e.offsetX;
		draggingBlockY = -e.offsetY;
		dragElem.classList.add("dragged");
		draggingBlockParent.appendChild(dragElem);
		var idx = scriptRoots.indexOf(dragObj);
		if (idx === -1) dragObj.detach();
		else scriptRoots.splice(idx, 1);
		scriptRoots.push(dragObj);
		updateBlockZIndices();
	});
	
	if (inPalette) wrapper.style.zIndex = 0;
	else {
		scriptBlocks.push(blockObj);
		scriptRoots.push(blockObj);
	}
	
	return blockObj;
}

function makeBlockItem(item) {
	var elem;
	if (item.type === "label") {
		elem = document.createElement("div");
		elem.classList.add("blockLabel");
		elem.innerHTML = item.value;
	} else if (item.type === "text" || item.type === "number") {
		elem = document.createElement("div");
		elem.contentEditable = true;
		elem.classList.add(item.type === "text" ? "blockText" : "blockNumber");
		elem.spellcheck = false;
		elem.textContent = item.value || "";
		elem.addEventListener("mousedown", e => {
			e.stopPropagation();
		});
	}
	return elem;
}