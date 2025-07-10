const sendSuccess = (res, message = 'Success', data = {}) => {
  return res.status(200).json({
    status: true,
    message,
    data
  });
};

const sendCreated = (res, message = 'Created successfully', data = {}) => {
  return res.status(201).json({
    status: true,
    message,
    data
  });
};

const sendFail = (res, message = 'Bad request', data = {}) => {
  return res.status(400).json({
    status: false,
    message,
    data
  });
};

const sendError = (res, message = 'Internal server error', error = null) => {
  return res.status(500).json({
    status: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendFail,
  sendError
};
