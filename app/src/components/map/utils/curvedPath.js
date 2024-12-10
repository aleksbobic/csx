// // // new9 - Calculate control points for curved links
// // // new 11 - Added controlPoints parameter to support custom control points
// new16 - error handling for invalid source or target
export const getCurvedPath = (source, target, curvature, controlPoints = []) => {
    if (!source || !target) {
        console.error("Invalid source or target for getCurvedPath:", { source, target });
        return [];
    }

    if (controlPoints.length) {
        return [source, ...controlPoints, target];
    }

    const midPoint = [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2];
    const offset = [
        curvature * (target[1] - source[1]),
        -curvature * (target[0] - source[0]),
    ];
    const controlPoint = [midPoint[0] + offset[0], midPoint[1] + offset[1]];
    return [source, controlPoint, target];
};

