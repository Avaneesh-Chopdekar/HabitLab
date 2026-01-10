import React from "react";
import { View, Text, Pressable } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

interface Onboarding4Props {
  pagerRef: React.RefObject<any>;
  experiment: string;
  setExperiment: React.Dispatch<React.SetStateAction<string>>;
}

export default function Onboarding4({
  experiment,
  setExperiment,
  pagerRef,
}: Onboarding4Props) {
  return (
    <>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
        Pick your first 7-day experiment
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
          text="No phone 2 hours after waking up"
          fillColor="blue"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "No phone 2 hours after waking up"}
          onPress={(isChecked) =>
            setExperiment("No phone 2 hours after waking up")
          }
        />

        <BouncyCheckbox
          text="No screens 1 hour before bed"
          fillColor="hotpink"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "No screens 1 hour before bed"}
          onPress={(isChecked) => setExperiment("No screens 1 hour before bed")}
        />

        <BouncyCheckbox
          text="No coffee after noon"
          fillColor="orange"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "No coffee after noon"}
          onPress={(isChecked) => setExperiment("No coffee after noon")}
        />

        <BouncyCheckbox
          text="Meditation before bed"
          fillColor="green"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "Meditation before bed"}
          onPress={(isChecked) => setExperiment("Meditation before bed")}
        />

        <BouncyCheckbox
          text="4 hour deep work"
          fillColor="rebeccapurple"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "4 hour deep work"}
          onPress={(isChecked) => setExperiment("4 hour deep work")}
        />

        <BouncyCheckbox
          text="No outdoor food"
          fillColor="red"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "No outdoor food"}
          onPress={(isChecked) => setExperiment("No outdoor food")}
        />

        {/*<BouncyCheckbox
          text="Other"
          fillColor="blue"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            setExperiment("Other")
          }
        />*/}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <Pressable
          onPress={() => pagerRef.current?.setPage(2)}
          style={{
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
          <Text style={{ color: "white" }}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => pagerRef.current?.setPage(4)}
          style={{
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
      </View>
    </>
  );
}
