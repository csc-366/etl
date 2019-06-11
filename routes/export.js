import express from 'express';
import {
    exportPendingCSV,
    exportCompleteCSV,
    exportCompleteJSON,
    exportPendingJSON
} from "../controllers/ExportController";

let router = express.Router();

router.get('/csv/pending', exportPendingCSV);
router.get('/csv/complete', exportCompleteCSV);
router.get('/json/pending', exportPendingJSON);
router.get('/json/complete', exportCompleteJSON);

export default router;
