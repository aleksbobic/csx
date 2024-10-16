import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AdvancedSearchComponent from "components/advancedsearch/AdvancedSearch.component";
import { Flex } from "@chakra-ui/react";
import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import UiGuide from "components/uiguide/UIGuide";
import UiGuideSearchSteps from "config/uiguide.search";
import { observer } from "mobx-react";
import { useBeforeunload } from "react-beforeunload";

function SearchPage(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useContext(RootStoreContext);

  useBeforeunload(() => {
    store.core.deleteStudy();
  });

  useEffect(() => {
    store.track.trackPageChange();
  }, [store.track]);

  useEffect(() => {
    if (
      store.core.currentGraph === "" ||
      store.search.currentDataset === null
    ) {
      navigate("/");
    }
  }, [
    navigate,
    location.search,
    store.core.currentGraph,
    store.search.currentDataset,
  ]);

  return (
    <Flex
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      padding="10px"
      paddingTop="55px"
      backgroundColor="blackAlpha.300"
      id="SearchPage"
    >
      <UiGuide
        steps={UiGuideSearchSteps}
        onFinish={(data) => {
          if (data.action === "reset") {
            store.core.setFinishedAdvancedSearchJoyride(true);
          }
        }}
        run={
          !store.core.finishedAdvancedSearchJoyride &&
          store.search.currentDataset === "example"
        }
      />
      <AdvancedSearchComponent marginTop="100px" isPanel={false} />
    </Flex>
  );
}

SearchPage.propTypes = {
  history: PropTypes.object,
};

export default observer(SearchPage);
