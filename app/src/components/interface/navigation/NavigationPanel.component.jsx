import {
    Box,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    Button,
    ButtonGroup,
    Divider,
    HStack,
    IconButton,
    Image,
    Link,
    Text,
    Tooltip,
    useColorMode,
    useColorModeValue,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import {
    AlignBottom,
    Assign,
    Attribution,
    ChevronRight,
    Comment,
    List,
    Moon,
    RadioCheck,
    Ratio,
    Ring,
    Stopwatch,
    Sun,
    Sync
} from 'css.gg';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';

import { useContext, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import DataPanelComponent from '../datapanel/DataPanel.component';

function NavigationPanelComponent() {
    const store = useContext(RootStoreContext);
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onToggle } = useDisclosure();
    const [panelType, setPanelType] = useState('');
    const location = useLocation();
    const bgColor = useColorModeValue('white', 'black');

    const edgeColorDark =
        location.pathname !== '/' ? 'gray.900' : 'transparent';
    const edgeColorLight =
        location.pathname !== '/' ? 'gray.300' : 'transparent';

    const edgeColor = useColorModeValue(edgeColorLight, edgeColorDark);

    const graphUtilsMenuBackground = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    const regenerateGraph = () => {
        // store.graph.getSearchGraph(
        //     store.graph.currentGraphData.meta.query,
        //     location.pathname.startsWith('/graph/detail')
        //         ? 'detail'
        //         : 'overview',
        //     queryString.parse(location.search).suuid
        // );

        store.graph.modifyStudy(store.core.currentGraph);
    };

    const toggleDataPanel = panel => {
        if (panelType === panel || panelType === '' || !isOpen) {
            onToggle();
        }

        if (panelType === panel) {
            setPanelType('');
        } else {
            setPanelType(panel);
        }

        store.track.trackEvent(
            'navbar',
            'button click',
            `${panel} panel ${isOpen ? 'off' : 'on'}`
        );
    };

    const toggleColor = () => {
        store.track.trackEvent(
            'navbar',
            'button click',
            `color mode ${colorMode === 'light' ? 'dark' : 'light'}`
        );
        toggleColorMode();
    };

    const renderGraphUtils = () => (
        <Box position="absolute" marginLeft="-105px" top="20px" id="graphutils">
            <HStack
                spacing="10px"
                backgroundColor={
                    colorMode === 'light' ? '#ffffff' : graphUtilsMenuBackground
                }
                padding="5px 6px"
                borderRadius="8px"
                border={colorMode === 'light' ? '1px solid #CBD5E0' : 'none'}
            >
                <Tooltip
                    label={
                        store.core.currentGraph === 'detail'
                            ? 'View overview graph'
                            : 'View detail graph'
                    }
                >
                    <IconButton
                        id="switchgraphviewbutton"
                        size="sm"
                        border="none"
                        aria-label="Switch graph view"
                        onClick={() => {
                            store.graph.modifyStudy(
                                store.core.currentGraph === 'detail'
                                    ? 'overview'
                                    : 'detail'
                            );
                        }}
                        icon={
                            store.core.currentGraph === 'detail' ? (
                                <RadioCheck
                                    style={{
                                        '--ggs': '0.68'
                                    }}
                                />
                            ) : (
                                <Ring style={{ '--ggs': '0.7' }} />
                            )
                        }
                    />
                </Tooltip>
                <Tooltip label="Regenerate graph">
                    <IconButton
                        id="regenerategraphbutton"
                        size="sm"
                        border="none"
                        disabled={store.search.links.length === 0}
                        aria-label="Regenerate graph"
                        icon={<Sync style={{ '--ggs': '0.7' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'graph utils',
                                'button click',
                                'regenerate graph'
                            );
                            regenerateGraph();
                        }}
                    />
                </Tooltip>
            </HStack>
        </Box>
    );

    const renderHoverData = () => (
        <VStack
            alignItems="flex-start"
            position="absolute"
            bottom="50px"
            right="0px"
            width="200px"
            spacing="5px"
            backgroundColor="blackAlpha.600"
            borderRadius="10px"
            padding="10px"
        >
            {store.graphInstance.hoverData.map((entry, index) => (
                <Box width="100%" key={`hover_data_${index}`}>
                    <Text
                        fontSize="xs"
                        color="gray.400"
                        fontWeight="bold"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {entry.feature}:{' '}
                    </Text>
                    <Text
                        fontSize="sm"
                        color="gray.200"
                        fontWeight="bold"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {entry.label}
                    </Text>
                </Box>
            ))}
        </VStack>
    );

    const renderViewUtils = () => (
        <Box
            position="absolute"
            marginLeft="-100px"
            bottom="75px"
            id="viewutils"
        >
            {store.graphInstance.hoverData.length > 0 &&
                store.core.isOverview &&
                renderHoverData()}
            <HStack spacing="10px">
                <Tooltip label="Make Screenshot">
                    <IconButton
                        size="sm"
                        border="none"
                        aria-label="Make Screenshot"
                        icon={<Ratio />}
                        onClick={() => {
                            store.track.trackEvent(
                                'view utils',
                                'button click',
                                'take screenshot'
                            );
                            store.graphInstance.takeScreenshot();
                        }}
                    />
                </Tooltip>
                <Tooltip label="Zoom to fit">
                    <IconButton
                        id="zoomtofitbutton"
                        size="sm"
                        border="none"
                        aria-label="Zoom to fit"
                        icon={<Assign />}
                        onClick={() => {
                            store.track.trackEvent(
                                'view utils',
                                'button click',
                                'zoom to fit'
                            );
                            store.graphInstance.zoomToFit();
                        }}
                    />
                </Tooltip>
            </HStack>
        </Box>
    );

    const renderWorkspaceSwitch = () => (
        <ButtonGroup size="xs" isAttached>
            <Tooltip label="Retrieval workspace">
                <Button
                    variant={
                        location.pathname === '/search' ? 'solid' : 'outline'
                    }
                    as={NavLink}
                    to={`/search?study=${store.core.studyUuid}`}
                    border="1px solid transparent"
                    opacity={location.pathname === '/search' ? '1' : '0.5'}
                >
                    Search
                </Button>
            </Tooltip>
            <Tooltip label="Graph analysis workspace">
                <Button
                    variant={
                        location.pathname === '/graph' ? 'solid' : 'outline'
                    }
                    border="1px solid transparent"
                    as={NavLink}
                    to={`/graph?study=${store.core.studyUuid}`}
                    opacity={
                        location.pathname.startsWith('/graph') ? '1' : '0.5'
                    }
                    style={{
                        pointerEvents: !store.graph.currentGraphData.nodes
                            .length
                            ? 'none'
                            : 'auto'
                    }}
                >
                    Graph
                </Button>
            </Tooltip>
        </ButtonGroup>
    );

    const renderToggles = () => (
        <ButtonGroup
            variant="outline"
            size="md"
            display="flex"
            alignItems="center"
            height="100%"
            borderLeft="1px solid"
            paddingLeft="10px"
            borderColor={edgeColor}
        >
            {location.pathname.startsWith('/graph') && (
                <ButtonGroup
                    variant="outline"
                    size="md"
                    display="flex"
                    alignItems="center"
                    height="100%"
                    borderRight="1px solid"
                    paddingRight="10px"
                    borderColor={edgeColor}
                >
                    <Tooltip label="Toggle details panel">
                        <IconButton
                            border="none"
                            aria-label="Details panel toggle"
                            id="detailspnaletoggle"
                            color={
                                panelType === 'details'
                                    ? 'blue.400'
                                    : colorMode === 'light'
                                    ? 'black'
                                    : 'white'
                            }
                            onClick={() => toggleDataPanel('details')}
                            icon={
                                <AlignBottom
                                    style={{
                                        '--ggs': '0.8'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                    <Tooltip label="Toggle results panel">
                        <IconButton
                            border="none"
                            aria-label="Results panel toggle"
                            id="resultspnaletoggle"
                            color={
                                panelType === 'results'
                                    ? 'blue.400'
                                    : colorMode === 'light'
                                    ? 'black'
                                    : 'white'
                            }
                            onClick={() => toggleDataPanel('results')}
                            icon={
                                <List
                                    style={{
                                        '--ggs': '0.7'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                    <Tooltip label="Toggle schema panel">
                        <IconButton
                            border="none"
                            aria-label="Schema panel toggle"
                            id="schemapnaletoggle"
                            color={
                                panelType === 'schema'
                                    ? 'blue.400'
                                    : colorMode === 'light'
                                    ? 'black'
                                    : 'white'
                            }
                            onClick={() => toggleDataPanel('schema')}
                            icon={
                                <Attribution
                                    style={{
                                        '--ggs': '0.8'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                    <Tooltip label="Toggle history panel">
                        <IconButton
                            border="none"
                            aria-label="History panel toggle"
                            id="historypnaletoggle"
                            color={
                                panelType === 'history'
                                    ? 'blue.400'
                                    : colorMode === 'light'
                                    ? 'black'
                                    : 'white'
                            }
                            onClick={() => toggleDataPanel('history')}
                            icon={
                                <Stopwatch
                                    style={{
                                        '--ggs': '0.7'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                    <Tooltip label="Toggle comment panel">
                        <IconButton
                            border="none"
                            aria-label="Commnet panel toggle"
                            id="commnetpnaletoggle"
                            color={
                                panelType === 'comment'
                                    ? 'blue.400'
                                    : colorMode === 'light'
                                    ? 'black'
                                    : 'white'
                            }
                            onClick={() => toggleDataPanel('comment')}
                            icon={
                                <Comment
                                    style={{
                                        '--ggs': '0.7'
                                    }}
                                />
                            }
                        />
                    </Tooltip>
                </ButtonGroup>
            )}

            <Tooltip label="Toggle color mode">
                <IconButton
                    border="none"
                    aria-label="Color mode"
                    icon={
                        colorMode === 'light' ? (
                            <Moon
                                style={{
                                    '--ggs': '0.8'
                                }}
                            />
                        ) : (
                            <Sun
                                style={{
                                    '--ggs': '0.8'
                                }}
                            />
                        )
                    }
                    onClick={toggleColor}
                />
            </Tooltip>
        </ButtonGroup>
    );

    return (
        <>
            <Box
                id="navigation"
                pos="fixed"
                zIndex="5"
                height="50px"
                backgroundColor={
                    location.pathname !== '/' ? bgColor : 'transparent'
                }
                right="0px"
                width="100%"
                paddingRight="15px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid"
                borderColor={edgeColor}
            >
                <HStack spacing="10px">
                    <Link
                        as={NavLink}
                        to="/"
                        paddingRight="5px"
                        paddingLeft="5px"
                        borderRight="1px solid"
                        borderColor={edgeColor}
                        id="homelink"
                        onClick={() => {
                            store.core.deleteStudy();
                            store.track.trackEvent(
                                'navbar',
                                'button click',
                                'logo'
                            );
                        }}
                    >
                        <Image
                            src={logo}
                            alt="Collaboration spotting logo"
                            height="40px"
                            padding="10px"
                        />
                    </Link>

                    {location.pathname !== '/' && renderWorkspaceSwitch()}
                    {location.pathname !== '/' && (
                        <HStack
                            height="40px"
                            style={{ marginLeft: '125px' }}
                            spacing="20px"
                        >
                            <Divider
                                opacity="0.4"
                                orientation="vertical"
                                height="100%"
                                backgroundColor="gray.900"
                            />
                            <Breadcrumb
                                marginLeft="20px"
                                spacing="2px"
                                separator={
                                    <ChevronRight style={{ '--ggs': '0.5' }} />
                                }
                            >
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        as={NavLink}
                                        to="/"
                                        fontSize="xs"
                                        fontWeight="regular"
                                    >
                                        {store?.search?.currentDataset?.toUpperCase()}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        as={Button}
                                        onClick={() => {
                                            store.graph.modifyStudy('overview');
                                        }}
                                        disabled={
                                            store.core.currentGraph ===
                                            'overview'
                                        }
                                        size="xs"
                                        variant="ghost"
                                        _hover={{
                                            backgroundColor: 'transparent',
                                            textDecoration:
                                                store.core.currentGraph ===
                                                'detail'
                                                    ? 'underline'
                                                    : 'none',
                                            cursor:
                                                store.core.currentGraph ===
                                                'detail'
                                                    ? 'pointer'
                                                    : 'default'
                                        }}
                                        _disabled={{ opacity: '1' }}
                                    >
                                        Graph
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {store.core.currentGraph === 'detail' && (
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            as={Text}
                                            fontSize="xs"
                                            fontWeight="bold"
                                            _hover={{ cursor: 'default' }}
                                        >
                                            Detail
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                )}
                            </Breadcrumb>
                        </HStack>
                    )}
                </HStack>
                {renderToggles()}
            </Box>
            {location.pathname.startsWith('/graph') && (
                <Box
                    style={{
                        zIndex: 10,
                        right: isOpen ? '0px' : '-35%',
                        width: '35%',
                        position: 'fixed',
                        top: '50px',
                        height: '100%'
                    }}
                >
                    {renderGraphUtils()}
                    {renderViewUtils()}
                    <DataPanelComponent panelType={panelType} />
                </Box>
            )}
        </>
    );
}

export default observer(NavigationPanelComponent);
