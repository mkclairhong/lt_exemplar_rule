require.config({
    paths: {
        pwbscript: "pwbscript",
		Class: "ClassRequireWrapper",
		js: "../js"
    }
});

/**
	PWB: Some code I added to support executing js AFTER require.config has executed.
	Outside of this file, subsequent calls to require are not guaranteed to be
	executed after the configuration has been completed, which is absolutely insane..
	However, we can guarantee it has been loaded before the js in the "post-config"
	attribute has been executed.
**/
(function() {
	var requireNodes = document.querySelectorAll("[post-config]");
	if (requireNodes.length) {
		var value = requireNodes[0].getAttribute("post-config");
		eval(value);
	}
}).call(this);
