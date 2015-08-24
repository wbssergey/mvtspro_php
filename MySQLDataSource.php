<?php

	require_once('autoload.php');
	
	class MySQLDataSource extends DataSource
	{
		// PDO

		public $pdo;
		public $remotepdo;
		public $microsoftpdo;
	    public $phpguimanager;
	    	
		private static $filter_callback = array(__CLASS__, 'make_sql_condition');
	
		// Methods
		
		public function get_default_pk()
		{
			return null;
		}

		public function configure($cfg)
		{
			$this->connect($cfg['host'], $cfg['db'], $cfg['user'], $cfg['password']);
			$this->set_charset(empty($cfg['charset']) ? 'utf8' : $cfg['charset']);
			$this->connectmicrosoft($GLOBALS['cfg']['datasources']['microsoft']['host'], $GLOBALS['cfg']['datasources']['microsoft']['db'], $GLOBALS['cfg']['datasources']['microsoft']['user'], $GLOBALS['cfg']['datasources']['microsoft']['password']);
			$this->phpguimanager="phpguimanagerDB3";
			
		}
		
		public function connect($host, $db, $user = null, $password = null)
		{
			$this->pdo = new PDO('mysql:host='.$host.';dbname='.$db, $user, $password, array(PDO::ATTR_PERSISTENT => true, PDO::MYSQL_ATTR_LOCAL_INFILE => true));
			//$this->pdo->setAttribute(PDO::ATTR_TIMEOUT, 5);
			$this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$this->pdo->setAttribute(PDO::ATTR_AUTOCOMMIT, true);
			$this->pdo->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_EMPTY_STRING);
			$this->pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, true);
			$this->pdo->setAttribute(PDO::ATTR_CASE, PDO::CASE_NATURAL);
			$this->pdo->setAttribute(PDO::ATTR_PREFETCH, 100);
			$this->pdo->exec('set sql_mode = "TRADITIONAL"');
			$this->pdo->exec('set group_concat_max_len	= 1000000');
			$this->username = $user;
			$this->password = $password;
			$this->database = $db;
			
			
		}
		

		public function connectremote($host, $db, $user = null, $password = null)
		{
			$this->remotepdo = new PDO('mysql:host='.$host.';dbname='.$db, $user, $password, array(PDO::ATTR_PERSISTENT => true, PDO::MYSQL_ATTR_LOCAL_INFILE => true));
			//$this->remotepdo->setAttribute(PDO::ATTR_TIMEOUT, 5);
			$this->remotepdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$this->remotepdo->setAttribute(PDO::ATTR_AUTOCOMMIT, true);
			$this->remotepdo->setAttribute(PDO::ATTR_ORACLE_NULLS, PDO::NULL_EMPTY_STRING);
			$this->remotepdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, true);
			$this->remotepdo->setAttribute(PDO::ATTR_CASE, PDO::CASE_NATURAL);
			$this->remotepdo->setAttribute(PDO::ATTR_PREFETCH, 100);
			$this->remotepdo->exec('set sql_mode = "TRADITIONAL"');
			$this->remotepdo->exec('set group_concat_max_len	= 1000000');
		/////	$this->username = $user;
		//	$this->password = $password;
		//	$this->database = $db;
				
				
		}
		
		public function connectmicrosoft($host, $db, $user = null, $password = null)
		{
			
			try {
				$hostname = "72.15.129.19";            //host
				$dbname = "wiztel";            //db name
				$username = "##";            // username like 'sa'
				$pw = "####";                // password for the user
				$this->microsoftpdo = new PDO ("dblib:host=$hostname;dbname=$dbname","$username","$pw");
				//,array(PDO::ATTR_PERSISTENT => true));
			//	$this->microsoftpdo->setAttribute(PDO::ATTR_PERSISTENT,true);
					
			} catch (PDOException $e) {
				echo "Failed to get MSSQL DB handle: " . $e->getMessage() . "\n";
				exit();
			}
		}
		
		public function set_charset($charset)
		{
			$this->pdo->exec('set names '.$charset);
		}

		public function get_warnings()
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare('show warnings');
			}
			$stmt->execute();
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		}
		
		public function &get_error_info(PDOException &$e, $gui_hi = null)
		{
			$error_info = array();
			$error_info['gui_hi'] = $gui_hi;
			$error_info['namespace'] = 'mysql';
			$error_info['sqlstate'] = $e->errorInfo[0];
			$error_info['code'] = $e->errorInfo[1];
			$error_info['message'] = isset($e->errorInfo[2]) ? $e->errorInfo[2] : $e->getMessage();
			
			// Handling user-defined (non-standard) application errors
			
			if ($error_info['code'] == 1048)
			{
				if (ereg_replace('^.*\'(.*)\'.*$', '\\1', $error_info['message']) == 'mysql_app_error')
				{
					$stmt = $this->pdo->query('select @error_code, @error_table, @error_data');
					$row = $stmt->fetch(PDO::FETCH_NUM);
					$stmt->closeCursor();
					$error_info['app_error_code'] = $row[0];
					$error_info['app_error_table'] = $row[1];
					$error_info['app_error_data'] = $row[2];
				}
			}
			return $error_info;
		}
		
		public static function quote($value)
		{
			if ($value === null)
			{
				return 'null';
			}
			return "'".strtr($value, array("'" => "\\'", "\\" => "\\\\"))."'";
		}
		
		public static function get_filter_callback()
		{
			return self::$filter_callback;
		}
		
		public static function normalize_sql_params
		(
			array &$p_params = null
		)
		{
			if ($p_params !== null)
			{
				foreach ($p_params as $name => &$value)
				{
					if ($value === '')
					{
						$value = null;
					}
				}
			}
		}
		
		public static function get_select_with_limit($sql, $limit, $offset)
		{
			return $sql."\nlimit ".$limit." offset ".$offset;
		}
		
		public static function make_sql_condition($column, $operator, $value, $filter_value = null)
		{
			$empty_value = ($value === null) || ($value === '');
			$quoted_value = self::quote($value);
			if ($filter_value !== null && $filter_value)
			{
				$quoted_value = DataSource::expand_sql_template($filter_value, $quoted_value);
			}
					
			switch ($operator)
			{
				case '<':
				{
					$cond = $empty_value ? '1=0' : $column.' < '.$quoted_value;
					break;
				}
				case '<=':
				{
					$cond = $empty_value ? $column.' is null' : $column.' <= '.$quoted_value;
					break;
				}
				case '=':
				{
					$cond = $empty_value ? $column.' is null' : $column.' = '.$quoted_value;
					break;
				}
				case '<>':
				{
					$cond = $empty_value ? $column.' is not null' : '('.$column.' <> '.$quoted_value.') or ('.$column.' is null)';
					break;
				}
				case '>=':
				{
					$cond = $empty_value ? '1=1' : $column.' >= '.$quoted_value;
					break;
				}
				case '>':
				{
					$cond = $empty_value ? $column.' is not null' : $column.' > '.$quoted_value;
					break;
				}
				case 'like':
				{
					$cond = $empty_value ? $column.' is null' : $column.' like '.$quoted_value;
					break;
				}
				case 'not like':
				{
					$cond = $empty_value ? $column.' is not null' : '('.$column.' not like '.$quoted_value.') or ('.$column.' is null)';
					break;
				}
				case 'regexp':
				{
					$cond = $empty_value ? '1=1' : $column.' regexp '.$quoted_value;
					break;
				}
				case 'is null':
				{
					$cond = $column.' is null';
					break;
				}
				case 'is not null':
				{
					$cond = $column.' is not null';
					break;
				}
			}
			
			return $cond;
		}

		public function &query
		(
			$p_sql,
			array $p_params = array(),
			$p_fetch_style = PDO::FETCH_ASSOC
		)
		{
			if (!empty(DataSourceManager::$user_params))
			{
				$p_params = array_merge($p_params, DataSourceManager::$user_params);
			}
			$param_names = SQLParser::parse_sql_params($p_sql);
			self::import_sql_params($params, $param_names, $p_params);
			self::normalize_sql_params($params);
			$stmt = $this->pdo->prepare($p_sql);
			$stmt->execute($params);
			return $stmt->fetchAll($p_fetch_style);
		}
		
		public function &call
		(
			$p_procedure_name,
			array $p_params = array()
		)
		{
			$params_sql = array_fill(0, count($p_params), '?');
			$sql = "call ".$p_procedure_name."(".implode(", ", $params_sql).")";
			$stmt = $this->pdo->prepare($sql);
			$i=0;
			foreach ($p_params as $param)
			{
				$i++;
				$stmt->bindParam($i, $param);
			}
			$stmt->execute($p_params);
		}
		
		public function &get_versions()
		{
			static $versions;
			if ($versions === null)
			{
				$rowset = $this->query('select * from version order by product_title');
				$versions = array();
				foreach ($rowset as &$row)
				{
					$versions[$row['product']] = $row;
				}
			}
			return $versions;
		}

		public function get_gui_config
		(
			$p_param_nm
		)
		{
			static $config;
			if ($config === null)
			{
				static $stmt;
				if ($stmt === null)
				{
					$stmt = $this->pdo->prepare(<<<EOS
select
	param_nm, data_type, ifnull(value, default_value)
	from wbs.gui_config
EOS
					);
				}
				
				$stmt->execute();
				$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
				
				$config = array();
				foreach ($rowset as &$row)
				{
					$config[$row[0]] = self::cast($row[2], $row[1]);
				}
			}
			return $config[$p_param_nm];
		}
		
		public function auth
		(
			$p_realm_id,
			$p_login,
			$p_password,
			$p_ip,
			&$p_user_record,
			&$p_auth_log_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select
		u.user_id, u.user_nm, u.lang_id, u.session_dump, a.auth_id, a.realm_id
	from wbs.wbs_gui_user_auth a, wbs.wbs_gui_user u
	where
			a.realm_id = :p_realm_id
		and	a.login = :p_login
		and	a.enable = 1
		and	(a.password = :p_password or (a.password is null and :p_password is null))
		and	(a.ip_allow = :p_ip or a.ip_allow is null)
		and	(a.ip_deny <> :p_ip or a.ip_deny is null)
		and	u.user_id = a.user_id
		and	u.enable = 1
EOS
				);
			}
			
			$crypt = $this->get_gui_config('gui.crypt');
			switch ($crypt)
			{
				case 'sha1':
				{
					$crypt_password = sha1($p_password);
					break;
				}
				default:
				{
					$crypt_password = md5($p_password);
				}
			}

			$stmt->bindValue(':p_realm_id', $p_realm_id);
			$stmt->bindValue(':p_login', $p_login);
			$stmt->bindValue(':p_password', $p_password !== '' ? $crypt_password : null);
			$stmt->bindValue(':p_ip', $p_ip);
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);

			switch (count($rowset))
			{
				case 0:
				{
					$result = 1;
					break;
				}
				case 1:
				{
					$p_user_record = $rowset[0];
					$result = 0;
					break;
				}
				default:
				{
					$result = 2;
					break;
				}
			}
			
			$p_auth_log_id = $this->auth_log(
				$user_id = ($p_user_record ? $p_user_record['user_id'] : null),
				$p_ip,
				$p_login,
				$p_realm_id,
				$successful = ($result == 0)
			);
			
			return $result;
		}

		public function check_reauth_user($p_auth_id)
		{
			static $stmt;
			if ($stmt === null)
			{
			$stmt = $this->pdo->prepare(<<<EOS
select
    auth_id
from
    wbs.wbs_gui_user_auth
where
    auth_id=:p_auth_id
and reauth = 1
EOS
				);
			}
			$stmt->bindValue(':p_auth_id', $p_auth_id);

			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);

			switch (count($rowset))
			{
				case 0:
				{
					$result = 0;
					break;
				}
				case 1:
				{
					$sql = "
update wbs.wbs_gui_user_auth
set reauth = 0
where
	auth_id='$p_auth_id'
";
					$this->pdo->exec($sql);
					$result = 1;
					break;
				}
				default:
				{
					$result = 2;
					break;
				}
			}
			return $result;
		}

		public function auth_log
		(
			$p_user_id,
			$p_ip_address,
			$p_login,
			$p_realm_id,
			$p_successful
		)
		{
			$gui_log_auth_enable = (bool) $this->get_gui_config('gui.log.auth.enable');
			
			if (!$gui_log_auth_enable)
			{
				return null;
			}

			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
insert into wbs.gui_auth_log (user_id, realm_id, login, ip_address, successful)
	values (:p_user_id, :p_realm_id, :p_login, :p_ip_address, :p_successful)
EOS
				);
			}
			if (!$p_user_id && $p_login)
			{
				// detect user_id from login
				$sql = "select user_id from wbs.wbs_gui_user_auth where login = :p_login and realm_id = :p_realm_id limit 1";
				list($p_user_id) = reset($this->query($sql, array('p_login' => $p_login, 'p_realm_id' => $p_realm_id), PDO::FETCH_NUM));
			}
			$stmt->bindValue(':p_user_id', $p_user_id);
			$stmt->bindValue(':p_realm_id', $p_realm_id);
			$stmt->bindValue(':p_login', $p_login);
			$stmt->bindValue(':p_ip_address', $p_ip_address);
			$stmt->bindValue(':p_successful', $p_successful ? 1 : 0);
			$stmt->execute();
			return $this->pdo->lastInsertId();
		}

		public function change_lang_eng(array $arr)
		{

			$one_elem = $arr[1];
			$sql = "SELECT obj_hi FROM wbs.wbs_gui_string WHERE (string = :one_elem) && (lang_id = 2)";
			$stmt=$this->pdo->prepare($sql);
			$stmt->bindValue(':one_elem', $one_elem);
			$stmt->execute();
			$row = $stmt->fetchAll(PDO::FETCH_NUM);
			$nrow = $arr;
			if (count(row)>0)
			{
				for ($i=0; $i<count($arr); $i++)
				{
				$sql = "SELECT string FROM wbs.wbs_gui_string WHERE ((obj_hi = (SELECT obj_hi FROM wbs.wbs_gui_string WHERE string = '$arr[$i]' LIMIT 1))) && lang_id = 1";
				$stmt=$this->pdo->prepare($sql);
				$stmt->execute();
				$row = $stmt->fetchAll(PDO::FETCH_NUM);
				$nrow[]=$row[0][0];
				}
			}
			return $nrow;
		}
		
        public function check_auth_enabled($p_auth_id,$p_user_id,$p_ip_address,$p_realm_id)
        {
            static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select
    ua.auth_id,
    ua.user_id,
    ua.realm_id,
    ua.ip_allow,
    ua.ip_deny,
    ua.enable
from 
    wbs.wbs_gui_user_auth ua, wbs.wbs_gui_user u
where
    ua.auth_id=:p_auth_id
    and u.user_id=ua.user_id
    and	(ua.ip_allow = :p_ip_address or ua.ip_allow is null)
    and	(ua.ip_deny <> :p_ip_address or ua.ip_deny is null)
    and (ua.realm_id = :p_realm_id)
    and ua.enable=1
    and u.enable=1
EOS
				);
            }
			$stmt->bindValue(':p_auth_id', $p_auth_id);
			$stmt->bindValue(':p_user_id', $p_user_id);
			$stmt->bindValue(':p_ip_address', $p_ip_address);
			$stmt->bindValue(':p_realm_id', $p_realm_id);
            $stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);
			switch (count($rowset))
			{
				case 0:
				{
					$result = 1;
					break;
				}
				case 1:
				{
					
					$p_user_record = $rowset[0];
					$result = 0;
					break;
				}
				default:
				{
					$result = 2;
					break;
				}
            }
            return $result;
        }
            
	        public	function &getpartitions
                (
                   $sql
                )
                {
                	        static $stmt;
                            try 
                            {
                            if($stmt === null )
                            {
                            	$this->microsoftpdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                            	$sqla="SET ANSI_WARNINGS ON";
                            	$stmt = $this->microsoftpdo->prepare($sqla);
                            	$stmt->execute();
                            		
                            	$sqla="SET ANSI_NULLS ON";
                            	$stmt = $this->microsoftpdo->prepare($sqla);
                            	$stmt->execute();
                            		
                                 $stmt = $this->microsoftpdo->prepare($sql);
                            } 
                        //Application::wbsbreak("getpartitionsds",$sql,0,'');
                            $stmt->execute();
                        //Application::wbsbreak("getpartitionsds2",$stmt->fetchAll(PDO::FETCH_NUM),0,'a');
                            } catch (PDOException $e) {
                            	Application::wbsbreak("getpartitionsdserror",$e,0,'a');
                            	exit();
                            }
                            //Application::wbsbreak("getpartitionsdsret",$sql,0,'');
                            
                            return $stmt->fetchAll(PDO::FETCH_NUM);
                }
 
                public	function &getlookup
                (
                		$sql
                )
                {
                	static $stmt;
                	try
                	{
                		if($stmt === null )
                		{
                			$this->microsoftpdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                			$sqla="SET ANSI_WARNINGS ON";
                			$stmt = $this->microsoftpdo->prepare($sqla);
                			$stmt->execute();
                
                			$sqla="SET ANSI_NULLS ON";
                			$stmt = $this->microsoftpdo->prepare($sqla);
                			$stmt->execute();
                
                			$stmt = $this->microsoftpdo->prepare($sql);
                		}
                		//Application::wbsbreak("getpartitionsds",$sql,0,'');
                		$stmt->execute();
                		//Application::wbsbreak("getpartitionsds2",$stmt->fetchAll(PDO::FETCH_NUM),0,'a');
                	} catch (PDOException $e) {
                		Application::wbsbreak("getlookuperror",$e,0,'a');
                		exit();
                	}
                	//Application::wbsbreak("getlookup641",$sql,0,'');
                	//Application::wbsbreak("getlookup641c",$stmt->fetchAll(PDO::FETCH_ASSOC),0,'a');
                	
                	return $stmt->fetchAll(PDO::FETCH_ASSOC);
                }
                
		public function &get_user_params
		(
			$p_user_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select
		user_id		as user_user_id,
		user_nm		as user_user_nm,
		role_id		as user_role_id,
		domain_hi	as user_domain_hi,
		lang_id		as user_lang_id,
        userunixname     as user_wbs_nm      
	from wbs.wbs_gui_user
	where user_id = :p_user_id
EOS
				);
			}

			$stmt->bindValue(':p_user_id', $p_user_id);
			$stmt->execute();
			return $stmt->fetch(PDO::FETCH_ASSOC);
		}

		public function save_user_session
		(
			$p_user_id,
			&$p_session
		)
		{
			static $stmt;
                        Application::wbsbreak("SAVE user_enter@","--user-".$p_user_id,0,'');
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
update wbs.wbs_gui_user
	set session_dump = :p_session_dump
	where user_id = :p_user_id
EOS
				);
			}
			$stmt->bindValue(':p_user_id', $p_user_id);
			$stmt->bindValue(':p_session_dump', serialize($p_session));
			$stmt->execute();
            self::save_wbs_session($p_user_id);

		}
	
  public function save_wbs_session
                (
                        $p_user_id
                )
                {
                        //static $stmt;
          //   Application::wbsbreak("SAVE wbs_enter","--request-".$_REQUEST['object'],0,'');
           //  Application::wbsbreak("SAVE wbs_enter","--session-".$_SESSION['wbseqdestination'],0,'');
              
             
                        if ($stmt === null)
                        {


$wbssql="";
$wbssql=$wbssql."update wbs.wbs_session set lang_id=lang_id ";

if(isset($_REQUEST['object'])&&isset($_REQUEST['wbstest']) ){
	Application::wbsbreak("SAVE object@","--request-".$_REQUEST['object'].'-1-'.$_REQUEST['mwbseqdestination'].'-1-'.$_REQUEST['window_id'],0,'');
	
	$_SESSION['wbseqdestination']=$_REQUEST['wbseqdestination'];
	$_SESSION['wbseqdestinationtype']=$_REQUEST['wbseqdestinationtype'];
	$_SESSION['wbseqmobilecarrier']=$_REQUEST['wbseqmobilecarrier'];
	$_SESSION['wbseqdescription']=$_REQUEST['wbseqdescription'];
	$_SESSION['wbsdpdestination']=$_REQUEST['wbsdpdestination'];
	$_SESSION['wbsdpdestinationtype']=$_REQUEST['wbsdpdestinationtype'];
	$_SESSION['wbsdpmobilecarrier']=$_REQUEST['wbsdpmobilecarrier'];
	$_SESSION['wbsdpdescription']=$_REQUEST['wbsdpdescription'];
	$_SESSION['wbseqcustomer']=$_REQUEST['wbseqcustomer'];
	$_SESSION['wbsdpcustomer']=$_REQUEST['wbsdpcustomer'];
	$_SESSION['wbseqvendor']=$_REQUEST['wbseqvendor'];
        $_SESSION['wbscustomerpart']= $_REQUEST['wbscustomerpart'];
        $_SESSION['wbsdpcustomerpart']= $_REQUEST['wbsdpcustomerpart'];
        $_SESSION['wbsvendorpart']= $_REQUEST['wbsvendorpart'];
		
	$_SESSION['mwbseqdestination']=$_REQUEST['wbseqdestination'];
	$_SESSION['mwbseqdestinationtype']=$_REQUEST['wbseqdestinationtype'];
	$_SESSION['mwbseqmobilecarrier']=$_REQUEST['wbseqmobilecarrier'];
	$_SESSION['mwbseqdescription']=$_REQUEST['wbseqdescription'];
	

	$_SESSION['showassignedeqc']=$_REQUEST['showassignedeqc'];
	$_SESSION['showassignedeqv']=$_REQUEST['showassignedeqv'];
	$_SESSION['showassigneddp']=$_REQUEST['showassigneddp'];
	
	
}

if (!isset($_SESSION['showassignedeqc'])) $_SESSION['showassignedeqc']='';
if (!isset($_SESSION['showassignedeqv'])) $_SESSION['showassignedv']='';

if (!isset($_SESSION['showassigneddp'])) $_SESSION['showassigneddp']='';


if (!isset($_SESSION['wbseqdestination']))    Application::wbsbreak("SAVE wbs_enter@","session not set",0,'');
          
if (!isset($_SESSION['wbseqdestination'])) $_SESSION['wbseqdestination']='0';
if (!isset($_SESSION['wbseqdestinationtype'])) $_SESSION['wbseqdestinationtype']='0';
if (!isset($_SESSION['wbseqmobilecarrier'])) $_SESSION['wbseqmobilecarrier']='0';
if (!isset($_SESSION['wbseqdescription'])) $_SESSION['wbseqdescription']='0';

if (!isset($_SESSION['mwbseqdestination'])) $_SESSION['mwbseqdestination']='0';
if (!isset($_SESSION['mwbseqdestinationtype'])) $_SESSION['mwbseqdestinationtype']='0';
if (!isset($_SESSION['mwbseqmobilecarrier'])) $_SESSION['mwbseqmobilecarrier']='0';
if (!isset($_SESSION['mwbseqdescription'])) $_SESSION['mwbseqdescription']='0';

if (!isset($_SESSION['wbseqcustomer'])) $_SESSION['wbseqcustomer']='0';
if (!isset($_SESSION['wbseqvendor'])) $_SESSION['wbseqvendor']='0';
if (!isset($_SESSION['wbsdpcustomer'])) $_SESSION['wbsdpcustomer']='0';

if (!isset($_SESSION['wbsdpdestination'])) $_SESSION['wbsdpdestination']='0';
if (!isset($_SESSION['wbsdpdestinationtype'])) $_SESSION['wbsdpdestinationtype']='0';
if (!isset($_SESSION['wbsdpmobilecarrier'])) $_SESSION['wbsdpmobilecarrier']='0';
if (!isset($_SESSION['wbsdpdescription'])) $_SESSION['wbsdpdescription']='0';

if (!isset($_SESSION['wbscustomerpart'])) $_SESSION['wbscustomerpart']='0';
if (!isset($_SESSION['wbsdpcustomerpart'])) $_SESSION['wbsdpcustomerpart']='0';
if (!isset($_SESSION['wbsvendorpart'])) $_SESSION['wbsvendorpart']='0';



if (strpos($_SESSION['wbseqdestination'],"select-")) $_SESSION['wbseqdestination']='0';
 
if (strpos($_SESSION['wbseqdestinationtype'],"select-")) $_SESSION['wbseqdestinationtype']='0';
if (strpos($_SESSION['wbseqmobilecarrier'],"select-")) $_SESSION['wbseqmobilecarrier']='0';
if (strpos($_SESSION['wbseqdescription'],"select-")) $_SESSION['wbseqdescription']='0';

if (strpos($_SESSION['mwbseqdestination'],"select-")) $_SESSION['mwbseqdestination']='0';
if (strpos($_SESSION['mwbseqdestinationtype'],"select-")) $_SESSION['mwbseqdestinationtype']='0';
if (strpos($_SESSION['mwbseqmobilecarrier'],"select-")) $_SESSION['mwbseqmobilecarrier']='0';
if (strpos($_SESSION['mwbseqdescription'],"select-")) $_SESSION['mwbseqdescription']='0';

if (strpos($_SESSION['wbseqcustomer'],"select-")) $_SESSION['wbseqcustomer']='0';

if (strpos($_SESSION['wbseqvendor'],"select-")) $_SESSION['wbseqvendor']='0';
if (strpos($_SESSION['wbsdpcustomer'],"select-")) $_SESSION['wbsdpcustomer']='0';

if (strpos($_SESSION['wbsdpdestination'],"select-")) $_SESSION['wbsdpdestination']='0';
if (strpos($_SESSION['wbsdpdestinationtype'],"select-")) $_SESSION['wbsdpdestinationtype']='0';
if (strpos($_SESSION['wbsdpmobilecarrier'],"select-")) $_SESSION['wbsdpmobilecarrier']='0';
if (strpos($_SESSION['wbsdpdescription'],"select-")) $_SESSION['wbsdpdescription']='0';

if (strpos($_SESSION['wbscustomerpart'],"select-")) $_SESSION['wbscustomerpart']='0';

if (strpos($_SESSION['wbsdpcustomerpart'],"select-")) $_SESSION['wbsdpcustomerpart']='0';

if (strpos($_SESSION['wbsvendorpart'],"select-")) $_SESSION['wbsvendorpart']='0';

 $wbssql=$wbssql." , wbseqdestination='".$_SESSION['wbseqdestination']."'";
 $wbssql=$wbssql.", wbseqdestinationtype= '".$_SESSION['wbseqdestinationtype']."'";
$wbssql=$wbssql.", wbseqmobilecarrier='". $_SESSION['wbseqmobilecarrier']."'";
$wbssql=$wbssql.", wbseqdescription='". $_SESSION['wbseqdescription']."'";

$wbssql=$wbssql.", wbsdpdestination='". $_SESSION['wbsdpdestination']."'";
$wbssql=$wbssql.", wbsdpdestinationtype='". $_SESSION['wbsdpdestinationtype']."'";
$wbssql=$wbssql.", wbsdpmobilecarrier='". $_SESSION['wbsdpmobilecarrier']."'";
$wbssql=$wbssql.", wbsdpdescription='". $_SESSION['wbsdpdescription']."'";
$wbssql=$wbssql.", wbseqcustomer='". $_SESSION['wbseqcustomer']."'";
$wbssql=$wbssql.", wbsdpcustomer='". $_SESSION['wbsdpcustomer']."'";
$wbssql=$wbssql.", wbseqvendor='". $_SESSION['wbseqvendor']."'";
$wbssql=$wbssql.", wbscustomerpart='". $_SESSION['wbscustomerpart']."'";
$wbssql=$wbssql.", wbsdpcustomerpart='". $_SESSION['wbsdpcustomerpart']."'";
$wbssql=$wbssql.", wbsvendorpart='". $_SESSION['wbsvendorpart']."'";

$wbssql=$wbssql.",  mwbseqdestination='".$_SESSION['mwbseqdestination']."'";
$wbssql=$wbssql.", mwbseqdestinationtype= '".$_SESSION['mwbseqdestinationtype']."'";
$wbssql=$wbssql.", mwbseqmobilecarrier='". $_SESSION['mwbseqmobilecarrier']."'";
$wbssql=$wbssql.", mwbseqdescription='". $_SESSION['mwbseqdescription']."'";

$wbssql=$wbssql.", showassignedeqc='". $_SESSION['showassignedeqc']."'"; 
$wbssql=$wbssql.", showassignedeqv='". $_SESSION['showassignedeqv']."'";
$wbssql=$wbssql.", showassigneddp='". $_SESSION['showassigneddp']."'";


$wbssql=$wbssql." where user_id= :p_user_id";

Application::wbsbreak("SAVE wbs_656@",$wbssql,0,'');


                        $stmt = $this->pdo->prepare($wbssql);

          $stmt->bindValue(':p_user_id', $p_user_id);
          
                        $stmt->execute();
                        
                   Application::wbsbreak("save wbseqdest",$_SESSION['wbseqdestination']."--user-".$p_user_id,0,'');
                        }
                        
                }

