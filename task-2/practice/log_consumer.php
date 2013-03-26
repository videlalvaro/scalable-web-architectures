<?php

/**
 * @param PhpAmqpLib\Message\AMQPMessage $msg
 */
function process_message($msg) {
  echo $msg->body , "\n";
}

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();
list($queue,,) = $ch->exchange_declare();
$ch->queue_bind($queue, 'logs', $argv[1]);

$ch->basic_consume($queue, '', FALSE, TRUE, FALSE, FALSE, 'process_message');

while (count($ch->callbacks)) {
  $ch->wait();
}