import React from "react";
import { View, Text, Pressable } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useOnboardingStore } from "@/store/onboarding";

interface Onboarding4Props {
  pagerRef: React.RefObject<any>;
}

export default function Onboarding4({ pagerRef }: Onboarding4Props) {
  const { experiment, setExperiment } = useOnboardingStore();

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
          text="Drink 2L water"
          fillColor="blue"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "Drink 2L water"}
          onPress={(isChecked) => setExperiment("Drink 2L water")}
        />

        <BouncyCheckbox
          text="2 hours deep work"
          fillColor="hotpink"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "2 hours deep work"}
          onPress={(isChecked) => setExperiment("2 hours deep work")}
        />

        <BouncyCheckbox
          text="No phone 30 min after waking"
          fillColor="orange"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "No phone 30 min after waking"}
          onPress={(isChecked) => setExperiment("No phone 30 min after waking")}
        />

        <BouncyCheckbox
          text="45 min workout"
          fillColor="green"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "45 min workout"}
          onPress={(isChecked) => setExperiment("45 min workout")}
        />

        <BouncyCheckbox
          text="Daily journaling"
          fillColor="rebeccapurple"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "Daily journaling"}
          onPress={(isChecked) => setExperiment("Daily journaling")}
        />

        <BouncyCheckbox
          text="No sugar for the day"
          fillColor="red"
          textStyle={{
            textDecorationLine: "none",
          }}
          isChecked={experiment === "No sugar for the day"}
          onPress={(isChecked) => setExperiment("No sugar for the day")}
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
