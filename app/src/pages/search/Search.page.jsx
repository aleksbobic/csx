import { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AdvancedSearchComponent from "components/advancedsearch/AdvancedSearch.component";
import { Flex } from "@chakra-ui/react";
import Joyride from "react-joyride";
import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
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
      <Joyride
        steps={[
          {
            target: "#SearchPage",
            placement: "center",
            floaterProps: { hideArrow: true },
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Advanced Search Page
              </span>
            ),
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                This is the advanced search page. Here you can define complex
                search queries for the dataset you selected. Click next to see
                what different nodes can do.
              </p>
            ),
          },
          {
            target: "#AdvancedSearchDock",
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                4 Node Types
              </span>
            ),
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Search nodes 🔎
                    </span>{" "}
                    search through features of your selected dataset. The input
                    element will change based on the feature type.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Filter nodes ⚗️
                    </span>{" "}
                    filter numeric properties by their min and max values you
                    can use.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Connector nodes 🔗
                    </span>{" "}
                    connect multiple search and filter nodes using boolean
                    operators.
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Results nodes 📄
                    </span>{" "}
                    are required by each advanced serch workflow and are used to
                    run the search.
                  </li>
                </ol>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Click next to create your first advanced search.
                </p>
              </div>
            ),
          },
          {
            target: "#SearchPage",
            placement: "left",
            floaterProps: { hideArrow: true },
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Adding Nodes
              </span>
            ),
            disableOverlay: true,
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Drag and drop a{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      search 🔎
                    </span>{" "}
                    and a{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      filter ⚗️
                    </span>{" "}
                    node from the dock to the canvas
                    <sup
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      [*,+]
                    </sup>
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Select the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      Title feature
                    </span>{" "}
                    in the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      search node
                    </span>{" "}
                    and write{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      security
                    </span>{" "}
                    in the text field.
                  </li>{" "}
                  <li style={{ paddingBottom: "6px" }}>
                    For the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      filter node
                    </span>{" "}
                    select the{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      issue feature
                    </span>{" "}
                    and write{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      5 as the min
                    </span>{" "}
                    value and{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      15 as the max
                    </span>{" "}
                    value.
                  </li>{" "}
                  <li style={{ paddingBottom: "6px" }}>
                    Click next to see how to connect them.
                  </li>
                </ol>

                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    paddingTop: "20px",
                    marginLeft: "-16px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "18px",
                    }}
                  >
                    *
                  </span>{" "}
                  You can add multiple nodes of the same type to the canvas.
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    marginLeft: "-16px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "14px",
                    }}
                  >
                    +
                  </span>{" "}
                  You can also rearange them after you have dropped them by
                  dragging them around.
                </p>
              </div>
            ),
          },
          {
            target: "#SearchPage",
            placement: "left",
            floaterProps: { hideArrow: true },
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Connecting Nodes
              </span>
            ),
            disableOverlay: true,
            content: (
              <div style={{ padding: "10px 20px" }}>
                <ol
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  <li style={{ paddingBottom: "6px" }}>
                    Drag and drop a{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      connector node 🔗
                    </span>{" "}
                    on the canvas and{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      change the value
                    </span>{" "}
                    from{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      or
                    </span>{" "}
                    to{" "}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      and
                    </span>
                    .
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Click and hold the top connection area
                    <sup
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      [*]
                    </sup>{" "}
                    of the connector node and drag your mouse to the connection
                    area of the search node, then release to connect the nodes{" "}
                    <sup
                      style={{
                        fontWeight: "bold",
                        color: "#43a2fb",
                      }}
                    >
                      [+]
                    </sup>
                    .
                  </li>
                  <li style={{ paddingBottom: "6px" }}>
                    Connect the connector node to the filter node using the
                    above process too.
                  </li>
                </ol>
                <p
                  style={{
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Click next to learn how to run the search.
                </p>

                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                    paddingTop: "20px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "16px",
                    }}
                  >
                    *
                  </span>{" "}
                  Small gray rounded rectangle at the top or bottom of an
                  advanced search node.
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#43a2fb",
                      fontSize: "14px",
                    }}
                  >
                    +
                  </span>{" "}
                  The top connetion area of a node can only be connected to the
                  bottom part of another node.
                </p>
              </div>
            ),
          },
          {
            target: "#SearchPage",
            placement: "left",
            floaterProps: { hideArrow: true },
            title: (
              <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                Running the Search
              </span>
            ),
            disableOverlay: true,
            content: (
              <p
                style={{
                  textAlign: "left",
                  fontSize: "14px",
                }}
              >
                Drag and drop a{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  results node
                </span>{" "}
                on the canvas and connect it to the{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  connector node
                </span>
                . Then click the{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#43a2fb",
                  }}
                >
                  run workflow
                </span>{" "}
                button.
              </p>
            ),
          },
        ]}
        styles={{
          options: {
            backgroundColor: "#171A23",
            textColor: "white",
            primaryColor: "#43a2fb",
            arrowColor: "#171A23",
            tooltip: {
              borderRadius: "10px",
            },
          },
        }}
        showProgress={true}
        continuous={true}
        spotlightClicks={true}
        callback={(data) => {
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
