import {
    Box,
    Button,
    Center,
    Container,
    Fade,
    Heading,
    HStack,
    IconButton,
    Image,
    Text,
    Tooltip,
    useColorMode,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';
import SearchBar from 'components/feature/home/searchbar/SearchBar.component';
import DatasetConfigModal from 'components/interface/datasetconfigmodal/DatasetConfigModal.component';
import FileUploadModal from 'components/interface/fileuploadmodal/FileUploadModal.component';
import { XMarkIcon } from '@heroicons/react/24/outline';

import CookieInfo from 'components/feature/home/cookieinfo/CookieInfo.component';
import DatasetElement from 'components/feature/home/datasetgrid/datasetElement/DatasetElement.component';
import DatasetGrid from 'components/feature/home/datasetgrid/DatasetGrid.component';
import EmptySearch from 'components/feature/home/emptysearch/EmptySearch.component';
import EmptyStudy from 'components/feature/home/emptystudy/EmptyStudy.component';
import StudyGrid from 'components/feature/home/studygrid/StudyGrid.component';
import TutorialGrid from 'components/feature/home/tutorialgrid/TutorialGrid.component';
import Footer from 'components/interface/footer/Footer.component';
import { isEnvFalse, isEnvTrue } from 'general.utils';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';
import Joyride from 'react-joyride';

function HomePage() {
    const toast = useToast();
    const cookieToast = useToast();
    const { colorMode } = useColorMode();
    const textColor = useColorModeValue('black', 'white');
    const store = useContext(RootStoreContext);
    const [cookieToastVisible, setCookieToastVisible] = useState('dark');

    useEffect(() => {
        if (store.core.trackingEnabled) {
            setCookieToastVisible(false);
        }
    }, [store.core.trackingEnabled]);

    const renderDarkCookie = useCallback(
        () => (
            <Box
                backgroundColor="#090b10"
                borderRadius="12px"
                padding="16px"
                marginBottom="20px"
                position="relative"
                filter="drop-shadow(0px 5px 8px rgba(0, 0, 0, 0.59))"
            >
                <IconButton
                    size="xs"
                    backgroundColor="transparent"
                    position="absolute"
                    right="16px"
                    top="16px"
                    icon={<XMarkIcon width="16px" height="16px" />}
                    transition="0.2s all ease-in-out"
                    _hover={{ backgroundColor: 'whiteAlpha.200' }}
                    onClick={() => {
                        cookieToast.closeAll();
                        store.core.setHideCookieBanner();
                        if (isEnvFalse('REACT_APP_DISABLE_TRACKING')) {
                            store.core.setTrackingEnabled(false);
                        }
                    }}
                />
                <Heading size="xs" paddingBottom="6px">
                    Cookies & Local Storage
                </Heading>
                <Text fontSize="xs" paddingRight="16px">
                    We use local storage to provide essential functionality.{' '}
                    {isEnvTrue('REACT_APP_DISABLE_TRACKING') &&
                        'To read more about it, click the button below or the cookies & local storage footer link.'}
                    {isEnvFalse('REACT_APP_DISABLE_TRACKING') &&
                        'However, to further improve CSX and contribute to the open source and scientific communities, we would like to ask you to enable interaction tracking.'}
                </Text>
                <HStack paddingTop="8px">
                    {isEnvFalse('REACT_APP_DISABLE_TRACKING') && (
                        <Button
                            size="xs"
                            variant="solid"
                            backgroundColor="whiteAlpha.200"
                            transition="0.2s all ease-in-out"
                            _hover={{ backgroundColor: '#43a2fb' }}
                            textTransform="uppercase"
                            onClick={() => {
                                cookieToast.closeAll();
                                store.core.setHideCookieBanner();
                                store.core.setTrackingEnabled(true);

                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Global'
                                    }),
                                    JSON.stringify({
                                        item_type: null
                                    }),
                                    JSON.stringify({
                                        event_type: 'Initialisation',
                                        event_value: store.core.userUuid
                                    })
                                );
                            }}
                        >
                            Enable tracking
                        </Button>
                    )}
                    <Button
                        size="xs"
                        variant="unstyled"
                        opacity="0.6"
                        transition="0.2s all ease-in-out"
                        _hover={{ opacity: 1 }}
                        onClick={() => {
                            store.core.setStudyIsEmpty(false);
                            store.search.setSearchIsEmpty(false);
                            store.core.setShowCookieInfo(true);
                            store.core.setHideCookieBanner();
                            cookieToast.closeAll();
                        }}
                    >
                        Read more
                    </Button>
                </HStack>
            </Box>
        ),
        [cookieToast, store.core, store.search, store.track]
    );

    const renderLightCookie = useCallback(() => {
        return (
            <Box
                backgroundColor="white"
                borderRadius="12px"
                padding="16px"
                marginBottom="20px"
                position="relative"
                filter="drop-shadow(0px 5px 8px rgba(0, 0, 0, 0.30))"
            >
                <IconButton
                    size="xs"
                    backgroundColor="transparent"
                    position="absolute"
                    right="16px"
                    top="16px"
                    icon={<XMarkIcon width="16px" height="16px" />}
                    transition="0.2s all ease-in-out"
                    _hover={{ backgroundColor: 'blackAlpha.50' }}
                    onClick={() => {
                        cookieToast.closeAll();
                        store.core.setHideCookieBanner();
                        if (isEnvFalse('REACT_APP_DISABLE_TRACKING')) {
                            store.core.setTrackingEnabled(false);
                        }
                    }}
                />
                <Heading size="xs" paddingBottom="6px">
                    Cookies & Local Storage
                </Heading>
                <Text fontSize="xs" paddingRight="16px">
                    We use local storage to provide essential functionality.{' '}
                    {isEnvTrue('REACT_APP_DISABLE_TRACKING') &&
                        'To read more about it, click the button below or the cookies & local storage footer link.'}
                    {isEnvFalse('REACT_APP_DISABLE_TRACKING') &&
                        'However, to further improve CSX and contribute to the open source and scientific communities, we would like to ask you to enable interaction tracking.'}
                </Text>
                <HStack paddingTop="8px">
                    {isEnvFalse('REACT_APP_DISABLE_TRACKING') && (
                        <Button
                            size="xs"
                            variant="solid"
                            backgroundColor="blackAlpha.100"
                            transition="0.2s all ease-in-out"
                            _hover={{
                                backgroundColor: '#43a2fb',
                                color: 'white'
                            }}
                            textTransform="uppercase"
                            onClick={() => {
                                cookieToast.closeAll();
                                store.core.setHideCookieBanner();
                                store.core.setTrackingEnabled(true);
                            }}
                        >
                            Enable tracking
                        </Button>
                    )}
                    <Button
                        size="xs"
                        variant="unstyled"
                        opacity="0.6"
                        transition="0.2s all ease-in-out"
                        _hover={{ opacity: 1 }}
                        onClick={() => {
                            store.core.setShowCookieInfo(true);
                            store.core.setHideCookieBanner();
                            cookieToast.closeAll();
                        }}
                    >
                        Read more
                    </Button>
                </HStack>
            </Box>
        );
    }, [cookieToast, store.core]);

    useEffect(() => {
        setTimeout(() => {
            if (store.core.hideCookieBanner) {
                cookieToast.closeAll();
            } else {
                cookieToast.closeAll();
                cookieToast({
                    duration: null,
                    render: () => renderDarkCookie()
                });
            }
        }, 500);
    }, [cookieToast, renderDarkCookie, store.core.hideCookieBanner]);

    // useEffect(() => {
    //     if (store.core.hideCookieBanner) {
    //         cookieToast.closeAll();
    //     } else {
    //         if (colorMode === 'light') {
    //             cookieToast.closeAll();
    //             cookieToast({
    //                 duration: null,
    //                 render: () => renderLightCookie()
    //             });
    //         } else {
    //             cookieToast.closeAll();
    //             cookieToast({
    //                 duration: null,
    //                 render: () => renderDarkCookie()
    //             });
    //         }
    //     }
    // }, [
    //     colorMode,
    //     cookieToast,
    //     renderDarkCookie,
    //     renderLightCookie,
    //     store.core.hideCookieBanner
    // ]);

    useEffect(() => {
        // console.log(store.core.hideCookieBanner, cookieToastVisible);
        if (!store.core.hideCookieBanner && !cookieToastVisible) {
            setCookieToastVisible(colorMode);

            if (colorMode === 'light') {
                cookieToast.closeAll();
                cookieToast({
                    duration: null,
                    render: () => renderLightCookie()
                });
            } else {
                cookieToast.closeAll();
                cookieToast({
                    duration: null,
                    render: () => renderDarkCookie()
                });
            }
        }
    }, [
        colorMode,
        cookieToast,
        cookieToastVisible,
        renderDarkCookie,
        renderLightCookie,
        store.core,
        store.core.hideCookieBanner
    ]);

    useBeforeunload(() => {
        store.core.deleteStudy();
    });

    useEffect(() => {
        store.core.setInteractionModalClosed(false);
        store.core.setIsStudyPublic(false);
        store.core.setDataModificationMessage(null);
        store.core.resetVisibleDimensions();
        store.schema.resetSchema();
        store.overviewSchema.setSchemaHasChanges(false);
        store.schema.setSchemaHasChanges(false);
        store.core.setStudyPublicURL('');
        store.graphInstance.setEdgeColorScheme('auto');
        store.graphInstance.setNodeColorScheme('component');
        store.overviewSchema.resetProperties();
        store.track.trackPageChange();
        store.graph.resetDetailGraphData();
        store.graph.resetGraphData();
        store.graph.setRepeatRetrieval(null);
        store.core.updateIsStudySaved(false);
        store.core.getSavedStudies();
        store.search.setAdvancedSearchQuery(null);
        store.graphInstance.setOrphanNodeVisiblity(true);
    }, [
        store.core,
        store.graph,
        store.graphInstance,
        store.overviewSchema,
        store.schema,
        store.search,
        store.track
    ]);

    useEffect(() => {
        if (store.core.toastInfo.message !== '') {
            toast({
                description: store.core.toastInfo.message,
                status: store.core.toastInfo.type,
                duration: 2000,
                isClosable: true,
                onCloseComplete: () => store.core.setToastMessage(''),
                containerStyle: {
                    marginBottom: '20px'
                }
            });
        }
    }, [store.core, store.core.toastInfo.message, toast]);

    return (
        <Box
            className="App"
            backgroundColor={colorMode === 'light' ? 'white' : '#171A23'}
            paddingTop="150px"
        >
            <Joyride
                steps={[
                    {
                        target: '#Title',
                        placement: 'center',
                        floaterProps: { hideArrow: true },
                        title: (
                            <span
                                style={{ fontSize: '18px', fontWeight: 'bold' }}
                            >
                                Welcome!
                            </span>
                        ),
                        content: (
                            <div style={{ padding: '10px 20px' }}>
                                <p
                                    style={{
                                        textAlign: 'left',
                                        fontSize: '14px'
                                    }}
                                >
                                    Welcome to Collaboration Spotting X 🥳! This
                                    is a new visual network analysis tool that
                                    enables searching, exploring, analysing and
                                    modeling your data 🪄. You can interact with
                                    the highlighted areas of this tutorial.{' '}
                                    <span
                                        style={{
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        Make sure to perform all tasks mentioned
                                        in this tutorial.
                                    </span>
                                </p>
                                <ul
                                    style={{
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        marginTop: '10px'
                                    }}
                                >
                                    <li style={{ paddingBottom: '6px' }}>
                                        Continue this guide by{' '}
                                        <span
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#43a2fb'
                                            }}
                                        >
                                            clicking next 🚀
                                        </span>
                                        .
                                    </li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        target: '#Searchbar',
                        placement: 'bottom',
                        title: (
                            <span
                                style={{ fontSize: '18px', fontWeight: 'bold' }}
                            >
                                Search
                            </span>
                        ),
                        content: (
                            <div style={{ padding: '10px 20px' }}>
                                <p
                                    style={{
                                        textAlign: 'left',
                                        fontSize: '14px'
                                    }}
                                >
                                    To search through a datasets you can use the
                                    search bar 🔎. You can select the dataset
                                    for searching in the left dropdown. The hint
                                    bellow the search bar provides information
                                    on the dataset feature used for search.
                                </p>
                                <ul
                                    style={{
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        marginTop: '10px'
                                    }}
                                >
                                    <li style={{ paddingBottom: '6px' }}>
                                        <span
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#43a2fb'
                                            }}
                                        >
                                            Click next
                                        </span>{' '}
                                        for the next step in this guide.
                                    </li>
                                </ul>
                            </div>
                        )
                    },
                    {
                        target: '#DatasetGrid',
                        placement: 'bottom',
                        title: (
                            <span
                                style={{ fontSize: '18px', fontWeight: 'bold' }}
                            >
                                Datasets
                            </span>
                        ),
                        content: (
                            <div style={{ padding: '10px 20px' }}>
                                <p
                                    style={{
                                        textAlign: 'left',
                                        fontSize: '14px'
                                    }}
                                >
                                    The dataset list displays all datasets
                                    available in CSX 📊. You can view full
                                    datasets(➡️) as well as launch the advanced
                                    search view (🔎).
                                </p>
                                <ul
                                    style={{
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        marginTop: '10px'
                                    }}
                                >
                                    <li style={{ paddingBottom: '6px' }}>
                                        <span
                                            style={{
                                                fontWeight: 'bold',
                                                color: '#43a2fb'
                                            }}
                                        >
                                            Hover over the example dataset and
                                            click the 🔎 icon
                                        </span>{' '}
                                        for the next part of this tutorial.
                                    </li>
                                </ul>
                            </div>
                        )
                    }
                ]}
                styles={{
                    options: {
                        backgroundColor: '#171A23',
                        textColor: 'white',
                        primaryColor: '#43a2fb',
                        arrowColor: '#171A23'
                    }
                }}
                showProgress={true}
                continuous={true}
                spotlightClicks={true}
                callback={data => {
                    if (data.action === 'reset') {
                        store.core.setFinishedHomeJoyride(true);
                    }
                }}
                run={!store.core.finishedHomeJoyride}
            />
            <FileUploadModal />
            <DatasetConfigModal />
            <Center
                width="100%"
                minH="200px"
                flexDir="column"
                position="relative"
            >
                <Image
                    src={logo}
                    height="40px"
                    alt="Collaboration spotting X logo"
                    marginBottom="10px"
                />
                <Heading
                    fontSize="2xl"
                    fontWeight="extrabold"
                    textAlign="center"
                    color={textColor}
                    id="Title"
                    marginBottom="10px"
                >
                    COLLABORATION SPOTTING X
                </Heading>
                <Tooltip
                    label={
                        <Text fontSize="xs">
                            CSX is currently a research project therefore
                            features may rapidly change or accidentally break.
                            If you see something break or you have an
                            improvement idea feel free to open a ticket on
                            github (footer) or fill out the feedback survey :)
                        </Text>
                    }
                >
                    <Text
                        _hover={{
                            cursor: 'default'
                        }}
                        fontSize="9px"
                        fontWeight="bold"
                        backgroundColor="purple.600"
                        padding="3px 9px"
                        borderRadius="full"
                        marginBottom="20px"
                    >
                        PRE-ALPHA RELEASE
                    </Text>
                </Tooltip>
            </Center>
            <Container
                marginTop="20px"
                marginBottom="150px"
                maxW="container.sm"
            >
                {store.search.datasets.length > 0 && (
                    <SearchBar
                        style={{ marginTop: '0px' }}
                        onSubmit={() => cookieToast.closeAll()}
                    />
                )}

                {store.core.studyIsEmpty && <EmptyStudy />}
                {store.search.searchIsEmpty && <EmptySearch />}

                {!store.search.searchIsEmpty && !store.core.studyIsEmpty && (
                    <Fade in={!store.core.showCookieInfo}>
                        {!store.core.showCookieInfo && (
                            <DatasetGrid>
                                {store.search.datasets.map(dataset => (
                                    <DatasetElement
                                        dataset={dataset}
                                        datasetType={
                                            store.search.datasetTypes[dataset]
                                        }
                                        key={`dataset_list_${dataset}`}
                                        onNavigate={() =>
                                            cookieToast.closeAll()
                                        }
                                    />
                                ))}
                            </DatasetGrid>
                        )}
                    </Fade>
                )}

                {!store.search.searchIsEmpty && !store.core.studyIsEmpty && (
                    <Fade
                        in={
                            store.core.showCookieInfo &&
                            !store.search.searchIsEmpty
                        }
                    >
                        {store.core.showCookieInfo && <CookieInfo />}
                    </Fade>
                )}

                {!store.search.searchIsEmpty && !store.core.studyIsEmpty && (
                    <Fade in={!store.core.showCookieInfo}>
                        {store.core.studies.length > 0 &&
                            !store.core.showCookieInfo && (
                                <StudyGrid
                                    onOpenStudy={() => cookieToast.closeAll()}
                                />
                            )}
                    </Fade>
                )}

                {!store.search.searchIsEmpty && !store.core.studyIsEmpty && (
                    <Fade in={!store.core.showCookieInfo}>
                        {!store.core.showCookieInfo && <TutorialGrid />}
                    </Fade>
                )}
            </Container>
            <Footer />
        </Box>
    );
}

HomePage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(HomePage));
