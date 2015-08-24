
// v. 2.0.0 dev.
//
// General functions
//

var IS_OPERA = navigator.userAgent.match('Opera') ? true : false;
var IS_MSIE = navigator.userAgent.match('MSIE') ? true : false;
var IS_MOZILLA = (navigator.userAgent.match('Mozilla') && !IS_MSIE) ? true : false;
var IS_KONQUEROR = navigator.userAgent.match('Konqueror') ? true : false;
var context_menu_click_type = 0;

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

function isEmpty(x)
{
	return ((x == null) || (x == ""));
}

function nvl(x, y)
{
	return isEmpty(x)? y:x;
}

function nvl2(c, x, y)
{
	return isEmpty(c)? x:y;
}

function dw(s)
{
	document.write(s);
}

function is_dev()
{
	return document.cookie.indexOf('MVTM_DEVELOPER=1') > 0 ? true : false;
}

function aldev(s)
{
	if (is_dev())
	{
		alert(s);
	}
}

function serialize(x)
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
				var sk = serialize(k);
				var sv = serialize(x[k]);
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

function serialize_for_print(x, sh)
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
				var sk = serialize_for_print(k, (sh || '') + '.     ');
				var sv = serialize_for_print(x[k], (sh || '') + '.     ');
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

function confirm_url(msg, url)
{
	var answer = confirm(msg);
	if (answer)
	{
		window.location = url;
	}
	return answer;
}

function replaceImg(img, src)
{
	img.src = src;
}

function replaceClass(elem, className)
{
	elem.className = className;
}

//
// Standard prototypes extensions
//

Function.prototype.getName = function()
{
	return this.toString();
}

Function.prototype.bind = function(object)
{
	var method = this;
	return function()
	{
		return method.apply(object, arguments);
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

Function.prototype.createCallerEx = function()
{
	var method = this;
	var args = arguments;
	return function()
	{
		method.call(null, arguments, args);
	}
}

Function.prototype.setQuestion = function(question)
{
	var method = this;
	var args = arguments;

	return function()
	{
		if (confirm(question))
		{
			method.apply(null, args);
		}
	}
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

String.prototype.padRight = function(length, padding)
{
	var s = this.toString();
	while (s.length < length)
	{
		s += padding;
	}
	return s;
}

String.prototype.repeat = function(num)
{
	var s = "";
	for (var i=0; i<num; i++)
	{
		s += this;
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

String.prototype.translate = function(tr)
{
	var s = "";
	for (var i=0; i<this.length; i++)
	{
		var c = this.charAt(i);
		s += tr[c]? tr[c]:c;
	}
	return s;
}

String.prototype.dashReplace = function()
{
	var hypen = new RegExp(String.fromCharCode(45), 'g');
	return this.replace(hypen, String.fromCharCode(8209));
}

String.prototype.splitArr = function(p)
{
	if (p.length == 1)
	{
		return this.split(p[0]);
	}
	else
	{
		var strings = this.split(p[p.length-1]);
		var result = [];
		for (var i=0; i<strings.length; i++)
		{
			result = result.concat(strings[i].splitArr(p.slice(0, p.length-1)))
		}
		return result;
	}
}

String.prototype.replaceAll = function(search, replace)
{
	return this.replace(new RegExp(search.replace(/([\\\-\{\}\(\)\|\[\]\?\*\+\^\$])/g, '\\$1'), 'g'), replace);
}

array_find = function(array, value)
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

object_extend = function(dst, src)
{
	for (var p in src)
	{
		dst[p] = src[p];
	}
}

object_isEmpty = function(obj)
{
	for (var p in obj)
	{
		return false;
	}
	return true;
}

object_keys = function(obj)
{
	var keys = [];
	for (var key in obj)
	{
		keys.push(key);
	}
	return keys;
}

//
// DOM functions
//

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

var dom = {};

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
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	if (e.clientX || e.clientY)
	{
		posx_ = e.clientX;
		posy_ = e.clientY;
	}

	return {x:posx, y:posy, x_:posx_, y_:posy_};
}

dom.getElementPosition = function(element)
{
	var posx = 0;
	var posy = 0;
	
	var parent = element;
	while(parent)
	{
		posx += parent.offsetLeft;
		posy += parent.offsetTop;
		parent = parent.offsetParent;
	}
	var posx_ = posx - (document.body.scrollLeft + document.documentElement.scrollLeft);
	var posy_ = posy - (document.body.scrollTop + document.documentElement.scrollTop);
	return {x:posx, y:posy, x_:posx_, y_:posy_};
}

dom.makePointerNode = function(node)
{
	node.onmouseover = function(e)
	{
		node.className = dom.deleteClass(node.className, 'over');
		node.className = dom.addClass(node.className, 'th');
		if(node.innerHTML.indexOf("sort")!=-1)
		{
			node.childNodes[0].className += "_hover";

		};
	};
	node.onmouseout = function(e)
	{
		node.className = dom.deleteClass(node.className, 'th');
		node.className = dom.addClass(node.className, 'over');
		if(node.innerHTML.indexOf("sort")!=-1)
		{
			node.childNodes[0].className = node.childNodes[0].className.replace("_hover", "");
		};
	};
	node.onmouseout();
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

dom.deleteClass = function(classString, className)
{
	var regexp = new RegExp(className + " ", "g");
	return (classString + " ").replace(regexp, "");
}

dom.addClass = function(classString, className)
{
	return classString + " " + className;
}
dom.next = function(e)
{
	do
	{
		e = e.nextSibling;
	}
	while (e && e.nodeType != 1);
	return e;
}

dom.prev = function(e)
{
	do
	{
		e = e.previousSibling;
	}
	while (e && e.nodeType != 1);
	return e;
}

dom.parent = function (e, tag)
{
	var parent = e;
	do
	{
		parent = parent.parentNode;
	}
	while (parent && parent.nodeName != tag);
	return parent;
}

dom.first = function (e)
{
	elem = e.firstChild;
	return elem && elem.nodeType != 1 ? dom.next(elem) : elem;
}

dom.last = function (e)
{
	elem = e.lastChild;
	return elem && elem.nodeType != 1 ? dom.prev(elem) : elem;
}

//
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
			this.constructor = clazz; // we need it!
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

//
// Controls
//

var rs;
if (!rs)
{
	rs = {};
}

//
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
			value = vars[i];
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
					dst_text = rs.convert_plural(lang, count, args);
					break;
				}
			}

			str = str.replaceAll(src_text, dst_text);
		}
	}

	return str;
}

rs.convert_plural = function(lang, count, forms)
{
	var convert_plural_func = 'convert_plural_' + lang;
	if (rs[convert_plural_func] instanceof Function)
	{
		return rs[convert_plural_func].call(null, count, forms);
	}
	return '';
}

rs.pre_convert_plural = function(forms, count)
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

rs.convert_plural_en = function(count, forms)
{
	if (forms.length == 0)
	{
		return '';
	}
	forms = rs.pre_convert_plural(forms, 2);
	return Math.abs(count) == 1 ? forms[0] : forms[1];
}

rs.convert_plural_ru = function(count, forms)
{
	if (forms.length == 0)
	{
		return '';
	}
	if (forms.length == 2)
	{
		return count == 1 ? forms[0] : forms[1];
	}
	forms = rs.pre_convert_plural(forms, 3);
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

//
// rs.event
//

rs.event = newClass
(
	null,
	{
		constructor: function()
		{
			this.delegates = [];
		},
		toString: function()
		{
			return "rs.event";
		},
		add: function(f)
		{
			this.delegates.push(f);
		},
		execute: function()
		{
			for (var i=0; i<this.delegates.length; i++)
			{
				this.delegates[i].apply(null, arguments);
			}
		}
	}
);

//
// rs.control
//

rs.control = newClass
(
	null,
	{
		constructor: function()
		{
			this.shownControl = true;
			this.isStatic = false;
			this.value = null;
			this.parent = null;
			this.hideStaticValue = false;
			this.baseStyle = "";
			this.style = "";
			this.dom = {};
			this.dom.rowset = {};
			this.onChange = new rs.event();
			this.watchFor = "";
			this.dom.controlLinks = [];
			this.dom.controlLines = [];
			this.verificationPassed = true;
			this.verifyRegExp = "";
			this.transformRegExp = "";
			this.verifyMinVal = "";
			this.verifyMaxVal = "";
			this.verifyMinValExclude = "";
			this.verifyMaxValExclude = "";
			this.verifyDataDelimiter = "";
			this.verifyDesc = "";
			this.maxLength = null;
			this.isCreated = false;
			this.disabled = false;
			this.watchForName = null;
			this.postCreateActions = [];
			this.wbsreadonly = false;
			alert('const');
		},
		toString: function()
		{
			return "rs.control";
		},
		setParameter: function(p)
		{
		},
		watchParameter: function(c)
		{
			if (c instanceof rs.control)
			{
				c.onChange.add(this.setParameter.bind(this));
			}
		},
		setPLookupHide: function(h)
		{
			this.lookupHide = h;
		},
		getParent: function()
		{
			if (this.parent instanceof rs.columnsgroup)
			{
				return this.parent.getParent();
			}

			return this.parent;
		},
		refresh: function()
		{
			if (!this.isStatic)
			{
				this.getValue();
			}
			this.onChange.execute(this);
		},
		refreshRow: function(rownum)
		{
			if (!this.isStatic && !this.dom)
			{
				this.getRowValue(rownum);
			}

			var args = new Array();

			args.push(this);
			for (var i=0;i<arguments.length;i++) args.push(arguments[i]);

			this.onChange.execute.apply(this.onChange, args);

//			this.onChange.execute(this, arguments);
		},
		applyStyle: function(e, addStyle)
		{
			if (e.classNameOrig == null)
			{
				e.classNameOrig = e.className == null ? '' : e.className;
			}
			var className = e.classNameOrig;
			if (this.baseStyle)
			{
				className += ' ' + this.baseStyle;
			}
			if (this.style)
			{
				className += ' ' + this.style;
			}
			if (addStyle)
			{
				className += ' ' + addStyle;
			}
			e.className = className;

		},
		createStatic: function(e, v, rownum, a)
		{
			this.applyStyle(e, a);

			if (!this.getParent().hideStaticValue)
			{
				e.appendChild(document.createTextNode(this.getStaticText(v)));
			}

			this.value = v;

			if (rownum || rownum==0)
			{
				this.refresh();
			}
			else
			{
				this.refreshRow(rownum);
			}
		},
		addPostCreateAction: function(func)
		{
			this.postCreateActions.push(func);
		},
		getStaticText: function(v)
		{
			return v || "";
		},
		createDynamic: function(e)
		{
		},
		create: function(e, v, rownum)
		{
			if ((rownum || rownum==0) && !this.dom.rowset[rownum])
			{
				this.dom.rowset[rownum] = {};
			}

			if (this.isStatic)
			{
				this.createStatic(e, v, rownum);
			}
			else
			{
//				this.createDynamic(e);
				if (rownum || rownum == 0)
				{
					this.createDynamic(e, rownum); //for list edit

					if (this.setRowValue)
					{
						this.setRowValue(v, rownum);
					}
					else
					{
						if (v != null)
						{
							this.setValue(v);
						}
					}
				}
				else
				{
					this.createDynamic(e);
					if (v != null)
					{
						this.setValue(v);
					}
				}
			}
		},
		executePostCreateActions: function()
		{
			for(var i in this.postCreateActions)
			{
				var func = this.postCreateActions.shift();
				func();
			}
		},
		createLine: function (table, v, shift)
		{
			var tr = table.insertRow(table.rows.length);
			if (context_menu_click_type == 0)
			{
				tr.onclick = this.getParent().ctxClick();
			}
			else
			{
				tr.oncontextmenu = this.getParent().ctxClick();
			}
			var td = tr.insertCell(0);
			td.className = "title";

			if (IS_OPERA && !this.getParent().dom.firstTitleTd)
			{
				this.getParent().dom.firstTitleTd = td;
			}

			td.title = this.hint || "";
			var txt = this.title || this.name || "";
//			if (this == 'rs.datebox') // Add date format
//			{
//				txt += ' (' + this.getDisplayFormatDesc() + ')';
//			}
			// Mark mandatory fields
			if (this.getParent().markNotNull && !this.isStatic && this.notNull)
			{
				txt = "* " + txt;
			}

			txt = txt.dashReplace();

			var text = document.createTextNode(txt);
			td.appendChild(text);
			var td = tr.insertCell(1);

			if (this.getParent().markControls)
			{
				td.className = "mark-check";
				var marked = v ? 1 : 0;
				if (this.watchFor && this.watchFor.dom.markCheckboxControl)
				{
					if (!this.watchFor.dom.markCheckboxControl.value)
					{
						marked = 0;
					}
				}
				this.createMarkCheckbox(td, marked);
				var td = tr.insertCell(2);
			}

			if (shift)
			{
				var t = document.createElement('TABLE');
				t.cellSpacing = 0;
				t.cellPadding = 0;
				t.className = "grouptree light-bg";
				var t_tr = t.insertRow(0);
				for (var i=0; i<shift; i++)
				{
					var t_td = t_tr.insertCell(t_tr.cells.length);
					t_td.className = "grouptree";
				}
				td.appendChild(t);

				td = t_tr.insertCell(t_tr.cells.length);
			}

			td.className = "data white-bg";
			if (this.isStatic)
			{
				td.className += " readonly";
			}
			if(this.getParent().record["style_" + this.name])
			{
				td.className += " " + this.getParent().record["style_" + this.name];
			}

			this.create(td, v);

			this.dom.controlLines[this.dom.controlLines.length] = tr;
		},
		setVisibility: function (mode)
		{
			var new_display_state = mode ? '' : 'none';

			if (this.dom.controlLines)
			{
				for (var line in this.dom.controlLines)
				{
					this.dom.controlLines[line].style.display = new_display_state;
				}
			}
		},
		createMarkCheckbox: function (e, v)
		{
			if (this.isStatic)
			{
				e.appendChild(document.createTextNode(' '));
			}
			else
			{
				var mark_control = new rs.checkbox();
				mark_control.name = "MARK_FOR_" + this.name;
				mark_control.style = "center";
				this.isStatic = false;

				if (this.watchFor instanceof rs.control && !this.watchFor.isStatic)
				{
					mark_control.watchParameter(this.watchFor.dom.markCheckboxControl);
					this.watchFor.dom.markCheckboxControl.watchParameter(mark_control);
				}

				this.dom.markCheckboxControl = mark_control;

				mark_control.create(e, v);
			}
		},
		getRecordValue: function(rownum)
		{
			if (rownum || rownum==0)
			{
				var v = this.dom.rowset[rownum].value;
			}
			else
			{
				var v = this.value;
			}

			if ((v != null) && (this.dataType == "N"))
			{
				v = v.toString().replace(/,/, ".");
			}

			return v;
		},
		getValue: function()
		{
		},
		setValue: function(v)
		{
		},
		getRowValue: function(rownum) //for list edit
		{
			this.getValue();
		},
		setRowValue: function(v, rownum) //for list edit
		{
			this.setValue(v);
		},
		verifyValue: function(rownum)
		{
			this.verificationPassed = true;
			this.verificationFailureReason = this.verifyDesc;

			if(this.getParent() && this.getParent().markControls)
			{
				this.dom.markCheckboxControl.getValue();

				if (!this.dom.markCheckboxControl.value)
				{
					return;
				}
			}

			if(rownum || rownum==0)
			{
				this.getRowValue(rownum);
				var value = this.dom.rowset[rownum].value;
			}
			else
			{
				this.getValue();
				var value = this.value;
			}

			if (!this.notNull && value == '')
			{
				return;
			}

			if (this.notNull && value == '')
			{
				this.verificationPassed = false;
				this.verificationFailureReason = rs.s('table.errors.non_empty', 'Field should be non-empty');
				return;
			}

			var a_values = new Array();
			var delimiter_arr = new Array();
			var delimiter = '';
			var new_value = '';

			if (isEmpty(this.verifyDataDelimiter))
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

					for (j = 0, i = 0; i < a_values.length; i++)
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

			if (!isEmpty(this.verifyRegExp))
			{
				var reg_exp = new RegExp(this.verifyRegExp);
			}
			if (!isEmpty(this.verifyMinVal))
			{
				var min_val = parseInt(this.verifyMinVal,10);
			}
			if (!isEmpty(this.verifyMaxVal))
			{
				var max_val = parseInt(this.verifyMaxVal,10);
			}

			for (var i in a_values)
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
						return;
					}
				}

				if (this.verifyMinVal != "")
				{
					if ((min_val - 1 > one_value - 1) || (this.verifyMinValExclude && ((min_val - 1) == (one_value - 1))))
					{
						this.verificationPassed = false;
						return;
					}
				}

				if (this.verifyMaxVal != "")
				{
					if ((max_val - 1 < one_value - 1) || (this.verifyMaxValExclude && (max_val - 1 == one_value - 1)))
					{
						this.verificationPassed = false;
						return;
					}
				}
			}

			// After transformation
			if (new_value != value)
			{
				if (rownum || rownum==0)
				{
					this.setRowValue(new_value, rownum);
				}
				else
				{
					this.setValue(new_value);
				}
			}

			return;
		},
		clone: function()
		{
			return new rs.control();
		},
		setFocus: function()
		{
		}
	}
);


//
// rs.textbox
//

rs.textbox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
		},
		toString: function()
		{
			return "rs.textbox";
		},
		focus: function(rownum)
		{
			if (rownum || rownum == 0)
			{
				if (this.dom.rowset[rownum].input && this.dom.rowset[rownum].input.focus)
				{
					this.dom.rowset[rownum].input.focus();
				}
			}
			else
			{
				if (this.dom.input && this.dom.input.focus)
				{
					this.dom.input.focus();
				}
			}
		},
		createDynamic: function(e, rownum)
		{

			var input = document.createElement("input");
                        rqfcreate(this.name,input,'i');
			if (this.maxLength != null)
			{
				input.maxLength = this.maxLength;
			}

//			this.dom.input = input;

			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].input = input;
				input.onchange = this.refreshRow.bind(this).createCaller(rownum);
			}
			else
			{
				this.dom.input = input;
				input.onchange = this.refresh.bind(this);
			}

			input.type = "text";
                        if (this.wbsreadonly) 
			{
			input.setAttribute('readonly','readonly');
			input.className='ctl-wbs-ro';
                        input.style.backgroundColor='#eff2eb'; 
			};

//			input.style.width = "100%";
			// BUG in IE
			input.style.width = (IS_MSIE && !IS_OPERA) ? "98%" : "100%";

			if (rownum || rownum==0) //for list edit
			{
				input.style.width = '250px';
//				input.className = 'ctl-textbox-editable';
			}


			this.dom.controlLinks[this.dom.controlLinks.length] = input;


//			input.onchange = this.refresh.bind(this);
			e.appendChild(input);
//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}
			this.isCreated = true;
		},

		getValue: function()
		{
			if (this.isCreated)
			{
				this.value = this.dom.input.value;
			}
		},
		setValue: function(v)
		{
			this.dom.input.value = v || "";
			this.refresh();
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				this.dom.rowset[rownum].value = this.dom.rowset[rownum].input.value;
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{
//			if (!rownum && rownum !=0) return;
			this.dom.rowset[rownum].input.value = v || "";
			this.refreshRow(rownum);
		},
		clone: function()
		{
			return new rs.textbox();
		}
	}
);
//
// rs.textboxext
//

rs.textboxext = newClass
(
	rs.control,
	{
		constructor: function()
		{
		        
			rs.control.call(this);
		},
		toString: function()
		{
			return "rs.textbox";
		},
		focus: function(rownum)
		{
			if (rownum || rownum == 0)
			{
				if (this.dom.rowset[rownum].input && this.dom.rowset[rownum].input.focus)
				{
					this.dom.rowset[rownum].input.focus();
				}
			}
			else
			{
				if (this.dom.input && this.dom.input.focus)
				{
					this.dom.input.focus();
				}
			}
		},
		createDynamic: function(e, rownum)
		{
			var input = document.createElement("input");
			rqfcreate(this.name,input,'i');

			if (this.maxLength != null)
			{
				input.maxLength = this.maxLength;
			}

//			this.dom.input = input;

			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].input = input;
				input.onchange = this.refreshRow.bind(this).createCaller(rownum);
				//this.dom.rowset[rownum].rqfnput = rqfinput;
			}
			else
			{
				this.dom.input = input;
				input.onchange = this.refresh.bind(this);
				//this.dom.rqfinput= rqfinput;
			}

			input.type = "text";
			input.name = this.name; // "eqprefix";

//			input.style.width = "100%";
			// BUG in IE
			input.style.width = (IS_MSIE && !IS_OPERA) ? "98%" : "100%";

			if (rownum || rownum==0) //for list edit
			{
				input.style.width = '250px';
//				input.className = 'ctl-textbox-editable';
			}


			this.dom.controlLinks[this.dom.controlLinks.length] = input;


                        input.onblur = this.handler_onblur.bind(this).createCaller(rownum);
                        input.onfocus = this.handler_onfocus.bind(this).createCaller(rownum);
//			input.onchange = this.refresh.bind(this);
			e.appendChild(input);
//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}

			this.isCreated = true;
		},
                 handler_onblur: function()
                {
		if (vcfocus!=this.value)  {
		doSubmit('blur',this.name,this.value);
		}
                },
                 handler_onfocus: function()
                {
		vcelement='';
		vcfocus=this.value;
                },
		getValue: function()
		{
			if (this.isCreated)
			{
				this.value = this.dom.input.value;
			}
		},
		setValue: function(v)
		{
			this.dom.input.value = v || "";
			this.refresh();
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				this.dom.rowset[rownum].value = this.dom.rowset[rownum].input.value;
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{
//			if (!rownum && rownum !=0) return;
			this.dom.rowset[rownum].input.value = v || "";
			this.refreshRow(rownum);
		},
		clone: function()
		{
			return new rs.textboxex();
		}
	}
);
//
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
		createDynamic: function(e, rownum)
		{
			var input = document.createElement("input");

//			this.dom.input = input;

			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].input = input;
				input.onchange = this.refreshRow.bind(this).createCaller(rownum);
			}
			else
			{
				this.dom.input = input;
				input.onchange = this.refresh.bind(this);
			}

			input.type = "password";

//			input.style.width = "100%";
			// BUG in IE
			input.style.width = (IS_MSIE && !IS_OPERA) ? "98%" : "100%";

//			input.onchange = this.refresh.bind(this);
			e.appendChild(input);
//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}

			this.isCreated = true;
		},
		getRecordValue: function(rownum)
		{
			if (rownum || rownum==0)
			{
				var v = this.dom.rowset[rownum].value;
			}
			else
			{
				var v = this.value;
			}
			return v;
		},
		clone: function()
		{
			return new rs.password();
		}
	}
);

