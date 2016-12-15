
<?php

	$data = file_get_contents("php://input");

   $fp = fopen('data.json', 'w');
	fwrite($fp, ($data));
	fclose($fp);




  ?>