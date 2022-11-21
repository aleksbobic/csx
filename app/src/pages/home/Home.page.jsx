import {
    AspectRatio,
    Box,
    Button,
    Center,
    Container,
    Fade,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    IconButton,
    Image,
    Link,
    List,
    ListItem,
    SimpleGrid,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorMode,
    useToast,
    VStack
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import DatasetConfigModalComponent from 'components/interface/datasetconfigmodal/DatasetConfigModal.component';
import FileUploadModalComponent from 'components/interface/fileuploadmodal/FileUploadModal.component';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Close,
    FileAdd,
    Toolbox,
    TrashEmpty
} from 'css.gg';
import logo from 'images/logo.png';
import logodark from 'images/logodark.png';
import logolight from 'images/logolight.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useDropzone } from 'react-dropzone';
import { useHistory, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';

function HomePage() {
    const toast = useToast();
    const cookieToast = useToast();

    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const history = useHistory();
    const [showCookies, setShowCookies] = useState(false);
    const [cookieToastVisible, setCookieToastVisible] = useState(false);

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
                        if (
                            process?.env.REACT_APP_DISABLE_TRACKING !== 'true'
                        ) {
                            store.core.setTrackingEnabled(false);
                        }
                    }}
                />
                <Heading size="xs" paddingBottom="6px">
                    Cookies & Local Storage
                </Heading>
                <Text fontSize="xs" paddingRight="16px">
                    We use local storage to provide essential functionality.{' '}
                    {process?.env.REACT_APP_DISABLE_TRACKING === 'true' &&
                        'To read more about it click the button below or the cookies & local storage footer link.'}
                    {process?.env.REACT_APP_DISABLE_TRACKING !== 'true' &&
                        'However, to further improve CSX and also contribute to the open source and scientific communities we would like to ask you to enable interaction tracking.'}
                </Text>
                <HStack paddingTop="8px">
                    {process?.env.REACT_APP_DISABLE_TRACKING !== 'true' && (
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
                            setShowCookies(true);
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
                        if (
                            process?.env.REACT_APP_DISABLE_TRACKING !== 'true'
                        ) {
                            store.core.setTrackingEnabled(false);
                        }
                    }}
                />
                <Heading size="xs" paddingBottom="6px">
                    Cookies & Local Storage
                </Heading>
                <Text fontSize="xs" paddingRight="16px">
                    We use local storage to provide essential functionality.{' '}
                    {process?.env.REACT_APP_DISABLE_TRACKING === 'true' &&
                        'To read more about it click the button below or the cookies & local storage footer link.'}
                    {process?.env.REACT_APP_DISABLE_TRACKING !== 'true' &&
                        'However, to further improve CSX and also contribute to the open source and scientific communities we would like to ask you to enable interaction tracking.'}
                </Text>
                <HStack paddingTop="8px">
                    {process?.env.REACT_APP_DISABLE_TRACKING !== 'true' && (
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
                            setShowCookies(true);
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
        if (!store.core.hideCookieBanner) {
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
        store.search.setSearchIsEmpty(false);
        store.graph.resetDetailGraphData();
        store.graph.resetGraphData();
        store.core.updateIsStudySaved(false);
        store.core.getSavedStudies();
        store.search.setAdvancedSearchQuery(null);
    }, []);

    const onDrop = async files => {
        store.fileUpload.changeFileUploadModalVisiblity(true);
        const response = await store.fileUpload.uploadFile(files);

        if (!response) {
            store.fileUpload.changeFileUploadModalVisiblity(false);
        }
    };

    const navigateToAdvancedSearch = dataset => {
        store.core.setCurrentGraph('overview');
        store.search.useDataset(store.search.datasets.indexOf(dataset));
        store.core.resetVisibleDimensions();
        store.workflow.resetWorkflow();
        store.schema.resetOverviewNodeProperties();
        cookieToast.closeAll();
        history.push(`/search?dataset=${dataset}`);
    };

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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    const openStudy = studyUuid => {
        cookieToast.closeAll();
        history.push(`/graph?study=${studyUuid}`);
    };

    const renderFileUpload = () => (
        <div
            {...getRootProps()}
            style={{
                border: '1px dashed rgba(100,100,100,0.5)',
                width: '100%',
                borderRadius: '7px',
                height: '150px',
                marginTop: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                padding: '25px',
                background: 'rgba(100,100,100,0.05)'
            }}
        >
            <FileAdd
                style={{ '--ggs': '1.2', marginBottom: '10px', opacity: 0.5 }}
            />
            <input {...getInputProps()} width="100%" height="100%" />
            {isDragActive ? (
                <p style={{ opacity: 0.5 }}>Drop your dataset files here ...</p>
            ) : (
                <p
                    style={{
                        opacity: 0.5,
                        paddingLeft: '50px',
                        paddingRight: '50px'
                    }}
                >
                    Drop your dataset files here, or click to select files.
                    Supported format is .csv.
                </p>
            )}
        </div>
    );

    const renderFooter = () => (
        <Container
            maxW="container.xl"
            justifyContent="space-evenly"
            display="flex"
        >
            <Center
                paddingTop="100px"
                paddingBottom="50px"
                maxWidth="300px"
                flexDir="column"
                alignItems="start"
            >
                <HStack justifyContent="center" marginBottom="20px">
                    <Image
                        src={logodark}
                        alt="Collaboration spotting logo"
                        height="20px"
                        display={colorMode === 'light' ? 'none' : 'block'}
                    />
                    <Image
                        src={logolight}
                        alt="Collaboration spotting logo"
                        height="20px"
                        display={colorMode === 'light' ? 'block' : 'none'}
                    />{' '}
                    <Text fontWeight="bold">Collaboration Spotting X</Text>
                </HStack>
                <Text marginBottom="20px" textAlign="left" fontSize="xs">
                    Developed at <b>CERN</b>, Geneva, Switzerland by{' '}
                    <b>Aleksandar Bobić</b> led by <b>Dr. Jean-Marie Le Goff</b>{' '}
                    and <b>prof. Christian Gütl</b>.
                </Text>

                <Text
                    fontStyle="italic"
                    fontSize="xs"
                    textAlign="left"
                    marginBottom="20px"
                >
                    This project was inspired by the{' '}
                    <Link
                        fontWeight="bold"
                        textDecoration="underline"
                        display="inline"
                        opacity="0.75"
                        target="_blank"
                        href="https://collaborationspotting.web.cern.ch/"
                        _hover={{ opacity: 1 }}
                    >
                        Collaboration Spotting project
                    </Link>
                    . We would like to thank the{' '}
                    <Link
                        fontWeight="bold"
                        textDecoration="underline"
                        display="inline"
                        opacity="0.75"
                        target="_blank"
                        href="https://ercim-news.ercim.eu/en111/r-i/collaboration-spotting-a-visual-analytics-platform-to-assist-knowledge-discovery"
                        _hover={{ opacity: 1 }}
                    >
                        Collaboration Spotting team
                    </Link>{' '}
                    for their contributions.
                </Text>
            </Center>
            <Center maxWidth="300px">
                <VStack alignItems="start">
                    <Link
                        fontWeight="bold"
                        fontSize="sm"
                        textDecoration="underline"
                        display="inline"
                        opacity="0.75"
                        target="_blank"
                        href="https://github.com/aleksbobic/csx"
                        _hover={{ opacity: 1 }}
                    >
                        Github
                    </Link>
                    <Link
                        fontWeight="bold"
                        textDecoration="underline"
                        fontSize="sm"
                        display="inline"
                        opacity="0.75"
                        target="_blank"
                        href="https://csxp.me"
                        _hover={{ opacity: 1 }}
                    >
                        Webpage
                    </Link>
                    <Button
                        variant="unstyled"
                        size="sm"
                        padding="0"
                        margin="0"
                        fontSize="sm"
                        textDecoration="underline"
                        opacity="0.75"
                        fontWeight="bold"
                        _hover={{ opacity: 1 }}
                        height="21px"
                        onClick={() => setShowCookies(true)}
                    >
                        Cookies & local storage
                    </Button>
                    <Text
                        textAlign="left"
                        fontWeight="bold"
                        fontSize="xs"
                        paddingTop="16px"
                    >
                        CERN &copy; 2022
                    </Text>
                </VStack>
            </Center>
        </Container>
    );

    const renderDatasetGrid = () => {
        return (
            <VStack marginTop="40px">
                <Box
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'blackAlpha.300'
                    }
                    width="100%"
                    height="50px"
                    margin="0"
                    borderTopRadius="12px"
                    display="flex"
                    alignItems="center"
                >
                    <Heading colSpan={2} size="sm" opacity="0.76" width="100%">
                        Datasets
                    </Heading>
                </Box>
                <SimpleGrid
                    width="100%"
                    columns={[1, 1, 2]}
                    spacing="10px"
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'blackAlpha.300'
                    }
                    padding="0 20px"
                    maxHeight="156px"
                    overflowY="scroll"
                    marginBottom="0"
                    style={{ marginTop: 0 }}
                >
                    {store.search.datasets.map((dataset, index) => (
                        <Flex
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.100'
                                    : 'whiteAlpha.50'
                            }
                            borderRadius="8px"
                            height="40px"
                            justifyContent="center"
                            alignItems="center"
                            gap="5px"
                            paddingLeft="5px"
                            paddingRight="5px"
                            key={`dataset_list_${dataset}`}
                            opacity="0.7"
                            transition="all 0.1s ease-in-out"
                            _hover={{ opacity: '1' }}
                            role="group"
                        >
                            <Heading
                                flexGrow="1"
                                size="xs"
                                textAlign="left"
                                paddingLeft="10px"
                                opacity="0.7"
                                _groupHover={{ opacity: '1' }}
                                whiteSpace="nowrap"
                                overflow="hidden"
                                textOverflow="ellipsis"
                            >
                                {dataset}
                            </Heading>
                            <Tooltip label={`Delete ${dataset}`}>
                                <IconButton
                                    flexGrow="0"
                                    size="sm"
                                    variant="ghost"
                                    opacity="0"
                                    _groupHover={{ opacity: '1' }}
                                    onClick={() =>
                                        store.search.deleteDataset(dataset)
                                    }
                                    icon={
                                        <TrashEmpty
                                            style={{
                                                '--ggs': '0.7',
                                                marginTop: '1px'
                                            }}
                                        />
                                    }
                                />
                            </Tooltip>
                            <Tooltip
                                label={`Change default settings for  ${dataset}`}
                            >
                                <IconButton
                                    flexGrow="0"
                                    size="sm"
                                    variant="ghost"
                                    opacity="0"
                                    _groupHover={{ opacity: '1' }}
                                    onClick={() =>
                                        store.search.getConifg(dataset)
                                    }
                                    icon={
                                        <Toolbox style={{ '--ggs': '0.7' }} />
                                    }
                                />
                            </Tooltip>
                            <Tooltip label={`Explore entire ${dataset}`}>
                                <IconButton
                                    flexGrow="0"
                                    size="sm"
                                    variant="solid"
                                    opacity="0.5"
                                    _groupHover={{
                                        opacity: '1'
                                    }}
                                    onClick={() =>
                                        navigateToAdvancedSearch(dataset)
                                    }
                                    icon={
                                        <ArrowRight
                                            style={{ '--ggs': '0.7' }}
                                        />
                                    }
                                />
                            </Tooltip>
                        </Flex>
                    ))}
                </SimpleGrid>
                {process?.env.REACT_APP_DISABLE_UPLOAD !== 'true' && (
                    <Box
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        padding="20px"
                        width="100%"
                        style={{ marginTop: '0px' }}
                        borderBottomRadius="12px"
                    >
                        {renderFileUpload()}
                    </Box>
                )}
            </VStack>
        );
    };

    const renderStudyGrid = () => (
        <VStack
            marginTop="40px"
            padding="20px"
            backgroundColor={
                colorMode === 'light' ? 'blackAlpha.100' : 'blackAlpha.300'
            }
            borderRadius="12px"
        >
            <Heading colSpan={2} size="sm" opacity="0.76" width="100%">
                Studies
            </Heading>

            <SimpleGrid
                width="100%"
                columns={[1, 2, 3]}
                spacing="10px"
                marginTop="40px"
                padding="10px 0"
                borderRadius="12px"
                maxHeight="250px"
                overflowY="scroll"
            >
                {store.core.studies.map(study => (
                    <AspectRatio ratio={1} key={`study_${study.study_uuid}`}>
                        <Box padding="3px" role="group">
                            <Box
                                width="100%"
                                height="100%"
                                background="linear-gradient(129deg, rgba(102,74,182,1) 0%, rgba(153,115,188,1) 55%, rgba(172,109,182,1) 100%)"
                                position="absolute"
                                borderRadius="10px"
                                zIndex="0"
                                opacity="0"
                                transition="all ease-in-out 0.3s"
                                _groupHover={{ opacity: 1 }}
                            ></Box>
                            <Box
                                backgroundColor={
                                    colorMode === 'light'
                                        ? '#e2e2e2'
                                        : '#13161d'
                                }
                                borderRadius="8px"
                                padding="10px"
                                zIndex="2"
                                height="100%"
                                width="100%"
                                boxShadow={
                                    colorMode === 'light'
                                        ? '0 0 0 3px #64646480'
                                        : '0 0 0 3px #64646480'
                                }
                                transition="all ease-in-out 0.3s"
                                _groupHover={{
                                    boxShadow: 'none'
                                }}
                            >
                                <Tooltip label="Delete study">
                                    <IconButton
                                        size="xs"
                                        position="absolute"
                                        top="10px"
                                        right="10px"
                                        variant="ghost"
                                        zIndex="3"
                                        icon={
                                            <Close style={{ '--ggs': '0.7' }} />
                                        }
                                        onClick={() =>
                                            store.core.deleteStudy(
                                                study.study_uuid
                                            )
                                        }
                                    />
                                </Tooltip>
                                <VStack
                                    height="100%"
                                    justifyContent="space-between"
                                    position="relative"
                                >
                                    <Tooltip label={study.study_name}>
                                        <Text
                                            textAlign="left"
                                            fontWeight="bold"
                                            fontSize="sm"
                                            width="100%"
                                            paddingLeft="10px"
                                            paddingRight="20px"
                                            textTransform="uppercase"
                                            overflow="hidden"
                                            whiteSpace="nowrap"
                                            textOverflow="ellipsis"
                                            flexShrink="0"
                                        >
                                            {study.study_name}
                                        </Text>
                                    </Tooltip>
                                    <Text
                                        width="100%"
                                        heigh="100%"
                                        textAlign="left"
                                        fontSize="sm"
                                        paddingLeft="10px"
                                        paddingRight="10px"
                                        overflowY="scroll"
                                        opacity="0.7"
                                    >
                                        {study.study_description
                                            ? study.study_description
                                            : 'No description yet ...'}
                                    </Text>

                                    <Button
                                        width="100%"
                                        size="xs"
                                        flexShrink="0"
                                        backgroundColor={
                                            colorMode === 'light' && '#d4d4d4'
                                        }
                                        _hover={{
                                            backgroundColor: '#925eb5',
                                            color:
                                                colorMode === 'light' && 'white'
                                        }}
                                        onClick={() =>
                                            openStudy(study.study_uuid)
                                        }
                                    >
                                        Open
                                    </Button>
                                </VStack>
                            </Box>
                        </Box>
                    </AspectRatio>
                ))}
            </SimpleGrid>
        </VStack>
    );

    const renderCookieInfo = () => {
        const localStorageValues = [
            [
                'index_{name}',
                'Used for storing index data such as data types, features and more. This data enables us to provide features such as smart connection cardinality in the network schemas, the correct input fields for particular search nodes and much more.'
            ],
            [
                'chartConfig',
                'Used for storing the last configuration details of charts (widgets) in the data panel. This enables you to have the last used charts at hand when creating a new study with a previsouyl explored dataset.'
            ],
            [
                'currentDatasetIndex',
                'Stores the currently selected dataset index which is used to provide the correct index in the searchbar when you reopen csx as well as to set multiple default settings when reopening CSX.'
            ],
            [
                'currentdataset',
                'Stores the currently selected dataset name which is used similarly to the previous value for providing multiple default settings when reopening CSX.'
            ],
            [
                'useruuid',
                'Stores the unique ID generated for your browser. This is mostly used to provide features such as storing your unique settings, searches and studies without asking you to login and provide any personally identifiable information. This value will stay the same unless you clear your local storage data or switch your browser.'
            ],
            [
                'studyuuid',
                'Stores a unique ID generated for the currently selected study. This is mostly used to store data related to your study.'
            ],
            [
                'chakra-ui-color-mode',
                'Used to store the current color mode which can be either dark or light and can be changed by clicking on the sun/moon icon.'
            ],
            [
                'hidecookiebanner',
                'Used to store the status of the cookie banner. Once you close the cookie banner the message will disappear.'
            ],
            [
                'trackingenabled',
                'Used to store your choice regarding interaction tracking.'
            ]
        ];
        return (
            <VStack
                marginTop="40px"
                padding="40px"
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.100' : 'blackAlpha.300'
                }
                borderRadius="12px"
                position="relative"
            >
                <Button
                    leftIcon={
                        <ChevronLeft
                            style={{ '--ggs': 0.6, marginRight: '-4px' }}
                        />
                    }
                    position="absolute"
                    top="20px"
                    left="20px"
                    size="xs"
                    paddingLeft="0"
                    variant="ghost"
                    _hover={{
                        backgroundColor:
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'whiteAlpha.100'
                    }}
                    onClick={() => setShowCookies(false)}
                >
                    Back
                </Button>
                <Heading size="md" opacity="0.7">
                    Cookies & Local Storage
                </Heading>
                <Text
                    fontSize="xs"
                    textAlign="justify"
                    padding="0 16px"
                    opacity="0.7"
                >
                    You might be wondering does Collaboration Spotting X use
                    cookies and what is their purpose? In short, CSX does not
                    use cookies. However, it does use local storage to store a
                    multitude of values necessary to provide various features
                    such as studies, multiple dataset, local settings storage
                    and more without demanding that you login. Here you can find
                    a short description of all local storage values and their
                    purpose. Since storing these values is necessary for the
                    proper functioning of the system these values are saved
                    automaically. By using CSX you also understand and agree
                    that data such as your comments in studies as well as the
                    study history are have to be stored in our database.
                </Text>

                <Heading
                    size="xs"
                    textAlign="left"
                    width="100%"
                    paddingTop="20px"
                    paddingLeft="16px"
                >
                    Local Storage Values
                </Heading>
                <Box
                    padding="16px"
                    width="100%"
                    paddingBottom="0px"
                    paddingTop="0px"
                >
                    <Table>
                        <Thead>
                            <Tr>
                                <Th
                                    padding="8px"
                                    paddingLeft="0"
                                    borderBottom="none"
                                    width="162px"
                                >
                                    Value
                                </Th>
                                <Th padding="8px" borderBottom="none">
                                    Purpose
                                </Th>
                            </Tr>
                        </Thead>
                    </Table>
                </Box>
                <Box
                    maxHeight="200px"
                    backgroundColor="blackAlpha.200"
                    padding="16px"
                    borderRadius="8px"
                    width="100%"
                >
                    <Box width="100%" height="168px" overflowY="scroll">
                        <Table>
                            <Tbody>
                                {localStorageValues.map(entry => (
                                    <Tr
                                        opacity="0.5"
                                        transition="0.2s all ease-in-out"
                                        _hover={{ opacity: 1 }}
                                        key={`cookie_${entry[0]}`}
                                    >
                                        <Td
                                            borderBottom="none"
                                            fontSize="xs"
                                            fontWeight="bold"
                                            padding="8px"
                                            textTransform="uppercase"
                                            verticalAlign="top"
                                            paddingLeft="0"
                                        >
                                            {entry[0]}
                                        </Td>
                                        <Td
                                            borderBottom="none"
                                            padding="8px"
                                            fontSize="xs"
                                        >
                                            {entry[1]}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
                {process?.env.REACT_APP_DISABLE_TRACKING !== 'true' && (
                    <Box>
                        <Heading
                            size="xs"
                            textAlign="left"
                            width="100%"
                            paddingTop="20px"
                            paddingLeft="16px"
                        >
                            Interaction Tracking
                        </Heading>
                        <Text
                            fontSize="xs"
                            textAlign="justify"
                            padding="0 16px"
                            opacity="0.7"
                        >
                            To further improve CSX and provide new and exciting
                            features we would like to ask you to enable
                            interaction tracking. As you can see from the above
                            provided information we do not store any user
                            identifiable information and will use the collected
                            data for exclusively two purposes:
                        </Text>

                        <List
                            fontSize="xs"
                            width="100%"
                            padding="8px"
                            textAlign="left"
                        >
                            <ListItem>
                                <ChevronRight
                                    style={{
                                        '--ggs': 0.5,
                                        display: 'inline-block',
                                        marginBottom: '-7px',
                                        color: '#43a2fb'
                                    }}
                                />
                                Improving CSX with new features and fixing bugs.
                            </ListItem>
                            <ListItem>
                                <ChevronRight
                                    style={{
                                        '--ggs': 0.5,
                                        display: 'inline-block',
                                        marginBottom: '-7px',
                                        color: '#43a2fb'
                                    }}
                                />
                                Contributing to research through interaction
                                data analysis.
                            </ListItem>
                        </List>
                        <Text
                            fontSize="xs"
                            textAlign="justify"
                            padding="0 16px 16px"
                        >
                            To enable us to{' '}
                            <b style={{ color: '#43a2fb' }}>
                                contribute to the scientific community
                            </b>
                            ,{' '}
                            <b style={{ color: '#43a2fb' }}>
                                make CSX an even better and fully featured open
                                source tool
                            </b>{' '}
                            and{' '}
                            <b style={{ color: '#43a2fb' }}>
                                provide its services to much broader communities
                            </b>{' '}
                            please enable interaction trucking. This will allow
                            us to collect additional interaction data with CSX
                            (such as button clicks and page navigation) in
                            addition to the data mentioned above and enable us
                            to analyse the data associated with your unique ID
                            for the purposes stated above.
                        </Text>
                        <FormControl
                            display="flex"
                            alignItems="center"
                            paddingLeft="16px"
                        >
                            <FormLabel
                                htmlFor="interaction-tracking"
                                marginBottom="0px"
                                fontSize="xs"
                            >
                                Enable interaction tracking?
                            </FormLabel>
                            <Switch id="interaction-tracking" size="sm" />
                        </FormControl>
                    </Box>
                )}
            </VStack>
        );
    };

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
                    <>
                        <SearchBarComponent
                            style={{ marginTop: '0px' }}
                            onSubmit={() => cookieToast.closeAll()}
                        />
                        <Fade in={!showCookies}>
                            {process?.env.REACT_APP_DISABLE_DATASET_LIST !==
                                'true' &&
                                !showCookies &&
                                renderDatasetGrid()}
                        </Fade>
                        <Fade in={showCookies}>
                            {showCookies && renderCookieInfo()}
                        </Fade>
                    </>
                )}

                <Fade in={!showCookies}>
                    {store.core.studies.length > 0 &&
                        !showCookies &&
                        renderStudyGrid()}
                </Fade>
            </Container>
            {renderFooter()}
        </Box>
    );
}

HomePage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(HomePage));
