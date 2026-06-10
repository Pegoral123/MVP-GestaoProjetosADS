# MVP System - Gerenciamento de Projetos (ADS)

## Sobre o Projeto

O **MVP System** é uma solução Web voltada para o gerenciamento de projetos acadêmicos no curso de Análise e Desenvolvimento de Sistemas (ADS). O principal objetivo do sistema é simplificar o acompanhamento de entregas, organização de equipes e a vinculação de projetos, facilitando a interação entre alunos, professores e orientadores.

Atualmente, o projeto resolve os seguintes pontos fundamentais:
- **Cadastro e controle de alunos**: Cadastro de informações básicas dos estudantes do curso.
- **Organização em grupos**: Agrupamento de estudantes para trabalho em equipe.
- **Vinculação de projetos**: Associação de projetos acadêmicos a grupos específicos de desenvolvimento.
- **Controle de entregas e cronogramas**: Acompanhamento de entregas de documentos, códigos e apresentações de cada grupo.
- **Autenticação JWT**: Controle de login seguro e controle de acesso a endpoints privados do backend.

---

## Tecnologias Utilizadas

### Front-end (Aplicação SPA)
- **React 19**: Biblioteca de desenvolvimento de interfaces baseada em componentes.
- **Vite**: Ferramenta moderna e de alto desempenho para bundling e ambiente de desenvolvimento.
- **Tailwind CSS v4**: Framework CSS utilitário focado em performance para estilização ágil.
- **Bootstrap**: Framework para componentes visuais e layouts clássicos.
- **React Router DOM v7**: Gerenciamento de rotas e navegação SPA.
- **Axios**: Cliente de requisições HTTP para comunicação assíncrona com a API.
- **Lucide React**: Pacote de ícones minimalistas e modernos.
- **Recharts**: Biblioteca responsiva de renderização de gráficos.
- **Radix UI & Shadcn**: Primitivas de interface de alta qualidade e acessibilidade.
- **XLSX**: Exportação de dados em formatos compatíveis com planilhas Excel.

### Back-end (API REST)
- **Python 3.11**: Linguagem base focada em legibilidade e rapidez de desenvolvimento.
- **Django**: Framework web de alto nível com foco em segurança e estrutura robusta.
- **Django REST Framework (DRF)**: Extensão do Django focada em APIs REST com serialização, permissões e paginação.
- **Pytest**: Framework para execução e automatização de testes unitários e de integração.

### Banco de Dados
- **MySQL 8.0**: Banco de dados relacional para persistência segura das informações de alunos, grupos e projetos.

---

## Pré-requisitos

Para preparar o ambiente de desenvolvimento em sua máquina local, você precisará ter instalado:
- Git (para controle de versão)
- Docker (versão 20.10.x ou superior)
- Docker Compose (versão 1.29.x ou superior)
- Node.js (versão 18.x ou superior, para execução local do Front-end)
- Python (versão 3.11.x, para execução local do Back-end)

---

## Como Executar com Docker

A aplicação utiliza o Docker Compose para subir de forma rápida e automatizada o banco de dados MySQL e o servidor da API Backend.

### 1. Configurar as Variáveis de Ambiente
Antes de subir os containers, crie o arquivo `.env` contendo as configurações locais na pasta `backend`:
- Copie o arquivo `.env.example` existente na pasta `backend` criando um novo arquivo com o nome `.env`:
  - No Windows (PowerShell):
    ```powershell
    copy backend/.env.example backend/.env
    ```
  - No Linux/macOS:
    ```bash
    cp backend/.env.example backend/.env
    ```
- Abra o arquivo `backend/.env` e ajuste os valores se julgar necessário. O modelo padrão contém chaves prontas para ambiente de testes.

### 2. Executar os Containers
Você pode iniciar o Docker Compose a partir do diretório raiz ou da pasta `backend`:
- Executar a partir do diretório raiz do projeto:
  ```bash
  docker compose -f backend/Docker-compose.yml up --build
  ```
- Executar a partir da pasta `backend`:
  ```bash
  cd backend
  docker compose up --build
  ```

Esse comando inicializará:
- O banco de dados MySQL (exposto localmente no host na porta `3307` mapeada da porta `3306` do container).
- A aplicação Django do backend (exposta localmente no host na porta `8000`).
- A aplicação aplicará todas as migrações pendentes no banco MySQL de forma automática antes de iniciar o servidor Django.
- A documentação da API estará disponível em http://localhost:8000/api/schema/swagger-ui/#/
- O front estará disponível em http://localhost:5173

### 3. Encerrar os Containers
Para interromper os serviços de modo seguro, utilize `Ctrl + C` no terminal ativo ou execute o comando a partir da pasta raiz:
```bash
docker compose -f backend/Docker-compose.yml down
```

---

## Como Executar Localmente (Desenvolvimento)

Caso prefira executar cada camada individualmente em modo de desenvolvimento (fora dos containers Docker):


### Executando o Front-end Localmente

- Navegue para a pasta do frontend:
  ```bash
  cd frontend
  ```
- Instale as dependências do Node.js:
  ```bash
  npm install
  ```
- Inicie o servidor de desenvolvimento do Vite:
  ```bash
  npm run dev
  ```
- O frontend estará disponível no endereço: `http://localhost:5173` (ou a porta exibida no console). Ele está configurado para consumir a API REST em `http://localhost:8000/api/v1/`.

---

## Objetivo Acadêmico

Este projeto faz parte da monitoria do curso de ADS, com foco em aplicar boas práticas de engenharia de software, modelagem ágil, arquitetura limpa e colaboração organizada em equipe.

## Desenvolvedores
- Amanda Lisboa
- Jhonathan Pegoral

---
*Projeto em desenvolvimento ativo*