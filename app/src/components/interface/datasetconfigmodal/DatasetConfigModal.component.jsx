import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure
} from '@chakra-ui/react';
import DatasetConfigComponent from 'components/feature/datasetconfig/DatasetConfig.component';
import { observer } from 'mobx-react';
import { useContext, useEffect } from 'react';
import { RootStoreContext } from 'stores/RootStore';

function DatasetConfigModal() {
    const store = useContext(RootStoreContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (store.fileUpload.showConfigChangeModal) {
            onOpen();
        } else if (!store.fileUpload.showConfigChangeModal && isOpen) {
            onClose();
        }
    }, [isOpen, onClose, onOpen, store.fileUpload.showConfigChangeModal]);

    const updateConfig = () => {
        store.track.trackEvent(
            'dataset config modal',
            'button click',
            'update default config'
        );
        store.fileUpload.updateConfig();
    };

    const cancelSettingsEdit = () => {
        store.track.trackEvent(
            'dataset config modal',
            'button click',
            'cancel'
        );
        store.fileUpload.changeConfigChangeModalVisiblity(false);
        store.fileUpload.resetFileUploadData();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            isCentered
            closeOnEsc={false}
            closeOnOverlayClick={false}
        >
            <ModalOverlay bg="none" backdropFilter="auto" backdropBlur="2px" />
            <ModalContent width="748px" minWidth="748px" maxWidth="748px">
                <ModalHeader>Dataset config change</ModalHeader>
                {isOpen && (
                    <ModalBody overflowY="scroll" width="748px">
                        <DatasetConfigComponent formType="modify" />
                    </ModalBody>
                )}

                {store.fileUpload.fileUploadData.name !== '' && (
                    <ModalFooter>
                        <Button
                            variant="outline"
                            mr={3}
                            onClick={cancelSettingsEdit}
                        >
                            Cancel
                        </Button>
                        <Button variant="solid" onClick={() => updateConfig()}>
                            Update config
                        </Button>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    );
}

export default observer(DatasetConfigModal);
