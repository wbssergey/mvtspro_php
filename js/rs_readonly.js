/***********************
 MFISoft WEBENGINE 1.5.2
************************/

//**********************************************************************************************
// Browser define
// http://www.thespanner.co.uk/2009/01/29/detecting-browsers-javascript-hacks/
//

var IS_FF2			= (function x(){})[-6]=='x';
var IS_FF3			= (function x(){})[-5]=='x';
var IS_MSIE			= '\v'=='v';
var IS_MOZILLA		= (navigator.userAgent.match('Mozilla') && !IS_MSIE) ? true : false;
var IS_OPERA		= /^function \(/.test([].sort);
var IS_KONQUEROR 	= navigator.userAgent.match('Konqueror') ? true : false;
var IS_CHROME		= /source/.test((/a/.toString+''));
var IS_SAFARI		= /a/.__proto__=='//';
var readonly4wbs = true;

function rqfcreate(x,element,t)
{
//if (t == "t"){
// var rqfinput = document.createElement('textarea');
  // rqfinput.rows = 10;
    //           rqfinput.wrap = 'off';
//}//
//else
//{
   var rqfinput = document.createElement("input");
  // };

   rqfinput.type='hidden';
   rqfinput.name='rqf'+t+x;
   rqfinput.id='rqf'+t+x;
   element.name=x;
   document.forms[0].appendChild(rqfinput);
}


//**********************************************************************************************
// Standard prototypes extensions
//

Function.prototype.bind = function(object, args)
{
	var method = this;
	return function()
	{
		return method.apply(object, args || arguments);
	}
}

Function.prototype.createCaller = function()
{
	var method = this;
	var args = arguments;
	return function()
	{
		method.apply(null, args);
	}
}

Function.prototype.getBody = function()
{
	var m = this.toString().match(/\{([\s\S]*)\}/m)[1];
	return m.replace(/^\s*\/\/.*$/mg,'');
};

String.prototype.repeat = function(length)
{
	length = length || 1;
	length = (length <= 0 ? 1 : length);
	var s = this.toString();
	var result = ''; 
	for(var i = 0; i < length; i++)
	{
		result += s;
	}
	return result;
}

String.prototype.padLeft = function(length, padding)
{
	var s = this.toString();
	while (s.length < length)
	{
		s = padding + s;
	}
	return s;
}

String.prototype.ltrim = function()
{
	return this.replace(/^[ \t\r\n]+/, "");
}

String.prototype.rtrim = function()
{
	return this.replace(/[ \t\r\n]+$/, "");
}

String.prototype.trim = function()
{
	return this.rtrim().ltrim();
}

String.prototype.dashReplace = function()
{
	var hypen = new RegExp(String.fromCharCode(45), 'g');
	return this.replace(hypen, String.fromCharCode(8209));
}

String.prototype.replaceAll = function(search, replace)
{
	return this.replace(new RegExp(search.replace(/([\\\-\{\}\(\)\|\[\]\?\*\+\^\$])/g, '\\$1'), 'g'), replace);
}


//**********************************************************************************************
// Namespaces
//

// Classes
var rs;
if (!rs)
{
	rs = {};
}

// Environment
var env = {};


//**********************************************************************************************
// AJAX
//
rs.ajax_loading_img_src = 'img/loading.gif';
rs.ajax_loading2_img_src = 'img/loading2.gif';
rs.ajax_loading_img = document.createElement('img');
rs.ajax_loading_img.src = rs.ajax_loading_img_src;
rs.ajax_loading = null;
rs.ajax = {
	loading: function(loading, waitingChecker, lockRequest)
	{
		if(loading)
		{
			if(rs.ajax_loading == null)
			{
				rs.ajax_loading = new rs.popup();
				rs.ajax_loading.options.modal = true;
				rs.ajax_loading.setZIndex(env.pm.getNextZIndex());
				var div = document.createElement('div');
				var table = document.createElement('table');
				table.style.marginRight = 5 + 'px';
				var tr = table.insertRow(0);
				var td = tr.insertCell(tr.cells.length);
				td.appendChild(rs.ajax_loading_img);
				var td = tr.insertCell(tr.cells.length);
				td.appendChild(document.createTextNode(rs.s('common.loading', 'Loading...')));
				div.appendChild(table);
				rs.ajax_loading.addContent(div);
				rs.ajax_loading.showInWindowCenter();
				if(waitingChecker)
				{
					var callback = function()
					{
						if(waitingChecker() && rs.ajax_loading)
						{
							var button = document.createElement('input');
							button.type = 'button';
							button.value = 'Cancel';
							button.onclick = function()
							{
								lockRequest();
								rs.ajax.loading(false);
							}
							var cancel = document.createElement('div');
							cancel.appendChild(button);
							cancel.className = 'center';
							div.appendChild(cancel);
							
							rs.ajax_loading.autoSize();
						}
					}
					setTimeout(callback, 10000);
				}
			}
		}
		else
		{
			if(rs.ajax_loading)
			{
				rs.ajax_loading.hide();
				rs.ajax_loading = null;
			}
		}
	},
	GUIQuery: function(object, actions, target, data, callback)
	{
		rs.ajax.query(
			'AJAXBackend.php',
			{
				object: object,
				actions: actions,
				target: target,
				data: data,
				args: rs.args,
				windowId: window.window_id
			},
			callback || function(){}
		);
	},
	query: function(backend, params, callback)
	{
		var request = new Request.JSON({
			url: backend,
			method: 'post',
			data: params,
			onSuccess: callback,
			isSuccess: function()
			{
				return true;
			}
		});
		request.send();
	}
};

rs.timer = newClass
(
	null,
	{
		constructor: function()
		{
			this.timeout = 1000;
			this.state = 'stop';	// 'stop', 'freeze', 'run'
			this.runState = 'waiting_for_execute', 'waiting_for_next';
			this.skip = {};
			this.callback = null;
			this.counter = 0;
		},
		start: function()
		{
			if(this.state == 'stop' || this.state == 'freeze')
			{
				this.state = 'run';
				this.runState = 'waiting_for_next';
				this.next();
			}
		},
		next: function()
		{
			if(
				this.state == 'run'
				&& this.runState == 'waiting_for_next'
			)
			{
				this.runState = 'waiting_for_execute';
				setTimeout(this.getCallBack(), this.timeout);
			}
		},
		stop: function()
		{
			this.state = 'stop';
		},
		freeze: function(v)
		{
			if(v)
			{
				this.state = 'freeze';
			}
			else
			{
				if(
					this.state == 'freeze'
					&& this.runState == 'waiting_for_execute'
				)
				{
					this.skip[this.counter - 1] = true;
				}
				this.start();
			}
		},
		getCallBack: function()
		{
			var counter = this.counter++;
			var timer = this;
			return function()
			{
				if(timer.skip[counter])
				{
					delete timer.skip[counter];
				}
				else
				{
					if(
						timer.state == 'run'
						&& timer.runState == 'waiting_for_execute'
					)
					{
						timer.callback.apply()
						timer.next();
					}
					timer.runState = 'waiting_for_next';
				}
			}
		}
	}
);

//----------------------------------------------------------------------------------------------
// Strings
//

rs.s = function(key, default_str, vars, eval_functions)
{
	var str = rs.strings[key];
	if (str == null)
	{
		str = default_str;
	}

	if (vars instanceof Array)
	{
		for (var i=0; i<vars.length; i++)
		{
			var value = vars[i];
			if (value instanceof Array)
			{
				str = str.replace(new RegExp('\\{' + i + ':count\\}', 'g'),  value.length);
				value = value.join(', ');
			}

			str = str.replace(new RegExp('\\{' + i + '\\}', 'g'), value);
		}
	}

	if (eval_functions == null || eval_functions)
	{
		var r = /\{([^:\}]+)(:[^\}]+)?\}/;
		var m;

		while (m = r.exec(str))
		{
			var dst_text = '';
			var src_text = m[0];
			var func = m[1];
			var args = m[2] != null ? m[2].substr(1).split('|') : [];

			switch (func)
			{
				case 'ifeq':
				{
					dst_text = args[0] == args[1] ? args[2] : args[3];
					break;
				}
				case 'plural':
				{
					var lang = args.shift();
					var count = parseInt(args.shift(), 10);
					dst_text = rs.utils.convert_plural(lang, count, args);
					break;
				}
			}

			str = str.replaceAll(src_text, dst_text);
		}
	}

	return str;
}

//**********************************************************************************************
// http://dklab.ru/chicken/nablas/40.html
//

function newClass(parent, prop)
{
	// Dynamically create class constructor.
	var clazz = function()
	{
		// Stupid JS need exactly one "operator new" calling for parent
		// constructor just after class definition.
		if (clazz.preparing)
		{
			return delete(clazz.preparing);
		}
		// Call custom constructor.
		if (clazz.constr)
		{
			this.constructor =  clazz; // we need it!
			clazz.constr.apply(this, arguments);
		}
		return null;
	}
	clazz.prototype = {}; // no prototype by default
	if (parent)
	{
		parent.preparing = true;
		clazz.prototype = new parent;
		clazz.prototype.constructor = parent;
		clazz.constr = parent; // BY DEFAULT - parent constructor
	}
	if (prop)
	{
		var cname = "constructor";
		for (var k in prop)
		{
			if (k != cname)
			{
				clazz.prototype[k] = prop[k];
			}
		}
		if (prop[cname] && prop[cname] != Object)
		{
      			clazz.constr = prop[cname];
		}
		clazz.prototype.toString = prop.toString;
	}
	return clazz;
}

//**********************************************************************************************
// rs.event and locks
//

rs.lockAllRefresh = false;
rs.lockAllEvents = false;
rs.event = function()
{
	this.delegates = [];
	this.add = function(f)
	{
		this.delegates.push(f);
	}
	this.execute = function()
	{
		if(rs.lockAllEvents)return;
		for (var i=0; i<this.delegates.length; i++)
		{
			this.delegates[i].apply(null, arguments);
		}
	}
};

//**********************************************************************************************
// Window events
//

var wle = new rs.event();
window.onload = function(){
	wle.execute();
}

//**********************************************************************************************
// rs.instance
//

rs.instance = newClass
(
	null,
	{
		constructor: function()
		{
			this.dom = {};
			this.domInstances = {};
			this.initFunction = null;
			this.initFunctionStr = null;
			this.settedInstance = null;
			this.instanceCounter = 0;
			this.newInstance('default');
		},
		instanceExist: function(name)
		{
			return this.domInstances[name] ? true : false;
		},
		resetInstance: function()
		{
			if(this.initFunctionStr)
			{
				if(!this.initFunction)
				{
					this.initFunction = new Function(this.initFunctionStr);
				}
				this.initFunction();
			}
		},
		newInstance: function(name)
		{
			if(name === null)
			{
				name = 0;
				for(var i in this.domInstances)
				{
					if(i != 'default')
					{
						name++;
					}
				}
			}
			this.domInstances[name] = {};
			this.instanceCounter++;
			this.setInstance(name);
			this.resetInstance();
		},
		addInit: function(init)
		{
			init.apply(this);
			this.initFunctionStr += init.getBody();
		},
		execWithInstance: function(callback, args, instance_name)
		{
			if(this.domInstances[instance_name])
			{
				this.setInstance(instance_name);
			}
			else
			{
				this.newInstance(instance_name);
			}
			return callback.apply(this, args);
		},
		getExecWithInstanceHandler: function(f, args, instance_name)
		{
			var targetInstance = instance_name || this.settedInstance;
			var self = this;
			return function()
			{
				var currentInstance = self.settedInstance;
				var result = self.execWithInstance(f, args || arguments, targetInstance);
				self.setInstance(currentInstance);
				return result;
			}
		},
		setInstance: function(name)
		{
			if(this.domInstances[name] && this.settedInstance != name)
			{
				delete this.dom;
				this.dom = this.domInstances[name];
				this.settedInstance = name;
			}
		},
		deleteInstance: function(name)
		{
			if(this.domInstances[name])
			{
				delete domInstances[name];
				this.instanceCounter--;
			}
		}
	}
);

//**********************************************************************************************
// rs.element
//

rs.element = newClass
(
	rs.instance,
	{
		constructor: function()
		{
			rs.instance.call(this);
			this.addInit(
				function()
				{
					this.dom.events = {};
					this.dom.place = document.createElement('span');
					this.dom.locks = {};
					this.dom.locks.showLocks = {};
				}
			);
			this.baseStyle = "";
			this.rights = {};
		},
		addEventListener: function(e, f)
		{
			if(!this.dom.events[e])
			{
				this.dom.events[e] = new rs.event();
			}
			this.dom.events[e].add(f);
		},
		handleEvent: function(e, args)
		{
			if(this.dom.events[e])
			{
				this.dom.events[e].execute.apply(this.dom.events[e], args || []);
			}
		},
		lockEvents: function(lock)
		{
			/*
			 * For optimization test
			 * 
			 * for(var i in this.dom.events)
			{
				this.dom.events[i].lock = lock;
			}
			this.dom.locks.events = lock;*/
			rs.lockAllEvents = lock;
		},
		setRights: function(rights)
		{
			this.rights['view'] = rights & 1;
		if (!readonly4wbs) {
			this.rights['update'] = rights & 2;
			this.rights['insert'] = rights & 4;
			this.rights['delete'] = rights & 8;
		};
			this.rights['view'] = rights & 1;
			
		},
		showElement: function(resource)
		{
			resource = resource || 'default';
			if(this.dom.locks.showLocks[resource])
			{
				delete this.dom.locks.showLocks[resource];
				this.handleEvent('onShowResource', [this, resource]);
			}

			for(var i in this.dom.locks.showLocks)
				{
					if(this.dom.locks.showLocks[i] instanceof Function)
					{
						if(this.dom.locks.showLocks[i]())
						{
							delete this.dom.locks.showLocks[i];
							this.handleEvent('onShowResource', [this, i]);
						}
					}
				}
			
			if(rs.utils.object_isEmpty(this.dom.locks.showLocks))
			{
				this.deleteStyleClass('hidden');
				this.handleEvent('onShow', [this]);
			}
		},
		hideElement: function(resource, holder)
		{
			if(this.dom.locks.showLocks[resource])
			{
				return;
			}
			this.dom.locks.showLocks[resource || 'default'] = holder || true;
			this.handleEvent('onHideResource', [this, resource]);
			this.addStyleClass('hidden');
			this.handleEvent('onHide', [this]);
		},
		checkDisplay: function(resource)
		{
			return this.dom.locks.showLocks[resource]?false:true;
		},
		setDisplay: function(param, resource, holder)
		{
			resource = resource || 'default';
			if(param)
			{
				this.showElement(resource, holder);
			}
			else
			{
				this.hideElement(resource, holder);
			}
		},
		changeDisplay: function(resource)
		{
			resource = resource || 'default';
			if(this.dom.locks.showLocks[resource])
			{
				this.showElement(resource);
			}
			else
			{
				this.hideElement(resource);
			}
		},
		addStyleClass: function(addClass)
		{
			if(this.dom.place.className.indexOf(addClass) == -1)
			{
				dom.addClass(this.dom.place, addClass);
			}
		},
		deleteStyleClass: function(removeClass)
		{
			if(this.dom.place.className.indexOf(removeClass) != -1)
			{
				dom.deleteClass(this.dom.place, removeClass);
			}
		}
	}
);

//**********************************************************************************************
// rs.validator
//

rs.validator = newClass
(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this),
			
			this.value = null;
			this.new_value = null;
			
			this.dom = null;
			
			// Verify
			this.verificationPassed = true;
			this.verificationFailureReason = "";

			this.verifyRegExp = "";
			this.transformRegExp = "";
			this.verifyMinVal = "";
			this.verifyMaxVal = "";
			this.verifyMinValExclude = "";
			this.verifyMaxValExclude = "";
			this.verifyDataDelimiter = "";
			this.verifyDesc = "";
			this.verifyMinLength = "";
			this.verifyMaxLength = "";
			this.verifyMaxListLength = "";
		},
		check: function(value, dom)
		{
			this.value = value;
			this.dom = dom || null;
			
			this.new_value = null;
			
			this.verificationPassed = true;
			this.verificationFailureReason = this.verifyDesc;
			
			if (!rs.utils.isEmpty(this.dom))
			{
				// check not null
				if (!this.dom.notNull && value == '')
				{
					return this.verificationPassed;
				}
		
				if (this.dom.notNull && value == '')
				{
					this.verificationPassed = false;
					this.verificationFailureReason = rs.s('table.errors.non_empty', 'Field should be non-empty');
					return this.verificationPassed;
				}
			}

			if (!rs.utils.isEmpty(this.verifyMinLength) && value.length < this.verifyMinLength)
			{
				this.verificationPassed = false;
				this.verificationFailureReason = rs.s('table.errors.min_len', 'Value length should be more than {0}', [this.verifyMinLength]);
				return this.verificationPassed;
			}
			
			if (!rs.utils.isEmpty(this.verifyMaxLength) && value.length > this.verifyMaxLength)
			{
				this.verificationPassed = false;
				this.verificationFailureReason = rs.s('table.errors.max_len', 'Value length should be less than {0}', [this.verifyMaxLength]);
				return this.verificationPassed;
			}

			var a_values = new Array();
			var delimiter_arr = new Array();
			var delimiter = '';
			var new_value = '';

			if (rs.utils.isEmpty(this.verifyDataDelimiter))
			{
				a_values[0] = value;
			}
			else
			{
				if (this.verifyDataDelimiter.length > 1)
				{
					var pos = -1;
					var value_split = value;
					a_values = value.split(new RegExp(this.verifyDataDelimiter));
					
					if (this.verifyMaxListLength && a_values.length > this.verifyMaxListLength)
					{
						this.verificationPassed = false;
						this.verificationFailureReason = rs.s('table.errors.max_list_len', 'The number of elements in the list should not exceed {0}', [this.verifyMaxListLength]);
						return this.verificationPassed;
					}

					for (var j = 0, i = 0; i < a_values.length; i++)
					{
						if ((i == a_values.length - 1) && (a_values[i] == ""))
						{
							delimiter_arr[j] = value_split;
						}
						else
						{
							pos = value_split.indexOf(a_values[i]);
							if (pos != 0)
							{
								delimiter_arr[j] = value_split.substr(0, pos);
								j++;
							}
							value_split = value_split.substr(pos + a_values[i].length);
						}
					}
				}
				else
				{
					delimiter = this.verifyDataDelimiter;
					a_values = value.split(delimiter);
					for (i = 0; i < a_values.length; i++)
					{
						delimiter_arr[i] = delimiter;
					}
				}
			}

			if (!rs.utils.isEmpty(this.verifyRegExp))
			{
				var reg_exp = new RegExp(this.verifyRegExp);
			}
			if (!rs.utils.isEmpty(this.verifyMinVal))
			{
				var min_val = parseInt(this.verifyMinVal,10);
			}
			if (!rs.utils.isEmpty(this.verifyMaxVal))
			{
				var max_val = parseInt(this.verifyMaxVal,10);
			}

			for (var i = 0; i < a_values.length; i++)
			{
				var one_value = a_values[i];

				if (this.transformRegExp != "")
				{
					var transform_from = "";
					var transform_to = "";
					var transform_arr = this.transformRegExp.split("/");
					if(transform_arr[0] != "")
					{
						transform_from = transform_arr[0];
					}
					if(transform_arr[1] != "")
					{
						transform_to = transform_arr[1];
					}

					if(transform_from !="" && transform_to != "")
					{
						var transform_reg_exp = new RegExp (transform_from);
						one_value = one_value.replace(transform_reg_exp, transform_to);
					}
				}

				if(new_value != '')
				{
					new_value += delimiter_arr[i-1];
				}
				new_value += one_value;

				if (one_value == "") continue;

				if (this.verifyRegExp != "")
				{
					if (!reg_exp.test(one_value))
					{
						this.verificationPassed = false;
						return this.verificationPassed;
					}
				}

				if (this.verifyMinVal != "")
				{
					if ((min_val - 1 > one_value - 1) || (this.verifyMinValExclude && ((min_val - 1) == (one_value - 1))))
					{
						this.verificationPassed = false;
						return this.verificationPassed;
					}
				}

				if (this.verifyMaxVal != "")
				{
					if ((max_val - 1 < one_value - 1) || (this.verifyMaxValExclude && (max_val - 1 == one_value - 1)))
					{
						this.verificationPassed = false;
						return this.verificationPassed;
					}
				}
			}

			// After transformation return new_value
			if (new_value != value)
			{
				this.new_value = new_value;
			}
			return this.verificationPassed;
		}
	}
);

//**********************************************************************************************
// Controls
//

//----------------------------------------------------------------------------------------------
// rs.control
//

rs.control = newClass
(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			this.isStatic = false;
			this.parent = null;
			this.wbsreadonly = false;
			
			this.addInit(
				function()
				{
					// DOM Elements
					this.dom.notNull = this.domInstances['default'].notNull;
					this.dom.value = null;
					this.dom.initValue = null;
					this.dom.mode = 'not_created';
					this.dom.locks.disableLocks = {};
					this.dom.lookupIndexes = {};
					this.dom.disableElements = [];
					
					// Parameter setters
					this.dom.setters = {};
					
					// Initializing lookup from "default" instance
					this.dom.lookup = [];
					for(var i = 0; i < this.domInstances['default'].lookup.length; i++)
					{
						this.dom.lookup[i] = this.domInstances['default'].lookup[i];
					}
					this.dom.lookupIndexes = this.domInstances['default'].lookupIndexes;
				}
			);
			
			// Functions for clone objects
			this.cloneFunctions = [];
			this.cloneFunctions.push(
				function(control)
				{
					// Lookup
					if(this.dom.lookup)
					{
						control.setLookup(this.dom.lookup);
					}
					// Not null
					control.dom.notNull = this.dom.notNull;
					
					//Cloned options
					var clonedOptions = [
						"verificationPassed",
						"validator",
						"dataType",
						"name",
						"title",
						"isStatic",
						"hi"
					];
					for(var i in clonedOptions)
					{
						if(this[clonedOptions[i]] !== null)
						{
							control[clonedOptions[i]] = this[clonedOptions[i]];
						}
					}
				}
			);
			
			// Verify
			this.verificationPassed = true;

			// Validator
			this.validator = null;
		},
		reCreate: function()
		{
			if(this.dom.mode == "not_created")
			{
				return;
			}
			var v = this.dom.value || '';
			if(this.dom.place.firstChild)
			{
				this.dom.place.removeChild(this.dom.place.firstChild);
			}
			if(this.dom.mode == 'static')
			{
				this.dom.place.appendChild(this.getStaticContent(v));
			}
			else
			{
				this.dom.place.appendChild(this.getDynamicContent());
				this.setValue(v);
			}
		},
		setNotNull: function(v)
		{
			if(v)
			{
				this.dom.notNull = true;
			}
			else
			{
				this.dom.notNull = false;
			}
			this.handleEvent('onSetNotNull', [this, v]);
		},
		setParam: function(params)
		{
			for(var i in params)
			{
				if(this.dom.setters[i] instanceof Function)
				{
					this.dom.setters[i].call(this, params[i]);
				}
			}
		},
		setInitValue: function(v)
		{
			this.dom.initValue = v;
		},
		setStaticValue: function(v)
		{
			switch(this.dom.mode)
			{
				case "not_created":
				{
					this.dom.value = v;
					this.refresh();
					return true;
				}
				case "static":
				{
					if(v != this.dom.value)
					{
						this.dom.value = v;
						this.reCreate();
					}
					this.refresh();
					return true;
				}
				default:
				{
					return false;
				}
			}
		},
		getStaticValue: function()
		{
			switch(this.dom.mode)
			{
				case "not_created":
				case "static":
				{
					return true;
				}
				default:
				{
					return false;
				}
			}
		},
		toString: function()
		{
			return "rs.control";
		},
		getParent: function()
		{
			return this.parent;
		},
		refresh: function()
		{
			if(!rs.lockAllRefresh)
			{
				this.getValue();
				this.handleEvent('onChange', [this, this.dom.value]);
			}
		},
		createStatic: function(e, v)
		{
			v = v || this.dom.value;
			this.dom.place.appendChild(this.getStaticContent(v));
			e.appendChild(this.dom.place);
			this.dom.value = v ;
			this.dom.mode = "static";
			this.refresh();
		},
		getStaticContent: function(v)
		{
			return document.createTextNode(this.getStaticText(v));
		},
		getDynamicContent: function()
		{
			return document.createTextNode("");
		},
		getStaticText: function(v)
		{
			return v || "";
		},
		createDynamic: function(e)
		{
			this.dom.place.appendChild(this.getDynamicContent());
			e.appendChild(this.dom.place);
			this.dom.mode = "dynamic";
			this.refresh();
		},
		create: function(e, v)
		{
			v = v || this.dom.value;
			if (this.isStatic)
			{
				this.createStatic(e, v);
			}
			else
			{
				this.createDynamic(e);
				if (v != null)
				{
					this.setValue(v);
				}
			}
		},
		getRecordValue: function()
		{
			var v = this.getDirectValue();
			if ((v != null) && (this.dataType == "N"))
			{
				v = v.toString().replace(/,/, ".");
			}
			return v;
		},
		getHiddenValue: function()
		{
			return this.dom.initValue || '';
		},
		getValue: function()
		{
		},
		getDirectValue: function()
		{
			this.getValue();
			return this.dom.value;
		},
		setValue: function(v)
		{
		},
		setValidator: function(v)
		{
			this.validator = v;
		},
		verifyValue: function()
		{
			this.getValue();
			var value = this.dom.value;
			
			this.verificationPassed = true;
			this.verificationFailureReason = '';
			
			if (!rs.utils.isEmpty(this.validator))
			{
				this.validator.check(value, this.dom);
								
				this.verificationPassed = this.validator.verificationPassed;
				if (this.validator.verificationPassed)
				{
					this.handleEvent('onVerifyPassed', [this, this.dom.value]);
					if (this.validator.new_value)
					{
						this.setValue(this.validator.new_value);
					}
				}
				else
				{
					this.verificationFailureReason = this.validator.verificationFailureReason;
					this.handleEvent('onVerifyFailed', [this, this.dom.value]);
				}
			}
		},
		setLookup: function(lookup)
		{
			this.dom.lookup = lookup;
			this.createLookupIndex(['p','k']);
		},
		createLookupIndex: function(members)
		{
			for(var k = 0, mlen = members.length; k < mlen; ++k)
			{
				if(!this.dom.lookupIndexes[members[k]])
				{
					this.dom.lookupIndexes[members[k]] = {};
				}
			}
			for(var k = 0, mlen = members.length; k < mlen; ++k)
			{
				for(var i = 0, llen = this.dom.lookup.length; i < llen; ++i)
				{
					var value = this.dom.lookup[i][members[k]];
					if(rs.utils.isEmpty(value))
					{
						continue;
					}
					if(!this.dom.lookupIndexes[members[k]][value])
					{
						this.dom.lookupIndexes[members[k]][value] = [];
					}
					this.dom.lookupIndexes[members[k]][value].push(i);
				}
			}
		},
		findLookupMembers: function(member, value, lookup)
		{
			var result = [];
			lookup = lookup || this.dom.lookup;
			if(member && lookup == this.dom.lookup && this.dom.lookupIndexes[member])
			{
				var indexes = this.dom.lookupIndexes[member];
				if (indexes[value])
				{
					for(var i = 0; i < indexes[value].length; i++)
					{
						result.push(this.dom.lookup[indexes[value][i]]);
					}
				}
			}
			else
			{
				for(var i = 0; i < lookup.length; i++)
				{
					if(lookup[i][member] == value)
					{
						result.push(lookup[i]);
					}
				}
			}
			return result;
		},
		findUniqueMembers: function(member, lookup)
		{
			var result = [];
			lookup = lookup || this.dom.lookup;
			if(member && lookup == this.dom.lookup && this.dom.lookupIndexes[member])
			{
				var indexes = this.dom.lookupIndexes[member];
				for(var i in indexes)
				{
					for(var k in indexes[i])
					{
						result.push(lookup[indexes[i][k]]);
						break;
					}
				}
			}
			else
			{
				var index = {};
				for(var i = 0; i < lookup.length; i++)
				{
					if(!index[lookup[i][member]])
					{
						result.push(lookup[i]);
						index[lookup[i][member]] = true;
					}
				}
			}
			return result;
		},
		setDisabled: function(param, resource, holder)
		{
			resource = resource || 'default';
			if(param == false)
			{
				if(this.dom.locks.disableLocks[resource])
				{
					delete this.dom.locks.disableLocks[resource];
				}
				
				for(var i in this.dom.locks.disableLocks)
				{
					if(this.dom.locks.disableLocks[i] instanceof Function)
					{
						if(this.dom.locks.disableLocks[i]())
						{
							delete this.dom.locks.disableLocks[i];
						}
					}
				}
				
				if(rs.utils.object_isEmpty(this.dom.locks.disableLocks))
				{
					this.disable(false);
					this.dom.disabled = false;
				}
			}
			else
			{
				this.dom.locks.disableLocks[resource] = holder || true;
				this.disable(true);
				this.dom.disabled = true;
			}
			this.handleEvent('onDisableResource', [this, resource]);
		},
		setGrayStyle: function(param)
		{
			if(param)
			{
				this.addStyleClass('gray');
			}
			else
			{
				this.deleteStyleClass('gray');
			}
		},
		disableDynamic: function(param)
		{
			for(var i = 0; i < this.dom.disableElements.length; i++)
			{
				this.dom.disableElements[i].disabled = param;
			}
		},
		disable: function(param)
		{
			if(this.dom.mode == 'dynamic')
			{
				this.disableDynamic(param);
			}
			else
			{
				this.setGrayStyle(param);
			}
		},
		clone: function()
		{
			var control = eval('new ' + this);
			for(var i = 0; i < this.cloneFunctions.length; i++)
			{
				this.cloneFunctions[i].call(this, control);
			}
			return control;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.textbox
//

rs.textbox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = 'textbox';
		},
		toString: function()
		{
			return "rs.textbox";
		},
		focus: function()
		{
			if (this.dom.input && this.dom.input.focus)
			{
				this.dom.input.focus();
			}
		},
		getDynamicContent: function()
		{
			var input = document.createElement("input");
			       rqfcreate(this.name,input,'i');
			this.dom.input = input;
			this.dom.disableElements.push(input);
			input.onkeyup = this.getExecWithInstanceHandler(this.refresh);
			input.type = "text";
            if (this.wbsreadonly) 
{
input.setAttribute('readonly','readonly');
input.className='ctl-wbs-ro';
            input.style.backgroundColor='#eff2eb'; 
};

			return input;
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = this.dom.input.value;
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v || "")) return;
			this.dom.input.value = v || "";
			this.refresh();
		}
	}
);

//----------------------------------------------------------------------------------------------
//rs.textboxtext
//

