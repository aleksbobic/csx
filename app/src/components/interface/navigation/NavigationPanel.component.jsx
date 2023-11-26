import {
    Box,
    ButtonGroup,
    HStack,
    IconButton,
    Button,
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
    ChartBarIcon,
    BeakerIcon,
    ClockIcon,
    MoonIcon,
    SunIcon,
    ListBulletIcon,
    MapPinIcon,
    MapIcon,
    FaceSmileIcon,
    MagnifyingGlassIcon,
    SquaresPlusIcon
} from '@heroicons/react/24/outline';
import { isEnvFalse } from 'general.utils';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';
import { isEnvSet } from 'general.utils';

import { PresentationChartLineIcon } from '@heroicons/react/20/solid';

import { NewspaperIcon } from '@heroicons/react/24/outline';
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

    const getSurveyLink = () => {
        return `${isEnvSet('REACT_APP_SURVEY_LINK')}&${isEnvSet(
            'REACT_APP_SURVEY_LINK_USER_ID'
        )}=${store.core.userUuid}`;
    };

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
        <Box
            position="absolute"
            marginLeft={
                store.search.datasetTypes[store.search.currentDataset] === 'api'
                    ? '-205px'
                    : '-55px'
            }
            top="70px"
            id="graphutils"
        >
            <HStack
                spacing="10px"
                backgroundColor="transparent"
                padding="5px 6px"
                borderRadius="8px"
            >
                {store.search.datasetTypes[store.search.currentDataset] ===
                    'api' && (
                    <Tooltip label="Get more data using the last expansion action">
                        <Button
                            id="repeatlastretrievalaction"
                            size="sm"
                            isDisabled={!store.graph.repeatRetrieval}
                            _disabled={{
                                background: 'transparent',
                                opacity: 0.5,
                                cursor: 'default'
                            }}
                            background="purple.500"
                            opacity="0.7"
                            _hover={{
                                opacity: 1,
                                _disabled: {
                                    opacity: 0.5,
                                    cursor: 'default'
                                }
                            }}
                            border="none"
                            aria-label="Repeat last retrieval action"
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
                                        event_action:
                                            'Repeat last retrieval action'
                                    })
                                );

                                store.graph.runRepeatRetrieval();
                            }}
                        >
                            Get more data{' '}
                            <SquaresPlusIcon
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    marginLeft: '5px'
                                }}
                            />
                        </Button>
                    </Tooltip>
                )}
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
                                <MapIcon
                                    style={{
                                        width: '16px',
                                        height: '16px'
                                    }}
                                />
                            ) : (
                                <MapPinIcon
                                    style={{ height: '16px', width: '16px' }}
                                />
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
                                    <MagnifyingGlassIcon
                                        style={{
                                            width: '16px',
                                            height: '16px',
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
                                <ChartBarIcon
                                    style={{
                                        width: '16px',
                                        height: '16px'
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
                                <ListBulletIcon
                                    style={{
                                        height: '16px',
                                        width: '16px'
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
                                <BeakerIcon
                                    style={{
                                        width: '16px',
                                        height: '16px'
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
                                <ClockIcon
                                    style={{
                                        width: '16px',
                                        height: '16px',
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
                                <MoonIcon
                                    style={{
                                        width: '16px',
                                        height: '16px'
                                    }}
                                />
                            ) : (
                                <SunIcon
                                    style={{
                                        width: '16px',
                                        height: '16px'
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
                    {isEnvSet('REACT_APP_SURVEY_LINK') && (
                        <Tooltip label="Provide your feedback">
                            <Link
                                size="sm"
                                variant="ghost"
                                href={getSurveyLink()}
                                isExternal
                                transition="0.2s all ease-in-out"
                                _hover={{
                                    textDecoration: 'none',
                                    backgroundColor: 'blue.500'
                                }}
                                style={{
                                    borderRadius: '8px',
                                    padding: '4px 8px'
                                }}
                            >
                                <FaceSmileIcon
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        marginRight: '5px',
                                        display: 'inline-block',
                                        marginBottom: '-4px'
                                    }}
                                />{' '}
                                Feedback
                            </Link>
                        </Tooltip>
                    )}
                    <Tooltip label="Visit the CSX wiki">
                        <Button
                            size="sm"
                            as={Link}
                            width={
                                !location.pathname.startsWith('/search') &&
                                !location.pathname.startsWith('/graph')
                                    ? '75px'
                                    : '32px'
                            }
                            padding={0}
                            variant="ghost"
                            id="wiki"
                            onClick={e => {
                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Navbar'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Button'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Click',
                                        event_action: 'Open wiki'
                                    })
                                );
                            }}
                            transition="0.2s all ease-in-out"
                            href="https://csxapp.notion.site/Collaboration-Spotting-X-FAQ-ccace3dc0f384b1fac6b15a3499523ed"
                            target="_blank"
                            isExternal
                            _hover={{
                                textDecoration: 'none',
                                backgroundColor: 'blue.500'
                            }}
                        >
                            <NewspaperIcon
                                display="inline"
                                width="16px"
                                height="16px"
                                style={{
                                    marginRight:
                                        !location.pathname.startsWith(
                                            '/search'
                                        ) &&
                                        !location.pathname.startsWith(
                                            '/graph'
                                        ) &&
                                        '5px'
                                }}
                            />
                            {!location.pathname.startsWith('/search') &&
                                !location.pathname.startsWith('/graph') &&
                                'Wiki'}
                        </Button>
                    </Tooltip>
                    {location.pathname.startsWith('/graph') && (
                        <Tooltip label="Open presentation mode in new tab">
                            <IconButton
                                size="sm"
                                width="40px"
                                height="40px"
                                style={{
                                    marginLeft: '10px'
                                }}
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
                                        ? `${store.core.getBasePresentURL()}?study=${
                                              store.core.studyUuid
                                          }`
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
