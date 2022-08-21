import { Box, Input, Text, Tooltip, VStack } from '@chakra-ui/react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

function AutoCompleteInput(props) {
    const [input, setInput] = useState('');
    const [suggestionsVisible, setSuggestionsVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestion, setActiveSuggestion] = useState(0);

    const handleValueChange = e => {
        setInput(e.target.value);
        props.getValue(e.target.value);
        if (e.target.value.trim() !== '') {
            props
                .getSuggestions(e.target.value)
                .then(returnedData => setSuggestions(returnedData.data));
            setSuggestionsVisible(true);
        } else {
            setSuggestionsVisible(false);
            setActiveSuggestion(0);
        }
    };

    const clickSuggestion = clickedVal => {
        setInput(clickedVal);
        props.getValue(clickedVal);
        setSuggestionsVisible(false);
        setSuggestions([]);
        setActiveSuggestion(0);
    };

    const handleKeyDown = e => {
        if (e.keyCode === 13) {
            if (suggestionsVisible && suggestions.length > 0) {
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
                element.scrollIntoView({
                    behavior: 'auto',
                    block: 'center',
                    inline: 'start'
                });
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
                element.scrollIntoView({
                    behavior: 'auto',
                    block: 'center',
                    inline: 'start'
                });
            }
        }
    };

    const handleBlur = e => {
        setActiveSuggestion(0);
        setSuggestionsVisible(false);
        setSuggestions([]);
    };

    const handleFocus = () => {
        if (input !== '') {
            props
                .getSuggestions(input)
                .then(returnedData => setSuggestions(returnedData.data));
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
                    className={classNames({
                        activeSuggestion: index === activeSuggestion,
                        suggestionItem: true
                    })}
                    backgroundColor={
                        index === activeSuggestion ? 'blue.400' : 'trnasparent'
                    }
                    onMouseDown={() => clickSuggestion(entry)}
                    _hover={{
                        cursor: 'pointer',
                        backgroundColor: 'blue.400'
                    }}
                    padding="5px 10px"
                >
                    <Text marginTop="0px">{entry}</Text>
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
                    borderRadius="5px"
                    overflow="hidden"
                    onBlur={handleBlur}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    onChange={handleValueChange}
                    value={input}
                ></Input>
            </Tooltip>
            {suggestionsVisible && suggestions.length > 0 && (
                <Box
                    backgroundColor="black"
                    position="fixed"
                    top="110px"
                    width="auto"
                    maxHeight="200px"
                    overflowX="scroll"
                    borderRadius="5px"
                    className="suggestionContainer"
                >
                    {getSuggestionList()}
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
    getValue: PropTypes.func
};

AutoCompleteInput.defaultProps = {
    placeholder: '',
    size: 'sm'
};

export default observer(AutoCompleteInput);
