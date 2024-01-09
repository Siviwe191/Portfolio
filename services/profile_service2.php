<?php
if(!empty($_FILES['upload']['name'])){

	$uploaddir = $_SERVER['DOCUMENT_ROOT'].'/portfolioHTML/files/';
	$filename = strtolower(uniqid().$_FILES['upload']['name']);
	$uploadfile = $uploaddir.$filename; 

	if (move_uploaded_file($_FILES['upload']['tmp_name'],$uploadfile)) {
		echo 1;
	} else {
		echo 0;
	}
}



 ?>