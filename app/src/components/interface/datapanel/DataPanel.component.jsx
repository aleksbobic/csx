import {
    Box,
    Flex,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    useColorModeValue,
    VStack,
    Select
} from '@chakra-ui/react';
import GraphDetailsComponent from 'components/feature/graphDetails/graphDetails.component';
import SelectionOverview from 'components/feature/selectionoverview/SelectionOverview.component';
import TableComponent from 'components/feature/table/Table.component';
import { observer } from 'mobx-react';
import { useContext, useState, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import ReactFlow, { Background } from 'react-flow-renderer';

import SchemaEdge from 'components/feature/schemaedge/SchemaEdge.component';
import SchemaNode from 'components/feature/schemanode/SchemaNode.component';
import OverviewSchemaNode from 'components/feature/overviewschemanode/OverviewSchemaNode.component';
import OverviewCustomEdge from 'components/feature/overviewschemaedge/OverviewSchemaEdge.component';
import SearchNode from 'components/feature/advancedsearch/searchnode/SearchNode.component';
import DatasetNode from 'components/feature/advancedsearch/datasetNode/Dataset.component';
import ResultsNode from 'components/feature/advancedsearch/resultsNode/ResultsNode.component';
import ConnectorNode from 'components/feature/advancedsearch/connectornode/ConnectorNode.component';
import FilterNode from 'components/feature/advancedsearch/filternode/FilterNode.component';
import KeywordExtractionNode from 'components/feature/advancedsearch/keywordextractionnode/KeywordExtractionNode.component';
import CountsNode from 'components/feature/advancedsearch/countsNode/Counts.component';
import SearchEdge from 'components/feature/advancedsearch/searchedge/SearchEdge.component';

function DataPanel() {
    const store = useContext(RootStoreContext);
    const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
    const tabHeaderBgColor = useColorModeValue('white', 'black');
    const edgeColor = useColorModeValue('gray.300', 'gray.900');

    const [schemaData, setSchemaData] = useState(
        store.core.isOverview ? store.schema.overviewData : store.schema.data
    );

    useEffect(() => {
        setSchemaData(
            store.core.isOverview
                ? store.schema.overviewData
                : store.schema.data
        );
    }, [
        store.core.currentGraph,
        store.core.isOverview,
        store.schema.data,
        store.schema.overviewData
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
            <ReactFlow
                elements={schemaData}
                nodesDraggable={true}
                nodesConnectable={true}
                snapToGrid={true}
                onConnect={connectNodes}
                onEdgeUpdate={updateEdge}
                nodeTypes={{
                    datasetNode: DatasetNode,
                    schemaNode: SchemaNode,
                    overviewSchemaNode: OverviewSchemaNode,
                    searchNode: SearchNode,
                    connectorNode: ConnectorNode,
                    filterNode: FilterNode,
                    keywordExtractionNode: KeywordExtractionNode,
                    countsNode: CountsNode,
                    resultsNode: ResultsNode
                }}
                edgeTypes={{
                    schemaEdge: SchemaEdge,
                    overviewCustomEdge: OverviewCustomEdge,
                    searchEdge: SearchEdge
                }}
            >
                <Background gap={12} size={1} style={{ opacity: 0.5 }} />
            </ReactFlow>
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
                    <SelectionOverview types={['all']} />
                </TabPanel>
                <TabPanel paddingLeft="0" paddingRight="0" paddingTop="15px">
                    <SelectionOverview />
                </TabPanel>
                <TabPanel
                    paddingLeft="0"
                    paddingRight="0"
                    paddingTop="50px"
                    height="100%"
                >
                    {store.graph.currentGraphData.activeTableData && (
                        <TableComponent
                            data={store.graph.currentGraphData.activeTableData}
                            columns={store.graph.tableColumns}
                        />
                    )}
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
                trackingCode: 'selection tab',
                id: 'selectiontab',
                text: 'Selection'
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
            >
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
            style={{ backdropFilter: 'blur(2px)' }}
            id="datapanel"
        >
            <Tabs
                size="sm"
                variant="soft-rounded"
                colorScheme="blue"
                height="100%"
            >
                {renderTabButtons()}
                {renderTablePanels()}
            </Tabs>
        </Box>
    );
}

export default observer(DataPanel);
