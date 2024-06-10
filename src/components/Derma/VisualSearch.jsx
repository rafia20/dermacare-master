import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { FAB, Portal, Provider, Modal, Button, Card, Title, Paragraph, Text, ActivityIndicator, PaperProvider, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import GeneralHeader from '../GeneralHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';

const VisualSearch = ({route}) => {
  const scrollViewRef = useRef();  // Add this line
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  const onScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(y > 200);  // Show button when scrolled more than 200 pixels
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log('selectedImage:', selectedImage);
  }, [selectedImage]);

  useEffect(() => {

  if (route.params?.image) {
    console.log('Image:', route.params.image);
    const uri = Image.resolveAssetSource(route.params.image).uri;
    setSelectedImage(uri);
  }
  }, [route.params?.image]);
  


  const uploadImage = async (imageUri) => {
    setLoading(true);
    if (!imageUri) {
      Alert.alert('No image selected', 'Please select an image before uploading.', [{ text: 'OK' }]);
      setLoading(false);
      return;
    }
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    let bytes;
    const res = await fetch(imageUri);
    const blob = await res.blob();

    console.log(blob);

    let updatedFileType = fileType;
    
    if (fileType.includes('&')) {
      updatedFileType = fileType.split("&")[0];
    }

    
    console.log(updatedFileType)
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: `photo.${fileType}`,
      type: `image/${updatedFileType}`,
    });

    const headers = {
      'Ocp-Apim-Subscription-Key': '49e4bb3bd97e40249c196b678456227f',
      'Content-Type': 'multipart/form-data',
    };

    let imgs = await AsyncStorage.getItem('images');
    // imgs = undefined;
    if (imgs) {
      console.log(imgs)
      setImages(JSON.parse(imgs));
      setLoading(false);
      return;

    }
    console.log('images:', images)
    try {
      const response = await fetch('https://api.bing.microsoft.com/v7.0/images/visualsearch', {
        method: 'POST',
        body: formData,
        headers: {
          'Ocp-Apim-Subscription-Key': '49e4bb3bd97e40249c196b678456227f',
          'Content-Type': 'multipart/form-data' // This might be set automatically by fetch; some environments might require manual handling
        }

      });
      const data = await response.json();
      const images = data.tags[0].actions[2].data.value;
      console.log(images[0]);
      setImages(images);
      console.log('images:', images)
      await AsyncStorage.setItem('images', JSON.stringify(images));
      setLoading(false);
    } catch (error) {
      console.error("Error uploading image: ", error);
      setLoading(false);
    }

  };

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('Media library permission:', permissionResult);

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!', [{ text: 'OK' }]);
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log('Image picker result:', pickerResult.uri);

    if (!pickerResult.cancelled) {
      setSelectedImage(pickerResult.assets[0].uri);
      setModalVisible(false); // Close the modal after selecting an image
    }
  };

  const handleCaptureImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    console.log('Camera permission:', permissionResult);

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera is required!', [{ text: 'OK' }]);
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log('Image picker result:', pickerResult.assets[0].uri);

    if (!pickerResult.cancelled) {
      setSelectedImage(pickerResult.assets[0].uri);
      setModalVisible(false); // Close the modal after capturing an image
    }
  };

  const handleProcessImage = () => {
    if (!selectedImage) {
      Alert.alert('No image selected', 'Please select an image before processing.', [{ text: 'OK' }]);
      return;
    } else {
      Alert.alert('Report Results');
    }

    // Implement image processing logic here (e.g., send image to backend API)
    console.log('Processing image:', selectedImage);

    // Additional processing tasks can be added here
  };

  return (
    <Provider>
      {/* <GeneralHeader title="Visual Search" /> */}
      <FAB.Group
        style={styles.fab}
        open={false}
        icon={'plus'}
        actions={[
          { icon: 'file-image', label: 'Select from Gallery', onPress: () => setModalVisible(true) },
          { icon: 'camera', label: 'Capture from Camera', onPress: handleCaptureImage },
        ]}
        onStateChange={({ open }) => {
          if (open) {
            setModalVisible(true); // Open the modal when FAB group is open
          }
        }}
      />
      
      <ScrollView
        ref={scrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={5} // 16ms is 60fps
      >
        <View style={styles.container}>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="cover" />}

          
          {selectedImage? <Button loading={loading} mode='contained-tonal' icon={'chart-timeline-variant-shimmer'} onPress={async () => { await uploadImage(selectedImage) }}>{loading? 'Generating': 'Generate'} Similar Images</Button> : <Text>No Image Selected</Text>} 

          
          <Divider  bold={true} theme={{colors: {primary:'green'}}} style={{ marginVertical: 10, zIndex: 2, color:'blue', height:5 }} />   



          {loading ? <Text/> :

            <ScrollView >
              {images.length>0 ? <Text style={{'color': 'purple', fontWeight: '400', marginLeft: 'auto', marginRight:'auto', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 4}} variant="headlineMedium">Similar Images</Text> : ''} 
              <Text/>
              
              {images.map((item, index) => (
                <>
                  <Card key={index} style={styles.card}>
                    {item.contentUrl? (
                      <Card.Cover source={{ uri: item.contentUrl }} />
                    ): item.thumbnailUrl? (
                      <Card.Cover source={{ uri: item.thumbnailUrl }} />
                    ): <Text>Image not available</Text>}

                    <Card.Content>
                      <Title>{item.name}</Title>
                      <Paragraph>{item.description}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{ flex: 1, justifyContent: 'space-between' }}>

                      <Text style={{ 'marginRight': 'auto' }}> {formatDate(item.datePublished)} </Text>
                      <Button
                        icon="link"
                        mode="contained"
                        onPress={() => Linking.openURL(item.webSearchUrl)}

                      >
                        Open Source
                      </Button>



                    </Card.Actions>
                  </Card>

                  <Text key={'index' + index} id={index + 'a'} />
                </>
              ))}

            </ScrollView>
          }


          <Portal>
            <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
              <Button onPress={handleSelectImage}>Choose from Gallery</Button>
              <Button onPress={handleCaptureImage}>Capture from Camera</Button>
            </Modal>
          </Portal>
        </View>
      </ScrollView>


      {showScrollToTop && (
        <TouchableOpacity
          onPress={scrollToTop}
          style={styles.scrollToTopButton}
        >
          <Button icon={'format-vertical-align-top'}>Up</Button>
        </TouchableOpacity>
      )}
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  processButton: {
    marginTop: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 50,
    borderRadius: 10,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute', // Position the FAB absolutely
    margin: 16,
    right: 0, // Align to the right
    bottom: 0, // Align to the bottom
    zIndex: 1,
  },
  scrollToTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 20,
    elevation: 3,
  },
  
});

export default VisualSearch;
