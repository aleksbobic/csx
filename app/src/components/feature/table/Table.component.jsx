import { Box, Button } from '@chakra-ui/react';
import { SoftwareDownload } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import GlobalFilterComponent from './globalFilter/GlobalFilter.component';
import './table.scss';
import TableBodyComponent from './tableBody/TableBody.component';
import TableHeadComponent from './tableHead/TableHead.component';

function Table(props) {
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

    const {
        getTableProps,
        getTableBodyProps,
        setGlobalFilter,
        headerGroups,
        rows,
        state,
        prepareRow,
        preGlobalFilteredRows
    } = useTable(
        {
            columns,
            data,
            initialState: { hiddenColumns }
        },
        useGlobalFilter,
        useSortBy
    );

    return (
        <Box
            height="100%"
            display="flex"
            flexDir="column"
            paddingTop="10px"
            alignItems="center"
        >
            <Box padding="20px 0" width="100%">
                <GlobalFilterComponent
                    preGlobalFilteredRows={preGlobalFilteredRows}
                    globalFilter={state.globalFilter}
                    setGlobalFilter={setGlobalFilter}
                />
            </Box>
            <Box height="100%" overflow="scroll" width="100%">
                <table {...getTableProps()} style={{ width: '100%' }}>
                    <TableHeadComponent headerGroups={headerGroups} />
                    <TableBodyComponent
                        getTableBodyProps={getTableBodyProps}
                        prepareRow={prepareRow}
                        rows={rows}
                    />
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
