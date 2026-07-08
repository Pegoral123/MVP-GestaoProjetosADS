import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import GrupoCard from "./GrupoCard"

const ITEMS_PER_PAGE = 3

function SectionList({ title, items, icon, onCardClick, onStatusChange }) {
    const [paginaAtual, setPaginaAtual] = useState(1)

    const totalPaginas = Math.ceil(items.length / ITEMS_PER_PAGE)
    const inicio = (paginaAtual - 1) * ITEMS_PER_PAGE
    const fim = inicio + ITEMS_PER_PAGE
    const itensPagina = items.slice(inicio, fim)
    const restantesProxPagina = items.length - fim

    useEffect(() => {
        setPaginaAtual(1)
    }, [items.length])

    const irParaPagina = (pag) => {
        if (pag >= 1 && pag <= totalPaginas) {
            setPaginaAtual(pag)
        }
    }

    const getPaginasVisiveis = () => {
        if (totalPaginas <= 5) {
            return Array.from({ length: totalPaginas }, (_, i) => i + 1)
        }
        const pages = new Set([1, totalPaginas, paginaAtual])
        if (paginaAtual > 1) pages.add(paginaAtual - 1)
        if (paginaAtual < totalPaginas) pages.add(paginaAtual + 1)
        return Array.from(pages).sort((a, b) => a - b)
    }

    return (
        <div className="mb-10">
            {/* Cabeçalho da seção */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                {icon}
                <h2 className="text-xl font-bold text-gray-700">{title}</h2>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full ml-2">
                    {items.length} {items.length === 1 ? "grupo" : "grupos"}
                </span>
            </div>

            {items.length === 0 ? (
                <div className="text-gray-400 text-sm italic py-4">Nenhum grupo encontrado nesta categoria.</div>
            ) : (
                <>
                    {/* Grid de cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {itensPagina.map(g => (
                            <GrupoCard
                                key={g.id}
                                grupo={g}
                                onClick={() => onCardClick(g)}
                                onStatusChange={onStatusChange}
                            />
                        ))}

                        {/* "ghost" mostrando quantos restam na próxima página */}
                        {restantesProxPagina > 0 && itensPagina.length === ITEMS_PER_PAGE && (
                            <div
                                onClick={() => irParaPagina(paginaAtual + 1)}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all group"
                            >
                                <span className="text-gray-400 text-sm font-medium group-hover:text-gray-600 transition-colors">
                                    +{restantesProxPagina} {restantesProxPagina === 1 ? "grupo" : "grupos"} na próxima página
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Controles de paginação */}
                    {totalPaginas > 1 && (
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <span className="text-xs text-gray-400 mr-2">
                                pág. {paginaAtual} de {totalPaginas}
                            </span>

                            {/* Botão anterior */}
                            <button
                                onClick={() => irParaPagina(paginaAtual - 1)}
                                disabled={paginaAtual === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Números de página */}
                            {getPaginasVisiveis().map((pag, idx, arr) => (
                                <span key={pag} className="flex items-center gap-1">
                                    {idx > 0 && arr[idx - 1] !== pag - 1 && (
                                        <span className="text-gray-400 text-xs px-1">…</span>
                                    )}
                                    <button
                                        onClick={() => irParaPagina(pag)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold border transition-all ${pag === paginaAtual
                                            ? "bg-[#006b64] text-white border-[#006b64] shadow-sm"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {pag}
                                    </button>
                                </span>
                            ))}

                            {/* Botão próximo */}
                            <button
                                onClick={() => irParaPagina(paginaAtual + 1)}
                                disabled={paginaAtual === totalPaginas}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default SectionList
