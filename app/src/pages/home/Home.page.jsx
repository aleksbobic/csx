import {
    AspectRatio,
    Box,
    Button,
    Center,
    Container,
    Flex,
    Heading,
    HStack,
    IconButton,
    Image,
    Link,
    SimpleGrid,
    Text,
    Tooltip,
    useColorMode,
    useToast,
    VStack
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import DatasetConfigModalComponent from 'components/interface/datasetconfigmodal/DatasetConfigModal.component';
import FileUploadModalComponent from 'components/interface/fileuploadmodal/FileUploadModal.component';
import { ArrowRight, Close, FileAdd, Toolbox, TrashEmpty } from 'css.gg';
import logo from 'images/logo.png';
import logodark from 'images/logodark.png';
import logolight from 'images/logolight.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useDropzone } from 'react-dropzone';
import { useHistory, withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';

function HomePage() {
    const toast = useToast();
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const history = useHistory();

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
        await store.fileUpload.uploadFile(files);
    };

    const navigateToAdvancedSearch = dataset => {
        store.core.setCurrentGraph('overview');
        store.search.useDataset(store.search.datasets.indexOf(dataset));
        store.core.resetVisibleDimensions();
        store.workflow.resetWorkflow();
        store.schema.resetOverviewNodeProperties();
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
                <Text textAlign="left" fontWeight="bold" fontSize="xs">
                    CERN &copy; 2022
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
                    <Text
                        fontStyle="italic"
                        fontSize="xs"
                        textAlign="left"
                        marginTop="20px"
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
                </VStack>
            </Center>
        </Container>
    );

    const renderDatasetGrid = () => {
        return (
            <VStack marginTop="40px">
                <Box
                    backgroundColor="blackAlpha.300"
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
                    backgroundColor="blackAlpha.300"
                    padding="0 20px"
                    maxHeight="156px"
                    overflowY="scroll"
                    marginBottom="0"
                    style={{ marginTop: 0 }}
                >
                    {store.search.datasets.map((dataset, index) => (
                        <Flex
                            backgroundColor="whiteAlpha.50"
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
                                    _groupHover={{ opacity: '1' }}
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
                {process.env.REACT_APP_DISABLE_UPLOAD !== 'true' && (
                    <Box
                        backgroundColor="blackAlpha.300"
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
            backgroundColor="blackAlpha.300"
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
                                backgroundColor="#13161d"
                                borderRadius="8px"
                                padding="10px"
                                zIndex="2"
                                height="100%"
                                width="100%"
                                outline="3px solid"
                                outlineColor="whiteAlpha.100"
                                transition="all ease-in-out 0.3s"
                                _groupHover={{
                                    outlineColor: 'transparent'
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
                                    >
                                        {study.study_description
                                            ? study.study_description
                                            : 'No description yet ...'}
                                    </Text>

                                    <Button
                                        width="100%"
                                        size="xs"
                                        flexShrink="0"
                                        _hover={{ backgroundColor: '#925eb5' }}
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
                        <SearchBarComponent style={{ marginTop: '0px' }} />
                        {renderDatasetGrid()}
                    </>
                )}

                {store.core.studies.length > 0 && renderStudyGrid()}
            </Container>
            {renderFooter()}
        </Box>
    );
}

HomePage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(HomePage));