rs.textboxext = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = 'textbox';
		},
		toString: function()
		{
			return "rs.textbox";
		},
		focus: function()
		{
			if (this.dom.input && this.dom.input.focus)
			{
				this.dom.input.focus();
			}
		},
		getDynamicContent: function()
		{
			var input = document.createElement("input");
			this.dom.input = input;
			this.dom.disableElements.push(input);
			
			rqfcreate(this.name,input,'i');

			input.onkeyup = this.getExecWithInstanceHandler(this.refresh);
			input.type = "text";
			
			input.name = this.name; // "eqprefix";

			return input;
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = this.dom.input.value;
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v || "")) return;
			this.dom.input.value = v || "";
			this.refresh();
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.itemlist
//
rs.itemList = newClass
(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			
			// DOM
			this.div = document.createElement('div');
			this.div.className = 'list';
			
			// Environment
			this.items = [];
			this.selectedItem = null;
		},
		create: function(e)
		{
			e.appendChild(this.div);
		},
		addItem: function(item)
		{
			this.items.push(item);
			item.create(this.div);
			item.addEventListener(
				'onSelect',
				(function()
				{
					if (this.selectedItem != item)
					{
						if (this.selectedItem)
						{
							this.selectedItem.select(false);
						}
						this.selectedItem = item;
					}
				}).bind(this)
			);
			item.addEventListener(
				'onUnSelect',
				(function()
				{
					if (this.selectedItem == item)
					{
						this.selectedItem = null;
					}
				}).bind(this)
			);
		},
		getSelectedItemIndex: function()
		{
			if (this.selectedItem)
			{
				for (var i = 0, len = this.items.length; i < len; i++)
				{
					if (this.items[i] == this.selectedItem)
					{
						return i;
					}
				}
				return -1;
			}
			else
			{
				return -1;
			}
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.itemlist
//
rs.itemListItem = newClass
(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			
			// DOM
			this.div = document.createElement('div');
			this.div.className = 'listItem';
			this.div.onclick = this.handleEvent.bind(this, ['onClick']);
			this.div.onmouseover = this.select.bind(this, [true]);
			this.div.onmouseout = this.select.bind(this, [false]);
			
			//Caption
			this.caption = null;
		},
		select: function(v)
		{
			if (v)
			{
				dom.addClass(this.div, 'selected');
				this.handleEvent('onSelect');
			}
			else
			{
				dom.deleteClass(this.div, 'selected');
				this.handleEvent('onUnSelect');
			}
		},
		create: function(e)
		{
			this.div.appendChild(document.createTextNode(this.caption));
			e.appendChild(this.div);
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.autocompleter
//

rs.autocompleter = newClass
(
	rs.textbox,
	{
		constructor: function()
		{
			rs.textbox.call(this);
			this.queryField = null;
			this.addInit(
				function()
				{
					this.dom.list = null;
					this.dom.value = null;
					this.dom.caption = null;
					this.dom.popup = null;
					this.dom.input = null;
					this.dom.focused = false;
					this.dom.request = {
						active: false,
						repeat: false
					};
					this.dom.popupActive = false;
				}
			);
		},
		toString: function()
		{
			return 'rs.autocompleter';
		},
		initPopup: function()
		{
			if (!this.dom.popup)
			{
				this.dom.popup = new rs.popup();
				dom.addClass(this.dom.popup.dom.content, 'autocompleterPopup');
				this.dom.popup.addEventListener(
					'onOver',
					this.getExecWithInstanceHandler(this.activatePopup)
				);
				this.dom.popup.addEventListener(
					'onOut',
					this.getExecWithInstanceHandler(
						function()
						{
							this.deactivatePopup();
							this.focus();
						}
					)
				);
			}
		},
		showPopup: function(v)
		{
			if (v)
			{
				this.initPopup();
				this.dom.popup.showFromBase(this.dom.input, 'bottom');
				this.dom.popup.autoSize();
				this.dom.popup.setWidth(this.dom.input.clientWidth + 2);
			}
			else if (this.dom.popup)
			{
				this.dom.popup.hide();
			}
		},
		getLoading: function()
		{
			var center = document.createElement('center');
			var loading = document.createElement('img');
			loading.src = rs.ajax_loading2_img_src;
			center.appendChild(loading);
			return center;
		},
		getStaticContent: function(v)
		{
			var div = document.createElement('div');
			div.appendChild(this.getLoading());
			var callback = this.getExecWithInstanceHandler(function(caption)
			{
				div.innerHTML = '';
				this.dom.caption = caption;
				div.appendChild(document.createTextNode(caption));
			});
			this.getValueForKey(
				v,
				callback
			);
			return div;
		},
		getDynamicContent: function()
		{
			var div = document.createElement('div');
			div.className = 'autocompleter';
			
			this.dom.input = document.createElement('input');
			this.dom.input.onkeydown = this.getExecWithInstanceHandler(function(e)
			{
				e = e || window.event;
				if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13)
				{
					if (this.dom.list && this.focused)
					{
						var selectedIndex = this.dom.list.getSelectedItemIndex();
						if (e.keyCode == 38 || e.keyCode == 40)
						{
							if (selectedIndex == -1)
							{
								this.dom.list.items[e.keyCode == 38 ? this.dom.list.items.length - 1 : 0].select(true);
							}
							else
							{
								var nextId = e.keyCode == 38 ? selectedIndex - 1 : selectedIndex + 1;
								if (nextId >= 0 && nextId < this.dom.list.items.length)
								{
									this.dom.list.items[nextId].select(true);
								}
							}
						}
						else if (selectedIndex != -1)
						{
							this.dom.list.items[selectedIndex].handleEvent('onClick');
						}
					}
					rs.utils.bubbleEvent(e);
					return false;
				}
			});
			if (IS_OPERA)
			{
				this.dom.input.onkeypress = this.getExecWithInstanceHandler(function(e)
				{
					e = e || window.event;
					if (e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 13)
					{
						rs.utils.bubbleEvent(e);
						return false;
					}
				});
			}
			this.dom.input.onkeyup = this.getExecWithInstanceHandler(function(e)
			{
				e = e || window.event;
				if (e.keyCode != 13)
				{
					this.getValueList();
				}
			});
			this.dom.input.onblur = this.getExecWithInstanceHandler(
				function()
				{
					if (!this.dom.popupActive)
					{
						this.focused = false;
						this.showPopup(false);
						if (this.dom.input.value == '')
						{
							this.setValue('');
						}
						else
						{
							this.dom.input.value = this.dom.caption;
						}
					}
				}
			);
			this.dom.input.onfocus = this.getExecWithInstanceHandler(
				function()
				{
					this.focused = true;
				}
			);
			div.appendChild(this.dom.input);
			return div;
		},
		getValueForKey: function(v, callback)
		{
			rs.ajax.GUIQuery(
				this.hi,
				['Autocompleter:getValue'],
				null,
				v,
				function(result)
				{
					callback(result.rowset && result.rowset.length ? result.rowset[0]['v'] : null);
				}
			);
		},
		activatePopup: function()
		{
			this.dom.popupActive = true;
		},
		deactivatePopup: function()
		{
			this.dom.popupActive = false;
		},
		getValueList: function()
		{
			if (this.dom.request.value == this.dom.input.value)
			{
				return;
			}
			if (!this.dom.request.active)
			{
				this.dom.request.repeat = false;
				this.dom.request.active = true;
				this.dom.request.value = this.dom.input.value;
				rs.ajax.GUIQuery(
					this.hi,
					['Autocompleter:getList'],
					null,
					this.dom.input.value,
					this.getExecWithInstanceHandler(
						function(result)
						{
							if (this.focused)
							{
								this.initPopup();
								this.dom.popup.clearContent();
								var div = document.createElement('div');
								
								this.dom.list = new rs.itemList();
								if (result.rowset && result.rowset.length)
								{
									for (var i = 0; i < result.rowset.length; i++)
									{
										var item = new rs.itemListItem()
										item.caption = result.rowset[i].v || result.rowset[i].k;
										item.addEventListener(
											'onClick',
											(function(row)
											{
												return this.getExecWithInstanceHandler(
													function()
													{
														this.setValue(row.k, row.v);
														this.showPopup(false);
													}
												);
											}).call(this, result.rowset[i])
										);
										this.dom.list.addItem(item);
									}
								}
								else
								{
									var item = new rs.itemListItem();
									item.caption = rs.s('autocompleter.no_match', 'Empty result');
									this.dom.list.addItem(item);
								}
								this.dom.list.create(div);
								this.dom.popup.addContent(div);
								this.showPopup(true);
							}
							this.dom.request.active = false;
							if (this.dom.request.repeat)
							{
								this.getValueList();
							}
						}
					)
				);
			}
			else
			{
				this.dom.request.repeat = true;
			}
		},
		setValue: function(v, caption)
		{
			if (this.setStaticValue(v || "")) return;
			if (v != this.dom.value)
			{
				this.dom.value = v;
				if (v)
				{
					if (!caption)
					{
						var loading = this.getLoading()
						this.dom.input.style.display = 'none';
						this.dom.place.appendChild(loading);
						this.getValueForKey(
							v,
							this.getExecWithInstanceHandler(
								function(caption)
								{
									this.dom.caption = caption;
									this.dom.input.value = caption;
									this.dom.place.removeChild(loading);
									this.dom.input.style.display = '';
								}
							)
						);
					}
					else
					{
						this.dom.caption = caption;
						this.dom.input.value = caption;
					}
				}
				else
				{
					this.dom.caption = '';
					this.dom.input.value = '';
				}
			}
			else
			{
				this.dom.input.value = this.dom.caption;
			}
			this.refresh();
		},
		getValue: function(){}
	}
);

//----------------------------------------------------------------------------------------------
// rs.password
//

rs.password = newClass
(
	rs.textbox,
	{
		constructor: function()
		{
			rs.textbox.call(this);
		},
		toString: function()
		{
			return "rs.password";
		},
		getStaticText: function(v)
		{
			return v ? "**********" : "";
		},
		getDynamicContent: function()
		{
			var input = document.createElement("input");
			this.dom.input = input;
			this.dom.disableElements.push(input);
			input.onkeyup = this.getExecWithInstanceHandler(this.refresh);
			input.type = "password";
			input.autoComplete = "off";
			return input;
		},
		getRecordValue: function()
		{
			return this.dom.value;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.textarea
//

rs.textarea = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "textarea";
			this.maxStaticLength = 100;
			this.collapse = false;
			this.saveExpanded = true;
		},
		toString: function()
		{
			return "rs.textarea";
		},
		getStaticText: function(v)
		{
			// Remove extra line breaks
			var s = (v || "").replace(/\r\n/g, "\n").replace(/\r/g, "");
			if(IS_MSIE)
			{
				return s.replace(/\n/g, "\r");
			}
			return s;
		},
		addLinks: function(linksIn)
		{
			this.links = linksIn;
		},
		focus: function()
		{
			if (this.dom.textarea && this.dom.textarea.focus)
			{
				this.dom.textarea.focus();
			}
		},
		node: newClass
		(
			null,
			{
				constructor: function()
				{
					this.open = '{';
					this.close = '}';
					this.str = '';
					this.level = 0;
					this.expanded = [];
					this.flag = true;
					this.childs = [];
					this.pieces = [];
					this.actions = [];
				},
				
				collapseAll: function()
				{
					this.actionAll(false);
				},
					
				expandAll: function()
				{
					this.actionAll(true);
				},
				
				s: function(str)
				{
					return str.replace(/^[ \t\r]*\n/, "").replace(/[\t ]+$/,"");
				},
				
				actionAll: function(expand)
				{
					for(var i = 0; i < this.actions.length; i++)
					{
						if(this.expanded[i] != expand)
						{
							this.actions[i]();
						}
					}
					for(var i = 0; i < this.childs.length; i++)
					{
						this.childs[i].actionAll(expand);
					}
				},
				
				setString: function(str)
				{
					this.clear();
					str = str.replace(/\n[ \t]*/g,"\n").replace(/[ ]+/g," ").replace(/([^\\]);/g,"\n");
					var i = 0;
					var point = 0;
					
					while(i < str.length)
					{
						if(str.charAt(i)==this.open && str.charAt(i-1)!="\\")
						{
							var start = i;
							i++;
							var opened = 0;
							var last_closed = null;
							while(((str.charAt(i)!=this.close || str.charAt(i-1)=="\\") || opened!=0) && i<str.length)
							{
								if(str.charAt(i)==this.open && str.charAt(i-1)!="\\")
								{
									opened++;
								}
								if(str.charAt(i)==this.close && str.charAt(i-1)!="\\")
								{
									opened--;
									last_closed = i;
								}
								i++;
							}
							var stop = i;
							
							if(i == str.length)
							{
								if(last_closed != null)
								{
									i = last_closed;
									stop = last_closed;
								}
							}
							
							if(i < str.length && start<=stop)
							{
								if(start != point)
								{
									this.addPiece(str.substring(point, start).trim());
								}
								var child = new this.parent.node();
								child.setParent(this.parent);
								this.addChild(child);
								child.setString(str.substring(start+1, stop));
								point = i+1;
							}
						}
						i++;
					}
					this.addPiece(str.substring(point, str.length).trim());
					this.str = str;
				},
				
				addPiece: function(str)
				{
					this.pieces.push(str.replace(/\\\{/g, "{").replace(/\\\}/g, "}").replace(/\\;/g,";"));
				},
				
				setParent: function(parent)
				{
					this.parent = parent;
				},
				
				addChild: function(child)
				{
					child.level = this.level + 1;
					this.childs.push(child);
				},
				
				clear: function()
				{
					this.pieces = [];
					this.childs = [];
				},
				
				sie: function(str)
				{
					if(IS_MSIE)
					{
						return str.replace(/\n/g, "\r");
					}
					return str;
				},
				
				expandedAll: function()
				{
					var result = true;
					for(var i = 0; i < this.expanded.length; ++i)
					{
						result = result && this.expanded[i];
						result = result && this.childs[i].expandedAll();
					}
					return result;
				},
				
				getCollapsePositions: function(arr)
				{
					for(var i = 0; i < this.childs.length; ++i)
					{
						if(this.expanded[i])
						{
							arr[i] = {e: true, c: []};
							this.childs[i].getCollapsePositions(arr[i]['c']);
						}
					}
				},
				
				expandWithMap: function(map)
				{
					for(var i = 0; i < map.length; i++)
					{
						if(map[i]['e'] && this.actions[i])
						{
							this.actions[i]();
							if(map[i]['c'] && this.childs[i])
							{
								this.childs[i].expandWithMap(map[i]['c']);
							}
						}
					}
				},
				
				extractMetaTags: function(tags, str)
				{
					
					if(IS_MSIE)
					{
						str = ' ' + str;
					}
					
					var regexp_childs = [];
					for(var i in tags)
					{
						regexp_childs.push("<" + i + "[^>]*>[^<]*</" + i + ">");
					}
					
					//
					var regexp = new RegExp(regexp_childs.join('|'), 'g');
					var params_regexp = new RegExp('([a-zA-Z_]+)=\"([^\"]*)\"', 'g');
					var name_params_innertext_regexp = new RegExp('<([a-zA-Z_]+)[ ]*(.*)>(.*)<\/[a-zA-Z_]+>', 'g');
					
					
					regexp.lastIndex = 0;
					var rtags = [];
					var extracted_tags = str.match(regexp) || [];
					
					if(IS_MSIE)
					{
						var temp = [];
						var i = 0;
						if(!rs.utils.object_isEmpty(extracted_tags))
							while(extracted_tags[i])
							{
								temp.push(extracted_tags[i]);
								i++;
							}
						extracted_tags = temp;
					}
					
					for(var i = 0; i < extracted_tags.length; i++)
					{
						var tag = {};
						name_params_innertext_regexp.lastIndex = 0;
						name_params_innertext_regexp.exec(extracted_tags[i]);
						tag.name = RegExp['$1'];
						tag.inner_text = RegExp.$3;
						tag.params = {};
						var params = RegExp.$2;
						var params_arr = params.match(params_regexp) || [];
						for(var k = 0; k < params_arr.length; k++)
						{
							params_regexp.lastIndex = 0;
							params_regexp.exec(params_arr[k]);
							tag.params[RegExp.$1] = RegExp.$2;
						}
						rtags.push(tag);
						tag = null;
					}
					var text = str.split(regexp);
					
					if(IS_MSIE)
					{
						if(text[0]==' ')
						{
							text[0]='';
						}
					}
					
					return {
						tags: rtags,
						text: text
					}
				},
				
				parseMetaTags: function(e, str)
				{
					var tags = {
						hyperlink:
						{
							realTag: 'a',
							attributes:
							{
								href: function(params)
								{
									return params['href'];
								}
							}
						},
						tm_link:
						{
							realTag: 'a',
							attributes:
							{
								href: function(params)
								{
									if(!this.parent.links[params['table']])
									{
										return false;
									}
									var p = [];
									for(var i in params)
									{
										if(i != 'table')
										{
											p.push('data['+ i +']=' + params[i]);
										}
									}
									return str = '?action=Textarea:ViewLink&target=' + this.parent.links[params['table']] + ( p.length>0 ? '&' + p.join('&') : '');
								}
							}
						},
						tm_style:
						{
							realTag: 'span',
							attributes:
							{
								className: function(params)
								{
									return params['class'];
								}
							}
						},
						l:
						{
							realTag: 'span',
							attributes:
							{
								className: function(params)
								{
									return params['class'];
								}
							},
							content: function(content, atributes)
							{
								var v = this.parent.findLookupMembers('k', content);
								v = v.pop();
								if(v)
								{
									return v['v'];
								}
								else
								{
									return content;
								}
							}
						}
					};
					
					var extracted = this.extractMetaTags(tags, str);
					
					for(var i = 0; i < extracted.text.length; ++i)
					{
						e.appendChild(document.createTextNode(extracted.text[i]));
						if(extracted.tags[i] /*&& i != (extracted.text.length-1)*/)
						{
							var element = document.createElement(tags[extracted.tags[i].name].realTag);
							for(var k in tags[extracted.tags[i].name].attributes)
							{
								var v = tags[extracted.tags[i].name].attributes[k].call(this, extracted.tags[i].params);
								if(v !== false)
								{
									element[k] = v;
								}
							}
							if(tags[extracted.tags[i].name].content)
							{
								var content = tags[extracted.tags[i].name].content.call(this, extracted.tags[i].inner_text, extracted.tags[i].params)
							}
							else
							{
								var content = extracted.tags[i].inner_text;
							}
							element.appendChild(document.createTextNode(content));
							e.appendChild(element);
						}
					}
				},
				
				create: function(e)
				{
					for(var i = 0; i < this.pieces.length; ++i)
					{
						var point = -1;
						var count = 0;
						var indent = "";
						for(var k = 0; k < this.level; k++)
						{
							indent += "    ";
						}
						
						var strs = this.pieces[i].split("\n");
						
						/*var regLink = new RegExp("<tm_link *(.*)</tm_link>");
						if (IS_MSIE)
						{
							regLink = /<tm_link +|<\/tm_link>/;
						}*/
						
						if(strs.length > 1)
						{
							var span = document.createElement('span');
							for(var k = 0; k < strs.length-1; k++)
							{
								if(strs[k]!='')
								{
									span.appendChild(document.createTextNode(indent));
									this.parseMetaTags(span, strs[k]);
									span.appendChild(document.createTextNode(this.sie("\n")));
								}
							}
							e.appendChild(span);
						}
						
						var str = this.sie(strs[strs.length-1]+"\n");
						if(str.trim()=="")
						{
							if(this.childs[i])
							{
								if(this.childs[i].str.trim() == '')
								{
									continue;
								}
								else
								{
									var str = this.sie("block\n");
								}
							}
							else
							{
								continue;
							}
						}
						e.appendChild(document.createTextNode(indent));
						var span = null;
						span = document.createElement('span');
						this.parseMetaTags(span, str);
						
						e.appendChild(span);
						
						if(this.childs[i])
						{
							if(!this.childs[i].str.trim())
							{
								continue;
							}
							
							var body_span = document.createElement('span');
							var func = function()
							{
								var cmp = body_span;
								var strstr = str;
								var t = this;
								var d = span;
								var ii = i;
								return function(e)
								{
									rs.utils.bubbleEvent(e);
									if(e && e.ctrlKey)
									{
										if(t.childs[ii].expandedAll() && t.expanded[ii])
										{
											t.childs[ii].collapseAll();
										}
										else
										{
											t.childs[ii].expandAll();
											if(t.expanded[ii])
											{
												return false;
											}
										}
									}
									
									if(t.expanded[ii])
									{
										d.removeChild(d.childNodes[0]);
										d.appendChild(document.createTextNode(t.sie(strstr.rtrim()+" {...}\n")));
										cmp.style.display = 'none';
										t.expanded[ii] = false;
									}
									else
									{
										d.removeChild(d.childNodes[0]);
										d.appendChild(document.createTextNode(t.sie(strstr)));
										cmp.style.display = '';
										t.expanded[ii] = true;
									};
									
									if(t.parent.block)
									{
										t.parent.saveExpandedAgain = true;
									}
									else
									{
										t.parent.saveCollapsePosition();
									}
									
									return false;
								}
							}
							this.expanded[i] = true;
							this.actions[i] = func.call(this);
							
							span.onclick = this.actions[i];
							span.className = 'pointer header';
							this.childs[i].create(body_span);
							e.appendChild(body_span);
							body_span = null;
						}
						div = null;
					}
				}
			}
		),
		
		saveCollapsePosition: function()
		{
			if(!this.saveExpanded)
			{
				return;
			}
			var data = [];
			this.root_node.getCollapsePositions(data);
			var self = this;
			self.block = true;
			var callback = function(result) {
				if(self.saveExpandedAgain)
				{
					self.saveExpandedAgain = false;
					self.saveCollapsePosition();
				}
				self.block = false;
			}
			
			rs.ajax.GUIQuery(this.name, ['Textarea:saveCollapsePosition'], this.parent.hi, data, callback);
		},
		getStaticContent: function(v)
		{
			var text = this.getStaticText(v);
			var d = document.createElement('div');
			if (!IS_MSIE)
			{
				d.style.overflowX = 'auto';
			}
			if(!text)
			{
				return d;
			}
			d.className = 'ctl-textarea';
			this.root_node = new this.node();
			this.root_node.setParent(this);
			if(this.collapse)
			{
				this.root_node.setString(text);
			}
			else
			{
				this.root_node.addPiece(text);
			}
			this.root_node.create(d);
			this.root_node.collapseAll();
			this.root_node.expandWithMap(this.expandedMap || []);
			this.block = false;
			
			for(var i = 0; i < this.root_node.childs.length; i++)
			{
				if(!this.root_node.expanded[i] && this.root_node.actions[i])
				{
					this.root_node.actions[i]();
				}
			}
			
			dom.addClass(d, 'sizeCalculate');
			document.body.appendChild(d);
			if ((d.clientWidth || d.offsetWidth) > 400)
			{
				dom.addClass(d, 'ctl-textarea-gt-400');
			}
			else
			{
				dom.addClass(d, 'ctl-textarea-lt-400');
			}
			document.body.removeChild(d);
			dom.deleteClass(d, 'sizeCalculate');
			
			d.style.visibility = 'visible';
			d.style.position = 'static';
			
			return d;
		},
		fitRowSize: function(textarea)
		{
			var value = textarea.value;
			
			//textarea.style.overflowY = textarea.rows >= 20 ? 'auto' : 'hidden'; // Clear flash scroll
			
			var rows = value.split('\n').length;
			rows = ( rows>20 ? 20 : rows );
			if (IS_OPERA) rows = rows<=18 ? rows+2 : 20;
			textarea.rows = rows;
			
			var line_height = 13; // Height line inside textarea element
			var rows_add = Math.ceil((textarea.scrollHeight - textarea.clientHeight) / line_height);
			
			if (rows_add > 0) 
			{
				rows += rows_add;
			}
			if (rows >= 20) 
			{
				rows = 20;
				textarea.style.overflowY = 'auto';
			}
			textarea.rows = rows;
		},
		getDynamicContent: function()
		{
			var textarea = document.createElement('textarea');
			  rqfcreate(this.name,textarea,'t');
			this.dom.disableElements.push(textarea);
			textarea.rows = IS_OPERA ? 3 : 1;
			textarea.cols = 60;
			textarea.wrap = 'off';
			var fitRow = this.fitRowSize.bind(this).createCaller(textarea);
			var refresh = this.getExecWithInstanceHandler(this.refresh);
			textarea.onkeyup = function()
			{
				fitRow();
				refresh();
			}
			textarea.onkeypress = this.getExecWithInstanceHandler(this.getTab);
			this.dom.textarea = textarea;
			return textarea;
		},
		getTab: function(e)
		{
			e = e || window.event;
			var key = e.keyCode || e.which;
			var obj = this.dom.textarea;
			if (key == 9)
			{
				if (obj.nodeName) if (obj.nodeName.toLowerCase() == "textarea") obj.focus();
				if(document.selection)
				{
					var iesel = document.selection.createRange().duplicate();
					iesel.text = "\t";
				}
				else
				{
					var start = obj.selectionStart;
					var end = obj.selectionEnd;
					var left = obj.value.substring(0, start);
					var right = obj.value.substring(end);
					var scroll = obj.scrollTop;
					obj.value = left + "\t" + right;
					obj.selectionStart = obj.selectionEnd = start + 1;
					obj.scrollTop = scroll;
					obj.focus();
				}
				if(e.preventDefault)
				{
					e.preventDefault();
				}
				e.returnValue = false;
				return false;
			}
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = this.dom.textarea.value;
			if (IS_MOZILLA)
			{
				this.dom.value = this.dom.value.replace(/\r/g, "").replace(/\n/g, "\r\n");
			}
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v || "")) return;
			this.dom.textarea.value = v || "";
			this.fitRowSize(this.dom.textarea);
			this.refresh();
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.iframe
//

rs.iframe = newClass
(
	rs.textarea,
	{
		constructor: function()
		{
			rs.textarea.call(this);
		},
		toString: function()
		{
			return "rs.iframe";
		},
		getStaticText: function(v)
		{
			return rs.utils.isEmpty(v) ? '' : v;
		},
		getStaticContent: function(v)
		{
			var text = this.getStaticText(v);
			if(rs.utils.isEmpty(text))
			{
				return document.createTextNode('');
			}
			var f = document.createElement('iframe');
			f.className = 'iframe-injection'
			f.src = 'blank.html';
			
			if(IS_MSIE)
			{
				window.document.body.appendChild(f);
				f.contentWindow.document.body.innerHTML = text;
			}
			else
			{
				var onLoadHandler = function()
				{
					this.contentWindow.document.body.innerHTML = text;
					var height = this.contentWindow.document.body.offsetHeight + 50;
					this.style.height = height + 'px';
				}
				f.onload = onLoadHandler;
			}
			return f;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.hypertext
//

rs.hypertext = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "textarea";
			this.maxStaticLength = 100;
		},
		toString: function()
		{
			return "rs.hypertext";
		},
		getStaticText: function(v)
		{
			// Remove extra line breaks
			var s = (v || "").replace(/\r\n/g, "\n").replace(/\r/g, "");

			//
			//	Bug in MSIE
			//	-----------
			//	IE uses CR ('\r') instead of LF ('\n') as line break.
			//	Next line produces different strings for IE and other browsers.
			//

			if (IS_MSIE)
			{
				s = s.replace(/\n/g, "\r");
			}
		},
		getStaticContent: function(v)
		{
			var div = document.createElement('div');
			this.dom.div = div;
			div.appendChild(document.createTextNode(v));
			return div
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.checkbox
//

rs.checkbox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "checkbox";
		},
		toString: function()
		{
			return "rs.checkbox";
		},
		getStaticText: function(v)
		{
			return (v == 1) ? rs.s('checkbox.yes', 'Yes') : '';
		},
		getDynamicContent: function()
		{
			var checkbox = document.createElement("input");
			this.dom.disableElements.push(checkbox);
			this.dom.checkbox = checkbox;
			checkbox.onclick = this.getExecWithInstanceHandler(this.refresh);
			checkbox.type = "checkbox";
			return checkbox;
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = this.dom.checkbox.checked ? 1:0;
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v)) return;
			this.dom.checkbox.checked = (v==1);
			this.refresh();
		},
		verifyValue: function()
		{
			this.verificationPassed = true;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.combobox
//

rs.combobox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.dom.notNull = true;
			this.unknown_value = false;
			this.baseStyle = 'ctl-lookup';
			
			this.addInit(
				function()
				{
					this.dom.options = [];
					for(var i = 0; i < this.domInstances['default'].options.length; i++)
					{
						this.dom.options[i] = this.domInstances['default'].options[i];
					}
				}
			);
		},
		setNotNull: function(v)
		{
			if(v)
			{
				this.dom.notNull = true;
			}
			else
			{
				this.dom.notNull = false;
			}
			if(this.dom.mode == 'dynamic')
			{
				this.setOptions(this.dom.options);
			}
			this.handleEvent('onSetNotNull', [this, v]);
		},
		toString: function()
		{
			return "rs.combobox";
		},
		setLookup: function(lookup)
		{
			this.dom.lookup = lookup;
			this.createLookupIndex(['p','k']);
			this.dom.options = this.dom.lookup;
			//this.dom.options = this.findLookupMembers('p', null);
		},
		setLookupParam: function(param)
		{
			if(param == null)
			{
				return;
			}
			this.dom.options = this.findLookupMembers('p', param);
			if(this.dom.mode == 'dynamic')
			{
				this.setOptions(this.dom.options);
			}
			/*Force reCreate in setStaticValue*/
			this.dom.value = null;
			this.setValue(this.dom.initValue);
		},
		setAllOptions: function()
		{
			this.dom.options = this.findUniqueMembers('k');
			if(this.dom.mode == 'dynamic')
			{
				this.setOptions(this.dom.options);
			}
			this.setValue(this.dom.initValue);
		},
		getOptionByValue: function(v)
		{
			var findedValue = this.findLookupMembers('k', v, this.dom.options);
			return findedValue.length > 0 ? findedValue.pop() : {};
		},
		getStaticText: function(v)
		{
			var option = this.getOptionByValue(v);
			if (this.unknown_value)
			{
				return option['v'] || (v ? rs.s('combobox.unknown_value', 'Unknown value') + ' (' + v + ')' : '');
			}
			else
			{
				return option['v'] || v || '';
			}
		},
		getStaticContent: function(v)
		{
			var span = document.createElement('span');
			var option = this.getOptionByValue(v);
			if (option['s'])
			{
				span.className += ' ' + option['s'];
			}
			if (option['hint'])
			{
				span.title = option['hint'];
			}
			span.appendChild(document.createTextNode(this.getStaticText(v)));
			return span;
		},
		getDynamicContent: function()
		{
			var select = document.createElement("select");
			this.dom.disableElements.push(select);
			this.dom.select = select;
			this.setOptions(this.dom.options);
			select.onchange = this.getExecWithInstanceHandler(this.refresh);
			//this.fitWidth();
			return select;
		},
		fitWidth: function()
		{
			var select = this.dom.select;
			var wSize = dom.getWindowSize();
			var maxWidth = (wSize.width - 310) > 400 ? (wSize.width - 310) : 400;
			
			// sizeCalculate
			dom.addClass(select, 'sizeCalculate');
			document.body.appendChild(select);
			var selectWidth = (select.clientWidth || select.offsetWidth);
			document.body.removeChild(select);
			dom.deleteClass(select, 'sizeCalculate');
			
			if (selectWidth > maxWidth)
			{
				dom.addClass(select, 'ctl-lookup-gt-maxwidth');
				for (var i = 0; i < select.options.length; i++)
				{
					select.options[i].title = select.options[i].text;
				}
			}
		},
		setOptions: function(options)
		{
			/*var select = this.dom.select;
			select.innerHTML = '';*/
			/*while (select.length > 0)
			{
				select.remove(0);
			}*/
			this.dom.select.innerHTML = '';
			if (!this.dom.notNull)
			{
				addOption(this.dom.select, "", "", false);
			}
			for (var i = 0, len = options.length; i < len; ++i)
			{
				addOption(this.dom.select, options[i]['v'], options[i]['k'], false, (options[i]['s'] ? options[i]['s'] : ''));
			}
		},
		getValue: function()
		{
			if (!this.getStaticValue())
			{
				var value = this.dom.select.value;
				this.dom.value = value;
			}
			
			if (this.dom.notNull && this.dom.value == '')
			{
				if (this.dom.options.length && !this.checkDisplay())
				{
					this.dom.value = this.dom.options[0]['k'];
				}
			}
		},
		setValue: function(v)
		{
			v = v || "";
			if (this.setStaticValue(v)) return;
			for (var i=0; i<this.dom.select.options.length; i++)
			{
				if (this.dom.select.options[i].value == v)
				{
					this.dom.select.selectedIndex = i;
					break;
				}
			}
			this.refresh();
		}
	}
);

//----------------------------------------------------------------------------------------------
//rs.comboboxext
//

