var form_is_sent = false;

var Aux =
{
	Form__Submit: function(action, target, data, custom)
	{
		if (form_is_sent)
		{
			return;
		}
		form_is_sent = true;
		var form = document.forms[0];
		form.action.value = action;
		form.target.value = target;
		
		if (typeof(data) == "string" || typeof(data) == "number")
		{
			form.data.value = data;
		}
		else if (typeof(data) == "object")
		{
			Aux.Form__AddSubVars(form, 'data', data);
		}

		if (custom)
		{
			Aux.Form__AddSubVars(form, 'custom', custom);
		}
		form.submit();
	},
	Form__DoSubmit: function(action, target, data, custom)
	{
		if (form_is_sent)
		{
			return;
		}
		form_is_sent = true;
		var form = document.forms[0];
		form.action.value = action;
		form.target.value = target;
		
		if (typeof(data) == "string" || typeof(data) == "number")
		{
			form.data.value = data;
		}
		else if (typeof(data) == "object")
		{
			Aux.Form__AddSubVars(form, 'data', data);
		}

		if (custom)
		{
			Aux.Form__AddSubVars(form, 'custom', custom);
		}
		doSubmit('select',this.name,this.dom.select.value);
	},
	Form__AddVar: function(name, value)
	{
		var input = document.createElement("input");
		input.type = "hidden";
		input.name = name;
		input.value = value;
		document.forms[0].appendChild(input);
	},
	
	Form__AddSubVars: function(form, parent, data)
	{
		if (!parent) {parent = 'data';}
		
		if (data instanceof Array)
		{
			for (var i = 0; i < data.length; i++)
			{
				Aux.Form__AddSubVars(form, parent+"[" + i + "]", data[i]);
			}
		}
		else if (data instanceof Object)
		{
			for (var i in data)
			{
				Aux.Form__AddSubVars(form, parent+"[" + i + "]", data[i]);
			}
		}
		else
		{
			Aux.Form__AddVar(parent, data);
		}
	},
	Frame__ResetSettings: function(target)
	{
		Aux.Form__Submit("Frame:ResetSettings", target);
	},
	Frame__Reload: function(target)
	{
		Aux.Form__Submit("Frame:Reload", target);
	},
	Table__ClearObjectSession: function(target)
	{
		Aux.Form__Submit("Table:ClearObjectSession", target);
	},
	Table__DisableFilter: function(sender)
	{
		Aux.Form__Submit("Table:DisableFilter", sender.hi);
	},
	Table__RemoveFilter: function(sender)
	{
		Aux.Form__Submit("Table:RemoveFilter", sender.hi);
	},
	Table__RemoveSorting: function(sender)
	{
		Aux.Form__Submit("Table:RemoveSorting", sender.hi);
	},
	Table__Sort: function(sender, cName)
	{
		Aux.Form__Submit("Table:Sort", sender.hi, cName);
	},
	Table__Filter: function(sender)
	{
		alert("Filter table " + sender.hi);
	},
	Table__SetPage: function(sender, pageNum)
	{
		Aux.Form__Submit("Table:SetPage", sender.hi, pageNum);
	},
	Table__SetPageSize: function(sender, pageSize)
	{
		Aux.Form__Submit("Table:SetPageSize", sender.hi, pageSize);
	},
	Table__ResetColumnsArrangement: function(sender)
	{
		Aux.Form__Submit("Table:ResetColumnsArrangement", sender.hi);
	},
	Table__CtxMenu__Add: function(sender)
	{
		if (eqttitle == 'Customer Gateways') {
			if (document.getElementById('mwbseqcustomer').value=='0'){
			alert("Please select customer to add");
			return false;
			};
			};
			if (eqttitle == 'Vendor Gateways') {
			if (document.getElementById('mwbseqvendor').value=='0'){
			alert("Please select vendor to add");
			return false;
			};
			};
			if (eqttitle == 'Wbs Dial peers') {
			if (document.getElementById('mwbsdpcustomer').value=='0'){
			alert("Please select customer to add");
			return false;
			};
			};

		Aux.Form__Submit("Table:Add", sender.hi, "");
	},
	Table__CtxMenu__AddFromCopy: function(sender)
	{
		var rownum = sender.selectedRow;
		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.getPKRecord(sender.rowset[rownum]);

		Aux.Form__Submit("Table:AddCopy", sender.hi, pkrecord);
	},
	Table__CtxMenu__AddChild: function(sender)
	{
		var rownum = sender.selectedRow;
		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.getPKRecord(sender.rowset[rownum]);

		Aux.Form__Submit("Table:AddChild", sender.hi, pkrecord);
	},
	Table__CtxMenu__SetModeViewSingleRow: function(sender)
	{
		var rownum = sender.selectedRow;

		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.getPKRecord(sender.rowset[rownum]);

//		alert(serialize_for_print(pkrecord));

		Aux.Form__Submit("Table:SetModeViewSingleRow", sender.hi, pkrecord);
	},
	Table__CtxMenu__Edit: function(sender)
	{
		var rownum = sender.selectedRow;

		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.getPKRecord(sender.rowset[rownum]);

		Aux.Form__Submit("Table:Edit", sender.hi, pkrecord);
	},
	Table__CtxMenu__EditRowsMarked: function(sender, fast)
	{
		var markedRows = sender.getMarkedRows();
		if (markedRows.length == 0)
		{
			return;
		}
	
		var markedRowsPK = [];
		for (var i=0; i<markedRows.length; i++)
		{
			markedRowsPK.push(sender.getPKRecord(sender.rowset[markedRows[i]]));
		}

		Aux.Form__Submit("Table:EditRows_Marked", sender.hi, {fast: (fast ? 1 : 0), marked: markedRowsPK});
	},
	Table__CtxMenu__EditRowsFilter: function(sender, fast)
	{
		if (sender.options.size == 0)
		{
			return;
		}

		Aux.Form__Submit("Table:EditRows_Filter", sender.hi, {fast: (fast ? 1 : 0)});
	},
	Table__CtxMenu__FilterFromCell: function(sender)
	{
		var row = {};
		row[sender.selectedControl] = sender.rowset[sender.selectedRow][sender.selectedControl];
		Aux.Form__Submit("Table:FilterFromCell", sender.hi, row);
	},
	Table__CtxMenu__FilterFromCellAdd: function(sender)
	{
		var row = {};
		row[sender.selectedControl] = sender.rowset[sender.selectedRow][sender.selectedControl];
		Aux.Form__Submit("Table:FilterFromCellAdd", sender.hi, row);
	},
	Table__CtxMenu__Filter: function(sender)
	{
		var str_window_id = (typeof(window_id) == 'undefined') ? '' : "&windowId=" + window_id;

		var str_filters_args = '';

		var param = sender.options.args.view_id  ? '&objectArgs='+sender.options.args.view_id : '';
		for(filter_name in sender.args)
		{
			str_filters_args += "&args[" + filter_name + "]=" + sender.args[filter_name];
		}

		var w = window.open("Frame.FilterToolBox.php?object=" + sender.hi + str_window_id + str_filters_args + param, "frm_filtertoolbox", "width=510,height=250,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes");

		if (w.opener != window && IS_MSIE) // IE do not change opener, if window already opened
		{
			w.opener = window;
		}

		w.focus();
	},
	Table__CtxMenu__ArrangeColumns: function(sender)
	{
		var str_args = '';
		for(key in sender.options.args)
		{
			str_args += "&args[" + key + "]=" + sender.options.args[key];
		}
		
		if (typeof(window_id) == 'undefined')
		{
			var w = window.open("Frame.ArrangeToolBox.php?object=" + sender.hi + str_args, "frm_arrangetoolbox", "width=667,height=250,menubar=no,toolbar=no,status=no,scrollbars=no,resizable=yes");
		}
		else
		{
			var w = window.open("Frame.ArrangeToolBox.php?object=" + sender.hi + "&windowId=" + window_id + str_args, "frm_arrangetoolbox", "width=667,height=250,menubar=no,toolbar=no,status=no,scrollbars=no,resizable=yes");
		}

		if (w.opener != window && IS_MSIE) // IE do not change opener, if window already opened
		{
			w.opener = window;
		}

		w.focus();
	},
	Table__CtxMenu__MoveByReference: function(sender, referenceHI, type)
	{
		return function()
		{
			if('rs.record' == sender)
			{
				var pkrecord = sender.addPKRecord({});
				if (!pkrecord)
				{
					return null;
				}
			}
			else
			{
				var rownum = sender.selectedRow;
				if (rownum == null)
				{
					return null;
				}

				var pkrecord = sender.getPKRecord(sender.rowset[rownum]);
			}
			
			var action = '';
			switch(type)
			{
				case 'TR':
					action = 'Table:MoveByReference';
					break;
				case 'GPR':
					action = 'Table:MoveByGPReference';
					break;
				default:
					return;
			}
			Aux.Form__Submit(action, referenceHI, pkrecord);
		}
	},
	Table__CtxMenu__CallProcedure: function(sender, procedureHI, forAll)
	{
//		alert('Table__CtxMenu__CallProcedure forAll - '+forAll);
		return function()
		{	
			var data = {};
			var markedRowsPK = [];

			var proc = "DBPReference:Call";
		
			if (forAll)
			{
				proc = "DBPReference:CallForAll";
				var confirmMsg = rs.s("table.confirm.proc_call_all", "Are you sure you want to call procedure for all records?");
			}
			else
			{
				if('rs.record' == sender)
				{
					var pkRecord = sender.addPKRecord({});
					if (!pkRecord)
					{
						return null;
					}
					
					var confirmMsg = rs.s("table.confirm.proc_call_one", "Are you sure you want to call procedure for this record?");
					
					markedRowsPK.push(pkRecord);
				}
				else
				{
					var markedRows = sender.getMarkedRows();
	
					if (markedRows.length == 0)
					{
						var rownum = sender.selectedRow;
						if (rownum == null)
						{
							return null;
						}
	
						var confirmMsg = rs.s("table.confirm.proc_call_one", "Are you sure you want to call procedure for this record?");
						
						markedRowsPK.push(sender.getPKRecord(sender.rowset[rownum]));
					}
					else
					{
						var confirmMsg = rs.s("table.confirm.proc_call_marked", "Are you sure you want to call procedure for {0} marked record(s)?", [markedRows.length]);
		
						for (var i = 0; i < markedRows.length; i++)
						{
							markedRowsPK.push(sender.getPKRecord(sender.rowset[markedRows[i]]));
						}
					}
				}
			}

			if (!confirm(confirmMsg))
			{
				return;
			}

			data['pkrecordset'] = markedRowsPK;
			Aux.Form__Submit(proc, procedureHI, data);
		}
	},
	Table__CtxMenu__ExportData: function(sender)
	{
		if (sender.options.size >= 100)
		{
			var confirmMsg = rs.s('table.confirm.export', 'Are you sure you want to export {0} record(s)?\nIt can reduce system performance.', [sender.options.size]);
			if (!confirm(confirmMsg))
			{
				return;
			}
		}
		Aux.Form__Submit("Table:ExportData", sender.hi);
		form_is_sent = false;
	},
	Table__UpdateRows: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

		Aux.Form__Submit("Table:UpdateRows", sender.hi, record);
	},
	Record__UpdateOrInsertRow: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

		sender.addPKRecord(record);

