import Layout from "./Layout";
import { Box, Flex } from "@chakra-ui/react";

const Keyboards = () => {
  return (
    <Layout>
      <Box mx={"auto"} width={"full"}>
        <Box textAlign={"center"} fontSize={"4xl"} pb={"4"}>
          {"Unlock The Entire Alphabet"}
        </Box>
        <Flex flexDir={"row"} flexWrap={"wrap"}>
          {[...Array(20).keys()].map(() => (
            <Box
              m={"4"}
              width={"256px"}
              height={"256px"}
              border={"2px"}
              borderColor={"black"}
            ></Box>
          ))}
        </Flex>
      </Box>
    </Layout>
  );
};

export default Keyboards;
