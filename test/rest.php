<?php

$filename = isset($_SERVER['PATH_INFO']) ? trim($_SERVER['PATH_INFO'], '/') : 'unknown.txt';

$fileLocation = realpath("files/$filename");
$fileinfo = pathinfo($fileLocation);

if (!is_dir($fileinfo['dirname'])) {
	mkdir($fileinfo['dirname']);
}

switch($_SERVER['REQUEST_METHOD']) {

	case "GET":
		header($_SERVER["SERVER_PROTOCOL"] . " 200 OK");
        header("Cache-Control: public");
        //header("Content-Type: application/zip");
        header("Content-Transfer-Encoding: Binary");
        header("Content-Length:".filesize($fileLocation));
        header("Content-Disposition: attachment; filename=" . $fileinfo['filename']);
        readfile($fileLocation);
		break;

	case "POST":
		file_put_contents($fileLocation, file_get_contents("php://input"));
		echo 'done!';
		break;
}