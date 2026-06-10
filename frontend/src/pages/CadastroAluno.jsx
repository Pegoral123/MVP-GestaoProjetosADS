import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ArrowLeft, UserPlus, X, Phone, Mail, Hash, User, Save, Contact } from "lucide-react"
import api from "../services/api"

function CadastroAluno() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [formData, setFormData] = useState({
        matricula: "",
        nome: "",
        email: "",
        celular: ""
    })

    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState("")

    useEffect(() => {
        if (isEdit) {
            const fetchAluno = async () => {
                try {
                    const response = await api.get(`/alunos/${id}/`);
                    let alunoEdit = response.data;
                    if (response.data && response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
                        alunoEdit = response.data.data;
                    } else if (response.data && response.data.aluno) {
                        alunoEdit = response.data.aluno;
                    }
                    if (Array.isArray(alunoEdit) && alunoEdit.length > 0) {
                        alunoEdit = alunoEdit[0];
                    }

                    setFormData({
                        matricula: alunoEdit.matricula || "",
                        nome: alunoEdit.nome || "",
                        email: alunoEdit.email || "",
                        celular: alunoEdit.celular || ""
                    });
                } catch (error) {
                    console.error("Erro ao buscar aluno", error);
                }
            };
            fetchAluno();
        }
    }, [id, isEdit])

    const validate = () => {
        const newErrors = {}
        if (!formData.matricula.trim()) newErrors.matricula = "Matrícula é obrigatória."
        if (!formData.nome.trim()) newErrors.nome = "Nome completo é obrigatório."
        if (!formData.email.trim()) {
            newErrors.email = "E-mail é obrigatório."
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "E-mail inválido."
        }
        if (formData.celular && !/^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/.test(formData.celular)) {
            newErrors.celular = "Número inválido. Ex: (22) 99999-1234"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        try {
            if (isEdit) {
                await api.patch(`/alunos/${id}/`, formData)
                setSuccessMsg(`Aluno "${formData.nome}" atualizado com sucesso!`)
            } else {
                await api.post('/alunos/', formData)
                setSuccessMsg(`Aluno "${formData.nome}" cadastrado com sucesso!`)
            }

            setTimeout(() => {
                navigate("/alunos")
            }, 1500)
        } catch (error) {
            console.error("Erro ao salvar aluno", error);
            let msgs = "Ocorreu um erro ao salvar o aluno.";
            if (error.response?.data) {
                const data = error.response.data;
                if (data.errors) {
                    msgs = Object.entries(data.errors)
                        .map(([campo, erros]) => `${campo}: ${Array.isArray(erros) ? erros.join(", ") : erros}`)
                        .join("\n");
                } else if (data.message) {
                    msgs = data.message;
                } else if (data.detail) {
                    msgs = data.detail;
                } else if (typeof data === 'string') {
                    msgs = data;
                } else {
                    msgs = Object.entries(data)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : JSON.stringify(v)}`)
                        .join("\n");
                }
            }
            alert(`Erro:\n${msgs}`);
        }
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/alunos")}
                    className="text-gray-500 hover:text-[#006b64] hover:bg-[#006b64]/10 mb-4 px-2"
                    type="button"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Voltar para Listagem
                </Button>
                <h1 className="text-2xl font-bold text-gray-800">
                    {isEdit ? "Edição de Aluno" : "Novo Aluno"}
                </h1>
                <p className="text-gray-500 text-sm">Preencha as informações do estudante para manter a base atualizada.</p>
            </div>

            <main className="flex-1 w-full">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-[#006b64] font-bold border-b border-gray-100 pb-2">
                                <Contact size={18} />
                                <span>Informações Pessoais</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Matrícula <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            name="matricula"
                                            value={formData.matricula}
                                            onChange={handleChange}
                                            placeholder="Ex: 2024001234"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.matricula ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.matricula && <p className="text-xs text-red-500 font-medium">{errors.matricula}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Nome Completo <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            placeholder="Ex: João da Silva"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.nome && <p className="text-xs text-red-500 font-medium">{errors.nome}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">E-mail Acadêmico <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Ex: joao@unifeso.edu.br"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">Celular (WhatsApp) <span className="text-gray-400 font-normal ml-1">(Opcional)</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="tel"
                                            name="celular"
                                            value={formData.celular}
                                            onChange={handleChange}
                                            placeholder="Ex: (22) 99999-1234"
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.celular ? 'border-red-500 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-[#006b64]/20 focus:border-[#006b64] transition-all`}
                                        />
                                    </div>
                                    {errors.celular && <p className="text-xs text-red-500 font-medium">{errors.celular}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/alunos")}
                            className="w-full sm:w-auto px-8 py-2.5 text-gray-600 border-gray-300 hover:bg-white"
                        >
                            <X size={18} className="mr-2" /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto px-8 py-2.5 bg-[#006b64] hover:bg-[#00524d] text-white font-bold shadow-md shadow-[#006b64]/20"
                        >
                            <Save size={18} className="mr-2" /> {isEdit ? "Salvar Alterações" : "Cadastrar Aluno"}
                        </Button>
                    </div>
                </form>
            </main>
        </section>
    )
}

export default CadastroAluno