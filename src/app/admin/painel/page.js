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

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// =====================================================
// PAINEL ADMIN
// =====================================================

export default function PainelAdmin() {
  // ===================================================
  // LOGIN
  // ===================================================

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // ===================================================
  // ABA ATUAL
  // ===================================================

  const [abaAtual, setAbaAtual] =
    useState("agendamentos");

  // ===================================================
  // AGENDAMENTOS
  // ===================================================

  const [agendamentos, setAgendamentos] = useState([]);
  const [carregandoAgendamentos, setCarregandoAgendamentos] =
    useState(false);

  const [erroAgendamentos, setErroAgendamentos] =
    useState("");

  const [
    mostrarFormularioAgendamento,
    setMostrarFormularioAgendamento,
  ] = useState(false);

  const [
    editandoAgendamento,
    setEditandoAgendamento,
  ] = useState(null);

  const [nomeAgendamento, setNomeAgendamento] =
    useState("");

  const [telefoneAgendamento, setTelefoneAgendamento] =
    useState("");

  const [servicoAgendamento, setServicoAgendamento] =
    useState("");

  const [dataAgendamento, setDataAgendamento] =
    useState("");

  const [horarioAgendamento, setHorarioAgendamento] =
    useState("");

  const [
    colaboradorAgendamento,
    setColaboradorAgendamento,
  ] = useState("");

  const [
    statusAgendamento,
    setStatusAgendamento,
  ] = useState("pendente");

  const [
    salvandoAgendamento,
    setSalvandoAgendamento,
  ] = useState(false);

  // ===================================================
  // CLIENTES
  // ===================================================

  const [clientes, setClientes] = useState([]);
  const [carregandoClientes, setCarregandoClientes] =
    useState(false);

  const [pesquisaCliente, setPesquisaCliente] =
    useState("");

  const [mostrarFormularioCliente, setMostrarFormularioCliente] =
    useState(false);

  const [editandoCliente, setEditandoCliente] =
    useState(null);

  const [nomeCliente, setNomeCliente] =
    useState("");

  const [telefoneCliente, setTelefoneCliente] =
    useState("");

  const [salvandoCliente, setSalvandoCliente] =
    useState(false);

  // ===================================================
  // ASSINANTES
  // ===================================================

  const [assinantes, setAssinantes] = useState([]);

  const [carregandoAssinantes, setCarregandoAssinantes] =
    useState(false);

  const [pesquisaAssinante, setPesquisaAssinante] =
    useState("");

  const [
    mostrarFormularioAssinante,
    setMostrarFormularioAssinante,
  ] = useState(false);

  const [
    editandoAssinante,
    setEditandoAssinante,
  ] = useState(null);

  const [nomeAssinante, setNomeAssinante] =
    useState("");

  const [telefoneAssinante, setTelefoneAssinante] =
    useState("");

  const [planoAssinante, setPlanoAssinante] =
    useState("Mensal");

  const [valorAssinante, setValorAssinante] =
    useState("");

  const [dataInicioAssinante, setDataInicioAssinante] =
    useState("");

  const [
    dataVencimentoAssinante,
    setDataVencimentoAssinante,
  ] = useState("");

  const [statusAssinante, setStatusAssinante] =
    useState("ativo");

  const [salvandoAssinante, setSalvandoAssinante] =
    useState(false);

  // ===================================================
  // CONFIGURAÇÃO SUPABASE
  // ===================================================

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase não configurado.");
    }
  }, []);

  // ===================================================
  // VERIFICAR ACESSO
  // ===================================================

  useEffect(() => {
    if (!supabase) {
      setCarregando(false);
      return;
    }

    let ativo = true;

    async function verificarAcesso() {
      try {
        setCarregando(true);

        const {
          data: { user },
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario || !user) {
          window.location.href = "/admin";
          return;
        }

        const {
          data: administrador,
          error: erroAdmin,
        } = await supabase
          .from("administradores")
          .select("id, nome, ativo")
          .eq("user_id", user.id)
          .eq("ativo", true)
          .maybeSingle();

        if (erroAdmin || !administrador) {
          await supabase.auth.signOut();
          window.location.href = "/admin";
          return;
        }

        if (!ativo) return;

        setUsuario({
          ...user,
          nome: administrador.nome,
        });
      } catch (erro) {
        console.error(
          "Erro ao verificar acesso:",
          erro
        );

        window.location.href = "/admin";
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    verificarAcesso();

    return () => {
      ativo = false;
    };
  }, []);

  // ===================================================
  // BUSCAR AGENDAMENTOS
  // ===================================================

  async function buscarAgendamentos() {
    if (!supabase) return;

    setCarregandoAgendamentos(true);
    setErroAgendamentos("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("Agendamentos")
        .select(
          '"ID", "Nome", "Serviço", "Data", "Horário", "Telefone", "Colaborador", "status"'
        )
        .order("Data", {
          ascending: true,
        })
        .order("Horário", {
          ascending: true,
        });

      if (error) {
        console.error(error);
        setAgendamentos([]);
        setErroAgendamentos(
          error.message
        );
        return;
      }

      setAgendamentos(
        Array.isArray(data) ? data : []
      );
    } catch (erro) {
      console.error(erro);

      setAgendamentos([]);

      setErroAgendamentos(
        erro?.message ||
          "Erro ao carregar agendamentos."
      );
    } finally {
      setCarregandoAgendamentos(false);
    }
  }

  // ===================================================
  // BUSCAR CLIENTES
  // ===================================================

  async function buscarClientes() {
    if (!supabase) return;

    setCarregandoClientes(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("clientes")
        .select(
          "id, nome, telefone, created_at"
        )
        .order("nome", {
          ascending: true,
        });

      if (error) {
        console.error(error);

        alert(
          "Erro ao carregar clientes.\n\n" +
            error.message
        );

        return;
      }

      setClientes(
        Array.isArray(data) ? data : []
      );
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao carregar clientes."
      );
    } finally {
      setCarregandoClientes(false);
    }
  }

  // ===================================================
  // BUSCAR ASSINANTES
  // ===================================================

  async function buscarAssinantes() {
    if (!supabase) return;

    setCarregandoAssinantes(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("assinantes")
        .select(
          "id, nome, telefone, plano, valor, data_inicio, data_vencimento, status, created_at"
        )
        .order("nome", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Erro ao buscar assinantes:",
          error
        );

        alert(
          "Erro ao carregar assinantes.\n\n" +
            error.message
        );

        return;
      }

      setAssinantes(
        Array.isArray(data) ? data : []
      );
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao carregar assinantes."
      );
    } finally {
      setCarregandoAssinantes(false);
    }
  }

  // ===================================================
  // CARREGAMENTO INICIAL
  // ===================================================

  useEffect(() => {
    if (!usuario || !supabase) return;

    buscarAgendamentos();
    buscarClientes();
    buscarAssinantes();
  }, [usuario]);

  // ===================================================
  // REALTIME AGENDAMENTOS
  // ===================================================

  useEffect(() => {
    if (!usuario || !supabase) return;

    const canal =
      supabase
        .channel("agendamentos-admin")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "Agendamentos",
          },
          () => {
            buscarAgendamentos();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuario]);

  // ===================================================
  // REALTIME ASSINANTES
  // ===================================================

  useEffect(() => {
    if (!usuario || !supabase) return;

    const canal =
      supabase
        .channel("assinantes-admin")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "assinantes",
          },
          () => {
            buscarAssinantes();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuario]);

  // ===================================================
  // NOVO AGENDAMENTO
  // ===================================================

  function novoAgendamento() {
    setEditandoAgendamento(null);

    setNomeAgendamento("");
    setTelefoneAgendamento("");
    setServicoAgendamento("");
    setDataAgendamento("");
    setHorarioAgendamento("");
    setColaboradorAgendamento("");
    setStatusAgendamento("pendente");

    setMostrarFormularioAgendamento(true);
  }

  // ===================================================
  // EDITAR AGENDAMENTO
  // ===================================================

  function editarAgendamento(agendamento) {
    if (!agendamento) return;

    if (
      agendamento.ID === null ||
      agendamento.ID === undefined ||
      agendamento.ID === ""
    ) {
      alert(
        "Este agendamento não possui ID."
      );

      return;
    }

    setEditandoAgendamento(agendamento);

    setNomeAgendamento(
      agendamento.Nome || ""
    );

    setTelefoneAgendamento(
      agendamento.Telefone || ""
    );

    setServicoAgendamento(
      agendamento.Serviço || ""
    );

    setDataAgendamento(
      agendamento.Data || ""
    );

    setHorarioAgendamento(
      agendamento.Horário || ""
    );

    setColaboradorAgendamento(
      agendamento.Colaborador || ""
    );

    setStatusAgendamento(
      agendamento.status || "pendente"
    );

    setMostrarFormularioAgendamento(true);
  }

  // ===================================================
  // CANCELAR AGENDAMENTO
  // ===================================================

  function cancelarFormularioAgendamento() {
    setMostrarFormularioAgendamento(false);
    setEditandoAgendamento(null);

    setNomeAgendamento("");
    setTelefoneAgendamento("");
    setServicoAgendamento("");
    setDataAgendamento("");
    setHorarioAgendamento("");
    setColaboradorAgendamento("");
    setStatusAgendamento("pendente");
  }

  // ===================================================
  // SALVAR AGENDAMENTO
  // ===================================================

  async function salvarAgendamento(e) {
    e.preventDefault();

    if (!supabase) {
      alert("Supabase não configurado.");
      return;
    }

    if (!nomeAgendamento.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    if (!telefoneAgendamento.trim()) {
      alert("Informe o telefone.");
      return;
    }

    if (!servicoAgendamento.trim()) {
      alert("Informe o serviço.");
      return;
    }

    if (!dataAgendamento) {
      alert("Informe a data.");
      return;
    }

    if (!horarioAgendamento) {
      alert("Informe o horário.");
      return;
    }

    if (salvandoAgendamento) return;

    setSalvandoAgendamento(true);

    try {
      const dados = {
        Nome: nomeAgendamento.trim(),
        Telefone:
          telefoneAgendamento.trim(),
        Serviço:
          servicoAgendamento.trim(),
        Data: dataAgendamento,
        Horário: horarioAgendamento,
        Colaborador:
          colaboradorAgendamento.trim() ||
          null,
        status:
          statusAgendamento ||
          "pendente",
      };

      if (editandoAgendamento) {
        const {
          data,
          error,
        } = await supabase
          .from("Agendamentos")
          .update(dados)
          .eq(
            "ID",
            editandoAgendamento.ID
          )
          .select();

        if (error) {
          alert(
            "ERRO AO EDITAR AGENDAMENTO\n\n" +
              error.message
          );
          return;
        }

        if (!data?.length) {
          alert(
            "Nenhum agendamento foi alterado."
          );
          return;
        }

        alert(
          "Agendamento atualizado!"
        );
      } else {
        const {
          error,
        } = await supabase
          .from("Agendamentos")
          .insert([dados]);

        if (error) {
          alert(
            "ERRO AO CRIAR AGENDAMENTO\n\n" +
              error.message
          );
          return;
        }

        alert(
          "Agendamento criado!"
        );
      }

      cancelarFormularioAgendamento();
      await buscarAgendamentos();
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao salvar agendamento.\n\n" +
          (erro?.message || "")
      );
    } finally {
      setSalvandoAgendamento(false);
    }
  }

  // ===================================================
  // EXCLUIR AGENDAMENTO
  // ===================================================

  async function excluirAgendamento(
    agendamento
  ) {
    if (!supabase) return;

    if (
      !agendamento ||
      agendamento.ID === null ||
      agendamento.ID === undefined
    ) {
      alert(
        "Agendamento inválido."
      );
      return;
    }

    const confirmar = window.confirm(
      `Excluir o agendamento de "${agendamento.Nome}"?`
    );

    if (!confirmar) return;

    try {
      const {
        data,
        error,
      } = await supabase
        .from("Agendamentos")
        .delete()
        .eq(
          "ID",
          agendamento.ID
        )
        .select();

      if (error) {
        alert(
          "ERRO AO EXCLUIR\n\n" +
            error.message
        );
        return;
      }

      if (!data?.length) {
        alert(
          "O agendamento não foi excluído."
        );
        return;
      }

      setAgendamentos(
        (lista) =>
          lista.filter(
            (item) =>
              String(item.ID) !==
              String(
                agendamento.ID
              )
          )
      );

      alert(
        "Agendamento excluído!"
      );

      await buscarAgendamentos();
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao excluir agendamento."
      );
    }
  }

  // ===================================================
  // NOVO CLIENTE
  // ===================================================

  function novoCliente() {
    setEditandoCliente(null);
    setNomeCliente("");
    setTelefoneCliente("");
    setMostrarFormularioCliente(true);
  }

  // ===================================================
  // EDITAR CLIENTE
  // ===================================================

  function editarCliente(cliente) {
    if (
      !cliente ||
      cliente.id === null ||
      cliente.id === undefined
    ) {
      alert(
        "Cliente inválido."
      );
      return;
    }

    setEditandoCliente(cliente);

    setNomeCliente(
      cliente.nome || ""
    );

    setTelefoneCliente(
      cliente.telefone || ""
    );

    setMostrarFormularioCliente(true);
  }

  // ===================================================
  // CANCELAR CLIENTE
  // ===================================================

  function cancelarFormularioCliente() {
    setMostrarFormularioCliente(false);
    setEditandoCliente(null);
    setNomeCliente("");
    setTelefoneCliente("");
  }

  // ===================================================
  // SALVAR CLIENTE
  // ===================================================

  async function salvarCliente(e) {
    e.preventDefault();

    if (!supabase) return;

    if (!nomeCliente.trim()) {
      alert("Informe o nome.");
      return;
    }

    if (!telefoneCliente.trim()) {
      alert("Informe o telefone.");
      return;
    }

    if (salvandoCliente) return;

    setSalvandoCliente(true);

    try {
      const dados = {
        nome: nomeCliente.trim(),
        telefone:
          telefoneCliente.trim(),
      };

      if (editandoCliente) {
        const {
          error,
        } = await supabase
          .from("clientes")
          .update(dados)
          .eq(
            "id",
            editandoCliente.id
          );

        if (error) {
          alert(
            "ERRO AO EDITAR CLIENTE\n\n" +
              error.message
          );
          return;
        }

        alert(
          "Cliente atualizado!"
        );
      } else {
        const {
          error,
        } = await supabase
          .from("clientes")
          .insert([dados]);

        if (error) {
          alert(
            "ERRO AO CADASTRAR CLIENTE\n\n" +
              error.message
          );
          return;
        }

        alert(
          "Cliente cadastrado!"
        );
      }

      cancelarFormularioCliente();
      await buscarClientes();
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao salvar cliente."
      );
    } finally {
      setSalvandoCliente(false);
    }
  }

  // ===================================================
  // EXCLUIR CLIENTE
  // ===================================================

  async function excluirCliente(cliente) {
    if (!supabase) return;

    if (
      !cliente ||
      cliente.id === null ||
      cliente.id === undefined
    ) {
      alert("Cliente inválido.");
      return;
    }

    const confirmar = window.confirm(
      `Excluir o cliente "${cliente.nome}"?`
    );

    if (!confirmar) return;

    try {
      const {
        data,
        error,
      } = await supabase
        .from("clientes")
        .delete()
        .eq("id", cliente.id)
        .select();

      if (error) {
        alert(
          "ERRO AO EXCLUIR CLIENTE\n\n" +
            error.message
        );
        return;
      }

      if (!data?.length) {
        alert(
          "O cliente não foi excluído."
        );
        return;
      }

      setClientes(
        (lista) =>
          lista.filter(
            (item) =>
              String(item.id) !==
              String(cliente.id)
          )
      );

      alert(
        "Cliente excluído!"
      );

      await buscarClientes();
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao excluir cliente."
      );
    }
  }

  // ===================================================
  // NOVO ASSINANTE
  // ===================================================

  function novoAssinante() {
    setEditandoAssinante(null);

    setNomeAssinante("");
    setTelefoneAssinante("");
    setPlanoAssinante("Mensal");
    setValorAssinante("");
    setDataInicioAssinante("");
    setDataVencimentoAssinante("");
    setStatusAssinante("ativo");

    setMostrarFormularioAssinante(true);
  }

  // ===================================================
  // EDITAR ASSINANTE
  // ===================================================

  function editarAssinante(assinante) {
    if (
      !assinante ||
      assinante.id === null ||
      assinante.id === undefined
    ) {
      alert(
        "Assinante inválido."
      );
      return;
    }

    setEditandoAssinante(assinante);

    setNomeAssinante(
      assinante.nome || ""
    );

    setTelefoneAssinante(
      assinante.telefone || ""
    );

    setPlanoAssinante(
      assinante.plano || "Mensal"
    );

    setValorAssinante(
      assinante.valor !== null &&
        assinante.valor !== undefined
        ? String(assinante.valor)
        : ""
    );

    setDataInicioAssinante(
      assinante.data_inicio || ""
    );

    setDataVencimentoAssinante(
      assinante.data_vencimento || ""
    );

    setStatusAssinante(
      assinante.status || "ativo"
    );

    setMostrarFormularioAssinante(true);
  }

  // ===================================================
  // CANCELAR ASSINANTE
  // ===================================================

  function cancelarFormularioAssinante() {
    setMostrarFormularioAssinante(false);
    setEditandoAssinante(null);

    setNomeAssinante("");
    setTelefoneAssinante("");
    setPlanoAssinante("Mensal");
    setValorAssinante("");
    setDataInicioAssinante("");
    setDataVencimentoAssinante("");
    setStatusAssinante("ativo");
  }

  // ===================================================
  // SALVAR ASSINANTE
  // ===================================================

  async function salvarAssinante(e) {
    e.preventDefault();

    if (!supabase) {
      alert(
        "Supabase não configurado."
      );
      return;
    }

    if (!nomeAssinante.trim()) {
      alert(
        "Informe o nome do assinante."
      );
      return;
    }

    if (!telefoneAssinante.trim()) {
      alert(
        "Informe o WhatsApp."
      );
      return;
    }

    if (!planoAssinante.trim()) {
      alert(
        "Informe o plano."
      );
      return;
    }

    if (!valorAssinante) {
      alert(
        "Informe o valor da assinatura."
      );
      return;
    }

    if (!dataInicioAssinante) {
      alert(
        "Informe a data de início."
      );
      return;
    }

    if (!dataVencimentoAssinante) {
      alert(
        "Informe a data de vencimento."
      );
      return;
    }

    if (salvandoAssinante) return;

    setSalvandoAssinante(true);

    try {
      const valor =
        Number(
          String(valorAssinante)
            .replace(",", ".")
        );

      if (Number.isNaN(valor)) {
        alert(
          "Informe um valor válido."
        );
        return;
      }

      const dados = {
        nome: nomeAssinante.trim(),
        telefone:
          telefoneAssinante.trim(),
        plano:
          planoAssinante.trim(),
        valor,
        data_inicio:
          dataInicioAssinante,
        data_vencimento:
          dataVencimentoAssinante,
        status:
          statusAssinante || "ativo",
      };

      if (editandoAssinante) {
        const {
          data,
          error,
        } = await supabase
          .from("assinantes")
          .update(dados)
          .eq(
            "id",
            editandoAssinante.id
          )
          .select();

        if (error) {
          console.error(
            "ERRO SUPABASE:",
            error
          );

          alert(
            "ERRO AO EDITAR ASSINANTE\n\n" +
              error.message
          );

          return;
        }

        if (!data?.length) {
          alert(
            "Nenhum assinante foi alterado."
          );

          return;
        }

        alert(
          "Assinante atualizado com sucesso!"
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("assinantes")
          .insert([dados])
          .select();

        if (error) {
          console.error(
            "ERRO SUPABASE:",
            error
          );

          alert(
            "ERRO AO CADASTRAR ASSINANTE\n\n" +
              error.message
          );

          return;
        }

        console.log(
          "Assinante criado:",
          data
        );

        alert(
          "Assinante cadastrado com sucesso!"
        );
      }

      cancelarFormularioAssinante();

      await buscarAssinantes();
    } catch (erro) {
      console.error(
        "Erro ao salvar assinante:",
        erro
      );

      alert(
        "Erro ao salvar assinante.\n\n" +
          (erro?.message || "")
      );
    } finally {
      setSalvandoAssinante(false);
    }
  }

  // ===================================================
  // EXCLUIR ASSINANTE
  // ===================================================

  async function excluirAssinante(
    assinante
  ) {
    if (!supabase) return;

    if (
      !assinante ||
      assinante.id === null ||
      assinante.id === undefined
    ) {
      alert(
        "Assinante inválido."
      );
      return;
    }

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o assinante "${assinante.nome}"?`
    );

    if (!confirmar) return;

    try {
      const {
        data,
        error,
      } = await supabase
        .from("assinantes")
        .delete()
        .eq(
          "id",
          assinante.id
        )
        .select();

      if (error) {
        console.error(error);

        alert(
          "ERRO AO EXCLUIR ASSINANTE\n\n" +
            error.message
        );

        return;
      }

      if (!data?.length) {
        alert(
          "O assinante não foi excluído."
        );

        return;
      }

      setAssinantes(
        (lista) =>
          lista.filter(
            (item) =>
              String(item.id) !==
              String(
                assinante.id
              )
          )
      );

      alert(
        "Assinante excluído com sucesso!"
      );

      await buscarAssinantes();
    } catch (erro) {
      console.error(erro);

      alert(
        "Erro ao excluir assinante."
      );
    }
  }

  // ===================================================
  // FILTROS
  // ===================================================

  const clientesFiltrados =
    clientes.filter((cliente) => {
      const pesquisa =
        pesquisaCliente
          .toLowerCase()
          .trim();

      if (!pesquisa) return true;

      return (
        cliente.nome
          ?.toLowerCase()
          .includes(pesquisa) ||
        cliente.telefone
          ?.toLowerCase()
          .includes(pesquisa)
      );
    });

  const assinantesFiltrados =
    assinantes.filter((assinante) => {
      const pesquisa =
        pesquisaAssinante
          .toLowerCase()
          .trim();

      if (!pesquisa) return true;

      return (
        assinante.nome
          ?.toLowerCase()
          .includes(pesquisa) ||
        assinante.telefone
          ?.toLowerCase()
          .includes(pesquisa) ||
        assinante.plano
          ?.toLowerCase()
          .includes(pesquisa)
      );
    });

  // ===================================================
  // FORMATAR DATA
  // ===================================================

  function formatarData(data) {
    if (!data) return "-";

    const partes =
      String(data).split("-");

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // ===================================================
  // FORMATAR DINHEIRO
  // ===================================================

  function formatarMoeda(valor) {
    const numero =
      Number(valor);

    if (Number.isNaN(numero)) {
      return "R$ 0,00";
    }

    return numero.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  // ===================================================
  // STATUS AGENDAMENTO
  // ===================================================

  function statusVisual(status) {
    const valor =
      String(status || "")
        .toLowerCase()
        .trim();

    if (valor === "confirmado") {
      return {
        texto: "CONFIRMADO",
        classe:
          "border-green-500/30 bg-green-500/10 text-green-400",
      };
    }

    if (valor === "cancelado") {
      return {
        texto: "CANCELADO",
        classe:
          "border-red-500/30 bg-red-500/10 text-red-400",
      };
    }

    return {
      texto: "PENDENTE",
      classe:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    };
  }

  // ===================================================
  // STATUS ASSINANTE
  // ===================================================

  function statusAssinanteVisual(status) {
    const valor =
      String(status || "")
        .toLowerCase()
        .trim();

    if (valor === "ativo") {
      return {
        texto: "ATIVO",
        classe:
          "border-green-500/30 bg-green-500/10 text-green-400",
      };
    }

    if (valor === "cancelado") {
      return {
        texto: "CANCELADO",
        classe:
          "border-red-500/30 bg-red-500/10 text-red-400",
      };
    }

    return {
      texto: "PENDENTE",
      classe:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    };
  }

  // ===================================================
  // SAIR
  // ===================================================

  async function sair() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    window.location.href = "/admin";
  }

  // ===================================================
  // CARREGANDO
  // ===================================================

  if (carregando) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-amber-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Verificando acesso...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ===================================================
  // PAINEL
  // ===================================================

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            CABEÇALHO
        ================================================= */}

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/30 bg-zinc-900 p-2">
              <img
                src="/logo.png"
                alt="Sousa Barbearia"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                Sousa Barbearia
              </p>

              <h1 className="mt-1 text-2xl font-black">
                Painel Administrativo
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Olá, {usuario?.nome}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-red-500 hover:text-red-400"
          >
            SAIR
          </button>
        </header>

        {/* =================================================
            MENU
        ================================================= */}

        <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* AGENDAMENTOS */}

          <button
            type="button"
            onClick={() =>
              setAbaAtual("agendamentos")
            }
            className={`rounded-2xl border p-5 text-left transition ${
              abaAtual === "agendamentos"
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-800 bg-zinc-900/70 hover:border-amber-500/40"
            }`}
          >
            <p className="text-3xl">
              📅
            </p>

            <p className="mt-3 text-lg font-black">
              Agendamentos
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Gerenciar horários
            </p>
          </button>

          {/* CLIENTES */}

          <button
            type="button"
            onClick={() =>
              setAbaAtual("clientes")
            }
            className={`rounded-2xl border p-5 text-left transition ${
              abaAtual === "clientes"
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-800 bg-zinc-900/70 hover:border-amber-500/40"
            }`}
          >
            <p className="text-3xl">
              👥
            </p>

            <p className="mt-3 text-lg font-black">
              Clientes
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Gerenciar clientes
            </p>
          </button>

          {/* ASSINANTES */}

          <button
            type="button"
            onClick={() =>
              setAbaAtual("assinantes")
            }
            className={`rounded-2xl border p-5 text-left transition ${
              abaAtual === "assinantes"
                ? "border-amber-500 bg-amber-500/10"
                : "border-zinc-800 bg-zinc-900/70 hover:border-amber-500/40"
            }`}
          >
            <p className="text-3xl">
              💳
            </p>

            <p className="mt-3 text-lg font-black">
              Assinantes
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Planos e mensalidades
            </p>
          </button>

          {/* BARBEIROS */}

          <button
            type="button"
            onClick={() =>
              (window.location.href =
                "/admin/barbeiros")
            }
            className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-left transition hover:border-amber-500/50 hover:bg-amber-500/10"
          >
            <p className="text-3xl">
              💈
            </p>

            <p className="mt-3 text-lg font-black">
              Cadastro de Barbeiros
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Gerenciar barbeiros
            </p>
          </button>

        </section>

        {/* =================================================
            ABA CLIENTES
        ================================================= */}

        {abaAtual === "clientes" && (
          <section>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                  Gestão
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Clientes
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {clientes.length} cliente(s)
                  cadastrado(s)
                </p>
              </div>

              <button
                type="button"
                onClick={novoCliente}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 text-sm font-black text-black"
              >
                + NOVO CLIENTE
              </button>

            </div>

            {mostrarFormularioCliente && (
              <div className="mb-6 rounded-2xl border border-amber-500/30 bg-zinc-900 p-6">

                <h3 className="mb-5 text-xl font-black">
                  {editandoCliente
                    ? "Editar cliente"
                    : "Novo cliente"}
                </h3>

                <form
                  onSubmit={salvarCliente}
                  className="grid gap-4 sm:grid-cols-2"
                >

                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={nomeCliente}
                    onChange={(e) =>
                      setNomeCliente(
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                  />

                  <input
                    type="tel"
                    placeholder="WhatsApp / Telefone"
                    value={telefoneCliente}
                    onChange={(e) =>
                      setTelefoneCliente(
                        e.target.value
                      )
                    }
                    className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                  />

                  <div className="flex gap-3 sm:col-span-2">

                    <button
                      type="submit"
                      disabled={salvandoCliente}
                      className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3 text-sm font-black text-black disabled:opacity-50"
                    >
                      {salvandoCliente
                        ? "SALVANDO..."
                        : "SALVAR CLIENTE"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelarFormularioCliente
                      }
                      className="rounded-xl border border-zinc-800 bg-black px-6 py-3 text-sm font-bold"
                    >
                      CANCELAR
                    </button>

                  </div>

                </form>
              </div>
            )}

            <input
              type="search"
              placeholder="🔎 Pesquisar cliente..."
              value={pesquisaCliente}
              onChange={(e) =>
                setPesquisaCliente(
                  e.target.value
                )
              }
              className="mb-5 w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm outline-none focus:border-amber-500"
            />

            {carregandoClientes ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                Carregando clientes...
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                <p className="text-4xl">
                  👥
                </p>

                <p className="mt-4 font-black">
                  Nenhum cliente encontrado
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-zinc-800">

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">

                    <thead className="bg-zinc-900">
                      <tr className="border-b border-zinc-800 text-left text-xs uppercase text-zinc-500">

                        <th className="px-5 py-4">
                          Cliente
                        </th>

                        <th className="px-5 py-4">
                          WhatsApp
                        </th>

                        <th className="px-5 py-4 text-right">
                          Ações
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      {clientesFiltrados.map(
                        (cliente, index) => (
                          <tr
                            key={
                              cliente.id ??
                              `cliente-${index}`
                            }
                            className="border-b border-zinc-900 bg-black/40"
                          >

                            <td className="px-5 py-4 font-bold">
                              {cliente.nome}
                            </td>

                            <td className="px-5 py-4 text-sm text-zinc-400">
                              {cliente.telefone}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    editarCliente(
                                      cliente
                                    )
                                  }
                                  className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400"
                                >
                                  ✏️ EDITAR
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    excluirCliente(
                                      cliente
                                    )
                                  }
                                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400"
                                >
                                  🗑️ EXCLUIR
                                </button>

                              </div>
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>

                <div className="divide-y divide-zinc-800 md:hidden">
                  {clientesFiltrados.map(
                    (cliente, index) => (
                      <div
                        key={
                          cliente.id ??
                          `cliente-mobile-${index}`
                        }
                        className="bg-black/40 p-5"
                      >

                        <h3 className="font-black">
                          {cliente.nome}
                        </h3>

                        <p className="mt-2 text-sm text-zinc-500">
                          📱 {cliente.telefone}
                        </p>

                        <div className="mt-4 flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              editarCliente(
                                cliente
                              )
                            }
                            className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400"
                          >
                            ✏️ EDITAR
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              excluirCliente(
                                cliente
                              )
                            }
                            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400"
                          >
                            🗑️ EXCLUIR
                          </button>

                        </div>
                      </div>
                    )
                  )}
                </div>

              </div>
            )}

          </section>
        )}

        {/* =================================================
            ABA ASSINANTES
        ================================================= */}

        {abaAtual === "assinantes" && (
          <section>

            {/* CABEÇALHO */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                  Gestão
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Assinantes
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Gerencie os planos e mensalidades.
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={buscarAssinantes}
                  disabled={
                    carregandoAssinantes
                  }
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-bold hover:border-amber-500 disabled:opacity-50"
                >
                  {carregandoAssinantes
                    ? "ATUALIZANDO..."
                    : "↻ ATUALIZAR"}
                </button>

                <button
                  type="button"
                  onClick={novoAssinante}
                  className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 text-sm font-black text-black"
                >
                  + NOVO ASSINANTE
                </button>

              </div>

            </div>

            {/* CARDS */}

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  💳
                </p>

                <p className="mt-4 text-3xl font-black text-amber-500">
                  {assinantes.length}
                </p>

                <p className="mt-1 text-sm font-bold">
                  Total de assinantes
                </p>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  🟢
                </p>

                <p className="mt-4 text-3xl font-black text-green-400">
                  {
                    assinantes.filter(
                      (item) =>
                        String(
                          item.status || ""
                        )
                          .toLowerCase()
                          .trim() ===
                        "ativo"
                    ).length
                  }
                </p>

                <p className="mt-1 text-sm font-bold">
                  Ativos
                </p>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  🟡
                </p>

                <p className="mt-4 text-3xl font-black text-yellow-400">
                  {
                    assinantes.filter(
                      (item) =>
                        String(
                          item.status || ""
                        )
                          .toLowerCase()
                          .trim() ===
                        "pendente"
                    ).length
                  }
                </p>

                <p className="mt-1 text-sm font-bold">
                  Pendentes
                </p>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  💰
                </p>

                <p className="mt-4 text-2xl font-black text-blue-400">
                  {formatarMoeda(
                    assinantes
                      .filter(
                        (item) =>
                          String(
                            item.status || ""
                          )
                            .toLowerCase()
                            .trim() ===
                          "ativo"
                      )
                      .reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item.valor ||
                              0
                          ),
                        0
                      )
                  )}
                </p>

                <p className="mt-1 text-sm font-bold">
                  Receita mensal
                </p>

              </div>

            </div>

            {/* FORMULÁRIO */}

            {mostrarFormularioAssinante && (
              <div className="mb-6 rounded-2xl border border-amber-500/30 bg-zinc-900 p-6">

                <div className="mb-6">

                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                    {editandoAssinante
                      ? "Edição"
                      : "Cadastro"}
                  </p>

                  <h3 className="mt-1 text-xl font-black">
                    {editandoAssinante
                      ? "Editar assinante"
                      : "Novo assinante"}
                  </h3>

                </div>

                <form
                  onSubmit={
                    salvarAssinante
                  }
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >

                  {/* NOME */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      NOME
                    </label>

                    <input
                      type="text"
                      value={nomeAssinante}
                      onChange={(e) =>
                        setNomeAssinante(
                          e.target.value
                        )
                      }
                      placeholder="Nome completo"
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                  </div>

                  {/* TELEFONE */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      WHATSAPP
                    </label>

                    <input
                      type="tel"
                      value={telefoneAssinante}
                      onChange={(e) =>
                        setTelefoneAssinante(
                          e.target.value
                        )
                      }
                      placeholder="(99) 99999-9999"
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                  </div>

                  {/* PLANO */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      PLANO
                    </label>

                    <select
                      value={planoAssinante}
                      onChange={(e) =>
                        setPlanoAssinante(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    >

                      <option value="Mensal">
                        Mensal
                      </option>

                      <option value="Trimestral">
                        Trimestral
                      </option>

                      <option value="Semestral">
                        Semestral
                      </option>

                      <option value="Anual">
                        Anual
                      </option>

                    </select>

                  </div>

                  {/* VALOR */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      VALOR
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={valorAssinante}
                      onChange={(e) =>
                        setValorAssinante(
                          e.target.value
                        )
                      }
                      placeholder="Ex: 50.00"
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                  </div>

                  {/* DATA INÍCIO */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      DATA DE INÍCIO
                    </label>

                    <input
                      type="date"
                      value={
                        dataInicioAssinante
                      }
                      onChange={(e) =>
                        setDataInicioAssinante(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                  </div>

                  {/* VENCIMENTO */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      VENCIMENTO
                    </label>

                    <input
                      type="date"
                      value={
                        dataVencimentoAssinante
                      }
                      onChange={(e) =>
                        setDataVencimentoAssinante(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                  </div>

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-zinc-500">
                      STATUS
                    </label>

                    <select
                      value={
                        statusAssinante
                      }
                      onChange={(e) =>
                        setStatusAssinante(
                          e.target.value
                        )
                      }
                      className="w-full rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    >

                      <option value="ativo">
                        Ativo
                      </option>

                      <option value="pendente">
                        Pendente
                      </option>

                      <option value="cancelado">
                        Cancelado
                      </option>

                    </select>

                  </div>

                  {/* BOTÕES */}

                  <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">

                    <button
                      type="submit"
                      disabled={
                        salvandoAssinante
                      }
                      className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3 text-sm font-black text-black disabled:opacity-50"
                    >
                      {salvandoAssinante
                        ? "SALVANDO..."
                        : editandoAssinante
                        ? "SALVAR ALTERAÇÕES"
                        : "CADASTRAR ASSINANTE"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelarFormularioAssinante
                      }
                      className="rounded-xl border border-zinc-800 bg-black px-6 py-3 text-sm font-bold text-zinc-300"
                    >
                      CANCELAR
                    </button>

                  </div>

                </form>

              </div>
            )}

            {/* PESQUISA */}

            <div className="mb-5">

              <input
                type="search"
                placeholder="🔎 Pesquisar por nome, WhatsApp ou plano..."
                value={pesquisaAssinante}
                onChange={(e) =>
                  setPesquisaAssinante(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm outline-none placeholder:text-zinc-600 focus:border-amber-500"
              />

            </div>

            {/* LISTAGEM */}

            {carregandoAssinantes ? (

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-10 text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-800 border-t-amber-500" />

                <p className="mt-4 text-sm text-zinc-500">
                  Carregando assinantes...
                </p>

              </div>

            ) : assinantesFiltrados.length === 0 ? (

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-10 text-center">

                <p className="text-4xl">
                  💳
                </p>

                <h3 className="mt-4 text-lg font-black">
                  Nenhum assinante encontrado
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  Cadastre seu primeiro assinante.
                </p>

                <button
                  type="button"
                  onClick={
                    novoAssinante
                  }
                  className="mt-5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 text-sm font-black text-black"
                >
                  + NOVO ASSINANTE
                </button>

              </div>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-zinc-800">

                {/* DESKTOP */}

                <div className="hidden overflow-x-auto md:block">

                  <table className="w-full">

                    <thead className="bg-zinc-900">

                      <tr className="border-b border-zinc-800 text-left text-[10px] uppercase tracking-widest text-zinc-500">

                        <th className="px-5 py-4">
                          Assinante
                        </th>

                        <th className="px-5 py-4">
                          Plano
                        </th>

                        <th className="px-5 py-4">
                          Valor
                        </th>

                        <th className="px-5 py-4">
                          Vencimento
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4 text-right">
                          Ações
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {assinantesFiltrados.map(
                        (
                          assinante,
                          index
                        ) => {

                          const status =
                            statusAssinanteVisual(
                              assinante.status
                            );

                          return (
                            <tr
                              key={
                                assinante.id ??
                                `assinante-${index}`
                              }
                              className="border-b border-zinc-900 bg-black/40 hover:bg-zinc-900/50"
                            >

                              <td className="px-5 py-4">

                                <p className="font-bold text-zinc-200">
                                  {
                                    assinante.nome
                                  }
                                </p>

                                <p className="mt-1 text-xs text-zinc-600">
                                  📱{" "}
                                  {
                                    assinante.telefone
                                  }
                                </p>

                              </td>

                              <td className="px-5 py-4 text-sm font-bold text-zinc-300">
                                {
                                  assinante.plano ||
                                  "-"
                                }
                              </td>

                              <td className="px-5 py-4 text-sm font-black text-amber-500">
                                {formatarMoeda(
                                  assinante.valor
                                )}
                              </td>

                              <td className="px-5 py-4 text-sm text-zinc-400">
                                {formatarData(
                                  assinante.data_vencimento
                                )}
                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black ${status.classe}`}
                                >
                                  {
                                    status.texto
                                  }
                                </span>

                              </td>

                              <td className="px-5 py-4">

                                <div className="flex justify-end gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      editarAssinante(
                                        assinante
                                      )
                                    }
                                    className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400"
                                  >
                                    ✏️ EDITAR
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      excluirAssinante(
                                        assinante
                                      )
                                    }
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400"
                                  >
                                    🗑️ EXCLUIR
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>

                {/* MOBILE */}

                <div className="divide-y divide-zinc-800 md:hidden">

                  {assinantesFiltrados.map(
                    (
                      assinante,
                      index
                    ) => {

                      const status =
                        statusAssinanteVisual(
                          assinante.status
                        );

                      return (

                        <div
                          key={
                            assinante.id ??
                            `assinante-mobile-${index}`
                          }
                          className="bg-black/40 p-5"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <h3 className="font-black text-zinc-200">
                                {
                                  assinante.nome
                                }
                              </h3>

                              <p className="mt-1 text-xs text-zinc-600">
                                📱{" "}
                                {
                                  assinante.telefone
                                }
                              </p>

                            </div>

                            <span
                              className={`rounded-full border px-3 py-1 text-[9px] font-black ${status.classe}`}
                            >
                              {
                                status.texto
                              }
                            </span>

                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-4">

                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                                Plano
                              </p>

                              <p className="mt-1 text-sm font-bold">
                                {
                                  assinante.plano ||
                                  "-"
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                                Valor
                              </p>

                              <p className="mt-1 text-sm font-black text-amber-500">
                                {formatarMoeda(
                                  assinante.valor
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                                Início
                              </p>

                              <p className="mt-1 text-xs font-bold text-zinc-300">
                                {formatarData(
                                  assinante.data_inicio
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-widest text-zinc-600">
                                Vencimento
                              </p>

                              <p className="mt-1 text-xs font-bold text-zinc-300">
                                {formatarData(
                                  assinante.data_vencimento
                                )}
                              </p>
                            </div>

                          </div>

                          <div className="mt-5 flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                editarAssinante(
                                  assinante
                                )
                              }
                              className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-3 text-xs font-bold text-blue-400"
                            >
                              ✏️ EDITAR
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                excluirAssinante(
                                  assinante
                                )
                              }
                              className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-xs font-bold text-red-400"
                            >
                              🗑️ EXCLUIR
                            </button>

                          </div>

                        </div>

                      );
                    }
                  )}

                </div>

              </div>

            )}

          </section>
        )}

        {/* =================================================
            ABA AGENDAMENTOS
        ================================================= */}

        {abaAtual === "agendamentos" && (
          <section>

            {/* CARDS */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  📅
                </p>

                <p className="mt-4 text-3xl font-black text-amber-500">
                  {agendamentos.length}
                </p>

                <h2 className="mt-1 text-sm font-bold">
                  Agendamentos
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Total registrado
                </p>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  🟡
                </p>

                <p className="mt-4 text-3xl font-black text-yellow-400">
                  {
                    agendamentos.filter(
                      (item) =>
                        String(
                          item.status || ""
                        )
                          .toLowerCase()
                          .trim() ===
                        "pendente"
                    ).length
                  }
                </p>

                <h2 className="mt-1 text-sm font-bold">
                  Pendentes
                </h2>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  🟢
                </p>

                <p className="mt-4 text-3xl font-black text-green-400">
                  {
                    agendamentos.filter(
                      (item) =>
                        String(
                          item.status || ""
                        )
                          .toLowerCase()
                          .trim() ===
                        "confirmado"
                    ).length
                  }
                </p>

                <h2 className="mt-1 text-sm font-bold">
                  Confirmados
                </h2>

              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">

                <p className="text-2xl">
                  💈
                </p>

                <p className="mt-4 text-3xl font-black text-blue-400">
                  {
                    new Set(
                      agendamentos
                        .map(
                          (item) =>
                            item.Colaborador
                        )
                        .filter(Boolean)
                    ).size
                  }
                </p>

                <h2 className="mt-1 text-sm font-bold">
                  Barbeiros
                </h2>

              </div>

            </section>

            {/* TÍTULO */}

            <section className="mt-8">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                    Gestão
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Agendamentos
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Crie, edite ou exclua agendamentos.
                  </p>

                </div>

                <div className="flex gap-2">

                  <button
                    type="button"
                    onClick={
                      buscarAgendamentos
                    }
                    disabled={
                      carregandoAgendamentos
                    }
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-bold hover:border-amber-500 disabled:opacity-50"
                  >
                    {carregandoAgendamentos
                      ? "ATUALIZANDO..."
                      : "↻ ATUALIZAR"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      novoAgendamento
                    }
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-5 py-3 text-sm font-black text-black"
                  >
                    + NOVO AGENDAMENTO
                  </button>

                </div>

              </div>

              {/* FORM AGENDAMENTO */}

              {mostrarFormularioAgendamento && (
                <div className="mb-6 rounded-2xl border border-amber-500/30 bg-zinc-900 p-6">

                  <h3 className="mb-6 text-xl font-black">
                    {editandoAgendamento
                      ? "Editar agendamento"
                      : "Novo agendamento"}
                  </h3>

                  <form
                    onSubmit={
                      salvarAgendamento
                    }
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  >

                    <input
                      type="text"
                      placeholder="Nome do cliente"
                      value={
                        nomeAgendamento
                      }
                      onChange={(e) =>
                        setNomeAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                    <input
                      type="tel"
                      placeholder="WhatsApp"
                      value={
                        telefoneAgendamento
                      }
                      onChange={(e) =>
                        setTelefoneAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                    <input
                      type="text"
                      placeholder="Serviço"
                      value={
                        servicoAgendamento
                      }
                      onChange={(e) =>
                        setServicoAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                    <input
                      type="date"
                      value={
                        dataAgendamento
                      }
                      onChange={(e) =>
                        setDataAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                    <input
                      type="time"
                      value={
                        horarioAgendamento
                      }
                      onChange={(e) =>
                        setHorarioAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                    <input
                      type="text"
                      placeholder="Barbeiro"
                      value={
                        colaboradorAgendamento
                      }
                      onChange={(e) =>
                        setColaboradorAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    />

                    <select
                      value={
                        statusAgendamento
                      }
                      onChange={(e) =>
                        setStatusAgendamento(
                          e.target.value
                        )
                      }
                      className="rounded-xl border border-zinc-800 bg-black/60 p-4 text-sm outline-none focus:border-amber-500"
                    >
                      <option value="pendente">
                        Pendente
                      </option>

                      <option value="confirmado">
                        Confirmado
                      </option>

                      <option value="cancelado">
                        Cancelado
                      </option>
                    </select>

                    <div className="flex gap-3 sm:col-span-2 lg:col-span-3">

                      <button
                        type="submit"
                        disabled={
                          salvandoAgendamento
                        }
                        className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 px-6 py-3 text-sm font-black text-black disabled:opacity-50"
                      >
                        {salvandoAgendamento
                          ? "SALVANDO..."
                          : editandoAgendamento
                          ? "SALVAR ALTERAÇÕES"
                          : "CRIAR AGENDAMENTO"}
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelarFormularioAgendamento
                        }
                        className="rounded-xl border border-zinc-800 bg-black px-6 py-3 text-sm font-bold"
                      >
                        CANCELAR
                      </button>

                    </div>

                  </form>

                </div>
              )}

              {/* ERRO */}

              {erroAgendamentos && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">

                  <p className="font-black text-red-400">
                    ⚠️ Erro
                  </p>

                  <p className="mt-2 break-words text-sm text-red-300">
                    {erroAgendamentos}
                  </p>

                  <button
                    type="button"
                    onClick={
                      buscarAgendamentos
                    }
                    className="mt-4 rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-400"
                  >
                    TENTAR NOVAMENTE
                  </button>

                </div>
              )}

              {/* LISTA */}

              {carregandoAgendamentos ? (

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">
                  Carregando agendamentos...
                </div>

              ) : agendamentos.length === 0 ? (

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

                  <p className="text-4xl">
                    📅
                  </p>

                  <h3 className="mt-4 font-black">
                    Nenhum agendamento
                  </h3>

                </div>

              ) : (

                <div className="overflow-hidden rounded-2xl border border-zinc-800">

                  <div className="hidden overflow-x-auto md:block">

                    <table className="w-full">

                      <thead className="bg-zinc-900">

                        <tr className="border-b border-zinc-800 text-left text-[10px] uppercase tracking-widest text-zinc-500">

                          <th className="px-5 py-4">
                            Cliente
                          </th>

                          <th className="px-5 py-4">
                            Serviço
                          </th>

                          <th className="px-5 py-4">
                            Barbeiro
                          </th>

                          <th className="px-5 py-4">
                            Data
                          </th>

                          <th className="px-5 py-4">
                            Horário
                          </th>

                          <th className="px-5 py-4">
                            Status
                          </th>

                          <th className="px-5 py-4 text-right">
                            Ações
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {agendamentos.map(
                          (
                            agendamento,
                            index
                          ) => {

                            const status =
                              statusVisual(
                                agendamento.status
                              );

                            return (
                              <tr
                                key={
                                  agendamento.ID ??
                                  `agendamento-${index}`
                                }
                                className="border-b border-zinc-900 bg-black/40"
                              >

                                <td className="px-5 py-4">

                                  <p className="font-bold">
                                    {
                                      agendamento.Nome
                                    }
                                  </p>

                                  <p className="mt-1 text-xs text-zinc-600">
                                    {
                                      agendamento.Telefone
                                    }
                                  </p>

                                </td>

                                <td className="px-5 py-4 text-sm">
                                  {
                                    agendamento.Serviço
                                  }
                                </td>

                                <td className="px-5 py-4 text-sm">
                                  {
                                    agendamento.Colaborador ||
                                    "-"
                                  }
                                </td>

                                <td className="px-5 py-4 text-sm text-zinc-400">
                                  {formatarData(
                                    agendamento.Data
                                  )}
                                </td>

                                <td className="px-5 py-4 font-black text-amber-500">
                                  {
                                    agendamento.Horário
                                  }
                                </td>

                                <td className="px-5 py-4">

                                  <span
                                    className={`rounded-full border px-3 py-1 text-[10px] font-black ${status.classe}`}
                                  >
                                    {
                                      status.texto
                                    }
                                  </span>

                                </td>

                                <td className="px-5 py-4">

                                  <div className="flex justify-end gap-2">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        editarAgendamento(
                                          agendamento
                                        )
                                      }
                                      className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400"
                                    >
                                      ✏️ EDITAR
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        excluirAgendamento(
                                          agendamento
                                        )
                                      }
                                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400"
                                    >
                                      🗑️ EXCLUIR
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                  {/* MOBILE */}

                  <div className="divide-y divide-zinc-800 md:hidden">

                    {agendamentos.map(
                      (
                        agendamento,
                        index
                      ) => {

                        const status =
                          statusVisual(
                            agendamento.status
                          );

                        return (

                          <div
                            key={
                              agendamento.ID ??
                              `agendamento-mobile-${index}`
                            }
                            className="bg-black/40 p-5"
                          >

                            <div className="flex items-start justify-between gap-3">

                              <div>

                                <h3 className="font-black">
                                  {
                                    agendamento.Nome
                                  }
                                </h3>

                                <p className="mt-1 text-xs text-zinc-600">
                                  {
                                    agendamento.Telefone
                                  }
                                </p>

                              </div>

                              <span
                                className={`rounded-full border px-3 py-1 text-[9px] font-black ${status.classe}`}
                              >
                                {
                                  status.texto
                                }
                              </span>

                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4">

                              <div>
                                <p className="text-[9px] uppercase text-zinc-600">
                                  Serviço
                                </p>

                                <p className="mt-1 text-xs font-bold">
                                  {
                                    agendamento.Serviço
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] uppercase text-zinc-600">
                                  Barbeiro
                                </p>

                                <p className="mt-1 text-xs font-bold">
                                  {
                                    agendamento.Colaborador ||
                                    "-"
                                  }
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] uppercase text-zinc-600">
                                  Data
                                </p>

                                <p className="mt-1 text-xs font-bold">
                                  {formatarData(
                                    agendamento.Data
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-[9px] uppercase text-zinc-600">
                                  Horário
                                </p>

                                <p className="mt-1 text-sm font-black text-amber-500">
                                  {
                                    agendamento.Horário
                                  }
                                </p>
                              </div>

                            </div>

                            <div className="mt-5 flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  editarAgendamento(
                                    agendamento
                                  )
                                }
                                className="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-3 text-xs font-bold text-blue-400"
                              >
                                ✏️ EDITAR
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  excluirAgendamento(
                                    agendamento
                                  )
                                }
                                className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-xs font-bold text-red-400"
                              >
                                🗑️ EXCLUIR
                              </button>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                </div>

              )}

            </section>

          </section>
        )}

        {/* =================================================
            RODAPÉ
        ================================================= */}

        <footer className="py-8 text-center">

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">
            Sousa Barbearia • Painel Administrativo
          </p>

        </footer>

      </div>
    </main>
  );
}