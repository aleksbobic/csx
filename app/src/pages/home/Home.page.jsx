import {
    Box,
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
    useToast
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import DatasetConfigModalComponent from 'components/interface/datasetconfigmodal/DatasetConfigModal.component';
import FileUploadModalComponent from 'components/interface/fileuploadmodal/FileUploadModal.component';
import { ArrowRight, FileAdd, Toolbox, TrashEmpty } from 'css.gg';
import logo from 'images/logo.png';
import logodark from 'images/logodark.png';
import logolight from 'images/logolight.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';

function HomePage() {
    const toast = useToast();
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);

    useEffect(() => {
        store.track.trackPageChange();
        store.search.setSearchIsEmpty(false);
    });

    const onDrop = async files => {
        store.fileUpload.changeFileUploadModalVisiblity(true);
        await store.fileUpload.uploadFile(files);
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

    const renderFileUpload = () => (
        <div
            {...getRootProps()}
            style={{
                border: '1px dashed rgba(100,100,100,0.5)',
                borderRadius: '7px',
                height: '150px',
                marginTop: '40px',
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
                    Supported formats are .csv and .xlsx.
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
                <Text marginBottom="20px" textAlign="left">
                    Developed at <b>CERN</b>, Geneva, Switzerland by{' '}
                    <b>Aleksandar Bobić</b> led by <b>Dr. Jean-Marie Le Goff</b>{' '}
                    and <b>prof. Christian Gütl</b>.
                </Text>
                <Text textAlign="left" fontWeight="bold">
                    CERN &copy; 2022
                </Text>
            </Center>
            <Center maxWidth="300px">
                <Text
                    fontStyle="italic"
                    fontSize="sm"
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
            </Center>
        </Container>
    );

    const renderDatasetGrid = () => {
        return (
            <SimpleGrid
                columns={2}
                spacing="10px"
                marginTop="40px"
                backgroundColor="blackAlpha.300"
                padding="10px"
                borderRadius="12px"
                maxHeight="170px"
                overflowY="scroll"
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
                                onClick={() => store.search.getConifg(dataset)}
                                icon={<Toolbox style={{ '--ggs': '0.7' }} />}
                            />
                        </Tooltip>
                        <Tooltip label={`Explore entire ${dataset}`}>
                            <IconButton
                                flexGrow="0"
                                size="sm"
                                variant="solid"
                                opacity="0.5"
                                _groupHover={{ opacity: '1' }}
                                icon={<ArrowRight style={{ '--ggs': '0.7' }} />}
                            />
                        </Tooltip>
                    </Flex>
                ))}
            </SimpleGrid>
        );
    };

    return (
        store.search.datasets && (
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
                    <SearchBarComponent style={{ marginTop: '0px' }} />
                    {renderDatasetGrid()}
                    {renderFileUpload()}
                </Container>
                {renderFooter()}
            </Box>
        )
    );
}

HomePage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(HomePage));
