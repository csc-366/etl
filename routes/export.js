import express from 'express';
import {exportPendingCSV, exportJSON, exportCompleteCSV} from "../controllers/ExportController";

let router = express.Router();

router.get('/csv/pending', exportPendingCSV);
router.get('/csv/complete', exportCompleteCSV);
router.get('/json', exportJSON);

export default router;
