import { useColorModeValue } from '@chakra-ui/react';
import { observer, useLocalObservable } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { withRouter } from 'react-router-dom';
import { withSize } from 'react-sizeme';
import { RootStoreContext } from 'stores/RootStore';
import * as THREE from 'three';
import './Graph.scss';

function Graph(props) {
    const store = useContext(RootStoreContext);
    const containerRef = useRef();
    const bwColor = useColorModeValue('#303030', 'white');
    const backgroundColor = useColorModeValue('#efefef', '#1A202C');

    const [graphContainerElement, setGraphContainerElement] = useState(null);

    useLocalObservable(() => ({}));

    const onNodeClick = (node, event) => {
        store.track.trackEvent(
            'graph',
            'node click',
            `node: {label: ${node.label}, id: ${node.id}}`
        );
        store.contextMenu.showContextMenu(node, event.clientX, event.clientY);
    };

    const handleNodeHover = (node, nodeout) => {
        graphContainerElement.style.cursor = node ? 'pointer' : 'default';

        if (node && !node.selected) {
            store.graphInstance.addOutlinePassObject(node?.__threeObj);
        }

        if (nodeout && !nodeout.selected) {
            store.graphInstance.removeOutlinePassObject(nodeout?.__threeObj);
        }
    };

    useEffect(() => {
        setGraphContainerElement(
            document.getElementsByClassName('scene-container')[0]
        );
    }, []);

    useEffect(() => {
        const unlisten = props.history.listen(() => {
            store.graph.clearGraphId();
        });

        return () => {
            unlisten();
        };
    }, [props.history, store.graph]);

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
        store.graphInstance.forceEngine,
        store.graphInstance.visibleComponent,
        store.graph.currentGraphData.selectedNodes,
        store.graphInstance.isSelfCentric,
        store.graphInstance.selfCentricType,
        store.graph.showLabelDistance,
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
            nodeLevels.addLevel(node.nodeWithLabel, 0);
            nodeLevels.addLevel(
                node.nodeWithoutLabel,
                store.graphInstance.labels.visibilityDistance
            );

            nodeLevels.nodeid = node.id;

            if (node.selected) {
                store.graphInstance.addOutlinePassObject(nodeLevels);
            }

            return nodeLevels;
        },
        [store.graphInstance]
    );

    const handleLinkHover = link => {
        if (link) {
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
        console.log('from the graph component', store.core.showSpinner);
    }, [store.core.showSpinner]);

    return (
        <ForceGraph3D
            ref={containerRef}
            backgroundColor={backgroundColor}
            graphData={props.graphData}
            numDimensions={2}
            width={props.size.width}
            height={props.size.height}
            linkColor={link => link.color}
            enableNodeDrag={true}
            nodeThreeObject={generateNode}
            cooldownTicks={store.graphInstance.forceCooldownTicks}
            cooldownTime={store.graphInstance.forceCooldownTime}
            linkOpacity={0.3}
            onEngineStop={() => {
                if (store.graphInstance.forceEngine) {
                    store.graphInstance.stopForce();
                }
            }}
            // linkDirectionalArrowLength={store.core.isDetail ? 10 : 0}
            // linkDirectionalArrowResolution={2}
            // linkDirectionalArrowRelPos={1}
            // linkCurvature={0.1}
            onLinkHover={store.core.isOverview ? handleLinkHover : () => {}}
            linkWidth={0}
            linkResolution={2}
            linkHoverPrecision={8}
            rendererConfig={{
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance'
            }}
            onNodeClick={onNodeClick}
            onBackgroundClick={store.contextMenu.hideContextMenu}
            onNodeDrag={store.contextMenu.hideContextMenu}
            showNavInfo={false}
            onNodeHover={handleNodeHover}
            d3VelocityDecay={0.1}
            nodeVisibility={node => node.visible}
            linkVisibility={link =>
                link.visible && store.graphInstance.linkVisibility
            }
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

export default withSize({
    monitorWidth: true,
    monitorHeight: true,
    noPlaceholder: true
})(withRouter(observer(Graph)));
