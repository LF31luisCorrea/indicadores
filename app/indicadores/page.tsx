"use client";
import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import styles from "../../styles/Indicadores.module.css";
import { jsPDF } from "jspdf";


// Conversão de data Excel (formato serial)
function excelDateToJSDate(excelDate: any) {
  if (!excelDate || excelDate === "-" || isNaN(excelDate)) return null;
  return new Date((excelDate - 25569) * 86400 * 1000);
}

function normalize(v: any) {
  if (v === null || v === undefined) return "Não informado";
  const s = String(v).trim();
  if (s === "" || s === "-") return "Não informado";
  return s;
}

export default function Resultado() {
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const json = localStorage.getItem("planilha");
    if (json) setData(JSON.parse(json));
  }, []);

  if (data.length === 0) return <h2>Carregando...</h2>;

  // Contadores gerais
  const totalProjetos = data.length;
  const humanos = data.filter(d => String(d["Envolve seres humanos?"]).toLowerCase() === "sim").length;
  const comEtica = data.filter(d => String(d["Possui aprovação do Comitê de Ética?"]).toLowerCase() === "sim").length;
  const multicentro = data.filter(d => String(d["É estudo multicêntrico?"]).toLowerCase() === "sim").length;
  const coletaHUF = data.filter(d => String(d["Há previsão de coleta de dados no HUF?"]).toLowerCase() === "sim").length;

  // Contadores por categorias
  const projetosPorEstado: Record<string, number> = {};
  const estudos: Record<string, number> = {};
  const formacao: Record<string, number> = {};
  const tiposDados: Record<string, number> = {};
  const curso: Record<string, number> = {};
  const abordagem: Record<string, number> = {};
  const classificacao: Record<string, number> = {};
  const projetosPorAno: Record<string, number> = {};

  data.forEach(d => {
    const estado = normalize(d["Estado do projeto"]);
    projetosPorEstado[estado] = (projetosPorEstado[estado] || 0) + 1;

    const tipo = normalize(d["Tipo de estudo"]);
    estudos[tipo] = (estudos[tipo] || 0) + 1;

    formacao[normalize(d["Formação Academica"])] =
      (formacao[normalize(d["Formação Academica"])] || 0) + 1;

    tiposDados[normalize(d["Tipo de dados"])] =
      (tiposDados[normalize(d["Tipo de dados"])] || 0) + 1;

    curso[normalize(d["Curso/Área de Conhecimento"])] =
      (curso[normalize(d["Curso/Área de Conhecimento"])] || 0) + 1;

    abordagem[normalize(d["Abordagem da pesquisa"])] =
      (abordagem[normalize(d["Abordagem da pesquisa"])] || 0) + 1;

    classificacao[normalize(d["Classificação institucional"])] =
      (classificacao[normalize(d["Classificação institucional"])] || 0) + 1;

    const dt = excelDateToJSDate(d["Data de solicitação"]);
    if (dt) {
      const ano = dt.getFullYear();
      projetosPorAno[ano] = (projetosPorAno[ano] || 0) + 1;
    }
  });

  const totalRecursos = data.reduce(
    (acc, d) => acc + (Number(d["Recursos total do projeto (R$)"]) || 0),
    0
  );

  // Coletas futuras para notificações
  const hoje = new Date();
  const proximasColetas = data
    .map(d => {
      const dt = excelDateToJSDate(d["Data de coleta"]);
      if (!dt) return null;
      return { ...d, dataColeta: dt };
    })
    .filter(d => d && d.dataColeta >= hoje);

    const gerarPDF = () => {
  const doc = new jsPDF();
  doc.setFont("helvetica"); // fonte padrão que suporta português
  doc.setFontSize(18);
  doc.text("Indicadores do Projeto", 14, 20);

  let y = 30; // posição inicial vertical
  const pageHeight = 280; // altura limite aproximada da página A4

  const adicionarTexto = (texto: string, tamanhoFonte = 12) => {
    if (y > pageHeight) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(tamanhoFonte);
    doc.text(texto, 14, y);
    y += tamanhoFonte === 18 ? 12 : 8; // espaçamento vertical
  };

  // ===== GERAIS =====
  adicionarTexto("Gerais", 14);
  adicionarTexto(`Total de projetos: ${totalProjetos}`);
  adicionarTexto(`Envolvem seres humanos: ${humanos}`);
  adicionarTexto(`Projetos multicêntricos: ${multicentro}`);
  adicionarTexto(`Projetos com coleta no HU: ${coletaHUF}`);
  y += 4;

  // ===== ÉTICA =====
  adicionarTexto("Ética", 14);
  adicionarTexto(`Projetos com aprovação ética: ${comEtica}`);
  y += 4;

  // ===== RECURSOS =====
  adicionarTexto("Recursos", 14);
  adicionarTexto(`Total investido: R$ ${totalRecursos.toLocaleString()}`);
  y += 4;

  // ===== PROJETOS POR ESTADO =====
  adicionarTexto("Projetos por Estado", 14);
  Object.entries(projetosPorEstado).forEach(([estado, qtd]) => {
    adicionarTexto(`${estado}: ${qtd}`);
  });
  y += 4;

  // ===== TIPOS DE ESTUDO =====
  adicionarTexto("Tipos de Estudo", 14);
  Object.entries(estudos).forEach(([tipo, qtd]) => {
    adicionarTexto(`${tipo}: ${qtd}`);
  });
  y += 4;

  // ===== PROJETOS POR ANO =====
  adicionarTexto("Projetos por Ano", 14);
  Object.entries(projetosPorAno).forEach(([ano, qtd]) => {
    adicionarTexto(`${ano}: ${qtd}`);
  });
  y += 4;

  // ===== FORMAÇÃO ACADÊMICA =====
  adicionarTexto("Formação Acadêmica", 14);
  Object.entries(formacao).forEach(([f, qtd]) => {
    adicionarTexto(`${f}: ${qtd}`);
  });
  y += 4;

  // ===== TIPOS DE DADOS =====
  adicionarTexto("Tipos de Dados", 14);
  Object.entries(tiposDados).forEach(([t, qtd]) => {
    adicionarTexto(`${t}: ${qtd}`);
  });
  y += 4;

  // ===== CURSO / ÁREA DE CONHECIMENTO =====
  adicionarTexto("Curso / Área de Conhecimento", 14);
  Object.entries(curso).forEach(([c, qtd]) => {
    adicionarTexto(`${c}: ${qtd}`);
  });
  y += 4;

  // ===== ABORDAGEM DA PESQUISA =====
  adicionarTexto("Abordagem da Pesquisa", 14);
  Object.entries(abordagem).forEach(([a, qtd]) => {
    adicionarTexto(`${a}: ${qtd}`);
  });
  y += 4;

  // ===== CLASSIFICAÇÃO INSTITUCIONAL =====
  adicionarTexto("Classificação Institucional", 14);
  Object.entries(classificacao).forEach(([c, qtd]) => {
    adicionarTexto(`${c}: ${qtd}`);
  });
  y += 4;

  // Baixar PDF
  doc.save("indicadores.pdf");
};



  return (
    <>
      <NavBar />
      <div className={styles.home}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 className={styles.h1}>Veja seus indicadores!</h1>

          {/* Ícone de notificações */}
          <div style={{ cursor: "pointer", fontSize: "24px", position: "relative" }} onClick={() => router.push("/indicadores/notificacoes")}>
              <div 
                className={styles.bellIcon} 
                onClick={() => router.push("/indicadores/notificacoes")}
              >
                <FaBell />
                {proximasColetas.length > 0 && (
                  <span className={styles.bellBadge}>{proximasColetas.length}</span>
                )}
                <span className={styles.tooltip}>Veja as suas próximas coletas</span>
              </div>           
             {proximasColetas.length > 0 && (
              <span style={{
                position: "absolute",
                top: -5,
                right: -5,
                background: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                marginRight: "15%"
              }}>
                {proximasColetas.length}
              </span>
            )}
          </div>
        </div>

        {/* GERAIS */}
        <div className={styles.div1}>
          <h2>📌 Gerais</h2>
          <p><span className={styles.label}>Total de projetos:</span> <span className={styles.valor}>{totalProjetos}</span></p>
          <hr className={styles.linha} />
          <p><span className={styles.label}>Envolvem seres humanos:</span> <span className={styles.valor}>{humanos}</span></p>
          <hr className={styles.linha} />
          <p><span className={styles.label}>Projetos multicêntricos:</span> <span className={styles.valor}>{multicentro}</span></p>
          <hr className={styles.linha} />
          <p><span className={styles.label}>Projetos com coleta no HU:</span> <span className={styles.valor}>{coletaHUF}</span></p>
          <hr className={styles.linha} />
        </div>

        {/* ESTADOS */}
        <div className={styles.div3}>
          <h2>📌 Projetos por Estado</h2>
          <ul>
            {Object.entries(projetosPorEstado).map(([estado, qtd]) => (
              <React.Fragment key={estado}>
                <li>
                  <span className={styles.label}>{estado}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* TIPOS DE ESTUDO */}
        <div className={styles.div4}>
          <h2>📌 Tipos de Estudo</h2>
          <ul>
            {Object.entries(estudos).map(([t, qtd]) => (
              <React.Fragment key={t}>
                <li>
                  <span className={styles.label}>{t}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* PROJETOS POR ANO */}
        <div className={styles.div5}>
          <h2>📌 Projetos por Ano</h2>
          <ul>
            {Object.entries(projetosPorAno).map(([ano, qtd]) => (
              <React.Fragment key={ano}>
                <li>
                  <span className={styles.label}>{ano}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* ÉTICA */}
        <div className={styles.div2}>
          <h2>📌 Ética</h2>
          <p><span className={styles.label}>Projetos com aprovação ética:</span> <span className={styles.valor}>{comEtica}</span></p>
          <hr className={styles.linha} />
        </div>

        {/* RECURSOS */}
        <div className={styles.div6}>
          <h2>📌 Recursos</h2>
          <p><span className={styles.label}>Total investido:</span> <span className={styles.valor}>R$ {totalRecursos.toLocaleString()}</span></p>
          <hr className={styles.linha} />
        </div>

        {/* FORMAÇÃO */}
        <div className={styles.div11}>
          <h2>📌 Formação Acadêmica</h2>
          <ul>
            {Object.entries(formacao).map(([f, qtd]) => (
              <React.Fragment key={f}>
                <li>
                  <span className={styles.label}>{f}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* TIPOS DE DADOS */}
        <div className={styles.div7}>
          <h2>📌 Tipos de Dados</h2>
          <ul>
            {Object.entries(tiposDados).map(([t, qtd]) => (
              <React.Fragment key={t}>
                <li>
                  <span className={styles.label}>{t}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* CURSO */}
        <div className={styles.div8}>
          <h2>📌 Curso / Área de Conhecimento</h2>
          <ul>
            {Object.entries(curso).map(([c, qtd]) => (
              <React.Fragment key={c}>
                <li>
                  <span className={styles.label}>{c}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* ABORDAGEM */}
        <div className={styles.div9}>
          <h2>📌 Abordagem da Pesquisa</h2>
          <ul>
            {Object.entries(abordagem).map(([a, qtd]) => (
              <React.Fragment key={a}>
                <li>
                  <span className={styles.label}>{a}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        {/* CLASSIFICAÇÃO */}
        <div className={styles.div10}>
          <h2>📌 Classificação Institucional</h2>
          <ul>
            {Object.entries(classificacao).map(([c, qtd]) => (
              <React.Fragment key={c}>
                <li>
                  <span className={styles.label}>{c}</span>
                  <span className={styles.valor}>{qtd}</span>
                </li>
                <hr className={styles.linha} />
              </React.Fragment>
            ))}
          </ul>
        </div>

        <button className={styles.button} onClick={gerarPDF}>
  ⬇️ Baixar PDF
</button>

      </div>
      <Footer />
    </>
  );
}
