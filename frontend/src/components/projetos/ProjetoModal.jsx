import { X, LayoutGrid, Calendar, Layers, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"

function ProjetoModal({ projeto, onClose, onEdit }) {
    if (!projeto) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#006b64] px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <LayoutGrid size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight">{projeto.nome}</h2>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Detalhes do Projeto</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Status e Info Rápida */}
                    <div className="flex flex-wrap gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                            projeto.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {projeto.status === 'Ativo' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {projeto.status.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            <Layers size={14} />
                            {projeto.mvp.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                            <Calendar size={14} />
                            ANO {projeto.ano}
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-800 font-bold border-b border-gray-100 pb-2">
                            <FileText size={18} className="text-[#006b64]" />
                            <span>Descrição do Projeto</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {projeto.descricao}
                        </p>
                    </div>

                    {/* Requisitos */}
                    {projeto.requisitos && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-800 font-bold border-b border-gray-100 pb-2">
                                <CheckCircle2 size={18} className="text-[#006b64]" />
                                <span>Requisitos e Critérios</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                    {projeto.requisitos}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-6 flex justify-end gap-3 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose} className="px-6 py-2 text-gray-600 border-gray-300">
                        Fechar
                    </Button>
                    <Button 
                        onClick={() => {
                            onEdit(projeto.id)
                            onClose()
                        }}
                        className="px-6 py-2 bg-[#006b64] hover:bg-[#00524d] text-white font-bold"
                    >
                        Editar Projeto
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProjetoModal
