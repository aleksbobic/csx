import {
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Slide,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tag,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import SettingsComponent from 'components/feature/settings/Settings.component';
import {
    ChevronDoubleLeft,
    ChevronDoubleRight,
    Controller,
    DisplayFullwidth,
    EditStraight,
    Eye,
    FormatSeparator,
    Info,
    LayoutPin,
    LivePhoto,
    MediaLive,
    PathDivide,
    PathIntersect,
    RadioChecked
} from 'css.gg';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import queryString from 'query-string';
import { schemeYlOrRd } from 'd3-scale-chromatic';
import StudyInfoComponent from 'components/feature/studyinfo/StudyInfo.component';

function ControlPanel() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onToggle } = useDisclosure();
    const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
    const tabListbgColor = useColorModeValue('white', 'black');
    const tabInactiveColors = useColorModeValue('black', 'white');
    const tabBorderColor = useColorModeValue('white', 'black');
    const edgeColor = useColorModeValue('gray.300', 'gray.900');
    const [originNodeExists, setOriginNodeExists] = useState(false);
    const location = useLocation();

    const selfCentricMenuBackground = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    const legendBackgroundColor = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    const legendBorderColor = useColorModeValue('gray.100', 'gray.900');

    const toggleControlPanel = () => {
        onToggle();

        store.track.trackEvent(
            'controls panel',
            'button click',
            `${isOpen ? 'open' : 'close'} controls panel`
        );
    };

    const openSliderIfClosed = () => {
        if (!isOpen) {
            onOpen();
        }
    };

    const renderColorLegend = () => {
        const selectedColorScheme =
            store.graphInstance.nodeColorScheme[store.core.currentGraph];

        let legendItems = Object.keys(
            store.graphInstance.nodeColorSchemeColors[store.core.currentGraph][
                selectedColorScheme
            ]
        );

        if (
            ['integer', 'float'].includes(
                store.search.nodeTypes[
                    store.graphInstance.nodeColorScheme[store.core.currentGraph]
                ]
            )
        ) {
            return (
                <Flex
                    id="colorscheme"
                    position="absolute"
                    bottom="70px"
                    left="320px"
                    maxWidth="300px"
                    zIndex={2}
                    backgroundColor={legendBackgroundColor}
                    padding="10px"
                    borderRadius="4px"
                    maxHeight="300px"
                    overflowY="scroll"
                >
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        position="absolute"
                        left="15px"
                        color="blackAlpha.700"
                    >
                        {legendItems[0]}
                    </Text>
                    <Text
                        fontSize="xs"
                        fontWeight="bold"
                        position="absolute"
                        right="15px"
                    >
                        {legendItems[legendItems.length - 1]}
                    </Text>
                    <Box
                        width="300px"
                        height="20px"
                        borderRadius="2px"
                        bgGradient={`linear(to-r, ${String(schemeYlOrRd[9])})`}
                    />
                </Flex>
            );
        }

        if (selectedColorScheme === 'type') {
            legendItems = legendItems.filter(key =>
                store.graph.detailGraphData.perspectivesInGraph.includes(key)
            );
        }

        const legend = legendItems.map(key => {
            return (
                <HStack width="100%" key={key}>
                    <Tag
                        size="sm"
                        borderRadius="full"
                        variant="solid"
                        backgroundColor={
                            store.graphInstance.nodeColorSchemeColors[
                                store.core.currentGraph
                            ][selectedColorScheme][key]
                        }
                    />
                    <Text
                        size="sm"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                    >
                        {key}
                    </Text>
                </HStack>
            );
        });

        if (legend.length === 0) {
            return null;
        }

        return (
            <Flex
                id="colorscheme"
                position="absolute"
                bottom="70px"
                left="320px"
                maxWidth="200px"
                zIndex={2}
                backgroundColor={legendBackgroundColor}
                padding="10px"
                borderRadius="10px"
                border="1px solid"
                borderColor={legendBorderColor}
                maxHeight="300px"
                overflowY="scroll"
            >
                <VStack width="100%" paddingBottom="10px">
                    {legend}
                </VStack>
            </Flex>
        );
    };

    useEffect(() => {
        setOriginNodeExists(
            store.graph.currentGraphData.selectedNodes.length < 2 ||
                !store.graphInstance.selfCentricOriginNode
        );
    }, [
        store.graph.currentGraphData.selectedNodes.length,
        store.graph.currentGraphData.selectedNodes,
        store.graphInstance.selfCentricOriginNode
    ]);

    useEffect(() => {
        onOpen();
    }, [onOpen]);

    const getQueryString = param => queryString.parse(location.search)[param];

    const expandGraph = connector => {
        store.graph.expandNetwork(
            store.graph.currentGraphData.selectedNodes,
            getQueryString('suuid'),
            connector
        );
        store.contextMenu.hideContextMenu();
    };

    const renderNetworkModificationMenu = () => (
        <HStack
            id="networkmodificationmenu"
            position="absolute"
            bottom="20px"
            left="320px"
            zIndex={20}
            spacing="2"
            backgroundColor={selfCentricMenuBackground}
            padding="5px 6px"
            borderRadius="8px"
        >
            <HStack spacing="1">
                <Tooltip label="Trim network">
                    <IconButton
                        borderRadius="6px"
                        id="trimnetworkbutton"
                        size="sm"
                        icon={<EditStraight style={{ '--ggs': '0.6' }} />}
                        onClick={() => {
                            store.graph.trimNetwork();
                        }}
                    />
                </Tooltip>
                <Menu style={{ zIndex: 40 }}>
                    <Tooltip label="Expand network">
                        <MenuButton
                            disabled={
                                !store.graph.currentGraphData.selectedNodes
                                    .length
                            }
                            as={IconButton}
                            borderRadius="6px"
                            id="trimnetworkbutton"
                            size="sm"
                            icon={<Controller style={{ '--ggs': '0.6' }} />}
                        />
                    </Tooltip>
                    <MenuList
                        backgroundColor="black"
                        padding="5px"
                        borderRadius="10px"
                    >
                        <MenuItem
                            fontSize="xs"
                            fontWeight="bold"
                            borderRadius="6px"
                            onClick={() => expandGraph('or')}
                        >
                            Wide Expand
                        </MenuItem>
                        <MenuItem
                            fontSize="xs"
                            fontWeight="bold"
                            borderRadius="6px"
                            onClick={() => expandGraph('and')}
                        >
                            Narrow Expand
                        </MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </HStack>
    );

    const renderDirectConnectionsMenu = () => (
        <HStack
            id="directconnectionsmenu"
            position="absolute"
            top="20px"
            left="320px"
            zIndex={20}
            spacing="2"
            backgroundColor={selfCentricMenuBackground}
            padding="5px 6px"
            borderRadius="8px"
        >
            <HStack spacing="1">
                <Tooltip label="Show all nodes">
                    <Button
                        borderRadius="6px"
                        id="closedirectconnections"
                        size="sm"
                        icon={<MediaLive style={{ '--ggs': '0.6' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'hide direct connections'
                            );
                            store.graphInstance.toggleVisibleComponents(-1);
                            store.graphInstance.resetSelfCentric();
                        }}
                    >
                        Show all
                    </Button>
                </Tooltip>
                <Tooltip label="Show selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="selectednodes"
                        isDisabled={
                            !store.graph.currentGraphData.selectedNodes.length
                        }
                        size="sm"
                        icon={<RadioChecked style={{ '--ggs': '0.6' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show selected nodes'
                            );
                            store.graphInstance.triggerSelectedNodes();
                        }}
                    />
                </Tooltip>

                <Tooltip label="Show nodes with same entries as origin node">
                    <IconButton
                        borderRadius="6px"
                        id="mutualentriesoriginbutton"
                        isDisabled={!store.graphInstance.selfCentricOriginNode}
                        size="sm"
                        style={{
                            paddingTop: '5px'
                        }}
                        icon={<FormatSeparator style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show nodes with same entries as context node'
                            );
                            store.graphInstance.triggerSameEntry();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show nodes with same entries as all selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="mutualentriesoriginbutton"
                        isDisabled={
                            store.graph.currentGraphData.selectedNodes.length <
                            2
                        }
                        size="sm"
                        style={{
                            paddingTop: '1px'
                        }}
                        icon={<DisplayFullwidth style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show nodes with same entries as context node'
                            );
                            store.graphInstance.triggerSameEntry(true);
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show direct connections of selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="alldirectconnections"
                        isDisabled={
                            store.graph.currentGraphData.selectedNodes.length <
                            1
                        }
                        size="sm"
                        icon={<PathDivide style={{ '--ggs': '0.8' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show union of direct all connections'
                            );
                            store.graphInstance.triggerMultiSelfCentric();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show mutual connections of selected nodes">
                    <IconButton
                        borderRadius="6px"
                        id="mutualconnectionsbutton"
                        isDisabled={
                            store.graph.currentGraphData.selectedNodes.length <
                            2
                        }
                        size="sm"
                        icon={<PathIntersect style={{ '--ggs': '0.8' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show intersection of direct connections'
                            );
                            store.graphInstance.triggerMultiSelfCentric(true);
                        }}
                    />
                </Tooltip>
            </HStack>
            <Divider
                orientation="vertical"
                style={{
                    height: '26px',
                    width: '1px'
                }}
            />
            <HStack spacing="1">
                <Tooltip label="Show direct connections of origin node">
                    <IconButton
                        borderRadius="6px"
                        id="directconnections"
                        isDisabled={originNodeExists}
                        size="sm"
                        icon={<LivePhoto style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show direct connections of origin node'
                            );
                            store.graphInstance.triggerSelfCentric();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Show mutual connections with origin node">
                    <IconButton
                        borderRadius="6px"
                        id="mutualconnectionsoriginbutton"
                        isDisabled={originNodeExists}
                        size="sm"
                        icon={<LayoutPin style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'direct connections menu',
                                'button click',
                                'show intersection of direct connections with origin node'
                            );
                            store.graphInstance.triggerMultiSelfCentric(
                                true,
                                true
                            );
                        }}
                    />
                </Tooltip>
            </HStack>
        </HStack>
    );
    return (
        <Box
            minW="50px"
            maxW="300px"
            borderRight="1px solid"
            borderColor={edgeColor}
            position="fixed"
            left="0px"
            height="100%"
            zIndex="2"
            marginTop="50px"
            id="controlpanel"
        >
            <Tabs
                variant="line"
                orientation="vertical"
                colorScheme="blue"
                height="100%"
                borderColor={tabBorderColor}
                isLazy
            >
                <TabList
                    position="absolute"
                    top="0"
                    width="50px"
                    height="100%"
                    zIndex="2"
                    bgColor={tabListbgColor}
                >
                    <Tooltip label={isOpen ? 'Minimize' : 'Maximize'}>
                        <IconButton
                            borderRadius="0"
                            variant="link"
                            width="50px"
                            height="50px"
                            color={tabInactiveColors}
                            onClick={toggleControlPanel}
                            icon={
                                isOpen ? (
                                    <ChevronDoubleLeft />
                                ) : (
                                    <ChevronDoubleRight />
                                )
                            }
                        />
                    </Tooltip>
                    <Tab
                        width="50px"
                        height="50px"
                        onClick={() => {
                            openSliderIfClosed();
                            store.track.trackEvent(
                                'controls panel',
                                'button click',
                                'show study info'
                            );
                        }}
                        padding="8px"
                        style={
                            isOpen
                                ? {}
                                : {
                                      color: tabInactiveColors,
                                      borderColor: 'transparent'
                                  }
                        }
                    >
                        <Tooltip label="Study info">
                            <Box
                                id="viewsettingstab"
                                width="100%"
                                height="100%"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Info />
                            </Box>
                        </Tooltip>
                    </Tab>
                    <Tab
                        width="50px"
                        height="50px"
                        onClick={() => {
                            openSliderIfClosed();
                            store.track.trackEvent(
                                'controls panel',
                                'button click',
                                'show view controls'
                            );
                        }}
                        padding="8px"
                        style={
                            isOpen
                                ? {}
                                : {
                                      color: tabInactiveColors,
                                      borderColor: 'transparent'
                                  }
                        }
                    >
                        <Tooltip label="View settings">
                            <Box
                                id="viewsettingstab"
                                width="100%"
                                height="100%"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Eye />
                            </Box>
                        </Tooltip>
                    </Tab>
                </TabList>
                <Slide
                    direction="left"
                    id="controlpanelslide"
                    in={isOpen}
                    position="fixed"
                    left="50px"
                    style={{
                        position: 'fixed',
                        width: '250px',
                        bottom: '0px',
                        marginTop: '50px'
                    }}
                >
                    <TabPanels
                        width="250px"
                        height="100%"
                        marginLeft="50px"
                        bgColor={bgColor}
                        borderRight="1px solid"
                        borderColor={edgeColor}
                        position="relative"
                    >
                        <TabPanel
                            width="250px"
                            overflowY="scroll"
                            height="100%"
                        >
                            <StudyInfoComponent />
                        </TabPanel>
                        <TabPanel
                            width="250px"
                            overflowY="scroll"
                            height="100%"
                        >
                            <SettingsComponent />
                        </TabPanel>
                    </TabPanels>

                    {renderDirectConnectionsMenu()}
                    {renderNetworkModificationMenu()}

                    {store.core.currentGraph &&
                        !['none', 'component'].includes(
                            store.graphInstance.selectedColorSchema
                        ) &&
                        renderColorLegend()}
                </Slide>
            </Tabs>
        </Box>
    );
}

export default observer(ControlPanel);