//
// rs.textarea
//

rs.textarea = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "ctl-textarea";
			this.maxStaticLength = 100;
		},
		toString: function()
		{
			return "rs.textarea";
		},
		getStaticText: function(v)
		{
			// Remove extra line breaks

			var s = (v || "").replace(/\r/g, "");

			//
			//	Select first number of lines
			//	if (this.DisplayLines)
			//	{
			//		var lines = s.split("\n");
			//		if (lines.length > this.DisplayLines)
			//		{
			//			var s = lines.slice(0, this.DisplayLines).join("\n") + "\n...";
			//		}
			//	}
			//

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

			if (IS_OPERA && s.length > 4000) //bug 2768
			{
				var new_s = "";
				for (var i = 0; i < s.length; i++)
				{
					if(i%4000 == 0)
					{
						new_s += "\n";
					}
					new_s += s[i];
				}
				return new_s;
			}
			else
			{
				return s;
			}
		},
		addLinks: function(linksIn)
		{
			this.links = linksIn;
		},
		parseLinkAndAppend: function(e, string)
		{
			//e.appendChild(document.createTextNode("!!!!!!"+string+"!!!!!"));
			var regLink = new RegExp("table *= *\"([a-z_]*)\" *(.*) *> *(.*) *");
			regLink.exec(string);

			if (!this.links[RegExp.$1])
			{
				e.appendChild(document.createTextNode(RegExp.$3));
				return;
			}

			var link = document.createElement("A");
			link.href = "?action=Textarea:ViewLink&target="+this.links[RegExp.$1];
			var data_string = RegExp.$2;
			link.appendChild(document.createTextNode(RegExp.$3));
			e.appendChild(link);

			var s = 0;
			var p = false;
			var operator = "";
			var operator_val = "";
			var data = {};
			for(var i = 0; i < data_string.length; i++)
			{
				var c = data_string.charAt(i);
				switch(s)
				{
					case 0:
					{
						if(c == '"')
						{
							s = 1;
						}
						break;
					}
					case 1:
					{
						if(c == '"')
						{
							if(p)
							{
								data[operator] = operator_val;
								operator = "";
								operator_val = "";
								p = false;
								s = 0;
							}
							else
							{
								s = 2;
							}
						}
						else
						{
							if(p)
							{
								operator_val += c;
							}
							else
							{
								operator += c;
							}
						}
						break;
					}
					case 2:
					{
						if(c == '=')
						{
							p = true;
							s = 0;
						}
						break;
					}
				}
			}

			for(var c in data)
			{
				link.href = link.href + "&" + "data[" + c + "]=" + encodeURIComponent(data[c]);
			}
		},
		focus: function(rownum)
		{
			if (rownum || rownum == 0)
			{
				if (this.dom.rowset[rownum].textarea && this.dom.rowset[rownum].textarea.focus)
				{
					this.dom.rowset[rownum].textarea.focus();
				}
			}
			else
			{
				if (this.dom.textarea && this.dom.textarea.focus)
				{
					this.dom.textarea.focus();
				}
			}
		},
		createStatic: function(e, v, rownum, a)
		{
			this.applyStyle(e, a);
			text = this.getStaticText(v);

			d = document.createElement('div');
			e.appendChild(d);

			var regLink = new RegExp("<tm_link *(.*)</tm_link>");
			if (IS_MSIE)
			{
				regLink = /<tm_link +|<\/tm_link>/;
			}

			var arr = text.split(regLink);

			for(var i=0; i< arr.length; i++)
			{
				switch((i+2) % 2)
				{
					case 0:
					{
						d.appendChild(document.createTextNode(arr[i]));
						break;
					}
					case 1:
					{
						this.parseLinkAndAppend(d, arr[i]);
						break;
					}
					default:
				}
			}

			this.value = v;
			if (rownum || rownum==0)
			{
				this.refresh();
			}
			else
			{
				this.refreshRow(rownum);
			}
		},
		fitRowSize: function(textarea)
		{
			var value = textarea.value;
			var rows = IS_OPERA ? 3 : 1;

			for (var i=0; (i < value.length) && (rows <= 20); i++)
			{
				if (value.charAt(i) == '\n')
				{
					rows++;
				}
			}
			if (textarea.rows != rows)
			{
			        rows++;
				textarea.rows = rows;
			}
           	},
		createDynamic: function(e, rownum)
		{
			var textarea = document.createElement('textarea');
                        rqfcreate(this.name,textarea,'t')
			textarea.name=this.name;
			textarea.rows = IS_OPERA ? 3 : 1;
			textarea.wrap = 'off';
			textarea.onkeyup = this.fitRowSize.bind(this).createCaller(textarea);

                        if (this.wbsreadonly) 
			{
			
			textarea.setAttribute('readonly','readonly');
		        textarea.className='ctl-wbs-ro';
		        textarea.style.backgroundColor='#eff2eb';
			};
			var thisObj = this;

			if (rownum || (rownum == 0)) //for list edit
			{
				this.dom.rowset[rownum].textarea = textarea;
				textarea.onchange = this.refreshRow.bind(this).createCaller(rownum);
				textarea.style.width = '200px';
			}
			else
			{
				this.dom.textarea = textarea;
				textarea.onchange = this.refresh.bind(this);
				textarea.style.width = (IS_MSIE && !IS_OPERA) ? "98%" : "100%";
			}

			this.dom.controlLinks[this.dom.controlLinks.length] = textarea;
			e.appendChild(textarea);
//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}
		},
		getValue: function()
		{
			this.value = this.dom.textarea.value;
		},
		setValue: function(v)
		{

			this.dom.textarea.value = v || "";
			this.fitRowSize(this.dom.textarea);
			this.refresh();
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				this.dom.rowset[rownum].value = this.dom.rowset[rownum].textarea.value;
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{

		        if (v.indexOf('@#') > 0 ) alert(v);
			this.dom.rowset[rownum].textarea.value = v || "";
			this.fitRowSize(this.dom.rowset[rownum].textarea);
			this.refreshRow(rownum);
		},
		clone: function()
		{
			return new rs.textarea();
		}
	}
);

//
// rs.hypertext
//

rs.hypertext = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "ctl-textarea";
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
		createStatic: function(e, v, rownum)
		{
			this.applyStyle(e);
			if (1==1) // v
			{
				var div = document.createElement('div');
				this.dom.div = div;
				div.innerHTML = v;
				e.appendChild(div);
			}
		},
		clone: function()
		{
			return new rs.hypertext();
		}
	}
);


//
// rs.checkbox
//

rs.checkbox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "ctl-checkbox";
		},
		toString: function()
		{
			return "rs.checkbox";
		},
		setParameter: function(p)
		{
			if (p instanceof rs.control)
			{
				p = p.value;
			}
			if (this.value != p)
			{
				this.setValue(p);
			}
		},
		getStaticText: function(v)
		{
			return (v == 1) ? rs.s('checkbox.yes', 'Yes') : '';
		},
		createDynamic: function(e, rownum)
		{
			var checkbox = document.createElement("input");
			this.dom.checkbox = checkbox;
                        rqfcreate(this.name,checkbox,'c');
			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].checkbox = checkbox;
				checkbox.onclick = this.refreshRow.bind(this).createCaller(rownum);
			}
			else
			{
				this.dom.checkbox = checkbox;
				checkbox.onclick = this.refresh.bind(this);
			}

			checkbox.type = "checkbox";
//			checkbox.onclick = this.refresh.bind(this);
			e.appendChild(checkbox);
//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}
		},
		getValue: function()
		{
			if (this.dom.checkbox)
			{
				this.value = this.dom.checkbox.checked? 1:0;
			}
		},
		setValue: function(v)
		{
			this.dom.checkbox.checked = (v==1);
			this.refresh();
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				if(this.dom.rowset[rownum].checkbox)
				{
					this.dom.rowset[rownum].value = this.dom.rowset[rownum].checkbox.checked ? 1 : 0;
				}
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{
			this.dom.rowset[rownum].checkbox.checked = (v == 1);
			this.refreshRow(rownum);
		},
		clone: function()
		{
			return new rs.checkbox();
		}
	}
);


//
// rs.checkboxext
//

rs.checkboxext = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "ctl-checkbox";
		},
		toString: function()
		{
			return "rs.checkbox";
		},
		setParameter: function(p)
		{
			if (p instanceof rs.control)
			{
				p = p.value;
			}
			if (this.value != p)
			{
				this.setValue(p);
			}
		},
		getStaticText: function(v)
		{
			return (v == 1) ? rs.s('checkbox.yes', 'Yes') : '';
		},
		createDynamic: function(e, rownum)
		{
			var checkbox = document.createElement("input");
			this.dom.checkbox = checkbox;
                        rqfcreate(this.name,checkbox,'c');
			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].checkbox = checkbox;
				//checkbox.onclick = this.refreshRow.bind(this).createCaller(rownum);
			}
			else
			{
				this.dom.checkbox = checkbox;
				//checkbox.onclick = this.refresh.bind(this);
			}

			checkbox.type = "checkbox";

                    //    checkbox.onblur = this.handler_onblur.bind(this).createCaller(rownum);
                      //  checkbox.onfocus = this.handler_onfocus.bind(this).createCaller(rownum);
			checkbox.onclick = this.handler_onclick.bind(this).createCaller(rownum);//this.refresh.bind(this);
			e.appendChild(checkbox);
//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}
		},
                 handler_onclick: function()
                {
		vcelement='';
		//if (vcfocus!=this.value)  {
		doSubmit('blur',this.name,this.dom.checkbox.checked);
		//}
                },
                 handler_onfocus: function()
                {
		vcelement='';
		vcfocus=this.value;
                },
		getValue: function()
		{
			if (this.dom.checkbox)
			{
				this.value = this.dom.checkbox.checked? 1:0;
			}
		},
		setValue: function(v)
		{
			this.dom.checkbox.checked = (v==1);
			this.refresh();
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				if(this.dom.rowset[rownum].checkbox)
				{
					this.dom.rowset[rownum].value = this.dom.rowset[rownum].checkbox.checked ? 1 : 0;
				}
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{
			this.dom.rowset[rownum].checkbox.checked = (v == 1);
			this.refreshRow(rownum);
		},
		clone: function()
		{
			return new rs.checkbox();
		}
	}
);

//
// rs.combobox
//

rs.combobox = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "ctl-lookup";
			this.notNull = true;
			this.lookup = {};
			this.separatorPositions = {};
		},
		toString: function()
		{
			return "rs.combobox";
		},
		setLookup: function(lookup)
		{
			this.lookup = lookup;
		},
		setLookupExt: function(lookup)
		{
			this.lookupExt = lookup;
		},
		setLookupStyles: function(lookupStyles)
		{
			this.lookupStyles = lookupStyles;
		},
		setPLookup: function(plookup)
		{
			this.plookup = plookup;
		},
		getPLookupList: function()
		{
			var lookup_list = [];
			for(var pc in this.plookup)
			{
				for(var c in this.plookup[pc])
				{
					lookup_list[c] = this.plookup[pc][c];
				}
			}
			return lookup_list;
		},
		setParameter: function(p, rownum)
		{
			var change_type = 'by_plookup';

			if (this.dom.markCheckboxControl && this.getParent().markControls)
			{
				if (p == this.dom.markCheckboxControl)
				{
					change_type = 'by_mark';
				}
			}

			if ((rownum || rownum==0) && p.dom.rowset[rownum]) //for list edit
			{
				p.getRowValue(rownum);
				p = p.dom.rowset[rownum].value;

				if (p == null)
				{
					p = '';
				}

				if (this.dom.rowset[rownum] == null)
				{
					this.dom.rowset[rownum] = {};
				}

				/*if (this.dom.rowset[rownum].plookup_value == p)
				{
					return;
				}*/

				this.dom.rowset[rownum].plookup_value = p;
			}
			else if (change_type == 'by_plookup')
			{
				p.getValue();
				p = p.value;

				if (p == null)
				{
					p = '';
				}

				/*if (this.plookup_value == p)
				{
					return;
				}*/

				this.plookup_value = p;
			}

			if(this.lookupHide)
			{
				if(this.lookupHide[p])
				{
					this.disableControl(true, rownum);
				}
				else
				{
					this.disableControl(false, rownum);
				}
			}

			if (this.plookup && change_type == 'by_plookup')
			{
				this.lookup = ((this.plookup[p] == null)/* || p == ''*/) ? {} : this.plookup[p];
			}

			if (this.dom.rowset
				&& (rownum || rownum == 0)
				&& this.dom.rowset[rownum]
				&& (this.dom.rowset[rownum].select || this.dom.rowset[rownum].span)) //for list edit
			{
				this.setRowOptions(rownum, this.lookup);
				this.setRowValue(this.dom.rowset[rownum].value, rownum);
				this.refreshRow(rownum);
			}

			if (this.dom.select || this.dom.span)
			{
				this.setOptions(this.lookup, this.lookupStyles);
				this.setValue(this.value);
				this.refresh();
			}
		},
		getStaticText: function(v)
		{
			return this.lookup[v] || v || '';
		},
		createStatic: function(e, v, rownum, a)
		{
			var style = a ? a : '';
			if (this.lookupStyles)
			{
				var lookupStyle = this.lookupStyles[v]
				if (lookupStyle)
				{
					style += ' ' + lookupStyle
				}
			}
			this.applyStyle(e, style);

			if (!this.getParent().hideStaticValue)
			{
				e.appendChild(document.createTextNode(this.getStaticText(v)));
			}

			this.value = v;

			if (rownum || rownum==0)
			{
				this.refresh();
			}
			else
			{
				this.refreshRow(rownum);
			}
		},
		createDynamic: function(e, rownum)
		{
			var select = document.createElement("select");
			rqfcreate(this.name,select,'s');
			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].select = select;
				this.setRowOptions(rownum, this.lookup);
				select.onchange = this.refreshRow.bind(this).createCaller(rownum);
				select.disabled = this.dom.rowset[rownum].disabled;
			}
			else
			{
				this.dom.select = select;
//				this.setOptions(this.lookup);
				if (this.lookupStyles)
				{
					this.setOptions(this.lookup, this.lookupStyles);
				}
				else
				{
					this.setOptions(this.lookup);
				}
				select.onchange = this.refresh.bind(this);
				select.disabled = this.disabled;

				if (this.dom.markCheckboxControl && this.getParent().markControls)
				{
					this.watchParameter(this.dom.markCheckboxControl);
				}
			}

//			this.dom.select = select;
//			this.setOptions(this.lookup);
//			select.onchange = this.refresh.bind(this);
                        if (this.wbsreadonly) select.disabled=true;
			e.appendChild(select);

//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}
		},
		setOptions: function(options, styles)
		{
			var select = this.dom.select;

			while (select.length > 0)
			{
				select.remove(0);
			}

			var use_separators = !object_isEmpty(this.separatorPositions)

			if (use_separators)
			{
				var options_counter = 1;
				var separator_style = 'bold';
			}

			if (!this.notNull)
			{
				addOption(select, "", "", false);
			}
			else
			{
				if (this.dom.markCheckboxControl && this.getParent().markControls)
				{
					this.dom.markCheckboxControl.getValue();
					if (!this.dom.markCheckboxControl.value)
					{
						addOption(select, "", "", false);
					}
				}
			}
			for (var key in options)
			{
				addOption(select, options[key], key, false, ((styles && styles[key]) ? styles[key] : '') + (separator_style ? ' '+separator_style : ''));

				if (use_separators)
				{
					if (this.separatorPositions[options_counter] == 1)
					{
//						addOption(select, "------", "", false);
						separator_style = separator_style ? '' : 'bold';
					}
					options_counter++;
				}
			}

			if (IS_KONQUEROR)
			{
				if (select.options.length > 0)
				{
					select.selectedIndex = 0;
				}
			}
		},
		setRowOptions: function(rownum, options) //for list edit
		{
			if (!this.dom.rowset[rownum])
			{
				return;
			}

			var select = this.dom.rowset[rownum].select;
			while (select.length > 0)
			{
				select.remove(0);
			}
			if (!this.notNull)
			{
				addOption(select, "", "", false);
			}
			for (var key in options)
			{
				addOption(select, options[key], key, false);
			}

			if (IS_KONQUEROR)
			{
				if (select.options.length > 0)
				{
					select.selectedIndex = 0;
				}
			}
		},
		getValue: function()
		{
			if (this.dom.select)
			{
				this.value = this.dom.select.value;
			}
		},
		setValue: function(v)
		{
			v = v || "";
			var result = false;
			for (var i=0; i<this.dom.select.options.length; i++)
			{
				if (this.dom.select.options[i].value == v)
				{
					this.dom.select.selectedIndex = i;
					result = true;
					break;
				}
			}
			this.refresh();
			return result;
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				if (this.dom.rowset[rownum])
				{
					if (this.dom.rowset[rownum].select)
					{
						this.dom.rowset[rownum].value = this.dom.rowset[rownum].select.value;
					}
				}
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{
			v = v || "";
			for (var i=0; i<this.dom.rowset[rownum].select.options.length; i++)
			{
				if (this.dom.rowset[rownum].select.options[i].value == v)
				{
					this.dom.rowset[rownum].select.selectedIndex = i;
					break;
				}
			}
			this.refreshRow(rownum);
		},
		disableControl: function(disabled, rownum)
		{
			if(rownum || rownum == 0)
			{
				this.dom.rowset[rownum].disabled = disabled;
				if(this.dom.rowset[rownum].select)
				{
					this.dom.rowset[rownum].select.disabled = disabled;
				}
			}
			else
			{
				this.disabled = disabled;
				if (this.dom.select)
				{
					this.dom.select.disabled = disabled;
				}
			}
		},
		clone: function()
		{
			var clone = new rs.combobox();
			clone.notNull = this.notNull;
			if (this.plookup)
			{
				clone.setPLookup(this.plookup);
			}
			else if (this.lookup)
			{
				clone.setLookup(this.lookup)
			}
			return clone;
		}
	}
);
//
// rs.comboboxext
//

rs.comboboxext = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
			this.baseStyle = "ctl-lookup";
			this.notNull = true;
			this.lookup = {};
			this.separatorPositions = {};
		},
		toString: function()
		{
			return "rs.combobox";
		},
		setLookup: function(lookup)
		{
			this.lookup = lookup;
		},
		setLookupExt: function(lookup)
		{
			this.lookupExt = lookup;
		},
		setLookupStyles: function(lookupStyles)
		{
			this.lookupStyles = lookupStyles;
		},
		setPLookup: function(plookup)
		{
			this.plookup = plookup;
		},
		getPLookupList: function()
		{
			var lookup_list = [];
			for(var pc in this.plookup)
			{
				for(var c in this.plookup[pc])
				{
					lookup_list[c] = this.plookup[pc][c];
				}
			}
			return lookup_list;
		},
		setParameter: function(p, rownum)
		{
			var change_type = 'by_plookup';

			if (this.dom.markCheckboxControl && this.getParent().markControls)
			{
				if (p == this.dom.markCheckboxControl)
				{
					change_type = 'by_mark';
				}
			}

			if ((rownum || rownum==0) && p.dom.rowset[rownum]) //for list edit
			{
				p.getRowValue(rownum);
				p = p.dom.rowset[rownum].value;

				if (p == null)
				{
					p = '';
				}

				if (this.dom.rowset[rownum] == null)
				{
					this.dom.rowset[rownum] = {};
				}

				/*if (this.dom.rowset[rownum].plookup_value == p)
				{
					return;
				}*/

				this.dom.rowset[rownum].plookup_value = p;
			}
			else if (change_type == 'by_plookup')
			{
				p.getValue();
				p = p.value;

				if (p == null)
				{
					p = '';
				}

				/*if (this.plookup_value == p)
				{
					return;
				}*/

				this.plookup_value = p;
			}

			if(this.lookupHide)
			{
				if(this.lookupHide[p])
				{
					this.disableControl(true, rownum);
				}
				else
				{
					this.disableControl(false, rownum);
				}
			}

			if (this.plookup && change_type == 'by_plookup')
			{
				this.lookup = ((this.plookup[p] == null)/* || p == ''*/) ? {} : this.plookup[p];
			}

			if (this.dom.rowset
				&& (rownum || rownum == 0)
				&& this.dom.rowset[rownum]
				&& (this.dom.rowset[rownum].select || this.dom.rowset[rownum].span)) //for list edit
			{
				this.setRowOptions(rownum, this.lookup);
				this.setRowValue(this.dom.rowset[rownum].value, rownum);
				this.refreshRow(rownum);
			}

			if (this.dom.select || this.dom.span)
			{
				this.setOptions(this.lookup, this.lookupStyles);
				this.setValue(this.value);
				this.refresh();
			}
		},
		getStaticText: function(v)
		{
			return this.lookup[v] || v || '';
		},
		createStatic: function(e, v, rownum, a)
		{
			var style = a ? a : '';
			if (this.lookupStyles)
			{
				var lookupStyle = this.lookupStyles[v]
				if (lookupStyle)
				{
					style += ' ' + lookupStyle
				}
			}
			this.applyStyle(e, style);

			if (!this.getParent().hideStaticValue)
			{
				e.appendChild(document.createTextNode(this.getStaticText(v)));
			}

			this.value = v;

			if (rownum || rownum==0)
			{
				this.refresh();
			}
			else
			{
				this.refreshRow(rownum);
			}
		},
		createDynamic: function(e, rownum)
		{
			var select = document.createElement("select");
			rqfcreate(this.name,select,'s');
			if (rownum || rownum==0) //for list edit
			{
				this.dom.rowset[rownum].select = select;
				this.setRowOptions(rownum, this.lookup);
				select.onchange = this.refreshRow.bind(this).createCaller(rownum);
				select.disabled = this.dom.rowset[rownum].disabled;
			}
			else
			{
				this.dom.select = select;
//				this.setOptions(this.lookup);
				if (this.lookupStyles)
				{
					this.setOptions(this.lookup, this.lookupStyles);
				}
				else
				{
					this.setOptions(this.lookup);
				}
				select.onchange = this.refresh.bind(this);
				select.disabled = this.disabled;

				if (this.dom.markCheckboxControl && this.getParent().markControls)
				{
					this.watchParameter(this.dom.markCheckboxControl);
				}
			}

//			this.dom.select = select;
//			this.setOptions(this.lookup);
//			select.onchange = this.refresh.bind(this);

                        //input.onblur = this.handler_onblur.bind(this).createCaller(rownum);
                        select.onchange = this.handler_onchange.bind(this).createCaller(rownum);
                        if (this.wbsreadonly) select.disabled=true;
			e.appendChild(select);

//			this.refresh();

			if (rownum || rownum==0) //for list edit
			{
				this.refreshRow(rownum);
			}
			else
			{
				this.refresh();
			}
		},
                handler_onchange: function()
                {
		this.refresh.bind(this);
		doSubmit('select',this.name,this.dom.select.value);
		},
		setOptions: function(options, styles)
		{
			var select = this.dom.select;

			while (select.length > 0)
			{
				select.remove(0);
			}

			var use_separators = !object_isEmpty(this.separatorPositions)

			if (use_separators)
			{
				var options_counter = 1;
				var separator_style = 'bold';
			}

			if (!this.notNull)
			{
				addOption(select, "", "", false);
			}
			else
			{
				if (this.dom.markCheckboxControl && this.getParent().markControls)
				{
					this.dom.markCheckboxControl.getValue();
					if (!this.dom.markCheckboxControl.value)
					{
						addOption(select, "", "", false);
					}
				}
			}
			for (var key in options)
			{
				addOption(select, options[key], key, false, ((styles && styles[key]) ? styles[key] : '') + (separator_style ? ' '+separator_style : ''));

				if (use_separators)
				{
					if (this.separatorPositions[options_counter] == 1)
					{
//						addOption(select, "------", "", false);
						separator_style = separator_style ? '' : 'bold';
					}
					options_counter++;
				}
			}

			if (IS_KONQUEROR)
			{
				if (select.options.length > 0)
				{
					select.selectedIndex = 0;
				}
			}
		},
		setRowOptions: function(rownum, options) //for list edit
		{
			if (!this.dom.rowset[rownum])
			{
				return;
			}

			var select = this.dom.rowset[rownum].select;
			while (select.length > 0)
			{
				select.remove(0);
			}
			if (!this.notNull)
			{
				addOption(select, "", "", false);
			}
			for (var key in options)
			{
				addOption(select, options[key], key, false);
			}

			if (IS_KONQUEROR)
			{
				if (select.options.length > 0)
				{
					select.selectedIndex = 0;
				}
			}
		},
		getValue: function()
		{
			if (this.dom.select)
			{
				this.value = this.dom.select.value;
			}
		},
		setValue: function(v)
		{
			v = v || "";
			var result = false;
			for (var i=0; i<this.dom.select.options.length; i++)
			{
				if (this.dom.select.options[i].value == v)
				{
					this.dom.select.selectedIndex = i;
					result = true;
					break;
				}
			}
			this.refresh();
			return result;
		},
		getRowValue: function(rownum) //for list edit
		{
			if (rownum || rownum==0)
			{
				if (this.dom.rowset[rownum])
				{
					if (this.dom.rowset[rownum].select)
					{
						this.dom.rowset[rownum].value = this.dom.rowset[rownum].select.value;
					}
				}
			}
		},
		setRowValue: function(v, rownum) //for list edit
		{
			v = v || "";
			for (var i=0; i<this.dom.rowset[rownum].select.options.length; i++)
			{
				if (this.dom.rowset[rownum].select.options[i].value == v)
				{
					this.dom.rowset[rownum].select.selectedIndex = i;
					break;
				}
			}
			this.refreshRow(rownum);
		},
		disableControl: function(disabled, rownum)
		{
			if(rownum || rownum == 0)
			{
				this.dom.rowset[rownum].disabled = disabled;
				if(this.dom.rowset[rownum].select)
				{
					this.dom.rowset[rownum].select.disabled = disabled;
				}
			}
			else
			{
				this.disabled = disabled;
				if (this.dom.select)
				{
					this.dom.select.disabled = disabled;
				}
			}
		},
		clone: function()
		{
			var clone = new rs.comboboxext();
			clone.notNull = this.notNull;
			if (this.plookup)
			{
				clone.setPLookup(this.plookup);
			}
			else if (this.lookup)
			{
				clone.setLookup(this.lookup)
			}
			return clone;
		}
	}
);
//
// rs.ecombobox
//

