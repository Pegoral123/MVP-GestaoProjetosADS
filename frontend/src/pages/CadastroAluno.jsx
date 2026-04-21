import { useRef, useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { ArrowLeft, UserPlus, X, Phone, Mail, Hash, User } from "lucide-react"

function CadastroAluno() {
    const navigate = useNavigate()
    const { id } = useParams()

    const matriculaRef = useRef(null)
    const nomeRef = useRef(null)
    const emailRef = useRef(null)
    const celularRef = useRef(null)

    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState("")

    useEffect(() => {
        if (id) {
            const stored = localStorage.getItem("alunos_mock")
            if (stored) {
                const alunosMock = JSON.parse(stored)
                const alunoEdit = alunosMock.find((a) => a.id.toString() === id)
                if (alunoEdit) {
                    if (matriculaRef.current) matriculaRef.current.value = alunoEdit.matricula || ""
                    if (nomeRef.current) nomeRef.current.value = alunoEdit.nome || ""
                    if (emailRef.current) emailRef.current.value = alunoEdit.email || ""
                    if (celularRef.current) celularRef.current.value = alunoEdit.celular || ""
                }
            }
        }
    }, [id])

    const validate = () => {
        const newErrors = {}
        const matricula = matriculaRef.current?.value.trim()
        const nome = nomeRef.current?.value.trim()
        const email = emailRef.current?.value.trim()
        const celular = celularRef.current?.value.trim()

        if (!matricula) newErrors.matricula = "Matrícula é obrigatória."
        if (!nome) newErrors.nome = "Nome completo é obrigatório."
        if (!email) {
            newErrors.email = "E-mail é obrigatório."
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "E-mail inválido."
        }
        if (!celular) {
            newErrors.celular = "Celular é obrigatório."
        } else if (!/^\(?\d{2}\)?[\s-]?9?\d{4}[\s-]?\d{4}$/.test(celular)) {
            newErrors.celular = "Número inválido. Ex: (22) 99999-1234"
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

        // TODO: integrar com a API do backend aqui
        const payload = {
            id: Date.now(), // ID gerado aleatoriamente para o mock
            matricula: matriculaRef.current.value.trim(),
            nome: nomeRef.current.value.trim(),
            email: emailRef.current.value.trim(),
            celular: celularRef.current.value.trim(),
        }

        // Salvando no localStorage para teste
        const stored = localStorage.getItem("alunos_mock")
        let alunosMock = []
        if (stored) {
            alunosMock = JSON.parse(stored)
        }

        if (id) {
            payload.id = parseInt(id)
            const index = alunosMock.findIndex((a) => a.id.toString() === id)
            if (index !== -1) {
                alunosMock[index] = payload
            }
            console.log("Aluno a editar:", payload)
            setSuccessMsg(`Aluno "${payload.nome}" atualizado com sucesso!`)
        } else {
            alunosMock.push(payload)
            console.log("Aluno a cadastrar:", payload)
            setSuccessMsg(`Aluno "${payload.nome}" cadastrado com sucesso!`)
        }

        localStorage.setItem("alunos_mock", JSON.stringify(alunosMock))
        setTimeout(() => {
            navigate("/alunos")
        }, 1500)
    }

    const handleCancel = () => {
        navigate("/alunos")
    }

    const handleVoltar = () => {
        navigate("/alunos")
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col ">
            {/* Header */}
            <header className="bg-[#006b64] text-white px-6 py-4 shadow-md">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVoltar}
                        className="text-white/80 hover:text-white hover:bg-white/20 px-2"
                        type="button"
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Voltar
                    </Button>
                    <div className="h-5 w-px bg-white/30 mx-1" />
                    <h1 className="text-lg font-semibold tracking-wide">
                        {id ? "Editar Aluno" : "Cadastro de Aluno"}
                    </h1>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">

                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#006b64] p-2 rounded-lg">
                            <UserPlus className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{id ? "Editar Aluno" : "Novo Aluno"}</h2>
                            <p className="text-sm text-gray-500">{id ? "Altere os dados do aluno abaixo" : "Preencha os dados do aluno abaixo"}</p>
                        </div>
                    </div>

                    {/* Feedback de sucesso */}
                    {successMsg && (
                        <div className="mb-5 bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                            <span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg("")} type="button">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                        {/* Matrícula */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Matrícula <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64] transition-all">
                                <div className="bg-[#006b64] p-3">
                                    <Hash className="text-white" size={18} />
                                </div>
                                <Input
                                    type="text"
                                    id="matricula"
                                    placeholder="Ex: 2024001234"
                                    ref={matriculaRef}
                                    className="flex-1 border-0 shadow-none focus:ring-0 focus:border-0"
                                />
                            </div>
                            {errors.matricula && (
                                <p className="text-red-500 text-xs mt-1">{errors.matricula}</p>
                            )}
                        </div>

                        {/* Nome Completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome Completo <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64] transition-all">
                                <div className="bg-[#006b64] p-3">
                                    <User className="text-white" size={18} />
                                </div>
                                <Input
                                    type="text"
                                    id="nome"
                                    placeholder="Ex: João da Silva"
                                    ref={nomeRef}
                                    className="flex-1 border-0 shadow-none focus:ring-0 focus:border-0"
                                />
                            </div>
                            {errors.nome && (
                                <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                            )}
                        </div>

                        {/* E-mail */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                E-mail <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64] transition-all">
                                <div className="bg-[#006b64] p-3">
                                    <Mail className="text-white" size={18} />
                                </div>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Ex: joao@unifeso.edu.br"
                                    ref={emailRef}
                                    className="flex-1 border-0 shadow-none focus:ring-0 focus:border-0"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Celular / WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Celular (WhatsApp) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 focus-within:border-[#006b64] transition-all">
                                <div className="bg-[#006b64] p-3">
                                    <Phone className="text-white" size={18} />
                                </div>
                                <Input
                                    type="tel"
                                    id="celular"
                                    placeholder="Ex: (22) 99999-1234"
                                    ref={celularRef}
                                    className="flex-1 border-0 shadow-none focus:ring-0 focus:border-0"
                                />
                            </div>
                            {errors.celular && (
                                <p className="text-red-500 text-xs mt-1">{errors.celular}</p>
                            )}
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-100"
                                onClick={handleCancel}
                            >
                                <X size={16} className="mr-1" />
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-[#006b64] hover:bg-[#005950] text-white tracking-wide"
                            >
                                <UserPlus size={16} className="mr-1" />
                                {id ? "Salvar" : "Cadastrar"}
                            </Button>
                        </div>

                    </form>
                </div>
            </main>
        </section>
    )
}

export default CadastroAluno
