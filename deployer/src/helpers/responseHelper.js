export const sendError = (res, status, message) => {
  res.status(status).send(message);
};

export const sendData = (res, status, data) => {
  res.status(status).send({ data });
};
