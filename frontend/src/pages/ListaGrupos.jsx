import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users, Plus, Search, Calendar, Layers, Hash, FolderX, LogOut, User, LayoutGrid, Clock, CheckCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import GrupoModal from "../components/grupos/GrupoModal"
import { useAuth } from "../context/AuthContext"

function ListaGrupos() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [grupos, setGrupos] = useState([])
    const [grupoSelecionado, setGrupoSelecionado] = useState(null)

    // Filtros
    const [filtroAno, setFiltroAno] = useState("")
    const [filtroPeriodo, setFiltroPeriodo] = useState("")
    const [filtroData, setFiltroData] = useState("")
    const [busca, setBusca] = useState("")
    const [filtroSemProjeto, setFiltroSemProjeto] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem("grupos_mock")
        if (stored && JSON.parse(stored).length > 0) {
            setGrupos(JSON.parse(stored))
        } else {
            const mockGrupos = [
                { id: 1, codigo: "FE-001", nome: "React Ninjas", data: "2024-03-10", ano: "2024", periodo: "1º Semestre", mvp: "Frontend", alunos: [], projeto: "Plataforma de Ensino Online", githubUrl: "https://github.com/react-ninjas/plataforma-ensino", status: "Em andamento" },
                { id: 2, codigo: "FE-002", nome: "Vue Vanguards", data: "2024-03-15", ano: "2024", periodo: "1º Semestre", mvp: "Frontend", alunos: [] },
                { id: 3, codigo: "FE-003", nome: "Angular Architects", data: "2024-08-20", ano: "2024", periodo: "2º Semestre", mvp: "Frontend", alunos: [], projeto: "E-commerce MVP", githubUrl: "https://github.com/angular-architects/ecommerce", status: "Concluído" },
                { id: 4, codigo: "FE-004", nome: "Svelte Squad", data: "2025-02-10", ano: "2025", periodo: "1º Trimestre", mvp: "Frontend", alunos: [] },
                { id: 5, codigo: "BE-001", nome: "Node Knights", data: "2024-04-05", ano: "2024", periodo: "1º Semestre", mvp: "Backend", alunos: [], projeto: "Sistema de Gestão Acadêmica", githubUrl: "https://github.com/node-knights/gestao-academica", status: "Em andamento" },
                { id: 6, codigo: "BE-002", nome: "Python Pioneers", data: "2024-05-12", ano: "2024", periodo: "1º Semestre", mvp: "Backend", alunos: [] },
                { id: 7, codigo: "BE-003", nome: "Java Juggernauts", data: "2024-09-01", ano: "2024", periodo: "2º Semestre", mvp: "Backend", alunos: [] },
                { id: 8, codigo: "BE-004", nome: "Go Gurus", data: "2025-03-15", ano: "2025", periodo: "1º Trimestre", mvp: "Backend", alunos: [], projeto: "App de Delivery", githubUrl: "https://github.com/go-gurus/delivery-app", status: "Em andamento" },
                { id: 9, codigo: "MB-001", nome: "Flutter Foxes", data: "2024-02-20", ano: "2024", periodo: "1º Semestre", mvp: "Mobile", alunos: [] },
                { id: 10, codigo: "MB-002", nome: "React Native Rangers", data: "2024-06-10", ano: "2024", periodo: "1º Semestre", mvp: "Mobile", alunos: [], projeto: "App de Controle Financeiro", githubUrl: "https://github.com/rn-rangers/controle-financeiro", status: "Concluído" },
                { id: 11, codigo: "MB-003", nome: "Swift Spartans", data: "2024-10-05", ano: "2024", periodo: "2º Semestre", mvp: "Mobile", alunos: [] },
                { id: 12, codigo: "MB-004", nome: "Kotlin Kings", data: "2025-01-20", ano: "2025", periodo: "1º Trimestre", mvp: "Mobile", alunos: [] }
            ]
            localStorage.setItem("grupos_mock", JSON.stringify(mockGrupos))
            setGrupos(mockGrupos)
        }
    }, [])

    const handleStatusChange = (grupoId, novoStatus) => {
        const storedGrupos = localStorage.getItem("grupos_mock")
        let gruposMock = storedGrupos ? JSON.parse(storedGrupos) : []
        
        const novosGrupos = gruposMock.map(g => {
            if (g.id === grupoId) {
                return { ...g, status: novoStatus }
            }
            return g
        })
        
        localStorage.setItem("grupos_mock", JSON.stringify(novosGrupos))
        setGrupos(novosGrupos)
    }

    const handleDeleteGrupo = (grupoId) => {
        const storedGrupos = localStorage.getItem("grupos_mock")
        let gruposMock = storedGrupos ? JSON.parse(storedGrupos) : []
        gruposMock = gruposMock.filter((g) => g.id !== grupoId)
        localStorage.setItem("grupos_mock", JSON.stringify(gruposMock))
        setGrupos(gruposMock)
        setGrupoSelecionado(null)
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
                    <Calendar size={12} /> {grupo.ano} - {grupo.periodo}
                </span>
                <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded flex items-center gap-1">
                    <Layers size={12} /> {grupo.data}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-semibold flex items-center gap-1">
                    <Users size={12} />
                    {grupo.alunos?.length || 0} alunos
                </span>
            </div>

            {/* Status do Projeto - Visível apenas se tiver projeto vinculado */}
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
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border outline-none transition-all cursor-pointer shadow-sm ${
                            grupo.status === "Concluído"
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
                {gruposFiltrados.length === 0 ? (
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
