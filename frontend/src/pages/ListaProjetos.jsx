import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    LayoutGrid, Plus, Search, Trash2, Edit, ChevronRight,
    Loader2, AlertCircle, ToggleLeft, ToggleRight, FolderOpen
} from "lucide-react"
import { Button } from "../components/ui/button"
import ProjetoModal from "../components/projetos/ProjetoModal"
import SkeletonCard from "../components/projetos/SkeletonCard"
import ProjetoCard from "../components/projetos/ProjetoCard"
import SearchInput from "../components/comum/SearchInput"
import {
    listarProjetos,
    deletarProjeto,
    alternarStatusProjeto,
} from "../services/projetoService"

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
                        <SearchInput
                            label="Buscar Projeto"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Nome do projeto..."
                        />
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
                            <ProjetoCard
                                key={projeto.id}
                                projeto={projeto}
                                onDetalhes={setProjetoSelecionado}
                                onEdit={(id) => navigate(`/projetos/editar/${id}`)}
                                onDelete={handleDelete}
                                onAlternarStatus={handleAlternarStatus}
                            />
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
