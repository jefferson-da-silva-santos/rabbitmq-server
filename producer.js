import amqp from 'amqplib';

async function producer() {
  const connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
  const channel = await connection.createChannel();

  const queue = 'minha-fila';
  const msg = 'Hello World!';

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(msg), {
    persistent: true
  });

  console.log("Mensagem enviada");

  setTimeout(() => {
    connection.close();
  }, 500);
}

producer();