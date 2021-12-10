const jwt = require("jsonwebtoken");
const Login = require("../models/login");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      //res.render("register");
      throw new Error("token is not present");
    } else {
      const verifyuser = jwt.verify(token, process.env.SECRET_KEY);
      console.log(verifyuser);

      const user = await Login.findOne({ _id: verifyuser._id });
      //console.log(user);

      //for logout function
      req.token = token;
      req.user = user;
      next();
    }
  } catch (err) {
    throw new Error("somjething went wrong");
    next();
  }
};
module.exports = auth;
