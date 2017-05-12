

var column1 = document.getElementById("column1");

var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d");

var tabs = document.querySelectorAll(".tab"),
	tabPanels = document.querySelectorAll(".tabPanel");

var currentTab = 0;



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