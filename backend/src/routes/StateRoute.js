const router = require("express").Router()

const StateController = require("../controller/StateController")

router.post("/states",StateController.createState)
router.get("/states",StateController.getAllStates)
router.get("/states/:id",StateController.getStateById)
router.put("/states/:id",StateController.updateState)
router.delete("/states/:id",StateController.deleteState)

module.exports = router