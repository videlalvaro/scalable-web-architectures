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

class RpcClient {
  protected $requests = array();
  protected $requestCount = 0;
  protected $ch;
  protected $queue;
  protected $correlationId;

  public function __construct($ch, $queue) {
    $this->ch = $ch;
    $this->queue = $queue;
    $this->correlationId = $this->getCorrelationId();
  }

  public function rpc_client($msg) {
    $this->requests[$this->correlationId][] = $msg->body;
    if (count($this->requests[$this->correlationId]) == $this->requestCount) {
      print_r($this->requests[$this->correlationId]);
      unset($this->requests[$this->correlationId]);
      $msg->delivery_info['channel']->basic_cancel($msg->get('consumer_tag'));
    }
    return $this;
  }

  public function send_request($server, $data) {
    $this->ch->basic_publish(new AMQPMessage($data, array('reply_to' => $this->queue, 'correlation_id' => $this->correlationId)), $server);
    if (!isset($this->requests[$this->correlationId])) {
      $this->requests[$this->correlationId] = array();
    }
    $this->requestCount++;
    return $this;
  }

  public function start() {
    $this->ch->basic_consume($this->queue, '', false, true, false, false, array($this, 'rpc_client'));
    return $this;
  }

  protected function getCorrelationId() {
    return md5(sprintf("%d%s", time(), getmypid()));
  }
}

$data = implode(' ', array_slice($argv, 1));

list($queue,,) = $ch->queue_declare();

$client = new RpcClient($ch, $queue);
$client
  ->send_request('rpc', $data)
  ->send_request('rpc_words', $data)
  ->start()
;

while (count($ch->callbacks)) {
  $ch->wait();
}

register_shutdown_function('shutdown', $ch, $conn);