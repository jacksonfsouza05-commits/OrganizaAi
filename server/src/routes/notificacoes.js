import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await query(
    `select a.id, a.nome, m.nome as materia,
            a.prazo - (now() at time zone 'America/Sao_Paulo')::date as dias
     from atividades a
     join materias m on m.id = a.materia_id
     join estudantes e on e.id = a.estudante_id
     where a.estudante_id = $1 and not a.concluida and e.notif_prazo
       and a.prazo - (now() at time zone 'America/Sao_Paulo')::date <= e.antecedencia_dias
     order by a.prazo
     limit 20`,
    [req.estudanteId]
  );

  res.json(rows.map((r) => {
    const d = r.dias;
    const quando = d < 0 ? `atrasada há ${-d} dia${d === -1 ? "" : "s"}` : d === 0 ? "vence hoje" : d === 1 ? "vence amanhã" : `vence em ${d} dias`;
    return { id: r.id, texto: `${r.nome} (${r.materia}) ${quando}`, urgente: d <= 1 };
  }));
});

export default router;
