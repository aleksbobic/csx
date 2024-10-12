import {
    Box,
    Input,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from '@chakra-ui/react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import 'overlayscrollbars/overlayscrollbars.css';
import PropTypes from 'prop-types';
import { useState } from 'react';
import CustomScroll from '../customscroll/CustomScroll.component';

function AutoCompleteInput(props) {
    const { colorMode } = useColorMode();
    const [input, setInput] = useState(props.initialValue);
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [suggestTimeout, setSuggestTimeout] = useState(null);

    const handleValueChange = e => {
        setInput(e.target.value);

        props.getValue(e.target.value);
        if (e.target.value.trim() === '') {
            setSuggestionsVisible(false);
            setActiveSuggestion(0);
        } else {
            clearTimeout(suggestTimeout);
            setSuggestTimeout(
                setTimeout(() => {
                    const resolved = Promise.resolve(
                        props.getSuggestions(e.target.value)
                    );

                    resolved.then(returnedData => setSuggestions(returnedData));
                    setSuggestionsVisible(true);
                }, 200)
            );
        }

        if (props.externalChangeHandler) {
            props.externalChangeHandler(e);
        }
    };

    const clickSuggestion = clickedVal => {
        setInput(clickedVal);
        props.getValue(clickedVal);
        setSuggestionsVisible(false);
        setSuggestions([]);
        setActiveSuggestion(-1);
    };

    const handleKeyDown = e => {
        if (e.keyCode === 13) {
            if (
                suggestionsVisible &&
                suggestions.length > 0 &&
                activeSuggestion > -1
            ) {
                e.preventDefault();
                setInput(suggestions[activeSuggestion]);
                props.getValue(suggestions[activeSuggestion]);

                setSuggestionsVisible(false);
                setSuggestions([]);
                setActiveSuggestion(0);
            }
        } else if (e.keyCode === 38) {
            if (suggestionsVisible && activeSuggestion > 0) {
                setActiveSuggestion(activeSuggestion - 1);

                const element =
                    document.getElementsByClassName('activeSuggestion')[0];

                if (element) {
                    element.scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'start'
                    });
                }
            }
        }
        // User pressed the down arrow, increment the index
        else if (e.keyCode === 40) {
            if (
                suggestionsVisible &&
                activeSuggestion < suggestions.length - 1
            ) {
                setActiveSuggestion(activeSuggestion + 1);

                const element =
                    document.getElementsByClassName('activeSuggestion')[0];

                if (element) {
                    element.scrollIntoView({
                        behavior: 'auto',
                        block: 'center',
                        inline: 'start'
                    });
                }
            }
        } else if (e.keyCode === 27) {
            setActiveSuggestion(-1);
            setSuggestionsVisible(false);
            setSuggestions([]);
        }
    };

    const handleBlur = () => {
        setActiveSuggestion(-1);
        setSuggestionsVisible(false);
        setSuggestions([]);
        if (props.onBlur) {
            props.onBlur(input);
        }
    };

    const handleFocus = () => {
        if (input !== '') {
            const resolved = Promise.resolve(props.getSuggestions(input));

            resolved.then(returnedData => setSuggestions(returnedData));
            setSuggestionsVisible(true);
        }
    };

    const getSuggestionList = () => (
        <VStack padding="5px">
            {suggestions.map((entry, index) => (
                <Box
                    marginTop="0px"
                    borderRadius="3px"
                    width="100%"
                    key={`${entry}_${index}`}
                    fontWeight="bold"
                    className={classNames('nodrag', {
                        activeSuggestion: index === activeSuggestion,
                        suggestionItem: true
                    })}
                    backgroundColor={
                        index === activeSuggestion ? 'blue.400' : 'trnasparent'
                    }
                    color={
                        colorMode === 'light'
                            ? index === activeSuggestion
                                ? 'white'
                                : 'black'
                            : 'white'
                    }
                    onMouseDown={() => clickSuggestion(entry)}
                    _hover={{
                        cursor: 'pointer',
                        backgroundColor: 'blue.400'
                    }}
                    padding="5px 10px"
                >
                    <Text marginTop="0px" width="100%" textAlign="left">
                        {entry}
                    </Text>
                </Box>
            ))}
        </VStack>
    );

    return (
        <>
            <Tooltip label={input}>
                <Input
                    placeholder={props.placeholder}
                    size={props.size}
                    variant="filled"
                    overflow="hidden"
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    onChange={handleValueChange}
                    value={input}
                    name={props.name}
                    autoComplete="off"
                    style={{ ...props.style }}
                ></Input>
            </Tooltip>
            {suggestionsVisible && suggestions.length > 0 && (
                <Box
                    width="auto"
                    maxHeight="200px"
                    borderRadius="5px"
                    className="suggestionContainer"
                    style={{ ...props.suggestionStyle }}
                >
                    <CustomScroll style={{ maxHeight: '200px' }}>
                        {getSuggestionList()}
                    </CustomScroll>
                </Box>
            )}
        </>
    );
}

AutoCompleteInput.propTypes = {
    placeholder: PropTypes.string,
    size: PropTypes.string,
    variant: PropTypes.string,
    getSuggestions: PropTypes.func,
    getValue: PropTypes.func,
    onBlur: PropTypes.func,
    style: PropTypes.object,
    suggestionStyle: PropTypes.object,
    externalChangeHandler: PropTypes.func,
    initialValue: PropTypes.string,
    trackingLocation: PropTypes.string,
    trackingEventTarget: PropTypes.string,
    trackingEventFeature: PropTypes.string,
    trackingEventDataset: PropTypes.string,
    name: PropTypes.string
};

AutoCompleteInput.defaultProps = {
    placeholder: '',
    size: 'sm',
    style: {},
    suggestionStyle: {},
    initialValue: '',
    trackingLocation: '',
    trackingEventTarget: '',
    trackingEventFeature: '',
    trackingEventDataset: '',
    name: ''
};

export default observer(AutoCompleteInput);
