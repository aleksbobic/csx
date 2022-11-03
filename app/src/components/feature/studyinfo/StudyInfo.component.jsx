import { Stack } from '@chakra-ui/layout';
import {
    Button,
    Editable,
    EditableInput,
    EditablePreview,
    Tag,
    Tooltip,
    Text,
    EditableTextarea
} from '@chakra-ui/react';
import { Check, Heart } from 'css.gg';
import { observer } from 'mobx-react';
import { useContext } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function StudyInfo() {
    const store = useContext(RootStoreContext);

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
            <Tag size="sm">Study name:</Tag>

            <Tooltip label={store.core.studyName}>
                <Editable
                    value={store.core.studyName}
                    onSubmit={val => store.core.updateStudyName(val)}
                    onChange={val => store.core.setStudyName(val)}
                    width="100%"
                >
                    <EditablePreview
                        size="xs"
                        textTransform="uppercase"
                        width="100%"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        paddingLeft="8px"
                        fontWeight="bold"
                    />
                    <EditableInput
                        size="xs"
                        textTransform="uppercase"
                        width="100%"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        paddingLeft="8px"
                        fontWeight="bold"
                    />
                </Editable>
            </Tooltip>

            <Tag size="sm">Study description:</Tag>
            <Tooltip
                label={
                    store.core.studyDescription === ''
                        ? 'Click here to add a study description'
                        : store.core.studyDescription
                }
            >
                <Editable
                    value={store.core.studyDescription}
                    onSubmit={val => store.core.updateStudyDescription(val)}
                    onChange={val => store.core.setStudyDescription(val)}
                    width="100%"
                    placeholder="Click here to add a study description. 👀"
                >
                    <EditablePreview size="xs" width="100%" paddingLeft="8px" />
                    <EditableTextarea
                        size="xs"
                        width="100%"
                        paddingLeft="8px"
                    />
                </Editable>
            </Tooltip>
            <Tag size="sm">Selected index:</Tag>
            <Text fontSize="sm" paddingLeft="8px">
                {store.search.currentDataset}
            </Text>

            <Button
                width="100%"
                size="sm"
                disabled={store.core.studyIsSaved}
                onClick={() => store.core.saveStudy()}
            >
                {store.core.studyIsSaved ? 'Saved' : 'Save'}
                <Heart style={{ '--ggs': '0.7', marginLeft: '10px' }} />
            </Button>
        </Stack>
    );
}

export default observer(StudyInfo);
