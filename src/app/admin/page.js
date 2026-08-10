"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

const BUCKET = "barbeiros";
const TABELA = "barbeiros";

export default function Barbeiros() {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [barbeiros, setBarbeiros] = useState([]);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // =====================================================
  // ESTADOS DE EDIÇÃO
  // =====================================================

  const [editando, setEditando] = useState(false);
  const [barbeiroEditando, setBarbeiroEditando] =
    useState(null);

  const [nomeEdicao, setNomeEdicao] = useState("");
  const [whatsappEdicao, setWhatsappEdicao] =
    useState("");
  const [fotoEdicao, setFotoEdicao] = useState(null);
  const [previewFotoEdicao, setPreviewFotoEdicao] =
    useState("");

  const [salvandoEdicao, setSalvandoEdicao] =
    useState(false);

  // =====================================================
  // URL DA FOTO
  // =====================================================

  async function obterUrlFoto(valor) {
    if (!valor) {
      return "";
    }

    const fotoValor = String(valor).trim();

    if (!fotoValor) {
      return "";
    }

    if (
      fotoValor.startsWith("http://") ||
      fotoValor.startsWith("https://")
    ) {
      return fotoValor;
    }

    const caminho = fotoValor.replace(/^\/+/, "");

    // Tentar URL pública primeiro
    const { data: publicData } =
      supabase.storage
        .from(BUCKET)
        .getPublicUrl(caminho);

    if (publicData?.publicUrl) {
      return publicData.publicUrl;
    }

    // Tentar URL assinada
    const { data, error } =
      await supabase.storage
        .from(BUCKET)
        .createSignedUrl(
          caminho,
          60 * 60 * 24
        );

    if (error) {
      console.error(
        "Erro ao gerar URL da foto:",
        error
      );

      return "";
    }

    return data?.signedUrl || "";
  }

  // =====================================================
  // CARREGAR BARBEIROS
  // =====================================================

  useEffect(() => {
    carregarBarbeiros();
  }, []);

  async function carregarBarbeiros() {
    setCarregando(true);
    setErro("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from(TABELA)
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Erro ao carregar barbeiros:",
          error
        );

        setErro(
          "Não foi possível carregar os barbeiros.\n\n" +
            error.message
        );

        return;
      }

      const lista = [];

      for (
        let index = 0;
        index < (data || []).length;
        index++
      ) {
        const barbeiro = data[index];

        const fotoUrl =
          await obterUrlFoto(
            barbeiro.foto
          );

        lista.push({
          ...barbeiro,
          _key:
            barbeiro.id ||
            `barbeiro-${index}`,
          fotoUrl,
        });
      }

      setBarbeiros(lista);
    } catch (error) {
      console.error(
        "Erro inesperado:",
        error
      );

      setErro(
        "Erro inesperado ao carregar os barbeiros."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // FORMATAR WHATSAPP
  // =====================================================

  function formatarWhatsapp(valor) {
    return String(valor)
      .replace(/\D/g, "")
      .substring(0, 11);
  }

  // =====================================================
  // SELECIONAR FOTO - CADASTRO
  // =====================================================

  function selecionarFoto(e) {
    const arquivo = e.target.files?.[0];

    setErro("");
    setSucesso("");

    if (!arquivo) {
      setFoto(null);
      setPreviewFoto("");
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      setErro(
        "Selecione somente arquivos de imagem."
      );

      e.target.value = "";
      setFoto(null);
      setPreviewFoto("");

      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro(
        "A foto deve ter no máximo 5 MB."
      );

      e.target.value = "";
      setFoto(null);
      setPreviewFoto("");

      return;
    }

    setFoto(arquivo);

    const url =
      URL.createObjectURL(arquivo);

    setPreviewFoto(url);
  }

  // =====================================================
  // SELECIONAR FOTO - EDIÇÃO
  // =====================================================

  function selecionarFotoEdicao(e) {
    const arquivo = e.target.files?.[0];

    setErro("");
    setSucesso("");

    if (!arquivo) {
      setFotoEdicao(null);
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      setErro(
        "Selecione somente arquivos de imagem."
      );

      e.target.value = "";
      setFotoEdicao(null);

      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro(
        "A foto deve ter no máximo 5 MB."
      );

      e.target.value = "";
      setFotoEdicao(null);

      return;
    }

    setFotoEdicao(arquivo);

    const url =
      URL.createObjectURL(arquivo);

    setPreviewFotoEdicao(url);
  }

  // =====================================================
  // OBTER CAMINHO DA FOTO
  // =====================================================

  function obterCaminhoFoto(valor) {
    if (!valor) {
      return null;
    }

    const fotoValor =
      String(valor).trim();

    if (!fotoValor) {
      return null;
    }

    if (
      !fotoValor.startsWith("http://") &&
      !fotoValor.startsWith("https://")
    ) {
      return fotoValor.replace(
        /^\/+/,
        ""
      );
    }

    try {
      const url = new URL(
        fotoValor
      );

      const marcador =
        `/storage/v1/object/public/${BUCKET}/`;

      const indice =
        url.pathname.indexOf(
          marcador
        );

      if (indice !== -1) {
        return decodeURIComponent(
          url.pathname.substring(
            indice + marcador.length
          )
        );
      }

      return null;
    } catch {
      return null;
    }
  }

  // =====================================================
  // UPLOAD DA FOTO
  // =====================================================

  async function enviarFoto(arquivo) {
    if (!arquivo) {
      return null;
    }

    let extensao =
      arquivo.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    if (
      ![
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
      ].includes(extensao)
    ) {
      extensao = "jpg";
    }

    const nomeArquivo =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extensao}`;

    const {
      error,
    } = await supabase.storage
      .from(BUCKET)
      .upload(
        nomeArquivo,
        arquivo,
        {
          cacheControl: "3600",
          upsert: false,
          contentType:
            arquivo.type,
        }
      );

    if (error) {
      throw error;
    }

    return nomeArquivo;
  }

  // =====================================================
  // CADASTRAR BARBEIRO
  // =====================================================

  async function cadastrarBarbeiro(e) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!nome.trim()) {
      setErro(
        "Digite o nome do barbeiro."
      );

      return;
    }

    const whatsappNumeros =
      whatsapp.replace(/\D/g, "");

    if (
      whatsappNumeros.length < 10
    ) {
      setErro(
        "Digite um WhatsApp válido com DDD."
      );

      return;
    }

    if (!foto) {
      setErro(
        "Selecione uma foto."
      );

      return;
    }

    setSalvando(true);

    let caminhoFoto = null;

    try {
      caminhoFoto =
        await enviarFoto(foto);

      const {
        error,
      } = await supabase
        .from(TABELA)
        .insert([
          {
            nome:
              nome.trim(),

            whatsapp:
              whatsappNumeros,

            foto:
              caminhoFoto,

            ativo: true,
          },
        ]);

      if (error) {
        if (caminhoFoto) {
          await supabase.storage
            .from(BUCKET)
            .remove([
              caminhoFoto,
            ]);
        }

        throw error;
      }

      setSucesso(
        "Barbeiro cadastrado com sucesso!"
      );

      setNome("");
      setWhatsapp("");
      setFoto(null);
      setPreviewFoto("");

      const input =
        document.getElementById(
          "foto-barbeiro"
        );

      if (input) {
        input.value = "";
      }

      await carregarBarbeiros();
    } catch (error) {
      console.error(
        "Erro ao cadastrar:",
        error
      );

      setErro(
        "Não foi possível cadastrar o barbeiro.\n\n" +
          error.message
      );
    } finally {
      setSalvando(false);
    }
  }

  // =====================================================
  // ABRIR EDIÇÃO
  // =====================================================

  function abrirEdicao(barbeiro) {
    setErro("");
    setSucesso("");

    setBarbeiroEditando(
      barbeiro
    );

    setNomeEdicao(
      barbeiro.nome || ""
    );

    setWhatsappEdicao(
      barbeiro.whatsapp || ""
    );

    setFotoEdicao(null);

    setPreviewFotoEdicao(
      barbeiro.fotoUrl || ""
    );

    setEditando(true);

    // Rolar para o formulário
    setTimeout(() => {
      document
        .getElementById(
          "formulario-edicao"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  // =====================================================
  // CANCELAR EDIÇÃO
  // =====================================================

  function cancelarEdicao() {
    setEditando(false);

    setBarbeiroEditando(null);

    setNomeEdicao("");
    setWhatsappEdicao("");
    setFotoEdicao(null);
    setPreviewFotoEdicao("");
  }

  // =====================================================
  // SALVAR EDIÇÃO
  // =====================================================

  async function salvarEdicao(e) {
    e.preventDefault();

    if (!barbeiroEditando) {
      return;
    }

    setErro("");
    setSucesso("");

    if (!nomeEdicao.trim()) {
      setErro(
        "Digite o nome do barbeiro."
      );

      return;
    }

    const whatsappNumeros =
      whatsappEdicao.replace(
        /\D/g,
        ""
      );

    if (
      whatsappNumeros.length < 10
    ) {
      setErro(
        "Digite um WhatsApp válido com DDD."
      );

      return;
    }

    setSalvandoEdicao(true);

    let novaFoto = null;

    try {
      // =================================================
      // SE ESCOLHEU NOVA FOTO
      // =================================================

      if (fotoEdicao) {
        novaFoto =
          await enviarFoto(
            fotoEdicao
          );
      }

      // =================================================
      // ATUALIZAR BANCO
      // =================================================

      const dadosAtualizacao = {
        nome:
          nomeEdicao.trim(),

        whatsapp:
          whatsappNumeros,
      };

      if (novaFoto) {
        dadosAtualizacao.foto =
          novaFoto;
      }

      const {
        error,
      } = await supabase
        .from(TABELA)
        .update(
          dadosAtualizacao
        )
        .eq(
          "id",
          barbeiroEditando.id
        );

      // =================================================
      // ERRO
      // =================================================

      if (error) {
        if (novaFoto) {
          await supabase.storage
            .from(BUCKET)
            .remove([
              novaFoto,
            ]);
        }

        throw error;
      }

      // =================================================
      // APAGAR FOTO ANTIGA
      // =================================================

      if (novaFoto) {
        const fotoAntiga =
          obterCaminhoFoto(
            barbeiroEditando.foto
          );

        if (
          fotoAntiga &&
          fotoAntiga !== novaFoto
        ) {
          const {
            error:
              erroRemover,
          } =
            await supabase.storage
              .from(BUCKET)
              .remove([
                fotoAntiga,
              ]);

          if (erroRemover) {
            console.warn(
              "Não foi possível apagar a foto antiga:",
              erroRemover
            );
          }
        }
      }

      setSucesso(
        "Barbeiro atualizado com sucesso!"
      );

      cancelarEdicao();

      await carregarBarbeiros();
    } catch (error) {
      console.error(
        "Erro ao editar barbeiro:",
        error
      );

      setErro(
        "Não foi possível atualizar o barbeiro.\n\n" +
          error.message
      );
    } finally {
      setSalvandoEdicao(false);
    }
  }

  // =====================================================
  // ALTERAR STATUS
  // =====================================================

  async function alterarStatus(
    barbeiro
  ) {
    setErro("");
    setSucesso("");

    try {
      const {
        error,
      } = await supabase
        .from(TABELA)
        .update({
          ativo:
            !barbeiro.ativo,
        })
        .eq(
          "id",
          barbeiro.id
        );

      if (error) {
        throw error;
      }

      setSucesso(
        "Status atualizado com sucesso."
      );

      await carregarBarbeiros();
    } catch (error) {
      console.error(
        error
      );

      setErro(
        "Não foi possível alterar o status.\n\n" +
          error.message
      );
    }
  }

  // =====================================================
  // EXCLUIR BARBEIRO
  // =====================================================

  async function excluirBarbeiro(
    barbeiro
  ) {
    const confirmar =
      window.confirm(
        `Tem certeza que deseja excluir ${barbeiro.nome}?`
      );

    if (!confirmar) {
      return;
    }

    setErro("");
    setSucesso("");

    try {
      const caminhoFoto =
        obterCaminhoFoto(
          barbeiro.foto
        );

      const {
        error:
          erroBanco,
      } = await supabase
        .from(TABELA)
        .delete()
        .eq(
          "id",
          barbeiro.id
        );

      if (erroBanco) {
        throw erroBanco;
      }

      if (caminhoFoto) {
        await supabase.storage
          .from(BUCKET)
          .remove([
            caminhoFoto,
          ]);
      }

      setSucesso(
        "Barbeiro excluído com sucesso."
      );

      await carregarBarbeiros();
    } catch (error) {
      console.error(
        "Erro ao excluir:",
        error
      );

      setErro(
        "Não foi possível excluir o barbeiro.\n\n" +
          error.message
      );
    }
  }

  // =====================================================
  // TELA
  // =====================================================

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-500">
                Painel administrativo
              </p>

              <h1 className="mt-2 text-3xl font-black">
                Barbeiros
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Cadastre e gerencie os barbeiros da barbearia.
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/admin/painel";
              }}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-3 text-sm font-black transition hover:border-amber-500 hover:text-amber-500"
            >
              Voltar ao painel
            </button>

          </div>

        </header>

        {/* =================================================
            MENSAGEM DE ERRO
        ================================================= */}

        {erro && (
          <div className="mb-5 whitespace-pre-line rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {erro}
          </div>
        )}

        {/* =================================================
            MENSAGEM DE SUCESSO
        ================================================= */}

        {sucesso && (
          <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {sucesso}
          </div>
        )}

        {/* =================================================
            FORMULÁRIO DE EDIÇÃO
        ================================================= */}

        {editando && barbeiroEditando && (
          <section
            id="formulario-edicao"
            className="mb-8 rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 shadow-2xl"
          >

            <div className="mb-6">

              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Editando barbeiro
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {barbeiroEditando.nome}
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Altere o nome, WhatsApp ou foto.
              </p>

            </div>

            <form
              onSubmit={salvarEdicao}
              className="grid gap-5 md:grid-cols-2"
            >

              {/* NOME */}

              <div>

                <label className="mb-2 block text-xs font-bold text-zinc-300">
                  Nome do barbeiro
                </label>

                <input
                  type="text"
                  value={nomeEdicao}
                  onChange={(e) =>
                    setNomeEdicao(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none focus:border-amber-500"
                />

              </div>

              {/* WHATSAPP */}

              <div>

                <label className="mb-2 block text-xs font-bold text-zinc-300">
                  WhatsApp
                </label>

                <input
                  type="tel"
                  value={whatsappEdicao}
                  onChange={(e) =>
                    setWhatsappEdicao(
                      formatarWhatsapp(
                        e.target.value
                      )
                    )
                  }
                  maxLength={11}
                  className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none focus:border-amber-500"
                />

              </div>

              {/* FOTO */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-xs font-bold text-zinc-300">
                  Nova foto
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={
                    selecionarFotoEdicao
                  }
                  className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-bold file:text-black"
                />

                <p className="mt-2 text-[10px] text-zinc-500">
                  Se não escolher uma nova foto, a foto atual será mantida.
                </p>

              </div>

              {/* PRÉVIA */}

              {previewFotoEdicao && (
                <div className="md:col-span-2">

                  <p className="mb-2 text-xs font-bold text-zinc-300">
                    Foto
                  </p>

                  <img
                    src={
                      previewFotoEdicao
                    }
                    alt="Foto do barbeiro"
                    className="h-40 w-40 rounded-2xl object-cover"
                  />

                </div>
              )}

              {/* BOTÕES */}

              <div className="flex gap-3 md:col-span-2">

                <button
                  type="submit"
                  disabled={
                    salvandoEdicao
                  }
                  className="flex-1 rounded-xl bg-amber-500 py-4 text-sm font-black tracking-widest text-black transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {salvandoEdicao
                    ? "SALVANDO..."
                    : "SALVAR ALTERAÇÕES"}
                </button>

                <button
                  type="button"
                  onClick={
                    cancelarEdicao
                  }
                  disabled={
                    salvandoEdicao
                  }
                  className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-sm font-black text-white transition hover:border-red-500 hover:text-red-400"
                >
                  CANCELAR
                </button>

              </div>

            </form>

          </section>
        )}

        {/* =================================================
            CADASTRAR
        ================================================= */}

        <section className="mb-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">

          <div className="mb-6">

            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
              Novo cadastro
            </p>

            <h2 className="mt-2 text-xl font-black">
              Cadastrar barbeiro
            </h2>

          </div>

          <form
            onSubmit={
              cadastrarBarbeiro
            }
            className="grid gap-5 md:grid-cols-2"
          >

            {/* NOME */}

            <div>

              <label className="mb-2 block text-xs font-bold text-zinc-300">
                Nome do barbeiro
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) =>
                  setNome(
                    e.target.value
                  )
                }
                placeholder="Ex: Carlos"
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500"
              />

            </div>

            {/* WHATSAPP */}

            <div>

              <label className="mb-2 block text-xs font-bold text-zinc-300">
                WhatsApp do barbeiro
              </label>

              <input
                type="tel"
                value={whatsapp}
                onChange={(e) =>
                  setWhatsapp(
                    formatarWhatsapp(
                      e.target.value
                    )
                  )
                }
                placeholder="Ex: 99985289973"
                maxLength={11}
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-500"
              />

            </div>

            {/* FOTO */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-xs font-bold text-zinc-300">
                Foto do barbeiro
              </label>

              <input
                id="foto-barbeiro"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={
                  selecionarFoto
                }
                className="w-full rounded-xl border border-zinc-700 bg-black p-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-bold file:text-black"
              />

              {previewFoto && (
                <div className="mt-4">

                  <img
                    src={previewFoto}
                    alt="Prévia"
                    className="h-32 w-32 rounded-xl object-cover"
                  />

                </div>
              )}

            </div>

            {/* CADASTRAR */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-xl bg-amber-500 py-4 text-sm font-black tracking-widest text-black transition hover:bg-amber-400 disabled:opacity-50"
              >
                {salvando
                  ? "CADASTRANDO..."
                  : "CADASTRAR BARBEIRO"}
              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            LISTA
        ================================================= */}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Equipe
              </p>

              <h2 className="mt-2 text-xl font-black">
                Barbeiros cadastrados
              </h2>

            </div>

            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-black">
              {barbeiros.length}
            </span>

          </div>

          {/* CARREGANDO */}

          {carregando ? (

            <div className="py-10 text-center text-sm text-zinc-500">
              Carregando barbeiros...
            </div>

          ) : barbeiros.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">

              <p className="text-sm font-bold text-zinc-400">
                Nenhum barbeiro cadastrado.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {barbeiros.map(
                (barbeiro) => (

                  <div
                    key={
                      barbeiro.id
                    }
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-black"
                  >

                    {/* FOTO */}

                    <div className="relative aspect-square overflow-hidden bg-zinc-900">

                      {barbeiro.fotoUrl ? (

                        <img
                          src={
                            barbeiro.fotoUrl
                          }
                          alt={
                            barbeiro.nome ||
                            "Barbeiro"
                          }
                          className="h-full w-full object-cover"
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center text-5xl text-zinc-700">
                          FOTO
                        </div>

                      )}

                    </div>

                    {/* DADOS */}

                    <div className="p-4">

                      <h3 className="text-lg font-black text-white">
                        {barbeiro.nome ||
                          "Barbeiro"}
                      </h3>

                      {barbeiro.whatsapp ? (

                        <a
                          href={`https://wa.me/${String(
                            barbeiro.whatsapp
                          ).replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-bold text-green-400"
                        >
                          WhatsApp:{" "}
                          {
                            barbeiro.whatsapp
                          }
                        </a>

                      ) : (

                        <p className="mt-2 text-xs text-zinc-600">
                          WhatsApp não cadastrado
                        </p>

                      )}

                      {/* STATUS */}

                      <p
                        className={`mt-2 text-[10px] font-black uppercase ${
                          barbeiro.ativo
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {barbeiro.ativo
                          ? "Ativo"
                          : "Inativo"}
                      </p>

                      {/* BOTÕES */}

                      <div className="mt-4 grid grid-cols-1 gap-2">

                        {/* EDITAR */}

                        <button
                          type="button"
                          onClick={() =>
                            abrirEdicao(
                              barbeiro
                            )
                          }
                          className="w-full rounded-lg bg-amber-500 py-3 text-xs font-black text-black transition hover:bg-amber-400"
                        >
                          EDITAR BARBEIRO
                        </button>

                        {/* ATIVAR / DESATIVAR */}

                        <button
                          type="button"
                          onClick={() =>
                            alterarStatus(
                              barbeiro
                            )
                          }
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 text-[10px] font-black text-zinc-300 transition hover:border-amber-500 hover:text-amber-500"
                        >
                          {barbeiro.ativo
                            ? "DESATIVAR"
                            : "ATIVAR"}
                        </button>

                        {/* EXCLUIR */}

                        <button
                          type="button"
                          onClick={() =>
                            excluirBarbeiro(
                              barbeiro
                            )
                          }
                          className="w-full rounded-lg border border-red-500/30 bg-red-500/5 py-2 text-[10px] font-black text-red-400 transition hover:bg-red-500/10"
                        >
                          EXCLUIR
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* VOLTAR */}

        <div className="py-8 text-center">

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/admin/painel";
            }}
            className="text-xs font-bold text-zinc-500 transition hover:text-amber-500"
          >
            Voltar para o painel administrativo
          </button>

        </div>

      </div>

    </main>
  );
}