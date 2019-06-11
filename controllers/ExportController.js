import {sendData, sendError} from "../utils/responseHelper";
import * as e from '../models/export';

export const exportPendingCSV = async (req, res) => {
    const csv = await e.exportPendingCSV();
    res.attachment('export.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
};

export const exportCompleteCSV = async (req, res) => {
    const csv = await e.exportCompletedCSV();
    res.attachment('export.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
};

export const exportJSON = async (req, res) => {
    sendError(res, 418, "Endpoint Not Yet Implemented")
};