"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   SOUSA BARBEARIA — LUXURY EXPERIENCE 2.1
   LIGHT PREMIUM / CHAMPAGNE / GRAPHITE
========================================================= */

/* =========================================================
   SUPABASE
========================================================= */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const TABELA_AGENDAMENTOS = "Agendamentos";
const TABELA_BARBEIROS = "barbeiros";
const BUCKET_BARBEIROS = "barbeiros";
const WHATSAPP_PADRAO = "559985289973";

/* =========================================================
   HORÁRIOS
========================================================= */

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

/* =========================================================
   SERVIÇOS
========================================================= */

const SERVICOS = [
  {
    nome: "Corte",
    preco: "R$ 20,00",
    numero: "01",
  },
  {
    nome: "Barba",
    preco: "R$ 10,00",
    numero: "02",
  },
  {
    nome: "Corte e Barba",
    preco: "R$ 30,00",
    numero: "03",
  },
  {
    nome: "Sobrancelha",
    preco: "R$ 10,00",
    numero: "04",
  },
  {
    nome: "Combo",
    descricao: "Corte + Barba + Sobrancelha",
    preco: "R$ 35,00",
    numero: "05",
  },
  {
    nome: "Luzes",
    preco: "R$ 80,00",
    numero: "06",
  },
  {
    nome: "Progressiva",
    preco: "R$ 80,00",
    numero: "07",
  },
  {
    nome: "Pigmentação Cabelo",
    preco: "R$ 20,00",
    numero: "08",
  },
  {
    nome: "Pigmentação Barba",
    preco: "R$ 20,00",
    numero: "09",
  },
  {
    nome: "Risco",
    preco: "A partir de R$ 5,00",
    numero: "10",
  },
  {
    nome: "Hidratação e Escova",
    preco: "R$ 20,00",
    numero: "11",
  },
  {
    nome: "Corte Feminino",
    preco: "R$ 50,00",
    numero: "12",
  },
];

/* =========================================================
   URL DA FOTO
========================================================= */

