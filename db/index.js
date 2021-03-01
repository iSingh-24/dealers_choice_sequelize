const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;
const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/naruto_db",
  {
    dialect: "postgres",
    ssl: true,
    protocol: "postgres",

    logging: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const Village = db.define("village", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING(15),
  },
});

const Character = db.define("character", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  name: {
    type: DataTypes.STRING(15),
  },
});

Character.belongsTo(Village, { as: "villager" });
Village.hasMany(Character, { foreignKey: "villagerId", as: "members" });

Character.belongsTo(Character, { as: "hokage" });
Character.hasMany(Character, { foreignKey: "hokageId", as: "villagers" });

const syncAndSeed = async () => {
  await db.sync({ force: true });

  const [
    naruto,
    hinata,
    sasuke,
    itachi,
    raikage,
    killerBee,
    gaara,
    kankuro,
    hiddenLeaf,
    hiddenCloud,
    hiddenSand,
  ] = await Promise.all([
    Character.create({ name: "Naruto" }),
    Character.create({ name: "Hinata" }),
    Character.create({ name: "Sasuke" }),
    Character.create({ name: "Itachi" }),
    Character.create({ name: "Raikage" }),
    Character.create({ name: "Killer Bee" }),
    Character.create({ name: "Gaara" }),
    Character.create({ name: "Kankuro" }),
    Village.create({ name: "Hidden Leaf" }),
    Village.create({ name: "Hidden Cloud" }),
    Village.create({ name: "Hidden Sand" }),
  ]);

  naruto.villagerId = hiddenLeaf.id;
  hinata.villagerId = hiddenLeaf.id;
  sasuke.villagerId = hiddenLeaf.id;
  itachi.villagerId = hiddenLeaf.id;
  raikage.villagerId = hiddenCloud.id;
  killerBee.villagerId = hiddenCloud.id;
  gaara.villagerId = hiddenSand.id;
  kankuro.villagerId = hiddenSand.id;

  kankuro.hokageId = gaara.id;
  hinata.hokageId = naruto.id;
  sasuke.hokageId = naruto.id;
  itachi.hokageId = naruto.id;
  killerBee.hokageId = raikage.id;

  await Promise.all([
    naruto.save(),
    hinata.save(),
    sasuke.save(),
    itachi.save(),
    raikage.save(),
    killerBee.save(),
    gaara.save(),
    kankuro.save(),
  ]);
};

module.exports = {
  db,
  syncAndSeed,
  models: {
    Village,
    Character,
  },
};
