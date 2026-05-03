import { useState, useEffect } from "react"
import { X, Hash, Edit, Trash2, AlertTriangle, Users, Calendar, Layers, FolderGit2, Link2, FolderOpen, ChevronDown, CheckCircle } from "lucide-react"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

function GrupoModal({ grupo, onClose, onDelete }) {
    const navigate = useNavigate()
    const [isConfirming, setIsConfirming] = useState(false)
    const [membrosExpandido, setMembrosExpandido] = useState(false)
    const [alunosData, setAlunosData] = useState([])

    useEffect(() => {
        if (!grupo) {
            setIsConfirming(false)
            setMembrosExpandido(false)
        } else {
            const storedAlunos = localStorage.getItem("alunos_mock")
            if (storedAlunos && grupo.alunos?.length > 0) {
                const todosAlunos = JSON.parse(storedAlunos)
                const membros = todosAlunos.filter(a => grupo.alunos.includes(a.id))
                setAlunosData(membros)
            } else {
                setAlunosData([])
            }
        }
    }, [grupo])

    if (!grupo) return null

    const temProjeto = !!grupo.projeto

    if (isConfirming) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setIsConfirming(false)}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4 text-center animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mx-auto bg-red-50 p-4 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Excluir Grupo?</h2>
                    <p className="text-gray-500 text-sm">
                        Tem certeza que deseja excluir o grupo <strong>{grupo.nome}</strong>? Esta ação não poderá ser desfeita.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => setIsConfirming(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
                            onClick={() => {
                                setIsConfirming(false)
                                if (onDelete) onDelete(grupo.id)
                            }}
                        >
                            Sim, excluir
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Card do modal */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className="bg-[#006b64] px-6 pt-6 pb-10 relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-full w-14 h-14 flex items-center justify-center">
                            <Users size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">{grupo.nome}</h2>
                            <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                                <Hash size={11} />
                                <span>{grupo.codigo}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors cursor-pointer"
                        type="button"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="-mt-6 bg-white rounded-t-2xl px-6 pt-6 pb-6 flex flex-col gap-4">
                    {/* Dados do Grupo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="bg-[#006b64]/10 p-2 rounded-lg">
                                <Layers size={16} className="text-[#006b64]" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">MVP</p>
                                <p className="text-sm text-gray-700 font-semibold">{grupo.mvp}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Calendar size={16} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Período</p>
                                <p className="text-sm text-gray-700 font-semibold">{grupo.periodo}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="bg-purple-50 p-2 rounded-lg">
                                <Calendar size={16} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Ano</p>
                                <p className="text-sm text-gray-700 font-semibold">{grupo.ano}</p>
                            </div>
                        </div>

                        {temProjeto && (
                            <div className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 ${grupo.status === 'Concluído' ? 'bg-green-50/50' : 'bg-blue-50/50'}`}>
                                <div className={grupo.status === 'Concluído' ? 'bg-green-100 p-2 rounded-lg' : 'bg-blue-100 p-2 rounded-lg'}>
                                    <CheckCircle size={16} className={grupo.status === 'Concluído' ? 'text-green-600' : 'text-blue-600'} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Status</p>
                                    <p className={`text-sm font-bold ${grupo.status === 'Concluído' ? 'text-green-700' : 'text-blue-700'}`}>
                                        {grupo.status || "Em andamento"}
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setMembrosExpandido(!membrosExpandido)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-green-50/50 hover:border-green-200 transition-colors cursor-pointer text-left w-full"
                        >
                            <div className="bg-green-50 p-2 rounded-lg">
                                <Users size={16} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 font-medium">Alunos</p>
                                <p className="text-sm text-gray-700 font-semibold">{grupo.alunos?.length || 0} membros</p>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${membrosExpandido ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Lista de membros expandível */}
                    {membrosExpandido && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            {alunosData.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4 italic">Nenhum aluno vinculado a este grupo.</p>
                            ) : (
                                <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                                    {alunosData.map((aluno) => (
                                        <div key={aluno.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                            <div className="bg-[#006b64]/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0">
                                                <span className="text-[#006b64] font-bold text-xs">
                                                    {aluno.nome?.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{aluno.nome}</p>
                                                <p className="text-xs text-gray-400">{aluno.matricula}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Seção de Projeto em Condicional */}
                    {temProjeto ? (
                        <div className="flex flex-col gap-3 mt-1">
                            {/* Projeto vinculado */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-[#006b64]/20 bg-[#006b64]/5">
                                <div className="bg-[#006b64]/10 p-2 rounded-lg">
                                    <FolderOpen size={18} className="text-[#006b64]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Projeto Vinculado</p>
                                    <p className="text-sm text-[#006b64] font-semibold">{grupo.projeto}</p>
                                </div>
                            </div>

                            {/* Link GitHub */}
                            {grupo.githubUrl && (
                                <a
                                    href={grupo.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="bg-gray-900/10 p-2 rounded-lg group-hover:bg-gray-900/20 transition-colors">
                                        <FolderGit2 size={18} className="text-gray-800" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-400 font-medium">Repositório GitHub</p>
                                        <p className="text-sm text-gray-700 group-hover:text-[#006b64] transition-colors truncate">
                                            {grupo.githubUrl}
                                        </p>
                                    </div>
                                    <Link2 size={14} className="text-gray-400 group-hover:text-[#006b64] transition-colors shrink-0" />
                                </a>
                            )}
                        </div>
                    ) : (
                        <div className="mt-1">
                            {/* Aviso: sem projeto */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col items-center gap-3 text-center">
                                <div className="bg-amber-100 p-3 rounded-full">
                                    <AlertTriangle size={22} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-amber-800 font-semibold text-sm">Este grupo ainda não tem projeto vinculado</p>
                                    <p className="text-amber-600 text-xs mt-0.5">Vincule um projeto para acompanhar o progresso do grupo.</p>
                                </div>
                                <Button
                                    className="bg-amber-600 hover:bg-amber-700 text-white border-transparent text-sm px-5 mt-1"
                                    onClick={() => {
                                        onClose()
                                        navigate(`/grupos/${grupo.id}/vincular-projeto`)
                                    }}
                                >
                                    <FolderOpen size={16} className="mr-2" />
                                    Vincular Projeto
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-3 mt-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            onClick={() => {
                                setIsConfirming(true)
                            }}
                        >
                            <Trash2 size={16} className="mr-2" />
                            Excluir
                        </Button>
                        <Button
                            className="flex-1 bg-[#006b64] hover:bg-[#005a54] text-white border-transparent"
                            onClick={() => {
                                onClose()
                                navigate(`/grupos/editar/${grupo.id}`)
                            }}
                        >
                            <Edit size={16} className="mr-2" />
                            Editar
                        </Button>
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={onClose}
                        type="button"
                        className="mt-1 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default GrupoModal
