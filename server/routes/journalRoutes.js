import Router from "express"
import pdfLimiter from "../middlewares/pdfLimiter.js";
import { addJourneyEntry,getJournalSummary,generateTAPdf,deleteEntry, updateEntry } from "../controllers/journalController.js"
import isLoggedIn from "../middlewares/authentication.js"
const router = Router()


router.post("/add",isLoggedIn,addJourneyEntry)


router.get("/:monthYear",isLoggedIn,getJournalSummary)

router.delete("/:entryId",isLoggedIn,deleteEntry)


router.patch("/update-entry/:id", isLoggedIn, updateEntry);

router.get("/generate-pdf/:monthYear",isLoggedIn,pdfLimiter,generateTAPdf)

export default router