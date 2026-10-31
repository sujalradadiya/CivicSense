const router = require("express").Router()
const AuthorityController = require("../controller/AuthorityControllers")

router.get("/authorities",AuthorityController.getAllAuthorities)
router.post("/authorities",AuthorityController.createAuthority)
router.get("/authorities/:id",AuthorityController.getAuthorityById)
router.delete("/authorities/:id",AuthorityController.deleteAuthority)
router.put("/authorities/:id",AuthorityController.updateAuthority)

module.exports = router;