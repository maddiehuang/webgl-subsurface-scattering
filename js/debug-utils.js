function throwOnGLError(err, funcName, args) {
    console.error(WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName);
};


function validateNoneOfTheArgsAreUndefined(functionName, args) {
	for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] === undefined) {
			console.error("undefined passed to gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
		}
	}
}
