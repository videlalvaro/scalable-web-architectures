<?php

if (!isset($argv[1])) {
  exit('usage: php rpc_client.php {MSG}');
}

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;
use PhpAmqpLib\Message\AMQPMessage;

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();

function shutdown($ch, $conn) {
  $ch->close();
  $conn->close();
}

/**
 * @param PhpAmqpLib\Message\AMQPMessage $msg
 */
function rpc_client($msg) {
  // you could also use $msg->get('correlation_id')
  echo 'got response for request: ' , $msg->get('correlation_id') , ' ' , $msg->body , "\n";
  $msg->delivery_info['channel']->basic_cancel($msg->get('consumer_tag'));
}

list($queue,,) = $ch->queue_declare();
$ch->basic_consume($queue, '', false, true, false, false, 'rpc_client');
$ch->basic_publish(new AMQPMessage($argv[1], array('reply_to' => $queue, 'correlation_id' => '1')), 'rpc');

while (count($ch->callbacks)) {
  $ch->wait();
}

register_shutdown_function('shutdown', $ch, $conn);