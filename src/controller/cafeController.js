import CafeService from "../service/cafeService.js";

const CafeController = {
  getCafes: async (req, res) => {
    try {
      const { search, kategori, minRating, maxHarga } = req.query;
      const cafes = await CafeService.getCafes({
        search,
        kategori,
        minRating,
        maxHarga,
      });
      res.json({ success: true, total: cafes.length, data: cafes });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getDetailCafe: async (req, res) => {
    try {
      console.log(req.params);

      const { nama_cafe } = req.params;
      const cafe = await CafeService.getCafeDetail(nama_cafe);
      res.json({ success: true, data: cafe });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  },
};

export default CafeController;
