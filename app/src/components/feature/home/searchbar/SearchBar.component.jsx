import {
    Box,
    IconButton,
    InputGroup,
    InputRightElement,
    Select,
    Tag,
    Text,
    useColorMode,
    useColorModeValue
} from '@chakra-ui/react';
import { LightBulbIcon } from '@heroicons/react/20/solid';
// import { Search } from 'css.gg';
import { Form, Formik } from 'formik';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { v4 as uuidv4 } from 'uuid';
import AutoCompleteInputComponent from '../../autocompleteinput/AutoCompleteInput.component';
import {
    CircleStackIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

function SearchBar(props) {
    const history = useHistory();
    const { colorMode } = useColorMode();
    const textColor = useColorModeValue('black', 'white');
    const store = useContext(RootStoreContext);
    const [selectedDataset, setSelectedDataset] = useState(0);

    const selectedDatasetChange = e => {
        setSelectedDataset(e.target.value);
        store.search.useDataset(e.target.value);

        store.track.trackEvent(
            JSON.stringify({
                area: 'Home page',
                sub_area: 'Searchbar'
            }),
            JSON.stringify({
                item_type: 'Select element'
            }),
            JSON.stringify({
                event_type: 'Change selection',
                event_action: 'Change dataset',
                event_value: store.search.currentDataset
            })
        );

        store.workflow.resetWorkflow();
        store.overviewSchema.setAnchorProperties([]);
    };

    useEffect(() => {
        store.core.generateStudyUUID();
    }, [store.core]);

    useEffect(() => {
        setSelectedDataset(store.search.currentDatasetIndex);
    }, [store.search.currentDataset, store.search.currentDatasetIndex]);

    const renderDatasetSelectionOptions = () => {
        return store.search.datasets.map((dataset, index) => (
            <option key={dataset} value={index}>
                {dataset}
            </option>
        ));
    };

    const renderSearchHint = () => (
        <Text
            fontSize="xs"
            textAlign="center"
            marginTop="10px"
            color={colorMode === 'light' ? 'blackAlpha.500' : 'whiteAlpha.500'}
            fontWeight="bold"
            role="group"
        >
            <LightBulbIcon
                width="12px"
                style={{
                    display: 'inline',
                    marginBottom: '-2px',
                    marginRight: '2px'
                }}
            />
            Hint: This dataset can be searched by the values in its{' '}
            <Tag
                size="sm"
                opacity="0.7"
                marginRight="4px"
                marginLeft="1px"
                marginTop="-2px"
            >
                {store.search.default_search_features.join(', ').toLowerCase()}
            </Tag>
            field.
        </Text>
    );

    return (
        <Box style={props.style} id="Searchbar">
            <Formik
                initialValues={{ search: '' }}
                onSubmit={values => {
                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Home page',
                            sub_area: 'Searchbar'
                        }),
                        JSON.stringify({
                            item_type: 'Button'
                        }),
                        JSON.stringify({
                            event_type: 'Click',
                            event_action: 'Search',
                            event_value: values.search
                        })
                    );

                    store.track.trackEvent(
                        JSON.stringify({
                            area: 'Global'
                        }),
                        JSON.stringify({
                            item_type: null
                        }),
                        JSON.stringify({
                            event_type: 'Enter study',
                            event_value: store.core.studyUuid
                        })
                    );

                    store.core.setStudyIsEmpty(false);
                    store.search.setSearchIsEmpty(false);
                    props.onSubmit();
                    store.core.setCurrentGraph('overview');
                    store.graphInstance.setNodeColorScheme('component');
                    store.search.useDataset(selectedDataset);
                    store.core.resetVisibleDimensions();
                    store.workflow.resetWorkflow();
                    store.overviewSchema.setAnchorProperties([]);
                    store.core.setStudyHistory([]);
                    store.core.setStudyHistoryItemIndex(0);
                    store.search.setSearchQuery(values.search);
                    store.search.setSearchID(uuidv4());
                    history.push(`/graph?study=${store.core.studyUuid}`);
                }}
            >
                {({ values, handleSubmit, setFieldValue }) => (
                    <Form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                        <InputGroup alignItems="center">
                            {!props.datasetSelectorDisabled && (
                                <CircleStackIcon
                                    style={{
                                        position: 'absolute',
                                        marginLeft: '12px',
                                        width: '14px',
                                        height: '14px',
                                        zIndex: 2,
                                        color: textColor
                                    }}
                                />
                            )}
                            {!props.datasetSelectorDisabled && (
                                <Select
                                    onChange={selectedDatasetChange}
                                    variant="filled"
                                    width="200px"
                                    color={textColor}
                                    borderEndRadius="0"
                                    value={selectedDataset}
                                    style={{
                                        paddingLeft: '40px',
                                        textTransform: 'uppercase',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                    name="dataset-selection"
                                >
                                    {renderDatasetSelectionOptions()}
                                </Select>
                            )}
                            <AutoCompleteInputComponent
                                placeholder={props.placeholder}
                                getSuggestions={value =>
                                    store.search.suggest('', value)
                                }
                                style={{
                                    height: '40px',
                                    borderRadius: '6px',
                                    color: textColor,
                                    borderEndStartRadius:
                                        props.datasetSelectorDisabled
                                            ? '4px'
                                            : '0',
                                    borderStartStartRadius:
                                        props.datasetSelectorDisabled
                                            ? '4px'
                                            : '0'
                                }}
                                suggestionStyle={{
                                    position: 'absolute',
                                    backgroundColor:
                                        colorMode === 'light'
                                            ? '#d7d6d6'
                                            : '#141824',
                                    top: '44px',
                                    left: '145px',
                                    zIndex: '10',
                                    minWidth: '60%'
                                }}
                                name="search"
                                getValue={value =>
                                    setFieldValue('search', value)
                                }
                            />
                            <InputRightElement
                                children={
                                    <IconButton
                                        type="submit"
                                        width="40px"
                                        height="40px"
                                        borderLeftRadius="0"
                                        color={textColor}
                                        backgroundColor={
                                            colorMode === 'light'
                                                ? 'blackAlpha.50'
                                                : 'whiteAlpha.100'
                                        }
                                        icon={
                                            <MagnifyingGlassIcon
                                                style={{
                                                    width: '14px',
                                                    height: '14px'
                                                }}
                                            />
                                        }
                                    />
                                }
                            />
                        </InputGroup>
                    </Form>
                )}
            </Formik>

            {store.search.default_search_features &&
                store.search.default_search_features.length > 0 &&
                renderSearchHint()}
        </Box>
    );
}

SearchBar.propTypes = {
    datasetSelectorDisabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onSubmit: PropTypes.func
};

SearchBar.defaultProps = {
    datasetSelectorDisabled: false,
    placeholder: 'Search through the selected dataset ...',
    onSubmit: () => {}
};

export default observer(SearchBar);
