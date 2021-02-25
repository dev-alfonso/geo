import React from 'react';
import { InputText, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Marker } from 'react-native-maps';
import { withFormik } from 'formik';
import { string, object } from 'yup';

let Yup = require('yup');

const FormNote = (props) => {
  return (
    <View style={styles.formNote}>
      <Text style={styles.labelForm}>Anotação</Text>
      <TextInput
        multiline
        numberOfLines={4}
        editable
        style={styles.inputText}
        onChangeText={value => props.setFieldValue('note', value)}
        value={props.values.note}
      />
      <Text style={{ color: 'red' }}>
        {props.errors.note}
      </Text>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity style={[styles.buttonOption, styles.buttonCancel]} onPress={props.closeModal}>
          <Text style={styles.labelButton}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonOption, styles.buttonSubmit]} onPress={props.handleSubmit}>
          <Text style={styles.labelButton}>Salvar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const createNote = (values, props) => {
  props.addMarker(values);
  props.closeModal();
}

const form = withFormik({
  mapPropsToValues: (props) => ({ note: "" }),
  handleSubmit: (values, { props }) => {
    createNote(values, props);
  },
  validateOnChange: false,
  validationSchema: Yup.object().shape({
    note: Yup.string().required('Preencha este campo com alguma anotação')
  })
})(FormNote);

const styles = StyleSheet.create({
  
  formNote: {
    width: "100%",
    marginTop: 20
  },

  labelForm: {
    fontSize: 16,
    marginBottom: 5
  },

  inputText: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    textAlignVertical: 'top',
    justifyContent: 'flex-start',
    backgroundColor: "#f5f5f5",
    width: '100%',
    alignSelf: 'center',
    minHeight: 150,
    maxHeight: 250,
    padding: 15,
    fontSize: 16,
  },

  buttonOption: {
    width: "50%",
    padding: 10,
    marginTop: 10
  },

  buttonSubmit: {
    backgroundColor: "#30375B",
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },

  buttonCancel: {
    backgroundColor: "#8b2e24",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5
  },

  labelButton: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center"
  }

});

export default form;