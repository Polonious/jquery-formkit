/*
 * Formkit jQuery plugin
 * serialize/deserialize form
 *
 * @website https://github.com/tedliang/jquery-formkit/
 * @author: Ted Liang <tedliang[dot]email[at]gmail[dot]com>
 * @version 1.0
 *
 * Licensed under the MIT License
 */
(function($){

	var formkit = {
		format: 'object',
		extractForm: 'extractForm',
		fillForm: 'fillForm',
		copyForm: 'copyForm',
		resetForm: 'resetForm',
		extractField: 'extractField',
		fillField: 'fillField',
	}, configNv, configVal;
	
	$.each($('script[data-jquery-formkit-config]').filter(':first').attr(
			'data-jquery-formkit-config').split(';'), function(){
		configNv = this.split(':');
		configVal = $.trim(configNv[1]);
		if(configVal) formkit[$.trim(configNv[0])] = configVal;
	});

	$.fn[formkit.extractForm] = function ( options ) {
		if(typeof options == 'string') options = { format: options };
		else if($.isFunction(options)) options = { buildObject: options };

		var settings = $.extend({}, defaultFn, formkit, (options || {}));
		switch (settings.format.toLowerCase()) {
			case 'array':
				return form.toArray(form.enabledElements(this), settings.buildArray);
			case 'query':
				return $.param(form.toObject(form.enabledElements(this), settings.buildObject));
			default:
				return form.toObject(form.enabledElements(this), settings.buildObject);
		}
	};

	$.fn[formkit.fillForm] = function( data ) {
		if ( typeof data == 'string' ) {
			var param, data = arrayToObject($.map(data.split( "&" ), function(val){
				param = val.split( "=" );
				return { name: decodeURIComponent( param[0] ),
						value: decodeURIComponent( param[1].replace( rPlus, "%20" )) };
			}));
		}
		else if ( $.isArray( data ) ) {
			data = arrayToObject(data);
		}
		return form.fromObject(form.elements(this), data);
	};

	$.fn[formkit.copyForm] = function( target ) {
		return ((!target || typeof target == 'string') ? $(target) :
					target)[formkit.fillForm](this[formkit.extractForm]());
	};

	$.fn[formkit.resetForm] = function() {
		this.each(function() { this.reset(); });
		return this;
	};

	$.fn[formkit.extractField] = function( name ) {
		if(name){
			return form.toObject(form.enabledElements(this, name), defaultFn.buildObject)[name];
		}
		else{
			var ret = this[formkit.extractForm](), count = 0, attr;
			for (k in ret) if (ret.hasOwnProperty(k)) {attr=k, count++;}
			switch (count) {
				case 0: return undefined;
				case 1: return ret[attr];
				default: return ret;
			}
		}
	};

	$.fn[formkit.fillField] = function( name, value ) {
		if (value==undefined) {
			if (this.length==0) return $();
			value = name;
			name = this[0].name;
		}
		var obj = {};
		obj[name]=value;
		return form.fromObject(form.elements(this, name), obj);
	};

	var	defaultFn = {
		buildObject: function(/*String*/value, /*Object*/obj){
			var name = this.name, val = obj[name];
			if(typeof value == "number") value = value.toString();
			if(typeof val == "string"){
				obj[name] = [val, value];
			}else if($.isArray(val)){
				val.push(value);
			}else{
				obj[name] = value;
			}
		},
		buildArray: function(/*String*/value){
			return {name: this.name, value: value};
		},
	};

	var arrayToObject = function(array){
		var ret = {};
		$.each(array, function(){
			defaultFn.buildObject.call(this, this.value, ret);
		});
		return ret;
	};

	var rcheck = /^(radio|checkbox)$/i, rCRLF = /\r?\n/g, rPlus = /\+/g,
		exclude = "file|submit|image|reset|button";

	var form = {
		toObject: function formToObject(elems, buildObject){
			var ret = {};
			elems.each(function(){
				var value = field.toObject(this);
				if(value !== null){
					buildObject.call(this, value, ret);
				}
			});
			return ret; // Object
		},

		fromObject: function formFromObject(elems, ret){
			return elems.filter(function(){
				return field.fromObject(this, ret[this.name]);
			});
		},

		toArray: function formToArray(elems, buildArray){
			return elems.map(function( i, elem ){
				var val = field.toObject(elem);
				return val == null ?
						null :
						$.isArray( val ) ?
							$.map( val, function( val, i ){
								return buildArray.call( elem, val.replace( rCRLF, "\r\n" ) );
							}) :
							buildArray.call( elem, val.replace( rCRLF, "\r\n" ) )
			}).get();
		},

		elements: function(nodes, name){
			if(nodes.length==0) return $();
			if(nodes[0].elements){
				nodes = $(nodes[0].elements).filter(':input');
			}
			else{
				nodes = nodes.map(function(){
					var $this = $(this);
					if($this.is(':input')) return this;
					else return $this.find(':input').get();
				});
			}
			return nodes.filter(function(){
				if(!this.name) return false;
				if(name && this.name!=name) return false;
				var type = (this.type || "").toLowerCase();
				return type && exclude.indexOf(type) < 0;
			});
		},

		enabledElements: function(nodes, name){
			return form.elements(nodes, name).filter(function(){
				return !this.disabled;
			});
		},

	};

	var field = {
		toObject: function fieldToObject(/*DOMNode*/ inputNode){
			var ret = null;
			if(rcheck.test( inputNode.type )){
				if(inputNode.checked){
					ret = inputNode.value;
				}
			}else{
				ret = $(inputNode).val();
			}
			return ret; // Object
		},

		fromObject: function fieldToObject(/*DOMNode*/ inputNode, value){
			if(value == undefined || value === null) return;

			var $node = $(inputNode);
			if(rcheck.test(inputNode.type)){
				var prop = (inputNode.value == value ||
							($.isArray(value) && 
							($.inArray(inputNode.value, value)!=-1 ||
							$.inArray(parseFloat(inputNode.value), value)!=-1)));
				if($node.prop('checked')!=prop){
					$node.prop('checked', prop);
					return true;
				}
			}else{
				if($node.val()!=value){
					$node.val(value);
					return true;
				}
			}
		},

	};

})(jQuery);