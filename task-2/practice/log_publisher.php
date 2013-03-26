<?php

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();
$ch->exchange_declare('logs', 'topics', FALSE, TRUE, FALSE);

if (!isset($argv[1])) exit('usage: php log_publisher.php {LOG_MESSAGE}');
$ch->basic_publish(new AMQPMessage($argv[1]), 'logs', $argv[2]);

$ch->close();
$conn->close();