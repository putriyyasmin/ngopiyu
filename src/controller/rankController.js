import CafeService from "../service/cafeService.js";
import { topsis } from "../service/topsisService.js";

const rankController = {
  rankCafes: async (req, res) => {
    try {
      const { weight } = req.body;
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
      const cafes = await CafeService.getAllTopsis();
      const ranked = topsis(cafes, weight);
      res.json({ success: true, total: ranked.length, weight, data: ranked });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default rankController;
