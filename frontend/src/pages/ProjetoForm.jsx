import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, X, LayoutGrid, FileText, Calendar, Layers, CheckCircle2 } from "lucide-react"
import { Button } from "../components/ui/button"

function ProjetoForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [formData, setFormData] = useState({
        nome: "",
        descricao: "",
        mvp: "Front-end",
        ano: new Date().getFullYear().toString(),
        requisitos: "",
        status: "Ativo"
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (isEdit) {
            const stored = localStorage.getItem("projetos_mock")
            if (stored) {
                const projetos = JSON.parse(stored)
                const projeto = projetos.find(p => p.id === parseInt(id))
                if (projeto) {
                    setFormData(projeto)
                }
            }
        }
    }, [id, isEdit])

    const validate = () => {
        const newErrors = {}
        if (!formData.nome.trim()) newErrors.nome = "O nome é obrigatório"
        if (!formData.descricao.trim()) newErrors.descricao = "A descrição é obrigatória"
        if (!formData.ano) newErrors.ano = "O ano é obrigatório"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        const stored = localStorage.getItem("projetos_mock")
        let projetos = stored ? JSON.parse(stored) : []

        if (isEdit) {
            projetos = projetos.map(p => p.id === parseInt(id) ? { ...formData, id: parseInt(id) } : p)
        } else {
            const newProject = {
                ...formData,
                id: projetos.length > 0 ? Math.max(...projetos.map(p => p.id)) + 1 : 1
            }
            projetos.push(newProject)
        }

        localStorage.setItem("projetos_mock", JSON.stringify(projetos))
        navigate("/projetos")
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
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
                        {/* Seção 1: Identificação */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <LayoutGrid size={18} />
                                <span>Identificação do Projeto</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Nome do Projeto <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="nome"
                                        value={formData.nome}
                                        onChange={handleChange}
                                        placeholder="Ex: Sistema de Gestão Acadêmica"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                    />
                                    {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Ano Letivo <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="number"
                                                name="ano"
                                                value={formData.ano}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Status <span className="text-red-500">*</span></label>
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

                        {/* Seção 2: Detalhes */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <FileText size={18} />
                                <span>Descrição e Objetivos</span>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Descrição Detalhada <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="descricao"
                                        rows={4}
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        placeholder="Descreva o que os alunos deverão desenvolver neste projeto..."
                                        className={`w-full px-4 py-3 rounded-lg border ${errors.descricao ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all resize-none`}
                                    />
                                    {errors.descricao && <p className="text-xs text-red-500 font-medium">{errors.descricao}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-sm font-semibold text-gray-700">Tipo de MVP <span className="text-red-500">*</span></label>
                                        <div className="flex gap-4">
                                            {["Front-end", "Back-end", "Mobile"].map(type => (
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
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Requisitos / Critérios de Avaliação (Opcional)</label>
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

                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/projetos")}
                            className="w-full sm:w-auto px-8 py-2.5 text-gray-600 border-gray-300 hover:bg-white"
                        >
                            <X size={18} className="mr-2" /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#006b64] hover:bg-[#00524d] text-white font-bold shadow-md shadow-[#006b64]/20"
                        >
                            <Save size={18} className="mr-2" /> {isEdit ? "Salvar Alterações" : "Cadastrar Projeto"}
                        </Button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default ProjetoForm
