import {
    Center,
    IconButton,
    InputGroup,
    InputRightElement,
    Select,
    useColorMode
} from '@chakra-ui/react';
import { Database, Search } from 'css.gg';
import { Form, Formik } from 'formik';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { v4 as uuidv4 } from 'uuid';
import AutoCompleteInputComponent from '../autocompleteinput/AutoCompleteInput.component';

function SearchBar(props) {
    const history = useHistory();
    const { colorMode } = useColorMode();
    const store = useContext(RootStoreContext);
    const [selectedDataset, setSelectedDataset] = useState(0);

    const selectedDatasetChange = e => {
        setSelectedDataset(e.target.value);
        store.search.useDataset(e.target.value);
        store.workflow.resetWorkflow();
        store.schema.resetOverviewNodeProperties();
    };

    const renderDatasetSelectionOptions = () => {
        return store.search.datasets.map((dataset, index) => (
            <option key={dataset} value={index}>
                {dataset}
            </option>
        ));
    };

    return (
        <Center style={props.style}>
            <Formik
                initialValues={{ search: '' }}
                onSubmit={values => {
                    store.core.setCurrentGraph('overview');
                    store.search.useDataset(selectedDataset);
                    store.core.resetVisibleDimensions();
                    store.workflow.resetWorkflow();
                    store.schema.resetOverviewNodeProperties();
                    history.push(
                        `/graph?query=${values.search}&dataset=${
                            store.search.datasets[selectedDataset]
                        }&suuid=${uuidv4()}`
                    );
                }}
            >
                {({ values, handleSubmit, setFieldValue }) => (
                    <Form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
                        <InputGroup alignItems="center">
                            {!props.datasetSelectorDisabled && (
                                <Database
                                    color={
                                        colorMode === 'light'
                                            ? 'black'
                                            : 'white'
                                    }
                                    style={{
                                        position: 'absolute',
                                        marginLeft: '12px',
                                        '--ggs': '0.8',
                                        zIndex: 2
                                    }}
                                />
                            )}
                            {!props.datasetSelectorDisabled && (
                                <Select
                                    onChange={selectedDatasetChange}
                                    variant="filled"
                                    width="200px"
                                    borderEndRadius="0"
                                    defaultValue={selectedDataset}
                                    style={{
                                        paddingLeft: '40px',
                                        textTransform: 'uppercase',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
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
                                    borderRadius: '0px',
                                    borderStartRadius:
                                        props.datasetSelectorDisabled
                                            ? '4px'
                                            : '0'
                                }}
                                suggestionStyle={{
                                    position: 'absolute',
                                    backgroundColor: 'black',
                                    top: '40px',
                                    left: '145px',
                                    zIndex: '10'
                                }}
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
                                        icon={
                                            <Search
                                                style={{
                                                    '--ggs': '0.9'
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
        </Center>
    );
}

SearchBar.propTypes = {
    datasetSelectorDisabled: PropTypes.bool,
    placeholder: PropTypes.string
};

SearchBar.defaultProps = {
    datasetSelectorDisabled: false,
    placeholder: 'Search through the dataset ...'
};

export default observer(SearchBar);
