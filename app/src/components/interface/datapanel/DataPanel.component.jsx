import {
    Box,
    ButtonGroup,
    Checkbox,
    Flex,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Select,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tooltip,
    useColorModeValue,
    VStack
} from '@chakra-ui/react';
import GraphDetailsComponent from 'components/feature/graphDetails/graphDetails.component';
import Overview from 'components/feature/overview/Overview.component';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import ReactFlow, {
    applyEdgeChanges,
    applyNodeChanges,
    Background
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
import { CSVLink } from 'react-csv';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useMemo } from 'react';
import { useCallback } from 'react';

function DataPanel() {
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

    const nodeTypes = useMemo(
        () => ({
            datasetNode: DatasetNode,
            schemaNode: SchemaNode,
            overviewSchemaNode: OverviewSchemaNode,
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
                <TabPanel padding="10px" paddingTop="60px" height="100%">
                    <GraphDetailsComponent />
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
                <TabPanel padding="10px" paddingTop="60px" height="100%">
                    <VStack width="100%" height="100%">
                        <Flex spacing="10px" width="100%" height="100%">
                            {renderSchema()}
                        </Flex>
                    </VStack>
                </TabPanel>
            </TabPanels>
        );
    };

    const renderTabButtons = () => {
        const tabs = [
            {
                trackingCode: 'details tab',
                id: 'detailstab',
                text: 'Details'
            },
            {
                trackingCode: 'results tab',
                id: 'resultstab',
                text: 'Results'
            },
            {
                trackingCode: 'schema tab',
                id: 'schematab',
                text: 'Schema'
            }
        ];

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
                    {tabs.map(tab => (
                        <Tab
                            key={tab.id}
                            onClick={() => {
                                store.track.trackEvent(
                                    'data panel',
                                    'tab click',
                                    tab.trackingCode
                                );
                            }}
                            _selected={{
                                color: 'white',
                                backgroundColor: 'blue.500'
                            }}
                        >
                            <Box
                                id={tab.id}
                                width="100%"
                                height="100%"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                {tab.text}
                            </Box>
                        </Tab>
                    ))}
                </HStack>

                {activeTab === 1 && (
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
                                        <MoreVerticalAlt
                                            style={{ '--ggs': 0.8 }}
                                        />
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
                                                        visibleProperties.length >
                                                        1
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
                                    icon={
                                        <MenuBoxed style={{ '--ggs': '0.7' }} />
                                    }
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
                )}
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
            <Tabs
                size="sm"
                variant="soft-rounded"
                colorScheme="blue"
                height="100%"
                onChange={index => setActiveTab(index)}
            >
                {renderTabButtons()}
                {renderTablePanels()}
            </Tabs>
        </Box>
    );
}

export default observer(DataPanel);
