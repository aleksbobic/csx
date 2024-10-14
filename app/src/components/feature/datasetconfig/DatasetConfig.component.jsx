import {
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useColorMode,
} from "@chakra-ui/react";
import { useContext, useState } from "react";

import DatasetConfigColumns from "./DatasetConfigColumns.component";
import DatasetConfigFooter from "./DatasetConfigFooter.component";
import DatasetConfigSchema from "./DatasetConfigSchema.component";
import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { v4 as uuidv4 } from "uuid";

function DatasetConfig({ formType = "upload" }) {
  const store = useContext(RootStoreContext);
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);

  const renderDatasetNameConfig = () => (
    <>
      <Heading size="xs" marginBottom="10px" opacity="0.6">
        {formType === "modify"
          ? store.fileUpload.fileUploadData.name.toUpperCase()
          : "Dataset name:"}
      </Heading>
      {formType === "upload" &&
        store.fileUpload.fileUploadData.originalName !== "" && (
          <Editable
            defaultValue={store.fileUpload.fileUploadData.originalName}
            backgroundColor={
              colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300"
            }
            borderRadius="5px"
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
                  event_type: "Change selection",
                  event_action: "Change title",
                  event_value: val,
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

  const renderTabs = (count) => {
    const tabKeys = [];

    for (let i = 0; i < count; i++) {
      tabKeys[i] = uuidv4();
    }

    return (
      <TabList justifyContent="center" marginTop="20px" marginBottom="20px">
        {tabKeys.map((key) => (
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
            _hover={{ cursor: "default" }}
            isDisabled
            _selected={{
              backgroundColor: "blue.500",
              border: "none",
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
            padding={formType === "upload" ? "20px 0 0 0" : "0"}
            height="450px"
          >
            {renderDatasetNameConfig()}
            <DatasetConfigColumns formType={formType} />
          </TabPanel>
          {formType === "upload" && (
            <TabPanel padding="20px 0 0 0" height="450px">
              <DatasetConfigSchema graphType="overview" />
            </TabPanel>
          )}
          {formType === "upload" && (
            <TabPanel padding="20px 0 0 0" height="450px">
              <DatasetConfigSchema graphType="detail" />
            </TabPanel>
          )}
        </TabPanels>
        {formType === "upload" && renderTabs(3)}
      </Tabs>
      <DatasetConfigFooter
        formType={formType}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
}

DatasetConfig.propTypes = {
  formType: PropTypes.string,
};

export default observer(DatasetConfig);
