import React from "react";
import { View, Text, Pressable } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

interface Onboarding1Props {
  selectedHabits: string[];
  setSelectedHabits: React.Dispatch<React.SetStateAction<string[]>>;
  pagerRef: React.RefObject<any>;
}

export default function Onboarding1({
  selectedHabits,
  setSelectedHabits,
  pagerRef,
}: Onboarding1Props) {
  return (
    <>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
        What are you trying to improve?
      </Text>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          marginLeft: 32,
        }}
      >
        <BouncyCheckbox
          text="💤 Sleep"
          fillColor="blue"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedHabits([...selectedHabits, "Sleep"])
              : setSelectedHabits(
                  selectedHabits.filter((habit) => habit !== "Sleep"),
                )
          }
        />

        <BouncyCheckbox
          text="🧠 Focus"
          fillColor="hotpink"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedHabits([...selectedHabits, "Focus"])
              : setSelectedHabits(
                  selectedHabits.filter((habit) => habit !== "Focus"),
                )
          }
        />

        <BouncyCheckbox
          text="🏃 Fitness"
          fillColor="orange"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedHabits([...selectedHabits, "Fitness"])
              : setSelectedHabits(
                  selectedHabits.filter((habit) => habit !== "Fitness"),
                )
          }
        />

        <BouncyCheckbox
          text="📱 Phone usage"
          fillColor="green"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedHabits([...selectedHabits, "Phone usage"])
              : setSelectedHabits(
                  selectedHabits.filter((habit) => habit !== "Phone usage"),
                )
          }
        />

        <BouncyCheckbox
          text="😌 Mental health"
          fillColor="rebeccapurple"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedHabits([...selectedHabits, "Mental health"])
              : setSelectedHabits(
                  selectedHabits.filter((habit) => habit !== "Mental health"),
                )
          }
        />

        <BouncyCheckbox
          text="📚 Study"
          fillColor="red"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedHabits([...selectedHabits, "Study"])
              : setSelectedHabits(
                  selectedHabits.filter((habit) => habit !== "Study"),
                )
          }
        />

        {/*<BouncyCheckbox
          text="Other"
          onPress={(isChecked) => console.log("Other", isChecked)}
        />*/}
      </View>
      <Pressable
        onPress={() => pagerRef.current?.setPage(1)}
        style={{
          marginTop: "auto",
          backgroundColor: "rebeccapurple",
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          width: 120,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: "white",
        }}
      >
        <Text style={{ color: "white" }}>Next</Text>
      </Pressable>
    </>
  );
}
