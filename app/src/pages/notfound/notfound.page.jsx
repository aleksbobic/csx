import { Flex, Heading, Link, Text, VStack } from "@chakra-ui/react";

function NotFoundPage() {
  return (
    <Flex
      textAlign="center"
      justifyContent="center"
      alignItems="center"
      w="full"
      h="full"
      py={10}
      px={6}
    >
      <VStack gap={6}>
        <Heading
          display="inline-block"
          as="h1"
          size="4xl"
          bgGradient="linear(to-r, purple.500, purple.700)"
          backgroundClip="text"
        >
          404
        </Heading>
        <Text fontSize="md" fontWeight="medium">
          Looks like you found your way to the wrong part of the app.
        </Text>
        <Link
          href="/"
          bg="gray.700"
          px={5}
          py={3}
          rounded="md"
          fontWeight="bold"
          textDecor="none"
          transition={"all 0.3s ease"}
          _hover={{
            bg: "gray.600",
            textDecoration: "none",
          }}
        >
          Take me home
        </Link>
      </VStack>
    </Flex>
  );
}

export default NotFoundPage;
