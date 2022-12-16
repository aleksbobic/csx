import {
    IconButton,
    Input,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import { Search } from 'css.gg';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function GlobalFilter(props) {
    const store = useContext(RootStoreContext);

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
                onChange={event => {
                    setGlobalFilterValue(event.target.value);
                }}
                onKeyUp={event => {
                    if (event.key === 'Enter' || event.keyCode === 13) {
                        onChange();
                    }
                }}
                placeholder={`${props.preGlobalFilteredRows.length} entries to search through...`}
                borderRadius="6px"
            />
            <InputRightElement>
                <IconButton
                    variant="ghost"
                    size="sm"
                    icon={<Search style={{ '--ggs': '0.7' }} />}
                    onClick={() => {
                        store.track.trackEvent(
                            'Search results',
                            'Button click',
                            `Search table for ${globalFilterValue}`
                        );

                        onChange();
                    }}
                />
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
