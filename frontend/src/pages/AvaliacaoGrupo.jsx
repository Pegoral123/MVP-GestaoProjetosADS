import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
    ArrowLeft,
    Save,
    Calendar,
    Hash,
    Layers,
    FolderOpen,
    FolderGit2,
    AlertCircle,
    ClipboardCheck,
    CheckCircle,
    Users,
    MessageSquare,
    Star,
    X
} from "lucide-react"
import { Button } from "../components/ui/button"
import api from "../services/api"

const getAlunoId = (aluno) => typeof aluno === 'object' && aluno !== null ? aluno.id : aluno

function AvaliacaoGrupo() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [grupo, setGrupo] = useState(null)
    const [alunos, setAlunos] = useState([])

    const [dataApresentacao, setDataApresentacao] = useState("")
    const [comentarioGeral, setComentarioGeral] = useState("")
    const [notas, setNotas] = useState({})
    const [notaErrors, setNotaErrors] = useState({})

    const [successMsg, setSuccessMsg] = useState("")

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

        // Carregar grupo do localStorage
        const storedGrupos = localStorage.getItem("grupos_mock")
        if (storedGrupos) {
            const gruposMock = JSON.parse(storedGrupos)
            const g = gruposMock.find(x => x.id.toString() === id)
            if (g) {
                setGrupo(g)
                setDataApresentacao(g.dataApresentacao || "")
                setComentarioGeral(g.comentarioGeral || "")
                setNotas(g.notas || {})
            }
        }
    }, [id])

    const handleNotaChange = (alunoId, valor) => {
        let parsed = valor === "" ? "" : parseFloat(valor)
        if (parsed !== "" && (parsed < 0 || parsed > 6)) {
            setNotaErrors(prev => ({ ...prev, [alunoId]: "Nota deve ser entre 0 e 6." }))
        } else {
            setNotaErrors(prev => {
                const next = { ...prev }
                delete next[alunoId]
                return next
            })
        }
        if (parsed !== "" && parsed > 6) parsed = 6
        if (parsed !== "" && parsed < 0) parsed = 0

        setNotas(prev => ({ ...prev, [alunoId]: parsed }))
    }

    const handleSalvar = () => {
        // Validar notas
        const erros = {}
        alunosDoGrupo.forEach(aluno => {
            const nota = notas[aluno.id]
            if (nota !== undefined && nota !== "" && (nota < 0 || nota > 6)) {
                erros[aluno.id] = "Nota deve ser entre 0 e 6."
            }
        })
        if (Object.keys(erros).length > 0) {
            setNotaErrors(erros)
            return
        }

        const storedGrupos = localStorage.getItem("grupos_mock")
        let gruposMock = storedGrupos ? JSON.parse(storedGrupos) : []
        const index = gruposMock.findIndex(g => g.id.toString() === id)

        if (index !== -1) {
            // Determina o novo status
            const todosOsAlunos = gruposMock[index].alunos || []
            const todasNotasPreenchidas = todosOsAlunos.length > 0 && todosOsAlunos.every(entry => {
                const alunoId = getAlunoId(entry)
                const nota = notas[alunoId] !== undefined ? notas[alunoId] : notas[String(alunoId)]
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
        }

        setSuccessMsg(`Avaliação do grupo "${grupo?.nome}" salva com sucesso!`)

        // Voltar para a lista preservando os filtros via sessionStorage
        setTimeout(() => {
            navigate("/entregas")
        }, 1200)
    }

    const handleVoltar = () => {
        navigate("/entregas")
    }

    const getMvpColor = (mvp) => {
        switch (mvp) {
            case "Frontend": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" }
            case "Backend": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" }
            case "Mobile": return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" }
            default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500" }
        }
    }

    const alunosDoGrupo = (grupo?.alunos || []).map(entry => {
        const alunoId = getAlunoId(entry)
        const alunoFull = alunos.find(a => a.id === alunoId)
        return alunoFull || { id: alunoId, nome: `Aluno ID ${alunoId}`, matricula: "N/A" }
    })

    if (!grupo) {
        return (
            <section className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Grupo não encontrado.</p>
            </section>
        )
    }

    const mvpColor = getMvpColor(grupo.mvp)

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleVoltar}
                    className="text-gray-500 hover:text-[#006b64] hover:bg-[#006b64]/10 mb-4 px-2"
                    type="button"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Voltar para Entregas & Avaliações
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardCheck size={28} className="text-[#006b64]" />
                            Avaliação do Grupo
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Preencha a data de apresentação, comentário geral e as notas individuais.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full space-y-6">
                {/* Feedback de sucesso */}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1 rounded-full">
                                <CheckCircle size={14} />
                            </div>
                            <span className="font-medium">{successMsg}</span>
                        </div>
                        <button onClick={() => setSuccessMsg("")} type="button" className="text-green-500 hover:text-green-700">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Card de identificação do grupo */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <Users size={18} className="text-[#006b64]" />
                        <span className="font-bold text-gray-700 text-sm">Dados do Grupo</span>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#006b64] mb-2">{grupo.nome}</h2>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                        <Hash size={12} /> {grupo.codigo}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 ${mvpColor.bg} ${mvpColor.text} border ${mvpColor.border} px-2 py-1 rounded font-medium`}>
                                        <span className={`w-2 h-2 rounded-full ${mvpColor.dot}`}></span>
                                        {grupo.mvp}
                                    </span>
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-medium">
                                        <Calendar size={12} />
                                        {grupo.ano} — {grupo.periodo}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-2 text-sm">
                                {grupo.projeto ? (
                                    <div className="flex items-center gap-1.5 text-gray-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 font-medium text-xs">
                                        <FolderOpen size={14} className="text-teal-600" />
                                        {grupo.projeto}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 font-medium text-xs">
                                        <AlertCircle size={14} /> Sem projeto vinculado
                                    </div>
                                )}
                                {grupo.githubUrl && (
                                    <a
                                        href={grupo.githubUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 text-[#006b64] hover:underline text-xs font-medium"
                                    >
                                        <FolderGit2 size={14} /> Ver repositório no GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulário de avaliação */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <Calendar size={18} className="text-[#006b64]" />
                        <span className="font-bold text-gray-700 text-sm">Data e Observações</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Data de Apresentação */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Data de Apresentação
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    value={dataApresentacao}
                                    onChange={(e) => setDataApresentacao(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all"
                                />
                            </div>
                        </div>

                        {/* Comentário Geral */}
                        <div className="space-y-2 md:row-span-2">
                            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                <MessageSquare size={14} className="text-[#006b64]" />
                                Comentário Geral
                            </label>
                            <textarea
                                value={comentarioGeral}
                                onChange={(e) => setComentarioGeral(e.target.value)}
                                placeholder="Observações sobre a apresentação do grupo como um todo..."
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] resize-none transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Avaliação Individual */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <Star size={18} className="text-[#006b64]" />
                        <span className="font-bold text-gray-700 text-sm">
                            Avaliação Individual dos Alunos
                        </span>
                        <span className="ml-auto text-xs text-gray-400 font-medium">Nota de 0 a 6 (MVP = 60% da nota)</span>
                    </div>

                    <div className="p-6">
                        {alunosDoGrupo.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Users size={36} className="mb-2 opacity-30" />
                                <p className="text-sm italic">Nenhum aluno vinculado a este grupo.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alunosDoGrupo.map(aluno => (
                                    <div
                                        key={aluno.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 gap-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-[#006b64]/10 flex items-center justify-center text-[#006b64] font-bold text-sm shrink-0">
                                                {aluno.nome?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{aluno.nome}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{aluno.matricula}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-gray-500">Nota:</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="6"
                                                    step="0.1"
                                                    value={notas[aluno.id] !== undefined ? notas[aluno.id] : ""}
                                                    onChange={(e) => handleNotaChange(aluno.id, e.target.value)}
                                                    placeholder="—"
                                                    className={`w-24 px-3 py-2 text-center rounded-lg border text-sm font-bold outline-none focus:ring-2 transition-all
                                                        ${notaErrors[aluno.id]
                                                            ? 'border-red-400 bg-red-50 focus:ring-red-200'
                                                            : 'border-gray-300 focus:border-[#006b64] focus:ring-[#006b64]/20'
                                                        }`}
                                                />
                                                <span className="text-xs text-gray-400 font-medium">/ 6</span>
                                            </div>
                                            {notaErrors[aluno.id] && (
                                                <p className="text-xs text-red-500 font-medium">{notaErrors[aluno.id]}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer com ações */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleVoltar}
                        className="w-full sm:w-auto px-6 py-2.5 text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Cancelar e Voltar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSalvar}
                        className="w-full sm:w-auto px-8 py-2.5 bg-[#006b64] hover:bg-[#00524d] text-white font-bold shadow-md shadow-[#006b64]/20"
                    >
                        <Save size={16} className="mr-2" />
                        Salvar Avaliação
                    </Button>
                </div>
            </main>
        </section>
    )
}

export default AvaliacaoGrupo
