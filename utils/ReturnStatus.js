/**
 * Function to standardize API responses
 * @param {Object} options - Response options
 * @param {number} options.status - HTTP status code
 * @param {Object} options.res - Express response object
 * @param {Object|Array} [options.data] - Optional data to return
 * @param {string} [options.message] - Optional message to return
 * @returns {Object} Standardized response
 */
export const returnStatus = ({ status, res, data, message }) => {
  const statusMessages = {
    200: "Success",
    201: "Created",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
  };

  const defaultMessage = statusMessages[status] || "Unknown Status";

  return res.status(status).json({
    status,
    message: message || defaultMessage,
    data: data || null,
  });
};
