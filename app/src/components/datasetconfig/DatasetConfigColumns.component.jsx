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
  useColorMode,
} from "@chakra-ui/react";
import {
  LinkIcon,
  MagnifyingGlassIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { isEnvTrue } from "utils/general.utils";
import { observer } from "mobx-react";
import { useContext } from "react";

function DatasetConfigColumns({ formType = "upload" }) {
  const store = useContext(RootStoreContext);
  const { colorMode } = useColorMode();

  const renderColumnTypeDropdown = (column, defaultType) => {
    return (
      <Select
        defaultValue={defaultType}
        size="sm"
        isDisabled={formType !== "upload"}
        backgroundColor={
          colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300"
        }
        _hover={{
          backgroundColor:
            colorMode === "light" ? "blackAlpha.200" : "blackAlpha.400",
        }}
        _focus={{
          backgroundColor:
            colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300",
        }}
        borderRadius="5px"
        variant="filled"
        onChange={(val) => {
          store.track.trackEvent(
            JSON.stringify({
              area: "Home page",
              sub_area:
                formType === "modify"
                  ? "Dataset config modal"
                  : "Dataset upload modal",
            }),
            JSON.stringify({
              item_type: "Select element",
            }),
            JSON.stringify({
              event_type: "Change selection",
              event_action: `Change data type for ${column}`,
              event_value: val.target.value,
            })
          );

          store.fileUpload.changeFileUplodColumnType(column, val.target.value);
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
              <ViewfinderCircleIcon style={{ width: "14px", height: "14px" }} />
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
              <LinkIcon style={{ width: "14px", height: "14px" }} />
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
              <MagnifyingGlassIcon
                style={{
                  width: "14px",
                  height: "14px",
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
              {formType === "upload" && (
                <Tooltip
                  label={store.fileUpload.fileUploadData.defaults[column].name}
                >
                  <Editable
                    defaultValue={
                      store.fileUpload.fileUploadData.defaults[column].name
                    }
                    backgroundColor={
                      colorMode === "light"
                        ? "blackAlpha.100"
                        : "blackAlpha.300"
                    }
                    borderRadius="5px"
                    maxWidth="176px"
                    onSubmit={(val) => {
                      store.track.trackEvent(
                        JSON.stringify({
                          area: "Home page",
                          sub_area:
                            formType === "modify"
                              ? "Dataset config modal"
                              : "Dataset upload modal",
                        }),
                        JSON.stringify({
                          item_type: "Editable element",
                        }),
                        JSON.stringify({
                          event_type: "Write",
                          event_action: `Change title for ${column}`,
                          event_value: val,
                        })
                      );

                      store.fileUpload.changeColumnName(column, val);
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
              {formType === "modify" && (
                <Tooltip
                  label={store.fileUpload.fileUploadData.defaults[column].name}
                >
                  <Heading
                    size="sm"
                    maxWidth="246px"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                  >
                    {store.fileUpload.fileUploadData.defaults[column].name}
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
                  opacity="0.5"
                  isDisabled={
                    isEnvTrue("VITE_DISABLE_UPLOAD") ||
                    store.fileUpload.fileUploadData.link === column
                  }
                  isChecked={store.fileUpload.fileUploadData.anchor === column}
                  onChange={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Home page",
                        sub_area:
                          formType === "modify"
                            ? "Dataset config modal"
                            : "Dataset upload modal",
                      }),
                      JSON.stringify({
                        item_type: "Radio element",
                      }),
                      JSON.stringify({
                        event_type: "Change selection",
                        event_action: "Change default node column",
                        event_value: column,
                      })
                    );

                    store.fileUpload.changeFileUplodAnchor(column);
                  }}
                  _checked={{
                    opacity: 1,
                    borderColor: "blue.300",
                    borderWidth: "5px",
                  }}
                  _disabled={{
                    cursor: "not-allowed",
                    backgroundColor:
                      colorMode === "light"
                        ? "blackAlpha.100"
                        : "whiteAlpha.100",
                    border: "none",
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
                  opacity="0.5"
                  isDisabled={
                    isEnvTrue("VITE_DISABLE_UPLOAD") ||
                    store.fileUpload.fileUploadData.anchor === column
                  }
                  isChecked={store.fileUpload.fileUploadData.link === column}
                  onChange={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Home page",
                        sub_area:
                          formType === "modify"
                            ? "Dataset config modal"
                            : "Dataset upload modal",
                      }),
                      JSON.stringify({
                        item_type: "Radio element",
                      }),
                      JSON.stringify({
                        event_type: "Change selection",
                        event_action: "Change default edge column",
                        event_value: column,
                      })
                    );

                    store.fileUpload.changeDefaultLink(column);
                  }}
                  _checked={{
                    opacity: 1,
                    borderColor: "blue.300",
                    borderWidth: "5px",
                  }}
                  _disabled={{
                    cursor: "not-allowed",
                    backgroundColor:
                      colorMode === "light"
                        ? "blackAlpha.100"
                        : "whiteAlpha.100",
                    border: "none",
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
                  opacity="0.5"
                  isDisabled={
                    store.fileUpload.fileUploadData.defaults[column]
                      .dataType === "list" || formType === "modify"
                  }
                  isChecked={
                    store.fileUpload.fileUploadData.defaults[column]
                      .isDefaultSearch
                  }
                  onChange={() => {
                    store.track.trackEvent(
                      JSON.stringify({
                        area: "Home page",
                        sub_area:
                          formType === "modify"
                            ? "Dataset config modal"
                            : "Dataset upload modal",
                      }),
                      JSON.stringify({
                        item_type: "Radio element",
                      }),
                      JSON.stringify({
                        event_type: "Change selection",
                        event_action: "Change default search column",
                        event_value: column,
                      })
                    );

                    store.fileUpload.changeDefaultSearch(column);
                  }}
                  _checked={{
                    opacity: 1,
                    borderColor: "blue.300",
                    borderWidth: "5px",
                  }}
                  _disabled={{
                    cursor: "not-allowed",
                    backgroundColor:
                      colorMode === "light"
                        ? "blackAlpha.100"
                        : "whiteAlpha.100",
                    border: "none",
                  }}
                />
              </Flex>
            </Td>
            <Td width="18%">
              {renderColumnTypeDropdown(
                column,
                store.fileUpload.fileUploadData.defaults[column].dataType
              )}
            </Td>
          </Tr>
        )
      )}
    </Tbody>
  );

  return (
    <>
      <Heading size="xs" marginBottom="10px" marginTop="10px" opacity="0.6">
        Columns:{" "}
      </Heading>

      <Box overflowX="scroll">
        <TableContainer
          backgroundColor={
            colorMode === "light" ? "transparent" : "blackAlpha.300"
          }
          borderTopRadius="5px"
          minWidth="700px"
          width="700px"
          style={{
            position: "relative",
            height: "100%",
          }}
        >
          <Table
            style={{
              tableLayout: "fixed",
              position: "relative",
              height: "100%",
            }}
          >
            {renderTableHeader()}
          </Table>
        </TableContainer>
        <TableContainer
          backgroundColor={
            colorMode === "light" ? "transparent" : "blackAlpha.300"
          }
          borderBottomRadius="5px"
          maxHeight="290px"
          overflowY="scroll"
          minWidth="700px"
          width="700px"
        >
          <Table
            style={{
              tableLayout: "fixed",
              position: "relative",
              height: "100%",
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
  formType: PropTypes.string,
};

const ObservedDatasetConfigColumns = observer(DatasetConfigColumns);
export default ObservedDatasetConfigColumns;
