import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
    ArrowLeft,
    FolderOpen,
    FolderGit2,
    Search,
    Save,
    X,
    CheckCircle,
    ChevronDown,
    Link as LinkIcon,
    Info
} from "lucide-react"

function VincularProjeto() {
    const navigate = useNavigate()
    const { id } = useParams()
    const dropdownRef = useRef(null)

    const [grupo, setGrupo] = useState(null)
    const [projetos, setProjetos] = useState([])
    const [projetoSelecionado, setProjetoSelecionado] = useState("")
    const [githubUrl, setGithubUrl] = useState("")
    const [status, setStatus] = useState("Em andamento")
    const [buscaProjeto, setBuscaProjeto] = useState("")
    const [dropdownAberto, setDropdownAberto] = useState(false)
    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState("")

    useEffect(() => {
        // Carregar grupo
        const storedGrupos = localStorage.getItem("grupos_mock")
        if (storedGrupos) {
            const grupos = JSON.parse(storedGrupos)
            const found = grupos.find((g) => g.id.toString() === id)
            if (found) {
                setGrupo(found)
                if (found.projeto) setProjetoSelecionado(found.projeto)
                if (found.githubUrl) setGithubUrl(found.githubUrl)
                if (found.status) setStatus(found.status)
            }
        }

        // Carregar projetos (mesma lógica do CadastroGrupo)
        const staticProjetos = [
            "Sistema de Gestão Acadêmica",
            "E-commerce MVP",
            "App de Delivery",
            "Plataforma de Ensino Online",
            "Sistema de Agendamento Médico",
            "App de Controle Financeiro",
            "Rede Social para Estudantes",
            "Sistema de Biblioteca Digital",
            "App de Monitoramento de Saúde",
            "Plataforma de Freelancers",
            "Sistema de Gestão de Projetos",
            "App de Receitas Culinárias"
        ]

        const storedProjetos = localStorage.getItem("projetos_mock")
        if (storedProjetos) {
            const userProjetos = JSON.parse(storedProjetos).map(p => p.nome)
            const merged = Array.from(new Set([...userProjetos, ...staticProjetos]))
            setProjetos(merged)
        } else {
            setProjetos(staticProjetos)
        }
    }, [id])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownAberto(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const projetosFiltrados = projetos.filter((p) =>
        p.toLowerCase().includes(buscaProjeto.toLowerCase())
    )

    const validate = () => {
        const newErrors = {}
        if (githubUrl.trim() && !githubUrl.match(/^https?:\/\/(www\.)?github\.com\/.+/i)) {
            newErrors.githubUrl = "Informe um link válido do GitHub (ex: https://github.com/usuario/repo)."
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        const storedGrupos = localStorage.getItem("grupos_mock")
        let grupos = storedGrupos ? JSON.parse(storedGrupos) : []
        const index = grupos.findIndex((g) => g.id.toString() === id)

        if (index !== -1) {
            grupos[index] = {
                ...grupos[index],
                projeto: projetoSelecionado,
                githubUrl: githubUrl.trim(),
                status: status
            }
            localStorage.setItem("grupos_mock", JSON.stringify(grupos))
            setSuccessMsg("Vínculo atualizado com sucesso!")

            setTimeout(() => {
                navigate("/grupos")
            }, 1500)
        }
    }

    if (!grupo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#006b64]/20 border-t-[#006b64] rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Carregando dados da equipe...</p>
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
                    Associe um projeto e repositório à equipe <strong className="text-gray-700">{grupo.nome}</strong>.
                </p>
            </div>

            <main className="flex-1 w-full max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-8 space-y-8">
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

                        {/* Seção 1: Resumo da Equipe */}
                        <div className="space-y-6">
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
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Código / TIA</p>
                                    <p className="text-gray-800 font-bold">{grupo.codigo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Vínculos */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <LinkIcon size={18} />
                                <span>Vínculos Externos</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {/* Projeto Vinculado */}
                                <div className="space-y-1 relative" ref={dropdownRef}>
                                    <label className="block text-sm font-semibold text-gray-700">Projeto Vinculado</label>
                                    <button
                                        type="button"
                                        onClick={() => setDropdownAberto(!dropdownAberto)}
                                        className="w-full flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus:ring-2 focus:ring-[#006b64]/20 transition-all text-left"
                                    >
                                        <div className="p-3 border-r border-gray-100">
                                            <FolderOpen className="text-gray-400" size={16} />
                                        </div>
                                        <span className={`flex-1 px-4 py-2.5 text-sm ${projetoSelecionado ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                            {projetoSelecionado || "Selecione um projeto..."}
                                        </span>
                                        <ChevronDown size={16} className={`mr-4 text-gray-400 transition-transform ${dropdownAberto ? "rotate-180" : ""}`} />
                                    </button>

                                    {dropdownAberto && (
                                        <div className="absolute z-20 bottom-full mb-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="p-2 border-b border-gray-50">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar projeto..."
                                                        value={buscaProjeto}
                                                        onChange={(e) => setBuscaProjeto(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 text-sm outline-none bg-gray-50 rounded-lg"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto">
                                                {projetoSelecionado && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setProjetoSelecionado("")
                                                            setDropdownAberto(false)
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 transition-colors border-b border-gray-50 font-bold uppercase tracking-wider"
                                                    >
                                                        ✕ Remover vínculo
                                                    </button>
                                                )}
                                                {projetosFiltrados.length === 0 ? (
                                                    <div className="px-4 py-6 text-center text-gray-400 text-sm">Nenhum projeto encontrado.</div>
                                                ) : (
                                                    projetosFiltrados.map((projeto) => (
                                                        <button
                                                            key={projeto}
                                                            type="button"
                                                            onClick={() => {
                                                                setProjetoSelecionado(projeto)
                                                                setDropdownAberto(false)
                                                                setBuscaProjeto("")
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-all flex items-center justify-between ${projetoSelecionado === projeto ? "bg-[#006b64]/5 text-[#006b64] font-bold" : "text-gray-700"}`}
                                                        >
                                                            <span>{projeto}</span>
                                                            {projetoSelecionado === projeto && <CheckCircle size={14} />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* GitHub Link */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Link do Repositório GitHub</label>
                                    <div className="relative">
                                        <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="url"
                                            value={githubUrl}
                                            onChange={(e) => setGithubUrl(e.target.value)}
                                            placeholder="https://github.com/usuario/repo"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.githubUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.githubUrl && <p className="text-xs text-red-500 font-medium">{errors.githubUrl}</p>}
                                </div>

                                {projetoSelecionado && (
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Status do Projeto</label>
                                        <div className="relative">
                                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] bg-white text-sm font-medium ${status === "Concluído" ? "text-green-600" : "text-blue-600"}`}
                                            >
                                                <option value="Em andamento">Em andamento</option>
                                                <option value="Concluído">Concluído</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 rounded-b-2xl">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/grupos")}
                            className="w-full sm:w-auto px-8 py-2.5 text-gray-600 border-gray-300 hover:bg-white"
                        >
                            <X size={18} className="mr-2" /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#006b64] hover:bg-[#00524d] text-white font-bold shadow-md shadow-[#006b64]/20"
                        >
                            <Save size={18} className="mr-2" /> Salvar Vínculos
                        </Button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default VincularProjeto
