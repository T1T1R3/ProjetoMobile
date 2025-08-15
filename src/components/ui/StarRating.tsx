import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StarRatingProps {
  rating: number | null;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  if (rating === null) return null;

  const stars = [];
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    } else if (i === fullStars && halfStar) {
      stars.push(
        <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
      );
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={16} color="#FFD700" />
      );
    }
  }

  return (
    <View style={styles.ratingContainer}>
      <View style={styles.starsContainer}>{stars}</View>
      <Text style={styles.ratingText}>{rating}/10</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 6,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
  },
});
