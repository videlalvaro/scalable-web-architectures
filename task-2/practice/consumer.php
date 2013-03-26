<?php

/**
 * @link https://github.com/videlalvaro/php-amqplib/blob/master/demo/amqp_consumer.php
 */

/**
 * @param PhpAmqpLib\Message\AMQPMessage $msg
 */
function process_message($msg) {
  echo $msg->body . "\n";
  $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
  if ($msg->body == 'quit') {
    $msg->delivery_info['channel']->basic_cancel($msg->delivery_info['consumer_tag']);
  }
}

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();

$ch->exchange_declare('fhs', 'direct', FALSE, TRUE, FALSE);
$ch->queue_declare('fhs-queue', FALSE, TRUE, FALSE, FALSE);
$ch->queue_bind('fhs-queue', 'fhs');

$ch->basic_consume('fhs-queue', '', FALSE, FALSE, FALSE, FALSE, 'process_message');

while (count($ch->callbacks)) {
  $ch->wait();
}

$ch->close();
$conn->close();