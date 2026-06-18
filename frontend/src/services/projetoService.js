import api from './api';

export async function listarProjetos() {
    const response = await api.get('projetos/');
    const dataObj = response.data?.data ?? response.data;
    return Array.isArray(dataObj) ? dataObj : dataObj?.results || [];
}

export async function buscarProjeto(id) {
    const response = await api.get(`projetos/${id}/`);
    return response.data?.data ?? response.data;
}

export async function criarProjeto(data) {
    const response = await api.post('projetos/', data);
    return response.data?.data ?? response.data;
}

export async function atualizarProjeto(id, data) {
    const response = await api.put(`projetos/${id}/`, data);
    return response.data?.data ?? response.data;
}

export async function atualizarProjetoParcial(id, data) {
    const response = await api.patch(`projetos/${id}/`, data);
    return response.data?.data ?? response.data;
}

export async function deletarProjeto(id) {
    await api.delete(`projetos/${id}/`);
}

export async function alternarStatusProjeto(id) {
    const response = await api.patch(`projetos/${id}/status/`);
    return response.data?.data ?? response.data;
}

export async function vincularProjetoAoGrupo(grupoId, projetoId) {
    const response = await api.patch(`grupos/${grupoId}/vincular-projeto/`, {
        projeto_id: projetoId,
    });
    return response.data?.data ?? response.data;
}

export async function desvincularProjetoDoGrupo(grupoId) {
    const response = await api.patch(`grupos/${grupoId}/vincular-projeto/`, {
        projeto_id: null,
    });
    return response.data?.data ?? response.data;
}
