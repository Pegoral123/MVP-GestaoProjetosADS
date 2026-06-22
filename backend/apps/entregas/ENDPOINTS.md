# 📦 API de Entregas - Documentação Completa

> **Status da API**: ✅ Ativa  
> **Versão**: v1  
> **Base URL**: `/api/v1/entregas/`

---

## 🔐 Autenticação

Todos os endpoints requerem autenticação JWT:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" https://api.example.com/api/v1/entregas/
```

**Header Obrigatório:**
```
Authorization: Bearer <access_token>
```

---

## 📋 Endpoints

### 1️⃣ Listar Todas as Entregas

**Endpoint:**
```http
GET /api/v1/entregas/
```

**Descrição:**  
Retorna uma lista completa de todas as entregas cadastradas no sistema.

**Resposta de Sucesso (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "grupo": 2,
      "grupo_nome": "React Ninjas",
      "data_entrega": "2024-03-15",
      "apresentado": false,
      "data_apresentacao": null,
      "comentario_geral": null,
      "link_apresentacao": null,
      "alunos": [
        {
          "id": 1,
          "nome": "João Silva",
          "nota": 8.5
        },
        {
          "id": 2,
          "nome": "Maria Costa",
          "nota": 9.0
        }
      ],
      "criado_em": "2024-03-10T10:30:00Z",
      "atualizado_em": "2024-03-10T10:30:00Z"
    }
  ],
  "message": "Entregas listadas com sucesso.",
  "statusCode": 200
}
```

**Códigos de Resposta:**
- `200 OK` - Sucesso
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão

---

### 2️⃣ Criar Nova Entrega

**Endpoint:**
```http
POST /api/v1/entregas/
```

**Descrição:**  
Cria uma nova entrega e opcionalmente lança notas de múltiplos alunos simultaneamente.

**Request (Body - JSON):**
```json
{
  "grupo": 2,
  "data_entrega": "2024-05-10",
  "apresentado": false,
  "data_apresentacao": null,
  "comentario_geral": "Primeira entrega",
  "link_apresentacao": null,
  "notas": [
    {
      "aluno": 1,
      "nota": 8.5
    },
    {
      "aluno": 2,
      "nota": 9.0
    }
  ]
}
```

**Campos Obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `grupo` | integer | ID do grupo que realiza a entrega |
| `data_entrega` | date | Data da entrega (YYYY-MM-DD) |

**Campos Opcionais:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `apresentado` | boolean | Se já foi apresentado (padrão: false) |
| `data_apresentacao` | date | Data da apresentação (obrigatória se apresentado=true) |
| `comentario_geral` | text | Comentário geral do professor |
| `link_apresentacao` | url | Link do vídeo ou slides |
| `notas` | array | Array de notas dos alunos |

**Resposta de Sucesso (201 Created):**
```json
{
  "data": {
    "id": 3,
    "grupo": 2,
    "grupo_nome": "React Ninjas",
    "data_entrega": "2024-05-10",
    "apresentado": false,
    "alunos": [
      {"id": 1, "nome": "João Silva", "nota": 8.5},
      {"id": 2, "nome": "Maria Costa", "nota": 9.0}
    ]
  },
  "message": "Entrega criada com sucesso.",
  "statusCode": 201
}
```

**Erros Possíveis:**
- `400 Bad Request` - Dados inválidos ou incompletos
- `400 Bad Request` - Nota fora do intervalo (0-10)
- `400 Bad Request` - Aluno não vinculado ao grupo

---

### 3️⃣ Obter Detalhes de uma Entrega

**Endpoint:**
```http
GET /api/v1/entregas/{id}/
```

**Parâmetros de URL:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | integer | ID da entrega |

**Exemplo:**
```http
GET /api/v1/entregas/1/
```

**Resposta de Sucesso (200 OK):**
```json
{
  "data": {
    "id": 1,
    "grupo": 2,
    "grupo_nome": "React Ninjas",
    "data_entrega": "2024-03-15",
    "apresentado": false,
    "data_apresentacao": null,
    "comentario_geral": null,
    "link_apresentacao": null,
    "alunos": [
      {"id": 1, "nome": "João Silva", "nota": 8.5},
      {"id": 2, "nome": "Maria Costa", "nota": 9.0},
      {"id": 3, "nome": "Pedro Lima", "nota": 7.5}
    ],
    "criado_em": "2024-03-10T10:30:00Z",
    "atualizado_em": "2024-03-10T10:30:00Z"
  },
  "message": "Entrega encontrada.",
  "statusCode": 200
}
```

