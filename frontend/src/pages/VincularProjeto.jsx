import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
    ArrowLeft,
    FolderOpen,
    Search,
    CheckCircle,
    X,
    Link as LinkIcon,
    Info,
    Loader2,
    AlertCircle,
    LayoutGrid,
} from "lucide-react"
import { buscarGrupo } from "../services/grupoService"
import { listarProjetos, vincularProjetoAoGrupo } from "../services/projetoService"

function VincularProjeto() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [grupo, setGrupo] = useState(null)
    const [projetos, setProjetos] = useState([])
    const [projetoSelecionado, setProjetoSelecionado] = useState(null)
    const [busca, setBusca] = useState("")

    const [loadingGrupo, setLoadingGrupo] = useState(true)
    const [loadingProjetos, setLoadingProjetos] = useState(true)
    const [salvando, setSalvando] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [successMsg, setSuccessMsg] = useState("")


    useEffect(() => {
        const fetchDados = async () => {
            try {
                const g = await buscarGrupo(id)
                setGrupo(g)
                if (g.projeto) {
                    setProjetoSelecionado(g.projeto)
                }
            } catch (err) {
                console.error("Erro ao buscar grupo:", err)
                setErrorMsg("Não foi possível carregar os dados do grupo.")
            } finally {
                setLoadingGrupo(false)
            }

            try {
                const todos = await listarProjetos()
                setProjetos(todos.filter(p => p.status === "Ativo"))
            } catch (err) {
                console.error("Erro ao buscar projetos:", err)
            } finally {
                setLoadingProjetos(false)
            }
        }
        fetchDados()
    }, [id])

    const projetosFiltrados = projetos.filter(p =>
        p.nome?.toLowerCase().includes(busca.toLowerCase())
    )

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!projetoSelecionado) {
            setErrorMsg("Selecione um projeto para vincular.")
            return
        }

        const salvar = async () => {
            setSalvando(true)
            setErrorMsg("")
            try {
                await vincularProjetoAoGrupo(Number(id), projetoSelecionado.id)
                setSuccessMsg("Projeto vinculado com sucesso!")
                setTimeout(() => navigate("/grupos"), 1400)
            } catch (err) {
                console.error("Erro ao vincular projeto:", err)
                setErrorMsg("Erro ao vincular o projeto. Tente novamente.")
            } finally {
                setSalvando(false)
            }
        }
        salvar()
    }

    if (loadingGrupo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#006b64]/20 border-t-[#006b64] rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Carregando dados da equipe...</p>
                </div>
            </div>
        )
    }

    if (!grupo && !loadingGrupo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <AlertCircle size={48} className="text-red-400" />
                    <p className="text-gray-600 font-medium">Grupo não encontrado.</p>
                    <Button variant="outline" onClick={() => navigate("/grupos")}>
                        <ArrowLeft size={16} className="mr-2" /> Voltar para Equipes
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/grupos")}
                    className="text-gray-500 hover:text-[#006b64] hover:bg-[#006b64]/10 mb-4 px-2"
                    type="button"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Voltar para Equipes
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">Vincular Projeto</h1>
                <p className="text-gray-500 text-sm">
                    Selecione um projeto ativo para associar à equipe{" "}
                    <strong className="text-gray-700">{grupo.nome}</strong>.
                </p>
            </div>

            <main className="flex-1 w-full max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-8 space-y-8">
                        {/* Feedback */}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-1 rounded-full">
                                        <CheckCircle size={14} />
                                    </div>
                                    <span className="font-medium">{successMsg}</span>
                                </div>
                            </div>
                        )}
                        {errorMsg && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    <span className="font-medium">{errorMsg}</span>
                                </div>
                                <button onClick={() => setErrorMsg("")} type="button" className="text-red-400 hover:text-red-600">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Resumo da Equipe */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <Info size={18} />
                                <span>Informações da Equipe</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Nome da Equipe</p>
                                    <p className="text-gray-800 font-bold">{grupo.nome}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">ID da Equipe</p>
                                    <p className="text-gray-800 font-bold">{grupo.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seleção de Projeto */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <LinkIcon size={18} />
                                <span>Escolha o Projeto</span>
                            </div>

                            {/* Projeto já vinculado */}
                            {projetoSelecionado && (
                                <div className="flex items-center gap-3 bg-[#006b64]/5 border border-[#006b64]/20 rounded-xl p-4">
                                    <div className="bg-[#006b64]/10 p-2 rounded-lg">
                                        <FolderOpen size={18} className="text-[#006b64]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 font-medium">Projeto selecionado</p>
                                        <p className="text-sm text-[#006b64] font-bold truncate">{projetoSelecionado.nome}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setProjetoSelecionado(null)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remover seleção"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}

                            {/* Busca */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    placeholder="Buscar projeto ativo..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] text-sm transition-all"
                                />
                            </div>

                            {/* Lista de projetos */}
                            {loadingProjetos ? (
                                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span className="text-sm">Carregando projetos...</span>
                                </div>
                            ) : projetosFiltrados.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-gray-400">
                                    <LayoutGrid size={36} className="mb-2 opacity-30" />
                                    <p className="text-sm">
                                        {projetos.length === 0
                                            ? "Nenhum projeto ativo disponível."
                                            : "Nenhum projeto encontrado para essa busca."}
                                    </p>
                                </div>
                            ) : (
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
                                    {projetosFiltrados.map(projeto => {
                                        const selecionado = projetoSelecionado?.id === projeto.id
                                        return (
                                            <button
                                                key={projeto.id}
                                                type="button"
                                                onClick={() => setProjetoSelecionado(selecionado ? null : projeto)}
                                                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-all
                                                    ${selecionado
                                                        ? "bg-[#006b64]/5 text-[#006b64]"
                                                        : "hover:bg-gray-50 text-gray-700"}`}
                                            >
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-semibold truncate ${selecionado ? "text-[#006b64]" : "text-gray-800"}`}>
                                                        {projeto.nome}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">{projeto.descricao}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-1.5 py-0.5 rounded">
                                                            {projeto.mvp}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{projeto.ano}</span>
                                                    </div>
                                                </div>
                                                {selecionado && (
                                                    <CheckCircle size={18} className="text-[#006b64] shrink-0" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rodapé */}
                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/grupos")}
                            className="w-full sm:w-auto px-8 py-2.5 text-gray-600 border-gray-300 hover:bg-white"
                            disabled={salvando}
                        >
                            <X size={18} className="mr-2" /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!projetoSelecionado || salvando}
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#006b64] hover:bg-[#00524d] text-white font-bold shadow-md shadow-[#006b64]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {salvando ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" /> Salvando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} className="mr-2" /> Confirmar Vínculo
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default VincularProjeto
