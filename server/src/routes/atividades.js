import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const HOJE = "(now() at time zone 'America/Sao_Paulo')::date";

const SELECT = `
  select a.id, a.nome, a.descricao, a.prazo, a.prioridade, a.materia_id,
         m.nome as materia, m.cor as materia_cor,
         case
           when a.concluida then 'concluida'
           when a.prazo - ${HOJE} <= e.antecedencia_dias then 'prazo-proximo'
           else 'pendente'
         end as status
  from atividades a
  join materias m on m.id = a.materia_id
  join estudantes e on e.id = a.estudante_id
`;

const formatar = (r) => ({
  id: r.id,
  nome: r.nome,
  descricao: r.descricao,
  prazo: r.prazo,
  prioridade: r.prioridade,
  status: r.status,
  materiaId: r.materia_id,
  materia: r.materia,
  materiaCor: r.materia_cor,
});

async function buscarUma(id, estudanteId) {
  const { rows } = await query(`${SELECT} where a.id = $1 and a.estudante_id = $2`, [id, estudanteId]);
  return rows[0] ? formatar(rows[0]) : null;
}

async function validar(body, estudanteId) {
  const nome = (body.nome || "").trim();
  const prazo = body.prazo;
  const prioridade = body.prioridade || "media";
  if (!nome) return { erro: "Dê um nome para a atividade" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo || "")) return { erro: "Informe a data de entrega" };
  if (!["alta", "media", "baixa"].includes(prioridade)) return { erro: "Prioridade inválida" };

  const mat = await query("select id from materias where id = $1 and estudante_id = $2", [body.materiaId, estudanteId]);
  if (!mat.rowCount) return { erro: "Escolha uma matéria válida" };

  return { nome, prazo, prioridade, descricao: (body.descricao || "").trim(), materiaId: mat.rows[0].id };
}

router.get("/", async (req, res) => {
  const { rows } = await query(`${SELECT} where a.estudante_id = $1 order by a.prazo, a.id`, [req.estudanteId]);
  res.json(rows.map(formatar));
});

router.post("/", async (req, res) => {
  const d = await validar(req.body, req.estudanteId);
  if (d.erro) return res.status(400).json(d);

  const { rows } = await query(
    `insert into atividades (estudante_id, materia_id, nome, descricao, prazo, prioridade)
     values ($1, $2, $3, $4, $5, $6) returning id`,
    [req.estudanteId, d.materiaId, d.nome, d.descricao, d.prazo, d.prioridade]
  );
  res.status(201).json(await buscarUma(rows[0].id, req.estudanteId));
});

router.put("/:id", async (req, res) => {
  const d = await validar(req.body, req.estudanteId);
  if (d.erro) return res.status(400).json(d);

  const r = await query(
    `update atividades set materia_id = $1, nome = $2, descricao = $3, prazo = $4, prioridade = $5
     where id = $6 and estudante_id = $7`,
    [d.materiaId, d.nome, d.descricao, d.prazo, d.prioridade, req.params.id, req.estudanteId]
  );
  if (!r.rowCount) return res.status(404).json({ erro: "Atividade não encontrada" });
  res.json(await buscarUma(req.params.id, req.estudanteId));
});

router.patch("/:id/concluir", async (req, res) => {
  const concluida = req.body.concluida !== false;
  const r = await query(
    `update atividades set concluida = $1, concluida_em = case when $1 then now() else null end
     where id = $2 and estudante_id = $3`,
    [concluida, req.params.id, req.estudanteId]
  );
  if (!r.rowCount) return res.status(404).json({ erro: "Atividade não encontrada" });
  res.json(await buscarUma(req.params.id, req.estudanteId));
});

router.delete("/:id", async (req, res) => {
  const r = await query("delete from atividades where id = $1 and estudante_id = $2", [req.params.id, req.estudanteId]);
  if (!r.rowCount) return res.status(404).json({ erro: "Atividade não encontrada" });
  res.status(204).end();
});

export default router;
