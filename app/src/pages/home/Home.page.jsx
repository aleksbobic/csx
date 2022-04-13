import {
    Box,
    Button,
    Center,
    Checkbox,
    Container,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Heading,
    HStack,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorMode,
    useDisclosure
} from '@chakra-ui/react';
import SearchBarComponent from 'components/feature/searchbar/SearchBar.component';
import { ExtensionRemove, Eye, FileAdd, Link as LinkGG, Search } from 'css.gg';
import logo from 'images/logo.png';
import logodark from 'images/logodark.png';
import logolight from 'images/logolight.png';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import './Home.scss';

function HomePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode } = useColorMode();
    const [loadProgress, setLoadProgress] = useState(0);
    const [intervalCounter, setIntervalCounter] = useState(null);
    const store = useContext(RootStoreContext);

    useEffect(() => {
        store.track.trackPageChange();
        store.search.setSearchIsEmpty(false);
    });

    const onDrop = async files => {
        onOpen();
        await store.core.uploadFile(files);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: '.csv'
    });

    useEffect(() => {
        if (
            store.core.fileUploadData.name === '' &&
            isOpen &&
            intervalCounter == null
        ) {
            const interval = setInterval(() => {
                setLoadProgress(prevProgress => {
                    return prevProgress < 90
                        ? prevProgress + Math.floor(Math.random() * 10)
                        : prevProgress;
                });
            }, 750);
            setIntervalCounter(() => interval);
        } else if (
            store.core.fileUploadData.name !== '' &&
            isOpen &&
            intervalCounter !== null
        ) {
            return () => {
                setLoadProgress(() => 0);
                clearInterval(intervalCounter);
                setIntervalCounter(() => null);
            };
        }
    }, [intervalCounter, isOpen, loadProgress, store.core.fileUploadData.name]);

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

    const renderColumnTypeDropdown = (column, defaultType) => (
        <Select
            defaultValue={defaultType}
            size="sm"
            borderRadius="5px"
            variant="filled"
            onChange={val =>
                store.core.changeFileUplodColumnType(column, val.target.value)
            }
        >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="list">list</option>
        </Select>
    );

    const renderColumnDropdown = () => (
        <Select
            defaultValue={store.core.fileUploadData.anchor}
            size="sm"
            borderRadius="5px"
            variant="filled"
            onChange={val => store.core.changeFileUplodAnchor(val.target.value)}
        >
            {Object.keys(store.core.fileUploadData.defaults).map(column => (
                <option key={`deafult_anchor_${column}`} value={column}>
                    {column}
                </option>
            ))}
        </Select>
    );

    const renderModalBody = () => {
        if (store.core.fileUploadData.name === '') {
            return (
                <ModalBody overflowY="scroll" marginBottom="20px">
                    <Heading size="sm" marginBottom="10px">
                        Processing Dataset
                    </Heading>
                    <Progress size="xs" value={loadProgress} />
                </ModalBody>
            );
        }

        return (
            <ModalBody overflowY="scroll" width="748px">
                <Heading size="xs" marginBottom="10px">
                    Dataset name:{' '}
                </Heading>
                <Editable
                    defaultValue={store.core.fileUploadData.name}
                    backgroundColor="blackAlpha.300"
                    borderRadius="5px"
                    onSubmit={val => store.core.changeDatasetName(val)}
                >
                    <EditablePreview padding="5px 23px" width="100%" />
                    <EditableInput padding="5px 23px" width="100%" />
                </Editable>
                <Heading size="xs" marginBottom="10px" marginTop="10px">
                    Columns:{' '}
                </Heading>

                <Box overflowX="scroll">
                    <TableContainer
                        backgroundColor="blackAlpha.300"
                        borderTopRadius="5px"
                        minWidth="700px"
                        width="700px"
                    >
                        <Table style={{ tableLayout: 'fixed' }}>
                            <Thead>
                                <Tr>
                                    <Th width="24%">Column</Th>
                                    <Th width="5%" padding="0px 4px">
                                        <Tooltip label="Visible by default">
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Eye
                                                    style={{ '--ggs': '0.7' }}
                                                />
                                            </Flex>
                                        </Tooltip>
                                    </Th>

                                    <Th width="5%" padding="0px 4px">
                                        <Tooltip label="Use for searching">
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Search
                                                    style={{
                                                        '--ggs': '0.7'
                                                    }}
                                                />
                                            </Flex>
                                        </Tooltip>
                                    </Th>

                                    <Th width="5%" padding="0px 4px">
                                        <Tooltip label="Use as default link">
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <LinkGG
                                                    style={{ '--ggs': '0.7' }}
                                                />
                                            </Flex>
                                        </Tooltip>
                                    </Th>
                                    <Th width="18%">Data Type</Th>
                                    <Th width="18%" paddingLeft="4px">
                                        Null replacement
                                    </Th>
                                    <Th width="5%" padding="0px 24px 0 4px">
                                        <Tooltip label="Remove row if null">
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <ExtensionRemove
                                                    style={{
                                                        '--ggs': '0.7'
                                                    }}
                                                />
                                            </Flex>
                                        </Tooltip>
                                    </Th>
                                </Tr>
                            </Thead>
                        </Table>
                    </TableContainer>
                    <TableContainer
                        backgroundColor="blackAlpha.300"
                        borderBottomRadius="5px"
                        maxHeight="290px"
                        overflowY="scroll"
                        minWidth="700px"
                        width="700px"
                    >
                        <Table style={{ tableLayout: 'fixed' }}>
                            <Tbody>
                                {Object.keys(
                                    store.core.fileUploadData.defaults
                                ).map((column, id) => (
                                    <Tr key={`upload_file_${id}`}>
                                        <Td width="24%">
                                            <Editable
                                                defaultValue={
                                                    store.core.fileUploadData
                                                        .defaults[column].name
                                                }
                                                backgroundColor="blackAlpha.300"
                                                borderRadius="5px"
                                                maxWidth="176px"
                                                onSubmit={val =>
                                                    store.core.changeColumnName(
                                                        column,
                                                        val
                                                    )
                                                }
                                            >
                                                <EditablePreview
                                                    padding="5px 23px"
                                                    width="100%"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                    height="30px"
                                                />
                                                <EditableInput
                                                    padding="5px 23px"
                                                    width="100%"
                                                    height="30px"
                                                />
                                            </Editable>
                                        </Td>

                                        <Td
                                            width="5%"
                                            paddingLeft="4px"
                                            paddingRight="4px"
                                        >
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Checkbox
                                                    checked={
                                                        store.core
                                                            .fileUploadData
                                                            .defaults[column]
                                                            .isDefaultVisible
                                                    }
                                                    onChange={() =>
                                                        store.core.changeDefaultBoolToggle(
                                                            column,
                                                            'isDefaultVisible'
                                                        )
                                                    }
                                                />
                                            </Flex>
                                        </Td>
                                        <Td
                                            width="5%"
                                            paddingLeft="4px"
                                            paddingRight="4px"
                                        >
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Checkbox
                                                    checked={
                                                        store.core
                                                            .fileUploadData
                                                            .defaults[column]
                                                            .isDefaultSearch
                                                    }
                                                    onChange={() =>
                                                        store.core.changeDefaultBoolToggle(
                                                            column,
                                                            'isDefaultSearch'
                                                        )
                                                    }
                                                />
                                            </Flex>
                                        </Td>
                                        <Td
                                            width="5%"
                                            paddingLeft="4px"
                                            paddingRight="4px"
                                        >
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Checkbox
                                                    checked={
                                                        store.core
                                                            .fileUploadData
                                                            .defaults[column]
                                                            .isDefaultLink
                                                    }
                                                    onChange={() =>
                                                        store.core.changeDefaultBoolToggle(
                                                            column,
                                                            'isDefaultLink'
                                                        )
                                                    }
                                                />
                                            </Flex>
                                        </Td>
                                        <Td width="18%">
                                            {renderColumnTypeDropdown(
                                                column,
                                                store.core.fileUploadData
                                                    .defaults[column].dataType
                                            )}
                                        </Td>
                                        <Td width="18%" paddingLeft="4px">
                                            <Editable
                                                defaultValue={
                                                    store.core.fileUploadData
                                                        .defaults[column]
                                                        .defaultNullValue
                                                }
                                                backgroundColor="blackAlpha.300"
                                                borderRadius="5px"
                                                minHeight="30px"
                                                onSubmit={val =>
                                                    store.core.changeNullReplacement(
                                                        column,
                                                        val
                                                    )
                                                }
                                            >
                                                <EditablePreview
                                                    padding="5px 23px"
                                                    width="100%"
                                                    overflow="hidden"
                                                    whiteSpace="nowrap"
                                                    textOverflow="ellipsis"
                                                    height="30px"
                                                />
                                                <EditableInput
                                                    padding="5px 23px"
                                                    width="100%"
                                                    height="30px"
                                                />
                                            </Editable>
                                        </Td>
                                        <Td width="5%" padding="0px 24px 0 4px">
                                            <Flex
                                                width="100%"
                                                height="100%"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Checkbox
                                                    checked={
                                                        store.core
                                                            .fileUploadData
                                                            .defaults[column]
                                                            .removeIfNull
                                                    }
                                                    onChange={() =>
                                                        store.core.changeDefaultBoolToggle(
                                                            column,
                                                            'removeIfNull'
                                                        )
                                                    }
                                                />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>
                <Heading size="xs" marginBottom="10px" marginTop="10px">
                    Default Anchor:
                </Heading>
                {renderColumnDropdown()}
                {store.core.showFileUploadError && (
                    <Text
                        fontSize="sm"
                        color="red.500"
                        fontWeight="bold"
                        marginTop="15px"
                    >
                        Please select default {generateErrorMessage()}.
                    </Text>
                )}
            </ModalBody>
        );
    };

    const getTextForErrorCode = errorCode => {
        switch (errorCode) {
            case 'defaultVisible':
                return 'visible nodes';
            case 'defaultSearchable':
                return 'searchable nodes';
            default:
                return 'link nodes';
        }
    };

    const generateErrorMessage = () => {
        const errors = Object.keys(store.core.fileUploadErrors)
            .map(errorCode =>
                store.core.fileUploadErrors[errorCode]
                    ? getTextForErrorCode(errorCode)
                    : ''
            )
            .filter(val => val !== '');

        if (errors.length === 1) {
            return errors[0];
        } else if (errors.length === 2) {
            return `${errors[0]} and ${errors[1]}`;
        } else {
            return `${errors[0]}, ${errors[1]} and ${errors[2]}`;
        }
    };

    const populateIndex = () => {
        store.core.setDefaults();
        onClose();
    };

    const cancelFileUpload = () => {
        store.core.cancelFileUpload();
        onClose();
    };

    const renderModal = () => (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
            <ModalContent width="748px" minWidth="748px" maxWidth="748px">
                <ModalHeader>Dataset Defaults Setup</ModalHeader>
                {isOpen && renderModalBody()}

                {store.core.fileUploadData.name !== '' && (
                    <ModalFooter>
                        <Button
                            variant="outline"
                            mr={3}
                            onClick={cancelFileUpload}
                        >
                            Cancel
                        </Button>
                        <Button variant="solid" onClick={() => populateIndex()}>
                            Set defaults
                        </Button>
                    </ModalFooter>
                )}
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
