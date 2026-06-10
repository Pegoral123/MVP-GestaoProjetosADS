import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users, Plus, Search, Calendar, Layers, Hash, FolderX, LogOut, User, LayoutGrid, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import GrupoModal from "../components/grupos/GrupoModal"
import { useAuth } from "../context/AuthContext"
import { listarGrupos, deletarGrupo, atualizarGrupo } from "../services/grupoService"

function ListaGrupos() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [grupos, setGrupos] = useState([])
    const [grupoSelecionado, setGrupoSelecionado] = useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filtros
    const [filtroAno, setFiltroAno] = useState("")
    const [filtroPeriodo, setFiltroPeriodo] = useState("")
    const [filtroData, setFiltroData] = useState("")
    const [busca, setBusca] = useState("")
    const [filtroSemProjeto, setFiltroSemProjeto] = useState(false)

    const carregarGrupos = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await listarGrupos()
            setGrupos(data)
        } catch (err) {
            console.error("Erro ao carregar grupos:", err)
            setError("Não foi possível carregar os grupos. Verifique sua conexão e tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarGrupos()
    }, [])

    const handleStatusChange = async (grupoId, novoStatus) => {
        const grupoOriginal = grupos.find(g => g.id === grupoId)
        setGrupos(prev => prev.map(g => g.id === grupoId ? { ...g, status: novoStatus } : g))

        try {
            await atualizarGrupo(grupoId, { ...grupoOriginal, status: novoStatus })
        } catch (err) {
            console.error("Erro ao atualizar status:", err)
            setGrupos(prev => prev.map(g => g.id === grupoId ? grupoOriginal : g))
        }
    }

    const handleDeleteGrupo = async (grupoId) => {
        try {
            await deletarGrupo(grupoId)
            setGrupos(prev => prev.filter(g => g.id !== grupoId))
            setGrupoSelecionado(null)
        } catch (err) {
            console.error("Erro ao deletar grupo:", err)
            alert("Erro ao excluir o grupo. Tente novamente.")
        }
    }

    const gruposFiltrados = grupos.filter((g) => {
        const matchAno = filtroAno ? g.ano === filtroAno : true
        const matchPeriodo = filtroPeriodo ? g.periodo === filtroPeriodo : true
        const matchData = filtroData ? g.data === filtroData : true
        const matchBusca = busca
            ? (g.nome?.toLowerCase().includes(busca.toLowerCase()) || g.codigo?.toLowerCase().includes(busca.toLowerCase()))
            : true
        const matchSemProjeto = filtroSemProjeto ? !g.projeto : true

        return matchAno && matchPeriodo && matchData && matchBusca && matchSemProjeto
    })

    const frontendGrupos = gruposFiltrados.filter(g => g.mvp === "Frontend")
    const backendGrupos = gruposFiltrados.filter(g => g.mvp === "Backend")
    const mobileGrupos = gruposFiltrados.filter(g => g.mvp === "Mobile")

    const GrupoCard = ({ grupo }) => (
        <div
            onClick={() => setGrupoSelecionado(grupo)}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#006b64] group-hover:w-2 transition-all"></div>

            <div className="flex justify-between items-start pl-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {grupo.nome}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Hash size={14} />
                        <span>{grupo.codigo}</span>
                    </div>
                </div>
                {/* Tag Sem projeto */}
                {!grupo.projeto && (
                    <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <FolderX size={12} />
                        Sem projeto
                    </div>
                )}
            </div>

            <div className="pl-2 flex flex-wrap gap-2 text-xs mt-2">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded flex items-center gap-1">
                    <Calendar size={12} /> {grupo.ano || (grupo.data ? new Date(grupo.data).getFullYear() : '')} - {grupo.periodo}
                </span>
                <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded flex items-center gap-1">
                    <Layers size={12} /> {grupo.data}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-semibold flex items-center gap-1">
                    <Users size={12} />
                    {grupo.totalAlunos ?? grupo.total_alunos ?? 0} alunos
                </span>
            </div>

            {/* Status do Projeto */}
            {grupo.projeto && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        {grupo.status === 'Concluído' ? (
                            <div className="bg-green-100 p-1 rounded-full text-green-600">
                                <CheckCircle size={12} />
                            </div>
                        ) : (
                            <div className="bg-blue-100 p-1 rounded-full text-blue-600 animate-pulse">
                                <Clock size={12} />
                            </div>
                        )}
                        Status:
                    </div>
                    <select
                        value={grupo.status || "Em andamento"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(grupo.id, e.target.value)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border outline-none transition-all cursor-pointer shadow-sm ${grupo.status === "Concluído"
                            ? "bg-green-50 border-green-200 text-green-700 focus:ring-2 focus:ring-green-500/20"
                            : "bg-blue-50 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-500/20"
                            }`}
                    >
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
            )}
        </div>
    )

    const SectionList = ({ title, items, icon }) => (
        <div className="mb-10">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                {icon}
                <h2 className="text-xl font-bold text-gray-700">{title}</h2>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full ml-2">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <div className="text-gray-400 text-sm italic py-4">Nenhum grupo encontrado nesta categoria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(g => <GrupoCard key={g.id} grupo={g} />)}
                </div>
            )}
        </div>
    )

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Layers size={28} className="text-[#006b64]" />
                            Grupos & Equipes
                        </h1>
                        <p className="text-gray-500 text-sm">Gerencie os grupos de projeto e seus respectivos alunos.</p>
                    </div>
                    <Button
                        onClick={() => navigate("/grupos/cadastro")}
                        className="bg-[#006b64] hover:bg-[#00524d] text-white font-semibold text-sm px-6 py-2 shadow-sm transition-transform hover:scale-105 w-fit"
                    >
                        <Plus size={16} className="mr-1" />
                        Novo Grupo
                    </Button>
                </div>
            </div>

            {/* Main */}
            <main className="flex-1 w-full">

                {/* Filtros */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex items-center gap-2 text-gray-700 font-semibold mb-4 border-b border-gray-100 pb-2">
                        <Search size={18} />
                        <span>Filtros de Pesquisa</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                            <div className="bg-[#006b64] p-2.5">
                                <Search className="text-white" size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por código ou nome..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border-0 outline-none focus:ring-0 bg-white w-full"
                            />
                        </div>

                        <select
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Todos os Anos</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>

                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Todos os Períodos</option>
                            <option value="1º Semestre">1º Semestre</option>
                            <option value="2º Semestre">2º Semestre</option>
                            <option value="1º Trimestre">1º Trimestre</option>
                            <option value="2º Trimestre">2º Trimestre</option>
                            <option value="3º Trimestre">3º Trimestre</option>
                            <option value="4º Trimestre">4º Trimestre</option>
                        </select>

                        <input
                            type="date"
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        />
                    </div>

                    {/* Filtro: Sem Projeto */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={filtroSemProjeto}
                                onChange={(e) => setFiltroSemProjeto(e.target.checked)}
                                className="rounded border-gray-300 text-[#006b64] focus:ring-[#006b64] cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors flex items-center gap-1.5">
                                <FolderX size={14} className="text-amber-600" />
                                Exibir apenas grupos sem projeto vinculado
                            </span>
                        </label>
                    </div>
                </div>

                {/* Listagem */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Loader2 size={36} className="animate-spin text-[#006b64] mb-3" />
                        <p className="text-gray-500 text-sm">Carregando grupos...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <AlertCircle size={48} className="mb-3 text-red-400" />
                        <p className="text-base font-medium text-red-600">{error}</p>
                        <button
                            onClick={carregarGrupos}
                            className="mt-4 text-[#006b64] text-sm underline hover:opacity-80 cursor-pointer"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : gruposFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Layers size={48} className="mb-3 opacity-40 text-[#006b64]" />
                        <p className="text-base font-medium">Nenhum grupo encontrado com os filtros atuais.</p>
                        <button
                            onClick={() => {
                                setBusca("")
                                setFiltroAno("")
                                setFiltroData("")
                                setFiltroPeriodo("")
                                setFiltroSemProjeto(false)
                            }}
                            className="mt-4 text-[#006b64] text-sm underline hover:opacity-80 cursor-pointer"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <div>
                        <SectionList
                            title="MVP Frontend"
                            items={frontendGrupos}
                            icon={<div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                        />
                        <SectionList
                            title="MVP Backend"
                            items={backendGrupos}
                            icon={<div className="w-3 h-3 rounded-full bg-green-500"></div>}
                        />
                        <SectionList
                            title="MVP Mobile"
                            items={mobileGrupos}
                            icon={<div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                        />
                    </div>
                )}
            </main>

            {/* Modal de Grupo */}
            <GrupoModal
                grupo={grupoSelecionado}
                onClose={() => setGrupoSelecionado(null)}
                onDelete={handleDeleteGrupo}
            />
        </section>
    )
}

export default ListaGrupos
