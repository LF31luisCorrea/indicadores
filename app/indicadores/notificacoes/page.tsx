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
  const limiteProximoFim = new Date();
  limiteProximoFim.setDate(hoje.getDate() + 30); // 30 dias (ajustável)

  const dadosComData = data
    .map(d => {
      const dt = excelDateToJSDate(d["Inicío da coleta de dados (previsão)"]);
      if (!dt) return null;
      return { ...d, dataColeta: dt };
    })
    .filter(Boolean);

  const proximasColetas = dadosComData
    .filter(d => d.dataColeta >= hoje)
    .sort((a, b) => a.dataColeta - b.dataColeta);

  const proximasDeAcabar = dadosComData.filter(
    d => d.dataColeta >= hoje && d.dataColeta <= limiteProximoFim
  );

  const coletasEncerradas = dadosComData.filter(
    d => d.dataColeta < hoje
  );

  // ---------- PDF ----------
  const gerarPDF = (lista: any[], titulo: string, nomeArquivo: string) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text(titulo, 14, 20);

    let y = 30;
    const pageHeight = 280;
    const left = 14;
    const right = 196;

    lista.forEach(proj => {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      const linhas = doc.splitTextToSize(
        proj["Título"] || "Projeto sem nome",
        right - left
      );
      doc.text(linhas, left, y);
      y += linhas.length * 6;

      doc.setFont("helvetica", "normal");
      doc.text(
        proj.dataColeta.toLocaleDateString(),
        right,
        y,
        { align: "right" }
      );

      y += 6;
      doc.line(left, y, right, y);
      y += 8;
    });

    doc.save(nomeArquivo);
  };

  return (
    <>
      <NavBar />
      <div className={styles.home}>

        {/* PRÓXIMAS COLETAS */}
        <h1 className={styles.h1}>📌 Próximas Coletas</h1>
        <div className={styles.div1}>
          {proximasColetas.length === 0 ? (
            <p className={styles.noColetas}>Nenhuma coleta futura!</p>
          ) : (
            <ul>
              {proximasColetas.map((proj, i) => (
                <React.Fragment key={i}>
                  <li>
                    <span className={styles.label}>{proj["Título"]}</span>
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

        {/* PRÓXIMAS DE ACABAR */}
        <h1 className={styles.h1}>⏳ Coletas Próximas de Acabar</h1>
        <div className={styles.div1}>
          {proximasDeAcabar.length === 0 ? (
            <p className={styles.noColetas}>Nenhuma coleta próxima do fim.</p>
          ) : (
            <ul>
              {proximasDeAcabar.map((proj, i) => (
                <React.Fragment key={i}>
                  <li>
                    <span className={styles.label}>{proj["Título"]}</span>
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

        {/* BOTÕES */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            className={styles.button}
            onClick={() =>
              gerarPDF(proximasColetas, "Próximas Coletas", "proximas_coletas.pdf")
            }
            style={{ marginRight: 10 }}
          >
            ⬇️ PDF Próximas Coletas
          </button>

          <button
            className={styles.button}
            onClick={() =>
              gerarPDF(coletasEncerradas, "Coletas Encerradas", "coletas_encerradas.pdf")
            }
            style={{ marginRight: 10 }}
          >
            ⬇️ PDF Coletas Encerradas
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
