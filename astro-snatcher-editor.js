

var column1 = document.getElementById("column1"),
	scriptPanel = document.getElementById("scriptPanel");

var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

var tabs = document.querySelectorAll(".tab"),
	tabPanels = document.querySelectorAll(".tabPanel");

var currentTab = 0,
	draggingBlock = false,
	draggingBlockX,
	draggingBlockY;



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



scriptPanel.appendChild(makeBlock([
	{type: "label", value: "testy"},
	{type: "text"},
	{type: "label", value: "stuff"},
	{type: "number"},
	{type: "c"}
]));

scriptPanel.appendChild(makeBlock([
	{type: "label", value: "when the level starts"}
], {hat: true}));


document.addEventListener("mousemove", e => {
	if (draggingBlock) {
		let {left, top} = scriptPanel.getBoundingClientRect();
		draggingBlock.style.left = (e.pageX - left + draggingBlockX) + "px";
		draggingBlock.style.top = (e.pageY - top + draggingBlockY) + "px";
	}
});
	
document.addEventListener("mouseup", () => {
	if (draggingBlock) {
		draggingBlock.classList.remove("dragged");
		draggingBlock = false;
	}
});


function makeBlock(items, info = {}) {
	var elem = document.createElement("div"),
		currentPiece;
		
	elem.classList.add("block");
	
	if (info.hat) {
		let hatElem = document.createElement("div"),
			hatBorder = document.createElement("div"),
			hatInner = document.createElement("div");
		hatElem.classList.add("blockHat");
		hatBorder.classList.add("blockHatBorder");
		hatInner.classList.add("blockHatInner");
		hatElem.appendChild(hatBorder);
		hatElem.appendChild(hatInner);
		elem.appendChild(hatElem);
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
		draggingBlock = elem;
		draggingBlockX = -e.offsetX;
		draggingBlockY = -e.offsetY;
		elem.classList.add("dragged");
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