rs.comboboxext = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.dom.notNull = true;
			this.unknown_value = false;
			this.baseStyle = 'ctl-lookup';
			
			this.addInit(
				function()
				{
					this.dom.options = [];
					for(var i = 0; i < this.domInstances['default'].options.length; i++)
					{
						this.dom.options[i] = this.domInstances['default'].options[i];
					}
				}
			);
		},
		setNotNull: function(v)
		{
			if(v)
			{
				this.dom.notNull = true;
			}
			else
			{
				this.dom.notNull = false;
			}
			if(this.dom.mode == 'dynamic')
			{
				this.setOptions(this.dom.options);
			}
			this.handleEvent('onSetNotNull', [this, v]);
		},
		toString: function()
		{
			return "rs.combobox";
		},
		setLookup: function(lookup)
		{
			this.dom.lookup = lookup;
			this.createLookupIndex(['p','k']);
			this.dom.options = this.dom.lookup;
			//this.dom.options = this.findLookupMembers('p', null);
		},
		setLookupParam: function(param)
		{
			if(param == null)
			{
				return;
			}
			this.dom.options = this.findLookupMembers('p', param);
			if(this.dom.mode == 'dynamic')
			{
				this.setOptions(this.dom.options);
			}
			/*Force reCreate in setStaticValue*/
			this.dom.value = null;
			this.setValue(this.dom.initValue);
		},
		setAllOptions: function()
		{
			this.dom.options = this.findUniqueMembers('k');
			if(this.dom.mode == 'dynamic')
			{
				this.setOptions(this.dom.options);
			}
			this.setValue(this.dom.initValue);
		},
		getOptionByValue: function(v)
		{
			var findedValue = this.findLookupMembers('k', v, this.dom.options);
			return findedValue.length > 0 ? findedValue.pop() : {};
		},
		getStaticText: function(v)
		{
			var option = this.getOptionByValue(v);
			if (this.unknown_value)
			{
				return option['v'] || (v ? rs.s('combobox.unknown_value', 'Unknown value') + ' (' + v + ')' : '');
			}
			else
			{
				return option['v'] || v || '';
			}
		},
		getStaticContent: function(v)
		{
			var span = document.createElement('span');
			var option = this.getOptionByValue(v);
			if (option['s'])
			{
				span.className += ' ' + option['s'];
			}
			if (option['hint'])
			{
				span.title = option['hint'];
			}
			span.appendChild(document.createTextNode(this.getStaticText(v)));
			return span;
		},
		getDynamicContent: function()
		{
			var select = document.createElement("select");
			select.id=this.name;
			var rownum=0;
			rqfcreate(this.name,select,'s');
			
			this.dom.disableElements.push(select);
			this.dom.select = select;
			this.setOptions(this.dom.options);
			//select.onchange = this.getExecWithInstanceHandler(this.refresh);
//			select.onchange = this.change.bind(this).createCaller();
            
			this.dom.select.onchange = this.handler_onchange.bind(this).createCaller();
			if (this.wbsreadonly) select.disabled=true;
		   //ww   select.onchange = this.handler_onchange.bind(this).createCaller(rownum);
			//this.fitWidth();
			return select;
		},
		fitWidth: function()
		{
			var select = this.dom.select;
			var wSize = dom.getWindowSize();
			var maxWidth = (wSize.width - 310) > 400 ? (wSize.width - 310) : 400;
			
			// sizeCalculate
			dom.addClass(select, 'sizeCalculate');
			document.body.appendChild(select);
			var selectWidth = (select.clientWidth || select.offsetWidth);
			document.body.removeChild(select);
			dom.deleteClass(select, 'sizeCalculate');
			
			if (selectWidth > maxWidth)
			{
				dom.addClass(select, 'ctl-lookup-gt-maxwidth');
				for (var i = 0; i < select.options.length; i++)
				{
					select.options[i].title = select.options[i].text;
				}
			}
		},
	      handler_onchange: function()
          {
	this.refresh.bind(this);
/*  alert('e');
	var record = select.getDynRecord();
	alert('er');	
	if(!record)
	{
		return;
	};
	alert(record);
	Aux.Form__DoSubmit("Table:UpdateRow", nul, record);
	*/
	//$("form:first").submit();
	doSubmit('select',this.name,this.dom.select.value);
	},

		setOptions: function(options)
		{
			/*var select = this.dom.select;
			select.innerHTML = '';*/
			/*while (select.length > 0)
			{
				select.remove(0);
			}*/
			this.dom.select.innerHTML = '';
			if (!this.dom.notNull)
			{
				addOption(this.dom.select, "", "", false);
			}
			for (var i = 0, len = options.length; i < len; ++i)
			{
				addOption(this.dom.select, options[i]['v'], options[i]['k'], false, (options[i]['s'] ? options[i]['s'] : ''));
			}
		},
		getValue: function()
		{
			if (!this.getStaticValue())
			{
				var value = this.dom.select.value;
				this.dom.value = value;
			}
			
			if (this.dom.notNull && this.dom.value == '')
			{
				if (this.dom.options.length && !this.checkDisplay())
				{
					this.dom.value = this.dom.options[0]['k'];
				}
			}
		},
		setValue: function(v)
		{
			v = v || "";
			if (this.setStaticValue(v)) return;
			for (var i=0; i<this.dom.select.options.length; i++)
			{
				if (this.dom.select.options[i].value == v)
				{
					this.dom.select.selectedIndex = i;
					break;
				}
			}
			this.refresh();
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.ecombobox
//

rs.ecombobox = newClass
(
	rs.combobox,
	{
		constructor: function()
		{
			rs.combobox.call(this);
			this.addInit(
				function()
				{
					/*DOM Elements*/
					this.dom.dynamicMode = 'select'; // ['manual', 'select']
					this.dom.input = null;
					this.dom.inputImg = null;
					this.dom.select = null;
				}
			);
		},
		toString: function()
		{
			return "rs.ecombobox";
		},
		setLookupParam: function(param)
		{
			if(param == null)
			{
				return;
			}
			this.dom.options = this.findLookupMembers('p', param);
			if(this.dom.mode == 'dynamic')
			{
				if(this.dom.options.length == 0)
				{
					this.changeDynamicMode('manual');
					if(this.dom.inputImg)
					{
						this.dom.inputImg.disabled = true;
					}
				}
				else
				{
					var option = this.getOptionByValue(this.dom.value);
					this.changeDynamicMode(rs.utils.object_isEmpty(option) && this.dom.value != "" ? 'manual':'select');
					if(this.dom.inputImg)
					{
						this.dom.inputImg.disabled = false;
					}
				}
			}
			var v = this.dom.value;
			this.setOptions(this.dom.options);
			this.setValue(v);
		},
		changeDynamicMode: function(mode)
		{
			if(this.dom.dynamicMode != mode)
			{
				this.dom.dynamicMode = mode;
				if(mode == 'select')
				{
					this.dom.value = this.getNearestValue(this.dom.value);
					if(rs.utils.object_isEmpty(this.getOptionByValue(this.dom.value)))
					{
						if(this.dom.options.length)
						{
							this.dom.value = this.dom.options[0]['k'];
						}
						else
						{
							this.dom.value = null;
						}
					}
				}
				v = this.dom.value;
				this.reCreate();
				this.setValue(v);
			}
		},
		disableDynamic: function(param)
		{
			switch(this.dom.dynamicMode)
			{
				case "manual":
				{
					this.dom.input.disabled = param;
					this.dom.inputImg.disabled = (this.dom.options.length == 0 || param);
					break;
				}
				case "select":
				{
					this.dom.select.disabled = param;
					break;
				}
			}
		},
		getDynamicManualContent: function()
		{
			var div = document.createElement('div');
			var input = document.createElement('input');
			this.dom.input = input;
			input.type = "text";
			input.value = this.dom.value || '';
			input.onkeyup = this.getExecWithInstanceHandler(this.refresh);
			div.appendChild(input);
			
			var inputImg = document.createElement('input');
			if(this.dom.options.length == 0)
			{
				inputImg.disabled = true;
			}
			this.dom.inputImg = inputImg;
			inputImg.type = 'button';
			inputImg.value = rs.s('ecombobox.list', 'List');
			inputImg.onclick = this.getExecWithInstanceHandler(this.changeDynamicMode, ['select']);
			div.appendChild(inputImg);
			return div;
		},
		getDynamicSelectContent: function()
		{
			var div = document.createElement('div');
			var select = document.createElement("select");
			this.dom.select = select;
			this.setOptions(this.dom.options);
			
			var self = this;
			var changeToText = this.getExecWithInstanceHandler(this.changeDynamicMode, ['manual']);
			var refresh = this.getExecWithInstanceHandler(this.refresh);
			select.onchange = function()
			{
				if(this.selectedIndex == (self.dom.notNull ? 0 : 1))
				{
					changeToText();
				}
				else
				{
					refresh();
				}
			}
				
			div.appendChild(select);
			
			if (this.dom.notNull && this.dom.options.length > 0)
			{
				// The first value option (after '-- Manual input --') must be selected
				select.value = this.dom.options[0]['k'];
			}
			
			return div;
		},
		getDynamicContent: function()
		{
			var div = document.createElement('div');
			if(this.dom.notNull && this.dom.options.length == 0)
			{
				this.dom.dynamicMode = 'manual';
			}
			switch(this.dom.dynamicMode)
			{
				case "manual":
				{
					div.appendChild(this.getDynamicManualContent());
					break;
				}
				case "select":
				{
					div.appendChild(this.getDynamicSelectContent());
					break;
				}
			}
			return div;
		},
		setOptions: function(options)
		{
			if(this.dom.select)
			{
				while (this.dom.select.length > 0)
				{
					this.dom.select.remove(0);
				}
				if (!this.dom.notNull)
				{
					addOption(this.dom.select, "", "", false);
				}
				var manualInputTitle = '--- ' + rs.s('ecombobox.manual_input', 'Manual input') + ' ---';
				addOption(this.dom.select, manualInputTitle, '', false);
				for (var i = 0; i < options.length; i++)
				{
					addOption(this.dom.select, options[i]['v'], options[i]['k'], false, (options[i]['s'] ? options[i]['s'] : ''));
				}
			}
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			switch(this.dom.dynamicMode)
			{
				case "manual":
				{
					this.dom.value = this.dom.input.value;
					break;
				}
				case "select":
				{
					this.dom.value = this.dom.select.value;
					break;
				}
			}
		},
		setValue: function(v)
		{
			v = v || "";
			if (this.setStaticValue(v)) return;
			this.dom.value = v;
			switch(this.dom.dynamicMode)
			{
				case "manual":
				{
					this.dom.input.value = v;
					break;
				}
				case "select":
				{
					var option = this.getOptionByValue(v);
					if(
						rs.utils.object_isEmpty(option)
					)
					{
						this.changeDynamicMode('manual');
						return;
					}
					this.dom.select.value = v;
					break;
				}
			}
			this.refresh();
		},
		getNearestValue: function(v)
		{
			v = v || this.dom.value;
			if (this.dataType == 'I' || this.dataType == 'N')
			{
				var delta = Number.MAX_VALUE;
				for(var i = 0; i < this.dom.options.length; i++)
				{
					var cDelta = Math.abs(this.dom.options[i]['k'] - v);
					if(cDelta < delta)
					{
						delta = cDelta;
						var nearest = this.dom.options[i]['k'];
					}
				}
			}
			return nearest || v;
		}
	}
);


//----------------------------------------------------------------------------------------------
// rs.set
//

rs.set = newClass
(
	rs.combobox,
	{
		constructor: function()
		{
			rs.combobox.call(this);
			this.delimiter = ";";
			this.inline = true;
			this.addInit(
				function()
				{
					this.dom.checkBoxes = {};
					this.dom.dynamicPlace = null;
				}
			);
			this.cloneFunctions.push(
				function(control)
				{
					control.delimiter = this.delimiter;
				}
			);
		},
		toString: function()
		{
			return "rs.set";
		},
		getStaticText: function(v)
		{
			v = v || "";
			v = v.replace(/[ ]*;[ ]*/g,';');
			
			var set = [];
			var keys = (v || '').split(this.delimiter);
			for (var i=0; i<keys.length; i++)
			{
				var option = this.getOptionByValue(v);
				if (!rs.utils.object_isEmpty(option))
				{
					set.push(option['v']);
				}
			}
			return set.join(this.delimiter);
		},
		getDynamicContent: function()
		{
			this.dom.dynamicPlace = document.createElement('div');
			this.dom.dynamicPlace.style.whiteSpace = "normal";
			this.setOptions(this.dom.options);
			return this.dom.dynamicPlace;
		},
		setOptions: function(options)
		{
			this.dom.dynamicPlace.innerHTML = "";
			this.dom.checkBoxes = {};
			for (var i = 0; i < options.length; i++)
			{
				var option = options[i];
				var label = document.createElement("label");
				label.style.whiteSpace = "nowrap";
				label.style.margin = "0 1ex 0 0";

				var checkbox = document.createElement("input");
				this.dom.disableElements.push(checkbox);
				checkbox.type = "checkbox";
				checkbox.onclick = this.getExecWithInstanceHandler(this.refresh);
				checkbox.style.margin = "1px 0";
				label.appendChild(checkbox);
				this.dom.checkBoxes[option['k']] = checkbox;

				var text = document.createTextNode(" " + option['v']);
				label.appendChild(text);

				if(!this.inline)
				{
					this.dom.dynamicPlace.appendChild(document.createElement('br'));
				}

				this.dom.dynamicPlace.appendChild(label);
			}
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			var set = [];
			for (var key in this.dom.checkBoxes)
			{
				if (this.dom.checkBoxes[key].checked)
				{
					set.push(key);
				}
			}
			this.dom.value = set.join(this.delimiter);
		},
		setValue: function(v)
		{
			v = v || "";
			var r = new RegExp('[ ]*' + this.delimiter + '[ ]*', 'g');
			v = v.replace(r, this.delimiter);
			if (this.setStaticValue(v)) return;
			v = this.delimiter + v + this.delimiter;
			for (var key in this.dom.checkBoxes)
			{
				this.dom.checkBoxes[key].checked = (v.indexOf(this.delimiter + key + this.delimiter) >= 0);
			}
			this.refresh();
		}
	}
);


//----------------------------------------------------------------------------------------------
// rs.arrangebox
//

rs.arrangebox = newClass
(
	rs.set,
	{
		constructor: function()
		{
			rs.set.call(this);
			
			this.addInit(
				function()
				{
					/*DOM Elements*/
					this.dom.set = [];
					this.dom.lookup_index = [];
				}
			);
			this.cloneFunctions.push(
				function(control)
				{
					control.keepSort = this.keepSort;
				}
			);
			
			this.qsearch = false;
			this.qsearchTimeout = 500;
			this.keepSort = false;
			this.delimiter = ";";
			this.selectSize = 10;
			this.staticMaxCount = 10;
		},
		toString: function()
		{
			return "rs.arrangebox";
		},
		initQSearch: function()
		{
			if(this.qsearch)
			{
				this.dom.qsearch = {};
				this.dom.qsearch.all = {};
				this.dom.qsearch.selected = {};
				this.dom.qsearch.all.getOptions = function()
				{
					var options = [];
					var v = ';' + this.dom.value + ';'
					for(var i = 0; i < this.dom.options.length; i++)
					{
						if(v.search(this.dom.options[i]['k']) == -1)
						{
							options.push(this.dom.options[i]);
						}
					}
					return options;
				}
				this.dom.qsearch.selected.getOptions = function()
				{
					var options = [];
					for(var i = 0; i < this.dom.set.length; i++)
					{
						var option = this.findLookupMembers('k', this.dom.set[i]);
						if(option.length)
						{
							options.push(option.pop());
						}
					}
					return options;
				}
			}
		},
		getStaticText: function(v)
		{
			var set = [];
			var keys = (v || '').split(this.delimiter);
			for (var i=0; i<keys.length; i++)
			{
				var option = this.getOptionByValue(v);
				if (!rs.utils.object_isEmpty(option))
				{
					set.push(option['v']);
				}
			}
			return set.join(this.delimiter);
		},
		getUL: function(keys, length)
		{
			length = length || keys.length;
			length = length > keys.length ? keys.length : length;
			var ul = document.createElement('ul');
			for (var i = 0; i < length; i++)
			{
				var key = keys[i];
				var option = this.getOptionByValue(key);
				var value = option['v'];
				if (value != null)
				{
					var li = document.createElement('li');
					if (option['s'])
					{
						li.className = option['s'];
					}
					li.appendChild(document.createTextNode(value));
					ul.appendChild(li);
				}
			}
			return ul;
		},
		getStaticContent: function(v)
		{
			var span = document.createElement('span');
			span.className = 'ctl-arrangebox';
			if(v)
			{
				var keys = (v || '').split(this.delimiter);
			}
			else
			{
				return span;
			}
			if(keys.length > 1)
			{
				var ulContainer = document.createElement('div');
				ulContainer.appendChild(this.getUL(keys, this.staticMaxCount));
				span.appendChild(ulContainer);
				
				if(keys.length > this.staticMaxCount)
				{
					var expand = document.createElement('div');
					expand.className = 'expand';
					
					var createArrows = function(type)
					{
						expand.innerHTML = '';
						for(var i = 0; i < 3; i++)
						{
							var img = document.createElement('img');
							img.src = 'img/0.gif';
							img.className = type;
							expand.appendChild(img);
						}
					}
					createArrows('sprite_arrowDown');
					
					var collapseHandler;
					
					var expandHandler = function(e)
					{
						rs.utils.bubbleEvent(e);
						ulContainer.innerHTML = '';
						ulContainer.appendChild(this.getUL(keys));
						createArrows('sprite_arrowUp');
						expand.onclick = this.getExecWithInstanceHandler(collapseHandler);
					}.bind(this);
					
					collapseHandler = function(e)
					{
						rs.utils.bubbleEvent(e);
						ulContainer.innerHTML = '';
						ulContainer.appendChild(this.getUL(keys, this.staticMaxCount));
						createArrows('sprite_arrowDown');
						expand.onclick = this.getExecWithInstanceHandler(expandHandler);
					}.bind(this);
					
					expand.onclick = this.getExecWithInstanceHandler(expandHandler);
					
					span.appendChild(expand);
				}
			}
			else
			{
				var key = keys.pop();
				var option = this.getOptionByValue(key);
				if(option['s'])
				{
					dom.addClass(span, option['s']);
				}
				span.appendChild(document.createTextNode(option['v']));
			}
			return span;
		},
		createDynamic: function(e)
		{
			this.dom.place.appendChild(this.getDynamicContent());
			e.appendChild(this.dom.place);
			this.dom.mode = "dynamic";
			this.setValue([]);
		},
		getQSearchInputHandler: function(type)
		{
			if(this.qsearch)
			{
				var self = this;
				return function()
				{
					self.dom.qsearch[type].modified = true;
					if(!self.dom.qsearch[type].run)
					{
						self.qSearchRefresh(type);
					}
				}
			}
			else
			{
				return null;
			}
		},
		qSearchRefresh: function(type)
		{
			if(this.qsearch)
			{
				this.dom.qsearch[type].run = true;
				if(this.dom.qsearch[type].modified)
				{
					this.dom.qsearch[type].modified = false;
					var self = this;
					var f = function()
					{
						self.qSearchRefresh(type);
					}
					setTimeout(f, this.qsearchTimeout);
					return;
				}
				removeAllOptions(this.dom.qsearch[type].select);
				var rgxp = new RegExp(
					(this.dom.qsearch[type].active ? this.dom.qsearch[type].input.value : '.*'),
					'gi'
				);
				var options = this.dom.qsearch[type].getOptions.call(this);
				for(var i = 0; i < options.length; i++)
				{
					if(options[i]['v'].search(rgxp) > -1)
					{
						addOption(this.dom.qsearch[type].select, options[i]['v'], options[i]['k'], false);
					}
				}
				this.dom.qsearch[type].run = false;
			}
			else
			{
				return null
			}
		},
		getQSearchFocusHandler: function(type)
		{
			if(this.qsearch)
			{
				var self = this;
				return function()
				{
					var input = self.dom.qsearch[type].input;
					if(input.className == 'inactive')
					{
						input.className = '';
						input.value = '';
						self.dom.qsearch[type].active = true;
					}
				}
			}
			else
			{
				return null;
			}
		},
		getQSearchBlurHandler: function(type)
		{
			if(this.qsearch)
			{
				var self = this;
				return function()
				{
					var input = self.dom.qsearch[type].input;
					if(input.className == '' && input.value == '')
					{
						input.className = 'inactive';
						input.value = 'Quick search...';
						self.dom.qsearch[type].active = false;
					}
				}
			}
			else
			{
				return null;
			}
		},
		getDynamicContent: function()
		{
			this.initQSearch();
			if (this.keepSort)
			{
				this.createLookupSortIndex();
			}

			// Table
			var table = document.createElement("table");
			table.className = "ctl-arrangebox";
			
			// Quick search
			if(this.qsearch)
			{
				var tr = table.insertRow(0);
				
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.onfocus = this.getQSearchFocusHandler('all');
				input.onblur = this.getQSearchBlurHandler('all');
				input.onkeyup = this.getQSearchInputHandler('all')
				if(this.qsearch)
				{
					this.dom.qsearch['all'].options = this.dom.options;
					this.dom.qsearch['all'].input = input;
				}
				input.value = 'Quick search...';
				input.className = 'inactive';
				td.appendChild(input);
				
				var td = tr.insertCell(tr.cells.length);
				
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.onfocus = this.getQSearchFocusHandler('selected');
				input.onblur = this.getQSearchBlurHandler('selected');
				input.onkeyup = this.getQSearchInputHandler('selected');
				if(this.qsearch)
				{
					this.dom.qsearch['selected'].input = input;
				}
				input.value = 'Quick search...';
				input.className = 'inactive';
				td.appendChild(input);
			}
			
			// Body
			var tr = table.insertRow(table.rows.length);

			// Select 1
			var td = tr.insertCell(0);
			td.rowSpan = 2;

			var select1 = document.createElement("select");
			this.dom.disableElements.push(select1);
			if(this.qsearch)
			{
				this.dom.qsearch['all'].select = select1;
			}
			select1.multiple = true;
			select1.size = this.selectSize;
			select1.ondblclick = this.getExecWithInstanceHandler(this.addSelected);
			td.appendChild(select1);

			// Add/remove buttons
			var td = tr.insertCell(1);
			td.style.width = "0px";
			td.style.verticalAlign = "top";
			var input = document.createElement("input");
			this.dom.disableElements.push(input);
			input.type = "button";
			input.value = ">>";
			input.style.width = "8ex";
			input.onclick = this.getExecWithInstanceHandler(this.addAll);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			this.dom.disableElements.push(input);
			input.type = "button";
			input.value = ">";
			input.style.width = "8ex";
			input.onclick = this.getExecWithInstanceHandler(this.addSelected);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			this.dom.disableElements.push(input);
			input.type = "button";
			input.value = "<";
			input.style.width = "8ex";
			input.onclick = this.getExecWithInstanceHandler(this.removeSelected);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			this.dom.disableElements.push(input);
			input.type = "button";
			input.value = "<<";
			input.style.width = "8ex";
			input.onclick = this.getExecWithInstanceHandler(this.removeAll);
			td.appendChild(input);

			// Select 2
			var td = tr.insertCell(2);
			td.rowSpan = 2;
			var select2 = document.createElement("select");
			if(this.qsearch)
			{
				this.dom.qsearch['selected'].select = select2;
			}
			this.dom.disableElements.push(select2);
			select2.multiple = true;
			select2.size = this.selectSize;
			select2.ondblclick = this.getExecWithInstanceHandler(this.removeSelected);
			td.appendChild(select2);

			// Move up/move down buttons
			if (!this.keepSort)
			{
				var tr = table.insertRow(table.rows.length);
				tr.style.height = "0%";
				var td = tr.insertCell(0);
				td.style.width = "0px";
				td.style.verticalAlign = "bottom";
				var input = document.createElement("input");
				this.dom.disableElements.push(input);
				input.type = "button";
				input.value = '\u2191';
				input.style.width = "8ex";
				input.onclick = this.getExecWithInstanceHandler(this.moveUpSelected);
				td.appendChild(input);
				td.appendChild(document.createElement("br"));
				var input = document.createElement("input");
				this.dom.disableElements.push(input);
				input.type = "button";
				input.value = '\u2193';
				input.style.width = "8ex";
				input.onclick = this.getExecWithInstanceHandler(this.moveDownSelected);
				td.appendChild(input);
				td.appendChild(document.createElement("br"));
			}

			this.dom.select1 = select1;
			this.dom.select2 = select2;
			
			return table;
		},
		applyOptionStyles: function(select)
		{
			for (var i = select.options.length-1; i>=0; i--)
			{
				var option = select.options[i];
				var lookupOption = this.getOptionByValue(option.value);
				if (lookupOption['s'])
				{
					option.className = lookupOption['s'];
				}
			}
		},
		createLookupSortIndex: function()
		{
			for (var num = 0; num < this.dom.options.length; num++)
			{
				this.dom.lookup_index[this.dom.options[num]['k']] = num;
			}

			this.sortLookupFunc = function(a, b)
			{
				var a_index = this.dom.lookup_index[a.value];
				var b_index = this.dom.lookup_index[b.value];
				if (a_index < b_index)
				{
					return -1;
				}
				if (a_index > b_index)
				{
					return 1;
				}
				return 0;
			}.bind(this);
		},
		sortLookup: function()
		{
			sortSelect(this.dom.select1, this.sortLookupFunc);
			sortSelect(this.dom.select2, this.sortLookupFunc);
		},
		setLookupParam: function(param)
		{
			if(param == null)
			{
				return;
			}
			this.dom.options = this.findLookupMembers('p', param);
			// For reCreate. If this.dom.value not changed control cannot recreate
			this.dom.value = null;
			this.setValue(this.dom.initValue);
		},
		setOptions: function(options)
		{
		},
		syncValue: function()
		{
			this.dom.set = [];
			for (var i=0; i<this.dom.select2.options.length; i++)
			{
				this.dom.set.push(this.dom.select2.options[i].value);
			}
			this.dom.value = this.dom.set.join(this.delimiter);
			this.handleEvent('onChange', [this, this.dom.value]);
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.syncValue();
		},
		setValue: function(v)
		{
			v = v || '';
			var set = v instanceof Array ? v : v.toString().split(this.delimiter);
			this.dom.set = set;
			if (this.setStaticValue(v instanceof Array ? v.join(this.delimiter) : v)) return;

			var select1 = this.dom.select1;
			var select2 = this.dom.select2;

			// Clear select1 and select2
			removeAllOptions(select1);
			removeAllOptions(select2);

			// Fill in select1
			for (var i = 0; i < this.dom.options.length; i++)
			{
				if (rs.utils.array_find(set, this.dom.options[i]['k']) < 0)
				{
					addOption(select1, this.dom.options[i]['v'], this.dom.options[i]['k'], false);
				}
			}

			// Fill in select2
			for (var i=0; i<set.length; i++)
			{
				var option = this.getOptionByValue(set[i]);
				if (!rs.utils.object_isEmpty(option))
				{
					addOption(select2, option['v'], option['k'], false);
				}
			}
			
			this.syncValue();
			
			this.qSearchRefresh('all');
			this.qSearchRefresh('selected');

			this.applyOptionStyles(select1);
			this.applyOptionStyles(select2);
			this.refresh();
		},
		addAll: function()
		{
			moveAllOptions(this.dom.select1, this.dom.select2, false);
			this.syncValue();
			this.qSearchRefresh('selected');
			if (this.keepSort)
			{
				this.sortLookup();
			}
		},
		removeAll: function()
		{
			// Move all options from select2 into select1
			moveAllOptions(this.dom.select2, this.dom.select1, false);
			this.syncValue();
			this.qSearchRefresh('all');
			if (this.keepSort)
			{
				this.sortLookup();
			}
		},
		addSelected: function()
		{
			// Move selected option from select1 into select2
			var selectedIndex = this.dom.select1.selectedIndex;
			moveSelectedOptions(this.dom.select1, this.dom.select2, false);
			this.syncValue();
			this.qSearchRefresh('all');
			this.qSearchRefresh('selected');
			if (this.keepSort)
			{
				this.sortLookup();
			}
			if(selectedIndex >= 0 && this.dom.select1.options[selectedIndex])
			{
				this.dom.select1.selectedIndex = selectedIndex;
			}
		},
		removeSelected: function()
		{
			// Move selected option from select2 into select1
			var selectedIndex = this.dom.select2.selectedIndex;
			moveSelectedOptions(this.dom.select2, this.dom.select1, false);
			this.syncValue();
			this.qSearchRefresh('all');
			this.qSearchRefresh('selected');
			if (this.keepSort)
			{
				this.sortLookup();
			}

			if (selectedIndex >= 0 && this.dom.select2.options[selectedIndex])
			{
				this.dom.select2.selectedIndex = selectedIndex;
			}
		},
		moveUpSelected: function()
		{
			// Move selected option up in select2
			moveOptionUp(this.dom.select2);
			this.syncValue();
		},
		moveDownSelected: function()
		{
			// Move selected option down in select2
			moveOptionDown(this.dom.select2);
			this.syncValue();
		}
	}
);


//----------------------------------------------------------------------------------------------
// rs.bitmask
//

rs.bitmask = newClass
(
	rs.set,
	{
		constructor: function()
		{
			rs.set.call(this);
		},
		toString: function()
		{
			return "rs.bitmask";
		},
		getStaticText: function(v)
		{
			v = v || 0;
			var set = [];
			for (var i = 0; i < this.dom.options.length; i++)
			{
				if (v & this.dom.options[i]['k'])
				{
					set.push(this.dom.options[i]['v']);
				}
			}
			return set.join(this.delimiter);
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = 0;
			for (var key in this.dom.checkBoxes)
			{
				if (this.dom.checkBoxes[key].checked)
				{
					this.dom.value |= key;
				}
			}
		},
		setValue: function(v)
		{
			v = v || 0;
			if (this.setStaticValue(v)) return;
			for (var key in this.dom.checkBoxes)
			{
				this.dom.checkBoxes[key].checked = ((v & key) != 0);
			}
			this.refresh();
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.year
//

rs.year = newClass
(
		rs.control,
		{
				constructor: function()
				{
						rs.control.call(this);
						this.step = 1;
						this.delay = 120;
				},
				toString: function()
				{
						return "rs.year";
				},
				createDynamic: function(e)
				{
						var input = document.createElement("input");
						input.type = "text";
						input.size = this.size;
						input.maxLength = this.size;
						this.dom.value = input.value;
						input.onchange = this.change.bind(this).createCaller();
						input.onblur = this.change.bind(this).createCaller();

						var left = document.createElement("input");
						left.type = "button";
						left.value = "<";
						left.style.width = "15px";
						left.onmousedown = this.startTimerLeft.bind(this).createCaller();
						left.onmouseup = this.stopTimer.bind(this).createCaller();
						left.onmouseout = this.stopTimer.bind(this).createCaller();
						left.onblur = this.stopTimer.bind(this).createCaller();
						left.onclick = this.decriment.bind(this).createCaller();
						if(IS_MSIE && !IS_OPERA)
							left.ondblclick = this.decriment.bind(this).createCaller();

						var right = document.createElement("input");
						right.type = "button";
						right.value = ">";
						right.style.width = "15px";
						right.onmousedown = this.startTimerRight.bind(this).createCaller();
						right.onmouseup = this.stopTimer.bind(this).createCaller();
						right.onmouseout = this.stopTimer.bind(this).createCaller();
						right.onblur = this.stopTimer.bind(this).createCaller();
						right.onclick = this.increment.bind(this).createCaller();
						if(IS_MSIE && !IS_OPERA)
							right.ondblclick = this.increment.bind(this).createCaller();

						this.dom.input = input;
						this.dom.left = left;
						this.dom.right = right;

						e.appendChild(left);
						e.appendChild(input);
						e.appendChild(right);

						this.refresh();
				},
				decriment: function()
				{
						var input = this.dom.input;
						input.value -= this.step;

						if(input.value < this.min)
							input.value = this.max;

						this.change();

				},
				increment: function()
				{
						var input = this.dom.input;
						input.value = parseInt(input.value) + this.step;

						if(parseInt(input.value) > this.max)
							input.value = this.min;

						this.change();
				},
				startTimerLeft: function()
				{
						this.stopTimer();
				  		this.timer2 = setTimeout(this.startDecriment.bind(this), 250);
				},
				startTimerRight: function()
				{
						this.stopTimer();
						this.timer2 = setTimeout(this.startIncrement.bind(this), 250);
				},
				startIncrement: function()
				{
						this.timer = setInterval(this.increment.bind(this), this.delay);
				},
				startDecriment: function()
				{
						this.timer = setInterval(this.decriment.bind(this), this.delay);
				},
				stopTimer: function()
				{
						if(this.timer2)
							clearTimeout(this.timer2);
						if(this.timer)
							clearInterval(this.timer);
				},
				change: function()
				{
						var input = this.dom.input;
						var reg="^(";
						for (var value=this.min; value<=this.max; value++)
						{
								 reg += value;
								 if(value!=this.max)
								 	reg += "|";
						}
						reg+=")$";
						var regular = new RegExp(reg);

						if(regular.test(input.value)==false)
								 input.value=input.previous;
						else
								 input.previous=input.value;
						this.dom.value=input.value;

						this.handleEvent('onChange');
				},
				getValue: function()
				{
						this.dom.value = this.dom.input.value;
				},
				setValue: function(v)
				{
						this.dom.input.value = this.dom.input.previous = v || "";
						this.refresh();
				}
		}
);

//----------------------------------------------------------------------------------------------
// rs.days
//
rs.days = newClass
(
		rs.control,
		{
				constructor: function()
				{
						rs.control.call(this);
						this.currentDate = new Date();
						this.onlyWeeks = false;

						this.yearControl = {};
						this.monthControl = {};

						this.lookup = [
							rs.s('datebox.w.mon','Mon'),
							rs.s('datebox.w.tue','Tue'),
							rs.s('datebox.w.wed','Wed'),
							rs.s('datebox.w.thu','Thu'),
							rs.s('datebox.w.fri','Fri'),
							rs.s('datebox.w.sat','Sat'),
							rs.s('datebox.w.sun','Sun')
						];
						this.redDays = [0,0,0,0,0,1,1];
						this.weekFrom = 0;	  //0 - Mon; 6 - Sun

						this.days = {};

				},
				toString: function()
				{
						return "rs.days";
				},
				createDynamic: function(e)
				{

						var unitLookup = [0,0,0,0,0,0,0];
						var redDays = [0,0,0,0,0,0,0];
						for(var i=0, j=0; i<7; i++)
						{
							unitLookup[i] = this.lookup[j+this.weekFrom];
							redDays[i] = this.redDays[j+this.weekFrom];
							//window.alert(temp[i]+" "+ this.lookup[j+this.weekFrom]);
							if(j+this.weekFrom==6)
								j=-this.weekFrom;
							else
								j++;
						}


						var table = document.createElement("table");
						this.dom.table = table;
						table.className = "day";
						table.style.width = "160px";
						table.cellSpacing = 0;
						table.cellPadding = 0;

						var tr = table.insertRow(table.rows.length);
						var td = tr.insertCell(tr.cells.length);

						for (var value=1; value<=7; value++)
						{
							var td = tr.insertCell(tr.cells.length);
							td.style.width=(100/8)+"%";
							td.appendChild(document.createTextNode(unitLookup[value-1]));
							if(redDays[value-1]==1)
							{
								td.suit = "red";
								td.className = "red";
							}
							if(this.onlyWeeks)
							{
								td.value = value;

								td.value+=this.weekFrom;
								if(td.value>7)
									td.value-=7;

								this.days[value] = td;
								td.onclick=this.selectDay.bind(this).createCaller(this.days[value]);
							}
						}
						if(!this.onlyWeeks)
						{
							for(var i=0; i<=5; i++)
							{
								var tr = table.insertRow(table.rows.length);
								var td = tr.insertCell(tr.cells.length);
								td.appendChild(document.createTextNode(" "));
								this.days[i] = {};
								this.days[i][0] = td;

								for(var j=1; j<=7; j++)
								{
									var td = tr.insertCell(tr.cells.length);
									td.suit = "day";
									if(i==0)
										td.suit = "top";
									if(j==7)
										td.suit = "right";
									if(j==1)
										td.suit = "left";
									if(i==5)
										td.suit = "bottom";
									if(j==7 && i==5)
										td.suit = "right bottom";
									if(j==7 && i==0)
										td.suit = "right top";
									if(j==1 && i==0)
										td.suit = "left top";
									if(j==1 && i==5)
										td.suit = "left bottom";
									if(redDays[j-1]==1)
										td.suit += " red";

									td.appendChild(document.createTextNode(" "));
									this.days[i][j] = td;
								}
							}
						}

						e.appendChild(table);
						this.refresh();
				},
				getDay: function(year, month, day)
				{
					if(month>12)
						return this.getDay(parseInt(year)+1, month-12, day);
					if(month<=0)
						return this.getDay(parseInt(year)-1, month+12, day);

					var firstDate = new Date(year,month-1,day);
					var firstDay = firstDate.getDay();
					firstDay-=this.weekFrom;
					if(firstDay<=0)
						firstDay+=7;
					return firstDay;
				},
				getLenghtDay: function(year, month, day)
				{
					if(month>12)
						return this.getLenghtDay(parseInt(year)+1, month-12, day);
					if(month<=0)
						return this.getLenghtDay(parseInt(year)-1, month+12, day);

					var oneDay = 1000 * 60 * 60 * 24;
					var firstDate = new Date(year,month-1,1);
					var lastDate = new Date(year,month,1);
					var lenghtDay = Math.ceil((lastDate.getTime() - firstDate.getTime())/oneDay);
					if(lenghtDay>31)
						lenghtDay=31;
					return lenghtDay;
				},
				getNumberWeek: function(year, month, day)
				{
					if(month>12)
						return this.getNumberWeek(parseInt(year)+1, month-12, day);
					if(month<=0)
						return this.getNumberWeek(parseInt(year)-1, month+12, day);
					var oneDay = 1000 * 60 * 60 * 24;
					var firstDate = new Date(year,month-1,1);
					var lastDate = new Date(year,0,1);
					var days = Math.ceil((firstDate.getTime() - lastDate.getTime())/oneDay);

					var middle = ((3 - this.weekFrom)<0 ? (3 - this.weekFrom +7) : (3 - this.weekFrom))+1//4;
					var janDay = this.getDay(year, 1, 1);
					var decDay = this.getDay(year, 12, 31);
					var leftWeek = (janDay > middle) ? 0 : 1;
					var rightWeek = (decDay < middle) ? 0 : 1;
					var firstWeek = Math.floor((days - (8-janDay))/7)+1;

					firstWeek += leftWeek;

					var firstDay = this.getDay(year, month, 1);
					var daySum=day+firstDay-2;
					firstWeek+=Math.floor(daySum/7);

					if(month == 1 && Math.floor(daySum/7)==0 && leftWeek==0)
						firstWeek = this.getNumberWeek(year-1, 12, 31);

					if(month == 12 && day>31-7 && rightWeek==0)
						firstWeek = 1;


					return firstWeek<10 ? "0"+firstWeek: firstWeek;
				},
				refreshDays: function()
				{
					var day = this.days;
					if(this.onlyWeeks)
					{
						for(var value = 1; value<=7; value++)
						{
							day[value].className = day[value].suit;

							if(day[value].value == this.dom.value)
								this.days[value].className += " select";
						}
						return;
					}

					var firstDay = this.getDay(this.year, this.month, 1);
					var lenghtDay = this.getLenghtDay(this.year, this.month, day);
					if(this.dom.value>lenghtDay)
						this.dom.value = lenghtDay;
					var firstWeek = this.getNumberWeek(this.year, this.month, 1);

			//currentDate
					var currentMonth = this.currentDate.getMonth()+1;
					var currentYear = this.currentDate.getFullYear();
					if(currentMonth == this.month && currentYear == this.year)
						var currentDay = this.currentDate.getDate();
					else
						var currentDay = 0;

					var countPrev = this.getLenghtDay(this.year, this.month-1);
					countPrev=countPrev-firstDay+2;
					if(firstDay==this.weekFrom + 1)
						countPrev-=7;

					var countNext=1;
					var count=1;
					for(var i=0; i<=5; i++)
					{
						if(count>lenghtDay)
						{
							day[i][0].replaceChild(document.createTextNode(this.getNumberWeek(this.year, parseInt(this.month) + 1, countNext)), day[i][0].firstChild);
						}
						else if(countPrev<=this.getLenghtDay(this.year, this.month-1))
							day[i][0].replaceChild(document.createTextNode(this.getNumberWeek(this.year, parseInt(this.month) - 1, countPrev)), day[i][0].firstChild);
						else
							day[i][0].replaceChild(document.createTextNode(this.getNumberWeek(this.year, parseInt(this.month), count)), day[i][0].firstChild);
						firstWeek++;
						day[i][0].className = day[i][0].suit;
						for(var j=1; j<=7; j++)
						{
					  		day[i][j].className = day[i][j].suit;
							if( countPrev<=this.getLenghtDay(this.year, this.month-1))
							{
								day[i][j].replaceChild(document.createTextNode(countPrev), day[i][j].firstChild);
								day[i][j].value=countPrev;
								countPrev++;
								if(new String(day[i][j].suit).search("red")>0)
									day[i][j].className += " light-red";
								else
									day[i][j].className += " light";
								day[i][j].onclick=this.previousMonth.bind(this).createCaller(day[i][j]);

							}
							else if(count>lenghtDay)
							{
								day[i][j].replaceChild(document.createTextNode(countNext), day[i][j].firstChild);
								day[i][j].value=countNext;
								countNext++;
								if(new String(day[i][j].suit).search("red")>0)
									day[i][j].className += " light-red";
								else
									day[i][j].className += " light";
								day[i][j].onclick=this.nextMonth.bind(this).createCaller(day[i][j]);
							}
							else if(count<=lenghtDay)
							{
								day[i][j].value=count;
								day[i][j].replaceChild(document.createTextNode(count), day[i][j].firstChild);
								if(count == this.dom.value)
									day[i][j].className += " select";
								if(count == currentDay)
									day[i][j].className += " current";
								count++;
								day[i][j].onclick=this.selectDay.bind(this).createCaller(day[i][j]);
							}
					  	}
					}
				},
				selectDay: function()
				{
						this.setValue(arguments[0].value);
						this.refreshDays();
				},
				nextMonth: function()
				{
						this.dom.value = arguments[0].value;
						if(this.month==12)
						{
							this.yearControl.increment();
							this.month = 1;
						}
						else
							this.month++;
						this.monthControl.setValue(this.month);


						this.refreshDays();
				},
				previousMonth: function()
				{
						this.dom.value = arguments[0].value;
						if(this.month==1)
						{
							this.yearControl.decriment();
							this.month = 12;
						}
						else
							this.month--;
						this.monthControl.setValue(this.month);
						this.refreshDays();
				},
				setValue: function(v)
				{
						this.dom.value = v || "";
						this.refreshDays();
						this.refresh();
				}
		}
);


//----------------------------------------------------------------------------------------------
// rs.datebox
//

rs.datebox = newClass
(
	rs.control,
		{
				constructor: function()
				{
						rs.control.call(this);
						this.valueFormat = "YMDhms";
						this.displayFormat = "Y-M-D h:m:s";
						this.useLookup = true;
						this.warning = true;
						this.warningMessage = rs.s('datebox.warning','Invalid date');
						this.addInit(
							function()
							{
								this.dom.popup = new rs.popup();
								this.dom.popup.dom.content.onclick = function(e)
								{
									rs.utils.bubbleEvent(e);
									return;
								}
								this.dom.popup.dom.content.onmouseover = this.getExecWithInstanceHandler(this.handler_onmouseover);
								this.dom.popup.dom.content.onmouseout = this.getExecWithInstanceHandler(this.handler_onmouseout);
							}
						);
						this.cloneFunctions.push(
							function(control)
							{
								control.valueFormat = this.valueFormat;
								control.displayFormat = this.displayFormat;
							}
						);
				},
				toString: function()
				{
						return "rs.datebox";
				},
				focus: function()
				{
					if (this.dom.input && this.dom.input.focus)
					{
						this.dom.input.focus();
					}
				},
				units:
				{
						Y: [4,	2000,	2099,		'YYYY',		'Year'],
						M: [2,	1,		12,			'MM',		'Month'],
						D: [2,	1,		31,			'DD',		'Day'],
						W: [1,	1,		7,			'W',		'Weekday'],
						h: [2,	0,		23,			'hh',		'Hour'],
						m: [2,	0,		59,			'mm',		'Minute'],
						s: [2,	0,		59,			'ss',		'Second'],
						3: [3,	0,		999,		'fff',		'Millisecond'],
						6: [6,	0,		999999,		'ffffff',	'Microsecond'],
						u: [10,	0,		9999999999,	'u',		'Timestamp']
				},
				unitsLookup:
				{
						M: [
							rs.s('datebox.m.january','January'),
							rs.s('datebox.m.february','February'),
							rs.s('datebox.m.march','March'),
							rs.s('datebox.m.april','April'),
							rs.s('datebox.m.may','May'),
							rs.s('datebox.m.june','June'),
							rs.s('datebox.m.july','July'),
							rs.s('datebox.m.august','August'),
							rs.s('datebox.m.september','September'),
							rs.s('datebox.m.october','October'),
							rs.s('datebox.m.november','November'),
							rs.s('datebox.m.december','December')
						],
						W: [
							rs.s('datebox.w.mon','Mon'),
							rs.s('datebox.w.tue','Tue'),
							rs.s('datebox.w.wed','Wed'),
							rs.s('datebox.w.thu','Thu'),
							rs.s('datebox.w.fri','Fri'),
							rs.s('datebox.w.sat','Sat'),
							rs.s('datebox.w.sun','Sun')
						]
				},
				getFormatDesc: function(format, useLookup)
				{
						var desc = '';
						for (var i = 0; i < format.length; i++)
						{
							var cf = format.charAt(i);
							var unit = this.units[cf];
							desc += unit ? (useLookup && this.unitsLookup[cf] ? unit[4] : unit[3]) : cf;
						}
						return desc;
				},
				getDisplayFormatDesc: function()
				{
						return this.displayFormat;
				},
				parseDate: function(string, format, useLookup)
				{
						var date = {};

						if (format == 'u')
						{
							if ((string != null) && (string != ''))
							{
								var mcs = parseInt(string, 10);
								var ms = Math.floor(mcs/1000);
								var d = new Date(ms);
								date['Y'] = d.getFullYear();
								date['M'] = d.getMonth() + 1;
								date['D'] = d.getDate();
								date['h'] = d.getHours();
								date['m'] = d.getMinutes();
								date['s'] = d.getSeconds();
								date['3'] = d.getMilliseconds();
								date['6'] = mcs % 1000000;
								return date;
							}
							return null;
						}

						var j = 0;
						for(var i = 0; i < format.length; i++)
						{
							var cf = format.charAt(i);
							var c = string.charAt(j);
							var unit = this.units[cf];
							if(unit)
							{
								date[cf] = "";
								if(c == " ")
								{
									while(string.charAt(j)==" ")
									{
										j++;
									}
									c = string.charAt(j);
								}
								//alert(j+" - "+string.length);
								if(j == string.length)
								{
									date[cf] = unit[1];
									for(var k = 0; k < unit[0]-1;k++)
									{
										date[cf] = "0" + date[cf];
									}
									continue;
								}
								var unitLookup = useLookup? this.unitsLookup[cf]: null;
								if(unitLookup)
								{
									//alert(cf);
									var used = false;
									for(var k = 0; k < unitLookup.length; k++)
									{
										var size = unitLookup[k].length;
										//alert(string.substring(j, j + size));
										if(string.substring(j, j + size).toUpperCase() == unitLookup[k].toUpperCase())
										{
											date[cf] = k + 1;
											j += size;
											used = true;
											break;
										}

									}
									if(used)
									{
										continue;
									}

								}

								var size = unit[0];
								for(var k = 0; k < size; k++, j++)
								{
									c = string.charAt(j);
									//alert(c+" - "+parseInt(c));
									if(!isNaN(parseInt(c, 10)))
									{
										date[cf] += c;
									}
									else if(k == 0)
									{
										//alert("Wrong date!");
										if(format == this.displayFormat)
											return null;
										return this.parseDate(string, this.displayFormat, useLookup);
									}
									else
									{
										for(;k < size; k++)
										{
											date[cf] = "0"+date[cf];
										}
										break;
									}
								}
								if(date[cf] < unit[1] || date[cf] > unit[2])
								{
									//alert("Wrong date!");
									if(format == this.displayFormat)
										return null;
									return this.parseDate(string, this.displayFormat, useLookup);
								}

							}
							else
							{
								if(j == string.length)
								{
									continue;
								}
								if(c==cf)
								{
									j++;
								}
								else if(c==" ")
								{
									while(string.charAt(j++) == " ");
									c = string.charAt(j-1);
									if(c != cf)
									{
										//alert("wrong date!");
										if(format == this.displayFormat)
											return null;
										return this.parseDate(string, this.displayFormat, useLookup);
									}
								}
								else
								{
									//alert("wrong date!");
									if(format == this.displayFormat)
										return null;
									return this.parseDate(string, this.displayFormat, useLookup);
								}
							}
						}
						if(j <= string.length)
						{
							while(string.charAt(j++) == " ");
							if(j <= string.length)
							{
								//alert("wrong date!");
								if(format == this.displayFormat)
									return null;
								return this.parseDate(string, this.displayFormat, useLookup);
							}
						}

						for (var c in this.units)
						{
							if (date[c] == null)
							{
								date[c] = this.units[c][1];
							}
						}

						return date;
				},
				formatDate: function(date, format, useLookup)
				{
						var string = "";

						for (var c in this.units)
						{
							if (date[c] == null)
							{
								date[c] = this.units[c][1];
							}
						}

						if (format == 'u')
						{
							var d = new Date();
							d.setFullYear(date['Y']);
							d.setMonth(date['M'] - 1);
							d.setDate(date['D']);
							d.setHours(date['h']);
							d.setMinutes(date['m']);
							d.setSeconds(date['s']);
							var ms = d.getTime();
							string = Math.floor(d.getTime()/1000) * 1000000 + date['6'];
						}
						else
						{
							for (var i=0; i<format.length; i++)
							{
								var c = format.charAt(i);
								var unit = this.units[c];
								if (unit)
								{
									var size = unit[0];
									var min = unit[1];
									var value = date[c] == null? min: date[c];
									var unitLookup = useLookup? this.unitsLookup[c]: null;
									string += unitLookup? unitLookup[value - min]: value.toString().padLeft(size, "0");
								}
								else
								{
									string += c;
								}
							}
						}

						return string;
				},
				getStaticText: function(v)
				{
						if(v)
						{
							var date = this.parseDate(v, this.valueFormat);
							if(date == null)
							{
								return v;
							}
							else
							{
								return this.formatDate(date, this.displayFormat, true);
							}
						}
						else
						{
							return '';
						}
				},
				disableDynamic: function(param)
				{
					var input = this.dom.disableElements[0];
					input.disabled = param;
					if(param)
					{
						input.onclick = '';
					}
					else
					{
						input.onclick = this.getExecWithInstanceHandler(this.show(), null);
					}
				},
				getDynamicContent: function(e)
				{
						var table = document.createElement("table");
						//table.className = 'ctl-date';
						table.cellSpacing = 0;
						table.cellPadding = 0;

						var input = document.createElement("input");
						this.dom.disableElements.push(input);
						input.type="text";
						input.size=30;
						input.onchange = this.getExecWithInstanceHandler(this.checkValid);
						input.onkeypress = this.getExecWithInstanceHandler(this.handler_onkeypress);
						input.onkeydown  = this.getExecWithInstanceHandler(this.handler_onkeypress);
						
						input.onclick = this.getExecWithInstanceHandler(this.show(), null);
						input.onblur = this.getExecWithInstanceHandler(this.handler_onblur);
						input.onmouseover = this.getExecWithInstanceHandler(this.handler_onmouseover);
						input.onmouseout = this.getExecWithInstanceHandler(this.handler_onmouseout);
						this.dom.input = input;
						var tr = table.insertRow(0);
						var td = tr.insertCell(0);
						td.style.border = '0px';
						td.appendChild(input);
						
						if(this.warning)
						{
							var warning = document.createElement("span");
							warning.appendChild(document.createTextNode(this.warningMessage));
							warning.className = "red";
							warning.style.display = "none";
							var td = tr.insertCell(1);
							td.style.border = '0px';
							td.style.paddingLeft = "1ex";
							td.appendChild(warning);
							this.dom.warning = warning;
						}
						return table;
				},
				createToolbox: function()
				{
						var table_int = document.createElement("table");
						table_int.className = "ctl-date";
						table_int.cellSpacing = 0;
						table_int.cellPadding = 0;
						
						// Toolbox in top
						var tr = table_int.insertRow(table_int.rows.length);
						var td = tr.insertCell(tr.cells.length);
						
						var center = document.createElement('center');
						
						var toolbox_table = document.createElement('table');
						var toolbox_tr = toolbox_table.insertRow(0);
						
						var toolbox_clear = toolbox_tr.insertCell(0);
						toolbox_clear.width = '50%';
						toolbox_clear.onclick = this.getExecWithInstanceHandler(this.setValue, [null]);
						toolbox_clear.ondblclick = this.getExecWithInstanceHandler(this.hide);
						dom.setClassOnMouseEvents(toolbox_clear, "center pointer select", "center pointer");
						toolbox_clear.appendChild(document.createTextNode(rs.s('datebox.clear', 'Clear')));
						
						var toolbox_cancel = toolbox_tr.insertCell(1);
						toolbox_cancel.width = '50%';
						var setValueHandler = this.getExecWithInstanceHandler(this.setValue, [this.dom.value]);
						var setHideHandler = this.getExecWithInstanceHandler(this.hide);
						toolbox_cancel.onclick = function()
						{
							setValueHandler();
							setHideHandler();
						}
						toolbox_cancel.ondblclick = this.getExecWithInstanceHandler(this.hide);
						dom.setClassOnMouseEvents(toolbox_cancel, "center pointer select", "center pointer");
						toolbox_cancel.appendChild(document.createTextNode(rs.s('common.cancel', 'Cancel')));
						
						center.appendChild(toolbox_table);
						td.appendChild(center);

						var disp_format = this.displayFormat.toString();
						var is_exists_Y = disp_format.search("Y")>=0 ? true : false;
						var is_exists_M = disp_format.search("M")>=0 ? true : false;
						var is_exists_D = disp_format.search("D")>=0 ? true : false;
						var is_exists_W = disp_format.search("W")>=0 ? true : false;
						var is_exists_h = disp_format.search("h")>=0 ? true : false;
						var is_exists_m = disp_format.search("m")>=0 ? true : false;
						var is_exists_s = disp_format.search("s")>=0 ? true : false;
						var is_full = is_exists_Y && is_exists_M && is_exists_D;

						this.dom.isShow = false;
						this.dom.date = {}
//Y:
						if(is_full)
						{
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);
							
							var self = this;

							var Y = new rs.year();
							Y.size = this.units.Y[0];
							Y.min = this.units.Y[1];
							Y.max = this.units.Y[2];
							Y.create(td);
							Y.addEventListener
							(
								'onChange',
								this.getExecWithInstanceHandler(
									function()
									{
										this.dom.date.D.year = Y.dom.value;
										this.dom.date.D.refreshDays();
									}
								)
							);

							Y.addEventListener('onChange', this.getExecWithInstanceHandler(this.ok));
							this.dom.date.Y = Y;

//M:
							td.appendChild(document.createTextNode(" "));

							var size = this.units.M[0];
							var min = this.units.M[1];
				 			var max = this.units.M[2];
							var unitLookup = this.unitsLookup.M;

							var M = new rs.combobox();

							var caption = [];
							for (var value=min; value<=max; value++)
						 	{
						 		var option = {};
						 		option['k'] = value;
								option['v'] = unitLookup ? unitLookup[value - min] : value.toString().padLeft(size, "0");
								caption.push(option);
						 	}
							M.setLookup(caption);
							M.create(td);
							M.addEventListener
							(
								'onChange',
								this.getExecWithInstanceHandler(
									function()
									{
										this.dom.date.D.month = M.dom.value;
										this.dom.date.D.refreshDays();
									}
								)
							);
							M.addEventListener('onChange', this.getExecWithInstanceHandler(this.ok));
							M.dom.select.onfocus = this.getExecWithInstanceHandler(this.focusControl);
							M.dom.select.onblur = this.getExecWithInstanceHandler(this.blurControl);
							this.dom.date.M = M;

//D:
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);
							td.ondblclick = this.getExecWithInstanceHandler(this.hide);

				 			var D = new rs.days();
							D.yearControl = Y;
							D.monthControl = M;
							D.create(td);
							D.addEventListener('onChange', this.getExecWithInstanceHandler(this.ok));
							this.dom.date.D = D;
						}


						if(is_exists_W)
						{
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);
							td.ondblclick = this.getExecWithInstanceHandler(this.hide);

			 				var W = new rs.days();
							W.onlyWeeks = true;
							W.create(td);
							W.addEventListener('onChange', this.getExecWithInstanceHandler(this.ok));
							this.dom.date.W = W;
						}
//h, m, s:
						if(is_exists_h || is_exists_m || is_exists_s || !is_full)
						{
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);
							td.align = "right";

							for (var i=0; i<this.displayFormat.length; i++)
							{
								var c = this.displayFormat.charAt(i);

								if ((c == 'h') || (c == 'm') || (c == 's') || (c == '3')
								|| ((c == 'D') && !is_full)
								|| ((c == 'M') && !is_full)
								|| ((c == 'Y') && !is_full))
								{
									var unit = this.units[c];
									var size = unit[0];
									var min = unit[1];
									var max = unit[2];
									var unitLookup = this.unitsLookup[c];

								 	var combobox = new rs.combobox();

									var caption = [];
									for (var value=min; value<=max; value++)
									{
										var option = {};
										option['k'] = value;
										option['v'] = unitLookup ? unitLookup[value - min] : value.toString().padLeft(size, "0");
										caption.push(option);
									}
									combobox.setLookup(caption);
									combobox.create(td);
									combobox.addEventListener('onChange', this.getExecWithInstanceHandler(this.ok));
									combobox.dom.select.onfocus = this.getExecWithInstanceHandler(this.focusControl);
									combobox.dom.select.onblur = this.getExecWithInstanceHandler(this.blurControl);

									td.appendChild(document.createTextNode("  "));
									this.dom.date[c] = combobox;
								}
							}
						}
						return table_int;
				},
				handler_onmouseover: function()
				{
						this.dom.readyToHide = false;
				},
				handler_onmouseout: function()
				{
						this.dom.readyToHide = true;
				},
				handler_onblur: function()
				{
						this.tryHide();
						//this.docEvent = document.onclick;
						document.onclick = this.getExecWithInstanceHandler(this.tryHide);
				},
				handler_onkeypress: function(e)
				{
						e = e || window.event;
						var key = e.keyCode || e.which;
						if (key == 13 || key == 27) // Key Enter or Esc
						{
							this.dom.readyToHide = true;
							this.editCombobox = false;
							this.hide();
						}
				},
				focusControl: function()
				{
						this.editCombobox = true;
						this.dom.readyToHide = false;
				},
				blurControl: function()
				{
						//this.dom.readyToHide = true;
						this.editCombobox = false;
						//this.tryHide();
				},
				tryHide: function()
				{
						if(this.dom.readyToHide && !this.editCombobox)
						{
							this.hide();
						}
				},
				show: function()
				{
						var sender = this;
						return function(e)
						{
							if(sender.dom.isShow)
							{
								return;
							}
							sender.dom.isShow = false;
							sender.dom.popup.clearContent();
							sender.dom.popup.addContent(sender.createToolbox());
							sender.getValue();
							sender.dom.isShow = true;
							sender.ok();
							//sender.dom.popup.showFromMouse(e);
							dom.addClass(sender.dom.input, 'grey_fill');
							sender.dom.popup.showFromBase(sender.dom.input, 'bottom');
						}
				},
				hide: function()
				{
						this.dom.isShow = false;
						document.onclick = "";
						dom.deleteClass(this.dom.input, 'grey_fill');
						this.dom.popup.hide();
				},
				ok: function()
				{
						var date = {};
						if(this.dom.isShow)
						{
							for (var c in this.dom.date)
							{
									this.dom.date[c].getValue();
									date[c] = this.dom.date[c].dom.value;
							}
							this.setValue(this.formatDate(date, this.valueFormat, false));
						}
				},
				getValue: function()
				{
						if (this.getStaticValue()) return;
						if(this.dom.value)
						{
							var date = this.parseDate(this.dom.value, this.valueFormat);
							if(date == null)
							{
								date = this.getCurrentDate();
							}
							for (var c in this.dom.date)
							{
								var value = date[c];
								if (value)
								{
									var unit = this.units[c];
									var min = unit[1];
									var max = unit[2];

						  		  	if (value < min)
						  		  		value = min;
						  		  	else if (value > max)
										value = max;
								  	this.dom.date[c].setValue(parseInt(value,10).toString());
								}
							}
						}
						else
						{
							var date = this.getCurrentDate();
							/*this.setValue(this.formatDate(date, this.valueFormat, false));*/
							this.dom.value = this.formatDate(date, this.valueFormat, false);
							this.getValue();
							this.dom.value = "";
						}
				},
				setValue: function(v)
				{
						if (this.setStaticValue(v)) return;
						this.dom.value = v;

						if(v)
						{
							var date = this.parseDate(v, this.valueFormat);
							if(date == null)
							{
								this.dom.input.value = v;
							}
							else
							{
								this.dom.input.value = this.formatDate(date, this.displayFormat, this.useLookup);
								this.displayWarning(false);
							}
						}
						else
						{
							this.dom.input.value = '';
						}
						this.handleEvent('onChange', [this, v]);
				},
				getCurrentDate: function()
				{
						var currentDate = new Date();
						var date = {};
						date.Y = currentDate.getFullYear();
						date.M = currentDate.getMonth()+1;
						date.D = currentDate.getDate();
						date.W = currentDate.getDay()==0 ? 7 : currentDate.getDay();
						date.h = currentDate.getHours();
						date.m = currentDate.getMinutes();
						date.s = currentDate.getSeconds();
						date['3'] = 0;
						date['6'] = 0;
						return date;
				},
				verifyValue: function()
				{
						this.verificationPassed = true;
						if(this.dom.mode == "dynamic" && this.checkValid() != 0)
						{
							this.handleEvent('onVerifyFailed', [this, this.dom.value]);
							this.verificationFailureReason = this.warningMessage;
							this.verificationPassed = false;
							return;
						}
						this.handleEvent('onVerifyPassed', [this, this.dom.value]);
				},
				checkValid: function()
				{
						var string = this.dom.input.value;

						var date = this.parseDate(string, this.displayFormat, true);

						if(date == null || (string.length == 0 && this.dom.notNull))
						{
							this.displayWarning(true);
							return 1;
						}
						else
						{
							if(string.length == 0)
							{
								var value = "";
							}
							else
							{
								var is_exists_M = this.displayFormat.search("M")>=0 ? true : false;
								var is_exists_D = this.displayFormat.search("D")>=0 ? true : false;
								if(is_exists_M && is_exists_D)
								{
									var month = date['M'];
									var day = date['D'];
									if((day == 31 && (month == 2 || month == 4 || month == 6 || month == 9 || month == 11))
									|| (day == 30 && month == 2))
									{
										this.displayWarning(true);
										return 1;
									}
								}

								var value = this.formatDate(date, this.valueFormat, false);
							}

							this.setValue(value);
							this.displayWarning(false);
						}

						return 0;
				},
				displayWarning: function(display)
				{
					if(this.warning)
					{
						this.dom.warning.style.display = display?"":"none";
					}
				}
		}
);

