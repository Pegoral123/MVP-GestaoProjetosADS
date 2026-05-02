import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FolderOpen, FolderGit2, Search, Save, X, CheckCircle, ChevronDown } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

// Mock de Projetos
const PROJETOS_MOCK = [
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
    "App de Receitas Culinárias",
]

function VincularProjeto() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [grupo, setGrupo] = useState(null)
    const [projetoSelecionado, setProjetoSelecionado] = useState("")
    const [githubUrl, setGithubUrl] = useState("")
    const [buscaProjeto, setBuscaProjeto] = useState("")
    const [dropdownAberto, setDropdownAberto] = useState(false)
    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState("")

    const dropdownRef = useRef(null)

    useEffect(() => {
        const storedGrupos = localStorage.getItem("grupos_mock")
        if (storedGrupos) {
            const grupos = JSON.parse(storedGrupos)
            const found = grupos.find((g) => g.id.toString() === id)
            if (found) {
                setGrupo(found)
                if (found.projeto) setProjetoSelecionado(found.projeto)
                if (found.githubUrl) setGithubUrl(found.githubUrl)
            }
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

    const projetosFiltrados = PROJETOS_MOCK.filter((p) =>
        p.toLowerCase().includes(buscaProjeto.toLowerCase())
    )

    const validate = () => {
        const newErrors = {}
        if (githubUrl.trim() && !githubUrl.match(/^https?:\/\/(www\.)?github\.com\/.+/i)) {
            newErrors.github = "Informe um link válido do GitHub (ex: https://github.com/usuario/repo)."
        }
        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setErrors({})

        const storedGrupos = localStorage.getItem("grupos_mock")
        let grupos = storedGrupos ? JSON.parse(storedGrupos) : []
        const index = grupos.findIndex((g) => g.id.toString() === id)

        if (index !== -1) {
            grupos[index] = {
                ...grupos[index],
                projeto: projetoSelecionado,
                githubUrl: githubUrl.trim(),
            }
            localStorage.setItem("grupos_mock", JSON.stringify(grupos))
            setSuccessMsg("Projeto vinculado com sucesso!")

            setTimeout(() => {
                navigate("/grupos")
            }, 1500)
        }
    }

    if (!grupo) {
        return (
            <section className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Carregando grupo...</p>
            </section>
        )
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-[#006b64] text-white px-6 py-4 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/grupos")}
                        className="text-white/80 hover:text-white hover:bg-white/20 px-2"
                        type="button"
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Voltar
                    </Button>
                    <div className="h-5 w-px bg-white/30 mx-1" />
                    <div className="flex items-center gap-2">
                        <FolderOpen size={20} />
                        <h1 className="text-lg font-semibold tracking-wide">Vincular Projeto</h1>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-[640px] bg-white rounded-2xl shadow-lg p-8">

                    {/* Info do grupo */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#006b64] p-2 rounded-lg">
                            <FolderOpen className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Vincular Projeto ao Grupo</h2>
                            <p className="text-sm text-gray-500">
                                Grupo: <strong>{grupo.nome}</strong> ({grupo.codigo})
                            </p>
                        </div>
                    </div>

                    {/* Sucesso */}
                    {successMsg && (
                        <div className="mb-5 bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} />
                                <span>{successMsg}</span>
                            </div>
                            <button onClick={() => setSuccessMsg("")} type="button">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                        {/* Dropdown de Projeto com busca */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Projeto
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                {/* Botão do dropdown */}
                                <button
                                    type="button"
                                    onClick={() => setDropdownAberto(!dropdownAberto)}
                                    className="w-full flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 cursor-pointer"
                                >
                                    <div className="bg-[#006b64] p-3">
                                        <FolderOpen className="text-white" size={18} />
                                    </div>
                                    <span className={`flex-1 px-3 py-2.5 text-sm text-left ${projetoSelecionado ? "text-gray-800" : "text-gray-400"}`}>
                                        {projetoSelecionado || "Selecione um projeto..."}
                                    </span>
                                    <ChevronDown size={16} className={`mr-3 text-gray-400 transition-transform ${dropdownAberto ? "rotate-180" : ""}`} />
                                </button>

                                {/* Lista dropdown */}
                                {dropdownAberto && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
                                        {/* Busca */}
                                        <div className="flex items-center border-b border-gray-200 px-3 py-2 gap-2">
                                            <Search size={16} className="text-gray-400 shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Buscar projeto..."
                                                value={buscaProjeto}
                                                onChange={(e) => setBuscaProjeto(e.target.value)}
                                                className="flex-1 text-sm outline-none border-0 bg-transparent"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Itens */}
                                        <div className="overflow-y-auto max-h-48">
                                            {projetosFiltrados.length === 0 ? (
                                                <p className="text-sm text-gray-400 text-center py-4">Nenhum projeto encontrado.</p>
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
                                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#006b64]/5 transition-colors flex items-center justify-between cursor-pointer ${projetoSelecionado === projeto ? "bg-[#006b64]/10 text-[#006b64] font-semibold" : "text-gray-700"
                                                            }`}
                                                    >
                                                        <span>{projeto}</span>
                                                        {projetoSelecionado === projeto && (
                                                            <CheckCircle size={16} className="text-[#006b64]" />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.projeto && <p className="text-red-500 text-xs mt-1">{errors.projeto}</p>}
                        </div>

                        {/* Link do GitHub */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link do Repositório GitHub
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                <div className="bg-[#006b64] p-3">
                                    <FolderGit2 className="text-white" size={18} />
                                </div>
                                <Input
                                    type="url"
                                    placeholder="https://github.com/usuario/repositorio"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    className="flex-1 border-0 shadow-none focus:ring-0"
                                />
                            </div>
                            {errors.github && <p className="text-red-500 text-xs mt-1">{errors.github}</p>}
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate("/grupos")}
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-[#006b64] hover:bg-[#015c55] text-white"
                            >
                                <Save size={16} className="mr-1" />
                                Vincular
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </section>
    )
}

export default VincularProjeto
