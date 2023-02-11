export function isEnvTrue(name) {
    return process?.env[name] === 'true';
}

export function isEnvFalse(name) {
    return process?.env[name] === 'false';
}

export function isEnvSet(name) {
    return process?.env[name];
}
