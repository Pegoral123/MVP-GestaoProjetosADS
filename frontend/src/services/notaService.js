import api from './api';

/**
 * @param {number} alunoId
 * @param {number} grupoId
 * @param {string|number} nota 
 * @returns {Promise<AlunoGrupo>} 
 */
export async function lancarNota(alunoId, grupoId, nota) {
    const response = await api.patch(`alunos/${alunoId}/lancar-nota/`, {
        grupo: grupoId,
        nota: String(nota),
    });
    return response.data?.data ?? response.data;
}
