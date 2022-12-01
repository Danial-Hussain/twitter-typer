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
  TimeIcon,
  UnlockIcon,
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
  useToast,
  useClipboard,
} from "@chakra-ui/react";
import { useAuth } from "./auth";

interface LobbyProps {
  gameManager: GameManager;
  performAction: (action: Action) => void;
}

const Lobby: React.FC<LobbyProps> = ({ gameManager, performAction }) => {
  const url = `${client}${location.pathname}`;
  const code = location.pathname.split("/")[2];

  const { onCopy, value, setValue, hasCopied } = useClipboard(url);

  const user = gameManager.players.find((p) => p.isUser === true);
  const [waiting, setWaiting] = useState<boolean | undefined>(false);
  const [showInstructions, setShowInstructions] = useStorage(
    "showInstructions",
    true
  );

  const [countdownValue, setCountdownValue] = useState(17);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (gameManager.gameType == "PrivateGame") {
      interval = setInterval(
        () => setCountdownValue((countdownValue) => countdownValue - 1),
        1000
      );
    }
    return () => clearInterval(interval);
  }, [countdownValue]);

  return (
    <>
      <Instructions
        showInstructions={showInstructions}
        setShowInstructions={setShowInstructions}
      />
      <Box fontWeight={"bold"} fontSize={"4xl"} mb={"2"}>
        {"Game Lobby"}
      </Box>
      <VStack spacing={0.5}>
        <Box textAlign={"center"} fontSize={"lg"} color={"gray.500"}>
          {"Click the link to copy"}
        </Box>
        <Button
          variant={"outline"}
          colorScheme={"twitter"}
          onClick={() => {
            setValue(url);
            onCopy();
          }}
        >
          {hasCopied ? "Copied!" : url}
        </Button>
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
      {gameManager.gameType === "PrivateGame" ? (
        <Box mt={"4"} fontSize={"lg"}>
          {`Game starting in ${countdownValue} seconds.`}
        </Box>
      ) : user?.isCreator === true ? (
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
          >
            {"Start"}
          </Button>
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
}

const Countdown: React.FC<CountdownProps> = ({ timer }) => {
  const [countdownValue, setCountdownValue] = useState(timer);
  const { isOpen } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    let interval = setInterval(
      () => setCountdownValue((countdownValue) => countdownValue - 1),
      1000
    );
    return () => clearInterval(interval);
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
            <ModalBody bgColor={"gray.50"}>
              <Flex
                width={"full"}
                align={"center"}
                justify={"center"}
                flexDir={"column"}
              >
                <Box textAlign={"center"} mb={"4"} fontSize={"xl"}>
                  {"Game starting in..."}
                </Box>
                <CircularProgress
                  max={timer}
                  size={"120px"}
                  color="green.400"
                  value={timer - countdownValue}
                >
                  <CircularProgressLabel>
                    {countdownValue}s
                  </CircularProgressLabel>
                </CircularProgress>
              </Flex>
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
    <Flex
      p={"4"}
      mx={"auto"}
      maxW={"4xl"}
      border={"2px"}
      rounded={"xl"}
      flexWrap={"wrap"}
      borderColor={"gray.300"}
      backgroundColor={"gray.100"}
    >
      {[...tweet].map((t, i) => (
        <Flex key={i} justify={"end"} align={"center"} flexDir={"column"}>
          <Box
            fontSize={"2xl"}
            textAlign={"center"}
            color={i < currentIdx ? "green.200" : "black"}
            fontWeight={currentIdx > i ? "semibold" : "normal"}
            backgroundColor={i === currentIdx ? "twitter.300" : "gray.100"}
          >
            {t === " " ? "\u00A0" : t}
          </Box>
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

  const defaultClose = (e: KeyboardEvent) => e.preventDefault();

  useEffect(() => {
    document.addEventListener("keydown", defaultClose, true);
    return () => document.removeEventListener("keydown", defaultClose);
  }, []);

  useEffect(() => {
    if (countdownValue <= 0) {
      performAction({ action: "playerGuess", data: { guess: "" } });
    }

    let interval = setInterval(
      () => setCountdownValue((countdownValue) => countdownValue - 1),
      1000
    );

    return () => clearInterval(interval);
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
  // Provide buffer for diff between server and client clock
  const [timeRemaining, setTimeRemaining] = useState(gameManager.timeLimit - 3);

  if (user === undefined) {
    return <Box>{"Hmmm... Something went wrong"}</Box>;
  }

  const type = (ev: KeyboardEvent) => {
    if (ev.key == " " && ev.target == document.body) ev.preventDefault();
    validKey(ev.key) &&
      performAction({ action: "playerMove", data: { key: ev.key } });
  };

  useEffect(() => {
    document.addEventListener("keydown", type, true);
    return () => document.removeEventListener("keydown", type);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (gameManager.state === "Started" && timeRemaining > 0) {
      interval = setInterval(
        () => setTimeRemaining((timeRemaining) => timeRemaining - 1),
        1000
      );
    }
    return () => clearInterval(interval);
  }, [timeRemaining, gameManager.state]);

  return (
    <>
      {gameManager.state == "Countdown" && <Countdown timer={10} />}
      {user.state === "Guessing" && (
        <GuessAuthor
          timer={10}
          performAction={performAction}
          choices={gameManager.tweet.authorChoices}
        />
      )}
      {gameManager.state === "Started" && (
        <Answer
          tweet={gameManager.tweet.tweet}
          currentIdx={user.currentLetterIdx}
        />
      )}
      <Divider orientation="horizontal" my={"4"} />
      <HStack>
        <TimeIcon width={"5"} height={"5"} />
        <Box textAlign={"right"}>{`${timeRemaining} seconds left`}</Box>
      </HStack>
      <Box>
        <Flex align={"start"} mt={"8"}>
          <Image
            rounded={"xl"}
            width={"200px"}
            height={"200px"}
            src={`/keyboards/transparent-${
              user.keyboardLink.split("/keyboards/")[1]
            }`}
          />
          <Flex ml={8} flexDir={"column"} align={"start"} justify={"end"}>
            <Box
              mb={"2"}
              fontSize={"xl"}
              textAlign={"center"}
              fontWeight={"semibold"}
            >
              {`${user.name} (You)`}
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
      {[...opps]
        .sort((a, b) => (a.name > b.name ? 1 : -1))
        .map((opp, i) => (
          <Flex align={"start"} key={i} mt={"4"}>
            <Image
              rounded={"xl"}
              width={"200px"}
              height={"200px"}
              src={`/keyboards/transparent-${
                opp.keyboardLink.split("/keyboards/")[1]
              }`}
            />
            <Flex ml={8} flexDir={"column"} align={"start"}>
              <Box
                mb={"2"}
                fontSize={"xl"}
                textAlign={"center"}
                fontWeight={"semibold"}
              >
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
  const auth = useAuth();
  const toast = useToast();
  const user = gameManager.players.find((p) => p.isUser === true);

  if (user === undefined) {
    return <Box>{"Hmmm... something went wrong"}</Box>;
  }

  useEffect(() => {
    try {
      // @ts-ignore
      twttr.widgets.load();
    } catch (err) {
      console.log(err);
    }

    (async () => {
      let newKeyboards = await auth.getNewUnlockedKeyboards();
      newKeyboards.map((board) =>
        toast({
          title: `Congrats! You have unlocked the ${board.name} keyboard`,
          description: "Go to your profile to select it.",
          status: "info",
          duration: 9000,
          isClosable: true,
          icon: <UnlockIcon />,
        })
      );
    })();
  }, []);

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
        <Box fontSize={"3xl"} textAlign={"center"}>
          {"This tweet was written by..."}
        </Box>
        <Box fontSize={"3xl"} fontWeight={"semibold"}>
          {gameManager.tweet.author}
        </Box>
        <Link
          href={`https://twitter.com/${gameManager.tweet.authorHandle}?ref_src=twsrc%5Etfw`}
          className="twitter-follow-button"
          data-show-count="true"
          data-size="large"
        >
          Follow @{`${gameManager.tweet.authorHandle}`}
        </Link>
        <Box
          p={"2"}
          border={"1px"}
          rounded={"lg"}
          borderColor={"gray.300"}
          width={{ base: "sm", md: "2xl" }}
        >
          {gameManager.tweet.tweet}
        </Box>
        <Link href={"/"} _hover={{ textDecoration: "none" }}>
          <Button colorScheme={"twitter"} variant={"outline"}>
            {"Play Again?"}
          </Button>
        </Link>
      </VStack>
      <VStack mt={"8"} width={{ base: "sm", md: "2xl" }}>
        <Box fontSize={"3xl"} fontWeight={"semibold"}>
          {"Results"}
        </Box>
        <Box>{`You placed ${ordinal_suffix_of(user.placement)}`}</Box>
        {[...gameManager.players]
          .sort((a, b) => b.points - a.points)
          .map((p, i) => (
            <HStack
              key={i}
              p={"4"}
              rounded={"md"}
              spacing={"12"}
              width={"full"}
              justify={"space-between"}
              backgroundColor={p.isUser ? "twitter.50" : "white"}
            >
              <HStack spacing={"4"}>
                <Flex
                  width={"60px"}
                  height={"60px"}
                  fontSize={"xl"}
                  rounded={"full"}
                  border={"2px"}
                  align={"center"}
                  justify={"center"}
                  textAlign={"center"}
                  borderColor={"gray.500"}
                >
                  {ordinal_suffix_of(p.placement)}
                </Flex>
                <Image
                  rounded={"xl"}
                  width={"150px"}
                  height={"150px"}
                  src={`/keyboards/transparent-${
                    p.keyboardLink.split("/keyboards/")[1]
                  }`}
                />
              </HStack>
              <VStack align={"end"}>
                <Box fontSize={"lg"}>{p.name}</Box>
                <HStack>
                  <Box
                    px={"2"}
                    rounded={"md"}
                    bg={"twitter.300"}
                    color={"twitter.800"}
                    fontWeight={"semibold"}
                  >
                    {Number(p.points).toFixed(2)} {"points"}
                  </Box>
                  <Box
                    px={"2"}
                    rounded={"md"}
                    bg={"twitter.300"}
                    color={"twitter.800"}
                    fontWeight={"semibold"}
                  >
                    {Number(p.speed).toFixed(2)} {"wpm"}
                  </Box>
                </HStack>
              </VStack>
            </HStack>
          ))}
      </VStack>
    </>
  );
};

const Home = () => {
  const { user } = useAuth();
  const location = useLocation();
  const gameId = location.pathname.split("/")[2];
  const [gameManager, performAction] = useGameManager(
    user.token,
    gameId,
    user.name
  );

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
