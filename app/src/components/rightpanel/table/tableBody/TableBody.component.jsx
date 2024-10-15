import { Tag, Tbody, Td, Text, Tr, Wrap, useColorMode } from "@chakra-ui/react";

import PropTypes from "prop-types";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";
import { useContext } from "react";

function TableBody(props) {
  const store = useContext(RootStoreContext);
  const { colorMode } = useColorMode();

  const findID = (cell, index) => {
    const selector = store.core.isOverview
      ? store.search.anchor
      : cell.column.Header;
    const hidden_cols = store.dataPanel.getHiddenTableColumns();

    let full_selector;
    let key;

    if (store.core.isOverview) {
      const cell_with_values = cell.row.cells.find(
        (cell) =>
          cell.column.Header.toLowerCase() === store.search.anchor.toLowerCase()
      );

      if (Array.isArray(cell_with_values.value)) {
        if (cell_with_values.value.length) {
          full_selector = `${selector}_${
            cell_with_values.value[index ? index : 0]
          }_id`;
        } else {
          full_selector = `${selector}_CSX_No_${selector}_id`;
        }
      } else {
        full_selector = `${selector}_${cell_with_values.value}_id`;
      }

      key = Object.keys(hidden_cols).find(
        (entry) => entry.toLowerCase() === full_selector.toLowerCase()
      );
    } else if (typeof index === "number") {
      // Based on the type of content in the cell the id can be located in different areas

      full_selector = `${selector}_${cell.value[index]}_id`;
      key = Object.keys(hidden_cols).find(
        (entry) => entry.toLowerCase() === full_selector.toLowerCase()
      );
    } else {
      full_selector = `${selector}_${cell.value}_id`;

      key = Object.keys(hidden_cols).find(
        (entry) => entry.toLowerCase() === full_selector.toLowerCase()
      );
    }

    return hidden_cols[key];
  };

  const renderCellContent = (cell) => {
    const content = Array.isArray(cell.value) ? cell.value : [cell.value];
    const isArray = content.length > 1;

    if (!isArray) {
      return (
        <Text
          opacity="0.75"
          transition="all 0.25s ease-in-out"
          fontSize="sm"
          display="inline-block"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          fontWeight="bold"
          maxWidth="150px"
          onClick={() => {
            store.track.trackEvent(
              JSON.stringify({
                area: "Results panel",
                sub_area: "Results table",
              }),
              JSON.stringify({
                item_type: "Cell",
              }),
              JSON.stringify({
                event_type: "Click",
                event_action: "Zoom to node",
                event_value: cell.value,
              })
            );

            if (
              store.core.isDetail ||
              store.search.nodeTypes[store.search.anchor] !== "list" ||
              cell.column.Header.toLowerCase() ===
                store.search.anchor.toLowerCase()
            ) {
              store.graphInstance.zoomToFitByNodeId(
                Array.isArray(cell.value) ? findID(cell, 0) : findID(cell)
              );
            } else {
              const id = Array.isArray(cell.value)
                ? findID(cell, 0)
                : findID(cell);

              const entries = store.graph.currentGraphData.nodes.find(
                (node) => node.id === id
              ).entries;

              const ids = store.graph.currentGraphData.nodes
                .filter((node) =>
                  node.entries.some((entry) => entries.includes(entry))
                )
                .map((node) => node.id);

              store.graphInstance.zoomToFitByNodeIds(ids);
            }
          }}
          _hover={{
            cursor: "pointer",
            opacity: 1,
          }}
        >
          {content[0]}
        </Text>
      );
    }

    return content.map((value, index) => {
      return (
        <Tag
          key={index}
          backgroundColor="whiteAlpha.300"
          borderRadius="full"
          textAlign="center"
          size="sm"
          opacity="0.75"
          transition="all 0.25s ease-in-out"
          _hover={{
            cursor: "pointer",
            opacity: 1,
          }}
        >
          <Text
            fontSize="sm"
            display="inline-block"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            fontWeight="bold"
            maxWidth="150px"
            onClick={() => {
              store.track.trackEvent(
                JSON.stringify({
                  area: "Results panel",
                  sub_area: "Results table",
                }),
                JSON.stringify({
                  item_type: "Cell",
                }),
                JSON.stringify({
                  event_type: "Click",
                  event_action: "Zoom to node",
                  event_value: cell.value,
                })
              );

              if (
                store.core.isDetail ||
                store.search.nodeTypes[store.search.anchor] !== "list" ||
                cell.column.Header.toLowerCase() ===
                  store.search.anchor.toLowerCase()
              ) {
                store.graphInstance.zoomToFitByNodeId(
                  Array.isArray(cell.value) ? findID(cell, index) : findID(cell)
                );
              } else {
                const id = Array.isArray(cell.value)
                  ? findID(cell, index)
                  : findID(cell);

                const entries = store.graph.currentGraphData.nodes.find(
                  (node) => node.id === id
                ).entries;

                const ids = store.graph.currentGraphData.nodes
                  .filter((node) =>
                    node.entries.some((entry) => entries.includes(entry))
                  )
                  .map((node) => node.id);

                store.graphInstance.zoomToFitByNodeIds(ids);
              }
            }}
          >
            {value}
          </Text>
        </Tag>
      );
    });
  };

  const renderCell = (cell) => {
    let styles = {
      maxWidth: "auto",
      textAlign: "left",
    };

    const cellProps = cell.getCellProps();

    return (
      <Td key={cellProps.key} role={cellProps.role} style={styles}>
        <Wrap padding="20px 10px">
          {cell.render(({ cell }) => renderCellContent(cell))}
        </Wrap>
      </Td>
    );
  };

  return (
    <Tbody {...props.getTableBodyProps()} id="nodelistbody">
      {props.rows.map((row) => {
        props.prepareRow(row);
        const rowProps = row.getRowProps();

        return (
          <Tr
            key={rowProps.key}
            role={rowProps.role}
            className={colorMode === "light" ? "table-row-light" : "table-row"}
            borderBottom="1px solid rgba(255,255,255,0.10)"
            _last={{
              borderBottom: "0px solid",
              borderBottomColor: "transparent",
            }}
          >
            {row.cells.map(renderCell)}
          </Tr>
        );
      })}
    </Tbody>
  );
}

TableBody.propTypes = {
  getTableBodyProps: PropTypes.func,
  prepareRow: PropTypes.func,
  rows: PropTypes.array,
};

export default observer(TableBody);
