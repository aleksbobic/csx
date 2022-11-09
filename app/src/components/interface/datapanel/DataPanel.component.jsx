import {
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    Flex,
    HStack,
    IconButton,
    Kbd,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Textarea,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import Overview from 'components/feature/overview/Overview.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    MiniMap
} from 'react-flow-renderer';
import { RootStoreContext } from 'stores/RootStore';

import ConnectorNode from 'components/feature/advancedsearch/connectornode/ConnectorNode.component';
import CountsNode from 'components/feature/advancedsearch/countsNode/Counts.component';
import DatasetNode from 'components/feature/advancedsearch/datasetNode/Dataset.component';
import FilterNode from 'components/feature/advancedsearch/filternode/FilterNode.component';
import KeywordExtractionNode from 'components/feature/advancedsearch/keywordextractionnode/KeywordExtractionNode.component';
import ResultsNode from 'components/feature/advancedsearch/resultsNode/ResultsNode.component';
import SearchEdge from 'components/feature/advancedsearch/searchedge/SearchEdge.component';
import SearchNode from 'components/feature/advancedsearch/searchnode/SearchNode.component';
import historyNode from 'components/feature/historyNode/HistoryNode.component';
import OverviewCustomEdge from 'components/feature/overviewschemaedge/OverviewSchemaEdge.component';
import OverviewSchemaNode from 'components/feature/overviewschemanode/OverviewSchemaNode.component';
import SchemaEdge from 'components/feature/schemaedge/SchemaEdge.component';
import SchemaNode from 'components/feature/schemanode/SchemaNode.component';
import SerpComponent from 'components/feature/serp/Serp.component';
import TableComponent from 'components/feature/table/Table.component';
import {
    MenuBoxed,
    MoreVerticalAlt,
    SoftwareDownload,
    ViewComfortable
} from 'css.gg';
import { useCallback, useMemo } from 'react';
import { CSVLink } from 'react-csv';
import AutoSizer from 'react-virtualized-auto-sizer';

