import {
    IconButton,
    Input,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import { Search } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

function GlobalFilter(props) {
    const [globalFilterValue, setGlobalFilterValue] = useState(
        props.globalFilter
    );

    const onChange = () => {
        props.setGlobalFilter(globalFilterValue);
    };

    return (
        <InputGroup size="sm">
            <Input
                paddingLeft="10px"
                variant="filled"
                value={globalFilterValue || ''}
                onChange={e => {
                    setGlobalFilterValue(e.target.value);
                }}
                placeholder={`${props.preGlobalFilteredRows.length} entries to search through...`}
            />
            <InputRightElement>
                <IconButton size="sm" icon={<Search />} onClick={onChange} />
            </InputRightElement>
        </InputGroup>
    );
}

GlobalFilter.propTypes = {
    preGlobalFilteredRows: PropTypes.any,
    globalFilter: PropTypes.any,
    setGlobalFilter: PropTypes.func
};

export default observer(GlobalFilter);
