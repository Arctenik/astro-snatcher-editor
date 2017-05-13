

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
	draggingBlockParent;



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


var blockElems = [];

function updateBlockZIndices() {
	blockElems.forEach((elem, i) => {
		elem.style.zIndex = i;
	});
}


{
	let spacing = 1,
		nextPxX = 0,
		nextEmX = spacing;
	
	paletteBlocks.forEach(blockDef => {
		var block = makeBlock(blockDef, true);
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
		e.preventDefault();
		updatePosition();
		let {left: panelLeft, top: panelTop} = scriptPanel.getBoundingClientRect(),
			{left: blockLeft, top: blockTop} = draggingBlock.getBoundingClientRect();
		if (blockLeft < panelLeft || blockTop < panelTop) {
			if (draggingBlockParent === scriptPanel) {
				draggingBlockParent = document.body;
				draggingBlockParent.appendChild(draggingBlock);
				updatePosition();
			}
		} else {
			if (draggingBlockParent !== scriptPanel) {
				draggingBlockParent = scriptPanel;
				draggingBlockParent.appendChild(draggingBlock);
				updatePosition();
			}
		}
	}
	
	function updatePosition() {
		let {left: parentLeft, top: parentTop} = draggingBlockParent.getBoundingClientRect();
		draggingBlock.style.left = (e.pageX - parentLeft + draggingBlockX) + "px";
		draggingBlock.style.top = (e.pageY - parentTop + draggingBlockY) + "px";
	}
});
	
document.addEventListener("mouseup", e => {
	if (draggingBlock) {
		let {left: panelLeft, top: panelTop} = scriptPanel.getBoundingClientRect();
		if (e.clientX < panelLeft || e.clientY < panelTop) {
			blockElems.splice(blockElems.indexOf(draggingBlock), 1);
			draggingBlock.remove();
			draggingBlock = false;
		} else {
			let {left: blockLeft, top: blockTop} = draggingBlock.getBoundingClientRect();
			if (blockLeft < panelLeft || blockTop < panelTop) {
				scriptPanel.appendChild(draggingBlock);
				if (blockLeft < panelLeft) draggingBlock.style.left = "0";
				else draggingBlock.style.left = (blockLeft - panelLeft) + "px";
				if (blockTop < panelTop) draggingBlock.style.top = "0";
				else draggingBlock.style.top = (blockTop - panelTop) + "px";
			}
			draggingBlock.classList.remove("dragged");
			draggingBlock = false;
		}
	}
});


function makeBlock(info, inPalette) {
	var {items, shape = "stack"} = info,
		wrapper = document.createElement("div"),
		elem = document.createElement("div"),
		firstPiece,
		currentPiece, currentPieceItems;
		
	wrapper.classList.add("blockWrapper");
	elem.classList.add("block");
	
	wrapper.appendChild(elem);
	
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
			let cTooth = makeTooth();
			cTooth.classList.add("blockCTooth");
			currentPiece.appendChild(cTooth);
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
	
	
	wrapper.addEventListener("mousedown", e => {
		e.stopPropagation();
		var dragElem;
		if (inPalette) {
			dragElem = makeBlock(info);
			draggingBlockParent = document.body;
		} else {
			dragElem = wrapper;
			draggingBlockParent = wrapper.parentElement;
		}
		draggingBlock = dragElem;
		draggingBlockX = -e.offsetX;
		draggingBlockY = -e.offsetY;
		dragElem.classList.add("dragged");
		draggingBlockParent.appendChild(dragElem);
		blockElems.push(blockElems.splice(blockElems.indexOf(dragElem), 1)[0]);
		updateBlockZIndices();
	});
	
	blockElems.push(wrapper);
	
	return wrapper;
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