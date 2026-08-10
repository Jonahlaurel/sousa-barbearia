"use client";

import { useEffect, useState } from "react";
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
// CONFIGURAÇÕES
// =====================================================

const BUCKET = "barbeiros";
const TABELA = "barbeiros";

// =====================================================
// COMPONENTE
// =====================================================

export default function Barbeiros() {
  // ===================================================
  // ESTADOS
  // ===================================================

  const [barbeiros, setBarbeiros] = useState([]);

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // ===================================================
  // GERAR URL DA FOTO
  // ===================================================

  async function obterUrlFoto(valor) {
    if (!valor) {
      return "";
    }

    const fotoValor = String(valor).trim();

    if (!fotoValor) {
      return "";
    }

    // -------------------------------------------------
    // Se já for uma URL completa
    // -------------------------------------------------

    if (
      fotoValor.startsWith("http://") ||
      fotoValor.startsWith("https://")
    ) {
      return fotoValor;
    }

    // -------------------------------------------------
    // Limpar caminho
    // -------------------------------------------------

    const caminho = fotoValor.replace(/^\/+/, "");

    console.log(
      "===================================="
    );

    console.log(
      "GERANDO URL DA FOTO"
    );

    console.log(
      "Bucket:",
      BUCKET
    );

    console.log(
      "Caminho:",
      caminho
    );

    // -------------------------------------------------
    // TENTAR URL ASSINADA
    // -------------------------------------------------

    const {
      data,
      error,
    } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(
        caminho,
        60 * 60 * 24
      );

    if (error) {
      console.error(
        "ERRO AO GERAR URL ASSINADA:",
        error
      );

      // ------------------------------------------------
      // TENTAR URL PÚBLICA COMO SEGUNDA OPÇÃO
      // ------------------------------------------------

      const {
        data: publicData,
      } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(caminho);

      const publicUrl =
        publicData?.publicUrl || "";

      console.log(
        "URL PÚBLICA:",
        publicUrl
      );

      console.log(
        "===================================="
      );

      return publicUrl;
    }

    const signedUrl =
      data?.signedUrl || "";

    console.log(
      "URL ASSINADA:",
      signedUrl
    );

    console.log(
      "===================================="
    );

    return signedUrl;
  }

  // ===================================================
  // CARREGAR BARBEIROS
  // ===================================================

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

      console.log(
        "BARBEIROS DO BANCO:",
        data
      );

      // =================================================
      // GERAR URLs DAS FOTOS
      // =================================================

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
            `barbeiro-${index}-${Date.now()}`,

          fotoUrl,
        });
      }

      console.log(
        "LISTA FINAL:",
        lista
      );

      setBarbeiros(lista);
    } catch (error) {
      console.error(
        "Erro inesperado:",
        error
      );

      setErro(
        "Erro inesperado ao carregar os barbeiros.\n\n" +
          (error?.message || "")
      );
    } finally {
      setCarregando(false);
    }
  }

  // ===================================================
  // FORMATAR WHATSAPP
  // ===================================================

  function formatarWhatsapp(valor) {
    return String(valor)
      .replace(/\D/g, "")
      .substring(0, 11);
  }

  // ===================================================
  // SELECIONAR FOTO
  // ===================================================

  function selecionarFoto(e) {
    const arquivo =
      e.target.files?.[0];

    setErro("");
    setSucesso("");

    if (!arquivo) {
      setFoto(null);
      setPreviewFoto("");
      return;
    }

    if (
      !arquivo.type.startsWith(
        "image/"
      )
    ) {
      setErro(
        "Selecione somente arquivos de imagem."
      );

      e.target.value = "";
      setFoto(null);
      setPreviewFoto("");

      return;
    }

    if (
      arquivo.size >
      5 * 1024 * 1024
    ) {
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
      URL.createObjectURL(
        arquivo
      );

    setPreviewFoto(url);

    console.log(
      "FOTO SELECIONADA:",
      arquivo.name
    );
  }

  // ===================================================
  // CADASTRAR BARBEIRO
  // ===================================================

  async function cadastrarBarbeiro(e) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    // =================================================
    // VALIDAÇÕES
    // =================================================

    if (!nome.trim()) {
      setErro(
        "Digite o nome do barbeiro."
      );

      return;
    }

    const whatsappNumeros =
      whatsapp.replace(
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

    if (!foto) {
      setErro(
        "Selecione uma foto."
      );

      return;
    }

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      setErro(
        "As variáveis do Supabase não foram encontradas."
      );

      return;
    }

    setSalvando(true);

    let caminhoFoto = "";

    try {
      // =================================================
      // EXTENSÃO
      // =================================================

      let extensao =
        foto.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

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

      // =================================================
      // NOME ÚNICO
      // =================================================

      const nomeArquivo =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}.${extensao}`;

      caminhoFoto =
        nomeArquivo;

      console.log(
        "===================================="
      );

      console.log(
        "INICIANDO UPLOAD"
      );

      console.log(
        "Bucket:",
        BUCKET
      );

      console.log(
        "Arquivo:",
        caminhoFoto
      );

      console.log(
        "Tipo:",
        foto.type
      );

      console.log(
        "Tamanho:",
        foto.size
      );

      // =================================================
      // UPLOAD
      // =================================================

      const {
        data: uploadData,
        error: erroUpload,
      } = await supabase.storage
        .from(BUCKET)
        .upload(
          caminhoFoto,
          foto,
          {
            cacheControl:
              "3600",

            upsert: false,

            contentType:
              foto.type,
          }
        );

      if (erroUpload) {
        console.error(
          "ERRO NO UPLOAD:",
          erroUpload
        );

        setErro(
          "Não foi possível enviar a foto.\n\n" +
            erroUpload.message
        );

        return;
      }

      console.log(
        "UPLOAD REALIZADO:",
        uploadData
      );

      // =================================================
      // GERAR URL
      // =================================================

      const fotoUrl =
        await obterUrlFoto(
          caminhoFoto
        );

      console.log(
        "URL DA FOTO:",
        fotoUrl
      );

      // =================================================
      // SALVAR NO BANCO
      // =================================================

      const {
        data: novoBarbeiro,
        error: erroBanco,
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
        ])
        .select()
        .single();

      // =================================================
      // ERRO BANCO
      // =================================================

      if (erroBanco) {
        console.error(
          "ERRO AO SALVAR NO BANCO:",
          erroBanco
        );

        // Apagar foto
        await supabase.storage
          .from(BUCKET)
          .remove([
            caminhoFoto,
          ]);

        if (
          erroBanco.code ===
          "42501"
        ) {
          setErro(
            "O Supabase bloqueou o cadastro pela RLS.\n\n" +
              "É necessário permitir INSERT na tabela barbeiros."
          );

          return;
        }

        setErro(
          "Não foi possível cadastrar o barbeiro.\n\n" +
            erroBanco.message
        );

        return;
      }

      console.log(
        "BARBEIRO CADASTRADO:",
        novoBarbeiro
      );

      // =================================================
      // SUCESSO
      // =================================================

      setSucesso(
        "Barbeiro cadastrado com sucesso!"
      );

      setNome("");
      setWhatsapp("");
      setFoto(null);
      setPreviewFoto("");

      const inputFoto =
        document.getElementById(
          "foto-barbeiro"
        );

      if (inputFoto) {
        inputFoto.value = "";
      }

      // Recarregar lista
      await carregarBarbeiros();
    } catch (error) {
      console.error(
        "ERRO INESPERADO:",
        error
      );

      setErro(
        "Ocorreu um erro inesperado.\n\n" +
          (error?.message || "")
      );
    } finally {
      setSalvando(false);
    }
  }

  // ===================================================
  // ALTERAR STATUS
  // ===================================================

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
        console.error(
          "Erro ao alterar status:",
          error
        );

        setErro(
          "Não foi possível alterar o status.\n\n" +
            error.message
        );

        return;
      }

      setSucesso(
        "Status atualizado com sucesso."
      );

      await carregarBarbeiros();
    } catch (error) {
      console.error(
        "Erro ao alterar status:",
        error
      );

      setErro(
        "Erro ao alterar o status."
      );
    }
  }

  // ===================================================
  // EXCLUIR BARBEIRO
  // ===================================================

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
      let caminhoFoto = null;

      if (barbeiro.foto) {
        const fotoValor =
          String(
            barbeiro.foto
          ).trim();

        // Se for caminho
        if (
          !fotoValor.startsWith(
            "http://"
          ) &&
          !fotoValor.startsWith(
            "https://"
          )
        ) {
          caminhoFoto =
            fotoValor.replace(
              /^\/+/,
              ""
            );
        }

        // Se for URL
        else {
          try {
            const url =
              new URL(
                fotoValor
              );

            const marcador =
              `/storage/v1/object/public/${BUCKET}/`;

            const indice =
              url.pathname.indexOf(
                marcador
              );

            if (
              indice !== -1
            ) {
              caminhoFoto =
                decodeURIComponent(
                  url.pathname.substring(
                    indice +
                      marcador.length
                  )
                );
            }
          } catch (error) {
            console.warn(
              "Erro ao identificar caminho da foto:",
              error
            );
          }
        }
      }

      // =================================================
      // EXCLUIR BANCO
      // =================================================

      const {
        error: erroBanco,
      } = await supabase
        .from(TABELA)
        .delete()
        .eq(
          "id",
          barbeiro.id
        );

      if (erroBanco) {
        console.error(
          "Erro ao excluir barbeiro:",
          erroBanco
        );

        setErro(
          "Não foi possível excluir o barbeiro.\n\n" +
            erroBanco.message
        );

        return;
      }

      // =================================================
      // EXCLUIR FOTO
      // =================================================

      if (caminhoFoto) {
        const {
          error: erroFoto,
        } = await supabase.storage
          .from(BUCKET)
          .remove([
            caminhoFoto,
          ]);

        if (erroFoto) {
          console.warn(
            "Erro ao apagar foto:",
            erroFoto
          );
        }
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
        "Erro ao excluir o barbeiro."
      );
    }
  }

  // ===================================================
  // TELA
  // ===================================================

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
              ← Voltar ao painel
            </button>

          </div>

        </header>

        {/* =================================================
            ERRO
        ================================================= */}

        {erro && (
          <div className="mb-5 whitespace-pre-line rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {erro}
          </div>
        )}

        {/* =================================================
            SUCESSO
        ================================================= */}

        {sucesso && (
          <div className="mb-5 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {sucesso}
          </div>
        )}

        {/* =================================================
            CADASTRO
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
            onSubmit={cadastrarBarbeiro}
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
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
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
                className="w-full rounded-xl border border-zinc-700 bg-black p-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-500"
              />

              <p className="mt-2 text-[10px] text-zinc-500">
                Digite somente números com DDD.
              </p>

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

              <p className="mt-2 text-[10px] text-zinc-500">
                JPG, PNG, WEBP ou GIF • Máximo 5 MB
              </p>

              {/* PRÉVIA */}

              {previewFoto && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-zinc-800 bg-black p-3">

                  <img
                    src={previewFoto}
                    alt="Prévia da foto"
                    className="h-24 w-24 rounded-xl object-cover"
                  />

                  <div>

                    <p className="text-sm font-bold text-white">
                      Foto selecionada
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      A foto será enviada ao cadastrar.
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* BOTÃO */}

            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-xl bg-amber-500 py-4 text-sm font-black tracking-widest text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando
                  ? "CADASTRANDO..."
                  : "CADASTRAR BARBEIRO"}
              </button>

            </div>

          </form>

        </section>

        {/* =================================================
            LISTA DE BARBEIROS
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

              <div className="text-4xl">
                💈
              </div>

              <p className="mt-3 text-sm font-bold text-zinc-400">
                Nenhum barbeiro cadastrado.
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                Cadastre o primeiro barbeiro acima.
              </p>

            </div>

          ) : (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {barbeiros.map(
                (barbeiro) => (

                  <div
                    key={
                      barbeiro._key
                    }
                    className="overflow-hidden rounded-2xl border border-zinc-800 bg-black"
                  >

                    {/* =================================================
                        FOTO
                    ================================================= */}

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
                          className="block h-full w-full object-cover"
                          loading="lazy"
                          onLoad={() => {
                            console.log(
                              "================================"
                            );

                            console.log(
                              "✅ FOTO CARREGADA"
                            );

                            console.log(
                              "Barbeiro:",
                              barbeiro.nome
                            );

                            console.log(
                              "URL:",
                              barbeiro.fotoUrl
                            );

                            console.log(
                              "================================"
                            );
                          }}
                          onError={(e) => {
                            console.error(
                              "================================"
                            );

                            console.error(
                              "❌ ERRO AO CARREGAR FOTO"
                            );

                            console.error(
                              "Barbeiro:",
                              barbeiro.nome
                            );

                            console.error(
                              "Foto no banco:",
                              barbeiro.foto
                            );

                            console.error(
                              "URL:",
                              barbeiro.fotoUrl
                            );

                            console.error(
                              "================================"
                            );

                            e.currentTarget.style.display =
                              "none";

                            const pai =
                              e.currentTarget.parentElement;

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
                                "flex h-full w-full items-center justify-center text-6xl";

                              fallback.textContent =
                                "💈";

                              pai.appendChild(
                                fallback
                              );
                            }
                          }}
                        />

                      ) : (

                        <div className="flex h-full w-full items-center justify-center text-6xl">
                          💈
                        </div>

                      )}

                    </div>

                    {/* =================================================
                        DADOS
                    ================================================= */}

                    <div className="p-4">

                      <h3 className="font-black text-white">
                        {barbeiro.nome ||
                          "Barbeiro"}
                      </h3>

                      {/* WHATSAPP */}

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
                          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300"
                        >
                          💬{" "}
                          {barbeiro.whatsapp}
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
                          ? "● Ativo"
                          : "● Inativo"}
                      </p>

                      {/* BOTÕES */}

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            alterarStatus(
                              barbeiro
                            )
                          }
                          className="rounded-lg border border-zinc-700 bg-zinc-900 py-2 text-[10px] font-black text-zinc-300 transition hover:border-amber-500 hover:text-amber-500"
                        >
                          {barbeiro.ativo
                            ? "DESATIVAR"
                            : "ATIVAR"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirBarbeiro(
                              barbeiro
                            )
                          }
                          className="rounded-lg border border-red-500/30 bg-red-500/5 py-2 text-[10px] font-black text-red-400 transition hover:bg-red-500/10"
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

        {/* =================================================
            VOLTAR
        ================================================= */}

        <div className="py-8 text-center">

          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/admin/painel";
            }}
            className="text-xs font-bold text-zinc-500 transition hover:text-amber-500"
          >
            ← Voltar para o painel administrativo
          </button>

        </div>

      </div>
    </main>
  );
}