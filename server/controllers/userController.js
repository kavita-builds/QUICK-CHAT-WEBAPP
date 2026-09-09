const router = require('express').Router();
const User = require('./../models/user')
const authMiddleware = require('./../middlewares/authMiddleware')
const clodudinary = require('./../cloudinary')

// GET details of current logged-in user
router.get('/get-logged-user',authMiddleware,async (req,res)=>{
  try{
    const user = await User.findOne({_id:req.userId}) 
    res.send({
        message:"user fetched successfully",
        success:true,
        data:user
    })

  }catch(error){
    res.status(400).send({
        message:error.message,
        success:false
    })
  }
})


router.get('/get-all-users',authMiddleware,async (req,res)=>{
  try{
    const allUsers = await User.find({_id:{$ne : req.userId}});

    res.send({
        message:"all users fetched successfully",
        success:true,
        data: allUsers
    })

  }catch(error){
    res.status(400).send({
        message:error.message,
        success:false
    })
  }
})


router.post("/upload-profile", authMiddleware, async (req, res) => {
  try {
    const image = req.body.image;

    const uploadedImage = await clodudinary.uploader.upload(image, {
      folder: "quick-chat",
    });

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        profilePic: uploadedImage.secure_url,
      },
      {
        new: true,
      }
    );

    res.send({
      message: "Profile picture uploaded successfully",
      success: true,
      data: user,
    });

  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});


module.exports = router;