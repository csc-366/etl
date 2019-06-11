import {sendData, sendError} from "../utils/responseHelper";
import * as e from '../models/export';

export const exportPendingCSV = async (req, res) => {
    const csv = await e.exportPending();
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename=\"export.csv\"');
    res.status(200);
    csv.pipe(res);
};

export const exportCompleteCSV = async (req, res) => {
    const csv = await e.exportCompleted();
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', 'attachment; filename=\"export.csv\"');
    res.status(200);
    csv.pipe(res);
};

export const exportPendingJSON = async (req, res) => {
    const json = await e.exportPending('json');
    res.set('Content-Type', 'application/json');
    res.status(200).send(json);
};

export const exportCompleteJSON = async (req, res) => {
    const json = await e.exportCompleted('json');
    res.set('Content-Type', 'application/json');
    res.status(200).send(json);
};
