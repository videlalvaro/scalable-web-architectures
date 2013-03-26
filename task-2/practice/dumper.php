<?php

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();
$ch->basic_publish(new AMQPMessage('dump'), '', 'control_queue');

$ch->close();
$conn->close();