export function isEnvTrue(name) {
    if (process.env) {
        return process.env[name] === 'true';
    }
    return false;
}

export function isEnvFalse(name) {
    if (process.env) {
        return process.env[name] === 'false';
    }
    return false;
}

export function isEnvSet(name) {
    if (process.env) {
        return process.env[name];
    }
    return false;
}

export function capitaliseFirstLetter(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export async function safeRequest(promise) {
    try {
        const results = await promise;
        return { response: results, error: null };
    } catch (error) {
        const errorObject = {
            url: error.config.url,
            method: error.config.method
        };

        if (error.response) {
            errorObject['type'] = 'response';
            errorObject['data'] = error.response.data;
            errorObject['status'] = error.response.status;
        } else if (error.request) {
            errorObject['type'] = 'request';
            errorObject['state'] = error.request.readyState;
            errorObject['status'] = error.request.status;
        } else {
            errorObject['type'] = 'setup';
            errorObject['message'] = error.message;
        }

        return { response: null, error: errorObject };
    }
}
