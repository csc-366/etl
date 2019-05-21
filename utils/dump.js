import fs from 'fs';

let outputFileName = `./log/default`;

export const setOutputFileName = (fileName) => {
    outputFileName = fileName;
};

export const log = async (line, error=false) => {
    fs.appendFile(outputFileName,`${line}\n`, (err) => {
        if (err) throw err;
        if (error) {
            console.error(`LOGGER:\t${outputFileName}\t${line}`)
        } else {
            console.log(`LOGGER:\t${outputFileName}\t${line}`)
        }
    });
};
