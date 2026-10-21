import { useQuery } from "@apollo/client/react";
import { ActivityIndicator, Button, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GET_MOVIES } from "../graphql/movies";

export function MoviesScreen() {
  const { data, loading, error } = useQuery(GET_MOVIES);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, backgroundColor: "#F3F4F6" }}>
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 20 }}>
        Peliculas
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text>Error al cargar peliculas {error.message}</Text>
      ) : (
        <FlatList
          data={data?.movies ?? []}
          keyExtractor={(m) => m.id}
          ListEmptyComponent={<Text>No hay peliculas</Text>}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                backgroundColor: "#FFFFFF",
                borderColor: "gray",
                marginBottom: 12,
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "600" }}>
                {item.title}
              </Text>

              <Text>
                {item.director} - {item.year}
              </Text>

              <Text>
                Promedio:{" "}
                {item.averageRating === null
                  ? "Sin calificaciones"
                  : item.averageRating.toFixed(1)}
              </Text>

              <Text>Calificaciones: {item.ratingsCount}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
