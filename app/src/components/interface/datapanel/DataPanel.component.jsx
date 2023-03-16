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
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tooltip,
    useColorMode,
    useColorModeValue
} from '@chakra-ui/react';
import Overview from 'components/feature/overview/Overview.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import Comments from 'components/feature/comments/Comments.component';
import SerpComponent from 'components/feature/serp/Serp.component';
import TableComponent from 'components/feature/table/Table.component';
import {
    MenuBoxed,
    MoreVerticalAlt,
    SoftwareDownload,
    ViewComfortable
} from 'css.gg';
import { useCallback } from 'react';
import { CSVLink } from 'react-csv';
import { useResizeDetector } from 'react-resize-detector';

import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { HistoryFlow } from 'components/feature/historyflow/HistoryFlow.component';
import SchemaFlow from 'components/feature/schemaflow/SchemaFlow.component';
import { SchemaList } from 'components/feature/schemalist/SchemaList.component';
import { isEnvFalse } from 'general.utils';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import AdvancedSearch from 'components/feature/advancedsearch/AdvancedSearch.component';

function DataPanel(props) {
    const store = useContext(RootStoreContext);
    const [panelWidth, setPanelWidth] = useState(0);
    const [activeTab, setActiveTab] = useState(0);

    const onResize = useCallback(
        width => {
            if (activeTab === 1) {
                store.contextMenu.setXOffset(0);
                setPanelWidth(width);
            } else {
                store.contextMenu.setXOffset(width + 50);
                setPanelWidth(width);
            }
        },
        [activeTab, store.contextMenu]
    );

    const { ref } = useResizeDetector({ onResize });
    const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
    const edgeColor = useColorModeValue('gray.300', 'gray.900');
    const [useList, setUseList] = useState(false);
    const [visibleProperties, setVisibleProperties] = useState([]);
    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);

    const { colorMode } = useColorMode();

    useEffect(() => {
        if (props.panelType === '') {
            store.contextMenu.setXOffset(0);
        } else {
            store.contextMenu.setXOffset(panelWidth + 50);
        }

        switch (props.panelType) {
            case 'search':
                setActiveTab(0);
                break;
            case 'details':
                setActiveTab(1);
                break;
            case 'results':
                setActiveTab(2);
                break;
            case 'schema':
                setActiveTab(3);
                break;
            case 'history':
                setActiveTab(4);
                break;
            case 'comment':
                setActiveTab(5);
                break;
            default:
                setActiveTab(1);
                break;
        }
    }, [panelWidth, props.panelType, store.contextMenu]);

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

    const renderResultsTabContent = () => (
        <CustomScroll
            style={{
                paddingLeft: '10px',
                paddingRight: '10px'
            }}
        >
            {store.graph.currentGraphData.activeTableData &&
                (useList ? (
                    <SerpComponent
                        data={store.graph.currentGraphData.activeTableData}
                        columns={store.graph.tableColumns}
                        visibleProperties={visibleProperties}
                    />
                ) : (
                    <TableComponent
                        data={store.graph.currentGraphData.activeTableData}
                        columns={store.graph.tableColumns}
                    />
                ))}
        </CustomScroll>
    );

    const renderTabPanels = () => {
        return (
            <TabPanels width="100%" padding="10px" height="100%" ref={ref}>
                <TabPanel padding="10px" height="100%">
                    <Box
                        height="100%"
                        width="100%"
                        padding="14px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                    >
                        <AdvancedSearch isPanel={true} />
                    </Box>
                </TabPanel>
                <TabPanel padding="10px" height="100%">
                    <Box
                        height="100%"
                        width="100%"
                        padding="14px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                    >
                        <CustomScroll
                            style={{
                                paddingLeft: '10px',
                                paddingRight: '10px'
                            }}
                        >
                            <Overview />
                        </CustomScroll>
                    </Box>
                </TabPanel>
                <TabPanel padding="10px" height="100%">
                    <Box
                        height="100%"
                        width="100%"
                        padding="14px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                        paddingTop={activeTab === 2 && '30px'}
                    >
                        {renderResultsTabContent()}
                    </Box>
                </TabPanel>
                <TabPanel padding="10px" height="100%">
                    <Box
                        height="100%"
                        width="100%"
                        padding="14px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                    >
                        <SchemaFlow />
                    </Box>
                </TabPanel>
                <TabPanel padding="10px" height="100%">
                    <Box
                        height="100%"
                        width="100%"
                        padding="14px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.100'
                        }
                        borderRadius="10px"
                    >
                        <HistoryFlow />
                    </Box>
                </TabPanel>
            </TabPanels>
        );
    };

    const renderListMenu = () => (
        <Menu closeOnSelect={false} zIndex="3">
            <Tooltip label="List options">
                <MenuButton
                    disabled={!useList}
                    size="sm"
                    as={IconButton}
                    icon={<MoreVerticalAlt style={{ '--ggs': 0.8 }} />}
                    onClick={() => {
                        store.track.trackEvent(
                            'Results Panel',
                            'Button',
                            JSON.stringify({
                                type: 'Click',
                                value: 'Open list options'
                            })
                        );
                    }}
                    zIndex="3"
                />
            </Tooltip>
            <MenuList backgroundColor="black" padding="5px" borderRadius="10px">
                {Object.keys(store.search.nodeTypes).map(feature => (
                    <MenuItem
                        key={`serp_list_checkbox_${feature}`}
                        fontSize="xs"
                        fontWeight="bold"
                        borderRadius="6px"
                    >
                        <Checkbox
                            isChecked={visibleProperties.includes(feature)}
                            size="sm"
                            onChange={e => {
                                if (e.target.checked) {
                                    store.track.trackEvent(
                                        'Results Panel',
                                        'Checkbox',
                                        JSON.stringify({
                                            type: 'Check',
                                            value: `Show ${feature} in list`
                                        })
                                    );

                                    setVisibleProperties([
                                        ...visibleProperties,
                                        feature
                                    ]);
                                } else if (visibleProperties.length > 1) {
                                    store.track.trackEvent(
                                        'Results Panel',
                                        'Checkbox',
                                        JSON.stringify({
                                            type: 'Check',
                                            value: `Hide ${feature} in list`
                                        })
                                    );

                                    setVisibleProperties([
                                        ...visibleProperties.filter(
                                            value => value !== feature
                                        )
                                    ]);
                                }
                            }}
                        >
                            {feature}
                        </Checkbox>
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );

    const renderTabButtons = () => {
        return (
            <TabList
                width="100%"
                height="60px"
                zIndex="2"
                padding="15px 10px"
                position="absolute"
                top="70px"
                left="25px"
                justifyContent="space-between"
            >
                <HStack>
                    {isEnvFalse('REACT_APP_DISABLE_DATASET_DOWNLOAD') && (
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
                                    onClick={() => {
                                        store.track.trackEvent(
                                            'Results Panel',
                                            'Button',
                                            JSON.stringify({
                                                type: 'Click',
                                                value: 'Download data as CSV'
                                            })
                                        );
                                    }}
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
                    )}
                    <Box>{renderListMenu()}</Box>
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
                                    store.track.trackEvent(
                                        'Results Panel',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: 'Switch to table view'
                                        })
                                    );

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
                                    store.track.trackEvent(
                                        'Results Panel',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: 'Switch to list view'
                                        })
                                    );

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
                {activeTab === 3 && <SchemaList />}
                <Tabs
                    size="sm"
                    variant="soft-rounded"
                    colorScheme="blue"
                    height={store.comment.isCommentListVisible ? '50%' : '100%'}
                    paddingBottom={
                        store.comment.isCommentListVisible ? 0 : '80px'
                    }
                    paddingTop={
                        activeTab === 3 &&
                        store.search.default_schemas[store.core.currentGraph]
                            .length > 0 &&
                        '110px'
                    }
                    index={activeTab}
                >
                    {activeTab === 2 && renderTabButtons()}
                    {renderTabPanels()}
                </Tabs>
                <Flex
                    position={
                        store.comment.isCommentListVisible
                            ? 'initial'
                            : 'absolute'
                    }
                    bottom={!store.comment.isCommentListVisible && 0}
                    spacing="10px"
                    width="100%"
                    height={store.comment.isCommentListVisible ? '50%' : '80px'}
                    padding="20px"
                    paddingTop="0"
                    paddingRight={!store.comment.isCommentListVisible && 22}
                >
                    <Comments />
                </Flex>
            </Box>
        </Box>
    );
}

DataPanel.propTypes = {
    panelType: PropTypes.string
};

export default observer(DataPanel);
