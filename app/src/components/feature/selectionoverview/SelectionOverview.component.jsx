import {
    Box,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    Text,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { interpolateRainbow, schemeTableau10 } from 'd3-scale-chromatic';

function SelectionOverview(props) {
    const store = useContext(RootStoreContext);

    const bgColor = useColorModeValue('gray.50', 'gray.800');

    const renderSelectedNodes = () => {
        const selectedNodeList = store.graph.currentGraphData.selectedNodes;

        return selectedNodeList.length ? (
            <VStack overflowY="scroll" maxHeight="200px" width="100%">
                {selectedNodeList.map(node => {
                    return (
                        <Stat
                            key={node.id}
                            borderRadius="10px"
                            backgroundColor={bgColor}
                            padding="10px"
                            width="100%"
                        >
                            <Heading
                                size="xs"
                                marginBottom={
                                    store.core.isOverview ? '0px' : '8px'
                                }
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxWidth="300px"
                                paddingRight="30px"
                                _hover={{ cursor: 'pointer' }}
                                onClick={() => {
                                    store.graphInstance.zoomToFitByNodeId(
                                        node.id
                                    );
                                }}
                            >
                                {node.label}
                            </Heading>
                            {store.core.isDetail && (
                                <HStack>
                                    <Tag
                                        size="md"
                                        borderRadius="full"
                                        variant="solid"
                                        colorScheme="blue"
                                    >
                                        <TagLabel>{node.feature}</TagLabel>
                                    </Tag>
                                </HStack>
                            )}
                            <Box position="absolute" top="4px" right="8px">
                                <IconButton
                                    size="xs"
                                    border="none"
                                    variant="ghost"
                                    aria-label="Remove from list"
                                    icon={<Remove style={{ '--ggs': '0.8' }} />}
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'data panel selection tab',
                                            'button click',
                                            `deselect node {id: ${node.id}, label: ${node.label}}`
                                        );

                                        const nodeIndex =
                                            store.graph.currentGraphData.selectedNodes.findIndex(
                                                n => n.id === node.id
                                            );

                                        store.graph.toggleNodeSelection(
                                            node.id,
                                            nodeIndex
                                        );
                                    }}
                                />
                            </Box>
                        </Stat>
                    );
                })}
            </VStack>
        ) : (
            <Text
                fontSize="xs"
                marginTop="50px"
                width="100%"
                textAlign="left"
                color="gray.400"
                fontWeight="bold"
            >
                Select a node to see it&#39;s details here.
            </Text>
        );
    };

    const renderSelectedComponents = () => {
        const selectedComponentIds =
            store.graph.currentGraphData.selectedComponents;
        const components = store.graph.currentGraphData.components;

        const selectedComponents = components.filter(c =>
            selectedComponentIds.includes(c.id)
        );

        return selectedComponents.length ? (
            <VStack overflowY="scroll" maxHeight="200px" width="100%">
                {selectedComponents.map(component => {
                    return (
                        <Stat
                            key={`selected_component_${component.id}`}
                            borderRadius="10px"
                            backgroundColor={bgColor}
                            padding="10px"
                            width="100%"
                        >
                            <Heading
                                size="xs"
                                marginBottom={
                                    store.core.isOverview ? '0px' : '8px'
                                }
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                maxWidth="300px"
                                paddingRight="30px"
                            >
                                Component {component.id}
                            </Heading>
                            <Box position="absolute" top="4px" right="8px">
                                <IconButton
                                    size="xs"
                                    border="none"
                                    variant="ghost"
                                    aria-label="Remove from list"
                                    icon={<Remove style={{ '--ggs': '0.8' }} />}
                                    onClick={() => {
                                        store.graph.selectComponent(
                                            component.id
                                        );
                                    }}
                                />
                            </Box>
                        </Stat>
                    );
                })}
            </VStack>
        ) : (
            <Text
                fontSize="xs"
                marginTop="50px"
                width="100%"
                textAlign="left"
                color="gray.400"
                fontWeight="bold"
            >
                Select a component to see it&#39;s details here.
            </Text>
        );
    };

    const renderEdgeFeatureStats = () => {
        const selectedComponentIds =
            store.graph.currentGraphData.selectedComponents;
        const componentEdges = store.graph.currentGraphData.links
            .filter(l => selectedComponentIds.includes(l.component))
            .map(l => l.connections)
            .flat();

        const edgeCounts = componentEdges
            .map(edge => edge.feature)
            .reduce(
                (counter, feature) => {
                    counter.find(
                        entry => entry['feature'] === feature
                    ).count += 1;

                    return counter;
                },
                [...new Set(componentEdges.map(edge => edge.feature))].map(
                    feature => {
                        return { feature: feature, count: 0 };
                    }
                )
            );

        const labels = edgeCounts.map(entry => entry.feature);
        const data = edgeCounts.map(entry => entry.count);
        const colors = getGraphColors(labels);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'feature connections',
                    data: data,
                    backgroundColor: colors,
                    borderColor: ['rgba(0,0,0,0)']
                }
            ]
        };

        ChartJS.register(ArcElement, Tooltip);
        return labels.length ? (
            <Box height="100%" width="100%" padding="50px" marginTop="0px">
                <Pie data={chartData} />
            </Box>
        ) : (
            <Text
                fontSize="xs"
                marginTop="50px"
                width="100%"
                textAlign="left"
                color="gray.400"
                fontWeight="bold"
            >
                Select a component to see it&#39;s details here.
            </Text>
        );
    };

    const getGraphColors = labels => {
        const skipfactor = labels.length > 10 ? 1 / labels.length : null;

        const graphColors = [];

        for (let i = 0; i < labels.length; i++) {
            graphColors.push(
                skipfactor
                    ? interpolateRainbow(i * skipfactor)
                    : schemeTableau10[i]
            );
        }

        return graphColors;
    };

    const renderEdgeValueStats = () => {
        const selectedComponentIds =
            store.graph.currentGraphData.selectedComponents;
        const componentEdges = store.graph.currentGraphData.links
            .filter(l => selectedComponentIds.includes(l.component))
            .map(l => l.connections)
            .flat();

        const edgeCounts = componentEdges
            .map(edge => edge.label)
            .reduce(
                (counter, label) => {
                    counter.find(entry => entry['label'] === label).count += 1;

                    return counter;
                },
                [...new Set(componentEdges.map(edge => edge.label))].map(
                    label => {
                        return { label: label, count: 0 };
                    }
                )
            );

        const labels = edgeCounts.map(entry => entry.label);
        const data = edgeCounts.map(entry => entry.count);
        const colors = getGraphColors(labels);

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'feature connections',
                    data: data,
                    backgroundColor: colors,
                    borderColor: ['rgba(0,0,0,0)']
                }
            ]
        };

        ChartJS.register(ArcElement, Tooltip);
        return labels.length ? (
            <Box height="100%" width="100%" padding="50px" marginTop="0px">
                <Pie data={chartData} />
            </Box>
        ) : (
            <Text
                fontSize="xs"
                marginTop="50px"
                width="100%"
                textAlign="left"
                color="gray.400"
                fontWeight="bold"
            >
                Select a component to see it&#39;s details here.
            </Text>
        );
    };

    return (
        <VStack spacing="10px" marginTop="50px">
            <HStack maxHeight="200px" width="100%" marginTop="20px">
                <VStack width="48%" height="200px">
                    <Heading size="sm" textAlign="left" width="100%">
                        Selected nodes
                    </Heading>
                    {renderSelectedNodes()}
                </VStack>
                <VStack width="48%" height="200px">
                    <Heading size="sm" textAlign="left" width="100%">
                        Selected components
                    </Heading>
                    {renderSelectedComponents()}
                </VStack>
            </HStack>
            {store.core.isOverview &&
                store.graph.currentGraphData.selectedComponents.length && (
                    <HStack
                        maxHeight="200px"
                        width="100%"
                        style={{ marginTop: '50px' }}
                    >
                        <VStack width="48%" height="200px">
                            <Heading size="sm" textAlign="left" width="100%">
                                Edge Features
                            </Heading>
                            {renderEdgeFeatureStats()}
                        </VStack>
                        <VStack width="48%" height="200px">
                            <Heading size="sm" textAlign="left" width="100%">
                                Edge Values
                            </Heading>
                            {renderEdgeValueStats()}
                        </VStack>
                    </HStack>
                )}
        </VStack>
    );
}

SelectionOverview.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
};

export default observer(SelectionOverview);
