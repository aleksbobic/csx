import {
    Box,
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    FormControl,
    Heading,
    IconButton,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tooltip,
    useColorMode,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import {
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    DoughnutController,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip as ChartJSTooltip
} from 'chart.js';
import CustomScroll from 'components/feature/customscroll/CustomScroll.component';
import BarChart from 'components/feature/stats/chart/BarChart.component';
import LineChart from 'components/feature/stats/chart/LineChart.component';
import DoughnutChart from 'components/feature/stats/chart/DoughnutChart.component';
import ComponentStatsComponent from 'components/feature/stats/component/ComponentStats.component';
import ConnectionStatsComponent from 'components/feature/stats/connections/ConnectionStats.component';
import GraphStatsComponent from 'components/feature/stats/graph/GraphStats.component';
import NodeStatsComponent from 'components/feature/stats/node/NodeStats.component';
import NodeFilterComponent from 'components/feature/stats/nodefilter/NodeFilter.component';
import { Close } from 'css.gg';
import { observer } from 'mobx-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import { useContext, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function FileUploadModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode } = useColorMode();

    useEffect(() => {
        if (store.stats.isStatsModalVisible) {
            onOpen();
        } else if (!store.stats.isStatsModalVisible && isOpen) {
            onClose();
            store.stats.resetChartProps();
        }
    }, [isOpen, onClose, onOpen, store.stats, store.stats.isStatsModalVisible]);

    useEffect(() => {
        ChartJS.register(
            ArcElement,
            ChartJSTooltip,
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Legend,
            PointElement,
            LineElement,
            DoughnutController,
            LineController,
            BarController
        );
    });

    const renderChart = (chartType, title) => {
        let chartData;
        let chartOptions;

        switch (chartType) {
            case 'doughnut':
                chartData = {
                    labels: ['First value', 'Second value', 'Third value'],
                    datasets: [
                        {
                            label: 'node values',
                            data: [5, 12, 3],
                            backgroundColor: ['#3182ce', '#ce317b', '#ce7c31'],
                            borderColor: 'rgb(0,0,0,)'
                        }
                    ]
                };
                chartOptions = {
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Doughnut Chart'
                        }
                    }
                };

                return (
                    <DoughnutChart
                        demoData={chartData}
                        title={title}
                        chart={{
                            type: chartType,
                            labels: {
                                y: { display: false },
                                x: { display: false }
                            }
                        }}
                        chartIndex={1}
                        isExample={true}
                        options={chartOptions}
                    />
                );

            case 'bar':
                chartData = {
                    labels: ['First value', 'Second value', 'Third value'],
                    datasets: [
                        {
                            label: 'node values',
                            data: [5, 12, 3],
                            backgroundColor: '#3182ce',
                            borderColor: 'rgb(0,0,0)'
                        }
                    ]
                };
                chartOptions = {
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Bar Chart'
                        }
                    }
                };

                return (
                    <BarChart
                        demoData={chartData}
                        title={title}
                        chart={{
                            type: chartType,
                            labels: {
                                y: { display: false },
                                x: { display: false }
                            }
                        }}
                        chartIndex={1}
                        isExample={true}
                        options={chartOptions}
                    />
                );
            case 'vertical bar':
                chartData = {
                    labels: ['First value', 'Second value', 'Third value'],
                    datasets: [
                        {
                            label: 'node values',
                            data: [5, 12, 3],
                            backgroundColor: '#3182ce',
                            borderColor: 'rgb(0,0,0)'
                        }
                    ]
                };
                chartOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Vertical Bar Chart'
                        }
                    }
                };

                return (
                    <BarChart
                        demoData={chartData}
                        title={title}
                        chart={{
                            type: chartType,
                            labels: {
                                y: { display: false },
                                x: { display: false }
                            }
                        }}
                        chartIndex={1}
                        isExample={true}
                        options={chartOptions}
                    />
                );
            case 'grouped bar':
                chartData = {
                    labels: ['Group 1', 'Group 2', 'Group 3'],
                    datasets: [
                        {
                            label: 'Value 1',
                            data: [5, 12, 3],
                            backgroundColor: '#3182ce',
                            borderColor: 'rgb(0,0,0)',
                            stack: 'stack 1'
                        },
                        {
                            label: 'Value 2',
                            data: [2, 5, 9],
                            backgroundColor: '#ce317b',
                            borderColor: 'rgb(0,0,0)',
                            stack: 'stack 2'
                        },
                        {
                            label: 'Value 3',
                            data: [10, 3, 8],
                            backgroundColor: '#ce7c31',
                            borderColor: 'rgb(0,0,0)',
                            stack: 'stack 3'
                        }
                    ]
                };
                return (
                    <BarChart
                        demoData={chartData}
                        title={title}
                        chart={{
                            type: chartType,
                            labels: {
                                y: { display: false },
                                x: { display: false }
                            }
                        }}
                        chartIndex={1}
                        isExample={true}
                        options={chartOptions}
                    />
                );
            default:
                chartData = {
                    labels: [
                        'First value',
                        'Second value',
                        'Third value',
                        'Fourth value',
                        'Fifth value'
                    ],
                    datasets: [
                        {
                            label: 'node values',
                            data: [5, 12, 3, 7, 4],
                            backgroundColor: '#3182ce',
                            borderColor: '#3182ce'
                        }
                    ]
                };
                chartOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Bar Chart'
                        }
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true
                        }
                    }
                };
                break;
        }

        return (
            <LineChart
                demoData={chartData}
                title={title}
                chart={{
                    type: chartType,
                    labels: { y: { display: false }, x: { display: false } }
                }}
                chartIndex={1}
                isExample={true}
                options={chartOptions}
            />
        );
    };

    const renderExampleStats = statType => {
        switch (statType) {
            case 'nodes':
                return (
                    <NodeStatsComponent
                        isExpanded={true}
                        demoData={[
                            {
                                id: 1,
                                label: 'label1',
                                feature: 'feature1',
                                neighbours: new Set([1, 2, 3])
                            },
                            {
                                id: 2,
                                label: 'label2',
                                feature: 'feature2',
                                neighbours: new Set([1, 2])
                            },
                            {
                                id: 3,
                                label: 'label3',
                                feature: 'feature3',
                                neighbours: new Set([1])
                            },
                            {
                                id: 4,
                                label: 'label4',
                                feature: 'feature4',
                                neighbours: new Set([])
                            }
                        ]}
                    />
                );

            case 'components':
                return (
                    <ComponentStatsComponent
                        isExpanded={true}
                        demoData={[
                            {
                                id: 1,
                                node_count: 53,
                                largest_connections: [
                                    { label: 'edge 1', count: 5 },
                                    { label: 'edge 2', count: 5 },
                                    { label: 'edge 3', count: 5 }
                                ],
                                largest_nodes: [
                                    {
                                        label: 'node 1',
                                        entries: [4, 5, 2, 4, 3, 5]
                                    },
                                    {
                                        label: 'node 2',
                                        entries: [4, 5, 2, 3, 5]
                                    },
                                    { label: 'node 3', entries: [4, 5, 2, 3] }
                                ]
                            },
                            {
                                id: 2,
                                node_count: 34,
                                largest_connections: [
                                    { label: 'edge 5', count: 3 }
                                ],
                                largest_nodes: [
                                    { label: 'node 5', entries: [2, 4, 5] }
                                ]
                            },
                            {
                                id: 3,
                                node_count: 14,
                                largest_connections: [
                                    { label: 'edge 4', count: 2 }
                                ],
                                largest_nodes: [
                                    { label: 'node 4', entries: [4, 5] }
                                ]
                            },
                            {
                                id: 4,
                                node_count: 4,
                                largest_connections: [],
                                largest_nodes: []
                            }
                        ]}
                    />
                );
            case 'graph':
                return (
                    <GraphStatsComponent
                        isExpanded={true}
                        demoData={{
                            graphData: {
                                components: {
                                    count: 41,
                                    label: 'components'
                                },
                                edges: {
                                    count: 261,
                                    label: 'edges'
                                },
                                entries: {
                                    count: 52,
                                    label: 'entries'
                                },
                                maxDegree: {
                                    count: 10,
                                    label: 'max degree'
                                },
                                nodes: {
                                    count: 301,
                                    label: 'nodes'
                                }
                            },
                            nodeData: {
                                'feature 1': { count: 421 },
                                'feature 2': { count: 43 }
                            }
                        }}
                    />
                );
            case 'node filter':
                return (
                    <NodeFilterComponent
                        demoData={[{ max: 55, prop: 'connection' }]}
                    />
                );
            default:
                return (
                    <ConnectionStatsComponent
                        isExpanded={true}
                        demoData={[
                            {
                                id: 1,
                                label: 'label1',
                                feature: 'feature1',
                                neighbourObjects: [
                                    {
                                        id: 2,
                                        label: 'label2',
                                        feature: 'feature2',
                                        neighbours: new Set([1, 2])
                                    },
                                    {
                                        id: 3,
                                        label: 'label3',
                                        feature: 'feature3',
                                        neighbours: new Set([1])
                                    },
                                    {
                                        id: 4,
                                        label: 'label4',
                                        feature: 'feature4',
                                        neighbours: new Set([])
                                    }
                                ]
                            }
                        ]}
                    />
                );
        }
    };

    const renderSelectionElements = statTypes => {
        // statTypes = type = chart, stat / statType / chartType = grouped bar
        return (
            <Box height="225px" width="100%">
                <CustomScroll
                    style={{ paddingLeft: '10px', paddingRight: '10px' }}
                >
                    <SimpleGrid columns={3} spacing={2}>
                        <Tooltip label="The title at the top of the widget">
                            <FormControl
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.200'
                                        : 'whiteAlpha.200'
                                }
                                borderRadius="6px"
                                padding="10px"
                            >
                                <Heading size="xs" marginBottom="6px">
                                    Custom Title:
                                </Heading>
                                <Editable
                                    defaultValue={
                                        store.stats.newChartProps.title
                                            ? store.stats.newChartProps.title
                                            : 'Widget title'
                                    }
                                    onSubmit={val => {
                                        store.track.trackEvent(
                                            'Widget Modal',
                                            'Editable Element - Title',
                                            JSON.stringify({
                                                type: 'Write',
                                                value: val
                                            })
                                        );

                                        store.stats.changeChartTitle(val);
                                    }}
                                    onFocus={() =>
                                        store.comment.setCommentTrigger(false)
                                    }
                                    onBlur={() =>
                                        store.comment.setCommentTrigger(true)
                                    }
                                    height="28px"
                                >
                                    <EditablePreview
                                        padding="2px 6px"
                                        margin="0"
                                        maxWidth="100%"
                                        width="100%"
                                        overflow="hidden"
                                        whiteSpace="nowrap"
                                        textOverflow="ellipsis"
                                        backgroundColor="transparent"
                                        transition="all 0.1s ease-in-out"
                                        _hover={{
                                            background: 'whiteAlpha.200'
                                        }}
                                    />
                                    <EditableInput
                                        padding="2px 6px"
                                        margin="0"
                                        maxWidth="100%"
                                        width="100%"
                                    />
                                </Editable>
                            </FormControl>
                        </Tooltip>

                        {statTypes.type === 'chart' && (
                            <FormControl
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.200'
                                        : 'whiteAlpha.200'
                                }
                                borderRadius="6px"
                                padding="10px"
                            >
                                <Heading size="xs" marginBottom="6px">
                                    Network elements:
                                </Heading>
                                <Tooltip label="Selecting nodes means that you would like to get the data from node properties while selecting edges means you would like to get the data from edges.">
                                    <Select
                                        size="sm"
                                        defaultValue="nodes"
                                        variant="filled"
                                        onChange={value => {
                                            store.track.trackEvent(
                                                'Widget Modal',
                                                'Select Element - Network Elements',
                                                JSON.stringify({
                                                    type: 'Change selection',
                                                    value: value.target.value
                                                })
                                            );

                                            store.stats.changeChartNetworkElements(
                                                value.target.value
                                            );
                                        }}
                                    >
                                        <option value="nodes">Nodes</option>
                                        {(statTypes.type === 'stat' ||
                                            (statTypes.type === 'chart' &&
                                                statTypes.chartType !==
                                                    'grouped bar')) && (
                                            <option value="edges">Edges</option>
                                        )}
                                    </Select>
                                </Tooltip>
                            </FormControl>
                        )}

                        {statTypes.type === 'chart' && (
                            <FormControl
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.200'
                                        : 'whiteAlpha.200'
                                }
                                borderRadius="6px"
                                padding="10px"
                            >
                                <Heading size="xs" marginBottom="6px">
                                    Element values:
                                </Heading>
                                <Tooltip label="These values will be shown on the chart instead of 'First value', 'Second value' etc. and their frequencies will be shown as the percentage of the chart.">
                                    <Select
                                        size="sm"
                                        onChange={value => {
                                            store.track.trackEvent(
                                                'Widget Modal',
                                                'Select Element - Element Values',
                                                JSON.stringify({
                                                    type: 'Change selection',
                                                    value: value.target.value
                                                })
                                            );

                                            store.stats.changeChartElementValue(
                                                value.target.value
                                            );
                                        }}
                                        variant="filled"
                                    >
                                        {store.stats
                                            .getElementValues()
                                            .map(entry => (
                                                <option
                                                    key={`chart_selection_element_${entry.value}`}
                                                    value={entry.value}
                                                >
                                                    {entry.label}
                                                </option>
                                            ))}
                                    </Select>
                                </Tooltip>
                            </FormControl>
                        )}

                        {statTypes.type === 'chart' &&
                            statTypes.chartType === 'grouped bar' && (
                                <FormControl
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.200'
                                    }
                                    borderRadius="6px"
                                    padding="10px"
                                >
                                    <Heading size="xs" marginBottom="6px">
                                        Group by values:
                                    </Heading>
                                    <Tooltip label="These values will be shown on the chart instead of 'First group', 'Second group' etc. and they will be used to group the element values.">
                                        <Select
                                            size="sm"
                                            onChange={value => {
                                                store.track.trackEvent(
                                                    'Widget Modal',
                                                    'Select Element - Group By Value',
                                                    JSON.stringify({
                                                        type: 'Change selection',
                                                        value: value.target
                                                            .value
                                                    })
                                                );

                                                store.stats.changeChartGroupByValues(
                                                    value.target.value
                                                );
                                            }}
                                            variant="filled"
                                        >
                                            {store.stats
                                                .getElementValues(true)
                                                .map(entry => (
                                                    <option
                                                        key={`chart_selection_group_by_${entry.value}`}
                                                        value={entry.value}
                                                    >
                                                        {entry.label}
                                                    </option>
                                                ))}
                                        </Select>
                                    </Tooltip>
                                </FormControl>
                            )}

                        {statTypes.type === 'chart' &&
                            store.core.currentGraph === 'detail' &&
                            store.stats.newChartProps.elements === 'nodes' &&
                            store.stats.newChartProps.element_values !==
                                'types' && (
                                <FormControl
                                    backgroundColor={
                                        colorMode === 'light'
                                            ? 'blackAlpha.200'
                                            : 'whiteAlpha.200'
                                    }
                                    borderRadius="6px"
                                    padding="10px"
                                >
                                    <Heading size="xs" marginBottom="6px">
                                        Show only:
                                    </Heading>
                                    <Tooltip label="These values will define which types of nodes you want to explore.">
                                        <Select
                                            size="sm"
                                            onChange={value => {
                                                store.track.trackEvent(
                                                    'Widget Modal',
                                                    'Select Element - Show Only',
                                                    JSON.stringify({
                                                        type: 'Change selection',
                                                        value: value.target
                                                            .value
                                                    })
                                                );

                                                store.stats.changeShowOnly(
                                                    value.target.value
                                                );
                                            }}
                                            variant="filled"
                                        >
                                            <option value={'all'}>All</option>
                                            {[
                                                ...store.graph.currentGraphData
                                                    .perspectivesInGraph
                                            ].map(entry => (
                                                <option
                                                    key={`chart_selection_show_only_${entry}`}
                                                    value={entry}
                                                >
                                                    {entry}
                                                </option>
                                            ))}
                                        </Select>
                                    </Tooltip>
                                </FormControl>
                            )}
                    </SimpleGrid>
                </CustomScroll>
            </Box>
        );
    };

    const renderModalBody = () => {
        return (
            <ModalBody width="748px" paddingTop="0" paddingBottom="0">
                <Tabs
                    isLazy={true}
                    orientation="vertical"
                    width="100%"
                    height="500px"
                    variant="unstyled"
                    size="sm"
                    onChange={store.stats.changeSelectedChartType}
                >
                    <TabList
                        width="200px"
                        height="100%"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.200'
                                : 'whiteAlpha.200'
                        }
                        borderRadius="4px"
                        padding="8px"
                    >
                        {store.stats.chartTypes.map(entry => (
                            <Tab
                                key={`chart_tab_${entry}`}
                                marginBottom="10px"
                                fontWeight="bold"
                                _selected={{
                                    color: 'white',
                                    bg: 'blue.500',
                                    borderRadius: '4px'
                                }}
                                _hover={{
                                    color: 'white',
                                    bg: 'blue.500',
                                    borderRadius: '4px',
                                    opacity: 0.5,
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    store.track.trackEvent(
                                        'Widget Modal',
                                        'Button',
                                        JSON.stringify({
                                            type: 'Click',
                                            value: `Open ${entry} widget sample`
                                        })
                                    );
                                }}
                            >
                                {entry}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels paddingTop="0px">
                        {[
                            {
                                chartType: 'doughnut',
                                title: 'Example doughnut chart',
                                type: 'chart'
                            },
                            {
                                chartType: 'bar',
                                title: 'Example bar chart',
                                type: 'chart'
                            },
                            {
                                chartType: 'line',
                                title: 'Example line chart',
                                type: 'chart'
                            },
                            {
                                chartType: 'vertical bar',
                                title: 'Example vertical bar chart',
                                type: 'chart'
                            },
                            {
                                chartType: 'grouped bar',
                                title: 'Example grouped bar chart',
                                type: 'chart'
                            },
                            {
                                statType: 'nodes',
                                type: 'stat'
                            },
                            {
                                statType: 'components',
                                type: 'stat'
                            },
                            {
                                statType: 'graph',
                                type: 'stat'
                            },
                            {
                                statType: 'connections',
                                type: 'stat'
                            },
                            {
                                statType: 'node filter',
                                type: 'stat'
                            }
                        ].map((entry, index) => {
                            return (
                                <TabPanel
                                    paddingTop="0px"
                                    paddingBottom="0px"
                                    height="100%"
                                    key={`Example_chart_${index}`}
                                >
                                    <VStack
                                        width="100%"
                                        height="100%"
                                        justifyContent="space-between"
                                    >
                                        <Heading size="sm" opacity="0.7">
                                            Example widget
                                        </Heading>
                                        <Box
                                            height="250px"
                                            width="100%"
                                            backgroundColor={
                                                colorMode === 'light'
                                                    ? 'blackAlpha.200'
                                                    : 'whiteAlpha.200'
                                            }
                                            padding="10px"
                                            borderRadius="6px"
                                        >
                                            {entry['type'] === 'chart'
                                                ? renderChart(
                                                      entry['chartType'],
                                                      entry['title']
                                                  )
                                                : renderExampleStats(
                                                      entry['statType']
                                                  )}
                                        </Box>
                                        <Heading size="sm" opacity="0.7">
                                            Widget settings
                                        </Heading>
                                        {renderSelectionElements(entry)}
                                    </VStack>
                                </TabPanel>
                            );
                        })}
                    </TabPanels>
                </Tabs>
            </ModalBody>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            isCentered
            closeOnEsc={false}
            closeOnOverlayClick={false}
        >
            <ModalOverlay
                bg={colorMode === 'light' ? 'blackAlpha.800' : 'blackAlpha.600'}
            />
            <ModalContent
                width="748px"
                minWidth="748px"
                maxWidth="748px"
                background={colorMode === 'light' ? 'white' : 'black'}
                borderRadius="10px"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="blue.500"
            >
                <ModalHeader width="100%">
                    <Heading
                        textAlign="center"
                        size="md"
                        padding="0"
                        marginTop="10px"
                    >
                        Widget Selection
                    </Heading>
                    <IconButton
                        position="absolute"
                        variant="ghost"
                        size="sm"
                        top="20px"
                        right="20px"
                        icon={<Close />}
                        onClick={() => {
                            store.track.trackEvent(
                                'Widget Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Close widget modal'
                                })
                            );

                            store.stats.toggleStatsModalVisiblity(false);
                        }}
                    />
                </ModalHeader>

                {isOpen && renderModalBody()}

                <ModalFooter>
                    <Button
                        variant="solid"
                        backgroundColor="blue.500"
                        _hover={{ backgroundColor: 'blue.600' }}
                        _active={{ backgroundColor: 'blue.700' }}
                        onClick={() => {
                            store.stats.addChart();
                        }}
                        color={'white'}
                    >
                        Add widget
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default observer(FileUploadModal);
