import {
    Box,
    Button,
    Stat,
    StatHelpText,
    Text,
    useColorMode,
    useColorModeValue
} from '@chakra-ui/react';
import { SoftwareDownload } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useContext, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { useSortBy, useTable } from 'react-table';
import { RootStoreContext } from 'stores/RootStore';
import './table.scss';

function Table(props) {
    const store = useContext(RootStoreContext);
    const headerTextColor = useColorModeValue('black', 'white');
    const { colorMode } = useColorMode();

    const data = props.data;
    const columns = props.columns;
    const hiddenColumns = props.hiddenColumns;

    const getCsvData = data => {
        if (!data || !data.length) {
            return [];
        }

        return data.map(row =>
            Object.keys(row)
                .filter(key => !key.endsWith('_id') && key !== 'entry')
                .reduce((newRow, key) => {
                    newRow[key] = row[key];
                    return newRow;
                }, {})
        );
    };

    const getCsvHeaders = data => {
        if (!data || !data.length) {
            return [];
        }
        return Object.keys(data[0])
            .filter(key => !key.endsWith('_id') && key !== 'entry')
            .map(key => {
                return { label: key, key: key };
            });
    };

    const [csvData, setCsvData] = useState([]);
    const [csvHeaders, setCsvHeaders] = useState([]);

    useEffect(() => {
        if (data) {
            setCsvData(getCsvData(data));
            setCsvHeaders(getCsvHeaders(data));
        }
    }, [data]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable(
            {
                columns,
                data,
                initialState: { hiddenColumns }
            },
            useSortBy
        );

    // Retrieve id of a given cell
    const findID = (cell, index) => {
        const selector = store.core.isOverview
            ? store.search.anchor
            : cell.column.Header;
        const hidden_cols = store.dataPanel.getHiddenTableColumns();

        let full_selector;
        let key;

        if (store.core.isOverview) {
            full_selector = `${selector}_${
                cell.row.cells.find(
                    cell =>
                        cell.column.Header.toLowerCase() ===
                        store.search.anchor.toLowerCase()
                ).value
            }_id`;

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

    const renderSortArrow = (location, isSortedDesc) => {
        return (
            <span
                style={
                    location === 'left'
                        ? { marginRight: '10px' }
                        : { marginLeft: '10px' }
                }
            >
                {isSortedDesc ? <>&#9650;</> : <>&#9660;</>}
            </span>
        );
    };

    const renderHeaderCellContent = ({ column }) => {
        if (column.Header === 'Color') {
            return <></>;
        }

        const { canSort, isSorted, isSortedDesc, Header: columnType } = column;

        const eventData = !isSorted
            ? `sort ascending by ${columnType}`
            : isSortedDesc
            ? 'reset sort'
            : `sort descending by ${columnType}`;

        const showLeftArrow = isSorted && columnType !== 'Node';
        const showRightArrow = isSorted && columnType === 'Node';

        return (
            <Text
                textTransform="uppercase"
                fontSize="sm"
                position="relative"
                display="inline-block"
                color={headerTextColor}
                onClick={() => {
                    store.track.trackEvent(
                        'data panel nodes tab',
                        'header click',
                        eventData
                    );
                }}
                _hover={{ cursor: canSort ? 'pointer' : 'normal' }}
            >
                {showLeftArrow && renderSortArrow('left', isSortedDesc)}
                {column.Header}
                {showRightArrow && renderSortArrow('right', isSortedDesc)}
            </Text>
        );
    };

    const renderHeader = header => {
        return (
            <th
                {...header.getHeaderProps(header.getSortByToggleProps())}
                style={{
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    width: 'auto',
                    minWidth: '200px',
                    padding: '5px 10px',
                    position: 'sticky',
                    top: '0px',
                    zIndex: 10,
                    background: colorMode === 'light' ? '#f3f3f3' : '#161616'
                }}
            >
                {header.render(renderHeaderCellContent)}
            </th>
        );
    };

    const renderTableHead = () => (
        <thead>
            {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(renderHeader)}
                </tr>
            ))}
        </thead>
    );

    const renderTableBody = () => (
        <tbody {...getTableBodyProps()} id="nodelistbody">
            {rows.map(row => {
                prepareRow(row);
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

    return (
        <Box
            height="100%"
            display="flex"
            flexDir="column"
            paddingTop="10px"
            alignItems="center"
        >
            <Box height="100%" overflow="scroll" width="100%">
                <table {...getTableProps()} style={{ width: '100%' }}>
                    {renderTableHead()}
                    {renderTableBody()}
                </table>
            </Box>

            {data && (
                <Button
                    size="sm"
                    as={CSVLink}
                    data={csvData}
                    headers={csvHeaders}
                    filename="csx.csv"
                    target="_blank"
                    width="150px"
                    marginTop="10px"
                    colorScheme="blue"
                    variant="ghost"
                >
                    Download .csv{' '}
                    <SoftwareDownload
                        style={{ marginLeft: '10px', '--ggs': '0.8' }}
                    />
                </Button>
            )}
        </Box>
    );
}

Table.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    hiddenColumns: PropTypes.array
};

Table.defaultProps = {
    hiddenColumns: []
};

export default observer(Table);