public function restore_wbs_session
        (
        $p_user_id
        )
        {
              static $stmt;
              Application::wbsbreak("RESTORE wbs_enter@","--user-".$p_user_id,0,'');
              
              if ($stmt === null)
              {

              $wbssql="";

$wbssql=$wbssql."select wbseqdestination, wbseqdestinationtype, wbseqmobilecarrier, wbseqdescription, wbsdpdestination, wbsdpdestinationtype, wbsdpmobilecarrier ";
$wbssql=$wbssql.", wbsdpdescription, wbseqcustomer, wbsdpcustomer, wbseqvendor , mwbseqdestination, mwbseqdestinationtype, mwbseqmobilecarrier, mwbseqdescription , wbscustomerpart, ";
$wbssql=$wbssql." wbsdpcustomerpart, wbsvendorpart,showassignedeqc,showassignedeqv,showassigneddp from wbs.wbs_session ";
$wbssql=$wbssql." where user_id = :p_user_id";

               $stmt = $this->pdo->prepare($wbssql);
              };


$stmt->bindValue(':p_user_id', $p_user_id);
$stmt->execute();
$t=$stmt->fetch(PDO::FETCH_ASSOC);


$_SESSION['wbseqdestination']=$t['wbseqdestination'];
$_SESSION['wbseqdestinationtype']=$t['wbseqdestinationtype'];
$_SESSION['wbseqmobilecarrier']=$t['wbseqmobilecarrier'];
$_SESSION['wbseqdescription']=$t['wbseqdescription'];
$_SESSION['wbsdpdestination']=$t['wbsdpdestination'];
$_SESSION['wbsdpdestinationtype']=$t['wbsdpdestinationtype'];
$_SESSION['wbsdpmobilecarrier']=$t['wbsdpmobilecarrier'];
$_SESSION['wbsdpdescription']=$t['wbsdpdescription'];
$_SESSION['wbseqcustomer']=$t['wbseqcustomer'];
$_SESSION['wbsdpcustomer']=$t['wbsdpcustomer'];
$_SESSION['wbseqvendor']=$t['wbseqvendor'];


$_SESSION['mwbseqdestination']=$t['mwbseqdestination'];
$_SESSION['mwbseqdestinationtype']=$t['mwbseqdestinationtype'];
$_SESSION['mwbseqmobilecarrier']=$t['mwbseqmobilecarrier'];
$_SESSION['mwbseqdescription']=$t['mwbseqdescription'];
        $_SESSION['wbscustomerpart']= $t['wbscustomerpart'];
        $_SESSION['wbsdpcustomerpart']= $t['wbsdpcustomerpart'];
        $_SESSION['wbsvendorpart']= $t['wbsvendorpart'];

        $_SESSION['showassignedeqc']=$t['showassignedeqc'];
        $_SESSION['showassignedeqv']=$t['showassignedeqv'];
        $_SESSION['showassigneddp']=$t['showassigneddp'];
        
if ($_SESSION['wbseqdestination']==='') $_SESSION['wbseqdestination']='0';
if ($_SESSION['wbseqdestinationtype']==='') $_SESSION['wbseqdestinationtype']='0';
if ($_SESSION['wbseqmobilecarrier']==='') $_SESSION['wbseqmobilecarrier']='0';
if ($_SESSION['wbseqdescription']==='') $_SESSION['wbseqdescription']='0';

if ($_SESSION['mwbseqdestination']==='') $_SESSION['mwbseqdestination']='0';
if ($_SESSION['mwbseqdestinationtype']==='') $_SESSION['mwbseqdestinationtype']='0';
if ($_SESSION['mwbseqmobilecarrier']==='') $_SESSION['mwbseqmobilecarrier']='0';
if ($_SESSION['mwbseqdescription']==='') $_SESSION['mwbseqdescription']='0';

if ($_SESSION['wbseqcustomer']==='') $_SESSION['wbseqcustomer']='0';
if ($_SESSION['wbsdpcustomer']==='') $_SESSION['wbsdpcustomer']='0';
if ($_SESSION['wbseqvendor']==='') $_SESSION['wbseqvendor']='0';

if ($_SESSION['wbsdpdestination']==='') $_SESSION['wbsdpdestination']='0';
if ($_SESSION['wbsdpdestinationtype']==='') $_SESSION['wbsdpdestinationtype']='0';
if ($_SESSION['wbsdpmobilecarrier']==='') $_SESSION['wbsdpmobilecarrier']='0';
if ($_SESSION['wbsdpdescription']==='') $_SESSION['wbsdpdescription']='0';
if ($_SESSION['wbscustomerpart']==='') $_SESSION['wbscustomerpart']='0';
if ($_SESSION['wbsdpcustomerpart']==='') $_SESSION['wbsdpcustomerpart']='0';
if ($_SESSION['wbsvendorpart']==='') $_SESSION['wbsvendorpart']='0';


Application::wbsbreak("restore wbseqdest@",$_SESSION['wbseqdestination']."--user-".$p_user_id,0,'');
        }
	
		public function &get_gui_strings
		(
			$p_lang_id = null,
			$p_user_id = null,
			$p_name_prfx = null
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select
		a.obj_nm, s.string
	from wbs.wbs_gui_all_object a, wbs.wbs_gui_string s
	where
			a.obj_t = 'UIS'
		and	a.obj_nm like :p_name_like
		and	s.obj_hi = a.obj_hi
		and	lang_id =
			case
				when :p_lang_id is not null then :p_lang_id
				when :p_user_id is not null then (select lang_id from wbs.wbs_gui_user where user_id = :p_user_id)
				else gui_get_gui_config('gui.default_lang')
			end
		and	s.string is not null
EOS
				);
			}
			$stmt->bindValue(':p_lang_id', $p_lang_id);
			$stmt->bindValue(':p_user_id', $p_user_id);
			$stmt->bindValue(':p_name_like', $p_name_prfx.'%');
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			$strings = array();
			foreach ($rowset as &$row)
			{
				$strings[$row[0]] = $row[1];
			}

			return $strings;
		}

		public function get_string
		(
			$p_obj_hi,
			$p_obj_nm = null,
			$p_obj_t = null,
			$p_string_type = 1,
			$p_default = null
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select string from wbs.wbs_gui_string
	where
		obj_hi =
			case
				when :p_obj_hi is not null then :p_obj_hi
				else (
					select obj_hi from wbs.wbs_gui_all_object
						where (:p_obj_nm is null or obj_nm = :p_obj_nm)
							and (:p_obj_t is null or obj_t = :p_obj_t)
						limit 1
				)
			end
		and lang_id = (select lang_id from wbs.wbs_gui_user where user_id = :p_user_id)
		and string_type = :p_string_type
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_obj_hi', $p_obj_hi);
			$stmt->bindValue(':p_obj_nm', $p_obj_nm);
			$stmt->bindValue(':p_obj_t', $p_obj_t);
			$stmt->bindValue(':p_string_type', $p_string_type);
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			return isset($rowset[0]) && $rowset[0][0] != '' ? $rowset[0][0] : $p_default;
		}

		public function find_gui_object
		(
			$p_gui_hi_like,
			$p_obj_nm = null,
			$p_obj_t = null,
			$p_limit = 1
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select 
	o.*,
	(select bit_or(rs.action)
		from wbs.wbs_gui_user u, wbs.wbs_gui_role_set rs
		where
				u.user_id = :p_user_id
			and	rs.role_id = u.role_id
			and	rs.obj_hi = o.obj_hi
	) as action
from 
	wbs.wbs_gui_struct o
where 
	(:p_gui_hi_like is null or gui_hi like :p_gui_hi_like)
	and (:p_obj_nm is null or obj_nm = :p_obj_nm)
	and (:p_obj_t is null or obj_t = :p_obj_t)
limit
	:p_limit
EOS
				);
			}
			$stmt->bindValue(':p_gui_hi_like', $p_gui_hi_like);
			$stmt->bindValue(':p_obj_nm', $p_obj_nm);
			$stmt->bindValue(':p_obj_t', $p_obj_t);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_limit', empty($p_limit) ? 100000 : $p_limit, PDO::PARAM_INT);
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);
			if ($p_limit !== 1)
			{
				return $rowset;
			}
			return isset($rowset[0]) ? $rowset[0] : null;
		}
		
		public function find_gui_hi
		(
			$p_gui_hi_like,
			$p_obj_nm = null,
			$p_obj_t = null
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select gui_hi from wbs.wbs_gui_struct
	where (:p_gui_hi_like is null or gui_hi like :p_gui_hi_like)
		and (:p_obj_nm is null or obj_nm = :p_obj_nm)
		and (:p_obj_t is null or obj_t = :p_obj_t)
	limit 1
EOS
				);
			}
			$stmt->bindValue(':p_gui_hi_like', $p_gui_hi_like);
			$stmt->bindValue(':p_obj_nm', $p_obj_nm);
			$stmt->bindValue(':p_obj_t', $p_obj_t);
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			return isset($rowset[0]) ? $rowset[0][0] : null;
		}

		public function &get_obj_struct
		(
			$p_gui_hi
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select o.*,
		(select bit_or(rs.action)
			from wbs.wbs_gui_user u, wbs.wbs_gui_role_set rs
			where
					u.user_id = :p_user_id
				and	rs.role_id = u.role_id
				and	rs.obj_hi = o.obj_hi
		) as action
	from wbs.wbs_gui_struct o
	where o.gui_hi like :p_gui_hi
	order by o.gui_hi
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_gui_hi.'%');
			$stmt->execute();
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		}
		
		public function &get_gui_obj_struct
		(
			$p_gui_hi,
			$p_obj_type = null
		)
		{
		
			if($p_obj_type != null)
			{
				$arr_obj_type = is_array($p_obj_type) ? $p_obj_type : array($p_obj_type);
				$obj_in = " and	o.obj_t in('".implode("','", $arr_obj_type)."') ";
			}
			else
			{
				$obj_in = '';
			}

			$sql = <<<EOS
select o.*,
		(select bit_or(rs.action)
			from wbs.wbs_gui_role_set rs
			where
					rs.role_id = u.role_id
				and	rs.obj_hi = o.obj_hi
		) as action,
		(select enabled from gui_module where name = o.module_name) module_enabled,
		wbs.gui_get_gui_string(o.obj_hi, u.lang_id, 1) as title,
		trim(concat(
			ifnull(wbs.gui_get_gui_string(o.obj_hi, u.lang_id, 2), ''),
			' ',
			ifnull(wbs.gui_get_gui_string(o.verify_hi, u.lang_id, 1), '')
		)) as tooltip,
		v.delimiter as gvr_delimiter,
		v.verify_pattern as gvr_pattern,
		v.transform_pattern as gvr_transform_pattern,
		v.min_val as gvr_min_val,
		v.min_val_exclude as gvr_min_val_exclude,
		v.max_val as gvr_max_val,
		v.max_val_exclude as gvr_max_val_exclude,
		v.min_len as gvr_min_len,
		v.max_len as gvr_max_len,
		v.max_list_len as gvr_max_list_len,
		wbs.gui_get_gui_string(o.verify_hi, u.lang_id, 1) as gvr_verify_desc
		from wbs.wbs_gui_user u, wbs.wbs_gui_struct o left join gui_verify_rule v on o.verify_hi = v.obj_hi
		where
				u.user_id = :p_user_id
			and	o.gui_hi like :p_gui_hi
			$obj_in
	order by o.gui_hi
EOS;
			$stmt = $this->pdo->prepare($sql);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_gui_hi.'%');
			$stmt->execute();
			
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		}
		
		public function get_autocomplete_lookup($lookupSelect, $value, $type = '=')
		{
			$sql = "
select * from ($lookupSelect) lookupSelect
where
	upper(".($type == 'like' ? 'v' : 'k').") ".($type == 'like' ? "like concat('%', upper(:value), '%')" : " = :value")."
limit 20";
			return $this->query($sql, array('value' => $value));
		}
