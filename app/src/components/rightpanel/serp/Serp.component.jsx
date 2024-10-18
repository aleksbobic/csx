import "overlayscrollbars/overlayscrollbars.css";

import { ArrowRightIcon, LinkIcon } from "@heroicons/react/24/outline";
import {
  Box,
  IconButton,
  Link,
  Text,
  Tooltip,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";

import CustomScroll from "components/customscroll/CustomScroll.component";
import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useResizeDetector } from "react-resize-detector";
import { useVirtualizer } from "@tanstack/react-virtual";

function Serp({ data, visibleProperties }) {
  const store = useContext(RootStoreContext);

  const [listData, setListData] = useState([]);
  const [listSizes, setListSizes] = useState([]);
  const [timer, setTimer] = useState(null);

  const listContainerRefrence = useRef(null);
  const listItemRefrences = useRef([]);
  const { width, height } = useResizeDetector({ listContainerRefrence });

  const { colorMode } = useColorMode();

  const isStringAURL = (string) => {
    if (
      string &&
      !string.toLowerCase().startsWith("www") &&
      !string.toLowerCase().startsWith("http")
    ) {
      return false;
    }

    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const listVirtualizer = useVirtualizer({
    count: listData.length,
    getScrollElement: () => listContainerRefrence.current,
    estimateSize: (index) => (listSizes[index] ? listSizes[index] : 125),
    measureElement: ({ index }) => listSizes[index],
  });

  const recalculateSizes = () => {
    listVirtualizer.getVirtualItems().forEach((item) => {
      listSizes[item.index] =
        listItemRefrences.current[item.index].firstChild.clientHeight + 10;
    });
    listVirtualizer.measure();
  };

  useEffect(() => {
    setListData(data);

    setTimeout(() => {
      const newSizes = Array(data.length);

      listVirtualizer.getVirtualItems().forEach((item) => {
        newSizes[item.index] =
          listItemRefrences.current[item.index].firstChild.clientHeight + 10;
      });

      setListSizes(newSizes);
      listVirtualizer.measure();
    }, 100);
  }, [data, listVirtualizer, visibleProperties]);

  useEffect(() => {
    const resizeSERP = () => {
      clearTimeout(timer);
      setTimer(setTimeout(recalculateSizes, 50));
    };
    window.addEventListener("resize", resizeSERP);

    return () => {
      window.removeEventListener("resize", resizeSERP);
    };
  });

  const getDataComponent = (feature, value, index, feature_index) => {
    if (store.search.nodeTypes[feature] === "string") {
      return (
        <Box
          key={`serp_result_${index}_${feature_index}`}
          padding="6px"
          borderRadius="6px"
          width="100%"
        >
          <Text
            fontSize="xs"
            backgroundColor="blue.600"
            marginRight="5px"
            display="inline"
            padding="3px 6px"
            borderRadius="3px"
            fontWeight="bold"
          >
            {feature.toUpperCase()}
          </Text>
          {isStringAURL(value) ? (
            <Link
              fontSize="xs"
              width="100%"
              paddingTop="10px"
              display="inline"
              color="blue.400"
              href={value}
              isExternal
            >
              {value}{" "}
              <LinkIcon
                style={{
                  width: "14px",
                  height: "14px",
                  display: "inline-block",
                  marginLeft: "5px",
                  marginBottom: "-2px",
                }}
              />
            </Link>
          ) : (
            <Text fontSize="xs" width="100%" paddingTop="10px" display="inline">
              {value && value.charAt(0).toUpperCase() + value.slice(1)}
            </Text>
          )}
        </Box>
      );
    }

    if (store.search.nodeTypes[feature] === "list") {
      return (
        <Box
          key={`serp_result_${index}_${feature_index}`}
          padding="6px"
          borderRadius="6px"
          width="100%"
        >
          <Text
            fontSize="xs"
            backgroundColor="blue.600"
            marginRight="5px"
            display="inline"
            padding="3px 6px"
            borderRadius="3px"
            fontWeight="bold"
          >
            {feature.toUpperCase()}:
          </Text>

          <Text fontSize="xs" display="inline">
            {String(value.filter((value) => value !== "")).replace(/,/g, " | ")}
          </Text>
        </Box>
      );
    }

    return (
      <Box
        key={`serp_result_${index}_${feature_index}`}
        padding="6px"
        borderRadius="6px"
        width="100%"
      >
        <Text
          fontSize="xs"
          backgroundColor="blue.600"
          marginRight="5px"
          display="inline"
          padding="3px 6px"
          borderRadius="3px"
          fontWeight="bold"
        >
          {feature.toUpperCase()}:
        </Text>

        <Text fontSize="xs" display="inline">
          {value}
        </Text>
      </Box>
    );
  };
  const renderResult = (index, key) => {
    const propertyObjects = visibleProperties.map((feature, feature_index) => {
      return getDataComponent(
        feature,
        listData[index][feature],
        index,
        feature_index
      );
    });

    return (
      <Box width="100%" paddingBottom="10px">
        <VStack
          key={key}
          backgroundColor={
            colorMode === "light" ? "blackAlpha.200" : "whiteAlpha.100"
          }
          width="100%"
          padding="20px"
          paddingBottom="30px"
          borderRadius="6px"
        >
          {propertyObjects}
        </VStack>
        <Tooltip label="Show in graph">
          <IconButton
            position="absolute"
            right="10px"
            bottom="20px"
            size="xs"
            variant="ghost"
            icon={<ArrowRightIcon style={{ width: "12px", height: "12px" }} />}
            onClick={() => {
              const nodeIds = store.graph.currentGraphData.nodes
                .filter((node) =>
                  node.entries.includes(listData[index]["entry"])
                )
                .map((node) => node.id);

              store.track.trackEvent(
                {
                  area: "Results panel",
                  sub_area: "Results list",
                },
                {
                  item_type: "Button",
                },
                {
                  event_type: "Click",
                  event_action: "Navigate to entry",
                  event_value: listData[index]["entry"],
                }
              );

              if (nodeIds.length > 1) {
                store.graphInstance.zoomToFitByNodeIds(nodeIds);
              } else if (nodeIds.length === 1) {
                store.graphInstance.zoomToFitByNodeId(nodeIds[0]);
              }
            }}
          />
        </Tooltip>
      </Box>
    );
  };

  return (
    <VStack height="100%" width="100%" paddingTop="50px">
      <CustomScroll>
        <Box height="100%" width="100%" borderRadius="6px">
          <Box
            ref={listContainerRefrence}
            style={{
              height: `${height}px`,
              width: `${width}px`,
              borderRadius: "6px",
            }}
          >
            <Box
              style={{
                height: `${listVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {listVirtualizer.getVirtualItems().length > 0 &&
                listVirtualizer.getVirtualItems().map((virtualRow) => {
                  return (
                    <Box
                      key={virtualRow?.key}
                      ref={(element) => {
                        listItemRefrences.current[virtualRow.index] = element;
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow?.size - 10}px`,
                        transform: `translateY(${virtualRow?.start}px)`,
                      }}
                    >
                      {renderResult(virtualRow?.index, virtualRow?.key)}
                    </Box>
                  );
                })}
            </Box>
          </Box>
        </Box>
      </CustomScroll>
    </VStack>
  );
}

Serp.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array,
  hiddenColumns: PropTypes.array,
  visibleProperties: PropTypes.array,
};

const ObservedSerp = observer(Serp);
export default ObservedSerp;
