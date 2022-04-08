import {
    Box,
    Button,
    Center,
    Checkbox,
    Container,
    Editable,
    EditableInput,
    EditablePreview,
    Heading,
    HStack,
    Image,
    Link,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useColorMode,
    useDisclosure,
    Stack,
    SimpleGrid,
    Wrap,
    WrapItem
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import { FileAdd } from 'css.gg';
import logo from 'images/logo.png';
import logodark from 'images/logodark.png';
import logolight from 'images/logolight.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton
} from '@chakra-ui/react';
import './Home.scss';

function HomePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);

    useEffect(() => {
        store.track.trackPageChange();
        store.search.setSearchIsEmpty(false);
    });

    const onDrop = async files => {
        await store.core.uploadFile(files);
        onOpen();
    };

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

    const renderColumnTypeDropdown = defaultType => (
        <Select
            defaultValue={defaultType}
            size="sm"
            borderRadius="5px"
            variant="filled"
        >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="list">list</option>
        </Select>
    );

    const renderColumnDropdown = () => (
        <Select
            defaultValue={Object.keys(store.core.fileUploadData.columns)[0]}
            size="sm"
            borderRadius="5px"
            variant="filled"
        >
            {Object.keys(store.core.fileUploadData.columns).map(column => (
                <option value={column}>{column}</option>
            ))}
        </Select>
    );

    const getDefaultNullValue = column => {
        switch (store.core.fileUploadData.columns[column]) {
            case 'number':
                return '0';
            case 'list':
                return '';
            default:
                return '';
        }
    };

    const renderModal = () => (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
            <ModalContent>
                <ModalHeader>Dataset Defaults Setup</ModalHeader>
                <ModalCloseButton />
                <ModalBody overflowY="scroll">
                    <Heading size="xs" marginBottom="10px">
                        Dataset name:{' '}
                    </Heading>
                    <Editable
                        defaultValue={store.core.fileUploadData.name}
                        backgroundColor="blackAlpha.300"
                        borderRadius="5px"
                    >
                        <EditablePreview padding="5px 23px" width="100%" />
                        <EditableInput padding="5px 23px" width="100%" />
                    </Editable>
                    <Heading size="xs" marginBottom="10px" marginTop="10px">
                        Columns:{' '}
                    </Heading>
                    <TableContainer
                        backgroundColor="blackAlpha.300"
                        borderTopRadius="5px"
                    >
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th width="33%">Column</Th>
                                    <Th width="33%" paddingLeft="0px">
                                        Data Type
                                    </Th>
                                    <Th width="33%" paddingLeft="0px">
                                        Null replacement
                                    </Th>
                                </Tr>
                            </Thead>
                        </Table>
                    </TableContainer>
                    <TableContainer
                        backgroundColor="blackAlpha.300"
                        borderBottomRadius="5px"
                        maxHeight="230px"
                        overflowY="scroll"
                    >
                        <Table style={{ tableLayout: 'fixed' }}>
                            <Tbody>
                                {Object.keys(
                                    store.core.fileUploadData.columns
                                ).map((column, id) => (
                                    <Tr key={`upload_file_${id}`}>
                                        <Td width="33%">
                                            <Editable
                                                defaultValue={column}
                                                backgroundColor="blackAlpha.300"
                                                borderRadius="5px"
                                            >
                                                <EditablePreview
                                                    padding="5px 23px"
                                                    width="100%"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                />
                                                <EditableInput
                                                    padding="5px 23px"
                                                    width="100%"
                                                />
                                            </Editable>
                                        </Td>
                                        <Td width="33%" paddingLeft="0px">
                                            {renderColumnTypeDropdown(
                                                store.core.fileUploadData
                                                    .columns[column]
                                            )}
                                        </Td>
                                        <Td width="33%" paddingLeft="0px">
                                            <Editable
                                                defaultValue={getDefaultNullValue(
                                                    column
                                                )}
                                                backgroundColor="blackAlpha.300"
                                                borderRadius="5px"
                                                minHeight="30px"
                                            >
                                                <EditablePreview
                                                    padding="5px 23px"
                                                    width="100%"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                />
                                                <EditableInput
                                                    padding="5px 23px"
                                                    width="100%"
                                                />
                                            </Editable>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                    <Heading size="xs" marginBottom="10px" marginTop="10px">
                        Default Anchor:
                    </Heading>
                    {renderColumnDropdown()}
                    <Heading size="xs" marginBottom="10px" marginTop="10px">
                        Default Links:
                    </Heading>
                    <Wrap>
                        {Object.keys(store.core.fileUploadData.columns).map(
                            column => (
                                <WrapItem>
                                    <Checkbox>
                                        <Text
                                            overflow="hidden"
                                            whiteSpace="nowrap"
                                            textOverflow="ellipsis"
                                            maxWidth="200px"
                                        >
                                            {column}
                                        </Text>
                                    </Checkbox>
                                </WrapItem>
                            )
                        )}
                    </Wrap>
                </ModalBody>

                <ModalFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="solid">Set defaults</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return (
        store.search.datasets && (
            <Box
                className="App"
                backgroundColor={colorMode === 'light' ? 'white' : '#171A23'}
                paddingTop="150px"
            >
                {renderModal()}
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
