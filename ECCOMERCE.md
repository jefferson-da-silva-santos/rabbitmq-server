Agora tu começou a brincar de sistema de verdade 😎
Vamos montar isso do jeito clássico: **simples, organizado e desacoplado**.

A ideia é simular um e-commerce usando:

* API Node (Express)
* JSON fake como “banco”
* Fila com RabbitMQ
* Serviço fake de e-mail
* Gateway de pagamento fake

Arquitetura raiz, igual sistema grande faz 🏗️

---

# 🏛️ Arquitetura

```
Cliente → API → RabbitMQ → Workers
                        ├── Pagamento
                        └── Email
```

A API:

* Recebe pedido
* Joga na fila
* Retorna “pedido recebido”

Workers:

* Um processa pagamento
* Outro envia email

---

# 📦 1️⃣ JSON fake de produtos

`produtos.json`

```json
[
  { "id": 1, "nome": "Notebook Gamer", "preco": 4500 },
  { "id": 2, "nome": "Mouse RGB", "preco": 150 },
  { "id": 3, "nome": "Teclado Mecânico", "preco": 350 }
]
```

---

# 🚀 2️⃣ API principal (producer)

Instala:

```bash
npm init -y
npm install express amqplib
```

`server.js`

```js
import express from "express";
import amqp from "amqplib";
import fs from "fs";

const app = express();
app.use(express.json());

const produtos = JSON.parse(fs.readFileSync("./produtos.json"));

async function enviarParaFila(dados) {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();
  const fila = "pedidos";

  await channel.assertQueue(fila);
  channel.sendToQueue(fila, Buffer.from(JSON.stringify(dados)));

  console.log("Pedido enviado para fila");
}

app.post("/pedido", async (req, res) => {
  const { produtoId, email } = req.body;

  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  const pedido = {
    id: Date.now(),
    produto,
    email
  };

  await enviarParaFila(pedido);

  res.json({ mensagem: "Pedido recebido e em processamento" });
});

app.listen(3000, () => console.log("API rodando na porta 3000"));
```

---

# 💳 3️⃣ Worker de Pagamento (fake gateway)

`pagamento.js`

```js
import amqp from "amqplib";

async function consumidor() {
  const connection = await amqp.connect("amqp://admin:admin123@localhost:5672");
  const channel = await connection.createChannel();
  const fila = "pedidos";

  await channel.assertQueue(fila);

  channel.consume(fila, msg => {
    const pedido = JSON.parse(msg.content.toString());

    console.log("Processando pagamento...");
    
    setTimeout(() => {
      console.log("Pagamento aprovado 💳");
      channel.ack(msg);
    }, 2000);
  });
}

consumidor();
```

Isso simula um gateway tipo Stripe ou PagSeguro.

Só que fake. Raiz. No console 😂

---

# 📧 4️⃣ Worker de Email (fake)

Você pode criar outra fila chamada `email`
Ou simplificar e só logar:

```js
console.log(`Email enviado para ${pedido.email} confirmando compra`);
```

Se quiser algo mais real, pode usar Nodemailer simulando envio.

---

# 🔥 Como testar

1. Sobe o RabbitMQ no Docker
2. Roda:

   * `node server.js`
   * `node pagamento.js`
3. Faz POST:

```json
POST http://localhost:3000/pedido

{
  "produtoId": 1,
  "email": "cliente@email.com"
}
```

Resultado:

* API responde rápido
* Worker processa pagamento
* Email é “enviado”

---

# 🧠 O que você está aprendendo aqui

Isso é:

* Processamento assíncrono
* Desacoplamento
* Arquitetura orientada a eventos
* Base de microserviços

É assim que e-commerce grande funciona.
Só que lá tem banco real, gateway real e fila clusterizada 😅

---

Se quiser, eu posso te montar isso já separado em pastas estilo projeto profissional (producer / workers / docker-compose).
Aí vira projeto de portfólio pesado mesmo 💼🔥
