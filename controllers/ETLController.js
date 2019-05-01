import {parse} from "../utils/csv";
import fs from 'fs';

export async function etlIngest(req, res) {
    if (!req.file.path) {
        res.status(400).json({
            message: "Could not find file."
        });
        return
    }

    const filename = req.file.path;

    try {
        let data = parse(filename);

        res.status(200).json({
            data
        });
    } catch (e) {
        res.status(500).json({
            message: "Error parsing data."
        })
    }

    await fs.unlink(`./${filename}`);
}