/*
		public function &get_obj_lookup
		(
			$p_lookup_hi
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select
		l.lookup_param as p,
		l.lookup_key as k,
		ifnull(
			(select s.string
				from wbs.wbs_gui_string s
				where
						s.obj_hi = l.lookup_hi
					and	s.lang_id = u.lang_id
					and	s.string_type = 1
			),
			(select a.obj_nm
				from wbs.wbs_gui_all_object a
				where a.obj_hi = l.lookup_hi
			)
		) as v,
		l.lookup_style as s,
		l.lookup_sort as o
	from wbs.wbs_gui_user u, wbs.wbs_gui_lookup l
	where
		u.user_id = :p_user_id
		and	l.lookup_hi like :p_lookup_hi
		and (
			l.lookup_module_name is null
			or (select enabled from gui_module where name = l.lookup_module_name) > 0
		)
	order by l.lookup_sort, l.lookup_hi
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_lookup_hi', $p_lookup_hi.'.%');
			$stmt->execute();
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		}
*/	
 public function &get_obj_lookup
                (
                        $p_lookup_hi
                )
                {
                        static $stmt;
                        if (1==1) //$stmt === null) --- critical ? ! $stmt === null sucks
                        {
                $dsql="select l.lookup_param as p, l.lookup_key as k, ifnull( ";
                $dsql=$dsql."  (select s.string from wbs.wbs_gui_string s where ";
                $dsql=$dsql." s.obj_hi = l.lookup_hi and     s.lang_id = u.lang_id  and     s.string_type = 1), ";
                $dsql=$dsql." (select a.obj_nm from wbs.wbs_gui_all_object a where a.obj_hi = l.lookup_hi ) ) as v, ";
                $dsql=$dsql." l.lookup_style as s, l.lookup_sort as o from wbs.wbs_gui_user u, wbs.wbs_gui_lookup l  where ";
//              $dsql=$dsql."  u.user_id = :p_user_id and     l.lookup_hi like :p_lookup_hi ";
$dsql=$dsql."  u.user_id = ".DataSourceManager::$user_id." and l.lookup_hi like \"%".$p_lookup_hi."%\"" ;

                $stmt = $this->pdo->prepare($dsql);

                        }



        //              $stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
        //              $stmt->bindValue(':p_lookup_hi', $p_lookup_hi);
                        $stmt->execute();
                        $t=$stmt->fetchAll(PDO::FETCH_ASSOC);
                        return $t;
                }


	
		public function get_map_columns
		(
			array $p_table_struct,
			&$p_map_columns_filter,
			&$p_map_columns_sort,
			&$p_map_values_filter = null
		)
		{
			$p_map_columns_filter = array();
			$p_map_values_filter = array();
			$p_map_columns_sort = array();
			
			$cg_gui_hi = array();
			foreach ($p_table_struct as &$c)
			{
				switch ($c['obj_t'])
				{
					case 'T':
					{
						$t_gui_hi = $c['gui_hi'];
						break;
					}
					case 'CG':
					{
						$cg_gui_hi[$c['gui_hi']] = true;
						break;
					}
					case 'C':
					{
						$parent_hi = GUIUtils::get_parent_hi($c['gui_hi']);
						if (($parent_hi == $t_gui_hi) || ($parent_hi[$cg_gui_hi]))
						{
							if ($c['filter_value'] !== null)
							{
								$p_map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$p_map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
							
							if ($c['sort'] !== null)
							{
								$p_map_columns_sort[$c['obj_nm']] = $this->expand_sql_template($c['sort'], self::$table_alias.'.'.$c['obj_nm']);
							}
						}
						break;
					}
				}
			}
			return 0;
		}

		public function get_sql_select_count
		(
			array $p_table_struct,
			array $p_filter = null,
			$p_count_limit = null,
			&$p_sql
		)
		{
			$map_columns_filter = array();
			$map_values_filter = array();
			$legal_parents = array();
        Application::wbsbreak('get_sql_select_count@','enter',0,'');
			
			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);

				switch ($c['obj_t'])
				{
					case 'T':
					{
						$legal_parents[] = $gui_hi;
						$table = $c['select_value']?$c['select_value']:$c['obj_nm'];
						$main_filter = $c['filter'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if ($c['filter_value'] !== null)
							{
								$map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
						}
						break;
					}
				}
			}
			
			if (!empty($main_filter))
			{
				$where .= '('.$main_filter.')';
			}
			
			if (!empty($p_filter))
			{
				$user_filter = Filter::get_sql($p_filter, $map_columns_filter, self::$filter_callback, $map_values_filter);
			}
			
			if (!empty($user_filter))
			{
				GUIUtils::add_to_list($where, "\nand\n", '('.$user_filter.')');
			}
			
			if (!empty($where))
			{
				$where = "\nwhere\n".$where;
			}
			
			if ($p_count_limit !== null)
			{
				$p_sql =
					"select count(*) from (\n".
					"select null from ".$table." ".self::$table_alias.
					$where."\n".
					"limit ".$p_count_limit."\n".
					") s";
			}
			else
			{
				$p_sql = 'select count(*) from '.$table.' '.self::$table_alias.$where;
			}

$wbstable='';

if($table==='mvts_gateway') { $wbstable='wbs.wbs_gateway'; $walias=' wgw'; };
if($table==='mvts_dialpeer'){ $wbstable='wbs.wbs_dialpeer'; $walias=' wdp'; }; 


//if(!empty($main_filter)) {
//	$p_sql=str_replace($main_filter," 1=1 ",$p_sql);
//};

if ($wbstable !== '') {


$awbsfieldlist=explode(",","Organization,vdsName,vdsType,vdsMobileCarrier,vdsDescription");
$r=false;
$ro=false;

foreach($awbsfieldlist as $a)
{
if( strpos($where,$a) ) {
$r=true;
if($a === "Organization") $ro=true;
}
};



if($r) {
$p_sql=str_replace($table,$wbstable,$p_sql);
if ($ro) {
        Application::wbsbreak('select1137@',$p_sql,0,'');
$p=strpos($p_sql,"strpos(Organization");
$v=substr($p_sql,$p);
$u=substr($p_sql,1,$p-1);
$p_sql= $u.$walias.".CustID in (select id from wbs.x1customer where ".$v;
if($user_filter==="")$p_sql=str_replace(")))","))))",$p_sql);
}
}

}

        Application::wbsbreak('select1137selectcount',$p_sql,0,'');

			return 0;
		}
		
		public function count_rows
		(
			array $p_table_struct,
			array $p_filter = null,
			$p_count_limit = null,
			&$p_row_count
		)
		{
			$status = $this->get_sql_select_count
			(
				$p_table_struct,
				$p_filter,
				$p_count_limit,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
		//   Application::wbsbreak('select1162',$sql,0,'');
	
			$param_names = SQLParser::parse_sql_params($sql);
			self::import_sql_params($params, $param_names);
			self::normalize_sql_params($params);
			$stmt = $this->pdo->prepare($sql);
			$stmt->execute($params);
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			$p_row_count = $rowset[0][0];
		}

		public function get_sql_select_data
		(
			array $p_table_struct,
			$p_represent,
			array $p_filter = null,
			array $p_sort = null,
			$p_filter_mode,
			&$p_sql
		)
		{
			$map_columns_filter = array();
			$map_columns_sort = array();
			$map_values_filter = array();
			$legal_parents = array();

			
			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);
				
				switch ($c['obj_t'])
				{
					case 'T':
					{
						if ($c['action'] & self::ACTION_SELECT == 0)
						{
							return 1;
						}
					
						$legal_parents[] = $gui_hi;
						$table = $c['select_value']?$c['select_value']:$c['obj_nm'];
						$main_filter = $c['filter'];
						Application::wbsbreak('mainfilter',"--m--".$main_filter."--gui--".$gui_hi ,0,'');
						
						$main_sort = $c['sort'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if (
								(($c['action'] & self::ACTION_SELECT) && ($c['module_enabled'] || $c['module_name'] == null)
									&&	($c['represent'] & $p_represent)) || $c['pk']
							)
							{
								GUIUtils::add_to_list(
									$select_list, ",\n",
									$c['select_value'] === null ?
										$c['obj_nm'] : '('.$c['select_value'].') as '.$c['obj_nm']
								);
								
								if(!is_null($c['style_select']))
								{
									GUIUtils::add_to_list(
										$select_list, ",\n",
										'('.$c['style_select'].') as s_'.strtr($c['gui_hi'],array('.'=>'_'))
									);
								}
							}
							
							if ($c['pk'])
							{
								GUIUtils::add_to_list($pk_filter, ' and ', $c['obj_nm'].' = :'.$c['obj_nm']);
							}
							
							if ($c['filter_value'] !== null)
							{
								$map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
							
							if ($c['sort'] !== null)
							{
								$map_columns_sort[$c['obj_nm']] = $this->expand_sql_template($c['sort'], self::$table_alias.'.'.$c['obj_nm']);
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_sort[$c['obj_nm']] = $c['select_value'];
							}
						}
						break;
					}
				}
			}

			if (empty($select_list))
			{
				return 2;
			}
			
			if (!empty($main_filter))
			{
				$where .= '('.$main_filter.')';
			}

			switch ($p_filter_mode)
			{
				case self::FM_PK:
				{
					$user_filter = $pk_filter;
					break;
				}
				case self::FM_FILTER:
				{
					if (!empty($p_filter))
					{
		$user_filter = Filter::get_sql($p_filter, $map_columns_filter, self::$filter_callback, $map_values_filter);
					}
					break;
				}
			}

			if (!empty($user_filter))
			{
			GUIUtils::add_to_list($where, "\nand\n", '('.$user_filter.')');
			}
			
			if (!empty($where))
			{
				$where = "\nwhere\n".$where;
			}

			if (!empty($p_sort))
			{
				$order_by = Sort::get_sql($p_sort, $map_columns_sort);
			}
			else if (!empty($main_sort))
			{
				$main_sort = Sort::parse_sql($main_sort);
				$order_by = Sort::get_sql($main_sort, $map_columns_sort);
			}

			if (!empty($order_by))
			{
				$order_by = "\norder by ".$order_by;
			}
/*			
			$p_sql = 
				"select\n".
				$select_list."\n".
				"from ".$table." ".self::$table_alias.
				$where.
				$order_by;
*/
        Application::wbsbreak('select1325',$select_list."--m--".$main_filter."--u--".$user_filter,0,'');
			$p_sql = "select distinct \n";
                                $wbstable="";
                                $se=""; 
                                if ($table === "mvts_gateway" && $GLOBALS['cfg']['wbs']['gwtype'] !=="?")
                                {

                                 	
                                $wbstable=$table;
                                $walias=' wgw'; 
                                if( $GLOBALS['cfg']['wbs']['usertype'] === 'c') {
                                	$mp=2;
                                	$se=$_SESSION['wbscustomerpart'];
                                	$showassigned= ($_SESSION['showassignedeqc'] ==="1");
                                };
                                if( $GLOBALS['cfg']['wbs']['usertype'] === 'v') {
                                	$mp=21;
                                	$se=$_SESSION['wbsvendorpart'];
                              	  	$showassigned= ($_SESSION['showassignedeqv'] ==="1");
                              
                                };
                              //  $se=$_SESSION['wbscustomerpart'];
                                if ($se === "" ) $se = "0";
                               


                                foreach ( $GLOBALS['cfg']['wbs']['cgwfields'] as $t) {
                                $select_list=$select_list." , ".$t ;
                                }
                                
                                $m_sql="exec ".$this->phpguimanager." @query=".$mp." , @syslabuser='".DataSourceManager::$user_params['user_wbs_nm']."'";
                                if ($showassigned) $m_sql=$m_sql. " , @showassignedonly=1 ";
                                $m_sql=$m_sql.", @columns='".str_replace("'","''",$select_list)."' ";
                                if($main_filter!='') {
                                	$main_filter=str_replace("'","''",$main_filter);
                                	$main_filter=str_replace("strpos(Organization","charindex(Organization",$main_filter);
                                	$m_sql=$m_sql.", @filter=' ".$main_filter."'";
                                	if ($se!=="0")  $m_sql=$m_sql. " , @partitionid=".$se;
                                }
                                
                                };
    if ($table === "mvts_dialpeer" && $GLOBALS['cfg']['wbs']['gwtype'] !=="?")
                                {
                                	
                               	$showassigned= ($_SESSION['showassigneddp']==="1");
                                	
	  	                        
                                $wbstable=$table;
                                $walias=' wdp'; // we do not keep destination in dialpeer only vendor gateway
                                $walias=' wgw';
        Application::wbsbreak('select1384@',$select_list,0,'');
    //                           $select_list=str_replace(",\n",",\nt.",$select_list) ;
    //    Application::wbsbreak('select1386',$select_list,0,'');

                                $se=$_SESSION['wbsdpcustomerpart'];
                                if ($se === "" ) $se = "0";
                                
                                $m_sql="exec ".$this->phpguimanager."  @query=3 , @syslabuser='".DataSourceManager::$user_params['user_wbs_nm']."'";
                                if ($showassigned) $m_sql=$m_sql. " , @showassignedonly=1 ";
                                $m_sql=$m_sql.", @columns='".str_replace("'","''",$select_list)."' ";
                                if($main_filter!='') {
                                	$main_filter=str_replace("'","''",$main_filter);
                                	$main_filter=str_replace("strpos(Organization","charindex(Organization",$main_filter);
                                	$m_sql=$m_sql.", @filter=' ".$main_filter."'";
                                	if ($se!=="0")  $m_sql=$m_sql. " , @partitionid=".$se;
                                }; 
                                };

                                if ($wbstable === "" ) {
                                $p_sql=$p_sql.$select_list."\n"." from ".$table." ".self::$table_alias;

                                };

                                if( strpos($where,"Organization"))
                                {
$p=strpos($where," strpos(Organization");
$v=substr($where,$p);
$u=substr($where,1,$p-1);
$where= $u.$walias.".CustID in (select id from wbs.x1customer where ".$v;
if($user_filter==="") $where=str_replace(")))","))))",$where);
//$where=str_replace("strpos(Organization,","position(Organization in ",$where);
                              //  $where=str_replace("Organization","CustID=(select id from wbs.x1customer where Organization  ",$where);
                              //  $where=str_replace(")))","))))",$where);

                                };

                                $p_sql=$p_sql.
                                $where.
                                $order_by;
                                
        Application::wbsbreak('selectbyfilter1384m',$m_sql,0,'');
        
        if($wbstable!=='') {
        	
        	if($user_filter <>'') {
        		
        		$user_filter=str_replace("'","''",$user_filter);
        		$m_sql= $m_sql." ,@where='".$user_filter."' ";
        		$m_sql=str_replace("strpos","charindex",$m_sql);
        		 
        	}
        	$order_by=str_replace("\n","",$order_by);
        	if($order_by <> '') $m_sql= $m_sql." ,@orderby='".$order_by."' ";
        	//Application::wbsbreak('selectbyfilter1384b',$p_sql,0,'');
        	
        	$p_sql=$m_sql;
        };
        
        
        Application::wbsbreak('selectbyfilter13844',$p_sql,0,'');
			return 0;
		}
		
		public function select_data
		(
			array $p_table_struct,
			$p_represent,
			array $p_filter = null,
			array $p_sort = null,
			$p_limit,
			$p_offset,
			&$p_rowset,
			&$p_rowset_style
		)
		{
			//Application::wbsbreak('selectdata','enter',0,'');
			
			$status = $this->get_sql_select_data
			(
				$p_table_struct,
				$p_represent,
				$p_filter,
				$p_sort,
				self::FM_FILTER,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
			
			//Application::wbsbreak('selectdatars555',$sql,0,'');
				
			if (($p_limit !== null) && ($p_offset !== null)) {
			if (strpos($sql,$this->phpguimanager)==0) 
			{
				$sql = self::get_select_with_limit($sql, $p_limit, $p_offset);
			}
			else 
			{
				$sql = $sql."  ,@limit=".$p_limit." ,@offset=".$p_offset;
				
			};
			};
			
		//	$sql="select * from mvtspro.mvts_gateway where gateway_id=2";
			// $sql="select * from wiztel..mvtsprogateways where gateway_id=2";
			if (strpos($sql,$this->phpguimanager)==0) {
			$param_names = SQLParser::parse_sql_params($sql);
			self::import_sql_params($params, $param_names);
			self::normalize_sql_params($params);
			
			$stmt = $this->pdo->prepare($sql);
			$stmt->execute($params);
			$stmt->execute();
			$p_rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			//Application::wbsbreak('selectdatars3herecount',count($p_rowset),0,'');
			//Application::wbsbreak('selectdatars3herecount',$p_rowset,0,'a');
			
			$p_rowset_style = DataSource::get_styles_from_rowset($p_table_struct, $p_rowset);
			}
			else
			{
					try {
					$this->microsoftpdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
					$sqla="SET ANSI_WARNINGS ON";
					$stmt = $this->microsoftpdo->prepare($sqla);
					$stmt->execute();
					
					$sqla="SET ANSI_NULLS ON";
					$stmt = $this->microsoftpdo->prepare($sqla);
					$stmt->execute();
					//2011-03-31 22:58:41.000
					//$sql="select cast(valid_from as nvarchar) valid_from, valid_till from wiztel..mvtsprogateways where gateway_id=2";
					//$sql="select '2011-03-31 22:58:41.000' valid_from, valid_till from wiztel..mvtsprogateways where gateway_id=2";
				//	$sql="select convert(varchar(100),valid_from,120) valid_from  from wiztel..mvtsprogateways where gateway_id=2";
				$stmt = $this->microsoftpdo->prepare($sql);
				Application::wbsbreak('selectdatarshere1',$sql,0,'');
				$stmt->execute();
				$p_rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);
				$i=0;
				Application::wbsbreak('selectdatars3herecount',count($p_rowset),0,'');
				Application::wbsbreak('selectdatars3herecount',$p_rowset,0,'a');
					
				foreach ($p_rowset as &$wrow)
					{
					
						foreach (array_keys($wrow) as $key){
							if($key=='CustID' && $wrow['CustID']=='')	{
						//		Application::wbsbreak('GetRowEQselect_row1801k',$key." : ".$wrow[$key],0,'');
							$p_rowset[$i]['Organization']='@';
							//break;
							};
							if($key=='ivdsName' && $wrow[$key]=='')	{ //Application::wbsbreak('GetRowEQselect_row1801k',$key." : ".$wrow[$key],0,'');
								$p_rowset[$i]['vdsName']='@';
							  //break;
							}
							if($key=='ts' || $key=='valid_from' || $key=='valid_from')	{ //Application::wbsbreak('GetRowEQselect_row1801k',$key." : ".$wrow[$key],0,'');
									$p_rowset[$i][$key]=date('Y-m-d H:i:s', strtotime($wrow[$key]));  
										
							};
						};
					
						$i++;
					};
						
				}
				catch (PDOException $e)
				{
					Application::wbsbreak('selectdatarspdoexept',$e,'a');
				}
					
				//return $stmt->fetchAll(PDO::FETCH_NUM);
				$p_rowset_style = DataSource::get_styles_from_rowset($p_table_struct, $p_rowset);
			};
			Application::wbsbreak('selectdata','exit',0,'');
				
		}
		
		public function select_data_and_count
		(
			array $p_table_struct,
			$p_represent,
			array $p_filter = null,
			array $p_sort = null,
			$p_limit,
			$p_offset,
			$p_use_count_limit,
			&$p_count_limit,
			&$p_row_count,
			&$p_rowset,
			&$p_rowset_style
		)
		{
			Application::wbsbreak('select_data_and_count','enter',0,'');
				
			$p_count_limit = DataSourceManager::ds()->get_gui_config('gui.table.max_size');
			//Application::wbsbreak('select_data_and_count1632',$p_count_limit,0,'');
				
			$this->count_rows
			(
				$p_table_struct,
				$p_filter,
				$p_use_count_limit && !empty($p_count_limit) ? $p_count_limit + 1 : null,
				$p_row_count
			);
			
			if ($p_use_count_limit && !empty($p_count_limit) && ($p_row_count > $p_count_limit))
			{
				return 1;
			}
			//Application::wbsbreak('select_data_and_count1645',$v,0,'');
				
			Application::restore_wbs_session();
				
Application::wbsbreak('asd',$p_table_struct[0]['obj_hi'].' -eqd-- '.$_SESSION['wbseqdestination'] ,0,'');
$v="";
$a="";
$needdest="";
$walias="";
if ($GLOBALS['cfg']['wbs']['gwtype'] === 'e'){
	
if ($GLOBALS['cfg']['wbs']['usertype'] === 'c'){
if ($_SESSION['wbseqcustomer'] !== '0' ) $v=$v. "  strpos(Organization, '".$_SESSION['wbseqcustomer']."')  = 1   ";
$sql=$sql. ") values (";

};

if ($GLOBALS['cfg']['wbs']['usertype'] === 'v'){
	$walias=" wgw.";
	$needdest="y";
if ($_SESSION['wbseqvendor'] !== '0' ) $v=$v. "  strpos(Organization, '".$_SESSION['wbseqvendor']."') = 1  ";
};

};



if ($GLOBALS['cfg']['wbs']['gwtype'] === 'd'){
if ($_SESSION['wbsdpcustomer'] !== '0' ) $v=$v. " strpos(Organization, '".$_SESSION['wbsdpcustomer']."') = 1 ";
};

if ($p_table_struct[0]['obj_hi'] === "00.22001.01" ) { //voipdestination
$needdest="y";
};


if(strpos($v,"or") ) {
$v=" ( " . $v . "  ";
};

if( $needdest !==""  ) {

if ($v !== "") $a=" and ";

if ($_SESSION['wbseqdestination'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsName='".$_SESSION['wbseqdestination']."' ) ";

Application::wbsbreak('asdv1',$_SESSION['wbseqdestination'].'----'.$v,0,''); // must be empty


if ($v !== "") $a=" and ";

if ($_SESSION['mwbseqdestinationtype'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsType='".$_SESSION['mwbseqdestinationtype']."' ) ";


if ($v !== "") $a=" and ";

if ($_SESSION['mwbseqmobilecarrier'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsMobileCarrier='".$_SESSION['mwbseqmobilecarrier']."' ) ";

if ($v !== "") $a=" and ";

if ($_SESSION['mwbseqdescription'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsDescription='".$_SESSION['mwbseqdescription']."' ) ";

};

if( $GLOBALS['cfg']['wbs']['gwtype'] === 'd' ) {
	$walias=" wdp.";
if ($v !== "") $a=" and ";

if ($_SESSION['wbsdpdestination'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsName='".$_SESSION['wbsdpdestination']."' ) ";


if ($v !== "") $a=" and ";

if ($_SESSION['wbsdpdestinationtype'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsType='".$_SESSION['wbsdpdestinationtype']."' ) ";


if ($v !== "") $a=" and ";

if ($_SESSION['wbsdpmobilecarrier'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsMobileCarrier='".$_SESSION['wbsdpmobilecarrier']."' ) ";

if ($v !== "") $a=" and ";

if ($_SESSION['wbsdpdescription'] !== '0' ) $v=$v.$a. " ( ".$walias."vdsDescription='".$_SESSION['wbsdpdescription']."' ) ";

};

if ($v !== "" ) {
if (strpos($v,'Organization')){  //{//&($p_table_struct[0]['obj_hi'] !== "00.2201.01" )){
$v=$v . " ) ";
}

$vv=$p_table_struct[0]['filter']."";

Application::wbsbreak('filterforcebb@',$vv,0,'');

if ($vv!== "") $v=$v." and ".$vv ;

$p_table_struct[0]['filter']=$v;
//Application::wbsbreak('1234',$p_filter,1,'a');
};

Application::wbsbreak('filterforcevv',$v,0,'');

Application::wbsbreak('filterforce',$p_table_struct[0]['filter'],0,'');

			$this->select_data
			(
				$p_table_struct,
				$p_represent,
				$p_filter,
				$p_sort,
				$p_limit,
				$p_offset,
				$p_rowset,
				$p_rowset_style
			);
			
			return 0;
		}
		
		public function select_row
		(
			array $p_table_struct,
			$p_represent,
			&$p_row,
			&$p_row_style
		)
		{
			Application::wbsbreak('selectraw','z',0,'');
			
			$status = $this->get_sql_select_data
			(
				$p_table_struct,
				$p_represent,
				null,
				null,
				self::FM_PK,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
			try {
				if(strpos($sql,"manager")==0) {
			$param_names = SQLParser::parse_sql_params($sql);
			$stmt = $this->pdo->prepare($sql);
			self::import_sql_params($params, $param_names, $p_row);
			self::normalize_sql_params($params);
			$stmt->execute($params);
			$data = $stmt->fetch(PDO::FETCH_ASSOC);
			
				}
				else 
				{
						
					
					$sql=str_replace(':gateway_id',$p_row['gateway_id'],$sql);
					$v=$p_row['cust_id'];
					if($v=='') $p_row['Organization']='@';
					Application::wbsbreak('GetRowEQcustid',$p_row['Organization'].' - '.$v,0,'');
					
		//	$param_names = SQLParser::parse_sql_params($sql);
					$this->microsoftpdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
					$sqla="SET ANSI_WARNINGS ON";
					$stmt = $this->microsoftpdo->prepare($sqla);
					$stmt->execute();
					
					$sqla="SET ANSI_NULLS ON";
					$stmt = $this->microsoftpdo->prepare($sqla);
					$stmt->execute();
					
		   	$stmt = $this->microsoftpdo->prepare($sql);
			$stmt->execute();
//Organization	enable	gateway_id	CustID	ts	gateway_name	
//description	equipment_type	endpoint_number	src_enable	dst_enable	protocol	reg_type	dst_default_protocol	balancing_group	max_call_duration	src_debug	dst_debug	stat_enable	valid_from	valid_till
			/*
			$stmt->bindColumn(1, $Organization);
			$stmt->bindColumn(2, $enable);
			$stmt->bindColumn(3, $gateway_id);
			$stmt->bindColumn(4, $CustID);
			$stmt->bindColumn(5, $ts);
			$stmt->bindColumn(6, $gateway_name);
			$stmt->bindColumn(7, $src_address_list);
			*/
			$data = $stmt->fetch(PDO::FETCH_ASSOC);
		//	Application::wbsbreak('GetRowEQbefore','bound' ,0,'');
		//	Application::wbsbreak('GetRowEQbound',$src_address_list . "\t" . $Organization. "\t" . $ts. "\t" . $gateway_name . "\t" .$description,0,'');
			
				};
			}
			catch (PDOException $e)
			{
				Application::wbsbreak('GetRowEQmserr',$e ,0,'a');
					
			};
		//	echo("pr_r<br>");
		//	print_r($data);
			
			if ($data !== false)
			{
				$p_row = $data;
				$rowset = array(&$p_row);
				Application::wbsbreak('GetRowEQselect_row1801c@',count($rowset),0,'');
				$p_row_style = reset(DataSource::get_styles_from_rowset($p_table_struct, $rowset));
				Application::wbsbreak('GetRowEQselect_row1801c@',count($rowset[0]),0,'');
				/*
				foreach ($rowset as &$wrow)
				{
				
					foreach (array_keys($wrow) as $key){
						Application::wbsbreak('GetRowEQselect_row1801k',$key." : ".$wrow[$key],0,'');
					};
						
				};
					
				*/
				
			}
			else
			{
				Application::wbsbreak('GetRowEQselect_row1801d','false',0,'');
				
				$p_row = array();
				$p_row_style = array();
			}
			$row[self::$sql_row_count_tag] = $stmt->rowCount();
		}
		
		public function select_rowset
		(
			array $p_table_struct,
			$p_represent,
			&$p_rowset
		)
		{
			$status = $this->get_sql_select_data
			(
				$p_table_struct,
				$p_represent,
				null,
				null,
				self::FM_PK,
				$sql
			);
		   Application::wbsbreak('select1637',$sql,0,'');
			
			if ($status != 0)
			{
				return;
			}
			
			$param_names = SQLParser::parse_sql_params($sql);

			$stmt = $this->pdo->prepare($sql);
			
			$errors = array();
			
			foreach ($p_rowset as &$row)
			{
				try
				{
					$params = array();
					self::import_sql_params($params, $param_names, $row);
					self::normalize_sql_params($params);
					$stmt->execute($params);
					$data = $stmt->fetch(PDO::FETCH_ASSOC);
					
					if ($data !== false)
					{
						$row = $data;
					}
				}
				catch (PDOException $e)
				{
					$errors[] = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);
				}
				
				$row[self::$sql_row_count_tag] = $stmt->rowCount();
			}
			if (!empty($errors))
			{
				throw new GUIException($errors);
			}
		}
		
		public function get_sql_select_initial_values
		(
			array $p_table_struct,
			$p_represent,
			&$p_sql
		)
		{
			$columns = array();
			$col_gui_hi_offset = strlen($p_table_struct[0]['GUI_HI']) + 2;
			$legal_parents = array();
			
			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);
				
				switch ($c['obj_t'])
				{
					case 'T':
					case 'DBP':
					case 'UIP':
					case 'WP';
					{
						$legal_parents[] = $gui_hi;
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if (($c['represent'] & $p_represent) || $c['pk'])
							{
								if ($c['initial_value'] !== null)
								{
									GUIUtils::add_to_list(
										$select_list, ",\n",
										'('.$c['initial_value'].') as '.$c['obj_nm']
									);
								}
							}
						}
						break;
					}
				}
			}
			
			if (empty($select_list))
			{
				return 2;
			}
			
			$p_sql = "select\n".$select_list;

			return 0;
		}
		
		public function get_initial_values
		(
			array $p_user_params,
			array $p_table_struct,
			$p_represent,
			&$p_initial_values
		)
		{
			$status = $this->get_sql_select_initial_values
			(
				$p_table_struct,
				$p_represent,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
			
			$param_names = SQLParser::parse_sql_params($sql);
			self::import_sql_params($params, $param_names, $p_user_params);
			self::normalize_sql_params($params);
			$stmt = $this->pdo->prepare($sql);
			$stmt->execute($params);
			$p_initial_values = $stmt->fetch(PDO::FETCH_ASSOC);
		}

		public function get_sql_select_common_values
		(
			array $p_table_struct,
			$p_represent,
			array $p_filter = null,
			&$p_sql
		)
		{
			$map_columns_filter = array();
			$map_values_filter = array();
			$map_columns_sort = array();
			$legal_parents = array();
			
			GUIUtils::add_to_list(
				$select_list, ",\n",
				'count(*) as '.self::$sql_row_count_tag
			);
			
			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);

				switch ($c['obj_t'])
				{
					case 'T':
					{
						if ($c['action'] & self::ACTION_SELECT == 0)
						{
							return 1;
						}
					
						$legal_parents[] = $gui_hi;
						$table = $c['obj_nm'];
						$main_filter = $c['filter'];
						$main_sort = $c['sort'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if (
									($c['action'] & self::ACTION_SELECT)
								&&	($c['module_enabled'] || $c['module_name'] == null)
								&&	($c['represent'] & $p_represent)
							)
							{
								$col_expr = $c['select_value'] === null ? $c['obj_nm'] : '('.$c['select_value'].')';

								GUIUtils::add_to_list(
									$select_list, ",\n",
									"case\n".
									"when count(*) = count(".$col_expr.")\n".
									"and min(".$col_expr.") = max(".$col_expr.")\n".
									"then min(".$col_expr.")\n".
									"else null\n".
									"end as ".$c['obj_nm']
								);
							}
							
							if ($c['filter_value'] !== null)
							{
								$map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
						}
						break;
					}
				}
			}
			
			if (empty($select_list))
			{
				return 2;
			}
			
			if (!empty($main_filter))
			{
				$where .= '('.$main_filter.')';
			}
			
			if (!empty($p_filter))
			{
				$user_filter = Filter::get_sql($p_filter, $map_columns_filter, self::$filter_callback, $map_values_filter);
			}
			
			if (!empty($user_filter))
			{
				GUIUtils::add_to_list($where, "\nand\n", '('.$user_filter.')');
			}
			
			if (!empty($where))
			{
				$where = "\nwhere\n".$where;
			}
			
			$p_sql = 
				"select\n".
				$select_list."\n".
				"from ".$table." ".self::$table_alias.
				$where;
			
			return 0;
		}

		public function select_common_values
		(
			array $p_table_struct,
			$p_represent,
			array $p_filter = null,
			&$p_row_count,
			&$p_common_values
		)
		{
			$status = $this->get_sql_select_common_values
			(
				$p_table_struct,
				$p_represent,
				$p_filter,
				$sql
			);
			
			if ($status != 0)
			{
				return;
			}
			
			$param_names = SQLParser::parse_sql_params($sql);
			self::import_sql_params($params, $param_names);
			self::normalize_sql_params($params);
			$stmt = $this->pdo->prepare($sql);
			$stmt->execute($params);
			$p_common_values = $stmt->fetch(PDO::FETCH_ASSOC);
			$p_row_count = $p_common_values[self::$sql_row_count_tag];
			unset($p_common_values[self::$sql_row_count_tag]);
		}

		public function get_sql_insert_data
		(
			array $p_table_struct,
			array $p_columns = null,
			&$p_sql
		)
		{
			$legal_parents = array();

			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);

				switch ($c['obj_t'])
				{
					case 'T':
					{
						if ($c['action'] & self::ACTION_INSERT == 0)
						{
							return 1;
						}
					
						$legal_parents[] = $gui_hi;
						$table = $c['obj_nm'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if (
								(($c['action'] & self::ACTION_INSERT) && ($c['module_enabled'] || $c['module_name'] == null))
								|| $c['insert_value']
							)
							{
								$use_column = false;
							
								if ($c['insert_value'] !== null)
								{
									$insert_value = '('.SQLParser::eval_template($c['insert_value'], $p_columns).')';
									$use_column = true;
								}
								else if (
										($c['select_value'] === null)
									&&	(empty($p_columns) || in_array($c['obj_nm'], $p_columns))
									
									// [WORKAROUND]
									
									&&	($c['represent'] > 0)
								)
								{
									$insert_value = ':'.$c['obj_nm'];
									$use_column = true;
								}
								
								if ($use_column)
								{
									if ($c['transform'] !== null)
									{
										$insert_value = '('.$this->expand_sql_template($c['transform'], $insert_value).')';
									}
									
									GUIUtils::add_to_list($insert_column_list, ",\n", $c['obj_nm']);
									GUIUtils::add_to_list($insert_value_list, ",\n", $insert_value);
								}
							}
						}
						break;
					}
				}
			}
			
			if (empty($insert_column_list))
			{
				return 2;
			}
			
			$p_sql =
				"insert into ".$table." (\n".
				$insert_column_list."\n".
				")\n".
				"values (\n".
				$insert_value_list."\n".
				")";

			return 0;
		}
		
		public function insert_row
		(
			array $p_table_struct,
			array $p_columns = null,
			array &$p_row,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			
			if (empty($p_row))
			{
				return;
			}
			
			$status = $this->get_sql_insert_data
			(
				$p_table_struct,
				$p_columns,
				$sql
			);

			if ($status != 0)
			{
				return;
			}

			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			$errors = array();

			try
			{
				$params = array();
				self::import_sql_params($params, $param_names, $p_row);
				self::normalize_sql_params($params);
					
				$pp = array();
				foreach ($params as $p => $v)
				{
					if ($v !== null)
					{
						$pp[$p] = $v;
					}
				}
				$stmt->execute($params);
				$p_row[self::$sql_last_insert_id_tag] = $this->pdo->lastInsertId();
			}
			catch (PDOException $e)
			{
				$error = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);
				throw new GUIException(array($error));
			}
			
			$p_row_count += $stmt->rowCount();
			$row[self::$sql_row_count_tag] = $stmt->rowCount();

		}

		public function insert_rowset
		(
			array $p_table_struct,
			array $p_columns = null,
			array &$p_rowset,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			
			if (empty($p_rowset))
			{
				return;
			}
			
			$status = $this->get_sql_insert_data
			(
				$p_table_struct,
				$p_columns,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
			
			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			$errors = array();
			foreach ($p_rowset as &$row)
			{
				try
				{
					$params = array();
					self::import_sql_params($params, $param_names, $row);
					self::normalize_sql_params($params);
					
					$pp = array();
					foreach ($params as $p => $v)
					{
						if ($v !== null)
						{
							$pp[$p] = $v;
						}
					}
					$stmt->execute($params);
					$row[self::$sql_last_insert_id_tag] = $this->pdo->lastInsertId();
				}
				catch (PDOException $e)
				{
					$errors[] = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);
				}
				
				$p_row_count += $stmt->rowCount();
				$row[self::$sql_row_count_tag] = $stmt->rowCount();
			}

			if (!empty($errors))
			{
				throw new GUIException($errors);
			}
		}

		public function get_sql_update_data
		(
			array $p_table_struct,
			array $p_columns = null,
			array $p_filter = null,
			$p_filter_mode,
			&$p_sql
		)
		{
			$map_columns_filter = array();
			$map_values_filter = array();
			$legal_parents = array();
			$wbs_update_list="";
			$wbs_table="";
			Application::wbsbreak("get_sql_update_struct@",$p_table_struct,0,'a');
				
			
			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);
			//	Application::wbsbreak("get_sql_update_data@",$gui_hi,0,'');
					
				switch ($c['obj_t'])
				{
					case 'T':
					{
						if ($c['action'] & self::ACTION_UPDATE == 0)
						{
							return 1;
						}
					
						$legal_parents[] = $gui_hi;
						$table = $c['obj_nm'];
						$main_filter = $c['filter'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if (
									!$c['pk']
								&&	(
									(
										(($c['action'] & self::ACTION_UPDATE) && ($c['module_enabled'] || $c['module_name'] == null))
										|| $c['update_value']
									)
								)
							)
							{
								$use_column = false;
								$cstrip=str_replace("t.","",$c['obj_nm']);
								if ($c['update_value'] !== null)
								{
									$update_value = '('.SQLParser::eval_template($c['update_value'], $p_columns).')';
									//$update_value=str_replace("t.","",$update_value);
									$use_column = true;
								}
								else if (
										($c['select_value'] === null)
									&&	(empty($p_columns) || in_array($cstrip, $p_columns))
								
									// [WORKAROUND]
								
									&&	($c['represent'] > 0)
								)
								{
									$update_value = ':'.$c['obj_nm'];
									$use_column = true;
								}
								
								if (strpos("x".$c['obj_nm'],"wgw.")) $use_column=false;
								if (strpos("x".$c['obj_nm'],"wdp.")) $use_column=false;
									
								$update_value=str_replace("t.","",$update_value);
								$c['obj_nm']=str_replace("t.","",$c['obj_nm']);
								$c['obj_nm']=str_replace("wgw.","",$c['obj_nm']);
								$c['obj_nm']=str_replace("wdp.","",$c['obj_nm']);
									
								if (($c['obj_nm']==='Organization')||($c['obj_nm']==='vdsName')||($c['obj_nm']==='vdsType')||($c['obj_nm']==='vdsMobileCarrier')||($c['obj_nm']==='vdsDescription'))
								{
									$update_value = ':'.$c['obj_nm'];
									GUIUtils::add_to_list($wbs_update_list, ",\n", $c['obj_nm'].' = '.$update_value);
								};
										
								if ($use_column)
								{
									if (1===2) //$c['transform'])
									{
										$update_value = '('.$this->expand_sql_template($c['transform'], $update_value).')';
									}
									if(1===1) { // !strpos($c['obj_nm'],'.')) {
							if (($c['obj_nm']==='Organization')||($c['obj_nm']==='vdsName')||($c['obj_nm']==='vdsType')||($c['obj_nm']==='vdsMobileCarrier')||($c['obj_nm']==='vdsDescription'))
									{
									//	GUIUtils::add_to_list($wbs_update_list, ",\n", $c['obj_nm'].' = '.$update_value);
									}
									else 
									{	
									GUIUtils::add_to_list($update_list, ",\n", $c['obj_nm'].' = '.$update_value);
									}
									}
							}
							}
							if ($c['pk'])
							{
								GUIUtils::add_to_list(
									$pk_filter, ' and ',
									$c['obj_nm'].' = :'.$c['obj_nm']
								);
							}
							
							if ($c['filter_value'] !== null)
							{
								$map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
						}
						break;
					}
				}
			}

			if (empty($update_list))
			{
				return 2;
			}
			
			if (!empty($main_filter))
			{
				$where .= '('.$main_filter.')';
			}
			
			switch ($p_filter_mode)
			{
				case self::FM_PK:
				{
					$user_filter = $pk_filter;
					break;
				}
				case self::FM_FILTER:
				{
					if (!empty($p_filter))
					{
						$user_filter = Filter::get_sql($p_filter, $map_columns_filter, self::$filter_callback, $map_values_filter);
					}
					break;
				}
			}
			
			if (!empty($user_filter))
			{
				GUIUtils::add_to_list($where, "\n and \n", '('.$user_filter.')');
			}
			
			if (!empty($where))
			{
				$where = "\n where \n".$where;
			}
			$p_sql = "update ".$table." ".self::$table_alias."\n set \n".$update_list.$where;
			//Application::wbsbreak("get_sql_update_data1",$p_sql,0,'');
				
			if($wbs_update_list !=='')
			{
				if($table==="mvts_gateway") {
			
			
					$wbs_table="wbs.wbs_gateway";
					$where=str_replace("(gateway_id","(mgateway_id",$where);
			
					//$p_sql = $p_sql . $update_list." ".$where;
			
				};
				if($table==="mvts_dialpeer") {
			
			
					$wbs_table="wbs.wbs_dialpeer";
					$where=str_replace("(dialpeer_id","(mdialpeer_id",$where);
			
					//$p_sql = $p_sql . $update_list." ".$where;
			
				};
			
				//if ($wbs_table === "" ) $p_sql = $p_sql . $update_list." ". $where;
			
				if ($wbs_table !=='' ) {
			
					$custsql="CustId=(select ID from wbs.x1customer where Accountstatus='Active' and Organization=(trim(:Organization)))";
			
			
					$wbs_update_list=str_replace("Organization = (trim(:Organization))",$custsql,$wbs_update_list);
			
			
					if(!empty($main_filter)) {
						$where=str_replace($main_filter," 1=1 ",$where);
					};
					$wbs_p_sql= "update ".$wbs_table." ".self::$table_alias."\n set \n".$wbs_update_list." ".$where;
			
					$p_sql=$p_sql."@wbs@".$wbs_p_sql;
				};
			};
			Application::wbsbreak("update_withwbs@",$p_sql,0,'');
			return 0;
		}

		public function update_data
		(
			array $p_table_struct,
			array $p_columns = null,
			array $p_filter = null,
			array &$p_row,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			Application::wbsbreak("update_data2854",'',0,'');
			
			$status = $this->get_sql_update_data
			(
				$p_table_struct,
				$p_columns,
				$p_filter,
				self::FM_FILTER,
				$sql
			);
			Application::wbsbreak("update_data2587",$sql,0,'');
			
			if ($status != 0)
			{
				return;
			}
			$p=strpos($sql,'@wbs@');
			Application::wbsbreak("update_data2593",$sql,0,'');
			 
			if($p==false)
			{
			
			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			self::import_sql_params($params, $param_names, $p_row);
			self::normalize_sql_params($params);
			$stmt->execute($params);
			$p_row_count = $stmt->rowCount();
			}
			else 
			{
				$sql1=substr($sql,0,$p);
		        $sql2=substr($sql,$p+5);
		        Application::wbsbreak("update_data2608",$sql1.'----'.$sql2,0,'');
		        	
		        
		        $stmt = $this->pdo->prepare($sql1);
		        $param_names = SQLParser::parse_sql_params($sql1);
		        self::import_sql_params($params, $param_names, $p_row);
		        self::normalize_sql_params($params);
		        $stmt->execute($params);
		        $p_row_count = $stmt->rowCount();
		        
			};
		}
		
		public function update_row
		(
			array $p_table_struct,
			array $p_columns = null,
			array &$p_row,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			Application::wbsbreak("update_row2450",$p_columns,0,'a');
			
			if (empty($p_row))
			{
				return;
			}
			Application::wbsbreak("update_row",$p_columns,0,'a');
				
			$status = $this->get_sql_update_data
			(
				$p_table_struct,
				$p_columns,
				null,
				self::FM_PK,
				$sql
			);

			if ($status != 0)
			{
				return;
			}

			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			
			try
			{
				self::import_sql_params($params, $param_names, $p_row);
				self::normalize_sql_params($params);
				$stmt->execute($params);
			}
			catch (PDOException $e)
			{
				$error = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);
				throw new GUIException(array($error));
			}
			
			$p_row_count += $stmt->rowCount();
			$row[self::$sql_row_count_tag] = $stmt->rowCount();
		}

		public function update_rowset
		(
			array $p_table_struct,
			array $p_columns = null,
			array &$p_rowset,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			Application::wbsbreak("*update_rowset2958",$p_columns,0,'a');
			
			if (empty($p_rowset))
			{
				return;
			}
			
			$status = $this->get_sql_update_data
			(
				$p_table_struct,
				$p_columns,
				null,
				self::FM_PK,
				$sql
			);
			Application::wbsbreak("*2update_rowset@",$sql,0,'');
				
			if ($status != 0)
			{
				return;
			}
				
			$p=strpos($sql,'@wbs@');
			Application::wbsbreak("*2update_rowsetp@",$p,0,'');
				
			
			$sql2="";
			$um_sql="";
			
			if($p>0)
			{
				$sql2=substr($sql,$p+5);
				$sql=substr($sql,0,$p);
				$sql="exec phpguimanagerDB3 @transaction=53,  @sqltemplate='update mvts_gateway t
				set
				enable = :enable,
				description = :description
				where
				(( dst_enable = 1 ))
				and
				(gateway_id = :gateway_id)', @wbssqltemplate='update wbs.wbs_gateway t
				set
				Organization = :Organization,
				vdsName = :vdsName,
				vdsType = :vdsType,
				vdsMobileCarrier = :vdsMobileCarrier,
				vdsDescription = :vdsDescription
				where
				( 1=1 )
				and
				(mgateway_id = :gateway_id)' ,@sqlvalues=':enable=''0'',:gateway_id=''321'',:gateway_name=''S_Luascom_Cameroon'',:description=''Supplier 9876543'',:equipment_type=''1'',' ,@wbssqlvalues=':gateway_id=''321'',:Organization=''Arbinet_6579[WIZ]'',:vdsName=''0'',:vdsType=''0'',:vdsMobileCarrier=''0'',:vdsDescription=''0'','";
				
				
				if (($GLOBALS['cfg']['wbs']['gwtype']==='e' && $GLOBALS['cfg']['wbs']['usertype']==='c') ) $code=52;
				if (($GLOBALS['cfg']['wbs']['gwtype']==='e' && $GLOBALS['cfg']['wbs']['usertype']==='v') ) $code=53;
				if ($GLOBALS['cfg']['wbs']['gwtype']==='d') $code=54;
				Application::wbsbreak("update_data2715",$sql.'----'.$sql2,0,'');
				$um_sql="exec ".$this->phpguimanager." @transaction=".$code.",  @sqltemplate='".str_replace('\'','\'',$sql)."'";
				$um_sql=$um_sql.", @wbssqltemplate='".$sql2."'";
				
				
			};
			
			$v=str_replace('t.','',$sql);
			//$v=str_replace('mgw.','',$v);
			//$stmt = $this->pdo->prepare($v);
			Application::wbsbreak("*2_rowset",$v,0,'');
			
			//$param_names = SQLParser::parse_sql_params($v);
			
			$stmt = $this->pdo->prepare($v);
			$param_names = SQLParser::parse_sql_params($v);
			Application::wbsbreak("*3update_rowset",$param_names ,0,'a');
			
			$errors = array();
			foreach ($p_rowset as &$wrow)
			{
				$i=0;
				
				
				$row=array();
				foreach (array_keys($wrow) as $key){
					$p=strpos($key,".");
					$key1=$key;
					if($p>0) $key1=substr($key1,$p+1);
					$row[$key1]=$wrow[$key];
				
					$i++;
				};
				
				 
				try
				{
					$params = array();
					self::import_sql_params($params, $param_names, $row);
					//Application::wbsbreak("*params_wrowset",$row,0,'a');
						
				//	Application::wbsbreak("*params_rowset",$params,0,'a');
						
					self::normalize_sql_params($params);
					Application::wbsbreak("*params_awrowset",$params,0,'a');
					
					if ($um_sql<>'') {
					$v=Application::wbsbreakvar("*params_awrowset",$params,0,'a');
						
					Application::wbsbreak("umsql3041",$v,0,'');
						
					$um_sql=$um_sql." ,@sqlvalues='".str_replace('\'','\'\'',$v)."'";
					//Application::wbsbreak("umsql3042",$um_sql,0,'');
					
					$wparam_names = SQLParser::parse_sql_params($sql2);
					$wparams = array();
					self::import_sql_params($wparams, $wparam_names, $row);
					self::normalize_sql_params($wparams);
					Application::wbsbreak("*wparams",$wparams,0,'a');
					Application::wbsbreak("*wparam_names",$wparam_names,0,'a');
					$v=Application::wbsbreakvar("*params_awrowset",$wparams,0,'a');
					
					$um_sql=$um_sql." ,@wbssqlvalues='".str_replace('\'','\'\'',$v)."'";
					Application::wbsbreak("umsql3070",$um_sql,0,'');
					$this->microsoftpdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
					$sqla="SET ANSI_WARNINGS ON";
					$stmt = $this->microsoftpdo->prepare($sqla);
					//$stmt->execute();
					
					$sqla="SET ANSI_NULLS ON";
					$stmt = $this->microsoftpdo->prepare($sqla);
					//$stmt->execute();
					//$um_sql=str_replace(':','x',$um_sql);
					Application::wbsbreak("umsql3102",$um_sql,0,'');
						
					//$stmt = $this->microsoftpdo->prepare($um_sql);
					//$fparams = array();
						
					$stmt->execute($um_sql);
						
					}
					else {
					$stmt->execute($params);
					}
				}
				catch (PDOException $e)
				{
					//Application::wbsbreak("*1error_rowset",$param_names ,0,'a');
					
					$errors[] = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);
					
					Application::wbsbreak("*2error_rowset",$errors ,0,'a');
						
				}
				
				
				$p_row_count += $stmt->rowCount();
				$row[self::$sql_row_count_tag] = $stmt->rowCount();
			}
			
			if (!empty($errors))
			{
				throw new GUIException($errors);
			};
		
			if ($sql2!="") {
				Application::wbsbreak("*ssql2",$sql2 ,0,'');
				/*update wbs.wbs_gateway t
				set
				Organization = :Organization
							where
				( 1=1 )
				and
				(mgateway_id = :gateway_id)
				update wbs.wbs_dialpeer t
set
Organization = :Organization,
vdsName = :vdsName,
vdsType = :vdsType,
vdsMobileCarrier = :vdsMobileCarrier,
vdsDescription = :vdsDescription 
where
(mdialpeer_id = :dialpeer_id)
				*/
			
			/*		
				//$sql2=str_replace("Organization = :Organization","CustID=(select id from wbs.x1customer where Organization = :Organization )",$sql2);
				Application::wbsbreak("*sssql2",$sql2 ,0,'');
				$stmt = $this->pdo->prepare($sql2);
				$param_names = SQLParser::parse_sql_params($sql2);
				//Application::wbsbreak("*sparam_names",$param_names,0,'a');
					
				*/
				
				/*
				$errors = array();
				foreach ($p_rowset as &$wrow)
				{
					$i=0;
					
					
					$row=array();
					foreach (array_keys($wrow) as $key){
						$p=strpos($key,".");
						$key1=$key;
						if($p>0) $key1=substr($key1,$p+1);
						$row[$key1]=$wrow[$key];
					
						$i++;
					};
					
					
					try
					{
						$params = array();
						self::import_sql_params($params, $param_names, $row);
						self::normalize_sql_params($params);
						Application::wbsbreak("*sparams",$params,0,'a');
						Application::wbsbreak("*sparam_names",$param_names,0,'a');
							
				
						$stmt->execute($params);
					}
					catch (PDOException $e)
					{
						$errors[]="error updating wbs part";
						Application::wbsbreak("esql2",$params,0,'a');
						throw new GUIException(array($errors));
					};
				
				};
				*/
				
			} ;
				
			
	}
	
		public function get_sql_delete_data
		(
			array $p_table_struct,
			array $p_filter = null,
			$p_filter_mode,
			&$p_sql
		)
		{
			$map_columns_filter = array();
			$map_values_filter = array();
			$legal_parents = array();
			
			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);

				switch ($c['obj_t'])
				{
					case 'T':
					{
						if ($c['action'] & self::ACTION_DELETE == 0)
						{
							return 1;
						}
					
						$legal_parents[] = $gui_hi;
						$table = $c['obj_nm'];
						$main_filter = $c['filter'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if ($c['pk'])
							{
								GUIUtils::add_to_list($pk_filter, ' and ', $c['obj_nm'].' = :'.$c['obj_nm']);
							}
							
							if ($c['filter_value'] !== null)
							{
								$map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
						}
						break;
					}
				}
			}

			if (!empty($main_filter))
			{
				$where .= '('.$main_filter.')';
			}
			
			switch ($p_filter_mode)
			{
				case self::FM_PK:
				{
					$user_filter = $pk_filter;
					break;
				}
				case self::FM_FILTER:
				{
					if (!empty($p_filter))
					{
						$user_filter = Filter::get_sql($p_filter, $map_columns_filter, self::$filter_callback, $map_values_filter);
					}
					break;
				}
			}
			
			if (!empty($user_filter))
			{
				GUIUtils::add_to_list($where, "\n and \n", '('.$user_filter.')');
			}
			
			if (!empty($where))
			{
				$where = "\n where \n".$where;
			}
			
			$p_sql = 'delete '.self::$table_alias.' from '.$table.' '.self::$table_alias.$where;
			
			return 0;
		}
		
		public function delete_data
		(
			array $p_table_struct,
			array $p_filter = null,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			
			$status = $this->get_sql_delete_data
			(
				$p_table_struct,
				$p_filter,
				self::FM_FILTER,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
			
			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			self::import_sql_params($params, $param_names);
			self::normalize_sql_params($params);
			try
			{
				$stmt->execute($params);
			}
			catch(Exception $e)
			{
				$error = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);
				throw new GUIException(array($error));
			}
			$p_row_count = $stmt->rowCount();
		}
		
		public function delete_row
		(
			array $p_table_struct,
			array &$p_row,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			
			if (empty($p_row))
			{
				return;
			}
			
			$status = $this->get_sql_delete_data
			(
				$p_table_struct,
				null,
				self::FM_PK,
				$sql
			);

			if ($status != 0)
			{
				return;
			}

			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			
			try
			{
				self::import_sql_params($params, $param_names, $p_row);
				self::normalize_sql_params($params);
				$stmt->execute($params);
			}
			catch (PDOException $e)
			{
				$error = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);					
				throw new GUIException(array($error));
			}
				
			$p_row_count += $stmt->rowCount();
			$row[self::$sql_row_count_tag] = $stmt->rowCount();
			
		}
		
		public function delete_rowset
		(
			array $p_table_struct,
			array &$p_rowset,
			&$p_row_count
		)
		{
			$p_row_count = 0;
			
			if (empty($p_rowset))
			{
				return;
			}
			
			$status = $this->get_sql_delete_data
			(
				$p_table_struct,
				null,
				self::FM_PK,
				$sql
			);

			if ($status != 0)
			{
				return;
			}
			
			$stmt = $this->pdo->prepare($sql);
			$param_names = SQLParser::parse_sql_params($sql);
			
			$errors = array();
			foreach ($p_rowset as &$row)
			{
				try
				{
					$params = array();
					self::import_sql_params($params, $param_names, $row);
					self::normalize_sql_params($params);
					$stmt->execute($params);
				}
				catch (PDOException $e)
				{
					$errors[] = DataSourceManager::ds()->get_error_info($e, $p_table_struct[0]['gui_hi']);					
				}
				
				$p_row_count += $stmt->rowCount();
				$row[self::$sql_row_count_tag] = $stmt->rowCount();
			}
			
			if (!empty($errors))
			{
				throw new GUIException($errors);
			}
		}
		
		public function get_tr_filter
		(
			$p_tr_gui_hi,
			array &$p_src_row,
			&$p_dst_table_gui_hi,
			&$p_dst_filter
		)
		{
			// Get the source table structure
			
			$src_table_gui_hi = GUIUtils::get_parent_hi($p_tr_gui_hi);
			$src_table_struct = DataSourceManager::ds()->get_obj_struct($src_table_gui_hi);
			
			// Get the source row
		
			$this->select_row
			(
				$src_table_struct,
				self::REPRESENT_ANY,
				$p_src_row,
				$row_style
			);
			
			// Get the TR structure
			
			foreach ($src_table_struct as &$c)
			{
				if ($c['gui_hi'] == $p_tr_gui_hi)
				{
					$tr_struct = $c;
					break;
				}
			}
			
			if ($tr_struct === null)
			{
				return;
			}
			
			$p_dst_table_gui_hi = $tr_struct['param'];
			$p_dst_filter = Serialization::js2php($tr_struct['filter']);
			
			if (!is_array($p_dst_filter))
			{
				$p_dst_filter = null;
				return;
			}
			
			// Replace source row values
			
			Filter::set_filter_values($p_dst_filter, $p_src_row);
		}

		public function get_select_lookup_val
		(
			$p_lookup_hi,
			$p_lookup_key
		)
		{
			$sql = <<<EOS
ifnull((
select 
	wbs.gui_get_gui_string(lookup_hi, :user_lang_id, 1)
from 
	wbs.wbs_gui_lookup
where 
	lookup_hi like '$p_lookup_hi%' 
	and lookup_param is null
	and lookup_key = $p_lookup_key
), $p_lookup_key)
EOS;
			return $sql;
		}
		
		public function get_select_lookup_bit_val
		(
			$p_lookup_hi,
			$p_lookup_key
		)
		{
			$sql = <<<EOS
ifnull((
select 
	group_concat(wbs.gui_get_gui_string(lookup_hi, :user_lang_id, 1) separator ';')
from 
	wbs.wbs_gui_lookup
where 
	lookup_hi like '$p_lookup_hi%' 
	and lookup_param is null
	and (lookup_key & $p_lookup_key) > 0
), $p_lookup_key)
EOS;
			return $sql;
		}

		public function get_sql_select_export_data
		(
			array $p_table_struct,
			array $p_columns = null,
			array $p_filter = null,
			array $p_sort = null,
			$p_number_format = null,
			$p_date_format = null,
			$p_csv_delimiter,
			$p_csv_quote,
			$p_csv_null,
			&$p_csv_header,
			&$p_sql
		)
		{
			$sql_number_format = self::quote($p_number_format);
			$sql_date_format = self::quote($p_date_format);
			
			$all_columns = array();
			$all_titles = array();

			$map_columns_filter = array();
			$map_values_filter = array();
			$map_columns_sort = array();
			$legal_parents = array();

			foreach ($p_table_struct as &$c)
			{
				$gui_hi = $c['gui_hi'];
				$parent_hi = GUIUtils::get_parent_hi($gui_hi);

				switch ($c['obj_t'])
				{
					case 'T':
					{
						if ($c['action'] & self::ACTION_SELECT == 0)
						{
							return 1;
						}
						
						$legal_parents[] = $gui_hi;
						$table = $c['select_value']?$c['select_value']:$c['obj_nm'];
						$main_filter = $c['filter'];
						$main_sort = $c['sort'];
						break;
					}
					case 'CG':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							$legal_parents[] = $gui_hi;
						}
						break;
					}
					case 'C':
					{
						if (in_array($parent_hi, $legal_parents))
						{
							if (
									($c['action'] & self::ACTION_SELECT)
								&&	($c['module_name'] == null || $c['module_enabled'])
								&&	($c['represent'] > 0)
							)
							{
								if ($c['export_value'] !== null)
								{
									$column_expr = '('.$c['export_value'].')';
								}
								elseif ($c['lookup_hi'] !== null)
								{
									if ($c['ctl_type'] == 'BITMASK')
									{
										$column_expr = $this->get_select_lookup_bit_val($c['lookup_hi'], ($c['select_value'] ? '('.$c['select_value'].')' : self::$table_alias.'.'.$c['obj_nm']));
									}
									else
									{
										$column_expr = $this->get_select_lookup_val($c['lookup_hi'], ($c['select_value'] ? '('.$c['select_value'].')' : self::$table_alias.'.'.$c['obj_nm']));
									}
								}
								else
								{
									$column_expr = $c['select_value'] === null ?
										$c['obj_nm'] : '('.$c['select_value'].')';
										
									switch ($c['data_type'])
									{
										case 'N':
										{
											break;
										}
										case 'DT':
										{
											if (!empty($p_date_format))
											{
												$column_expr = 'date_format('.$column_expr.', '.$sql_date_format.')';
											}
											break;
										}
									}
								}
								
								$all_columns[$c['obj_nm']] = $column_expr;
								$all_titles[$c['obj_nm']] = $c['title'];
							}
							
							if ($c['filter_value'] !== null)
							{
								$map_values_filter[$c['obj_nm']] = $c['filter_value'];
							}
							elseif ($c['select_value'] !== null)
							{
								$map_columns_filter[$c['obj_nm']] = $c['select_value'];
							}
							
							if ($c['sort'] !== null)
							{
								$map_columns_sort[$c['obj_nm']] = $this->expand_sql_template($c['sort'], self::$table_alias.'.'.$c['obj_nm']);
							}
						}
						break;
					}
				}
			}
				
			if (empty($p_columns))
			{
				$columns = array_values($all_columns);
				$titles = array_values($all_titles);
			}
			else
			{
				$columns = array();
				$titles = array();
			
				foreach ($p_columns as &$column_name)
				{
					if (array_key_exists($column_name, $all_columns))
					{
						$columns[] = $all_columns[$column_name];
						$titles[] = $all_titles[$column_name];
					}
				}
			}
			
			if (empty($columns))
			{
				return 2;
			}

			foreach ($titles as &$title)
			{
				if (!empty($p_csv_header))
				{
					$p_csv_header .= $p_csv_delimiter;
				}
				
				if (empty($p_csv_quote))
				{
					$p_csv_header .= $title;
				}
				else
				{
					$p_csv_header .=
						$p_csv_quote.
						str_replace($p_csv_quote, $p_csv_quote.$p_csv_quote, $title).
						$p_csv_quote;
				}
			}
			
			$sql_csv_delimiter = self::quote($p_csv_delimiter);

			// кавычка в виде кода
			// 1 вариант
		//	$sql_csv_quote = self::quote($p_csv_quote);
		//	$sql_csv_double_quote = self::quote($p_csv_quote.$p_csv_quote);

			// 2 вариант
			$sql_csv_quote = $p_csv_quote==="'"?'char(0x27)':self::quote($p_csv_quote);
			$sql_csv_double_quote = $p_csv_quote==="'"?'concat(char(0x27),char(0x27))':self::quote($p_csv_quote.$p_csv_quote);

			// кавычка в виде символа
			// 3 вариант
		//	$sql_csv_quote = 'q';
		//	$sql_csv_double_quote = 'd';

			$sql_csv_null = self::quote((string)$p_csv_null);

			foreach ($columns as &$column)
			{
				if (!empty($select_list))
				{
					$select_list .= ", ".$sql_csv_delimiter.",\n";
				}
				
				if (empty($p_csv_quote))
				{
					$select_list .= 'ifnull('.$column.', '.$sql_csv_null.')';
				}
				else
				{
					/*$select_list .=
						$sql_csv_quote.', '.
						'ifnull(replace('.$column.', '.$sql_csv_quote.', '.$sql_csv_double_quote.'), '.$sql_csv_null.'), '.
						$sql_csv_quote;*/
					$select_list .=
						'ifnull(concat('.$sql_csv_quote.', replace('.$column.', '.$sql_csv_quote.', '.$sql_csv_double_quote.'),'.$sql_csv_quote.'), '.$sql_csv_null.')';
				}
			}
			
			$select_list = "concat(\n".$select_list."\n)";
			
			if (!empty($main_filter))
			{
				$where .= '('.$main_filter.')';
			}
			
			$user_filter = empty($p_filter) ?
				null : Filter::get_sql($p_filter, $map_columns_filter, self::$filter_callback, $map_values_filter);

			if (!empty($user_filter))
			{
				GUIUtils::add_to_list($where, "\n and \n", '('.$user_filter.')');
			}

			if (!empty($where))
			{
				$where = "\n where \n".$where;
			}
			
			if (!empty($p_sort))
			{
				$user_sort = Sort::get_sql($p_sort, $map_columns_sort);
				$order_by = $user_sort;
			}
			else if (!empty($main_sort))
			{
				$main_sort = Sort::parse_sql($main_sort);
				$order_by = Sort::get_sql($main_sort, $map_columns_sort);
			}
			
			if (!empty($order_by))
			{
				$order_by = "\n order by ".$order_by;
			}
			
			// кавычка в виде кода
		//	$q = $p_csv_quote==="'"?'char(0x27)':self::quote($p_csv_quote);
		//	$d = $p_csv_quote==="'"?'concat(char(0x27),char(0x27))':self::quote($p_csv_quote.$p_csv_quote);

			// кавычка в виде символа(не поддерживается SQLParser'ом)
		//	$q = self::quote($p_csv_quote);
		//	$d = self::quote($p_csv_quote.$p_csv_quote);
			
			$p_sql = "select \n".$select_list."\n from ".$table." ".self::$table_alias." ".$where.$order_by;
			
			return 0;
		}
		
		public function export_data
		(
			array $p_table_struct,
			array $p_columns = null,
			array $p_filter = null,
			array $p_sort = null,
			$p_ostream
		)
		{
			try
			{
				if (empty($p_ostream))
				{
					return;
				}
	
				$status = $this->get_sql_select_export_data
				(
					$p_table_struct,
					$p_columns,
					$p_filter,
					$p_sort,
					DataSourceManager::ds()->get_gui_config('gui.csv.number_format'),
					DataSourceManager::ds()->get_gui_config('gui.csv.date_format'),
					DataSourceManager::ds()->get_gui_config('gui.csv.delimiter'),
					DataSourceManager::ds()->get_gui_config('gui.csv.quote'),
					DataSourceManager::ds()->get_gui_config('gui.csv.null'),
					$csv_header,
					$sql
				);
				
				$v_char_set = $this->get_gui_config('gui.csv.char_set');
				
				if ($status != 0)
				{
					return;
				}
				
				// CSV data
				
				$param_names = SQLParser::parse_sql_params($sql);
				self::import_sql_params($params, $param_names, DataSourceManager::$user_params);
				self::normalize_sql_params($params);
				$stmt = $this->pdo->prepare($sql);
				$stmt->execute($params);
			}
			catch(Exception $e)
			{
				$error = array('app_error_code' => "APP_ER_EXPORT");
				throw new GUIException(array($error));
			}
			
			// Unicode BOM
			$addBOM = DataSourceManager::ds()->get_gui_config('gui.csv.unicode_bom');
			if($addBOM)
			{
				if($v_char_set == "UTF8")
				{
					fwrite($p_ostream, chr(hexdec('EF')).chr(hexdec('BB')).chr(hexdec('BF')));
				}
				else if ($v_char_set == "UTF16")
				{
					fwrite($p_ostream, chr(hexdec('FE')).chr(hexdec('FF')));
				}
				else if ($v_char_set == "UTF32")
				{
					fwrite($p_ostream, chr(hexdec('00')).chr(hexdec('00')).chr(hexdec('FE')).chr(hexdec('FF')));
				}
			}
			
			
			$stmt->bindColumn(1, $csv_line);
			// CSV header
			$line = iconv("UTF-8", $v_char_set, $csv_header);
			if($line)
			{
				fwrite($p_ostream, $line);
			}
			else
			{
				fwrite($p_ostream, $csv_header);
			}
			
			while ($stmt->fetch(PDO::FETCH_BOUND))
			{
				$line = iconv("UTF-8", $v_char_set, $csv_line);
				if($line)
				{
					fwrite($p_ostream, "\n".strtr($line, array("\n"=>" ")));
				}
				else
				{
					fwrite($p_ostream, "\n".strtr($csv_line, array("\n"=>" ")));
				}	
				//fwrite($p_ostream, $csv_line."\n");
			}
		}
		
		public function log
		(
			$p_gui_hi,
			$p_action,
			$p_data,
			$p_filter,
			$p_row_count,
			$p_auth_log_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
insert into gui_log (user_id, gui_hi, action, data, filter, row_count, auth_log_id)
	values (:p_user_id, :p_gui_hi, :p_action, :p_data, :p_filter, :p_row_count, :auth_log_id)
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_gui_hi);
			$stmt->bindValue(':p_action', $p_action);
			$stmt->bindValue(':p_data', $p_data);
			$stmt->bindValue(':p_filter', $p_filter);
			$stmt->bindValue(':p_row_count', $p_row_count);			
			$stmt->bindValue(':auth_log_id', $p_auth_log_id);
			$stmt->execute();
		}
		
		public function cleanup_gui_log($p_lifetime)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
