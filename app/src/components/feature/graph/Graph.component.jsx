import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { RootStoreContext } from 'stores/RootStore';
import * as THREE from 'three';
import { useResizeDetector } from 'react-resize-detector';

import './Graph.scss';
import { useLocationEffect } from 'hooks/useLocationEffect.hook';

function Graph(props) {
    const store = useContext(RootStoreContext);
    const containerRef = useRef();
    const bwColor = useColorModeValue('#303030', 'white');
    const backgroundColor = useColorModeValue('#ffffff', '#1A202C');
    const [timer, setTimer] = useState(null);
    const { width, height } = useResizeDetector({ containerRef });
    const [linkOpacity, setLinkOpacity] = useState(0.3);

    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const [graphContainerElement, setGraphContainerElement] = useState(null);

    const { colorMode } = useColorMode();

    useLocalObservable(() => ({}));

    useEffect(() => {
        if (colorMode === 'light') {
            store.graphInstance.setOutlinePassColor('red');
        } else {
            store.graphInstance.setOutlinePassColor('white');
        }
    }, [colorMode, store.graphInstance]);

    useEffect(() => {
        const getNewSizes = () =>
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });

        const handleResize = () => {
            clearTimeout(timer);
            setTimer(setTimeout(getNewSizes, 100));
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    const onNodeRightClick = (node, event) => {
        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area'
            }),
            JSON.stringify({
                item_type: 'Node',
                item_id: node.id,
                item_label: node.label,
                item_feature: node.feature
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Open node context menu'
            })
        );

        store.contextMenu.showContextMenu(node, event.clientX, event.clientY);
    };

    const onBackgroundRightClick = event => {
        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area'
            }),
            JSON.stringify({
                item_type: 'Canvas'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Open canvas context menu'
            })
        );

        store.contextMenu.showCanvasContextMenu(event.clientX, event.clientY);
    };

    const onLinkRightClick = (link, event) => {
        store.track.trackEvent(
            JSON.stringify({
                area: 'Graph area'
            }),
            JSON.stringify({
                item_type: 'Edge'
            }),
            JSON.stringify({
                event_type: 'Click',
                event_action: 'Open canvas context menu'
            })
        );

        store.contextMenu.showCanvasContextMenu(event.clientX, event.clientY);
    };

    const onNodeHover = (node, nodeout, event) => {
        graphContainerElement.style.cursor = node ? 'pointer' : 'default';

        if (node) {
            if (
                containerRef.current &&
                node.x &&
                node.y &&
                !store.contextMenu.contextType
            ) {
                const contextCoordinates =
                    containerRef.current.graph2ScreenCoords(
                        node.x,
                        node.y,
                        node.z ? node.z : 0
                    );

                store.contextMenu.showNodeDetails(
                    node,
                    contextCoordinates.x,
                    contextCoordinates.y
                );
            }

            if (!node.selected) {
                store.graphInstance.addOutlinePassObject(node?.__threeObj);
            }
        }

        if (nodeout) {
            if (store.contextMenu.contextType === 'node_details') {
                store.contextMenu.hideContextMenu();
            }

            if (!nodeout.selected) {
                store.graphInstance.removeOutlinePassObject(
                    nodeout?.__threeObj
                );
            }
        }
    };

    useEffect(() => {
        setGraphContainerElement(
            document.getElementsByClassName('scene-container')[0]
        );
    }, []);

    useLocationEffect(() => store.graph.clearGraphId());

    useEffect(() => {
        store.graphInstance.setGraphProps(containerRef.current);

        return function cleanup() {
            if (store.graphInstance.forceEngine) {
                store.graphInstance.stopForce();
            }
        };
    }, [store.graphInstance, store.graph]);

    useEffect(() => {
        if (store.graphInstance.forceEngine) {
            containerRef.current.d3ReheatSimulation();
        } else {
            containerRef.current.refresh();
        }
    }, [
        store.graphInstance.nodeColorScheme,
        store.core.currentGraph,
        store.graph.labelVisibility,
        store.graphInstance.orphanNodeVisibility,
        store.graphInstance.linkVisibility,
        store.graphInstance.labels.visibilityDistance,
        store.graphInstance.labels.isVisible,
        store.graphInstance.labels.labelFeatures.length,
        store.graphInstance.forceEngine,
        store.graphInstance.visibleComponents,
        store.graph.currentGraphData.selectedNodes,
        store.graphInstance.isSelfCentric,
        store.graphInstance.selfCentricType,
        store.graph.showLabelDistance,
        store.graphInstance.customEdgeCurvature,
        linkOpacity,
        store.graph
    ]);

    const handleControlsEvent = useCallback(() => {
        store.contextMenu.hideContextMenu();
    }, [store.contextMenu]);

    useEffect(() => {
        if (store.contextMenu.isVisible) {
            containerRef.current
                .controls()
                .addEventListener('start', handleControlsEvent, false);
        } else {
            containerRef.current
                .controls()
                .removeEventListener('start', handleControlsEvent, false);
        }
    }, [handleControlsEvent, store.contextMenu.isVisible]);

    useEffect(() => {
        store.graph.setLabelColors(bwColor);
    }, [bwColor, store.graph]);

    const generateNode = useCallback(
        node => {
            const nodeLevels = new THREE.LOD();

            if (
                store.graphInstance.labels.isVisible &&
                (store.graphInstance.labels.labelFeatures.length === 0 ||
                    store.graphInstance.labels.labelFeatures.includes(
                        node.feature
                    ))
            ) {
                nodeLevels.addLevel(node.nodeWithLabel, 0);
                nodeLevels.addLevel(
                    node.nodeWithoutLabel,
                    store.graphInstance.labels.visibilityDistance
                );
            } else {
                nodeLevels.addLevel(node.nodeWithoutLabelSolo, 0);
            }

            nodeLevels.nodeid = node.id;

            if (node.selected) {
                store.graphInstance.addOutlinePassObject(nodeLevels);
            }

            nodeLevels.raycast = function (raycaster, intersects) {
                node.nodeWithoutLabel.raycast(raycaster, intersects);
                node.nodeWithoutLabelSolo.raycast(raycaster, intersects);
            };

            return nodeLevels;
        },
        [store.graphInstance]
    );

    const handleLinkHover = link => {
        if (link && link.connections) {
            store.graphInstance.setHoverData(
                link.connections.map(connection => {
                    return {
                        label: connection.label,
                        feature: connection.feature,
                        count: connection.count
                    };
                })
            );
        } else {
            store.graphInstance.setHoverData([]);
        }
    };

    useEffect(() => {
        if (!store.graphInstance.automaticEdgeOpacity) {
            setLinkOpacity(store.graphInstance.customEdgeOpacity * 0.1);
        } else {
            if (store.core.colorMode === 'light') {
                setLinkOpacity(0.7);
            } else {
                if (store.graphInstance.selectedEdgeColorSchema === 'auto') {
                    if (
                        store.graphInstance.selectedColorSchema === 'component'
                    ) {
                        setLinkOpacity(0.3);
                    } else {
                        setLinkOpacity(0.1);
                    }
                } else {
                    setLinkOpacity(0.7);
                }
            }
        }
    }, [
        linkOpacity,
        store.core.colorMode,
        store.graphInstance.selectedColorSchema,
        store.graphInstance.selectedEdgeColorSchema,
        store.graphInstance.automaticEdgeOpacity,
        store.graphInstance.customEdgeOpacity
    ]);

    return (
        <ForceGraph3D
            ref={containerRef}
            backgroundColor={backgroundColor}
            graphData={props.graphData}
            numDimensions={2}
            width={windowSize.width ? windowSize.width : width}
            height={windowSize.height ? windowSize.height : height}
            // linkColor={link => link.color}
            enableNodeDrag={true}
            nodeThreeObject={generateNode}
            cooldownTicks={store.graphInstance.forceCooldownTicks}
            cooldownTime={store.graphInstance.forceCooldownTime}
            linkOpacity={linkOpacity}
            onEngineStop={() => {
                if (store.graphInstance.forceEngine) {
                    store.graphInstance.stopForce();
                }
            }}
            linkDirectionalArrowLength={
                store.core.isDetail &&
                store.graphInstance.edgeDirectionVisiblity
                    ? 10
                    : 0
            }
            linkDirectionalArrowResolution={2}
            linkDirectionalArrowRelPos={1}
            linkCurvature={() => store.graphInstance.customEdgeCurvature}
            onLinkHover={link => {
                if (store.core.isOverview) {
                    handleLinkHover(link);
                }
            }}
            d3AlphaDecay={0}
            // linkWidth={1}
            // linkResolution={2}
            linkHoverPrecision={8}
            rendererConfig={{
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance'
            }}
            onNodeRightClick={onNodeRightClick}
            onBackgroundRightClick={onBackgroundRightClick}
            onLinkRightClick={onLinkRightClick}
            onNodeDrag={store.contextMenu.hideContextMenu}
            showNavInfo={false}
            onNodeHover={onNodeHover}
            d3VelocityDecay={0.1}
            nodeVisibility={node => node.visible}
            // linkVisibility={link =>
            //     link.visible && store.graphInstance.linkVisibility
            // }
        />
    );
}

Graph.propTypes = {
    size: PropTypes.any,
    data: PropTypes.object,
    store: PropTypes.any,
    history: PropTypes.object,
    graphData: PropTypes.object
};

export default observer(Graph);
