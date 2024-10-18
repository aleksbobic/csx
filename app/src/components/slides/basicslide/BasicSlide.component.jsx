import { Box, Center, Heading, Text, VStack } from "@chakra-ui/react";

function BasicSlide({ title, text }) {
  return (
    <Box
      as="section"
      display="inherit !important"
      data-background-color="#1A202C"
    >
      <Center>
        <VStack padding="15%">
          <Heading size="sm">{title}</Heading>
          <Text>{text}</Text>
        </VStack>
      </Center>
    </Box>
  );
}

export default BasicSlide;
