import React, { Component } from 'react';
import Joi from '@hapi/joi';
import L from 'leaflet';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';
import userLocationURL from './user_location.svg'
import messageLocationURL from './message_location.svg'

import './App.css';

var myIcon = L.icon({
    iconUrl: userLocationURL,
    iconSize: [38, 95],
    iconAnchor: [0, 94],
    popupAnchor: [25, -76]
});

var myIcon = L.icon({
    iconUrl: messageLocationURL,
    iconSize: [38, 95],
    iconAnchor: [0, 94],
    popupAnchor: [25, -76]
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
    },
    sendingMessage: false,
    sentMessage: false,
    messages: []
  }

  componentDidMount() {
    fetch(API_URL)
      .then(res => res.json())
      .then(messages => {
        const haveSeenLocation = {};
        messages = messages.reduce((all, message) => {
          const key = `${message.latitude}${message.longitude}`;
          if (haveSeenLocation[key]) {
            haveSeenLocation[key].otherMessages = haveSeenLocation[key].otherMessages || [];
            haveSeenLocation[key].otherMessages.push(message);
          } else {
            haveSeenLocation[key] = message;
            all.push(message);
          }
          return all;
        }, []);
        this.setState({
          messages
        });
      });
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
    let { name, message } = this.state.userMessage;
    name = name.trim();
    message = message.trim();

    const validMessage = 
      name.length > 0 && name.length <= 500 &&
      message.length > 0 && message.length <= 500;

    return validMessage && this.state.haveUsersLocation ? true: false;
  }

  formSubmitted = (event) => {
  	event.preventDefault();
    
    if (this.formIsValid) {
      this.setState({
        sendingMessage: true
      });
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
        setTimeout(() => {
          this.setState({
            sendingMessage: false,
            sentMessage: true
          });
        }, 1000);
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
            <Marker 
              position={position}
              icon={myIcon}>
            </Marker> : ''
          }
          {this.state.message.map(message => (
            <Marker 
              key={message._id}
              position={[message.latitude, message.longitude]}
              icon={myIcon}>
              <Popup>
                <p><em>{message.name}:</em> {message.message}</p>
                { message.otherMessages ? message.otherMessages.map(message => <p key={message._id}><em>{message.name}:</em> {message.message}</p>) : '' }
              </Popup>
            </Marker>
          ))};
        }
        </Map>
        <Card body className="message-form">
          <CardTitle>welcome to GuestMap</CardTitle>
          <CardText>Leave a message with your location lol</CardText>
          { 
            !this.state.sendingMessage && !this.state.sentMessage && this.state.haveUsersLocation?
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
            </Form> :
            this.state.sendingMessage || !this.state.haveUsersLocation ?
            <video autoPlay loop src="https://i.giphy.com/media/BCIRKxED2Y2JO/giphy.mp4"></video> :
            <CardText>"Message submitted!"</CardText>
          }
        </Card>
      </div>
    );
  }
}

export default App;
