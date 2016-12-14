
<?php

$jsonObj=$_POST["myjsondata"];

 //$jsonObj = filemtime('data1.json');

 $filemtime_old = filemtime('data.json');
	$time_now = time(void);

//echo $filemtime_old;

 if ( $time_now - $filemtime_old > 1)
  {
$fp = fopen('data.json', 'w');
fwrite($fp, json_encode($jsonObj));
fclose($fp);

 echo "file written";
  } else {


echo ("file not written");

  }



 //echo '<pre>' . print_r($json1, true) . '</pre>';

// fclose($myfile);

// echo fread($myfile,filesize("data.json"));

// if (file_exists($filename)) {
//     echo filemtime($filename);
// }


  ?>