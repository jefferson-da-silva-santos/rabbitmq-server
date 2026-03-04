import express from 'express';
import amqp from 'amqplib';
import fs from 'fs';

const app = express();

app.use(express.json());

const produtos = JSON.parse(fs.readFileSync('./produtos.json'));

async function enviarParaExchange(dados) {
  const connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
  const channel = await connection.createChannel();
  const exchange = 'pedidos_exchange';

  await channel.assertExchange(exchange, 'fanout', { durable: false });

  channel.publish(exchange, '', Buffer.from(JSON.stringify(dados)));
  console.log("Pedido enviado para o exchange. ✅");
}

app.post('/pedido', async (req, res) => {
  const { produtoId, email } = req.body;

  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) return res.status(404).json({ erro: "Produto nao encontrado" });

  const pedido = {
    id: Date.now(),
    produto,
    email
  };

  await enviarParaExchange(pedido);

  res.json({
    message: "Pedido recebido e em processamento"
  })
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});