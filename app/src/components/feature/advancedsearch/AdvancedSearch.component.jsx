import {
    Box,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import OverviewCustomEdge from 'components/feature/overviewschemaedge/OverviewSchemaEdge.component';
import SchemaEdge from 'components/feature/schemaedge/SchemaEdge.component';
import { Check, ChevronRight, Close } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background
} from 'react-flow-renderer';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import historyNode from '../historyNode/HistoryNode.component';
import OverviewSchemaNode from '../overviewschemanode/OverviewSchemaNode.component';
import SchemaNode from '../schemanode/SchemaNode.component';
import ConnectorNode from './connectornode/ConnectorNode.component';
import CountsNode from './countsNode/Counts.component';
import DatasetNode from './datasetNode/Dataset.component';
import FilterNode from './filternode/FilterNode.component';
import KeywordExtractionNode from './keywordextractionnode/KeywordExtractionNode.component';
import ResultsNode from './resultsNode/ResultsNode.component';
import SearchEdge from './searchedge/SearchEdge.component';
import SearchNode from './searchnode/SearchNode.component';

function AdvancedSearch(props) {
    const reactFlowWrapper = useRef(null);
    const store = useContext(RootStoreContext);
    const history = useHistory();
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (colorMode) {
            store.workflow.updateNodeStyles();
        }
    }, [colorMode, store.workflow]);

    const onNodesChange = useCallback(
        changes =>
            store.workflow.updateNodes(
                applyNodeChanges(changes, store.workflow.nodes)
            ),
        [store.workflow]
    );
    const onEdgesChange = useCallback(
        changes =>
            store.workflow.updateEdges(
                applyEdgeChanges(changes, store.workflow.edges)
            ),
        [store.workflow]
    );

    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const nodeTypes = useMemo(
        () => ({
            datasetNode: DatasetNode,
            searchNode: SearchNode,
            filterNode: FilterNode,
            keywordExtractionNode: KeywordExtractionNode,
            connectorNode: ConnectorNode,
            schemaNode: SchemaNode,
            historyNode: historyNode,
            overviewSchemaNode: OverviewSchemaNode,
            countsNode: CountsNode,
            resultsNode: ResultsNode
        }),
        []
    );

    const edgeTypes = useMemo(
        () => ({
            schemaEdge: SchemaEdge,
            overviewCustomEdge: OverviewCustomEdge,
            searchEdge: SearchEdge
        }),
        []
    );

    useEffect(() => {
        if (store.workflow.shouldRunWorkflow) {
            history.push(`/graph?study=${store.core.studyUuid}`);
        }
    }, [
        history,
        store.core.studyUuid,
        store.search,
        store.search.advancedSearchQuery,
        store.search.currentDataset,
        store.workflow.shouldRunWorkflow
    ]);

    const onLoad = flowInstance => setReactFlowInstance(flowInstance);

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDrop = event => {
        event.preventDefault();

        const reactFlowBounds =
            reactFlowWrapper.current.getBoundingClientRect();
        const nodeType = event.dataTransfer.getData('application/reactflow');

        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top
        });

        store.track.trackEvent(
            'Advanced search',
            'Add new node',
            `${nodeType}`
        );

        store.workflow.addNewAction(nodeType, position);
    };

    const onDragOver = event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const getFilteredActionNodeList = () => {
        return store.workflow.actionNodeTypes.filter(node => {
            switch (node.nodeType) {
                case 'filterNode':
                    return (
                        store.workflow.getNodeTypesOfType(['integer', 'float'])
                            .length > 0
                    );
                case 'countsNode':
                    return (
                        store.workflow.getNodeTypesOfType(['list']).length > 0
                    );
                case 'keywordExtractionNode':
                    return (
                        store.workflow.getNodeTypesOfType(['string']).length > 0
                    );
                default:
                    return true;
            }
        });
    };

    const renderNodeList = () => {
        return getFilteredActionNodeList().map((node, index) => (
            <Flex
                key={`workflow_node_${index}`}
                border="2px solid"
                borderColor="whiteAlpha.400"
                width="100%"
                height="40px"
                backgroundColor={
                    colorMode === 'light' ? 'whiteAlpha.900' : 'blackAlpha.900'
                }
                borderRadius="8px"
                onDragStart={event => onDragStart(event, node.nodeType)}
                draggable
                cursor="pointer"
                padding="5px 10px"
                justifyContent="center"
                alignItems="center"
                transition="all 0.1s ease-in-out"
                _hover={{
                    backgroundColor:
                        colorMode === 'light' ? 'blue.400' : 'blue.700',
                    color: colorMode === 'light' ? 'black' : 'white'
                }}
                role="group"
            >
                <Tooltip label={node.tooltip}>
                    <Text
                        fontSize="sm"
                        fontWeight="bold"
                        _groupHover={{ color: 'white' }}
                    >
                        {node.label}
                    </Text>
                </Tooltip>
            </Flex>
        ));
    };

    const renderSavedWorkflows = () => {
        const savedWorkflows = Object.keys(
            store.workflow.workflows[store.search.currentDataset]
        );

        return savedWorkflows.map(workflow => (
            <Flex
                key={`workflow_${workflow}`}
                width="100%"
                justifyContent="space-between"
                alignItems="center"
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.200' : 'whiteAlpha.100'
                }
                borderRadius="6px"
                paddingLeft="10px"
            >
                <Tooltip label={workflow}>
                    <Text
                        fontSize="sm"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {workflow}
                    </Text>
                </Tooltip>
                <HStack marginLeft="6px" spacing="0">
                    <Tooltip label="Remove workflow">
                        <IconButton
                            icon={<Close style={{ '--ggs': '0.7' }} />}
                            size="sm"
                            variant="ghost"
                            opacity="0.5"
                            _hover={{ opacity: 1 }}
                            onClick={() => {
                                store.track.trackEvent(
                                    'Advanced search',
                                    'Button click',
                                    `Remove workflow ${workflow}`
                                );

                                store.workflow.removeWorkflow(workflow);
                            }}
                        />
                    </Tooltip>
                    <Tooltip label="Load workflow">
                        <IconButton
                            icon={<ChevronRight style={{ '--ggs': '0.7' }} />}
                            size="sm"
                            variant="ghost"
                            opacity="0.5"
                            _hover={{ opacity: 1 }}
                            onClick={() => {
                                store.track.trackEvent(
                                    'Advanced search',
                                    'Button click',
                                    `Load workflow ${workflow}`
                                );

                                store.workflow.loadWorkflow(workflow);
                            }}
                        />
                    </Tooltip>
                </HStack>
            </Flex>
        ));
    };

    return (
        <HStack
            style={props.style}
            width="100%"
            height="100%"
            borderRadius="10px"
            overflow="hidden"
        >
            <Box width="100%" height="100%" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={store.workflow.nodes}
                    edges={store.workflow.edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={store.workflow.onConnect}
                    onDragOver={onDragOver}
                    onInit={onLoad}
                    onDrop={onDrop}
                    nodesDraggable={true}
                    nodesConnectable={true}
                    snapToGrid={true}
                >
                    <Background gap={12} size={1} style={{ opacity: 0.5 }} />
                </ReactFlow>
            </Box>
            <Box
                position="absolute"
                right="15px"
                width="220px"
                backgroundColor="transparent"
                marginLeft="0px"
                display="flex"
                flexDirection="column"
                flexGrow="1"
                paddingTop="35px"
                paddingBottom="25px"
                zIndex="10"
                top="30px"
            >
                <VStack
                    alignItems="start"
                    padding="20px"
                    backgroundColor={
                        colorMode === 'light'
                            ? 'rgba(255,255,255,0.85)'
                            : 'rgba(0,0,0,0.85)'
                    }
                    borderTopLeftRadius="10px"
                    borderTopRightRadius="10px"
                    borderBottomColor={
                        colorMode === 'light' ? 'gray.300' : '#2d2d2d'
                    }
                    borderBottomWidth="1px"
                >
                    <Heading size="sm">Search Nodes</Heading>
                    <Text fontSize="xs" fontWeight="bold" opacity="0.75">
                        Drag and drop nodes to create a custom search workflow
                    </Text>
                </VStack>
                <VStack
                    height="auto"
                    padding="10px 10px"
                    backgroundColor={
                        colorMode === 'light'
                            ? 'whiteAlpha.500'
                            : 'blackAlpha.500'
                    }
                    flexGrow="1"
                >
                    {renderNodeList()}
                </VStack>
                <VStack
                    borderTopColor={
                        colorMode === 'light' ? 'gray.300' : '#2d2d2d'
                    }
                    borderTopWidth="1px"
                    backgroundColor={colorMode === 'light' ? 'white' : 'black'}
                    padding="10px 10px"
                    borderBottomLeftRadius="10px"
                    borderBottomRightRadius="10px"
                >
                    <Heading
                        size="sm"
                        textAlign="left"
                        width="100%"
                        marginBottom="6px"
                        marginTop="6px"
                    >
                        Saved workflows
                    </Heading>
                    <VStack maxHeight="130px" width="100%" overflowY="scroll">
                        {store.workflow.workflows &&
                            store.workflow.workflows[
                                store.search.currentDataset
                            ] &&
                            renderSavedWorkflows()}
                    </VStack>
                    <InputGroup size="sm" marginTop="20px">
                        <Input
                            placeholder="Workflow name ..."
                            size="sm"
                            variant="filled"
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.300'
                            }
                            borderRadius="6px"
                            value={store.workflow.newWorkflowName}
                            onChange={e =>
                                store.workflow.setNewWorkflowName(
                                    e.target.value
                                )
                            }
                        />
                        <InputRightElement>
                            <Tooltip label="Save current workflow">
                                <IconButton
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blue.400'
                                            : 'whiteAlpha.300'
                                    }
                                    _hover={{
                                        backgroundColor:
                                            colorMode === 'light'
                                                ? 'blue.500'
                                                : 'whiteAlpha.500'
                                    }}
                                    role="group"
                                    disabled={!store.workflow.newWorkflowName}
                                    icon={<Check />}
                                    size="sm"
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Advanced search',
                                            'Button click',
                                            `Save workflow ${store.workflow.newWorkflowName}`
                                        );

                                        store.workflow.saveNewWorkflow();
                                    }}
                                />
                            </Tooltip>
                        </InputRightElement>
                    </InputGroup>
                </VStack>
            </Box>
        </HStack>
    );
}

AdvancedSearch.propTypes = {
    datasetSelectorDisabled: PropTypes.bool,
    placeholder: PropTypes.string
};

AdvancedSearch.defaultProps = {
    datasetSelectorDisabled: false,
    placeholder: 'Search through the dataset ...'
};

export default observer(AdvancedSearch);