rs.ecombobox = newClass
(
	rs.combobox,
	{
		constructor: function()
		{
			rs.combobox.call(this);

			this.manual_value = "$#HM@$";

			this.byValue = true;
			this.is_manual = false;
			this.td_container = null;

			this.value_text_old = "";

			this.from_manual = false;
		},
		toString: function()
		{
			return "rs.ecombobox";
		},
		setLookup: function(lookup)
		{
			this.lookup = lookup;
		},
		setPLookup: function(plookup)
		{
			this.plookup = plookup;
		},
		setParameter: function(p, rownum)
		{
			if (p != this && (p instanceof rs.control))
			{
				p = p.value;

				this.lookup = (this.plookup[p] == null) ? {} : this.plookup[p];
				//alert(this.lookup);

				if (this.dom.rowset
					&& (rownum || rownum == 0)
					&& this.dom.rowset[rownum]
					&& (this.dom.rowset[rownum].select)
					&& this.is_manual == false) //for list edit
				{
					this.is_manual = true;
					this.setRowOptions(rownum, this.lookup);
					this.setRowValue(this.value, rownum);
					this.refreshRow(rownum);
				}

				if (this.dom.select)
				{
					this.setOptions(this.lookup);
					this.setValue(this.value);
					this.refresh();
				}
			}

			var obj = p;
			if (p instanceof rs.control)
			{
				p = p.value;
			}

			if (rownum || rownum == 0)
			{
				if (obj.dom.rowset[rownum] && obj instanceof rs.control)
				{
					obj.getRowValue(rownum);
					p = obj.dom.rowset[rownum].value;
				}

				if (p == this.manual_value && this.dom.rowset[rownum].is_manual != true)
				{
					this.dom.rowset[rownum].is_manual = true;
					this.createDynamic(null, rownum);
				}
			}
			else
			{
//				if (this.is_manual == false
//					&& this.dom.select
//					&& ((this.dom.select.selectedIndex == 0 && this.notNull) || (this.dom.select.selectedIndex == 1 && !this.notNull)))
				if (p == this.manual_value && this.is_manual == false)
				{
					this.is_manual = true;
					this.createDynamic();
				}
			}
		},
		changeToSelect: function(m, rownum)
		{
			if (rownum != null)
			{
				if (!m.dom.rowset[rownum].is_manual)
				{
					return;
				}
				m.getRowValue(rownum);
				m.dom.rowset[rownum].is_manual = false;
				m.dom.rowset[rownum].from_manual = true;
				m.createDynamic(null, rownum);
			}
			else
			{
				if (!m.is_manual)
				{
					return;
				}
				m.getValue();
				m.is_manual = false;
				m.from_manual = true;
				m.createDynamic();
			}
		},
		getStaticText: function(v)
		{
//			return this.byValue ?
//				v || '' :
//				this.lookup[v] || v || '';
			return this.lookup[v] || v || '';
		},
		createDynamic: function(e, rownum)
		{
		       
			if (rownum != null)
			{
				if (this.dom.rowset[rownum].td_container == null || e != null)
				{
					this.dom.rowset[rownum].td_container = e;
				}

				if (this.dom.rowset[rownum].is_manual == true)
				{
					var input = document.createElement('input');
                                        rqfcreate(this.name,input,'x');
					this.dom.rowset[rownum].input = input;
					input.type = "text";
					input.value = this.dom.rowset[rownum].value_text_old;

					if (this.dom.rowset[rownum].select)
					{
						this.dom.rowset[rownum].td_container.removeChild(this.dom.rowset[rownum].select);
						delete(this.dom.rowset[rownum].select);
					}

					this.dom.rowset[rownum].td_container.appendChild(input);

					var input_img = document.createElement('input');
					this.dom.rowset[rownum].input_img = input_img;
					input_img.type = 'button';
					input_img.value = rs.s('ecombobox.list', 'List');
					input_img.onclick = this.changeToSelect.createCaller(this, rownum);
					this.dom.rowset[rownum].td_container.appendChild(input_img);
				}
				else
				{
					var select = document.createElement("select");
					rqfcreate(this.name,select,'x');
					this.dom.rowset[rownum].select = select;

					this.setRowOptions(rownum, this.lookup);
					if (this.notNull && select.options.length > 1)
					{
						// The first value option (after '-- Manual input --') must be selected
						select.selectedIndex = 1;
					}

					select.onchange = this.refreshRow.bind(this).createCaller(rownum);

					if (this.dom.rowset[rownum].input)
					{
						this.dom.rowset[rownum].td_container.removeChild(this.dom.rowset[rownum].input);
						this.dom.rowset[rownum].td_container.removeChild(this.dom.rowset[rownum].input_img);
						delete(this.dom.rowset[rownum].input);
						delete(this.dom.rowset[rownum].input_img);
					}

					this.dom.rowset[rownum].td_container.appendChild(select);
					if (this.dom.rowset[rownum].from_manual == true)
					{
						this.setValueByText(this.dom.rowset[rownum].value, this.dom.rowset[rownum].select, rownum);
						this.dom.rowset[rownum].from_manual = false;
					}

					this.onChange.add(this.setParameter.bind(this).createCaller(rownum));
//					this.watchParameter(this)

					this.refreshRow(rownum);
				}
			}
			else
			{
				if (this.td_container == null)
				{
					this.td_container = e;
				}

				if (this.is_manual == true)
				{
					var input = document.createElement('input');
					rqfcreate(this.name,input,'x');
					this.dom.input = input;
					input.type = "text";
					input.value = this.value_text_old || '';

					if (this.dom.select)
					{
						this.td_container.removeChild(this.dom.select);
						delete(this.dom.select);
					}

					this.td_container.appendChild(input);

					var input_img = document.createElement('input');
					this.dom.input_img = input_img;
					input_img.type = 'button';
					input_img.value = rs.s('ecombobox.list', 'List');
					input_img.onclick = this.changeToSelect.createCaller(this);
					this.td_container.appendChild(input_img);
				}
				else
				{
					var select = document.createElement("select");
                                        rqfcreate(this.name,select,'x');
					this.dom.select = select;
					this.setOptions(this.lookup);
					if (this.notNull && select.options.length > 1)
					{
						// The first value option (after '-- Manual input --') must be selected
						select.selectedIndex = 1;
					}

					select.onchange = this.refresh.bind(this);

					if (this.dom.input)
					{
						this.td_container.removeChild(this.dom.input);
						this.td_container.removeChild(this.dom.input_img);
						delete(this.dom.input);
						delete(this.dom.input_img);
					}

					this.td_container.appendChild(select);
					if (this.from_manual == true)
					{
						this.setValueByText(this.value);
						this.from_manual = false;
					}

					this.watchParameter(this)

					this.refresh();
				}
			}
		},
		setOptions: function(options)
		{
			while (this.dom.select.length > 0)
			{
				this.dom.select.remove(0);
			}
			if (!this.notNull)
			{
				addOption(this.dom.select, "", "", false);
			}

			var manualInputTitle = '--- ' + rs.s('ecombobox.manual_input', 'Manual input') + ' ---';
			addOption(this.dom.select, manualInputTitle, this.manual_value, false);

			for (var key in options)
			{
				addOption(this.dom.select, options[key], key, false);
			}
		},
		setRowOptions: function(rownum, options)
		{
			if (!this.dom.rowset[rownum])
			{
				return;
			}

			while (this.dom.rowset[rownum].select.length > 0)
			{
				this.dom.rowset[rownum].select.remove(0);
			}
			if (!this.notNull)
			{
				addOption(this.dom.rowset[rownum].select, "", "", false);
			}

			var manualInputTitle = '--- ' + rs.s('ecombobox.manual_input', 'Manual input') + ' ---';
			addOption(this.dom.rowset[rownum].select, manualInputTitle, this.manual_value, false);

			for (var key in options)
			{
				addOption(this.dom.rowset[rownum].select, options[key], key, this.notNull?true:false);
			}
		},
		getValue: function()
		{
			this.value_text_old = this.value_text;
			if (this.is_manual == true && this.dom.input)
			{
				this.value = this.dom.input.value;
				this.value_text = this.dom.input.value;
			}
			else
			{
				this.value = this.dom.select.value;
				if (this.dom.select.selectedIndex >= 0)
				{
					this.value_text = this.byValue ?
						this.dom.select[this.dom.select.selectedIndex].value :
						this.dom.select[this.dom.select.selectedIndex].text;
				}
				else
				{
					// Konqueror sets selectedIndex == -1 for new select objects
					this.value_text = '';
				}
//				this.value_text = this.byValue == false ? this.dom.select[this.dom.select.selectedIndex].text : this.dom.select[this.dom.select.selectedIndex].value;
			}
		},
		getRowValue: function(rownum)
		{
			this.dom.rowset[rownum].value_text_old = this.dom.rowset[rownum].value_text;
			if (this.dom.rowset[rownum].is_manual == true && this.dom.rowset[rownum].input)
			{
				this.dom.rowset[rownum].value = this.dom.rowset[rownum].input.value;
				this.dom.rowset[rownum].value_text = this.dom.rowset[rownum].input.value;
			}
			else
			{
				this.dom.rowset[rownum].value = this.dom.rowset[rownum].select.value;
				this.dom.rowset[rownum].value_text = this.byValue == false ? this.dom.rowset[rownum].select[this.dom.rowset[rownum].select.selectedIndex].text : this.dom.rowset[rownum].select[this.dom.rowset[rownum].select.selectedIndex].value;
			}
		},
		setValue: function(v)
		{
			v = v || "";

			var is_set = false;
			if (this.is_manual)
			{
				this.dom.input.value = v;
			}
			else
			{
				for (var i=0; i<this.dom.select.options.length; i++)
				{
					if (this.dom.select.options[i].value == v)
					{
						this.dom.select.selectedIndex = i;
						is_set = true;
						break;
					}
				}

				if (is_set == true)
				{
					this.watchParameter(this)
				}
				else
				{
					this.value_text_old = v;
					this.is_manual = true;
					this.createDynamic();
				}
			}

			this.refresh();
		},
		setRowValue: function(v, rownum)
		{
			if (!this.dom.rowset[rownum].select) return;
			v = v || "";
			var is_set = false;
			for (var i=0; i<this.dom.rowset[rownum].select.options.length; i++)
			{
				if (this.dom.rowset[rownum].select.options[i].value == v)
				{
					this.dom.rowset[rownum].select.selectedIndex = i;
					is_set = true;
					break;
				}
			}

			if (is_set == true)
			{
				this.onChange.add(this.setParameter.bind(this).createCaller(this, rownum));
//				this.watchParameter(this)
			}
			else
			{
				this.dom.rowset[rownum].value_text_old = v;
				this.dom.rowset[rownum].is_manual = true;
				this.createDynamic(null, rownum);
			}

			this.refreshRow(rownum);
		},
		setValueByText: function(v, obj, rownum)
		{
			if (!obj)
			{
				obj = this.dom.select;
			}

			if (this.dataType != 'I')
			{
				v = v || "";
				var no_manual_index = null;
				var is_set = false;

				for (var i=0; i<obj.options.length; i++)
				{
					if ((this.byValue == false && obj.options[i].text == v) || (this.byValue == true && obj.options[i].value == v))
					{
						obj.selectedIndex = i;
						is_set = true;
						break;
					}
					if (no_manual_index == null && obj.options[i].value != this.manual_value)
					{
						no_manual_index = i;
					}
				}
				if (is_set == false && no_manual_index != null)
				{
					obj.selectedIndex = no_manual_index;
				}
			}
			else
			{
				var delta = Number.MAX_VALUE;
				var index = 0;
				v = parseFloat(v);
				v = v || 0;

				for (var i=0; i<obj.options.length; i++)
				{
					var delta_temp = this.byValue == false ? Math.abs(obj.options[i].text - v) : Math.abs(obj.options[i].value - v);
					if (delta_temp < delta)
					{
						delta = delta_temp;
						index = i;
					}
				}

				obj.selectedIndex = index;
			}

			if (rownum || rownum == 0)
			{
				this.onChange.add(this.setParameter.bind(this).createCaller(this, rownum));
			}
			else
			{
				this.watchParameter(this)
			}
		},
		clone: function()
		{
			var clone = new rs.ecombobox();
			clone.notNull = this.notNull;
			clone.dataType = this.dataType;
			clone.keepSort = this.keepSort;
			clone.byValue = this.byValue;
			if (this.plookup)
			{
				clone.setPLookup(this.plookup);
			}
			else if (this.lookup)
			{
				clone.setLookup(this.lookup)
			}
			return clone;
		}
	}
);


//
// rs.arrangebox
//

