import {
    Box,
    Checkbox,
    Editable,
    EditableInput,
    EditablePreview,
    Flex,
    Heading,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tooltip,
    Tr
} from '@chakra-ui/react';
import { ExtensionRemove, Eye, Link as LinkGG, Search } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { RootStoreContext } from 'stores/RootStore';

function DatasetConfig(props) {
    const store = useContext(RootStoreContext);

    const renderColumnTypeDropdown = (column, defaultType) => {
        return (
            <Select
                defaultValue={defaultType}
                size="sm"
                borderRadius="5px"
                variant="filled"
                onChange={val =>
                    store.fileUpload.changeFileUplodColumnType(
                        column,
                        val.target.value
                    )
                }
            >
                <option value="string">string</option>
                <option value="float">float</option>
                <option value="integer">integer</option>
                <option value="list">list</option>
            </Select>
        );
    };

    const renderColumnDropdown = () => (
        <Select
            defaultValue={store.fileUpload.fileUploadData.anchor}
            size="sm"
            borderRadius="5px"
            variant="filled"
            onChange={val =>
                store.fileUpload.changeFileUplodAnchor(val.target.value)
            }
        >
            {Object.keys(store.fileUpload.fileUploadData.defaults).map(
                column => (
                    <option key={`deafult_anchor_${column}`} value={column}>
                        {column}
                    </option>
                )
            )}
        </Select>
    );

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
        const errors = Object.keys(store.fileUpload.fileUploadErrors)
            .map(errorCode =>
                store.fileUpload.fileUploadErrors[errorCode]
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

    const renderTableHeader = () => (
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
                            <Eye style={{ '--ggs': '0.7' }} />
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
                            <LinkGG style={{ '--ggs': '0.7' }} />
                        </Flex>
                    </Tooltip>
                </Th>
                <Th width="18%">Data Type</Th>
                {props.formType === 'upload' && (
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
                )}
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
                                        backgroundColor="blackAlpha.300"
                                        borderRadius="5px"
                                        maxWidth="176px"
                                        onSubmit={val =>
                                            store.fileUpload.changeColumnName(
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
                                <Checkbox
                                    defaultChecked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultVisible
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
                                            column,
                                            'isDefaultVisible'
                                        )
                                    }
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
                                <Checkbox
                                    defaultChecked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultSearch
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
                                            column,
                                            'isDefaultSearch'
                                        )
                                    }
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
                                <Checkbox
                                    defaultChecked={
                                        store.fileUpload.fileUploadData
                                            .defaults[column].isDefaultLink
                                    }
                                    onChange={() =>
                                        store.fileUpload.changeDefaultBoolToggle(
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
                                store.fileUpload.fileUploadData.defaults[column]
                                    .dataType
                            )}
                        </Td>
                        {props.formType === 'upload' && (
                            <Td width="5%" padding="0px 24px 0 4px">
                                <Flex
                                    width="100%"
                                    height="100%"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Checkbox
                                        checked={
                                            store.fileUpload.fileUploadData
                                                .defaults[column].removeIfNull
                                        }
                                        onChange={() =>
                                            store.fileUpload.changeDefaultBoolToggle(
                                                column,
                                                'removeIfNull'
                                            )
                                        }
                                    />
                                </Flex>
                            </Td>
                        )}
                    </Tr>
                )
            )}
        </Tbody>
    );

    return (
        <>
            <Heading size="xs" marginBottom="10px">
                {props.formType === 'modify'
                    ? store.fileUpload.fileUploadData.name.toUpperCase()
                    : 'Dataset name:'}
            </Heading>
            {props.formType === 'upload' && (
                <Editable
                    defaultValue={store.fileUpload.fileUploadData.name}
                    backgroundColor="blackAlpha.300"
                    borderRadius="5px"
                    onSubmit={val => store.fileUpload.changeDatasetName(val)}
                >
                    <EditablePreview padding="5px 23px" width="100%" />
                    <EditableInput padding="5px 23px" width="100%" />
                </Editable>
            )}

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
                        {renderTableHeader()}
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
                        {renderTableBody()}
                    </Table>
                </TableContainer>
            </Box>
            <Heading size="xs" marginBottom="10px" marginTop="10px">
                Default Anchor:
            </Heading>
            {renderColumnDropdown()}
            {store.fileUpload.showFileUploadError && (
                <Text
                    fontSize="sm"
                    color="red.500"
                    fontWeight="bold"
                    marginTop="15px"
                >
                    Please select default {generateErrorMessage()}.
                </Text>
            )}
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
