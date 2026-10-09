import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const SELECT = `
  select m.id, m.nome, m.cor,
    (select count(*) from atividades a where a.materia_id = m.id)::int as atividades,
    (select count(*) from atividades a where a.materia_id = m.id and a.concluida)::int as concluidas,
    (select count(*) from conteudos c where c.materia_id = m.id)::int as conteudos,
    (select count(*) from conteudos c where c.materia_id = m.id and c.estudado)::int as estudados
  from materias m
`;

router.get("/", async (req, res) => {
  const { rows } = await query(`${SELECT} where m.estudante_id = $1 order by m.nome`, [req.estudanteId]);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const nome = (req.body.nome || "").trim();
  const cor = /^#[0-9a-fA-F]{6}$/.test(req.body.cor || "") ? req.body.cor : "#7C3AED";
  if (!nome) return res.status(400).json({ erro: "Dê um nome para a matéria" });

  const dup = await query("select 1 from materias where estudante_id = $1 and lower(nome) = lower($2)", [req.estudanteId, nome]);
  if (dup.rowCount) return res.status(409).json({ erro: "Você já tem essa matéria" });

  const { rows } = await query(
    "insert into materias (estudante_id, nome, cor) values ($1, $2, $3) returning id",
    [req.estudanteId, nome, cor]
  );
  const nova = await query(`${SELECT} where m.id = $1`, [rows[0].id]);
  res.status(201).json(nova.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const r = await query("delete from materias where id = $1 and estudante_id = $2", [req.params.id, req.estudanteId]);
  if (!r.rowCount) return res.status(404).json({ erro: "Matéria não encontrada" });
  res.status(204).end();
});

router.get("/:id/conteudos", async (req, res) => {
  const dona = await query("select 1 from materias where id = $1 and estudante_id = $2", [req.params.id, req.estudanteId]);
  if (!dona.rowCount) return res.status(404).json({ erro: "Matéria não encontrada" });

  const { rows } = await query(
    `select id, titulo, resumo, topicos, explicacao_simples as "explicacaoSimples", estudado
     from conteudos where materia_id = $1 order by id`,
    [req.params.id]
  );
  res.json(rows);
});

router.post("/:id/conteudos", async (req, res) => {
  const dona = await query("select 1 from materias where id = $1 and estudante_id = $2", [req.params.id, req.estudanteId]);
  if (!dona.rowCount) return res.status(404).json({ erro: "Matéria não encontrada" });

  const titulo = (req.body.titulo || "").trim();
  const resumo = (req.body.resumo || "").trim();
  if (!titulo || !resumo) return res.status(400).json({ erro: "Preencha o título e o resumo" });

  const topicos = (Array.isArray(req.body.topicos) ? req.body.topicos : [])
    .map((t) => String(t).trim())
    .filter(Boolean);
  const simples = (req.body.explicacaoSimples || "").trim() || null;

  const { rows } = await query(
    `insert into conteudos (materia_id, titulo, resumo, topicos, explicacao_simples)
     values ($1, $2, $3, $4, $5)
     returning id, titulo, resumo, topicos, explicacao_simples as "explicacaoSimples", estudado`,
    [req.params.id, titulo, resumo, topicos, simples]
  );
  res.status(201).json(rows[0]);
});

export default router;
