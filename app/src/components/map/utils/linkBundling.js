// new11 - Bundle links based on proximity for improved visualization
export const bundleLinks = (links, bundlingDistanceThreshold = 10) => {
    const groupedLinks = {};
    // Group links by source and target proximity
    links.forEach((link) => {
        const sourceKey = `${Math.round(link.sourcePosition[0] / bundlingDistanceThreshold)},${Math.round(link.sourcePosition[1] / bundlingDistanceThreshold)}`;
        const targetKey = `${Math.round(link.targetPosition[0] / bundlingDistanceThreshold)},${Math.round(link.targetPosition[1] / bundlingDistanceThreshold)}`;
        const bundleKey = `${sourceKey}-${targetKey}`;

        if (!groupedLinks[bundleKey]) {
            groupedLinks[bundleKey] = [];
        }
        groupedLinks[bundleKey].push(link);
    });
    // Calculate average positions and control points for bundled groups
    return Object.values(groupedLinks).map((group) => {
        if (group.length === 1) return group[0];

        const sourceAvg = [
            group.reduce((sum, l) => sum + l.sourcePosition[0], 0) / group.length,
            group.reduce((sum, l) => sum + l.sourcePosition[1], 0) / group.length,
        ];
        const targetAvg = [
            group.reduce((sum, l) => sum + l.targetPosition[0], 0) / group.length,
            group.reduce((sum, l) => sum + l.targetPosition[1], 0) / group.length,
        ];
        // Calculate a midpoint control point
        const controlPoint = [
            (sourceAvg[0] + targetAvg[0]) / 2,
            (sourceAvg[1] + targetAvg[1]) / 2 + 10,
        ];

        return {
            ...group[0],
            sourcePosition: sourceAvg,
            targetPosition: targetAvg,
            controlPoints: [controlPoint],
        };
    });
};
