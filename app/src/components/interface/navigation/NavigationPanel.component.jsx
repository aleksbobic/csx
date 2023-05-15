import {
    Box,
    ButtonGroup,
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
    List,
    Moon,
    RadioCheck,
    Ring,
    Search,
    Sun
} from 'css.gg';
import { isEnvFalse } from 'general.utils';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';

import { PresentationChartLineIcon } from '@heroicons/react/20/solid';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import RightPanel from '../rightpanel/RightPanel.component';

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

    useEffect(() => {
        if (containerRef.current) {
            store.core.setRightPanelWidth(containerRef.current.offsetWidth);
        }
    }, [store.core]);

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

    const toggleDataPanel = useCallback(
        panel => {
            if (panelType === panel || panelType === '' || !isOpen) {
                onToggle();
            }

            if (panelType === panel) {
                setPanelType('');
                store.core.setRightPanelType(panel);
                store.core.setIsRightSidePanelOpen(false);
            } else {
                setPanelType(panel);
                store.core.setRightPanelType(panel);
                store.core.setIsRightSidePanelOpen(true);
            }

            store.track.trackEvent(
                JSON.stringify({
                    area: 'Navbar'
                }),
                JSON.stringify({
                    item_type: 'Button'
                }),
                JSON.stringify({
                    event_type: 'Click',
                    event_action: `${isOpen ? 'Close' : 'Open'} panel`,
                    event_value: panel
                })
            );
        },
        [isOpen, onToggle, panelType, store.core, store.track]
    );

    useEffect(() => {
        if (store.core.rightPanelTypeToOpen) {
            toggleDataPanel(store.core.rightPanelTypeToOpen);
            store.core.setRightPanelTypeToOpen(null);
        }
    }, [store.core.rightPanelTypeToOpen, toggleDataPanel, store.core]);

    const toggleColor = () => {
        toggleColorMode();
        store.core.setColorMode(colorMode === 'light' ? 'dark' : 'light');
        store.graph.updateLinkColor(colorMode === 'light' ? 'dark' : 'light');
        store.graph.updateNodeColor(colorMode === 'light' ? 'dark' : 'light');
    };

    const renderGraphUtils = () => (
        <Box position="absolute" marginLeft="-65px" top="70px" id="graphutils">
            <HStack
                spacing="10px"
                backgroundColor="transparent"
                padding="5px 6px"
                borderRadius="8px"
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
                                JSON.stringify({
                                    area: 'Graph area',
                                    sub_area: 'Graph controls'
                                }),
                                JSON.stringify({
                                    item_type: 'Button'
                                }),
                                JSON.stringify({
                                    event_type: 'Click',
                                    event_action: `Switch to ${
                                        store.core.currentGraph === 'detail'
                                            ? 'overview'
                                            : 'detail'
                                    } graph`
                                })
                            );

                            store.graphInstance.setEdgeColorScheme('auto');

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
            </HStack>
        </Box>
    );

    const renderHoverData = () => (
        <VStack
            alignItems="flex-start"
            position="absolute"
            bottom="0px"
            right="20px"
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
        <Box position="absolute" bottom="20px" id="viewutils">
            {store.graphInstance.hoverData.length > 0 &&
                store.core.isOverview &&
                renderHoverData()}
        </Box>
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
                    {isEnvFalse('REACT_APP_DISABLE_ADVANCED_SEARCH') && (
                        <Tooltip label="Toggle search panel">
                            <IconButton
                                border="none"
                                aria-label="Search panel toggle"
                                id="searchpnaletoggle"
                                color={
                                    panelType === 'search'
                                        ? 'blue.400'
                                        : colorMode === 'light'
                                        ? 'black'
                                        : 'white'
                                }
                                borderRadius="10px"
                                background={
                                    panelType === 'search'
                                        ? 'whiteAlpha.200'
                                        : ''
                                }
                                onClick={() => {
                                    toggleDataPanel('search');
                                }}
                                icon={
                                    <Search
                                        style={{
                                            '--ggs': '0.7',
                                            marginBottom: '-2px'
                                        }}
                                    />
                                }
                            />
                        </Tooltip>
                    )}
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
                            borderRadius="10px"
                            background={
                                panelType === 'details' ? 'whiteAlpha.200' : ''
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
                            borderRadius="10px"
                            background={
                                panelType === 'results' ? 'whiteAlpha.200' : ''
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
                            borderRadius="10px"
                            background={
                                panelType === 'schema' ? 'whiteAlpha.200' : ''
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
                            borderRadius="10px"
                            background={
                                panelType === 'history' ? 'whiteAlpha.200' : ''
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

            {location.pathname === '/doesnotexist' && (
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
            )}
        </ButtonGroup>
    );

    return (
        <>
            <Box
                id="navigation"
                pos="fixed"
                zIndex="20"
                height="60px"
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
                    {location.pathname !== '/present' && (
                        <Link
                            as={NavLink}
                            to="/"
                            paddingRight="10px"
                            paddingLeft="10px"
                            borderRight="1px solid"
                            borderColor={
                                location.pathname !== '/present'
                                    ? edgeColor
                                    : 'transparent'
                            }
                            id="homelink"
                            onClick={() => {
                                store.core.deleteStudy();
                                store.core.setStudyIsEmpty(false);
                                store.search.setSearchIsEmpty(false);
                                store.core.setShowCookieInfo(false);

                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Navbar'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Logo'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Click',
                                        event_action: 'Navigate home'
                                    })
                                );
                            }}
                        >
                            <Image
                                src={logo}
                                alt="Collaboration spotting X logo"
                                height="40px"
                                padding="10px"
                            />
                        </Link>
                    )}
                </HStack>
                <HStack spacing="20px">
                    {location.pathname.startsWith('/graph') && (
                        <Tooltip label="Open presentation mode in new tab">
                            <IconButton
                                size="sm"
                                width="40px"
                                height="40px"
                                as={Link}
                                isDisabled={!store.core.studyIsSaved}
                                variant="ghost"
                                borderRadius="10px"
                                id="presentationmode"
                                icon={
                                    <PresentationChartLineIcon
                                        width="16px"
                                        height="16px"
                                        display="inline"
                                    />
                                }
                                onClick={e => {
                                    if (!store.core.studyIsSaved) {
                                        e.preventDefault();
                                    }

                                    store.track.trackEvent(
                                        JSON.stringify({
                                            area: 'Navbar'
                                        }),
                                        JSON.stringify({
                                            item_type: 'Button'
                                        }),
                                        JSON.stringify({
                                            event_type: 'Click',
                                            event_action:
                                                'Open study presentation mode'
                                        })
                                    );
                                }}
                                transition="0.2s all ease-in-out"
                                href={
                                    store.core.studyIsSaved
                                        ? `http://localhost:8882/present?study=${store.core.studyUuid}`
                                        : ''
                                }
                                isExternal
                                _hover={{
                                    textDecoration: 'none',
                                    backgroundColor: 'blue.500'
                                }}
                            />
                        </Tooltip>
                    )}
                    {renderToggles()}
                </HStack>
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
                        paddingTop: '60px'
                    }}
                >
                    {renderGraphUtils()}
                    {renderViewUtils()}
                    <RightPanel panelType={panelType} />
                </Box>
            )}
        </>
    );
}

export default observer(NavigationPanelComponent);
