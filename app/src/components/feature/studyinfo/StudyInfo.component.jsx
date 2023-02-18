import { Divider, Stack } from '@chakra-ui/layout';
import {
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    EditableTextarea,
    Text,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { Heart } from 'css.gg';
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
            paddingRight="10px"
            id="studyinfocomponent"
            width="100%"
            alignItems="start"
        >
            <Text fontSize="xs" fontWeight="bold" opacity="0.7">
                Study name:
            </Text>
            <Tooltip label={store.core.studyName}>
                <Editable
                    value={store.core.studyName}
                    onSubmit={val => {
                        store.track.trackEvent(
                            'Side Panel - Study Info',
                            'Editable Element - Study Name',
                            JSON.stringify({
                                type: 'Write',
                                value: val
                            })
                        );
                        store.core.updateStudyName(val);
                    }}
                    onChange={val => store.core.setStudyName(val)}
                    onFocus={() => store.comment.setCommentTrigger(false)}
                    onBlur={() => store.comment.setCommentTrigger(true)}
                    width="100%"
                >
                    <EditablePreview
                        size="xs"
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

            <Text fontSize="xs" fontWeight="bold" opacity="0.7">
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
                            'Side Panel - Study Info',
                            'Editable Element - Study Description',
                            JSON.stringify({
                                type: 'Write',
                                value: val
                            })
                        );

                        store.core.updateStudyDescription(val);
                    }}
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
            <Text fontSize="xs" fontWeight="bold" opacity="0.7">
                Selected index:
            </Text>

            <Text fontSize="sm" paddingLeft="8px">
                {store.search.currentDataset}
            </Text>

            <Button
                width="100%"
                size="sm"
                disabled={store.core.studyIsSaved}
                onClick={() => {
                    store.track.trackEvent(
                        'Side Panel - Study Info',
                        'Button',
                        JSON.stringify({
                            type: 'Click',
                            value: 'Save study'
                        })
                    );
                    store.core.saveStudy();
                }}
            >
                {store.core.studyIsSaved ? 'Saved' : 'Save'}
                <Heart style={{ '--ggs': '0.7', marginLeft: '10px' }} />
            </Button>
            <Divider style={{ opacity: 0.2 }} />

            <Text fontSize="xs" fontWeight="bold" opacity="0.7">
                Study author
            </Text>
            <Tooltip label="The study author name">
                <Editable
                    value={store.core.studyAuthor}
                    onSubmit={val => {
                        store.track.trackEvent(
                            'Side Panel - Study Info',
                            'Editable Element - Study author',
                            JSON.stringify({
                                type: 'Write',
                                value: val
                            })
                        );
                        store.core.updateStudyAuthor(val);
                    }}
                    onChange={val => store.core.setStudyAuthor(val)}
                    onFocus={() => store.comment.setCommentTrigger(false)}
                    onBlur={() => store.comment.setCommentTrigger(true)}
                    width="100%"
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
        </Stack>
    );
}

export default observer(StudyInfo);
