import api from './api';

// converte snake_case para camelCase
function adaptarGrupo(grupo) {
    return {
        ...grupo,
        githubUrl: grupo.github_url,
        totalAlunos: grupo.total_alunos,
        criadoEm: grupo.criado_em,
        atualizadoEm: grupo.atualizado_em,
        ano: grupo.data ? new Date(grupo.data).getFullYear().toString() : '',
    };
}

// converte camelCase para snake_case
function prepararPayload(data) {
    const payload = {
        nome: data.nome,
        data: data.data,
        periodo: data.periodo,
        mvp: data.mvp,
        github_url: data.githubUrl || data.github_url || null,
        status: data.status || 'Em andamento',
    };
    if (data.codigo && data.codigo.trim() !== '') {
        payload.codigo = data.codigo;
    }
    return payload;
}

export async function listarGrupos() {
    const response = await api.get('grupos/');
    const dataObj = response.data?.data ?? response.data;
    const dados = Array.isArray(dataObj) ? dataObj : dataObj?.results || [];
    return dados.map(adaptarGrupo);
}

export async function buscarGrupo(id) {
    const response = await api.get(`grupos/${id}/`);
    const dataObj = response.data?.data ?? response.data;
    return adaptarGrupo(dataObj);
}

export async function criarGrupo(data) {
    const payload = prepararPayload(data);
    const response = await api.post('grupos/', payload);
    const dataObj = response.data?.data ?? response.data;
    return adaptarGrupo(dataObj);
}

export async function atualizarGrupo(id, data) {
    const payload = prepararPayload(data);
    const response = await api.put(`grupos/${id}/`, payload);
    const dataObj = response.data?.data ?? response.data;
    return adaptarGrupo(dataObj);
}

export async function deletarGrupo(id) {
    await api.delete(`grupos/${id}/`);
}

export async function listarAlunosDoGrupo(id) {
    const response = await api.get(`grupos/${id}/alunos/`);
    const dataObj = response.data?.data ?? response.data;
    return Array.isArray(dataObj) ? dataObj : dataObj?.results || [];
}

export async function vincularAlunoAoGrupo(alunoId, grupoId) {
    const response = await api.post(`alunos/${alunoId}/vincular-grupo/`, {
        grupo: grupoId
    });
    return response.data;
}

export async function desvincularAlunoDoGrupo(alunoId, grupoId) {
    const response = await api.post(`alunos/${alunoId}/desvincular-grupo/`, {
        grupo: grupoId
    });
    return response.data;
}

