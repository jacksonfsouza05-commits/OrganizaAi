import { Router } from "express";
import { query } from "../db.js";

const router = Router();

const DONO = `exists (select 1 from materias m where m.id = conteudos.materia_id and m.estudante_id = $2)`;

router.patch("/:id/estudado", async (req, res) => {
  const estudado = req.body.estudado !== false;
  const { rows } = await query(
    `update conteudos set estudado = $3 where id = $1 and ${DONO}
     returning id, estudado`,
    [req.params.id, req.estudanteId, estudado]
  );
  if (!rows[0]) return res.status(404).json({ erro: "Conteúdo não encontrado" });
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const r = await query(`delete from conteudos where id = $1 and ${DONO}`, [req.params.id, req.estudanteId]);
  if (!r.rowCount) return res.status(404).json({ erro: "Conteúdo não encontrado" });
  res.status(204).end();
});

export default router;
