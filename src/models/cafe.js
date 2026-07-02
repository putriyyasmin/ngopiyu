import { DataTypes, Model } from "sequelize";
import db from "../config/db.js";

class Cafe extends Model {
  get hargaLabel() {
    const harga = this.getDataValue("harga_avg");
    if (harga <= 37500) {
      return "Rp 25-50 rb";
    }
    if (harga <= 75000) {
      return "Rp 50-100 rb";
    } else return ">Rp 100 rb";
  }
}
Cafe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama_cafe: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    sentimen_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    jumlah_ulasan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    kategori: {
      type: DataTypes.STRING(50),
      defaultValue: "Netral",
    },
    rating_cafe: {
      type: DataTypes.FLOAT,
    },
    harga_avg: {
      type: DataTypes.FLOAT,
    },
    lat: {
      type: DataTypes.FLOAT,
    },
    long: {
      type: DataTypes.FLOAT,
    },
    image_url: {
      type: DataTypes.TEXT,
    },
    normalisasi_ulasan: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: db,
    modelName: "Cafe",
    tableName: "cafe_criteria",
    timestamps: false,
  },
);

export default Cafe;
