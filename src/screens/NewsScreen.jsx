import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Linking, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme, Text, Divider, Searchbar, Menu, Provider } from 'react-native-paper';
import Carousel from 'react-native-snap-carousel';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const NewsScreen = () => {
  const [newsData, setNewsData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const { colors } = useTheme();
  const [carouselItems, setCarouselItems] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchNewsData = async () => {
    try {
      const response = await fetch('https://api.bing.microsoft.com/v7.0/news/search?q=dermatology&count=50&textdecorations=true', {
        headers: {
          'Ocp-Apim-Subscription-Key': 'd3f09dc9c39e47dba03f6be717280449'
        }
      });
      const data = await response.json();
      setNewsData(data.value);
      setCarouselItems(data.value.slice(0, 5)); // Set the first 4 items for the carousel
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNewsData().then(() => setRefreshing(false));
  }, []);

  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredNews = newsData.filter(item => {
    const searchWords = searchQuery.toLowerCase().split(' ');
    const itemText = (item.name + ' ' + item.description).toLowerCase();

    const matchSearch = searchWords.some(word => itemText.includes(word));

    if (filter === 'all') return matchSearch;
    if (filter === 'date') return matchSearch && item.datePublished;
    if (filter === 'popular') return matchSearch && item.sortOrder === 'popular';
    if (filter === 'trending') return matchSearch && item.sortOrder === 'trending';

    return false;
  });

  if (filteredNews.length === 0 && searchQuery) {
    Alert.alert('No Results', 'Sorry, no visible results found.');
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
      <Card style={styles.carouselCard}>
        {item.image?.thumbnail && (
          <Card.Cover source={{ uri: item.image.thumbnail.contentUrl }} style={styles.carouselImage} />
        )}
        <Card.Content>
          <Title style={styles.carouselTitle}>{item.name}</Title>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />;
  }

  return (
    <Provider>
      <Title style={styles.tittle}> DermInsights </Title>
      <View style={styles.container}>
        <Searchbar
          placeholder="Search by title, description, or keyword"
          onChangeText={onChangeSearch}
          value={searchQuery}
          icon={() => <MaterialIcons name="search" size={24} color="black" />}
          style={styles.searchbar}
        />
        <View style={styles.searchAndFilterContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <MaterialIcons name="filter-list" size={24} color="gray" style={styles.filterIcon} />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => setFilter('all')} title="All" />
            <Menu.Item onPress={() => setFilter('date')} title="Date" />
            <Menu.Item onPress={() => setFilter('popular')} title="Popular" />
            <Menu.Item onPress={() => setFilter('trending')} title="Trending" />
          </Menu>
        </View>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.carouselContainer}>
            <Title style={styles.carouselHeading}>Top Trending News</Title>
            <Carousel
              data={carouselItems}
              renderItem={renderItem}
              sliderWidth={Dimensions.get('window').width}
              itemWidth={300}
              autoplay={true}
              loop={true}
            />
          </View>

          <View style={styles.articleContainer}>
          <Title style={styles.carouselHeading}>Derm & Skin News Feed </Title>
            {
              
              filteredNews.map((item, index) => (
                <React.Fragment key={index}>
                  <Card style={styles.card}>
                    {item.image?.thumbnail && (
                      <Card.Cover source={{ uri: item.image.thumbnail.contentUrl }} style={styles.cardImage} />
                    )}
                    
                    <Card.Content>
        
                      <Title style={styles.cardTitle}>{item.name}</Title>
                      <Paragraph style={styles.cardDescription}>{item.description}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{ flex: 1, justifyContent: 'space-between' }}>
                      <Text style={{ marginRight: 'auto' }}>{formatDate(item.datePublished)}</Text>
                      <Button
                        icon="book-open-outline"
                        mode="contained"
                        onPress={() => Linking.openURL(item.url)}
                        color={colors.primary}
                      >
                        Read More
                      </Button>
                    </Card.Actions>
                  </Card>
                  <Divider />
                </React.Fragment>
              ))
            }
          </View>
        </ScrollView>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  searchbar: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  searchAndFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  filterIcon: {
    marginLeft: 10,
  },
  carouselContainer: {
    marginBottom: 20,
    margintop: 20
  },
  carouselHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'lightpurple',
  },
  carouselCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 250,
    width:300,
    padding: 10,
    marginBottom:20,
    marginLeft: 5,
    marginRight: 25,
    elevation: 4,
    shadowColor: 'purple',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  carouselImage: {
    height: 100,
    borderRadius: 10,
  },
  carouselTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop:5,
    color: '#333',
  },
  articleContainer: {
    marginTop: 10,
  
  },
  tittle:{
      fontSize:22,
      fontStyle:'normal', 
      fontWeight:'bold',  
      textAlign:'center' ,
      marginTop:10,
  },
  card: {
    marginBottom: 10,
    elevation: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'purple',
    overflow: 'hidden',
  },
  cardImage: {
    height: 130,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'justify',
    marginVertical: 5,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'justify',
  },
});

export default NewsScreen;
