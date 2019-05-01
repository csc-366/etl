export const sendError = (res, status, message) => {
    res.status(status).json({message})
};

export const sendData = (res, data) => {
    res.status(200).json({data})
};