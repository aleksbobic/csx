import { Button, HStack } from "@chakra-ui/react";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

function DatasetConfigFooter({ formType = "upload", activeTab, setActiveTab }) {
  const store = useContext(RootStoreContext);

  const renderEditConfigModalFooter = () => (
    <HStack justifyContent="center" paddingBottom="20px" marginTop="-40px">
      <Button
        variant="outline"
        mr={3}
        onClick={() => {
          store.track.trackEvent(
            JSON.stringify({
              area: "Home page",
              sub_area: "Dataset config modal",
            }),
            JSON.stringify({
              item_type: "Button",
            }),
            JSON.stringify({
              event_type: "Click",
              event_action: "Cancel config change",
            })
          );
          store.fileUpload.changeConfigChangeModalVisiblity(false);
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
            JSON.stringify({
              area: "Home page",
              sub_area: "Dataset config modal",
            }),
            JSON.stringify({
              item_type: "Button",
            }),
            JSON.stringify({
              event_type: "Click",
              event_action: "Update default config",
            })
          );

          store.fileUpload.updateConfig();
        }}
      >
        Update
      </Button>
    </HStack>
  );

  const renderSetConfigModalFooter = () => (
    <HStack justifyContent="center" paddingBottom="20px">
      {activeTab === 0 && (
        <Button
          variant="outline"
          onClick={() => {
            store.track.trackEvent(
              JSON.stringify({
                area: "Home page",
                sub_area: "Dataset upload modal",
              }),
              JSON.stringify({
                item_type: "Button",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: "Cancel dataset upload",
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
            store.track.trackEvent(
              JSON.stringify({
                area: "Home page",
                sub_area: "Dataset upload modal",
              }),
              JSON.stringify({
                item_type: "Button",
                item_label: "Prev",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: "Navigate to page",
                event_value:
                  activeTab === 2
                    ? "default overview schema config"
                    : "data types and general config of dataset",
              })
            );

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
              JSON.stringify({
                area: "Home page",
                sub_area: "Dataset upload modal",
              }),
              JSON.stringify({
                item_type: "Button",
                item_label: "Next",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: "Navigate to page",
                event_value:
                  activeTab === 0
                    ? "default overview schema config"
                    : "default detail schema config",
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
              JSON.stringify({
                area: "Home page",
                sub_area: "Dataset upload modal",
              }),
              JSON.stringify({
                item_type: "Button",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: "Set default configuration",
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

  return formType === "modify"
    ? renderEditConfigModalFooter()
    : renderSetConfigModalFooter();
}

DatasetConfigFooter.propTypes = {
  formType: PropTypes.string,
  activeTab: PropTypes.number,
  setActiveTab: PropTypes.func,
};

export default observer(DatasetConfigFooter);
