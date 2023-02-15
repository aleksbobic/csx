import {
    Box,
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Heading,
    HStack,
    IconButton,
    Input,
    Radio,
    Select,
    Tab,
    Table,
    TableContainer,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import { Anchor, Close, Link as LinkGG, MathPlus, Search } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';
import { isEnvTrue } from 'general.utils';
import CustomScroll from '../customscroll/CustomScroll.component';
import SchemaConfig from '../schemaconfig/SchemaConfig.component';
import { v4 as uuidv4 } from 'uuid';

function DatasetConfig(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();
    const [activeTab, setActiveTab] = useState(0);
    const [schemaName, setSchemaName] = useState('');

    const renderColumnTypeDropdown = (column, defaultType) => {
        return (
            <Select
                defaultValue={defaultType}
                size="sm"
                isDisabled={props.formType !== 'upload'}
                backgroundColor={
                    colorMode === 'light' ? 'blackAlpha.100' : 'blackAlpha.300'
                }
                _hover={{
                    backgroundColor:
                        colorMode === 'light'
                            ? 'blackAlpha.200'
                            : 'blackAlpha.400'
                }}
                _focus={{
                    backgroundColor:
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'blackAlpha.300'
                }}
                borderRadius="5px"
                variant="filled"
                onChange={val => {
                    store.track.trackEvent(
                        `Home Page - ${
                            props.formType === 'modify'
                                ? 'Dataset Configuration Modal'
                                : 'Dataset Upload Modal'
                        }`,
                        `Select Element - ${column} - Data Type`,
                        JSON.stringify({
                            type: 'Change selection',
                            value: `${val.target.value}`
                        })
                    );

                    store.fileUpload.changeFileUplodColumnType(
                        column,
                        val.target.value
                    );
                }}
            >
                <option value="string">string</option>
                <option value="float">float</option>
                <option value="integer">integer</option>
                <option value="list">list</option>
                <option value="category">category</option>
            </Select>
        );
    };

    const renderTableHeader = () => (
        <Thead>
            <Tr>
                <Th width="24%">Column</Th>
                <Th width="5%" padding="0px 4px">
                    <Tooltip label="Use the values of this column as nodes in the overview graph.">
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Anchor style={{ '--ggs': '0.7' }} />
                        </Flex>
                    </Tooltip>
                </Th>
                <Th width="5%" padding="0px 4px">
                    <Tooltip label="Use the values of this column to create edges between nodes.">
                        <Flex
                            width="100%"
                            height="100%"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <LinkGG style={{ '--ggs': '0.7' }} />
                        </Flex>
                    </Tooltip>
                </Th>
                <Th width="5%" padding="0px 4px">
                    <Tooltip label="Search through these columns when you enter a search term on the homepage searchbar.">
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
                <Th width="18%">Data Type</Th>
            </Tr>
        </Thead>
    );

    const renderTableBody = () => (
        <Tbody>
            {Object.keys(store.fileUpload.fileUploadData.defaults).map(
                (column, id) => (
                    <Tr key={`upload_file_${id}`}>
                        <Td width="24%">
                            {props.formType === 'upload' && (
                                <Tooltip
                                    label={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].name
                                    }
                                >
                                    <Editable
                                        defaultValue={
                                            store.fileUpload.fileUploadData
                                                .defaults[column].name
                                        }
                                        backgroundColor={
                                            colorMode === 'light'
                                                ? 'blackAlpha.100'
                                                : 'blackAlpha.300'
                                        }
                                        borderRadius="5px"
                                        maxWidth="176px"
                                        onSubmit={val => {
                                            store.track.trackEvent(
                                                `Home Page - ${
                                                    props.formType === 'modify'
                                                        ? 'Dataset Configuration Modal'
                                                        : 'Dataset Upload Modal'
                                                }`,
                                                `Editable Element - ${column} - Title`,
                                                JSON.stringify({
                                                    type: 'Write',
                                                    value: `${val}`
                                                })
                                            );

                                            store.fileUpload.changeColumnName(
                                                column,
                                                val
                                            );
                                        }}
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
                                </Tooltip>
                            )}
                            {props.formType === 'modify' && (
                                <Tooltip
                                    label={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].name
                                    }
                                >
                                    <Heading
                                        size="sm"
                                        maxWidth="246px"
                                        textOverflow="ellipsis"
                                        overflow="hidden"
                                        whiteSpace="nowrap"
                                    >
                                        {
                                            store.fileUpload.fileUploadData
                                                .defaults[column].name
                                        }
                                    </Heading>
                                </Tooltip>
                            )}
                        </Td>

                        <Td width="5%" paddingLeft="4px" paddingRight="4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Radio
                                    isDisabled={
                                        isEnvTrue('REACT_APP_DISABLE_UPLOAD') ||
                                        store.fileUpload.fileUploadData.link ===
                                            column
                                    }
                                    isChecked={
                                        store.fileUpload.fileUploadData
                                            .anchor === column
                                    }
                                    onChange={() => {
                                        store.track.trackEvent(
                                            `Home Page - ${
                                                props.formType === 'modify'
                                                    ? 'Dataset Configuration Modal'
                                                    : 'Dataset Upload Modal'
                                            }`,
                                            `Radio Element - ${column} - Default Anchor`,
                                            JSON.stringify({
                                                type: 'Change selection',
                                                value: column
                                            })
                                        );

                                        store.fileUpload.changeFileUplodAnchor(
                                            column
                                        );
                                    }}
                                    _disabled={{
                                        cursor: 'not-allowed',
                                        backgroundColor:
                                            colorMode === 'light'
                                                ? 'blackAlpha.100'
                                                : 'whiteAlpha.100',
                                        border: 'none'
                                    }}
                                />
                            </Flex>
                        </Td>
                        <Td width="5%" paddingLeft="4px" paddingRight="4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Radio
                                    isDisabled={
                                        isEnvTrue('REACT_APP_DISABLE_UPLOAD') ||
                                        store.fileUpload.fileUploadData
                                            .anchor === column
                                    }
                                    isChecked={
                                        store.fileUpload.fileUploadData.link ===
                                        column
                                    }
                                    onChange={() => {
                                        store.track.trackEvent(
                                            `Home Page - ${
                                                props.formType === 'modify'
                                                    ? 'Dataset Configuration Modal'
                                                    : 'Dataset Upload Modal'
                                            }`,
                                            `Radio Element - ${column} - Default Link`,
                                            JSON.stringify({
                                                type: 'Change selection',
                                                value: column
                                            })
                                        );

                                        store.fileUpload.changeDefaultLink(
                                            column
                                        );
                                    }}
                                    _disabled={{
                                        cursor: 'not-allowed',
                                        backgroundColor:
                                            colorMode === 'light'
                                                ? 'blackAlpha.100'
                                                : 'whiteAlpha.100',
                                        border: 'none'
                                    }}
                                />
                            </Flex>
                        </Td>
                        <Td width="5%" paddingLeft="4px" paddingRight="4px">
                            <Flex
                                width="100%"
                                height="100%"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Radio
                                    isDisabled={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].dataType ===
                                            'list' ||
                                        props.formType === 'modify'
                                    }
                                    isChecked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultSearch
                                    }
                                    onChange={() => {
                                        store.track.trackEvent(
                                            `Home Page - ${
                                                props.formType === 'modify'
                                                    ? 'Dataset Configuration Modal'
                                                    : 'Dataset Upload Modal'
                                            }`,
                                            `Radio Element - ${column} - Default Search`,
                                            JSON.stringify({
                                                type: 'Change selection',
                                                value: column
                                            })
                                        );

                                        store.fileUpload.changeDefaultSearch(
                                            column
                                        );
                                    }}
                                    _disabled={{
                                        cursor: 'not-allowed',
                                        backgroundColor:
                                            colorMode === 'light'
                                                ? 'blackAlpha.100'
                                                : 'whiteAlpha.100',
                                        border: 'none'
                                    }}
                                />
                            </Flex>
                        </Td>
                        <Td width="18%">
                            {renderColumnTypeDropdown(
                                column,
                                store.fileUpload.fileUploadData.defaults[column]
                                    .dataType
                            )}
                        </Td>
                    </Tr>
                )
            )}
        </Tbody>
    );

    const renderDatasetNameConfig = () => (
        <>
            <Heading size="xs" marginBottom="10px" opacity="0.6">
                {props.formType === 'modify'
                    ? store.fileUpload.fileUploadData.name.toUpperCase()
                    : 'Dataset name:'}
            </Heading>
            {props.formType === 'upload' &&
                store.fileUpload.fileUploadData.originalName !== '' && (
                    <Editable
                        defaultValue={
                            store.fileUpload.fileUploadData.originalName
                        }
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        borderRadius="5px"
                        onSubmit={val => {
                            store.track.trackEvent(
                                `Home Page - ${
                                    props.formType === 'modify'
                                        ? 'Dataset Configuration Modal'
                                        : 'Dataset Upload Modal'
                                }`,
                                'Editable Element - Dataset - Title',
                                JSON.stringify({
                                    type: 'Change selection',
                                    value: val
                                })
                            );

                            store.fileUpload.changeDatasetName(val);
                        }}
                    >
                        <EditablePreview padding="5px 23px" width="100%" />
                        <EditableInput padding="5px 23px" width="100%" />
                    </Editable>
                )}
        </>
    );

    const renderColumnConfig = () => (
        <>
            <Heading
                size="xs"
                marginBottom="10px"
                marginTop="10px"
                opacity="0.6"
            >
                Columns:{' '}
            </Heading>

            <Box overflowX="scroll">
                <TableContainer
                    backgroundColor={
                        colorMode === 'light' ? 'transparent' : 'blackAlpha.300'
                    }
                    borderTopRadius="5px"
                    minWidth="700px"
                    width="700px"
                    style={{
                        position: 'relative',
                        height: '100%'
                    }}
                >
                    <Table
                        style={{
                            tableLayout: 'fixed',
                            position: 'relative',
                            height: '100%'
                        }}
                    >
                        {renderTableHeader()}
                    </Table>
                </TableContainer>
                <TableContainer
                    backgroundColor={
                        colorMode === 'light' ? 'transparent' : 'blackAlpha.300'
                    }
                    borderBottomRadius="5px"
                    maxHeight="290px"
                    overflowY="scroll"
                    minWidth="700px"
                    width="700px"
                >
                    <Table
                        style={{
                            tableLayout: 'fixed',
                            position: 'relative',
                            height: '100%'
                        }}
                    >
                        {renderTableBody()}
                    </Table>
                </TableContainer>
            </Box>
        </>
    );

    const renderDefultSchemas = graphType => {
        return store.fileUpload.fileUploadData.schemas[graphType].map(
            schema => (
                <HStack
                    height="40px"
                    width="100%"
                    key={`schema_${schema.id}`}
                    backgroundColor={
                        colorMode === 'light'
                            ? 'blackAlpha.100'
                            : 'blackAlpha.300'
                    }
                    padding="10px"
                    justifyContent="space-between"
                    marginBottom="8px"
                    borderRadius="8px"
                >
                    <Tooltip label={schema.name}>
                        <Text
                            fontSize="sm"
                            fontWeight="bold"
                            overflow="hidden"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                        >
                            {schema.name}
                        </Text>
                    </Tooltip>
                    )
                    <Tooltip label={`Delete ${schema.name} schema`}>
                        <IconButton
                            variant="ghost"
                            size="xs"
                            onClick={() =>
                                store.fileUpload.deleteDefaultSchema(
                                    schema.id,
                                    graphType
                                )
                            }
                            icon={<Close style={{ '--ggs': 0.8 }} />}
                        />
                    </Tooltip>
                </HStack>
            )
        );
    };

    const renderDefaultOverviewSchemaConfig = () => {
        return (
            <>
                <Heading size="xs" marginBottom="10px" opacity="0.6">
                    Default overview schemas
                </Heading>
                <HStack
                    height="100%"
                    width="100%"
                    paddingBottom="20px"
                    spacing="10px"
                >
                    <VStack
                        height="100%"
                        maxWidth="180px"
                        minWidth="180px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        borderRadius="10px"
                    >
                        <CustomScroll style={{ padding: '10px 10px 0 10px' }}>
                            {renderDefultSchemas('overview')}
                            <HStack
                                height="40px"
                                width="100%"
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.100'
                                        : 'blackAlpha.300'
                                }
                                padding="10px"
                                justifyContent="space-between"
                                marginBottom="8px"
                                borderRadius="8px"
                            >
                                <Input
                                    fontSize="sm"
                                    size="xs"
                                    variant="filled"
                                    fontWeight="bold"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    placeholder="Schema name"
                                    borderRadius="4px"
                                    value={schemaName}
                                    onChange={e =>
                                        setSchemaName(e.target.value)
                                    }
                                ></Input>
                                <Tooltip label="Add default schema">
                                    <IconButton
                                        variant="ghost"
                                        size="xs"
                                        isDisabled={
                                            schemaName === '' ||
                                            !store.overviewSchema.schemaHasLink
                                        }
                                        onClick={() => {
                                            store.fileUpload.addDefaultSchema(
                                                schemaName,
                                                'overview'
                                            );
                                            setSchemaName('');
                                        }}
                                        icon={
                                            <MathPlus
                                                style={{ '--ggs': 0.7 }}
                                            />
                                        }
                                    />
                                </Tooltip>
                            </HStack>
                        </CustomScroll>
                    </VStack>
                    <Box
                        height="100%"
                        width="100%"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.300'
                                : 'blackAlpha.500'
                        }
                        borderRadius="10px"
                    >
                        <SchemaConfig graphType="overview" />
                    </Box>
                </HStack>
            </>
        );
    };

    const renderDefaultDetailSchemaConfig = () => {
        return (
            <>
                <Heading size="xs" marginBottom="10px" opacity="0.6">
                    Default detail schemas
                </Heading>
                <HStack
                    height="100%"
                    width="100%"
                    paddingBottom="20px"
                    spacing="10px"
                >
                    <VStack
                        height="100%"
                        maxWidth="180px"
                        minWidth="180px"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.100'
                                : 'blackAlpha.300'
                        }
                        borderRadius="10px"
                    >
                        <CustomScroll style={{ padding: '10px 10px 0 10px' }}>
                            {renderDefultSchemas('detail')}
                            <HStack
                                height="40px"
                                width="100%"
                                backgroundColor={
                                    colorMode === 'light'
                                        ? 'blackAlpha.100'
                                        : 'blackAlpha.300'
                                }
                                padding="10px"
                                justifyContent="space-between"
                                marginBottom="8px"
                                borderRadius="8px"
                            >
                                <Input
                                    fontSize="sm"
                                    size="xs"
                                    variant="filled"
                                    fontWeight="bold"
                                    overflow="hidden"
                                    whiteSpace="nowrap"
                                    textOverflow="ellipsis"
                                    placeholder="Schema name"
                                    borderRadius="4px"
                                    value={schemaName}
                                    onChange={e =>
                                        setSchemaName(e.target.value)
                                    }
                                ></Input>
                                <Tooltip label="Add default schema">
                                    <IconButton
                                        variant="ghost"
                                        size="xs"
                                        isDisabled={schemaName === ''}
                                        onClick={() => {
                                            store.fileUpload.addDefaultSchema(
                                                schemaName,
                                                'detail'
                                            );
                                            setSchemaName('');
                                        }}
                                        icon={
                                            <MathPlus
                                                style={{ '--ggs': 0.7 }}
                                            />
                                        }
                                    />
                                </Tooltip>
                            </HStack>
                        </CustomScroll>
                    </VStack>
                    <Box
                        height="100%"
                        width="100%"
                        backgroundColor={
                            colorMode === 'light'
                                ? 'blackAlpha.300'
                                : 'blackAlpha.500'
                        }
                        borderRadius="10px"
                    >
                        <SchemaConfig graphType="detail" />
                    </Box>
                </HStack>
            </>
        );
    };

    const renderFooter = () => {
        if (props.formType === 'modify') {
            return (
                <HStack
                    justifyContent="center"
                    paddingBottom="20px"
                    marginTop="-40px"
                >
                    <Button
                        variant="outline"
                        mr={3}
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Configuration Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Cancel configuration change'
                                })
                            );
                            store.fileUpload.changeConfigChangeModalVisiblity(
                                false
                            );
                            store.fileUpload.resetFileUploadData();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        backgroundColor="blue.500"
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Configuration Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Update default configuration'
                                })
                            );

                            store.fileUpload.updateConfig();
                        }}
                    >
                        Update
                    </Button>
                </HStack>
            );
        }
        return (
            <HStack justifyContent="center" paddingBottom="20px">
                {activeTab === 0 && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Upload Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Cancel dataset upload'
                                })
                            );
                            store.fileUpload.cancelFileUpload();
                        }}
                    >
                        Cancel
                    </Button>
                )}
                {activeTab > 0 && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            if (activeTab === 2) {
                                store.overviewSchema.populateStoreData(true);
                            }
                            setActiveTab(activeTab - 1);
                        }}
                    >
                        Prev
                    </Button>
                )}
                {activeTab < 2 && (
                    <Button
                        variant="solid"
                        backgroundColor="blue.500"
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Upload Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Store dataset config'
                                })
                            );

                            if (activeTab === 0) {
                                store.overviewSchema.populateStoreData(true);
                            }
                            if (activeTab === 1) {
                                store.schema.populateStoreData(true);
                            }
                            setActiveTab(activeTab + 1);
                        }}
                    >
                        Next
                    </Button>
                )}
                {activeTab === 2 && (
                    <Button
                        variant="solid"
                        backgroundColor="blue.500"
                        onClick={() => {
                            store.track.trackEvent(
                                'Home Page - Dataset Upload Modal',
                                'Button',
                                JSON.stringify({
                                    type: 'Click',
                                    value: 'Set default configuration'
                                })
                            );
                            store.fileUpload.setDefaults();
                        }}
                    >
                        Save
                    </Button>
                )}
            </HStack>
        );
    };

    const renderTabs = count => {
        const tabKeys = [];

        for (let i = 0; i < count; i++) {
            tabKeys[i] = uuidv4();
        }

        return (
            <TabList
                justifyContent="center"
                marginTop="20px"
                marginBottom="20px"
            >
                {tabKeys.map(key => (
                    <Tab
                        key={key}
                        width="10px"
                        height="10px"
                        borderRadius="full"
                        padding="0"
                        border="2px solid"
                        borderColor="whiteAlpha.500"
                        margin="4px"
                        cursor="default"
                        _hover={{ cursor: 'default' }}
                        isDisabled
                        _selected={{
                            backgroundColor: 'blue.500',
                            border: 'none'
                        }}
                    ></Tab>
                ))}
            </TabList>
        );
    };

    return (
        <>
            <Tabs variant="solid-rounded" size="sm" index={activeTab}>
                <TabPanels>
                    <TabPanel
                        padding={
                            props.formType === 'upload' ? '20px 0 0 0' : '0'
                        }
                        height="450px"
                    >
                        {renderDatasetNameConfig()}
                        {renderColumnConfig()}
                    </TabPanel>
                    {props.formType === 'upload' && (
                        <TabPanel padding="20px 0 0 0" height="450px">
                            {renderDefaultOverviewSchemaConfig()}
                        </TabPanel>
                    )}
                    {props.formType === 'upload' && (
                        <TabPanel padding="20px 0 0 0" height="450px">
                            {renderDefaultDetailSchemaConfig()}
                        </TabPanel>
                    )}
                </TabPanels>
                {props.formType === 'upload' && renderTabs(3)}
            </Tabs>
            {renderFooter()}
        </>
    );
}

DatasetConfig.propTypes = {
    formType: PropTypes.string
};

DatasetConfig.defaultProps = {
    formType: 'upload'
};

export default observer(DatasetConfig);