rs.arrangebox = newClass
(
	rs.combobox,
	{
		constructor: function()
		{
			rs.combobox.call(this);
			this.set = [];
			this.delimiter = ";";
			this.selectSize = 10;
			this.lookup_index = new Array();
			this.baseStyle = 'ctl-arrangebox';
		},
		toString: function()
		{
			return "rs.arrangebox";
		},
		getStaticText: function(v)
		{
			var set = [];
			var keys = (v || '').split(this.delimiter);
			for (var i=0; i<keys.length; i++)
			{
				var value = this.lookup[keys[i]];
				if (value != null)
				{
					set.push(value);
				}
			}
			return set.join(this.delimiter);
		},
		createStatic: function(e, v, rownum, a)
		{
			this.applyStyle(e, a);

			if (!this.getParent().hideStaticValue)
			{
				var set = [];
				var keys = (v || '').split(this.delimiter);

				var ul = document.createElement('ul');

				for (var i=0; i<keys.length; i++)
				{
					var key = keys[i];
					var value = this.lookup[key];
					if (value != null)
					{
						var li = document.createElement('li');
						var lookupStyle = this.lookupStyles[key];
						if (lookupStyle)
						{
							li.className = lookupStyle;
						}
						li.appendChild(document.createTextNode(value));
						ul.appendChild(li);
					}
				}
				e.appendChild(ul);
			}

			this.value = v;

			if (rownum || rownum==0)
			{
				this.refresh();
			}
			else
			{
				this.refreshRow(rownum);
			}
		},
		createDynamic: function(e, rownum)
		{
			if (this.keepSort)
			{
				this.createLookupIndex();
			}

			// Table
			var table = document.createElement("table");
			table.className = "ctl-arrangetoolbox";
			//table.style.width = "100%";
			var tr = table.insertRow(0);

			// Select 1
			var td = tr.insertCell(0);
			td.rowSpan = 2;
			//td.style.width = "50%";

			var select1 = document.createElement("select");
			select1.multiple = true;
			select1.size = this.selectSize;
			//select1.style.width = "100%";
			select1.ondblclick = this.addSelected.bind(this).createCaller(rownum);
			td.appendChild(select1);

			// Add/remove buttons
			var td = tr.insertCell(1);
			td.style.width = "0px";
			td.style.verticalAlign = "top";
			var input = document.createElement("input");
			input.type = "button";
			input.value = ">>";
			input.style.width = "8ex";
			input.onclick = this.addAll.bind(this).createCaller(rownum);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = ">";
			input.style.width = "8ex";
			input.onclick = this.addSelected.bind(this).createCaller(rownum);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = "<";
			input.style.width = "8ex";
			input.onclick = this.removeSelected.bind(this).createCaller(rownum);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = "<<";
			input.style.width = "8ex";
			input.onclick = this.removeAll.bind(this).createCaller(rownum);
			td.appendChild(input);

			// Select 2
			var td = tr.insertCell(2);
			td.rowSpan = 2;
			//td.style.width = "50%";
			var select2 = document.createElement("select");
			if (1==1 ) {
                        var rqfinput2 = document.createElement("input");
                        rqfinput2.type='hidden';
                        rqfinput2.name='rqfszarrangebox'+vccount;
                        rqfinput2.id='rqfszarrangebox'+vccount;
                        select2.name='zarrangebox'+vccount;
			vccount=vccount+1;
			};
                        document.forms[0].appendChild(rqfinput2);
			select2.multiple = true;
			select2.size = this.selectSize;
			//select2.style.width = "100%";
			select2.ondblclick = this.removeSelected.bind(this).createCaller(rownum);
			td.appendChild(select2);

			// Move up/move down buttons
			if (!this.keepSort)
			{
				var tr = table.insertRow(1);
				tr.style.height = "0%";
				var td = tr.insertCell(0);
				td.style.width = "0px";
				td.style.verticalAlign = "bottom";
				var input = document.createElement("input");
				input.type = "button";
				input.value = '\u2191';
				input.style.width = "8ex";
				input.onclick = this.moveUpSelected.bind(this).createCaller(rownum);
				td.appendChild(input);
				td.appendChild(document.createElement("br"));
				var input = document.createElement("input");
				input.type = "button";
				input.value = '\u2193';
				input.style.width = "8ex";
				input.onclick = this.moveDownSelected.bind(this).createCaller(rownum);
				td.appendChild(input);
				td.appendChild(document.createElement("br"));
			}

			e.appendChild(table);

			if (rownum == null)
			{
				this.dom.select1 = select1;
				this.dom.select2 = select2;

				this.setValue([]);
			}
			else //for list edit
			{
				this.dom.rowset[rownum].select1 = select1;
				this.dom.rowset[rownum].select2 = select2;

				this.setRowValue([], rownum);
			}
		},
		applyOptionStyles: function(select)
		{
			for (var i=select.options.length-1; i>=0; i--)
			{
				var option = select.options[i];
				if (this.lookupStyles[option.value]) option.className = this.lookupStyles[option.value];
			}
		},
		createLookupIndex: function()
		{
			var i = 0;
			for (var key in this.lookup)
			{
				this.lookup_index[key] = i++;
			}

			this.sortLookupFunc = function(a, b)
			{
				var a_index = this.lookup_index[a.value];
				var b_index = this.lookup_index[b.value];
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
		sortLookup: function(rownum)
		{
			if (rownum == null)
			{
				sortSelect(this.dom.select1, this.sortLookupFunc);
				sortSelect(this.dom.select2, this.sortLookupFunc);
			}
			else // for list edit
			{
				sortSelect(this.dom.rowset[rownum].select1, this.sortLookupFunc);
				sortSelect(this.dom.rowset[rownum].select2, this.sortLookupFunc);
			}
		},
		setOptions: function(options)
		{
		},
		syncValue: function(rownum)
		{
			if (rownum == null)
			{
				var set = [];
				for (var i=0; i<this.dom.select2.options.length; i++)
				{
					set.push(this.dom.select2.options[i].value);
				}
				this.value = set.join(this.delimiter);
			}
			else // for list edit
			{
				var set = [];
				for (var i=0; i<this.dom.rowset[rownum].select2.options.length; i++)
				{
					set.push(this.dom.rowset[rownum].select2.options[i].value);
				}
				this.dom.rowset[rownum].value = set.join(this.delimiter);
			}
		},
		getValue: function()
		{
			this.syncValue();
		},
		clone: function()
		{
			var clone = new rs.arrangebox();
			clone.notNull = this.notNull;
			clone.delimiter = this.delimiter;
			if (this.plookup)
			{
				clone.setPLookup(this.plookup);
			}
			else if (this.lookup)
			{
				clone.setLookup(this.lookup)
			}
			return clone;
		},
		setValue: function(v)
		{
			var set = v instanceof Array ? v : v.toString().split(this.delimiter);

			var select1 = this.dom.select1;
			var select2 = this.dom.select2;

			// Clear select1 and select2
			removeAllOptions(select1);
			removeAllOptions(select2);

			// Fill in select1
			for (var optionId in this.lookup)
			{
				if (array_find(set, optionId) < 0)
				{
					addOption(select1, this.lookup[optionId], optionId, false);
				}
			}

			// Fill in select2
			for (var i=0; i<set.length; i++)
			{
				if (this.lookup[set[i]])
				{
					addOption(select2, this.lookup[set[i]], set[i], false);
				}
			}

			this.applyOptionStyles(select1);
			this.applyOptionStyles(select2);
		},
		addAll: function(rownum)
		{
			// Move all options from select1 into select2

			if (rownum == null)
			{
				moveAllOptions(this.dom.select1, this.dom.select2, false);
				this.syncValue();
				if (this.keepSort)
				{
					this.sortLookup();
				}
			}
			else //for list edit
			{
				moveAllOptions(this.dom.rowset[rownum].select1, this.dom.rowset[rownum].select2, false);
				this.syncValue(rownum);
				if (this.keepSort)
				{
					this.sortLookup(rownum);
				}
			}
		},
		removeAll: function(rownum)
		{
			// Move all options from select2 into select1

			if (rownum == null)
			{
				moveAllOptions(this.dom.select2, this.dom.select1, false);
				this.syncValue();
				if (this.keepSort)
				{
					this.sortLookup();
				}
			}
			else //for list edit
			{
				moveAllOptions(this.dom.rowset[rownum].select2, this.dom.rowset[rownum].select1, false);
				this.syncValue(rownum);
				if (this.keepSort)
				{
					this.sortLookup(rownum);
				}
			}
		},
		addSelected: function(rownum)
		{
			// Move selected option from select1 into select2

			if (rownum == null)
			{
				var selectedIndex = this.dom.select1.selectedIndex;

				moveSelectedOptions(this.dom.select1, this.dom.select2, false);
				this.syncValue();
				if (this.keepSort)
				{
					this.sortLookup();
				}

				if(selectedIndex >= 0 && this.dom.select1.options[selectedIndex])
				{
					this.dom.select1.selectedIndex = selectedIndex;
				}
			}
			else // for list edit
			{
				var selectedIndex = this.dom.rowset[rownum].select1.selectedIndex;
				moveSelectedOptions(this.dom.rowset[rownum].select1, this.dom.rowset[rownum].select2, false);
				this.syncValue(rownum);
				if (this.keepSort)
				{
					this.sortLookup(rownum);
				}
				if (selectedIndex >= 0 && this.dom.rowset[rownum].select1.options[selectedIndex] && this.dom.rowset[rownum].select1.selectedIndex)
				{
					this.dom.rowset[rownum].select1.selectedIndex = selectedIndex;
				}
			}
		},
		removeSelected: function(rownum)
		{
			// Move selected option from select2 into select1
			if (rownum == null)
			{
				var selectedIndex = this.dom.select2.selectedIndex;
				moveSelectedOptions(this.dom.select2, this.dom.select1, false);
				this.syncValue();
				if (this.keepSort)
				{
					this.sortLookup();
				}

				if (selectedIndex >= 0 && this.dom.select2.options[selectedIndex])
				{
					this.dom.select2.selectedIndex = selectedIndex;
				}
			}
			else // for list edit
			{
				var selectedIndex = this.dom.rowset[rownum].select2.selectedIndex;

				moveSelectedOptions(this.dom.rowset[rownum].select2, this.dom.rowset[rownum].select1, false);
				this.syncValue(rownum);
				if (this.keepSort)
				{
					this.sortLookup(rownum);
				}
				if (selectedIndex >= 0 && this.dom.rowset[rownum].select2.options[selectedIndex] && this.dom.rowset[rownum].select2.selectedIndex)
				{
					this.dom.rowset[rownum].select2.selectedIndex = selectedIndex;
				}
			}
		},
		moveUpSelected: function(rownum)
		{
			// Move selected option up in select2

			if (rownum == null)
			{
				moveOptionUp(this.dom.select2);
				this.syncValue();
			}
			else // for list edit
			{
				moveOptionUp(this.dom.rowset[rownum].select2);
				this.syncValue(rownum);
			}
		},
		moveDownSelected: function(rownum)
		{
			// Move selected option down in select2

			if (rownum == null)
			{
				moveOptionDown(this.dom.select2);
				this.syncValue();
			}
			else
			{
				moveOptionDown(this.dom.rowset[rownum].select2);
				this.syncValue(rownum);
			}
		},
		setRowOptions: function(rownum, options) //for list edit
		{
		},
		getRowValue: function(rownum) //for list edit
		{
			this.syncValue(rownum);
		},
		setRowValue: function(v, rownum) //for list edit
		{
			var set =
				v instanceof Array ? v :
				v == null ? [] :
				v.toString().split(this.delimiter);

			var select1 = this.dom.rowset[rownum].select1;
			var select2 = this.dom.rowset[rownum].select2;

			// Clear select1 and select2
			removeAllOptions(select1);
			removeAllOptions(select2);

			// Fill in select1
			for (var optionId in this.lookup)
			{
				if (array_find(set, optionId) < 0)
				{
					addOption(select1, this.lookup[optionId], optionId, false);
				}
			}

			// Fill in select2
			for (var i=0; i<set.length; i++)
			{
				if (this.lookup[set[i]])
				{
					addOption(select2, this.lookup[set[i]], set[i], false);
				}
			}

			this.applyOptionStyles(select1);
			this.applyOptionStyles(select2);
		}
	}
);

//
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
		},
		toString: function()
		{
			return "rs.set";
		},
		getStaticText: function(v)
		{
			var set = [];
			var s = this.delimiter + (v || "") + this.delimiter;
			for (var key in this.lookup)
			{
				if (s.indexOf(this.delimiter + key + this.delimiter) >= 0)
				{
					set.push(this.lookup[key]);
				}
			}
			return set.join(this.delimiter);
		},
		createDynamic: function(e, rownum)
		{
			var span = document.createElement("span");
			span.style.whiteSpace = "normal";
			if (rownum || rownum == 0)
			{
				this.dom.rowset[rownum].span = span;
				this.dom.rowset[rownum].options = {};
				this.setRowOptions(rownum, this.lookup);
				e.appendChild(span);
				this.refresh();
			}
			else
			{
				this.dom.span = span;
				this.dom.options = {};
				this.setOptions(this.lookup);
				e.appendChild(span);
				this.refresh();
			}
		},
		setOptions: function(options)
		{
			var span = this.dom.span;
			span.innerHTML = "";
			this.dom.options = {};
			for (var key in options)
			{
				var label = document.createElement("label");
				label.style.whiteSpace = "nowrap";
				label.style.margin = "0 1ex 0 0";

				var checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.onclick = this.refresh.bind(this);
				checkbox.style.margin = "1px 0";
				label.appendChild(checkbox);
				this.dom.options[key] = checkbox;

				var text = document.createTextNode(" " + options[key]);
				label.appendChild(text);

				span.appendChild(label);
			}
		},
		setRowOptions: function(rownum, options)
		{
			var span = this.dom.rowset[rownum].span;
			span.innerHTML = "";
			this.dom.rowset[rownum].options = {};
			for (var key in options)
			{
				var label = document.createElement("label");
				label.style.whiteSpace = "nowrap";
				label.style.margin = "0 1ex 0 0";

				var checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				checkbox.onclick = this.refresh.bind(this);
				checkbox.style.margin = "1px 0";
				label.appendChild(checkbox);
				this.dom.rowset[rownum].options[key] = checkbox;

				var text = document.createTextNode(" " + options[key]);
				label.appendChild(text);

				span.appendChild(label);
			}
		},
		getValue: function()
		{
			var set = [];
			for (var key in this.dom.options)
			{
				if (this.dom.options[key].checked)
				{
					set.push(key);
				}
			}
			this.value = set.join(this.delimiter);
		},
		setValue: function(v)
		{
			var r = new RegExp('[ ]*' + this.delimiter + '[ ]*', 'g');
			v = v.replace(r, this.delimiter);
			v = this.delimiter + (v || "") + this.delimiter;
			for (var key in this.dom.options)
			{
				this.dom.options[key].checked = (v.indexOf(this.delimiter + key + this.delimiter) >= 0);
			}
			this.refresh();
		},
		getRowValue: function(rownum)
		{
			var set = [];
			for (var key in this.dom.rowset[rownum].options)
			{
				if (this.dom.rowset[rownum].options[key].checked)
				{
					set.push(key);
				}
			}
			this.dom.rowset[rownum].value = set.join(this.delimiter);
		},
		setRowValue: function(v, rownum)
		{
			v = this.delimiter + (v || "") + this.delimiter;
			for (var key in this.dom.rowset[rownum].options)
			{
				this.dom.rowset[rownum].options[key].checked = (v.indexOf(this.delimiter + key + this.delimiter) >= 0);
			}
			this.refreshRow(rownum);
		},
		clone: function()
		{
			var clone = new rs.set();
			clone.notNull = this.notNull;
			if (this.plookup)
			{
				clone.setPLookup(this.plookup);
			}
			else if (this.lookup)
			{
				clone.setLookup(this.lookup)
			}
			return clone;
		}
	}
);

//
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
			for (var key in this.lookup)
			{
				if (v & key)
				{
					set.push(this.lookup[key]);
				}
			}
			return set.join(this.delimiter);
		},
		getValue: function()
		{
			this.value = 0;
			for (var key in this.dom.options)
			{
				if (this.dom.options[key].checked)
				{
					this.value |= key;
				}
			}
		},
		setValue: function(v)
		{
			v = v || 0;
			for (var key in this.dom.options)
			{
				this.dom.options[key].checked = ((v & key) != 0);
			}
			this.refresh();
		},
		getRowValue: function(rownum)
		{
			this.dom.rowset[rownum].value = 0;
			for (var key in this.dom.rowset[rownum].options)
			{
				if (this.dom.rowset[rownum].options[key].checked)
				{
					this.dom.rowset[rownum].value |= key;
				}
			}
		},
		setRowValue: function(v, rownum)
		{
			v = v || 0;
			for (var key in this.dom.rowset[rownum].options)
			{
				this.dom.rowset[rownum].options[key].checked = ((v & key) != 0);
			}
			this.refreshRow(rownum);
		},
		clone: function()
		{
			var clone = new rs.bitmask();
			clone.notNull = this.notNull;
			if (this.plookup)
			{
				clone.setPLookup(this.plookup);
			}
			else if (this.lookup)
			{
				clone.setLookup(this.lookup)
			}
			return clone;
		}
	}
);

rs.year = newClass
(
		rs.control,
		{
				constructor: function()
				{
						rs.control.call(this);
						this.step = 1;
						this.delay = 120;
						this.value ={};
				},
				toString: function()
				{
						return "rs.year";
				},
				createDynamic: function(e, rownum)
				{
						var input = document.createElement("input");
						input.type = "text";
						input.size = this.size;
						input.maxLength = this.size;
						this.value=input.value;
						input.onchange = this.change.bind(this).createCaller(rownum);
						input.onblur = this.change.bind(this).createCaller(rownum);

						var left = document.createElement("input");
						left.type = "button";
						left.value = "<";
						left.style.width = "15px";
						left.onmousedown = this.startTimerLeft.bind(this).createCaller(rownum);
						left.onmouseup = this.stopTimer.bind(this).createCaller(rownum);
						left.onmouseout = this.stopTimer.bind(this).createCaller(rownum);
						left.onblur = this.stopTimer.bind(this).createCaller(rownum);
						left.onclick = this.decriment.bind(this).createCaller(rownum);
						if(IS_MSIE && !IS_OPERA)
							left.ondblclick = this.decriment.bind(this).createCaller(rownum);

						var right = document.createElement("input");
						right.type = "button";
						right.value = ">";
						right.style.width = "15px";
						right.onmousedown = this.startTimerRight.bind(this).createCaller(rownum);
						right.onmouseup = this.stopTimer.bind(this).createCaller(rownum);
						right.onmouseout = this.stopTimer.bind(this).createCaller(rownum);
						right.onblur = this.stopTimer.bind(this).createCaller(rownum);
						right.onclick = this.increment.bind(this).createCaller(rownum);
						if(IS_MSIE && !IS_OPERA)
							right.ondblclick = this.increment.bind(this).createCaller(rownum);

						if (rownum || rownum==0) //for list edit
						{
							this.dom.rowset[rownum].input = input;
							this.dom.rowset[rownum].left = left;
							this.dom.rowset[rownum].right = right;
						}
						else
						{
							this.dom.input = input;
							this.dom.left = left;
							this.dom.right = right;
						}

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
						regular = new RegExp(reg);

						if(regular.test(input.value)==false)
								 input.value=input.previous;
						else
								 input.previous=input.value;
						this.value=input.value;

						this.onChange.execute();
				},
				getValue: function()
				{
						this.value = this.dom.input.value;
				},
				setValue: function(v)
				{
						this.dom.input.value = this.dom.input.previous = v || "";
						this.refresh();
				}
		}
);

//
// rs.days
//
rs.days = newClass
(
		rs.control,
		{
				constructor: function()
				{
						rs.control.call(this);
						this.value = {};
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
				createDynamic: function(e, rownum)
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
						table.className = "ctl-date";
						table.style.width = "100%"
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
				getLenghtDay: function(year, month)
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
					daySum=day+firstDay-2;
					firstWeek+=Math.floor(daySum/7);

					if(month == 1 && Math.floor(daySum/7)==0 && leftWeek==0)
						firstWeek = this.getNumberWeek(year-1, 12, 31);

					if(month == 12 && day>31-7 && rightWeek==0)
						firstWeek = 1;


					return firstWeek<10 ? "0"+firstWeek: firstWeek;
				},
				refreshDays: function()
				{
					day = this.days;

					if(this.onlyWeeks)
					{
						for(var value = 1; value<=7; value++)
						{
							day[value].className = day[value].suit;

							if(day[value].value == this.value)
								this.days[value].className += " select";
						}
						return;
					}

					var firstDay = this.getDay(this.year, this.month, 1);
					var lenghtDay = this.getLenghtDay(this.year, this.month);
					if(this.value>lenghtDay)
						this.value = lenghtDay;
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
								if(count == this.value)
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
						this.value = arguments[0].value;
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
						this.value = arguments[0].value;
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
						this.value = v || "";
						this.refreshDays();
						this.refresh();
				}
		}
);


//
// rs.datebox
//

rs.datebox = newClass
(
	rs.control,
		{
				constructor: function()
				{
						rs.control.call(this);
						this.baseStyle = "ctl-datebox";
						this.valueFormat = "YMDhms";
						this.displayFormat = "Y-M-D h:m:s";
						this.useLookup = true;
						this.onEdit = false;
						this.warningMessage = rs.s('datebox.warning','Invalid date');
				},
				toString: function()
				{
						return "rs.datebox";
				},
				focus: function(rownum)
				{
					if (rownum || rownum == 0)
					{
						if (this.dom.rowset[rownum].input && this.dom.rowset[rownum].input.focus)
						{
							this.dom.rowset[rownum].input.focus();
						}
					}
					else
					{
						if (this.dom.input && this.dom.input.focus)
						{
							this.dom.input.focus();
						}
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
				createDynamic: function(e, rownum)
				{
						var table = document.createElement("table");
						table.cellSpacing = 0;
						table.cellPadding = 0;
						e.appendChild(table);

						var input = document.createElement("input");
						input.type="text";
                        if (this.wbsreadonly) 
			{
			input.setAttribute('readonly','readonly');
			input.className='ctl-wbs-ro';
                        input.style.backgroundColor='#eff2eb'; 
			};
						input.size=30;
						input.onchange = this.checkValid.bind(this).createCaller(rownum);
						input.onclick = this.show(rownum);
						input.onblur = this.handler_onblur.bind(this).createCaller(rownum);
						var tr = table.insertRow(0);
						var td = tr.insertCell(0);
						td.appendChild(input);

/*
						td.appendChild(document.createTextNode(' '));
						var div = document.createElement('div');
						div.className = 'sprite_calendar_smallIcon pointer';
						div.title = rs.s('datebox.select', 'Select');
						div.onclick = this.show(rownum);
						td.appendChild(div);
*/
						var warning = document.createElement("span");
						warning.appendChild(document.createTextNode(this.warningMessage));
						warning.className = "red";
						warning.style.display = "none";
						var td = tr.insertCell(1);
						td.style.paddingLeft = "1ex";
						td.appendChild(warning);
                                                rqfcreate(this.name,input,'d');

						if (rownum || rownum==0) //for list edit
						{
							this.dom.rowset[rownum].input = input;
							this.dom.rowset[rownum].warning = warning;
						}
						else
						{
							this.dom.input = input;
							this.dom.warning = warning;
						}


						if(this.dom.table)
						{
							this.hide();
							e.appendChild(this.dom.table);
							e.appendChild(this.dom.cover);
							return;
						}
//table
						var cover = document.createElement("iframe");
						cover.src = "blank.html";
						cover.className = "cover";
						cover.style.display = "none";

						var table_ext = document.createElement("table");
						table_ext.className = "ctl-ctxmenu no-print";
						table_ext.style.display = "none";
						table_ext.cellSpacing = 0;
						table_ext.cellPadding = 0;
						table_ext.onmousedown = this.handler_onclick.bind(this).createCaller(rownum);

						var table_int = document.createElement("table");
						table_int.className = "ctl-date";
						table_int.cellSpacing = 0;
						table_int.cellPadding = 0;

						var tr = table_ext.insertRow(0);
						var td = tr.insertCell(0);
						td.appendChild(table_int);

						var disp_format = this.displayFormat.toString();
						var is_exists_Y = disp_format.search("Y")>=0 ? true : false;
						var is_exists_M = disp_format.search("M")>=0 ? true : false;
						var is_exists_D = disp_format.search("D")>=0 ? true : false;
						var is_exists_W = disp_format.search("W")>=0 ? true : false;
						var is_exists_h = disp_format.search("h")>=0 ? true : false;
						var is_exists_m = disp_format.search("m")>=0 ? true : false;
						var is_exists_s = disp_format.search("s")>=0 ? true : false;
						var is_full = is_exists_Y && is_exists_M && is_exists_D;

						this.dom.table = table_ext;
						this.dom.cover = cover;
						this.dom.isShow = false;
						this.dom.date = {}
						this.dom.table.rownum = {};
//Y:
						if(is_full)
						{
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);

							var Y = new rs.year();
							Y.size = this.units.Y[0];
							Y.min = this.units.Y[1];
							Y.max = this.units.Y[2];
							Y.create(td);
							Y.onChange.add
							(
								function()
								{
									D.year = Y.value;
									D.refreshDays();
								}
							);

							Y.onChange.add(this.ok.bind(this));
							this.dom.date.Y = Y;

//M:
							td.appendChild(document.createTextNode(" "));

							var size = this.units.M[0];
							var min = this.units.M[1];
				 			var max = this.units.M[2];
							var unitLookup = this.unitsLookup.M;

							var M = new rs.combobox();

							var caption = {};
							for (var value=min; value<=max; value++)
						 	{
								caption[value] = unitLookup ? unitLookup[value - min] : value.toString().padLeft(size, "0");
						 	}
							M.setLookup(caption);
							M.create(td);
							M.onChange.add
							(
								function()
								{
									D.month = M.value;
									D.refreshDays();
								}
							);
							M.onChange.add(this.ok.bind(this));
							M.dom.select.onfocus = this.focusControl.bind(this);
							M.dom.select.onblur = this.blurControl.bind(this);
							this.dom.date.M = M;

//D:
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);
							td.ondblclick = this.hide.bind(this);

				 			var D = new rs.days();
							D.yearControl = Y;
							D.monthControl = M;
							D.create(td);
							D.onChange.add(this.ok.bind(this));
							this.dom.date.D = D;
						}


						if(is_exists_W)
						{
							var tr = table_int.insertRow(table_int.rows.length);
							var td = tr.insertCell(tr.cells.length);

			 				var W = new rs.days();
							W.onlyWeeks = true;
							W.create(td);
							W.onChange.add(this.ok.bind(this));
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

									var caption = {};
									for (var value=min; value<=max; value++)
									{
										caption[value] = unitLookup ? unitLookup[value - min] : value.toString().padLeft(size, "0");
									}
									combobox.setLookup(caption);
									combobox.create(td);
									combobox.onChange.add(this.ok.bind(this).createCaller(rownum));
									combobox.dom.select.onfocus = this.focusControl.bind(this);
									combobox.dom.select.onblur = this.blurControl.bind(this);

									td.appendChild(document.createTextNode("  "));
									this.dom.date[c] = combobox;
								}
							}
						}

						e.appendChild(table_ext);
						e.appendChild(cover);

						if (rownum || rownum==0) //for list edit
						{
							this.getRowValue(rownum);
						}
						else
						{
							this.getValue();
						}
				},
				ctxClick: function()
				{
						var sender = this;
						var table_ext = this.dom.table;

						return function(e)
						{
							sender.dom.readyToHide = false;

							var pos = dom.getMousePosition(e);
							if (pos.x < table_ext.offsetLeft ||
								pos.x > table_ext.offsetLeft + table_ext.clientWidth ||
								pos.y < table_ext.offsetTop - 18 ||
								pos.y > (table_ext.offsetTop + table_ext.clientHeight)
							)
							{
								sender.dom.readyToHide = true;
								setTimeout(sender.tryHide.bind(sender), 50);
							}

							return false;
						};
				},
				handler_onclick: function(rownum)
				{
						this.dom.readyToHide = false;
				},
				handler_onblur: function()
				{
						setTimeout(this.tryHide.bind(this), 50);
						//this.docEvent = document.onclick;
						document.onclick = this.ctxClick();
						this.onEdit = false;
				},
				focusControl: function()
				{
						this.editCombobox = true;
						this.dom.readyToHide = false;
				},
				blurControl: function()
				{
						this.dom.readyToHide = true;
						this.editCombobox = false;
						setTimeout(this.tryHide.bind(this), 150);
				},
				tryHide: function()
				{
						if(this.dom.readyToHide && !this.editCombobox)
						{
							this.hide();
						}
				},
				setPosition: function(x, y)
				{
						var table_ext = this.dom.table;
						table_ext.style.left = x + "px";
						table_ext.style.top = y + "px";

						var cover = this.dom.cover;
						cover.style.left = x + "px";
						cover.style.top = y + "px";
				},
				show: function(rownum)
				{
						var sender = this;

						return function(e)
						{
							if(sender.onEdit)
							{
								return;
							}

							sender.onEdit = true;
							sender.dom.isShow = false;

							var table_ext = sender.dom.table;
							var cover = sender.dom.cover;
							sender.dom.readyToHide = true;
							table_ext.rownum = rownum;

							var pos = dom.getMousePosition(e);
							sender.setPosition(pos.x, pos.y);

							if(!IS_OPERA && IS_MSIE)
							{
								table_ext.style.display = "";
								cover.height = table_ext.clientHeight+2;
								cover.width = table_ext.clientWidth+2;
								cover.style.display = "";
							}
							table_ext.style.display = "";

							if(IS_OPERA)
							{
								var iframe_height = (table_ext.clientHeight + table_ext.offsetTop) - document.body.offsetHeight;
								if(iframe_height)
								{
									var table = document.createElement("table");
									table.width = "100%";
									var tr = table.insertRow(0);
									tr.height = iframe_height;
									var td = tr.insertCell(0);
									td.appendChild(document.createTextNode(" "));
									document.body.appendChild(table);
								}
							}

							if (rownum || rownum==0) //for list edit
							{
								sender.getRowValue(rownum);
							}
							else
							{
								sender.getValue();
							}

							sender.dom.isShow = true;
							sender.ok();
					}
				},
				hide: function()
				{
						this.dom.isShow = false;
						this.dom.table.style.display = "none";
						this.dom.cover.style.display = "none";
						document.onclick = "";
				},
				ok: function()
				{
						var date = {};
						if(this.dom.isShow)
						{
							for (var c in this.dom.date)
							{
									this.dom.date[c].getValue();
									date[c] = this.dom.date[c].value;
							}

							var rownum = this.dom.table.rownum;

							if ( rownum || rownum==0 ) //for list edit
							{
								this.setRowValue(this.formatDate(date, this.valueFormat, false), rownum);
							}
							else
							{
								this.setValue(this.formatDate(date, this.valueFormat, false));
							}
						}
				},
				getValue: function()
				{
						//alert("get "+this.value);
						if(this.value)
						{
							var date = this.parseDate(this.value, this.valueFormat);
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
							this.value = this.formatDate(date, this.valueFormat, false);
							this.getValue();
							this.value = "";
						}
				},
				setValue: function(v)
				{
						//alert("set "+v);
						this.value = v;

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
								this.dom.warning.style.display = "none";
							}
						}
						else
						{
							this.dom.input.value = '';
						}
				},
				getRowValue: function(rownum)
				{
						//alert("getRow-"+rownum+" "+this.dom.rowset[rownum].value);
						if(this.dom.rowset[rownum].value)
						{
							var date = this.parseDate(this.dom.rowset[rownum].value, this.valueFormat);
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
							this.dom.rowset[rownum].value = this.formatDate(date, this.valueFormat, false);
							this.getRowValue(rownum);
							this.dom.rowset[rownum].value = "";
						}
				},
				setRowValue: function(v, rownum)
				{
						//alert("setRow"+rownum+" "+v);
						this.dom.rowset[rownum].value = v;
						if(v)
						{
							var date = this.parseDate(v, this.valueFormat);
							if(date == null)
							{
								this.dom.rowset[rownum].input.value = v;
							}
							else
							{
								this.dom.rowset[rownum].input.value = this.formatDate(date, this.displayFormat, this.useLookup);
								this.dom.rowset[rownum].warning.style.display = "none";
							}
						}
						else
							this.dom.rowset[rownum].input.value = "";
						//this.dom.rowset[rownum].warning.style.display = "none";

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
				verifyValue: function(rownum)
				{
						this.verificationPassed = true;
						this.verificationFailureReason = this.warningMessage;

						if(this.getParent() && this.getParent().markControls)
						{
							this.dom.markCheckboxControl.getValue();

							if (!this.dom.markCheckboxControl.value)
							{
								return;
							}
						}

						if(this.checkValid(rownum) != 0)
						{
							this.verificationPassed = false;
						}
				},
				checkValid: function(rownum)
				{
						if (rownum || rownum==0) //for list edit
						{
							var string = this.dom.rowset[rownum].input.value;
						}
						else
						{
							var string = this.dom.input.value;
						}

						var date = this.parseDate(string, this.displayFormat, true);

						if(date == null || (string.length == 0 && this.notNull))
						{
							this.displayWarning(rownum, true);
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
										this.displayWarning(rownum, true);
										return 1;
									}
								}

								var value = this.formatDate(date, this.valueFormat, false);
							}

							if (rownum || rownum==0)
							{
								this.setRowValue(value, rownum);
							}
							else
							{
								this.setValue(value);
							}

							this.displayWarning(rownum, false);
						}

						return 0;
				},
				displayWarning: function(rownum, display)
				{
						if (rownum || rownum==0)
						{
							this.dom.rowset[rownum].warning.style.display = display?"inline":"none";
						}
						else
						{
							this.dom.warning.style.display = display?"":"none";
						}
				},
				clone: function()
				{
						var clone = new rs.datebox();
						clone.valueFormat = this.valueFormat;
						clone.displayFormat = this.displayFormat;
						return clone;
				}
		}
);

