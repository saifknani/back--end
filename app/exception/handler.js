export const handler = (response, error = "UNKNOWN_EXCEPTION", message = "An error has occured", status = 500) => {
    const payload = {
        error,
        message,
        status
    };
    return response.status(status).json(payload);
}