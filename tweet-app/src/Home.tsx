import Layout from "./Layout";
import { Stats, useAuth } from "./auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Keyboard, KeyboardData } from "./Keyboards";
import { ArrowUpIcon, EditIcon } from "@chakra-ui/icons";
import { createGame, joinGame, joinRandomGame } from "./api";

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
      width={{ base: "sm", md: "sm", lg: "md" }}
    >
      <Box mb={"5"} fontSize={"4xl"} color={"twitter.800"} textAlign={"center"}>
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
        {"Create a private game and invite your friends."}
      </Box>
    </Box>
  );
};

const JoinGame = () => {
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState<string>("");

  const title = "Join a Game";

  const { user } = useAuth();
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

  const joinRandom = async () => {
    let id = await joinRandomGame(user.token);
    navigate(`/game/${id}`);
  };

  return (
    <Box
      p={"7"}
      m={"4"}
      border={"2px"}
      rounded={"md"}
      boxShadow={"lg"}
      borderColor={"gray.200"}
      width={{ base: "sm", md: "sm", lg: "md" }}
    >
      <Box mb={"5"} fontSize={"4xl"} color={"gray.800"} textAlign={"center"}>
        {title}
      </Box>
      <Button width={"full"} onClick={joinRandom} colorScheme={"blackAlpha"}>
        {"Join Public Game"}
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

const StatsPanel = () => {
  const { getStats } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      let result = await getStats();
      setStats(result);
    })();
  }, []);

  return (
    <>
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
          <StatNumber>{Number(stats?.Points || 0).toFixed(2)}</StatNumber>
        </Stat>
      </StatGroup>
      <StatGroup mt={"5"}>
        <Stat>
          <StatLabel>{"Average Speed"}</StatLabel>
          <StatNumber>
            {Number(stats?.AvgSpeed || 0).toFixed(2)}
            {" wpm"}
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{"Best Speed"}</StatLabel>
          <StatNumber>
            {Number(stats?.BestSpeed || 0).toFixed(2)} wpm
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{"Average Accuracy"}</StatLabel>
          <StatNumber>
            {Number((stats?.AvgAccuracy || 0) * 100).toFixed(2)}
            {"%"}
          </StatNumber>
        </Stat>
      </StatGroup>
    </>
  );
};

const KeyboardsPanel = () => {
  const { getKeyboards, changeKeyboard } = useAuth();
  const [keyboards, setKeyboards] = useState<KeyboardData[]>([]);

  useEffect(() => {
    (async () => {
      let result = await getKeyboards();
      setKeyboards(result);
    })();
  }, []);

  const selectKeyboard = (id: number) => {
    changeKeyboard(id);
    let tmp = [...keyboards];
    tmp.forEach((k) =>
      k.id === id ? (k.selected = true) : (k.selected = false)
    );
    setKeyboards(tmp);
  };

  return (
    <>
      <HStack justify={"space-between"} align={"start"}>
        <Box fontWeight={"semibold"} color={"gray.600"}>
          {"Select a keyboard"}
        </Box>
        <Link to={"/keyboards"}>
          <Box>{"Get more keyboards"}</Box>
        </Link>
      </HStack>
      <HStack
        overflowX={"auto"}
        overflowY={"hidden"}
        maxW={{ base: "sm", md: "3xl" }}
      >
        {keyboards.map((k, i) => (
          <VStack spacing={-4} key={i}>
            <Box
              key={i}
              rounded={"xl"}
              cursor={"pointer"}
              _hover={{
                transform: "scale(1.1)",
                transitionDuration: "0.2s",
                transitionTimingFunction: "ease-in-out",
              }}
              onClick={() => selectKeyboard(k.id)}
            >
              <Keyboard
                key={i}
                width={"128px"}
                keyboardData={k}
                height={"128px"}
                showDetails={false}
                borderWidth={"1px"}
              />
            </Box>
            {k.selected && (
              <Box
                px={"8px"}
                width={"128px"}
                fontSize={"sm"}
                bg={"gray.800"}
                color={"gray.100"}
                textAlign={"center"}
              >
                {"Selected"}
              </Box>
            )}
          </VStack>
        ))}
      </HStack>
    </>
  );
};

const Profile = () => {
  const { user, changeName } = useAuth();
  const [tmpName, setTmpName] = useState(user.name);

  useEffect(() => {
    setTmpName(user.name);
  }, [user]);

  return (
    <Accordion allowToggle={true}>
      <AccordionItem>
        <AccordionButton _expanded={{ bg: "blue", color: "white" }}>
          <Box flex="1" textAlign="left">
            {"Your Profile"}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Flex
            p={"4"}
            my={"4"}
            mx={"auto"}
            border={"1px"}
            rounded={"lg"}
            flexDir={"column"}
            bgColor={"gray.100"}
            borderColor={"gray.300"}
          >
            <Flex
              align={"center"}
              justify={"space-between"}
              flexDir={{ base: "column", md: "row" }}
            >
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
                        <Flex
                          p={"1"}
                          w={"48px"}
                          ml={"12px"}
                          rounded={"md"}
                          fontSize={"sm"}
                          bg={"green.100"}
                          align={"center"}
                          justify={"center"}
                          color={"green.600"}
                        >
                          {"Save"}
                        </Flex>
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
                    p={"1"}
                    color={"twitter.500"}
                    rounded={"xl"}
                    fontSize={"24"}
                    bg={"twitter.200"}
                  />
                </Flex>
              )}
            </Flex>
            <Tabs mt={"4"} variant={"soft-rounded"}>
              <TabList>
                <Tab>{"Keyboards"}</Tab>
                <Tab>{"Stats"}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <KeyboardsPanel />
                </TabPanel>
                <TabPanel>
                  <StatsPanel />
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
          {"TwitterTyper"}
        </Box>

        <Box
          fontSize={"2xl"}
          textAlign={"center"}
          mb={"6"}
          color={"twitter.500"}
        >
          {"The typeracer game for twitter enthusiasts!"}
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