//
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
		createDynamic: function(e)
		{
			var input = document.createElement("input");
			this.dom.input = input;
			input.type = "file";
			input.name = this.name;
			e.appendChild(input);
		},
		getRecordValue: function()
		{
			return this.dom.input ? this.dom.input.value : null;
		},
		getValue: function()
		{
			if(this.dom.input)
			{
				this.value = this.dom.input.value;
			}
		}
	}
);

//
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
		createDynamic: function(e, rownum)
		{
		},
		getValue: function()
		{
		},
		setValue: function()
		{
		},
		createStatic: function(e, v, val_null, a, rownum)
		{
			var input = document.createElement("input");
			input.type = "button";
			this.dom.input = input;
			input.value = (v == null) ? this.title : v;
			input.hi = this.hi;
			input.rownum = rownum;
			this.applyStyle(e, a);
			input.onclick = function(e)
			{
				if (!e)
				{
					e = window.event;
				}

				if(IS_MSIE)
				{
					e.cancelBubble = true;
				}
				else
				{
					e.stopPropagation();
				}

				if (form_is_sent)
				{
					return;
				}

				Aux.Form__Submit("ColumnProcedure:Call", this.hi, t.rowset[this.rownum]);

				form_is_sent = true;

				return false;
			};
			e.appendChild(input);
		},
		clone: function()
		{
			return new rs.button();
		}
	}
);

//
// rs.hyperlink
//

rs.hyperlink = newClass
(
	rs.control,
	{
		constructor: function()
		{
			rs.control.call(this);
		},
		toString: function()
		{
			return "rs.hyperlink";
		},
		setLookup: function(lookup)
		{
			//this.plookup = plookup;
		},
		setLookupStyles: function(lookup)
		{
			//this.plookup = plookup;
		},
		setPLookup: function(plookup)
		{
			this.plookup = plookup;
		},
		setParameter: function(p, rownum)
		{
			//var obj = p;
			if (p instanceof rs.control)
			{
				p = p.value;
			}
			//alert((this.plookup[p] == null)? null:this.plookup[p][0]);
			this.setValue((this.plookup[p] == null)? null:this.plookup[p][0]);
		},
		createStatic: function(e, v)
		{
			var a = document.createElement("a");
			a.onclick = function()
			{
				window.open(a.href);
				return false;
			};
			this.dom.a = a;
			a.href = v;
			a.appendChild(document.createTextNode(v || ""));
			e.appendChild(a);
		},
		createDynamic: function(e)
		{
			var a = document.createElement("a");
			a.onclick = function()
			{
				window.open(a.href);
				return false;
			};
			this.dom.a = a;
			if(this.plookup)
			{
				a.href = this.value;
				a.appendChild(document.createTextNode(this.value || ""));
			}
			e.appendChild(a);
		},
		getValue: function()
		{
			this.value = this.dom.a.href;
		},
		setValue: function(v)
		{
			if(this.plookup)
			{
				for(var c in this.plookup)
				{
					if(this.plookup[c][0] == v)
					{
						this.value = v || "";
						if(this.dom.a)
						{
							this.dom.a.href = v || "";
							if(this.dom.a.firstChild)
								this.dom.a.removeChild(this.dom.a.firstChild);
							this.dom.a.appendChild(document.createTextNode(v || ""));
							this.refresh();
						}
						return;
					}
				}
			}
			else
			{
				this.value = v || "";
				this.dom.a.href = v || "";
				if(this.dom.a.firstChild)
					this.dom.a.removeChild(this.dom.a.firstChild);
				this.dom.a.appendChild(document.createTextNode(v || ""));
				this.refresh();
			}
		},
		clone: function()
		{
			return new rs.hyperlink();
		}
	}
);

//
// Containers
//

function getTopContainer()
{
	return document.forms[0] || document.body;
}

//
// rs.container
//

rs.container = newClass
(
	null,
	{
		constructor: function()
		{
			this.options = {};
			this.controls = {};
			this.dom = {};
			this.control_counter = 0;
			this.customOptions = {};
			this.verificationPassed = true;
			this.finalized = false;
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
		controlPosition: function(name)
		{
			var counter = 0;
			for(var i in this.controls)
			{
				if(i == name)
				{
					return counter;
				}
				counter++;
			}
			return -1;
		},
		finalizeControls: function(record)
		{
			if(!this.finalized)
			{
				for(var i in this.controls)
				{
					if(this.controls[i].watchForName)
					{
						var watch_for = this.getParent().getOffspringControlByName(this.controls[i].watchForName);
						this.controls[i].watchFor = watch_for;
						this.controls[i].watchParameter(watch_for);
						if(record)
						{
							watch_for.refresh();
						}
					}
				}
				this.finalized = true;
			}
		},
		getOffspringControlByName: function(name)
		{
			var result = null;
			for (var cName in this.controls)
			{
				if (this.controls[cName] instanceof rs.container)
				{
					var result = this.controls[cName].getOffspringControlByName(name);

					if (result != null)
					{
						return result;
					}
				}
				else if (cName == name)
				{
					return this.controls[cName]
				}
			}

			return null;
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
				document.title = this.title;
				top.document.title = this.title;
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
		},
		hideMenu: function()
		{
			if (this.menu && this.menu instanceof rs.menu)
			{
				this.menu.hide();
			}
		},
		hideAllMenu: function()
		{
			for (var c in this.controls)
			{
				if(this.controls[c].menu)
				{
					this.controls[c].menu.hide();
				}
			}
		},
		setCustomOption: function(k, v)
		{
			this.customOptions[k] = v;
		},
		getCustomOption: function(k)
		{
			return this.customOptions[k];
		},
		getCustomOptionsRecord: function()
		{
			var record = {}

			for (var k in this.customOptions)
			{
				record[k] = this.customOptions[k];
			}

			return record;
		},
		getCustomOptionsRecordStruct: function()
		{
			var struct = {}

			if (this.hi)
			{
				var record = this.getCustomOptionsRecord();
				if (!object_isEmpty(record))
				{
					struct[this.hi] =  record;
				}
			}

			for (var cName in this.controls)
			{
				if (this.controls[cName].getCustomOptionsRecordStruct)
				{
					var record = this.controls[cName].getCustomOptionsRecordStruct();
					if (!object_isEmpty(record))
					{
						object_extend(struct, record);
					}
				}
			}

			return struct;
		},
		addException: function(string)
		{
			var exception = document.createElement("div");
			exception.className = "error-box";
			exception.appendChild(document.createTextNode(string));
			this.exceptionSpan.appendChild(exception);
		},
		addExceptionExt: function(title, struct)
		{
			var exception = document.createElement("div");
			exception.className = "error-box";
			exception.appendChild(document.createTextNode(title));

			var all_msgs=[];

			for (var i in struct)
			{
				var line = document.createElement("li");
				line.appendChild(document.createTextNode(struct[i].line));
				if (struct[i].control && (struct[i].control instanceof rs.control))
				{
					if (struct[i].control.focus)
					{
						dom.setClassOnMouseEvents(line, "link_hover", "link");
						line.onclick = struct[i].control.focus.bind(struct[i].control).createCaller(struct[i].rownum);
					}
				}
				all_msgs.push(line);
			}
			if (all_msgs.length>1) var msg_list = document.createElement("ol");
			else var msg_list = document.createElement("ul");
			for (i in all_msgs)
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
		},
		showExceptions: function()
		{
			this.exceptionTable.style.display = "";
			this.exceptionSpan.style.display = "";
		},
		prepareExceptions: function(e)
		{
			//for show errors
			var exceptionTable = document.createElement("table");
			exceptionTable.className = "ctl-container-caption";
			exceptionTable.style.display = "none";
			var tr = exceptionTable.insertRow(0);
				//icon
			var td = tr.insertCell(tr.cells.length);
			td.className = "icon";
			var div = document.createElement("div");
			div.className = this.errorIcon;
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
		changeHidden: function()
		{
			this.hidden = !this.hidden;
			var table = dom.first(this.dom.place_span);
			var td_icon = dom.first(table);
			while(td_icon && td_icon.nodeName != "TD")
			{
				td_icon = dom.first(td_icon);
			}
			var td_caption = dom.next(td_icon);
			td_caption.className = this.hidden ? dom.addClass(td_caption.className, "gray") : dom.deleteClass(td_caption.className, 'gray');
			var td = td_caption;
			while(td = dom.next(td))
			{
				td.className = this.hidden ? dom.addClass(td.className, "hidden") : dom.deleteClass(td.className, 'hidden');
			}
			while(table = dom.next(table))
			{
				table.className = this.hidden ? dom.addClass(table.className, "hidden") : dom.deleteClass(table.className, 'hidden');
			}
			var options_http = {
					'parent_object'	: this.menu_id,
					'object'		: this.hi,
					'hidden'		: this.hidden ? 1 : 0
			};

			JsHttpRequest.query(
				'set_hidden_object.php', 
				options_http,
				null,
				true  // do not disable caching
			);
		}
	}
);

//
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
		toString: function()
		{
			return "rs.form";
		},
		disableAllTableEdit: function(exclude_table)
		{
			for (var c in this.controls)
			{
				if ((this.controls[c] != exclude_table) && this.controls[c].disableTableEdit)
				{
					this.controls[c].disableTableEdit();
				}
			}
		},
		enableAllTableEdit: function(exclude_table)
		{
			for (var c in this.controls)
			{
				if ((this.controls[c] != exclude_table) && this.controls[c].enableTableEdit)
				{
					this.controls[c].enableTableEdit();
				}
			}
		}
	}
);

//
// rs.table
//

