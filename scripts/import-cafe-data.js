import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

import db from "../src/config/db.js";
import Cafe from "../src/models/cafe.js";
import Ulasan from "../src/models/ulasan.js";
import { parseHarga } from "../src/utils/parseHarga.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readCsv(filePath, separator = ",") {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });
}

async function main() {
  await db.authenticate();
  console.log("Terhubung ke Supabase");

  const pathSentimen = path.join(
    __dirname,
    "../data/result_indobert_clean.csv",
  );
  const pathRaw = path.join(__dirname, "../data/datacafebandung_clean.csv");

  if (!fs.existsSync(pathSentimen)) {
    console.error("File tidak ditemukan: data/result_indobert_clean.csv");
    process.exit(1);
  }
  if (!fs.existsSync(pathRaw)) {
    console.error("File tidak ditemukan: data/datacafebandung_clean.csv");
    process.exit(1);
  }

  console.log("Membaca CSV...");
  const sentimen = await readCsv(pathSentimen, ",");
  const raw = await readCsv(pathRaw, ",");
  console.log(`  Sentimen : ${sentimen.length} baris`);
  console.log(`  Raw      : ${raw.length} baris`);
  console.log(raw[1].nama_cafe);
  console.log(sentimen[0].nama_cafe);
  const rawMap = {};
  const ulasanMap = {};
  for (const r of raw) {
    if (!rawMap[r.nama_cafe]) {
      rawMap[r.nama_cafe] = {
        rating_cafe: parseFloat(r.rating_cafe) || null,
        harga_avg: parseHarga(r.harga),
        lat: parseFloat(r.latitude) || null,
        long: parseFloat(r.longitude) || null,
        normalisasi_ulasan: r.normalisasi_ulasan,
      };
    }
    if (r.normalisasi_ulasan && r.normalisasi_ulasan.trim() !== "") {
      if (!ulasanMap[r.nama_cafe]) ulasanMap[r.nama_cafe] = [];
      ulasanMap[r.nama_cafe].push(r.normalisasi_ulasan.trim());
    }
  }
  console.log("\nMulai import...");
  let sukses = 0,
    skip = 0;

  for (const s of sentimen) {
    const info = rawMap[s.nama_cafe];
    if (!info) {
      console.warn(`  SKIP: ${s.nama_cafe}`);
      skip++;
      continue;
    }
    await Cafe.upsert({
      nama_cafe: s.nama_cafe,
      sentimen_score: parseFloat(s.sentimen_score) || 0,
      jumlah_ulasan: parseInt(s.jumlah_ulasan) || 0,
      kategori: s.kategori,
      normalisasi_ulasan: info.normalisasi_ulasan,
      rating_cafe: info.rating_cafe,
      harga_avg: info.harga_avg,
      lat: info.lat,
      long: info.long,
      updated_at: new Date(),
    });

    console.log(` sukses${s.nama_cafe}`);
    sukses++;
  }

  console.log(`\nCafe selesai! Berhasil: ${sukses} | Skip: ${skip}`);

  console.log("\nMulai import ulasan...");
  await Ulasan.sync();

  const semuaCafe = await Cafe.findAll({ attributes: ["id", "nama_cafe"] });
  const idMap = {};
  for (const c of semuaCafe) {
    idMap[c.nama_cafe] = c.id;
  }

  await Ulasan.destroy({ where: {}, truncate: true, cascade: true });

  const rows = [];
  for (const [nama, daftar] of Object.entries(ulasanMap)) {
    const cafeId = idMap[nama];
    if (!cafeId) continue;
    for (const isi of daftar) {
      rows.push({ cafe_id: cafeId, isi_ulasan: isi });
    }
  }

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    await Ulasan.bulkCreate(rows.slice(i, i + BATCH));
  }

  console.log(`Ulasan selesai! Total ulasan: ${rows.length}`);
  await db.close();
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
