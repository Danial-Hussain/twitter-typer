import Layout from "./Layout";
import { Stats, useAuth } from "./auth";
import { useEffect, useState } from "react";
import { ArrowUpIcon, CheckIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { createGame, joinGame } from "./api";

import {
  Button,
  Box,
  Flex,
  Input,
  Editable,
  EditableInput,
  EditablePreview,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  VStack,
} from "@chakra-ui/react";

const CreateGame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const create = async () => {
    let id = await createGame(user.token);
    navigate(`/game/${id}`);
  };

  return (
    <Box
      p={"7"}
      m={"4"}
      rounded={"md"}
      border={"2px"}
      boxShadow={"lg"}
      borderColor={"gray.200"}
      width={{ base: "md", md: "lg" }}
    >
      <Box mb={"5"} fontSize={"4xl"} color={"blue.800"} textAlign={"center"}>
        {"Create a Game"}
      </Box>
      <Button width={"full"} onClick={create} colorScheme={"twitter"}>
        {"Create"}
      </Button>
      <Box
        mx={"4px"}
        mt={"12px"}
        fontSize={"lg"}
        color={"gray.800"}
        textAlign={"center"}
      >
        {"Create a game and invite your friends to join."}
      </Box>
    </Box>
  );
};

const JoinGame = () => {
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState<string>("");

  const title = "Join a Game";

  const navigate = useNavigate();

  const join = async () => {
    let result = await joinGame(parseInt(joinCode));
    if (result) navigate(`/game/${joinCode}`);
    else {
      setError("Invalid code");
      setTimeout(() => {
        setError("");
      }, 1000);
    }
  };

  return (
    <Box
      p={"7"}
      m={"4"}
      border={"2px"}
      rounded={"md"}
      boxShadow={"lg"}
      borderColor={"gray.200"}
      width={{ base: "md", md: "lg" }}
    >
      <Box mb={"5"} fontSize={"4xl"} color={"gray.800"} textAlign={"center"}>
        {title}
      </Box>
      <Button width={"full"} onClick={join} colorScheme={"blackAlpha"}>
        {"Join Random Game"}
      </Button>
      <Box textAlign={"center"} my={"4"} color={"gray.800"}>
        {"OR"}
      </Box>
      <Input
        type="number"
        placeholder="Enter the game code"
        onChange={(e) => setJoinCode(e.target.value)}
      />
      <Button width={"full"} mt={"2"} onClick={join} colorScheme={"blackAlpha"}>
        {"Join"}
      </Button>
      <Box color={"red.300"} textAlign={"center"} mt={"2"}>
        {error}
      </Box>
    </Box>
  );
};

const Stats = () => {
  const { getStats } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      let result = await getStats();
      setStats(result);
    })();
  }, []);

  return (
    <VStack>
      <StatGroup>
        <Stat>
          <StatLabel>{"Games Played"}</StatLabel>
          <StatNumber>{stats?.MatchesPlayed || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{"Games Won"}</StatLabel>
          <StatNumber>{stats?.MatchesWon || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{"Total Points"}</StatLabel>
          <StatNumber>{stats?.Points || 0}</StatNumber>
        </Stat>
      </StatGroup>
      <StatGroup>
        <Stat>
          <StatLabel>{"Average Speed"}</StatLabel>
          <StatNumber>{stats?.AvgSpeed || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{"Best Speed"}</StatLabel>
          <StatNumber>{stats?.BestSpeed || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{"Average Accuracy"}</StatLabel>
          <StatNumber>{stats?.AvgAccuracy || 0}</StatNumber>
        </Stat>
      </StatGroup>
    </VStack>
  );
};

const Keyboards = () => {
  const { getKeyboards } = useAuth();
  const [keyboards, setKeyboards] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      let result = await getKeyboards();
      setKeyboards(result);
    })();
  }, []);

  return (
    <HStack>
      {keyboards.map((k, i) => (
        <Box key={i}>{k}</Box>
      ))}
    </HStack>
  );
};

const Profile = () => {
  const { user, changeName } = useAuth();
  const [tmpName, setTmpName] = useState(user.name);

  useEffect(() => {
    setTmpName(user.name);
  }, [user]);

  return (
    <Accordion allowToggle={true} defaultIndex={0}>
      <AccordionItem>
        <AccordionButton _expanded={{ bg: "blue", color: "white" }}>
          <Box flex="1" textAlign="left">
            {"Your Profile"}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel py={0}>
          <Flex
            p={"4"}
            my={"4"}
            mx={"auto"}
            border={"1px"}
            rounded={"lg"}
            flexDir={"column"}
            borderColor={"gray.200"}
          >
            <HStack align={"center"} justify={"space-between"}>
              <Flex align={"center"}>
                <Box fontSize={"xl"} color={"gray.600"} mr={"2"}>
                  {"Your Username:"}
                </Box>
                <Editable value={tmpName}>
                  <Flex align={"center"} color={"gray.500"} fontSize={"xl"}>
                    <EditIcon rounded={"sm"} mx={"4px"} />
                    <EditablePreview />
                    <EditableInput
                      onChange={(e) => setTmpName(e.target.value)}
                    />
                    {tmpName != user.name && (
                      <Button
                        variant={"unstyled"}
                        onClick={() => changeName(tmpName)}
                      >
                        <CheckIcon
                          p={"1"}
                          ml={"12px"}
                          rounded={"md"}
                          bg={"green.100"}
                          color={"green.600"}
                        />
                      </Button>
                    )}
                  </Flex>
                </Editable>
              </Flex>
              {user.token === "" && (
                <Flex>
                  {"Sign in to save your progress"}
                  <ArrowUpIcon
                    ml={"2"}
                    color={"blue"}
                    rounded={"xl"}
                    fontSize={"24"}
                    bg={"twitter.100"}
                  />
                </Flex>
              )}
            </HStack>
            <Tabs mt={"4"} variant={"soft-rounded"}>
              <TabList>
                <Tab>{"Keyboards"}</Tab>
                <Tab>{"Stats"}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Keyboards />
                </TabPanel>
                <TabPanel>
                  <Stats />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

const Home = () => {
  return (
    <Layout>
      <Box mx={"auto"}>
        <Box
          fontSize={"6xl"}
          color={"gray.700"}
          fontWeight={"bold"}
          textAlign={"center"}
        >
          {"Welcome to TwitterTyper"}
        </Box>
        <Box fontSize={"2xl"} textAlign={"center"} mb={"6"} color={"blue"}>
          {"The typeracer game with a twitter twist!"}
        </Box>
        <Profile />
        <Flex
          mt={"6"}
          flexDir={{ base: "column", md: "row" }}
          align={{ base: "center", md: "stretch" }}
          justify={{ base: "start", md: "center" }}
        >
          <JoinGame />
          <CreateGame />
        </Flex>
      </Box>
    </Layout>
  );
};

export default Home;
