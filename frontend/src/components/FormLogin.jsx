import { useRef, useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { LockKeyhole, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"

function FormLogin() {
    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)
        try {
            await login(emailRef.current.value, passwordRef.current.value)
        } catch (err) {
            setError("Falha ao fazer login. Verifique suas credenciais.")
        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="flex flex-col items-center justify-center p-4 bg-[#006b64] max-w-80 rounded-md animate-slide-down">
            <h1 className="text-2xl font-light text-white uppercase mb-4 mt-0"> Gestão de Projetos </h1>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">

                <div className="flex items-center bg-white rounded-md overflow-hidden">
                    <div className="bg-[rgba(0,134,117)] p-3">
                        <User className="text-white block" />

                    </div>
                    <Input type="text" id="email" name="email" placeholder="Digite seu usuário/email" ref={emailRef} className="flex-1 px-3 py-2 outline-none text-sm" />
                </div>

                <div className="flex items-center bg-white rounded-md overflow-hidden">
                    <div className="bg-[rgba(0,134,117)] p-3 ">
                        <LockKeyhole className="text-white block " />
                    </div>

                    <Input type="password" id="password" name="password" placeholder="Digite sua senha" ref={passwordRef} className="flex-1 px-3 py-2 outline-none text-sm" />
                </div>
                {error && <p className="text-red-300 text-xs text-center">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full mt-2 tracking-widest ">
                    {loading ? "CARREGANDO..." : "ACESSAR"}
                </Button>
            </form>
        </div>
    )
}

export default FormLogin