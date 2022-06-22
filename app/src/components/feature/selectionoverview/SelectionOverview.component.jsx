import {
    Box,
    Flex,
    Heading,
    HStack,
    IconButton,
    Stat,
    Tag,
    TagLabel,
    Text,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import { MathPlus, Remove } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

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

    return (
        <VStack spacing="10px" marginTop="50px">
            <HStack height="200px" width="100%" marginTop="20px">
                <Flex width="48%" height="200px" flexDirection="column">
                    <Heading
                        size="sm"
                        textAlign="left"
                        width="100%"
                        marginBottom="10px"
                    >
                        Selected nodes
                    </Heading>
                    {renderSelectedNodes()}
                </Flex>
                <Flex width="48%" height="200px" flexDirection="column">
                    <Heading
                        size="sm"
                        textAlign="left"
                        width="100%"
                        marginBottom="10px"
                    >
                        Selected components
                    </Heading>
                    {renderSelectedComponents()}
                </Flex>
            </HStack>
            {/* {store.core.isOverview &&
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
                )} */}
            <HStack
                maxHeight="200px"
                width="100%"
                style={{ marginTop: '50px' }}
            >
                <VStack width="48%" height="200px">
                    <Box width="100%" height="100%" padding="20px">
                        <Tooltip label="Add new statistic">
                            <IconButton
                                width="100%"
                                height="100%"
                                borderRadius="xl"
                                onClick={() =>
                                    store.stats.toggleStatsModalVisiblity(true)
                                }
                                icon={
                                    <MathPlus
                                        style={{
                                            opacity: 0.5,
                                            '--ggs': '2'
                                        }}
                                    />
                                }
                            />
                        </Tooltip>
                    </Box>
                </VStack>
            </HStack>
        </VStack>
    );
}

SelectionOverview.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number
};

export default observer(SelectionOverview);
