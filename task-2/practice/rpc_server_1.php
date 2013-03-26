<?php

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
function rpc_server($msg) {
  $msg->delivery_info['channel']->basic_publish(
    new AMQPMessage(str_word_count($msg->body), array('correlation_id' => $msg->get('correlation_id'))),
    '',
    $msg->get('reply_to')
  );
  $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
}

$ch->exchange_declare('rpc_words', 'direct', false, true, false);
$ch->queue_declare('rpc_words_queue', false, true, false, false);
$ch->queue_bind('rpc_words_queue', 'rpc');
$ch->basic_consume('rpc_words_queue', '', false, false, false, false, 'rpc_server');

while (count($ch->callbacks)) {
  $ch->wait();
}

register_shutdown_function('shutdown', $ch, $conn);