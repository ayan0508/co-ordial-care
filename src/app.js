require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const hbs = require("hbs");
const path = require("path");
const bcrypt = require("bcryptjs");
const cookieparser = require("cookie-parser");
const port = process.env.PORT || 80;
const auth = require("../src/middleware/auth");
require("./db/conn");
const Register = require("./models/login");
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");
//console.log(path.join(__dirname, "../public"));
app.use(express.static(static_path));

app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);
app.use(express.json()); //for postman use to convert json file
app.use(cookieparser());
app.use(express.urlencoded({ extended: false })); //for live application

console.log(process.env.SECRET_KEY); //for sequirity purpose and hide th secret key or our code from the user we use dotenv package

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/ambulance", (req, res) => {
  res.render("ambulance");
});
app.get("/blood", (req, res) => {
  res.render("blood");
});
app.get("/oxygen", auth, (req, res) => {
  res.render("oxygen");
});
app.get("/medicine", (req, res) => {
  res.render("medicine");
});
app.get("/information", (req, res) => {
  res.render("information");
});
app.get("/about", auth, (req, res) => {
  //console.log(`this is the cookie ${req.cookies.jwt}`);
  res.render("about");
});
app.get("/logout", auth, async (req, res) => {
  //res.render("register");
  try {
    console.log(req.user);
    req.user.tokens = req.user.tokens.filter((currtoken) => {
      return currtoken.token !== req.token;
    });

    res.clearCookie("jwt");
    console.log("login successfull");
    await req.user.save();
    res.render("register");
  } catch (err) {
    app.render(err);
  }
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", async (req, res) => {
  //res.render("register");
  try {
    // console.log(req.body.firstname);
    // res.send(req.body.firstname);
    const password = req.body.password;
    const cpassword = req.body.conpassword;
    if (password === cpassword) {
      const customer = new Register({
        name: req.body.firstname,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        conpassword: req.body.conpassword,
      });

      const token = await customer.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 3000000),
        httpOnly: true,
      });

      const register = await customer.save();
      res.status(201).render("index");
    } else {
      res.send("password are not match");
      //res.alart("password are not match");
    }
  } catch (err) {
    res.status(400).send(err);
  }
});
app.post("/login", async (req, res) => {
  try {
    const luser = req.body.username;
    const lpass = req.body.password;
    //console.log(`email : ${luser} & password :${lpass}`);
    const userobj = await Register.findOne({ username: luser });
    const ismatch = await bcrypt.compare(lpass, userobj.password);
    const token = await userobj.generateAuthToken();

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 300000),
      httpOnly: true,
      //secure:true, only run in https;
    });

    if (ismatch) {
      res.status(200).render("index");
    } else {
      res.status(401).send("password is not maching");
    }
    //console.log(username);
  } catch (err) {
    res.status(500).send("invalid detail");
  }
});
app.listen(port, () => {
  console.log(`running in port ${port}`);
});

//
// nst { Console } = require("console");
// nst createtoken = async () => {const token = await jwt.sign(  { _id: "612d1aeb9ff9dfc6d8a94804" },  "njnrfrfnriqoqnnowwowwmqwit)^(#(sjsjskqikameiokMISO>NNEND<>:lEJNENENIND");
//   console.log(token);
//   const uservar = await jwt.verify(
//     token,
//     "njnrfrfnriqoqnnowwowwmqwit)^(#(sjsjskqikameiokMISO>NNEND<>:lEJNENENIND"
//   );
//   console.log(uservar);
// };
// createtoken();
//use of hash function
//const bcrypt = require("bcryptjs");
//const { Console } = require("console");
// const spass = async (password) => {
//   try {
//     const passhash = await bcrypt.hash(password, 10);
//     console.log(passhash);
//     const passmtch = await bcrypt.compare("ayan2000", passhash);
//     console.log(passmtch);
//   } catch (e) {
//     console.log(e);
//   }
// };
//spass("@ayan2000");
//how to use becrypt hash fuction
//
