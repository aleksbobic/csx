import { Text, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function TableHead(props) {
    const store = useContext(RootStoreContext);
    const headerTextColor = useColorModeValue('black', 'white');
    const { colorMode } = useColorMode();

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
                    textAlign: 'left',
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

    return (
        <thead>
            {props.headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(renderHeader)}
                </tr>
            ))}
        </thead>
    );
}

TableHead.propTypes = {
    headerGroups: PropTypes.array
};

export default observer(TableHead);
