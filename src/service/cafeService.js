import { Op } from "sequelize";
import Cafe from "../models/cafe.js";
import Ulasan from "../models/ulasan.js";

const CafeService = {
  getCafes: async ({ search, kategori, minRating, maxHarga } = {}) => {
    const where = {};

    if (search) {
      const kata = search
        .toLowerCase()
        .split(/\s+/)
        .filter((k) => k);

      if (kata.length > 0) {
        let idHasil = null;
        for (const k of kata) {
          const byNama = await Cafe.findAll({
            attributes: ["id"],
            where: { nama_cafe: { [Op.iLike]: `%${k}%` } },
          });
          const byUlasan = await Ulasan.findAll({
            attributes: ["cafe_id"],
            where: { isi_ulasan: { [Op.iLike]: `%${k}%` } },
            group: ["cafe_id"],
          });

          const idKata = new Set([
            ...byNama.map((c) => c.id),
            ...byUlasan.map((u) => u.cafe_id),
          ]);

          idHasil =
            idHasil === null
              ? idKata
              : new Set([...idHasil].filter((id) => idKata.has(id)));

          if (idHasil.size === 0) break;
        }
        where.id = { [Op.in]: [...(idHasil ?? [])] };
      }
    }
    if (kategori) {
      where.kategori = kategori;
    }
    if (minRating) {
      where.rating_cafe = { [Op.gte]: parseFloat(minRating) };
    }
    if (maxHarga) {
      where.harga_avg = { [Op.lte]: parseFloat(maxHarga) };
    }
    return await Cafe.findAll({
      where,
      order: [["sentimen_score", "DESC"]],
    });
  },
  getCafeDetail: async (nama_cafe) => {
    const cafe = await Cafe.findOne({
      where: { nama_cafe },
      include: [
        {
          model: Ulasan,
          as: "ulasan",
          attributes: ["id", "isi_ulasan"],
        },
      ],
    });
    if (!cafe) {
      throw new Error(`Cafe"${nama_cafe} GAADA"`);
    }
    return cafe;
  },
  getAllTopsis: async () => {
    return await Cafe.findAll({
      attributes: [
        "nama_cafe",
        "sentimen_score",
        "rating_cafe",
        "harga_avg",
        "jumlah_ulasan",
        "lat",
        "long",
        "kategori",
      ],
    });
  },
};

export default CafeService;
