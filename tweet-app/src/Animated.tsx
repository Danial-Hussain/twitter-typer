import { motion, isValidMotionProp } from "framer-motion";
import { chakra, Flex, shouldForwardProp } from "@chakra-ui/react";

const ChakraFramerBox = chakra(motion.div, {
  shouldForwardProp: (prop) =>
    isValidMotionProp(prop) || shouldForwardProp(prop),
});

interface AnimatedTextProps {
  text: string;
  springy: boolean;
  fontColor: string;
  fontWeight: string;
  transitionDelay: number;
  fontSize: string | object;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  springy,
  fontSize,
  fontColor,
  fontWeight,
  transitionDelay,
}) => {
  const characters = text.split("");

  return (
    <Flex justify={"center"}>
      {characters.map((char, i) => (
        <ChakraFramerBox
          key={i}
          color={fontColor}
          fontSize={fontSize}
          aria-hidden={"true"}
          fontWeight={fontWeight}
          initial={{
            y: springy ? -12 : 0,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
            transition: {
              delay: springy
                ? 0.02 * i + transitionDelay
                : 0.01 * i + transitionDelay,
              type: "spring",
              damping: 12,
              stiffness: 150,
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </ChakraFramerBox>
      ))}
    </Flex>
  );
};

interface AnimatedBox {
  children: React.ReactElement;
}

const AnimatedBox: React.FC<AnimatedBox> = ({ children }) => {
  return (
    <ChakraFramerBox
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
    >
      {children}
    </ChakraFramerBox>
  );
};

export { AnimatedBox, AnimatedText };
