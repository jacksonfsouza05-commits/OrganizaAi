import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { gerarToken, exigirLogin } from "../auth.js";

const router = Router();

const publico = (e) => ({
  id: e.id,
  nome: e.nome,
  email: e.email,
  notifPrazo: e.notif_prazo,
  notifDiario: e.notif_diario,
  notifSemanal: e.notif_semanal,
  antecedencia: e.antecedencia_dias,
  senhaAlteradaEm: e.senha_alterada_em,
});

router.post("/registrar", async (req, res) => {
  const nome = (req.body.nome || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const senha = req.body.senha || "";

  if (!nome || !email || !senha) return res.status(400).json({ erro: "Preencha nome, e-mail e senha" });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ erro: "E-mail inválido" });
  if (senha.length < 8) return res.status(400).json({ erro: "A senha precisa ter pelo menos 8 caracteres" });

  const existe = await query("select 1 from estudantes where email = $1", [email]);
  if (existe.rowCount) return res.status(409).json({ erro: "Esse e-mail já tem conta" });

  const hash = await bcrypt.hash(senha, 10);
  const { rows } = await query(
    "insert into estudantes (nome, email, senha_hash) values ($1, $2, $3) returning *",
    [nome, email, hash]
  );
  res.status(201).json({ token: gerarToken(rows[0].id), estudante: publico(rows[0]) });
});

router.post("/entrar", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const senha = req.body.senha || "";

  const { rows } = await query("select * from estudantes where email = $1", [email]);
  const e = rows[0];
  if (!e || !(await bcrypt.compare(senha, e.senha_hash))) {
    return res.status(401).json({ erro: "E-mail ou senha incorretos" });
  }
  res.json({ token: gerarToken(e.id), estudante: publico(e) });
});

router.get("/eu", exigirLogin, async (req, res) => {
  const { rows } = await query("select * from estudantes where id = $1", [req.estudanteId]);
  if (!rows[0]) return res.status(401).json({ erro: "Conta não encontrada" });
  res.json(publico(rows[0]));
});

router.put("/eu", exigirLogin, async (req, res) => {
  const { nome, notifPrazo, notifDiario, notifSemanal, antecedencia } = req.body;
  if (!nome || !nome.trim()) return res.status(400).json({ erro: "O nome não pode ficar vazio" });
  const dias = Number(antecedencia);
  if (!Number.isInteger(dias) || dias < 1 || dias > 30) {
    return res.status(400).json({ erro: "Antecedência deve ser entre 1 e 30 dias" });
  }

  const { rows } = await query(
    `update estudantes set nome = $1, notif_prazo = $2, notif_diario = $3,
       notif_semanal = $4, antecedencia_dias = $5
     where id = $6 returning *`,
    [nome.trim(), !!notifPrazo, !!notifDiario, !!notifSemanal, dias, req.estudanteId]
  );
  res.json(publico(rows[0]));
});

router.put("/senha", exigirLogin, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!novaSenha || novaSenha.length < 8) {
    return res.status(400).json({ erro: "A nova senha precisa ter pelo menos 8 caracteres" });
  }
  const { rows } = await query("select senha_hash from estudantes where id = $1", [req.estudanteId]);
  if (!rows[0] || !(await bcrypt.compare(senhaAtual || "", rows[0].senha_hash))) {
    return res.status(401).json({ erro: "Senha atual incorreta" });
  }
  const hash = await bcrypt.hash(novaSenha, 10);
  await query("update estudantes set senha_hash = $1, senha_alterada_em = now() where id = $2", [hash, req.estudanteId]);
  res.json({ ok: true });
});

export default router;