//----------------------------------------------------------------------------------------------
// rs.file
//

rs.file = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.name = "";
		},
		toString: function()
		{
			return "rs.file";
		},
		getDynamicContent: function()
		{
			var input = document.createElement("input");
			this.dom.disableElements.push(input);
			this.dom.input = input;
			input.type = "file";
			input.name = this.name;
			return input;
		},
		getRecordValue: function()
		{
			return this.dom.input ? this.dom.input.value : null;
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = this.dom.input.value;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.button
//

rs.button = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
		},
		toString: function()
		{
			return "rs.button";
		},
		setRow: function(row)
		{
			this.dom.row = row;
		},
		createDynamic: function(e)
		{
		},
		getValue: function()
		{
		},
		setValue: function()
		{
		},
		reCreate: function()
		{
		},
		verifyValue: function()
		{
		},
		getStaticContent: function(v)
		{
			var input = document.createElement("input");
			this.dom.disableElements.push(input);
			input.type = "button";
			this.dom.input = input;
			input.value = (v == null) ? this.title : v;
			var self = this;
			var instance = this.settedInstance;
			input.onclick = function(e)
			{
				self.setInstance(instance);
				rs.utils.bubbleEvent(e);
				Aux.Form__Submit("ColumnProcedure:Call", self.hi, self.dom.row);
				return false;
			};
			return input;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.hyperlink
//

rs.hyperlink = newClass
(
	rs.combobox,
	{
		constructor: function()
		{
			rs.combobox.call(this);
		},
		toString: function()
		{
			return "rs.hyperlink";
		},
		setLookupParam: function(param)
		{
			if(param == null)
			{
				return;
			}
			this.dom.options = [];
			this.dom.options = this.findLookupMembers('p', param);
			this.dom.value = null;
			this.setValue(this.dom.initValue);
		},
		getStaticContent: function(v)
		{
			var a = document.createElement("a");
			a.onclick = function()
			{
				window.open(a.href);
				return false;
			};
			this.dom.a = a;
			a.href = v;
			if(this.dom.options.length > 0)
			{
				if(v == '' && this.dom.options.length == 1)
				{
					v = this.dom.options[0]['k'];
				}
				a.href = v;
				var option = this.getOptionByValue(v);
				a.appendChild(document.createTextNode(option['v'] || ""));
			}
			else
			{
				a.appendChild(document.createTextNode(v || ""));
			}
			return a;
		},
		createDynamic: function(e)
		{
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.value = this.dom.a.href;
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v || "")) return;
			this.dom.value = v || "";
			if(this.dom.options.length > 0)
			{
				this.dom.place.innerHTML = "";
				for(var i = 0; i < this.dom.options.length; i++)
				{
					if(this.dom.a)
					{
						var a = document.createElement('a');
						a.href = this.dom.options[i]['k'] || "";
						a.appendChild(document.createTextNode(this.dom.options[i]['v'] || ""));
						this.dom.place.appendChild(a);
						this.dom.place.appendChild(document.createElement('br'));
					}
					return;
				}
			}
			else
			{
				this.dom.value = v || "";
				this.dom.a.href = v || "";
				this.dom.a.innerHTML = "";
				this.dom.a.appendChild(document.createTextNode(v || ""));
				this.refresh();
			}
		}
	}
);

rs.filterbox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = 'ctl-filterbox';
			this.addInit(
				function()
				{
					this.dom.setters['table'] = this.getColumns;
					this.dom.controls = {};
					this.dom.table = null;
					this.dom.reset = false;
					this.dom.value = "";
				}
			);
		},
		toString: function()
		{
			return 'rs.filterbox';
		},
		createFilterBox: function(e)
		{
			if(this.dom.mode == 'dynamic')
			{
				if(!rs.utils.object_isEmpty(this.dom.controls))
				{
					this.dom.ftb.readonly = false;
					this.dom.ftb.create(e);
					if(!this.dom.reset && !rs.utils.isEmpty(this.dom.initValue))
					{
						this.setValue(this.dom.initValue);
						this.dom.ftb.setFilter(JSON.decode(this.dom.initValue));
					}
				}
			}
			else if (this.dom.mode == 'static')
			{
				this.dom.ftb.readonly = true;
				this.reCreate();
			}
		},
		getDynamicContent: function(e)
		{
			var span = document.createElement('span');
			this.initFilterToolbox();
			this.createFilterBox(span);
			return span;
		},
		initFilterToolbox: function()
		{
			this.dom.ftb = null;
			this.dom.ftb = new rs.filtertoolbox();
			this.dom.ftb.saveFilterDialog = false;
			this.dom.ftb.toolbox = false;
			this.dom.ftb.submit = function(){};
			this.dom.ftb.controls = this.dom.controls;
			//this.dom.ftb.dom.place.onclick = function(e){rs.utils.bubbleEvent(e)};
		},
		getStaticContent: function(v)
		{
			var div = document.createElement('div');
			if(!rs.utils.object_isEmpty(this.dom.controls))
			{
				this.initFilterToolbox();
				this.dom.ftb.readonly = true;
				this.dom.ftb.create(div);
				this.dom.ftb.setFilter(JSON.decode(v));
			}
			return div;
		},
		setValue: function(v)
		{
			//this.dom.controls = null;
			this.dom.value = v;
		},
		getValue: function()
		{
			if(!rs.utils.object_isEmpty(this.dom.controls))
			{
				if (this.getStaticValue()) return;
				var v = this.dom.ftb.getDynRecord();
				if(v != null)
				{
					this.dom.value = JSON.encode(v);
				}
			}
		},
		verifyValue: function()
		{
			this.getValue();
			this.verificationPassed = true;
			this.verificationFailureReason = 'Invalid filter';
			if(this.dom.mode == 'dynamic' && this.dom.ftb.getDynRecord() == null)
			{
				this.handleEvent('onVerifyFailed', [this, this.dom.value]);
				this.verificationPassed = false;
				return;
			}
			this.handleEvent('onVerifyPassed', [this, this.dom.value]);
		},
		loading: function()
		{
			this.dom.place.innerHTML = '';
			var center = document.createElement('center');
			var loading = document.createElement('img');
			loading.src = rs.ajax_loading_img_src;
			center.appendChild(loading);
			this.dom.place.appendChild(center);
		},
		reload: function(result, errors)
		{
			var columns = result['columns'];
			for(var i = 0; i < columns.length; i++)
			{
				if (columns[i].ctl == 'rs.filterbox') continue;
				var column = eval("new " + columns[i].ctl + "()");
				for(var k in columns[i])
				{
					if(k != 'dom' && k != 'lookup')
					{
						column[k] = columns[i][k];
					}
				}
				if(columns[i]['dom'])
				{
					for(k in columns[i]['dom'])
					{
						column['dom'][k] = columns[i]['dom'][k];
					}
				}
				if(columns[i]['lookup'])
				{
					column.setLookup(columns[i]['lookup']);
				}
				column.dom.notNull = false;
				this.dom.controls[column.name] = column;
				column = null;
			}
			this.initFilterToolbox();
			this.dom.place.innerHTML = '';
			this.createFilterBox(this.dom.place);
		},
		getColumns: function(hi)
		{
			if((!rs.utils.isEmpty(this.dom.table)) && (this.dom.table != hi))
			{
				this.dom.reset = true;
			}
			this.dom.table = hi;
			this.dom.controls = {};
			this.loading();
			rs.ajax.GUIQuery(hi, ['Container:getColumns'], null, null, this.getExecWithInstanceHandler(this.reload));
		}
	}
);

rs.interval = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = 'center';
			this.valueFormat = "YMDhms";
			this.displayFormat = "Y-M-D h:m:s";
			this.addInit(
				function()
				{
					this.dom.startDatebox 			= new rs.datebox();
					this.dom.startDatebox.warning 	= false;
					this.dom.endDatebox				= new rs.datebox();
					this.dom.endDatebox.warning		= false;
					this.dom.table = {};
				}
			);
			this.cloneFunctions.push(
				function(control)
				{
					control.valueFormat = this.valueFormat;
					control.displayFormat = this.displayFormat;
				}
			);
		},
		toString: function()
		{
			return 'rs.interval';
		},
		getDynamicContent: function()
		{
			var table = this.initTable();
			this.initDates();
			// Create
			this.dom.startDatebox.createDynamic(this.dom.table.start);
			this.dom.endDatebox.createDynamic(this.dom.table.end);
			return table;
		},
		getIntervalDates: function(interval)
		{
			interval = interval || "";
			var s = interval.split('-');
			return {
				'start'		: s.shift(),
				'end'		: s.shift()
			};
		},
		initDates: function()
		{
			// Set format
			this.dom.startDatebox.valueFormat = this.valueFormat;
			this.dom.endDatebox.valueFormat = this.valueFormat;
			this.dom.startDatebox.displayFormat = this.displayFormat;
			this.dom.endDatebox.displayFormat = this.displayFormat;
		},
		initTable: function()
		{
			var table = document.createElement('table');
			table.className = "ctl-interval";
			var tr = table.insertRow(0);
			this.dom.table.start = tr.insertCell(0);
			this.dom.table.start.className = "start";
			this.dom.table.to = tr.insertCell(1);
			this.dom.table.to.className = "to";
			this.dom.table.to.innerHTML = "&mdash;";
			this.dom.table.end = tr.insertCell(2);
			this.dom.table.end.className = "end";
			return table;
		},
		getStaticContent: function(v)
		{	
			this.initDates();
			var table = this.initTable();
			var interval = this.getIntervalDates(v);
			
			// Create start datebox
			var content = this.dom.startDatebox.getStaticContent(
				interval['start']
				|| this.dom.startDatebox.formatDate(
					this.dom.startDatebox.getCurrentDate(),
					this.valueFormat,
					false
				)
			);
			var div = document.createElement("div");
			div.appendChild(content);
			if(rs.utils.isEmpty(interval['start']))
			{
				div.style.visibility = 'hidden';
			}
			this.dom.table.start.appendChild(div);
			
			// Create end datebox
			var content = this.dom.endDatebox.getStaticContent(
				interval['end']
				|| this.dom.endDatebox.formatDate(
					this.dom.endDatebox.getCurrentDate(),
					this.valueFormat,
					false
				)
			);
			var div = document.createElement("div");
			div.appendChild(content);
			if(rs.utils.isEmpty(interval['end']))
			{
				div.style.visibility = 'hidden';
			}
			this.dom.table.end.appendChild(div);
			return table;
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v || "")) return;
			var interval = this.getIntervalDates(v);
			this.dom.startDatebox.setValue(interval['start']);
			this.dom.endDatebox.setValue(interval['end']);
			this.refresh();
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			this.dom.startDatebox.getValue();
			this.dom.endDatebox.getValue();
			this.dom.value = 
				this.dom.startDatebox.dom.value
				+ ((
					rs.utils.isEmpty(this.dom.startDatebox.dom.value)
					&& rs.utils.isEmpty(this.dom.endDatebox.dom.value)
				) ? '' : '-')
				+ this.dom.endDatebox.dom.value;
		},
		verifyValue: function()
		{
			this.getValue();
			this.verificationPassed = true;
			if(this.dom.mode == 'dynamic')
			{
				this.dom.startDatebox.verifyValue();
				this.dom.endDatebox.verifyValue();
				if(
					this.dom.notNull
					&& rs.utils.isEmpty(this.dom.startDatebox.dom.value)
					&& rs.utils.isEmpty(this.dom.endDatebox.dom.value)
				)
				{
					this.verificationPassed = false;
					this.verificationFailureReason = rs.s('table.errors.non_empty', 'Field should be non-empty');
					this.handleEvent('onVerifyFailed', [this, this.dom.value]);
					return;
				}
				if(!this.dom.startDatebox.verificationPassed || !this.dom.endDatebox.verificationPassed)
				{
					this.verificationFailureReason = rs.s('interval.invalid_date', 'Invalid one of dates');
					this.verificationPassed = false;
				}
				if(this.dom.startDatebox.dom.value > this.dom.endDatebox.dom.value)
				{
					this.verificationFailureReason = rs.s('interval.end_more_start', 'End date must be more than start');
					this.verificationPassed = false;
				}
				if(!this.verificationPassed)
				{
					this.handleEvent('onVerifyFailed', [this, this.dom.value]);
					return;
				}
			}
			this.handleEvent('onVerifyPassed', [this, this.dom.value]);
		},
		disableDynamic: function(param)
		{
			this.dom.startDatebox.disable(param);
			this.dom.endDatebox.disable(param);
		}
	}
);

rs.list = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.name = null;		// The same of control.
			this.delimiter = ";";	// Delimiter.
			this.addInit(
				function()
				{
					this.dom.control = this.domInstances['default'].control;
					this.dom.content = null;	// Content div
					this.dom.lines = [];
					this.dom.addLine = null;
				}
			);
			this.cloneFunctions.push(
				function(control)
				{
					control.setControl(this.dom.control);
				}
			);
		},
		toString: function()
		{
			return "rs.list";
		},
		addDynamicLine: function()
		{
			var div = document.createElement('div');
			
			var table = document.createElement('table');
			var tr = table.insertRow(0);
			var icon = tr.insertCell(0);
			var num = tr.insertCell(1);
			num.className = 'num';
			var control = tr.insertCell(2);
			
			var deleteIcon = document.createElement('div');
			deleteIcon.className = 'sprite_delete_smallIcon pointer';
			icon.appendChild(deleteIcon);
			
			var c = this.dom.control.clone();
			c.createDynamic(control);
			
			var line = {
				div		: div,
				num		: num,
				iconTd	: icon,
				control	: c,
				icon	: deleteIcon
			};
			this.lineInit(line, true);
			
			this.dom.lines.push(line);
			div.appendChild(table);
			this.dom.content.appendChild(div)
			this.refreshNumerate();
		},
		deleteDynamicLine: function(line)
		{
			for(var i = 0; i < this.dom.lines.length; i++)
			{
				if(line == this.dom.lines[i])
				{
					this.dom.content.removeChild(line['div']);
					this.dom.lines.splice(i, 1);
					this.refreshNumerate();
					return;
				}
			}
		},
		refreshNumerate: function()
		{
			for(var i = 0; i < this.dom.lines.length; i++)
			{
				this.dom.lines[i]['num'].innerHTML = parseInt(i) + 1;
			}
		},
		lineInit: function(line, init)
		{
			if(init)
			{
				var self = this;
				var deleteHandler = this.getExecWithInstanceHandler(this.deleteDynamicLine, [line]);
				line['iconTd'].onclick = deleteHandler
				line['iconTd'].onmouseover = function()
				{
					dom.addClass(line['iconTd'], 'pointer');
					dom.addClass(line['div'], 'delete_fill');
				}
				line['iconTd'].onmouseout = function()
				{
					dom.deleteClass(line['iconTd'], 'pointer');
					dom.deleteClass(line['div'], 'delete_fill');
				}
			}
			else
			{
				line['iconTd'].onmouseover = null;
				line['iconTd'].onmouseout = null;
			}
		},
		addLineInit: function(init)
		{
			if(init)
			{
				var self = this;
				this.dom.addLine.line.onclick = this.getExecWithInstanceHandler(this.addDynamicLine);
				this.dom.addLine.line.onmouseover = this.getExecWithInstanceHandler
				(
					function()
					{
						self.dom.addLine.caption.style.visibility = 'visible';
					}
				);
				this.dom.addLine.line.onmouseout = this.getExecWithInstanceHandler
				(
					function()
					{
						self.dom.addLine.caption.style.visibility = 'hidden';
					}
				);
				dom.addClass(this.dom.addLine.line, 'pointer');
				this.dom.addLine.icon.style.visibility = 'visible';
			}
			else
			{
				this.dom.addLine.line.onclick = null;
				this.dom.addLine.line.onmouseover = null;
				this.dom.addLine.line.onmouseout = null;
				dom.deleteClass(this.dom.addLine.line, 'pointer');
				this.dom.addLine.icon.style.visibility = 'hidden';
			}
		},
		getDynamicContent: function()
		{
			var span = document.createElement('span');
			span.className = 'ctl-list';
			
			this.dom.content = document.createElement('div');
			var addLine = document.createElement('div');
			addLine.className = 'add';
			var table = document.createElement('table');
			var tr = table.insertRow(0);
			var icon = tr.insertCell(0);
			var control = tr.insertCell(1);
			var caption = document.createElement('div');
			caption.appendChild(document.createTextNode(rs.s('list.new_item', 'New item')));
			caption.style.visibility = 'hidden';
			control.appendChild(caption);
			var addIcon = document.createElement('div');
			addIcon.className = 'sprite_add_smallIcon';
			icon.appendChild(addIcon);
			addLine.appendChild(table);
			this.dom.addLine = {
				'line'		: table,
				'caption'	: caption,
				'icon'		: addIcon
			};
			this.addLineInit(true);
			
			span.appendChild(this.dom.content);
			span.appendChild(addLine);
			return span;
		},
		getStaticContent: function(v)
		{
			var div = document.createElement('div');
			if(v)
			{
				var values = v.split(this.delimiter);
				for(var i = 0; i < values.length; i++)
				{
					var line = document.createElement('div');
					line.appendChild(this.dom.control.getStaticContent(values[i]));
					div.appendChild(line);
				}
			}
			return div;
		},
		setValue: function(v)
		{
			if (this.setStaticValue(v || "")) return;
			if(v)
			{
				var values = v.split(this.delimiter);
				for(var i = 0; i < values.length; i++)
				{
					this.addDynamicLine();
					this.dom.lines[i].control.setValue(values[i]);
				}
			}
			this.refresh();
		},
		getValue: function()
		{
			if (this.getStaticValue()) return;
			var values = [];
			for(var i = 0; i < this.dom.lines.length; i++)
			{
				this.dom.lines[i].control.getValue();
				values.push(this.dom.lines[i].control.dom.value);
			}
			this.dom.value = values.join(this.delimiter);
		},
		verifyValue: function()
		{
			this.getValue();
			var errors = {}
			this.verificationPassed = true;
			if(this.dom.mode == 'dynamic')
			{
				if(this.dom.notNull && this.dom.lines.length == 0)
				{
					this.verificationPassed = false;
					this.verificationFailureReason = rs.s('table.errors.non_empty', 'Field should be non-empty');
					this.handleEvent('onVerifyFailed', [this, this.dom.value]);
					return;
				}
				for(var i = 0; i < this.dom.lines.length; i++)
				{
					this.dom.lines[i].control.verifyValue()
					if(!this.dom.lines[i].control.verificationPassed)
					{
						if(!errors[this.dom.lines[i].control.verificationFailureReason])
						{
							errors[this.dom.lines[i].control.verificationFailureReason] = [];
						}
						errors[this.dom.lines[i].control.verificationFailureReason].push(parseInt(i) + 1);
					}
				}
				if(!rs.utils.object_isEmpty(errors))
				{
					this.verificationFailureReason = "";
					this.verificationPassed = false;
					for(var reason in errors)
					{
						this.verificationFailureReason +=
							reason
							+ (this.verificationFailureReason == "" ? "" : " ")
							+ ' ' + rs.s('list.in_items', 'in items:', [errors[reason].length]) + ' '
							+ errors[reason].join(', ')
							+ '.';
					}
					this.handleEvent('onVerifyFailed', [this, this.dom.value]);
					return;
				}
			}
			this.handleEvent('onVerifyPassed', [this, this.dom.value]);
		},
		setControl: function(c)
		{
			this.dom.control = c;
			this.dom.notNull = c.dom.notNull;
			this.name = c.name;
			this.title = c.title;
		},
		disableDynamic: function(param)
		{
			for(var i = 0; i < this.dom.lines.length; i++)
			{
				this.dom.lines[i].control.disable(param);
				this.lineInit(this.dom.lines[i], !param);
			}
			this.addLineInit(!param);
		}
	}
);

//**********************************************************************************************
// Containers
//

function getTopContainer()
{
	return document.forms[0] || document.body;
}

//----------------------------------------------------------------------------------------------
// rs.container
//

rs.container = newClass
(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			this.controls = {};
			this.control_counter = 0;
			this.addInit(
				function()
				{
					this.dom.events.onKeyPress = new rs.event();
					this.dom.place.onkeypress = this.dom.events.onKeyPress.execute.bind(this.dom.events.onKeyPress);
				}
			);
		},
		toString: function()
		{
			return "rs.container";
		},
		add: function(c)
		{
			if (!this.controls[c.name])
			{
				this.control_counter++;
			}
			c.parent = this;
			this.controls[c.name] = c;
		},
		init: function()
		{
			this.setDocumentTitle(false);
			this.setPageDescription();
			this.create(getTopContainer());
		},
		setDocumentTitle: function(force)
		{
			if (force || !document.title)
			{
				document.title =  '[Step 4 under construction] '+ this.title;;
				top.document.title = '[Step 4 under construction] ' + this.title;
			}
		},
		setPageDescription: function()
		{
			var meta = document.createElement("meta");
			meta.name = "description";
			meta.content = this.hint;
			document.getElementsByTagName("head")[0].appendChild(meta);
		},
		create: function(e)
		{
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.form
//

rs.form = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);
		},
		add: function(c)
		{
			if (!this.controls[c.name])
			{
				this.control_counter++;
			}
			c.parent = this;
			this.controls[c.name] = c;
			
			var rs_form = this;
			if(c == 'rs.table')
			{
				c.dom.events.onChangeToListEditMode.add(
					function(self)
					{
						rs_form.disableAllTableEdit(self);
					}
				);
				c.dom.events.onExitFromListEditMode.add(
					function(self)
					{
						rs_form.enableAllTableEdit(self);
					}
				);
			}
		},
		toString: function()
		{
			return "rs.form";
		},
		disableAllTableEdit: function(exclude_table)
		{
			for (var c in this.controls)
			{
				if ((this.controls[c] != exclude_table) && this.controls[c].disableListEditMode)
				{
					this.controls[c].disableListEditMode();
				}
			}
		},
		enableAllTableEdit: function(exclude_table)
		{
			for (var c in this.controls)
			{
				if ((this.controls[c] != exclude_table) && this.controls[c].enableListEditMode)
				{
					this.controls[c].enableListEditMode();
				}
			}
		}
	}
);

//----------------------------------------------------------------------------------------------
// GUI Container
//

