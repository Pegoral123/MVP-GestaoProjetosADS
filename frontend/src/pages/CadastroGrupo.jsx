import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
    ArrowLeft,
    Users,
    X,
    Hash,
    Save,
    Calendar,
    Layers,
    Search,
    FolderOpen,
    FolderGit2,
    ChevronDown,
    CheckCircle,
    Info,
    UserPlus,
    Clock
} from "lucide-react"
import api from "../services/api"
import { buscarGrupo, criarGrupo, atualizarGrupo, listarAlunosDoGrupo, vincularAlunoAoGrupo, desvincularAlunoDoGrupo, listarGrupos } from "../services/grupoService"

function CadastroGrupo() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id
    const dropdownRef = useRef(null)

    const [formData, setFormData] = useState({
        codigo: "",
        nome: "",
        data: new Date().toISOString().split('T')[0],
        periodo: "",
        mvp: "",
        alunos: [],
        projeto: "",
        githubUrl: "",
        status: "Em andamento"
    })

    const [alunos, setAlunos] = useState([])
    const [projetos, setProjetos] = useState([])
    const [buscaAluno, setBuscaAluno] = useState("")
    const [buscaProjeto, setBuscaProjeto] = useState("")
    const [dropdownAberto, setDropdownAberto] = useState(false)
    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState("")
    const [initialAlunos, setInitialAlunos] = useState([])
    const [proximoId, setProximoId] = useState(1)

    useEffect(() => {
        const fetchAlunos = async () => {
            try {
                const res = await api.get('alunos/');
                const dataObj = res.data?.data ?? res.data;
                const data = Array.isArray(dataObj) ? dataObj : dataObj?.results || [];
                setAlunos(data);
            } catch (error) {
                console.error("Erro ao buscar alunos", error);
            }
        };
        fetchAlunos();

        const fetchProximoId = async () => {
            try {
                const gruposExistentes = await listarGrupos();
                let maxId = 0;
                gruposExistentes.forEach(g => {
                    if (g.id > maxId) maxId = g.id;
                });
                setProximoId(maxId + 1);
            } catch (error) {
                console.error("Erro ao buscar grupos para calcular próximo ID", error);
            }
        };
        if (!isEdit) {
            fetchProximoId();
        }

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

        if (isEdit) {
            const fetchGrupo = async () => {
                try {
                    const grupoEdit = await buscarGrupo(id)
                    if (grupoEdit) {
                        let selectedAlunosIds = []
                        try {
                            const membros = await listarAlunosDoGrupo(id)
                            selectedAlunosIds = membros.map(m => m.id)
                        } catch (err) {
                            console.error("Erro ao buscar alunos do grupo:", err)
                        }
                        setFormData({
                            codigo: grupoEdit.codigo || "",
                            nome: grupoEdit.nome || "",
                            data: grupoEdit.data || "",
                            periodo: grupoEdit.periodo || "",
                            mvp: grupoEdit.mvp || "",
                            alunos: selectedAlunosIds,
                            projeto: grupoEdit.projeto?.nome || "",
                            githubUrl: grupoEdit.githubUrl || grupoEdit.github_url || "",
                            status: grupoEdit.status || "Em andamento"
                        })
                        setInitialAlunos(selectedAlunosIds)
                    }
                } catch (error) {
                    console.error("Erro ao buscar grupo para edição:", error)
                }
            }
            fetchGrupo()
        }
    }, [id, isEdit])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownAberto(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const nextData = { ...prev, [name]: value }
            if (name === "mvp" && !isEdit) {
                const prefix = value === "Frontend" ? "FE" : value === "Backend" ? "BE" : value === "Mobile" ? "MB" : "";
                if (prefix) {
                    nextData.codigo = `${prefix}-${String(proximoId).padStart(3, '0')}`;
                } else {
                    nextData.codigo = "";
                }
            }
            return nextData
        })
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleAlunoToggle = (alunoId) => {
        setFormData(prev => {
            const isSelected = prev.alunos.includes(alunoId)
            const newAlunos = isSelected
                ? prev.alunos.filter(id => id !== alunoId)
                : [...prev.alunos, alunoId]

            if (errors.alunos) {
                setErrors(e => ({ ...e, alunos: null }))
            }

            return { ...prev, alunos: newAlunos }
        })
    }

    const validate = (data = formData) => {
        const newErrors = {}
        if (!data.nome.trim()) newErrors.nome = "Nome é obrigatório."
        if (!data.data) newErrors.data = "Data é obrigatória."
        if (!data.periodo) newErrors.periodo = "Período é obrigatório."
        if (!data.mvp) newErrors.mvp = "MVP é obrigatório."
        if (data.alunos.length === 0) newErrors.alunos = "Selecione ao menos um aluno."
        if (data.githubUrl && !data.githubUrl.match(/^https?:\/\/(www\.)?github\.com\/.+/i)) {
            newErrors.githubUrl = "Informe um link válido do GitHub."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let currentCodigo = formData.codigo;
        if (!isEdit && (!currentCodigo || currentCodigo.trim() === "")) {
            const prefix = formData.mvp === "Frontend" ? "FE" : formData.mvp === "Backend" ? "BE" : formData.mvp === "Mobile" ? "MB" : "GP";
            currentCodigo = `${prefix}-${String(proximoId).padStart(3, '0')}`;
        }

        const dataToSave = {
            ...formData,
            codigo: currentCodigo
        };

        if (!validate(dataToSave)) return

        try {
            let grupoSalvo;
            if (isEdit) {
                grupoSalvo = await atualizarGrupo(parseInt(id), dataToSave)
                setSuccessMsg(`Equipe "${formData.nome}" atualizada com sucesso!`)
            } else {
                grupoSalvo = await criarGrupo(dataToSave)
                setSuccessMsg(`Equipe "${formData.nome}" cadastrada com sucesso!`)
            }

            const grupoId = isEdit ? parseInt(id) : grupoSalvo.id

            const aVincular = formData.alunos.filter(alunoId => !initialAlunos.includes(alunoId))
            const aDesvincular = initialAlunos.filter(alunoId => !formData.alunos.includes(alunoId))

            const promises = [
                ...aVincular.map(alunoId => vincularAlunoAoGrupo(alunoId, grupoId)),
                ...aDesvincular.map(alunoId => desvincularAlunoDoGrupo(alunoId, grupoId))
            ]

            await Promise.all(promises)

            setTimeout(() => {
                navigate("/grupos")
            }, 1500)
        } catch (error) {
            console.error("Erro ao salvar grupo:", error)
            console.error("Dados detalhados do erro do backend:", error.response?.data)

            let errorMsg = "Erro ao salvar o grupo. Tente novamente."
            if (error.response?.data) {
                const dataError = error.response.data
                if (dataError.errors && typeof dataError.errors === 'object') {
                    const fieldErrors = Object.entries(dataError.errors).map(([field, msgs]) => {
                        const m = Array.isArray(msgs) ? msgs.join(', ') : msgs
                        return `${field}: ${m}`
                    })
                    errorMsg = fieldErrors.join(' | ')
                } else if (typeof dataError === 'object') {
                    if (dataError.detail) {
                        errorMsg = dataError.detail
                    } else {
                        const fieldErrors = Object.entries(dataError).map(([field, msgs]) => {
                            if (field === 'message' || field === 'statusCode') return null
                            const m = Array.isArray(msgs) ? msgs.join(', ') : msgs
                            return `${field}: ${m}`
                        }).filter(Boolean)
                        if (fieldErrors.length > 0) {
                            errorMsg = fieldErrors.join(' | ')
                        }
                    }
                } else if (typeof dataError === 'string') {
                    errorMsg = dataError
                }
            }
            setErrors(prev => ({ ...prev, submit: errorMsg }))
        }
    }

    const alunosFiltrados = alunos.filter(a =>
        a.nome.toLowerCase().includes(buscaAluno.toLowerCase()) ||
        a.matricula.includes(buscaAluno)
    )

    const projetosFiltrados = projetos.filter((p) =>
        p.toLowerCase().includes(buscaProjeto.toLowerCase())
    )

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
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEdit ? "Edição de Equipe" : "Nova Equipe"}
                </h1>
                <p className="text-gray-500 text-sm">Organize os alunos e vincule projetos para acompanhamento do MVP.</p>
            </div>

            <main className="flex-1 w-full">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-8 space-y-8">
                        {/* Feedback de sucesso */}
                        {successMsg && (
                            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-1 rounded-full">
                                        <Save size={14} />
                                    </div>
                                    <span className="font-medium">{successMsg}</span>
                                </div>
                                <button onClick={() => setSuccessMsg("")} type="button" className="text-green-500 hover:text-green-700">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Seção 1: Identificação */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <Info size={18} />
                                <span>Identificação do Grupo</span>
                            </div>
                            <div className={`grid grid-cols-1 ${isEdit ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Nome da Equipe <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            placeholder="Ex: Alpha Team"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome}</p>}
                                </div>
                                {isEdit && (
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Código da Equipe</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData.codigo}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Tipo de MVP <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            name="mvp"
                                            value={formData.mvp}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.mvp ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] bg-white`}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Frontend">MVP Frontend</option>
                                            <option value="Backend">MVP Backend</option>
                                            <option value="Mobile">MVP Mobile</option>
                                        </select>
                                    </div>
                                    {errors.mvp && <p className="text-xs text-red-500 font-medium">{errors.mvp}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Calendário */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <Clock size={18} />
                                <span>Calendário Acadêmico</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Data de Criação <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="date"
                                            name="data"
                                            value={formData.data}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.data ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64]`}
                                        />
                                    </div>
                                    {errors.data && <p className="text-xs text-red-500 font-medium">{errors.data}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Ano Letivo <span className="text-gray-400 font-normal ml-1">(Derivado da data)</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            readOnly
                                            value={formData.data ? new Date(formData.data).getFullYear() : ''}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Período <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            name="periodo"
                                            value={formData.periodo}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.periodo ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] bg-white`}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value={"1\u00BA Semestre"}>1º Semestre</option>
                                            <option value={"2\u00BA Semestre"}>2º Semestre</option>
                                            <option value={"3\u00BA Semestre"}>3º Semestre</option>
                                            <option value={"4\u00BA Semestre"}>4º Semestre</option>
                                            <option value={"5\u00BA Semestre"}>5º Semestre</option>
                                        </select>
                                    </div>
                                    {errors.periodo && <p className="text-xs text-red-500 font-medium">{errors.periodo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Membros */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <UserPlus size={18} />
                                <span>Membros da Equipe</span>
                            </div>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Buscar aluno por nome ou matrícula..."
                                        value={buscaAluno}
                                        onChange={(e) => setBuscaAluno(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all"
                                    />
                                </div>

                                <div className={`border ${errors.alunos ? 'border-red-300 bg-red-50/30' : 'border-gray-200'} rounded-xl overflow-hidden`}>
                                    <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {alunos.length === 0 ? (
                                            <div className="col-span-2 py-8 text-center text-gray-400 flex flex-col items-center gap-2">
                                                <Users size={32} className="opacity-20" />
                                                <p className="text-sm">Nenhum aluno cadastrado no portal.</p>
                                            </div>
                                        ) : alunosFiltrados.length === 0 ? (
                                            <div className="col-span-2 py-8 text-center text-gray-400">
                                                <p className="text-sm">Nenhum aluno encontrado para a busca.</p>
                                            </div>
                                        ) : (
                                            alunosFiltrados.map(aluno => (
                                                <label key={aluno.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.alunos.includes(aluno.id)
                                                    ? 'border-[#006b64] bg-[#006b64]/5 shadow-sm'
                                                    : 'border-transparent hover:bg-gray-50'
                                                    }`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.alunos.includes(aluno.id)
                                                        ? 'bg-[#006b64] border-[#006b64]'
                                                        : 'border-gray-300 bg-white'
                                                        }`}>
                                                        {formData.alunos.includes(aluno.id) && <CheckCircle size={14} className="text-white" />}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only"
                                                        checked={formData.alunos.includes(aluno.id)}
                                                        onChange={() => handleAlunoToggle(aluno.id)}
                                                    />
                                                    <div>
                                                        <p className={`text-sm font-bold ${formData.alunos.includes(aluno.id) ? 'text-[#006b64]' : 'text-gray-700'}`}>{aluno.nome}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{aluno.matricula}</p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                                {errors.alunos && <p className="text-xs text-red-500 font-medium">{errors.alunos}</p>}
                            </div>
                        </div>

                        {/* Seção 4: Vínculos Externos */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <FolderOpen size={18} />
                                <span>Vínculos Externos</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1 relative" ref={dropdownRef}>
                                    <label className="block text-sm font-semibold text-gray-700">Projeto Vinculado <span className="text-gray-400 font-normal ml-1">(Opcional)</span></label>
                                    <button
                                        type="button"
                                        onClick={() => setDropdownAberto(!dropdownAberto)}
                                        className="w-full flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus:ring-2 focus:ring-[#006b64]/20 transition-all text-left"
                                    >
                                        <div className="p-3 border-r border-gray-100">
                                            <FolderOpen className="text-gray-400" size={16} />
                                        </div>
                                        <span className={`flex-1 px-4 py-2.5 text-sm ${formData.projeto ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                                            {formData.projeto || "Selecione um projeto..."}
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
                                                {formData.projeto && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, projeto: "" }))
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
                                                                setFormData(prev => ({ ...prev, projeto }))
                                                                setDropdownAberto(false)
                                                                setBuscaProjeto("")
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-all flex items-center justify-between ${formData.projeto === projeto ? "bg-[#006b64]/5 text-[#006b64] font-bold" : "text-gray-700"}`}
                                                        >
                                                            <span>{projeto}</span>
                                                            {formData.projeto === projeto && <CheckCircle size={14} />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Link do Repositório GitHub <span className="text-gray-400 font-normal ml-1">(Opcional)</span></label>
                                    <div className="relative">
                                        <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            value={formData.githubUrl}
                                            onChange={handleChange}
                                            placeholder="https://github.com/usuario/repo"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.githubUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.githubUrl && <p className="text-xs text-red-500 font-medium">{errors.githubUrl}</p>}
                                </div>

                                {formData.projeto && (
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Status do Projeto</label>
                                        <div className="relative">
                                            <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] bg-white text-sm font-medium ${formData.status === "Concluído" ? "text-green-600" : "text-blue-600"}`}
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
                            <Save size={18} className="mr-2" /> {isEdit ? "Salvar Alterações" : "Cadastrar Equipe"}
                        </Button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default CadastroGrupo

