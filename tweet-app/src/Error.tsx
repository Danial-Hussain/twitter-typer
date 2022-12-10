import { Button, Text, VStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Layout from "./Layout";

const Error: React.FC = () => {
  return (
    <Layout>
      <VStack
        p={"8"}
        mx={"auto"}
        rounded={"xl"}
        border={"1px"}
        width={"fit-content"}
        borderColor={"gray.500"}
        backgroundColor={"gray.50"}
      >
        <Text fontSize={"2xl"}>{"Hmmm...something went wrong"}</Text>
        <Link to={"/"}>
          <Button variant={"outline"} colorScheme={"twitter"}>
            Back Home
          </Button>
        </Link>
      </VStack>
    </Layout>
  );
};

export default Error;
