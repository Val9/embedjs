dojo.jsonp.attach = function(params){
	//	summary:
	//		creates a new <script> tag pointing to the specified URL and
	//		adds it to the document.
	//	description:
	//		Attaches the script element to the DOM.  Use this method if you
	//		just want to attach a script to the DOM and do not care when or
	//		if it loads.
	var doc = document;
	var element = doc.createElement("script");
	element.type = "text/javascript";
	element.src = params.url;
	//element.id = id;
	element.charset = "utf-8";
	return doc.getElementsByTagName("head")[0].appendChild(element);
};

/*=====
dojo.declare("dojo.jsonp.__ioArgs", null, {
	constructor: function(){
		//	summary:
		//		The following properties are allowed for dojo.jsonp.get.
		//	jsonp: String
		//		The URL parameter name that indicates the JSONP callback string.
		//		For instance, when using Yahoo JSONP calls it is normally, 
		//		jsonp: "callback". For AOL JSONP calls it is normally 
		//		jsonp: "c".
		//	content: Object
		//		Contains properties with string values. These properties will be 
		//		serialized as name1=value2 and passed in the request.
		//	error: Function
		//		Called on timoeut or if an Exception is thrown in load function.
		//	load: Function
		//		Called when requested data is recieved.
		//	handle: Function
		//		Called always, independent of errors or timeouts.
		//	timeout: Integer
		//		Milliseconds to wait for the response. If this time passes, then 
		//		the error callbacks are called.
		//	url: String
		//		URL to server endpoint.
		this.jsonp = jsonp;
		this.content = content;
		this.error = error;
		this.load = load;
		this.handle = handle;
		this.timeout = timeout;
		this.url = url;
	}
});
=====*/

dojo.jsonp._id = 0;
dojo.jsonp._timeouts = {};
dojo.jsonp.get = function(/* dojo.jsonp.__ioArgs */ args){
	//	summary:
	//		sends a get request using a dynamically created script tag.
	if(!args.url){
		throw new Error("dojo.jsonp.get: No URL specified.");
	}
	if(!args.jsonp){
		throw new Error("dojo.jsonp.get: No callback param specified.");
	}
	
	dojo.jsonp._id++;
	var funcName = "jsonp_callback_" + dojo.jsonp._id;

	// timeout
	var timeout = args.timeout || 3000;
	dojo.jsonp._timeouts[dojo.jsonp._id] = setTimeout(function(){
		dojo.jsonp[funcName] = function(){};
		clearTimeout(dojo.jsonp._timeouts[dojo.jsonp._id]);
		if(args.error){
			args.error(null,{});
		}
		if(args.handle){
			args.handle(null,{});
		}
	},timeout);
	
	
	// create/append callback
	args.url += '?' + args.jsonp + '=dojo.jsonp.' + funcName;
	
	dojo.jsonp[funcName] = function(data){
		clearTimeout(dojo.jsonp._timeouts[dojo.jsonp._id]);
		try{ // TODO: Do we really want to do this, or do we want to get rid of expensive try/catch blocks?
			if(args.load){
				args.load(data,{});
			}
		}catch(e){
			if(args.error){
				args.error(null,{});
			}
		}
		if(args.handle){
			args.handle(data,{});
		}
	};
	
	if(args.content){
		args.url += '&' + dojo.objectToQuery(args.content);
	}
	
	// create script element
	var doc = dojo.doc;
	var element = doc.createElement("script");
	element.type = "text/javascript";
	element.src = args.url;
	element.charset = "utf-8";
	return doc.getElementsByTagName("head")[0].appendChild(element);
};