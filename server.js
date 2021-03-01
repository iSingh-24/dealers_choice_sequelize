const {
  db,
  syncAndSeed,
  models: { Village, Character },
} = require("./db");
const path = require("path");
const express = require("express");
const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));

app.get("/", async (req, res, next) => {
  try {
    const villages = await Village.findAll();
    res.send(`
    <html>
      <head>
        <link rel = 'stylesheet' href = '/public/styles.css'/>
      </head>
      <body>
      <h1>Welcome to the Ninja World</h1>
      <img src ="https://i.ytimg.com/vi/RsjJViqWz2Q/maxresdefault.jpg">
      <img class ="imgTwo" src = "https://i.pinimg.com/originals/d5/40/ac/d540ac82faa864e7a94bc5c478fb7e59.gif"> 
      <h2>Villages</h2>
      <ul>
      ${villages
        .map(
          (village) => `<a href = "/api/villages/${village.id}">
        <li>${village.name}</li></a>`
        )
        .join("")}
      </ul>
      <a href = "/api/hokages" ><h2>Click Here To See The Hokages List</h2></a>
      </body>
    </html>`);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/hokages", async (req, res, next) => {
  try {
    const hokages = await Character.findAll({
      where: {
        hokageId: null,
      },
    });

    res.send(`
    <html>
      <head>
        <link rel = 'stylesheet' href = '/public/styles.css'/>
      </head>
      <body class = 'hokages'>
      <h1>All Hail The Hokages</h1>
      <h2 class = 'hokageUL'>Hokages</h2>
      <ul class = 'hokageUL'>
      ${hokages
        .map((hokage) => `<li class ='hokageListItem'>${hokage.name}</li>`)
        .join("")}
      </ul>
      </body>
      <a href = "/"><h1 class = "homePage">CLICK HERE TO GO BACK TO HOME PAGE</h1></a>
    </html>`);
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/villages/:id", async (req, res, next) => {
  try {
    const villages = await Village.findAll({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Character,
          as: "members",
        },
      ],
    });

    res.send(`
    <html>
      <head>
        <link rel = 'stylesheet' href = '/public/styles.css'/>
      </head>
      <body class = "villages">
      <h1>VILLAGE MEMBERS</h1>
      <h2>The Homies</h2>
      <ul>
      ${villages[0].members
        .map((member) => `<li class = "homies">${member.name}</li>`)
        .join("")}
      </ul>
      </body>
      <a href = "/"><h1 class = "homePage">CLICK HERE TO GO BACK TO HOME PAGE</h1></a>
    </html>`);
  } catch (ex) {
    next(ex);
  }
});

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
