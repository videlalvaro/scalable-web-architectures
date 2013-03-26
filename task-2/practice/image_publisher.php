<?php
require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

for ($i = 1; $i <= 3; $i++) {
  if (!isset($argv[$i])) {
    exit('usage: php image_publisher.php {IMAGE_ID} {IMAGE_PATH} {USER_ID}' . "\n");
  }
  echo 'argv[' . $i . '] => ' . $argv[$i] . "\n";
}

$image_id = $argv[1];
$image_path = $argv[2];
$user_id = $argv[3];

$exchange = 'new_image';
$msg = new AMQPMessage(
  json_encode(array('image_id' => $image_id, 'image_path' => $image_path, 'user_id' => $user_id)),
  array('content-type' => 'application/json', 'delivery_mode' => 2)
);

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();

$ch->exchange_declare($exchange, 'fanout', FALSE, TRUE, FALSE);
$ch->basic_publish($msg, $exchange);