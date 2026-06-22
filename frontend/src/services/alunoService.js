import api from './api';

export async function listarAlunos() {
    const response = await api.get('/alunos/');
    let data = [];
    if (Array.isArray(response.data)) {
        data = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
        data = response.data.results;
    } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
    } else if (response.data && Array.isArray(response.data.alunos)) {
        data = response.data.alunos;
    }
    return data;
}

export async function buscarAluno(id) {
    const response = await api.get(`/alunos/${id}/`);
    return response.data;
}

export async function criarAluno(data) {
    const response = await api.post('/alunos/', data);
    return response.data;
}

export async function atualizarAluno(id, data) {
    const response = await api.put(`/alunos/${id}/`, data);
    return response.data;
}

export async function deletarAluno(id) {
    await api.delete(`/alunos/${id}/`);
}

export async function vincularGrupo(alunoId, grupoId) {
    const response = await api.post(`/alunos/${alunoId}/vincular-grupo/`, { grupo: grupoId });
    return response.data;
}

export async function desvincularGrupo(alunoId, grupoId) {
    const response = await api.post(`/alunos/${alunoId}/desvincular-grupo/`, { grupo: grupoId });
    return response.data;
}

export async function lancarNota(alunoId, grupoId, nota) {
    const response = await api.patch(`/alunos/${alunoId}/lancar-nota/`, { grupo: grupoId, nota: String(nota) });
    return response.data;
}
