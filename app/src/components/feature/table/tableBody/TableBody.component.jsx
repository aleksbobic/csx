import { Stat, StatHelpText, Text, useColorMode } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

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
                cell =>
                    cell.column.Header.toLowerCase() ===
                    store.search.anchor.toLowerCase()
            );

            full_selector = Array.isArray(cell_with_values.value)
                ? `${selector}_${cell_with_values.value[0]}_id`
                : `${selector}_${cell_with_values.value}_id`;

            key = Object.keys(hidden_cols).find(
                entry => entry.toLowerCase() === full_selector.toLowerCase()
            );
        } else if (typeof index === 'number') {
            // Based on the type of content in the cell the id can be located in different areas
            full_selector = `${selector}_${cell.value[index]}_id`;

            key = Object.keys(hidden_cols).find(
                entry => entry.toLowerCase() === full_selector.toLowerCase()
            );
        } else {
            full_selector = `${selector}_${cell.value}_id`;

            key = Object.keys(hidden_cols).find(
                entry => entry.toLowerCase() === full_selector.toLowerCase()
            );
        }

        return hidden_cols[key];
    };

    const renderCellContent = cell => {
        const content = Array.isArray(cell.value) ? cell.value : [cell.value];

        return content.map((value, index) => {
            return (
                <Stat key={index}>
                    <StatHelpText
                        margin="0"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        fontWeight="bold"
                        paddingRight="10px"
                        title={value}
                    >
                        <Text
                            opacity="0.75"
                            transition="all 0.25s ease-in-out"
                            fontSize="sm"
                            display="inline-block"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            maxWidth="200px"
                            onClick={() => {
                                store.track.trackEvent(
                                    'data panel nodes tab',
                                    'item click',
                                    `focus on node: ${cell.value}}`
                                );

                                store.graphInstance.zoomToFitByNodeId(
                                    Array.isArray(cell.value)
                                        ? findID(cell, index)
                                        : findID(cell)
                                );
                            }}
                            _hover={{
                                cursor: 'pointer',
                                opacity: 1
                            }}
                        >
                            {value}
                        </Text>
                    </StatHelpText>
                </Stat>
            );
        });
    };

    const renderCell = cell => {
        return (
            <td
                key="1"
                {...cell.getCellProps()}
                style={{
                    maxWidth: 'auto',
                    textAlign: 'right'
                }}
            >
                {cell.render(({ cell }) => renderCellContent(cell))}
            </td>
        );
    };

    return (
        <tbody {...props.getTableBodyProps()} id="nodelistbody">
            {props.rows.map(row => {
                props.prepareRow(row);
                return (
                    <tr
                        {...row.getRowProps()}
                        className={
                            colorMode === 'light'
                                ? 'table-row-light'
                                : 'table-row'
                        }
                    >
                        {row.cells.map(renderCell)}
                    </tr>
                );
            })}
        </tbody>
    );
}

TableBody.propTypes = {
    getTableBodyProps: PropTypes.func,
    prepareRow: PropTypes.func,
    rows: PropTypes.array
};

export default observer(TableBody);
