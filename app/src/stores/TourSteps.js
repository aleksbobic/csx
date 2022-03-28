import { Heading, List, ListItem, Text, VStack } from '@chakra-ui/layout';
import { Tag } from '@chakra-ui/tag';
import { Bulb } from 'css.gg';

export const tourSteps = [
    {
        title: (
            <Heading size="md" as="p">
                Welcome!
            </Heading>
        ),
        target: '#graph',
        content: (
            <Text textAlign="left">
                Welcome to Collaboration Spotting X! Follow this guide by
                <b> clicking next</b> or <b>spacebar</b> to learn the basics of
                CSX.
            </Text>
        ),
        offset: 0,
        placement: 'center'
    },
    {
        title: (
            <Heading size="md" as="p">
                Graph
            </Heading>
        ),
        target: '#graph',
        content: (
            <VStack>
                <Text textAlign="left" marginBottom="5">
                    The retrieved dataset is displayed in the form of nodes and
                    edges. The graph is interpreted in the following way:
                </Text>
                <List spacing="2">
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Nodes
                            </Tag>{' '}
                            represent dataset values.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Colors
                            </Tag>{' '}
                            represent node communities.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Sizes
                            </Tag>{' '}
                            corespond to value frequencies.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Connections
                            </Tag>{' '}
                            indicate value co-occurrence.
                        </Text>
                    </ListItem>
                </List>
            </VStack>
        ),
        offset: 0,
        placement: 'bottom'
    },
    {
        title: (
            <Heading size="md" as="p">
                Control Panel
            </Heading>
        ),
        target: '#controlpanelslide > div',
        content: (
            <Text textAlign="left" marginBottom="5">
                Use the control panel to{' '}
                <b>configure graph display properties</b> and{' '}
                <b>navigate to different graphs</b>.
            </Text>
        ),
        offset: 0,
        placement: 'right'
    },
    {
        title: (
            <Heading size="md" as="p">
                Navigation
            </Heading>
        ),
        target: '#controlpanelslide > div',
        content: (
            <Text textAlign="left">
                The navigation tab can be used to{' '}
                <b>navigate to different graphs</b>. Click next to see what
                happens when you navigate to a new graph.
            </Text>
        ),
        offset: 0,
        placement: 'right-start'
    },
    {
        title: (
            <Heading size="md" as="p">
                Navigation
            </Heading>
        ),
        target: '#controlpanelslide > div',
        content: (
            <Text textAlign="left">
                The graph data changes and a new graph is loaded. Next we will
                investigate how you can explore the graph data.
            </Text>
        ),
        offset: 0,
        placement: 'right-start'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#controlpanelslide > div',
        content: (
            <Text textAlign="left">
                The view settings tab enables you to{' '}
                <b>adjust a variety of graph visual properties</b>.
            </Text>
        ),
        offset: 0,
        placement: 'right-start'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#controlpanelslide > div',
        content: (
            <Text textAlign="left">
                The{' '}
                <Tag variant="solid" borderRadius="full" size="sm">
                    color scheme
                </Tag>{' '}
                <b>adjusts the node coloring</b>. Click next to see what happens
                when the color scheme changes.
            </Text>
        ),
        offset: 0,
        placement: 'right-start'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#controlpanelslide > div',
        content: (
            <Text textAlign="left">
                The "Node type" color scheme colors the nodes{' '}
                <b>based on the dataset feature (attribute) they represent</b>.
            </Text>
        ),
        offset: 0,
        placement: 'right-start'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#colorscheme',
        content: (
            <Text textAlign="left">
                The legend explains which colors represent which features.
            </Text>
        ),
        offset: 0,
        placement: 'top'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#viewsettingscomponent',
        content: (
            <Text textAlign="left">
                Sometimes nodes overlap or are just not positioned in a
                convenient easy to digest way. In those cases we can press the "
                <Tag variant="solid" borderRadius="full" size="sm">
                    apply force
                </Tag>{' '}
                button to <b>automatically reposition the nodes</b>. Click next
                to see what happens when we apply force.
            </Text>
        ),
        offset: 0,
        placement: 'right'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#viewsettingscomponent',
        content: (
            <VStack>
                <Text marginBottom="5" textAlign="left">
                    The nodes reposition themselves based on a force directed
                    layout. Once the repositioning is done you can apply the
                    force again.
                </Text>
                <List spacing="2">
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            In case you wish to reset the layout you can always
                            press the{' '}
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Reset Layout
                            </Tag>{' '}
                            button.
                        </Text>
                    </ListItem>
                </List>
            </VStack>
        ),
        offset: 0,
        placement: 'right'
    },

    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#datapnaletoggle',
        content: (
            <Text textAlign="left">
                Click this button to open the data panel.
            </Text>
        ),
        offset: 0,
        placement: 'bottom'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#datapanel',
        content: (
            <VStack>
                <Text marginBottom="5" textAlign="left" width="100%">
                    This panel displays the <b>graph details</b>.
                </Text>
                <List spacing="2">
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            The{' '}
                            <Tag variant="solid" borderRadius="full" size="sm">
                                General
                            </Tag>{' '}
                            section displays the basic graph statistics.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            The{' '}
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Node types
                            </Tag>{' '}
                            sections displays the count of each node type.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            The{' '}
                            <Tag variant="solid" borderRadius="full" size="sm">
                                Connected using
                            </Tag>{' '}
                            section indicates that nodes which have a paper id
                            in common are connected.
                        </Text>
                    </ListItem>
                </List>
            </VStack>
        ),
        offset: 0,
        placement: 'left'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#datapanel',
        content: (
            <VStack>
                <Text marginBottom="5" textAlign="left">
                    This is the list of all nodes in the graph. These are a few
                    actions you can perform using this list:
                </Text>
                <List spacing="2">
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            Search through nodes.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            Click a node name to focus on it in the graph.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            Sort nodes by name or type by clicking on the
                            respective headers.
                        </Text>
                    </ListItem>
                </List>
            </VStack>
        ),
        offset: 0,
        placement: 'left'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#graph',
        content: (
            <VStack>
                <Text marginBottom="5" textAlign="left">
                    You can click on a node to open the context menu and perform
                    multiple actions:
                </Text>
                <List spacing="2">
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            Select a node.
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            Inspect nodes directly connected to the clicked
                            node.
                        </Text>
                    </ListItem>
                </List>
                <Text textAlign="left">
                    Click next to learn more about exploring direct connections
                </Text>
            </VStack>
        ),
        offset: 0,
        placement: 'bottom'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#graph',
        content: (
            <Text textAlign="left">
                This view displays all nodes directly connected to the country
                Austria through the paper id or in other words all properties of
                papers which had at least one author from Austria.
            </Text>
        ),
        offset: 0,
        placement: 'bottom'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#directconnectionsmenu',
        content: (
            <VStack>
                <Text marginBottom="5" textAlign="left">
                    This is the direct connections menu. It is used to:
                </Text>
                <List spacing="2">
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            exit from the direct connections view
                        </Text>
                    </ListItem>
                    <ListItem>
                        <Text
                            textAlign="left"
                            fontStyle="italic"
                            fontSize="sm"
                            fontWeight="bold"
                        >
                            <Bulb
                                style={{
                                    display: 'inline-block',
                                    marginRight: '5px',
                                    '--ggs': '0.7'
                                }}
                            />
                            perform advanced opeartions in case there is more
                            than one node selected
                        </Text>
                    </ListItem>
                </List>
                <Text textAlign="left">
                    Click next to see what are some of the options you can
                    perform with more than one node selected.{' '}
                    <b>Observe what happens with the graph.</b>
                </Text>
            </VStack>
        ),
        offset: 0,
        placement: 'bottom'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#directconnectionsmenu',
        content: (
            <Text textAlign="left">
                This graph displays only the mutual connections between the node{' '}
                <b>Austria</b> and a <b>paper title</b> node. You can also
                inspect connections which are not mutual by pressing the{' '}
                <b>show direct connections of selected nodes</b> button.
            </Text>
        ),
        offset: 0,
        placement: 'bottom'
    },
    {
        title: (
            <Heading size="md" as="p">
                Exploration
            </Heading>
        ),
        target: '#viewutils',
        content: (
            <Text textAlign="left">
                Click on the left button to <b>make a screenshot</b> and
                download it as a png. Click on the right button to{' '}
                <b>reposition the camera to the original location</b>.
            </Text>
        ),
        offset: 0,
        placement: 'top'
    },
    {
        title: (
            <Heading size="md" as="p">
                The End
            </Heading>
        ),
        target: '#homelink',
        content: (
            <Text textAlign="left">
                Congratulations you've made it to the end of this tutorial! Feel
                free to further explore the getting start graph. You can start
                the tutorial again by opening the getting started dataset again.
                Once you feel ready click the logo to navigte home and start
                exploring other graphs.
            </Text>
        ),
        offset: 0,
        isFixed: true,
        placement: 'top'
    }
];
