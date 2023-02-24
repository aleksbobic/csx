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
    useColorMode,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import DatasetConfigModalComponent from 'components/interface/datasetconfigmodal/DatasetConfigModal.component';
import FileUploadModalComponent from 'components/interface/fileuploadmodal/FileUploadModal.component';
import { Close } from 'css.gg';

import CookieInfo from 'components/feature/cookieinfo/CookieInfo.component';
import DatasetGrid from 'components/feature/datasetgrid/DatasetGrid.component';
import EmptySearch from 'components/feature/emptysearch/EmptySearch.component';
import StudyGrid from 'components/feature/studygrid/StudyGrid.component';
import Footer from 'components/interface/footer/Footer.component';
import logo from 'images/logo.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';
import DatasetElement from 'components/feature/datasetgrid/datasetElement/DatasetElement.component';
import { isEnvFalse, isEnvTrue } from 'general.utils';
import EmptyStudy from 'components/emptystudy/EmptyStudy.component';
import TutorialGrid from 'components/feature/tutorialgrid/TutorialGrid.component';

function HomePage() {
    const toast = useToast();
    const cookieToast = useToast();
    const { colorMode } = useColorMode();
    const textColor = useColorModeValue('black', 'white');
    const store = useContext(RootStoreContext);
    const [cookieToastVisible, setCookieToastVisible] = useState(false);

    useEffect(() => {
        if (store.core.trackingEnabled) {
            setCookieToastVisible(false);
        }
    }, [store.core.trackingEnabled]);

    useEffect(() => {
        store.core.isStudyPublic = false;
        store.core.setStudyPublicURL('');
        store.overviewSchema.resetProperties();
    }, []);

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
                    icon={<Close style={{ '--ggs': 0.7 }} />}
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
                                    'Global',
                                    'Initialisation',
                                    JSON.stringify({
                                        userUUID: store.core.userUuid
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
        [cookieToast, store.core, store.search]
    );

    const renderLightCookie = useCallback(
        () => (
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
                    icon={<Close style={{ '--ggs': 0.7 }} />}
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
        ),
        [cookieToast, store.core]
    );

    useEffect(() => {
        if (store.core.hideCookieBanner) {
            cookieToast.closeAll();
        } else {
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
        renderDarkCookie,
        renderLightCookie,
        store.core.hideCookieBanner
    ]);

    useEffect(() => {
        if (!store.core.hideCookieBanner && !cookieToastVisible) {
            setCookieToastVisible(true);
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
        store.track.trackPageChange();
        store.graph.resetDetailGraphData();
        store.graph.resetGraphData();
        store.core.updateIsStudySaved(false);
        store.core.getSavedStudies();
        store.search.setAdvancedSearchQuery(null);
    }, []);

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
            <FileUploadModalComponent />
            <DatasetConfigModalComponent />
            <Center width="100%" minH="200px" flexDir="column">
                <Image
                    src={logo}
                    height="40px"
                    alt="Collaboration spotting logo"
                    marginBottom="10px"
                />
                <Heading
                    fontSize="2xl"
                    fontWeight="extrabold"
                    marginBottom="20px"
                    textAlign="center"
                    color={textColor}
                >
                    COLLABORATION SPOTTING X
                </Heading>
            </Center>
            <Container
                marginTop="20px"
                marginBottom="150px"
                maxW="container.sm"
            >
                {store.search.datasets.length > 0 && (
                    <SearchBarComponent
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
