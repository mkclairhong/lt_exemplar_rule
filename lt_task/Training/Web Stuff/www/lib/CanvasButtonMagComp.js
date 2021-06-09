define([
		"Class",
		"pwbscript/Rectangle",
		"pwbscript/CanvasButton"
	], function(
		Class,
		Rectangle,
		CanvasButton
	) {
	var CanvasButtonMagComp = CanvasButton.extend({
		fontSize: 30,	// Font size in pixels
		
		// Colors to use when the button is enabled
		bgColorEnabled: "#ccccff",
		borderColorEnabled: "#333333",
		fontColorEnabled: "#333333",
		
		// Colors to use when the button is active (for example when the button is being clicked)
		bgColorActive: "gray",
		borderColorActive: "#aaaaaa",
		fontColorActive: "#333333",
	});
	return CanvasButtonMagComp;
});
