import "dotenv/config";
import express from "express";
import cors from "cors";
import { exigirLogin } from "./auth.js";
import authRoutes from "./routes/auth.js";
import atividadesRoutes from "./routes/atividades.js";
import materiasRoutes from "./routes/materias.js";
import conteudosRoutes from "./routes/conteudos.js";
import notificacoesRoutes from "./routes/notificacoes.js";

const app = express();

app.use(cors({ origin: (process.env.FRONT_URL || "http://localhost:5173").split(",") }));
app.use(express.json());

app.get("/api/saude", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/atividades", exigirLogin, atividadesRoutes);
app.use("/api/materias", exigirLogin, materiasRoutes);
app.use("/api/conteudos", exigirLogin, conteudosRoutes);
app.use("/api/notificacoes", exigirLogin, notificacoesRoutes);

app.use((req, res) => res.status(404).json({ erro: "Rota não encontrada" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "22P02") return res.status(400).json({ erro: "Dado inválido" });
  res.status(500).json({ erro: "Algo deu errado aqui do nosso lado" });
});

const porta = process.env.PORT || 3333;
app.listen(porta, () => console.log(`API rodando na porta ${porta}`));
