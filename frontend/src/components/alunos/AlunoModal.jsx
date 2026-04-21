import { useState, useEffect } from "react"
import { X, Mail, Phone, Hash, Edit, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

function AlunoModal({ aluno, onClose, onDelete }) {
    const navigate = useNavigate()
    const [isConfirming, setIsConfirming] = useState(false)

    useEffect(() => {
        if (!aluno) {
            setIsConfirming(false)
        }
    }, [aluno])

    if (!aluno) return null

    const abrirWhatsApp = () => {
        const numero = aluno.celular.replace(/\D/g, "")
        const numeroComDDI = numero.startsWith("55") ? numero : `55${numero}`
        window.open(`https://wa.me/${numeroComDDI}`, "_blank")
    }

    const iniciais = aluno.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")

    if (isConfirming) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={() => setIsConfirming(false)}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4 text-center animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mx-auto bg-red-50 p-4 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Excluir Aluno?</h2>
                    <p className="text-gray-500 text-sm">
                        Tem certeza que deseja excluir <strong>{aluno.nome}</strong>? Esta ação não poderá ser desfeita.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => setIsConfirming(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
                            onClick={() => {
                                setIsConfirming(false)
                                if (onDelete) onDelete(aluno.id)
                            }}
                        >
                            Sim, excluir
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        /* Overlay */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Card do modal */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className="bg-[#006b64] px-6 pt-6 pb-10 relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-full w-14 h-14 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">{iniciais}</span>
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg leading-tight">{aluno.nome}</h2>
                            <div className="flex items-center gap-1 text-white/70 text-xs mt-0.5">
                                <Hash size={11} />
                                <span>{aluno.matricula}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors cursor-pointer"
                        type="button"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="-mt-6 bg-white rounded-t-2xl px-6 pt-6 pb-6 flex flex-col gap-4">
                    {/* E-mail */}
                    <a
                        href={`mailto:${aluno.email}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="bg-[#006b64]/10 p-2 rounded-lg ">
                            <Mail size={18} className="text-[#006b64]" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">E-mail</p>
                            <p className="text-sm text-gray-700 group-hover:text-[#006b64] transition-colors">
                                {aluno.email}
                            </p>
                        </div>
                    </a>

                    {/* WhatsApp */}
                    <button
                        onClick={abrirWhatsApp}
                        type="button"
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-colors group w-full text-left cursor-pointer"
                    >
                        <div className="bg-green-50 p-2 rounded-lg group-hover:bg-green-100 transition-colors">
                            <Phone size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">WhatsApp</p>
                            <p className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                                {aluno.celular}
                            </p>
                        </div>
                    </button>

                    {/* Ações */}
                    <div className="flex gap-3 mt-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            onClick={() => {
                                setIsConfirming(true)
                            }}
                        >
                            <Trash2 size={16} className="mr-2" />
                            Excluir
                        </Button>
                        <Button
                            className="flex-1 bg-[#006b64] hover:bg-[#005a54] text-white border-transparent"
                            onClick={() => {
                                onClose()
                                navigate(`/alunos/editar/${aluno.id}`)
                            }}
                        >
                            <Edit size={16} className="mr-2" />
                            Editar
                        </Button>
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={onClose}
                        type="button"
                        className="mt-1 w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AlunoModal
