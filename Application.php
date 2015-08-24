<?php
	require_once('autoload.php');
	require_once('Config.php');

	class Application
	{
		public static $debug;
		public static $realm_id;
		public static $gui_strings = array();
		public static $strings = array();
		public static $version;

		public static function &ds($ds_id = null)
		{
			DataSourceManager::$user_id = &$_SESSION['user_id'];
			return DataSourceManager::ds($ds_id);
		}

		public static function &msds($ds_id = null)
		{
			DataSourceManager::$user_id = &$_SESSION['user_id'];
			return DataSourceManager::microsoft($ds_id);
		}
		
		public static function init()
		{
			static $init;

			if ($init)
			{
				return;
			}

			$init = true;
			
			setlocale(LC_ALL, 'ru_RU.UTF8','ru_RU.UTF-8','en_US.UTF8','en_US.UTF-8');

			self::open_session();
			error_reporting($GLOBALS['cfg']['php']['error_reporting']);
			self::$realm_id = $GLOBALS['cfg']['app']['realm_id'];

			// Data sources

			DataSourceManager::$ds_cfg = &$GLOBALS['cfg']['data_sources'];
			DataSourceManager::$main_ds_id = &$GLOBALS['cfg']['main_data_source'];
			DataSourceManager::$remote_ds_id = &$GLOBALS['cfg']['remote_data_source'];
			DataSourceManager::$microsoft_ds_id = &$GLOBALS['cfg']['microsoft_data_source'];
				
			DataSourceManager::$app_params = $_REQUEST['args'];

			// Init version
			self::$version = self::get_self_version();
			
			// Service work mode
			require dirname(__FILE__).'/Frame.ServiceWork.php';

			// Run GC
			if (rand(1, 100) <= 1)
			{
				self::gc();
			
                        }
                        Application::wbsbreak('init54@','z',0,'');
		}
		
		public static function get_self_version()
		{
			$versions = self::get_versions();
			foreach($versions as &$ver)
			{
				if($ver['product'] == 'webengine')
				{
					return $ver['version'];
				}
			}
			return 'NULL';
		}

		public static function gc()
		{
			$ds = self::ds();

			$gui_log_auth_max_lifetime_days = $ds->get_gui_config('gui.log.auth.max_lifetime_days');
			$gui_log_activity_max_lifetime_days = $ds->get_gui_config('gui.log.activity.max_lifetime_days');

			if ($gui_log_auth_max_lifetime_days)
			{
				$ds->cleanup_auth_log($gui_log_auth_max_lifetime_days * 86400);
			}

			if ($gui_log_activity_max_lifetime_days)
			{
				$ds->cleanup_gui_log($gui_log_activity_max_lifetime_days * 86400);
			}
		}

		public static function open_session()
		{
			if (Session::SessionOpened())
			{
				return;
			}

			$session_path = $GLOBALS['cfg']['php']['session_path'];
			if ($session_path[0] != '/')
			{
				$session_path = dirname(__FILE__).'/'.$session_path;
			}

			Session::Start
			(
				$GLOBALS['cfg']['php']['session_name'],
				$session_path,
				$GLOBALS['cfg']['php']['session_lifetime'],
				$GLOBALS['cfg']['php']['session_gc_probability']
			);

			self::$realm_id = $GLOBALS['cfg']['app']['realm_id'];
			self::$debug = $GLOBALS['cfg']['app']['debug'];

			if (self::$debug)
			{
				GUIUtils::update_recursive($GLOBALS['cfg'], $_SESSION['cfg']);
			}
                        Application::wbsbreak('open_session@','z',0,'');   
                        
		}

		public static function encode($from = 'utf-8')
		{
			static $init;

			if ($init)
			{
				return;
			}

			$init = true;

			Page::Encode($from, 'utf-8');
		}

		public static function &get_versions()
		{
			$ds = self::ds();
			if ($ds)
			{
				$versions = $ds->get_versions();
			}
			return $versions;
		}

		public static function get_gui_strings($lang_id = null, $name_prfx = null)
		{
			try
			{
				$ds = self::ds();

				if ($ds)
				{
					$user_id = $lang_id === null ? $_SESSION['user_id'] : null;
					self::$gui_strings = $ds->get_gui_strings($lang_id, $user_id, $name_prfx);
				}
			}
			catch (Exception $e)
			{
			}
		}

		public static function get_gui_string($string_id, $default_string, $vars = null)
		{
                        Application::wbsbreak('get_gui_string161@',$string_id,0,'');
			if (empty(self::$gui_strings))
			{
				self::get_gui_strings();
			}

			$string = self::$gui_strings[$string_id];

			if (empty($string))
			{
				$string = $default_string;
			}

			if (is_array($vars))
			{
				$string = GUIUtils::format_string($string, $vars);
			}

			return $string;
		}

		public static function get_string($obj_hi, $default_string, $string_type = 1, $obj_nm = null, $obj_t = null, $vars = null)
		{
                        Application::wbsbreak('get_string184@',$obj_hi,0,'');
			if (!isset(self::$strings[$obj_hi][$obj_nm][$obj_t][$string_type]))
			{
				$ds = self::ds();
				$string = $ds ? $ds->get_string($obj_hi, $obj_nm, $obj_t, $string_type) : '';
				self::$strings[$obj_hi][$obj_nm][$obj_t][$string_type] = $string;
			}
			else
			{
				$string = self::$strings[$obj_hi][$obj_nm][$obj_t][$string_type];
			}
			
			if (empty($string))
			{
				$string = $default_string;
			}

			if ($string && is_array($vars))
			{
				$string = GUIUtils::format_string($string, $vars);
			}

			return $string;
		}
		
		public static function save_user_session()
		{
			$ds = self::ds();

			if ($ds)
			{
				try
				{
					$ds->save_user_session($_SESSION['user_id'], $_SESSION['OBJECTS']);
				}
				catch (Exception $e)
				{
				}
			}
		}

		public static function check_and_reauth_user($url)
		{
			Session::Open();
			if(!isset($_SESSION['user_reauth_time']))
			{
				$_SESSION['user_reauth_time'] = time();
			}
			$time_session_reauth = time() - $_SESSION['user_reauth_time'];
			if($time_session_reauth > $GLOBALS['cfg']['app']['user_reauth_time'])
			{
				$ds=self::ds();
				if($ds->check_reauth_user($_SESSION['auth_id']) != 0)
				{
					Session::Open();
					Session::Destroy(true);
					Page::RedirectTop($url);
				}
				$_SESSION['user_reauth_time'] = time();
			}
		}


                public static function &getpartitions($user_id)
                {
                  //  $sql =" select list.partitionid,list.name from wbs.0_1partitionlist list join wbs.tblUserPrivilege pri on pri.upCpnt=list.ShortName join wbs.tblUserPrivilegeUsr ";
                  // $sql=$sql." priuser on pri.upId=priuser.upId where userid=".$user_id." order by name";
                	$u=DataSourceManager::$user_params['user_wbs_nm']; //"jmason";
                    $sql="exec phpguimanagerDB3 @query=1 , @syslabuser='".$u."' ";
                    
                    
                //                self::wbsbreak("getpartitions",$sql,0,''); 
                                  $ds=self::ds();
                                  if ($ds)
                                  {
                                      try
                                        {
                      //           self::wbsbreak("getpartitions3",$sql,0,''); 
                                          $parts=$ds->getpartitions($sql);
                                 //self::wbsbreak("getpartitions4",$parts,0,'a'); 
                                          return $parts; 
                                        }
                                        catch(Exception $e)
                                        {
                                        	self::wbsbreak("getpartitions",$e,0,'a');
                                        	
                                        }      
                                  }    
                                  return array();
                }	
		public static function save_wbs_session()
		{
			$ds = self::ds();
			
			if ($ds)
			{
				try
				{
					$ds->save_wbs_session($_SESSION['user_id'], $_SESSION['OBJECTS']);
					
				}
				catch (Exception $e)
				{
				}
			}
		}
		public static function restore_wbs_session()
                {
				        $ds = self::ds();
                    if ($ds)
                         {
	                          try
	                        {
							           $ds->restore_wbs_session($_SESSION['user_id']);
							        //   self::wbsbreak("session7",$_SESSION,'0','a');
						    }
						 catch (Exception $e)
						{
	                     }
		         }
               	}

//       wbs stuff

public static function wbsbreak($text,$arg,$stop,$opt)
{       
if ($GLOBALS['cfg']['wbs']['wbsbreak'] !=='n'){
if (!strpos($text,"@")) {
$dlog="../phplog.txt";
$fh = fopen($dlog, 'a') or die("can't open phplog file");

//echo($text.":\n");
fwrite($fh, $text."\n");
if($opt == 'a') {

while(list($key,$val)=each($arg)){
//echo($key." = ".$val." : ");
fwrite($fh, $key." = ".$val." : "."\n");
while(list($key1,$val1)=each($val)){
//echo($key1." = ".$val1." :: ");
fwrite($fh, $key1." = ".$val1." :: "."\n");
while(list($key2,$val2)=each($val1)) {
//echo($key2." = ".$val2." ::: ");};};};
fwrite($fh, $key2." = ".$val2." ::: "."\n");};};};
}       
else    
{       
//echo('----'."\n");
//echo($arg);
fwrite($fh, '----'."\n");
fwrite($fh, $arg."\n");
};      

fclose($fh);
if($stop===1) exit(); 

}
}

}
public static function wbsbreakvar($text,$arg,$stop,$opt)
{
$v='';	
				while(list($key,$val)=each($arg)){
					$v=$v.$key."='".$val."',";
					while(list($key1,$val1)=each($val)){
						$v=$v.$key1."='".$val1."',";
						while(list($key2,$val2)=each($val1)) {
							$v=$v.$key2."='".$val2."'";
						};};}
return $v;
}
public static function  wbsdose($w)
{
if(isset($_SESSION[$w])) {
echo($_SESSION[$w]);
} else { if(isset($_REQUEST[$w])) {
$_SESSION[$w]=$_REQUEST[$w];
echo($_SESSION[$w]);
} else { echo('?'); }; };
}


public static function rqF($w)
{
$v=$_REQUEST[$w];
if(!isset($v)) $v="";
return $v;
}

public static function rqQ($w)
{
$v=$_GET[$w];
if(!isset($v)) $v="";
return $v;
}


public static function isAlphaN($str){

$tp="0123456789_";

$iPos=1;
$bolValid=true;

While( ($iPos<=strlen($str)) && $bolValid) {
$c=substr($str,$iPos-1,1);//Mid(str,iPos,1)
if( (ord(strtoupper($c))<ord("A"))||(ord(strtoupper($c))>ord("Z")) ){

if(!strpos($tp,$c))$bolValid=false;

}

$iPos=$iPos+1;
}

return $bolValid;
}


public static function ClearAlphaN($str){

$tp="0123456789_";
$iPos=1;
$uc="_";
$dash="-";
$dst=$str;
$one=1;
$blank="";
$l=strlen($str);

While ($iPos<=$l)
{

$c=substr($str,$iPos-1,1);
if( (ord(strtoupper($c))<ord("A"))||(ord(strtoupper($c))>ord("Z")) ) {
//$t=$t.$c;
$p=strpos($tp,$c);
if($p === false ){
//$t=$t.$c;
$dst=substr_replace($dst,$uc,$iPos-1,1);
}

}

$iPos=$iPos+1;
}

if($dst!==""){

$dst=str_replace($dash,$uc,$dst);

}

return $dst;

}


public static function ClearName($src) {


$s=$src;


$s=str_replace("Ltd","",$s);

$s=str_replace("Inc","",$s);

$s=str_replace("Corp","",$s);

$s=str_replace("Limited","",$s);

$s=str_replace("Incorporated","",$s);

$s=str_replace("_"," ",$s); // php

$s=trim($s);

$s=str_replace(" ","_",$s);

$s=self::ClearAlphaN($s);

$u="_";

$u2=$u . $u;

while (strpos($s,$u2))
{

$s=str_replace($u2,$u,$s);

}

return $s;

}


public static function GetCustId($src) {

$id=0;
$sql="select Organization, id from wbs.x1customer where AccountStatus = 'Active' and  organization='".$src."'";
$main_ds = Application::ds();

$stmt = $main_ds->pdo->prepare($sql);
$stmt->execute();

while ($t=($stmt->fetch())) {
$id=$t["id"];
};

unset($main_ds);

return $id;
}


public static function GetCustomerName($src) {

$org='?';
$sql="select Organization, id from wbs.x1customer where AccountStatus = 'Active' and  id=".$src;
$main_ds = Application::ds();

$stmt = $main_ds->pdo->prepare($sql);
$stmt->execute();

while ($t=($stmt->fetch())) {
$org=$t["Organization"];
};

unset($main_ds);

return $org;
}

public static function GetOlympCode($Destination){

$dst=trim($Destination);

if($dst!==""){
$sql="select colymp from wbs.countrydest where cname='".$Destination."'";
$main_ds = Application::ds();

$stmt = $main_ds->pdo->prepare($sql);
$stmt->execute();

$i=0;

while ($t=($stmt->fetch())) {
$i=1;

$dst=$t["colymp"];

if(is_null($dst)){
$i=0;      //dst=strtoupper($Destination);
}else{
if(trim($dst)==="") $i=0;  //$dst=strtoupper($Destination);
};

};


if($i===0) $dst=strtoupper($Destination);


unset($main_ds);

};//'dst!==""


return $dst;

}


public static function BuildGWName($prefix,$src,$prm,$tp,$short,$ignore) {

$autoname="";
$autogroupname="";
if ($src !== "" ) {
if ($short === ""  ){
$shortdesc=$_POST["rqfieqshortdesc"];
$ignoreshortdesc=$_POST["eqignoreshortdesc"];
}
else
{
$shortdesc=$short;
$ignoreshortdesc=$ignore;
};

if (!isset($shortdesc)) $shortdesc="";

if($prm === 0 ) $prm=Application::GetCustId($src);

$autoname=substr($src,0,12) . "_" . $prm;

$autogroupname=$autoname;
if ( $shortdesc !== "" )
{
$autoname = $autoname . "_" . $shortdesc ;
if ( $ignoreshortdesc !== "on" )
{
$autogroupname = $autogroupname . "_" . $shortdesc ;
};
};

$autoname=$prefix.Application::ClearName($autoname);
$autogroupname=Application::ClearName($autogroupname);
};


if ($tp===1) return $autoname;
if ($tp===2) return $autogroupname;
}

public static function BuildVendorGW($custid,$Destination,$DestinationType,$DestinationMobileCarrier,$Description,$short)
{
$Destination=trim($Destination);
$DestinationType=trim($DestinationType);
$DestinationMobileCarrier=trim($DestinationMobileCarrier);
$Description=trim($Description);

if($Destination==="0" )$Destination="";
if($DestinationType=="0") $DestinationType="";
if($DestinationMobileCarrier==="0") $DestinationMobileCarrier="";
if($Description==="0" )$Description="";

if (is_int($custid ) ) {
$org=Application::GetCustomerName($custid);
}
else
{
$org=$custid;
$custid=Application::GetCustId($org);
};

$org=trim($org);

$DestinationSt=Application::GetOlympCode($Destination);

if($DestinationType===""){

if($Destination==="A-Z"){

$DestinationTypeSt==="";

}else{

$DestinationTypeSt="All";

};

}else{
$s=trim($DestinationType);
if($s===""){
$DestinationTypeSt="Other";
};
if($s==="Mobile"){
$DestinationTypeSt="Mob";
};
if($s==="Proper"){
$DestinationTypeSt="Prop";
};
if($s==="Continental"){
$DestinationTypeSt="Cont";
};

};

if($DestinationMobileCarrier===""){
$DestinationMobileCarrierSt="All";
}else{
$s=trim($DestinationMobileCarrier);
if($s===""){
$DestinationMobileCarrierSt="Other";
}else{

if(strtolower(substr($s,0,3))==="all"){
	$s=substr($s,0,8);
		}else{
	$s=substr($s,0,4);
		};

	$DestinationMobileCarrierSt=$s;
	};

};

//Application::wbsbreak("descr56",$Description,1,"");

	if($Description===""){
	$DescriptionSt="All";
	}else{
	$s=trim($Description);
	if($s===""){
	$DescriptionSt="Other";
	}else{
	$DescriptionSt=substr($s,0,6);
	};

	};

	$destpart="";

	if($DestinationSt!==""){

	if($DestinationTypeSt===""){

	$destpart=$DestinationSt;

	};

	if($DestinationTypeSt==="All"){
	$destpart=$DestinationSt."_".$DestinationTypeSt;
	};

	if(($DestinationTypeSt==="Prop")||($DestinationTypeSt==="Cont")){

	$destpart=$DestinationSt."_".$DestinationTypeSt."_".$DescriptionSt;
	};

	if($DestinationTypeSt==="Mob"){

	$destpart=$DestinationSt."_".$DestinationTypeSt."_".$DestinationMobileCarrierSt;

	};

	if($destpart===""){

	$destpart=$DestinationSt."_".$DestinationTypeSt."_".$DestinationMobileCarrierSt;
	$destpart=$destpart."_".$DescriptionSt;

	};

	};


$name=substr($org,0,12)."_".$custid;

	if($destpart!==""){

	$name=$name."_".$destpart;

	};


	if($short !== ""){

$short=str_replace("","_",$short);

if(!Application::IsAlphaN($short)){

	$s="Only[A-Z][a-z][0-9][ ][_] characters are allowedin SortDesc field, please correct";

	throw new GUIException(array($s));

	};

$name=$name."_".$short;

    };

    $name="V_".Application::ClearName($name);

    return $name;

}

public static function BuildDialPeerName($custid,$Destination,$DestinationType,$DestinationMobileCarrier,$Description,$gwshortdesc,$dpdesc,$order,$swapdo)
{
$Destination=trim($Destination);
$DestinationType=trim($DestinationType);
$DestinationMobileCarrier=trim($DestinationMobileCarrier);
$Description=trim($Description);

if($Destination==="0" )$Destination="";
if($DestinationType=="0") $DestinationType="";
if($DestinationMobileCarrier==="0") $DestinationMobileCarrier="";
if($Description==="0" )$Description="";

$org=Application::GetCustomerName($custid);

$org=substr($org,0,12);
$org=str_replace(" ","_",$org);

$name="DP_";

if($Destination!==""){

$DestinationSt=Application::GetOlympCode($Destination);

if($DestinationType===""){

if($Destination==="A-Z"){

$DestinationTypeSt="";

}else{

$DestinationTypeSt="All";
};

}else{
$s=trim($DestinationType);
if($s===""){
$DestinationTypeSt="Other";
};
if($s==="Mobile"){
$DestinationTypeSt="Mob";
};
if($s==="Proper"){
$DestinationTypeSt="Prop";
};
if($s==="Continental"){
$DestinationTypeSt="Cont";
};
};
if($DestinationMobileCarrier===""){
$DestinationMobileCarrierSt="All";
}else{
$s=trim($DestinationMobileCarrier);
if($s===""){
$DestinationMobileCarrierSt="Other";
}else{
$DestinationMobileCarrierSt=substr($s,0,4);
};

};

if($Description===""){
$DescriptionSt="All";
}else{
$s=trim($Description);
if($s===""){
$DescriptionSt="Other";
}else{
$DescriptionSt=substr($s,0,6);
};

};

$destpart="";

if($DestinationSt!==""){

if($DestinationTypeSt===""){

$destpart=$DestinationSt;

};

if($DestinationTypeSt==="All"){
$destpart=$DestinationSt."_".$DestinationTypeSt;
};

if(($DestinationTypeSt==="Prop")||($DestinationTypeSt==="Cont")){
$destpart=$DestinationSt."_".$DestinationTypeSt."_".$DescriptionSt;
};

if($DestinationTypeSt==="Mob"){

$destpart=$DestinationSt."_".$DestinationTypeSt."_".$DestinationMobileCarrierSt;

};

if($destpart===""){

$destpart=$DestinationSt."_".$DestinationTypeSt."_".$DestinationMobileCarrierSt;
$destpart=$destpart."_".$DescriptionSt;

};

};//'DestinationSt!==""

};//'dest!==""

if($destpart!==""){

$name=$name.$destpart."_";

};


$name=$name.$org."_";

if($gwshortdesc!==""){

$name=$name.$gwshortdesc."_";
};

if($swapdo){

$name=$name.$order;

if($dpdesc!==""){
$name=$name."_".$dpdesc;
};

}else{//'swapdo

if($dpdesc!==""){

$name=$name.$dpdesc."_";

};

$name=$name.$order;

};  //swapdo
$name= Application::ClearName($name);

return $name;
}

		
	
public static function 
	BuildDialCodePattern($tp,$Destination,$DestinationType,$DestinationMobileCarrier,$Description,$useaddprefix,$addprefix,$usetestprefix,$testprefix,$KeepDC)
{

$Destination=trim($Destination);
$DestinationType=trim($DestinationType);
$DestinationMobileCarrier=trim($DestinationMobileCarrier);
$Description=trim($Description);

$DestinationStr="";
if($Destination==="0" )$Destination="";
if($DestinationType=="0") $DestinationType="";
if($DestinationMobileCarrier==="0") $DestinationMobileCarrier="";
if($Description==="0" )$Description="";
if($Destination==="-1" )$Destination="";
if($DestinationType=="-1") $DestinationType="";
if($DestinationMobileCarrier==="-1") $DestinationMobileCarrier="";
if($Description==="-1" )$Description="";
$DestinationMobileCarrierStr="";
$DescriptionStr="";
//$KeepDC="";
if($KeepDC===""){

$dstpattern="";
$dstexclude="";
$cpattern="";
$cexclude="";

if($Destination==="A-Z"){

$dc="[0-9]*";

if($usetestprefix){

$dc=$testprefix.$dc;

};

if($useaddprefix){

$dc=$addprefix.$dc;

};
$dstpattern=$dc;
$dstexclude="";
$cpattern=$dstpattern;
$cexclude=$cexclude;
}else{

if($Destination!=="") $DestinationStr=" vdsName='".$Destination."' ";
if($DestinationType!=="") $DestinationTypeStr=" and vdsType='".$DestinationType."'";
if($DestinationMobileCarrier!==""){
$DestinationMobileCarrierStr=" and ifnull(rtrim(ltrim(vdsMobileCarrier)),'')='".trim($DestinationMobileCarrier)."'";
};


//Application::wbsbreak('1212121',$Description,1,'');
if($Description!==""){
$DescriptionStr="and ifnull(rtrim(ltrim(vdsDescription)),'')='".trim($Description)."'";
};

//getdefaultvaluesfordialcodes
$sql="";
$sql1="";

if($DestinationStr!==""){

$sql0="select * from wbs.tblvoipdestination where ".$DestinationStr;

$s=trim($DestinationType);

if($s!==""){

if($s==="Proper"){
$sql=$sql0." and vdsType='Proper' ".$DestinationMobileCarrierStr.$DescriptionStr;
$sql1=$sql0." and vdsType='Mobile' ".$DestinationMobileCarrierStr.$DescriptionStr;
};

if($s==="Mobile"){
$sql=$sql0."and vdsType='Mobile' ".$DestinationMobileCarrierStr.$DescriptionStr;
};

if($s==="Continental"){
$sql=$sql0."and vdsType='Continental' ".$DestinationMobileCarrierStr.$DescriptionStr;
};

}
else
{ 
$sql=$sql0.$DestinationMobileCarrierStr.$DescriptionStr;
};


$debug3=true;

if($debug3){
$usalist=",1999001,1999002,1999003,1999004,1999005,1999006,1999007,";
}else{
$usalist="";
};

$s="";

if ($sql !== "" ) {
//Application::wbsbreak('1212121',$sql,1,'');
//Setrslist=oConn.execute($sql)
$main_ds=Application::ds();

$stmt=$main_ds->pdo->prepare($sql);
$stmt->execute();



$busa=false;

while($t=($stmt->fetch())){

$dc=$t["vdsDialcode"];

if(strpos(",".$usalist,",".$dc.",")){

$dc="1*";

if(!$busa){
if($usetestprefix)$dc=$testprefix.$dc;
if($useaddprefix)$dc=$addprefix.$dc;
$s=$s.",".$dc;
$busa=true;
};

}else{

if($usetestprefix)$dc=$testprefix.$dc;
if($useaddprefix)$dc=$addprefix.$dc;
$s=$s.",".$dc;

};
};

};

$s=substr_replace($s,"",0,1);

$dstpattern=$s;

$s="";

//Application::wbsbreak("app345",$sql1,1,"");
if($sql1!==""){

//SetrsList=oConn.execute(sql1)
$stmt=$main_ds->pdo->prepare($sql1);
$stmt->execute();
$s="";

$busa=false;

while($t=($stmt->fetch())){

$dc=$t["vdsDialcode"];

if(strpos(",".$usalist,",".$dc.",")){

$dc="1*";

if(!$busa){
if($usetestprefix) $dc=$testprefix.$dc;
if($useaddprefix) $dc=$addprefix.$dc;
$s=$s.",".$dc;
$busa=true;
};

}else{
if($usetestprefix)$dc=$testprefix.$dc;
if($useaddprefix)$dc=$addprefix.$dc;
$s=$s.",".$dc;

//};

};

};


$s=substr_replace($s,"",0,1);

$dstexclude=$s;

};

};

};

};

/*

if($Destination!=="") $DestinationStr="vdsName=\'".$Destination."\'";

if($DestinationType!=="") $DestinationTypeStr=" and vdsType=\'".$DestinationType."\'";

if($DestinationMobileCarrier!==""){
$DestinationMobileCarrierStr="and $vdsMobileCarrier like \'%".$DestinationMobileCarrier."%\'";

};

if($Description!==""){
$DescriptionStr="and $vdsDescription like \'%".$Description."%\'";
};

*/
  

if (trim($dstpattern) !== "") $dstpattern=str_replace(",",".*,",$dstpattern).".*";
if (trim($dstexclude) !== "") $dstexclude=str_replace(",",".*,",$dstexclude).".*";

if ($tp===1) return $dstpattern;
if ($tp===2) return $dstexclude;

}

}


?>
