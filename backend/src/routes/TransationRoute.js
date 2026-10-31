const router = require("express").Router()
const TransactionController = require("../controller/TransactionController")

router.post("/transactions",TransactionController.createTransaction)
router.get("/transactions",TransactionController.getAllTransactions)
router.get("/transactions/:id",TransactionController.getTransactionById)
router.put("/transactions/:id",TransactionController.updateTransactionStatus)
router.delete("/transactions/:id",TransactionController.deleteTransaction)

module.exports = router