delete from gui_log
	where log_date <= now() - interval :p_lifetime second
EOS
				);
			}
			$stmt->bindValue(':p_lifetime', $p_lifetime);
			$stmt->execute();
		}

		public function cleanup_auth_log($p_lifetime)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
delete from wbs.gui_auth_log
	where login_date <= now() - interval :p_lifetime second
EOS
				);
			}
			$stmt->bindValue(':p_lifetime', $p_lifetime);
			$stmt->execute();
		}
		
		////////////////////////////
		
		public function get_constraint_info
		(
			$p_table_name,
			$p_constraint_id,
			&$p_columns,
			&$p_ref_table_name
		)
		{
			static $stmt_c;
			if ($stmt_c === null)
			{
				$stmt_c = $this->pdo->prepare(<<<EOS
select CONSTRAINT_NAME, CONSTRAINT_TYPE from information_schema.TABLE_CONSTRAINTS
	where TABLE_SCHEMA = schema() and TABLE_NAME = :p_table_name
EOS
				);
			}
			$stmt_c->bindValue(':p_table_name', $p_table_name);
			$stmt_c->execute();
			$constraints = $stmt_c->fetchAll(PDO::FETCH_ASSOC);
			$constraint = $constraints[intval($p_constraint_id)-1];
			
			static $stmt_cc;
			if ($stmt_cc === null)
			{
				$stmt_cc = $this->pdo->prepare(<<<EOS
select COLUMN_NAME, REFERENCED_TABLE_NAME from information_schema.KEY_COLUMN_USAGE
	where TABLE_SCHEMA = schema() and TABLE_NAME = :p_table_name
		and CONSTRAINT_NAME = :p_constraint_name
EOS
				);
			}
			$stmt_cc->bindValue(':p_table_name', $p_table_name);
			$stmt_cc->bindValue(':p_constraint_name', $constraint['CONSTRAINT_NAME']);
			$stmt_cc->execute();
			$key_columns = $stmt_cc->fetchAll(PDO::FETCH_ASSOC);
			$p_ref_table_name = $key_columns[0]['REFERENCED_TABLE_NAME'];
			$p_columns = array();
			foreach ($key_columns as &$row)
			{
				$p_columns[] = $row['COLUMN_NAME'];
			}
		}
		
		public function &get_infschema_columns
		(
			$p_table_name,
			$p_column_name
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select * from information_schema.COLUMNS
	where TABLE_SCHEMA = schema() and TABLE_NAME = :p_table_name and column_name = :p_column_name
EOS
				);
			}

			$stmt->bindValue(':p_table_name', $p_table_name);
			$stmt->bindValue(':p_column_name', $p_column_name);
			$stmt->execute();
			$row = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			return $row;
		}
		
		public function get_app_error
		(
			&$p_error_code,
			&$p_error_table,
			&$p_error_data
		)
		{
			$stmt = $this->pdo->query('select @error_code, @error_table, @error_data');
			list($p_error_code, $p_error_table, $p_error_data) = $stmt->fetch(PDO::FETCH_NUM);
		}

		public function get_error
		(
			$p_error_info
		)
		{
			$main_ds = DataSourceManager::ds();
			$sql_code = $p_error_info['code'];
			$sql_msg = $p_error_info['message'];
			$app_error_code = $p_error_info['app_error_code'];
			$app_error_table = $p_error_info['app_error_table'];
			$app_error_data = $p_error_info['app_error_data'];

			Application::wbsbreak("get_error",$sql_code .":".$sql_msg,0,'');
				
			
			if (!empty($app_error_code))
			{
				// Handling user-defined (non-standard) application errors

				$error = $main_ds->get_string(null, $app_error_code, 'E');
				$titles = array();

				switch ($app_error_code)
				{
					case 'APP_ER_ROW_IS_REFERENCED_USING_TRIGGER':
					{
						list($columns, $ref_table, $ref_columns) = explode(';', $app_error_data);

						$table_gui_object = $main_ds->find_gui_object(null, $app_error_table, 'T');
						$table_title = '"'.$main_ds->get_string($table_gui_object['obj_hi']).'"';
						$table_gui_hi = $table_gui_object['gui_hi'];

						$ref_table_gui_object = $main_ds->find_gui_object(null, $ref_table, 'T');
						$ref_table_title = '"'.$main_ds->get_string($ref_table_gui_object['obj_hi']).'"';
						$ref_table_gui_hi = $ref_table_gui_object['gui_hi'];

						$ref_columns = explode(',', $ref_columns);
						$ref_columns_titles = array();
						foreach ($ref_columns as $ref_column)
						{
							$c = $main_ds->find_gui_object($ref_table_gui_hi.'%', $ref_column, 'C');
							$ref_columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
						}

						$titles[] = $table_title;
						$titles[] = $ref_table_title;
						$titles[] = $ref_columns_titles;

						break;
					}

					case 'APP_ER_DUP_KEY_IN_TABLES':
					{
						list($columns, $ref_table, $ref_columns) = explode(';', $app_error_data);

						$table_gui_object = $main_ds->find_gui_object(null, $app_error_table, 'T');
						$table_title = '"'.$main_ds->get_string($table_gui_object['obj_hi']).'"';
						$table_gui_hi = $table_gui_object['gui_hi'];
						$ref_table_gui_object = $main_ds->find_gui_object(null, $ref_table, 'T');
						$ref_table_title = '"'.$main_ds->get_string($ref_table_gui_object['obj_hi']).'"';
						$ref_table_gui_hi = $ref_table_gui_object['gui_hi'];

						$columns = explode(',', $columns);
						$columns_titles = array();
						foreach ($columns as $column)
						{
							$c = $main_ds->find_gui_object($table_gui_hi.'%', $column, 'C');
							$columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
						}

						$ref_columns = explode(',', $ref_columns);
						$ref_columns_titles = array();
						foreach ($ref_columns as $ref_column)
						{
							$c = $main_ds->find_gui_object($ref_table_gui_hi.'%', $ref_column, 'C');
							$ref_columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
						}

						$titles[] = $table_title;
						$titles[] = $columns_titles;
						$titles[] = $ref_table_title;
						$titles[] = $ref_columns_titles;

						break;
					}

					case 'APP_ER_NOT_NULL_DEPENDENCY':
					case 'APP_ER_UNIQUE_DEPENDENCY':
					{
						list($error_columns, $dep_columns) = explode(';', $app_error_data);

						$table_gui_object = $main_ds->find_gui_object(null, $app_error_table, 'T');
						$table_gui_hi = $table_gui_object['gui_hi'];

						$error_columns = explode(',', $error_columns);
						$error_columns_titles = array();
						foreach ($error_columns as $error_column)
						{
							$c = $main_ds->find_gui_object($table_gui_hi.'%', $error_column, 'C');
							$error_columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
						}

						$dep_columns = explode(',', $dep_columns);
						$dep_columns_titles = array();
						foreach ($dep_columns as $dep_column)
						{
							$c = $main_ds->find_gui_object($table_gui_hi.'%', $dep_column, 'C');
							$dep_columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
						}

						$titles[] = $error_columns_titles;
						$titles[] = $dep_columns_titles;

						break;
					}

					case 'APP_ER_CHECK_PATTERN_FAIL':
					case 'APP_ER_CHECK_MIN_FAIL':
					case 'APP_ER_CHECK_MAX_FAIL':
					{
						list($column_name, $constraint, $value)  = explode(';', $app_error_data);

						$table_gui_object = $main_ds->find_gui_object(null, $app_error_table, 'T');
						$table_gui_hi = $table_gui_object['gui_hi'];

						$column_struct = $main_ds->find_gui_object($table_gui_hi.'%', $column_name, 'C');
						$column_title = '"'.$main_ds->get_string($column_struct['obj_hi']).'"';

						$titles[] = $column_title;
						$titles[] = $constraint;
						$titles[] = $value;

						break;
					}

					case 'APP_ER_EXPRESSION_VAILD_FAILED':
					case 'APP_ER_INVALID_NETMASK':
					case 'MVTS_ER_NODE_NOT_FOUND':
					case 'MVTS_ER_TABLE_NOT_FOUND':
					{
						$titles[] = $app_error_data;
						break;
					}

					case 'APP_ER_SELF_REF':
					{
						
						list($error_column, $dep_columns) = explode(';', $app_error_data);

						$dep_columns = explode(',', $dep_columns);
						$dep_columns_titles = array();

						$titles[] = "$error_column";
						foreach ($dep_columns as $column)
						{
							$titles[]="$column";
						}

						break;
					}

					default:
					{
						if($error == null)
						{
							$error = $app_error_code.' ('.$app_error_data.')';
						}
					}
				}

				return GUIUtils::format_string($error, $titles);
			}
			else
			{
				// Handling database errors

				// See full list of MySQL server error codes and messages at
				// http://dev.mysql.com/doc/refman/5.1/en/error-messages-server.html

				if ($p_error_info['gui_hi'] !== null)
				{
					$t = $main_ds->find_gui_object($p_error_info['gui_hi'], null, 'T');
					$table_name = $t['obj_nm'];
					$table_gui_hi = $t['gui_hi'];
					$table_obj_hi = $t['obj_hi'];
				}
				switch ($sql_code)
				{
					case 126:
					{
						return $main_ds->get_string(null, 'ER_INCORECT_KEY_FILE', 'E');
						break;
					}
					case 1048:
					{
						// Error: 1048 SQLSTATE: 23000 (ER_BAD_NULL_ERROR)
						// Message: Column '%s' cannot be null

						if (ereg('^Column \'(.*)\' cannot be null$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_BAD_NULL_ERROR', 'E');

							$c = $main_ds->find_gui_object($table_gui_hi.'.%', $regs[1], 'C');
							$column_title = '"'.$main_ds->get_string($c['obj_hi']).'"';

							return GUIUtils::format_string($error, array($column_title));
						}
						
						break;
					}

					case 1062:
					{
						// Error: 1062 SQLSTATE: 23000 (ER_DUP_ENTRY)
						// Message: Duplicate entry '%s' for key %d

						if (ereg('^Duplicate entry \'(.*)\' for key ([0-9]+)$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_DUP_ENTRY', 'E');

							$this->get_constraint_info($table_name, $regs[2], $columns, $ref_table_name);

							$columns_titles = array();
							foreach ($columns as $column_name)
							{
								$c = $main_ds->find_gui_object($table_gui_hi.'.%', $column_name, 'C');
								$columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							}
							$table_title = '"'.$main_ds->get_string($table_obj_hi).'"';

							return GUIUtils::format_string($error, array($table_title, $columns_titles));
						}
			
						break;
					}

					case 1264:
					{
						// Error: 1264 SQLSTATE: 22003 (ER_WARN_DATA_OUT_OF_RANGE)
						// Message: Out of range value for column '%s' at row %ld 

						if (ereg('^Out of range value (adjusted )?for column \'(.*)\' at row .*$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_WARN_DATA_OUT_OF_RANGE', 'E');

							$columns_titles = array();
							$c = $main_ds->find_gui_object($table_gui_hi.'.%', $regs[2], 'C');
							$columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';

							return GUIUtils::format_string($error, array($columns_titles));
						}

						break;
					}

					case 1366:
					{
						// Error: 1366 SQLSTATE: HY000 (ER_TRUNCATED_WRONG_VALUE_FOR_FIELD)
						// Message: Incorrect %s value: '%s' for column '%s' at row %ld

						if (ereg('^Incorrect .* value: \'(.*)\' for column \'(.*)\' at row .*$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'E');
							$titles = array();
							$titles[] = '"'.$regs[1].'"';
							$c = $main_ds->find_gui_object($table_gui_hi.'.%', $regs[2], 'C');
							$titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							$info = $this->get_infschema_columns($table_name, $regs[2]);
							$titles[] = '"'.$info[0]['DATA_TYPE'].'"';

							return GUIUtils::format_string($error, $titles);
						}

						break;
					}

					case 1406:
					{
						// Error: 1406 SQLSTATE: 22001 (ER_DATA_TOO_LONG)
						// Message: Data too long for column '%s' at row %ld

						if (ereg('^Data too long for column \'(.*)\' at row .*$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_DATA_TOO_LONG', 'E');
							$titles = array();
							$c = $main_ds->find_gui_object($table_gui_hi.'.%', $regs[1], 'C');
							$titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							$info = $this->get_infschema_columns($table_name, $regs[1]);
							$titles[] = $info[0]['CHARACTER_MAXIMUM_LENGTH'];
							return GUIUtils::format_string($error, $titles);
						}

						break;
					}

					case 1451:
					{
						// Error: 1451 SQLSTATE: 23000 (ER_ROW_IS_REFERENCED_2)
						// Message: Cannot delete or update a parent row: a foreign key constraint fails (%s)

						if (ereg('^Cannot delete or update a parent row: a foreign key constraint fails \(`.*\/(.*)`, CONSTRAINT `.*` FOREIGN KEY \((.*)\) REFERENCES `.*` \((.*)\).*\)$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_ROW_IS_REFERENCED_2', 'E');

							$table_title = '"'.$main_ds->get_string($table_obj_hi).'"';

							$columns = explode(',', $regs[3]);
							$columns_titles = array();
							foreach ($columns as $column)
							{
								$column = trim($column, '`');
								$c = $main_ds->find_gui_object($table_gui_hi.'.%', $column, 'C');
								$columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							}

							$ref_table_gui_object = $main_ds->find_gui_object(null, $regs[1], 'T');
							$ref_table_title = '"'.$main_ds->get_string($ref_table_gui_object['obj_hi']).'"';
							$ref_table_gui_hi = $ref_table_gui_object['gui_hi'];

							$ref_columns = explode(',', $regs[2]);
							$ref_columns_titles = array();
							foreach ($ref_columns as $ref_column)
							{
								$ref_column = trim($ref_column, '`');
								$c = $main_ds->find_gui_object($ref_table_gui_hi.'.%', $ref_column, 'C');
								$ref_columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							}

							$titles = array();
							$titles[] = $table_title;
							$titles[] = $columns_titles;
							$titles[] = $ref_table_title;
							$titles[] = $ref_columns_titles;

							return GUIUtils::format_string($error, $titles);
						}

						break;
					}

					case 1452:
					{
						// Error: 1452 SQLSTATE: 23000 (ER_NO_REFERENCED_ROW_2)
						// Message: Cannot add or update a child row: a foreign key constraint fails (%s)

						if (ereg('^Cannot add or update a child row: a foreign key constraint fails \(`.*`, CONSTRAINT `.*` FOREIGN KEY \((.*)\) REFERENCES `(.*)` \((.*)\).*\)$', $sql_msg, $regs))
						{
							$error = $main_ds->get_string(null, 'ER_NO_REFERENCED_ROW_2', 'E');

							$table_title = '"'.$main_ds->get_string($table_obj_hi).'"';

							$columns = explode(',', $regs[1]);
							$columns_titles = array();
							foreach ($columns as $column)
							{
								$column = trim($column, '`');
								$c = $main_ds->find_gui_object($table_gui_hi.'.%', $column, 'C');
								$columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							}

							$ref_table_gui_object = $main_ds->find_gui_object(null, $regs[2], 'T');
							$ref_table_title = '"'.$main_ds->get_string($ref_table_gui_object['obj_hi']).'"';
							$ref_table_gui_hi = $ref_table_gui_object['gui_hi'];

							$ref_columns = explode(',', $regs[3]);
							$ref_columns_titles = array();
							foreach ($ref_columns as $ref_column)
							{
								$ref_column = trim($ref_column, '`');
								$c = $main_ds->find_gui_object($ref_table_gui_hi.'.%', $ref_column, 'C');
								$ref_columns_titles[] = '"'.$main_ds->get_string($c['obj_hi']).'"';
							}

							$titles = array();
							$titles[] = $table_title;
							$titles[] = $columns_titles;
							$titles[] = $ref_table_title;
							$titles[] = $ref_columns_titles;

							return GUIUtils::format_string($error, $titles);
						}

						break;
					}
				}
			}
			
			return $sql_msg;
		}
		
		////////////////////////////
		
		public function get_sql_select_count_wrap
		(
			$p_table_gui_hi,
			array $p_filter = null,
			$p_count_limit = null,
			&$p_sql
		)
		{
			return $this->get_sql_select_count
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_filter,
				$p_count_limit,
				$p_sql
			);
		}
		
		public function count_rows_wrap
		(
			$p_table_gui_hi,
			array $p_filter = null,
			$p_count_limit = null,
			&$p_row_count
		)
		{
			return $this->count_rows
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_filter,
				$p_count_limit,
				$p_row_count
			);
		}

		public function get_sql_select_data_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			array $p_filter = null,
			array $p_sort = null,
			$p_filter_mode,
			&$p_sql
		)
		{
			return $this->get_sql_select_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_filter,
				$p_sort,
				$p_filter_mode,
				$p_sql
			);
		}

		public function select_data_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			array $p_filter = null,
			array $p_sort = null,
			$p_limit,
			$p_offset,
			&$p_rowset,
			&$p_rowset_style
		)
		{
			return $this->select_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_filter,
				$p_sort,
				$p_limit,
				$p_offset,
				$p_rowset,
				$p_rowset_style
			);
		}
		
		public function select_data_and_count_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			array $p_filter = null,
			array $p_sort = null,
			$p_limit,
			$p_offset,
			$p_use_count_limit,
			&$p_count_limit,
			&$p_row_count,
			&$p_rowset,
			&$p_rowset_style
		)
		{
			return $this->select_data_and_count
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_filter,
				$p_sort,
				$p_limit,
				$p_offset,
				$p_use_count_limit,
				$p_count_limit,
				$p_row_count,
				$p_rowset,
				$p_rowset_style
			);
		}
		
		public function select_row_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			&$p_row,
			&$p_row_style
		)
		{
			return $this->select_row
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_row,
				$p_row_style
			);
		}
		
		public function select_rowset_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			&$p_rowset
		)
		{
			return $this->select_rowset
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_rowset
			);
		}
		
		public function get_sql_select_initial_values_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			&$p_sql
		)
		{
			return $this->get_sql_select_initial_values
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_sql
			);
		}

		public function get_initial_values_wrap
		(
			$p_user_params,
			$p_table_gui_hi,
			$p_represent,
			&$p_initial_values
		)
		{
			return $this->get_initial_values
			(
				$p_user_params,
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_initial_values
			);
		}

		public function get_sql_select_common_values_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			array $p_filter = null,
			&$p_sql
		)
		{
			return $this->get_sql_select_common_values
			(
				DataSourceManager::ds()->get_gui_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_filter,
				$p_sql
			);
		}
		
		public function select_common_values_wrap
		(
			$p_table_gui_hi,
			$p_represent,
			array $p_filter = null,
			&$p_row_count,
			&$p_common_values
		)
		{
			return $this->select_common_values
			(
				DataSourceManager::ds()->get_gui_obj_struct($p_table_gui_hi),
				$p_represent,
				$p_filter,
				$p_row_count,
				$p_common_values
			);
		}

		public function get_sql_insert_data_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			&$p_sql
		)
		{
			return $this->get_sql_insert_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_sql
			);
		}

		public function insert_row_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array &$p_row,
			&$p_row_count
		)
		{
			return $this->insert_row
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_row,
				$p_row_count
			);
		}

		public function insert_rowset_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array &$p_rowset,
			&$p_row_count
		)
		{
			return $this->insert_rowset
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_rowset,
				$p_row_count
			);
		}

		public function get_sql_update_data_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array $p_filter = null,
			$p_filter_mode,
			&$p_sql
		)
		{
		//	Application::wbsbreak("get_sql_update_data_wrap",$p_columns,0,'a');
			
			$this->get_sql_update_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_filter,
				$p_filter_mode,
				$p_sql
			);
		}
		
		public function update_data_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array $p_filter = null,
			array &$p_row,
			&$p_row_count
		)
		{
			return $this->update_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_filter,
				$p_row,
				$p_row_count
			);
		}

		public function update_row_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array &$p_row,
			&$p_row_count
		)
		{
			return $this->update_row
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_row,
				$p_row_count
			);
		}

		public function update_rowset_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array &$p_rowset,
			&$p_row_count
		)
		{
			return $this->update_rowset
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_rowset,
				$p_row_count
			);
		}

		public function get_sql_delete_data_wrap
		(
			$p_table_gui_hi,
			array $p_filter = null,
			$p_filter_mode,
			&$p_sql
		)
		{
			return $this->get_sql_delete_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_filter,
				$p_filter_mode,
				$p_sql
			);
		}
		
		public function delete_data_wrap
		(
			$p_table_gui_hi,
			array $p_filter = null,
			&$p_row_count
		)
		{
			return $this->delete_data
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_filter,
				$p_row_count
			);
		}
		
		public function delete_row_wrap
		(
			$p_table_gui_hi,
			array &$p_row,
			&$p_row_count
		)
		{
			return $this->delete_row
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_row,
				$p_row_count
			);
		}
		
		public function delete_rowset_wrap
		(
			$p_table_gui_hi,
			array &$p_rowset,
			&$p_row_count
		)
		{
			return $this->delete_rowset
			(
				DataSourceManager::ds()->get_obj_struct($p_table_gui_hi),
				$p_rowset,
				$p_row_count
			);
		}
		
		public function get_sql_select_export_data_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array $p_filter = null,
			array $p_sort = null,
			$p_number_format = null,
			$p_date_format = null,
			$p_csv_delimiter,
			$p_csv_quote,
			&$p_csv_header,
			&$p_sql
		)
		{
			return $this->get_sql_select_export_data
			(
				DataSourceManager::ds()->get_gui_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_filter,
				$p_sort,
				$p_number_format,
				$p_date_format,
				$p_csv_delimiter,
				$p_csv_quote,
				$p_csv_header,
				$p_sql
			);
		}
		
		public function export_data_wrap
		(
			$p_table_gui_hi,
			array $p_columns = null,
			array $p_filter = null,
			array $p_sort = null,
			$p_ostream
		)
		{
			return $this->export_data
			(
				DataSourceManager::ds()->get_gui_obj_struct($p_table_gui_hi),
				$p_columns,
				$p_filter,
				$p_sort,
				$p_ostream
			);
		}
		
		////////////////////////////
		/*Old filters*/
		/*
		function get_user_filters
		(
			$p_table_gui_hi,
			&$p_filters
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select filter_id, filter_nm
	from wbs.wbs_gui_user_filter
	where user_id = :p_user_id
		and gui_hi = :p_gui_hi
	order by filter_nm
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_table_gui_hi);
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			$p_filters = array();
			foreach ($rowset as &$row)
			{
				$p_filters[$row[0]] = $row[1];
			}
		}
		
		function get_user_filter
		(
			$p_filter_id,
			$p_table_gui_hi,
			&$p_filter
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select filter
	from wbs.wbs_gui_user_filter
	where filter_id = :p_filter_id
		and user_id = :p_user_id
		and gui_hi = :p_gui_hi
EOS
				);
			}
			$stmt->bindValue(':p_filter_id', $p_filter_id);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_table_gui_hi);
			$stmt->execute();
			$row = $stmt->fetch(PDO::FETCH_NUM);
			$p_filter = $row !== false ? @unserialize($row[0]) : null;
		}
		
		public function save_user_filter
		(
			$p_table_gui_hi,
			$p_filter_nm,
			$p_is_public,
			&$p_filter,
			&$p_filter_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
insert into wbs.wbs_gui_user_filter (user_id, gui_hi, filter_nm, filter)
	values (:p_user_id, :p_gui_hi, :p_filter_nm, :p_filter)
	on duplicate key update
		filter_id = last_insert_id(filter_id),
		filter = :p_filter
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_table_gui_hi);
			$stmt->bindValue(':p_filter_nm', $p_filter_nm);
			$stmt->bindValue(':p_filter', serialize($p_filter));
			$stmt->execute();
			$p_filter_id = (int)$this->pdo->lastInsertId();
		}
		
		public function delete_user_filter
		(
			$p_filter_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
delete from wbs.wbs_gui_user_filter
	where filter_id = :p_filter_id
		and user_id = :p_user_id
EOS
				);
			}
			$stmt->bindValue(':p_filter_id', $p_filter_id);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->execute();
		}*/
		
		function get_user_filters
		(
			$p_table_gui_hi,
			$p_id,
			$p_is_view,
			&$p_filters,
			$p_only_user = true
		)
		{
			$p_id = $p_id?$p_id:'%';
			if($p_is_view!==null)
			{
				$view_cond = $p_is_view?'and is_view = 1':'and (is_view <> 1 or is_view is null)';
			}
			$p_table_gui_hi = $p_table_gui_hi?$p_table_gui_hi:'%';
			$user_cond = $p_only_user ? 'user_id = :p_user_id or (is_public = 1 and user_id is not null)' : 'user_id = :p_user_id or user_id is null or is_public = 1';
			
			static $stmt;
			$stmt = $this->pdo->prepare(<<<EOS
select filter_id id, user_id, gui_hi, filter_nm name, filter, is_view, is_public
	from wbs.wbs_gui_user_filter t
	where 
		($user_cond)
	and filter_id like :p_id and gui_hi like :p_table_gui_hi $view_cond
	order by user_id, filter_nm
EOS
			);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_table_gui_hi', $p_table_gui_hi);
			$stmt->bindValue(':p_id', $p_id);
			$stmt->execute();
			$rowset = $stmt->fetchAll(PDO::FETCH_ASSOC);
			$p_filters = array();
			foreach ($rowset as &$row)
			{
				$row['filter'] = Serialization::is_serialized($row['filter']) ? unserialize($row['filter']) : json_decode($row['filter'],true);
				$p_filters[] = $row;
			}
		}
		
		
		public function save_user_filter
		(
			$p_table_gui_hi,
			$p_filter_nm,
			$p_is_public,
			$p_is_view,
			&$p_filter,
			&$p_filter_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				if(!$p_filter_id)
				{
					$stmt = $this->pdo->prepare(<<<EOS
insert into wbs.wbs_gui_user_filter (user_id, gui_hi, filter_nm, filter, is_view, is_public)
	values (:p_user_id, :p_gui_hi, :p_filter_nm, :p_filter, :p_is_view, :p_is_public)
EOS
					);
					$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
					$stmt->bindValue(':p_gui_hi', $p_table_gui_hi);
					$stmt->bindValue(':p_filter_nm', $p_filter_nm);
					$stmt->bindValue(':p_filter', json_encode($p_filter));
					$stmt->bindValue(':p_is_view', $p_is_view);
					$stmt->bindValue(':p_is_public', $p_is_public);
				}
				else
				{
					$stmt = $this->pdo->prepare(<<<EOS
update wbs.wbs_gui_user_filter set
	filter = :p_filter,
	is_view = :p_is_view,
	is_public = :p_is_public,
	filter_nm = :p_filter_nm
where filter_id = :p_filter_id
EOS
					);
					$stmt->bindValue(':p_filter_nm', $p_filter_nm);
					$stmt->bindValue(':p_filter', json_encode($p_filter));
					$stmt->bindValue(':p_filter_id', $p_filter_id);
					$stmt->bindValue(':p_is_view', $p_is_view);
					$stmt->bindValue(':p_is_public', $p_is_public);
				}
			}
			$stmt->execute();
		}
		
		public function delete_user_filter
		(
			$p_filter_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
delete from wbs.wbs_gui_user_filter
	where filter_id = :p_filter_id
		and user_id = :p_user_id
EOS
				);
			}
			$stmt->bindValue(':p_filter_id', $p_filter_id);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->execute();
		}
		
		public function get_equal_filter_tables
		(
			$p_tab_gui_hi,
			&$p_equal_tab_gui_hi
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select param
from wbs.wbs_gui_struct 
where gui_hi like :p_tab_gui_hi
and obj_t = 'EFR'
EOS
				);
			}
			$stmt->bindValue(':p_tab_gui_hi', $p_tab_gui_hi.'%');
			$stmt->execute();
			
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			
			$p_equal_tab_gui_hi = array();
			foreach ($rowset as &$row)
			{
				$p_equal_tab_gui_hi[] = $row[0];
			}
		}
		
		public function save_user_column_arrange
		(
			$p_table_gui_hi,
			$p_arrange_nm,
			$p_columns,
			&$p_arrange_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
insert into wbs.wbs_gui_user_arrange (user_id, gui_hi, arrange_nm, columns)
	values (:p_user_id, :p_gui_hi, :p_arrange_nm, :p_columns)
	on duplicate key update
		arrange_id = last_insert_id(arrange_id),
		columns = :p_columns
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_table_gui_hi);
			$stmt->bindValue(':p_arrange_nm', $p_arrange_nm);
			$stmt->bindParam(':p_columns', serialize($p_columns));
			$stmt->execute();
			$p_arrange_id = (int)$this->pdo->lastInsertId();
		}

		public function get_user_column_arranges
		(
			$p_table_gui_hi,
			&$p_arranges
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
select arrange_id, arrange_nm, columns
	from wbs.wbs_gui_user_arrange
	where user_id = :p_user_id
		and gui_hi = :p_gui_hi
EOS
				);
			}
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_gui_hi', $p_table_gui_hi);
			$stmt->execute();
			
			$rowset = $stmt->fetchAll(PDO::FETCH_NUM);
			$p_arranges = array();
			
			foreach($rowset as &$row)
			{
				$p_arranges[$row[0]] = array(
					'arrange_nm' => $row[1],
					'columns' => unserialize($row[2])
				);
			}
		}
		
		public function delete_user_column_arrange
		(
			$p_arrange_id
		)
		{
			static $stmt;
			if ($stmt === null)
			{
				$stmt = $this->pdo->prepare(<<<EOS
delete from wbs.wbs_gui_user_arrange
	where arrange_id = :p_arrange_id
		and user_id = :p_user_id
EOS
				);
			}
			$stmt->bindValue(':p_arrange_id',$p_arrange_id);
			$stmt->bindValue(':p_user_id', DataSourceManager::$user_id);
			$stmt->execute();
		}

		public function beginTransaction()
		{
			$this->pdo->beginTransaction();
		}

		public function commit()
		{
			$this->pdo->commit();
		}

		public function rollBack()
		{
			$this->pdo->rollBack();
		}
		
		public function compile_role
		(
			$p_role_id
		)
		{
			$this->call('gui_compile_role_tree', array($p_role_id));
		}


		public function get_menu_id($p_hi, &$p_menu_id, $pk)
		{
			static $stmt;
			$stmt = $this->pdo->prepare(<<<EOS
select
	s.obj_t,
	s.gui_hi,
	s.select_value
from
	wbs.wbs_gui_struct s,
	wbs.wbs_gui_role_set rs
where
		s.reference in(:p_hi, gui_get_parent_hi(:p_hi))
	and s.obj_t in ('M', 'MG')
	and	s.obj_hi = rs.obj_hi
	and 1 & rs.action = 1
limit 1
EOS
			);
			$stmt->bindValue(':p_hi', $p_hi);
			$stmt->execute();
			$row = $stmt->fetch(PDO::FETCH_NUM);
			if($row !== false)
			{
				$p_menu_id = $row[1];
				if($row[0] == 'MG')
				{
					$pk_value = count($pk) ? reset($pk) : "";
					$children_lines = $this->query($row[2]);
					foreach ($children_lines as $line)
					{
						if($pk_value == $line['menu_id'])
						{
							$p_menu_id .= '.'.$pk_value;
							break;
						}
					}
				}
			}
			else
			{
				$p_menu_id = null;
			}
		}
		public function get_relations
		(
			$p_relation_id
		)
		{
			static $stmt;
			$stmt = $this->pdo->prepare(<<<EOS
select * from gui_relation_set where relation_id = :relation_id order by priority
EOS
			);
			$stmt->bindValue(':relation_id', $p_relation_id);
			$stmt->execute();
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		}
		
		public function chart_get_data
		(
			&$p_chart
		)
		{
			$data = Array();
			$selects = Array();
			foreach($p_chart->ChildClasses['String'] as &$line)
			{
				$selects[] = $line->SELECT_VALUE;
			}
			if(count($selects) == 0)
			{
				return array();
			}
			foreach($selects as $select)
			{
				try
				{
					$data[] = $this->query($select, array(), PDO::FETCH_NUM);
				}
				catch(Exception $e)
				{
					$data[] = Array();
				}
			}
			return $data;
		}
	
