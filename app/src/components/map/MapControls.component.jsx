// // 12 - make the MapControls component for making mapcomponent more clean
// import React from "react";
// import { Box, Button, Tooltip, Select } from "@chakra-ui/react";
// import {
//   FingerPrintIcon,
//   ChartBarIcon,
//   ArrowUturnLeftIcon,
// } from "@heroicons/react/24/outline";

// const MapControls = ({
//   viewType,
//   toggleView,
//   // isRightPanelOpen, // new18 - remove the isRightPanelOpen prop due to the removal of the right panel
//   // toggleRightPanel, // new18 - remove the toggleRightPanel function due to the removal of the right panel
//   isHeatmapVisible,
//   toggleHeatmap,
//   selectedLayout,
//   handleLayoutChange,
//   resetView, // NEW16: Pass the reset function for direct connections
//   isFiltered, // NEW16: Add isFiltered prop
// }) => {
//   return (
//     //  New3- Add a button to switch between overview and detail view
//     <Box
//       position="absolute"
//       top={"4em"}
//       right={"0.5em"} //new18 - change the postion of controls to the right due to the removal of the right panel
//       zIndex="1"
//       overflow={"hidden"}
//       display={"flex"}
//       flexDir={"row"}
//       gap={"0.5em"}
//       flexWrap={"wrap"}
//       alignItems={"center"}
//       justifyContent={"start"}
//       width={"21em"}
//       height={"auto"}
//     >
//       <Tooltip
//         label={
//           viewType === "overview"
//             ? "Switch to detail view"
//             : "Switch to overview view"
//         }
//       >
//         <Button
//           id="switch-view"
//           onClick={toggleView}
//           colorScheme="purple"
//           color={"purple.700"}
//           size={{ base: "sm", md: "md" }}
//           aria-label="Switch view"
//         >
//           <Box as={FingerPrintIcon} w={6} h={6} />
//         </Button>
//       </Tooltip>
//       {/* new9 - add a button to toggle the right panel //new18- removing rightpanel button */}
//       {/* <Tooltip
//         label={isRightPanelOpen ? "Close Right Panel" : "Open Right Panel"}
//       >
//         <Button
//           id="toggle-right-panel"
//           onClick={toggleRightPanel}
//           colorScheme="purple"
//           color={"purple.700"}
//           size={{ base: "sm", md: "md" }}
//           aria-label="Toggle Right Panel"
//         >
//           <Box as={AdjustmentsHorizontalIcon} w={6} h={6} />
//         </Button>
//       </Tooltip> */}
//       {/*new10 - add a button to toggle heatmap visibility */}
//       <Tooltip
//         label={
//           isHeatmapVisible
//             ? "Hide Heatmap"
//             : "Show Heatmap (Density Visualization)"
//         }
//       >
//         <Button
//           id="toggle-heat-map"
//           colorScheme="purple"
//           color={"purple.700"}
//           size={{ base: "sm", md: "md" }}
//           aria-label="Toggle Heatmap"
//           onClick={toggleHeatmap}
//         >
//           <Box as={ChartBarIcon} w={6} h={6} />
//         </Button>
//       </Tooltip>
//       {/* New4: Select component to choose layout */}
//       <Select
//         onChange={handleLayoutChange}
//         value={selectedLayout}
//         size={{ base: "sm", md: "md" }}
//         colorScheme="purple"
//         color={"purple.400"}
//         focusBorderColor="purple.700"
//         borderColor={"purple.400"}
//         borderRadius={"md"}
//         flex={"1"}
//       >
//         <option value="default">Default</option>
//         <option value="grid">Grid</option>
//         <option value="stack">Stack</option>
//         <option value="circular">Circular</option>
//         <option value="doubleCircle">Double-Circle</option>
//         <option value="sunflower">Sunflower</option>
//       </Select>
//       {/* NEW16: Add a reset button for direct connections */}
//       {isFiltered && (
//         <Tooltip label="Reset View to Default">
//           <Button
//             id="reset-view"
//             onClick={resetView}
//             colorScheme="purple"
//             color={"purple.700"}
//             size={{ base: "sm", md: "md" }}
//             aria-label="Reset View"
//           >
//             <Box as={ArrowUturnLeftIcon} w={6} h={6} />
//           </Button>
//         </Tooltip>
//       )}
//     </Box>
//   );
// };

// export default MapControls;

// new19 - update mapcontrols to be included in rendergraphutils
import React from "react";
import { Box, Button, Tooltip, Select } from "@chakra-ui/react";
import {
  FingerPrintIcon,
  ChartBarIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

const MapControls = ({
  viewType,
  toggleView,
  isHeatmapVisible,
  toggleHeatmap,
  selectedLayout,
  handleLayoutChange,
  resetView,
  isFiltered,
}) => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="start"
      gap="10px"
      backgroundColor="transparent"
      padding="8px 12px"
      borderRadius="8px"
      boxShadow="lg"
      flex={3}
    >
      {/* Switch View Button */}
      <Tooltip
        label={
          viewType === "overview"
            ? "Switch to detail view"
            : "Switch to overview view"
        }
      >
        <Button
          id="switch-view"
          onClick={toggleView}
          background="rgba(255, 255, 255, 0.1)"
          color="white"
          boxShadow={"md"}
          size="sm"
          _hover={{ background: "rgba(192, 192, 192, 0.27)" }}
        >
          <Box as={FingerPrintIcon} w={5} h={5} />
        </Button>
      </Tooltip>

      {/* Heatmap Toggle Button */}
      <Tooltip
        label={
          isHeatmapVisible
            ? "Hide Heatmap"
            : "Show Heatmap (Density Visualization)"
        }
      >
        <Button
          id="toggle-heat-map"
          onClick={toggleHeatmap}
          background="rgba(255, 255, 255, 0.1)"
          boxShadow={"md"}
          color="white"
          size="sm"
          _hover={{ background: "rgba(192, 192, 192, 0.27)" }}
        >
          <Box as={ChartBarIcon} w={5} h={5} />
        </Button>
      </Tooltip>

      {/* Layout Selector */}
      <Select
        onChange={handleLayoutChange}
        value={selectedLayout}
        size="sm"
        background="white"
        color="gray.800"
        borderRadius="md"
        _focus={{ borderColor: "purple.500" }}
        width="150px"
      >
        <option value="default">Default</option>
        <option value="grid">Grid</option>
        <option value="stack">Stack</option>
        <option value="circular">Circular</option>
        <option value="doubleCircle">Double-Circle</option>
        <option value="sunflower">Sunflower</option>
      </Select>

      {/* Reset View Button */}
      {isFiltered && (
        <Tooltip label="Reset View to Default">
          <Button
            id="reset-view"
            onClick={resetView}
            background="rgba(255, 255, 255, 0.1)"
            boxShadow={"md"}
            color="white"
            size="sm"
            _hover={{ background: "rgba(192, 192, 192, 0.27)" }}
          >
            <Box as={ArrowUturnLeftIcon} w={5} h={5} />
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default MapControls;
