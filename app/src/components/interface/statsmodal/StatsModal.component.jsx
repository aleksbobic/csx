import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Heading,
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
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip as ChartJSTooltip
} from 'chart.js';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { RootStoreContext } from 'stores/RootStore';

function FileUploadModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

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
            LineElement
        );
    });

    const renderDoughnutPanel = () => {
        const chartData = {
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

        return (
            <Doughnut
                height="250px"
                redraw={true}
                data={chartData}
                options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Doughnut Chart'
                        }
                    }
                }}
            />
        );
    };

    const renderBarPanel = () => {
        const chartData = {
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

        return (
            <Bar
                data={chartData}
                width="100%"
                height="250px"
                redraw={true}
                options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Bar Chart'
                        }
                    }
                }}
            />
        );
    };

    const renderLinePanel = () => {
        const chartData = {
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

        return (
            <Line
                data={chartData}
                width="100%"
                height="250px"
                redraw={true}
                options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Example Line Chart'
                        }
                    }
                }}
            />
        );
    };

    const renderSelectionElements = () => {
        return (
            <Box>
                <SimpleGrid columns={2} spacing={5}>
                    <FormControl>
                        <FormLabel htmlFor="dataTargetSelector">
                            Network data:
                        </FormLabel>
                        <Tooltip
                            label="All data means this chart will
                reflect the distribution of values
                over the entire network while
                selection means it will only reflect
                the distribution of values on the
                data points you selected."
                        >
                            <Select
                                id="dataTargetSelector"
                                defaultValue="selection"
                                size="sm"
                                onChange={value =>
                                    store.stats.changeChartNetworkData(
                                        value.target.value
                                    )
                                }
                            >
                                <option value="selection">
                                    Selection data
                                </option>
                                <option value="all">All data</option>
                            </Select>
                        </Tooltip>
                    </FormControl>

                    <FormControl>
                        <FormLabel htmlFor="dataTargetSelector">
                            Network elements:
                        </FormLabel>
                        <Tooltip label="Selecting nodes means that you would like to get the data from node properties while selecting edges means you would like to get the data from edges.">
                            <Select
                                size="sm"
                                defaultValue="nodes"
                                onChange={value =>
                                    store.stats.changeChartNetworkElements(
                                        value.target.value
                                    )
                                }
                            >
                                <option value="nodes">Nodes</option>
                                <option value="edges">Edges</option>
                            </Select>
                        </Tooltip>
                    </FormControl>

                    <FormControl>
                        <FormLabel htmlFor="dataTargetSelector">
                            Element values:
                        </FormLabel>
                        <Tooltip label="These values will be shown on the chart instead of 'First value', 'Second value' etc. and their frequencies will be shown as the percentage of the chart.">
                            <Select size="sm">
                                {store.stats.getElementValues().map(entry => (
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
                </SimpleGrid>
            </Box>
        );
    };

    const renderModalBody = () => {
        return (
            <ModalBody overflowY="scroll" width="748px">
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
                        backgroundColor="whiteAlpha.200"
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
                            >
                                {entry}
                            </Tab>
                        ))}
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <VStack width="100%" height="100%">
                                <Heading size="sm">Doughnut Chart</Heading>
                                <Box height="250px" width="100%">
                                    {renderDoughnutPanel()}
                                </Box>
                                {renderSelectionElements()}
                            </VStack>
                        </TabPanel>
                        <TabPanel>
                            <VStack width="100%" height="100%">
                                <Heading size="sm">Bar Chart</Heading>
                                <Box height="250px" width="100%">
                                    {renderBarPanel()}
                                </Box>
                                {renderSelectionElements()}
                            </VStack>
                        </TabPanel>
                        <TabPanel>
                            <VStack width="100%" height="100%">
                                <Heading size="sm">Line Chart</Heading>
                                <Box height="250px" width="100%">
                                    {renderLinePanel()}
                                </Box>
                                {renderSelectionElements()}
                            </VStack>
                        </TabPanel>
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
            <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
            <ModalContent
                width="748px"
                minWidth="748px"
                maxWidth="748px"
                background="black"
                borderRadius="10px"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="blue.500"
            >
                <ModalHeader>New Graph Statistics</ModalHeader>

                {isOpen && renderModalBody()}

                <ModalFooter>
                    <Button
                        variant="outline"
                        mr={3}
                        onClick={() =>
                            store.stats.toggleStatsModalVisiblity(false)
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        onClick={() => store.stats.addChart()}
                    >
                        Add chart
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default observer(FileUploadModal);
