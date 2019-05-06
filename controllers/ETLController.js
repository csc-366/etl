import {parse} from "../utils/csv";
import fs from 'fs';
import {sendData, sendError} from "../utils/responseHelper";

export async function etlIngest(req, res) {
    if (!req.file.path) {
        sendError(res, 400, "Could not find file.");
        return
    }

    const filename = req.file.path;

    try {
        let data = parse(filename);

        sendData(res, data);
    } catch (e) {
        sendError(res, 500, "Error parsing data.");
    }

    await fs.unlink(`./${filename}`);
}