function DataPanel(props) {
    const store = useContext(RootStoreContext);

    const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
    const tabHeaderBgColor = useColorModeValue('white', 'black');
    const edgeColor = useColorModeValue('gray.300', 'gray.900');
    const [useList, setUseList] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [visibleProperties, setVisibleProperties] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [schemaNodes, setSchemaNodes] = useState(
        store.core.isOverview ? store.schema.overviewNodes : store.schema.nodes
    );
    const [schemaEdges, setSchemaEdges] = useState(
        store.core.isOverview ? store.schema.overviewEdges : store.schema.edges
    );

    const [historyNodes, setHistoryNodes] = useState(store.history.nodes);
    const [historyEdges, setHistoryEdges] = useState(store.history.edges);

    useEffect(() => {
        setHistoryNodes(store.history.nodes);
        setHistoryEdges(store.history.edges);
    }, [store.history.edges, store.history.nodes]);

    const onNodesChange = useCallback(
        changes =>
            store.core.isOverview
                ? store.schema.updateOverviewNodes(
                      applyNodeChanges(changes, store.schema.overviewNodes)
                  )
                : store.schema.updateNodes(
                      applyNodeChanges(changes, store.schema.nodes)
                  ),
        [store.core.isOverview, store.schema]
    );
    const onEdgesChange = useCallback(
        changes =>
            store.core.isOverview
                ? store.schema.updateOverviewEdges(
                      applyEdgeChanges(changes, store.schema.overviewEdges)
                  )
                : store.schema.updateEdges(
                      applyEdgeChanges(changes, store.schema.edges)
                  ),
        [store.core.isOverview, store.schema]
    );

    useEffect(() => {
        switch (props.panelType) {
            case 'details':
                setActiveTab(0);
                break;
            case 'results':
                setActiveTab(1);
                break;
            case 'schema':
                setActiveTab(2);
                break;
            case 'history':
                setActiveTab(3);
                break;
            case 'comment':
                setActiveTab(4);
                break;
            default:
                setActiveTab(0);
                break;
        }
    }, [props.panelType]);

    const nodeTypes = useMemo(
        () => ({
            datasetNode: DatasetNode,
            schemaNode: SchemaNode,
            overviewSchemaNode: OverviewSchemaNode,
            historyNode: historyNode,
            searchNode: SearchNode,
            connectorNode: ConnectorNode,
            filterNode: FilterNode,
            keywordExtractionNode: KeywordExtractionNode,
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
        setSchemaNodes(
            store.core.isOverview
                ? store.schema.overviewNodes
                : store.schema.nodes
        );
        setSchemaEdges(
            store.core.isOverview
                ? store.schema.overviewEdges
                : store.schema.edges
        );
    }, [
        store.core.currentGraph,
        store.core.isOverview,
        store.schema.edges,
        store.schema.nodes,
        store.schema.overviewEdges,
        store.schema.overviewNodes
    ]);

    const connectNodes = connection => {
        store.schema.addSchemaConnection(connection);
    };

    const updateEdge = (oldEdge, newEdge) => {
        store.schema.updateSchemaConnection(oldEdge, newEdge);
    };

    const changeSchema = e => {
        store.search.changeSelectedSchema(e.target.value);
    };

    const getPredefinedSchemas = () =>
        store.search.schemas.map(entry => (
            <option value={entry.name} key={`schema_${entry.name}`}>
                {entry.name.toUpperCase()}
            </option>
        ));

    const getCsvHeaders = data => {
        if (!data || !data.length) {
            return [];
        }

        return Object.keys(data[0])
            .filter(key => !key.endsWith('_id') && key !== 'entry')
            .map(key => {
                return { label: key, key: key };
            });
    };

    const getCsvData = data => {
        if (!data || !data.length) {
            return [];
        }

        return data.map(row =>
            Object.keys(row)
                .filter(key => !key.endsWith('_id') && key !== 'entry')
                .reduce((newRow, key) => {
                    newRow[key] = row[key];
                    return newRow;
                }, {})
        );
    };

    useEffect(() => {
        if (store.graph.currentGraphData.activeTableData) {
            setCsvData(
                getCsvData(store.graph.currentGraphData.activeTableData)
            );
            setCsvHeaders(
                getCsvHeaders(store.graph.currentGraphData.activeTableData)
            );
        }
    }, [store.graph.currentGraphData.activeTableData]);

    const renderSchema = () => (
        <Box height="100%" minHeight="500px" width="100%">
            {store.core.isDetail && (
                <Select
                    variant="filled"
                    marginBottom="20px"
                    onChange={changeSchema}
                >
                    {getPredefinedSchemas()}
                </Select>
            )}
            <AutoSizer>
                {({ height, width }) => (
                    <ReactFlow
                        style={{
                            height: `${height}px`,
                            width: `${width}px`
                        }}
                        nodes={schemaNodes}
                        edges={schemaEdges}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        snapToGrid={true}
                        onConnect={connectNodes}
                        onEdgeUpdate={updateEdge}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                    >
                        <Background
                            gap={12}
                            size={1}
                            style={{ opacity: 0.5 }}
                        />
                    </ReactFlow>
                )}
            </AutoSizer>
        </Box>
    );

    const renderComments = () => {
        return (
            <VStack width="100%" spacing="40px" overflowY="scroll">
                <VStack heigh="auto" width="100%">
                    {store.core.studyHistory.length > 0 &&
                        store.core.studyHistory[
                            store.core.studyHistoryItemIndex
                        ].comments.map((comment, index) => {
                            return (
                                <Box
                                    backgroundColor="whiteAlpha.200"
                                    borderRadius="8px"
                                    padding="20px"
                                    width="100%"
                                    ket={`history_comment_${index}`}
                                >
                                    <Text fontSize="sm">{comment}</Text>
                                </Box>
                            );
                        })}

                    <Box
                        backgroundColor="transparent"
                        borderRadius="8px"
                        width="100%"
                        position="relative"
                        padding="2px"
                    >
                        <Textarea
                            width="100%"
                            height="100%"
                            borderRadius="8px"
                            padding="10px"
                            border="none"
                            resize="none"
                            placeholder="Enter your observations here ..."
                            fontSize="sm"
                            backgroundColor="whiteAlpha.200"
                        />
                        <Button
                            size="xs"
                            position="absolute"
                            right="8px"
                            bottom="8px"
                            zIndex="2"
                            borderRadius="4px"
                        >
                            Comment
                        </Button>
                    </Box>
                </VStack>
                <HStack
                    border="1px dashed #ffffff33"
                    padding="20px"
                    borderRadius="10px"
                >
                    <Text fontSize="sm">
                        Tip: press{' '}
                        <Kbd style={{ marginLeft: '10px' }}>shift</Kbd> +{' '}
                        <Kbd style={{ marginRight: '10px' }}>C</Kbd> anywhere in
                        the app to add a comment.
                    </Text>
                </HStack>
            </VStack>
        );
    };

    const renderHistory = () => (
        <Box
            height="100%"
            minHeight="500px"
            width="100%"
            backgroundColor="whiteAlpha.200"
            borderRadius="8px"
        >
            <AutoSizer>
                {({ height, width }) => (
                    <ReactFlow
                        style={{
                            height: `${height}px`,
                            width: `${width}px`
                        }}
                        nodes={historyNodes}
                        edges={historyEdges}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        snapToGrid={true}
                        onConnect={connectNodes}
                        onEdgeUpdate={updateEdge}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        minZoom={1}
                        defaultZoom={1.25}
                        maxZoom={1.5}
                    >
                        <MiniMap
                            nodeColor={node =>
                                node.data.isActive ? '#3182ceeb' : '#323232'
                            }
                            nodeStrokeColor={node =>
                                node.data.isActive ? '#3182ceeb' : '#323232'
                            }
                            nodeBorderRadius="15px"
                            maskColor="#1a1a1a"
                            style={{
                                backgroundColor: '#000000',
                                border: '1px solid #ffffff22',
                                borderRadius: '8px'
                            }}
                            nodeStrokeWidth={3}
                        />
                    </ReactFlow>
                )}
            </AutoSizer>
        </Box>
    );

    const renderTablePanels = () => {
        return (
            <TabPanels
                width="100%"
                padding="10px"
                overflow="scroll"
                height="100%"
                paddingBottom="50px"
                paddingTop="0"
            >
                <TabPanel padding="10px" paddingTop="20px" height="100%">
                    <Overview />
                </TabPanel>
                <TabPanel
                    paddingLeft="0"
                    paddingRight="0"
                    paddingTop="50px"
                    height="100%"
                >
                    {store.graph.currentGraphData.activeTableData &&
                        (useList ? (
                            <SerpComponent
                                data={
                                    store.graph.currentGraphData.activeTableData
                                }
                                columns={store.graph.tableColumns}
                                visibleProperties={visibleProperties}
                            />
                        ) : (
                            <TableComponent
                                data={
                                    store.graph.currentGraphData.activeTableData
                                }
                                columns={store.graph.tableColumns}
                            />
                        ))}
                </TabPanel>
                <TabPanel
                    padding="10px"
                    paddingTop="20px"
                    paddingBottom="20px"
                    height="100%"
                >
                    <VStack width="100%" height="100%">
                        <Flex
                            spacing="10px"
                            width="100%"
                            height="100%"
                            style={{ paddingBottom: '5px' }}
                        >
                            {renderSchema()}
                        </Flex>
                    </VStack>
                </TabPanel>
                <TabPanel
                    padding="10px"
                    paddingTop="20px"
                    paddingBottom="20px"
                    height="100%"
                >
                    <VStack width="100%" height="100%">
                        <Flex
                            spacing="10px"
                            width="100%"
                            height="100%"
                            style={{ paddingBottom: '5px' }}
                        >
                            {renderHistory()}
                        </Flex>
                    </VStack>
                </TabPanel>
                <TabPanel
                    padding="10px"
                    paddingTop="20px"
                    paddingBottom="20px"
                    height="100%"
                >
                    <VStack width="100%" height="100%">
                        <Flex
                            spacing="10px"
                            width="100%"
                            height="100%"
                            style={{ paddingBottom: '5px' }}
                        >
                            {renderComments()}
                        </Flex>
                    </VStack>
                </TabPanel>
            </TabPanels>
        );
    };

    const renderTabButtons = () => {
        return (
            <TabList
                position="absolute"
                top="0"
                width="100%"
                height="60px"
                zIndex="2"
                backgroundColor={tabHeaderBgColor}
                padding="15px 10px"
                justifyContent="space-between"
            >
                <HStack>
                    <Tooltip label="Download visible data as CSV">
                        <Box>
                            <IconButton
                                size="sm"
                                as={CSVLink}
                                data={csvData}
                                headers={csvHeaders}
                                filename="csx.csv"
                                target="_blank"
                                variant="solid"
                                opacity="0.5"
                                transition="all 0.2 ease-in-out"
                                _hover={{ opacity: 1 }}
                                icon={
                                    <SoftwareDownload
                                        style={{
                                            '--ggs': '0.8'
                                        }}
                                    />
                                }
                            />
                        </Box>
                    </Tooltip>
                    <Menu closeOnSelect={false} zIndex="3">
                        <Tooltip label="List options">
                            <MenuButton
                                disabled={!useList}
                                size="sm"
                                as={IconButton}
                                icon={
                                    <MoreVerticalAlt style={{ '--ggs': 0.8 }} />
                                }
                                zIndex="3"
                            />
                        </Tooltip>
                        <MenuList
                            backgroundColor="black"
                            padding="5px"
                            borderRadius="10px"
                        >
                            {Object.keys(store.search.nodeTypes).map(
                                feature => (
                                    <MenuItem
                                        key={`serp_list_checkbox_${feature}`}
                                        fontSize="xs"
                                        fontWeight="bold"
                                        borderRadius="6px"
                                    >
                                        <Checkbox
                                            isChecked={visibleProperties.includes(
                                                feature
                                            )}
                                            size="sm"
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setVisibleProperties([
                                                        ...visibleProperties,
                                                        feature
                                                    ]);
                                                } else if (
                                                    visibleProperties.length > 1
                                                ) {
                                                    setVisibleProperties([
                                                        ...visibleProperties.filter(
                                                            value =>
                                                                value !==
                                                                feature
                                                        )
                                                    ]);
                                                }
                                            }}
                                        >
                                            {feature}
                                        </Checkbox>
                                    </MenuItem>
                                )
                            )}
                        </MenuList>
                    </Menu>
                    <ButtonGroup spacing="0" paddingRight="10px">
                        <Tooltip label="Use table view">
                            <IconButton
                                opacity={!useList ? 1 : 0.5}
                                icon={
                                    <ViewComfortable
                                        style={{ '--ggs': '0.7' }}
                                    />
                                }
                                size="sm"
                                borderEndRadius="0"
                                transition="all 0.2 ease-in-out"
                                _hover={{ opacity: 1 }}
                                onClick={() => {
                                    setUseList(false);
                                }}
                            />
                        </Tooltip>
                        <Tooltip label="Use list view">
                            <IconButton
                                opacity={useList ? 1 : 0.5}
                                icon={<MenuBoxed style={{ '--ggs': '0.7' }} />}
                                size="sm"
                                borderStartRadius="0"
                                transition="all 0.2 ease-in-out"
                                _hover={{ opacity: 1 }}
                                onClick={() => {
                                    if (visibleProperties.length === 0) {
                                        setVisibleProperties(
                                            Object.keys(
                                                store.search.nodeTypes
                                            ).slice(0, 3)
                                        );
                                    }

                                    setUseList(true);
                                }}
                            />
                        </Tooltip>
                    </ButtonGroup>
                </HStack>
            </TabList>
        );
    };

    return (
        <Box
            height="100%"
            width="100%"
            bgColor={bgColor}
            borderLeft="1px solid"
            borderColor={edgeColor}
            id="datapanel"
        >
            <Box
                height="100%"
                width="100%"
                bgColor={bgColor}
                borderLeft="1px solid"
                borderColor={edgeColor}
            >
                <Tabs
                    size="sm"
                    variant="soft-rounded"
                    colorScheme="blue"
                    height="100%"
                    index={activeTab}
                >
                    {activeTab === 1 && renderTabButtons()}
                    {renderTablePanels()}
                </Tabs>
            </Box>
        </Box>
    );
}

DataPanel.propTypes = {
    panelType: PropTypes.string
};

export default observer(DataPanel);