**Erros Possíveis:**
- `400 Bad Request` - Entrega não encontrada
- `404 Not Found` - Recurso não existe

---

### 4️⃣ Atualizar Entrega (Completo - PUT)

**Endpoint:**
```http
PUT /api/v1/entregas/{id}/
```

**Descrição:**  
Atualiza TODOS os campos da entrega. Campos não enviados serão considerados vazios.

**Request (Body - JSON):**
```json
{
  "data_entrega": "2024-06-01",
  "apresentado": true,
  "data_apresentacao": "2024-06-03",
  "comentario_geral": "Ótima apresentação!",
  "link_apresentacao": "https://youtube.com/watch?v=xyz",
  "notas": [
    {"aluno": 1, "nota": 9.0},
    {"aluno": 2, "nota": 8.5}
  ]
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "data": {...entrega_atualizada...},
  "message": "Entrega atualizada com sucesso.",
  "statusCode": 200
}
```

**Erros Possíveis:**
- `400 Bad Request` - Dados inválidos
- `400 Bad Request` - apresentado=true sem data_apresentacao

---

### 5️⃣ Atualizar Entrega (Parcial - PATCH)

**Endpoint:**
```http
PATCH /api/v1/entregas/{id}/
```

**Descrição:**  
Atualiza APENAS os campos enviados. Campos não enviados mantêm seus valores anteriores.

**Request (Body - JSON):**
```json
{
  "comentario_geral": "Excelente trabalho!",
  "link_apresentacao": "https://youtube.com/watch?v=abc"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "data": {...entrega_atualizada...},
  "message": "Entrega atualizada com sucesso.",
  "statusCode": 200
}
```

**Diferença entre PUT e PATCH:**
```
PUT  - Substituição completa (use quando tiver todos os dados)
PATCH - Atualização parcial (use para alterar alguns campos)
```

---

### 6️⃣ Deletar Entrega

**Endpoint:**
```http
DELETE /api/v1/entregas/{id}/
```

**Descrição:**  
Remove uma entrega do sistema. **Ação é irreversível!**

**Resposta de Sucesso (200 OK):**
```json
{
  "message": "Entrega deletada com sucesso.",
  "statusCode": 200
}
```

**⚠️ Aviso:**
Esta operação é irreversível. Todos os dados serão permanentemente removidos.

**Erros Possíveis:**
- `400 Bad Request` - Entrega não encontrada

---

### 7️⃣ Marcar Entrega como Apresentada

**Endpoint:**
```http
PATCH /api/v1/entregas/{id}/apresentar/
```

**Descrição:**  
Marca uma entrega como apresentada e registra a data da apresentação.

**Request (Body - JSON):**
```json
{
  "data_apresentacao": "2024-05-25",
  "comentario_geral": "Excelente apresentação com bom domínio do assunto!"
}
```

**Campos Obrigatórios:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `data_apresentacao` | date | Data da apresentação (YYYY-MM-DD) |

**Campos Opcionais:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `comentario_geral` | text | Feedback do professor |

**Resposta de Sucesso (200 OK):**
```json
{
  "data": {
    "id": 1,
    "grupo": 2,
    "apresentado": true,
    "data_apresentacao": "2024-05-25",
    "comentario_geral": "Excelente apresentação com bom domínio do assunto!"
  },
  "message": "Entrega marcada como apresentada com sucesso.",
  "statusCode": 200
}
```

**Efeitos:**
- ✅ `apresentado` muda para `true`
- ✅ `data_apresentacao` é registrada
- ✅ `comentario_geral` é adicionado/atualizado

**Erros Possíveis:**
- `400 Bad Request` - data_apresentacao não informada
- `400 Bad Request` - Entrega não encontrada

---

### 8️⃣ Listar Entregas de um Grupo

**Endpoint:**
```http
GET /api/v1/entregas/grupo/{grupo_id}/
```

**Descrição:**  
Retorna todas as entregas de um grupo específico.

**Parâmetros de URL:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `grupo_id` | integer | ID do grupo |

**Exemplo:**
```http
GET /api/v1/entregas/grupo/2/
```

