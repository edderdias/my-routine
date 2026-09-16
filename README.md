# 📅 Minha Rotina

> Uma agenda pessoal para organizar tarefas, compromissos e atividades em um só lugar.

**Minha Rotina** é uma aplicação **PWA (Progressive Web App)** desenvolvida para facilitar a organização da rotina, permitindo cadastrar, acompanhar e gerenciar tarefas pessoais, congregacionais e profissionais.

A proposta é oferecer uma visão simples e prática do que precisa ser feito, ajudando o usuário a acompanhar prazos, prioridades, compromissos e o andamento das atividades.

---

## ✨ Funcionalidades

### 📊 Dashboard

O dashboard apresenta um resumo da rotina com base nos dados cadastrados no sistema.

* Total de tarefas
* Tarefas pendentes
* Tarefas em execução
* Tarefas adiadas
* Tarefas concluídas
* Tarefas atrasadas
* Próximas tarefas
* Tarefas do dia
* Resumo por tipo de tarefa

---

### 📝 Tarefas

As tarefas podem ser classificadas em três categorias:

* 👤 **Pessoal**
* 🤝 **Congregacional**
* 💼 **Profissional**

Cada tipo possui informações específicas para facilitar a organização.

---

### 👤 Tarefas pessoais

Permite cadastrar tarefas do dia a dia com informações como:

* Descrição
* Data
* Horário
* Prioridade
* Status
* Categoria
* Notificações

---

### 🤝 Tarefas congregacionais

As atividades congregacionais podem ser classificadas como:

* Visita
* Reunião
* Comissão
* Discurso
* Evento

Cada modalidade possui campos específicos.

#### Visita

* Descrição
* Data
* Horário
* Local
* Pessoa visitada
* Acompanhante
* Resumo do assunto

#### Reunião

* Descrição
* Data
* Horário
* Local
* Resumo da reunião

#### Comissão

* Descrição
* Data
* Horário
* Local
* Nome

#### Discurso

* Descrição
* Data
* Horário
* Local
* Tema
* Observações

#### Evento

* Descrição
* Data
* Horário
* Local
* Resumo do evento

---

### 💼 Tarefas profissionais

As atividades profissionais possuem informações voltadas ao acompanhamento de solicitações e entregas.

* Descrição
* Data da solicitação
* Solicitante
* Data prevista para entrega
* Tipo de trabalho
* Resumo da solicitação

Tipos de trabalho inicialmente disponíveis:

* Maxus
* OKAD
* Outros

O sistema permite cadastrar novos tipos de trabalho conforme a necessidade.

---

## 🔄 Status

As tarefas podem possuir os seguintes status:

| Status         | Descrição                          |
| -------------- | ---------------------------------- |
| ⏳ Pendente     | Tarefa ainda não iniciada          |
| 🔵 Em execução | Tarefa atualmente em andamento     |
| 📅 Adiado      | Tarefa transferida para outra data |
| ✅ Concluído    | Tarefa finalizada                  |

Ao adiar uma tarefa, o sistema permite informar uma **nova data prevista**, mantendo a rotina atualizada.

---

## 🏷️ Prioridades

As tarefas podem ser classificadas por prioridade:

* 🟢 Baixa
* 🔵 Normal
* 🟠 Alta
* 🔴 Urgente

A prioridade facilita a identificação das atividades que precisam de maior atenção.

---

## 📋 Minhas Tarefas

A área **Minhas Tarefas** reúne todas as atividades cadastradas.

É possível visualizar separadamente:

* Tarefas pessoais
* Tarefas congregacionais
* Tarefas profissionais

A página apresenta um resumo com:

* Total
* Pendentes
* Em execução
* Adiadas
* Concluídas

Também possui filtros para facilitar a localização das tarefas.

---

## 📌 Kanban

O sistema possui uma visão Kanban para acompanhar visualmente o andamento das tarefas.

### Colunas

```text
Pendente → Em execução → Adiado → Concluído
```

As tarefas podem ser movimentadas entre as colunas para alterar seu status.

O Kanban possui filtros por:

* Tipo de tarefa
* Prioridade
* Data
* Status

---

## 📅 Agenda

A agenda permite visualizar os compromissos organizados por data e horário.

É possível acompanhar:

* Tarefas pessoais
* Atividades congregacionais
* Atividades profissionais
* Próximos compromissos
* Tarefas do dia

---

## 🔔 Notificações

O projeto possui estrutura para lembretes de tarefas.

As notificações podem ser configuradas de acordo com a necessidade do usuário, incluindo:

* WhatsApp
* E-mail
* Notificações do PWA

Também é possível configurar a antecedência do lembrete.

Exemplo:

> Reunião às 19:30
> Lembrete configurado para 30 minutos antes.

---

## 📱 PWA

O **Minha Rotina** foi desenvolvido como Progressive Web App, permitindo sua utilização em diferentes dispositivos.

Entre os recursos planejados/implementados estão:

* 📱 Instalação no celular
* 💻 Utilização no computador
* ⚡ Interface responsiva
* 🔔 Notificações
* 📡 Suporte a recursos offline
* 🔄 Sincronização de dados

---

## 🛠️ Tecnologias

O projeto utiliza tecnologias modernas para desenvolvimento web.

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* API REST
* PostgreSQL
* Prisma ORM

### Infraestrutura

* PWA
* Service Worker
* JWT
* Sistema de notificações
* Filas para processamento de tarefas

> A estrutura tecnológica pode evoluir conforme o desenvolvimento do projeto.

---

## 🗂️ Estrutura do projeto

A organização busca manter o código separado por responsabilidade.

```text
src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── contexts/
├── types/
├── utils/
└── assets/
```

---

## 🚀 Objetivos do projeto

O **Minha Rotina** está sendo desenvolvido com foco em:

* Organização pessoal
* Controle de compromissos
* Gerenciamento de tarefas
* Acompanhamento de prazos
* Organização de atividades profissionais
* Organização de atividades congregacionais
* Centralização da rotina
* Facilidade de uso em dispositivos móveis

---

## 🔮 Próximos passos

Entre as funcionalidades que podem ser incorporadas ao projeto:

* [ ] Integração com Google Calendar
* [ ] Integração com Outlook Calendar
* [ ] Comandos por voz
* [ ] Assistente inteligente
* [ ] Sugestão automática de horários
* [ ] Subtarefas
* [ ] Anexos
* [ ] Compartilhamento de tarefas
* [ ] Agenda familiar
* [ ] Lembretes baseados em localização
* [ ] Integração com outros canais de comunicação

---

## 🎨 Identidade

**Minha Rotina**

> Organize seu tempo.
> Conquiste seus objetivos.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido por **Eder Dias** como parte de um projeto de desenvolvimento e estudo de tecnologias modernas para aplicações web e PWA.

---

## 📄 Licença

Este projeto está em desenvolvimento.

A definição da licença e das condições de utilização será adicionada posteriormente.
