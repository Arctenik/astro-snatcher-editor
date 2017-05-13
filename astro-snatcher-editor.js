

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


{
	let spacing = 1,
		nextPxX = 0,
		nextEmX = spacing;
	
	paletteBlocks.forEach(blockDef => {
		var block = makeBlock(blockDef, true);
		block.style.left = `calc(${nextPxX}px + ${nextEmX}em)`;
		block.style.top = spacing + "em";
		palettePanel.appendChild(block);
		var {width} = block.getBoundingClientRect();
		nextPxX += width;
		nextEmX += spacing;
	});
}


document.addEventListener("mousemove", e => {
	if (draggingBlock) {
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
	var {items, shape} = info,
		elem = document.createElement("div"),
		currentPiece;
		
	elem.classList.add("block");
	
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
	
	items.forEach(item => {
		if (item.type === "c") {
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
				currentPiece.appendChild(itemElem);
			}
		}
	});
	
	function newPiece() {
		currentPiece = document.createElement("div");
		currentPiece.classList.add("blockPiece");
		elem.appendChild(currentPiece);
	}
	
	elem.addEventListener("mousedown", e => {
		var dragElem;
		if (inPalette) {
			dragElem = makeBlock(info);
			draggingBlockParent = document.body;
		} else {
			dragElem = elem;
			draggingBlockParent = elem.parentElement;
		}
		draggingBlock = dragElem;
		draggingBlockX = -e.offsetX;
		draggingBlockY = -e.offsetY;
		dragElem.classList.add("dragged");
		draggingBlockParent.appendChild(dragElem); // to get it to the front
	});
	
	return elem;
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