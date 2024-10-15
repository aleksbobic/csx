import "overlayscrollbars/overlayscrollbars.css";

import {
  Box,
  Input,
  Text,
  Tooltip,
  VStack,
  useColorMode,
} from "@chakra-ui/react";

import CustomScroll from "components/customscroll/CustomScroll.component";
import PropTypes from "prop-types";
import classNames from "classnames";
import { observer } from "mobx-react";
import { useState } from "react";

function AutoCompleteInput({
  placeholder = "",
  size = "sm",
  variant,
  getSuggestions,
  getValue,
  onBlur,
  style = {},
  suggestionStyle = {},
  externalChangeHandler,
  initialValue = "",
  trackingLocation = "",
  trackingEventTarget = "",
  trackingEventFeature = "",
  trackingEventDataset = "",
  name = "",
}) {
  const { colorMode } = useColorMode();
  const [input, setInput] = useState(initialValue);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [suggestTimeout, setSuggestTimeout] = useState(null);

  const handleValueChange = (e) => {
    setInput(e.target.value);

    getValue(e.target.value);
    if (e.target.value.trim() === "") {
      setSuggestionsVisible(false);
      setActiveSuggestion(0);
    } else {
      clearTimeout(suggestTimeout);
      setSuggestTimeout(
        setTimeout(() => {
          const resolved = Promise.resolve(getSuggestions(e.target.value));

          resolved.then((returnedData) => setSuggestions(returnedData));
          setSuggestionsVisible(true);
        }, 200)
      );
    }

    if (externalChangeHandler) {
      externalChangeHandler(e);
    }
  };

  const clickSuggestion = (clickedVal) => {
    setInput(clickedVal);
    getValue(clickedVal);
    setSuggestionsVisible(false);
    setSuggestions([]);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      if (
        suggestionsVisible &&
        suggestions.length > 0 &&
        activeSuggestion > -1
      ) {
        e.preventDefault();
        setInput(suggestions[activeSuggestion]);
        getValue(suggestions[activeSuggestion]);

        setSuggestionsVisible(false);
        setSuggestions([]);
        setActiveSuggestion(0);
      }
    } else if (e.keyCode === 38) {
      if (suggestionsVisible && activeSuggestion > 0) {
        setActiveSuggestion(activeSuggestion - 1);

        const element = document.getElementsByClassName("activeSuggestion")[0];

        if (element) {
          element.scrollIntoView({
            behavior: "auto",
            block: "center",
            inline: "start",
          });
        }
      }
    }
    // User pressed the down arrow, increment the index
    else if (e.keyCode === 40) {
      if (suggestionsVisible && activeSuggestion < suggestions.length - 1) {
        setActiveSuggestion(activeSuggestion + 1);

        const element = document.getElementsByClassName("activeSuggestion")[0];

        if (element) {
          element.scrollIntoView({
            behavior: "auto",
            block: "center",
            inline: "start",
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
    if (onBlur) {
      onBlur(input);
    }
  };

  const handleFocus = () => {
    if (input !== "") {
      const resolved = Promise.resolve(getSuggestions(input));

      resolved.then((returnedData) => setSuggestions(returnedData));
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
          className={classNames("nodrag", {
            activeSuggestion: index === activeSuggestion,
            suggestionItem: true,
          })}
          backgroundColor={
            index === activeSuggestion ? "blue.400" : "trnasparent"
          }
          color={
            colorMode === "light"
              ? index === activeSuggestion
                ? "white"
                : "black"
              : "white"
          }
          onMouseDown={() => clickSuggestion(entry)}
          _hover={{
            cursor: "pointer",
            backgroundColor: "blue.400",
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
          placeholder={placeholder}
          size={size}
          variant="filled"
          overflow="hidden"
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          onChange={handleValueChange}
          value={input}
          name={name}
          autoComplete="off"
          style={{ ...style }}
        ></Input>
      </Tooltip>
      {suggestionsVisible && suggestions.length > 0 && (
        <Box
          width="auto"
          maxHeight="200px"
          borderRadius="5px"
          className="suggestionContainer"
          style={{
            ...suggestionStyle,
            zIndex: 999,
            opacity: 1,
          }}
        >
          <CustomScroll style={{ maxHeight: "200px" }}>
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
  name: PropTypes.string,
};

export default observer(AutoCompleteInput);
