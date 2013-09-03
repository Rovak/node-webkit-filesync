<?php

$filename = isset($_GET['filename']) ? $_GET['filename'] : 'unknown.txt';

$output = realpath("output/$filename");
mkdir(dirname($output));

switch($_SERVER['REQUEST_METHOD']) {
	case "GET":
		// Give file back
		break;

	case "POST":
		file_put_contents($output, file_get_contents("php://input"));
		break;
}