//----------------------------BEGIN Import functions BEGIN----------------------------------//

		public function import_init
		(
			$p_table_nm,
			$p_work_dir,
			$p_uk
		)
		{
			$stmt = $this->pdo->prepare(<<<EOS
insert into gui_import(start_date, user_id, table_nm, work_dir)
values(sysdate(), :user_id, :table_nm, :work_dir)
EOS
			);
			$stmt->bindValue(':user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':table_nm', $p_table_nm);
			$stmt->bindValue(':work_dir', $p_work_dir);
			$stmt->execute();
			return $this->pdo->lastInsertId();
		}
		
		public function import_drop
		(
			$p_import_id
		)
		{
			$stmt = $this->pdo->prepare('delete from gui_import where import_id = :p_import_id');
			$stmt->bindValue(':p_import_id', $p_import_id, PDO::PARAM_INT);
			$stmt->execute();
		}
		
		public function import_exists
		(
			$p_import_id
		)
		{
			$stmt = $this->pdo->prepare('select count(*) from gui_import where import_id = :p_import_id');
			$stmt->bindValue(':p_import_id', $p_import_id, PDO::PARAM_INT);
			$stmt->execute();
			$exists = reset(reset($stmt->fetchAll(PDO::FETCH_ASSOC)));
			return (bool)$exists;
		}
		
		public function import_drop_checkdata
		(
			$p_import_id
		)
		{
			$stmt = $this->pdo->prepare('delete from gui_import_data_check where import_id = :p_import_id');
			$stmt->bindValue(':p_import_id', $p_import_id, PDO::PARAM_INT);
			$stmt->execute();
		}
		
		public function import_create_load_file_temp
		(
			$p_file,
			$p_separator,
			$p_quote,
			&$p_file_temp
		)
		{
			$p_file_temp = substr($p_file,0,-4).'_temp.csv';
			
			static $enable_replacing_slashes = true;
			
			if (empty($enable_replacing_slashes))
			{
				// No replace slashes
				exec('cp '.$p_file.' '.$p_file_temp);
			}
			else
			{
				// Replace from single slash to double slash into temp file
				/*
					Выполняем дополнительную обработку загружаемого файла и добавляем в данные дублирующий слеш.
					Поскольку имеется спец. символ \N, который обозначет в MySQL NULL, то необходимо выполнить
					хитрую обработку:
						1. Удваиваем слеши, стоящие перед всем символами, кроме "N" и "\" и в конце
						2. Заменяем \N на \M, в тех местах где он обозначает NULL
						3. Удваиваем слеши, стоящие перед N
						4. Заменяем \M на \N
					Дополнение:
					Команда обработки для sed, написанная ниже, 
					не поддерживает дублирование слешей для данных, содержащих строку ";\N;".
				*/
				$sed_command = "sed"
					.' -e \'s/([\\]+)([^N\\]|$)/\1\1\2/g\''         // Replace (\+)([^N\]) -> \1\1\2 (doubled non-N slashes)
					.' -e \'s/(^|;)("\?)([\\])N\2(;|$)/\1\3M\4/g\'' // Replace (^|;)"?(\)N"?(;|$) -> \1\M\3 (transform "N with one slash" to "M with one slash")
					.' -e \'s/(^|;)("\?)([\\])N\2(;|$)/\1\3M\4/g\'' // Replace (^|;)"?(\)N"?(;|$) -> \1\M\3 (dublicate previous transform for even str)
					.' -e \'s/([\\]+)N/\1\1N/g\''                   // Replace (\+)N -> \1\1N (doubled N slashes)
					.' -e \'s/(^|[^\\])([\\])M/\1\2N/g\''           // Replace (^|;)\M(;|$) -> \1\N\2 (transform "M with one slash" to "N with one slash")
					.''; 
				
				$sep   = '\\o'.str_pad(decoct(ord($p_separator)),3,'0',STR_PAD_LEFT); // Transform char to octal code for sed utility
				$quote = '\\o'.str_pad(decoct(ord($p_quote)),3,'0',STR_PAD_LEFT);     // Transform char to octal code for sed utility
				/*
					Строка команды ($sed_command, см. выше) написана без учета рабочий символов регулярных выражений утилиты sed.
					Так сделано для лучшего восприятия регулярных выражений.
					Ниже выполняем преобразование рабочих символов, чтобы выражение было корректным для sed.
					Плюс к этому заменяем символы разделителя и qoute на восмиричные коды.
				*/
				$replace_arr = array(
					'('=>'\(',')'=>'\)','|'=>'\|','+'=>'\+','{'=>'\{','}'=>'\}' // Escaped work regexp chars
					,';' => $sep   // Change separator char
					,'"' => $quote // Change qoute char
				);
				$sed_command = strtr($sed_command,$replace_arr);
	
				exec($sed_command.' '.$p_file.' > '.$p_file_temp);
			}
		}

		public function import_load_file
		(
			$p_import_id,
			$p_file,
			$p_work_dir,
			$p_table_nm,
			$p_separator = ';',
			$p_quote = '"',
			$p_ignore_lines = 0
		)
		{
			$this->import_create_load_file_temp($p_file, $p_separator, $p_quote, $p_file_temp);

			$this->pdo->exec('set sql_mode = "ANSI"');
			$sql = "
LOAD DATA LOCAL INFILE '$p_file_temp'
INTO /*! */ TABLE `$p_table_nm`
CHARACTER SET 'utf8'
FIELDS
	TERMINATED BY '".mysql_escape_string($p_separator)."'
	OPTIONALLY ENCLOSED BY '".mysql_escape_string($p_quote)."'
IGNORE $p_ignore_lines LINES
(";
			if($p_table_nm == 'gui_import_data_check')
			{
				$sql .= 'import_error, ';
			}
			for($i = 1; $i <= 170; $i++)
			{
				$sql .= '
	col'.str_pad($i, 3, '0', STR_PAD_LEFT).($i != 170 ? ',' : '');
			}
			$sql .= "
)
set import_id = $p_import_id
";
			$stmt = $this->pdo->prepare($sql, array(PDO::MYSQL_ATTR_LOCAL_INFILE => true));
			$stmt->execute();
			$this->pdo->exec('set sql_mode = "TRADITIONAL"');

			exec('rm '.$p_file_temp); // Remove temp file with double slashes
		}
		
		public function import_get_pk
		(
			$p_table_nm
		)
		{
			$stmt = $this->pdo->prepare("
select obj_nm
from wbs.wbs_gui_struct
where
	gui_hi like concat((
		select gui_hi from gui_import_table
		where import_table_nm = '$p_table_nm'
	), '.%')
	and obj_t = 'C'
	and pk = 1
");
			$stmt->execute();
			$pk = reset(reset($stmt->fetchAll(PDO::FETCH_ASSOC)));
			return $pk;
		}
		
		public function import_set_action
		(
			$p_import_id,
			$p_table_nm,
			$p_sequence,
			$p_uk,
			$p_only_insert = false
		)
		{
			$pk = $this->import_get_pk($p_table_nm);
			$gui_hi = $this->import_get_gui_hi_by_table_nm($p_table_nm);
			$real_table = $this->find_gui_object($gui_hi, null, 'T');
			$can_update = (($real_table['action'] & 2) != 0) && !$p_only_insert;
			$can_insert = ($real_table['action'] & 4) != 0;
			$table = $real_table['obj_nm'];
			
			$expressions = $this->import_get_uk_expressions($p_table_nm);
			
			$columns = array();
			$group = array();
			$p_sequence = array_flip($p_sequence);
			foreach($p_uk as $col)
			{
				$columns[] = 
					'('
					.($expressions[$col]['real_expr'] ? $expressions[$col]['real_expr'] : '`real`.'.$col)
					.'= t.col'
					.str_pad($p_sequence[$col] + 1, 3, '0', STR_PAD_LEFT)
					.' or ('
					.($expressions[$col]['real_expr'] ? $expressions[$col]['real_expr'] : '`real`.'.$col)
					.' is null and t.col'
					.str_pad($p_sequence[$col] + 1, 3, '0', STR_PAD_LEFT)
					.' is null)'
					.')';
				$group[] = 'col'.str_pad($p_sequence[$col] + 1, 3, '0', STR_PAD_LEFT);
				
			}
			
			//Set action = 5 "Error"
			$sql = "
update gui_import_data_check
set import_action = 5
where
	import_id = $p_import_id
	and import_error is not null
";
			$this->pdo->exec($sql);
			
			//Set action = 1 "Insert"
			$sql = "
update gui_import_data_check
set import_action = 1
where
	import_id = $p_import_id
	and import_error is null
";
			$this->pdo->exec($sql);
			
			//Find duplicate in source file
			$this->pdo->exec('drop table if exists gui_import_data_in');
			$this->pdo->exec("
create temporary table if not exists gui_import_data_in as
select min(import_data_id) id
from gui_import_data_check
where
	import_id = $p_import_id
	and import_error is null
group by ".implode(',', $group));

			$is_null = implode(' is not null or ', $group).' is not null';			
			$sql = "
update gui_import_data_check
set import_action = 4
where
	import_id = $p_import_id
	and import_error is null
	and ($is_null)
	and import_data_id not in (
		select id from gui_import_data_in
	)
";
			$this->pdo->exec($sql);
			
			if($can_update)
			{
				//Set temp action
				$sql = "
update gui_import_data_check t
set
	import_action = 10 + (select count(*) from $table `real` where ".implode("\n and ", $columns).")
where
	t.import_id = $p_import_id
	and ($is_null)
	and t.import_action = 1
";
				$this->pdo->exec($sql);
				
				//Set normal action
				$sql = "
update gui_import_data_check t
set
	import_action =
		case
			when import_action = 10 then 1
			when import_action = 11 then 2
			else 3
		end
where
	t.import_id = $p_import_id
	and t.import_action >= 10
";
				$this->pdo->exec($sql);
				
				$sql = "
update gui_import_data_check t
set
	pk = (select $pk from $table `real` where ".implode(' and ', $columns).")
where
	t.import_id = $p_import_id
	and t.import_action = 2
";
				$this->pdo->exec($sql);
			}
			
			//Find unique keys
			$uk = $this->import_get_uk($p_table_nm, null, array(2, 3));
			foreach($uk as $columns_separate)
			{
				$columns_uk = array();
				$group = array();
				$columns_arr = explode(';', $columns_separate);
				
				//If $p_uk not in $columns_arr OR $can_update = false
				if(count($p_uk) != count(array_intersect($columns_arr, $p_uk)) || $can_update == false)
				{
					foreach($columns_arr as $col)
					{
						$columns_uk[] = 
							'('
							.($expressions[$col]['real_expr'] ? $expressions[$col]['real_expr'] : '`real`.'.$col)
							.'= t.col'
							.str_pad($p_sequence[$col] + 1, 3, '0', STR_PAD_LEFT)
							.' or ('
							.($expressions[$col]['real_expr'] ? $expressions[$col]['real_expr'] : '`real`.'.$col)
							.' is null and t.col'
							.str_pad($p_sequence[$col] + 1, 3, '0', STR_PAD_LEFT)
							.' is null)'
							.')';
						$group[] = 'col'.str_pad($p_sequence[$col] + 1, 3, '0', STR_PAD_LEFT);
					}
					
					//Find duplicate in source file
					$this->pdo->exec('drop table if exists gui_import_data_in');
					$this->pdo->exec("
create temporary table if not exists gui_import_data_in as
select min(import_data_id) id
from gui_import_data_check
where
	import_id = $p_import_id
	and import_action in (1, 2)
group by ".implode(',', $group));

					$is_null = implode(' is not null or ', $group).' is not null';
					$sql = "
update gui_import_data_check
set
	import_action = 4,
	import_error = concat(
		case when import_error is null then '' else concat(import_error, ';') end,
		'<l class=\"bold\">".implode('</l>, <l class="bold">', $columns_arr)."</l>: <l>error_unique_key</l>')
where
	import_id = $p_import_id
	and import_action in (1, 2)
	and ($is_null)
	and import_data_id not in (
		select id from gui_import_data_in
	)
";
					$stmt = $this->pdo->exec($sql);
					
					//Find duplicate in target table
					$sql = "
update gui_import_data_check t
set
	import_action = 5,
	import_error = concat(
		case when t.import_error is null then '' else concat(t.import_error, ';') end,
		'<l class=\"bold\">".implode('</l>, <l class="bold">', $columns_arr)."</l>: <l>error_unique_key</l>')
where
	t.import_id = $p_import_id
	and t.import_action in (1, 2)
	and ($is_null)
	and exists(
		select null from
			$table `real`
		where
			".implode(' and ', $columns_uk)."
			and not (
				t.import_action = 2
				and `real`.$pk = t.pk
			)
	)
";
					$this->pdo->exec($sql);
				}
			}
			
			if(!$can_insert)
			{
				$sql = "
update gui_import_data_check t
set import_action = 5
where
	t.import_id = $p_import_id
	and import_error is null
	and t.import_action = 1
";
				$this->pdo->exec($sql);
			}
		}
		
		public function import_get_cut_rowset_stmt
		(
			$p_import_id,
			$p_sequence,
			$p_separator,
			$p_quote,
			$p_all = false
		)
		{
			$columns_arr = array();
			$p_quote_e = mysql_escape_string($p_quote);
			foreach($p_sequence as $num => $col)
			{
				$column = 'col'.str_pad($num + 1, 3, '0', STR_PAD_LEFT);
				$columns_arr[] = 
					"case when $column is null then '\\\\N' else replace($column, '$p_quote_e', '{$p_quote_e}{$p_quote_e}') end";
			}
			$columns = "concat('$p_quote_e', ".implode(", '$p_quote_e', '$p_separator', '$p_quote_e', ", $columns_arr).", '$p_quote_e')";
			
			$sql = "
select $columns
from gui_import_data_check
where
	import_id = $p_import_id";
			if($p_all == false)
			{
				$sql .= "
	and `import_action` is null";
			}
			$stmt = $this->pdo->prepare($sql);
			$stmt->execute();
			return $stmt;
		}
		
		public function import_delete_cut_rowset
		(
			$p_import_id,
			$p_all = false
		)
		{
			$sql = "
delete from gui_import_data_check
where
	import_id = $p_import_id";
			if($p_all == false)
			{
				$sql .= "
	and `import_action` is null";
			}
			$this->pdo->exec($sql);
		}
		
		public function import_get_sequence
		(
			$p_sequence_id
		)
		{
			$sql = "
select sequence from gui_import_sequence
where
	id = :p_sequence_id
	and user_id = :user_id
";
			$stmt = $this->pdo->prepare($sql);
			$stmt->bindValue(':p_sequence_id', $p_sequence_id);
			$stmt->bindValue(':user_id', DataSourceManager::$user_id);
			$stmt->execute();
			return explode(';', reset($stmt->fetchAll(PDO::FETCH_COLUMN, 0)));
		}

		public function import_get_sequences()
		{
			$sql = "select * from gui_import_sequence where user_id = ".DataSourceManager::$user_id;
			return $this->query($sql);
		}
		
		public function import_get_uk_sets()
		{
			$sql = "select * from gui_import_uk_set where user_id = ".DataSourceManager::$user_id;
			return $this->query($sql);
		}

		public function import_get_settings
		(
			$p_table_nm,
			$p_table_hi = null
		)
		{
			if($p_table_hi)
			{
				$hi = $p_table_hi;
				$p_table_nm = reset(reset($this->query("select obj_nm from wbs.wbs_gui_struct where gui_hi = '$hi'")));
			}
			else
			{
				$hi = $this->import_get_gui_hi_by_table_nm($p_table_nm);
			}
			$stmt = $this->pdo->prepare(<<<EOS
select 
	g.obj_nm,
	g.not_null,
	g.data_type,
	g.ctl_type,
	g.lookup_hi,
	g.initial_value,
	g.data_mask,
	g.display_mask,
	g.lookup_select,
	wbs.gui_get_gui_string(g.obj_hi, :user_lang_id, 1) title,
	case
		when column_type like '%unsigned%' then 0
		when sch.data_type = 'tinyint' and column_type not like '%unsigned%'	then -128
		when sch.data_type = 'smallint' and column_type not like '%unsigned%' 	then -32768
		when sch.data_type = 'mediumint' and column_type not like '%unsigned%' 	then -8388608
		when sch.data_type = 'int' and column_type not like '%unsigned%' 		then -2147483648
		when sch.data_type = 'bigint' and column_type not like '%unsigned%' 	then -9223372036854775808
		when sch.data_type in ('float', 'double', 'decimal') 					then -(10 ^ numeric_precision)/if(numeric_precision != 0, 10 ^ numeric_precision, 1)
		else null
	end as min_val_db,
	case
		when sch.data_type = 'tinyint' and column_type not like '%unsigned%'	then 127
		when sch.data_type = 'tinyint' and column_type like '%unsigned%' 		then 255
		when sch.data_type = 'smallint' and column_type not like '%unsigned%' 	then 32767
		when sch.data_type = 'smallint' and column_type like '%unsigned%' 		then 65535
		when sch.data_type = 'mediumint' and column_type not like '%unsigned%' 	then 8388607
		when sch.data_type = 'mediumint' and column_type like '%unsigned%' 		then 16777215
		when sch.data_type = 'int' and column_type not like '%unsigned%' 		then 2147483647
		when sch.data_type = 'int' and column_type like '%unsigned%' 			then 4294967295
		when sch.data_type = 'bigint' and column_type not like '%unsigned%' 	then 9223372036854775807
		when sch.data_type = 'bigint' and column_type like '%unsigned%' 		then 18446744073709551615
		when sch.data_type in ('float', 'double', 'decimal') 					then (10 ^ numeric_precision)/if(numeric_precision != 0, 10 ^ numeric_precision, 1)
		else null
	end as max_val_db,
	v.*,
	i.*,
	r.action,
	sch.character_maximum_length as data_length
from wbs.wbs_gui_struct g
left join
	gui_verify_rule v
	on v.obj_hi = g.verify_hi
left join
	(
		select 
			column_nm,
			special_check,
			named_lookup
		from gui_import_config t
		where table_nm = :p_table_nm
	) i
	on i.column_nm = g.obj_nm
left join
	(select * from wbs.wbs_gui_role_set where role_id = :user_role_id) r
	on r.obj_hi = g.obj_hi
left join
	(
		select column_name, character_maximum_length, data_type, column_type, numeric_precision, numeric_scale from information_schema.`columns`
		where
			table_schema = schema()
			and table_name = :p_table_nm
	) sch
	on sch.column_name = g.obj_nm
where g.gui_hi like :p_gui_hi
and g.obj_t = 'C'
order by g.gui_hi

EOS
			);
			$stmt->bindValue(':p_gui_hi', $hi.'%');
			$stmt->bindValue(':p_table_nm', $p_table_nm);
			$stmt->bindValue(':user_role_id', DataSourceManager::$user_params['user_role_id']);
			$stmt->bindValue(':user_lang_id', DataSourceManager::$user_params['user_lang_id']);
			$stmt->execute();
			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			return $result;
		}
		
		public function import_get_uk_expressions
		(
			$p_table_nm
		)
		{
			$expressions = $this->query("
select
	column_nm,
	ifnull(import_expr, column_nm) import_expr,
	ifnull(real_expr, column_nm) real_expr
from gui_import_table_uk_expr
where
	import_table_nm = '$p_table_nm'"
			);
			$result = array();
			foreach($expressions as &$line)
			{
				$result[$line['column_nm']] = $line;
			}
			return $result;
		}
		
		public function import_move_data
		(
			$p_import_id,
			$p_insert_columns,
			$p_update_columns,
			$p_sequence,
			$p_uk
		)
		{
			$table = reset(reset($this->query('select table_nm from gui_import where import_id = '.$p_import_id)));
			$pk = $this->import_get_pk($table);
			
			$insert_list = $pk;
			$select_list = "case when import_action = 1 then null else pk end as pk";
			foreach($p_insert_columns as $real=>$temp)
			{
				GUIUtils::add_to_list($select_list, ', ', $temp.' as '.$real);
				GUIUtils::add_to_list($insert_list, ', ', $real);
			}
			$update_list = '';
			foreach($p_update_columns as $real=>$temp)
			{
				GUIUtils::add_to_list($update_list, ', ', $real.' = '.$temp);
			}
			
			$count_insert = reset(reset($this->query("select count(*) from gui_import_data_check where import_id = $p_import_id and import_action = 1")));;
			$count_update = reset(reset($this->query("select count(*) from gui_import_data_check where import_id = $p_import_id and import_action = 2")));;
			
			//Insert or update rows
			$sql = "
insert ";
			if(!$update_list)
			{
				$sql .= ' ignore ';
			}
			$sql .= " into $table
($insert_list)
select
	$select_list
from gui_import_data_check import
	where import_action in (1,2)
	and import_id = $p_import_id";
			if($update_list)
			{
				$sql .= "
on duplicate key update
	$update_list
";
			}
			$this->pdo->exec($sql);
			
			$sql = "
delete from gui_import_data_check
where
	import_id = $p_import_id
	and import_action in (1, 2)
";
			$this->pdo->exec($sql);
			
			$count_check = reset(reset($this->query("select count(*) from gui_import_data_check where import_id = $p_import_id")));
			
			return array
			(
			  'count_check'  => $count_check,
			  'count_insert' => $count_insert,
			  'count_update' => $count_update
			);
		}
		
		public function import_get_uk
		(
			$p_table_nm,
			$p_uk_id = null,
			$p_type = null
		)
		{
			$sql = "
select
	group_concat(column_nm separator ';') columns
from gui_import_table_uk uk
	inner join gui_import_table_uk_set uks
		on uk.uk_id = uks.uk_id
where
	table_nm = '$p_table_nm'
	".($p_uk_id !== null?" and uk_id = ".$p_uk_id:'')."
	".($p_type !== null?" and type in ('".implode("', '", $p_type)."')":'')."
group by uk.uk_id
having
	group_concat(column_nm) is not null";
			$stmt = $this->pdo->prepare($sql);
			$stmt->execute();
			return $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
		}
		
		public function import_save_sequence
		(
			$p_table_nm,
			$p_name,
			$p_sequence_separate,
			$p_id = null
		)
		{
			if ($p_id) // update
			{
				$sql = "
update gui_import_sequence
set name = :p_name, user_id = :user_id, table_nm = :p_table_nm, sequence = :p_sequence_separate
where id = :p_id
";
				$stmt = $this->pdo->prepare($sql);
				$stmt->bindValue(':p_id', $p_id);
			}
			else // insert
			{
				$sql = "
insert into gui_import_sequence(name, user_id, table_nm, sequence)
values (:p_name, :user_id, :p_table_nm, :p_sequence_separate)
";
				$stmt = $this->pdo->prepare($sql);
			}

			$stmt->bindValue(':p_name', $p_name);
			$stmt->bindValue(':user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_table_nm', $p_table_nm);
			$stmt->bindValue(':p_sequence_separate', $p_sequence_separate);
			$stmt->execute();
		}
		
		public function import_save_uk_set
		(
			$p_table_nm,
			$p_name,
			$p_uk_set_separate,
			$p_id = null
		)
		{
			if ($p_id) // update
			{
				$sql = "
update gui_import_uk_set
set name = :p_name, user_id = :user_id, table_nm = :p_table_nm, uk_set = :p_uk_set_separate
where id = :p_id
";
				$stmt = $this->pdo->prepare($sql);				
				$stmt->bindValue(':p_id', $p_id);
			}
			else
			{
				$sql = "
insert into gui_import_uk_set(name, user_id, table_nm, uk_set)
values (:p_name, :user_id, :p_table_nm, :p_uk_set_separate)
";
				$stmt = $this->pdo->prepare($sql);
			}

			$stmt->bindValue(':p_name', $p_name);
			$stmt->bindValue(':user_id', DataSourceManager::$user_id);
			$stmt->bindValue(':p_table_nm', $p_table_nm);
			$stmt->bindValue(':p_uk_set_separate', $p_uk_set_separate);
			$stmt->execute();
		}
		
		public function import_check_unique_sequence
		(
			$p_table_nm,
			$p_name
		)
		{
			$sql = "
SELECT COUNT(*) 
	FROM gui_import_sequence 
	WHERE name=:p_name AND user_id=:user_id AND table_nm=:p_table_nm
";
			$p_params = array
			(
				'p_name' => $p_name,
				'user_id' => DataSourceManager::$user_id,
				'p_table_nm' => $p_table_nm,
			);
			$count_seq = reset(reset($this->query($sql,$p_params)));
			return ($count_seq ? false : true);
		}
		
		public function import_check_unique_uk_set
		(
			$p_table_nm,
			$p_name
		)
		{
			$sql = "
SELECT COUNT(*) 
	FROM gui_import_uk_set
	WHERE name=:p_name AND user_id=:user_id AND table_nm=:p_table_nm
";
			$p_params = array
			(
				'p_name' => $p_name,
				'user_id' => DataSourceManager::$user_id,
				'p_table_nm' => $p_table_nm,
			);
			$count = reset(reset($this->query($sql,$p_params)));
			return ($count ? false : true);
		}
		
		public function import_delete_sequence
		(
			$p_sequence_id
		)
		{
			$sql = "
delete from gui_import_sequence
where
	id = :p_sequence_id
	and user_id = :user_id
";
			$stmt = $this->pdo->prepare($sql);
			$stmt->bindValue(':p_sequence_id', $p_sequence_id);
			$stmt->bindValue(':user_id', DataSourceManager::$user_id);
			$stmt->execute();
		}
		
		public function import_delete_uk_set
		(
			$p_uk_set_id
		)
		{
			$sql = "
delete from gui_import_uk_set
where
	id = :p_uk_set_id
	and user_id = :user_id
";
			$stmt = $this->pdo->prepare($sql);
			$stmt->bindValue(':p_uk_set_id', $p_uk_set_id);
			$stmt->bindValue(':user_id', DataSourceManager::$user_id);
			$stmt->execute();
		}
		
		public function import_special
		(
			$p_import_id,
			$p_table_nm,
			$p_sequence
		)
		{
			// Get specials
			$settings = $this->import_get_settings($p_table_nm);
			
			// Special transform
			$tr = array();
			foreach($p_sequence as $num => $col)
			{
				$tr["[".$col."]"] = 'col'.str_pad($num + 1, 3, '0', STR_PAD_LEFT);
			}
			foreach($settings as $s)
			{
				//<l>error_lookup_many_values</l>
				//<l>error_lookup_not_found</l>
				if($s['ctl_type'] == 'AUTOCOMPLETER')
				{
					$s['special_transform_check'] = "
						case (select concat(count(*), '')
								from(".$s['lookup_select'].") lookup
								where
									upper(lookup.k) = upper([*])
									or upper(lookup.v) = upper([*]))
							when '0' then '<l>error_lookup_not_found</l>'
							when '1' then '' 
							else '<l>error_lookup_not_found</l>'
						end
					";
					$s['special_transform'] = "select k from(".$s['lookup_select'].") lookup
								where
									upper(lookup.k) = upper([*])
									or upper(lookup.v) = upper([*])";
				}
				if($s['special_transform'] && $s['special_transform_check'])
				{
					$modTR = array_merge(
								array('[*]' => "t.".$tr["[".$s['obj_nm']."]"]),
								$tr
							);
					$special[$s['obj_nm']] = array(
						'special_transform' => strtr(
							$s['special_transform'],
							$modTR
						),
						'special_transform_check' => strtr(
							$s['special_transform_check'],
							$modTR
						)
					);
				}
			}
			foreach($special as $name => $s)
			{
				$sql = "
update gui_import_data_check t
set
	t.".$tr["[".$name."]"]." = case when (".$s['special_transform_check'].") != '' then (".$s['special_transform'].") else t.".$tr["[".$name."]"]." end,
	t.import_error = case when (".$s['special_transform_check'].") != '' then
		concat(case when t.import_error is null then '' else concat(t.import_error, ';') end,
			'<l class=\"bold\">".$name."</l>: ', (".$s['special_transform_check'].")) end
where
	t.import_id = $p_import_id
	and import_action is null
";
				//print_r($sql); die;
				$this->pdo->exec($sql);
			}
			
			// Special check
			$special = array();
			foreach($settings as $s)
			{
				if($s['special_check'])
				{
					$special[$s['obj_nm']] = strtr($s['special_check'], $tr);
				}
			}
			foreach($special as $name => $s)
			{
				$sql = "
update gui_import_data_check t
set
	`import_error` = ifnull(
		concat(
			case when t.`import_error` is null then '' else concat(t.`import_error`, ';') end,
			'<l class=\"bold\">".$name."</l>: ',
			".$s."
		),
		`import_error`
	)
where
	t.import_id = $p_import_id
	and `import_action` is null
";
				$this->pdo->exec($sql);
			}
		}
		
		public function import_special_check
		(
			$p_import_id,
			$p_table_nm,
			$p_sequence
		)
		{
			$tr = array();
			foreach($p_sequence as $num => $col)
			{
				$tr["[".$col."]"] = 'col'.str_pad($num + 1, 3, '0', STR_PAD_LEFT);
			}
			$settings = $this->import_get_settings($p_table_nm);
			$special = array();
			foreach($settings as $s)
			{
				if($s['special_check'])
				{
					$special[$s['obj_nm']] = strtr($s['special_check'], $tr);
				}
			}
			foreach($special as $name => $s)
			{
				$sql = "
update gui_import_data_check t
set
	`import_error` = ifnull(
		concat(
			case when t.`import_error` is null then '' else concat(t.`import_error`, ';') end,
			'<l class=\"bold\">".$name."</l>: ',
			".$s."
		),
		`import_error`
	)
where
	t.import_id = $p_import_id
	and `import_action` is null
";
				$this->pdo->exec($sql);
			}
		}
		
		public function import_get_expiration()
		{
			$expiration = $this->get_gui_config("gui.import_expiration");
			$sql = "
select import_id, work_dir from gui_import
where start_date < sysdate() - interval $expiration day
";
			return $this->pdo->query($sql, PDO::FETCH_ASSOC);
		}
		
		public function import_get_count_check_data
		(
			$p_import_id
		)
		{
			$sql = "
select count(*) from gui_import_data_check
where import_id = $p_import_id
";
			return reset(reset($this->query($sql)));
		}
		
		public function import_get_count_data
		(
			$p_import_id
		)
		{
			$sql = "
select count(*) from gui_import_data
where import_id = $p_import_id
";
			return reset(reset($this->query($sql)));
		}
		
		public function import_get_gui_hi_by_table_nm
		(
			$p_table_nm
		)
		{
			return reset(reset($this->query('select gui_hi from gui_import_table where import_table_nm = :p_table_nm', array('p_table_nm' => $p_table_nm))));
		}
		
		public function import_get_style_for_error($cName)
		{
			return 'case when instr(import_error, "<l class=\"bold\">'.$cName.'</l>") > 0 then "red_fill" else null end';
		}
		
		public function import_get_null_str()
		{
			return "\\N";
		}
		
		//----------------------------END Import functions END----------------------------------//
		
		public function describe_columns
		(
			$p_table_hi
		)
		{
			$p_table_hi = mysql_escape_string($p_table_hi);
			$table_nm = reset(reset($this->query("select obj_nm from wbs.wbs_gui_struct where gui_hi = '$p_table_hi'")));
			$sql = <<<EOS
select 
	g.obj_nm as column_name,
	g.not_null,
	g.data_type,
	g.ctl_type,
	case when g.lookup_hi is not null or g.lookup_select is not null then 1 else 0 end as have_lookup,
	g.initial_value,
	g.data_mask,
	wbs.gui_get_gui_string(g.obj_hi, :user_lang_id, 1) title,
	v.verify_pattern,
	v.transform_pattern,
	v.min_len,
	v.max_len,
	v.min_val_exclude,
	v.max_val_exclude,
	v.delimiter,
	ifnull(
		v.min_val,
		case
			when column_type like '%unsigned%' then 0
			when sch.data_type = 'tinyint' and column_type not like '%unsigned%'	then -128
			when sch.data_type = 'smallint' and column_type not like '%unsigned%' 	then -32768
			when sch.data_type = 'mediumint' and column_type not like '%unsigned%' 	then -8388608
			when sch.data_type = 'int' and column_type not like '%unsigned%' 		then -2147483648
			when sch.data_type = 'bigint' and column_type not like '%unsigned%' 	then -9223372036854775808
			when sch.data_type in ('float', 'double', 'decimal') 					then -((10 ^ numeric_precision) - 1)/if(numeric_precision != 0, 10 ^ numeric_precision, 1)
			else null
		end
	) as min_val,
	ifnull(
		v.max_val,
		case
			when sch.data_type = 'tinyint' and column_type not like '%unsigned%'	then 127
			when sch.data_type = 'tinyint' and column_type like '%unsigned%' 		then 255
			when sch.data_type = 'smallint' and column_type not like '%unsigned%' 	then 32767
			when sch.data_type = 'smallint' and column_type like '%unsigned%' 		then 65535
			when sch.data_type = 'mediumint' and column_type not like '%unsigned%' 	then 8388607
			when sch.data_type = 'mediumint' and column_type like '%unsigned%' 		then 16777215
			when sch.data_type = 'int' and column_type not like '%unsigned%' 		then 2147483647
			when sch.data_type = 'int' and column_type like '%unsigned%' 			then 4294967295
			when sch.data_type = 'bigint' and column_type not like '%unsigned%' 	then 9223372036854775807
			when sch.data_type = 'bigint' and column_type like '%unsigned%' 		then 18446744073709551615
			when sch.data_type in ('float', 'double', 'decimal') 					then (10 ^ numeric_precision - 1)/if(numeric_precision != 0, 10 ^ numeric_precision, 1)
			else null
		end
	) as max_val,
	r.action,
	sch.character_maximum_length
from wbs.wbs_gui_struct g
left join
	gui_verify_rule v
	on v.obj_hi = g.verify_hi
left join
	(select * from wbs.wbs_gui_role_set where role_id = :user_role_id) r
	on r.obj_hi = g.obj_hi
left join
	(
		select column_name, character_maximum_length, data_type, column_type, numeric_precision, numeric_scale from information_schema.`columns`
		where
			table_schema = schema()
			and table_name = :table_nm
	) sch
	on sch.column_name = g.obj_nm
where g.gui_hi like '$p_table_hi%'
	and g.obj_t = 'C'
	and r.action > 0
order by g.gui_hi
EOS;
			return $this->query($sql, array('table_nm'=>$table_nm));
		}
		
		public function getTableByTitle
		(
			$p_title, $p_gui_hi_like = ''
		)
		{
			$sql = <<<EOS
select
	gs.gui_hi
from 
	wbs.wbs_gui_struct gs
	inner join wbs.wbs_gui_string gt
		on gs.obj_hi = gt.obj_hi
	inner join wbs.wbs_gui_role_set grs
		on gs.obj_hi = grs.obj_hi
where
	gt.string = :p_title
	and gt.lang_id = :user_lang_id
	and gs.obj_t = 'T'
	and grs.action > 0
	and grs.role_id = :user_role_id
	and gs.gui_hi LIKE :p_gui_hi_like
limit 1
EOS;
			return reset(reset($this->query($sql, array('p_title'=>$p_title, 'p_gui_hi_like'=>$p_gui_hi_like.'%'))));
		}
	}
//----------------------------END Import functions END----------------------------------//

?>
