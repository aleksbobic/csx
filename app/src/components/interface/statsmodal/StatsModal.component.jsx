import {
    Box,
    Button,
    Heading,
    HStack,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { RootStoreContext } from 'stores/RootStore';
import {
    ArcElement,
    Chart as ChartJS,
    Tooltip,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Legend
} from 'chart.js';

function FileUploadModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (store.stats.isStatsModalVisible) {
            onOpen();
        } else if (!store.stats.isStatsModalVisible && isOpen) {
            onClose();
        }
    }, [isOpen, onClose, onOpen, store.stats.isStatsModalVisible]);

    // useEffect(() => {
    //     ChartJS.register(
    //         ArcElement,
    //         Tooltip,
    //         CategoryScale,
    //         LinearScale,
    //         BarElement,
    //         Title,
    //         Legend
    //     );
    // });

    const renderDoughnutPanel = () => {
        const chartData = {
            labels: ['First value', 'Second value', 'Third value'],
            datasets: [
                {
                    label: 'node values',
                    data: [5, 12, 3],
                    backgroundColor: ['#3182ce', '#ce317b', '#ce7c31'],
                    borderColor: ['rgba(0,0,0,0)']
                }
            ]
        };

        ChartJS.register(
            ArcElement,
            Tooltip,
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Legend
        );

        return (
            <Doughnut
                height="250px"
                redraw={true}
                data={chartData}
                options={{ maintainAspectRatio: false }}
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
                    borderColor: 'rgba(255,0,0,0)'
                }
            ]
        };

        ChartJS.register(
            ArcElement,
            Tooltip,
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Legend
        );

        return (
            <Bar
                data={chartData}
                width="100%"
                height="250px"
                redraw={true}
                options={{
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    elements: {
                        bar: {
                            borderWidth: 2
                        }
                    },
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
                >
                    <TabList
                        width="200px"
                        height="100%"
                        backgroundColor="whiteAlpha.200"
                        borderRadius="4px"
                        padding="8px"
                    >
                        <Tab
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
                            Doughnut
                        </Tab>
                        <Tab
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
                            Bar
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <VStack width="100%" height="100%">
                                <Heading size="sm">Doughnut Chart</Heading>
                                <Box height="250px" width="100%">
                                    {renderDoughnutPanel()}
                                </Box>
                                <Box>
                                    <Text>Test</Text>
                                </Box>
                            </VStack>
                        </TabPanel>
                        <TabPanel>
                            <VStack width="100%" height="100%">
                                <Heading size="sm">Bar Chart</Heading>
                                <HStack width="100%" height="100%">
                                    {renderBarPanel()}
                                </HStack>
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
                        onClick={() => console.log('Adding stats')}
                    >
                        Add stat
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default observer(FileUploadModal);
