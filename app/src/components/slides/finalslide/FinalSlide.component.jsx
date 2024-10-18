import {
  Box,
  Center,
  Heading,
  Image,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";

import logo from "images/logo.png";

function FinalSlide({ title, text }) {
  return (
    <Box
      as="section"
      display="inherit !important"
      data-background-color="#1A202C"
    >
      <Center>
        <VStack padding="15%">
          <Heading size="sm">{title}</Heading>
          <VStack paddingTop="15%">
            <Text fontSize="sm" fontWeight="bold">
              {text}
            </Text>
            <Image
              src={logo}
              alt="Collaboration spotting X logo"
              height="50px"
            />
            <Link
              fontWeight="bold"
              textDecoration="underline"
              fontSize="sm"
              display="inline"
              color="blue.500"
              target="_blank"
              href="https://csxp.me"
            >
              csxp.me
            </Link>
          </VStack>
        </VStack>
      </Center>
    </Box>
  );
}

export default FinalSlide;
