const router = require("express").Router();
const IssueController = require("../controller/IssueControllers");
const optionalAuth = require("../middleware/optionalAuth");

router.post("/issues", optionalAuth, IssueController.addIssue);
router.get("/issues", optionalAuth, IssueController.getIssues);
router.put("/issues/:id", optionalAuth, IssueController.updateIssue);
router.delete("/issues/:id", optionalAuth, IssueController.deleteIssue);

module.exports = router;