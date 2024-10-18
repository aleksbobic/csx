import { Box, Flex } from "@chakra-ui/react";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownSlide({ content }) {
  return (
    <Box
      as="section"
      display="inherit !important"
      data-background-color="#1A202C"
    >
      <Flex justifyContent="center" alignItems="center">
        <Box maxWidth="800px">
          <Markdown
            className="mkdslide"
            children={content}
            remarkPlugins={[remarkGfm]}
            disallowedElements={["img", "a"]}
            style={{ maxWidth: "800px" }}
          />
        </Box>
      </Flex>
    </Box>
  );
}

export default MarkdownSlide;
