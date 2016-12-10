<?php

 $jsonObj=$_POST["myjsondata"];
$fp = fopen('data.json', 'w');
fwrite($fp, json_encode($jsonObj));
fclose($fp);

 echo($jsonObj);

  ?>