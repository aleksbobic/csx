import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/react';
import {
    getBezierPath,
    getEdgeCenter,
    getMarkerEnd
} from 'react-flow-renderer';

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    arrowHeadType,
    markerEndId
}) {
    const edgePath = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    });
    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
        sourceX,
        sourceY,
        targetX,
        targetY
    });

    return (
        <>
            <path
                id={id}
                style={style}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <foreignObject
                width={80}
                height={30}
                x={edgeCenterX - 80 / 2}
                y={edgeCenterY - 30 / 2}
                style={{ padding: '4px', textAlign: 'center' }}
            >
                <Tag
                    className="edgebutton"
                    onClick={() => data.changeRelationship(id)}
                    variant="solid"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    transition="all 0.1s ease-in-out"
                    style={{
                        backgroundColor: 'rgba(80, 80, 80, 0.7)',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none'
                    }}
                    _hover={{
                        cursor: 'pointer'
                    }}
                >
                    <TagLabel>{data.relationship}</TagLabel>
                    <TagCloseButton onClick={() => data.removeEdge(id)} />
                </Tag>
            </foreignObject>
        </>
    );
}
