const sendSuccess = (res, message = 'Success', data = {}) => {
  return res.status(200).json({
    status: true,
    message,
    data,
  });
};

const sendCreated = (res, message = 'Created successfully', data = {}) => {
  return res.status(201).json({
    status: true,
    message,
    data,
  });
};

// Flexible helper: supports both (res, message, data) and (res, statusCode, message)
// Returns HTTP 200 with status: false for application-level errors
const sendFail = (res, arg2 = 'Bad request', arg3 = {}) => {
  let httpStatus = 200; // Always return 200 for structured error responses
  let message = 'Bad request';
  let data = {};

  if (typeof arg2 === 'number') {
    // If first arg is a number, it's for backward compatibility
    // but we still return 200 with the message
    if (typeof arg3 === 'string') {
      message = arg3;
      data = {};
    } else {
      data = arg3 || {};
    }
  } else {
    message = arg2;
    data = arg3 || {};
  }

  return res.status(httpStatus).json({
    status: false,
    message,
    data,
  });
};

// Flexible error helper: supports (res, message, error) and (res, statusCode, message, error)
// Also accepts being called with an Error/object as the 2nd argument: sendError(res, err)
const sendError = (res, arg2 = 'Internal server error', arg3 = null, arg4 = null) => {
  let status = 500;
  let message = 'Internal server error';
  let error = null;

  if (typeof arg2 === 'number') {
    status = arg2;
    if (typeof arg3 === 'string') {
      message = arg3;
      error = arg4;
    } else {
      error = arg3;
    }
  } else if (arg2 && typeof arg2 === 'object') {
    // Called as sendError(res, errorObject)
    error = arg2;
  } else {
    message = arg2;
    error = arg3;
  }

  return res.status(status).json({
    status: false,
    message,
    error: process.env.NODE_ENV === 'development' ? (error && error.toString ? error.toString() : error) : undefined,
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendFail,
  sendError,
};
