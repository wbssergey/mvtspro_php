<?php

	require_once('autoload.php');

	class Component
	{
		static $appObjTClassAccordance =
			array(
				'O' 	=> 'Object',
				'F' 	=> 'Form',
				'T' 	=> 'Table',
				'V'		=> 'View',
				'C' 	=> 'Column',
				'TR' 	=> 'Reference',
				'DBPR' 	=> 'DBPReference',
				'UIPR'	=> 'UIPReference',
				'DBP' 	=> 'DBProcedure',
				'UIP' 	=> 'UIProcedure',
				'EFR' 	=> 'EFReference',
				'CG' 	=> 'ColumnsGroup',
				'LINK' 	=> 'Link',
				'W'		=> 'Wizard',
				'WP'	=> 'WizardPage',
				'PC'	=> 'ProcedureConfirm',
				'IB'	=> 'InfoBox',
				'S'		=> 'String',
				'GPR'	=> 'GPReference',
				'SCH'	=> 'StaticChart'
			);

		static $flags =
			array(
				'FLAG_SAVE_PARAMS'				=> 0x001,
				'FLAG_COLLAPSE'					=> 0x001,
				'FLAG_COMBOBOX_UNKNOWN_VALUE'	=> 0x001,
				'FLAG_CAN_ADD_CHILD'			=> 0x002,
				'FLAG_OPTIONS_ONE_ON_LINE'		=> 0x002,
				'FLAG_GROUPEDIT_FORBIDDEN' 		=> 0x004,
				'FLAG_PROCEDURE_CALL_AJAX'		=> 0x008,
				'FLAG_ARRANGEBOX_KEEPSORT'		=> 0x010,
				'FLAG_PROCEDURE_NO_RECORD'		=> 0x020,//32
				'FLAG_TABLE_CHANGE_COL_SEQ'		=> 0x040,//64
				'FLAG_TABLE_NO_MENU'			=> 0x080,//128
				'FLAG_TABEDIT_FORBIDDEN'		=> 0x100,//256
				'FLAG_DEFAULT_BUTTON'			=> 0x200,//512
				'FLAG_LIST'						=> 0x400,//1024
				'FLAG_ARRANGEBOX_QSEARCH'		=> 0x800//2048
			);

		const ModeView			= 1;
		const ModeEdit			= 2;
		const ModeAdd			= 4;
		
		const ModeCopyOff		= 1;
		const ModeCopySimple	= 2;
		const ModeCopyChild		= 3;

		const ModeGroupEditOff	= 0;
		const ModeGroupEditOn	= 1;
		
		const ModeCalled		= 2;
		
		public $Attrs;
		public $ChildComponents;
		public $ChildClasses;
		public $sql_params = null;
		
		public function get_object_info(&$p_ds, &$p_user_id, &$p_user_params, &$p_obj_struct)
		{
			$p_ds = Application::ds($this->data_source);
			$main_ds = Application::ds();
			$p_user_id = $_SESSION['user_id'];
			$p_user_params = DataSourceManager::$user_params;
			
			if (is_array($this->sql_params))
			{
				$p_user_params = array_merge($p_user_params, $this->sql_params);
			}
			
			$this->get_object_struct_from_self($p_obj_struct);
		}

		public function get_object_struct_from_self(&$p_obj_struct)
		{
			$p_obj_struct[] = array
			(
				'obj_hi' 				=> $this->OBJ_HI,
				'gui_hi' 				=> $this->HI,
				'obj_nm' 				=> $this->NAME,
				'obj_t' 				=> $this->TYPE,
				'data_type' 			=> $this->DATATYPE,
				'represent' 			=> $this->REPRESENT,
				'param' 				=> $this->PARAM,
				'lookup_hi' 			=> $this->LOOKUPHI,
				'lookup_select' 		=> $this->LOOKUPSELECT,
				'pk'					=> $this->PK,
				'data_mask'				=> $this->DATAMASK,
				'not_null'				=> $this->NOT_NULL,
				'initial_value'			=> $this->INITIALVALUE,
				'style'					=> $this->STYLE,
				'action'				=> $this->ACTION,
				'display_mask'			=> $this->DISPLAYMASK,
				'title'					=> $this->TITLE,
				'tooltip'				=> $this->HINT,
				'ctl_type' 				=> $this->CONTROLTYPE,
				'data_source'			=> $this->DATA_SOURCE,
				'args'					=> $this->ARGS,
				'filter'				=> $this->FILTER,
				'reference'				=> $this->REFERENCE,
				"gvr_pattern"			=> $this->VERIFY_REGEXP,
				"gvr_min_val"			=> $this->VERIFY_MIN_VAL,
				"gvr_max_val"			=> $this->VERIFY_MAX_VAL,
				"gvr_min_val_exclude"	=> $this->VERIFY_MIN_VAL_EXCLUDE,
				"gvr_max_val_exclude"	=> $this->VERIFY_MAX_VAL_EXCLUDE,
				"gvr_delimiter"			=> $this->VERIFY_DATA_DELIMITER,
				"gvr_verify_desc"		=> $this->VERIFY_DESC,
				"gvr_max_len"			=> $this->VERIFY_MAX_LEN,
				"gvr_min_len"			=> $this->VERIFY_MIN_LEN,
				"gvr_max_list_len"		=> $this->VERIFY_MAX_LIST_LEN,
				"hooks"					=> $this->HOOKS,
				'module_name'			=> $this->MODULE_NAME,
				'module_enabled'		=> $this->MODULE_ENABLED,
				'select_value'			=> $this->SELECT_VALUE,
				'filter_value'			=> $this->FILTER_VALUE,
				'insert_value'			=> $this->INSERT_VALUE,
				'update_value'			=> $this->UPDATE_VALUE,
				'transform'				=> $this->TRANSFORM,
				'export_value'			=> $this->EXPORT_VALUE,
				'sort'					=> $this->SORT,
				'style_select'			=> $this->STYLE_SELECT,
				'verify_hi'				=> $this->VERIFY_HI,
				'flags'					=> $this->FLAGS_SET,
				'relations'				=> $this->RELATIONS
			);
			
			if(!empty($this->ChildComponents))
			{
				foreach($this->ChildComponents as &$c)
				{

					$c->get_object_struct_from_self($p_obj_struct);
				}
			}
		}
		
		public function __get($nm)
		{
			return $this->Attrs[strtoupper($nm)];
		}
		
		public function __construct($attrs, $parent=null)
		{
			$this->Parent = $parent instanceof Component ? $parent : null;
			
			Component::ActivateWindow();
			
			// Hooks
			$this->hooks = self::ParseHooks($attrs['hooks']);

			// Set attributes
			$this->Attrs = array
			(
				'OBJ_HI'			=> $attrs['obj_hi'],
				'HI'				=> $attrs['gui_hi'],
				'NAME'				=> $attrs['obj_nm'],
				'TYPE'				=> $attrs['obj_t'],
				'DATATYPE'			=> $attrs['data_type'],
				'REPRESENT'			=> $attrs['represent'],
				'PARAM'				=> $attrs['param'],
				'LOOKUPHI'			=> $attrs['lookup_hi'],
				'LOOKUPSELECT'		=> $attrs['lookup_select'],
				'LOOKUPPARAM'		=> $attrs['lookup_param'],
				'PK'				=> $attrs['pk'],
				'DATAMASK'			=> $attrs['data_mask'],
				'NOT_NULL'			=> $attrs['not_null'],
				'INITIALVALUE'		=> $attrs['initial_value'],
				'STYLE'				=> $attrs['style'],
				'ACTION'			=> $attrs['action'],
				'DISPLAYMASK'		=> $attrs['display_mask'],
				'TITLE'				=> $attrs['title'],
				'HINT'				=> $attrs['tooltip'],
				'CONTROLTYPE'		=> $attrs['ctl_type'],
				'COMPUTED'			=> !empty($attrs['select_value']),
				'CANSELECT'			=> (0x01 & $attrs['action']) != 0,
				'CANUPDATE'			=> (0x02 & $attrs['action']) != 0,
				'CANINSERT'			=> (0x04 & $attrs['action']) != 0,
				'CANDELETE'			=> (0x08 & $attrs['action']) != 0,
				'CANEXECUTE'		=> (0x16 & $attrs['action']) != 0,
				'DATA_SOURCE'		=> $attrs['data_source'],
				'ARGS'				=> $attrs['args'],
				'FILTER'			=> $attrs['filter'],
				'REFERENCE'			=> $attrs['reference'],
				"VERIFY_REGEXP"		=> $attrs["gvr_pattern"],
				"TRANSFORM_REGEXP"	=> $attrs["gvr_transform_pattern"],
				"VERIFY_MIN_VAL"	=> $attrs["gvr_min_val"],
				"VERIFY_MAX_VAL"	=> $attrs["gvr_max_val"],
				"VERIFY_MIN_VAL_EXCLUDE"	=> $attrs["gvr_min_val_exclude"],
				"VERIFY_MAX_VAL_EXCLUDE"	=> $attrs["gvr_max_val_exclude"],
				"VERIFY_DATA_DELIMITER"		=> $attrs["gvr_delimiter"],
				"VERIFY_DESC"		=> $attrs["gvr_verify_desc"],
				"VERIFY_MIN_LEN"	=> $attrs["gvr_min_len"],
				"VERIFY_MAX_LEN"	=> $attrs["gvr_max_len"],
				"VERIFY_MAX_LIST_LEN"	=> $attrs["gvr_max_list_len"],
				"HOOKS"				=> $attrs["hooks"],
				
				//Values for virt. objects
				'SELECT_VALUE'		=> $attrs['select_value'],
				'FILTER_VALUE'		=> $attrs['filter_value'],
				'INSERT_VALUE'		=> $attrs['insert_value'],
				'UPDATE_VALUE'		=> $attrs['update_value'],
				'TRANSFORM'			=> $attrs['transform'],
				'EXPORT_VALUE'		=> $attrs['export_value'],
				'SORT'				=> $attrs['sort'],
				'STYLE_SELECT'		=> $attrs['style_select'],
				'VERIFY_HI'			=> $attrs['verify_hi'],
				'FLAGS_SET'			=> $attrs['flags'],
				'MODULE_NAME'		=> $attrs['module_name'],
				'MODULE_ENABLED'	=> $attrs['module_enabled'],
				'RELATIONS'			=> $attrs['relations']
			);

			foreach (self::$flags as $flag => $bit)
			{
				$this->Attrs[$flag] = ($bit & $attrs["flags"]) != 0;
			}
		}

		public static function &ParseHooks($hooks_text)
		{
			$hooks = array();
			$lines = explode("\n", $hooks_text);
			
			foreach ($lines as $line)
			{
				list($hook, $func) = explode('=', $line, 2);
				$hook = trim($hook);
				if (!empty($hook))
				{
					$hooks[$hook] = trim($func);
				}
			}
			
			return $hooks;
		}

		public final static function &Create($HI, $args=null)
		{
			$main_ds = Application::ds();
			
        Application::wbsbreak("CREATE by guihi",$HI,0,'');
			$tempHI = $HI;
			do
			{
				$p_obj_struct = $main_ds->find_gui_object($tempHI);
                                  Application::wbsbreak("p_obj_struct2",'p_obj_struct',0,'');
				if(empty($p_obj_struct))
				{
					$tempHI = GUIUtils::get_parent_hi($tempHI);
                                  Application::wbsbreak("temphi",$temphi,0,'');
				}
			}
        //Application::wbsbreak("p_obj_struct1","p_obj_struct",0,'');
			while(empty($p_obj_struct) && $tempHI);
			$p_obj_struct = $main_ds->get_gui_obj_struct($tempHI);
        Application::wbsbreak("p_obj_struct@",$p_obj_struct,0,'a');

			if ($args !== null)
			{
				foreach ($p_obj_struct as &$struct)
				{
					$struct['args'] = $args;
				}
			}

			$obj = self::CreateFromStruct($p_obj_struct);

			if(!$obj)
			{
				//return null;
				throw new Exception('Non-existent object: '.$HI, 1);
			}

			$obj->GetChildFromObjStruct($HI);
			return $obj->GetChildFromObjStruct($HI);
		}
		protected final static function &CreateFromStruct(&$struct)
		{
			$parents_stack = array(null);
			$current_parent = null;
		//if($struct[0]['obj_t']!=='F') {	
                  //    };
			//Application::wbsbreak("kzhis",$struct,0,'a');
			$component = self::CreateFromLine($struct[0], null);
			              $kzhi=$struct[0]["gui_hi"];
        Application::wbsbreak("kzhi",$kzhi,0,'');
			$GLOBALS['cfg']['wbs']['usertype']='?';
			$GLOBALS['cfg']['wbs']['gwtype']='?';
			if ( substr($kzhi,0,8)==='02.22001') $GLOBALS['cfg']['wbs']['usertype']='t';
			if ( substr($kzhi,0,8)==='02.22003') $GLOBALS['cfg']['wbs']['usertype']='v';
			if ( substr($kzhi,0,8)==='02.22002') $GLOBALS['cfg']['wbs']['usertype']='c';
			if ( substr($kzhi,0,8)==='02.22004') $GLOBALS['cfg']['wbs']['usertype']='d';
			if ( substr($kzhi,0,7)==='02.2209') $GLOBALS['cfg']['wbs']['rights']='r';
			if ( substr($kzhi,0,7)==='02.2214') $GLOBALS['cfg']['wbs']['rights']='r';
				
		    if ($GLOBALS['cfg']['wbs']['usertype']!=='?') {
			$GLOBALS['cfg']['wbs']['gwtype']='e';
			if ( substr($kzhi,0,8)==='02.22004') $GLOBALS['cfg']['wbs']['gwtype']='d';
			};
	
			array_unshift($parents_stack, &$component);
			
			for ($i = 1; $i < count($struct); $i++)
			{
				$line = $struct[$i];
					//if($i === $kz ) {
				//}
		//		$jj=0;
		
				while ($parents_stack[0] != null && GUIUtils::get_parent_hi($line["gui_hi"]) != $parents_stack[0]->HI)
				{
					//		$jj=$jj+1;
		
					$accomplished = array_shift($parents_stack);
						//	if ($i===$kz) {
				//	};
			
					if (false !== $accomplished)
					{
						$init_hook = $accomplished->hooks['init'];
						if (!empty($init_hook))
						{
							call_user_func($init_hook, $accomplished);
						}
						$accomplished->Finalize();
					}
				}

				if ($parents_stack[0] == null)
				{
        Application::wbsbreak("parentstacknull",'z',0,'');
                                               
					$error = array('app_error_code' => "APP_ER_INTERNAL_ERROR");
					throw new GUIException (array($error));
				}
				else
				{
					unset($child);
					$child = self::CreateFromLine($line, $parents_stack[0]);
					if ($child)
					{
						$parents_stack[0]->Add($child);
						array_unshift($parents_stack, &$child);
					}
				}
			}

			while ($parents_stack[0] != null)
			{
				$accomplished = array_shift($parents_stack);
				if (false !== $accomplished)
				{
					$init_hook = $accomplished->hooks['init'];
					if (!empty($init_hook))
					{
						call_user_func($init_hook, $accomplished);
					}
					
					$accomplished->Finalize();
				}
			}


			return $component;
		}
		
		protected final static function &CreateFromLine(&$line, $parent=null)
		{
			$attrs = array();
			$attrs = $line;
			$component = self::Factory(self::$appObjTClassAccordance[$attrs["obj_t"]], $attrs, $parent);
			return $component;
		}
		public final static function Factory($class, $attrs, $parent=null)
		{
			switch ($class)
			{
				case 'Object':
				{
					$class = $attrs['param'];
				}
				case 'Form':
				case 'Table':
				case 'View':
				case 'Column':
				case 'Reference':
				case 'DBPReference':
				case 'UIPReference':
				case 'GPReference':
				case 'DBProcedure':
				case 'UIProcedure':
				case 'EFReference':
				case 'ColumnsGroup':
				case 'Link':
				case 'Wizard':
				case 'WizardPage':
				case 'ProcedureConfirm':
				case 'InfoBox':
				case 'String':
				case 'StaticChart':
				{
					if (class_exists($class))
					{
						return new $class($attrs, $parent);
					}
				}
				default:
				{
					return false;
				}
			}
		}

		public function Add(Component &$c)
		{
			$this->ChildComponents[] = &$c;
			$this->ChildClasses[get_class($c)][$c->Name] = &$c;
			$c->Parent = $this;
		}

		public function GetOffspringsClass($class, $list = array(), $parentlist = array())
		{
			foreach ($this->ChildComponents as $child)
			{
				if (get_class($child) == $class)
				{
					$list[$child->Name] = $child;
				}
				if ($child instanceof Component && (count($parentlist) == 0 || in_array(get_class($child), $parentlist)))
				{
					$child->GetOffspringsClass($class, &$list, &$parentlist);
				}
			}

			return $list;
		}

		public function GetChildByName($obj_nm, $class=null, $recursive_level=false, $recursive_classes=false)
		{
			foreach ($this->ChildComponents as $child)
			{
				if (($child->Name == $obj_nm) && (is_null($class) or $child instanceof $class))
				{
					return $child;
				}
			}
			if ($recursive_level)
			{
				foreach ($this->ChildComponents as $child)
				{
					if (!$child->ChildComponents || ($recursive_classes && !in_array(get_class($child),$recursive_classes))) 
					{
						continue;
					}
					
					$child_r = $child->GetChildByName($obj_nm, $class, $recursive_level-1, $recursive_classes);
					if ($child_r !== null)
					{
						return $child_r;
					}
				}
			}
			return null;
		}
		
		public function GetChildFromObjStruct($HI)
		{	
			if($this->HI==$HI)
			{
				return $this;
			}
			
			foreach($this->ChildComponents as &$child)
			{
				$obj = $child->GetChildFromObjStruct($HI);
				if($obj)
				{
					return $obj;
				}
			}
			return null;
		}
		
		public static function ChangeStatusText($newStatusText = '')
		{
			$currStatusText = $_SESSION['STATUS_TEXT'];
			
			Session::Open();
			
			$_SESSION['STATUS_TEXT'] = $newStatusText;
			
			Session::Close();
			
			return $currStatusText;
		}

		public static function &GetObjectSession($HI, $use_window = true)
		{
			if ($use_window && isset($GLOBALS['window_id']))
			{
				$sess_objects = &$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'];
			}
			else
			{
				$sess_objects = &$_SESSION['OBJECTS'];
			}

			if (!isset($sess_objects[$HI]))
			{
				$sess_objects[$HI] = array();
			}

			return $sess_objects[$HI];
		}
        
		public static function &GetObjectSessionReadOnly($HI, $use_window = true)
		{
			if ($use_window && isset($GLOBALS['window_id']))
			{
				$sess_objects = &$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'];
			}
			else
			{
				$sess_objects = &$_SESSION['OBJECTS'];
			}

			return isset($sess_objects[$HI]) ? $sess_objects[$HI] : array();
		}
		
		public static function ClearObjectSession($HI)
		{
			Session::Open();

			$len_hi = strlen($HI);
			
			$sess_objects = &$_SESSION['OBJECTS'];
			$objects = array_keys($sess_objects);

			foreach ($objects as $gui_hi)
			{
				if (substr_compare($gui_hi, $HI, 0, $len_hi) == 0)
				{
					unset($sess_objects[$gui_hi]);
				}
			}
			
			if (isset($GLOBALS['window_id']))
			{
				$sess_objects = &$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'];
				$objects = array_keys($sess_objects);
				foreach ($objects as $gui_hi)
				{
					if (substr_compare($gui_hi, $HI, 0, $len_hi) == 0)
					{
						unset($sess_objects[$gui_hi]);
					}
				}
			}

			Session::Close();
			
			Application::save_user_session();
		}
		
		public static function SaveObjectCustomOption($HI, $data)
		{
			Session::Open();

			$pattern = "/^$HI(\.\d+)+/";

			foreach ($data as $obj_hi => $obj_info)
			{
				if ($HI == $obj_hi || preg_match($pattern, $obj_hi))
				{
					foreach (Component::$customOptionsEnabled as $key)
					{
						if (array_key_exists($key, $obj_info))
						{
							$_SESSION['OBJECTS'][$obj_hi]['CUSTOM'][$key] = $obj_info[$key];

							if (isset($GLOBALS['window_id']))
							{
								$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'][$obj_hi]['CUSTOM'][$key] = $obj_info[$key];
							}
						}
					}
				}
			}
			
			Session::Close();
		}

		public static function SetMode($HI, $mode)
		{
			Session::Open();

			$_SESSION['OBJECTS'][$HI]['MODE'] = $mode;

			if (isset($GLOBALS['window_id']))
			{
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'][$HI]['MODE'] = $mode;
			}
			
			Session::Close();
		}

		public static function SetCopyMode($HI, $mode)
		{
			Session::Open();
		
			$_SESSION['OBJECTS'][$HI]['COPYMODE'] = $mode;

			if (isset($GLOBALS['window_id']))
			{
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'][$HI]['COPYMODE'] = $mode;
			}
			
			Session::Close();
		}
		public static function SetGroupEditMode($HI, $mode)
		{
			Session::Open();
		
			$_SESSION['OBJECTS'][$HI]['GROUPEDIT'] = $mode;

			if (isset($GLOBALS['window_id']))
			{
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'][$HI]['GROUPEDIT'] = $mode;
			}
			
			Session::Close();
		}
		public static function SetFastGroupEditMode($HI, $mode)
		{
			Session::Open();
		
			$_SESSION['OBJECTS'][$HI]['GROUPEDITFAST'] = $mode;

			if (isset($GLOBALS['window_id']))
			{
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'][$HI]['GROUPEDITFAST'] = $mode;
			}
			
			Session::Close();
		}
		public function CheckRepresent()
		{
			return $this->Represent & $this->Mode;
		}
		public function CheckAction()
		{
			return $this->Action & $this->Mode;
		}
		public function Dump($js_parent)
		{
			include('Component.Dump.inc');
		}
		public function DumpComment()
		{
			include('Component.DumpComment.inc');
		}
		protected function Finalize()
		{
			//From constructor
			Component::ActivateWindow();
			$object_session = &self::GetObjectSession($this->HI);
			$copyMode = $object_session['COPYMODE'];
			$groupEdit = $object_session['GROUPEDIT'];
			
			$error_info = $object_session['ERROR_INFO'];
			if ($error_info !== null)
			{
				Session::open();
				$object_session = &self::GetObjectSession($this->HI);
				unset($object_session['ERROR_INFO']);
				Session::close();
			}
			
			// Get display mode from parent
			if(!is_int($this->Attrs['MODE']))
			{
				$mode = $object_session['MODE'];
				if (is_int($mode))
				{
					$this->Attrs['MODE'] = $mode;
					$childs = $this->GetOffspringsClass('Column', null, array());
					foreach($childs as &$child)
					{
						$child->Attrs['MODE'] = $this->MODE;
						$module = $child->Module_Name;
						if ($module)
						{
							$enabled = $child->module_enabled;
						}
						else
						{
							$enabled = true;
						}
						$child->Attrs['VISIBLE'] = (($child->REPRESENT & $child->Attrs['MODE']) != 0) && $enabled;
					}
					$columsGroup = $this->GetOffspringsClass('ColumnsGroup', null, array());
					foreach($columsGroup as &$child)
					{
						$child->Attrs['MODE'] = $this->MODE;
					}
				}
				else
				{
					$this->Attrs['MODE'] = self::ModeView;
				}
				
				// Many datasources
				if (trim($this->Attrs['DATA_SOURCE']))
				{
					$ds = explode(';', $this->Attrs['DATA_SOURCE']);
					$group = $GLOBALS['cfg']['data_sources'][$ds[0]]['group'];
					if ($group)
					{
						$active_ds = DataSourceManager::get_active_ds($group);
						$this->Attrs['CAN_SELECT'] = $this->Attrs['VISIBLE'] = in_array($active_ds, $ds);
						$this->Attrs['DATA_SOURCE'] = $active_ds;
					}
				}
			}
			
			// Check enable functionality
			$module = $this->Module_Name;
			if ($module)
			{
				$enabled = $this->module_enabled;
			}
			else
			{
				$enabled = true;
			}
			
			//$this->sql_params = Wizard::GetSessionParamsAllParent($this->HI);
			$this->Attrs['VISIBLE'] 	= (($this->REPRESENT & $this->Attrs['MODE']) != 0) && $enabled;
			$this->Attrs['GROUPEDIT']	= $groupEdit;
			$this->Attrs['COPYMODE']	= $copyMode;
			$this->Attrs['ERROR_INFO']	= $error_info;
		}
		public function ActivateWindow()
		{
 			if (isset($GLOBALS['window_id']) && $_SESSION['WINDOWS'][$GLOBALS['window_id']]['activated'] != 1)
 			{
				Session::Open();
			
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['OBJECTS'] = $_SESSION['OBJECTS'];
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['SETTINGS'] = $_SESSION['SETTINGS'];
				$_SESSION['WINDOWS'][$GLOBALS['window_id']]['activated'] = 1;
				
				Session::Close();
 			}
		}
		
		public static function SetErrorInfo($e, $HI = null)
		{
			Session::Open();

			foreach ($e->errors as &$error)
			{
				$object = empty($HI) ? $error['gui_hi'] : $HI;
				$object_session = &self::GetObjectSession($object);
				if (empty($object_session['ERROR_INFO']))
				{
					$object_session['ERROR_INFO'] = array();
				}
	
				$object_session['ERROR_INFO'][] = $error;
			}

			Session::Close();
		}
		
		public function HasErrors()
		{
			$object_session = &self::GetObjectSession($this->HI);
			return !empty($object_session['ERROR_INFO']);
		}

		public function DumpErrors()
		{
			include('Component.DumpErrors.inc');
		}
		
		public static function log(Component $component, $action, $p_row_count, $data_in=null, $filter=null)
		{
			$ds = Application::ds();
			if (!$ds)
			{
				return false;
			}
			
			$gui_log_activity_enable = (bool)$ds->get_gui_config('gui.log.activity.enable');
			$gui_log_activity_enable_select = (bool)$ds->get_gui_config('gui.log.activity.enable_select');
			
			if (!$gui_log_activity_enable)
			{
				return false;
			}
			
			$data = $data_in;
			$p_gui_hi = $component->HI;
			$p_action = $action;

			if (in_array($p_action, array('select_rowset','api_select_rowset')) && !$gui_log_activity_enable_select)
			{
				return true;
			}

			if (is_array($data))
			{
				if ($p_gui_hi == '06.2110.01' && !is_null($data))
				{
					foreach($data as &$v)
					{
						if (array_key_exists('password', $v))
						{
							$v['password'] = '***';
						}
					}
				}
				elseif (substr($p_gui_hi,0,7) == '06.2117' && !is_null($data))
				{
					if (isset($data['password']))
					{
						$data['password'] = '***';
					}
				}
				
				$p_data = print_r($data, true);
			}
			if ($component instanceof View)
			{
				$p_data = array(
					'title' => $component->title,
					'table' => array(
						'hi'    => $component->reference,
						'name'  => $component->name,
					),
				);
				if ($data) $p_data['data'] = $data;
				$p_data = print_r($p_data, true);
			}
			if (is_array($filter))
			{
				$p_filter = print_r($filter, true);
			}

			$ds->log(
				$p_gui_hi,
				$p_action,
				$p_data,
				$p_filter,
				$p_row_count,
				$_SESSION['auth_log_id']
			);
			
			return true;
		}
		public function getStruct(&$struct, &$components)
		{
			foreach($components as &$c)
			{
				if($c instanceof Column)
				{
					if($c->CanSelect && $c->Visible)
					{
						$struct[] = $c->Name;
					}
				}
				if($c instanceof ColumnsGroup)
				{
					$session = &self::GetObjectSession($c->HI, false);
					$group = array(
						"title"		=> $c->Title,
						"controls"	=> array(),
						"show"		=> $session['show'],
						"hi"		=> $c->HI
					);
					$this->getStruct($group["controls"], $c->ChildComponents);
					$struct[] = $group;
				}
			}
		}
		
		public function replaceHi($old_hi, $new_hi)
		{
			$this->Attrs['HI'] = str_replace($old_hi, $new_hi, $this->HI);
			foreach($this->ChildComponents as &$child)
			{
				$child->replaceHi($old_hi, $new_hi);
			}
		}
		
		public function &getRelations()
		{
			$relations = Application::ds()->get_relations($this->RELATIONS);
			$formed = array();
			foreach($relations as &$line)
			{
				$formed[$line['source']][$line['event']][] = array(
					'targets' 		=> $line['targets'],
					'action'		=> $line['action'],
					'param'			=> $line['param'],
					'conditions'	=> $line['conditions']
				);
			}
			return $formed;
		}
	}
?>
