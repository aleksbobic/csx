import { Box, HStack, Image } from "@chakra-ui/react";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownMediaSlide({
  content,
  transition,
  chart,
  screenshot,
  align,
  index,
}) {
  const getTextAlign = () => {
    if (align) {
      return align;
    }

    return index % 2 ? "left" : "right";
  };

  const getFlexDirection = () => {
    if (align) {
      return align === "left" ? "row" : "row-reverse";
    }

    return index % 2 ? "row" : "row-reverse";
  };

  return (
    <Box
      as="section"
      display="inherit !important"
      data-background-color="#1A202C"
      height="100%"
      width="80%"
      data-transition={transition ? transition : "slide"}
    >
      <HStack flexDirection={getFlexDirection()} height="100%" width="100%">
        <Box
          overflow="hidden"
          width="70%"
          height="auto"
          padding={chart ? "50px" : "0px"}
        >
          <Image src={chart ? chart : screenshot} />
        </Box>

        <Box textAlign={getTextAlign()} width="30%" height="auto" zIndex="5">
          <Markdown
            className="mkdslide"
            children={content}
            remarkPlugins={[remarkGfm]}
            disallowedElements={["img", "a"]}
          />
        </Box>
      </HStack>
    </Box>
  );
}

export default MarkdownMediaSlide;
