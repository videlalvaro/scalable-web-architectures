<?php

class Notifier {
  /**
   * @param PhpAmqpLib\Message\AMQPMessage $msg
   */
  public function notify($msg) {
    print_r(json_decode($msg->body, TRUE));
    $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
  }
}

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;

$exchange = 'new_image';
$queue = 'notifier_queue';

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();

$ch->queue_declare($queue, FALSE, TRUE, FALSE, FALSE);
$ch->queue_bind($queue, $exchange);

$notifier = new Notifier();
$ch->basic_consume($queue, '', FALSE, FALSE, FALSE, FALSE, array($notifier, 'notify'));

while (count($ch->callbacks)) {
  $ch->wait();
}

$ch->close();
$conn->close();