rs.table = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);

			this.sort = {};
			this.rowset = [];
			this.pk = ["SYS_ROWID"];

			// DOM objects
			this.dom.checkbox_markAll = null;
			this.dom.checkbox_mark = [];
			this.dom.columnHeaders = [];

			this.selectedRow = null;
			this.illuminateRows = [];

			// Handlers
			this.onSort = null;
			this.onSetPage = null;

			// Options
			this.options.caption = true;
			this.options.header = true;
			this.options.mark = false;
			this.options.sort = false;
			this.options.paging = false;
			this.options.toolbox = true; //for list edit
			this.options.edit_mode = false; //for list edit
			this.options.editable = false; //for list edit
			this.options.numberOfControlsToShowToolboxOnTop = 10;
			this.options.columnSequence = false;

			// Size and page
			this.size = 0;
			this.page = 0;
			this.pageSize = 10;
			this.quickScanPages = 10;
			this.selectPageSize = [10, 25, 50, 100];

			this.hidden = false;

			// Toolbox (in caption)
			this.buttons = [];

			// Buttons
			this.real_buttons = [];

			// Filter args
			this.filter_args = {};
		},
		getParent: function()
		{
			return this;
		},
		toString: function()
		{
			return "rs.table";
		},
		maxSizeExceeded: function()
		{
			return (this.maxSize > 0) && (this.size > this.maxSize);
		},
		setMenu: function(menu)
		{
			this.menu = menu;
			this.menu.parent = this;
		},
		setFilterView: function(filterview)
		{
			this.filterview = filterview;
			this.filterview.parent = this;
			this.filterview.controls = this.controls;
		},
		initMenu: function(e)
		{
			var section_add = false;
			for (var cName in this.controls)
			{
				var control = this.controls[cName];
				if (control == "rs.dbpreference")
				{
					if (!section_add)
					{
						this.menu.addSection(60, rs.s('menu.special_function', 'Special function')+':', null, "sprite_gear_smallIcon");
						section_add = true;
					}
					control.create(e);
//					this.menu.addItem(60, (control.title || control.name)+' for selected', control.hint, null, Aux.Table__CtxMenu__CallProcedure(control));
//					this.menu.addItem(60, (control.title || control.name)+' for all', control.hint, null, Aux.Table__CtxMenu__CallProcedure(control,1));
					this.menu.addItem(60, (control.title || control.name) + ' (' + rs.s('uipr.marked_or_selected', 'marked or selected') + ')', control.hint, null, control.ctxClick());
					this.menu.addItem(60, (control.title || control.name) + ' (' + rs.s('uipr.filtered', 'all filtered') + ')', control.hint, null, control.ctxClick(1));
				}
			}
		},
		addButton: function(title, hint, img, handler, over_handler, out_handler, move_handler)
		{
			this.buttons.push({title:title, hint:hint, img:img, handler:handler, over_handler:over_handler, out_handler:out_handler, move_handler:move_handler});
		},
		addRealButton: function(title, hint, handler, id)
		{
			this.real_buttons.push({title:title, hint:hint, handler:handler, id:id});
		},
		changeRealButton: function(title, hint, handler, id)
		{
			for (var i=0; i<this.real_buttons.length; i++)
			{
				if (this.real_buttons[i].id == id)
				{
					this.real_buttons[i].title = title;
					this.real_buttons[i].hint = hint;
					this.real_buttons[i].handler = handler;

					return;
				}
			}

			this.real_buttons.push({title:title, hint:hint, handler:handler, id:id});
		},
		dropRealButton: function(id)
		{
			for (var i=0; i<this.real_buttons.length; i++)
			{
				if (this.real_buttons[i].id == id)
				{
					this.real_buttons = this.real_buttons.slice(0,i).concat(this.real_buttons.slice(i+1));

					return;
				}
			}
		},
		disableTableEdit: function()
		{
			if (this.options.toolbox)
			{
				for (var i=0; i<this.real_buttons.length; i++)
				{
					if (this.real_buttons[i].input_handler_top)
					{
						this.real_buttons[i].input_handler_top.disabled = true;
					}
					if (this.real_buttons[i].input_handler_bottom)
					{
						this.real_buttons[i].input_handler_bottom.disabled = true;
					}
				}
			}
		},
		enableTableEdit: function()
		{
			if (this.options.toolbox)
			{
				for (var i=0; i<this.real_buttons.length; i++)
				{
					if (this.real_buttons[i].input_handler_top)
					{
						this.real_buttons[i].input_handler_top.disabled = false;
					}
					if (this.real_buttons[i].input_handler_bottom)
					{
						this.real_buttons[i].input_handler_bottom.disabled = false;
					}
				}
			}
		},
		changeEditMode: function(t)
		{
			if (t != 'rs.table') return;

			t.options.edit_mode = !t.options.edit_mode;

			if (t.parent && t.parent == 'rs.form')
			{
				if (t.options.edit_mode)
				{
					t.parent.disableAllTableEdit(t);
				}
				else
				{
					t.parent.enableAllTableEdit(t);
				}
			}

			if (t.menu)
			{
				t.menu.hide();
			}
			t.clearExceptions();
			t.selectedRow = null;
/*
			if (t.table_capture) getTopContainer().removeChild(t.table_capture);
			if (t.table_options) getTopContainer().removeChild(t.table_options);
			if (t.table_options_bottom) getTopContainer().removeChild(t.table_options_bottom);
			if (t.table_rowset) getTopContainer().removeChild(t.table_rowset);
			if (t.table_paging) getTopContainer().removeChild(t.table_paging);
//*/
			var table_container = t.dom.place_span ? t.dom.place_span : getTopContainer();

			if (t.table_capture) 		table_container.removeChild(t.table_capture);
			if (t.table_rowset) 		table_container.removeChild(t.table_rowset);
			if (t.table_toolbox_padding) table_container.removeChild(t.table_toolbox_padding);
			if (t.table_toolbox_padding_top) table_container.removeChild(t.table_toolbox_padding_top);

			t.create(getTopContainer());
		},
		createPageControl: function(e)
		{
			var table = document.createElement("table");
			table.className = "ctl-table-paging";
			var tr = table.insertRow(table.rows.length);
			var td = tr.insertCell(tr.cells.length);
			if (this.options.toolbox && this.real_buttons.length)
			{
				td.className = "padding-left";
			}

			var text = document.createTextNode(rs.s('table.page.rows', 'Rows')+':');
			td.appendChild(text);

			//image buttons for left
			var td = tr.insertCell(tr.cells.length);
			var div = document.createElement("div");
			div.className = this.page ? "pagingIcon sprite_pageFirst" : "pagingIcon sprite_pageFirstGray";
			div.title = rs.s('table.page.go_first_page', 'Go to first page');
			var rs_table = this;
			if(this.page)
			{
				div.className += " pointer";
				div.onclick = function()
				{
					rs_table.onSetPage(rs_table, 0);
				};
			}
			td.appendChild(div);

			var td = tr.insertCell(tr.cells.length);
			var div = document.createElement("div");
			div.className = this.page ? "pagingIcon sprite_pagePrev" : "pagingIcon sprite_pagePrevGray";
			div.title = rs.s('table.page.go_prev_page','Go to previous page');
			var rs_table = this;
			if(this.page)
			{
				div.className += " pointer";
				div.onclick = function()
				{
					rs_table.onSetPage(rs_table, (rs_table.page - 1)<0?0:rs_table.page - 1);
				};
			}
			td.appendChild(div);

			//combobox for select rows
			var td = tr.insertCell(tr.cells.length);
			td.className = "left";
			var select_top = document.createElement("select");
			td.appendChild(select_top);

			var pgSize = this.pageSize;
			var linksLinage = 10;
			var pgLast = Math.ceil(this.size/pgSize) - 1;
			var pgMin = Math.max(0, this.page - linksLinage/2);
			var pgMax = Math.min(pgLast, pgMin + linksLinage);
			var pgMin = Math.max(0, pgMax - linksLinage);
			var selectedIndex = this.page - pgMin;
			if (pgMin > 0)
			{
				var txt = 1 + "-" + pgSize;
				addOption(select_top, txt, 0, false)
				addOption(select_top, "...", pgMin, false);
				selectedIndex+=2;
			}
			for (var i=pgMin; i<=pgMax; i++)
			{
				var txt = (i*pgSize+1) + "-" + Math.min((i+1)*pgSize, this.size);
				addOption(select_top, txt, i, false);
			}
			if (pgMax < pgLast)
			{
				addOption(select_top, "...", pgMax, false);
				var txt = (pgLast*pgSize+1) + "-" + this.size;
				addOption(select_top, txt, pgLast, false);
			}
			select_top.selectedIndex = selectedIndex;

			if (this.onSetPage)
			{
				var rs_table = this;
				select_top.onchange = function()
				{
					rs_table.onSetPage(rs_table, select_top.options[select_top.selectedIndex].value);
				};
			}

			//image buttons for right
			var td = tr.insertCell(tr.cells.length);
			var div = document.createElement("div");
			div.className = this.page != pgMax ? "pagingIcon sprite_pageNext" : "pagingIcon sprite_pageNextGray";
			div.title = rs.s('table.page.go_next_page','Go to next page');
			var rs_table = this;
			if(this.page != pgMax)
			{
				div.className += " pointer";
				div.onclick = function()
				{
					rs_table.onSetPage(rs_table, (rs_table.page + 1)>pgLast?pgLast:(rs_table.page + 1));
				};
			}
			td.appendChild(div);

			var td = tr.insertCell(tr.cells.length);
			var div = document.createElement("div");
			div.className = this.page != pgMax ? "pagingIcon sprite_pageLast" : "pagingIcon sprite_pageLastGray";
			div.title = rs.s('table.page.go_last_page', 'Go to last page');
			var rs_table = this;
			if(this.page != pgMax)
			{
				div.className += " pointer";
				div.onclick = function()
				{
					rs_table.onSetPage(rs_table, pgLast);
				};
			}
			td.appendChild(div);

			//combobox for select rows on page
			//var tr = table.insertRow(1);
			var td = tr.insertCell(tr.cells.length);
			var td = tr.insertCell(tr.cells.length);
			td.className = "padding-left";
			var text = document.createTextNode(rs.s('table.page.rows_on_page', 'Rows on page')+':');
			td.appendChild(text);
			var td = tr.insertCell(tr.cells.length);
			td.className = "left";
			var select_row_on_page_top = document.createElement("select");
			td.appendChild(select_row_on_page_top);

			var i = 0;
			for (var ps in this.selectPageSize)
			{
				addOption(select_row_on_page_top, this.selectPageSize[ps], this.selectPageSize[ps], false);
				if(this.selectPageSize[ps] == this.pageSize)
				{
					select_row_on_page_top.selectedIndex = i;
				}
				i++;
			}
			if (this.onSetPageSize)
			{
				var rs_table = this;
				select_row_on_page_top.onchange = function()
				{
					rs_table.onSetPageSize(rs_table, select_row_on_page_top.options[select_row_on_page_top.selectedIndex].value);
				};
			}

			e.appendChild(table);
		},
		create: function(e)
		{
			this.dom.checkbox_mark.length = 0;

			if (!this.dom.place_span)
			{
				this.prepareExceptions(e);
				var place_span = document.createElement("span");
				this.dom.place_span = place_span;
				e.appendChild(place_span);
			}

			this.finalizeControls();
			
			// Changing buttons
			if (this.options.editable && this.rowset.length != 0) //for list edit
			{
				if (!this.options.edit_mode)
				{
					this.changeRealButton(rs.s('table.page.switch_edit', 'Switch to edit mode'), null, this.changeEditMode, 'EDIT_MODE');
					this.dropRealButton('SUBMIT');
				}
				else
				{
					this.changeRealButton(rs.s('common.cancel', 'Cancel'), null, this.changeEditMode, 'EDIT_MODE');
					this.addRealButton(rs.s('common.ok', 'OK'), null, Aux.Table__UpdateRows, 'SUBMIT');
				}
			}

			// Caption
			if (this.options.caption)
			{
				var table = document.createElement("table");
				table.className = "ctl-container-caption";
				table.border = 0;
				var tr = table.insertRow(0);
				if (this.icon)
				{
					var td = tr.insertCell(tr.cells.length);
					td.className = "icon";
					td.onclick = function()
					{
						var self = this;
						return function()
						{
							self.changeHidden();
						}
					}.call(this);
					var div = document.createElement("div");
					div.className = dom.addClass(this.icon, "pointer");
					td.appendChild(div);
				}
				var td = tr.insertCell(tr.cells.length);
				td.className = "caption pointer";
				td.onclick = function()
				{
					var self = this;
					return function()
					{
						self.changeHidden();
					}
				}.call(this);
				var text = document.createTextNode(this.title || this.name || "");
				td.appendChild(text);
				td.title = this.hint || "";

				/*var td = tr.insertCell(tr.cells.length);
				td.width = "10";
				td.appendChild(document.createTextNode(""));
				*/
				for (var i=0; i<this.buttons.length; i++)
				{
					var button = this.buttons[i];
					if (!button.img)
					{
						continue;
					}
					var td = tr.insertCell(tr.cells.length);
					td.className = "button";
					var div = document.createElement("div");
					div.title = button.hint || (button.title || "");
					div.className = button.img + " pointer";
					div.onclick = button.handler.createCaller(this);

					if (button.over_handler)
					{
						div.onmouseover = button.over_handler.bind();
					}
					if (button.out_handler)
					{
						div.onmouseout = button.out_handler.bind();
					}
					if (button.move_handler)
					{
						div.onmousemove = button.move_handler.bind();
					}
					td.appendChild(div);
				}
				this.table_capture = table;

//				e.appendChild(table);
				this.dom.place_span.appendChild(table);
			}
/*
			// Description
			if (this.description)
			{
				var p = document.createElement('p');
				p.className = 'ctl-container-description';
				p.appendChild(document.createTextNode(this.description));
				this.dom.place_span.appendChild(p);
			}
*/
			//padding buttons
			if(this.rowset.length >= this.options.numberOfControlsToShowToolboxOnTop)
			{
				//toolbox and pagging
				var table_toolbox_padding_top = document.createElement("table");
				table_toolbox_padding_top.className = "ctl-table-paging";
				var tr_toolbox_padding = table_toolbox_padding_top.insertRow(table_toolbox_padding_top.rows.length);
				this.dom.place_span.appendChild(table_toolbox_padding_top);
				this.table_toolbox_padding_top = table_toolbox_padding_top;

				// Buttons
				if (this.options.toolbox)
				{
					var table = document.createElement("table");
					table.className = "ctl-record-toolbox";
					var tr = table.insertRow(table.rows.length);
					var td = tr.insertCell(tr.cells.length);
	//				td.style.width = "100%";
					for (var i=0; i<this.real_buttons.length; i++)
					{
						var button = this.real_buttons[i];
						var input = document.createElement("input");
						button.input_handler_top = input;
						input.type = "button";
						input.value = button.title;
						if (button.hint)
						{
							input.title = button.hint;
						}
						if (button.handler)
						{
							input.onclick = button.handler.createCaller(this);
						}
						if (button.title=="OK" || button.id=="OK" || button.id=="SUBMIT")
						{
							input.className="submitButton";
						}
						var td = tr.insertCell(tr.cells.length);
						td.appendChild(input);
					}
					//this.table_options_bottom = table;

	//				e.appendChild(table);

					var td = tr_toolbox_padding.insertCell(tr_toolbox_padding.cells.length);
					td.appendChild(table);
					//this.dom.place_span.appendChild(table);
				}

				// Paging
				if (this.options.paging && (this.size > 0) && !this.maxSizeExceeded() && !this.options.edit_mode)
	//				&& (!this.options.edit_mode || !this.options.editable))
				{
					var td = tr_toolbox_padding.insertCell(tr_toolbox_padding.cells.length);
					this.createPageControl(td);
				}
			}

			// Main table
			var table = document.createElement("table");
			table.cellPadding = 0;
			table.cellSpacing = 0;
			table.className = "ctl-table";
			var tableColSpan = 0;

			// Header
			if(this.options.header && this.options.columnSequence)
			{
				var tr = table.insertRow(table.rows.length);
				tr.className = "header";

				// Mark all checkbox
				if (this.options.mark && (!this.options.editable || !this.options.edit_mode))
				{
					tableColSpan++;
					var th = document.createElement("th");
					th.className = "mark-all no-print";
					var checkbox = document.createElement("input");
					checkbox.type = "checkbox";
					checkbox.className = "mark";
					checkbox.title = rs.s('table.page.mark', 'Mark/Unmark all visible');
					checkbox.onclick = this.handler_markAll.bind(this);
					this.dom.checkbox_markAll = checkbox;
					th.appendChild(checkbox);
					tr.appendChild(th);
				}

				this.dom.div_heads = {};
				// Column headers
				var i = 0;
				for (var cName in this.controls)
				{
					var control = this.controls[cName];

					if (control == 'rs.dbpreference') continue;

					var th = document.createElement("th");
					th.className = "title";
					tr.appendChild(th);
					if(i!=0)
					{
						th.className += " pointer";
						th.onclick = this.toLeftCol.bind(this).createCaller(i);
						var div = document.createElement("div");
						div.className = "sprite_dleftIcon";
						th.onmouseover = replaceClass.createCaller(div, "sprite_dleftliteIcon");
						th.onmouseout = replaceClass.createCaller(div, "sprite_dleftIcon");
						th.appendChild(div);
					}
					this.dom.columnHeaders[i] = [];
					this.dom.columnHeaders[i].name = cName;
					this.dom.columnHeaders[i].thBorder = th;

					tableColSpan += 3;
					var th = document.createElement("th");
					th.className = "pointer";
					th.onclick = this.divMouseDown(i);

					th.title = control.hint || "";
					var txt = control.title || cName || "";
					var text = document.createTextNode(txt);
					th.appendChild(text);
// 					if(control == 'rs.datebox') // Add date format
//					{
//						th.appendChild(document.createElement('br'));
//						th.appendChild(document.createTextNode('(' + control.getDisplayFormatDesc() + ')'));
//					}
					this.dom.columnHeaders[i].th = th;

					tr.appendChild(th);

					var th = document.createElement("th");
					tr.appendChild(th);
					if((i+1)<this.control_counter)
					{

						//th.className = "sort";
						th.className += " pointer";
						th.onclick = this.toRightCol.bind(this).createCaller(i);

						var div = document.createElement("div");
						div.src = ("sprite_drightIcon");
						th.onmouseover = replaceClass.createCaller(div, "sprite_drightliteIcon");
						th.onmouseout = replaceClass.createCaller(div, "sprite_drightIcon");
						//img.alt = order + "Asc.";
						th.appendChild(div);
					}

					this.mdown = null;

					var table_ext = document.createElement("table");
					table_ext.className = "ctl-table-opacity pointer";
					table_ext.style.display = "none";
					table_ext.cellSpacing = 0;
					table_ext.cellPadding = 0;
					table_ext.onclick = this.divMouseUp();//.bind(this).createCaller(i);

					var table_int = document.createElement("table");
					table_int.className = "ctl-table";
					table_int.style.width = "100%";
					table_int.style.height = "100%";
					table_int.cellSpacing = 0;
					table_int.cellPadding = 0;

					var tr_ext = table_ext.insertRow(0);
					var td = tr_ext.insertCell(0);
					td.appendChild(table_int);

					var tr_int = table_int.insertRow(table_int.rows.length);
					tr_int.className = "header";
					var th = document.createElement("th");
					th.className = "opacity";
					th.appendChild(document.createTextNode(txt));
					tr_int.appendChild(th);

					e.appendChild(table_ext);
					this.dom.div_heads[cName] = table_ext;

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

			}
			else if (this.options.header)
			{
				var tr = table.insertRow(table.rows.length);
				tr.className = "header";

				// Mark all checkbox
				if (this.options.mark && (!this.options.editable || !this.options.edit_mode))
				{
					tableColSpan++;
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
				for (var cName in this.controls)
				{
					var control = this.controls[cName];

					if (!control.shownControl) continue;
//					if (!control.isView) continue;

					tableColSpan++;
					var th = document.createElement("th");
					th.className = "title";
					th.title = control.hint || "";

// 					if(control == 'rs.datebox') /*for showing format of date*/
//					{
//						th.appendChild(document.createElement('br'));
//						th.appendChild(document.createTextNode('(' + control.getDisplayFormatDesc() + ')'));
//					}

					/*
						Bug in IE
						---------
						IE doesn't support CSS pseudoclass :hover for anything except anchor elements.
						Only possibility is to use javascript instead of CSS in this case.
					*/
					dom.makePointerNode(th);

					// Sort function
					if (this.options.sort && this.onSort && (!this.options.editable || !this.options.edit_mode))
					{
						th.className += " pointer";
						th.onclick = this.onSort.createCaller(this, cName);
					}
					else if (this.options.editable && this.options.edit_mode)
					{
						th.className += " data-editable";
					}

					if (tr.childNodes.length==0)
					{
						th.className += " first_col";
					}
					tr.appendChild(th);
					// Sort arrow
					if (this.options.sort && this.sort[cName] && (!this.options.editable || !this.options.edit_mode))
					{
						var div = document.createElement("div");
						div.className = "sort";
						div.className += " pointer";
						div.onclick = this.onSort.createCaller(this, cName);
						th.appendChild(div);

						var order = this.sort[cName][0];
						var dir = this.sort[cName][1];
						switch (dir)
						{
							case 0: // Ascending
							{
								div.className += (order == 1 ? " sortFirstAsc" : " sortSecondAsc");
								div.title = order + " Asc.";
								break;
							}
							case 1: // Descending
							{
								div.className += (order == 1 ? " sortFirstDesc" : " sortSecondDesc");
								div.title = order + " Desc.";
								break;
							}
						}
						var span = document.createElement("span");
						span.className = "upper-index";
						span.appendChild(document.createTextNode(order));
						div.appendChild(span);
					}

					var txt = control.title || cName || "";
					var text = document.createTextNode(txt);
					th.appendChild(text);
				}
			}

			// Rowset
			for (var i=0; i<this.rowset.length; i++)
			{
				var tr = table.insertRow(table.rows.length);
				tr.className = i%2? "even":"odd";
				this.illuminateRows[i] = false;

				// Mark checkbox
				if (this.options.mark && (!this.options.editable || !this.options.edit_mode))
				{
					var td = tr.insertCell(tr.cells.length);
					td.className = "center no-print first_col";
					var checkbox = document.createElement("input");
					checkbox.type = "checkbox";
					checkbox.className = "mark";
					checkbox.onclick = this.handler_mark.bind(this);
					this.dom.checkbox_mark.push(checkbox);
					td.appendChild(checkbox);
				}
				var ctxClickHandler = this.ctxClick(i);

				// Row cells
				for (var cName in this.controls)
				{
					var control = this.controls[cName];

					if (!control.shownControl)
					{
						if(this.rowset[i][control.name])
						{
							control.dom.rowset[i] = {};
							control.dom.rowset[i].value = this.rowset[i][control.name];
							control.refreshRow(i);
						}
						continue;
					}

					var td = tr.insertCell(tr.cells.length);
					td.className = "data";
					if (tr.cells.length==1)
					{
						td.className += " first_col";
					}

					if (this.options.editable && this.options.edit_mode)
					{
						td.className = 'data-editable'
					}

					//td.colSpan = this.options.columnSequence?3:2;
					if (this.options.columnSequence) td.colSpan=3;

					//control.DisplayLines = 3;
//					control.create(td, this.rowset[i][cName]);

					if (this.options.edit_mode && this.options.editable)
					{
						td.style.width = '100px';
						
						if(control.watchFor && control.watchFor.shownControl && (this.controlPosition(control.name) < this.controlPosition(control.watchFor.name)))
						{
							var _this = this;
							var _i = i;
							var _td = td;
							var _control = control;
							var _cName = cName;
							
							var func = function()
							{
								_control.create(_td, _this.rowset[_i][_cName], _i);
							}
							control.watchFor.addPostCreateAction(func);
						}
						else
						{
							control.create(td, this.rowset[i][cName], i);
							control.executePostCreateActions();
						}
					}
					else
					{
						if (this.options.columnSequence)
						{
							td.appendChild(document.createTextNode(this.rowset[i][cName] || ''));
						}
						else
						{
							if(control.watchFor && control.watchFor.shownControl && (this.controlPosition(control.name) < this.controlPosition(control.watchFor.name)))
							{
								var _this = this;
								var _i = i;
								var _td = td;
								var _control = control;
								var _cName = cName;
									
								var func = function()
								{
									_control.createStatic(_td, _this.rowset[_i][_cName], null, _this.rowset[_i]["style_"+_cName], _i);
								}
								control.watchFor.addPostCreateAction(func);
							}
							else
							{
								control.createStatic(td, this.rowset[i][cName], null, this.rowset[i]["style_"+cName], i);
								control.executePostCreateActions();
							}
						}
					}

					if (!this.options.edit_mode || !this.options.editable) //for list edit
					{
						if (context_menu_click_type == 0)
						{
							td.onclick = ctxClickHandler;
						}
						else
						{
							td.oncontextmenu = ctxClickHandler;
						}
					}

/*					if (IS_OPERA != true)
					{
						td.onclick = this.illuminateSelectedRow.bind(this).createCaller(i);
						document.onclick = this.clearIlluminate();
					}*/
				}
			}

			// Rowset is empty
			if (this.rowset.length == 0)
			{
				var tr = table.insertRow(table.rows.length);
				tr.className = "odd";
				var td = tr.insertCell(0);
				td.colSpan = tableColSpan;
				table.rows[0].cells.length;
//				td.className = "clear-info italic";
				td.className = "italic";

/*
				if (this.maxSizeExceeded())
				{
					var text = document.createTextNode(
						rs.s('table.page.many_result', 'Too many results found (>{0}),\n'
							+ 'please narrow down your search by adding search criteria1').replace('{0}', this.maxSize)
					);
					td.appendChild(text);
				}
				else
				{
					var text = document.createTextNode("No data");
					td.appendChild(text);
				}
*/

				var info_table = document.createElement("table");
				info_table.style.width = '100%';
				var info_tr = info_table.insertRow(info_table.rows.length);

				for (var i = 0; i < tableColSpan/30; i++)
				{
					var info_td = info_tr.insertCell(info_tr.cells.length);

					if (this.maxSizeExceeded())
					{
						var text = document.createTextNode(
							rs.s('table.page.many_result', 'Too many results found (>{0}),\n'
                            + 'please narrow down your search by adding search criteria', [this.maxSize])
						);
					}
					else
					{
						var text = document.createTextNode(rs.s('table.page.no_data','No data'));
					}

					info_td.appendChild(text);
					info_td.className = "center";
				}

				td.appendChild(info_table);

				if (context_menu_click_type == 0)
				{
					td.onclick = this.ctxClick(null);
				}
				else
				{
					td.oncontextmenu = this.ctxClick(null);
				}
			}
			this.table_rowset = table;

//			e.appendChild(table);
			this.dom.place_span.appendChild(table);

			if (IS_OPERA && this.options.editable && this.options.edit_mode)
			//
			// Bug in Opera (with selectedIndex)
			{
				for (var i=0; i<this.rowset.length; i++)
				{
					for (var cName in this.controls)
					{
						var control = this.controls[cName];
						if (!control.isStatic && control == 'rs.combobox')
						{
							if (control.refreshRow)
							{
								control.refreshRow(i);
							}
							if (control.setRowValue)
							{
								control.setRowValue(this.rowset[i][cName], i);
							}
						}
					}
				}
			}

			if ((IS_MSIE || IS_OPERA || IS_KONQUEROR)/*&& !IS_OPERA*/ && this.options.editable && this.options.edit_mode)
			// BUG1860
			// Bug in IE, checkboxes values nulles when table appends to body
			{
				for (var i=0; i<this.rowset.length; i++)
				{
					for (var cName in this.controls)
					{
						var control = this.controls[cName];
						if (!control.isStatic && (control == 'rs.checkbox' || control == 'rs.set' || control == 'rs.bitmask') && control.setRowValue)
						{
							control.setRowValue(this.rowset[i][cName], i);
						}
					}
				}
			}

			//toolbox and pagging
			var table_toolbox_padding = document.createElement("table");
			table_toolbox_padding.className = "ctl-table-paging";
			var tr_toolbox_padding = table_toolbox_padding.insertRow(table_toolbox_padding.rows.length);
			this.dom.place_span.appendChild(table_toolbox_padding);
			this.table_toolbox_padding = table_toolbox_padding;

			// Buttons
			if (this.options.toolbox)
			{
				var table = document.createElement("table");
				table.className = "ctl-record-toolbox";
				var tr = table.insertRow(table.rows.length);
				var td = tr.insertCell(tr.cells.length);
//				td.style.width = "100%";
				for (var i=0; i<this.real_buttons.length; i++)
				{
					var button = this.real_buttons[i];
					var input = document.createElement("input");
					button.input_handler_bottom = input;
					input.type = "button";
					input.value = button.title;
					if (button.hint)
					{
						input.title = button.hint;
					}
					if (button.handler)
					{
						input.onclick = button.handler.createCaller(this);
					}
					if (button.title=="OK" || button.id=="OK" || button.id=="SUBMIT")
					{
						input.className="submitButton";
					}
					var td = tr.insertCell(tr.cells.length);
					td.appendChild(input);
				}
				//this.table_options_bottom = table;

//				e.appendChild(table);

				var td = tr_toolbox_padding.insertCell(tr_toolbox_padding.cells.length);
				td.appendChild(table);
				//this.dom.place_span.appendChild(table);
			}

			// Paging
			if (this.options.paging && (this.size > 0) && !this.maxSizeExceeded() && !this.options.edit_mode)
//				&& (!this.options.edit_mode || !this.options.editable))
			{
				var td = tr_toolbox_padding.insertCell(tr_toolbox_padding.cells.length);
				this.createPageControl(td);
			}

			// Context menu
//			if (this.menu && this.options.edit_mode && this.options.editable)
			if (this.menu)
			{
				this.initMenu(e);
				this.menu.create(e);
			}
			if(this.hidden)
			{
				this.hidden = false;
				this.changeHidden();
			}
		},
		handler_markAll: function()
		{
			if(this.parent)
			{
				this.parent.hideAllMenu();
			}
			var allChecked = this.dom.checkbox_markAll.checked;
			for (var i=0; i<this.dom.checkbox_mark.length; i++)
			{
				this.dom.checkbox_mark[i].checked = allChecked;

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
			if(this.parent)
			{
				this.parent.hideAllMenu();
			}
			var allChecked = true;
			for (var i=0; i<this.dom.checkbox_mark.length; i++)
			{
				if (!this.dom.checkbox_mark[i].checked)
				{
					allChecked = false;
					this.illuminateRows[i] = false;
					//break;
				}
				else
				{
					this.illuminateRows[i] = true;
					//this.illuminateRow(i, "select-marked");
				}
			}
			this.refreshIlluminate();
			this.dom.checkbox_markAll.checked = allChecked;
		},
		ctxClick: function(rownum)
		{
			var sender = this;
			if (sender.menu)
			{
				return function(e)
				{
					e = e ? e : window.event ? window.event : '';
					if (e.ctrlKey)
					{
						if (sender.options.mark)
						{
							sender.dom.checkbox_mark[rownum].checked = !sender.dom.checkbox_mark[rownum].checked;
							sender.handler_mark();
						}
						else
						{
							sender.illuminateRows[rownum] = !sender.illuminateRows[rownum];
							sender.refreshIlluminate();
						}
					}
					else
					{
						if (sender.parent == 'rs.form')
						{
							sender.parent.hideAllMenu();
						}

						if (rownum || rownum == 0)
						{
							sender.illuminateSelectedRow(rownum);
						}

						sender.menu.show(e);
					}
					return false;
				};
			}
			return null;
		},
		illuminateRow: function(rownum, style)
		{
			this.table_rowset.rows[rownum+1].className = style;
		},
		illuminateSelectedRow: function(rownum)
		{
			this.selectedRow = rownum;
			this.refreshIlluminate();
			this.illuminateRow(rownum, "select-menu");
		},
		clearIlluminate: function()
		{
			var sender = this;

			return function(e)
			{
				var table = sender.table_rowset;
				var pos = dom.getMousePosition(e);

				if(pos.x < table.offsetLeft || pos.x>table.offsetLeft+table.clientWidth || pos.y<table.offsetTop || pos.y>(table.offsetTop+table.clientHeight))
				{
					sender.selectedRow = null;
					sender.refreshIlluminate();
				}
			};
		},
		refreshIlluminate: function()
		{
			if(!this.rowset.length)
			{
				this.table_rowset.rows[1].className = "odd";
				return;
			}
			for (var i=0; i<this.rowset.length; i++)
			{
				if(i == this.selectedRow)
				{
					continue;
				}

				if(this.illuminateRows[i])
				{
					this.table_rowset.rows[i+1].className = i%2 ? "select-marked-even" : "select-marked-odd";
				}
				else
				{
					this.table_rowset.rows[i+1].className = i%2? "even":"odd";
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
						var pointer = div.dom.div_pointer;
						pointer.style.display = "";

						if(i > div.mdown)
						{
							if(i == div.dom.columnHeaders.length - 1)
							{
								pointer.style.left = div.dom.columnHeaders[i].thBorder.offsetLeft - pointer.clientWidth/2 + colHead.clientWidth + "px";
							}
							else
							{
								pointer.style.left = div.dom.columnHeaders[i+1].thBorder.offsetLeft - pointer.clientWidth/2 + "px";
							}
							pointer.style.top = div.table_rowset.offsetTop - 22 + "px";
						}
						else
						{
							pointer.style.left = div.dom.columnHeaders[i].thBorder.offsetLeft - pointer.clientWidth/2 + "px";
							pointer.style.top = div.table_rowset.offsetTop - 22 + "px";
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
					//alert("width = "+colHead.clientWidth+"   Height = "+colHead.clientHeight);
					//alert("Top = "+div.table_rowset.offsetTop+"   left = "+colHead.offsetLeft);
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
			var vstatus = true;

			this.verificationPassed = true;
			this.clearExceptions();	//clear last exceptions
			this.informationArray = [];
			this.informationArrayExt = [];

			if(this.options.columnSequence)
			{
				var colHead = this.dom.columnHeaders;
				var colHeadNames = [];
				for(var i=0; i < colHead.length; i++)
				{
					colHeadNames[i] = colHead[i].name;
				}
				return colHeadNames.join(', ');
			}

			for (var i=0; i<this.rowset.length; i++)
			{
				record[i] = {};

				this.getPKRecord(this.rowset[i], record[i]);

				for (var cName in this.controls)
				{
					var c = this.controls[cName];

					if (!c.shownControl) continue;

					if (!c.isStatic)
					{
					        if ((c.name=='vdsMobileCarrier')||(c.name=='vdsName')||(c.name=='vdsDescription')) {
						vstatus=true;
						}
						else
						{
						c.verifyValue(i);
						vstatus=c.verificationPassed;
                                                };

						if (!vstatus)
						{
							this.informationArray.push('"'+(c.title || c.name)+'": '+ c.verificationFailureReason + " on row "+(i+1));
							this.informationArrayExt.push({
								line:'"'+(c.title || c.name)+'": '+ c.verificationFailureReason + " on row "+(i+1),
								control:c,
								rownum:i
							});
							this.verificationPassed = false;
							continue;
						}

						record[i][cName] = c.getRecordValue(i);
					}
				}
			}

			if (this.verificationPassed)
			{
				for (var i=0; i<this.rowset.length; i++)
				{
					for (var cName in this.controls)
					{
						var c = this.controls[cName];
						if (c == "rs.password")
						{
							c.setRowValue("",i);
						}
					}
				}
			}

			if (!this.verificationPassed)
			{
				this.addExceptionExt(rs.s('table.errors.verification_failed', 'Verification failed q for field(s)') + ':', this.informationArrayExt);
				this.showExceptions();
				return null;
			}

			return record;
		},
		getMarkedRows: function()
		{
			var markedRows = [];
			for (var i=0; i<this.dom.checkbox_mark.length; i++)
			{
				if (this.dom.checkbox_mark[i].checked)
				{
					markedRows.push(i);
				}
			}
			return markedRows;
		}
	}
);

//
// rs.record
//

rs.record = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);

			this.record = {};
			this.pk = ["SYS_ROWID"];
			this.markNotNull = false;
			this.markControls = false;
			this.size = 1;

			// Options
			this.options.caption = true;
			this.options.header = true;
			this.options.toolbox = true;
			this.options.numberOfControlsToShowToolboxOnTop = 10;

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
		setMenu: function(menu)
		{
			this.menu = menu;
			this.menu.parent = this;
		},
		initMenu: function(e)
		{
			var section_add = false;
			for (var cName in this.controls)
			{
				var control = this.controls[cName];
				if (control == 'rs.dbpreference')
				{
					if (!section_add)
					{
						this.menu.addSection(60, "Special function:", null, "sprite_apps_smallIcon");
						section_add = true;
					}
					control.create(e);
//					this.menu.addItem(60, (control.title || control.name)+' for this', control.hint, null, Aux.Table__CtxMenu__CallProcedure(control));
					this.menu.addItem(60, (control.title || control.name), control.hint, null, control.ctxClick());
				}
			}
		},
		addButton: function(title, hint, handler, hi, question)
		{
			this.buttons.push({title:title, hint:hint, handler:handler, hi:hi, question:question});
		},
		create: function(e)
		{
			this.prepareExceptions(e);

			//Finalizing controls
			this.finalizeControls(true);

			if(!this.place_span)
			{
				var place_span = document.createElement("span");
				this.dom.place_span = place_span;
				if(this.hidden)
				{
					dom.addClass(place_span, 'hidden');
				}
				e.appendChild(place_span);
			}

			// Caption
			if (this.options.caption)
			{
				var table = document.createElement('table');
				table.className = 'ctl-container-caption';
				var tr = table.insertRow(0);
				var td = tr.insertCell(0);

				if (this.icon)
				{
					td.className = 'icon';
					td.onclick = function()
					{
						var self = this;
						return function()
						{
							self.changeHidden();
						}
					}.call(this);
						
					var div = document.createElement('div');
					div.className = dom.addClass(this.icon, "pointer");
					td.appendChild(div);
				}

				var td = tr.insertCell(1);
				td.className = 'caption pointer';
				td.onclick = function()
				{
					var self = this;
					return function()
					{
						self.changeHidden();
					}
				}.call(this);
				var text = document.createTextNode(this.title || this.name);
				td.appendChild(text);
				if (this.hint)
				{
					td.title = this.hint;
				}

				// Description
				if (this.description)
				{
					var tr = table.insertRow(1);
					var td = tr.insertCell(0);
					var td = tr.insertCell(1);
					td.className = 'description';
					td.appendChild(document.createTextNode(this.description));
				}

				place_span.appendChild(table);
			}

			// Toolbox
			if (this.options.toolbox && object_keys(this.controls).length >= this.options.numberOfControlsToShowToolboxOnTop)
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
						if (button.hi)
						{
							if (button.question)
							{
								input.onclick = button.handler.createCaller(this, button.hi).setQuestion(button.question);
							}
							else
							{
								input.onclick = button.handler.createCaller(this, button.hi);
							}
						}
						else
						{
							if (button.question)
							{
								input.onclick = button.handler.createCaller(this).setQuestion(button.question);
							}
							else
							{
								input.onclick = button.handler.createCaller(this);
							}
						}
					}
					if (button.onover)
					{
						input.onmouseover = button.onover.bind();
					}
					if (button.onout)
					{
						input.onmouseout = button.onout.bind();
					}
					if (this.defaultButtonHI && button.hi == this.defaultButtonHI)
					{
						input.className="submitButton";
					}
					if (button.title=="OK" || button.id=="OK" || button.id=="SUBMIT")
					{
						input.className="submitButton";
					}
					var td = tr.insertCell(tr.cells.length);
					td.appendChild(input);
				}
				place_span.appendChild(table);
			}

			// Main table
			if (!object_isEmpty(this.controls))
			{
				var table = document.createElement("table");
				/*
					Bug in Opera
					------------
					We have to add a select element to the document hierarhy
					before using its property selectedIndex. The next line is fix.
				*/
				place_span.appendChild(table);
				table.cellPadding = 0;
				table.cellSpacing = 0;
				table.className = "ctl-record";
				//table.style.width = "100%";//bug 1735
				// Titles and controls
				for (var cName in this.controls)
				{
					var control = this.controls[cName];

					if (!control.shownControl && control != 'rs.columnsgroup') continue;

					control.createLine(table, this.record[cName]);

				}
				/*
					Bug in Opera
					------------
					Uncomment the next line when the bug in Opera is resolved.
				*/
				//e.appendChild(table);
			}

			// Toolbox
			if (this.options.toolbox)
			{
				var table = document.createElement("table");
				table.className = "ctl-record-toolbox";
				//table.style.width = "100%";//bug 1735
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
						if(button.hi)
						{
							if (button.question)
							{
								input.onclick = button.handler.createCaller(this, button.hi).setQuestion(button.question);
							}
							else
							{
								input.onclick = button.handler.createCaller(this, button.hi);
							}
						}
						else
						{
							if (button.question)
							{
								input.onclick = button.handler.createCaller(this).setQuestion(button.question);
							}
							else
							{
								input.onclick = button.handler.createCaller(this);
							}
						}
					}
					if (this.defaultButtonHI)
					{
						if(button.hi == this.defaultButtonHI)
						{
							input.className="submitButton";
							this.defaultButton = button;
						}
					}
					else if (button.title=="OK" || button.id=="OK" || button.id=="SUBMIT")
					{
						input.className="submitButton";
						this.defaultButton = button;
					}
					var td = tr.insertCell(tr.cells.length);
					td.appendChild(input);
				}
				place_span.appendChild(table);
			}
			// Context menu
			if (this.menu)
			{
				this.initMenu(e);
				this.menu.create(e);
			}
			if(this.hidden)
			{
				this.hidden = false;
				this.changeHidden();
			}
			if(this.defaultButton)
			{
				this.setSubmitHandler();
			}
		},
		setSubmitHandler: function()
		{
			var func = null;
			func = this.defaultButton.handler.createCaller(this, this.defaultButton.hi);
			this.dom.place_span.onkeypress = function(e)
			{
				if (!e)
				{
					e = window.event;
				}
				if(e.keyCode == 13 && 
					((IS_MSIE == false && e.target.tagName != 'TEXTAREA') ||
					(IS_MSIE && e.srcElement.tagName != 'TEXTAREA'))
				)
				{
					func();
				}
			}
		},
		ctxClick: function()
		{
			var sender = this;
			if (sender.menu)
			{
				return function()
				{
					if (sender.parent)
					{
						sender.parent.hideAllMenu();
					}

					sender.menu.show.apply(sender.menu, arguments);
					return false;
				}
			}
			return null;
		},
		illuminateRow: function(rownum, style)
		{
		},
		refreshIlluminate: function(rownum)
		{
		},
		addPKRecord: function(record)
		{
			for (var i = 0; i<this.pk.length; i++)
			{
				record[this.pk[i]] = this.record[this.pk[i]];
			}

			return record;
		},
		// Get only dynamic part of the record
		getDynRecord: function(isNotDyn)
		{
			var record = {};

                        var vstatus;

                        var s,t;
                        if (vcelement !== '' ) {
			s='document.forms[0].'+vcelement;
			vcelement='';
                        t=eval(s);
                        t= String(t);
                        if (t.indexOf('HTMLInputElement') > 0 ){
			alert('Fields are going to be rebuilded - please click OK button again after');
                        //eval(s+'.focus()');
			return;
                        };
                        };


			this.verificationPassed = true;
			this.clearExceptions();	//clear last exceptions
			this.informationArray = [];
			this.informationArrayExt = [];

			for (var cName in this.controls)
			{
				var c = this.controls[cName];

				if (c == 'rs.columnsgroup')
				{
					c.getDynRecordInto(record, isNotDyn);
					continue;
				}
				if (c == 'rs.table' && c.options.columnSequence)
				{
					record[cName] = c.getDynRecord();
					continue;
				}

				if (!c.shownControl) continue;

				if (!c.isStatic || isNotDyn)
				{

					if (!isNotDyn)
					{
						c.getValue();

						if((c.name=='vdsMobileCarrier')||(c.name=='vdsName')||(c.name=='vdsDescription')) {
						vstatus=true;
						}
						else
						{
						c.verifyValue();
						vstatus=c.verificationPassed;
						};

					}

					if (!vstatus) // c.verificationPassed)
					{
						this.informationArray.push('"'+(c.title || c.name)+'"' + (c.verificationFailureReason ? ': ' + c.verificationFailureReason : ''));
						this.informationArrayExt.push({
							line:'"'+(c.title || c.name)+'"' + (c.verificationFailureReason ? ': ' + c.verificationFailureReason : ''),
							control:c
						});
						this.verificationPassed = false;
						continue;
					}

					record[cName] = c.getRecordValue();
				}
			}

			for (var cName in this.controls)
			{
				var c = this.controls[cName];
				if (c == "rs.password")
				{
					c.setValue("");
				}
			}

			if (!this.verificationPassed)
			{
				this.addExceptionExt(rs.s('table.errors.verification_failed', 'Verification failed z for field(s)') + ':', this.informationArrayExt);
				this.showExceptions();
				return null;
			}

			return record;
		},
		getSelectedControlsRecord: function()
		{
			var record = [];

			if (!this.markControls)
			{
				return record;
			}

			for (var cName in this.controls)
			{
				var c = this.controls[cName];

				if (c == 'rs.columnsgroup')
				{
					c.getSelectedControlsRecordInto(record);
					continue;
				}

				if (!c.shownControl || c.isStatic || !c.dom.markCheckboxControl) continue;

				c.dom.markCheckboxControl.getValue();
//				record[cName] = c.dom.markCheckboxControl.value;
				if (c.dom.markCheckboxControl.value)
				{
					record.push(cName);
				}
			}

			return record;
		}
	}
);

