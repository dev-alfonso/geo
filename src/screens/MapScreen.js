import React, { Component, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import MapView, { Marker, Callout } from "react-native-maps"
import Geolocation from "react-native-geolocation-service";
import { useFormik } from "formik";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'

import FormNote from '../components/FormNote'

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      initialState: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      },
      modalVisible: false,
      markers: [],
      countSync: 0,
      syncing: false
    };
  }

  async componentDidMount(){
    let jsonValue = await AsyncStorage.getItem('markers');
    let markers = jsonValue != null ? JSON.parse(jsonValue) : [];
    this.setState({
      markers: markers,
      countSync: markers.filter((m) => !m.sync).length
    })
    Geolocation.getCurrentPosition((position) => {
      this.setState({
        initialState: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }
      });
    });
  }
  
  addMarker(value){
    Geolocation.getCurrentPosition(
        (position) => {
          let marker, latitude, longitude;
          
          let test = 0.001 * this.state.markers.length;

          latitude = position.coords.latitude + test;
          longitude = position.coords.longitude + test;

          let datetime = new Date();
          let dateString = datetime.getDate() + "/" + (datetime.getMonth()+1) + "/" +  datetime.getFullYear() + " " + datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds();

          marker = {
            title: "Anotação",
            description: value.note + "\n\n" + dateString,
            latlng: {
              latitude: latitude,
              longitude: longitude
            },
            sync: false,
            datetime: datetime
          }

          this.state.markers.push(marker)

          AsyncStorage.setItem('markers', JSON.stringify(this.state.markers));

          this.setState({
            markers: this.state.markers,
            countSync: this.state.countSync + 1
          })

        }
    );
  }

  syncMarkers(){
    this.setState({ syncing: true });
    let markers = this.state.markers.filter((m) => !m.sync);
    let countMarkersToSync = markers.length;
    let totalSynced = 0;
    markers.forEach((marker) => {
      marker.sync = true;
      axios.post("https://hooks.zapier.com/hooks/catch/472009/09rj5z/?vinnialfonso@hotmail.com", {
        latitude: marker.latitude,
        longitude: marker.longitude,
        annotation: marker.description,
        datetime: marker.datetime
      }).then((response) => {
        if (response.status == 200){
          totalSynced += 1;
          if (totalSynced == countMarkersToSync){
            this.setState({ syncing: false });
          }
        }
      });
    })
    AsyncStorage.setItem('markers', JSON.stringify(this.state.markers));
    this.setState({
      markers: this.state.markers,
      countSync: this.state.markers.filter((m) => !m.sync).length
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          loadingEnabled={true}
          region={this.state.initialState}
        >
          {this.state.markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              image={marker.sync ? require('../assets/images/gray-marker.png') : require('../assets/images/green-marker.png')}
            >
              <Callout tooltip style={{ backgroundColor: "#FFFFFF", borderColor: "#e4e9ee", minWidth: 100, maxWidth: 400, paddingTop: 2, paddingBottom: 2, paddingRight: 5, paddingLeft: 5 }}>
                <Text style={{ fontWeight: 'bold', alignSelf: 'center' }}>
                  Anotação
                </Text>
                <Text>
                  {marker.title}
                </Text>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, { borderRightWidth: 1, borderColor: "#CCC" }]} 
                            onPress={() => { this.setState({ modalVisible: true }); }}>
            <Text style={styles.textButton}>Adicionar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
                            disabled={this.state.countSync == 0 || this.state.syncing}
                            onPress={this.syncMarkers.bind(this)}>
            <Text style={[styles.textButton, { color: this.state.countSync > 0 || this.state.syncing ? '#000' : '#989898' }]}>
              {
                this.state.syncing ? 
                `Sincronizando...` :
                this.state.countSync > 0 ?
                `Sincronizar (${this.state.countSync})` : 
                `Sincronizado`
              }
            </Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <View style={styles.modalForm}>
            <Text style={styles.titleModal}>Nova anotação</Text>
            <FormNote closeModal={() => { this.setState({ modalVisible: false }); }} 
                      addMarker={(value) => this.addMarker(value) } />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },

  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
  },

  buttons: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    justifyContent: "space-between"
  },

  button: {
    width: "50%",
    padding: 20,
    backgroundColor: "#FFF",
  },

  textButton: {
    width: "100%",
    fontSize: 20,
    textAlign: "center"
  },

  modalForm: {
    padding: 20,
    alignItems: "center"
  },

  titleModal: {
    fontSize: 25
  },

});