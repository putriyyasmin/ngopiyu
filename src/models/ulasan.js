import { DataTypes, Model } from "sequelize";
import db from "../config/db.js";
import Cafe from "./cafe.js";

class Ulasan extends Model {}

Ulasan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cafe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cafe_criteria",
        key: "id",
      },
    },
    isi_ulasan: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Ulasan",
    tableName: "cafe_ulasan",
    timestamps: false,
  },
);

Cafe.hasMany(Ulasan, { foreignKey: "cafe_id", as: "ulasan" });
Ulasan.belongsTo(Cafe, { foreignKey: "cafe_id" });

export default Ulasan;
