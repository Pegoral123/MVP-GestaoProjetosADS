import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, X, LayoutGrid, FileText, Calendar, Loader2, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { buscarProjeto, criarProjeto, atualizarProjeto } from "../services/projetoService"

const MVP_OPTIONS = ["Frontend", "Backend", "Mobile"]

function ProjetoForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        mvp: "Frontend",
        ano: new Date().getFullYear().toString(),
        requisitos: "",
        status: "Ativo",
    })

    const [errors, setErrors] = useState({})
    const [loadingDados, setLoadingDados] = useState(isEdit)
    const [salvando, setSalvando] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    useEffect(() => {
        if (!isEdit) return

        const fetchProjeto = async () => {
            setLoadingDados(true)
            try {
                const projeto = await buscarProjeto(id)
                setFormData({
                    nome: projeto.nome || "",
                    descricao: projeto.descricao || "",
                    mvp: projeto.mvp || "Frontend",
                    ano: projeto.ano || new Date().getFullYear().toString(),
                    requisitos: projeto.requisitos || "",
                    status: projeto.status || "Ativo",
                })
            } catch (err) {
                console.error("Erro ao buscar projeto:", err)
                setErrorMsg("Não foi possível carregar os dados do projeto.")
            } finally {
                setLoadingDados(false)
            }
        }

        fetchProjeto()
    }, [id, isEdit])

    const validate = () => {
        const newErrors = {}
        if (!formData.nome.trim()) newErrors.nome = "O nome é obrigatório."
        if (!formData.descricao.trim()) newErrors.descricao = "A descrição é obrigatória."
        if (!formData.ano) newErrors.ano = "O ano é obrigatório."
        if (!formData.mvp) newErrors.mvp = "Selecione o tipo de MVP."
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        const payload = {
            nome: formData.nome.trim(),
            descricao: formData.descricao.trim(),
            mvp: formData.mvp,
            ano: String(formData.ano),
            status: formData.status,
            requisitos: formData.requisitos.trim() || null,
        }

        const salvar = async () => {
            setSalvando(true)
            setErrorMsg("")
            try {
                if (isEdit) {
                    await atualizarProjeto(id, payload)
                } else {
                    await criarProjeto(payload)
                }
                navigate("/projetos")
            } catch (err) {
                console.error("Erro ao salvar projeto:", err)
                const detail = err?.response?.data
                if (detail && typeof detail === "object") {
                    const apiErrors = {}
                    Object.entries(detail).forEach(([campo, msgs]) => {
                        apiErrors[campo] = Array.isArray(msgs) ? msgs.join(" ") : String(msgs)
                    })
                    setErrors(apiErrors)
                    setErrorMsg("Corrija os erros abaixo e tente novamente.")
                } else {
                    setErrorMsg("Erro ao salvar o projeto. Verifique sua conexão e tente novamente.")
                }
            } finally {
                setSalvando(false)
            }
        }

        salvar()
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    if (loadingDados) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#006b64]/20 border-t-[#006b64] rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Carregando dados do projeto...</p>
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
                    onClick={() => navigate("/projetos")}
                    className="text-gray-500 hover:text-[#006b64] hover:bg-[#006b64]/10 mb-4 px-2"
                    type="button"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Voltar para Projetos
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEdit ? "Edição de Projeto" : "Novo Projeto"}
                </h1>
                <p className="text-gray-500 text-sm">Defina os objetivos e requisitos técnicos para os alunos.</p>
            </div>

            <main className="flex-1 w-full">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 space-y-8">

                        {/* Erro geral */}
                        {errorMsg && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>{errorMsg}</span>
                                <button type="button" onClick={() => setErrorMsg("")} className="ml-auto text-red-400 hover:text-red-600">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Seção 1: Identificação */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <LayoutGrid size={18} />
                                <span>Identificação do Projeto</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nome */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Nome do Projeto <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        maxLength={150}
                                        placeholder="Ex: Sistema de Gestão Acadêmica"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.nome ? "border-red-500 bg-red-50" : "border-gray-300"} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                    />
                                    {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome}</p>}
                                </div>

                                {/* Ano + Status */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Ano Letivo <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="number"
                                                name="ano"
                                                value={formData.ano}
                                                onChange={handleChange}
                                                min="2020"
                                                max="2099"
                                                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.ano ? "border-red-500 bg-red-50" : "border-gray-300"} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64]`}
                                            />
                                        </div>
                                        {errors.ano && <p className="text-xs text-red-500 font-medium">{errors.ano}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">
                                            Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] bg-white"
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Descrição e MVP */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <FileText size={18} />
                                <span>Descrição e Objetivos</span>
                            </div>
                            <div className="space-y-6">
                                {/* Descrição */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Descrição Detalhada <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="descricao"
                                        rows={4}
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        placeholder="Descreva o que os alunos deverão desenvolver neste projeto..."
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.descricao ? "border-red-500 bg-red-50" : "border-gray-300"} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all resize-none`}
                                    />
                                    {errors.descricao && <p className="text-xs text-red-500 font-medium">{errors.descricao}</p>}
                                </div>

                                {/* Tipo MVP */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Tipo de MVP <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        {MVP_OPTIONS.map(type => (
                                            <label key={type} className="flex-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="mvp"
                                                    value={type}
                                                    checked={formData.mvp === type}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className="text-center py-2.5 rounded-lg border border-gray-200 peer-checked:border-[#006b64] peer-checked:bg-[#006b64]/5 peer-checked:text-[#006b64] font-semibold text-sm transition-all hover:bg-gray-50">
                                                    {type}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.mvp && <p className="text-xs text-red-500 font-medium">{errors.mvp}</p>}
                                </div>

                                {/* Requisitos */}
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Requisitos / Critérios de Avaliação{" "}
                                        <span className="text-gray-400 font-normal">(Opcional)</span>
                                    </label>
                                    <textarea
                                        name="requisitos"
                                        rows={3}
                                        value={formData.requisitos}
                                        onChange={handleChange}
                                        placeholder="Critérios técnicos, ferramentas obrigatórias, etc..."
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rodapé */}
                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/projetos")}
                            disabled={salvando}
                            className="w-full sm:w-auto px-8 py-2.5 text-gray-600 border-gray-300 hover:bg-white"
                        >
                            <X size={18} className="mr-2" /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={salvando}
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#006b64] hover:bg-[#00524d] text-white font-bold shadow-md shadow-[#006b64]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {salvando ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    {isEdit ? "Salvando..." : "Cadastrando..."}
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    {isEdit ? "Salvar Alterações" : "Cadastrar Projeto"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default ProjetoForm
