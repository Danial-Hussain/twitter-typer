import Layout from "./Layout";
import { getAllKeyboards } from "./api";
import { Stats, useAuth } from "./auth";
import { useEffect, useState } from "react";
import { Box, Flex, VStack, Image, HStack } from "@chakra-ui/react";

export interface KeyboardData {
  id: number;
  name: string;
  link: string;
  selected: boolean;
  pointsNeeded: number;
}

interface KeyBoardProps {
  width?: string;
  height?: string;
  borderWidth?: string;
  showDetails: boolean;
  keyboardData: KeyboardData;
}

export const Keyboard: React.FC<KeyBoardProps> = ({
  height,
  width,
  showDetails,
  keyboardData,
  borderWidth,
}) => {
  return (
    <VStack
      m={"4"}
      spacing={0}
      width={width || "256px"}
      height={height || "256px"}
    >
      <Flex
        width={"full"}
        height={"full"}
        align={"center"}
        justify={"center"}
        position={"relative"}
        borderColor={"black"}
        border={borderWidth || "2px"}
      >
        <Image
          position={"absolute"}
          width={"full"}
          height={"full"}
          src={keyboardData.link}
        />
      </Flex>
      {showDetails && (
        <HStack justify={"space-between"} width={"full"} px={"2"}>
          <Box fontWeight={"bold"} color={"gray.800"}>
            {keyboardData.name}
          </Box>
          <Box fontSize={"sm"}>
            {keyboardData.pointsNeeded.toLocaleString()} {"points needed"}
          </Box>
        </HStack>
      )}
    </VStack>
  );
};

const Keyboards = () => {
  const { user, getStats } = useAuth();
  const [playerStats, setPlayerStats] = useState<null | Stats>();
  const [showKeyboards, setShowKeyboards] = useState(false);
  const [keyboards, setKeyboards] = useState<KeyboardData[]>([]);

  useEffect(() => {
    (async () => {
      let retrievedKeyboards = await getAllKeyboards();
      setKeyboards(retrievedKeyboards);
      setTimeout(() => setShowKeyboards(true), 1000);

      let stats = await getStats();
      setPlayerStats(stats);
    })();
  });

  return (
    <Layout>
      <Box mx={"auto"} width={"full"}>
        <Box textAlign={"center"} fontSize={"4xl"} pb={"4"}>
          {"Unlock New Keyboards"}
        </Box>
        {playerStats !== null && (
          <Box
            textAlign={"center"}
          >{`You currently have ${playerStats?.Points} points. Play some games to earn more.`}</Box>
        )}
        {user.token == "" && (
          <Box
            mb={"4"}
            textAlign={"center"}
            color={"twitter.500"}
            fontWeight={"semibold"}
          >
            {"Sign in to unlock more keyboards."}
          </Box>
        )}
        <Flex
          flexWrap={"wrap"}
          justify={"center"}
          flexDir={{ base: "column", md: "row" }}
          align={{ base: "center", md: "normal" }}
        >
          {showKeyboards ? (
            keyboards.map((b, i) => (
              <Keyboard
                key={i}
                width={"256px"}
                height={"256px"}
                keyboardData={b}
                showDetails={true}
              />
            ))
          ) : (
            <Image src={"./loader.svg"} />
          )}
        </Flex>
      </Box>
    </Layout>
  );
};

export default Keyboards;
