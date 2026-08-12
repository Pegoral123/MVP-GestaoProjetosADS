# 🎓 MVP System
### Sistema Web Responsivo para Gestão e Divulgação de Projetos do MVP

> Projeto desenvolvido durante a Monitoria do curso de **Análise e Desenvolvimento de Sistemas (ADS)** do Centro Universitário Serra dos Órgãos — **UNIFESO**, sob orientação do **Prof. Rodrigo Braga**.

🌐 **[Frontend](https://mvp-gestao-projetos-ads.vercel.app/)** · 📡 **[Backend / Swagger](https://mvp-gestaoprojetosads.onrender.com/api/schema/swagger-ui/)**

---

## 📌 Sobre o Projeto

O **MVP System** foi concebido para solucionar a descentralização das informações relacionadas aos projetos acadêmicos do curso de ADS. A plataforma permite que professores realizem o gerenciamento completo de alunos, equipes, projetos, entregas e avaliações — tudo em um único lugar, com acesso seguro via autenticação JWT.

---

## ✅ Funcionalidades

- 🔐 Login com autenticação JWT (access token + refresh token + blacklist)
- 👨‍🏫 Cadastro e gerenciamento de professores
- 👨‍🎓 Gestão completa de alunos
- 👥 Gestão de equipes (grupos) com vínculo a múltiplos projetos
- 📁 Gestão de projetos como templates reutilizáveis por diferentes grupos
- 📦 Registro de entregas com lançamento de notas individuais por aluno
- 📊 Dashboard com indicadores
- 📄 Documentação interativa via Swagger/OpenAPI 3

---

## 🏗️ Arquitetura

A solução foi desenvolvida com **arquitetura em camadas** no backend, garantindo separação de responsabilidades e facilidade de manutenção:

```
View → Serializer → Service → ORM → Banco de Dados
```

### Frontend
| Tecnologia | Uso |
|---|---|
| React 19 | Framework principal |
| Vite | Build e dev server |
| Tailwind CSS | Estilização |
| Shadcn/Radix UI | Componentes de interface |
| Axios | Requisições HTTP |
| React Router | Navegação |

### Backend
| Tecnologia | Uso |
|---|---|
| Python 3.12 | Linguagem principal |
| Django 6 | Framework web |
| Django REST Framework | API RESTful |
| djangorestframework-simplejwt | Autenticação JWT |
| drf-spectacular | Documentação Swagger/OpenAPI 3 |
| pytest-django | Testes automatizados |

### Banco de Dados
| Ambiente | Banco |
|---|---|
| Desenvolvimento | MySQL 8.0 |
| Produção | PostgreSQL (Supabase) |

### Infraestrutura
| Serviço | Uso |
|---|---|
| Render | Deploy do backend |
| Vercel | Deploy do frontend |
| Supabase | Banco PostgreSQL em produção |
| Docker / Docker Compose | Containerização local |
| GitHub Actions | CI/CD |

---

## 📊 Números do Projeto

- **5 módulos** completos: Auth, Alunos, Grupos, Projetos e Entregas
- **20+ endpoints** em produção
- **40+ testes automatizados** com pytest-django, todos passando ✅
- **Git Flow** com PRs revisados antes de cada merge
- Deploy contínuo integrado ao GitHub

---

## 📁 Estrutura do Repositório

```
MVP-GestaoProjetosADS/
├── backend/
│   ├── apps/
│   │   ├── authentication/   # JWT, login, register
│   │   ├── alunos/           # CRUD + vínculo com grupos + notas
│   │   ├── grupos/           # CRUD + card com alunos e projeto
│   │   ├── projetos/         # CRUD como templates reutilizáveis
│   │   └── entregas/         # CRUD + lançamento de notas integrado
│   ├── config/               # settings.py, urls.py
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── vercel.json
└── README.md
```

---

## 📄 Documentação

A documentação completa do projeto está disponível neste repositório e contém:

- Requisitos Funcionais e Não Funcionais
- Modelagem do Banco de Dados
- Arquitetura e Estrutura do Backend
- Estrutura do Frontend
- Documentação da API (Swagger)
- Diagramas UML e Casos de Uso
- Log de Decisões e Problemas

---

## 👥 Equipe

### Amanda Lisbôa
- Documentação e levantamento de requisitos
- Arquitetura e modelagem
- Desenvolvimento Frontend completo

### Jhonathan Pegoral
- Modelagem do banco de dados
- Desenvolvimento Backend completo (arquitetura em camadas)
- 40+ testes automatizados com pytest-django
- Deploy em produção (Render + Supabase + Vercel)
- Documentação da API via Swagger

### Orientação
**Prof. Rodrigo Braga** — Curso de ADS, UNIFESO

---

## 🌐 Links

| | URL |
|---|---|
| 🌐 Frontend | https://mvp-gestao-projetos-ads.vercel.app/ |
| 📡 API / Swagger | https://mvp-gestaoprojetosads.onrender.com/api/schema/swagger-ui/ |
| 💻 Repositório Backend | https://github.com/Pegoral123/ApiGerenciamentoMVP |

---

## 📝 Licença

Projeto desenvolvido exclusivamente para fins acadêmicos — UNIFESO, 2026.

## Desenvolvedores
- Amanda Lisboa
- Jhonathan Pegoral

---
*Projeto Finalizado*
