import { Stack } from 'expo-router/stack';

export default function ItineraryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[raceWeekendId]" />
      <Stack.Screen name="[raceWeekendId]/[dayId]" />
    </Stack>
  );
}