import { Search } from "lucide-react"

function SearchInput({ value, onChange, placeholder, label }) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">
                    {label}
                </label>
            )}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 w-full">
                <div className="bg-[#006b64] p-2.5">
                    <Search className="text-white" size={16} />
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="flex-1 px-3 py-2 text-sm border-0 outline-none focus:ring-0 bg-white w-full"
                />
            </div>
        </div>
    )
}

export default SearchInput
