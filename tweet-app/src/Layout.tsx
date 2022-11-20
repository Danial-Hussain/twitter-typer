import { useAuth } from "./auth";
import { useEffect } from "react";
import { gapi_client } from "./config";
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";

const Navbar = () => {
  const { user, signIn, signOut } = useAuth();

  useEffect(() => {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: gapi_client,
      callback: signIn,
    });

    // @ts-ignore
    google.accounts.id.renderButton(document.getElementById("signIn"), {
      theme: "outline",
      size: "medium",
    });
  }, []);

  return (
    <Flex bg={"black"} height={"16"} width={"full"}>
      <Flex
        px={"6"}
        mx={"auto"}
        maxW={"8xl"}
        width={"full"}
        boxShadow={"xl"}
        align={"center"}
        direction={"row"}
        justify={"space-between"}
      >
        <Link href="/">
          <Box fontSize={{ base: "lg", md: "2xl" }} color={"gray.100"}>
            {"TwitterTyper"}
          </Box>
        </Link>
        <HStack spacing={"6"} align={"center"}>
          <Link href="/keyboards">
            <Box fontSize={{ base: "lg", md: "2xl" }} color={"gray.100"}>
              {"Keyboards"}
            </Box>
          </Link>
          <Box id={"signIn"} hidden={user.token !== "" ? true : false} />
          {user.token !== "" && (
            <Menu>
              <MenuButton
                width={"10"}
                height={"10"}
                border={"2px"}
                rounded={"lg"}
                fontSize={"xl"}
                color={"white"}
                cursor={"pointer"}
                borderColor={"white"}
                fontWeight={"semibold"}
                bgColor={"twitter.500"}
              >
                {user.name.slice(0, 1)}
              </MenuButton>
              <MenuList>
                <Box p={"2"}>{user.email}</Box>
                <MenuDivider />
                <MenuItem onClick={() => signOut()}>{"Sign Out"}</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Flex>
  );
};

const Footer = () => {
  return (
    <Flex
      height={"14"}
      width={"full"}
      bg={"gray.800"}
      align={"center"}
      justify={"center"}
    >
      <Box color={"white"}>{"Made with ❤️ by Ali"}</Box>
    </Flex>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex minHeight={"100vh"} flexDir={"column"} justify={"start"}>
      <Navbar />
      <Flex
        grow={1}
        my={"16"}
        mx={"auto"}
        maxW={"6xl"}
        width={"full"}
        flexDir={"column"}
      >
        {children}
      </Flex>
      <Footer />
    </Flex>
  );
};

export default Layout;
