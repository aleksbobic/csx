import { Box } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import GlobalFilterComponent from './globalFilter/GlobalFilter.component';
import './table.scss';
import TableBodyComponent from './tableBody/TableBody.component';
import TableHeadComponent from './tableHead/TableHead.component';

function Table(props) {
    const data = props.data;
    const columns = props.columns;
    const hiddenColumns = props.hiddenColumns;

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
