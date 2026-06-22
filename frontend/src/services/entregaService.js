import api from './api';

function prepararPayload(data) {
    return {
        grupo: data.grupo,
        data_entrega: data.dataEntrega,
        apresentado: data.apresentado,
        data_apresentacao: data.dataApresentacao || null,
        comentario_geral: data.comentarioGeral || '',
        link_apresentacao: data.linkApresentacao || '',
        notas: data.notas || []
    };
}

function adaptarEntrega(data) {
    return {
        id: data.id,
        grupo: data.grupo,
        grupoNome: data.grupo_nome,
        dataEntrega: data.data_entrega,
        apresentado: data.apresentado,
        dataApresentacao: data.data_apresentacao,
        comentarioGeral: data.comentario_geral,
        linkApresentacao: data.link_apresentacao,
        notas: data.notas || [],
        alunos: data.alunos || [],
        criadoEm: data.criado_em,
        atualizadoEm: data.atualizado_em
    };
}

export async function listarEntregas() {
    const response = await api.get('entregas/');
    const dataObj = response.data?.data ?? response.data;
    const dados = Array.isArray(dataObj) ? dataObj : dataObj?.results || [];
    return dados.map(adaptarEntrega);
}

export async function buscarEntrega(id) {
    const response = await api.get(`entregas/${id}/`);
    const dataObj = response.data?.data ?? response.data;
    return adaptarEntrega(dataObj);
}

export async function buscarEntregaPorGrupo(grupoId) {
    const response = await api.get(`entregas/grupo/${grupoId}/`);
    const dataObj = response.data?.data ?? response.data;
    const dados = Array.isArray(dataObj) ? dataObj : dataObj?.results || [];
    return dados.map(adaptarEntrega);
}

export async function criarEntrega(data) {
    const payload = prepararPayload(data);
    const response = await api.post('entregas/', payload);
    const dataObj = response.data?.data ?? response.data;
    return adaptarEntrega(dataObj);
}

export async function atualizarEntrega(id, data) {
    const payload = prepararPayload(data);
    const response = await api.put(`entregas/${id}/`, payload);
    const dataObj = response.data?.data ?? response.data;
    return adaptarEntrega(dataObj);
}

export async function deletarEntrega(id) {
    await api.delete(`entregas/${id}/`);
}
