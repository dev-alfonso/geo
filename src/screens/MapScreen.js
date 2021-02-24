import React, { Component, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import MapView, { Marker } from "react-native-maps"
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
      countSync: 0
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

          marker = {
            title: value.note,
            description: value.note,
            latlng: {
              latitude: latitude,
              longitude: longitude
            },
            sync: false
          }

          this.state.markers.push(marker)

          AsyncStorage.setItem('markers', JSON.stringify(this.state.markers));

          this.setState({
            markers: this.state.markers,
            countSync: this.state.countSync + 1
          })

        },
        (error) => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
    console.log(value)
  }

  syncMarkers(){
    let markers = this.state.markers.filter((m) => !m.sync);
    markers.forEach((marker) => {
      marker.sync = true;
      axios.post("https://hooks.zapier.com/hooks/catch/472009/09rj5z/?vinnialfonso@hotmail.com", {
        latitude: marker.latitude,
        longitude: marker.longitude
      }).then((response) => {
        console.log(response.status);
      });
    })
    AsyncStorage.setItem('markers', JSON.stringify(this.state.markers));
    console.log(this.state.markers)
    this.setState({
      markers: this.state.markers,
      countSync: this.state.markers.filter((m) => !m.sync).length
    })
  }

  render() {
    if (!this.state.initialState){
      return <View></View>
    } else {
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
                pinColor={marker.sync ? 'a9a9a9' : 'green'}
              />
            ))}
          </MapView>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, { borderRightWidth: 1, borderColor: "#CCC" }]} 
                              onPress={() => { this.setState({ modalVisible: true }); }}>
              <Text style={styles.textButton}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}
                              disabled={this.state.countSync == 0}
                              onPress={this.syncMarkers.bind(this)}>
              <Text style={styles.textButton}>Sincronizar{this.state.countSync > 0 ? ` (${this.state.countSync})` : ""}</Text>
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
    console.log(this.state.initialState);
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