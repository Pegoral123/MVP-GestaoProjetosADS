import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    LayoutGrid, Plus, Search, Trash2, Edit, ChevronRight,
    Loader2, AlertCircle, ToggleLeft, ToggleRight, FolderOpen
} from "lucide-react"
import { Button } from "../components/ui/button"
import ProjetoModal from "../components/projetos/ProjetoModal"
import {
    listarProjetos,
    deletarProjeto,
    alternarStatusProjeto,
} from "../services/projetoService"

const MVP_COLORS = {
    Frontend: "bg-blue-50 text-blue-700 border border-blue-200",
    Backend: "bg-green-50 text-green-700 border border-green-200",
    Mobile: "bg-purple-50 text-purple-700 border border-purple-200",
}

function SkeletonCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            <div className="h-6 bg-gray-100 rounded w-20 mt-2"></div>
        </div>
    )
}

function ListaProjetos() {
    const navigate = useNavigate()
    const [projetos, setProjetos] = useState([])
    const [projetoSelecionado, setProjetoSelecionado] = useState(null)
    const [busca, setBusca] = useState("")
    const [filtroMvp, setFiltroMvp] = useState("")
    const [filtroStatus, setFiltroStatus] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const carregarProjetos = () => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await listarProjetos()
                setProjetos(data)
            } catch (err) {
                console.error("Erro ao carregar projetos:", err)
                setError("Não foi possível carregar os projetos. Verifique sua conexão e tente novamente.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }

    useEffect(() => {
        carregarProjetos()
    }, [])

    const handleDelete = (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este projeto?")) return
        const excluir = async () => {
            try {
                await deletarProjeto(id)
                setProjetos(prev => prev.filter(p => p.id !== id))
                if (projetoSelecionado?.id === id) setProjetoSelecionado(null)
            } catch (err) {
                console.error("Erro ao excluir projeto:", err)
                alert("Erro ao excluir o projeto. Tente novamente.")
            }
        }
        excluir()
    }

    const handleAlternarStatus = (id) => {
        const alternar = async () => {
            try {
                const atualizado = await alternarStatusProjeto(id)
                setProjetos(prev => prev.map(p => p.id === id ? { ...p, ...atualizado } : p))

                if (projetoSelecionado?.id === id) {
                    setProjetoSelecionado(prev => ({ ...prev, ...atualizado }))
                }
            } catch (err) {
                console.error("Erro ao alternar status:", err)
            }
        }
        alternar()
    }

    const projetosFiltrados = projetos.filter(p => {
        const matchBusca = p.nome?.toLowerCase().includes(busca.toLowerCase())
        const matchMvp = filtroMvp ? p.mvp === filtroMvp : true
        const matchStatus = filtroStatus ? p.status === filtroStatus : true
        return matchBusca && matchMvp && matchStatus
    })

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Cabeçalho */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <LayoutGrid size={28} className="text-[#006b64]" />
                            Gestão de Projetos
                        </h1>
                        <p className="text-gray-500 text-sm">Cadastre e gerencie os projetos disponíveis para os alunos.</p>
                    </div>
                    <Button
                        onClick={() => navigate("/projetos/cadastro")}
                        className="bg-[#006b64] hover:bg-[#00524d] text-white font-semibold text-sm px-6 py-2 shadow-sm transition-transform hover:scale-105 w-fit"
                    >
                        <Plus size={16} className="mr-1" /> Novo Projeto
                    </Button>
                </div>
            </div>

            <main className="flex-1 w-full">
                {/* Filtros */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Buscar Projeto</label>
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                            <div className="bg-[#006b64] p-2.5">
                                <Search className="text-white" size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Nome do projeto..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border-0 outline-none w-full"
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Tipo MVP</label>
                        <select
                            value={filtroMvp}
                            onChange={(e) => setFiltroMvp(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Mobile">Mobile</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Status</label>
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 bg-white"
                        >
                            <option value="">Todos</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                {/* Listagem */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <AlertCircle size={48} className="mb-3 text-red-400" />
                        <p className="text-base font-medium text-red-600">{error}</p>
                        <button
                            onClick={carregarProjetos}
                            className="mt-4 text-[#006b64] text-sm underline hover:opacity-80 cursor-pointer"
                        >
                            Tentar novamente
                        </button>
                    </div>
                ) : projetosFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <FolderOpen size={48} className="mb-3 opacity-30 text-[#006b64]" />
                        <p className="text-base font-medium">
                            {projetos.length === 0
                                ? "Nenhum projeto cadastrado ainda."
                                : "Nenhum projeto encontrado com os filtros atuais."}
                        </p>
                        {projetos.length > 0 && (
                            <button
                                onClick={() => { setBusca(""); setFiltroMvp(""); setFiltroStatus("") }}
                                className="mt-4 text-[#006b64] text-sm underline hover:opacity-80 cursor-pointer"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projetosFiltrados.map(projeto => (
                            <div
                                key={projeto.id}
                                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                            >
                                {/* Barra lateral colorida por MVP */}
                                <div className={`absolute top-0 left-0 w-1 h-full group-hover:w-2 transition-all ${projeto.mvp === 'Frontend' ? 'bg-blue-400' : projeto.mvp === 'Backend' ? 'bg-green-500' : 'bg-purple-500'}`}></div>

                                <div className="pl-2">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${projeto.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {projeto.status}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                                            {projeto.ano}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{projeto.nome}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{projeto.descricao}</p>
                                    <span className={`text-[11px] font-semibold px-2 py-1 rounded ${MVP_COLORS[projeto.mvp] || 'bg-gray-100 text-gray-600'}`}>
                                        {projeto.mvp}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 pl-2">
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => navigate(`/projetos/editar/${projeto.id}`)}
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(projeto.id)}
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAlternarStatus(projeto.id)}
                                            className={`h-8 w-8 p-0 ${projeto.status === 'Ativo' ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                                            title={projeto.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                                        >
                                            {projeto.status === 'Ativo'
                                                ? <ToggleRight size={18} />
                                                : <ToggleLeft size={18} />}
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setProjetoSelecionado(projeto)}
                                        className="text-[#006b64] hover:bg-[#006b64]/10 font-semibold text-xs gap-1"
                                    >
                                        Detalhes <ChevronRight size={14} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <ProjetoModal
                projeto={projetoSelecionado}
                onClose={() => setProjetoSelecionado(null)}
                onEdit={(id) => {
                    setProjetoSelecionado(null)
                    navigate(`/projetos/editar/${id}`)
                }}
            />
        </section>
    )
}

export default ListaProjetos
