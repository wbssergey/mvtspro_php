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

		for (var property in data)
		{
			if (data[property] instanceof Object)
			{
				Aux.Form__AddSubVars(form, parent+"[" + property + "]", data[property]);
			}
			else
			{
				var input = document.createElement("input");
				input.type = "hidden";
				input.name = parent+"[" + property + "]";
				input.value = data[property];
				form.appendChild(input);
			}
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
	if (eqttitle == 'Dial peers') {
	if (document.getElementById('mwbsdpcustomer').value=='0'){
	alert("Please select customer to add");
	return false;
	};
	};
		Aux.Form__Submit("Table:Add", sender.parent.hi, "");
	},
	Table__CtxMenu__AddFromCopy: function(sender)
	{
		var rownum = sender.parent.selectedRow;
		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.parent.getPKRecord(sender.parent.rowset[rownum]);

		Aux.Form__Submit("Table:AddCopy", sender.parent.hi, pkrecord);
	},
	Table__CtxMenu__AddChild: function(sender)
	{
		var rownum = sender.parent.selectedRow;
		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.parent.getPKRecord(sender.parent.rowset[rownum]);

		Aux.Form__Submit("Table:AddChild", sender.parent.hi, pkrecord);
	},
	Table__CtxMenu__DeleteMarked: function(sender)
	{
		var markedRows = sender.parent.getMarkedRows();
		if (markedRows.length == 0)
		{
			return;
		}

		var confirmMsg = rs.s('table.confirm.delete_marked', 'Are you sure you want to delete {0} marked record(s)?', [markedRows.length]);
		if (!confirm(confirmMsg))
		{
			return;
		}

		var markedRowsPK = [];
		for (var i=0; i<markedRows.length; i++)
		{
			markedRowsPK.push(sender.parent.getPKRecord(sender.parent.rowset[markedRows[i]]));
		}

		Aux.Form__Submit("Table:DeleteRows", sender.parent.hi, markedRowsPK);
	},
	Table__CtxMenu__DeleteFiltered: function(sender)
	{
		if (sender.parent.size == 0)
		{
			return;
		}

		var confirmMsg = rs.s('table.confirm.delete_filtered', 'Are you sure you want to delete {0} record(s)?', [sender.parent.size]);
		if (!confirm(confirmMsg))
		{
			return;
		}

		Aux.Form__Submit("Table:DeleteRows_Filter", sender.parent.hi);
	},
	Table__CtxMenu__SetModeViewSingleRow: function(sender)
	{
		var rownum = sender.parent.selectedRow;

		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.parent.getPKRecord(sender.parent.rowset[rownum]);

//		alert(serialize_for_print(pkrecord));

		Aux.Form__Submit("Table:SetModeViewSingleRow", sender.parent.hi, pkrecord);
	},
	Table__CtxMenu__Edit: function(sender)
	{
		var rownum = sender.parent.selectedRow;

		if (rownum == null)
		{
			return;
		}

		var pkrecord = sender.parent.getPKRecord(sender.parent.rowset[rownum]);

		Aux.Form__Submit("Table:Edit", sender.parent.hi, pkrecord);
	},
	Table__CtxMenu__Delete: function(sender)
	{
		var rownum = sender.parent.selectedRow;
		if (rownum == null)
		{
			return;
		}
		
		sender.parent.illuminateRow(rownum, "select-menu");
		
		var confirmMsg = rs.s('table.confirm.delete_one', 'Are you sure you want to delete this record?');
		if (!confirm(confirmMsg))
		{
			sender.parent.refreshIlluminate();
			return;
		}
		
		var pkrecord = sender.parent.getPKRecord(sender.parent.rowset[rownum]);

//		alert(serialize_for_print(pkrecord));

		Aux.Form__Submit("Table:DeleteRow", sender.parent.hi, pkrecord);
	},
	Table__CtxMenu__EditRowsMarked: function(sender)
	{
		var markedRows = sender.parent.getMarkedRows();
		if (markedRows.length == 0)
		{
			return;
		}
	
		var markedRowsPK = [];
		for (var i=0; i<markedRows.length; i++)
		{
			markedRowsPK.push(sender.parent.getPKRecord(sender.parent.rowset[markedRows[i]]));
		}

		Aux.Form__Submit("Table:EditRows_Marked", sender.parent.hi, markedRowsPK);
	},
	Table__CtxMenu__EditRowsFilter: function(sender)
	{
		if (sender.parent.size == 0)
		{
			return;
		}

		Aux.Form__Submit("Table:EditRows_Filter", sender.parent.hi);
	},
	Table__CtxMenu__Filter: function(sender)
	{
		var str_window_id = (typeof(window_id) == 'undefined') ? '' : "&window_id=" + window_id;

		var str_filters_args = '';

		for(filter_name in sender.parent.filter_args)
		{
			str_filters_args += "&filterArgs[" + filter_name + "]=" + sender.parent.filter_args[filter_name];
		}

		var w = window.open("Frame.FilterToolBox.php?object=" + sender.parent.hi + str_window_id + str_filters_args, "frm_filtertoolbox", "width=510,height=250,menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes");

		if (w.opener != window && IS_MSIE) // IE do not change opener, if window already opened
		{
			w.opener = window;
		}

		w.focus();
	},
	Table__CtxMenu__ArrangeColumns: function(sender)
	{
		if (typeof(window_id) == 'undefined')
		{
			var w = window.open("Frame.ArrangeToolBox.php?object=" + sender.parent.hi, "frm_arrangetoolbox", "width=450,height=250,menubar=no,toolbar=no,status=no,scrollbars=no,resizable=yes");
		}
		else
		{
			var w = window.open("Frame.ArrangeToolBox.php?object=" + sender.parent.hi + "&window_id=" + window_id, "frm_arrangetoolbox", "width=450,height=250,menubar=no,toolbar=no,status=no,scrollbars=no,resizable=yes");
		}

		if (w.opener != window && IS_MSIE) // IE do not change opener, if window already opened
		{
			w.opener = window;
		}

		w.focus();
	},
	Table__CtxMenu__MoveByReference: function(referenceHI)
	{
		return function(sender)
		{
			if('rs.record' == sender.parent)
			{
				var pkrecord = sender.parent.addPKRecord({});
				if (!pkrecord)
				{
					return null;
				}
			}
			else
			{
				var rownum = sender.parent.selectedRow;
				if (rownum == null)
				{
					return null;
				}

				var pkrecord = sender.parent.getPKRecord(sender.parent.rowset[rownum]);
			}
			Aux.Form__Submit("Table:MoveByReference", referenceHI, pkrecord);
		}
	},
	Table__CtxMenu__CallProcedure: function(control, forAll)
	{
//		alert('Table__CtxMenu__CallProcedure forAll - '+forAll);
		return function(sender)
		{
			var v_forAll = forAll;
			
			var data = {};
			var markedRowsPK = [];

			var proc = "DBPReference:Call";

			if(control == 'rs.dbpreference') control.hide();
			
//			alert(sender+' | '+control+' | '+forAll+' | '+control.calledForAll);
			
			if(!v_forAll) v_forAll = control.calledForAll;
			
			if (v_forAll)
			{
				proc = "DBPReference:CallForAll";
				var confirmMsg = "Are you sure you want to call procedure for all records?";
			}
			else
			{
				if('rs.record' == sender.parent)
				{
					var pkRecord = sender.parent.addPKRecord({});
					if (!pkRecord)
					{
						return null;
					}

					var confirmMsg = "Are you sure you want to call procedure for this record?";
					
					markedRowsPK.push(pkRecord);
				}
				else
				{
					var markedRows = sender.parent.getMarkedRows();
	
					if (markedRows.length == 0)
					{
						var rownum = sender.parent.selectedRow;
						if (rownum == null)
						{
							return null;
						}
	
						var confirmMsg = "Are you sure you want to call procedure for this record?";
						
						markedRowsPK.push(sender.parent.getPKRecord(sender.parent.rowset[rownum]));
					}
					else
					{
						var confirmMsg = "Are you sure you want to call procedure for " + markedRows.length + " marked record(s)?";
		
						for (var i=0; i<markedRows.length; i++)
						{
							markedRowsPK.push(sender.parent.getPKRecord(sender.parent.rowset[markedRows[i]]));
						}
					}
				}
			}

			if (!confirm(confirmMsg))
			{
				return;
			}

//			Aux.Form__Submit("Table:CallProcedure", referenceHI, markedRowsRowid);

			data['pkrecordset'] = markedRowsPK;
			data['data'] = control.getDynRecord();

//			alert(serialize_for_print(data));

//			alert(proc+'\n'+control.HI+'\n'+data);
			Aux.Form__Submit(proc, control.HI, data);
		}
	},
	Table__CtxMenu__ExportData: function(sender)
	{
		if (sender.parent.size >= 100)
		{
			var confirmMsg = rs.s('table.confirm.export', 'Are you sure you want to export {0} record(s)?\nIt can reduce system performance.', [sender.parent.size]);
			if (!confirm(confirmMsg))
			{
				return;
			}
		}
		Aux.Form__Submit("Table:ExportData", sender.parent.hi);
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

		Aux.Form__Submit("Table:UpdateOrInsertRow", sender.hi, record, sender.getCustomOptionsRecordStruct());
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

		Aux.Form__Submit("Table:UpdateRow", sender.hi, record, sender.getCustomOptionsRecordStruct());
	},
	Record__InsertRow: function(sender)
	{
		var record = sender.getDynRecord();
		
		if(!record)
		{
			return;
		}

//		alert(serialize_for_print(record));

		Aux.Form__Submit("Table:InsertRow", sender.hi, record, sender.getCustomOptionsRecordStruct());
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

		Aux.Form__Submit("Table:UpdateOrInsertRowApply", sender.hi, record, sender.getCustomOptionsRecordStruct());
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

		Aux.Form__Submit("Table:UpdateRowApply", sender.hi, record, sender.getCustomOptionsRecordStruct());
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

		Aux.Form__Submit("Table:InsertRowApply", sender.hi, record, sender.getCustomOptionsRecordStruct());
	},
	Record__InsertChild: function(sender)
	{
		var record = sender.getDynRecord(1);

		if (!record)
		{
			return;
		}

		Aux.Form__Submit("Table:InsertRow", sender.hi, record, sender.getCustomOptionsRecordStruct());
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

		if (sender.size)
		{
			var confirmMsg = rs.s('table.confirm.update', 'Are you sure you want to update {0} record(s)?', [sender.size]);
			if (!confirm(confirmMsg))
			{
				return;
			}
		}

//		alert(serialize_for_print(columns));
//		alert(columns.substring(1000));
//		alert(serialize_for_print({row:record, columns:columns}));
//		return;

		Aux.Form__Submit("Table:GroupUpdateRows", sender.hi, {row:record, columns:columns}, sender.getCustomOptionsRecordStruct());
	},
	Record__SetModeView: function(sender)
	{
		Aux.Form__Submit("Table:SetModeView", sender.hi, null, sender.getCustomOptionsRecordStruct());
	},
	Record__SetModeViewRowset: function(sender)
	{
		Aux.Form__Submit("Table:SetModeViewRowset", sender.hi, null, sender.getCustomOptionsRecordStruct());
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

		Aux.Form__Submit("Procedure:Call", sender.hi, record, sender.getCustomOptionsRecordStruct());
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
		JsHttpRequest.query(
//        	'GET TM.Interface.php',
        	'TM.Interface.php',
        	{action:"Procedure:Call", target:sender.hi, data:record},
            function(result, errors)
            {
//				alert(serialize_for_print({"ERRORS":errors,"RESULT":result}));
				sender.addException(serialize_for_print(result));
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
            true  // do not disable caching
        );
//*/
		return;
        Aux.Form__Submit("Procedure:Call", sender.hi, record, sender.getCustomOptionsRecordStruct());
	},
	Record__CtxMenu__Edit: function(sender)
	{
//		var rowid = sender.parent.record.ROWID;
		var pkrecord = sender.parent.addPKRecord([]);
		
		Aux.Form__Submit("Table:Edit", sender.parent.hi, pkrecord, sender.parent.getCustomOptionsRecordStruct());
	},
	Record__CtxMenu__Delete: function(sender)
	{
		var confirmMsg = rs.s('table.confirm.delete_one', 'Are you sure you want to delete this record?');
		if (!confirm(confirmMsg))
		{
			return;
		}
//		var rowid = sender.parent.record.ROWID;
		var pkrecord = sender.parent.addPKRecord([]);

		Aux.Form__Submit("Table:DeleteRow", sender.parent.hi, pkrecord, sender.parent.getCustomOptionsRecordStruct());
	},
	Statusbar__SetStatusText: function(statusText)
	{
		try
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
		catch (e)
		{
		}
	},
	Statusbar__Logoff: function()
	{
		top.document.location = "Frame.Login.php?logoff";
	},
	Filter__DisableFilter: function(sender)
	{
		Aux.Form__Submit("Table:DisableFilter", null, null);
	},
	Filter__EnableFilter: function(sender)
	{
		Aux.Form__Submit("Table:EnableFilter", null, null);
	},
	Filter__SetFilter: function(sender)
	{
		var data = sender.getDynRecord();

		if(sender.verificationPassed)
		{
			Aux.Form__Submit("Table:SetFilter", null, data);
		}
	},
	Filter__SaveAs: function(control)
	{
		return function(sender)
		{
			sender.dom.saved_filter.getValue();
			var value = sender.try_save_nm || sender.sf_lookup[sender.dom.saved_filter.value] || "";

			var answer = window.prompt(rs.s('filter.enter_name','Enter filter name'), value);

			if (answer == null || answer.trim() == "")
			{
				return;
			}
			else
			{
				answer = answer.trim().substr(0, 100);
			}
			
			sender.try_save_nm = answer;
			
			for (var i in sender.sf_lookup)
			{
				if (sender.sf_lookup[i] == answer)
				{
					if (!window.confirm(rs.s('filter.confirm_overwrite', 'Filter "{0}" exists. Overwrite?', [answer])))
					{
						return;
					}
					else
					{
						break;
					}
				}
			}
			
			var filter_data = {};
			filter_data['filter'] = sender.getFilter();
			filter_data['filter_name'] = answer;
			filter_data['is_public'] = sender.isPublic();
			
			Aux.Form__Submit('Table:SaveFilterAs', null, filter_data);
		}
	},
	Filter__SetSavedFilter: function(control)
	{
		return function(sender)
		{
			sender.dom.saved_filter.getValue();
			
			if (!sender.dom.saved_filter.value)
			{
				return;
			}

			Aux.Form__Submit('Table:SetSavedFilter', null, sender.dom.saved_filter.value);
		}
	},
	
	Arrange__SaveAs: function(control)
	{
		return function(sender)
		{
			//sender.dom.saved_arrange.getValue();
			//var value = sender.try_save_nm || sender.sf_lookup[sender.dom.saved_filter.value] || "";
			
			var answer = window.prompt(rs.s('arrange.enter_name','Enter arrange name'));

			if (answer == null || answer.trim() == "")
			{
				return;
			}
			else
			{
				answer = answer.trim().substr(0, 100);
			}
			
			for (var i in sender.sa_lookup)
			{
				if (sender.sa_lookup[i] == answer)
				{
					if (!window.confirm(rs.s('arrange.confirm_overwrite', 'Arrange "{0}" exists. Overwrite?', [answer])))
					{
						return;
					}
					else
					{
						break;
					}
				}
			}
			
			//var arrange = '';
			//for (var i in sender.set)
			//    arrange
			//filter_data['filter'] = sender.getFilter();
			//filter_data['filter_name'] = answer;
			Aux.Form__AddVar("arrange_nm", answer);
			for (var i=0; i<sender.set.length; i++)
			    Aux.Form__AddVar("columns["+i+"]", sender.set[i]);
			Aux.Form__Submit('Table:SaveArrange', null, answer);
		}
	},
	
	Arrange__SetArrange: function(control)
	{
		return function(sender)
		{
		    sender.dom.saved_arrange.getValue();
		    var arrange_id = sender.dom.saved_arrange.value;
		    
		    for (var i=0; i<sender.set.length; i++)
			Aux.Form__AddVar("columns["+i+"]", sender.set[i]);
		    //Aux.Form__AddVar("action","Table:SetArrange");
		    //document.forms[0].submit();
		    Aux.Form__Submit('Table:SetArrange', null, arrange_id);
		}
	},
	
	Arrange__DeleteSavedArrange: function(control)
	{
		return function(sender)
		{
			sender.dom.saved_arrange.getValue();
			
			var arrange_id = sender.dom.saved_arrange.value;
			
			if (!arrange_id)
			{
				return;
			}

			if (!window.confirm(rs.s('Arrange.confirm_delete', 'Are you sure you want to delete arrange "{0}"?', [sender.sa_lookup[arrange_id] || ''])))
			{
				return;
			}
			
			Aux.Form__Submit('Table:DeleteSavedArrange', null, arrange_id);
		}
	},
	
	Filter__DeleteSavedFilter: function(control)
	{
		return function(sender)
		{
			sender.dom.saved_filter.getValue();
			
			var filter_id = sender.dom.saved_filter.value;
			
			if (!filter_id)
			{
				return;
			}

			if (!window.confirm(rs.s('filter.confirm_delete', 'Are you sure you want to delete filter "{0}"?', [sender.sf_lookup[filter_id] || ''])))
			{
				return;
			}
			
			Aux.Form__Submit('Table:DeleteSavedFilter', null, filter_id);
		}
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
