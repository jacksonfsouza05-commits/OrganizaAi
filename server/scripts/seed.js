import bcrypt from "bcryptjs";
import { pool } from "../src/db.js";

const EMAIL = "lucas@email.com";
const SENHA = "senha123";

const hoje = new Date();
const dia = (n) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const materias = [
  ["Matemática", "#7C3AED"],
  ["História", "#D97706"],
  ["Programação", "#059669"],
  ["Física", "#2563EB"],
  ["Química", "#DC2626"],
  ["Português", "#DB2777"],
  ["Biologia", "#0891B2"],
  ["Geografia", "#65A30D"],
];

const atividades = [
  ["Lista de exercícios — Derivadas", "Matemática", "Resolver os exercícios 1 a 15 do capítulo 4.", 2, "alta", false],
  ["Redação sobre a Revolução Industrial", "História", "Texto dissertativo-argumentativo de 25 linhas.", 3, "alta", false],
  ["Projeto final — Sistema de login", "Programação", "Tela de login com validação e JWT.", 3, "alta", false],
  ["Relatório de laboratório — Óptica", "Física", "Conclusões do experimento de refração.", 10, "media", false],
  ["Mapa conceitual — Evolução", "Biologia", "Mapa conceitual sobre a teoria de Darwin.", 13, "media", false],
  ["Exercícios de estequiometria", "Química", "Lista de exercícios do capítulo 7.", 15, "baixa", false],
  ["Análise de texto — Dom Casmurro", "Português", "Análise dos capítulos 1 a 20.", 7, "media", false],
  ["Questionário — Biomas brasileiros", "Geografia", "Responder o questionário no AVA.", -10, "baixa", true],
  ["Trabalho — Segunda Guerra Mundial", "História", "Apresentação em grupo sobre causas e consequências.", -5, "alta", true],
  ["Prova de vetores", "Matemática", "Estudar os capítulos 2 e 3.", -7, "alta", true],
];

const conteudos = [
  ["Matemática", "Derivadas e regras de derivação",
    "A derivada de uma função mede a taxa de variação instantânea dela em relação à variável independente. Geometricamente, é a inclinação da reta tangente ao gráfico em um ponto. As principais regras são a do produto, do quociente, da cadeia e as derivadas das funções elementares.",
    ["Definição de derivada como limite", "Regra do produto e do quociente", "Regra da cadeia", "Derivadas de funções trigonométricas", "Derivadas de ordem superior"],
    "Imagina que você está andando de carro. A derivada é o seu velocímetro: diz o quão rápido a sua posição está mudando agora, neste instante. Se você acelera, ela cresce; se freia, ela diminui. No gráfico, é o quanto a curva está inclinada naquele ponto."],
  ["Programação", "Autenticação com JWT",
    "JSON Web Token (JWT) é um padrão aberto para tokens de acesso. Tem três partes — header, payload e signature — em Base64, separadas por ponto. O fluxo comum é: o usuário faz login, o servidor gera o token, o cliente guarda e manda em cada requisição.",
    ["Estrutura header.payload.signature", "Algoritmos de assinatura (HS256, RS256)", "Autenticação stateless", "Refresh token e expiração", "Boas práticas de segurança"],
    "JWT é um crachá digital. Você entra no prédio, recebe um crachá com nome e permissões e mostra em cada sala. O segurança consegue conferir se o crachá é verdadeiro sem te chamar na recepção toda vez."],
  ["Física", "Óptica geométrica — Refração",
    "Refração é a mudança de direção da luz ao passar de um meio para outro com índice de refração diferente. A lei de Snell descreve isso: n₁·sen(θ₁) = n₂·sen(θ₂). O índice de refração é a razão entre a velocidade da luz no vácuo e a velocidade no meio.",
    ["Lei de Snell-Descartes", "Índice de refração absoluto e relativo", "Reflexão total e ângulo limite", "Aplicações: prismas, fibras ópticas e lentes"],
    "Já reparou que um canudo dentro do copo d'água parece quebrado? A luz anda mais devagar na água do que no ar, então ela \"entorta\" quando muda de meio. É o mesmo princípio dos óculos."],
];

const client = await pool.connect();
try {
  await client.query("begin");
  await client.query("delete from estudantes where email = $1", [EMAIL]);

  const hash = await bcrypt.hash(SENHA, 10);
  const est = await client.query(
    "insert into estudantes (nome, email, senha_hash) values ($1, $2, $3) returning id",
    ["Lucas Ferreira", EMAIL, hash]
  );
  const estId = est.rows[0].id;

  const ids = {};
  for (const [nome, cor] of materias) {
    const r = await client.query(
      "insert into materias (estudante_id, nome, cor) values ($1, $2, $3) returning id",
      [estId, nome, cor]
    );
    ids[nome] = r.rows[0].id;
  }

  for (const [nome, mat, desc, offset, prio, feita] of atividades) {
    await client.query(
      `insert into atividades (estudante_id, materia_id, nome, descricao, prazo, prioridade, concluida, concluida_em)
       values ($1, $2, $3, $4, $5, $6, $7, case when $7 then now() end)`,
      [estId, ids[mat], nome, desc, dia(offset), prio, feita]
    );
  }

  for (const [mat, titulo, resumo, topicos, simples] of conteudos) {
    await client.query(
      "insert into conteudos (materia_id, titulo, resumo, topicos, explicacao_simples) values ($1, $2, $3, $4, $5)",
      [ids[mat], titulo, resumo, topicos, simples]
    );
  }

  await client.query("commit");
  console.log(`Usuário de teste criado: ${EMAIL} / ${SENHA}`);
} catch (e) {
  await client.query("rollback");
  throw e;
} finally {
  client.release();
  await pool.end();
}
