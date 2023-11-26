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
import WidgetGrid from 'components/feature/rightpanel/widgetgrid/WidgetGrid.component';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

import Comments from 'components/feature/rightpanel/comments/Comments.component';
import SerpComponent from 'components/feature/rightpanel/serp/Serp.component';
import TableComponent from 'components/feature/rightpanel/table/Table.component';

import {
    Bars4Icon,
    EllipsisVerticalIcon,
    ArrowDownTrayIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';
import { useCallback } from 'react';
import { CSVLink } from 'react-csv';
import { useResizeDetector } from 'react-resize-detector';

import AdvancedSearch from 'components/feature/advancedsearch/AdvancedSearch.component';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import { HistoryFlow } from 'components/feature/rightpanel/historyflow/HistoryFlow.component';
import SchemaFlow from 'components/feature/rightpanel/schemaflow/SchemaFlow.component';
import { SchemaList } from 'components/feature/rightpanel/schemalist/SchemaList.component';
import { isEnvFalse } from 'general.utils';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function RightPanel(props) {
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

    const renderTabPanel = child => {
        return (
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
                    {child}
                </Box>
            </TabPanel>
        );
    };

    const renderTabPanels = () => {
        return (
            <TabPanels
                width="100%"
                padding="0 10px 10px"
                height="100%"
                ref={ref}
            >
                {renderTabPanel(<AdvancedSearch isPanel={true} />)}

                {renderTabPanel(
                    <CustomScroll
                        style={{
                            paddingLeft: '10px',
                            paddingRight: '10px'
                        }}
                    >
                        <WidgetGrid />
                    </CustomScroll>
                )}
                {renderTabPanel(renderResultsTabContent())}
                {renderTabPanel(<SchemaFlow />)}
                {renderTabPanel(<HistoryFlow />)}
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
                    icon={
                        <EllipsisVerticalIcon
                            style={{ width: '16px', height: '16px' }}
                        />
                    }
                    onClick={() => {
                        store.track.trackEvent(
                            JSON.stringify({
                                area: 'Results panel',
                                sub_area: 'Results list'
                            }),
                            JSON.stringify({
                                item_type: 'Button'
                            }),
                            JSON.stringify({
                                event_type: 'Click',
                                event_action: 'Open list options'
                            })
                        );
                    }}
                    zIndex="3"
                />
            </Tooltip>
            <MenuList
                backgroundColor="black"
                padding="5px"
                borderRadius="10px"
                maxHeight="200px"
                overflowY="scroll"
            >
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
                                        JSON.stringify({
                                            area: 'Results panel',
                                            sub_area: 'Results list'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Checkbox'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Check',
                                            event_action: 'Show in list',
                                            event_value: feature
                                        })
                                    );

                                    setVisibleProperties([
                                        ...visibleProperties,
                                        feature
                                    ]);
                                } else if (visibleProperties.length > 1) {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Results panel',
                                            sub_area: 'Results list'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Checkbox'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Check',
                                            event_action: 'Hide in list',
                                            event_value: feature
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
                                            JSON.stringify({
                                                area: 'Results panel'
                                            }),
                                            JSON.stringify({
                                                item_type: 'Button'
                                            }),
                                            JSON.stringify({
                                                event_type: 'Check',
                                                event_action:
                                                    'Download data as CSV'
                                            })
                                        );
                                    }}
                                    transition="all 0.2 ease-in-out"
                                    _hover={{ opacity: 1 }}
                                    icon={
                                        <ArrowDownTrayIcon
                                            style={{
                                                width: '16px',
                                                height: '16px'
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
                                    <TableCellsIcon
                                        style={{
                                            width: '16px',
                                            height: '16px'
                                        }}
                                    />
                                }
                                size="sm"
                                borderEndRadius="0"
                                transition="all 0.2 ease-in-out"
                                _hover={{ opacity: 1 }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Results panel',
                                            sub_area: 'Results list'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Switch to table view'
                                        })
                                    );

                                    setUseList(false);
                                }}
                            />
                        </Tooltip>
                        <Tooltip label="Use list view">
                            <IconButton
                                opacity={useList ? 1 : 0.5}
                                icon={
                                    <Bars4Icon
                                        style={{
                                            width: '16px',
                                            height: '16px'
                                        }}
                                    />
                                }
                                size="sm"
                                borderStartRadius="0"
                                transition="all 0.2 ease-in-out"
                                _hover={{ opacity: 1 }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Results panel',
                                            sub_area: 'Results list'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action: 'Switch to list view'
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
                        '80px'
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

RightPanel.propTypes = {
    panelType: PropTypes.string
};

export default observer(RightPanel);
