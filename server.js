const { UUID } = require("sequelize");
const Sequelize = require("sequelize");
const { DataTypes } = Sequelize;
const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/naruto_db"
);
const express = require("express");
const app = express();

app.get("/api/villages", async (req, res, next) => {
  try {
    res.send(
      await Village.findAll({
        include: [
          {
            model: Character,
            as: "members",
          },
        ],
      })
    );
  } catch (ex) {
    next(ex);
  }
});

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

const syncAndSeed = async () => {
  await db.sync({ force: true });

  const [
    naruto,
    zabuza,
    gaara,
    hiddenLeaf,
    hiddenMist,
    hiddenSand,
  ] = await Promise.all([
    Character.create({ name: "naruto" }),
    Character.create({ name: "zabuza" }),
    Character.create({ name: "gaara" }),
    Village.create({ name: "hiddenLeaf" }),
    Village.create({ name: "hiddenMist" }),
    Village.create({ name: "hiddenSand" }),
  ]);

  naruto.villagerId = hiddenLeaf.id;
  await naruto.save();
};

const init = async () => {
  try {
    await db.authenticate();
    await syncAndSeed();

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`Listening on port: ${port}`);
    });
  } catch (ex) {
    console.log(ex);
  }
};

init();
