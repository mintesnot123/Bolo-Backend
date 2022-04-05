exports.success = (message, results, statusCode, redirectURL = null) => {
    return {
        message,
        error: false,
        code: statusCode,
        results,
        ...(redirectURL && { redirectURL: redirectURL }),
    };
};

exports.error = (message, statusCode, redirectURL = null) => {
    // List of common HTTP request code
    const codes = [200, 201, 400, 401, 404, 403, 422, 500];

    // Get matched code
    const findCode = codes.find((code) => code == statusCode);

    if (!findCode) statusCode = 500;
    else statusCode = findCode;

    return {
        message,
        code: statusCode,
        error: true,
        ...(redirectURL && { redirectURL: redirectURL }),
    };
};

exports.validation = (errors) => {
    return {
        message: errors /* "Validation errors" */,
        error: true,
        code: 422,
        /* errors, */
    };
};
