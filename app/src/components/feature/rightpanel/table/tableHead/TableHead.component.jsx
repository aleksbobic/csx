import {
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

function TableHead(props) {
  const store = useContext(RootStoreContext);
  const headerTextColor = useColorModeValue("black", "white");
  const { colorMode } = useColorMode();

  const renderSortArrow = (location, isSortedDesc) => {
    return (
      <span
        style={
          location === "left" ? { marginRight: "10px" } : { marginLeft: "10px" }
        }
      >
        {isSortedDesc ? <>&#9650;</> : <>&#9660;</>}
      </span>
    );
  };

  const renderHeaderCellContent = ({ column }) => {
    if (column.Header === "Color") {
      return <></>;
    }

    return (
      <Text
        textTransform="uppercase"
        fontSize="sm"
        position="relative"
        display="inline-block"
        color={headerTextColor}
        onClick={() => {
          const { isSorted, isSortedDesc, Header: columnType } = column;

          const eventData = !isSorted
            ? `Sort ascending by ${columnType}`
            : isSortedDesc
              ? `Reset sort for ${columnType}`
              : `Sort descending by ${columnType}`;

          store.track.trackEvent(
            JSON.stringify({
              area: "Results panel",
              sub_area: "Results table",
            }),
            JSON.stringify({
              item_type: "Header",
            }),
            JSON.stringify({
              event_type: "Click",
              event_action: eventData,
            })
          );
        }}
        _hover={{ cursor: column.canSort ? "pointer" : "normal" }}
      >
        {column.isSorted &&
          column.Header !== "Node" &&
          renderSortArrow("left", column.isSortedDesc)}
        {column.Header}
        {column.isSorted &&
          column.Header !== "Node" &&
          renderSortArrow("right", column.isSortedDesc)}
      </Text>
    );
  };

  const renderHeader = (header, index, endIndex) => {
    const headerProps = header.getHeaderProps(header.getSortByToggleProps());

    return (
      <Th
        key={headerProps.key}
        role={headerProps.role}
        style={{
          color: "white",
          fontWeight: "bold",
          textAlign: "left",
          width: "auto",
          minWidth: "200px",
          padding: "5px 10px",
          position: "sticky",
          top: "0px",
          zIndex: 1,
          background: colorMode === "light" ? "#f3f3f3" : "#161616",
          borderTopLeftRadius: index === 0 && "5px",
          borderBottomLeftRadius: index === 0 && "5px",
          borderTopRightRadius: index === endIndex && "5px",
          borderBottomRightRadius: index === endIndex && "5px",
        }}
      >
        {header.render(renderHeaderCellContent)}
      </Th>
    );
  };

  return (
    <Thead>
      {props.headerGroups.map((headerGroup) => {
        const headerProps = headerGroup.getHeaderGroupProps();

        return (
          <Tr key={headerProps.key} role={headerProps.role}>
            {headerGroup.headers.map((header, index) =>
              renderHeader(header, index, headerGroup.headers.length - 1)
            )}
          </Tr>
        );
      })}
    </Thead>
  );
}

TableHead.propTypes = {
  headerGroups: PropTypes.array,
};

export default observer(TableHead);
