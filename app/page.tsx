"use client";

import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import styles from "../styles/Global.module.css";
import Image from "next/image";
import React from "react";

export default function Home() {
  const router = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);

      // Lê a planilha
      const workbook = XLSX.read(data, { type: "array" });

      // Pega a primeira aba
      const sheet = workbook.SheetNames[0];

      // Converte em JSON
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

      // Salva no navegador
      localStorage.setItem("planilha", JSON.stringify(json));

      // Muda de página
      router.push("/indicadores");
    };

    reader.readAsArrayBuffer(arquivo);
  }

  return (
    <>
      <NavBar />

      <div className={styles.home}>
        <h1 className={styles.h1}>Bem vindos ao sistema automático de indicadores!</h1>

        <Image
          src="/images/logo.png"
          width={200}
          height={200}
          alt="Logotipo"
          className={styles.logo}
        />

        <h1 className={styles.h11}>Clique no botão e faça upload</h1>
        <h1 className={styles.h111}>da sua planilha</h1>

        {/* input escondido */}
        <input
          type="file"
          id="arquivo"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          onChange={handleFile}
        />

        {/* botão visível */}
        <button
          className={styles.botao}
          onClick={() => document.getElementById("arquivo")?.click()}
        >
          Upload do Arquivo
        </button>
      </div>

      <Footer />
    </>
  );
}
