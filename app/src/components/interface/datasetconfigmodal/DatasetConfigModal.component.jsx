import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext, useEffect } from "react";

import DatasetConfigComponent from "components/feature/datasetconfig/DatasetConfig.component";
import { RootStoreContext } from "stores/RootStore";
import { observer } from "mobx-react";

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
      </ModalContent>
    </Modal>
  );
}

export default observer(DatasetConfigModal);
