import {
    Box,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Heading,
    Radio,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tooltip,
    Tr,
    useColorMode
} from '@chakra-ui/react';
import { Anchor, Link as LinkGG, Search } from 'css.gg';
import { isEnvTrue } from 'general.utils';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function DatasetConfigColumns(props) {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

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

    return (
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
}

DatasetConfigColumns.propTypes = {
    formType: PropTypes.string
};

DatasetConfigColumns.defaultProps = {
    formType: 'upload'
};

export default observer(DatasetConfigColumns);
