import React from "react";
import { View, Text, Pressable } from "react-native";
import Slider from "@react-native-community/slider";
import IBaseline from "../../types/IBaseline";
import { useOnboardingStore } from "@/store/onboarding";

interface Onboarding3Props {
  pagerRef: React.RefObject<any>;
}

export default function Onboarding3({ pagerRef }: Onboarding3Props) {
  const { baseline, setBaseline } = useOnboardingStore();
  return (
    <>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
        Your current lifestyle
      </Text>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          marginTop: 16,
          gap: 4,
          width: "100%",
        }}
      >
        <Text style={{ fontSize: 16, color: "gray", marginLeft: 16 }}>
          Your current sleep quality score ({baseline.sleepQualityScore})
        </Text>
        <Slider
          thumbTintColor="blue"
          maximumTrackTintColor="blue"
          minimumTrackTintColor="blue"
          value={baseline.sleepQualityScore}
          onValueChange={(value) => setBaseline({ sleepQualityScore: value })}
          minimumValue={0}
          maximumValue={10}
          step={1}
          style={{ width: "100%", height: 60 }}
        />
        <Text style={{ fontSize: 16, color: "gray", marginLeft: 16 }}>
          Your current focus score ({baseline.focusScore})
        </Text>
        <Slider
          thumbTintColor="hotpink"
          maximumTrackTintColor="hotpink"
          minimumTrackTintColor="hotpink"
          value={baseline.focusScore}
          onValueChange={(value) => setBaseline({ focusScore: value })}
          minimumValue={0}
          maximumValue={10}
          step={1}
          style={{ width: "100%", height: 60 }}
        />
        <Text style={{ fontSize: 16, color: "gray", marginLeft: 16 }}>
          Your current mood score ({baseline.moodScore})
        </Text>
        <Slider
          thumbTintColor="orange"
          maximumTrackTintColor="orange"
          minimumTrackTintColor="orange"
          value={baseline.moodScore}
          onValueChange={(value) => setBaseline({ moodScore: value })}
          minimumValue={0}
          maximumValue={10}
          step={1}
          style={{ width: "100%", height: 60 }}
        />
        <Text style={{ fontSize: 16, color: "gray", marginLeft: 16 }}>
          Your current screen time in hours ({baseline.phoneHours})
        </Text>
        <Slider
          thumbTintColor="green"
          maximumTrackTintColor="green"
          minimumTrackTintColor="green"
          value={baseline.phoneHours}
          onValueChange={(value) => setBaseline({ phoneHours: value })}
          minimumValue={0}
          maximumValue={10}
          step={1}
          style={{ width: "100%", height: 60 }}
        />
        <Text style={{ fontSize: 16, color: "teal", marginLeft: 16 }}>
          Confidence ({baseline.confidenceScore})
        </Text>
        <Slider
          value={baseline.confidenceScore}
          onValueChange={(v) => setBaseline({ confidenceScore: v })}
          thumbTintColor="teal"
          maximumTrackTintColor="teal"
          minimumTrackTintColor="teal"
          minimumValue={0}
          maximumValue={10}
          step={1}
          style={{ width: "100%", height: 60 }}
        />
        <Text style={{ fontSize: 16, color: "gray", marginLeft: 16 }}>
          Your current exercise score ({baseline.exerciseScore})
        </Text>
        <Slider
          thumbTintColor="rebeccapurple"
          maximumTrackTintColor="rebeccapurple"
          minimumTrackTintColor="rebeccapurple"
          value={baseline.exerciseScore}
          onValueChange={(value) => setBaseline({ exerciseScore: value })}
          minimumValue={0}
          maximumValue={10}
          step={1}
          style={{ width: "100%", height: 60 }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <Pressable
          onPress={() => pagerRef.current?.setPage(1)}
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
          onPress={() => pagerRef.current?.setPage(3)}
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
