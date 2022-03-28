import {
    Button,
    Center,
    Container,
    Heading,
    HStack,
    IconButton,
    Input,
    InputGroup,
    Radio,
    RadioGroup,
    Select,
    Tag,
    Text,
    VStack,
    Wrap
} from '@chakra-ui/react';
import { Add, Close, Search } from 'css.gg';
import { Form, Formik } from 'formik';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { useContext, useRef, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { RootStoreContext } from 'stores/RootStore';
import { useEffect } from 'react';
import queryString from 'query-string';

function SearchPage(props) {
    const input = useRef();
    const location = useLocation();
    const history = useHistory();
    const selection = useRef();
    const store = useContext(RootStoreContext);
    const [tags, setTags] = useState(
        store.graph.currentGraphData.selectedNodes.map(entry => {
            return {
                label: entry['label'],
                type: entry['attribute']
            };
        }) || []
    );

    const [connector, setConnector] = useState('or');

    const addTag = (label, type) => {
        if (
            label &&
            tags.findIndex(tag => tag.label === label && tag.type === type) < 0
        ) {
            setTags([...tags, { label: label, type: type }]);
        }
    };

    useEffect(() => {
        if (!queryString.parse(location.search).query) {
            history.push('/');
        }
    }, [history, location.search]);

    const removeTag = (label, type) => {
        setTags(tags.filter(tag => tag.label !== label || tag.type !== type));
    };

    const search = () => {
        store.core.setCurrentGraph('overview');
        history.push(
            `/graph?query=${JSON.stringify(tags)}&dataset=${
                store.search.currentDataset
            }`
        );
    };

    const renderSelectedNodes = () => {
        const selectedNodes = {};

        store.search.nodeTypes.forEach(type => {
            selectedNodes[type] = [];
        });

        return tags.map((entry, index) => (
            <Tag
                backgroundColor={
                    store.graphInstance.nodeColorSchemeColors[
                        store.core.currentGraph
                    ][entry['type']]
                }
                key={index}
                size="sm"
                borderRadius="full"
                variant="solid"
                transition="all 0.1s ease-in-out"
                paddingLeft="10px"
                paddingRight="2px"
                paddingTop="2px"
                paddingBottom="2px"
            >
                <Text
                    size="sm"
                    whiteSpace="nowrap"
                    letterSpacing="0.5px"
                    fontWeight="semibold"
                    aria-valuetext={entry['type']}
                    maxWidth="150px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    title={entry['label']}
                >
                    {entry['label']}
                </Text>
                <IconButton
                    icon={<Close style={{ '--ggs': '0.5' }} />}
                    borderRadius="full"
                    variant="ghost"
                    size="xs"
                    marginLeft="6px"
                    _hover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    onClick={() => removeTag(entry['label'], entry['type'])}
                />
            </Tag>
        ));
    };

    return (
        <Container minWidth="100%" paddingBottom="50px">
            <Container
                paddingTop="50px"
                marginBottom="150px"
                maxW="container.sm"
            >
                <Heading size="lg" textAlign="center" marginTop="50px">
                    Dataset Search
                </Heading>

                <Text
                    textAlign="center"
                    paddingLeft="50px"
                    paddingRight="50px"
                    marginTop="25px"
                    fontSize="sm"
                    marginBottom="25px"
                >
                    Search through one of many datasets and explore results as a
                    multidimensional graph.
                </Text>

                <Center>
                    <VStack>
                        <Formik
                            initialValues={{
                                keyphrase: '',
                                type: store.search.nodeTypes[0]
                            }}
                            onSubmit={values => {
                                addTag(values.keyphrase, values.type);
                                input.current.value = '';
                                values.keyphrase = '';
                            }}
                        >
                            {({
                                values,
                                handleSubmit,
                                handleChange
                                /* and other goodies */
                            }) => (
                                <Form
                                    onSubmit={handleSubmit}
                                    style={{ flexGrow: 1 }}
                                >
                                    <InputGroup alignItems="center">
                                        <HStack spacing="0" marginBottom="20px">
                                            <Select
                                                ref={selection}
                                                size="sm"
                                                width="150px"
                                                variant="filled"
                                                borderStartRadius="md"
                                                borderEndRadius="0px"
                                                name="type"
                                                value={values.type}
                                                onChange={handleChange}
                                            >
                                                {store.search.nodeTypes.map(
                                                    (type, index) => (
                                                        <option
                                                            key={`node_type_${index}`}
                                                        >
                                                            {type}
                                                        </option>
                                                    )
                                                )}
                                            </Select>
                                            <Input
                                                ref={input}
                                                variant="filled"
                                                placeholder="Enter a keyphrase ..."
                                                size="sm"
                                                borderRadius="0px"
                                                width="300px"
                                                name="keyphrase"
                                                value={values.keyphrase}
                                                onChange={handleChange}
                                            />
                                            <IconButton
                                                icon={
                                                    <Add
                                                        style={{
                                                            '--ggs': 0.7
                                                        }}
                                                    />
                                                }
                                                size="sm"
                                                variant="solid"
                                                borderRadius="md"
                                                borderStartRadius="unset"
                                                onClick={handleSubmit}
                                            />
                                        </HStack>
                                    </InputGroup>
                                </Form>
                            )}
                        </Formik>

                        <RadioGroup
                            onChange={setConnector}
                            value={connector}
                            size="sm"
                        >
                            <HStack>
                                <Text fontSize="sm">
                                    Connect keyphrases using:{' '}
                                </Text>
                                <Radio value="or">OR</Radio>
                                <Radio value="and">AND</Radio>
                            </HStack>
                        </RadioGroup>

                        <Wrap
                            marginTop="20px"
                            justifyContent="center"
                            style={{ marginTop: '20px', marginBottom: '20px' }}
                        >
                            {renderSelectedNodes()}
                        </Wrap>

                        <Button
                            size="sm"
                            variant="solid"
                            borderRadius="md"
                            rightIcon={<Search style={{ '--ggs': 0.7 }} />}
                            onClick={() => search()}
                        >
                            Search
                        </Button>
                    </VStack>
                </Center>
            </Container>
        </Container>
    );
}

SearchPage.propTypes = {
    history: PropTypes.object
};

export default withRouter(observer(SearchPage));
