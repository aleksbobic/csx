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
    Attribution,
    Carousel,
    ChevronRight,
    List,
    Moon,
    RadioCheck,
    Ratio,
    Ring,
    Sun,
    Sync
} from 'css.gg';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';

import { CameraIcon } from '@heroicons/react/24/solid';
import { useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import DataPanelComponent from '../datapanel/DataPanel.component';
import { isEnvFalse } from 'general.utils';

function NavigationPanelComponent() {
    const store = useContext(RootStoreContext);
    const { colorMode, toggleColorMode } = useColorMode();
    const { isOpen, onToggle } = useDisclosure();
    const [panelType, setPanelType] = useState('');
    const location = useLocation();
    const bgColor = useColorModeValue('white', 'black');
    const containerRef = useRef();
    const [timer, setTimer] = useState(null);

    const edgeColorDark =
        location.pathname !== '/' ? 'gray.900' : 'transparent';
    const edgeColorLight =
        location.pathname !== '/' ? 'gray.300' : 'transparent';

    const edgeColor = useColorModeValue(edgeColorLight, edgeColorDark);

    const graphUtilsMenuBackground = useColorModeValue(
        'whiteAlpha.800',
        'blackAlpha.700'
    );

    useEffect(() => {
        if (containerRef.current) {
            store.core.setRightPanelWidth(containerRef.current.offsetWidth);
        }
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            const setNewContainerSize = () => {
                store.core.setRightPanelWidth(containerRef.current.offsetWidth);
            };

            const handleResize = () => {
                clearTimeout(timer);
                setTimer(setTimeout(setNewContainerSize, 100));
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    });

    const regenerateGraph = () => {
        store.graph.modifyStudy(store.core.currentGraph);
    };

    const toggleDataPanel = panel => {
        if (panelType === panel || panelType === '' || !isOpen) {
            onToggle();
        }

        if (panelType === panel) {
            setPanelType('');
            store.core.setIsRightSidePanelOpen(false);
        } else {
            setPanelType(panel);
            store.core.setIsRightSidePanelOpen(true);
        }

        store.track.trackEvent(
            'Navbar',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `${isOpen ? 'Close' : 'Open'} ${panel} panel`
            })
        );
    };

    const toggleColor = () => {
        store.track.trackEvent(
            'Navbar',
            'Button',
            JSON.stringify({
                type: 'Click',
                value: `Change color mode to ${
                    colorMode === 'light' ? 'dark' : 'light'
                }`
            })
        );

        toggleColorMode();
        store.core.setColorMode(colorMode === 'light' ? 'dark' : 'light');
        store.graph.updateLinkColor(colorMode === 'light' ? 'dark' : 'light');
        store.graph.updateNodeColor(colorMode === 'light' ? 'dark' : 'light');
    };

    const renderGraphUtils = () => (
        <Box position="absolute" marginLeft="-105px" top="70px" id="graphutils">
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
                            store.track.trackEvent(
                                'Graph Area - Graph Controls',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: `Switch to ${
                                        store.core.currentGraph === 'detail'
                                            ? 'overview'
                                            : 'detail'
                                    } graph`
                                })
                            );

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
                                'Graph Area - Graph Controls',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Regenerate graph'
                                })
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
            backgroundColor={
                colorMode === 'light' ? 'whiteAlpha.900' : 'blackAlpha.600'
            }
            borderRadius="10px"
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.300' : 'transparent'}
            padding="10px"
        >
            {store.graphInstance.hoverData.map((entry, index) => (
                <Box width="100%" key={`hover_data_${index}`}>
                    <Text
                        fontSize="xs"
                        color={
                            colorMode === 'light'
                                ? 'blackAlpha.800'
                                : 'gray.400'
                        }
                        fontWeight="bold"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                    >
                        {entry.feature}:{' '}
                    </Text>
                    <Text
                        fontSize="sm"
                        color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
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
            bottom="20px"
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
                        icon={<CameraIcon style={{ width: '16px' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'Graph Area - View Controls',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Take screenshot'
                                })
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
                        icon={<Ratio style={{ '--ggs': '0.8' }} />}
                        onClick={() => {
                            store.track.trackEvent(
                                'Graph Area - View Controls',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Zoom to fit'
                                })
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
            <Tooltip label="Search workspace">
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
            borderColor={
                location.pathname !== '/present' ? edgeColor : 'transparent'
            }
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
                            onClick={() => {
                                toggleDataPanel('details');
                            }}
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
                            onClick={() => {
                                toggleDataPanel('results');
                            }}
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
                            onClick={() => {
                                toggleDataPanel('schema');
                            }}
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
                            onClick={() => {
                                toggleDataPanel('history');
                            }}
                            icon={
                                <Carousel
                                    style={{
                                        '--ggs': '0.7',
                                        transform:
                                            'rotate(180deg) scale(0.7, 0.8)'
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
                zIndex="20"
                height="50px"
                backgroundColor={
                    location.pathname !== '/' &&
                    location.pathname !== '/present'
                        ? bgColor
                        : 'transparent'
                }
                right="0px"
                width="100%"
                paddingRight="15px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom="1px solid"
                borderColor={
                    location.pathname !== '/present' ? edgeColor : 'transparent'
                }
            >
                <HStack spacing="10px">
                    <Link
                        as={NavLink}
                        to="/"
                        paddingRight="5px"
                        paddingLeft="5px"
                        borderRight="1px solid"
                        borderColor={
                            location.pathname !== '/present'
                                ? edgeColor
                                : 'transparent'
                        }
                        id="homelink"
                        onClick={() => {
                            store.core.deleteStudy();

                            store.track.trackEvent(
                                'Navbar',
                                'Button - Logo',
                                JSON.stringify({
                                    type: 'Click'
                                })
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

                    {location.pathname !== '/' &&
                        location.pathname !== '/present' &&
                        isEnvFalse('REACT_APP_DISABLE_ADVANCED_SEARCH') &&
                        renderWorkspaceSwitch()}
                    {location.pathname !== '/' &&
                        location.pathname !== '/present' && (
                            <HStack
                                height="40px"
                                style={{
                                    marginLeft: isEnvFalse(
                                        'REACT_APP_DISABLE_ADVANCED_SEARCH'
                                    )
                                        ? '125px'
                                        : '0'
                                }}
                                spacing="20px"
                            >
                                {isEnvFalse(
                                    'REACT_APP_DISABLE_ADVANCED_SEARCH'
                                ) && (
                                    <Divider
                                        opacity="0.4"
                                        orientation="vertical"
                                        height="100%"
                                        backgroundColor="gray.900"
                                    />
                                )}
                                <Breadcrumb
                                    marginLeft="20px"
                                    spacing="2px"
                                    separator={
                                        <ChevronRight
                                            style={{ '--ggs': '0.5' }}
                                        />
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
                                                store.graph.modifyStudy(
                                                    'overview'
                                                );
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
                    ref={containerRef}
                    width={{ base: '500px', lg: '500px', xl: '600px' }}
                    right={{
                        base: isOpen ? '0px' : '-500px',
                        lg: isOpen ? '0px' : '-500px',
                        xl: isOpen ? '0px' : '-600px'
                    }}
                    style={{
                        zIndex: 10,

                        position: 'fixed',
                        top: 0,
                        height: '100%',
                        paddingTop: '50px'
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
