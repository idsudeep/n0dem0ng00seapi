const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/token");

const User = require("../model/user");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */




router.post(
  "/signup",
  [
    check("username", "Please Enter a Valid Username")
      .not()
      .isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;
    try {
      
      let user = await User.findOne({
        email
      });
      if (user) {
        return res.status(400).json({
          msg: "User Already Exists"
        });
      }

      user = new User({
        username,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: 10000
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token
          });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
    }
  }
);


router.post("/login",
[
  check("email","please enter the valid email").isEmail(),
  check("password","please enter the valid password").isLength({
    min:6
  })
],
async (req,res)=>
{


  // validating a req in valiationResult module
  const errors = validationResult(req);

 

 
  if(!errors.isEmpty())
  {
     res.status(200).json({

      errors:errors.array(),
      badinput:'Invalid Tnputs'
    });
  }
  const {email , password} = req.body;
  
      try {

        let user = await User.findOne({email});
        
        if(!user)
        {
          
         return res.status(200).json({
            message:"user's not exist"
          });
          
        }

        const isTrue = await bcrypt.compare(password , user.password);

        if(!isTrue)
        
         return res.status(200).json(
            {
              message:"password is not match"
            });
        
        const payload = {

            user:{
              id:user.id
            }
        };

        console.log(payload);
        jwt.sign(
          payload,
          "randomString",
          {
            expiresIn :3600
          },
          (err,token)=>{
            if(err) throw err;
            res.status(200).json({
              token
            });

            
          }
        );
      } catch(e){

       console.error(e);
        res.status(500).json({
          message:"catch errors"
        });
      }
});


router.get("/self",auth , async(req,res)=>{

try{

  const user = await User.findById(req.user.id);

  res.json(user);
}catch(e)
{
  res.send({message:"error in self api"});
}

});
module.exports = router;