rs.guicontainer = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);
			
			// Object for hide
			this.hidedObjects = {};
			this.hidedObjects.hide = {};
			this.hidedObjects.caption = null;
			this.hidden = false;
			
			// Locks
			this.dom.locks.covers = {};
			this.dom.locks.click = false;
			this.dom.locks.clickElements = [];
			
			// Columns relations
			this.relations = {}; //Hash. {'changed cName':[arr of rules]}
			this.controlsInRelations = {};
			this.controlsInRelationsSources = {};
			
			// Submit
			this.submit = function(){}; //Default submit function
			var container = this;
			this.dom.events.onKeyPress.add(
				function(e)
				{
					if (!e)
					{
						e = window.event;
					}
					if(
						e.keyCode == 13
						&& (
							(IS_MSIE == false && e.target.tagName != 'TEXTAREA') ||
							(IS_MSIE && e.srcElement.tagName != 'TEXTAREA')
						)
						&& (
							(IS_MSIE == false && e.target.tagName != 'SELECT') ||
							(IS_MSIE && e.srcElement.tagName != 'SELECT')
						)
					)
					{
						container.submit();
					}
				}
			);
			
			// Options
			this.options = {};
			this.options.struct = []; //Ex.: ["name", "name", {title:"Group title", controls:["name", "name"]}]
			this.options.args = {};
			
			this.pk = ["SYS_ROWID"];
		},
		runCallBackAction: function(action)/*Virtual*/
		{
			//Available callback actions
			//Define in child classes
		},
		AJAXAction: function(action)/*Virtual*/
		{
			//Switch posible ajax actions with queries
			//Define in child classes
		},
		loading: rs.ajax.loading,
		AJAXQuery: function(actions, data, callback, clearExceptionMsgs)
		{
			if( typeof(clearExceptionMsgs) === 'undefined' ){
				clearExceptionMsgs = true;
			}
			var queryIsRun = true;
			var queryIsInvalid = false;
			var waitingChecker = function()
			{
				return queryIsRun;
			}
			var lockRequest = function()
			{
				queryIsInvalid = true;
			}
			
			this.loading(true, waitingChecker, lockRequest);
			var self = this;
			var func = function(result)
			{
				queryIsRun = false;
				if(queryIsInvalid)
				{
					return;
				}
				if ( clearExceptionMsgs ) self.clearExceptions();
				if(result['errors'])
				{
					var errors = result['errors'];
					for(var i = 0; i < errors.length; i++)
					{
						self.addException(errors[i]);
					}
					self.showExceptions();
				}
				var freezeLoading = false;
				if(result['callback'] && !rs.utils.object_isEmpty(result['callback']))
				{
					for(var i = 0; i < result['callback'].length; i++)
					{
						switch(result['callback'][i].action)
						{
							case "reloadFrame":
							{
								freezeLoading = rs.utils.refreshFrame.apply(self, result['callback'][i].params);
								break;
							}
							case "redirect":
							{
								rs.utils.redirect.apply(self, result['callback'][i].params);
								break;
							}
							default:
							{
								self.runCallBackAction(result['callback'][i].action);
							}
						}
					}
				}
				callback.call(self, result);
				if(!freezeLoading)
				{
					self.loading(false);
				}
			}
			rs.ajax.GUIQuery(this.hi, actions, null, data, func);
		},
		setStruct: function(struct)
		{
			this.options.struct = struct;
		},
		addRelationControl: function(cName)
		{
			if(this.controls[cName])
			{
				this.controlsInRelations[cName] = true;
			}
		},
		setRelations: function(relations)
		{
			if (relations instanceof Array)
			{
				relations = {};
			}
			this.relations = relations;
			for(var source in this.relations)
			{
				this.addRelationControl(source);
				this.controlsInRelationsSources[source] = true;
				for(var event in this.relations[source])
				{
					for(var i = 0; i < this.relations[source][event].length; i++)
					{
						var targets = this.relations[source][event][i]['targets'].split(';');
						for(var k = 0; k < targets.length; k++)
						{
							this.addRelationControl(targets[k]);
						}
						if(this.relations[source][event][i]['param'])
						{
							this.relations[source][event][i]['param_compiled'] = this.getCompiledExpression(this.relations[source][event][i]['param']);
						}
						if(this.relations[source][event][i]['conditions'])
						{
							this.relations[source][event][i]['conditions_compiled'] = this.getCompiledExpression(this.relations[source][event][i]['conditions']);
						}
					}
				}
			}
		},
		getCompiledExpression: function(expression)
		{
			var formed = expression;
			var reg = /\[[0-9a-zA-Z_\-]+\]/g;
			var binds = formed.match(reg) || [];
			if(IS_MSIE)
			{
				var temp = [];
				var i = 0;
				if(!rs.utils.object_isEmpty(binds))
					while(binds[i])
					{
						temp.push(binds[i]);
						i++;
					}
				binds = temp;
			}
			for (var i = 0, len = binds.length; i < len; ++i)
			{
				var cName = binds[i].substring(1, binds[i].length - 1);
				if(this.controls[cName])
				{
					this.controls[cName].getValue();
					var value = 'this.controls["' + cName + '"].getDirectValue()';
				}
				else
				{
					var value = '""'
				}
				formed = formed.replace(binds[i], value);
			}
			return new Function('return ' + formed + ';');
			//return eval(formed);
		},
		execRelation: function(source, relation)
		{
			var canExecute = true;
			if(relation.conditions_compiled)
			{
				canExecute = relation.conditions_compiled.call(this);
			}
			
			if(canExecute)
			{
				var cNames = relation.targets.split(';');
				if(relation.param_compiled)
				{
					var param = relation.param_compiled.call(this);
				}
				for(var i = 0; i < cNames.length; i++)
				{
					var control = this.controls[cNames[i]];
					if(!control)
					{
						continue;
					}
					switch(relation.action)
					{
						case "setValue":
						{
							control.setValue(param);
							break;
						}
						case "show":
						{
							control.showElement('control_' + source.name, source);
							break;
						}
						case "hide":
						{
							control.hideElement('control_' + source.name, source);
							break;
						}
						case "setNotNull":
						{
							control.setNotNull(param);
							break;
						}
						case "setLookupParam":
						{
							control.setLookupParam(param);
							break;
						}
						case "setDisplay":
						{
							var self = this;
							var holder = function()
							{
								return relation.param_compiled.call(self) == 1;
							}
							control.setDisplay(param, 'control_' + source.name, holder);
							break;
						}
						case "setValueFromLookup":
						{
							var options = source.findLookupMembers('k', source.dom.value);
							if(options.length)
							{
								var option = options.pop();
								control.setValue(option[param]);
							}
							break;
						}
						case "disable":
						{
							var self = this;
							var holder = function()
							{
								return relation.param_compiled.call(self) == 0;
							}
							control.setDisabled(param, 'control_' + source.name, holder);
							break;
						}
						case "setParam":
						{
							control.setParam(param);
							break;
						}
						case "setValueFromAJAX":
						{
							rs.ajax.query(
								param,
								null,
								function(result)
								{
									control.setValue(result);
								}
							);
						}
					}
				}
			}
		},
		hideMenu: function()
		{
			if (this.menu && this.menu instanceof rs.menu)
			{
				this.menu.hide();
			}
		},
		addException: function(string)
		{
			var exception = document.createElement("div");
			exception.className = "error-box";
			var pre = document.createElement('pre');
			pre.appendChild(document.createTextNode(string));
			exception.appendChild(pre);
			this.exceptionSpan.appendChild(exception);
		},
		addExceptionExt: function(title, struct)
		{
			var exception = document.createElement("div");
			exception.className = "error-box";
			exception.appendChild(document.createTextNode(title));

			var all_msgs=[];

			for (var i = 0; i < struct.length; i++)
			{
				var line = document.createElement("li");
				line.appendChild(document.createTextNode(struct[i].line));
				if (struct[i].control && (struct[i].control instanceof rs.control))
				{
					if (struct[i].control.focus)
					{
						dom.setClassOnMouseEvents(line, "link_hover", "link");
						line.onclick = struct[i].control.getExecWithInstanceHandler(struct[i].control.focus, null, struct[i].rownum);
					}
				}
				all_msgs.push(line);
			}
			if (all_msgs.length>1) var msg_list = document.createElement("ol");
			else var msg_list = document.createElement("ul");
			for (i = 0; i < all_msgs.length; i++)
			{
				msg_list.appendChild(all_msgs[i]);
			}
			exception.appendChild(msg_list);
			this.exceptionSpan.appendChild(exception);
		},
		clearExceptions: function()
		{
			this.exceptionTable.style.display = "none";
			this.exceptionSpan.style.display = "none";
			while (this.exceptionSpan.lastChild)
			{
				this.exceptionSpan.removeChild(this.exceptionSpan.lastChild);
			}
			var component_error = document.getElementById('component_error_' + this.hi);
			if(component_error)
			{
				document.forms[0].removeChild(component_error);
			}
		},
		showExceptions: function()
		{
			this.exceptionTable.style.display = "";
			this.exceptionSpan.style.display = "";
			document.location.replace('#error');
		},
		prepareExceptions: function(e)
		{
			var anchor = document.createElement("a");
			anchor.name = "error";
			e.appendChild(anchor);
			
			//for show errors
			var exceptionTable = document.createElement("table");
			exceptionTable.className = "ctl-container-caption";
			exceptionTable.style.display = "none";
			var tr = exceptionTable.insertRow(0);
			//icon
			var td = tr.insertCell(tr.cells.length);
			td.className = "icon";
			var div = document.createElement("div");
			div.className = 'sprite_errorIcon';
			td.appendChild(div);
            		//caption
			var td = tr.insertCell(tr.cells.length);
			td.className = "caption";
			var text = document.createTextNode(rs.s('table.errors.error', 'Error'));
			td.appendChild(text);
			e.appendChild(exceptionTable);
			this.exceptionTable = exceptionTable;
			//span for errors
			var exceptionSpan = document.createElement("span");
			e.appendChild(exceptionSpan);
			this.exceptionSpan = exceptionSpan;
			//end errors
		},
		controlIsAvailable: function(cName)
		{
			var c = this.controls[cName];
			if(rs.utils.object_isEmpty(c.dom.locks.showLocks))
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		setStruct: function(struct)
		{
			this.options.struct = struct;
		},
		isDataControl: function(cName)
		{
			var visible = this.controlIsAvailable(cName);
			return visible/* && inStruct*/;
		},
		checkHidden: function()
		{
			if(this.hidden)
			{
				this.hidden = !this.hidden;
				this.changeHidden(true);
			}
		},
		changeHidden: function(withoutAjax)
		{
			this.hidden = !this.hidden;
			var display = this.hidden ? 'none':''
			for(var i in this.hidedObjects.hide)
			{
				this.hidedObjects.hide[i].style.display = display;
			}
			if(this.menu)
			{
				this.menu.hide();
			}
			if(this.hidden)
			{
				dom.addClass(this.hidedObjects.caption, 'gray')
			}
			else
			{
				dom.deleteClass(this.hidedObjects.caption, 'gray')
			}
			if(withoutAjax !== true)
			{
				rs.ajax.GUIQuery(this.hi, ['Container:changeHidden'], this.menu_id, this.hidden ? 1 : 0);
			}
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.table
//

rs.table = newClass
(
	rs.guicontainer,
	{
		constructor: function()
		{
			rs.guicontainer.call(this);

			// Params
			this.sort 				= {};
			this.rowset 			= [];
			this.selectedRow 		= null;
			this.selectedControl 	= null;
			this.selectedTd 		= null;
			this.illuminateRows 	= [];
			this.mode 				= 'normal'; //normal, listedit, edit, add, groupedit, addcopy, view, columnsequence, addchild
			this.filterView 		= null;
			this.activeRow			= null;

			// Important elements
			this.dom.checkbox_markAll	= null;
			this.checkboxesMark 		= [];
			this.dom.columnHeaders		= [];
			this.dom.switchToEditMode 	= [];
			this.dom.table_rowset 		= null;
			this.dom.placeForButton		= null;
			this.dom.infoRow			= null;
			this.dom.timer				= null;
			this.dom.loading			= {};
			this.places 				= {};

			// References and procedures {title, hi}
			this.references 				= [];
			this.guiProceduresReferences 	= [];
			this.specialProcedures 			= [];

			// Display options
			this.options.caption 	= true;
			this.options.header 	= true;
			this.options.mark 		= false;
			this.options.sort 		= true;
			this.options.paging 	= false;
			this.options.toolbox 	= true;
			this.options.menu 		= false;
			
			// Menu and toolboxes
			this.options.canGroupEdit 	= false;
			this.options.canExport 		= false;
			this.options.canAddChild 	= false;
			this.options.canFiltered 	= true;
			this.options.canArrange 	= true;
			this.options.canAutoRefresh	= true;
			
			// Options
			this.options.numberOfRowsToShowToolboxOnTop = 10;
			this.options.page 				= 0;
			this.options.pageSize 			= 10;
			this.options.selectPageSize 	= [10, 25, 50, 100];
			this.options.rowsetSize 		= 0;
			this.options.rowsetMaxSize 		= null;
			this.options.filter 			= {};	// For filterview
			this.options.afs				= {};	// Filter, Sort, Arrange
			this.options.afs.sort			= false;
			this.options.afs.arrange		= false;
			this.options.afs.filter			= false;
			this.options.listedit 			= true;	// Enabled listedit
			this.options.plainStruct 		= {};
			this.options.rowsetStyles		= [];
			this.options.internalRowsetStyles = [];
			this.options.autoRefreshTimeout	= 3000;
			this.options.autoRefreshIsRunning	= false;
			this.options.columnsInitInfo	= {};
			this.options.rowsCreated		= 0;
			this.options.infoRowShowed		= false;
			this.options.enableRowsChanged	= true;
			this.options.rowsChanged		= false;
			this.options.staticRowset		= false;
			
			// Events
			this.dom.events.onChangeToListEditMode = new rs.event();
			this.dom.events.onChangeToListEditMode.add(
				function(self)
				{
					if(self.menu)
					{
						self.menu.hide();
					}
				}
			);
			this.dom.events.onExitFromListEditMode = new rs.event();
			this.dom.events.onExitFromListEditMode.add(
				function(self)
				{
					self.clearExceptions();
				}
			);
		},
		loading: function(v)
		{
			if (v)
			{
				if (rs.utils.object_isEmpty(this.dom.loading))
				{
					this.dom.loading.cover = document.createElement('div');
					this.dom.loading.cover.className = 'overlay';
					this.dom.loading.cover.style.zIndex = 10;
					
					this.dom.loading.popup = document.createElement('div');
					var table = document.createElement('table');
					table.style.marginRight = 5 + 'px';
					var tr = table.insertRow(0);
					var td = tr.insertCell(tr.cells.length);
					td.appendChild(rs.ajax_loading_img.cloneNode(true));
					var td = tr.insertCell(tr.cells.length);
					td.appendChild(document.createTextNode(rs.s('common.loading', 'Loading...')));
					this.dom.loading.popup.appendChild(table);
					this.dom.loading.popup.className = 'popup';
					this.dom.loading.popup.style.zIndex = 20;
					
					this.dom.place.appendChild(this.dom.loading.cover);
					this.dom.place.appendChild(this.dom.loading.popup);
					
					var wSize = dom.getWindowSize();
					var tPos = dom.getElementPosition(this.dom.place);
					var tHeight = this.dom.place.clientHeight;
					var tWidth = Math.max(this.dom.place.clientWidth, this.dom.table_rowset.clientWidth);
					if (tHeight > wSize.height)
					{
						var top = (wSize.scrollTop + wSize.height - tPos.y - this.dom.loading.popup.clientHeight) / 2 + this.places.caption.clientHeight + 30;
						this.dom.loading.popup.style.top = top + 'px';
					}
					
					var left = wSize.scrollLeft + (Math.min(this.dom.table_rowset.clientWidth, wSize.width) - this.dom.loading.popup.clientWidth) / 2;
					this.dom.loading.popup.style.left = left + 'px';
					
					this.dom.loading.cover.style.width = tWidth + 'px';
				}
			}
			else if (!rs.utils.object_isEmpty(this.dom.loading))
			{
				this.dom.place.removeChild(this.dom.loading.cover);
				this.dom.place.removeChild(this.dom.loading.popup);
				this.dom.loading = {};
			}
		},
		startAutoRefresh: function()
		{
			this.options.autoRefreshIsRunning = true;
			this.autoRefresh(true);
		},
		stopAutoRefresh: function()
		{
			this.autoRefresh(false);
			this.options.autoRefreshIsRunning = false;
		},
		freezeAutoRefresh: function(v)
		{
			if(this.options.canAutoRefresh && this.dom.timer)
			{
				this.dom.timer.freeze(v);
			}
		},
		autoRefresh: function(v)
		{
			if(this.options.canAutoRefresh && this.options.autoRefreshIsRunning)
			{
				if(this.dom.timer == null)
				{
					var self = this;
					this.dom.timer = new rs.timer();
					this.dom.timer.callback = function()
					{
						self.AJAXAction('Table:refreshRowset');
					}
				}
				this.dom.timer.timeout = this.options.autoRefreshTimeout;
				this.freezeAutoRefresh(v ? false : true);
			}
		},
		deleteRowset: function(type)
		{
			var rows = [];
			switch(type)
			{
				case 'selected':
				{
					rows.push(this.rowset[this.selectedRow]);
					var confirmMsg = rs.s('table.confirm.delete_one', 'Are you sure you want to delete this record?');
					break;
				}
				case 'marked':
				{
					var marked = this.getMarkedRows();
					for(var i = 0; i < marked.length; i++)
					{
						rows.push(this.rowset[marked[i]]);
					}
					var confirmMsg = rs.s('table.confirm.delete_marked', 'Are you sure you want to delete {0} marked record(s)?', [rows.length]);
					break;
				}
				case 'filtered':
				{
					var confirmMsg = rs.s('table.confirm.delete_filtered', 'Are you sure you want to delete {0} record(s)?', [this.options.rowsetSize]);
					break;
				}
			}
			if(confirm(confirmMsg))
			{
				var data = {};
				data.pk = [];
				for (var i = 0; i < rows.length; i++)
				{
					data.pk.push(this.getPKRecord(rows[i]));
				}
				data.type = type;
				this.AJAXAction('Table:delete', data);
			}
		},
		getDeleteHandler: function(type)
		{
			var self = this;
			return function()
			{
				self.deleteRowset(type);
			}
		},
		getParent: function()
		{
			return this;
		},
		toString: function()
		{
			return "rs.table";
		},
		AJAXAction: function(action, data)
		{
			// Autorefresh lock
			this.autoRefresh(false);
			
			var self = this;
			switch(action)
			{
				case 'Table:setPage':
				case 'Table:setPageSize':
				case 'Table:refreshRowset':
				case 'Table:delete':
				{
					this.AJAXQuery(
						[action,'Table:getRowset'],
						data,
						function(result)
						{
							self.syncPaging(result);
							self.setRowset(result['rowset'] || []);
							self.setRowsetStyles(result['rowsetStyles'] || []);
							self.refreshToolboxes();
							
							// Autorefresh unlock
							self.autoRefresh(true);
						},
						action != 'Table:refreshRowset'
					);
					break;
				}
				case 'Table:setFilter':
				case 'Table:setFilterFromCell':
				case 'Table:setFilterFromCellAdd':
				case 'Table:disableFilter':
				case 'Table:setSort':
				case 'Table:removeSort':
				{
					if(action == 'Table:setFilterFromCell' || action == 'Table:setFilterFromCellAdd')
					{
						var row = {};
						row[this.selectedControl] = this.rowset[this.selectedRow][this.selectedControl];
						var data = row;
					}
					this.AJAXQuery(
						[action, 'Table:getRowset', 'Table:getAFS'],
						data,
						function(result)
						{
							self.syncPaging(result);
							self.setRowset(result['rowset'] || []);
							self.setRowsetStyles(result['rowsetStyles'] || []);
							self.options.afs = result.options.afs;
							self.options.filter = result.options.filter;
							self.options.sort = result.options.sort;
							self.refreshToolboxes();
							self.refreshButtons();
							self.refreshSort();
							
							// Autorefresh unlock
							self.autoRefresh(true);
						}
					);
					break;
				}
			}
		},
		getAJAXActionHandler: function(action, data)
		{
			var self = this;
			return function()
			{
				self.AJAXAction(action, data);
			}
		},
		setActiveRow: function(rownum)
		{
			for(var cName in this.options.columnsInitInfo)
			{
				this.controls[cName].setInstance(rownum);
			}
			this.activeRow = rownum;
		},
		controlEvent: function(control, eventType, rownum)
		{
			this.setActiveRow(rownum);
			if(this.relations[control.name] && this.relations[control.name][eventType])
			{
				for(var i = 0; i < this.relations[control.name][eventType].length; i++)
				{
					this.execRelation(control, this.relations[control.name][eventType][i]);
				}
			}
		},
		attachToControlEvents: function(control, rownum)
		{
			if(this.relations[control.name])
			{
				var rs_table = this;
				for(var eventType in this.relations[control.name])
				{
					var type = eventType;
					control.addEventListener(
						type,
						function(self){rs_table.controlEvent(self, type, rownum)}
					);
				}
			}
		},
		refreshSort: function()
		{
			if(this.mode != 'columnsequence')
			{
				for(var i = 0; i < this.dom.columnHeaders.length; ++i)
				{
					this.dom.columnHeaders[i].sort.innerHTML = '';
					if(this.mode == 'normal')
					{
						if (this.options.sort && this.options.sort[this.dom.columnHeaders[i].name])
						{
							var cName = this.dom.columnHeaders[i].name;
							var div = document.createElement("div");
							div.className = "sort pointer";
							this.dom.columnHeaders[i].sort.appendChild(div);
							var order = this.options.sort[cName][0];
							var dir = this.options.sort[cName][1];
							if (dir == 0)
							{
								div.className += (order == 1 ? " sortFirstAsc" : " sortSecondAsc");
								div.title = order + " Asc.";
							}
							else if (dir == 1)
							{
								div.className += (order == 1 ? " sortFirstDesc" : " sortSecondDesc");
								div.title = order + " Desc.";
							}
							var span = document.createElement("span");
							span.className = "upper-index";
							span.appendChild(document.createTextNode(order));
							div.appendChild(span);
						}
					}
				}
			}
		},
		refreshButtons: function()
		{
			this.dom.placeForButtons.innerHTML = '';
			
			if(this.mode == 'normal')
			{
				var table = document.createElement('table');
				this.dom.placeForButtons.appendChild(table);
				var tr = table.insertRow(0);
				var buttons = [];
				for(var i in this.options.afs)
				{
					if(this.options.afs[i] == 1)
					{
						buttons.push(i);
					}
				}
				if(this.options.autoRefreshIsRunning)
				{
					buttons.push('refresh');
				}
				
				for (var i=0; i<buttons.length; i++)
				{
					var td = tr.insertCell(tr.cells.length);
					td.className = "button";
					var div = document.createElement("div");
					this.dom.locks.clickElements.push(div);
					switch(buttons[i])
					{
						case 'arrange':
						{
							div.title = rs.s('table.toolbox.reset_arrangement', 'Reset columns arrangement');
							div.className = 'pointer sprite_delete_tools_smallIcon';
							div.onclick = Aux.Table__ResetColumnsArrangement.createCaller(this);
							break;
						}
						case 'filter':
						{
							// AG: This title cover filter
							//div.title = rs.s('table.toolbox.disable_filter', 'Disable filter');
							
							div.className = 'pointer sprite_delete_filter_smallIcon';
							var self = this;
							div.onclick = function()
							{
								self.filterView.hide();
								self.AJAXAction('Table:disableFilter');
							}
							this.createFilterView();
							div.onmouseover = this.filterView.showFromMouse.bind(this.filterView);
							div.onmouseout = this.filterView.hide.bind(this.filterView);
							break;
						}
						case 'sort':
						{
							div.title = rs.s('table.toolbox.remove_sort', 'Remove sort');
							div.className = 'pointer sprite_delete_sort_smallIcon';
							var self = this;
							div.onclick = function()
							{
								self.AJAXAction('Table:removeSort');
							}
							break;
						}
						case 'refresh':
						{
							div.className = 'pointer sprite_delete_refresh_smallIcon';
							var self = this;
							
							var popup = new rs.popup();
							popup.options.mouseLeftAdd 	= 10;
							popup.options.mouseTopAdd 	= 10;
							var content = document.createElement('div');
							content.appendChild(document.createTextNode(this.options.autoRefreshTimeout / 1000 + ' ' + rs.s('systoolbox.sec', 'sec.')));
							content.className = 'autorefresh_popup';
							popup.addContent(content);
							
							div.onclick = function()
							{
								popup.hide();
								self.stopAutoRefresh();
								self.refreshButtons();
							}
							div.onmouseover = popup.showFromMouse.bind(popup);
							div.onmouseout = popup.hide.bind(popup);
						}
					}
					td.appendChild(div);
				}
			}
		},
		getPopupWindow: function()
		{
			var wnd = new rs.window();
			var self = this;
			wnd.addEventListener(
				'onShow',
				function()
				{
					// Autorefresh lock
					self.autoRefresh(false);
				}
			);
			wnd.addEventListener(
				'onHide',
				function()
				{
					// Autorefresh unlock
					self.autoRefresh(true);
				}
			);
			wnd.options.modal = true;
			return wnd;
		},
		openAutorefreshWindow: function()
		{
			var wnd = this.getPopupWindow();
			wnd.options.canResize = false;
			wnd.options.defaultWidth = 200;
			wnd.options.defaultHeight = 140;
			
			var content = document.createElement('div');
			content.className = 'autorefresh';
			
			var comboboxTitle = document.createElement('div');
			comboboxTitle.appendChild(document.createTextNode(rs.s('table.windows.refresh.period', 'Select refresh period, sec:')))
			content.appendChild(comboboxTitle);
			
			var comboboxPlace = document.createElement('div');
			var combobox = new rs.combobox();
			combobox.isStatic = false;
			combobox.setLookup([{k:3000, v:3}, {k:5000, v:5}, {k:10000, v:10}, {k:30000, v:30}]);
			combobox.create(comboboxPlace);
			combobox.disable(this.options.autoRefreshIsRunning);
			combobox.setValue(this.options.autoRefreshTimeout);
			content.appendChild(comboboxPlace);
			
			var toolbox = document.createElement('div');
			toolbox.className = 'center';
			var button = document.createElement('input');
			button.type = 'button';
			var self = this;
			if(this.options.autoRefreshIsRunning)
			{
				button.value = rs.s('table.windows.refresh.stop', 'Stop');
				button.onclick = function()
				{
					self.stopAutoRefresh();
					self.refreshButtons();
					combobox.disable(self.options.autoRefreshIsRunning);
					button.value = rs.s('table.windows.refresh.start', 'Start');
					button.onclick = function()
					{
						self.options.autoRefreshTimeout = combobox.getDirectValue();
						wnd.hide();
						self.startAutoRefresh();
						self.refreshButtons();
					}
				}
			}
			else
			{
				button.value = rs.s('table.windows.refresh.start', 'Start');
				button.onclick = function()
				{
					self.options.autoRefreshTimeout = combobox.getDirectValue();
					wnd.hide();
					self.startAutoRefresh();
					self.refreshButtons();
				}
			}
			toolbox.appendChild(button);
			content.appendChild(toolbox);
			
			wnd.addContent(content);
			wnd.showInWindowCenter();
			wnd.changeCaption(rs.s('table.windows.refresh', 'Autorefresh configuring'));
		},
		openArrangeWindow: function()
		{
			var self = this;
			var f = function(result)
			{
				var wnd = self.getPopupWindow();
				wnd.options.defaultWidth = 660;
				wnd.options.defaultHeight = 280;
				wnd.options.canResize = false;
				
				var content = document.createElement('div');
				
				var atb = new rs.arrangetoolbox();
				
				atb.handlers.del = function()
				{
					var arrange_id = atb.dom.saved_arrange.getDirectValue();
					if (!arrange_id)
					{
						return;
					}
					if (!window.confirm(rs.s('arrangebox.confirm_delete', 'Are you sure you want to delete arrange "{0}"?', [atb.sa_lookupValues[arrange_id] || ''])))
					{
						return;
					}
					
					var callback = function(result)
					{
						atb.arrangeCollection = result['arrangeCollection'];
						atb.setArrangeLookup(result['arrangeLookup']);
						atb.recreateToolbox();
					}
					self.AJAXQuery(['Table:deleteArrange', 'Table:getSavedArranges'], arrange_id, callback);
				}
				
				atb.handlers.save = function()
				{
					var data = {};
					data['columns'] = atb.arrangeBox.getDirectValue();
					
					if (data['columns'] == '')
					{
						window.alert(rs.s('arrangebox.columns_not_empty', 'Arrange columns must be non-empty'));
						return;
					}
					
					var answer = window.prompt(rs.s('arrangebox.enter_name','Enter arrange name'));
					if (answer == null || answer.trim() == "")
					{
						return;
					}
					else
					{
						answer = answer.trim().substr(0, 100);
					}
					for (var i in atb.sa_lookupValues)
					{
						if (atb.sa_lookupValues[i] == answer)
						{
							if (!window.confirm(rs.s('arrangebox.confirm_overwrite', 'Arrange "{0}" exists. Overwrite?', [answer])))
							{
								return;
							}
							else
							{
								break;
							}
						}
					}
					
					var callback = function(result)
					{
						atb.arrangeCollection = result['arrangeCollection'];
						atb.setArrangeLookup(result['arrangeLookup']);
						atb.recreateToolbox();
					}
					data['name'] = answer;
					self.AJAXQuery(['Table:saveArrange', 'Table:getSavedArranges'], data, callback);
				}
				
				atb.handlers.apply = function()
				{
					var data = {};
					data['id'] = atb.dom.saved_arrange.getDirectValue();
					data['columns'] = atb.arrangeBox.getDirectValue();
					if (data['columns'] == '')
					{
						window.alert(rs.s('arrangebox.columns_not_empty', 'Arrange columns must be non-empty'));
						return;
					}
					Aux.Form__Submit('Table:SetArrange', self.hi, data);
				}
				
				atb.options = [];
				for(var i in self.controls)
				{
					atb.options.push({k:i, v:self.controls[i].title});
				}
				atb.arrangeCollection = result['arrangeCollection'];
				atb.setArrangeLookup(result['arrangeLookup']);
				atb.create(content);
				atb.setValue(result['arrange']);
				atb.setDefaultArrange();
				if (atb.Combo)
				{
					atb.Combo.setValue("");
				}
				
				wnd.addContent(content);
				wnd.showInWindowCenter();
				wnd.changeCaption(rs.s('table.windows.arrange', 'Columns configuring'));
			}
			this.AJAXQuery(['Table:getSavedArranges'], null, f);
		},
		openFilterWindow: function()
		{
			var self = this;
			var f = function(result)
			{
				var wnd = self.getPopupWindow();
				wnd.options.defaultWidth = 630;
				wnd.options.defaultHeight = 250;
				var content = document.createElement('div');
				var ftb = new rs.filtertoolbox();
				ftb.setFilterCollection(result['savedFilters']);
				ftb.enable = self.options.afs.filter;
				ftb.saveFilterDialog = (self.options.args.view_id == null);
				ftb.handlers.setFilter = function()
				{
					var filter = ftb.getDynRecord();
					if(rs.utils.object_isEmpty(filter) || !ftb.verificationPassed)
					{
						var error = new rs.dialog();
						error.addDialogContent(document.createTextNode('Filter is empty or has errors'));
						error.showDialog();
						return;
					}
					wnd.hide();
					self.AJAXAction('Table:setFilter', filter);
				}
				ftb.handlers.disableFilter = function()
				{
					wnd.hide();
					self.AJAXAction('Table:disableFilter');
				}
				ftb.handlers.saveFilter = function()
				{
					var filter = ftb.getDynRecord();
					if(rs.utils.object_isEmpty(filter) || !ftb.verificationPassed)
					{
						var error = new rs.dialog();
						error.addDialogContent(document.createTextNode('Filter is empty or have errors'));
						error.showDialog();
						return;
					}
					
					var filter_data = {};
					filter_data['filter'] = filter;
					filter_data['id'] = '';
					if(ftb.dom.saved_combobox.dom.value)
					{
						if (window.confirm(rs.s('filter.confirm_change', 'Are you sure that you want to modify the filter "{0}"?',[ftb.filterCollection[ftb.dom.saved_combobox.dom.value]['name']])))
						{
							filter_data['id'] = ftb.dom.saved_combobox.dom.value;
						}			
					}
					if(filter_data['id'] == '')
					{
						var answer = window.prompt(rs.s('filter.enter_name','Enter {0} name', [ftb.Mode]));
						if (answer == null || answer.trim() == "")
						{
							return;
						}
						else
						{
							filter_data['name'] = answer.trim().substr(0, 100);
						}
					}
					else
					{
						filter_data['name'] = ftb.dom.saved_combobox.getStaticText(ftb.dom.saved_combobox.dom.value);
					}
					
					// Overwrite if exists?
					for (var i = 0; i < ftb.dom.saved_combobox.dom.lookup.length; i++)
					{
						if (
							ftb.dom.saved_combobox.dom.lookup[i]['v'] == filter_data['name']
							&& filter_data['id'] != i
						)
						{
							if (!window.confirm(rs.s('filter.confirm_overwrite', '{0} "{1}" exists. Overwrite?',[ftb.Mode, filter_data['name']])))
							{
								return;
							}
							else
							{
								filter_data['id'] = ftb.dom.saved_combobox.dom.lookup[i]['k'];
								break;
							}
						}
					}
					if(self.options.args.view_id == null)
					{
						filter_data['is_view'] = ftb.dom.is_view.dom.value;
					}
					filter_data['is_public'] = ftb.dom.is_public.dom.value
					
					var callback = function(result)
					{
						ftb.dom.savebox_container.removeChild(ftb.dom.savebox);
						ftb.dom.savebox = null;
						ftb.dom.arrow.className = 'sprite_closedFilterAdvancedIcon pointer';
						ftb.setFilterCollection(result['savedFilters']);
						ftb.changeSaveBox(ftb);
					}
					self.AJAXQuery(['Table:saveFilter', 'Table:getSavedFilters'], filter_data, callback);
				}
				ftb.handlers.deleteFilter = function()
				{
					var filter_data = {};
					var filter_id = ftb.dom.saved_combobox.getDirectValue();
					if (!filter_id)
					{
						return;
					}
					if (!window.confirm(rs.s('filter.confirm_delete', 'Are you sure you want to delete filter "{0}"?', [ftb.filterCollection[filter_id]['name']])))
					{
						return;
					}
					filter_data = {'id':filter_id, 'is_view':ftb.filterCollection[filter_id]['is_view']};
					var callback = function(result)
					{
						ftb.dom.savebox_container.removeChild(ftb.dom.savebox);
						ftb.dom.savebox = null;
						ftb.dom.arrow.className = 'sprite_closedFilterAdvancedIcon pointer';
						ftb.setFilterCollection(result['savedFilters']);
						ftb.changeSaveBox(ftb);
					}
					self.AJAXQuery(['Table:deleteFilter', 'Table:getSavedFilters'], filter_data, callback);
				}
				
				//ftb.events.onAddNode.add(function(){if(wnd.isShow)wnd.autoSize()});
				//ftb.events.onRemoveNode.add(function(){if(wnd.isShow)wnd.autoSize()});
				ftb.events.onShowToolbox.add(function(){if(wnd.isShow)wnd.autoSize()});
				ftb.events.onHideToolbox.add(function(){if(wnd.isShow)wnd.autoSize()});
				
				var controls = {};
				for(var i in self.controls)
				{
					if (self.controls[i] instanceof rs.filterbox)
					{
						continue;
					}
					controls[i] = self.controls[i].clone();
					controls[i].dom.notNull = false;
					controls[i].verifyRegExp = null;
				}
				ftb.controls = controls; 
				ftb.create(content);
				if(!rs.utils.object_isEmpty(self.options.filter))
				{
					ftb.setFilter(self.options.filter);
				}
				wnd.addContent(content);
				wnd.showInWindowCenter();
				wnd.changeCaption(rs.s('table.windows.filter', 'Filter'));
			}
			this.AJAXQuery(['Table:getSavedFilters'], null, f);
		},
		setRowset: function(rowset)
		{
			if(IS_MOZILLA || IS_OPERA || IS_CHROME)
			{
				//This faster in FF than set display 
				var replaceSpan = document.createElement('span');
				this.places['table'].replaceChild(replaceSpan, this.dom.table_rowset);
			}
			else
			{
				this.dom.table_rowset.style.display = 'none';
			}
			
			if(rowset.length > 0)
			{
				rs.lockAllEvents = true;
				this.hideInfoRow();
				
				// Init diff rows
				this.initRows(rowset.length);
				
				// Hide columns if needed
				for(var i = this.options.rowsCreated - 1; i >= rowset.length; i--)
				{
					this.hideRow(i);
				}
				
				// Create rows
				this.createRows(rowset.length);
				
				// Set value to all columns
				for(var i = 0; i < rowset.length; i++)
				{
					this.setRow(i, rowset[i]);
				}
				
				// Show columns
				for(var i = 0; i < rowset.length; i++)
				{
					this.showRow(i);
				}
				
				rs.lockAllEvents = false;
			}
			else
			{
				for(var i = 0; i < this.options.rowsCreated; i++)
				{
					this.hideRow(i);
				}
				this.showInfoRow();
			}
			
			if(rowset)
			{
				this.rowset = rowset;
			}
			this.fullRefresh();
			
			if(IS_MOZILLA || IS_OPERA || IS_CHROME)
			{
				this.places['table'].replaceChild(this.dom.table_rowset, replaceSpan);
			}
			else
			{
				this.dom.table_rowset.style.display = '';
			}
			
			this.refreshIlluminate();
			this.resetSelection();
		},
		getCell: function(rownum, cName)
		{
			return this.dom.table_rowset.rows[rownum + 2].cells[this.options.plainStruct[cName] - (this.options.mark ? 0 : 1)] || null;
		},
		addInternalCellStyle: function(rownum, cName, style)
		{
			var cell = this.getCell(rownum, cName);
			this.options.internalRowsetStyles[rownum] = this.options.internalRowsetStyles[rownum] || {};
			this.options.internalRowsetStyles[rownum][cName] = this.options.internalRowsetStyles[rownum][cName] || {};
			this.options.internalRowsetStyles[rownum][cName][style] = true;
			if(cell)
			{
				dom.addClass(cell, style);
			}
		},
		removeInternalCellStyle: function(rownum, cName, style)
		{
			var cell = this.getCell(rownum, cName);
			if(
				this.options.internalRowsetStyles[rownum]
				&& this.options.internalRowsetStyles[rownum][cName]
				&& this.options.internalRowsetStyles[rownum][cName][style]
			)
			{
				delete this.options.internalRowsetStyles[rownum][cName][style];
			}
			if(cell)
			{
				dom.deleteClass(cell, style);
			}
		},
		removeAllInternalCellStyles: function()
		{
			for(var i = 0; i < this.rowset.length; i++)
			{
				for(var cName in this.controls)
				{
					var cell = null;
					if(
						this.options.internalRowsetStyles[i]
						&& this.options.internalRowsetStyles[i][cName] != null
					)
					{
						cell = this.getCell(i, cName);
						if(cell)
						{
							for(var style in this.options.internalRowsetStyles[i][cName])
							{
								dom.deleteClass(cell, style);
							}
						}
						delete(this.options.internalRowsetStyles[i][cName]);
					}
				}
			}
		},
		setRowsetStyles: function(styles)
		{
			for(var i = 0; i < this.rowset.length; i++)
			{
				for(var cName in this.controls)
				{
					var cell = null;
					if(
						this.options.rowsetStyles[i]
						&& this.options.rowsetStyles[i][cName] != null
					)
					{
						cell = cell || this.getCell(i, cName);
						if(cell)
						{
							dom.deleteClass(cell, this.options.rowsetStyles[i][cName]);
						}
					}
					if(styles[i] && styles[i][cName])
					{
						cell = cell || this.getCell(i, cName);
						if(cell)
						{
							dom.addClass(cell, styles[i][cName]);
						}
					}
				}
			}
			this.options.rowsetStyles = styles;
			
			//Process triggers
			common.changeLockedClass();
		},
		refreshRow: function(rownum)
		{
			this.setActiveRow(rownum);
			for(var cName in this.controlsInRelationsSources)
			{
				if(this.controls[cName])
				{
					this.controls[cName].refresh();
				}
			}
		},
		fullRefresh: function()
		{
			for(var rownum = 0; rownum < this.rowset.length; rownum++)
			{
				this.refreshRow(rownum);
			}
		},
		maxSizeExceeded: function()
		{
			if(
				this.options.rowsetMaxSize > 0
				&& this.options.rowsetSize > this.options.rowsetMaxSize
			)
			{
				return true;
			}
			return false;
		},
		createFilterView: function()
		{
			this.filterView = new rs.filterviewbox();
			this.filterView.controls = this.controls;
			this.filterView.filter = this.options.filter;
			this.filterView.init();
		},
		setSort: function(name)
		{
			this.AJAXAction('Table:setSort', name);
		},
		getSetSortHandler: function(name)
		{
			var self = this;
			return function()
			{
				if(self.mode == 'normal')
				{
					self.setSort(name);
				}
			}
		},
		setPage: function(page)
		{
			this.AJAXAction('Table:setPage', page);
		},
		setPageSize: function(pageSize)
		{
			this.AJAXAction('Table:setPageSize', pageSize);
		},
		disableListEditMode: function()
		{
			for(var i = 0; i < this.dom.switchToEditMode.length; i++)
			{
				this.dom.switchToEditMode[i].disabled = true;
			}
		},
		enableListEditMode: function()
		{
			for(var i = 0; i < this.dom.switchToEditMode.length; i++)
			{
				this.dom.switchToEditMode[i].disabled = false;
			}
		},
		initMenu: function()
		{
			if(this.options.menu)
			{
				this.menu = new rs.menu();
				var m = this.menu;
				
				var self = this;
				m.addEventListener(
					'onHide',
					function()
					{
						if(self.selectedControl)
						{
							dom.deleteClass(self.selectedTd, 'select-menu-cell');
							self.selectedTd = null;
						}
						// Autorefresh unlock
						self.autoRefresh(true);
					}
				);
				m.addEventListener(
					'onShow',
					function()
					{
						// Autorefresh lock
						self.autoRefresh(false);
					}
				);
				
				m.addSection(1); //Simple
				m.addSection(2); //Marked
				m.addSection(3); //Filter
				m.addSection(4); //Arrange
				m.addSection(5); //Export
				m.addSection(6); //References
				m.addSection(7); //GUI procedure functions
				m.addSection(8); //Special procedures
				
				if(this.rights.insert)
				{
					m.addItem(1, rs.s('menu.add', 'Add'), "sprite_newdoc_smallIcon", Aux.Table__CtxMenu__Add.createCaller(this));
					if(this.rowset.length)
					{
						m.addItem(1, rs.s('menu.add_from_copy', 'Add from copy'), "sprite_copy_smallIcon", Aux.Table__CtxMenu__AddFromCopy.createCaller(this));
						if(this.options.canAddChild)
						{
							m.addItem(1, rs.s('menu.add_child', 'Add child'), 'sprite_copy_smallIcon', Aux.Table__CtxMenu__AddChild.createCaller(this));
						}
					}
				}
				
				if(this.options.canFiltered)
				{
					m.addChild(3, "filter", rs.s('menu.filter', 'Filter'), "sprite_filter_smallIcon", this.openFilterWindow.bind(this));
					m.childs['filter'].addSection(1);
					if(
						this.selectedControl
						&& !(this.controls[this.selectedControl] instanceof rs.iframe)
						&& !(this.controls[this.selectedControl] instanceof rs.filterbox)
						&& (this.controls[this.selectedControl].dataType != 'CL')
					)
					{
						m.childs['filter'].addItem(1, rs.s('menu.filter.from_cell', 'From cell value'), "", this.getAJAXActionHandler('Table:setFilterFromCell'));
						if(this.options.afs.filter)
						{
							m.childs['filter'].addItem(1, rs.s('menu.filter.from_cell_add', 'From cell value (add to configured)'), "", this.getAJAXActionHandler('Table:setFilterFromCellAdd'));
						}
					}
				}
				
				if(this.rowset.length)
				{
					m.addItem(1, rs.s('menu.view', 'View'), "sprite_docview_smallIcon", Aux.Table__CtxMenu__SetModeViewSingleRow.createCaller(this));
					if(this.existMarkedRows() && (this.rights.update || this.rights['delete']))
					{
						m.addChild(2, "marked", rs.s('menu.marked', 'Marked'), "sprite_smallFiles");
						m.childs["marked"].addSection(1);
					}
					if(this.rights.update || this.rights['delete'])
					{
						m.addChild(3, "filtered", rs.s('menu.filtered', 'Filtered'), "sprite_smallFiles");
						m.childs["filtered"].addSection(1);
					}
					if(this.rights.update)
					{
						m.addItem(1, rs.s('menu.edit', 'Edit'), "sprite_edit_smallIcon", Aux.Table__CtxMenu__Edit.createCaller(this));
						if(this.options.canGroupEdit)
						{
							if(this.existMarkedRows())
							{
								m.childs["marked"].addItem(1, rs.s('menu.edit', 'Edit'), "sprite_edit_some_smallIcon", Aux.Table__CtxMenu__EditRowsMarked.createCaller(this, false));
								m.childs["marked"].addItem(1, rs.s('menu.edit_group_fast', 'Edit without find equal'), "sprite_edit_some_smallIcon", Aux.Table__CtxMenu__EditRowsMarked.createCaller(this, true));
							}
							m.childs["filtered"].addItem(1, rs.s('menu.edit', 'Edit'), "sprite_edit_some_smallIcon", Aux.Table__CtxMenu__EditRowsFilter.createCaller(this, false));
							m.childs["filtered"].addItem(1, rs.s('menu.edit_group_fast', 'Edit without find equal'), "sprite_edit_some_smallIcon", Aux.Table__CtxMenu__EditRowsFilter.createCaller(this, true));
						}
					}
					if(this.rights['delete'])
					{
						m.addItem(1, rs.s('menu.delete', 'Delete'), "sprite_delete_doc_smallIcon", this.getDeleteHandler('selected'));
						if(this.existMarkedRows())
						{
							m.childs["marked"].addItem(1, rs.s('menu.delete', 'Delete'), "sprite_delete_some_smallIcon", this.getDeleteHandler('marked'));
						}
						m.childs["filtered"].addItem(1, rs.s('menu.delete', 'Delete'), "sprite_delete_some_smallIcon", this.getDeleteHandler('filtered'));
					}
				}
				
				if(this.options.canArrange)
				{
					m.addItem(4, rs.s('menu.arrange_columns', 'Arrange columns'), "sprite_tools_smallIcon", this.openArrangeWindow.bind(this));
				}
				
				if(this.options.canAutoRefresh)
				{
					m.addItem(4, rs.s('menu.autorefresh', 'Configure autorefresh'), "sprite_refresh_smallIcon", this.openAutorefreshWindow.bind(this));
				}
				
				if(this.options.canExport && this.rowset.length)
				{
					m.addItem(5, rs.s('menu.export', 'Export data'), "sprite_export_smallIcon", Aux.Table__CtxMenu__ExportData.createCaller(this));
				}
				
				if(this.references.length > 0 && this.rowset.length)
				{
					m.addChild(6, "tr", rs.s('menu.related_tables', 'Filter related tables'), "sprite_tables_smallIcon");
					m.childs['tr'].addSection(1);
					for(var i = 0; i < this.references.length; i++)
					{
						m.childs['tr'].addItem(1, this.references[i]['title'], "", Aux.Table__CtxMenu__MoveByReference(this, this.references[i]['hi'], "TR"));
					}
				}
				
				if(this.guiProceduresReferences.length > 0 && this.rowset.length)
				{
					m.addChild(7, "gpr", rs.s('menu.related_procedures', 'Related procedures'), "sprite_gear_smallIcon");
					m.childs['gpr'].addSection(1);
					for(var i = 0; i < this.guiProceduresReferences.length; i++)
					{
						m.childs['gpr'].addItem(1, this.guiProceduresReferences[i]['title'], "", Aux.Table__CtxMenu__MoveByReference(this, this.guiProceduresReferences[i]['hi'], "GPR"));
					}
				}
				
				if(this.specialProcedures.length > 0 && this.rowset.length)
				{
					m.addChild(8, "sf", rs.s('menu.special_function', 'Special function'), "sprite_gear_smallIcon");
					m.childs['sf'].addSection(1);
					for(var i = 0; i < this.specialProcedures.length; i++)
					{
						m.childs['sf'].addItem(1, this.specialProcedures[i]['title'] + ' (' + rs.s('uipr.marked_or_selected', 'marked or selected') + ')', "", Aux.Table__CtxMenu__CallProcedure(this, this.specialProcedures[i]['hi'], false));
						m.childs['sf'].addItem(1, this.specialProcedures[i]['title'] + ' (' + rs.s('uipr.filtered', 'all filtered') + ')', "", Aux.Table__CtxMenu__CallProcedure(this, this.specialProcedures[i]['hi'], true));
					}
				}
			}
		},
		existMarkedRows: function()
		{
			for(var i = 0; i < this.illuminateRows.length; i ++)
			{
				if(this.illuminateRows[i])
				{
					return true;
				}
			}
			return false;
		},
		createCaption: function(e)
		{
			if (this.options.caption)
			{
				var table = document.createElement("table");
				table.className = "ctl-container-caption";
				table.border = 0;
				
				var tr = table.insertRow(0);
				var td = tr.insertCell(tr.cells.length);
				td.className = "icon";
				var div = document.createElement("div");
				dom.addClass(div, "sprite_appIcon pointer");
				td.appendChild(div);
				td.onclick = this.changeHidden.bind(this);
				
				var td = tr.insertCell(tr.cells.length);
				this.hidedObjects.caption = td;
				td.className = "caption pointer";
				var text = document.createTextNode(this.title || this.name || "");
				td.appendChild(text);
				td.title = this.hint || "";
				td.onclick = this.changeHidden.bind(this);
				
				//Place for buttons
				var td = tr.insertCell(tr.cells.length);
				td.className = 'button';
				this.dom.placeForButtons = td;
				this.hidedObjects.hide['buttons'] = td;
				
				e.appendChild(table);
			}
		},
		setRow: function(rownum, row)
		{
			this.setActiveRow(rownum);
			rs.lockAllRefresh = true;
			for(var cName in this.controls)
			{
				if(this.options.columnsInitInfo[cName] >= rownum)
				{
					if(this.options.plainStruct[cName])
					{
						if(this.controls[cName].dom.mode == 'not_created')
						{
							var self = this;
							var getRedFillHandler = function(rownum, cName)
							{
								return function()
								{
									self.removeInternalCellStyle(rownum, cName, 'green_fill');
									self.addInternalCellStyle(rownum, cName, 'red_fill');
								}
							}
							var getRedUnFillHandler = function(td)
							{
								return function()
								{
									self.removeInternalCellStyle(rownum, cName, 'red_fill');
								}
							}
							var getGreenFillHandler = function(rownum, cName)
							{
								return function(control, value)
								{
									if(
										self.options.rowsChanged !== false
									)
									{
										if(
											value != self.rowset[rownum][cName]
											&&
												!((value == "" || value == null)
												&& (self.rowset[rownum][cName] == "" || self.rowset[rownum][cName] == null))
										)
										{
											self.addInternalCellStyle(rownum, cName, 'green_fill');
											self.options.rowsChanged[rownum] = self.options.rowsChanged[rownum] || {};
											self.options.rowsChanged[rownum][cName] = true;
										}
										else
										{
											self.removeInternalCellStyle(rownum, cName, 'green_fill');
											if(self.options.rowsChanged[rownum])
											{
												self.options.rowsChanged[rownum][cName] = false;
											}
										}
									}
								}
							}
							var cell = this.getCell(rownum, cName);
							if(
								this.rowset.length <= rownum
								|| this.rowset[rownum][cName] !== null
								&& this.rowset[rownum][cName] !== ""
							)
							{
								// It faster than innerHTML
								if(cell.firstChild)
								{
									cell.removeChild(cell.firstChild);
								}
							}
							this.controls[cName].addEventListener('onVerifyFailed', getRedFillHandler(rownum, cName));
							this.controls[cName].addEventListener('onVerifyPassed', getRedUnFillHandler(rownum, cName));
							this.controls[cName].addEventListener('onChange', getGreenFillHandler(rownum, cName));
							switch(this.mode)
							{
								case 'listedit':
								{
									this.controls[cName].create(cell);
									break;
								}
								case 'normal':
								{
									if(this.controls[cName] instanceof rs.button)
									{
										this.controls[cName].setRow(row);
									}
									this.controls[cName].createStatic(cell);
									break;
								}
							}
						}
						var mode = (this.mode == 'listedit' ? 'dynamic' : 'static');
						if(
							this.controls[cName].dom.mode != mode
							&& !this.controls[cName].isStatic
						)
						{
							this.controls[cName].dom.mode = mode;
							this.controls[cName].reCreate();
						}
					}
					this.controls[cName].setInitValue(row[cName]);
					this.controls[cName].setValue(row[cName]);
				}
				else if(
					this.options.plainStruct[cName]
					&&
					(
						this.rowset[rownum]
						&& this.rowset[rownum][cName] != row[cName]
						|| this.rowset.length <= rownum
					)
				)
				{
					var cell = null;
					cell = cell || this.getCell(rownum, cName);
					if(cell.firstChild)
					{
						cell.removeChild(cell.firstChild);
					}
					if(row[cName] !== null && row[cName] !== "")
					{
						cell = cell || this.getCell(rownum, cName);
						switch(this.mode)
						{
							case 'columnsequence':
							{
								cell.appendChild(document.createTextNode(row[cName] || ''));
								break;
							}
							default:
							{
								cell.appendChild(this.controls[cName].getStaticContent(row[cName]));
								break;
							}
						}
					}
				}
			}
			rs.lockAllRefresh = false;
		},
		initRows: function(count)
		{
			var controls = {};
			for(var cName in this.controlsInRelations)
			{
				controls[cName] = true;
			}
			for(var cName in this.controls)
			{
				if(
					!this.controls[cName].isStatic
					&& this.mode == 'listedit'
					|| this.controls[cName] instanceof rs.button
				)
				{
					controls[cName] = true;
				}
			}
			for(var cName in controls)
			{
				for(var i = (this.options.columnsInitInfo[cName] || 0); i < count; i++)
				{
					this.controls[cName].newInstance(i);
					this.attachToControlEvents(this.controls[cName], i);
				}
				if(
					!this.options.columnsInitInfo[cName]
					|| this.options.columnsInitInfo[cName] < count
				)
				{
					this.options.columnsInitInfo[cName] = count;
				}
			}
			// New instance automaticaly set it by default but active row not changed
			this.setActiveRow(count - 1);
		},
		createRows: function(count)
		{
			if(count <= this.options.rowsCreated)
			{
				return;
			}
			
			var row = document.createElement('tr');
			if (this.options.mark && this.mode == 'normal')
			{
				var td = document.createElement('td');
				td.className = "center no-print first_col";
				var checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.className = "mark";
				td.appendChild(checkbox);
				row.appendChild(td);
			}
			for (var cName in this.options.plainStruct)
			{
				var td = document.createElement('td');
				if(this.controls[cName].baseStyle)
				{
					dom.addClass(td, this.controls[cName].baseStyle);
				}
				if(this.mode == 'columnsequence')
				{
					td.colSpan = 3;
				}
				row.appendChild(td);
			}
			
			for(var i = 0; i < count - this.options.rowsCreated; i++)
			{
				var tr = row.cloneNode(true);
				if(this.dom.table_rowset.tBodies && this.dom.table_rowset.tBodies[0])
				{
					this.dom.table_rowset.tBodies[0].appendChild(tr);
				}
				else
				{
					this.dom.table_rowset.appendChild(tr);
				}
				for(var k = (this.options.mark ? 1 : 0); k < tr.cells.length; k++)
				{
					tr.cells[k].onclick = this.ctxClick(this.options.rowsCreated + i, k, tr.cells[k]);
				}
				if(this.options.mark)
				{
					this.checkboxesMark.push(tr.cells[0].firstChild);
					tr.cells[0].firstChild.onclick = this.handler_mark.bind(this);
				}
			}
			this.options.rowsCreated = count;
		},
		hideRow: function(rownum)
		{
			this.dom.table_rowset.rows[rownum + 2].style.display = 'none';
		},
		showRow: function(rownum)
		{
			this.dom.table_rowset.rows[rownum + 2].style.display = '';
		},
		getCaptionHoverHandler: function(text, sort, hover)
		{
			if(hover)
			{
				return function()
				{
					dom.addClass(text, 'over');
					dom.addClass(sort, 'over');
				}
			}
			else
			{
				return function()
				{
					dom.deleteClass(text, 'over');
					dom.deleteClass(sort, 'over');
				}
			}
		},
		createTable: function(e)
		{
			var controlStruct = this.options.plainStruct;
			
			// Main table
			var table = document.createElement("table");
			//e.appendChild(table);
			this.dom.locks.clickElements.push(table);
			this.dom.table_rowset = table;
			table.cellPadding = 0;
			table.cellSpacing = 0;
			table.className = "ctl-table";
			//table.style.width = 200 + 'px';
			this.tableColSpan = 0;

			// Header
			switch(this.mode)
			{
				case 'columnsequence':
				{
					var tr = table.insertRow(table.rows.length);
					tr.className = "header";
					this.dom.div_heads = {};
					// Column headers
					var i = 0;
					for (var cName in controlStruct)
					{
						var control = this.controls[cName];
						var th = document.createElement("th");
						th.className = "dleft";
						tr.appendChild(th);
						if(i!=0)
						{
							th.className += " pointer";
							th.onclick = this.toLeftCol.bind(this).createCaller(i);
							var div = document.createElement("div");
							div.className = "sprite_dleftIcon";
							th.onmouseover = rs.utils.replaceClass.createCaller(div, "sprite_dleftliteIcon");
							th.onmouseout = rs.utils.replaceClass.createCaller(div, "sprite_dleftIcon");
							th.appendChild(div);
						}
						this.dom.columnHeaders[i] = {};
						this.dom.columnHeaders[i].name = cName;
						this.dom.columnHeaders[i].thBorder = th;
	
						this.tableColSpan += 3;
						var th = document.createElement("th");
						th.className = "pointer over cname";
						th.onclick = this.divMouseDown(i);
	
						th.title = control.hint || "";
						var txt = control.title || cName || "";
						var text = document.createTextNode(txt);
						th.appendChild(text);
						this.dom.columnHeaders[i].th = th;
						tr.appendChild(th);
	
						var th = document.createElement("th");
						th.className = 'dright';
						tr.appendChild(th);
						if((i+1)<this.control_counter)
						{
							th.className += " pointer";
							th.onclick = this.toRightCol.bind(this).createCaller(i);
	
							var div = document.createElement("div");
							div.className = "sprite_drightIcon";
							th.onmouseover = rs.utils.replaceClass.createCaller(div, "sprite_drightliteIcon");
							th.onmouseout = rs.utils.replaceClass.createCaller(div, "sprite_drightIcon");
							th.appendChild(div);
						}
	
						this.mdown = null;
	
						var div = document.createElement("div");
						div.className = "ctl-table-opacity pointer";
						div.style.display = "none";
						div.cellSpacing = 0;
						div.cellPadding = 0;
						div.onclick = this.divMouseUp();
	
						var table_int = document.createElement("table");
						table_int.className = "ctl-table";
						
						table_int.style.width = "100%";
						table_int.style.height = "100%";
						table_int.style.minWidth = '0px';
						
						table_int.cellSpacing = 0;
						table_int.cellPadding = 0;
	
						div.appendChild(table_int);
	
						var tr_int = table_int.insertRow(table_int.rows.length);
						tr_int.className = "header";
						var th = document.createElement("th");
						th.className = "opacity";
						th.appendChild(document.createTextNode(txt));
						tr_int.appendChild(th);
	
						document.body.appendChild(div);
						this.dom.div_heads[cName] = div;
	
						i++;
					}
	
					var table_ext = document.createElement("table");
					table_ext.className = "ctl-table-opacity";
					table_ext.style.display = "none";
					table_ext.cellSpacing = 0;
					table_ext.cellPadding = 0;
	
					var tr_ext = table_ext.insertRow(0);
					var td = tr_ext.insertCell(0);
					var div = document.createElement("div");
					div.className = "sprite_pointerIcon";
					td.appendChild(div);
	
					e.appendChild(table_ext);
					this.dom.div_pointer = table_ext;
					break;
				}
				case 'normal':
				case 'listedit':
				{
					this.checkboxesMark = [];
					var tr = table.insertRow(table.rows.length);
					tr.className = "header";
	
					// Mark all checkbox
					if (this.options.mark && this.mode!='listedit')
					{
						var th = document.createElement("th");
						th.className = "mark-all no-print first_col";
						var checkbox = document.createElement("input");
						checkbox.type = "checkbox";
						checkbox.className = "mark";
						checkbox.title = rs.s('table.page.mark', 'Mark/Unmark all visible');
						checkbox.onclick = this.handler_markAll.bind(this);
						this.dom.checkbox_markAll = checkbox;
						th.appendChild(checkbox);
						tr.appendChild(th);
					}
	
					// Column headers
					for (var cName in controlStruct)
					{
						var control = this.controls[cName];
						var th = document.createElement("th");
						th.className = "title";
						th.title = control.hint || "";
						
						// Sort function
						if (this.options.sort)
						{
							th.className += " pointer";
							var self = this;
							th.onclick = this.getSetSortHandler(cName);
						}
						else (this.mode == 'listedit')
						{
							th.className += " data-editable";
						}
						if (tr.childNodes.length==0)
						{
							th.className += " first_col";
						}
						tr.appendChild(th);
						
						// Caption container
						var container = document.createElement('table');
						container.className = 'caption';
						var containerTr = container.insertRow(0);
						var containerText = containerTr.insertCell(0);
						containerText.className = 'text';
						var containerSort = containerTr.insertCell(1);
						th.appendChild(container);
						th.onmouseover = this.getCaptionHoverHandler(containerText, containerSort, true);
						th.onmouseout = this.getCaptionHoverHandler(containerText, containerSort, false);
						this.dom.columnHeaders.push({name: cName, sort: containerSort});
						
						// Caption
						var div = document.createElement('div');
						div.className = 'text';
						var txt = control.title || cName || "";
						var text = document.createTextNode(txt);
						div.appendChild(text);
						containerText.appendChild(div);
					}
				}
			}
			
			// Add no data row
			var controlCounter = 0;
			for(var i in this.options.plainStruct)
			{
				controlCounter++;
			}
			var tr = this.dom.table_rowset.insertRow(this.dom.table_rowset.rows.length);
			this.dom.infoRow = tr;
			tr.className = "odd";
			var td = tr.insertCell(0);
			if(this.mode == 'columnsequence')
			{
				td.colSpan = this.tableColSpan;
			}
			else
			{
				if(this.options.mark && this.mode != 'listedit')
				{
					controlCounter++;
				}
				td.colSpan = controlCounter;
			}
			td.className = "italic nodata";
			td.onclick = this.ctxClick(null);
			
			// Rowset
			e.appendChild(table);
			//this.AJAXAction('Table:refreshRowset');
		},
		hideInfoRow: function()
		{
			this.dom.infoRow.style.display = 'none';
			this.options.infoRowShowed = false;
		},
		showInfoRow: function(type)
		{
			var controlCounter = 0;
			for(var i in this.options.plainStruct)
			{
				controlCounter++;
			}
			var infoCell = this.dom.infoRow.cells[0];
			infoCell.innerHTML = '';
			
			var infoTable = document.createElement("table");
			infoTable.style.width = '100%';
			var infoTr = infoTable.insertRow(infoTable.rows.length);
			
			if (this.maxSizeExceeded())
			{
				var text = rs.s('table.page.many_result', 'Too many results found (>{0}),\n' + 'please narrow down your search by adding search criteria', [this.options.rowsetMaxSize]);
			}
			else
			{
				var text = rs.s('table.page.no_data','No data');
			}
			
			for (var i = 0; i < controlCounter/15; i++)
			{
				var infoTd = infoTr.insertCell(infoTr.cells.length);
				infoTd.appendChild(document.createTextNode(text));
				infoTd.className = "center nodata";
			}
			
			infoCell.appendChild(infoTable);
			
			this.options.infoRowShowed = true;
			this.dom.infoRow.style.display = '';
		},
		clearPlaces: function(places)
		{
			if(places)
			{
				var modPlaces = {};
				for(var i = 0; i < places.length; i++)
				{
					modPlaces[places[i]] = null;
				}
				places = modPlaces;
			}
			else
			{
				places = this.places;
			}
			for(var i in places)
			{
				this.places[i].innerHTML = '';
			}
		},
		syncPaging: function(paging)
		{
			this.options.rowsetSize = parseInt(paging.rowsetSize);
			this.options.page = parseInt(paging.page);
			this.options.pageSize = parseInt(paging.pageSize);
			this.options.rowsetMaxSize = parseInt(paging.maxSize);
		},
		refreshToolboxes: function()
		{
			this.clearPlaces(['topToolbox', 'bottomToolbox']);
			if(this.rowset.length >= this.options.numberOfRowsToShowToolboxOnTop)
			{
				this.createToolbox(this.places.topToolbox);
			}
			this.createToolbox(this.places.bottomToolbox);
		},
		changeMode: function(mode, param)
		{
			this.stopAutoRefresh();
			
			if(mode == this.mode)
			{
				return;
			}
			else
			{
				if(mode && mode != 'listedit' && this.mode == 'listedit')
				{
					this.dom.events.onExitFromListEditMode.execute(this);
				}
				
				mode = mode || this.mode;
				this.mode = mode;
			}
			
			if(!this.dom.table_rowset)
			{
				this.createTable(this.places.table);
			}
			
			if(mode == 'listedit')
			{
				this.dom.events.onChangeToListEditMode.execute(this);
				var rs_table = this;
				this.submit = function()
				{
					Aux.Table__UpdateRows(rs_table);
				}
				if(this.options.mark)
				{
					dom.addClass(this.dom.checkbox_markAll, 'hidden');
					for(var i = 0; i < this.checkboxesMark.length; i++)
					{
						dom.addClass(this.checkboxesMark[i], 'hidden');
					}
				}
			}
			else
			{
				this.submit = function(){};
				if(this.options.mark)
				{
					dom.deleteClass(this.dom.checkbox_markAll, 'hidden');
					for(var i = 0; i < this.checkboxesMark.length; i++)
					{
						dom.deleteClass(this.checkboxesMark[i], 'hidden');
					}
				}
			}
			
			//Hide menus if opened.
			env.pm.hideAll('rs.menu');
			
			if (this.options.staticRowset == false)
			{
				if(this.rowset.length > 0)
				{
					this.setRowset(this.rowset);
					this.removeAllInternalCellStyles();
					this.options.rowsChanged = (this.options.enableRowsChanged ? (this.mode == 'listedit' ? [] : false) : false);
				}
				else
				{
					this.AJAXAction('Table:refreshRowset');
				}
			}
			
			this.clearPlaces(['caption']);
			this.createCaption(this.places.caption);
			this.refreshToolboxes();
			this.refreshButtons();
			this.refreshSort();
			
			this.dom.table_rowset.className = 'ctl-table ctl-table-' + mode;
		},
		createToolbox: function(e)
		{
			if(this.options.toolbox && !this.options.infoRowShowed)
			{
				var table = document.createElement("table");
				this.dom.locks.clickElements.push(table);
				table.className = "ctl-table-paging";
				var rs_table = this;
				var tr = table.insertRow(table.rows.length);
				
				var td = tr.insertCell(tr.cells.length);
				if(this.mode == 'listedit')
				{
					var button = document.createElement('input');
					button.type = 'button';
					button.value = rs.s('common.ok', 'OK');
					button.onclick = function()
					{
						Aux.Table__UpdateRows(rs_table);
					}
					button.className="submitButton";
					td.appendChild(button);
					
					var button = document.createElement('input');
					button.type = 'button';
					button.value = rs.s('common.cancel', 'Cancel');
					button.onclick = function()
					{
						rs_table.changeMode('normal');
					}
					td.appendChild(button);
				}
				if(this.mode == 'normal')
				{
					if((!readonly4wbs)&&this.options.listedit)
					{
						var td = tr.insertCell(tr.cells.length);
						var button = document.createElement('input');
						this.dom.switchToEditMode.push(button);
						button.type = 'button';
						button.value = rs.s('table.page.switch_edit', 'Switch to edit mode');
						button.onclick = function()
						{
							rs_table.changeMode('listedit');
						}
						td.appendChild(button);
					}
				}
				td.className = 'padding-right'
				
				if(this.mode != 'listedit')
				{
					var td = tr.insertCell(tr.cells.length);
					
					var text = document.createTextNode(rs.s('table.page.rows', 'Rows')+':');
					td.appendChild(text);
					// image buttons for left
					var td = tr.insertCell(tr.cells.length);
					var div = document.createElement("div");
					div.className = this.options.page ? "pagingIcon sprite_pageFirst" : "pagingIcon sprite_pageFirstGray";
					div.title = rs.s('table.page.go_first_page', 'Go to first page');
					if(this.options.page)
					{
						div.className += " pointer";
						div.onclick = function()
						{
							rs_table.setPage(0);
						};
					}
					td.appendChild(div);
		
					var td = tr.insertCell(tr.cells.length);
					var div = document.createElement("div");
					div.className = this.options.page ? "pagingIcon sprite_pagePrev" : "pagingIcon sprite_pagePrevGray";
					div.title = rs.s('table.page.go_prev_page','Go to previous page');
					if(this.options.page)
					{
						div.className += " pointer";
						div.onclick = function()
						{
							rs_table.setPage((rs_table.options.page - 1)<0?0:rs_table.options.page - 1);
						};
					}
					td.appendChild(div);
		
					// combobox for select rows
					var td = tr.insertCell(tr.cells.length);
					td.className = "left";
					var select = document.createElement("select");
					td.appendChild(select);
		
					var pgSize = this.options.pageSize;
					var linksLinage = 10;
					var pgLast = Math.ceil(this.options.rowsetSize/pgSize) - 1;
					var pgMin = Math.max(0, this.options.page - linksLinage/2);
					var pgMax = Math.min(pgLast, pgMin + linksLinage);
					var pgMin = Math.max(0, pgMax - linksLinage);
					var selectedIndex = this.options.page - pgMin;
					if (pgMin > 0)
					{
						var txt = 1 + "-" + pgSize;
						addOption(select, txt, 0, false)
						addOption(select, "...", pgMin, false);
						selectedIndex+=2;
					}
					for (var i=pgMin; i<=pgMax; i++)
					{
						var txt = (i*pgSize+1) + "-" + Math.min((i+1)*pgSize, this.options.rowsetSize);
						addOption(select, txt, i, false);
					}
					if (pgMax < pgLast)
					{
						addOption(select, "...", pgMax, false);
						var txt = (pgLast*pgSize+1) + "-" + this.options.rowsetSize;
						addOption(select, txt, pgLast, false);
					}
					select.selectedIndex = selectedIndex;
					select.onchange = function()
					{
						rs_table.setPage(select.options[select.selectedIndex].value);
					};
		
					// image buttons for right
					var td = tr.insertCell(tr.cells.length);
					var div = document.createElement("div");
					div.className = this.options.page != pgMax ? "pagingIcon sprite_pageNext" : "pagingIcon sprite_pageNextGray";
					div.title = rs.s('table.page.go_next_page','Go to next page');
					if(this.options.page != pgMax)
					{
						div.className += " pointer";
						div.onclick = function()
						{
							rs_table.setPage((rs_table.options.page + 1)>pgLast?pgLast:(rs_table.options.page + 1));
						};
					}
					td.appendChild(div);
		
					var td = tr.insertCell(tr.cells.length);
					var div = document.createElement("div");
					div.className = this.options.page != pgMax ? "pagingIcon sprite_pageLast" : "pagingIcon sprite_pageLastGray";
					div.title = rs.s('table.page.go_last_page', 'Go to last page');
					if(this.options.page != pgMax)
					{
						div.className += " pointer";
						div.onclick = function()
						{
							rs_table.setPage(pgLast);
						};
					}
					td.className = "padding-right";
					td.appendChild(div);
		
					// combobox for select rows on page
					var td = tr.insertCell(tr.cells.length);
					var td = tr.insertCell(tr.cells.length);
					var text = document.createTextNode(rs.s('table.page.rows_on_page', 'Rows on page')+':');
					td.appendChild(text);
					var td = tr.insertCell(tr.cells.length);
					td.className = "left";
					var select_row_on_page = document.createElement("select");
					td.appendChild(select_row_on_page);
		
					var i = 0;
					for (var ps = 0; ps < this.options.selectPageSize.length; ps++)
					{
						addOption(select_row_on_page, this.options.selectPageSize[ps], this.options.selectPageSize[ps], false);
						if(this.options.selectPageSize[ps] == this.options.pageSize)
						{
							select_row_on_page.selectedIndex = i;
						}
						i++;
					}
					select_row_on_page.onchange = function()
					{
						rs_table.setPageSize(select_row_on_page.options[select_row_on_page.selectedIndex].value);
					};
				}
				e.appendChild(table);
			}
		},
		create: function(e)
		{
			this.dom.place = document.createElement('div');
			this.dom.place.className = 'tablePlace';
			
			// Create exeption place
			this.prepareExceptions(e);
			
			// Caption
			this.places['caption']			= document.createElement('div');
			
			// Tooboxes
			this.places['topToolbox'] 		= document.createElement('div');
			this.places['bottomToolbox']	= document.createElement('div');
			
			// Scrolling content
			this.places['table'] 			= document.createElement('div');
			
			this.dom.place.appendChild(this.places['caption']);
			this.dom.place.appendChild(this.places['topToolbox']);
			this.dom.place.appendChild(this.places['table']);
			this.dom.place.appendChild(this.places['bottomToolbox']);
			
			this.hidedObjects.hide['topToolbox'] = this.places['topToolbox'];
			this.hidedObjects.hide['table'] = this.places['table'];
			this.hidedObjects.hide['bottomToolbox'] = this.places['bottomToolbox'];
			
			e.appendChild(this.dom.place);
			this.changeMode();
			this.checkHidden();
		},
		resetSelection: function()
		{
			this.selectedRow = null;
			if(this.options.mark)
			{
				this.dom.checkbox_markAll.checked = false;
				this.handler_markAll();
			}
		},
		handler_markAll: function()
		{
			env.pm.hideAll('rs.menu');
			var allChecked = this.dom.checkbox_markAll.checked;
			for (var i=0; i<this.checkboxesMark.length; i++)
			{
				this.checkboxesMark[i].checked = allChecked;
				if(allChecked)
				{
					this.illuminateRows[i] = true;
				}
				else
				{
					this.illuminateRows[i] = false;
				}
			}
			this.refreshIlluminate();
		},
		handler_mark: function()
		{
			env.pm.hideAll('rs.menu');
			var allChecked = true;
			for (var i=0; i<this.checkboxesMark.length; i++)
			{
				if (!this.checkboxesMark[i].checked)
				{
					allChecked = false;
					this.illuminateRows[i] = false;
				}
				else
				{
					this.illuminateRows[i] = true;
				}
			}
			this.refreshIlluminate();
			this.dom.checkbox_markAll.checked = allChecked;
		},
		ctxClick: function(rownum, count, td)
		{
			var sender = this;
			if(this.options.mark)
			{
				count--;
			}
			return function(e)
			{
				if(sender.mode == 'normal')
				{
					sender.selectedControl = null;
					var counter = 0;
					for(var cName in sender.options.plainStruct)
					{
						if(counter == count)
						{
							sender.selectedControl = cName;
							break;
						}
						counter++;
					}
					if (sender.menu)
					{
						sender.menu.hide();
					}
					sender.initMenu();
					if (sender.menu)
					{
						e = e ? e : window.event ? window.event : '';
						if (e.ctrlKey)
						{
							rs.utils.bubbleEvent(e);
							if (sender.options.mark)
							{
								sender.checkboxesMark[rownum].checked = !sender.checkboxesMark[rownum].checked;
								sender.handler_mark();
							}
							else
							{
								sender.illuminateRows[rownum] = !sender.illuminateRows[rownum];
								sender.refreshIlluminate();
							}
							return false;
						}
						else
						{
							env.pm.hideAll('rs.menu');
							if (rownum || rownum == 0)
							{
								sender.illuminateSelectedRow(rownum, td);
							}
							sender.menu.hide();
							sender.menu.showFromMouse(e);
						}
						return;
					}
				}
				return;
			}
		},
		illuminateRow: function(rownum, style)
		{
			this.dom.table_rowset.rows[rownum+2].className = style;
		},
		illuminateCell: function(td)
		{
			if (this.selectedTd)
			{
				dom.deleteClass(this.selectedTd, 'select-menu-cell');
			}
			dom.addClass(td, 'select-menu-cell');
			this.selectedTd = td;
		},
		illuminateSelectedRow: function(rownum, td)
		{
			this.selectedRow = rownum;
			this.refreshIlluminate();
			this.illuminateRow(rownum, "select-menu");
			this.illuminateCell(td);
		},
		refreshIlluminate: function()
		{
			for (var i=0; i<this.rowset.length; i++)
			{
				if(i == this.selectedRow)
				{
					continue;
				}

				if(this.illuminateRows[i])
				{
					this.dom.table_rowset.rows[i+2].className = i%2 ? "select-marked-even" : "select-marked-odd";
				}
				else
				{
					this.dom.table_rowset.rows[i+2].className = i%2? "even":"odd";
				}
			}
		},
		swapCols: function(i, j)
		{
			var colHed = this.dom.columnHeaders;

			if(i < 0) i = 0;
			if(i >= colHed.length) i = colHed.length-1;
			if(j < 0) j = 0;
			if(j >= colHed.length) j = colHed.length-1;

			var nName = colHed[j].name;
			colHed[j].name = colHed[i].name;
			colHed[i].name = nName;

			var control = this.controls[colHed[j].name];
			var th = colHed[j].th;
			while(th.firstChild)
			{
			    th.removeChild(th.firstChild);
			}

			th.title = control.hint || "";
			var txt = control.title || cName || "";
			var text = document.createTextNode(txt);
			th.appendChild(text);

			var control = this.controls[nName];
			var th = colHed[i].th;
			while(th.firstChild)
			{
			    th.removeChild(th.firstChild);
			}
			th.title = control.hint || "";
			var txt = control.title || cName || "";
			var text = document.createTextNode(txt);
			th.appendChild(text);
		},
		toLeftCol: function(i)
		{
			for(var j = i-1; j>=0;j--,i--)
			{
				this.swapCols(i,j);
			}
		},
		toRightCol: function(i)
		{
			var colHed = this.dom.columnHeaders;

			for(var j = i+1; j<=colHed.length;j++,i++)
			{
				this.swapCols(i,j);
			}
		},
		divMouseMove: function()
		{
			var div = this;
			return function(e)
			{
				div.setDivPosition(e);
				for(var i=0; i<div.dom.columnHeaders.length; i++)
				{
					var colHead = div.dom.columnHeaders[i].th;
					var pos = dom.getMousePosition(e);
					if(pos.x >= colHead.offsetLeft && pos.x <= colHead.offsetLeft + colHead.clientWidth)
					{
						var pos = dom.getElementPosition(div.dom.columnHeaders[i].thBorder);
						var left = pos.x;
						var pointer = div.dom.div_pointer;
						pointer.style.display = "";

						if(i > div.mdown)
						{
							if(i == div.dom.columnHeaders.length - 1)
							{
								pointer.style.left = left - pointer.clientWidth/2 + colHead.clientWidth + "px";
							}
							else
							{
								pointer.style.left = left - pointer.clientWidth/2 + "px";
							}
							pointer.style.top = div.dom.table_rowset.offsetTop - 22 + "px";
						}
						else
						{
							pointer.style.left = left - pointer.clientWidth/2 + "px";
							pointer.style.top = div.dom.table_rowset.offsetTop - 22 + "px";
						}
						break;
					}
				}
			}
		},
		divMouseDown: function(i)
		{
			var div = this;
			return function(e)
			{
				div.mdown = i;
				var colHed = div.dom.columnHeaders[i].th;
				var table = div.dom.div_heads[div.dom.columnHeaders[i].name];
				table.style.width = colHed.clientWidth + "px";
				table.style.height = colHed.clientHeight + "px";
				div.setDivPosition(e);
				table.style.display = "";
				document.body.onmousemove = div.divMouseMove();
			}
		},
		divMouseUp: function()
		{
			var div = this;
			return function(e)
			{
				var table = div.dom.div_heads[div.dom.columnHeaders[div.mdown].name];
				table.style.display = "none";
				div.dom.div_pointer.style.display = "none";

				document.body.onmousemove = null;

				for(var i=0; i<div.dom.columnHeaders.length; i++)
				{
					var colHead = div.dom.columnHeaders[i].th;
					var pos = dom.getMousePosition(e);
					if(pos.x >= colHead.offsetLeft && pos.x <= colHead.offsetLeft + colHead.clientWidth)
					{
						if(i > div.mdown)
						{
							for(var j = div.mdown+1; j<=i ;j++, div.mdown++)
								div.swapCols(div.mdown,j);
						}
						else
						{
							for(var j = div.mdown-1; j>=i ;j--, div.mdown--)
								div.swapCols(div.mdown,j);
						}
						div.mdown = null;
						break;
					}
				}

			}
		},
		setDivPosition: function(e)
		{
			var colHed = this.dom.columnHeaders[this.mdown].th;
			var pos = dom.getMousePosition(e);

			var table = this.dom.div_heads[this.dom.columnHeaders[this.mdown].name];
			table.style.left = pos.x-colHed.clientWidth/2 + "px";
			table.style.top = pos.y-colHed.clientHeight/2 + "px";
		},
		getPKRecord: function(row, record)
		{
			var result = record ? record : {};

			for (var i = 0; i<this.pk.length; i++)
			{
				result[this.pk[i]] = row[this.pk[i]];
			}

			return result;
		},
		getDynRecord: function() //for list edit
		{
			var record = [];

			this.verificationPassed = true;
			this.clearExceptions();	//clear last exceptions
			this.informationArray = [];
			this.informationArrayExt = [];

			if(this.mode == 'columnsequence')
			{
				var colHead = this.dom.columnHeaders;
				var colHeadNames = [];
				for(var i=0; i < colHead.length; i++)
				{
					colHeadNames[i] = colHead[i].name;
				}
				return colHeadNames.join(', ');
			}

			for (var i=0; i < this.rowset.length; i++)
			{
				record[i] = {};
				this.setActiveRow(i);
				this.getPKRecord(this.rowset[i], record[i]);

				for (var cName in this.controls)
				{
					var c = this.controls[cName];

					if (!c.isStatic)
					{
						if(this.isDataControl(cName))
						{
							c.verifyValue();
							if (!c.verificationPassed)
							{
								this.informationArray.push('"'+(c.title || c.name)+'"'+" " + rs.s('table.errors.verification_failed.on_row', 'on row') + " "+(i+1)+': '+ c.verificationFailureReason);
								this.informationArrayExt.push({
									line:'"'+(c.title || c.name)+'"'+" " + rs.s('table.errors.verification_failed.on_row', 'on row') + " "+(i+1)+': '+ c.verificationFailureReason,
									control:c,
									rownum:i
								});
								this.verificationPassed = false;
								continue;
							}
							// Uncomment this while AJAX update has been completed
							/*if(
								this.options.rowsChanged === false
								|| this.options.rowsChanged[i]
								&& this.options.rowsChanged[i][cName]
							)
							{*/
								record[i][cName] = c.getRecordValue();
							//}
						}
						else
						{
							record[i][cName] = c.getHiddenValue();
						}
					}
				}
			}

			if (this.verificationPassed)
			{
				for (var i=0; i<this.rowset.length; i++)
				{
					this.setActiveRow(i);
					for (var cName in this.controls)
					{
						var c = this.controls[cName];
						if (c == "rs.password")
						{
							c.setValue("");
						}
					}
				}
			}

			if (!this.verificationPassed)
			{
				this.addExceptionExt(rs.s('table.errors.verification_failed', 'Verification failed for field(s)') + ':', this.informationArrayExt);
				this.showExceptions();
				return null;
			}

			return record;
		},
		getMarkedRows: function()
		{
			var markedRows = [];
			for (var i=0; i<this.rowset.length; i++)
			{
				if (this.checkboxesMark[i].checked)
				{
					markedRows.push(i);
				}
			}
			return markedRows;
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.record
//

rs.record = newClass
(
	rs.guicontainer,
	{
		constructor: function()
		{
			rs.guicontainer.call(this);

			this.record = {};
			this.places = {};
			this.buttons = [];
			this.defaultButton = null;
			this.checkboxesMark = {};
			this.mark = {};
			this.mark.groups = {};
			this.levels = {};
			this.mode = 'notCreated';
			
			// References and procedures {title, hi}
			this.references = [];
			this.specialProcedures = [];
			this.guiProceduresReferences = [];

			// Options
			this.options.mark = false;
			this.options.notNullMarker = true;
			this.options.caption = true;
			this.options.header = true;
			this.options.toolbox = true;
			this.options.menu = true;
			this.options.numberOfControlsToShowToolboxOnTop = 10;
			this.options.icon = 'sprite_docIcon';
			this.options.columnsGroupResource = '__hide_by_cg_';
			this.options.disableResource = 'disabled_by_mark';
			this.options.hideStaticValue = false;
			this.options.recordStyles = {};
			this.options.recordChanged = false;
			this.options.hiddenFields = true;

			// Toolbox
			this.buttons = [];
		},
		getParent: function()
		{
			return this;
		},
		toString: function()
		{
			return "rs.record";
		},
		addButton: function(title, hint, handler, hi, confirmQuestion)
		{
			this.buttons.push({title:title, hint:hint, handler:handler, hi:hi, confirmQuestion:confirmQuestion});
		},
		controlEvent: function(control, eventType)
		{
			if(this.relations[control.name] && this.relations[control.name][eventType])
			{
				for(var i = 0; i < this.relations[control.name][eventType].length; i++)
				{
					this.execRelation(control, this.relations[control.name][eventType][i]);
				}
			}
		},
		attachToControlEvents: function(control)
		{
			if(this.relations[control.name])
			{
				var rs_record = this;
				for(var eventType in this.relations[control.name])
				{
					control.addEventListener
					(
						eventType,
						function(self){rs_record.controlEvent(self, eventType)}
					);
				}
			}
		},
		controlIsAvailable: function(cName)
		{
			var c = this.controls[cName];
			for(var i in c.dom.locks.showLocks)
			{
				if(i.indexOf(this.options.columnsGroupResource) != -1)
				{
					continue;
				}
				if(c.dom.locks.showLocks[i])
				{
					return false;
				}
			}
			if(this.options.mark && this.checkboxesMark[cName].dom.value == 0)
			{
				return false;
			}
			return true;
		},
		initMenu: function()
		{
			if(this.options.menu)
			{
				this.menu = new rs.menu();
				var m = this.menu;
				m.addSection(1); //Common
				m.addSection(6); //References
				m.addSection(7); //GUI procedure references
				m.addSection(8); //Special functions
				
				if(this.rights.update)
				{
					m.addItem(1, rs.s('menu.edit', 'Edit'), "sprite_edit_smallIcon", Aux.Record__CtxMenu__Edit.createCaller(this));
				}
				
				if(this.rights['delete'])
				{
					m.addItem(1, rs.s('menu.delete', 'Delete'), "sprite_delete_doc_smallIcon", Aux.Record__CtxMenu__Delete.createCaller(this));
				}
				
				if(this.references.length > 0)
				{
					m.addChild(6, "tr", rs.s('menu.related_tables', 'Filter related tables'), "sprite_tables_smallIcon");
					m.childs['tr'].addSection(1);
					for(var i = 0; i < this.references.length; i++)
					{
						m.childs['tr'].addItem(1, this.references[i]['title'], "", Aux.Table__CtxMenu__MoveByReference(this, this.references[i]['hi'], "TR"));
					}
				}
				
				if(this.guiProceduresReferences.length > 0)
				{
					m.addChild(7, "gpr", rs.s('menu.related_procedures', 'Related procedures'), "sprite_tables_smallIcon");
					m.childs['gpr'].addSection(1);
					for(var i = 0; i < this.guiProceduresReferences.length; i++)
					{
						m.childs['gpr'].addItem(1, this.guiProceduresReferences[i]['title'], "", Aux.Table__CtxMenu__MoveByReference(this, this.guiProceduresReferences[i]['hi'], "GPR"));
					}
				}
				
				if(this.specialProcedures.length > 0)
				{
					m.addChild(8, "sf", rs.s('menu.special_function', 'Special function'), "sprite_gear_smallIcon");
					m.childs['sf'].addSection(1);
					for(var i = 0; i < this.specialProcedures.length; i++)
					{
						m.childs['sf'].addItem(1, this.specialProcedures[i]['title'] + ' (' + rs.s('uipr.marked_or_selected', 'marked or selected') + ')', "", Aux.Table__CtxMenu__CallProcedure(this, this.specialProcedures[i]['hi'], false));
						m.childs['sf'].addItem(1, this.specialProcedures[i]['title'] + ' (' + rs.s('uipr.filtered', 'all filtered') + ')', "", Aux.Table__CtxMenu__CallProcedure(this, this.specialProcedures[i]['hi'], true));
					}
				}
			}
		},
		createCaption: function(e)
		{
			// Caption
			if (this.options.caption)
			{
				var table = document.createElement('table');
				table.className = 'ctl-container-caption';
				var tr = table.insertRow(0);
				var td = tr.insertCell(tr.cells.length);

				if (this.options.icon)
				{
					td.className = 'icon';
					var div = document.createElement('div');
					dom.addClass(div, this.options.icon + " pointer");
					td.appendChild(div);
					td.onclick = this.changeHidden.bind(this);
				}

				var td = tr.insertCell(tr.cells.length);
				this.hidedObjects.caption = td;
				td.className = 'caption pointer';
				var text = document.createTextNode(this.title || this.name);
				td.appendChild(text);
				if (this.hint)
				{
					td.title = this.hint;
				}
				td.onclick = this.changeHidden.bind(this);

				// Description
				if (this.description)
				{
					var tr = table.insertRow(1);
					var td = tr.insertCell(0);
					var td = tr.insertCell(1);
					td.className = 'description';
					td.appendChild(document.createTextNode(this.description));
					this.hidedObjects.hide['description'] = tr;
				}

				e.appendChild(table);
			}
		},
		createToolbox: function(e)
		{
			// Toolbox
			if (this.options.toolbox)
			{
				var table = document.createElement("table");
				table.className = "ctl-record-toolbox";
				table.style.width = "100%";//bug 1735
				var tr = table.insertRow(table.rows.length);
				var td = tr.insertCell(tr.cells.length);
				td.style.width = "100%";
				for (var i=0; i<this.buttons.length; i++)
				{
					var button = this.buttons[i];
					var input = document.createElement("input");
					input.type = "button";
					input.value = button.title;
					if (button.hint)
					{
						input.title = button.hint;
					}
					if (button.handler)
					{
						if (button.confirmQuestion)
						{
							var func = button.handler.createCaller(this, button.hi);
							var confirmQuestion = button.confirmQuestion;
							input.onclick = function()
							{
								if(confirm(confirmQuestion))
								{
									func.call();
								}
							}
						}
						else
						{
							input.onclick = button.handler.createCaller(this, button.hi);
						}
					}
					if (this.defaultButtonHI && button.hi == this.defaultButtonHI)
					{
						this.submit = button.handler.createCaller(this, button.hi);
						input.className="submitButton";
					}
					else if (button.title=="OK" || button.id=="OK" || button.id=="SUBMIT")
					{
						this.submit = button.handler.createCaller(this, button.hi);
						input.className="submitButton";
					}
					var td = tr.insertCell(tr.cells.length);
					td.appendChild(input);
				}
				e.appendChild(table);
			}
		},
		fullRefresh: function()
		{
			for(var i in this.controls)
			{
				if(this.controls[i] instanceof rs.control)
				{
					this.controls[i].refresh();
				}
			}
		},
		setRecord: function(record)
		{
			record = record || this.record;
			
			rs.lockAllEvents = true;
			for(var i in this.controls)
			{
				if(this.controls[i] instanceof rs.control)
				{
					this.controls[i].setInitValue(record[i]);
					if(record[i])
					{
						this.controls[i].setValue(record[i]);
					}
					if(this.controls[i] instanceof rs.button)
					{
						this.controls[i].setRow(record);
					}
				}
			}
			rs.lockAllEvents = false;
			this.fullRefresh();
			if(this.options.mark)
			{
				for(var i in this.checkboxesMark)
				{
					this.checkboxesMark[i].setValue(0);
				}
				for(var i in this.record)
				{
					if(this.record[i] !== null && this.checkboxesMark[i])
					{
						this.checkboxesMark[i].setValue(1);
					}
				}
				for(var control in this.mark.groups)
				{
					if(this.checkboxesMark[control])
					{
						this.checkboxesMark[control].addEventListener('onChange', this.getSyncMarkHandler(control));
					}
					if(this.record[control] == null && this.checkboxesMark[control])
					{
						this.checkboxesMark[control].setValue(0);
					}
				}
			}
		},
		getSyncMarkHandler: function(name)
		{
			var rsRecord = this;
			return function(self, v)
			{
				var id = rsRecord.mark.groups[name];
				for(var i in rsRecord.mark.groups)
				{
					if(
						rsRecord.mark.groups[i] == id
						&& rsRecord.checkboxesMark[i]
						&& i != name
						&& rsRecord.checkboxesMark[i].getDirectValue() != v
					)
					{
						rsRecord.checkboxesMark[i].setValue(v);
					}
				}
			}
		},
		createControlLine: function(table, control, shift)
		{
			control.lockEvents(true);
			var tr = table.insertRow(table.rows.length);
			tr.className =  (control.isStatic ? 'r ' : '') + control.toString().replace('rs.','').replace('box','') + (control.isStatic ? '_r' : '');
			tr.onclick = this.ctxClick();
			control.addEventListener('onHide', function(){tr.style.display = 'none'});
			control.addEventListener('onShow', function(){tr.style.display = ''});
			
			//Title
			var td = tr.insertCell(tr.cells.length);
			td.className = "title";
			td.title = control.hint || "";
			var span = document.createElement('span');
			span.appendChild(document.createTextNode(control.title || control.name || ""));
			td.appendChild(span);
			var title_td = td;
			
			//Mandatory
			var td = tr.insertCell(tr.cells.length);
			td.className = 'mandatory';
			
			var rs_record = this;
			var mandatory_td = td;
			control.addEventListener
			(
				'onSetNotNull',
				function(self, notNull)
				{
					mandatory_td.innerHTML = (IS_MSIE ? "&nbsp;" : "");
					//dom.deleteClass(mandatory_td, 'light-bg');
					//dom.deleteClass(title_td, 'light-bg');
					if (rs_record.options.notNullMarker && !self.isStatic & self.dom.notNull)
					{
						mandatory_td.innerHTML = "*";
						//dom.addClass(mandatory_td, 'light-bg');
						//dom.addClass(title_td, 'light-bg');
					}
				}
			);
			
			control.lockEvents(false);
			control.setNotNull(control.dom.notNull);
			control.lockEvents(true);
			
			//Marks
			if(this.options.mark)
			{
				var td = tr.insertCell(tr.cells.length);
				td.className = "mark-check";
				
				if(!control.isStatic)
				{
					var checkbox = new rs.checkbox();
					this.checkboxesMark[control.name] = checkbox;
					checkbox.create(td);
					checkbox.addEventListener
					(
						'onChange',
						function(self)
						{
							control.setDisabled(self.dom.value == '0', rs_record.options.disableResource);
						}
					);
					control.addEventListener
					(
						'onChange',
						function()
						{
							checkbox.setValue(1);
						}
					);
					control.addEventListener
					(
						'onDisableResource',
						function(self, resource)
						{
							if(self.dom.disabled && resource != rs_record.options.disableResource)
							{
								checkbox.setDisabled(true, resource);
							}
							else
							{
								checkbox.setDisabled(false, resource);
							}
						}
					);
				}
			}
			
			//Content
			if(shift)
			{
				this.createShift(shift, tr);
			}
			var td = tr.insertCell(tr.cells.length);
			td.title = control.hint || "";
			this.addNewLevel(shift, td);
			
			if (control.isStatic)
			{
				td.className = "data light-bg readonly";
			}
			else
			{
				td.className += " " + control.toString().replace('rs.','');
				td.className += " data white-bg";
			}
			td.className += ' ' + (this.options.recordStyles[control.name]?this.options.recordStyles[control.name]:'') + ' ' + control.baseStyle;
			control.addEventListener
			(
				'onVerifyFailed',
				function()
				{
					dom.deleteClass(td, 'green_fill');
					dom.addClass(td, 'red_fill');
				}
			);
			control.addEventListener(
				'onVerifyPassed',
				function()
				{
					dom.deleteClass(td, 'red_fill');
				}
			);
			control.addEventListener(
				'onChange',
				function(control, value)
				{
					if(
						rs_record.mode == 'created'
						&& rs_record.options.recordChanged !== false
					)
					{
						if(
							value != rs_record.record[control.name]
							&&
								!((value == "" || value == null)
								&& (rs_record.record[control.name] == "" || rs_record.record[control.name] == null)) 
						)
						{
							dom.addClass(td, 'green_fill');
							rs_record.options.recordChanged[control.name] = true;
						}
						else
						{
							dom.deleteClass(td, 'green_fill');
							rs_record.options.recordChanged[control.name] = false;
						}
					}
				}
			);
			control.create(td);
			control.lockEvents(false);
		},
		alignLevels: function()
		{
			var counter = 0;
			for(var i in this.levels)
			{
				counter++;
			}
			if(counter > 1)
			{
				for(var i in this.levels)
				{
					for(var k = 0; k < this.levels[i].length; k++)
					{
						this.levels[i][k].colSpan = counter - i;
					}
				}
			}
		},
		addNewLevel: function(level, contentTd)
		{
			level = level || 0;
			this.levels[level] = this.levels[level] || [];
			this.levels[level].push(contentTd);
		},
		createShift: function(shift, tr)
		{
			for(var i = 0; i < shift; i++)
			{
				var td = tr.insertCell(tr.cells.length);
				var image = document.createElement('img');
				image.src = 'img/0.gif';
				image.className = 'shift';
				td.appendChild(image);
				td.className = 'shift light-bg';
			}
		},
		setGroupDisplay: function(group, display, resource)
		{
			for(var i = 0; i < group.controls.length; i++)
			{
				if(group.controls[i] instanceof Object)
				{
					this.setGroupDisplay(group.controls[i], display, this.options.columnsGroupResource + group.hi);
				}
				else
				{
					this.controls[group.controls[i]].setDisplay(display, resource || this.options.columnsGroupResource);
				}
			}
		},
		isAllInGroupHidden: function(group)
		{
			for(var i = 0; i < group.controls.length; i++)
			{
				if(group.controls[i] instanceof Object)
				{
					if(!this.isAllInGroupHidden(group.controls[i]))
					{
						return false;
					}
				}
				else
				{
					var controlIsHidden = false;
					for(var k in this.controls[group.controls[i]].dom.locks.showLocks)
					{
						if(k != this.options.columnsGroupResource)
						{
							controlIsHidden = true;
							break;
						}
					}
					if(!controlIsHidden)
					{
						return false;
					}
				}
			}
			return true;
		},
		attachGroupControlsEvents: function(group, event, handler)
		{
			for(var i = 0; i < group.controls.length; i++)
			{
				if(group.controls[i] instanceof Object)
				{
					this.attachGroupControlsEvents(group.controls[i], event, handler);
				}
				else
				{
					this.controls[group.controls[i]].addEventListener(event, handler);
				}
			}
		},
		groupChangeDisplay: function(group)
		{
			group.show = group.show ? false : true;
			this.setGroupDisplay(group, group.show); // Revert
		},
		createControlGroup: function(table, group, shift)
		{
			if(group.controls.length == 0)
			{
				return;
			}
			
			//Header
			var header_tr = table.insertRow(table.rows.length);
			header_tr.onclick = this.ctxClick();
			var td = header_tr.insertCell(header_tr.cells.length);
			td.className = "title";
			var txt = group.title || "Columns group";
			txt = txt.dashReplace();
			
			//Title
			var text = document.createTextNode(txt);
			var p_title = document.createElement('p');
			this.dom.groupHeader = p_title;
			dom.setClassOnMouseEvents(p_title, "link_hover", "link");
			var rs_record = this;
			p_title.appendChild(text);
			td.appendChild(p_title);
			
			//Mark
			if(this.options.mark)
			{
				var td = header_tr.insertCell(header_tr.cells.length);
				td.className = "mark-check";
				td.appendChild(document.createTextNode(' '));
			}
			
			//Mandatory
			var td = header_tr.insertCell(header_tr.cells.length);
			td.className = 'mandatory'
			
			//Content
			if(shift)
			{
				this.createShift(shift, header_tr);
			}
			
			var td = header_tr.insertCell(header_tr.cells.length);
			this.addNewLevel(shift, td);
			td.className = "cg light-bg";
			var header_div = document.createElement("div");
			header_div.className = "sprite_opencloseTopIcon pointer";
			dom.addOnMouseEventsWatchNode(p_title, header_div);
			td.appendChild(header_div);
			
			//Controls
			var nextShift = (shift ? shift + 1 : 1)
			for(var i = 0; i < group.controls.length; i++)
			{
				if(group.controls[i] instanceof Object)
				{
					this.createControlGroup(table, group.controls[i], nextShift);
				}
				else
				{
					if(this.controls[group.controls[i]] && this.controls[group.controls[i]].isStatic && this.options.hideStaticValue)
					{
						continue;
					}
					this.createControlLine(table, this.controls[group.controls[i]], nextShift);
				}
			}
			
			//Footer
			var footer_tr = table.insertRow(table.rows.length);
			footer_tr.onclick = this.ctxClick();
			footer_tr.style.height = '9px';
			
			var td = footer_tr.insertCell(footer_tr.cells.length);
			td.className = "title";
			td.appendChild(document.createTextNode(' '));
			
			//Mandatory
			var td = footer_tr.insertCell(footer_tr.cells.length);
			td.className = 'mandatory'
			
			if(this.options.mark)
			{
				var td = footer_tr.insertCell(footer_tr.cells.length);
				td.className = "mark-check";
				td.appendChild(document.createTextNode(' '));
			}
			
			if(shift)
			{
				this.createShift(shift, footer_tr);
			}
			
			var td = footer_tr.insertCell(footer_tr.cells.length);
			this.addNewLevel(shift, td);
			td.className = "cg light-bg";
			td.style.lineHeight = "1px";
			var footer_div = document.createElement("div");
			footer_div.className = "sprite_opencloseBottomIcon pointer";
			dom.addOnMouseEventsWatchNode(p_title, footer_div);
			td.appendChild(footer_div);
			
			//Handler
			//Hide/Show group
			var handler = function(e)
			{
				if(e === false)
				{
					var withoutAjax = true;
				}
				rs.utils.bubbleEvent(e);
				rs_record.groupChangeDisplay(group);
				footer_tr.style.display = group.show ? '' : 'none';
				header_div.className = group.show ? 'sprite_opencloseTopIcon pointer' : 'sprite_opencloseTopIconClosed pointer';
				if(!withoutAjax)
				{
					rs.ajax.GUIQuery(rs_record.hi, ['Record:saveColumnsGroupState'], group.hi, group.show ? 1 : 0);
				}
			}
			p_title.onclick = handler;
			header_div.onclick = handler;
			footer_div.onclick = handler;
			
			//Hide headergroup if All controls is hide
			var checkAllShow = function(self)
			{
				if(rs_record.isAllInGroupHidden(group))
				{
					footer_tr.style.display = 'none';
					header_tr.style.display = 'none';
				}
				else
				{
					if(group.show)
					{
						footer_tr.style.display = '';
					}
					header_tr.style.display = '';
				}
			}
			this.attachGroupControlsEvents(group, 'onShowResource', checkAllShow);
			this.attachGroupControlsEvents(group, 'onHideResource', checkAllShow);
			this.attachGroupControlsEvents
			(
				group,
				'onVerifyFailed',
				function()
				{
					if(!group.show)
					{
						rs_record.setGroupDisplay(group, true);
						footer_tr.style.display = group.show ? '' : 'none';
					}
				}
			);
			
			//Default hide
			if(!group.show)
			{
				this.setGroupDisplay(group, false);
				footer_tr.style.display = group.show ? '' : 'none';
				header_div.className = group.show ? 'sprite_opencloseTopIcon pointer' : 'sprite_opencloseTopIconClosed pointer';
			}
		},
		createMarkGroup: function()
		{
			// Dependence groups
			if(this.options.mark)
			{
				var groupId = 0;
				for(var srcControl in this.relations)
				{
					if(this.relations[srcControl].onChange)
					{
						for(var i = 0; i < this.relations[srcControl].onChange.length; i++)
						{
							var targets = this.relations[srcControl].onChange[i].targets.split(';');
							if(
								this.relations[srcControl].onChange[i].action == 'setLookupParam'
								|| this.relations[srcControl].onChange[i].action == 'setParam'
							)
							{
								var id = this.mark.groups[srcControl] || ++groupId;
								this.mark.groups[srcControl] = id;
								for(var k = 0; k < targets.length; k++)
								{
									this.mark.groups[targets[k]] = id;
								}
							}
						}
						if(this.relations[srcControl])
						var relations = this.relations[srcControl].onChange;
					}
				}
			}
		},
		createTable: function(e)
		{
			// Main table
			if (!rs.utils.object_isEmpty(this.controls))
			{
				var table = document.createElement("table");
				table.cellPadding = 0;
				table.cellSpacing = 0;
				table.className = "ctl-record";
				/*if(IS_MSIE)
				{
					table.style.width = '98%';
				}
				else
				{*/
					table.style.width = '100%';
				//}
				
				var self = this;
				for(var cName in this.controls)
				{
					this.attachToControlEvents(this.controls[cName])
				}
				
				// Titles and controls
				for (var i = 0; i < this.options.struct.length; i++)
				{
					if(this.options.struct[i] instanceof Object)
					{
						this.createControlGroup(table, this.options.struct[i]);
					}
					else
					{
						if(this.controls[this.options.struct[i]].isStatic && this.options.hideStaticValue)
						{
							continue;
						}
						this.createControlLine(table, this.controls[this.options.struct[i]]);
					}
				}
				
				this.createMarkGroup();
				this.alignLevels();
				e.appendChild(table);
				this.setRecord();
			}
		},
		create: function(e)
		{
			this.prepareExceptions(e);
			this.places['caption'] = document.createElement('div');
			this.places['topToolbox'] = document.createElement('div');
			this.places['table'] = document.createElement('div');
			this.places['bottomToolbox'] = document.createElement('div');
			for(var i in this.places)
			{
				this.dom.place.appendChild(this.places[i]);
			}
			
			this.hidedObjects.hide['topToolbox'] = this.places['topToolbox'];
			this.hidedObjects.hide['table'] = this.places['table'];
			this.hidedObjects.hide['bottomToolbox'] = this.places['bottomToolbox'];
			
			this.createCaption(this.places['caption']);
			if(this.control_counter >= this.options.numberOfControlsToShowToolboxOnTop)
			{
				this.createToolbox(this.places['topToolbox']);
			}
			this.createTable(this.places['table']);
			this.createToolbox(this.places['bottomToolbox']);
			this.checkHidden();
			e.appendChild(this.dom.place);
			common.changeLockedClass();
			
			this.mode = 'created';
		},
		ctxClick: function()
		{
			var sender = this;
			return function(e)
			{
				if (sender.menu)
				{
					sender.menu.hide();
				}
				sender.initMenu();
				if (sender.menu)
				{
					env.pm.hideAll('rs.menu');
					sender.menu.hide();
					sender.menu.showFromMouse(e);
				}
				return;
			}
			return null;
		},
		addPKRecord: function(record)
		{
			for (var i = 0; i<this.pk.length; i++)
			{
				record[this.pk[i]] = this.record[this.pk[i]];
			}
			return record;
		},
		getDynRecord: function()
		{
			var record = {};

			this.verificationPassed = true;
			this.clearExceptions();	//clear last exceptions
			this.informationArray = [];
			this.informationArrayExt = [];

			for (var cName in this.controls)
			{
				var c = this.controls[cName];

				if (c instanceof rs.table && c.mode == 'columnsequence')
				{
					record[cName] = c.getDynRecord();
					continue;
				}

				if (!c.isStatic && c instanceof rs.control)
				{
					if(this.isDataControl(cName))
					{
						c.getValue();
						c.verifyValue();
	
						if (!c.verificationPassed)
						{
							this.informationArray.push('"'+(c.title || c.name)+'"' + (c.verificationFailureReason ? ': ' + c.verificationFailureReason : ''));
							this.informationArrayExt.push({
								line:'"'+(c.title || c.name)+'"' + (c.verificationFailureReason ? ': ' + c.verificationFailureReason : ''),
								control:c
							});
							this.verificationPassed = false;
							continue;
						}
						
						// Uncomment this while AJAX update has been completed
						/*if(
							this.options.recordChanged === false
							|| this.options.recordChanged[cName]
						)
						{*/
							record[cName] = c.getRecordValue();
						//}
					}
					else if (this.options.hiddenFields)
					{
						record[cName] = c.getHiddenValue();
					}
				}
			}
			
			if(this.verificationPassed)
			{
				for (var cName in this.controls)
				{
					var c = this.controls[cName];
					if (c == "rs.password")
					{
						c.setValue("");
					}
				}
			}

			if (!this.verificationPassed)
			{
				this.addExceptionExt(rs.s('table.errors.verification_failed', 'Verification failed for field(s)') + ':', this.informationArrayExt);
				this.showExceptions();
				return null;
			}

			return record;
		},
		getSelectedControlsRecord: function()
		{
			var record = [];
			if (!this.options.mark)
			{
				return record;
			}
			for (var cName in this.checkboxesMark)
			{
				if(
					this.checkboxesMark[cName].dom.value == 1
					&& this.isDataControl(cName)
				)
				{
					record.push(cName);
				}
			}
			return record;
		}
	}
);

//**********************************************************************************************
// Objects
//

//----------------------------------------------------------------------------------------------
// rs.chart
//

rs.staticChart = newClass(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			this.height = '400';
			this.minHeight = '250';
			this.title = 'test';
			this.showLegend = true;
			this.showScaler = true;
			this.name = "staticChart";
			this.dom.content = null;
		},
		getSWF: function()
		{
			//Init URL
			this.url = 'AJAXBackend.php%3Factions%5B0%5D%3DStaticChart%3AgetData%26object%3D' + this.hi + '%26windowId%3D' + window_id;
			for(var i in this.args)
			{
				this.url += '%26args%5B' + i + '%5D%3D' + this.args[i];
			}
			
			//Create object
			var FlashVars = "showLegend=" + this.showLegend + "&showScaler=" + this.showScaler + '&url=' + this.url + '&chartTitle=' + this.title + '&err_no_data=error';
			this.flashVars = FlashVars;
			var requiredMajorVersion = 9;
			var requiredMinorVersion = 0;
			var requiredRevision = 124;
			var hasProductInstall = DetectFlashVer(6, 0, 65);
			var hasRequestedVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
			if (hasProductInstall && !hasRequestedVersion) {
				var str = AC_FL_RunContent("src", "swf/playerProductInstall", "FlashVars", "MMredirectURL="+window.location+'&MMplayerType='+((isIE == true) ? "ActiveX" : "PlugIn")+'&MMdoctitle=Installation', "width", "100%", "height", "100%", "align", "middle", "id", "chart", "quality", "high", "name", "chart", "wmode", "transparent", "allowScriptAccess","always", "type", "application/x-shockwave-flash", "pluginspage", "http://www.adobe.com/go/getflashplayer");
			} else if (hasRequestedVersion) {
				var str = AC_FL_RunContent("FlashVars", FlashVars, "src", "swf/chart", "width", "100%", "height", "100%", "align", "middle", "id", "chart", "quality", "high", "name", "chart", "wmode", "transparent", "allowScriptAccess","always", "type", "application/x-shockwave-flash", "pluginspage", "http://www.adobe.com/go/getflashplayer");
			} else
			{
				var str = 'Flash player not compatible. Please update it';
			}
			return str;
		},
		getMoveHandler: function(mousePos)
		{
			var self = this;
			var height = this.dom.content.clientHeight;
			return function(e)
			{
				var pos = dom.getMousePosition(e);
				var newHeight = height + pos.y - mousePos.y;
				self.dom.content.style.height = (newHeight < self.minHeight ? self.minHeight : newHeight) + 'px';
			}
		},
		create: function(e)
		{
			var self = this;
			
			var content = document.createElement('div');
			content.innerHTML = this.getSWF();
			content.style.height = this.height + 'px';
			this.dom.content = content;
			this.dom.place.appendChild(content);
			
			var resize = document.createElement('div');
			resize.className = 'staticChartResize';
			
			resize.onmouseover = function()
			{
				dom.addClass(resize, 'staticChartResizeOver');
			}
			
			resize.onmouseout = function()
			{
				dom.deleteClass(resize, 'staticChartResizeOver');
			}
			
			resize.ondblclick = function()
			{
				var size = dom.getWindowSize();
				content.style.height = size.height + 'px';
				rs.ajax.GUIQuery(self.hi, ['StaticChart:saveHeight'], null, self.dom.content.clientHeight);
			}
			
			resize.onmousedown = function(e)
			{
				var pos = dom.getMousePosition(e);
				document.body.onmousemove = self.getMoveHandler(pos);
				document.body.onmouseup = function()
				{
					document.body.onmousemove = null;
					document.body.onmouseup = null;
					rs.ajax.GUIQuery(self.hi, ['StaticChart:saveHeight'], null, self.dom.content.clientHeight);
				}
				return false;
			}
			for(var i = 0; i < 8; i++)
			{
				var dot = document.createElement('img');
				dot.src = 'img/0.gif';
				dot.className = 'sprite_resizeDot';
				resize.appendChild(dot);
			}
			this.dom.place.appendChild(resize);
			
			e.appendChild(this.dom.place);
		},
		init: function()
		{
			this.create(getTopContainer());
		}
	}
);

//**********************************************************************************************
// Popups
//

//----------------------------------------------------------------------------------------------
// rs.popupmanager
//
rs.popupmanager = newClass(
	null,
	{
		constructor: function()
		{
			// Options
			this.options = {};
			this.options.zIndexPerPopup = 10; // Interval per one popup. Must be division by 2.
			
			// State
			this.zIndex = 10;
			this.popups = [];
		},
		getNextZIndex: function()
		{
			this.zIndex = this.zIndex + this.options.zIndexPerPopup;
			return this.zIndex - (this.options.zIndexPerPopup / 2);
		},
		addPopup: function(popup)
		{
			this.popups.push(popup);
		},
		removePopup: function(popup)
		{
			for(var i = 0; i < this.popups.length; i++)
			{
				if(this.popups[i] == popup)
				{
					this.popups.splice(i,1);
					return;
				}
			}
		},
		getPopupByClass: function(popupClass)
		{
			var result = [];
			for(var i = 0; i < this.popups.length; i++)
			{
				if(popupClass == null || this.popups[i] == popupClass)
				{
					result.push(this.popups[i]);
				}
			}
			return result;
		},
		hideAll: function(popupClass)
		{
			var popups = this.getPopupByClass(popupClass);
			for(var i = 0; i < popups.length; i++)
			{
				popups[i].hide();
			}
		}
	}
);

// Create popup manager
env.pm = new rs.popupmanager();

// Window manager
rs.windowmanager = newClass
(
	null,
	{
		constructor: function()
		{
			this.focused = null;
		},
		getWindows: function()
		{
			return env.pm.getPopupByClass('rs.window');
		},
		setFocused: function(wnd)
		{
			if(this.focused)
			{
				this.focused.unfocus();
			}
			this.focused = wnd;
		}
	}
);

// Create window manager
env.wm = new rs.windowmanager();

//----------------------------------------------------------------------------------------------
// rs.popup
//
rs.popup = newClass(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			this.baseZIndex = null;
			this.base = document.body;
			this.isShow = false;
			this.isShowHidden = false;
			
			// Options
			this.options = {};
			this.options.mouseTopAdd = 0;
			this.options.mouseLeftAdd = 0;
			this.options.modal = false;
			this.options.width = null;
			this.options.height = null;
			
			//Elements
			this.dom.shadows = [];
			
			if(IS_MSIE)
			{
				this.dom.cover = document.createElement('iframe');
				this.dom.cover.src = '/blank.html';
				this.dom.cover.className = 'popup-cover';
			}
			
			//Shadow levels
			for(var i = 0; i <= 1; i++)
			{
				this.dom.shadows[i] = document.createElement('div');
				this.dom.shadows[i].className = 'popup-shadow popup-shadow-' + i;
			}
			
			this.dom.content = document.createElement('div');
			this.dom.content.className = 'popup-content';
			this.dom.content.width = 0;
			this.dom.overlay = null;
			
			//Events
			this.addEventListener(
				'onShow',
				(function()
				{
					env.pm.addPopup(this);
				}).bind(this)
			);
			this.addEventListener(
				'onHide',
				(function()
				{
					env.pm.removePopup(this);
				}).bind(this)
			);
			
			this.dom.content.onmouseover = (function()
			{
				this.handleEvent('onOver');
			}).bind(this);
			
			this.dom.content.onmouseout = (function()
			{
				this.handleEvent('onOut');
			}).bind(this);
		},
		toString: function()
		{
			return "rs.popup";
		},
		addContent: function(content)
		{
			this.dom.content.appendChild(content);
		},
		setSize: function(w, h)
		{
			this.setWidth(w);
			this.setHeight(h);
		},
		setWidth: function(width)
		{
			for(var i = 0; i < this.dom.shadows.length; i++)
			{
				this.dom.shadows[i].style.width = width - i * 2 + 'px';
			}
			if(IS_MSIE)
			{
				this.dom.cover.style.width = width + 'px';
			}
			this.dom.content.style.width = width + 'px';
			this.options.width = width;
		},
		setHeight: function(height)
		{
			for(var i = 0; i < this.dom.shadows.length; i++)
			{
				this.dom.shadows[i].style.height = height - i * 2 + 'px';
			}
			if(IS_MSIE)
			{
				this.dom.cover.style.height = height + 'px';
			}
			this.dom.content.style.height = height + 'px';
			this.options.height = height;
		},
		clearContent: function()
		{
			this.dom.content.innerHTML = "";
		},
		setZIndex: function(z)
		{
			this.baseZIndex = z;
			this.dom.content.style.zIndex = z;
			for(var i = 0; i < this.dom.shadows.length; i++)
			{
				this.dom.shadows[i].style.zIndex = z - (i + 1);
			}
			if(IS_MSIE)
			{
				this.dom.cover.style.zIndex = z - 4;
			}
		},
		show: function(forCalculateSize)
		{
			if(this.isShow && !forCalculateSize)
			{
				return;
			}
			else if (forCalculateSize && this.isShowHidden)
			{
				return;
			}
			this.dom.content.style.visibility = "hidden";
			this.base.appendChild(this.dom.content);
			this.isShowHidden = true;
			
			if(!forCalculateSize)
			{
				if(this.options.modal)
				{
					this.dom.overlay = document.createElement('div');
					this.dom.overlay.className = 'overlay';
					this.dom.overlay.style.zIndex = env.pm.getNextZIndex();
					this.dom.overlay.onclick = function(e)
					{
						rs.utils.bubbleEvent(e);
						return false;
					}
					this.base.appendChild(this.dom.overlay);
				}
				this.handleEvent('onShow');
				this.setZIndex(env.pm.getNextZIndex());
				this.setSize(this.dom.content.clientWidth, this.dom.content.clientHeight);
				for(var i = 0; i < this.dom.shadows.length; i++)
				{
					this.base.appendChild(this.dom.shadows[i]);
				}
				if(IS_MSIE)
				{
					this.base.appendChild(this.dom.cover);
				}
				this.dom.content.style.visibility = "visible";
				this.isShowHidden = false;
				this.isShow = true;
			}
			// IE Width 100% BUG
			if(IS_MSIE)
			{
				document.body.className = document.body.className;
			}
		},
		showInWindowCenter: function()
		{
			if(this.isShow)
			{
				return;
			}
			this.show(true);
			var wSize = dom.getWindowSize();
			var width = this.dom.content.clientWidth;
			var height = this.dom.content.clientHeight;
			var x = Math.round(wSize.scrollLeft + (wSize.width - width)/2);
			var y = Math.round(wSize.scrollTop + (wSize.height - height)/2);
			x = x < 0 ? 0 : x;
			y = y < 0 ? 0 : y;
			this.setPosition(x, y);
			this.show();
		},
		isOutOfWindowBottom: function(pos)
		{
			var wSize = dom.getWindowSize();
			var wheight = wSize.height;
			var wwidth = wSize.width;
			var result =
				this.dom.content.clientHeight + pos.y_ > wheight
				&& pos.y_ > this.dom.content.clientHeight
				&& this.dom.content.clientHeight < wheight;
			return result;
		},
		isOutOfWindowRight: function(pos)
		{
			var wSize = dom.getWindowSize();
			var wheight = wSize.height;
			var wwidth = wSize.width;
			var result =
				this.dom.content.clientWidth + pos.x_ > wwidth
				&& pos.x_ > this.dom.content.clientWidth
				&& this.dom.content.clientWidth < wwidth;
			return result;
		},
		showFromMouse: function(e)
		{
			if(this.isShow)
			{
				return;
			}
			
			var pos = dom.getMousePosition(e);
			
			// Preshow for calculate size
			this.show(true);
			
			if (this.isOutOfWindowBottom(pos))
			{
				pos.y -= this.dom.content.clientHeight;
			}
			if (this.isOutOfWindowRight(pos))
			{
				pos.x -= this.dom.content.clientWidth;
			}

			this.setPosition(pos.x + this.options.mouseLeftAdd, pos.y + this.options.mouseTopAdd);
			this.show();
		},
		showFromBase: function(base, type)
		{
			type = type || 'normal';
			if(this.isShow)
			{
				return;
			}
			
			var pos = dom.getElementPosition(base);
			
			// Preshow for calculate size
			this.show(true);
			
			switch(type)
			{
				case 'notCoverIfLeft':
				{
					pos.x += base.offsetWidth;
					pos.x_ += base.offsetWidth;
					if (this.isOutOfWindowBottom(pos))
					{
						pos.y -= (this.dom.content.clientHeight - base.offsetHeight);
					}
					if (this.isOutOfWindowRight(pos))
					{
						pos.x -= (this.dom.content.clientWidth + base.offsetWidth);
						pos.y += base.offsetHeight;
						pos.x += base.offsetWidth;
					}
					break;
				}
				case 'bottom':
				{
					pos.y += base.offsetHeight + 1;
					if(this.isOutOfWindowBottom(pos))
					{
						pos.y -= (this.dom.content.clientHeight + base.offsetHeight + 4);
					}
					break;
				}
				default:
				{
					pos.x += base.offsetWidth;
					pos.x_ += base.offsetWidth;
					if (this.isOutOfWindowBottom(pos))
					{
						pos.y -= (this.dom.content.clientHeight - base.offsetHeight);
					}
					if (this.isOutOfWindowRight(pos))
					{
						pos.x -= (this.dom.content.clientWidth + base.offsetWidth);
					}
				}
			}
			this.setPosition(pos.x, pos.y);
			this.show();
		},
		hide: function()
		{
			if(!this.isShow)
			{
				return;
			}
			this.handleEvent('onHide');
			if(this.options.modal)
			{
				this.base.removeChild(this.dom.overlay);
			}
			this.base.removeChild(this.dom.content);
			if(IS_MSIE)
			{
				this.base.removeChild(this.dom.cover);
			}
			for(var i = 0; i < this.dom.shadows.length; i++)
			{
				this.base.removeChild(this.dom.shadows[i]);
			}
			this.isShow = false;
		},
		setPosition: function(x, y)
		{
			var content = this.dom.content;
			content.style.left = x + "px";
			content.style.top = y + "px";

			if(IS_MSIE)
			{
				var cover = this.dom.cover;
				cover.style.left = x + "px";
				cover.style.top = y + "px";
			}
			
			for(var i = 0; i < this.dom.shadows.length; i++)
			{
				this.dom.shadows[i].style.left = x + 4 + i + "px";
				this.dom.shadows[i].style.top = y + 4 + i + "px";
			}
		},
		getContentSize: function()
		{
			var content = this.dom.content.firstChild;
			if(content)
			{
				return {width: content.clientWidth || content.offsetWidth, height: content.clientHeight || content.offsetHeight};
			}
			else
			{
				return {width: 0, height: 0};
			}
		},
		autoSize: function()
		{
			var contentSizes = this.getContentSize();
			this.setWidth(contentSizes.width);
			this.setHeight(contentSizes.height);
		}
	}
);


//----------------------------------------------------------------------------------------------
// rs.menu
//

rs.menu = newClass
(
	rs.popup,
	{
		constructor: function()
		{
			rs.popup.call(this);
			
			// Options
			this.options.mouseTopAdd = -1;		// For mouse over menu
			this.options.mouseLeftAdd = -1;
			this.options.hideTimeout = 500;
			
			this.sections = {};
			this.readyToHide = false;

			this.childs = {};
			
			this.addEventListener(
				'onOver',
				this.activate.bind(this)
			);
			this.addEventListener(
				'onOut',
				(function()
				{
					this.deActivate();
					setTimeout(this.tryHide.bind(this), this.options.hideTimeout);
				}).bind(this)
			);
			
			this.iconBG = document.createElement('div');
			this.iconBG.className = 'iconBG';
			this.iconBG.style.display = 'none';
		},
		toString: function()
		{
			return "rs.menu";
		},
		activate: function()
		{
			this.activated = true;
			this.handleEvent('onActivate');
		},
		deActivate: function()
		{
			this.activated = false;
			this.handleEvent('onDeActivate');
		},
		setHeight: function(height)
		{
			this.iconBG.style.display = '';
			this.iconBG.style.height = height + 'px';
			this.iconBG.style.marginTop = - height + 'px';
			rs.popup.prototype.setHeight.call(this, height);
		},
		addChild: function(section, name, title, icon, handler)
		{
			var child = new rs.menu();
			this.childs[name] = child;
			child.addEventListener(
				'onShow',
				(function()
				{
					this.activate();
					for(var i in this.childs)
					{
						this.childs[i].tryHide();
					}
				}).bind(this)
			);
			child.addEventListener(
				'onTryHide',
				this.tryHide.bind(this)
			);
			child.addEventListener(
				'onActivate',
				this.activate.bind(this)
			);
			child.addEventListener(
				'onDeActivate',
				this.deActivate.bind(this)
			);
			this.addEventListener(
				'onHide',
				child.hide.bind(child)
			);
			this.sections[section].items.push(
				{
					type:'menu',
					title:title,
					icon:icon,
					child:child,
					handler:handler
				}
			);
		},
		addSection: function(name, title, icon)
		{
			this.sections[name] = {
				title:title,
				icon:icon,
				items:[]
			};
		},
		addItem: function(section, title, icon, handler)
		{
			this.sections[section].items.push(
				{
					type:'item',
					title:title,
					icon:icon,
					handler:handler
				}
			);
		},
		removeEmptySections: function()
		{
			for (var section in this.sections)
			{
				if (this.sections[section].items.length == 0)
				{
					delete(this.sections[section]);
				}
			}
		},
		getHoverHandler: function(tr)
		{
			return function()
			{
				tr.className = "hover";
			}
		},
		getOutHandler: function(tr)
		{
			return function()
			{
				tr.className = "";
			}
		},
		createIntTable: function()
		{
			var contents = document.createElement('div');
			
			var table_int = document.createElement("table");
			table_int.className = "ctl-ctxmenu";
			table_int.cellSpacing = 0;
			table_int.cellPadding = 0;

			var cnt = 0;

			for (var sectionId in this.sections)
			{
				var section = this.sections[sectionId];
				if (cnt > 0)
				{
					var tr = table_int.insertRow(table_int.rows.length);
					tr.className = 'separator_line';
					var td = tr.insertCell(0);
					td.className = 'icon';
					var td = tr.insertCell(1);
					td.colSpan = 2;
					td.style.margin = "0";
					td.style.height = "8pt";
					td.className = "separator";
					var hr = document.createElement('div');
					hr.className = 'hr';
					td.appendChild(hr);
				}

				cnt = section.items.length;

				if ((cnt > 0) && section.title)
				{
					var tr = table_int.insertRow(table_int.rows.length);
					var td = tr.insertCell(0);
					td.className = "icon";

					var div = document.createElement("div");
					div.className = section.icon ? section.icon : 'sprite_empty16';
					td.appendChild(div);

					var td = tr.insertCell(1);
					td.className = "section";
					td.appendChild(document.createTextNode(section.title));
					td.title = section.hint||"";
				}

				for (var i=0; i<cnt; i++)
				{
					var item = section.items[i]

					var tr = table_int.insertRow(table_int.rows.length);
					
					if(item.type=="item")
					{
						tr.onclick = this.getItemClickHandler(item.handler);
						dom.setClassOnMouseEvents(tr, "hover", "");
					}
					else if (item.type=="menu")
					{
						if(item.handler)
						{
							tr.onclick = this.getItemClickHandler(item.handler);
							dom.setClassOnMouseEvents(tr, "hover", "");
						}
						else
						{
							tr.onmouseover 	= this.getShowChildHandler(item.child, tr, null, true);
							tr.onmouseout 	= this.getHideChildHandler(item.child, true); 
						}
						//Highlight parent item when child is active
						
						item.child.addEventListener(
							'onActivate',
							this.getHoverHandler(tr)
						);
						item.child.addEventListener(
							'onDeActivate',
							this.getOutHandler(tr)
						);
					}
					
					var td = tr.insertCell(0);
					td.className = "icon";

					var div = document.createElement("div");
					div.className = item.icon ? item.icon : 'sprite_empty16';
					td.appendChild(div);
					
					var td = tr.insertCell(1);
					td.className = "item";
					td.appendChild(document.createTextNode(item.title));
					
					var td = tr.insertCell(2);
					td.className = 'sub';
					var div = document.createElement('div');
					div.className = 'emptySub';
					td.appendChild(div);
					if (item.type == 'menu')
					{
						if(item.child.prepareMenu())
						{
							div.className = 'sprite_sub_menu_smallIcon';
							if(item.handler)
							{
								var getHightlight = function(e, h)
								{
									return function()
									{
										if(h)
										{
											dom.addClass(e, "arrow_hover");
										}
										else
										{
											dom.deleteClass(e, "arrow_hover");
										}
									}
								}
								td.onclick = function(e){rs.utils.bubbleEvent(e)}
								td.style.className = "sub arrow arrow_white";
								dom.setClassOnMouseEvents(td, "sub arrow arrow_hover", "sub arrow arrow_white");
								item.child.addEventListener('onOver', getHightlight(td, true));
								item.child.addEventListener('onShow', getHightlight(td, true));
								item.child.addEventListener('onHide', getHightlight(td, false));
								td.onmouseover = this.getShowChildHandler(item.child, td, 'notCoverIfLeft');
								td.onmouseout = this.getHideChildHandler(item.child);
							}
						}
					}
				}
			}
			contents.appendChild(table_int);
			contents.appendChild(this.iconBG);
			return contents;
		},
		getItemClickHandler: function(handler)
		{
			var menu = this;
			return function(e)
			{
				menu.deActivate();
				menu.tryHide();
				if (handler instanceof Function)
				{
					handler(menu,e);
				}
			}
		},
		getShowChildHandler: function(child, base, type, withHover)
		{
			return function()
			{
				if(withHover)
				{
					this.className = 'hover';
				}
				child.showFromBase(base, type);
				child.activate();
			}
		},
		getHideChildHandler: function(child, withHover)
		{
			return function()
			{
				if(withHover)
				{
					this.className = '';
				}
				child.deActivate()
				setTimeout(child.tryHide.bind(child), child.options.hideTimeout);
			}
		},
		prepareMenu: function()
		{
			// To avoid appearance of menu when it has no items
			this.removeEmptySections();
			if (rs.utils.object_isEmpty(this.sections))
			{
				return false;
			}
			
			// Reset content befor show
			this.clearContent();
			this.addContent(this.createIntTable());
			
			return true;
		},
		showFromMouse: function(e)
		{
			if (!this.prepareMenu())
			{
				return;
			}
			rs.popup.prototype.showFromMouse.call(this, e);
		},
		showFromBase: function(base, type)
		{
			// To avoid appearance of menu when it has no items
			this.removeEmptySections();
			if (!this.prepareMenu())
			{
				return;
			}
			rs.popup.prototype.showFromBase.call(this, base, type);
		},
		tryHide: function()
		{
			if (!this.activated)
			{
				this.hide();
				this.handleEvent('onTryHide');
			}
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.window
//

rs.window = newClass
(
	rs.popup,
	{
		constructor: function()
		{
			rs.popup.call(this);
			
			// Options
			this.options.minWidth 		= 150;
			this.options.minHeight		= 40;
			this.options.maxWidth 		= 800;
			this.options.maxHeight		= 500;
			this.options.autoSize		= true;
			this.options.canResize		= true;
			this.options.canMove		= true;
			this.options.closeButton	= true;
			this.options.defaultWidth	= this.options.minWidth;
			this.options.defaultHeight	= this.options.minHeight;
			this.options.headerHeight	= 20;
			this.options.footerHeight	= 8;
			
			// State
			this.pos 			= null;
			this.mousePos 		= null;
			this.focused 		= false;
			this.content		= null;
			this.created		= false;
			
			// Elements
			this.dom.body 			= null;
			this.dom.header 		= null;
			this.dom.closeButton	= null;
			this.dom.windowContent 	= null;
			this.dom.footer 		= null;
			
			// Create window elements! 
			
			this.dom.body = document.createElement('div');
			this.dom.content.appendChild(this.dom.body);
			//dom.addClass(this.dom.content, 'window-popup');
			dom.addClass(this.dom.body, 'window');
			
			//Moving box
			this.dom.movingBox = document.createElement('div');
			this.dom.movingBox.className = 'movingBox';
		},
		createWindowContent: function()
		{
			//Content
			this.dom.windowContent = document.createElement('div');
			if(this.content != null)
			{
				this.dom.windowContent.appendChild(this.content);
				this.content = null;
			}
			this.dom.body.appendChild(this.dom.windowContent);
			this.dom.windowContent.className = 'content';
		},
		createHeader: function()
		{
			//Header
			if(this.options.canMove && (this.dom.header == null))
			{
				this.dom.header = document.createElement('div');
				this.dom.body.appendChild(this.dom.header);
				this.dom.header.className = 'header header-focus';
				this.dom.header.style.height = this.options.headerHeight +'px';
				var self = this;
				this.dom.content.onmousedown = function(e)
				{
					self.focus();
				}
				this.dom.header.onmousedown = function(e)
				{
					self.readyToMove(true);
					self.mousePos = dom.getMousePosition(e);
					return false;
				}
				this.dom.caption = document.createElement('span');
				this.dom.header.appendChild(this.dom.caption);
				this.changeCaption('Window');
			}
		},
		createFooter: function()
		{
			//Footer
			if(this.options.canResize && (this.dom.footer == null))
			{
				this.dom.footer = document.createElement('div');
				this.dom.body.appendChild(this.dom.footer);
				this.dom.footer.className = 'footer';
				this.dom.footer.style.height = this.options.footerHeight +'px';
				var resize = document.createElement('img');
				resize.src = 'img/0.gif';
				resize.className = 'sprite_resizeIcon resize';
				var self = this;
				resize.onmousedown = function(e)
				{
					self.readyToResize(true);
					self.mousePos = dom.getMousePosition(e);
					return false;
				}
				this.dom.footer.appendChild(resize);
			}
		},
		createCloseButton: function()
		{
			if(this.options.closeButton && this.dom.header)
			{
				if(this.dom.closeButton == null)
				{
					var close = document.createElement('img');
					this.dom.closeButton = close;
					close.src = 'img/0.gif';
					close.className = 'sprite_closeWindow close';
					dom.setClassOnMouseEvents(close, 'sprite_closeWindow_over close', 'sprite_closeWindow close');
					var self = this;
					close.onclick = function()
					{
						self.hide();
					}
					close.onmousedown = function(e)
					{
						rs.utils.bubbleEvent(e);
					}
					this.dom.header.insertBefore(close, this.dom.caption);
				}
				else
				{
					this.dom.closeButton.className = 'sprite_closeWindow close';
				}
			}
		},
		setContentHeight: function(h)
		{
			var height = (
				h
				+ (this.options.canMove ? this.options.headerHeight : 0)
				+ (this.options.canResize ? this.options.footerHeight : 0)
				+ 11/*For padding*/);
			this.setHeight(height);
		},
		setHeight: function(h)
		{ 
			rs.popup.prototype.setHeight.call(this, h);
			var height = (
				h
				- (this.options.canMove ? this.options.headerHeight : 0)
				- (this.options.canResize ? this.options.footerHeight : 0)
				- 11/*For padding*/);
			this.dom.windowContent.style.height = height + 'px';
		},
		setWidth: function(w)
		{
			rs.popup.prototype.setWidth.call(this, w);
			this.dom.windowContent.style.width = w - 10/*For padding*/ + 'px';
		},
		changeCaption: function(text)
		{
			this.dom.caption.innerHTML = '';
			this.dom.caption.appendChild(document.createTextNode(text));
		},
		show: function(forCalculateSize)
		{
			if(this.isShow)
			{
				this.focus();
				return;
			}
			else if (forCalculateSize && this.isShowHidden)
			{
				return;
			}
			
			// Dinamically create needed elements
			if(this.created == false)
			{
				this.createHeader();
				this.createCloseButton();
				this.createWindowContent();
				this.createFooter();
				this.created = true;
			}
			
			rs.popup.prototype.show.call(this, true);
			this.autoSize();
			rs.popup.prototype.show.call(this, forCalculateSize);
			this.focus();
		},
		getContentSize: function()
		{
			var content = this.dom.windowContent.firstChild;
			var size = {};
			if(!content)
			{
				size = {width: 0, height: 0};
			}
			else
			{
				size = {width: content.clientWidth || content.offsetWidth, height: content.clientHeight || content.offsetHeight};
			}
			return size;
		},
		autoSize: function()
		{
			var contentSizes = this.getContentSize();
			if(this.options.autoSize)
			{
				var sizes = this.checkSize(this.dom.content.clientWidth || this.dom.content.offsetWidth, contentSizes.height);
			}
			else
			{
				var sizes = this.checkSize(this.options.defaultWidth, this.options.defaultHeight);
			}
			
			//this.setWidth(sizes.width);
			this.setWidth(sizes.width + (IS_MSIE ? 10 : 0)); // Fix for IE
			this.setContentHeight(sizes.height);
		},
		focus: function()
		{
			if(this.focused)
			{
				return;
			}
			env.wm.setFocused(this);
			if(this.options.canMove)
			{
				dom.deleteClass(this.dom.header, 'header-unfocus');
				dom.addClass(this.dom.header, 'header-focus');
			}
			this.setZIndex(env.pm.getNextZIndex());
			this.focused = true;
		},
		unfocus: function()
		{
			if(this.options.canMove)
			{
				dom.deleteClass(this.dom.header, 'header-focus');
				dom.addClass(this.dom.header, 'header-unfocus');
			}
			this.focused = false;
		},
		addContent: function(content)
		{
			this.content = content;
			//this.dom.windowContent.appendChild(content);
		},
		toString: function()
		{
			return "rs.window";
		},
		checkSize: function(width, height)
		{
			if(height < this.options.minHeight)
			{
				var height = this.options.minHeight;
			}
			if(height > this.options.maxHeight)
			{
				var height = this.options.maxHeight;
			}
			
			if(width < this.options.minWidth)
			{
				var width = this.options.minWidth;
			}
			if(width > this.options.maxWidth)
			{
				var width = this.options.maxWidth;
				//var height = height + 25; /*SCROLL BAR*/
			}
			
			return {height: height, width: width};
		},
		setMovingBoxSize: function(w, h)
		{
			var sizes = this.checkSize(w, h);
			this.dom.movingBox.style.width = sizes.width + 'px';
			this.dom.movingBox.style.height = sizes.height + 'px';
		},
		setMovingBoxPosition: function(x, y)
		{
			this.dom.movingBox.style.left = x + 'px';
			this.dom.movingBox.style.top = y + 'px';
		},
		showMovingBox: function()
		{
			this.pos = dom.getElementPosition(this.dom.content);
			this.setMovingBoxPosition(this.pos.x, this.pos.y);
			this.setMovingBoxSize(this.dom.content.clientWidth, this.dom.content.clientHeight);
			document.body.appendChild(this.dom.movingBox);
		},
		hideMovingBox: function()
		{
			document.body.removeChild(this.dom.movingBox);
		},
		getMoveHandler: function()
		{
			var self = this;
			return function(e)
			{
				var pos = dom.getMousePosition(e);
				self.setMovingBoxPosition(self.pos.x + (pos.x - self.mousePos.x), self.pos.y + (pos.y - self.mousePos.y));
				return false;
			}
		},
		getResizeHandler: function()
		{
			var self = this;
			return function(e)
			{
				var pos = dom.getMousePosition(e);
				self.setMovingBoxSize(self.dom.content.clientWidth + (pos.x - self.mousePos.x), self.dom.content.clientHeight + (pos.y - self.mousePos.y));
				return false;
			}
		},
		readyToMove: function(ready)
		{
			if(ready)
			{
				this.showMovingBox();
				document.onmousemove = this.getMoveHandler();
				var self = this;
				document.onmouseup = function(e)
				{
					self.readyToMove(false);
					return false;
				}
			}
			else
			{
				this.pos = dom.getElementPosition(this.dom.movingBox);
				this.hideMovingBox();
				this.setPosition(this.pos.x, this.pos.y);
				document.onmousemove = '';
				document.onmouseup = '';
			}
		},
		readyToResize: function(ready)
		{
			if(ready)
			{
				this.showMovingBox();
				document.onmousemove = this.getResizeHandler();
				var self = this;
				document.onmouseup = function(e)
				{
					self.readyToResize(false);
					return false;
				}
			}
			else
			{
				this.setSize(this.dom.movingBox.clientWidth, this.dom.movingBox.clientHeight);
				this.hideMovingBox();
				document.onmouseup = '';
			}
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.dialog
//
rs.dialog = newClass
(
	rs.window,
	{
		constructor: function()
		{
			rs.window.call(this);
			
			// Type of dialog
			this.options.type 			= 'error';
			this.options.captionText 	= 'Error'
			
			// Old options
			this.options.modal 			= true;
			this.options.canResize 		= false;
			this.options.defaultWidth 	= '250';
			
			// Elements
			this.dom.dialogContent 		= null;
			this.dom.dialogContentContainer = null;
			this.dom.dialogIconContainer = null;
		},
		showDialog: function()
		{
			var div = document.createElement('center');
			
			var content = document.createElement('table');
			var tr = content.insertRow(0);
			this.dom.dialogIconContainer = tr.insertCell(0);
			this.dom.dialogIconContainer.className = 'icon';
			this.dom.dialogContentContainer = tr.insertCell(1);
			content.className = 'content';
			this.dom.dialogContentContainer.appendChild(this.dom.dialogContent);
			div.appendChild(content);
			this.addContent(div);
			switch(this.options.type)
			{
				case 'error':
				{
					this.options.captionText = 'Error!';
					var div = document.createElement("div");
					div.className = 'sprite_errorIcon';
					this.dom.dialogIconContainer.appendChild(div);
					break;
				}
			}
			this.show(true);
			dom.addClass(this.dom.windowContent, 'dialog');
			this.showInWindowCenter();
			this.setHeight(this.dom.dialogContentContainer.clientHeight + this.options.headerHeight + 15);
			this.changeCaption(this.options.captionText);
		},
		addDialogContent: function(content)
		{
			this.dom.dialogContent = content;
		}
	}
);

//**********************************************************************************************
// Others
//

rs.scroll = newClass
(
	rs.element,
	{
		constructor: function()
		{
			rs.element.call(this);
			
			// Events
			this.dom.events.onStep = new rs.event();
			
			// Objects
			this.objects = {};
			this.objects.left = null;
			this.objects.path = null;
			this.objects.right = null;
			this.objects.slider = null;
			
			// Options
			this.options = {};
			this.options.steps = 1000;
			this.stepperTimeout = 1000;
			this.stepperTimeBetweenSteps = 10;
			
			// Work state
			this.state = {};
			this.state.mousePos = null;
			this.state.scrollPos = null;
			this.state.sliderPos = null;
			this.state.step = 1
			this.state.stepper = {};
			this.state.stepper.ready = false;
			this.state.stepper.step = 1;
		},
		stepper: function()
		{
			if(this.state.stepper.ready)
			{
				this.stepTo(this.state.step + this.state.stepper.step);
				setTimeout(this.stepper.bind(this), this.stepperTimeBetweenSteps);
			}
		},
		stepTo: function(step)
		{
			step = step > this.options.steps ? this.options.steps : step;
			step = step < 1 ? 1 : step;
			if(this.state.step != step)
			{
				this.state.step = step;
				if(step == 1)
				{
					this.objects.slider.style.left = '0px';
					dom.deleteClass(this.objects.slider, 'slider-right');
				}
				else if(step == this.options.steps)
				{
					this.objects.slider.style.left = 'auto';
					dom.addClass(this.objects.slider, 'slider-right');
				}
				else
				{
					dom.deleteClass(this.objects.slider, 'slider-right');
					//this.objects.slider.style.left = Math.floor((step * 70) / this.options.steps) + '%';
					this.objects.slider.style.left = (step * 70) / this.options.steps + '%';
				}
				this.dom.events.onStep.execute(this, step);
			}
		},
		getStepperFunction: function(steps)
		{
			var element = IS_MSIE ? document.body : window;
			var self = this;
			return function()
			{
				self.state.stepper.ready = true;
				self.stepTo(self.state.step + steps);
				element.onmouseup = function()
				{
					self.state.stepper.ready = false;
					element.onmouseup = null;
				}
				self.state.stepper.step = steps;
				setTimeout(self.stepper.bind(self), self.stepperTimeout)
			}
		},
		create: function(e)
		{
			// Scrolling div
			var table = document.createElement('table');
			table.className = "ctl-scroll";
			var line = table.insertRow(0);
			
			var left = line.insertCell(0);
			this.objects.left = left;
			left.className = "arrow";
			left.onmousedown = this.getStepperFunction(-1);
			
			var center = line.insertCell(1);
			this.objects.path = center;
			
			var right = line.insertCell(2);
			this.objects.right = right;
			right.className = "arrow";
			right.onmousedown = this.getStepperFunction(1);
			
			var trace = document.createElement(div);
			document.body.appendChild(trace);
			
			var div = document.createElement('div');
			div.className = "slider";
			div.style.width = "30%";
			this.objects.slider = div;
			
			var element = IS_MSIE ? document.body : window;
			var self = this;
			div.onmousedown = function(e)
			{
				self.state.mousePos = dom.getMousePosition(e);
				self.state.scrollPos = dom.getElementPosition(self.objects.path);
				self.state.sliderPos = dom.getElementPosition(self.objects.slider);
				element.onmouseup = function()
				{
					self.state.mousePos = null;
					self.state.scrollPos = null;
					self.state.sliderPos = null;
					window.onmouseup = null;
					window.onmousemove = null;
					return false;
				}
				element.onmousemove = function(ee)
				{
					var scrollX = self.state.scrollPos.x;
					var pos = dom.getMousePosition(ee);
					var moveX = pos.x;
					var clickX = self.state.mousePos.x;
					var sliderOffsetClick = clickX - self.state.sliderPos.x;
					var width = self.objects.path.clientWidth;
					var sliderWidth = self.objects.slider.clientWidth;
					
					var workWidth = width - sliderWidth;
					var workOffset = moveX - scrollX - sliderOffsetClick;

					
					if(moveX < (scrollX + sliderOffsetClick))
					{
						self.stepTo(1);
					}
					else if(moveX > (scrollX + width - (sliderWidth - sliderOffsetClick)))
					{
						self.stepTo(self.options.steps);
					}
					else
					{
						var multiplier = workOffset / workWidth;
						var perStep = width / self.options.steps;
						var position = width * multiplier;
						var step = Math.ceil(position / perStep);
						if((position - step * perStep) > perStep / 2)
						{
							step++;
						}
						self.stepTo(step);
					}
				}
				return false;
			}
			center.appendChild(div);
			
			this.dom.place.appendChild(table);
			e.appendChild(this.dom.place);
		}
	}
);

//----------------------------------------------------------------------------------------------
// rs.arrangetoolbox
//

rs.arrangetoolbox = newClass
(
	rs.guicontainer,
	{
		constructor: function()
		{
			rs.guicontainer.call(this);
			this.set = [];
			this.saveArrangeDialog = true;
			this.arrangeCollection = new Array();
			this.DefaultArrange = new Array();
			this.Combo = null;
			this.arrangeBox = null;
			this.handlers = {};
			this.handlers.apply 	= null;
			this.handlers.del 		= null;
			this.handlers.save		= null;
			var self = this;
			this.submit = function()
			{
				self.handlers.apply();
			}
		},
		toString: function()
		{
			return "rs.arrangetoolbox";
		},
		recreateToolbox: function()
		{
			if(this.dom.toolbox)
			{
				this.dom.place.removeChild(this.dom.toolbox);
			}
			
			//Save toolbox
			if (this.saveArrangeDialog)
			{
				var self = this;
				
				var table = document.createElement('table');
				table.className = 'ctl-filtertoolbox-buttons';
				//table.border = 1;
				table.cellSpacing = 0;
				table.cellPadding = 0;
				var tr = table.insertRow(0);
				var td = tr.insertCell(tr.cells.length);
				td.appendChild(document.createTextNode(rs.s('arrangebox.saved_arranges','Saved arranges') + ':'));

				//saved arranges
				var td = tr.insertCell(tr.cells.length);
				var saved_arrange = new rs.combobox;
				this.Combo = saved_arrange;
				saved_arrange.setLookup(this.sa_lookup);
				saved_arrange.dom.notNull = false;
				saved_arrange.create(td);
				saved_arrange.setValue(this.currentArrangeId);
				saved_arrange.addEventListener('onChange', this.setSaved.bind(saved_arrange).createCaller(this));
				this.dom.saved_arrange = saved_arrange;

				//delete
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.type = 'button';
				input.value = rs.s('arrangebox.delete','Delete');
				input.onclick = function()
				{
					self.handlers.del();
				}
				td.appendChild(input);

				//save
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.type = 'button';
				input.value = rs.s('arrangebox.save','Save');
				input.onclick = function()
				{
					self.handlers.save();
				}
				td.appendChild(input);
				
				this.dom.toolbox = table;
				this.dom.place.appendChild(table);
			}
		},
		create: function(e)
		{
			this.arrangeBox = new rs.arrangebox();
			this.arrangeBox.setLookup(this.options);
			this.arrangeBox.selectSize = 14;
			this.arrangeBox.create(this.dom.place);

			var div = document.createElement('div');
			div.style.textAlign = 'right';
			this.dom.place.appendChild(div);
			var input = document.createElement("input");
			input.type = "button";
			input.value = rs.s('arrangebox.apply', 'Apply');
			var self = this;
			input.onclick = function()
			{
				self.handlers.apply();
			}
			input.className="submitButton";
			div.appendChild(input);
			
			this.recreateToolbox();
			
			// Set value
			this.setValue(this.set);
			e.appendChild(this.dom.place);
		},
		setValue: function(set)
		{
			this.set = set;
			this.arrangeBox.setValue(set);
		},
		setDefaultArrange: function()
		{
			this.DefaultArrange = this.set;
			var selected = [];
			if (this.dom.select2)
			{
				for (var i=0; i<this.dom.select2.options.length; i++)
				{
					if (this.dom.select2.options[i].selected)
					{
						selected.push(i);
					}
				}
			}
			if (this.Combo)
			{
			   	this.Combo.setValue();
			}
			if (this.dom.select2 && selected.length)
			{
				for (var i = 0; i < selected.length; i++)
				{
					this.dom.select2.options[selected[i]].selected = true;
				}
			}
		},
		setSaved: function(sender)
		{
			if(sender.dom.saved_arrange.dom.value)
			{
			    sender.setValue(sender.arrangeCollection[sender.dom.saved_arrange.dom.value]);
			}
			else
			{
			    sender.setValue(sender.DefaultArrange);
			}
		},
		setArrangeLookup: function(lookup)
		{
			this.sa_lookup = lookup;
			this.sa_lookupValues = {};
			for (var i; i < lookup.length; i++)
			{
				this.sa_lookupValues[lookup[i]['k']] = lookup[i]['v'];
			}
		}
	}
);

//**********************************************************************************************
// Utils
//

rs.utils = {};
rs.utils.isEmpty = function(x)
{
	return ((x == null) || (x == ""));
}

rs.utils.serialize = function(x)
{
	if (x == null)
	{
		x = '';
	}
	switch (typeof(x))
	{
		case 'number':
		{
			return 'i:' + x + ';';
		}
		case 'string':
		{
			return 's:' + x.length + ':"' + x + '";';
		}
		case 'object':
		{
			var s = '';
			var l = 0;
			for (var k in x)
			{
				var sk = rs.utils.serialize(k);
				var sv = rs.utils.serialize(x[k]);
				if (sk && sv)
				{
					l++;
					s += sk + sv;
				}
			}
			return 'a:' + l + ':{' + s + '}';
		}
		default:
		{
			return null;
		}
	}
}

rs.utils.serialize_for_print = function(x, sh)
{
	if (x == null)
	{
		x = '';
	}
	switch (typeof(x))
	{
		case 'number':
		{
			return (sh || '') + 'i:' + x + ';' + '\n';
		}
		case 'string':
		{
			return (sh || '') + 's:' + x.length + ':"' + x + '";' + '\n';
		}
		case 'object':
		{
			var s = '';
			var l = 0;
			for (var k in x)
			{
				var sk = rs.utils.serialize_for_print(k, (sh || '') + '.     ');
				var sv = rs.utils.serialize_for_print(x[k], (sh || '') + '.     ');
				if (sk && sv)
				{
					l++;
					s += sk + sv;
				}
			}
			return (sh || '') + 'a:' + l + ':\n' + (sh || '') + '{\n' + s + (sh || '') + '}\n';
		}
		default:
		{
			return null;
		}
	}
}

rs.utils.replaceClass = function(elem, className)
{
	elem.className = className;
}

rs.utils.array_find = function(array, value)
{
	for (var i=0; i<array.length; i++)
	{
		if (array[i] == value)
		{
			return i;
		}
	}
	return -1;
}

rs.utils.object_isEmpty = function(obj)
{
	for (var p in obj)
	{
		return false;
	}
	return true;
}

rs.utils.convert_plural = function(lang, count, forms)
{
	var convert_plural_func = 'convert_plural_' + lang;
	if (rs.utils[convert_plural_func] instanceof Function)
	{
		return rs.utils[convert_plural_func].call(null, count, forms);
	}
	return '';
}

rs.utils.pre_convert_plural = function(forms, count)
{
	var len = forms.length;
	if (len < count)
	{
		var last_form = forms[len-1];
		for (var i=len; i<count; i++)
		{
			forms[i] = last_form;
		}
	}
	return forms;
}

rs.utils.convert_plural_en = function(count, forms)
{
	if (forms.length == 0)
	{
		return '';
	}
	forms = rs.utils.pre_convert_plural(forms, 2);
	return Math.abs(count) == 1 ? forms[0] : forms[1];
}

rs.utils.convert_plural_ru = function(count, forms)
{
	if (forms.length == 0)
	{
		return '';
	}
	if (forms.length == 2)
	{
		return count == 1 ? forms[0] : forms[1];
	}
	forms = rs.utils.pre_convert_plural(forms, 3);
	if (count > 10 && Math.floor((count % 100) / 10) == 1)
	{
		return forms[2];
	}
	else
	{
		switch (count % 10)
		{
			case 1: return forms[0];
			case 2:
			case 3:
			case 4: return forms[1];
			default: return forms[2];
		}
	}
}

rs.utils.addToList = function(str, addStr)
{
	return str + ' ' + addStr;
}

rs.utils.removeFromList = function(str, removeStr)
{
	var regexp = new RegExp(removeStr + ' ', "g");
	return (str + ' ').replace(regexp, "");
}

rs.utils.bubbleEvent = function(e)
{
	e = e || window.event || '';
	if(e)
	{
		if(IS_MSIE)
		{
			e.cancelBubble = true;
		}
		else
		{
			e.stopPropagation();
		}
	}
}
rs.utils.refreshFrame = function(name)
{
	if(name)
	{
		if(window.top[name])
		{
			window.top[name].location.replace(window.top[name].location.href.replace(/#[^#]*$/,''));
			if(window.top[name] == window)
			{
				return true;
			}
		}
	}
	else
	{
		window.location.replace(window.location.href.replace(/#[^#]*$/,''));
		return true;
	}
	return false;
}
rs.utils.redirect = function(url)
{
	window.top.location = url;
}

//**********************************************************************************************
// Common triggers
//
var common = {};
common.changeLockedClass = function()
{
	var elements = dom.getElementsByClassName('locked');
	if (elements.length)
	{
		var outer = document.createElement('div');
		outer.className = 'align_center_outer';
			
		var container = document.createElement('div');
		container.className = 'align_center-container';
			
		var inner = document.createElement('center');
		inner.className = 'align_center-inner';
			
		var div = document.createElement('div');
		div.className = 'sprite_lockIconLight';
			
		outer.appendChild(container);
		container.appendChild(inner);
		inner.appendChild(div);
		
		for(var i =0; i < elements.length; i++)
		{
			elements[i].innerHTML = '';
			elements[i].appendChild(outer.cloneNode(true));
		}
	}
}

//**********************************************************************************************
// Dom functions
//

var dom = {};

function $()
{
	var len = arguments.length;
	if (len == 1)
	{
		var e = arguments[0];
		return typeof(e) == 'string' ? document.getElementById(e) : e;
	}
	else
	{
		var all = [];
		for (var i=0; i<len; i++)
		{
			var e = arguments[i];
			all.push(typeof(e) == 'string' ? document.getElementById(e) : e);
		}
		return all;
	}
}

dom.getElementsByClassName = function(searchClass,node,tag)
{
	if(document.getElementsByClassName instanceof Function)
	{
		return document.getElementsByClassName(searchClass,node,tag);
	}
    var classElements = new Array();
    if ( node == null )
        node = document;
    if ( tag == null )
        tag = '*';
    var els = node.getElementsByTagName(tag);
    var elsLen = els.length;
    var pattern = new RegExp('(^|\\s)'+searchClass+'(\\s|$)');
    for (var i = 0, j = 0; i < elsLen; i++) {
        if ( pattern.test(els[i].className) ) {
            classElements[j] = els[i];
            j++;
        }
    }
    return classElements;
}

dom.getMousePosition = function(e)
{
	var posx = 0;
	var posy = 0;
	if (!e)
	{
		var e = window.event;
	}
	if (e.pageX || e.pageY)
	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY)
	{
		/*
			Scroll position IE
			------------------
			With the new DOM that is used in IE6, there is no longer the "body" object.
			The scroll offset is found in the documentElement object.
			Quirks mode: [document.body.scrollLeft, document.body.scrollTop]
			Strict mode: [document.documentElement.scrollLeft, document.documentElement.scrollTop]
		*/
		posx = e.clientX + (document.documentElement.scrollLeft||document.body.scrollLeft);
		posy = e.clientY + (document.documentElement.scrollTop||document.body.scrollTop);
	}

	if (e.clientX || e.clientY)
	{
		var posx_ = e.clientX;
		var posy_ = e.clientY;
	}

	return {x:posx, y:posy, x_:posx_, y_:posy_};
}

dom.getMousePositionRelative = function(e, target)
{
	var targetPos = dom.getElementPosition(target);
	var mousePos = dom.getMousePosition(e);
	return {
		x: mousePos.x - targetPos.x,
		y: mousePos.y - targetPos.y
	}
}

dom.insertAfter = function(src, dst)
{
	var parent = src.parentNode;
	if(src.nextSibling)
	{
		parent.insertBefore(dst, src.nextSibling);
	}
	else
	{
		parent.appendChild(dst);
	}
}

dom.getElementPosition = function(element)
{
	var posx = 0;
	var posy = 0;
	
	// Calculate element position
	var parent = element;
	while(parent)
	{
		// Bug in Opera
		if(!(IS_OPERA && parent.tagName == 'TR'))
		{
			posx += parent.offsetLeft;
		}
		posy += parent.offsetTop;
		parent = parent.offsetParent;
	}
	
	// Check window scrolls
	var size = dom.getWindowSize();
	var posx_ = posx - size.scrollLeft;
	var posy_ = posy - size.scrollTop;
	
	return {x:posx, y:posy, x_:posx_, y_:posy_};
}

dom.getWindowSize = function()
{
	var size = {};
	size.width = window.innerWidth != null ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null;
	size.height = window.innerHeight != null? window.innerHeight : document.documentElement && document.documentElement.clientHeight ?  document.documentElement.clientHeight : document.body != null? document.body.clientHeight : null;
	size.scrollLeft = document.documentElement.scrollLeft||document.body.scrollLeft;
	size.scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
	return size;
}

dom.setClassOnMouseEvents = function(node, classMouseOver, classMouseOut)
{
	node.onmouseover = function()
	{
		node.className = classMouseOver;
	}
	node.onmouseout = function()
	{
		node.className = classMouseOut;
	}
	node.onmouseout();
}

dom.addOnMouseEventsWatchNode = function(nodeWatchFor, node)
{
	node.onmouseover = function()
	{
		nodeWatchFor.onmouseover();
	}
	node.onmouseout = function()
	{
		nodeWatchFor.onmouseout();
	}
	node.onmouseout();
}

dom.deleteClass = function(element, className)
{
	element.className = rs.utils.removeFromList(element.className, className);
}

dom.addClass = function(element, className)
{
	element.className = rs.utils.addToList(element.className, className);
}

dom.scroll = function(element, direction, value)
{
	switch(direction)
	{
		case 'left':
		{
			element.scrollLeft += value;
		}
		case 'top':
		{
			element.scrollTop += value;
		}
		default:
		{
			return false;
		}
	}
}

dom.smoothScrollStep = function(element, direction, value, step, steps, timeout)
{
	return function()
	{
		if(step <= steps)
		{
			dom.scroll(element, direction, value);
			setTimeout(dom.smoothScrollStep(element, direction, value, step + 1, steps, timeout));
		}
	}
}

dom.smoothScroll = function(element, direction, value)
{
	var time = 500;
	var steps = 10;
	var stepTimeout = time / steps;
	var scrollPerStep = Math.ceil(value / steps);
	
	setTimeout(dom.smoothScrollStep(element, direction, scrollPerStep, 1, steps, stepTimeout), stepTimeout);
}

dom.clearSelection = function()
{
	var sel;
	if(document.selection && document.selection.empty)
	{
		document.selection.empty();
	}
	else if(window.getSelection) 
	{
		sel=window.getSelection();
	}
	if(sel && sel.removeAllRanges)
	{
		sel.removeAllRanges();
	}
}
