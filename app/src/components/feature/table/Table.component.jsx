import { Box, Table } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import GlobalFilterComponent from './globalFilter/GlobalFilter.component';
import './table.scss';
import TableBodyComponent from './tableBody/TableBody.component';
import TableHeadComponent from './tableHead/TableHead.component';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

function TableComponent(props) {
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
            <OverlayScrollbarsComponent
                style={{
                    width: '100%',
                    height: '100%'
                }}
                options={{
                    scrollbars: {
                        theme: 'os-theme-dark',
                        autoHide: 'scroll',
                        autoHideDelay: 600,
                        clickScroll: true
                    }
                }}
            >
                <Box height="100%" width="100%">
                    <Table {...getTableProps()} style={{ width: '100%' }}>
                        <TableHeadComponent headerGroups={headerGroups} />
                        <TableBodyComponent
                            getTableBodyProps={getTableBodyProps}
                            prepareRow={prepareRow}
                            rows={rows}
                        />
                    </Table>
                </Box>
            </OverlayScrollbarsComponent>
        </Box>
    );
}

TableComponent.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.array,
    hiddenColumns: PropTypes.array
};

TableComponent.defaultProps = {
    hiddenColumns: []
};

export default observer(TableComponent);
