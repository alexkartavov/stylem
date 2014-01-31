$(function () {

	var idLength = 20;
	var ignorCssFiles = ["styleselector.css"];

	var ignoreThisCss = function (href) {
		if (!href)
			return false;
		for(var i = 0; i< ignorCssFiles.length;i++){
			if (href.substring(href.length - ignorCssFiles[i].length) == ignorCssFiles[i])
				return true;
		}
		return false;
	};

	$("<div class=\"stylesDiv\"></div>").appendTo($("body"));

	var styleDiv = $(".stylesDiv");
	var styleSheetDivs = [];

	for (var ss = 0; ss < document.styleSheets.length; ss++) {
		if (!document.styleSheets[ss].cssRules || !document.styleSheets[ss].cssRules.length)
			continue;
		if (ignoreThisCss(document.styleSheets[ss].href))
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
		ssDiv.item = $("<div class=\"styleSheetDiv\" title=\"" + ssId + "\">" + ssId + "</div>").appendTo(styleDiv);

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
			cssRule.item = $("<div class=\"cssRuleDiv\" title=\"" + cssRule.selector + "\">" + cssRule.selector + "</div>").appendTo(ssDiv.item);
			cssRule.checker = window.setInterval(function () {
				var elems = $(cssRule.selector);
				if (cssRule.applied) {
					if (elems.length == 0) {
						cssRule.applied = false;
						cssRule.item.removeClass("cssRuleApplied");
					}
				} else {
					if (elems.length > 0) {
						cssRule.applied = true;
						cssRule.item.addClass("cssRuleApplied");
					}
				}
			}, 500);
		}

		styleSheetDivs.push(ssDiv);
		//if (document.styleSheets[ss].href && document.styleSheets[ss].href.endsWith(styleSheetNames[i])) {
		//	return document.styleSheets[ss];
	}
});
