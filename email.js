import amqp from 'amqplib';

async function consumidor() {
  const connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
  const channel = await connection.createChannel();

  const exchange = 'pedidos_exchange';
  const fila = 'pedidos_email';

  await channel.assertExchange(exchange, 'fanout', { durable: false });
  await channel.assertQueue(fila, { durable: false });
  channel.bindQueue(fila, exchange, '');

  channel.consume(fila, msg => {
    const pedido = JSON.parse(msg.content.toString());
    console.log(`Email enviado para ${pedido.email} confirmando compra. ✅`);
    channel.ack(msg);
  });

  console.log(`👂 Serviço de email está escutando a fila "${fila}"...`);
}

consumidor();