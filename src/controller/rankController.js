import CafeService from "../service/cafeService.js";
import { topsis } from "../service/topsisService.js";
import { getJarakOSM } from "../service/osrmService.js";

const rankController = {
  rankCafes: async (req, res) => {
    try {
      const { weight, userLat, userLong, search, kategori, minRating, maxHarga } =
        req.body;
      if (!weight || typeof weight !== "object") {
        return res
          .status(400)
          .json({ success: false, message: "body harus berisi object" });
      }
      const wajib = [
        "sentimen_score",
        "rating_cafe",
        "harga_avg",
        "jumlah_ulasan",
      ];
      for (const key of wajib) {
        if (weight[key] === undefined) {
          return res.status(400).json({
            success: false,
            message: `Bobot: "${key}" tidak boleh kosong`,
          });
        }
      }
      const total = Object.values(weight).reduce((a, b) => a + b, 0);
      if (Math.abs(total - 1) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Total Bobot harus = 1, sekarang = ${total.toFixed(2)}`,
        });
      }

      const cafes = await CafeService.getAllTopsis({
        search,
        kategori,
        minRating,
        maxHarga,
      });
      const plain = cafes.map((c) => c.get({ plain: true }));

      if (weight.jarak !== undefined) {
        if (userLat === undefined || userLong === undefined) {
          return res.status(400).json({
            success: false,
            message: "userLat & userLong wajib saat memakai kriteria jarak",
          });
        }
        const jarakMap = await getJarakOSM(userLat, userLong, plain);
        const semuaJarak = Object.values(jarakMap).filter((v) => v != null);
        const jarakTerburuk =
          semuaJarak.length > 0 ? Math.max(...semuaJarak) * 1.5 : 0;

        for (const c of plain) {
          const j = jarakMap[c.nama_cafe];
          c.jarak = j == null ? jarakTerburuk : j;
        }
      }

      const ranked = topsis(plain, weight);
      res.json({ success: true, total: ranked.length, weight, data: ranked });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default rankController;
