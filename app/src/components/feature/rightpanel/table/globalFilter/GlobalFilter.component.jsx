import {
    IconButton,
    Input,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
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
                onFocus={() => store.comment.setCommentTrigger(false)}
                onBlur={() => store.comment.setCommentTrigger(true)}
                borderRadius="6px"
            />
            <InputRightElement>
                <IconButton
                    variant="ghost"
                    size="sm"
                    icon={
                        <MagnifyingGlassIcon
                            style={{ width: '14px', height: '14px' }}
                        />
                    }
                    onClick={() => {
                        store.track.trackEvent(
                            JSON.stringify({
                                area: 'Results panel',
                                sub_area: 'Results table'
                            }),
                            JSON.stringify({
                                item_type: 'Button'
                            }),
                            JSON.stringify({
                                event_type: 'Click',
                                event_action: 'Search table',
                                event_value: globalFilterValue
                            })
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
