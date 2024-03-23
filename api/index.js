const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("../models/UserModel");
const News = require("../models/NewsModel");
const port = process.env.PORT || 3001;
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "avfG7%$3ghdaJKLpi",
    saveUninitialized: true,
    resave: true,
  })
);
app.set("view engine", "ejs");
app.get(
  "/",
  (req, res, next) => {
    if (req.session && req.session.user) res.redirect("/home");
    else next();
  },
  (req, res) => {
    res.render(path.join(__dirname, "register.ejs"));
  }
);
app.get(
  "/login",
  (req, res, next) => {
    if (req.session && req.session.user) res.redirect("/home");
    else next();
  },
  (req, res) => {
    res.render(path.join(__dirname, "userOrAdminLogin.ejs"));
  }
);
app.get(
  "/user-login",
  (req, res, next) => {
    if (req.session && req.session.user) res.redirect("/home");
    else next();
  },
  (req, res) => {
    res.render(path.join(__dirname, "login.ejs"));
  }
);
app.get(
  "/admin-login",
  (req, res, next) => {
    if (req.session && req.session.user) res.redirect("/home");
    else next();
  },
  (req, res) => {
    res.render(path.join(__dirname, "admin-login.ejs"));
  }
);
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  const yesOrNo = await User.findOne({ email: email });
  if (yesOrNo !== null) {
    res.status(200).render(path.join(__dirname, "RegisterFailed.ejs"));
  } else {
    const user = new User({ name, email, password });
    await user
      .save()
      .then(() => {
        req.session.user = user;
        req.session.save();
        res.status(200).render(path.join(__dirname, "RegisterSuccess.ejs"));
      })
      .catch((err) => {
        res.status(500).send("Registration failed");
      });
  }
});
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const emailInDb = await User.findOne({ email: email });
  if (!emailInDb) {
    res.status(404).send("User not found");
  } else {
    const password = req.body.password;
    const passwordInDb = emailInDb.password;
    console.log("Password in db:", passwordInDb);
    console.log("Entered password:", password);
    if (password === passwordInDb) {
      req.session.user = email;
      console.log("user is: ", req.session.user);
      req.session.save();
      //   res
      //     .status(200)
      //     .render(path.join(__dirname, "Home.ejs"), { email: req.session.user });
      res.redirect("/home");
    } else {
      res.status(500).send("Password incorrect");
    }
  }
});
app.post("/post-news", async (req, res) => {
  console.log(req.body);
  const news = new News(req.body);
  await news
    .save()
    .then(() => {
      res.status(200).render(path.join(__dirname, "NewsSaved.ejs"));
    })
    .catch((err) => {
      console.log("Error saving news");
      res.status(500).send("Error saving news");
      console.log(err.message);
    });
  //   res.send("Done");
});
const categoryMap = {
  political: "political",
  finance: "finance",
  sports: "sports",
  entertainment: "entertainment",
};
app.get(
  "/home",
  (req, res, next) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.render(path.join(__dirname, "Unauthorized.ejs"));
    }
  },
  async (req, res) => {
    const news = await News.find({ category: "political" });
    const nameData = await User.findOne({email:req.session.user});
    res.render(path.join(__dirname, "home.ejs"), {
      email: req.session.user,
      name:nameData.name,
      data: news,
      showTabs: true,
      date: "",
    });
  }
);
// app.get('/home',)
app.get(
  "/home/:category",
  (req, res, next) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.render(path.join(__dirname, "Unauthorized.ejs"));
    }
  },
  async (req, res) => {
    const category = req.params.category;
    if (category in categoryMap) {
      const news = await News.find({ category: categoryMap[category] });
      console.log(news);
      res.json({
        email: req.session.user,
        data: news,
        showTabs: true,
        date: "",
      });
    } else {
      res.status(404).send("Category not found");
    }
  }
);
app.post("/home/news-by-date",  (req, res, next) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.render(path.join(__dirname, "Unauthorized.ejs"));
    }
  }, async (req, res) => {
  const { date } = req.body;
  console.log(date);
  const news = await News.find({ createdAt: date });
  console.log(news);
  res.render(path.join(__dirname, "home.ejs"), {
    email: req.session.user,
    data: news,
    showTabs: false,
    date: date,
  });
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  //   res.render(path.join(__dirname, "/login"));
  res.redirect("login");
});
mongoose
  .connect(
    "mongodb+srv://prabhjotarora99:VgQl8CX2gQ7i9Dyj@cluster0.i0fhcu1.mongodb.net/"
  )
  .then(() => {
    console.log("Connected to Mongo");
    app.listen(port, () => {
      console.log("Listening on port " + port);
    });
  })
  .catch((err) => {
    console.log("error occurred: " + err);
    console.log(err);
  });
module.exports = app;
//   VgQl8CX2gQ7i9Dyj
// Admin access:
// admin@g.co
// admin123
