/*
 * Formish jQuery plugin
 * serialize/deserialize form
 * 
 * @website https://github.com/tedliang/formish/
 * @author: Ted Liang <tedliang[dot]email[at]gmail[dot]com>
 * @version 1.0
 *
 * Licensed under the MIT License
 */
(function($){
	
	$.fn.extend({

		formToObject: function( func ) {
			return form.toObject(form.enabledElements(this), func);
		},

		formFromObject: function( obj ) {
			return form.fromObject(form.elements(this), obj);
		},

		formToArray: function( func ) {
			return form.toArray(form.enabledElements(this), func);
		},

		formFromArray: function( array ) {
			return this.formFromObject(form.arrayToObject(array));
		},

		formCopyTo: function( target ) {
			return ((!target || typeof target == 'string') ? $(target) : 
						target).formFromObject(this.formToObject());
		},

		formCopyFrom: function( src ) {
			return this.formFromObject(((!src || typeof src == 'string') ? 
							$(src) : src).formToObject());
		},

		fieldToObject: function( name ) {
			if(name){
				return form.toObject(form.enabledElements(this, name))[name];
			} 
			else{
				var ret = this.formToObject(), count = 0, attr;
				for (k in ret) if (ret.hasOwnProperty(k)) {attr=k, count++;}
				switch (count) {
					case 0: return undefined;
					case 1: return ret[attr];
					default: return ret;
				}
			}
		},

		fieldFromObject: function( name, value ) {
			if (value==undefined) {
				if (this.length==0) return $();
				value = name;
				name = this[0].name;
			} 
			var obj = {};
			obj[name]=value;
			return form.fromObject(form.elements(this, name), obj);
		},

	});	
	
	var rcheck = /^(radio|checkbox)$/i, rCRLF = /\r?\n/g, 
		exclude = "file|submit|image|reset|button";
	
	var form = {
		toObject: function formToObject(elems, buildObject){
			var buildObject = $.isFunction( buildObject ) ? buildObject : form.buildObject, 
				ret = {};
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
			var buildArray = $.isFunction( buildArray ) ? buildArray : form.buildArray;
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
		
		buildObject: function(/*String*/value, /*Object*/obj){
	        var name = this.name, val = obj[name];
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
	    
	    arrayToObject: function(array){
	    	var ret = {};
	    	$.each(array, function(){
	    		form.buildObject.call(this, this.value,ret);
	    	});
	    	return ret;
	    }

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
						($.isArray(value) && $.inArray(inputNode.value, value)!=-1));
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