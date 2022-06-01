const jwt = require("jsonwebtoken");
const User  = require("../models/user");

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    const [tokenType, tokenValue] = authorization.split(" ");

    if (tokenType != "Bearer") {
      res.status(401).send({
        errorMessage: "로그인이 필요합니다.",
      });
      return;
    }

    // if (tokenType === "Bearer") {
    //   res.status(201).send({
    //     result: "true",
    //     status: 201,
    //     errorMessage: "이미 로그인이 되어 있습니다.",
    //   });
    // }

    try {
      const { userId } = jwt.verify(tokenValue, "my-secret-key1");
      User.findById(userId).exec()
      .then((user) => {
          res.locals.user = user;
          console.log(user)
          next();
      });
      

    } catch (err) {
    res.status(401).send({
      errorMessage: "로그인이 필요합니다.",
    });
    return;
  }

};