//
// rs.columnsgroup
//

rs.columnsgroup = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);

			this.record = {};

			// Options
//			this.options.opened = true;
			this.dom.bottomLine = null;
			this.setCustomOption('opened', 0);
		},
		toString: function()
		{
			return "rs.columnsgroup";
		},
		getParent: function()
		{
			if (this.parent instanceof rs.columnsgroup)
			{
				return this.parent.getParent();
			}

			return this.parent;
		},
		getLevel: function()
		{
			if (this.parent instanceof rs.columnsgroup)
			{
				return 1+this.parent.getLevel();
			}

			return 1;
		},
		setMenu: function(menu)
		{
			this.menu = menu;
			this.menu.parent = this;
		},
		createLine: function(table)
		{
			//Finalizing controls
			this.finalizeControls(true);
			
			if(this.control_counter == 0)
			{
				return;
			}

			var new_display_state = this.getCustomOption('opened') == 1 ? '' : 'none';
			var shift = this.getLevel();
			this.createGroupHeader(table, shift);

			for (var cName in this.controls)
			{
				var control = this.controls[cName];

				if (!control.shownControl && control != 'rs.columnsgroup') continue;

				control.createLine(table, this.getParent().record[cName], shift);
				control.setVisibility(this.getCustomOption('opened') == 1);
			}

			this.createGroupBottom(table, shift);
			this.dom.bottomLine.style.display = new_display_state;
		},
		createGroupHeader: function(table, shift)
		{
			var tr = table.insertRow(table.rows.length);
/*
			if (context_menu_click_type == 0)
			{
				tr.onclick = this.getParent().ctxClick();
			}
			else
			{
				tr.oncontextmenu = this.getParent().ctxClick();
			}
*/
			var td = tr.insertCell(0);
			td.className = "title";
			td.title = this.hint || "";
			var txt = this.title || this.name || "";

			txt = txt.dashReplace();

			var text = document.createTextNode(txt);
			var p = document.createElement('p');
			this.dom.groupHeader = p;
			dom.setClassOnMouseEvents(p, "link_hover", "link");
			p.onclick = this.switchGroupDisplay.bind(this).createCaller();
			p.appendChild(text);
			td.appendChild(p);
//			td.appendChild(text);
			var td = tr.insertCell(1);
//			td.width = '100%';

			if (this.getParent().markControls)
			{
				td.className = "mark-check";
				td.appendChild(document.createTextNode(' '));
				var td = tr.insertCell(2);
			}

			td.className = "light-bg";
			td.style.lineHeight = "1px";

			if (shift && shift > 1)
			{
				var t = document.createElement('TABLE');
				t.cellSpacing = 0;
				t.cellPadding = 0;
				t.className = "grouptree light-bg";
				var t_tr = t.insertRow(0);
				for (var i=0; i<shift-1; i++)
				{
					var t_td = t_tr.insertCell(t_tr.cells.length);
					t_td.className = "grouptree";
				}
				td.appendChild(t);
				td = t_tr.insertCell(t_tr.cells.length);
//				td.style.paddingLeft = ""+(shift-1)*10+"px";
			}

			var div = document.createElement("div");
			div.className = "sprite_opencloseTopIcon pointer";

			dom.addOnMouseEventsWatchNode(this.dom.groupHeader, div);
			div.onclick = this.switchGroupDisplay.bind(this).createCaller();
			td.appendChild(div);

			this.dom.headerLine = tr;
		},
		createGroupBottom: function(table, shift)
		{
			var tr = table.insertRow(table.rows.length);
			tr.style.height = '9px';
/*
			if (context_menu_click_type = 0)
			{
				tr.onclick = this.getParent().ctxClick();
			}
			else
			{
				tr.oncontextmenu = this.parent.ctxClick();
			}
*/
			var td = tr.insertCell(0);
			td.className = "title";
			td.appendChild(document.createTextNode(' '));

			var td = tr.insertCell(1);

			if (this.getParent().markControls)
			{
				td.className = "mark-check";
				td.appendChild(document.createTextNode(' '));
				var td = tr.insertCell(2);
			}

			td.className = "light-bg";
			td.style.lineHeight = "1px";

			if (shift && shift > 1)
			{
				var t = document.createElement('TABLE');
				t.cellSpacing = 0;
				t.cellPadding = 0;
				t.className = "grouptree light-bg";
				var t_tr = t.insertRow(0);
				for (var i=0; i<shift-1; i++)
				{
					var t_td = t_tr.insertCell(t_tr.cells.length);
					t_td.className = "grouptree";
				}
				td.appendChild(t);
				td = t_tr.insertCell(t_tr.cells.length);
//				td.style.paddingLeft = ""+(shift-1)*10+"px";
			}

			var div = document.createElement("div");
			div.className = "sprite_opencloseBottomIcon pointer";

			dom.addOnMouseEventsWatchNode(this.dom.groupHeader, div);
			div.onclick = this.switchGroupDisplay.bind(this).createCaller();
			td.appendChild(div);

			this.dom.bottomLine = tr;
		},
		switchGroupDisplay: function()
		{
			this.getParent().hideMenu();

			if (IS_OPERA && this.getParent().dom.firstTitleTd) this.getParent().dom.firstTitleTd.className = 'title';

			var new_display_state = this.getCustomOption('opened') == 1 ? 'none' : '';

			for (var cName in this.controls)
			{
				this.controls[cName].setVisibility(this.getCustomOption('opened') != 1);
/*
				if (this.controls[cName].dom.controlLines)
				{
					for (var line in this.controls[cName].dom.controlLines)
					{
						this.controls[cName].dom.controlLines[line].style.display = new_display_state;
					}
				}*/
			}

			if(this.dom.bottomLine)
			{
				this.dom.bottomLine.style.display = new_display_state;
			}

			this.setCustomOption('opened', this.getCustomOption('opened') == 1 ? 0 : 1);

			return true;
		},
		setVisibility: function(mode)
		{
			var new_display_state = mode ? '' : 'none';

			if (this.getCustomOption('opened') == 1)
			{
				for (var cName in this.controls)
				{
					this.controls[cName].setVisibility(mode && this.getCustomOption('opened') == 1);
				}
			}

			if(this.dom.headerLine)
			{
				this.dom.headerLine.style.display = new_display_state;
			}
			if(this.dom.bottomLine && this.getCustomOption('opened') == 1)
			{
				this.dom.bottomLine.style.display = new_display_state;
			}

			return true;
		},
		ctxClick: function()
		{
			var sender = this;
			if (sender.menu)
			{
				return function()
				{
					sender.menu.show.apply(sender.menu, arguments);
					return false;
				}
			}
			return null;
		},
		getInformationArray: function()
		{
			return this.getParent().informationArray;
		},
		getExceptionTable: function()
		{
			return this.getParent().exceptionTable;
		},
		getExceptionSpan: function()
		{
			return this.getParent().exceptionSpan;
		},
		getAddException: function()
		{
			return this.getParent().addException;
		},
		getClearExceptions: function()
		{
			return this.getParent().clearExceptions;
		},
		getShowExceptions: function()
		{
			return this.getParent().showExceptions;
		},
		getDynRecordInto: function(record, isNotDyn)
		{
			if (!record)
			{
				record = {};
			}

			for (var cName in this.controls)
			{
				var c = this.controls[cName];

				if (c == 'rs.columnsgroup')
				{
					c.getDynRecordInto(record, isNotDyn);
					continue;
				}


				if (!c.shownControl) continue;

				if (!c.isStatic || isNotDyn)
				{
					if (!isNotDyn)
					{
						c.getValue();
					}

					c.verifyValue();

					if (!c.verificationPassed)
					{
						this.getParent().verificationPassed = false;
						this.getParent().informationArray.push('"'+(c.title || c.name)+'"' + (c.verificationFailureReason ? ': ' + c.verificationFailureReason : ''));
						this.getParent().informationArrayExt.push({
							line:'"'+(c.title || c.name)+'"' + (c.verificationFailureReason ? ': ' + c.verificationFailureReason : ''),
							control:c
						});
					}

					record[cName] = c.getRecordValue();
				}
			}

			for (var cName in this.controls)
			{
				var c = this.controls[cName];
				if (c == "rs.password")
				{
					c.setValue("");
				}
			}
		},
		getSelectedControlsRecordInto: function(record)
		{
			if (!this.getParent().markControls)
			{
				return record;
			}

			for (var cName in this.controls)
			{
				var c = this.controls[cName];

				if (c == 'rs.columnsgroup')
				{
					c.getSelectedControlsRecordInto(record);
					continue;
				}

				if (!c.shownControl || c.isStatic || !c.dom.markCheckboxControl) continue;

				c.dom.markCheckboxControl.getValue();
//				record[cName] = c.dom.markCheckboxControl.value;
				if (c.dom.markCheckboxControl.value)
				{
					record.push(cName);
				}
			}

			return record;
		}
	}
);

