create table if not exists estudantes (
  id serial primary key,
  nome varchar(120) not null,
  email varchar(160) not null unique,
  senha_hash text not null,
  notif_prazo boolean not null default true,
  notif_diario boolean not null default true,
  notif_semanal boolean not null default false,
  antecedencia_dias int not null default 3,
  senha_alterada_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

create table if not exists materias (
  id serial primary key,
  estudante_id int not null references estudantes(id) on delete cascade,
  nome varchar(80) not null,
  cor varchar(7) not null default '#7C3AED',
  criado_em timestamptz not null default now(),
  unique (estudante_id, nome)
);

create table if not exists atividades (
  id serial primary key,
  estudante_id int not null references estudantes(id) on delete cascade,
  materia_id int not null references materias(id) on delete cascade,
  nome varchar(160) not null,
  descricao text not null default '',
  prazo date not null,
  prioridade varchar(5) not null default 'media' check (prioridade in ('alta','media','baixa')),
  concluida boolean not null default false,
  concluida_em timestamptz,
  criado_em timestamptz not null default now()
);

create table if not exists conteudos (
  id serial primary key,
  materia_id int not null references materias(id) on delete cascade,
  titulo varchar(160) not null,
  resumo text not null,
  topicos text[] not null default '{}',
  explicacao_simples text,
  estudado boolean not null default false,
  criado_em timestamptz not null default now()
);

create index if not exists idx_atividades_estudante_prazo on atividades (estudante_id, prazo);
create index if not exists idx_materias_estudante on materias (estudante_id);
create index if not exists idx_conteudos_materia on conteudos (materia_id);
