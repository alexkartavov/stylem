$(function () {

	var idLength = 20;

	$("<div class=\"igStyleDiv\"></div>").appendTo($("body"));

	var styleDiv = $(".igStyleDiv");
	var styleSheetDivs = [];

	for (var ss = 0; ss < document.styleSheets.length; ss++) {
		if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
			continue;

		var ssDiv = {
			id: "",
			styleSheet: document.styleSheets[ss],
			cssRules: []
		};
		var ssId = ssDiv.styleSheet.id;
		if (!ssId) {
			ssId = ssDiv.styleSheet.href;
			if (ssId) {
				ssId = (ssId.length > idLength ? "..." : "") + ssId.substring(ssId.length - idLength);
			} else {
				ssId = "styleSheet " + ss;
			}
		}
		ssDiv.id = ssId;
		ssDiv.item = $("<div class=\"igStyleSheet\" title=\"" + ssId + "\">" + ssId + "</div>").appendTo(styleDiv);

		for (var cr = 0; cr < ssDiv.styleSheet.cssRules.length; cr++) {
			var cssRule = {
				selector: "",
				cssText: "",
				cssRule: ssDiv.styleSheet.cssRules[cr]
			};
			cssRule.selector = cssRule.cssRule.selectorText;
			cssRule.cssText = cssRule.cssRule.cssText;
			var openBr = cssRule.cssText.indexOf("{");
			var closeBr = cssRule.cssText.indexOf("}");
			cssRule.cssText = cssRule.cssText.substring(openBr + 1, closeBr);
			cssRule.item = $("<div class=\"igCssRule\" title=\"" + cssRule.selector + "\">" + cssRule.selector + "</div>").appendTo(ssDiv.item);
		}

		styleSheetDivs.push(ssDiv);
		//if (document.styleSheets[ss].href && document.styleSheets[ss].href.endsWith(styleSheetNames[i])) {
		//	return document.styleSheets[ss];
	}
});