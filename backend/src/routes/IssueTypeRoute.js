const router = require("express").Router()
const IssueTypeController = require("../controller/IssueTypeController")

router.get("/issuetypes",IssueTypeController.getAllIssueTypes)
router.get("/issuetypes/:id",IssueTypeController.getIssueTypeById)
router.put("/issuetypes/:id",IssueTypeController.updateIssueType)
router.delete("/issuetypes/:id",IssueTypeController.deleteIssueType)
router.post("/issuetypes",IssueTypeController.createIssueType)

module.exports = router;
