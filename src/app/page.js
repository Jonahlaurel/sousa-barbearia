"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// =====================================================
// SUPABASE
// =====================================================

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// =====================================================
// BARBEIROS
// =====================================================

const BARBEIROS = [
  {
    id: "Sousa",
    nome: "Barbeiro Sousa",
    foto: "/sousa/sousa.jpeg",
  },
  {
    id: "Jonas",
    nome: "Barbeiro Jonas",
    foto: "/jonas/jonas.jpeg",
  },
];

// =====================================================
// HORÁRIOS
// =====================================================

const HORARIOS_SEMANA = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "19:30",
];

const HORARIOS_DOMINGO = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "11:30",
];

// =====================================================
// SERVIÇOS
// =====================================================

const SERVICOS = [
  ["Corte", "R$ 20,00", "✂️"],
  ["Barba", "R$ 10,00", "🧔"],
  ["Corte e Barba", "R$ 30,00", "🔥"],
  ["Sobrancelha", "R$ 10,00", "✨"],
  ["Combo - Corte, Barba e Sobrancelha", "R$ 35,00", "👑"],
  ["Luzes", "R$ 80,00", "💈"],
  ["Progressiva", "R$ 80,00", "💇"],
  ["Pigmentação Cabelo", "R$ 20,00", "🎨"],
  ["Pigmentação Barba", "R$ 20,00", "🎨"],
  ["Risco", "A partir de R$ 05,00", "⚡"],
  ["Hidratação e Escova", "R$ 20,00", "💧"],
  ["Corte Feminino", "R$ 50,00", "💇‍♀️"],
];

