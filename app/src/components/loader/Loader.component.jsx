import { Center, useColorMode } from "@chakra-ui/react";

import { trio } from "ldrs";
import { useEffect } from "react";

function Loader() {
  const { colorMode } = useColorMode();
  useEffect(() => {
    trio.register();
  }, []);

  return (
    <Center
      width="100%"
      height="100%"
      backgroundColor={colorMode === "light" ? "#efefef" : "#1A202C"}
      position="fixed"
      top="0"
      left="0"
      zIndex="2"
    >
      <l-trio size={30} color={"white"}></l-trio>
    </Center>
  );
}

export default Loader;
