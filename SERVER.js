import express from 'express';
import amqp from 'amqplib';
import fs from 'fs';

const app = express();

app.use(express.json());

const produtos = JSON.parse(fs.readFileSync('./produtos.json'));

async function enviarParaFila(dados) {
  const connection = await amqp.connect('amqp://admin:admin123@localhost:5672');
  const channel = await connection.createChannel();
  const fila = 'pedidos';

  await channel.assertQueue(fila);
  channel.sendToQueue(fila, Buffer.from(JSON.stringify(dados)));
  console.log("Pedido enviado para fila de pedidos.");
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

  await enviarParaFila(pedido);

  res.json({
    
  })
})