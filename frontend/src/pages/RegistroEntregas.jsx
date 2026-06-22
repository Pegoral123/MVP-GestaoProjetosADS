import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    Search,
    Layers,
    CheckCircle,
    Calendar,
    Hash,
    ClipboardCheck,
    Clock,
    Filter,
    ChevronRight,
    Users,
    FolderOpen,
    X
} from "lucide-react"
import { Button } from "../components/ui/button"


import { listarGrupos } from "../services/grupoService"

function RegistroEntregas() {
    const navigate = useNavigate()
    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(true)
    const [filtroMvp, setFiltroMvp] = useState(() => sessionStorage.getItem("entregas_filtroMvp") || "")
    const [filtroAno, setFiltroAno] = useState(() => sessionStorage.getItem("entregas_filtroAno") || "")
    const [filtroPeriodo, setFiltroPeriodo] = useState(() => sessionStorage.getItem("entregas_filtroPeriodo") || "")
    const [filtroStatus, setFiltroStatus] = useState(() => sessionStorage.getItem("entregas_filtroStatus") || "")
    const [busca, setBusca] = useState(() => sessionStorage.getItem("entregas_busca") || "")

    useEffect(() => { sessionStorage.setItem("entregas_filtroMvp", filtroMvp) }, [filtroMvp])
    useEffect(() => { sessionStorage.setItem("entregas_filtroAno", filtroAno) }, [filtroAno])
    useEffect(() => { sessionStorage.setItem("entregas_filtroPeriodo", filtroPeriodo) }, [filtroPeriodo])
    useEffect(() => { sessionStorage.setItem("entregas_filtroStatus", filtroStatus) }, [filtroStatus])
    useEffect(() => { sessionStorage.setItem("entregas_busca", busca) }, [busca])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const gruposData = await listarGrupos()
                setGrupos(gruposData)
            } catch (error) {
                console.error("Erro ao buscar dados", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const gruposFiltrados = grupos.filter((g) => {
        const matchMvp = filtroMvp ? g.mvp === filtroMvp : true
        const matchAno = filtroAno ? g.ano === filtroAno : true
        const matchPeriodo = filtroPeriodo ? g.periodo === filtroPeriodo : true
        const matchBusca = busca ? g.nome?.toLowerCase().includes(busca.toLowerCase()) : true
        let matchStatus = true
        if (filtroStatus === "Concluído") {
            matchStatus = g.status === "Concluído"
        } else if (filtroStatus === "Em andamento") {
            matchStatus = g.status !== "Concluído"
        }

        return matchMvp && matchAno && matchPeriodo && matchBusca && matchStatus
    })

    const hasActiveFilters = filtroMvp || filtroAno || filtroPeriodo || filtroStatus || busca

    const clearFilters = () => {
        setFiltroMvp("")
        setFiltroAno("")
        setFiltroPeriodo("")
        setFiltroStatus("")
        setBusca("")
        sessionStorage.removeItem("entregas_filtroMvp")
        sessionStorage.removeItem("entregas_filtroAno")
        sessionStorage.removeItem("entregas_filtroPeriodo")
        sessionStorage.removeItem("entregas_filtroStatus")
        sessionStorage.removeItem("entregas_busca")
    }

    const getMvpColor = (mvp) => {
        switch (mvp) {
            case "Frontend": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" }
            case "Backend": return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" }
            case "Mobile": return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" }
            default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", dot: "bg-gray-500" }
        }
    }
    const totalGrupos = grupos.length
    const totalConcluidos = grupos.filter(g => g.status === "Concluído").length
    const totalPendentes = totalGrupos - totalConcluidos

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardCheck size={28} className="text-[#006b64]" />
                            Registro de Entregas e Apresentações
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Avalie as apresentações dos grupos e registre as notas individuais.
                        </p>
                    </div>

                    {/* Stats cards */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                            <span className="block text-xs text-gray-500 font-medium">Total</span>
                            <span className="block text-xl font-bold text-gray-800">{totalGrupos}</span>
                        </div>
                        <div className="bg-white border border-green-200 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                            <span className="block text-xs text-green-600 font-medium">Concluídos</span>
                            <span className="block text-xl font-bold text-green-700">{totalConcluidos}</span>
                        </div>
                        <div className="bg-white border border-amber-200 rounded-xl px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                            <span className="block text-xs text-amber-600 font-medium">Pendentes</span>
                            <span className="block text-xl font-bold text-amber-700">{totalPendentes}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 w-full">
                {/* Filtros */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <Filter size={18} />
                            <span>Filtros de Busca</span>
                        </div>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-[#006b64] hover:text-[#00524d] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                            >
                                <X size={14} />
                                Limpar filtros
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Busca por nome */}
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                            <div className="bg-[#006b64] p-2.5">
                                <Search className="text-white" size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por nome..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border-0 outline-none focus:ring-0 bg-white w-full"
                            />
                        </div>

                        {/* Tipo de MVP */}
                        <select
                            value={filtroMvp}
                            onChange={(e) => setFiltroMvp(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Tipo de MVP (Todos)</option>
                            <option value="Frontend">Front-end</option>
                            <option value="Backend">Back-end</option>
                            <option value="Mobile">Mobile</option>
                        </select>

                        {/* Ano */}
                        <select
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Ano (Todos)</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>

                        {/* Período */}
                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Período (Todos)</option>
                            <option value="1º Semestre">1º Semestre</option>
                            <option value="2º Semestre">2º Semestre</option>
                            <option value="1º Trimestre">1º Trimestre</option>
                            <option value="2º Trimestre">2º Trimestre</option>
                            <option value="3º Trimestre">3º Trimestre</option>
                            <option value="4º Trimestre">4º Trimestre</option>
                        </select>

                        {/* Status de Avaliação */}
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Status (Todos)</option>
                            <option value="Concluído">Concluído</option>
                            <option value="Em andamento">Em andamento</option>
                        </select>
                    </div>
                </div>

                {/* Listagem de Grupos */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Layers size={48} className="mb-3 opacity-40 text-[#006b64] animate-pulse" />
                        <p className="text-base font-medium">Carregando grupos...</p>
                    </div>
                ) : !hasActiveFilters ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Filter size={48} className="mb-3 opacity-30 text-[#006b64]" />
                        <p className="text-base font-semibold text-gray-500">Selecione ao menos um filtro para visualizar os grupos.</p>
                        <p className="text-sm text-gray-400 mt-1">Use os campos acima para filtrar por tipo de MVP, ano ou período.</p>
                    </div>
                ) : gruposFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Layers size={48} className="mb-3 opacity-40 text-[#006b64]" />
                        <p className="text-base font-medium">Nenhum grupo encontrado com os filtros atuais.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-[#006b64] text-sm underline hover:opacity-80 cursor-pointer"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {gruposFiltrados.map(grupo => {
                            const avaliado = grupo.status === "Concluído"
                            const mvpColor = getMvpColor(grupo.mvp)
                            const qtdAlunos = grupo.alunos?.length || grupo.totalAlunos || 0

                            return (
                                <div
                                    key={grupo.id}
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group relative overflow-hidden"
                                >
                                    {/* Barra lateral */}
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${avaliado ? 'bg-green-500' : 'bg-amber-400'} group-hover:w-2 transition-all`}></div>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 pl-6 gap-4">
                                        {/* Info principal */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-800 truncate">
                                                    {grupo.nome}
                                                </h3>
                                                {/* Badge status */}
                                                {avaliado ? (
                                                    <span className="shrink-0 inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
                                                        <CheckCircle size={12} />
                                                        Avaliado
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                                                        <Clock size={12} />
                                                        Pendente
                                                    </span>
                                                )}
                                            </div>

                                            {/* Tags de informação */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                                    <Hash size={12} />
                                                    {grupo.id}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 ${mvpColor.bg} ${mvpColor.text} border ${mvpColor.border} px-2 py-1 rounded font-medium`}>
                                                    <span className={`w-2 h-2 rounded-full ${mvpColor.dot}`}></span>
                                                    {grupo.mvp}
                                                </span>
                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-medium">
                                                    <Calendar size={12} />
                                                    {grupo.ano} — {grupo.periodo}
                                                </span>
                                                {grupo.projeto && (
                                                    <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded font-medium">
                                                        <FolderOpen size={12} />
                                                        {grupo.projeto?.nome || "Projeto"}
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                                                    <Users size={12} />
                                                    {qtdAlunos} {qtdAlunos === 1 ? "aluno" : "alunos"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botão Avaliar */}
                                        <div className="shrink-0">
                                            <Button
                                                onClick={() => navigate(`/entregas/avaliar/${grupo.id}`)}
                                                className={`px-5 py-2 text-sm font-semibold shadow-sm transition-transform hover:scale-105 ${avaliado
                                                    ? 'bg-[#006b64] hover:bg-[#00524d] text-white'
                                                    : 'bg-[#E05B14] hover:bg-[#c44e10] text-white'
                                                    }`}
                                            >
                                                <ClipboardCheck size={16} className="mr-1.5" />
                                                {avaliado ? "Ver Avaliação" : "Avaliar"}
                                                <ChevronRight size={16} className="ml-1 opacity-60" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </section>
    )
}

export default RegistroEntregas
