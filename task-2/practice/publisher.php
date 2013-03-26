<?php

/**
 * @link https://github.com/videlalvaro/php-amqplib/blob/master/demo/amqp_publisher.php
 */

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();

$ch->exchange_declare('fhs', 'direct', FALSE, TRUE, FALSE);
$ch->queue_declare('fhs-queue', FALSE, TRUE, FALSE, FALSE);
$ch->queue_bind('fhs-queue', 'fhs');

$msg = new AMQPMessage('test', array(
  'content-type' => 'text/plain',
  'delivery_mode' => 2
));

$start = microtime(TRUE);

$max = $argv[1];
for ($i = 0; $i < $max; $i++) {
  $ch->basic_publish($msg, 'fhs');
}

$ch->basic_publish(new AMQPMessage('quit', array('content-type' => 'text/plain')), 'fhs');

echo "\n" . microtime(TRUE) - $start . "\n";

$ch->close();
$conn->close();