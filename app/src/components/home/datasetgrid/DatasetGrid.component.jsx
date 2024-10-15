import "overlayscrollbars/overlayscrollbars.css";

import {
  Box,
  Heading,
  SimpleGrid,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { isEnvFalse, isEnvTrue } from "utils/general.utils";

import CustomScroll from "components/customscroll/CustomScroll.component";
import { DocumentTextIcon } from "@heroicons/react/20/solid";
import { FileUploadArea } from "components/fileupload/FileUploadArea.component";
import PropTypes from "prop-types";
import { observer } from "mobx-react";

function DatasetGrid(props) {
  const gridBGColor = useColorModeValue("blackAlpha.100", "blackAlpha.300");
  const textColor = useColorModeValue("black", "white");

  const renderDatasets = () => (
    <Box width="100%" padding="0 10px" style={{ margin: 0 }}>
      <CustomScroll style={{ paddingRight: "10px", paddingLeft: "10px" }}>
        <SimpleGrid
          width="100%"
          columns={[1, 1, 2]}
          spacing="10px"
          maxHeight="156px"
          marginBottom="0"
          borderRadius="8px"
          style={{ marginTop: 0 }}
        >
          {props.children}
        </SimpleGrid>
      </CustomScroll>
    </Box>
  );

  return (
    (isEnvFalse("VITE_DISABLE_DATASET_LIST") ||
      isEnvFalse("VITE_DISABLE_UPLOAD")) && (
      <VStack
        marginTop="40px"
        backgroundColor={gridBGColor}
        borderRadius="12px"
        paddingBottom={isEnvTrue("VITE_DISABLE_UPLOAD") && "50px"}
        id="DatasetGrid"
      >
        <Heading
          colSpan={2}
          size="sm"
          opacity="0.76"
          height="50px"
          width="100%"
          textAlign="center"
          lineHeight="50px"
          color={textColor}
        >
          <DocumentTextIcon
            width="18px"
            height="18px"
            style={{
              display: "inline",
              marginBottom: "-2px",
              marginRight: "10px",
            }}
          />
          Datasets
        </Heading>
        {isEnvFalse("VITE_DISABLE_DATASET_LIST") && renderDatasets()}
        {isEnvFalse("VITE_DISABLE_UPLOAD") && <FileUploadArea />}
      </VStack>
    )
  );
}
DatasetGrid.propTypes = {
  children: PropTypes.node,
};

const ObservedDatasetGrid = observer(DatasetGrid);
export default ObservedDatasetGrid;
