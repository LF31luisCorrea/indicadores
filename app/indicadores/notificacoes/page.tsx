"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import styles from "../../../styles/Notificacao.module.css";
import { jsPDF } from "jspdf";

function excelDateToJSDate(excelDate: any) {
  if (!excelDate || excelDate === "-" || isNaN(excelDate)) return null;
  return new Date((excelDate - 25569) * 86400 * 1000);
}

export default function Notificacoes() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const json = localStorage.getItem("planilha");
    if (json) setData(JSON.parse(json));
  }, []);

  const hoje = new Date();
  const proximasColetas = data
    .map(d => {
      const dt = excelDateToJSDate(d["Inicío da coleta de dados (previsão)"]);
      if (!dt) return null;
      return { ...d, dataColeta: dt };
    })
    .filter(d => d && d.dataColeta >= hoje)
    .sort((a, b) => a.dataColeta - b.dataColeta);

  // Função para gerar PDF das próximas coletas
const gerarPDF = () => {
  const doc = new jsPDF();
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.text("Próximas Coletas", 14, 20);

  let y = 30; // posição vertical inicial
  const pageHeight = 280; // altura máxima da página
  const leftMargin = 14;
  const rightMargin = 196; // largura da página

  proximasColetas.forEach((proj) => {
    if (y > pageHeight) {
      doc.addPage();
      y = 20;
    }

    // Título do projeto
    doc.setFontSize(12);
    doc.setFont("times", "bold");

    // Ajuste de texto longo
    const titleLines = doc.splitTextToSize(proj["Título"] || "Projeto sem nome", rightMargin - leftMargin);
    doc.text(titleLines, leftMargin, y);

    y += titleLines.length * 6; // sobe verticalmente dependendo das linhas do título

    // Data embaixo, alinhada à direita
    doc.setFont("times", "normal");
    doc.text(proj.dataColeta.toLocaleDateString(), rightMargin, y, { align: "right" });

    y += 8;

    // Linha separadora
    doc.setLineWidth(0.2);
    doc.line(leftMargin, y, rightMargin, y);
    y += 8;
  });

  doc.save("proximas_coletas.pdf");
};


  return (
    <>
      <NavBar />
      <div className={styles.home}>
        <h1 className={styles.h1}>📌 Próximas Coletas</h1>

        <div className={styles.div1}>
          {proximasColetas.length === 0 ? (
            <p className={styles.noColetas}>Nenhuma coleta futura!</p>
          ) : (
            <ul>
              {proximasColetas.map((proj, i) => (
                <React.Fragment key={i}>
                  <li>
                    <span className={styles.label}>
                      {proj["Título"] || "Projeto sem nome"}
                    </span>
                    <span className={styles.valor}>
                      {proj.dataColeta.toLocaleDateString()}
                    </span>
                  </li>
                  <hr className={styles.linha} />
                </React.Fragment>
              ))}
            </ul>
          )}
        </div>

        {/* Botões */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button className={styles.button} onClick={gerarPDF} style={{ marginRight: "10px" }}>
            ⬇️ Baixar PDF
          </button>
          <Link href="/indicadores">
            <button className={styles.button}>
              ← Voltar para Indicadores
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
