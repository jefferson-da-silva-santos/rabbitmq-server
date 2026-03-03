import amqp from 'amqplib';

async function consumer() {
  const connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
  const channel = await connection.createChannel();

  const queue = 'minha-fila';

  await channel.assertQueue(queue, {
    durable: true 
  });

  console.log(" [*] Waiting for messages...");

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log(" [x] Received:", msg.content.toString());

      channel.ack(msg);
    }
  }, {
    noAck: false
  });
}

consumer();