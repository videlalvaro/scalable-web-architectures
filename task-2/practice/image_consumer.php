<?php

class Resizer {
  protected $images = array();

  /**
   * @param PhpAmqpLib\Message\AMQPMessage $msg
   */
  public function resize($msg) {
    $this->images[] = json_decode($msg->body, TRUE);
    $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
  }

  /**
   * @param PhpAmqpLib\Message\AMQPMessage $msg
   */
  public function dump($msg) {
    print_r($this->images);
    $this->images = array();
  }
}

require __DIR__ . '/config.php';

use PhpAmqpLib\Connection\AMQPConnection;

$exchange = 'new_image';
$queue = 'resize_queue';
$control = 'control_queue';

$conn = new AMQPConnection(HOST, PORT, USER, PASS, VHOST);
$ch = $conn->channel();

$ch->queue_declare($queue, FALSE, TRUE, FALSE, FALSE);
$ch->queue_bind($queue, $exchange);

$ch->queue_declare($control, FALSE, TRUE, FALSE, FALSE);

$resizer = new Resizer();
$ch->basic_consume($queue, '', FALSE, FALSE, FALSE, FALSE, array($resizer, 'resize'));
$ch->basic_consume($control, '', FALSE, TRUE, FALSE, FALSE, array($resizer, 'dump'));

while (count($ch->callbacks)) {
  $ch->wait();
}

$ch->close();
$conn->close();