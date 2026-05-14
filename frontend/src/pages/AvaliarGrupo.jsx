import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    ArrowLeft,
    Save,
    CheckCircle,
    Calendar,
    Hash,
    Layers,
    FolderOpen,
    FolderGit2,
    AlertCircle,
    Users,
    ClipboardCheck,
    Star,
    FileText,
    Clock
} from "lucide-react"
import { Button } from "../components/ui/button"
import api from "../services/api"

// Helper: normaliza aluno ID (pode ser número ou objeto {id: ...})
const getAlunoId = (aluno) => typeof aluno === 'object' && aluno !== null ? aluno.id : aluno

function AvaliarGrupo() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [grupo, setGrupo] = useState(null)
    const [alunos, setAlunos] = useState([])
    const [loading, setLoading] = useState(true)

    // Form state
    const [dataApresentacao, setDataApresentacao] = useState("")
    const [comentarioGeral, setComentarioGeral] = useState("")
    const [notas, setNotas] = useState({})

    // Feedback
    const [salvoMsg, setSalvoMsg] = useState(false)
    const [erro, setErro] = useState("")

    useEffect(() => {
        // Buscar alunos
        const fetchAlunos = async () => {
            try {
                const res = await api.get('/api/v1/alunos/')
                let data = []
                if (Array.isArray(res.data)) data = res.data
                else if (res.data?.results) data = res.data.results
                else if (res.data?.data) data = res.data.data
                else if (res.data?.alunos) data = res.data.alunos
                setAlunos(data)
            } catch (error) {
                console.error("Erro ao buscar alunos", error)
            }
        }
        fetchAlunos()

        // Buscar grupo por ID
        const storedGrupos = localStorage.getItem("grupos_mock")
        if (storedGrupos) {
            const gruposArr = JSON.parse(storedGrupos)
            const found = gruposArr.find(g => g.id === parseInt(id))
            if (found) {
                setGrupo(found)
                setDataApresentacao(found.dataApresentacao || "")
                setComentarioGeral(found.comentarioGeral || "")
                setNotas(found.notas || {})
            }
        }
        setLoading(false)
    }, [id])

    const handleNotaChange = (alunoId, valor) => {
        let nota = parseFloat(valor)
        if (valor === "") nota = ""
        else if (nota < 0) nota = 0
        else if (nota > 6) nota = 6

        setNotas(prev => ({
            ...prev,
            [alunoId]: nota
        }))
    }

    const handleSalvar = () => {
        setErro("")

        const storedGrupos = localStorage.getItem("grupos_mock")
        let gruposMock = storedGrupos ? JSON.parse(storedGrupos) : []

        const index = gruposMock.findIndex(g => g.id === parseInt(id))
        if (index !== -1) {
            // novo status com base em todas as notas estarem preenchidas
            const todosOsAlunos = gruposMock[index].alunos || []
            const todasNotasPreenchidas = todosOsAlunos.length > 0 && todosOsAlunos.every(entry => {
                const alunoId = getAlunoId(entry)
                const nota = notas[alunoId]
                return nota !== undefined && nota !== "" && nota !== null
            })
            const novoStatus = todasNotasPreenchidas ? "Concluído" : "Em andamento"

            gruposMock[index] = {
                ...gruposMock[index],
                dataApresentacao,
                comentarioGeral,
                notas,
                status: novoStatus
            }
            localStorage.setItem("grupos_mock", JSON.stringify(gruposMock))

            setSalvoMsg(true)
            setTimeout(() => {
                navigate("/entregas")
            }, 1200)
        } else {
            setErro("Grupo não encontrado. Tente novamente.")
        }
    }

    const alunosDoGrupo = grupo?.alunos?.map(entry => {
        const alunoId = getAlunoId(entry)
        const alunoFull = alunos.find(a => a.id === alunoId)
        return alunoFull || { id: alunoId, nome: `Aluno ID ${alunoId}`, matricula: "N/A" }
    }) || []

    // Status direto do grupo
    const isConcluido = grupo?.status === "Concluído"

    const getMvpColor = (mvp) => {
        switch (mvp) {
            case "Frontend": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" }
            case "Backend": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" }
            case "Mobile": return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" }
            default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500" }
        }
    }

    if (loading) {
        return (
            <section className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Carregando...</div>
            </section>
        )
    }

    if (!grupo) {
        return (
            <section className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <AlertCircle size={48} className="text-amber-500 opacity-60" />
                <p className="text-gray-500 text-base font-medium">Grupo não encontrado.</p>
                <Button
                    onClick={() => navigate("/entregas")}
                    className="bg-[#006b64] hover:bg-[#00524d] text-white"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Voltar para Entregas
                </Button>
            </section>
        )
    }

    const mvpColor = getMvpColor(grupo.mvp)

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate("/entregas")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006b64] transition-colors mb-4 cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Voltar para Entregas
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardCheck size={28} className="text-[#006b64]" />
                            Avaliação do Grupo
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Preencha as notas e informações da apresentação do grupo.
                        </p>
                    </div>

                    {/* Status badge */}
                    {isConcluido ? (
                        <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl font-bold text-sm">
                            <CheckCircle size={18} />
                            Concluído
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl font-bold text-sm">
                            <Clock size={18} />
                            Em andamento
                        </div>
                    )}
                </div>
            </div>

            <main className="flex-1 w-full space-y-6">
                {/* Card: Informações do Grupo */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#006b64] to-[#008f85] px-6 py-4">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <Users size={20} />
                            {grupo.nome}
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                                <Hash size={14} />
                                {grupo.codigo}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 ${mvpColor.bg} ${mvpColor.text} border ${mvpColor.border} px-3 py-1.5 rounded-lg font-medium`}>
                                <span className={`w-2 h-2 rounded-full ${mvpColor.dot}`}></span>
                                {grupo.mvp}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium">
                                <Calendar size={14} />
                                {grupo.ano} — {grupo.periodo}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium">
                                <Users size={14} />
                                {alunosDoGrupo.length} {alunosDoGrupo.length === 1 ? "aluno" : "alunos"}
                            </span>
                        </div>

                        {/* Projeto e GitHub */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                            {grupo.projeto ? (
                                <div className="flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 px-3 py-2 rounded-lg text-sm font-medium">
                                    <FolderOpen size={16} />
                                    <span>Projeto: <strong>{grupo.projeto}</strong></span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg text-sm font-medium">
                                    <AlertCircle size={16} />
                                    Nenhum projeto vinculado
                                </div>
                            )}

                            {grupo.githubUrl && (
                                <a
                                    href={grupo.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                                >
                                    <FolderGit2 size={16} />
                                    Repositório GitHub
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid: Data + Observações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Data de Apresentação */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <Calendar size={16} className="text-[#006b64]" />
                            Data de Apresentação
                        </label>
                        <input
                            type="date"
                            value={dataApresentacao}
                            onChange={(e) => setDataApresentacao(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] text-sm transition-all"
                        />
                    </div>

                    {/* Observações Gerais */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                            <FileText size={16} className="text-[#006b64]" />
                            Observações Gerais
                        </label>
                        <textarea
                            value={comentarioGeral}
                            onChange={(e) => setComentarioGeral(e.target.value)}
                            placeholder="Observações sobre a apresentação do grupo..."
                            rows="3"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] resize-none text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Avaliação Individual */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                            <Star size={16} className="text-[#E05B14]" />
                            Avaliação Individual — Nota de 0 a 6
                        </h3>
                        <span className="text-xs text-gray-500 font-medium">
                            {Object.values(notas).filter(n => n !== "" && n !== undefined && n !== null).length} / {alunosDoGrupo.length} notas preenchidas
                        </span>
                    </div>

                    <div className="p-6">
                        {alunosDoGrupo.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Users size={40} className="mb-3 opacity-40" />
                                <p className="text-sm font-medium">Nenhum aluno vinculado a este grupo.</p>
                                <p className="text-xs mt-1">Vincule alunos ao grupo para poder avaliá-los.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alunosDoGrupo.map((aluno, index) => {
                                    const notaPreenchida = notas[aluno.id] !== undefined && notas[aluno.id] !== "" && notas[aluno.id] !== null
                                    return (
                                        <div
                                            key={aluno.id}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${notaPreenchida
                                                ? "bg-green-50/50 border-green-200"
                                                : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-lg bg-[#006b64]/10 flex items-center justify-center text-[#006b64] font-bold text-sm shrink-0">
                                                    {aluno.nome?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">{aluno.nome}</span>
                                                    <span className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">
                                                        {aluno.matricula}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {notaPreenchida && (
                                                    <CheckCircle size={16} className="text-green-500" />
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Nota:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="6"
                                                        step="0.1"
                                                        value={notas[aluno.id] !== undefined ? notas[aluno.id] : ""}
                                                        onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                                                        placeholder="—"
                                                        className={`w-20 px-3 py-2 text-center rounded-lg border outline-none font-bold text-sm transition-all ${notaPreenchida
                                                            ? "border-green-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                                            : "border-gray-300 bg-white focus:border-[#006b64] focus:ring-2 focus:ring-[#006b64]/20"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Barra de ações */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4">
                    <div className="flex items-center gap-3">
                        {salvoMsg && (
                            <span className="text-sm font-bold text-green-600 flex items-center gap-1.5 animate-in fade-in duration-300">
                                <CheckCircle size={16} />
                                Avaliação salva com sucesso!
                            </span>
                        )}
                        {erro && (
                            <span className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                                <AlertCircle size={16} />
                                {erro}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate("/entregas")}
                            variant="outline"
                            className="px-5 py-2 text-sm"
                        >
                            <ArrowLeft size={16} className="mr-1.5" />
                            Voltar
                        </Button>
                        <Button
                            onClick={handleSalvar}
                            className="bg-[#006b64] hover:bg-[#00524d] text-white px-6 py-2 shadow-sm text-sm font-semibold transition-transform hover:scale-105"
                        >
                            <Save size={16} className="mr-1.5" />
                            Salvar Avaliação
                        </Button>
                    </div>
                </div>
            </main>
        </section>
    )
}

export default AvaliarGrupo