export default function Home() {
  // ===================================================
  // DADOS DO CLIENTE
  // ===================================================

  const [Nome, setNome] = useState("");
  const [Telefone, setTelefone] = useState("");

  // ===================================================
  // SERVIÇOS
  // ===================================================

  const [Serviços, setServiços] = useState([]);

  // ===================================================
  // AGENDAMENTO
  // ===================================================

  const [Colaborador, setColaborador] = useState("");
  const [Data, setData] = useState("");
  const [Horário, setHorário] = useState("");

  // ===================================================
  // ESTADOS
  // ===================================================

  const [horariosOcupados, setHorariosOcupados] =
    useState([]);

  const [carregando, setCarregando] =
    useState(false);

  const [
    horariosDisponiveisDoDia,
    setHorariosDisponiveisDoDia,
  ] = useState(HORARIOS_SEMANA);

  // =====================================================
  // ALTERAR HORÁRIOS CONFORME O DIA
  // =====================================================

  useEffect(() => {
    if (!Data) {
      setHorariosDisponiveisDoDia(
        HORARIOS_SEMANA
      );
      setHorário("");
      return;
    }

    const dataSelecionada =
      new Date(`${Data}T12:00:00`);

    const diaDaSemana =
      dataSelecionada.getDay();

    if (diaDaSemana === 0) {
      setHorariosDisponiveisDoDia(
        HORARIOS_DOMINGO
      );
    } else {
      setHorariosDisponiveisDoDia(
        HORARIOS_SEMANA
      );
    }

    setHorário("");
  }, [Data]);

  // =====================================================
  // BUSCAR HORÁRIOS OCUPADOS
  // =====================================================

  useEffect(() => {
    async function buscarHorariosOcupados() {
      if (!Data || !Colaborador) {
        setHorariosOcupados([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("Agendamentos")
          .select("Horário")
          .eq("Data", Data)
          .eq("Colaborador", Colaborador);

        if (error) {
          console.error(
            "Erro ao buscar horários:",
            error
          );

          setHorariosOcupados([]);
          return;
        }

        if (data) {
          setHorariosOcupados(
            data
              .map((item) => item["Horário"])
              .filter(Boolean)
          );
        }
      } catch (err) {
        console.error(
          "Erro ao buscar horários ocupados:",
          err
        );

        setHorariosOcupados([]);
      }
    }

    buscarHorariosOcupados();
  }, [Data, Colaborador]);

  // =====================================================
  // SELECIONAR / DESSELECIONAR SERVIÇO
  // =====================================================

  const selecionarServico = (valor) => {
    setServiços((servicosAtuais) => {
      if (servicosAtuais.includes(valor)) {
        return servicosAtuais.filter(
          (servico) => servico !== valor
        );
      }

      return [
        ...servicosAtuais,
        valor,
      ];
    });
  };

  // =====================================================
  // ATUALIZAR HORÁRIOS
  // =====================================================

  const atualizarHorariosOcupados =
    async () => {
      if (!Data || !Colaborador) {
        return;
      }

      try {
        const { data, error } =
          await supabase
            .from("Agendamentos")
            .select("Horário")
            .eq("Data", Data)
            .eq(
              "Colaborador",
              Colaborador
            );

        if (error) {
          console.error(
            "Erro ao atualizar horários:",
            error
          );

          return;
        }

        if (data) {
          setHorariosOcupados(
            data
              .map(
                (item) =>
                  item["Horário"]
              )
              .filter(Boolean)
          );
        }
      } catch (err) {
        console.error(
          "Erro ao atualizar horários:",
          err
        );
      }
    };

  // =====================================================
  // AGENDAR
  // =====================================================

  const agendar = async (e) => {
    e.preventDefault();

    // ===================================================
    // VALIDAÇÕES
    // ===================================================

    if (!Nome.trim()) {
      alert("Informe seu nome.");
      return;
    }

    if (!Telefone.trim()) {
      alert("Informe seu WhatsApp.");
      return;
    }

    if (Serviços.length === 0) {
      alert(
        "Selecione pelo menos um serviço."
      );
      return;
    }

    if (!Colaborador) {
      alert("Selecione um barbeiro.");
      return;
    }

    if (!Data) {
      alert("Selecione uma data.");
      return;
    }

    if (!Horário) {
      alert("Selecione um horário.");
      return;
    }

    if (carregando) {
      return;
    }

    // ===================================================
    // VERIFICAR CONFIGURAÇÃO DO SUPABASE
    // ===================================================

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      console.error(
        "Variáveis do Supabase não encontradas."
      );

      alert(
        "Erro de configuração do Supabase.\n\n" +
          "Verifique o arquivo .env.local e reinicie o servidor."
      );

      return;
    }

    setCarregando(true);

    try {
      // =================================================
      // VERIFICAR SE O HORÁRIO JÁ ESTÁ OCUPADO
      // =================================================

      const {
        data: horarioExistente,
        error: erroConsulta,
      } = await supabase
        .from("Agendamentos")
        .select("Horário")
        .eq("Data", Data)
        .eq("Colaborador", Colaborador)
        .eq("Horário", Horário);

      if (erroConsulta) {
        console.error(
          "Erro ao verificar horário:",
          erroConsulta
        );

        alert(
          "Não foi possível verificar a disponibilidade do horário.\n\n" +
            erroConsulta.message
        );

        return;
      }

      if (
        horarioExistente &&
        horarioExistente.length > 0
      ) {
        alert(
          "Esse horário já foi ocupado. Escolha outro horário."
        );

        await atualizarHorariosOcupados();

        setHorário("");

        return;
      }

      // =================================================
      // TRANSFORMAR SERVIÇOS EM TEXTO
      // =================================================

      const serviçosSelecionados =
        Serviços.join(" + ");

      // =================================================
      // OBJETO DO AGENDAMENTO
      // =================================================

      const agendamento = {
        Nome: Nome.trim(),
        Telefone: Telefone.trim(),
        Serviço: serviçosSelecionados,
        Data: Data,
        Horário: Horário,
        Colaborador: Colaborador,
      };

      console.log(
        "================================"
      );

      console.log(
        "AGENDAMENTO QUE SERÁ ENVIADO:"
      );

      console.log(agendamento);

      console.log(
        "================================"
      );

      // =================================================
      // SALVAR NO SUPABASE
      // =================================================

      const { data, error } =
        await supabase
          .from("Agendamentos")
          .insert([agendamento])
          .select();

      // =================================================
      // TRATAMENTO DE ERRO
      // =================================================

      if (error) {
        console.error(
          "================================"
        );

        console.error(
          "ERRO COMPLETO DO SUPABASE:"
        );

        console.error(
          "Código:",
          error.code
        );

        console.error(
          "Mensagem:",
          error.message
        );

        console.error(
          "Detalhes:",
          error.details
        );

        console.error(
          "Hint:",
          error.hint
        );

        console.error(
          "================================"
        );

        if (
          error.code === "23505"
        ) {
          alert(
            "Esse horário acabou de ser ocupado. Escolha outro horário."
          );

          await atualizarHorariosOcupados();

          setHorário("");

          return;
        }

        if (
          error.code === "42501"
        ) {
          alert(
            "O Supabase bloqueou o cadastro.\n\n" +
              "É necessário verificar as políticas RLS da tabela Agendamentos."
          );

          return;
        }

        alert(
          "Erro ao salvar o agendamento.\n\n" +
            "Mensagem: " +
            error.message +
            "\n\nCódigo: " +
            (error.code ||
              "não informado")
        );

        return;
      }

      // =================================================
      // SUCESSO
      // =================================================

      console.log(
        "================================"
      );

      console.log(
        "AGENDAMENTO SALVO COM SUCESSO!"
      );

      console.log(data);

      console.log(
        "================================"
      );

      // =================================================
      // WHATSAPP DO BARBEIRO
      // =================================================

      let numeroDestino =
        "559985289973";

      if (
        Colaborador === "Jonas"
      ) {
        numeroDestino =
          "5586999273849";
      }

      // =================================================
      // MENSAGEM WHATSAPP
      // =================================================

      const mensagem =
        `*NOVO AGENDAMENTO RECEBIDO!*\n\n` +
        `*Cliente:* ${Nome}\n` +
        `*WhatsApp:* ${Telefone}\n` +
        `*Barbeiro:* ${Colaborador}\n\n` +
        `*SERVIÇOS:*\n` +
        Serviços.map(
          (servico) =>
            `• ${servico}`
        ).join("\n") +
        `\n\n` +
        `*Data:* ${Data}\n` +
        `*Horário:* ${Horário}\n\n` +
        `_Aguarde para confirmar!_`;

      alert(
        "Agendamento realizado com sucesso! Clique em OK para confirmar com o barbeiro."
      );

      // =================================================
      // ABRIR WHATSAPP
      // =================================================

      window.open(
        `https://wa.me/${numeroDestino}?text=${encodeURIComponent(
          mensagem
        )}`,
        "_blank"
      );

      // =================================================
      // LIMPAR FORMULÁRIO
      // =================================================

      setHorário("");
      setNome("");
      setTelefone("");
      setServiços([]);
      setColaborador("");
      setData("");
      setHorariosOcupados([]);
    } catch (err) {
      console.error(
        "================================"
      );

      console.error(
        "ERRO CRÍTICO:",
        err
      );

      console.error(
        "================================"
      );

      alert(
        "Erro crítico ao conectar com o Supabase.\n\n" +
          "Abra o console do navegador (F12) para verificar o erro."
      );
    } finally {
      setCarregando(false);
    }
  };

  // =====================================================
  // ASSINATURA
  // =====================================================

  const conhecerPlanos = () => {
    const mensagem =
      "Olá! Quero conhecer os planos de assinatura da Sousa Barbearia. Vi que existem assinaturas a partir de R$ 80,00 por mês com cortes ilimitados!";

    window.open(
      `https://wa.me/559985289973?text=${encodeURIComponent(
        mensagem
      )}`,
      "_blank"
    );
  };

  // =====================================================
  // DATA MÍNIMA
  // =====================================================

  const dataMinima =
    new Date()
      .toISOString()
      .split("T")[0];

  // =====================================================
  // TELA
  // =====================================================

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6">

      {/* =================================================
          EFEITOS DE FUNDO
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />

        <div className="absolute left-[-180px] top-[35%] h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[120px]" />

        <div className="absolute right-[-180px] top-[65%] h-[400px] w-[400px] rounded-full bg-yellow-500/5 blur-[120px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* =================================================
            CABEÇALHO / LOGO
        ================================================= */}

        <header className="relative mb-8 text-center">

          <div className="absolute left-1/2 top-[-30px] h-48 w-48 -translate-x-1/2 rounded-full bg-amber-500/20 blur-[80px]" />

          <div className="relative mx-auto flex h-40 w-40 items-center justify-center">

            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-2xl" />

            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-amber-500/30 bg-black/60 p-3 shadow-[0_0_50px_rgba(245,158,11,0.15)]">

              <img
                src="/logo.png"
                alt="Sousa Barbearia"
                className="h-full w-full object-contain"
              />

            </div>

          </div>

          <p className="relative mt-3 text-[10px] font-bold uppercase tracking-[0.45em] text-amber-500">
            Estilo • Precisão • Qualidade
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-widest sm:text-5xl">

            SOUSA

            <span className="block bg-gradient-to-r from-amber-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              BARBEARIA
            </span>

          </h1>

          <div className="mx-auto mt-4 flex items-center justify-center gap-3">

            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500" />

            <span className="text-amber-500">
              ✦
            </span>

            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500" />

          </div>

          <p className="mt-3 text-sm text-zinc-400">
            Agende seu horário online
          </p>

        </header>

        {/* =================================================
            OFERTA
        ================================================= */}

        <section className="relative mb-7 overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-zinc-900 via-[#090909] to-amber-950/30 shadow-[0_20px_80px_rgba(245,158,11,0.08)]">

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-yellow-600/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">

            <div className="mb-5 flex justify-center">

              <span className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-2 text-[10px] font-black tracking-widest text-black shadow-lg shadow-amber-500/20">
                🔥 OFERTA ESPECIAL
              </span>

            </div>

            <div className="grid items-center gap-6 md:grid-cols-3">

              <div className="text-center md:text-left">

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                  Plano mensal
                </p>

                <h2 className="mt-2 text-3xl font-black">

                  CORTES

                  <span className="block bg-gradient-to-r from-amber-300 to-amber-600 bg-clip-text text-transparent">
                    ILIMITADOS
                  </span>

                </h2>

              </div>

              <div className="text-center">

                <p className="text-sm leading-relaxed text-zinc-400">
                  Tenha cortes ilimitados durante o mês pagando uma única assinatura.
                </p>

                <div className="mt-3 flex items-end justify-center">

                  <span className="mb-2 text-xl font-bold text-amber-500">
                    R$
                  </span>

                  <span className="text-6xl font-black text-amber-500">
                    80
                  </span>

                  <span className="mb-2 ml-1 text-sm text-zinc-500">
                    /mês
                  </span>

                </div>

              </div>

              <div>

                <button
                  type="button"
                  onClick={conhecerPlanos}
                  className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 py-4 text-sm font-black tracking-wider text-black shadow-xl shadow-amber-500/20 transition hover:scale-[1.02] hover:from-amber-300 hover:to-yellow-500 active:scale-95"
                >
                  CONHEÇA NOSSOS PLANOS →
                </button>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">

                <p className="text-lg">
                  ✂️
                </p>

                <p className="mt-1 text-[9px] font-bold text-zinc-400">
                  ILIMITADOS
                </p>

              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">

                <p className="text-lg">
                  💰
                </p>

                <p className="mt-1 text-[9px] font-bold text-zinc-400">
                  ECONOMIZE
                </p>

              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">

                <p className="text-lg">
                  👑
                </p>

                <p className="mt-1 text-[9px] font-bold text-zinc-400">
                  EXCLUSIVO
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/70 shadow-2xl backdrop-blur-xl">

          <form
            onSubmit={agendar}
            className="p-5 sm:p-7"
          >

            {/* =================================================
                DADOS
            ================================================= */}

            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-xs font-black text-black">
                  01
                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-widest text-amber-500">
                    Primeiro passo
                  </p>

                  <h2 className="text-lg font-black">
                    Seus dados
                  </h2>

                </div>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <input
                  type="text"
                  placeholder="👤  Seu Nome Completo"
                  value={Nome}
                  onChange={(e) =>
                    setNome(e.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  required
                />

                <input
                  type="tel"
                  placeholder="📱  Seu WhatsApp com DDD"
                  value={Telefone}
                  onChange={(e) =>
                    setTelefone(e.target.value)
                  }
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  required
                />

              </div>

            </div>

            {/* =================================================
                SERVIÇOS
            ================================================= */}

            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-xs font-black text-black">
                  02
                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-widest text-amber-500">
                    Segundo passo
                  </p>

                  <h2 className="text-lg font-black">
                    Escolha os serviços
                  </h2>

                </div>

              </div>

              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">

                <p className="text-center text-xs text-zinc-400">

                  💡 Você pode selecionar{" "}

                  <span className="font-black text-amber-500">
                    mais de um serviço
                  </span>
                  .

                </p>

              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">

                {SERVICOS.map(
                  ([nome, preco, icone]) => {

                    const valor =
                      `${nome} - ${preco}`;

                    const selecionado =
                      Serviços.includes(
                        valor
                      );

                    return (
                      <button
                        key={nome}
                        type="button"
                        onClick={() =>
                          selecionarServico(
                            valor
                          )
                        }
                        className={`relative rounded-xl border p-3 text-left transition-all active:scale-95 ${
                          selecionado
                            ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-zinc-800 bg-black/40 hover:border-amber-500/40 hover:bg-zinc-900"
                        }`}
                      >

                        {selecionado && (
                          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-black">
                            ✓
                          </span>
                        )}

                        <div className="text-xl">
                          {icone}
                        </div>

                        <p className="mt-2 pr-4 text-[11px] font-bold leading-tight text-zinc-200">
                          {nome}
                        </p>

                        <p className="mt-1 text-xs font-black text-amber-500">
                          {preco}
                        </p>

                      </button>
                    );
                  }
                )}

              </div>

              {Serviços.length > 0 && (

                <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">

                  <div className="flex items-center justify-between">

                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                      Serviços selecionados
                    </p>

                    <span className="rounded-full bg-amber-500 px-2 py-1 text-[9px] font-black text-black">
                      {Serviços.length}
                    </span>

                  </div>

                  <div className="mt-3 space-y-2">

                    {Serviços.map(
                      (servico) => (

                        <div
                          key={servico}
                          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/40 px-3 py-2"
                        >

                          <span className="text-xs font-bold text-zinc-300">
                            ✓ {servico}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              selecionarServico(
                                servico
                              )
                            }
                            className="ml-2 text-xs font-black text-red-400 hover:text-red-300"
                          >
                            ✕
                          </button>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                BARBEIROS
            ================================================= */}

            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-xs font-black text-black">
                  03
                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-widest text-amber-500">
                    Terceiro passo
                  </p>

                  <h2 className="text-lg font-black">
                    Escolha o barbeiro
                  </h2>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                {BARBEIROS.map(
                  (barbeiro) => {

                    const selecionado =
                      Colaborador ===
                      barbeiro.id;

                    return (
                      <button
                        key={barbeiro.id}
                        type="button"
                        onClick={() => {
                          setColaborador(
                            barbeiro.id
                          );

                          setHorário("");
                        }}
                        className={`relative rounded-2xl border p-4 transition-all active:scale-95 ${
                          selecionado
                            ? "border-amber-500 bg-amber-500/10 shadow-xl shadow-amber-500/10"
                            : "border-zinc-800 bg-black/40 hover:border-amber-500/40"
                        }`}
                      >

                        {selecionado && (
                          <span className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-black">
                            ✓
                          </span>
                        )}

                        <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-amber-500/40 bg-zinc-950 p-1">

                          <img
                            src={barbeiro.foto}
                            alt={barbeiro.nome}
                            className="h-full w-full rounded-full object-cover"
                          />

                        </div>

                        <p className="mt-3 text-center text-sm font-black text-zinc-200">
                          {barbeiro.nome}
                        </p>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* =================================================
                DATA
            ================================================= */}

            <div className="mb-8">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-xs font-black text-black">
                  04
                </div>

                <div>

                  <p className="text-[9px] uppercase tracking-widest text-amber-500">
                    Quarto passo
                  </p>

                  <h2 className="text-lg font-black">
                    Escolha a data
                  </h2>

                </div>

              </div>

              <input
                type="date"
                value={Data}
                min={dataMinima}
                onChange={(e) =>
                  setData(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-800 bg-black/50 p-4 text-sm text-white outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                required
              />

            </div>

            {/* =================================================
                HORÁRIOS
            ================================================= */}

            {Data && Colaborador && (

              <div className="mb-8">

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-xs font-black text-black">
                    05
                  </div>

                  <div>

                    <p className="text-[9px] uppercase tracking-widest text-amber-500">
                      Último passo
                    </p>

                    <h2 className="text-lg font-black">
                      Escolha o horário
                    </h2>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">

                  {horariosDisponiveisDoDia.map(
                    (hora) => {

                      const estaOcupado =
                        horariosOcupados.includes(
                          hora
                        );

                      const selecionado =
                        Horário === hora;

                      return (
                        <button
                          key={hora}
                          type="button"
                          disabled={
                            estaOcupado
                          }
                          onClick={() =>
                            setHorário(
                              hora
                            )
                          }
                          className={`rounded-xl border py-3 text-sm font-black transition-all ${
                            estaOcupado
                              ? "cursor-not-allowed border-zinc-900 bg-black text-zinc-700 line-through"
                              : selecionado
                              ? "border-amber-500 bg-gradient-to-r from-amber-400 to-yellow-600 text-black shadow-lg shadow-amber-500/20"
                              : "border-zinc-800 bg-black/40 text-zinc-300 hover:border-amber-500 hover:text-amber-500"
                          }`}
                        >
                          {hora}
                        </button>
                      );
                    }
                  )}

                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-[10px] text-zinc-500">

                  <span>
                    🟨 Disponível
                  </span>

                  <span>
                    🟨 Selecionado
                  </span>

                  <span>
                    ⬛ Ocupado
                  </span>

                </div>

              </div>

            )}

            {/* =================================================
                RESUMO
            ================================================= */}

            {Serviços.length > 0 &&
              Colaborador &&
              Data &&
              Horário && (

                <div className="mb-6 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-5">

                  <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                    Resumo do agendamento
                  </p>

                  <div className="grid gap-4 sm:grid-cols-4">

                    <div>

                      <p className="text-[10px] text-zinc-600">
                        Serviços
                      </p>

                      <div className="mt-1 space-y-1">

                        {Serviços.map(
                          (servico) => (

                            <p
                              key={servico}
                              className="text-xs font-bold text-zinc-200"
                            >
                              • {servico}
                            </p>

                          )
                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-[10px] text-zinc-600">
                        Barbeiro
                      </p>

                      <p className="mt-1 text-xs font-bold text-zinc-200">
                        {Colaborador}
                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] text-zinc-600">
                        Data
                      </p>

                      <p className="mt-1 text-xs font-bold text-zinc-200">
                        {Data}
                      </p>

                    </div>

                    <div>

                      <p className="text-[10px] text-zinc-600">
                        Horário
                      </p>

                      <p className="mt-1 text-sm font-black text-amber-500">
                        {Horário}
                      </p>

                    </div>

                  </div>

                </div>

              )}

            {/* =================================================
                CONFIRMAR
            ================================================= */}

            <button
              type="submit"
              disabled={
                carregando ||
                Serviços.length === 0 ||
                !Horário
              }
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 py-5 text-sm font-black tracking-widest text-black shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] hover:shadow-amber-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:bg-none disabled:text-zinc-600 disabled:shadow-none"
            >

              {carregando
                ? "SALVANDO..."
                : Horário
                ? "CONFIRMAR AGENDAMENTO →"
                : "SELECIONE O HORÁRIO"}

            </button>

          </form>

        </section>

        {/* =================================================
            CONTATOS
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-xl">

          <div className="text-center">

            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">
              Fale conosco
            </p>

            <h2 className="mt-2 text-xl font-black">
              Sousa Barbearia
            </h2>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <a
              href="https://instagram.com/sousabarbearia13"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-center transition hover:border-pink-500/50 hover:bg-pink-500/5"
            >

              <div className="text-2xl">
                📸
              </div>

              <p className="mt-2 text-[10px] font-black text-zinc-300">
                INSTAGRAM
              </p>

            </a>

            <a
              href="https://wa.me/559985289973"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-zinc-800 bg-black/40 p-4 text-center transition hover:border-green-500/50 hover:bg-green-500/5"
            >

              <div className="text-2xl">
                💬
              </div>

              <p className="mt-2 text-[10px] font-black text-zinc-300">
                WHATSAPP
              </p>

            </a>

          </div>

          <div className="mt-5 border-t border-zinc-800 pt-5 text-center">

            <p className="text-xs text-zinc-300">
              📍 Av. Getúlio Vargas, 2842
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Centro, Matões - MA
            </p>

          </div>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black/40 p-4 text-center">

            <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">
              Horário de funcionamento
            </p>

            <div className="mt-4 grid grid-cols-2 divide-x divide-zinc-800">

              <div>

                <p className="text-xs font-bold text-zinc-300">
                  Segunda a Sábado
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  08:00 às 19:30
                </p>

              </div>

              <div>

                <p className="text-xs font-bold text-zinc-300">
                  Domingo
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  08:00 às 11:30
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <footer className="py-8 text-center">

          <div className="mx-auto mb-4 flex items-center justify-center gap-3">

            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/40" />

            <span className="text-amber-500">
              ✦
            </span>

            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/40" />

          </div>

          <p className="text-[10px] font-bold tracking-[0.35em] text-amber-500">
            SOUSA BARBEARIA
          </p>

          <p className="mt-2 text-[9px] text-zinc-600">
            Agendamento online
          </p>

        </footer>

      </div>

    </main>
  );
}