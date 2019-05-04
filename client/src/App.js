import React, { Component } from 'react';
import Joi from '@hapi/joi';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';

import './App.css';

var myIcon = L.icon({
    iconUrl: 'my-icon.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76]
});

const schema = Joi.object().keys({
    name: Joi.string().min(1).max(500).required(),
    message: Joi.string().alphanum().min(5).max(500).required()
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production_url';

class App extends Component {
  state = {
    location: {
      lat: 51.505,
      lng: -0.09,
    },
    haveUsersLocation: false,
    zoom: 2,
    userMessage: {
    	name: '',
    	message: ''
    }
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        haveUsersLocation: true,
        zoom: 13
      });
    }, () => {
      console.log("oops no location given");
      fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(location => {
          console.log(location);
          this.setState({
            location: {
              lat: location.latitude,
              lng: location.longitude
            },
            haveUsersLocation: true,
            zoom: 13
          });
        })
    });
  }

  formIsValid = () => {
    const userMessage = {
      name: this.state.userMessage.name,
      message: this.state.userMessage.message
    };
    const result = Joi.validate(userMessage, schema);

    return !result.error && this.state.haveUsersLocation ? true: false;
  }

  formSubmitted = (event) => {
  	event.preventDefault();
    
    if (this.formIsValid) {
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: this.state.userMessage.name,
          message: this.state.userMessage.message,
          latitude: this.state.location.lat,
          longitude: this.state.location.lng
        })
      }).then(res => res.json())
      .then(message => {
        console.log(message);
      });
    }
  }

  valueChanged = (event) => {
  	const { name, value } = event.target;
  	this.setState((prevState) => ({
  		userMessage: {
  			...prevState.userMessage,
  			[name]: value
  		}
  	}))
  }

  render() {
    const position = [this.state.location.lat, this.state.location.lng];
    return (
      <div className="map">
        <Map className="map" center={position} zoom={this.state.zoom}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          { this.statehaveUsersLocation ?
            <Marker position={position}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker> : ''
          }
        </Map>
        <Card body className="message-form">
          <CardTitle>welcome to GuestMap</CardTitle>
          <CardText>Leave a message with your location lol</CardText>
          <Form onSubmit={this.formSubmitted}>
          	<FormGroup>
          		<Label for="name">Name</Label>
          		<Input 
          			onChange={this.valueChanged}
	          		type="text" 
	          		name="name" 
	          		id="name" 
	          		placeholder="Enter your name" />
          	</FormGroup>
          	<FormGroup>
          		<Label for="message">Message</Label>
          		<Input 
          			onChange={this.valueChanged}
	          		type="textarea" 
	          		name="message" 
	          		id="message" 
	          		placeholder="Enter a message" />
          	</FormGroup>
          	<Button type="submit" color="info" disabled={!this.formIsValid()}>Send</Button>
          </Form>
        </Card>
      </div>
    );
  }
}

export default App;