function gerarUrlFoto(foto) {
  if (!foto) {
    return "";
  }

  let valor = String(foto).trim();

  if (!valor) {
    return "";
  }

  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://")
  ) {
    return valor;
  }

  try {
    valor = decodeURIComponent(valor);
  } catch {
    // mantém original
  }

  valor = valor.replace(/^\/+/, "");

  const marcadorPublico =
    `/storage/v1/object/public/${BUCKET_BARBEIROS}/`;

  const marcadorAutenticado =
    `/storage/v1/object/authenticated/${BUCKET_BARBEIROS}/`;

  if (valor.includes(marcadorPublico)) {
    valor =
      valor.split(marcadorPublico)[1] || "";
  }

  if (valor.includes(marcadorAutenticado)) {
    valor =
      valor.split(marcadorAutenticado)[1] || "";
  }

  const prefixoBucket =
    `${BUCKET_BARBEIROS}/`;

  if (valor.startsWith(prefixoBucket)) {
    valor = valor.substring(
      prefixoBucket.length
    );
  }

  valor = valor.replace(/^\/+/, "");

  if (!valor) {
    return "";
  }

  const caminhoCodificado = valor
    .split("/")
    .map((parte) =>
      encodeURIComponent(parte)
    )
    .join("/");

  const {
    data,
    error,
  } = supabase.storage
    .from(BUCKET_BARBEIROS)
    .getPublicUrl(
      caminhoCodificado
    );

  if (error) {
    console.error(
      "Erro ao gerar URL da foto:",
      error
    );

    return "";
  }

  return data?.publicUrl || "";
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function Home() {
  /* =======================================================
     DADOS DO CLIENTE
  ======================================================= */

  const [Nome, setNome] =
    useState("");

  const [Telefone, setTelefone] =
    useState("");

  /* =======================================================
     AGENDAMENTO
  ======================================================= */

  const [Serviços, setServiços] =
    useState([]);

  const [Colaborador, setColaborador] =
    useState("");

  const [Data, setData] =
    useState("");

  const [Horário, setHorário] =
    useState("");

  /* =======================================================
     BARBEIROS
  ======================================================= */

  const [barbeiros, setBarbeiros] =
    useState([]);

  const [
    carregandoBarbeiros,
    setCarregandoBarbeiros,
  ] = useState(true);

  /* =======================================================
     HORÁRIOS
  ======================================================= */

  const [
    horariosOcupados,
    setHorariosOcupados,
  ] = useState([]);

  const [
    horariosDisponiveisDoDia,
    setHorariosDisponiveisDoDia,
  ] = useState(HORARIOS_SEMANA);

  /* =======================================================
     UI
  ======================================================= */

  const [carregando, setCarregando] =
    useState(false);

  const [
    etapaAtiva,
    setEtapaAtiva,
  ] = useState(1);

  /* =======================================================
     BUSCAR BARBEIROS
  ======================================================= */

  useEffect(() => {
    async function carregarBarbeiros() {
      setCarregandoBarbeiros(true);

      try {
        if (
          !supabaseUrl ||
          !supabaseAnonKey
        ) {
          console.error(
            "Supabase não configurado."
          );

          setBarbeiros([]);
          return;
        }

        const {
          data,
          error,
        } = await supabase
          .from(TABELA_BARBEIROS)
          .select(
            "id, nome, foto, whatsapp, ativo"
          )
          .eq("ativo", true)
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          console.error(
            "Erro ao buscar barbeiros:",
            error
          );

          setBarbeiros([]);
          return;
        }

        const barbeirosComFoto =
          (data || []).map(
            (barbeiro, index) => {
              const fotoOriginal =
                barbeiro?.foto
                  ? String(
                      barbeiro.foto
                    ).trim()
                  : "";

              return {
                ...barbeiro,

                fotoUrl:
                  gerarUrlFoto(
                    fotoOriginal
                  ),

                _key:
                  barbeiro?.id ??
                  `${barbeiro?.nome || "barbeiro"}-${index}`,
              };
            }
          );

        setBarbeiros(
          barbeirosComFoto
        );
      } catch (error) {
        console.error(
          "Erro inesperado:",
          error
        );

        setBarbeiros([]);
      } finally {
        setCarregandoBarbeiros(
          false
        );
      }
    }

    carregarBarbeiros();
  }, []);

  /* =======================================================
     DIA DA SEMANA
  ======================================================= */

  useEffect(() => {
    if (!Data) {
      setHorariosDisponiveisDoDia(
        HORARIOS_SEMANA
      );

      setHorário("");
      return;
    }

    const dataSelecionada =
      new Date(
        `${Data}T12:00:00`
      );

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

  /* =======================================================
     HORÁRIOS OCUPADOS
  ======================================================= */

  useEffect(() => {
    async function buscarHorariosOcupados() {
      if (
        !Data ||
        !Colaborador
      ) {
        setHorariosOcupados([]);
        return;
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from(TABELA_AGENDAMENTOS)
          .select("Horário")
          .eq("Data", Data)
          .eq(
            "Colaborador",
            Colaborador
          );

        if (error) {
          console.error(
            "Erro ao buscar horários:",
            error
          );

          setHorariosOcupados([]);
          return;
        }

        setHorariosOcupados(
          (data || [])
            .map(
              (item) =>
                item?.["Horário"]
            )
            .filter(Boolean)
        );
      } catch (error) {
        console.error(
          "Erro ao buscar horários:",
          error
        );

        setHorariosOcupados([]);
      }
    }

    buscarHorariosOcupados();
  }, [Data, Colaborador]);

  /* =======================================================
     SERVIÇOS SELECIONADOS
  ======================================================= */

  const selecionarServico = (
    servico
  ) => {
    const valor =
      servico.nome === "Combo"
        ? `Combo - ${servico.descricao}`
        : `${servico.nome} - ${servico.preco}`;

    setServiços(
      (atuais) => {
        if (
          atuais.includes(valor)
        ) {
          return atuais.filter(
            (item) =>
              item !== valor
          );
        }

        return [
          ...atuais,
          valor,
        ];
      }
    );

    setEtapaAtiva(2);
  };

  /* =======================================================
     BARBEIRO SELECIONADO
  ======================================================= */

  const barbeiroSelecionado =
    barbeiros.find(
      (barbeiro) =>
        String(barbeiro.id) ===
        String(Colaborador)
    );

  /* =======================================================
     QUANTIDADE DE SERVIÇOS
  ======================================================= */

  const quantidadeServicos =
    Serviços.length;

  /* =======================================================
     PROGRESSO
  ======================================================= */

  const progresso =
    Horário
      ? 100
      : Data
      ? 80
      : Colaborador
      ? 60
      : Serviços.length > 0
      ? 40
      : Nome
      ? 20
      : 0;

  /* =======================================================
     DATA MÍNIMA
  ======================================================= */

  const dataMinima =
    new Date().toLocaleDateString(
      "en-CA"
    );

  /* =======================================================
     WHATSAPP DO BARBEIRO
  ======================================================= */

  const abrirWhatsAppBarbeiro =
    (barbeiro) => {
      if (
        !barbeiro?.whatsapp
      ) {
        alert(
          "Este barbeiro ainda não possui WhatsApp cadastrado."
        );

        return;
      }

      const numero =
        String(
          barbeiro.whatsapp
        ).replace(
          /\D/g,
          ""
        );

      if (!numero) {
        alert(
          "O WhatsApp deste barbeiro não está válido."
        );

        return;
      }

      const mensagem =
        `Olá ${barbeiro.nome}! Vim pelo site da Sousa Barbearia e gostaria de falar com você.`;

      window.open(
        `https://wa.me/${numero}?text=${encodeURIComponent(
          mensagem
        )}`,
        "_blank"
      );
    };

  /* =======================================================
     ATUALIZAR HORÁRIOS
  ======================================================= */

  const atualizarHorariosOcupados =
    async () => {
      if (
        !Data ||
        !Colaborador
      ) {
        return;
      }

      try {
        const {
          data,
          error,
        } = await supabase
          .from(
            TABELA_AGENDAMENTOS
          )
          .select("Horário")
          .eq("Data", Data)
          .eq(
            "Colaborador",
            Colaborador
          );

        if (error) {
          console.error(
            "Erro:",
            error
          );

          return;
        }

        setHorariosOcupados(
          (data || [])
            .map(
              (item) =>
                item?.["Horário"]
            )
            .filter(Boolean)
        );
      } catch (error) {
        console.error(
          error
        );
      }
    };

  /* =======================================================
     AGENDAR
  ======================================================= */

  const agendar = async (e) => {
    e.preventDefault();

    if (!Nome.trim()) {
      alert(
        "Informe seu nome."
      );

      return;
    }

    if (!Telefone.trim()) {
      alert(
        "Informe seu WhatsApp."
      );

      return;
    }

    if (
      Serviços.length === 0
    ) {
      alert(
        "Selecione pelo menos um serviço."
      );

      return;
    }

    if (!Colaborador) {
      alert(
        "Selecione um barbeiro."
      );

      return;
    }

    if (!Data) {
      alert(
        "Selecione uma data."
      );

      return;
    }

    if (!Horário) {
      alert(
        "Selecione um horário."
      );

      return;
    }

    if (carregando) {
      return;
    }

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      alert(
        "Erro de configuração do Supabase."
      );

      return;
    }

    setCarregando(true);

    try {
      /* ===================================================
         VERIFICAR DISPONIBILIDADE
      =================================================== */

      const {
        data: horarioExistente,
        error: erroConsulta,
      } = await supabase
        .from(
          TABELA_AGENDAMENTOS
        )
        .select("Horário")
        .eq("Data", Data)
        .eq(
          "Colaborador",
          Colaborador
        )
        .eq(
          "Horário",
          Horário
        );

      if (erroConsulta) {
        console.error(
          erroConsulta
        );

        alert(
          "Não foi possível verificar a disponibilidade."
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

      /* ===================================================
         SALVAR
      =================================================== */

      const serviçosSelecionados =
        Serviços.join(" + ");

      const agendamento = {
        Nome: Nome.trim(),

        Telefone:
          Telefone.trim(),

        Serviço:
          serviçosSelecionados,

        Data,

        Horário,

        Colaborador,
      };

      const {
        error,
      } = await supabase
        .from(
          TABELA_AGENDAMENTOS
        )
        .insert([
          agendamento,
        ]);

      if (error) {
        console.error(
          "Erro Supabase:",
          error
        );

        if (
          error.code ===
          "23505"
        ) {
          alert(
            "Esse horário acabou de ser ocupado. Escolha outro."
          );

          await atualizarHorariosOcupados();

          setHorário("");

          return;
        }

        if (
          error.code ===
          "42501"
        ) {
          alert(
            "O Supabase bloqueou o agendamento pela RLS. Verifique a política INSERT da tabela Agendamentos."
          );

          return;
        }

        alert(
          "Erro ao salvar o agendamento.\n\n" +
            error.message
        );

        return;
      }

      /* ===================================================
         WHATSAPP
      =================================================== */

      let numeroDestino =
        barbeiroSelecionado?.whatsapp
          ? String(
              barbeiroSelecionado.whatsapp
            ).replace(
              /\D/g,
              ""
            )
          : "";

      if (!numeroDestino) {
        numeroDestino =
          WHATSAPP_PADRAO;
      }

      const mensagem =
        `*NOVO AGENDAMENTO — SOUSA BARBEARIA*\n\n` +
        `*Cliente:* ${Nome}\n` +
        `*WhatsApp:* ${Telefone}\n` +
        `*Barbeiro:* ${
          barbeiroSelecionado?.nome ||
          Colaborador
        }\n\n` +
        `*SERVIÇOS:*\n` +
        Serviços.map(
          (servico) =>
            `• ${servico}`
        ).join("\n") +
        `\n\n` +
        `*Data:* ${Data}\n` +
        `*Horário:* ${Horário}\n\n` +
        `_Aguardando confirmação._`;

      alert(
        "Sua reserva foi registrada com sucesso."
      );

      window.open(
        `https://wa.me/${numeroDestino}?text=${encodeURIComponent(
          mensagem
        )}`,
        "_blank"
      );

      /* ===================================================
         LIMPAR
      =================================================== */

      setNome("");
      setTelefone("");
      setServiços([]);
      setColaborador("");
      setData("");
      setHorário("");
      setHorariosOcupados([]);
      setEtapaAtiva(1);
    } catch (error) {
      console.error(
        "Erro crítico:",
        error
      );

      alert(
        "Erro ao conectar com o sistema de agendamento."
      );
    } finally {
      setCarregando(false);
    }
  };

  /* =======================================================
     PLANOS
  ======================================================= */

  const conhecerPlanos = () => {
    const mensagem =
      "Olá! Quero conhecer os planos de assinatura da Sousa Barbearia.";

    window.open(
      `https://wa.me/${WHATSAPP_PADRAO}?text=${encodeURIComponent(
        mensagem
      )}`,
      "_blank"
    );
  };

  /* =======================================================
     FORMATAÇÃO DA DATA
  ======================================================= */

  const dataFormatada =
    Data
      ? new Date(
          `${Data}T12:00:00`
        ).toLocaleDateString(
          "pt-BR",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )
      : "";

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F3EE] text-[#1C1C1A]">

      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0">

        <div className="absolute left-1/2 top-[-350px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[#D8BE8A]/[0.18] blur-[160px]" />

        <div className="absolute bottom-[-300px] left-[-200px] h-[600px] w-[600px] rounded-full bg-[#B08A45]/[0.08] blur-[150px]" />

        <div className="absolute right-[-300px] top-[35%] h-[650px] w-[650px] rounded-full bg-[#D8BE8A]/[0.10] blur-[170px]" />

        <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(40,35,25,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(40,35,25,.035)_1px,transparent_1px)] [background-size:80px_80px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* =================================================
            NAV
        ================================================= */}

        <nav className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B08A45]/40 bg-white text-[#B08A45] shadow-sm">

              <span className="text-xs font-black">
                S
              </span>

            </div>

            <div>

              <p className="text-[10px] font-black tracking-[0.3em] text-[#1C1C1A]">
                SOUSA
              </p>

              <p className="text-[7px] uppercase tracking-[0.4em] text-[#8B877E]">
                Barbearia
              </p>

            </div>

          </div>

          <Link
            href="/admin"
            className="rounded-full border border-[#DCD7CC] bg-white px-4 py-2.5 text-[8px] font-bold uppercase tracking-[0.25em] text-[#77736A] shadow-sm backdrop-blur-xl transition hover:border-[#B08A45]/50 hover:text-[#B08A45]"
          >
            Administração
          </Link>

        </nav>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative py-20 text-center sm:py-28 lg:py-36">

          <div className="mx-auto mb-8 flex items-center justify-center gap-4">

            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#B08A45]/60 sm:w-20" />

            <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-[#A17A3D]">
              The barber experience
            </span>

            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#B08A45]/60 sm:w-20" />

          </div>

          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-[#DED8CB] bg-white p-4 shadow-[0_25px_80px_rgba(55,45,25,.10)] sm:h-36 sm:w-36">

            <img
              src="/logo.png"
              alt="Sousa Barbearia"
              className="h-full w-full object-contain"
            />

          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.6em] text-[#858077]">
            Estilo • Precisão • Presença
          </p>

          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-black leading-[0.9] tracking-[-0.06em] text-[#191917] sm:text-7xl lg:text-9xl">

            SUA IMAGEM

            <span className="block bg-gradient-to-b from-[#D1B77F] via-[#B08A45] to-[#765627] bg-clip-text text-transparent">
              MERECE MAIS.
            </span>

          </h1>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-[#6E6A62] sm:text-base">
            Uma experiência de barbearia pensada para quem valoriza
            presença, precisão e estilo.
          </p>

          <a
            href="#reserva"
            className="mt-9 inline-flex items-center gap-4 rounded-full border border-[#B08A45]/50 bg-[#B08A45] px-7 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white shadow-[0_15px_40px_rgba(176,138,69,.18)] transition hover:bg-[#9F783D] active:scale-95"
          >
            Reservar horário

            <span className="text-sm">
              ↓
            </span>
          </a>

          <div className="mx-auto mt-12 grid max-w-xl grid-cols-3 border-y border-[#DED9CF] py-5">

            <div>

              <p className="text-lg font-black text-[#1C1C1A]">
                3+
              </p>

              <p className="mt-1 text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                Anos
              </p>

            </div>

            <div className="border-x border-[#DED9CF]">

              <p className="text-lg font-black text-[#1C1C1A]">
                ∞
              </p>

              <p className="mt-1 text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                Estilo
              </p>

            </div>

            <div>

              <p className="text-lg font-black text-[#1C1C1A]">
                01
              </p>

              <p className="mt-1 text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                Experiência
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            MEMBERSHIP
        ================================================= */}

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#DCCFB7] bg-white shadow-[0_20px_70px_rgba(50,40,20,.06)]">

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-[#D8BE8A]/[0.14] blur-[100px]" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <span className="rounded-full border border-[#B08A45]/35 bg-[#B08A45]/[0.05] px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.3em] text-[#A17A3D]">
                    EXCLUSIVO
                  </span>

                  <span className="text-[7px] uppercase tracking-[0.25em] text-[#8A857B]">
                    
                  </span>

                </div>

                <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[#1C1C1A] sm:text-4xl">

                  CORTE SEMPRE

                  <span className="text-[#B08A45]">
                    {" "}EM DIA.
                  </span>

                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#77736A]">
                  Assinaturas para quem prefere praticidade,
                  exclusividade e presença impecável.
                </p>

              </div>

              <div className="flex items-center gap-6">

                <div>

                  <p className="text-[7px] uppercase tracking-[0.3em] text-[#858077]">
                    A partir de
                  </p>

                  <div className="mt-1">

                    <span className="text-sm text-[#B08A45]">
                      R$
                    </span>

                    <span className="ml-1 text-5xl font-black text-[#1C1C1A]">
                      80
                    </span>

                    <span className="ml-1 text-xs text-[#858077]">
                      /mês
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    conhecerPlanos
                  }
                  className="rounded-xl border border-[#B08A45]/40 bg-[#B08A45]/[0.08] px-5 py-4 text-[8px] font-black uppercase tracking-[0.2em] text-[#9A7136] transition hover:bg-[#B08A45] hover:text-white"
                >
                  Conhecer
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            RESERVA
        ================================================= */}

        <section
          id="reserva"
          className="overflow-hidden rounded-[2rem] border border-[#DDD8CE] bg-white shadow-[0_35px_100px_rgba(40,35,25,.08)]"
        >

          {/* HEADER RESERVA */}

          <div className="border-b border-[#E8E4DC] p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#A17A3D]">
                  
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#1C1C1A] sm:text-4xl">

                  RESERVE SUA

                  <span className="block text-[#B08A45]">
                    EXPERIÊNCIA.
                  </span>

                </h2>

              </div>

              <div className="w-full max-w-xs">

                <div className="mb-2 flex justify-between text-[7px] uppercase tracking-[0.2em] text-[#858077]">

                  <span>
                    Progresso
                  </span>

                  <span>
                    {progresso}%
                  </span>

                </div>

                <div className="h-[3px] overflow-hidden rounded-full bg-[#E9E5DC]">

                  <div
                    className="h-full rounded-full bg-[#B08A45] transition-all duration-500"
                    style={{
                      width: `${progresso}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          <form
            onSubmit={agendar}
            className="p-6 sm:p-8 lg:p-10"
          >

            {/* =================================================
                IDENTIFICAÇÃO
            ================================================= */}

            <div className="mb-14">

              <div className="mb-7 flex items-center gap-4">

                <span className="text-[10px] font-black text-[#B08A45]">
                  01
                </span>

                <span className="h-px w-8 bg-[#B08A45]/30" />

                <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-[#69655E]">
                  Seus dados
                </h3>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                <div className="relative border-b border-[#DCD8D0] transition focus-within:border-[#B08A45]">

                  <label className="pointer-events-none absolute left-0 top-0 text-[7px] font-bold uppercase tracking-[0.25em] text-[#858077]">
                    Nome
                  </label>

                  <input
                    type="text"
                    value={Nome}
                    onChange={(e) =>
                      setNome(
                        e.target.value
                      )
                    }
                    placeholder="Como podemos chamar você?"
                    className="w-full bg-transparent pb-4 pt-5 text-sm font-medium text-[#1C1C1A] outline-none placeholder:text-[#B0ACA4]"
                    required
                  />

                </div>

                <div className="relative border-b border-[#DCD8D0] transition focus-within:border-[#B08A45]">

                  <label className="pointer-events-none absolute left-0 top-0 text-[7px] font-bold uppercase tracking-[0.25em] text-[#858077]">
                    WhatsApp
                  </label>

                  <input
                    type="tel"
                    value={Telefone}
                    onChange={(e) =>
                      setTelefone(
                        e.target.value
                      )
                    }
                    placeholder="Seu número com DDD"
                    className="w-full bg-transparent pb-4 pt-5 text-sm font-medium text-[#1C1C1A] outline-none placeholder:text-[#B0ACA4]"
                    required
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                SERVIÇOS
            ================================================= */}

            <div className="mb-14">

              <div className="mb-7 flex items-center gap-4">

                <span className="text-[10px] font-black text-[#B08A45]">
                  02
                </span>

                <span className="h-px w-8 bg-[#B08A45]/30" />

                <div>

                  <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-[#69655E]">
                    Escolha sua experiência
                  </h3>

                  <p className="mt-2 text-[10px] text-[#858077]">

                    {quantidadeServicos > 0
                      ? `${quantidadeServicos} serviço(s) selecionado(s)`
                      : "Selecione um ou mais serviços"}

                  </p>

                </div>

              </div>

              <div className="grid gap-px overflow-hidden rounded-2xl border border-[#E4E0D8] bg-[#E4E0D8] sm:grid-cols-2 lg:grid-cols-3">

                {SERVICOS.map(
                  (servico) => {

                    const valor =
                      servico.nome ===
                      "Combo"
                        ? `Combo - ${servico.descricao}`
                        : `${servico.nome} - ${servico.preco}`;

                    const selecionado =
                      Serviços.includes(
                        valor
                      );

                    return (

                      <button
                        key={
                          servico.numero
                        }
                        type="button"
                        onClick={() =>
                          selecionarServico(
                            servico
                          )
                        }
                        className={`group relative min-h-[105px] bg-white p-5 text-left transition-all ${
                          selecionado
                            ? "bg-[#B08A45]/[0.08]"
                            : "hover:bg-[#F9F7F2]"
                        }`}
                      >

                        <div className="flex items-start justify-between">

                          <span className="text-[8px] font-black tracking-[0.2em] text-[#AAA59C]">
                            {servico.numero}
                          </span>

                          <span
                            className={`text-[8px] font-black uppercase tracking-[0.15em] ${
                              selecionado
                                ? "text-[#B08A45]"
                                : "text-[#9B978F]"
                            }`}
                          >
                            {selecionado
                              ? "Selecionado"
                              : "Selecionar"}
                          </span>

                        </div>

                        <p className="mt-6 text-xs font-black text-[#252421]">
                          {servico.nome}
                        </p>

                        {servico.descricao && (
                          <p className="mt-1 text-[8px] text-[#858077]">
                            {servico.descricao}
                          </p>
                        )}

                        <p className="mt-2 text-[10px] font-bold text-[#B08A45]">
                          {servico.preco}
                        </p>

                        {selecionado && (
                          <div className="absolute bottom-0 left-0 h-[3px] w-full bg-[#B08A45]" />
                        )}

                      </button>

                    );
                  }
                )}

              </div>

            </div>

            {/* =================================================
                BARBEIROS
            ================================================= */}

            <div className="mb-14">

              <div className="mb-7 flex items-center gap-4">

                <span className="text-[10px] font-black text-[#B08A45]">
                  03
                </span>

                <span className="h-px w-8 bg-[#B08A45]/30" />

                <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-[#69655E]">
                  Escolha seu profissional
                </h3>

              </div>

              {carregandoBarbeiros ? (

                <div className="py-16 text-center">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-[#DED9CF] border-t-[#B08A45]" />

                  <p className="mt-4 text-[8px] uppercase tracking-[0.3em] text-[#858077]">
                    Preparando equipe
                  </p>

                </div>

              ) : barbeiros.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-[#DCD8D0] p-10 text-center">

                  <p className="text-3xl text-[#B08A45]">
                    ✦
                  </p>

                  <p className="mt-3 text-xs text-[#77736A]">
                    Nenhum profissional disponível.
                  </p>

                </div>

              ) : (

                <div
                  className={`grid gap-4 ${
                    barbeiros.length === 1
                      ? "grid-cols-1 max-w-sm"
                      : barbeiros.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 lg:grid-cols-3"
                  }`}
                >

                  {barbeiros.map(
                    (barbeiro) => {

                      const selecionado =
                        String(
                          Colaborador
                        ) ===
                        String(
                          barbeiro.id
                        );

                      return (

                        <div
                          key={
                            barbeiro._key
                          }
                          className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                            selecionado
                              ? "border-[#B08A45]/70 bg-[#B08A45]/[0.04] shadow-[0_15px_45px_rgba(176,138,69,.12)]"
                              : "border-[#E0DCD4] hover:border-[#C8B28A]"
                          }`}
                        >

                          <button
                            type="button"
                            onClick={() => {

                              setColaborador(
                                String(
                                  barbeiro.id
                                )
                              );

                              setHorário("");

                              setEtapaAtiva(
                                3
                              );

                            }}
                            className="w-full text-left"
                          >

                            <div className="relative aspect-[4/5] overflow-hidden bg-[#EDEAE3]">

                              {barbeiro.fotoUrl ? (

                                <img
                                  src={
                                    barbeiro.fotoUrl
                                  }
                                  alt={
                                    barbeiro.nome
                                  }
                                  className="h-full w-full object-cover grayscale-[10%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                  loading="eager"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onError={(
                                    e
                                  ) => {

                                    e.currentTarget.style.display =
                                      "none";

                                    const pai =
                                      e.currentTarget
                                        .parentElement;

                                    if (
                                      pai &&
                                      !pai.querySelector(
                                        "[data-fallback]"
                                      )
                                    ) {

                                      const fallback =
                                        document.createElement(
                                          "div"
                                        );

                                      fallback.setAttribute(
                                        "data-fallback",
                                        "true"
                                      );

                                      fallback.className =
                                        "flex h-full w-full items-center justify-center text-5xl text-[#B08A45]";

                                      fallback.textContent =
                                        "✦";

                                      pai.appendChild(
                                        fallback
                                      );

                                    }

                                  }}
                                />

                              ) : (

                                <div className="flex h-full w-full items-center justify-center text-5xl text-[#B08A45]">
                                  ✦
                                </div>

                              )}

                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                              {selecionado && (

                                <div className="absolute left-4 top-4 rounded-full bg-[#B08A45] px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.2em] text-white">
                                  Selecionado
                                </div>

                              )}

                              <div className="absolute bottom-5 left-5 right-5">

                                <p className="text-lg font-black tracking-tight text-white">
                                  {barbeiro.nome}
                                </p>

                                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.3em] text-[#DCC28D]">
                                  Barber specialist
                                </p>

                              </div>

                            </div>

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              abrirWhatsAppBarbeiro(
                                barbeiro
                              )
                            }
                            className="m-3 flex w-[calc(100%-1.5rem)] items-center justify-center gap-2 rounded-lg border border-[#E1DDD5] bg-[#FAF9F6] py-3 text-[7px] font-black uppercase tracking-[0.25em] text-[#77736A] transition hover:border-green-500/30 hover:text-green-600"
                          >
                            WhatsApp
                          </button>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </div>

            {/* =================================================
                DATA
            ================================================= */}

            <div className="mb-14">

              <div className="mb-7 flex items-center gap-4">

                <span className="text-[10px] font-black text-[#B08A45]">
                  04
                </span>

                <span className="h-px w-8 bg-[#B08A45]/30" />

                <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-[#69655E]">
                  Escolha a data
                </h3>

              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">

                <div className="relative rounded-xl border border-[#DDD9D1] bg-[#FAF9F6]">

                  <label className="pointer-events-none absolute left-4 top-3 text-[7px] font-bold uppercase tracking-[0.25em] text-[#858077]">
                    Data da visita
                  </label>

                  <input
                    type="date"
                    value={Data}
                    min={dataMinima}
                    onChange={(e) => {

                      setData(
                        e.target.value
                      );

                      setEtapaAtiva(
                        4
                      );

                    }}
                    className="w-full bg-transparent px-4 pb-4 pt-8 text-sm font-bold text-[#1C1C1A] outline-none [color-scheme:light]"
                    required
                  />

                </div>

                <div className="hidden items-center rounded-xl border border-[#E0DCD4] bg-white px-6 sm:flex">

                  <div>

                    <p className="text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                      Horário de funcionamento
                    </p>

                    <p className="mt-1 text-[10px] font-bold text-[#6F6B63]">
                      Seg — Sáb · 08:00 — 19:30
                    </p>

                  </div>

                </div>

              </div>

              {Data && (

                <div className="mt-4 rounded-xl border border-[#E4D7BE] bg-[#B08A45]/[0.06] px-4 py-3">

                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#A17A3D]">
                    Sua visita
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#4F4B44]">
                    {dataFormatada}
                  </p>

                </div>

              )}

            </div>

            {/* =================================================
                HORÁRIO
            ================================================= */}

            {Data &&
              Colaborador && (

                <div className="mb-14">

                  <div className="mb-7 flex items-center gap-4">

                    <span className="text-[10px] font-black text-[#B08A45]">
                      05
                    </span>

                    <span className="h-px w-8 bg-[#B08A45]/30" />

                    <h3 className="text-[9px] font-black uppercase tracking-[0.35em] text-[#69655E]">
                      Escolha seu horário
                    </h3>

                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">

                    {horariosDisponiveisDoDia.map(
                      (hora) => {

                        const ocupado =
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
                              ocupado
                            }
                            onClick={() => {

                              setHorário(
                                hora
                              );

                              setEtapaAtiva(
                                5
                              );

                            }}
                            className={`relative overflow-hidden rounded-lg border py-4 text-xs font-black transition-all ${
                              ocupado
                                ? "cursor-not-allowed border-[#EDEAE4] bg-[#F5F3EE] text-[#B8B4AC]"
                                : selecionado
                                ? "border-[#B08A45] bg-[#B08A45] text-white shadow-[0_10px_40px_rgba(176,138,69,.18)]"
                                : "border-[#E0DCD4] bg-white text-[#77736A] hover:border-[#B08A45]/50 hover:text-[#A17A3D]"
                            }`}
                          >

                            {hora}

                            {ocupado && (

                              <span className="absolute bottom-1 left-0 w-full text-[5px] uppercase tracking-[0.15em] text-[#AAA59C]">
                                ocupado
                              </span>

                            )}

                          </button>

                        );

                      }
                    )}

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

                <div className="mb-6 overflow-hidden rounded-2xl border border-[#DCCFB7] bg-[#FBF8F0]">

                  <div className="p-6 sm:p-8">

                    <div className="flex items-start justify-between border-b border-[#E5DFD4] pb-6">

                      <div>

                        <p className="text-[7px] font-black uppercase tracking-[0.4em] text-[#A17A3D]">
                          Final review
                        </p>

                        <h3 className="mt-2 text-xl font-black text-[#1C1C1A]">
                          Sua experiência
                        </h3>

                      </div>

                      <span className="text-2xl text-[#B08A45]">
                        ✦
                      </span>

                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                      <div>

                        <p className="text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                          Cliente
                        </p>

                        <p className="mt-2 text-xs font-bold text-[#45423D]">
                          {Nome}
                        </p>

                      </div>

                      <div>

                        <p className="text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                          Profissional
                        </p>

                        <p className="mt-2 text-xs font-bold text-[#45423D]">
                          {barbeiroSelecionado?.nome}
                        </p>

                      </div>

                      <div>

                        <p className="text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                          Data
                        </p>

                        <p className="mt-2 text-xs font-bold text-[#45423D]">
                          {dataFormatada}
                        </p>

                      </div>

                      <div>

                        <p className="text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                          Horário
                        </p>

                        <p className="mt-1 text-2xl font-black text-[#B08A45]">
                          {Horário}
                        </p>

                      </div>

                    </div>

                    <div className="mt-6 border-t border-[#E5DFD4] pt-5">

                      <p className="text-[7px] uppercase tracking-[0.25em] text-[#858077]">
                        Serviços selecionados
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {Serviços.map(
                          (servico) => (

                            <span
                              key={
                                servico
                              }
                              className="rounded-md border border-[#DED9CF] bg-white px-3 py-2 text-[9px] font-bold text-[#5E5A53]"
                            >
                              {servico}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              )}

            {/* =================================================
                BOTÃO
            ================================================= */}

            <button
              type="submit"
              disabled={
                carregando ||
                Serviços.length === 0 ||
                !Horário
              }
              className="group relative w-full overflow-hidden rounded-xl bg-[#B08A45] py-5 text-[9px] font-black uppercase tracking-[0.35em] text-white shadow-[0_15px_45px_rgba(176,138,69,.16)] transition hover:bg-[#9F783D] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#E6E2DA] disabled:text-[#AAA59C] disabled:shadow-none"
            >

              <span className="relative z-10">

                {carregando
                  ? "Registrando sua reserva..."
                  : Horário
                  ? "Confirmar minha experiência →"
                  : "Complete sua reserva"}

              </span>

            </button>

            <p className="mt-4 text-center text-[7px] uppercase tracking-[0.25em] text-[#969189]">
              Sua reserva será registrada e enviada ao barbeiro via WhatsApp.
            </p>

          </form>

        </section>

        {/* =================================================
            INSTAGRAM / WHATSAPP
        ================================================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2">

          <a
            href="https://instagram.com/sousabarbearia13"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-[#DEDAD2] bg-white p-7 shadow-sm transition hover:border-[#C9B890] hover:shadow-md"
          >

            <div className="absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full bg-[#B08A45]/[0.07] blur-3xl" />

            <p className="text-[7px] font-bold uppercase tracking-[0.35em] text-[#858077]">
              Follow the style
            </p>

            <h3 className="mt-3 text-xl font-black text-[#1C1C1A]">
              @sousabarbearia13
            </h3>

            <p className="mt-2 text-xs text-[#77736A]">
              Acompanhe nosso trabalho.
            </p>

            <span className="mt-6 inline-block text-[8px] font-black uppercase tracking-[0.25em] text-[#A17A3D]">
              Instagram →
            </span>

          </a>

          <a
            href={`https://wa.me/${WHATSAPP_PADRAO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-[#DEDAD2] bg-white p-7 shadow-sm transition hover:border-green-500/30 hover:shadow-md"
          >

            <p className="text-[7px] font-bold uppercase tracking-[0.35em] text-[#858077]">
              Direct contact
            </p>

            <h3 className="mt-3 text-xl font-black text-[#1C1C1A]">
              Fale conosco.
            </h3>

            <p className="mt-2 text-xs text-[#77736A]">
              Tire suas dúvidas diretamente pelo WhatsApp.
            </p>

            <span className="mt-6 inline-block text-[8px] font-black uppercase tracking-[0.25em] text-green-600">
              WhatsApp →
            </span>

          </a>

        </section>

        {/* =================================================
            LOCALIZAÇÃO
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-[#DEDAD2] bg-white p-6 text-center shadow-sm sm:p-8">

          <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-[#A17A3D]">
            Onde estamos
          </p>

          <h3 className="mt-3 text-lg font-black text-[#1C1C1A]">
            Sousa Barbearia
          </h3>

          <p className="mt-2 text-xs text-[#77736A]">
            Av. Getúlio Vargas, 2842 · Centro · Matões - MA
          </p>

          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4">

            <div className="h-px flex-1 bg-[#E2DED6]" />

            <span className="text-[9px] text-[#B08A45]">
              ✦
            </span>

            <div className="h-px flex-1 bg-[#E2DED6]" />

          </div>

          <div className="mt-6 flex flex-col justify-center gap-3 text-[8px] font-bold uppercase tracking-[0.2em] text-[#858077] sm:flex-row sm:gap-8">

            <span>
              Seg — Sáb · 08:00 — 19:30
            </span>

            <span>
              Domingo · 08:00 — 11:30
            </span>

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-14 text-center">

          <div className="mx-auto flex items-center justify-center gap-4">

            <span className="h-px w-12 bg-[#DEDAD2]" />

            <span className="text-xs text-[#B08A45]">
              S
            </span>

            <span className="h-px w-12 bg-[#DEDAD2]" />

          </div>

          <p className="mt-5 text-[8px] font-black uppercase tracking-[0.45em] text-[#77736A]">
            Sousa Barbearia
          </p>

          <p className="mt-2 text-[7px] uppercase tracking-[0.25em] text-[#A09B92]">
            Loureiro.Co · Sistemas e Cibersegurança
          </p>

        </footer>

      </div>

    </main>
  );
}