**Resposta de Sucesso (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "grupo": 2,
      "data_entrega": "2024-03-15",
      "apresentado": false,
      "alunos": [...]
    },
    {
      "id": 2,
      "grupo": 2,
      "data_entrega": "2024-04-20",
      "apresentado": true,
      "alunos": [...]
    }
  ],
  "message": "Entregas do grupo listadas com sucesso.",
  "statusCode": 200
}
```

**Uso:**
- Visualizar histórico de um grupo
- Acompanhar progresso ao longo do semestre
- Comparar notas entre entregas

---

## 📊 Estrutura de Dados

### Modelo Entrega
```json
{
  "id": 1,
  "grupo": 2,
  "grupo_nome": "React Ninjas",
  "data_entrega": "2024-03-15",
  "apresentado": false,
  "data_apresentacao": null,
  "comentario_geral": null,
  "link_apresentacao": null,
  "alunos": [
    {
      "id": 1,
      "nome": "João Silva",
      "nota": 8.5
    }
  ],
  "criado_em": "2024-03-10T10:30:00Z",
  "atualizado_em": "2024-03-10T10:30:00Z"
}
```

### Modelo Nota de Aluno
```json
{
  "aluno": 1,
  "nota": 8.5
}
```

**Validações de Nota:**
- Tipo: `decimal` com até 2 casas decimais
- Intervalo: `0.0 até 10.0`
- Exemplo válido: `7.5`, `8.00`, `9`
- Exemplo inválido: `15.0`, `-1.0`

---

## 🔄 Status HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| `200` | OK | Requisição bem-sucedida |
| `201` | Created | Recurso criado com sucesso |
| `400` | Bad Request | Dados inválidos ou incompletos |
| `401` | Unauthorized | Não autenticado |
| `403` | Forbidden | Sem permissão |
| `404` | Not Found | Recurso não encontrado |
| `500` | Server Error | Erro interno do servidor |

---

## 🔗 Exemplos com cURL

### Listar entregas
```bash
curl -X GET "http://localhost:8000/api/v1/entregas/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Criar entrega
```bash
curl -X POST "http://localhost:8000/api/v1/entregas/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grupo": 2,
    "data_entrega": "2024-05-10",
    "apresentado": false,
    "notas": [
      {"aluno": 1, "nota": 8.5}
    ]
  }'
```

### Obter detalhes
```bash
curl -X GET "http://localhost:8000/api/v1/entregas/1/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Atualizar (PATCH)
```bash
curl -X PATCH "http://localhost:8000/api/v1/entregas/1/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comentario_geral": "Bom trabalho!"
  }'
```

### Marcar apresentada
```bash
curl -X PATCH "http://localhost:8000/api/v1/entregas/1/apresentar/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data_apresentacao": "2024-05-25",
    "comentario_geral": "Excelente!"
  }'
```

### Deletar
```bash
curl -X DELETE "http://localhost:8000/api/v1/entregas/1/" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚡ Tratamento de Erros

### Erro de Validação
```json
{
  "message": "Dados inválidos. Verifique os campos obrigatórios.",
  "statusCode": 400,
  "errors": {
    "grupo": ["This field is required."],
    "data_entrega": ["This field is required."]
  }
}
```

### Erro de Autenticação
```json
{
  "detail": "Invalid token.",
  "code": "invalid_token"
}
```

### Erro de Permissão
```json
{
  "detail": "Authentication credentials were not provided.",
  "code": "not_authenticated"
}
```

---

## 🎯 Casos de Uso

### Cenário 1: Registrar Entrega com Notas
```bash
1. POST /api/v1/entregas/
   - Criar entrega do grupo
   - Lançar notas dos alunos simultaneamente
   
2. PATCH /api/v1/entregas/{id}/apresentar/
   - Marcar apresentação quando ocorrer
```

### Cenário 2: Atualizar Notas
```bash
1. PATCH /api/v1/entregas/{id}/
   - Atualizar notas de alguns alunos
   - Manter outros campos inalterados
```

### Cenário 3: Visualizar Histórico de Grupo
```bash
1. GET /api/v1/entregas/grupo/{id}/
   - Ver todas as entregas do grupo
   - Comparar notas entre entregas
   - Acompanhar progresso
```

---

## 📝 Notas Importantes

- ✅ Todas as datas usam formato ISO 8601: `YYYY-MM-DD`
- ✅ Timestamps incluem zona horária: `YYYY-MM-DDTHH:MM:SSZ`
- ✅ Notas com até 2 casas decimais
- ✅ Tokens JWT expiram em 24 horas
- ✅ Use PATCH para atualizações parciais (melhor desempenho)
- ⚠️ DELETE é irreversível
- ⚠️ Notas de alunos devem estar vinculados ao grupo

---

## 🆘 Suporte

Dúvidas ou problemas? Consulte:
- Documentation: `/docs/` (Swagger UI)
- ReDoc: `/redoc/` (ReDoc UI)
- Email: support@example.com

---

**Última atualização:** 2024-06-18  
**Versão da API:** v1  
**Status:** ✅ Produção
