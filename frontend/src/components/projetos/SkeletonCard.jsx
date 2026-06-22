function SkeletonCard() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
            <div className="h-6 bg-gray-100 rounded w-20 mt-2"></div>
        </div>
    )
}

export default SkeletonCard