//
// rs.dbpreference
//

rs.dbpreference = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);

			this.calledForAll = 0;
			this.hideTimeout = 10000;
		},
		toString: function()
		{
			return "rs.dbpreference";
		},
		create: function(e)
		{
			if (!this.control_counter) return;

/*
//			alert(this.parent);

			var shield_table = document.createElement("table");
			shield_table.className = "body-shield";
			shield_table.style.display = "none";
//			alert(e.style.width);
//			shield_table.style.width = document.body.clientWidth+"px";
			shield_table.style.width = "100%";
			shield_table.style.height = document.body.clientHeight+"px";
//			shield_table.style.height = "100%";

			var tr = shield_table.insertRow(0);
			var td = tr.insertCell(0);
			e.appendChild(shield_table);

			e.onClick = function() {};
//*/

			var table_ext = document.createElement("table");
			table_ext.className = "ctl-dbpreference";
			table_ext.style.display = "none";
			table_ext.cellSpacing = 0;
			table_ext.cellPadding = 0;

			var table_int = document.createElement("table");
			table_int.cellSpacing = 0;
			table_int.cellPadding = 0;

			var tr = table_ext.insertRow(0);
			var td = tr.insertCell(0);
			td.appendChild(table_int);

			var tr = table_int.insertRow(table_int.rows.length);
			var td = tr.insertCell(0);
			td.colSpan = 2;
			td.appendChild(document.createTextNode(this.title || this.name));

			var title_span = document.createElement("span");
			this.dom.title_span_text = title_span.appendChild(document.createTextNode(' for something'));

			td.appendChild(title_span);
			this.dom.title_span = title_span;

			for (var cName in this.controls)
			{
				var control = this.controls[cName];
				var tr = table_int.insertRow(table_int.rows.length);

				var td = tr.insertCell(0);
				td.className = "title";
				td.title = control.hint || "";
				var txt = control.title || cName || "";
				// Mark mandatory fields
				if (this.markNotNull && !control.isStatic && control.notNull)
				{
					txt = "* " + txt;
				}
				var text = document.createTextNode(txt);
				td.appendChild(text);

				var td = tr.insertCell(1);
				td.className = "data";
				if (control.isStatic)
				{
					td.className += " readonly";
				}

				control.create(td, '');
			}


			var tr = table_int.insertRow(table_int.rows.length);
			var td = tr.insertCell(0);
			td.colSpan = 2;

			// SUBMIT
			var input = document.createElement("input");
			input.type = "button";
			input.value = rs.s('common.ok', 'OK');
			input.onclick = Aux.Table__CtxMenu__CallProcedure(this).createCaller(this.parent.menu);
			input.className="submitButton";
			td.appendChild(input);

			// CLOSE
			var input = document.createElement("input");
			input.type = "button";
			input.value = rs.s('common.cancel', 'Cancel');
			input.onclick = this.hide.bind(this).createCaller();
			td.appendChild(input);

/*
			table_ext.onmouseover = this.handler_onmouseover.bind(this);
			table_ext.onmouseout = this.handler_onmouseout.bind(this);
//*/

			this.dom.table_ext = table_ext;
			this.dom.table_int = table_int;

			e.appendChild(table_ext);
		},
		ctxClick: function(forAll)
		{
			var sender = this;
			if (sender.control_counter)
			{
				return function(menu, e)
				{
					sender.show(e,forAll);
					return false;
				};
			}
			else
			{
				return Aux.Table__CtxMenu__CallProcedure(sender, forAll);
			}
			return null;
		},
		handler_onmouseover: function()
		{
			this.readyToHide = false;
		},
		handler_onmouseout: function()
		{
			this.readyToHide = true;
			setTimeout(this.tryHide.bind(this), this.hideTimeout);
		},
		itemClick: function(handler)
		{
			var menu = this;
			return function(e)
			{
				menu.hide();
				if (handler instanceof Function)
				{
					handler(menu);
				}
			}
		},
		setPosition: function(x, y)
		{
			var table_ext = this.dom.table_ext;
			table_ext.style.left = x + "px";
			table_ext.style.top = y + "px";
		},
		show: function(e,forAll)
		{
			if (this.dom.table_int.rows.length == 0)
			{
				return;
			}

			this.changeByForAll(forAll);

			var pos = dom.getMousePosition(e);
			var table_ext = this.dom.table_ext;

			var normalBodyHeight = document.body.clientHeight;
			var normalBodyWidth = document.body.clientWidth;

			table_ext.style.display = "";

			if (table_ext.clientHeight + pos.y > document.body.clientHeight && pos.y > table_ext.clientHeight && table_ext.clientHeight +40 < document.body.clientHeight)
			{
				pos.y -= table_ext.clientHeight;
			}
			if (table_ext.clientWidth + pos.x > document.body.clientWidth && pos.x > table_ext.clientWidth && table_ext.clientWidth +40 < document.body.clientWidth)
			{
				pos.x -= table_ext.clientWidth;
			}

			this.setPosition(pos.x, pos.y);

		},
		changeByForAll: function(forAll)
		{
			this.calledForAll = forAll ? forAll : 0;
			if (forAll)
			{
				this.dom.title_span.removeChild(this.dom.title_span_text);
				this.dom.title_span_text = this.dom.title_span.appendChild(document.createTextNode(' for all'));
			}
			else
			{
				this.dom.title_span.removeChild(this.dom.title_span_text);
				this.dom.title_span_text = this.dom.title_span.appendChild(document.createTextNode(' for selected'));
			}
		},
		tryHide: function()
		{
			if (this.readyToHide)
			{
				this.hide();
			}
		},
		hide: function()
		{
			if (!this.dom.table_ext) return;
			this.dom.table_ext.style.display = "none";
			var table_int = this.dom.table_int;
			for (var i=0; i<table_int.rows.length; i++)
			{
				var row = table_int.rows[i];
				if (row.onmouseout)
				{
					row.onmouseout();
				}
			}
		},
		getDynRecord: function()
		{
			var record = {};


			for (var cName in this.controls)
			{
				var c = this.controls[cName];
				if (!c.isStatic)
				{
					c.getValue();
					record[cName] = c.value;
				}
			}

			return record;
		}
	}
);

//
// rs.menu
//

rs.menu = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);
			this.sections = {};
			this.parent = null;
			this.readyToHide = false;
			this.hideTimeout = 300;
			this.isShow = false;
			this.visibilityMask = null;
		},
		toString: function()
		{
			return "rs.menu";
		},
		addSection: function(name, title, hint, icon)
		{
			this.sections[name] = {title:title, hint:hint, icon:icon, items:[], visibility:1};
		},
		addItem: function(section, title, hint, icon, handler, name)
		{
			this.sections[section].items.push({title:title, hint:hint, icon:icon, handler:handler, name:name, visibility:1});
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
		resetItemsVisibility: function()
		{
			for (var i in this.sections)
			{
				this.sections[i].visibility = 1;

				for (var j in this.sections[i].items)
				{
					this.sections[i].items[j].visibility = 1;
				}
			}
		},
		setItemsVisibility: function(mask, type)
		{
			if (type == 'exists_items')
			{
				if (mask instanceof Array)
				{
					var mask2 = [];
					for (var i in mask)
					{
						mask2[mask[i]] = 1;
					}

					mask = mask2;
				}

				for (var i in this.sections)
				{
					this.sections[i].visibility = 1;

					for (var j in this.sections[i].items)
					{
						if (mask[this.sections[i].items[j].name] == 1)
						{
							this.sections[i].items[j].visibility = 1;
						}
						else
						{
							this.sections[i].items[j].visibility = 0;
						}
					}
				}
			}
		},
		getItemsVisibilityMask: function()
		{
			var mask = [];

			for (var i in this.sections)
			{
				mask[i] = [];
				for (var j in this.sections[i].items)
				{
					mask[i][j] = this.sections[i].items[j].visibility;
				}
			}

//			alert(serialize_for_print(mask));
			return serialize(mask);
		},
		reCreateIfNeed: function()
		{
			if (this.visibilityMask != this.getItemsVisibilityMask())
			{
				this.reCreate();
			}
		},
		reCreate: function()
		{
			this.dom.table_int_container.removeChild(this.dom.table_int);
			this.createIntTable(this.dom.table_int_container);
		},
		create: function(e)
		{
			this.removeEmptySections();

			var cover = document.createElement("iframe");
			cover.src = "blank.html";
			cover.className = "cover";
			cover.style.display = "none";
			this.dom.cover = cover;
			e.appendChild(cover);

			var table_ext = document.createElement("table");
			table_ext.className = "ctl-ctxmenu no-print";
			table_ext.style.display = "none";
			table_ext.cellSpacing = 0;
			table_ext.cellPadding = 0;

			var tr = table_ext.insertRow(0);
			var td = tr.insertCell(0);

			this.dom.table_int_container = td;

			this.createIntTable(this.dom.table_int_container);

			table_ext.onmouseover = this.handler_onmouseover.bind(this);
			table_ext.onmouseout = this.handler_onmouseout.bind(this);

			this.dom.table_ext = table_ext;

			e.appendChild(table_ext);
		},
		removeIntTable: function(table_int_container, table_int)
		{
			table_int_container.removeChild(table_int);
		},
		createIntTable: function(table_int_container)
		{
			var table_int = document.createElement("table");
			table_int.cellSpacing = 0;
			table_int.cellPadding = 0;

			table_int_container.appendChild(table_int);

			var cnt = 0;

			for (var sectionId in this.sections)
			{
				var section = this.sections[sectionId];
				if (cnt > 0)
				{
					var tr = table_int.insertRow(table_int.rows.length);
					var td = tr.insertCell(0);
					td.colSpan = 2;
					td.style.margin = "0";
					td.style.height = "8pt";
					td.className = "separator";
					var hr = document.createElement("hr");
					hr.style.verticalAlign = "middle";
					hr.size = 1;
					hr.noShade = true;
					hr.style.margin = "0";
					td.appendChild(hr);
				}

				cnt = section.items.length;

				if ((cnt > 0) && section.title)
				{
					var tr = table_int.insertRow(table_int.rows.length);
//					dom.setClassOnMouseEvents(tr, "hover", "");
					var td = tr.insertCell(0);
					td.className = "icon";

					if (section.icon)
					{
						var div = document.createElement("div");
						div.className = section.icon;
						td.appendChild(div);
					}

					var td = tr.insertCell(1);
					td.className = "section";
					td.appendChild(document.createTextNode(section.title));
					td.title = section.hint||"";
				}

				for (var i=0; i<cnt; i++)
				{
					var item = section.items[i]

					if (item.visibility == 0)
					{
						continue;
					}

					var tr = table_int.insertRow(table_int.rows.length);
					dom.setClassOnMouseEvents(tr, "hover", "");
					tr.onclick = this.itemClick(item.handler);
					var td = tr.insertCell(0);

					if (item.icon)
					{
						td.className = "icon";
						var div = document.createElement("div");
						div.className = item.icon;
						td.appendChild(div);
					}

					var td = tr.insertCell(1);
					td.className = "item";
					td.appendChild(document.createTextNode(item.title));
					td.title = item.hint || "";
				}
			}

			this.dom.table_int = table_int;

			this.visibilityMask = this.getItemsVisibilityMask();
		},
		handler_onmouseover: function()
		{
			this.readyToHide = false;
		},
		handler_onmouseout: function()
		{
			this.readyToHide = true;
			setTimeout(this.tryHide.bind(this), this.hideTimeout);
		},
		itemClick: function(handler)
		{
			var menu = this;
			return function(e)
			{
				menu.hide();
				if (handler instanceof Function)
				{
					handler(menu,e);
				}
			}
		},
		setPosition: function(x, y)
		{
			var table_ext = this.dom.table_ext;
			table_ext.style.left = x + "px";
			table_ext.style.top = y + "px";

			var cover = this.dom.cover;
			cover.style.left = x + "px";
			cover.style.top = y + "px";
		},
		show: function(e)
		{
			this.isShow = true;
			// To avoid appearance of menu when it has no items
			if (this.dom.table_int.rows.length == 0)
			{
				return;
			}
			var pos = dom.getMousePosition(e);
			var table_ext = this.dom.table_ext;
			var cover = this.dom.cover;

			if(!IS_OPERA && IS_MSIE)
			{
				table_ext.style.display = "";
				cover.height = table_ext.clientHeight+2;
				cover.width = table_ext.clientWidth+2;
				cover.style.display = "";
			}

			table_ext.style.visibility = "hidden";
			table_ext.style.display = "";

			var wheight=(window.innerHeight)?window.innerHeight:
				((document.documentElement.clientHeight)?document.documentElement.clientHeight:null) - 25;
			var wwidth=(window.innerWidth)?window.innerWidth:
   				((document.documentElement.clientWidth)?document.documentElement.clientWidth:null);
			
			if (table_ext.clientHeight + pos.y_ > wheight && pos.y_ > table_ext.clientHeight && table_ext.clientHeight +40 < wheight)
			{
				pos.y -= table_ext.clientHeight;
			}
			if (table_ext.clientWidth + pos.x_ > wwidth && pos.x_ > table_ext.clientWidth && table_ext.clientWidth +40 < wwidth)
			{
				pos.x -= table_ext.clientWidth;
			}

			this.setPosition(pos.x, pos.y);
			table_ext.style.visibility = "visible";
		},
		tryHide: function()
		{
			if (this.readyToHide)
			{
				this.hide();
			}
		},
		hide: function()
		{
			if(!this.isShow)
			{
				return;
			}
			this.isShow = false;
			this.dom.table_ext.style.display = "none";
			this.dom.cover.style.display = "none";
			var table_int = this.dom.table_int;
			for (var i=0; i<table_int.rows.length; i++)
			{
				var row = table_int.rows[i];
				if (row.onmouseout)
				{
					row.onmouseout();
				}
			}
		}
	}
);

//
// rs.arrangetoolbox
//

rs.arrangetoolbox = newClass
(
	rs.container,
	{
		constructor: function()
		{
			rs.container.call(this);

			this.set = [];
			this.selectSize = 14;
			this.saveArrangeDialog = true;
			this.ArrangeCollection = new Array();
			this.DefaultArrange = new Array();
			this.Combo = null;
		},
		toString: function()
		{
			return "rs.arrangetoolbox";
		},
		create: function(e)
		{
			// Table
			var table = document.createElement("table");
			table.className = "ctl-arrangetoolbox";
			table.style.width = "100%";
			var tr = table.insertRow(0);

			// Select 1
			var td = tr.insertCell(0);
			td.rowSpan = 2;
			td.style.width = "50%";
			var select1 = document.createElement("select");
			this.dom.select1 = select1;
			select1.multiple = true;
			select1.size = this.selectSize;
			select1.style.width = "100%";
			select1.ondblclick = this.addSelected.bind(this);
			td.appendChild(select1);

			// Add/remove buttons
			var td = tr.insertCell(1);
			td.style.width = "0px";
			td.style.paddingTop = "3ex";
			td.style.verticalAlign = "top";
			var input = document.createElement("input");
			input.type = "button";
			input.value = ">>";
			input.style.width = "8ex";
			input.onclick = this.addAll.bind(this);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = ">";
			input.style.width = "8ex";
			input.onclick = this.addSelected.bind(this);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = "<";
			input.style.width = "8ex";
			input.onclick = this.removeSelected.bind(this);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = "<<";
			input.style.width = "8ex";
			input.onclick = this.removeAll.bind(this);
			td.appendChild(input);

			// Select 2
			var td = tr.insertCell(2);
			td.rowSpan = 2;
			td.style.width = "50%";
			var select2 = document.createElement("select");
			this.dom.select2 = select2;
			select2.multiple = true;
			select2.size = this.selectSize;
			select2.style.width = "100%";
			select2.ondblclick = this.removeSelected.bind(this);
			td.appendChild(select2);

			// Move up/move down buttons
			var tr = table.insertRow(1);
			tr.style.height = "0%";
			var td = tr.insertCell(0);
			td.style.width = "0px";
			td.style.paddingBottom = "3ex";
			td.style.verticalAlign = "bottom";
			var input = document.createElement("input");
			input.type = "button";
			input.value = '\u2191';
			input.style.width = "8ex";
			input.onclick = this.moveUpSelected.bind(this);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			var input = document.createElement("input");
			input.type = "button";
			input.value = '\u2193';
			input.style.width = "8ex";
			input.onclick = this.moveDownSelected.bind(this);
			td.appendChild(input);
			td.appendChild(document.createElement("br"));
			//e.appendChild(table);

			var tr = table.insertRow(2);
			tr.style.height="0%"
			var td = tr.insertCell(0);
			td.colSpan=3;
			td.className = "right";
			var input = document.createElement("input");
			input.type = "button";
			input.value = rs.s('arrangebox.apply', 'Apply');
			input.onclick = Aux.Arrange__SetArrange(this).createCaller(this);
			input.className="submitButton";
			td.appendChild(input);

			e.appendChild(table);

			//Save toolbox

			if (this.saveArrangeDialog)
			{
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
				saved_arrange = new rs.combobox;
				this.Combo = saved_arrange;
				saved_arrange.setLookup(this.sa_lookup);
				saved_arrange.notNull = false;
				saved_arrange.create(td);
				saved_arrange.setValue(this.currentArrangeId);
				saved_arrange.onChange.add(this.SetSaved.bind(saved_arrange).createCaller(this));
				this.dom.saved_arrange = saved_arrange;

				/*//apply
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.type = 'button';
				input.value = rs.s('arrange.apply','Apply');
				input.onclick = Aux.Arrange__SetSavedArrange(this).createCaller(this);
				td.appendChild(input);*/

				//delete
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.type = 'button';
				input.value = rs.s('arrangebox.delete','Delete');
				input.onclick = Aux.Arrange__DeleteSavedArrange(this).createCaller(this);
				td.appendChild(input);

				//save
				var td = tr.insertCell(tr.cells.length);
				var input = document.createElement('input');
				input.type = 'button';
				input.value = rs.s('arrangebox.save','Save');
				input.onclick = Aux.Arrange__SaveAs(this).createCaller(this);
				td.appendChild(input);

				e.appendChild(table);
			}

			// Set value
			var set = this.set;
			this.setValue(set);
		},
		syncValue: function()
		{
			this.set = [];
			for (var i=0; i<this.dom.select2.options.length; i++)
			{
				this.set.push(this.dom.select2.options[i].value);
			}
		},
		setValue: function(set)
		{
			// Clear select1 and select2
			removeAllOptions(this.dom.select1);
			removeAllOptions(this.dom.select2);

			// Fill in select1
			for (var optionId in this.options)
			{
				if (array_find(set, optionId) < 0)
				{
					addOption(this.dom.select1, this.options[optionId], optionId, false);
				}
			}

			// Fill in select2
			for (var i=0; i<set.length; i++)
			{
				addOption(this.dom.select2, this.options[set[i]], set[i], false);
			}

			// Synchronize set
			this.syncValue();
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
				for (var i in selected)
				{
					this.dom.select2.options[selected[i]].selected = true;
				}
			}
		},
		SetSaved: function(sender)
		{
			//alert(sender)
			//alert(this.value);
			if(this.value)
			{
			    sender.setValue(sender.ArrangeCollection[this.value]);
			}
			else
			{
			    sender.setValue(sender.DefaultArrange);
			}
		},
		setArrangeLookup: function(lookup)
		{
			this.sa_lookup = lookup;
		},
		removeAll: function()
		{
			// Move all options from select2 into select1
			moveAllOptions(this.dom.select2, this.dom.select1, false);
			this.syncValue();
			this.setDefaultArrange();
		},
		addAll: function()
		{
			// Move all options from select1 into select2
			moveAllOptions(this.dom.select1, this.dom.select2, false);
			this.syncValue();
			this.setDefaultArrange();
		},
		addSelected: function()
		{
			next_index = this.dom.select1.selectedIndex;
			if(next_index == this.dom.select1.length - 1)
			{
				next_index --;
			}
			// Move selected option from select1 into select2
			moveSelectedOptions(this.dom.select1, this.dom.select2, false);
			this.syncValue();
			this.setDefaultArrange();
			this.dom.select1.options[next_index].selected = true;
		},
		removeSelected: function()
		{
			next_index = this.dom.select2.selectedIndex;
			if(next_index == this.dom.select2.length - 1)
			{
				next_index --;
			}
			// Move selected option from select2 into select1
			moveSelectedOptions(this.dom.select2, this.dom.select1, false);
			this.syncValue();
			this.setDefaultArrange();
			this.dom.select2.options[next_index].selected = true;
		},
		moveUpSelected: function()
		{
			// Move selected option up in select2
			moveOptionUp(this.dom.select2);
			this.syncValue();
			this.setDefaultArrange();
		},
		moveDownSelected: function()
		{
			// Move selected option down in select2
			moveOptionDown(this.dom.select2);
			this.syncValue();
			this.setDefaultArrange();
		}
	}
)

alert('loaded9368');
