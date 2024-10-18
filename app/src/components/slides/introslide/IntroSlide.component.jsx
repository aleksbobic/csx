import { Box, Center, HStack, Heading, Text, VStack } from "@chakra-ui/react";

function IntroSlide({ title, text, time, author }) {
  return (
    <Box
      as="section"
      display="inherit !important"
      data-background-color="#1A202C"
    >
      <Center>
        <VStack padding="15%">
          <Heading size="sm">{title}</Heading>
          <Text fontSize="md" padding="0 15%">
            {text}
          </Text>
          <HStack justifyContent="space-between" width="100%" padding="15%">
            <Text fontSize="sm">{time}</Text>
            <Text fontSize="sm">{author}</Text>
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
}

export default IntroSlide;
