"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default function Admin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setErro("");

    if (!email || !senha) {
      setErro("Digite o e-mail e a senha.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro("E-mail ou senha incorretos.");
        return;
      }

      // Depois do login, vai para o painel
      window.location.href = "/admin/painel";
    } catch (error) {
      console.error(error);
      setErro("Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[90vh] w-full max-w-md flex-col justify-center">

        {/* LOGO */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-amber-500/40 bg-zinc-900">
            <img
              src="/logo.png"
              alt="Sousa Barbearia"
              className="h-full w-full object-contain p-2"
            />
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-widest">
            SOUSA
          </h1>

          <h2 className="text-2xl font-black tracking-widest text-amber-500">
            BARBEARIA
          </h2>

          <p className="mt-3 text-sm text-zinc-500">
            Painel administrativo
          </p>
        </div>

        {/* LOGIN */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl">

          <h2 className="text-xl font-black">
            Acesso administrativo
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Entre para acessar o painel da barbearia.
          </p>

          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-4"
          >

            {/* E-MAIL */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              autoComplete="email"
              className="w-full rounded-xl border border-zinc-800 bg-black/50 p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
            />

            {/* SENHA */}
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              className="w-full rounded-xl border border-zinc-800 bg-black/50 p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
            />

            {/* ERRO */}
            {erro && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
                {erro}
              </div>
            )}

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 py-4 text-sm font-black tracking-widest text-black transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
            </button>

          </form>
        </section>

        <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-zinc-700">
          Sousa Barbearia • Área restrita
        </p>

      </div>
    </main>
  );
}