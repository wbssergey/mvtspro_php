<?php
      require_once('autoload.php'); 

          
static $stmt2;

try {
    $hostname2 = "72.15.129.**";            //host
    $dbname2 = "wbs";            //db name
    $username2 = "rtu";            // username like 'sa'
    $pw2 = "****";                // password for the user

    $dbh2 = new PDO ("mysql:host=$hostname2;dbname=$dbname2","$username2","$pw2");
  } catch (PDOException $e) {
    echo "Failed to get MYSQL DB handle: " . $e->getMessage() . "\n";
    exit;
  }


try {
    $hostname = "72.15.129.**";            //host
    $dbname = "wiztel";            //db name
    $username = "**";            // username like 'sa'
    $pw = "**";                // password for the user

    $dbh = new PDO ("dblib:host=$hostname;dbname=$dbname","$username","$pw");
  } catch (PDOException $e) {
    echo "Failed to get MSSQL DB handle: " . $e->getMessage() . "\n";
    exit;
  }


$stmt2 = $dbh2->prepare("SELECT * FROM wbs.x1customer limit 1");
$stmt2->execute();
$row=$stmt2->fetch();

unset($stmt2);

$param_names=array(); //array_keys($row);
$i=0;
while (list($key) = each($row)) {
if($i==0) array_push($param_names,$key);
if($i==1) {$i=0;} else {$i=1;};

};
//print_r($param_names);
  //
$sql2=" insert into wbs.x1customersave (";

      for($i=0;$i<count($param_names);$i++){
// echo($param_names[$i].".".strpos(" ".$param_names[$i],"FinIssueDate"));
          if (!strpos(" ".$param_names[$i],"FinIssueDate")){
          $sql2=$sql2.", ".$param_names[$i]." ";
  };
           };
$sql2=str_replace("(, ","( ",$sql2);
$sql2=$sql2. ") values(";
      for($i=0;$i<count($param_names);$i++){
          if (!strpos(" ".$param_names[$i],"FinIssueDate")){
          $sql2=$sql2.", :".$param_names[$i]." ";
 };
           };
$sql2=str_replace("values(, "," values ( ",$sql2);
$sql2=$sql2. ") ";
//echo($sql2); 
//exit;
$sql=" select";

      for($i=0;$i<count($param_names);$i++){
          $sql=$sql.", ".$param_names[$i]." ";
           };
$sql=str_replace("select,","select  ",$sql);
$sql=$sql. " from wiztel..x1customer order by id ";

//echo($sql);
  $stmt = $dbh->prepare($sql);

  $stmt->execute();

while ($row = $stmt->fetch()) {
       $wsql=$sql2;       
      for($i=0;$i<count($param_names);$i++){
          $v=$row[$param_names[$i]];   
           if($v==null) $v="null"; 
           if($v!=="null") {
          $v=str_replace("\"","'",$v);
           $v="\"".$v."\"";
           };
           $u="/".":".$param_names[$i]."/";
           $wsql=preg_replace($u, $v, $wsql, 1); //str_replace(':'.$param_names[$i],$v,$wsql);
           };
  
echo($wsql);
$stmt2 = $dbh2->prepare($wsql);
        $stmt2->execute();

        unset($stmt2);  
 
 };


  unset($stmt);

  exit();
 

  $stmt = $dbh->prepare("SELECT * FROM wbs..[0_1partitionlist]");
  $stmt->execute();
      $sql="insert into wbs.0_1partitionlist (id,partitionid,name,created,databasename,centraldatabasename,serverip,centralserverip) values (:id,:partitionid,:name,:created,:databasename,:centraldatabasename,:serverip,:centralserverip)";
    $param_names = SQLParser::parse_sql_params($sql);
  while ($row = $stmt->fetch()) {
  // print_r($row);
      $sql="insert into wbs.0_1partitionlist (id,partitionid,name,created,databasename,centraldatabasename,serverip,centralserverip) values (:id,:partitionid,:name,:created,:databasename,:centraldatabasename,:serverip,:centralserverip)";
  
      for($i=0;$i<count($param_names);$i++){
          $sql=str_replace(':'.$param_names[$i],"'".$row[$param_names[$i]]."'",$sql);
           };
  
$stmt2 = $dbh2->prepare($sql);
        $stmt2->execute();
        unset($stmt2);  

};


  unset($stmt);

  unset($dbh); 

  unset($dbh2); 
?>
