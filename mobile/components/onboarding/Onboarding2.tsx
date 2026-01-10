import React from "react";
import { View, Text, Pressable } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

interface Onboarding2Props {
  selectedProblems: string[];
  setSelectedProblems: React.Dispatch<React.SetStateAction<string[]>>;
  pagerRef: React.RefObject<any>;
}

export default function Onboarding2({
  selectedProblems,
  setSelectedProblems,
  pagerRef,
}: Onboarding2Props) {
  return (
    <>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
        What frustrates you most right now?
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
          text="I procrastinate"
          fillColor="blue"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedProblems([...selectedProblems, "procrastination"])
              : setSelectedProblems(
                  selectedProblems.filter(
                    (habit) => habit !== "procrastination",
                  ),
                )
          }
        />

        <BouncyCheckbox
          text="I feel tired all day"
          fillColor="hotpink"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedProblems([...selectedProblems, "tiredness"])
              : setSelectedProblems(
                  selectedProblems.filter((habit) => habit !== "tiredness"),
                )
          }
        />

        <BouncyCheckbox
          text="I waste time on my phone"
          fillColor="orange"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedProblems([...selectedProblems, "phone_usage"])
              : setSelectedProblems(
                  selectedProblems.filter((habit) => habit !== "phone_usage"),
                )
          }
        />

        <BouncyCheckbox
          text="I can’t be consistent"
          fillColor="green"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedProblems([...selectedProblems, "inconsistency"])
              : setSelectedProblems(
                  selectedProblems.filter((habit) => habit !== "inconsistency"),
                )
          }
        />

        <BouncyCheckbox
          text="I don’t know what works"
          fillColor="rebeccapurple"
          textStyle={{
            textDecorationLine: "none",
          }}
          onPress={(isChecked) =>
            isChecked
              ? setSelectedProblems([...selectedProblems, "lack_of_clarity"])
              : setSelectedProblems(
                  selectedProblems.filter(
                    (habit) => habit !== "lack_of_clarity",
                  ),
                )
          }
        />

        {/*<BouncyCheckbox
          text="Other"
          onPress={(isChecked) => console.log("Other", isChecked)}
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
          onPress={() => pagerRef.current?.setPage(0)}
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
          <Text style={{ color: "white" }}>Next</Text>
        </Pressable>
      </View>
    </>
  );
}
