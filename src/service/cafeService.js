import { Op } from "sequelize";
import Cafe from "../models/cafe.js";
import Ulasan from "../models/ulasan.js";

const CafeService = {
  getCafes: async ({ search, kategori, minRating, maxHarga } = {}) => {
    const where = {};

    if (search) {
      where.normalisasi_ulasan = { [Op.iLike]: `%${search}%` };
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
