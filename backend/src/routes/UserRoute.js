const router = require("express").Router()
const usercontroller = require('../controller/UserControllers')


router.post("/users",usercontroller.adduser)
router.get("/users",usercontroller.getUsers)
router.get("/users/:id",usercontroller.getUserById)
router.put("/users/:id",usercontroller.updateUser)
router.delete("/users/:id",usercontroller.deleteUser)
router.post("/users/login",usercontroller.loginUser)

module.exports = router;

