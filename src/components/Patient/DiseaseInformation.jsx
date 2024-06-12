import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';

const DiseaseInformation = ({ disease, image }) => {
    const navigation = useNavigation();

    const handleImageTouch = () => {
        Alert.alert(
            "Visual Image Search",
            "Do you want to perform a visual image search?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "OK", onPress: () => navigation.navigate("Visual Search", {image: image}) }
            ]
        );
    };

    return (
        <Card style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.label}>Disease Name:</Text>
                <Text style={styles.diseaseName}>{disease}</Text>
            </View>
            <Card.Content>
                <TouchableOpacity onPress={handleImageTouch}>
                    <Card.Cover source={image} style={styles.image} />
                </TouchableOpacity>
            </Card.Content>
            <Card.Actions style={styles.actions}>
                <Button icon={'chat-question-outline'} mode='contained' onPress={() => navigation.navigate("Ask Questions", {disease: disease})}>
                    Ask Question
                </Button>
            </Card.Actions>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        margin: 10,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        backgroundColor: '#e5c3eb',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 20,
    },
    label: {
        fontSize: 18,
        color: '#6a097d',
    },
    diseaseName: {
        fontSize: 25,
        marginTop: 5,
        fontWeight: 'bold',
        color: '#4a235a',
    },
    image: {
        marginVertical: 10,
        borderRadius: 10,
    },
    actions: {
        justifyContent: 'center',
        padding: 10,
    },
});

export default DiseaseInformation;
