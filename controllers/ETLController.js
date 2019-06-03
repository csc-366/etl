import {parse} from "../utils/csv";
import fs from 'fs';
import {sendData, sendError} from "../utils/responseHelper";
import {ingest} from "../models/etl/db";
import {promisify} from "util";

const unlink = promisify(fs.unlink);

export async function etlIngest(req, res) {
    if (!req.file || !req.file.path) {
        sendError(res, 400, "Could not find file.");
        return
    }

    const filename = req.file.path;

    let data, parseErrors;
    try {
        [data, parseErrors] = await parse(filename);
    } catch (e) {
        sendError(res, 500, `${e.message}`);
        throw e;
    } finally {
        await unlink(`./${filename}`);
    }

    const ingestErrors = await ingest(data);

    sendData(res, {parseErrors, ingestErrors});
}