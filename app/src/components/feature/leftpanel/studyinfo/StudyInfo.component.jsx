import { Heading, HStack, Stack, VStack } from '@chakra-ui/layout';
import {
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    EditableTextarea,
    Switch,
    Text,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function StudyInfo() {
    const store = useContext(RootStoreContext);
    const { colorMode } = useColorMode();

    return (
        <Stack
            align="center"
            direction="column"
            paddingLeft="0"
            id="studyinfocomponent"
            width="100%"
            alignItems="start"
        >
            <VStack
                width="100%"
                backgroundColor="whiteAlpha.200"
                padding="10px"
                borderRadius="10px"
            >
                <Heading size="sm" width="100%">
                    Study settings
                </Heading>
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    opacity="0.7"
                    width="100%"
                >
                    Study name:
                </Text>
                <Tooltip label={store.core.studyName}>
                    <Editable
                        value={store.core.studyName}
                        onSubmit={val => {
                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'Left panel',
                                    sub_area: 'Study info'
                                }),
                                JSON.stringify({
                                    item_type: 'Editable element'
                                }),
                                JSON.stringify({
                                    event_type: 'Write',
                                    event_action: 'Change study name',
                                    event_value: val
                                })
                            );

                            store.core.updateStudyName(val);
                        }}
                        fontSize="sm"
                        onChange={val => store.core.setStudyName(val)}
                        onFocus={() => store.comment.setCommentTrigger(false)}
                        onBlur={() => store.comment.setCommentTrigger(true)}
                        width="100%"
                    >
                        <EditablePreview
                            size="xs"
                            maxWidth="100%"
                            width="100%"
                            minWidth="40px"
                            height="30px"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            paddingLeft="10px"
                            fontWeight="bold"
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.200'
                            }
                            display="inline-block"
                            paddingRight="10px"
                        />
                        <EditableInput
                            size="xs"
                            width="100%"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            paddingLeft="10px"
                            fontWeight="bold"
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.200'
                            }
                            display="inline-block"
                            paddingRight="10px"
                        />
                    </Editable>
                </Tooltip>

                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    opacity="0.7"
                    width="100%"
                >
                    Study description:
                </Text>
                <Tooltip
                    label={
                        store.core.studyDescription === ''
                            ? 'Click here to add a study description'
                            : store.core.studyDescription
                    }
                >
                    <Editable
                        value={store.core.studyDescription}
                        onSubmit={val => {
                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'Left panel',
                                    sub_area: 'Study info'
                                }),
                                JSON.stringify({
                                    item_type: 'Editable element'
                                }),
                                JSON.stringify({
                                    event_type: 'Write',
                                    event_action: 'Change study description',
                                    event_value: val
                                })
                            );

                            store.core.updateStudyDescription(val);
                        }}
                        fontSize="sm"
                        onChange={val => store.core.setStudyDescription(val)}
                        onFocus={() => store.comment.setCommentTrigger(false)}
                        onBlur={() => store.comment.setCommentTrigger(true)}
                        width="100%"
                        placeholder="Click here to add a study description. 👀"
                    >
                        <EditablePreview
                            size="xs"
                            width="100%"
                            paddingLeft="10px"
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.200'
                            }
                            display="inline-block"
                            paddingRight="10px"
                        />
                        <EditableTextarea
                            size="xs"
                            width="100%"
                            paddingLeft="8px"
                        />
                    </Editable>
                </Tooltip>
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    opacity="0.7"
                    width="100%"
                >
                    Study author
                </Text>
                <Tooltip label="The study author name">
                    <Editable
                        value={store.core.studyAuthor}
                        onSubmit={val => {
                            store.track.trackEvent(
                                JSON.stringify({
                                    area: 'Left panel',
                                    sub_area: 'Study info'
                                }),
                                JSON.stringify({
                                    item_type: 'Editable element'
                                }),
                                JSON.stringify({
                                    event_type: 'Write',
                                    event_action: 'Change study author',
                                    event_value: val
                                })
                            );
                            store.core.updateStudyAuthor(val);
                        }}
                        onChange={val => store.core.setStudyAuthor(val)}
                        onFocus={() => store.comment.setCommentTrigger(false)}
                        onBlur={() => store.comment.setCommentTrigger(true)}
                        width="100%"
                        fontSize="sm"
                    >
                        <EditablePreview
                            size="xs"
                            width="100%"
                            maxWidth="100%"
                            minWidth="40px"
                            height="30px"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            paddingLeft="10px"
                            fontWeight="bold"
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.200'
                            }
                            display="inline-block"
                            paddingRight="10px"
                        />
                        <EditableInput
                            size="xs"
                            width="100%"
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            paddingLeft="10px"
                            fontWeight="bold"
                            backgroundColor={
                                colorMode === 'light'
                                    ? 'blackAlpha.200'
                                    : 'whiteAlpha.200'
                            }
                            display="inline-block"
                            paddingRight="10px"
                        />
                    </Editable>
                </Tooltip>
                <Text
                    fontSize="xs"
                    fontWeight="bold"
                    opacity="0.7"
                    width="100%"
                >
                    Selected index:
                </Text>

                <Text
                    fontSize="sm"
                    paddingLeft="8px"
                    width="100%"
                    fontWeight="bold"
                >
                    {store.search.currentDataset}
                </Text>

                <Button
                    width="100%"
                    size="sm"
                    disabled={store.core.studyIsSaved}
                    onClick={() => {
                        store.track.trackEvent(
                            JSON.stringify({
                                area: 'Left panel',
                                sub_area: 'Study info'
                            }),
                            JSON.stringify({
                                item_type: 'Button'
                            }),
                            JSON.stringify({
                                event_type: 'Click',
                                event_action: 'Save study'
                            })
                        );

                        store.core.saveStudy();
                    }}
                    style={{ marginBottom: '10px' }}
                    _hover={{ backgroundColor: 'blue.500' }}
                    _disabled={{ backgroundColor: 'blue.500', opacity: 0.5 }}
                >
                    {store.core.studyIsSaved ? 'Saved' : 'Save'}
                    <HeartIcon
                        style={{
                            width: '14px',
                            height: '14px',
                            marginLeft: '10px'
                        }}
                    />
                </Button>
            </VStack>
            <VStack
                width="100%"
                backgroundColor="whiteAlpha.200"
                padding="10px"
                borderRadius="10px"
                style={{ marginTop: '20px' }}
            >
                <Heading size="sm" width="100%">
                    Presentation settings
                </Heading>
                <Tooltip
                    label={
                        store.core.isStudyPublic
                            ? 'Make study private'
                            : 'Make study public'
                    }
                >
                    <HStack
                        spacing="1"
                        width="100%"
                        justifyContent="space-between"
                    >
                        <Text fontSize="sm">Public</Text>
                        <Switch
                            id="curvedEdges"
                            size="sm"
                            isDisabled={!store.core.studyIsSaved}
                            marginRight="10px"
                            isChecked={store.core.isStudyPublic}
                            value={store.core.isStudyPublic}
                            onChange={() => {
                                store.core.toggleIsStudyPublic();

                                store.track.trackEvent(
                                    JSON.stringify({
                                        area: 'Left panel',
                                        sub_area: 'Study info'
                                    }),
                                    JSON.stringify({
                                        item_type: 'Switch'
                                    }),
                                    JSON.stringify({
                                        event_type: 'Toggle',
                                        event_action: store.core.isStudyPublic
                                            ? 'Make presentation public'
                                            : 'Make presentation private'
                                    })
                                );
                            }}
                        />
                    </HStack>
                </Tooltip>
                {store.core.isStudyPublic && (
                    <>
                        <Text fontSize="xs" fontWeight="bold" width="100%">
                            Access Link:
                        </Text>
                        <Text
                            fontSize="xs"
                            fontWeight="bold"
                            opacity="0.8"
                            color="blue.500"
                            marginTop="0"
                            width="100%"
                            _hover={{ opacity: 1 }}
                        >
                            {`${store.core.getBasePresentURL()}?pstudy=${
                                store.core.studyPublicURL
                            }`}
                        </Text>
                        <Text
                            fontSize="xs"
                            fontWeight="bold"
                            opacity="0.5"
                            marginTop="0"
                            width="100%"
                        >
                            Anyone with this link can access your study in
                            presentation mode.
                        </Text>
                    </>
                )}
            </VStack>
        </Stack>
    );
}

export default observer(StudyInfo);
