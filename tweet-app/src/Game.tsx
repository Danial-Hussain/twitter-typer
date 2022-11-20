import Layout from "./Layout";
import useStorage from "./hooks";
import { client } from "./config";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGameManager, GameManager, Action } from "./logic";

import {
  StarIcon,
  SettingsIcon,
  InfoOutlineIcon,
  CheckCircleIcon,
} from "@chakra-ui/icons";

import {
  Box,
  Link,
  Flex,
  List,
  Modal,
  Image,
  Button,
  Avatar,
  VStack,
  Tooltip,
  Divider,
  ListItem,
  ListIcon,
  Progress,
  ModalBody,
  AvatarGroup,
  AvatarBadge,
  ModalHeader,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  useDisclosure,
  ModalCloseButton,
  CircularProgress,
  CircularProgressLabel,
  HStack,
} from "@chakra-ui/react";

interface LobbyProps {
  gameManager: GameManager;
  performAction: (action: Action) => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameManager, performAction }) => {
  const user = gameManager.players.find((p) => p.isUser === true);
  const [waiting, setWaiting] = useState<boolean | undefined>(false);
  const [showInstructions, setShowInstructions] = useStorage(
    "showInstructions",
    true
  );

  return (
    <>
      <Instructions
        showInstructions={showInstructions}
        setShowInstructions={setShowInstructions}
      />
      <Box fontWeight={"bold"} fontSize={"4xl"} mb={"2"}>
        {"Game Lobby"}
      </Box>
      <VStack spacing={0.1}>
        <HStack>
          <Box textAlign={"center"}>{"Share this code:"}</Box>
          <Box fontWeight={"bold"} color={"blue.500"}>
            {location.pathname.split("/")[2]}
          </Box>
        </HStack>
        <Box fontWeight={"bold"}>{"OR"}</Box>
        <HStack>
          <Box textAlign={"center"}>{"Share this link:"}</Box>
          <Box
            fontWeight={"bold"}
            color={"blue.500"}
          >{`${client}${location.pathname}`}</Box>
        </HStack>
      </VStack>
      <HStack
        mt={"4"}
        spacing={1}
        width={"2xl"}
        justify={"space-between"}
        align={"center"}
        cursor={"pointer"}
        onClick={() => setShowInstructions(true)}
      >
        <Box fontWeight={"semibold"}>{"Max 6 Players"}</Box>
        <HStack>
          <Box>{"How to play?"}</Box>
          <InfoOutlineIcon mx={"2"} fontSize={"xl"} />
        </HStack>
      </HStack>
      <Flex
        mt={"2"}
        width={"2xl"}
        height={"64"}
        border={"2px"}
        align={"start"}
        padding={"20px"}
        flexWrap={"wrap"}
        borderColor={"gray.200"}
      >
        {gameManager.players.map((p, i) => (
          <AvatarGroup spacing="1rem" mx={"8px"} key={i}>
            <Tooltip label={p.name}>
              <Avatar name={p.name} bg="gray.300">
                <AvatarBadge boxSize="1.25em" bg="green.500" />
              </Avatar>
            </Tooltip>
          </AvatarGroup>
        ))}
      </Flex>
      {user?.isCreator === true ? (
        <>
          <Button
            mt={"4"}
            width={"24"}
            variant="solid"
            colorScheme="twitter"
            isLoading={waiting}
            loadingText="Loading"
            spinnerPlacement="end"
            onClick={() => {
              setWaiting(true);
              performAction({ action: "startCountdown" });
            }}
            disabled={gameManager.players.length == 1}
          >
            {"Start"}
          </Button>
          {gameManager.players.length == 1 && (
            <Box mt={4} textAlign={"center"} fontSize={"lg"}>
              {"You must have at least 2 players to start the game."}
            </Box>
          )}
        </>
      ) : (
        <Box mt={"4"} fontSize={"lg"}>
          {"Waiting for "}
          {gameManager.players.find((p) => p.isCreator === true)?.name}
          {" to start the game"}
        </Box>
      )}
    </>
  );
};

