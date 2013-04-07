# AMQPChat

My application is based on the extended tutorial [Scaling Real-time Apps on Cloud Foundry Using Node.js and Redis](https://github.com/videlalvaro/rabbitpubsub)
from [Raja Rao DV](http://blog.cloudfoundry.com/author/raja/) and [Alvaro Videla](http://videlalvaro.github.io/). My
version is not much different to the version described in the tutorial. I spent most time with understanding node.js and
Cloud Foundry. I also encountered various problems where I was not able to continue with development because Cloud
Foundry was down or mysterious errors were thrown for two or three days and than they simply went away for no apparent
reason. My final architecture looks like the following:

![Final app architecture](https://raw.github.com/Fleshgrinder/scalable-web-architectures/master/task-2/public_html/readme-pics/app-architecture.png)

The most significant change in comparison to the app that was created in the tutorial is the fact that this chat is
really scalable. The problem with the original app was, that the sockets from Socket.IO were not shared among all app
instances. Socket.IO per default keeps its sockets in memory, thus one instance of Socket.IO has no knowledge of any
sockets created by another Socket.IO instance. This leads to warning messages like “Client not handshaken”. By using a
Redis store to store the sockets all Socket.IO instances can share their sockets and no warnings will be thrown anymore.
Each Socket.IO instance has access to each socket.

Other than that I focused on creating a real chat application with a working registration (sending a mail would have
been nice, but one needs an SMTP to do so via Cloud Foundry; I could have used my Gmail account but I thought it is not
crucial for the application to send mails and did not implement it), a working login and a very robust chat. It is a
single page app and the complete view logic is present in the clients JavaScript.

You can find it online at [amqpchat.cloudfoundry.com](http://amqpchat.cloudfoundry.com/) and if it is not working it is
most likely a Cloud Foundry problem (as I had so many).