//		alert(serialize_for_print(record));

		Aux.Form__Submit("Table:UpdateOrInsertRow", sender.hi, record);
	},
	Record__UpdateRow: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

		sender.addPKRecord(record);

//		alert(serialize_for_print(record));

		Aux.Form__Submit("Table:UpdateRow", sender.hi, record);
	},
	Record__InsertRow: function(sender)
	{
		var record = sender.getDynRecord();
		
		if(!record)
		{
			return;
		}

//		alert(serialize_for_print(record));

		Aux.Form__Submit("Table:InsertRow", sender.hi, record);
	},
	Record__UpdateOrInsertRowApply: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}
		sender.addPKRecord(record);

//		alert(serialize_for_print(record));

		Aux.Form__Submit("Table:UpdateOrInsertRowApply", sender.hi, record);
	},
	Record__UpdateRowApply: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

		sender.addPKRecord(record);

//		alert(serialize_for_print(record));
//		return;

		Aux.Form__Submit("Table:UpdateRowApply", sender.hi, record);
	},
	Record__InsertRowApply: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

//		alert(serialize_for_print(record));
//		return;

		Aux.Form__Submit("Table:InsertRowApply", sender.hi, record);
	},
	Record__InsertChild: function(sender)
	{
		var record = sender.getDynRecord(1);

		if (!record)
		{
			return;
		}

		Aux.Form__Submit("Table:InsertRow", sender.hi, record);
	},
	Record__GroupUpdateRows: function(sender)
	{
		var columns = sender.getSelectedControlsRecord();
		if(!columns.length)
		{
			alert("No columns for update");
			return;
		}

		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

		if (sender.options.size)
		{
			var confirmMsg = rs.s('table.confirm.update', 'Are you sure you want to update {0} record(s)?', [sender.options.size]);
			if (!confirm(confirmMsg))
			{
				return;
			}
		}

//		alert(serialize_for_print(columns));
//		alert(columns.substring(1000));
//		alert(serialize_for_print({row:record, columns:columns}));
//		return;

		Aux.Form__Submit("Table:GroupUpdateRows", sender.hi, {row:record, columns:columns});
	},
	Record__SetModeView: function(sender)
	{
		Aux.Form__Submit("Table:SetModeView", sender.hi, null);
	},
	Record__SetModeViewRowset: function(sender)
	{
		/*if(!confirm(rs.s('table.page.switch_edit.confirm', 'Are you sure want to exit from edit mode')))
		{
			return;
		}*/
		Aux.Form__Submit("Table:SetModeViewRowset", sender.hi, null);
	},
	Record__CallProcedure: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

		if (sender.callConfirm)
		{
			if (!confirm(sender.callConfirm))
			{
				return;
			}
		}

		Aux.Form__Submit("Procedure:Call", sender.hi, record);
	},
	Record__ConcealCallProcedure: function(sender)
	{
		var record = sender.getDynRecord();
		if(!record)
		{
			return;
		}

//		sender.clearExceptions();

//		alert(serialize_for_print(record));
//		return;

//*
		new Request.JSON({
//			url: 'TM.Interface.php',
//			method: 'get',
			url: 'AJAXBackend.php',
			method: 'post',
			data: {actions:["Procedure:call"], target:sender.hi, data:record},
			onComplete: function(result, errors)
			{
//				alert(serialize_for_print({"ERRORS":errors,"RESULT":result}));
//				sender.addException(serialize_for_print(result));
//				sender.addException(serialize_for_print(errors));
//				sender.showExceptions();
				if (typeof(result["data"]) == 'object')
				{
					for (var cName in sender.controls)
					{
						if (result["data"][cName])
						{
							sender.controls[cName].setValue(result["data"][cName]);
						}
					}
				}
			},
			noCache: false  // do not disable caching
		}).send();
//*/
		return;
        Aux.Form__Submit("Procedure:Call", sender.hi, record);
	},
	Record__CtxMenu__Edit: function(sender)
	{
//		var rowid = sender.parent.record.ROWID;
		var pkrecord = sender.addPKRecord({});
		//alert(sender.parent.record.ROWID);
		Aux.Form__Submit("Table:Edit", sender.hi, pkrecord);
	},
	Record__CtxMenu__Delete: function(sender)
	{
		var confirmMsg = rs.s('table.confirm.delete_one', 'Are you sure you want to delete this record?');
		if (!confirm(confirmMsg))
		{
			return;
		}
//		var rowid = sender.parent.record.ROWID;
		var pkrecord = sender.addPKRecord({});

		Aux.Form__Submit("Table:DeleteRow", sender.hi, pkrecord);
	},
	Statusbar__SetStatusText: function(statusText)
	{
		if(top.frm_statusbar)
		{
			with (top.frm_statusbar)
			{
				var statusbar = document.getElementById("status-text");
				for (var i=statusbar.childNodes.length-1; i>=0; i--)
				{
					statusbar.removeChild(statusbar.childNodes[i]);
				}
				var text = document.createTextNode(statusText);
				statusbar.appendChild(text);
			}
		}
	},
	Statusbar__Logoff: function()
	{
		top.document.location = "Frame.Login.php?logoff";
	},
	Textarea__ViewLink: function(rowid, hi)
	{		
		Aux.Form__Submit('Textarea:ViewLink', hi, rowid);
	},
	Wizard__CallProcedure: function(sender, button_hi)
	{
		var record = sender.getDynRecord();
		if (!record)
		{
			return;
		}
		Aux.Form__Submit('WizardProcedure:Call', button_hi, record);
	},
	Wizard__CallProcedureNoRecord: function(sender, button_hi)
	{
		Aux.Form__Submit('WizardProcedure:Call', button_hi);
	}
};