interface InstructionsProps {
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const Instructions: React.FC<InstructionsProps> = ({
  showInstructions,
  setShowInstructions,
}) => {
  const { isOpen } = useDisclosure({
    isOpen: showInstructions,
  });

  return (
    <>
      {isOpen && (
        <Modal
          size={"xl"}
          isOpen={isOpen}
          isCentered={true}
          onClose={() => setShowInstructions(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize={"2xl"}>{"How to play?"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box fontSize={"xl"} fontWeight={"semibold"}>
                {"The rules of the game are simple:"}
              </Box>
              <List spacing={2} mt={2} fontSize={"xl"}>
                <ListItem>
                  <ListIcon as={SettingsIcon} color="blue.500" />
                  {"A tweet from a random person will appear 🐦"}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="blue.500" />
                  {"Type the tweet as fast as you can 🏃"}
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="blue.500" />
                  {"Guess the author of the tweet for 10 bonus points 🪄"}
                </ListItem>
                <ListItem>
                  <ListIcon as={StarIcon} color="blue.500" />
                  {"The person with the most points wins 🥇"}
                </ListItem>
              </List>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                onClick={() => setShowInstructions(false)}
              >
                {"Ready?"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

interface CountdownProps {
  timer: number;
  performAction: (action: Action) => void;
}

const Countdown: React.FC<CountdownProps> = ({ timer, performAction }) => {
  const [countdownValue, setCountdownValue] = useState(timer);
  const { isOpen } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    countdownValue > 0
      ? setInterval(() => setCountdownValue(countdownValue - 1), 1000)
      : performAction({ action: "startGame" });
  }, [countdownValue]);

  return (
    <>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          isCentered={true}
          closeOnEsc={false}
          onClose={() => {}}
          blockScrollOnMount={true}
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalBody>
              <Box>{"Game starting in..."}</Box>
              <CircularProgress
                max={timer}
                value={timer - countdownValue}
                color="green.400"
              >
                <CircularProgressLabel>{countdownValue}s</CircularProgressLabel>
              </CircularProgress>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

interface AnswerProps {
  tweet: string;
  currentIdx: number;
}

const Answer: React.FC<AnswerProps> = ({ tweet, currentIdx }) => {
  return (
    <Flex flexWrap={"wrap"} mx={"auto"}>
      {[...tweet].map((t, i) => (
        <Flex
          mx={1}
          key={i}
          justify={"end"}
          align={"center"}
          flexDir={"column"}
        >
          <Box
            fontSize={"5xl"}
            textAlign={"center"}
            color={currentIdx > i ? "black" : "gray.300"}
          >
            {t}
          </Box>
          <Box
            width={"10"}
            rounded={"xl"}
            height={"1"}
            backgroundColor={
              i === currentIdx
                ? "blue.500"
                : i < currentIdx
                ? "green.400"
                : "gray.400"
            }
            className={i == currentIdx ? "blink" : ""}
          />
        </Flex>
      ))}
    </Flex>
  );
};

interface GuessAuthorProps {
  timer: number;
  choices: string[];
  performAction: (action: Action) => void;
}

const GuessAuthor: React.FC<GuessAuthorProps> = ({
  timer,
  choices,
  performAction,
}) => {
  const [countdownValue, setCountdownValue] = useState(timer);
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    countdownValue > 0
      ? setInterval(() => setCountdownValue(countdownValue - 1), 1000)
      : performAction({ action: "playerGuess", data: { guess: "" } });
  }, [countdownValue]);

  return (
    <>
      {isOpen && (
        <Modal
          size={"2xl"}
          isOpen={isOpen}
          isCentered={true}
          closeOnEsc={false}
          onClose={() => {}}
          blockScrollOnMount={true}
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalBody p={"8"}>
              <HStack spacing={"2"}>
                <CircularProgress
                  max={timer}
                  value={timer - countdownValue}
                  color="green.400"
                >
                  <CircularProgressLabel>
                    {countdownValue}s
                  </CircularProgressLabel>
                </CircularProgress>
                <Box>{"Time Remaining to guess..."}</Box>
              </HStack>
              <HStack mt={"4"} justify={"space-between"}>
                <Box fontSize={"xl"}>{"Who wrote this tweet?"}</Box>
                <Box
                  px={"2"}
                  py={"1"}
                  color={"blue"}
                  rounded={"xl"}
                  bg={"blue.100"}
                  fontSize={"lg"}
                  fontWeight={"semibold"}
                >
                  {"+10 Bonus Points"}
                </Box>
              </HStack>
              <VStack mt={"4"} spacing={"4"}>
                {choices.map((c, i) => (
                  <Button
                    key={i}
                    width={"full"}
                    variant={"outline"}
                    colorScheme={"twitter"}
                    onClick={() => {
                      performAction({
                        action: "playerGuess",
                        data: { guess: c },
                      });
                      onClose();
                    }}
                  >
                    {c}
                  </Button>
                ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

const validKey = (key: string) =>
  /[a-zA-Z0-9-\]\[`'\/".~!@#$%^&*(){}=:?;><|\,_ ]/.test(key);

interface GameProps {
  gameManager: GameManager;
  performAction: (action: Action) => void;
}

const Game: React.FC<GameProps> = ({ gameManager, performAction }) => {
  const user = gameManager.players.find((p) => p.isUser === true);
  const opps = gameManager.players.filter((p) => p.isUser === false);

  if (user === undefined) {
    return <Box>{"Hmmm... Something went wrong"}</Box>;
  }

  useEffect(() => {
    document.addEventListener("keydown", type, true);
    return () => document.removeEventListener("keydown", type);
  }, []);

  const type = (ev: KeyboardEvent) => {
    validKey(ev.key) &&
      performAction({ action: "playerMove", data: { key: ev.key } });
  };

  return (
    <>
      {gameManager.state == "Countdown" && (
        <Countdown timer={10} performAction={performAction} />
      )}
      {user.state === "Guessing" && (
        <GuessAuthor
          timer={10}
          performAction={performAction}
          choices={gameManager.tweet.authorChoices}
        />
      )}
      <Answer
        tweet={gameManager.tweet.tweet}
        currentIdx={user.currentLetterIdx}
      />
      <Divider orientation="horizontal" my={"4"} />
      <Box>
        <Flex align={"start"} mt={"4"}>
          <img src={"/keyboard.jpg"} width={"250px"} />
          <Flex ml={8} flexDir={"column"} align={"start"} justify={"end"}>
            <Box textAlign={"center"} fontWeight={"semibold"}>
              {user.name}
            </Box>
            <Progress
              width={"md"}
              colorScheme={"twitter"}
              value={user.currentLetterIdx}
              max={gameManager.tweet.tweet.length}
            />
          </Flex>
        </Flex>
      </Box>
      {opps.map((opp, i) => (
        <Flex align={"start"} key={i} mt={"4"}>
          <img src={"/keyboard.jpg"} width={"250px"} />
          <Flex ml={8} flexDir={"column"} align={"start"}>
            <Box textAlign={"center"} fontWeight={"semibold"}>
              {opp.name}
            </Box>
            <Progress
              width={"md"}
              value={opp.currentLetterIdx}
              max={gameManager.tweet.tweet.length}
            />
          </Flex>
        </Flex>
      ))}
      {user.state === "Completed" && (
        <Box fontSize={"lg"} mt={"4"}>
          {"Waiting for the remaining players to finish..."}
        </Box>
      )}
    </>
  );
};

const ordinal_suffix_of = (i: number) => {
  var j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
};

interface FinishedProps {
  gameManager: GameManager;
}

const Finished: React.FC<FinishedProps> = ({ gameManager }) => {
  const user = gameManager.players.find((p) => p.isUser === true);

  if (user === undefined) {
    return <Box>{"Hmmm... something went wrong"}</Box>;
  }

  return (
    <>
      <Confetti
        wind={0}
        gravity={0.1}
        recycle={false}
        numberOfPieces={200}
        initialVelocityX={4}
        initialVelocityY={10}
      />
      <VStack
        p={"8"}
        border={"2px"}
        rounded={"xl"}
        borderColor={"gray.200"}
        backgroundColor={"gray.100"}
      >
        <Box fontSize={"4xl"}>{"This tweet was written by..."}</Box>
        <HStack spacing={"6"}>
          <Box fontSize={"3xl"} fontWeight={"semibold"}>
            {gameManager.tweet.author}
          </Box>
          <HStack px={"3"} py={"2"} rounded={"xl"} backgroundColor={"blue.300"}>
            <Image src={"/twitter.svg"} width={"20px"} />
            <Link
              fontSize={"sm"}
              color={"white"}
              href={`https://twitter.com/${gameManager.tweet.authorHandle}`}
            >
              {"Follow on Twitter"}
            </Link>
          </HStack>
        </HStack>
        <Box
          p={"2"}
          width={"2xl"}
          border={"1px"}
          rounded={"lg"}
          borderColor={"gray.300"}
        >
          {gameManager.tweet.tweet}
        </Box>
        <Box>{`You placed ${ordinal_suffix_of(user.placement)}`}</Box>
        <Link href={"/"}>
          <Button colorScheme={"twitter"} variant={"outline"}>
            {"Play Again?"}
          </Button>
        </Link>
      </VStack>
      <VStack spacing={"8"} mt={"8"}>
        <Box fontSize={"3xl"} fontWeight={"semibold"}>
          {"Results"}
        </Box>
        {gameManager.players
          .sort((a, b) => b.points - a.points)
          .map((p, i) => (
            <HStack
              key={i}
              spacing={"12"}
              width={"full"}
              justify={"space-between"}
            >
              <Flex
                width={"60px"}
                height={"60px"}
                fontSize={"xl"}
                rounded={"full"}
                border={"2px"}
                align={"center"}
                justify={"center"}
                textAlign={"center"}
                borderColor={"gray.300"}
              >
                {ordinal_suffix_of(p.placement)}
              </Flex>
              <img src={"/keyboard.jpg"} width={"250px"} />
              <Box fontSize={"lg"}>{p.name}</Box>
            </HStack>
          ))}
      </VStack>
    </>
  );
};

const Home = () => {
  const location = useLocation();
  const gameId = parseInt(location.pathname.split("/")[2]);
  const [guestUsername] = useStorage("guestUsername", "User");
  const [gameManager, performAction] = useGameManager(gameId, guestUsername);

  return (
    <Layout>
      <>
        <Flex direction={"column"} align={"center"}>
          {gameManager.state === "Lobby" ? (
            <Lobby gameManager={gameManager} performAction={performAction} />
          ) : gameManager.state === "Finished" ? (
            <Finished gameManager={gameManager} />
          ) : (
            <Game gameManager={gameManager} performAction={performAction} />
          )}
        </Flex>
      </>
    </Layout>
  );
};

export default Home;
