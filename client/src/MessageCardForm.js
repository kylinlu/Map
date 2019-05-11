import React from 'react';
import { Card, Button, CardTitle, CardText, Form, FormGroup, Label, Input } from 'reactstrap';

const MessageCardForm = (props) => {
  return (
    <Card body className="message-form">
      <CardTitle>Hello, leave a message!</CardTitle>
      {
        !props.sendingMessage && !props.sentMessage && props.haveUsersLocation ?
          <Form onSubmit={props.formSubmitted}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                onChange={props.valueChanged}
                type="text"
                name="name"
                id="name"
                placeholder="Enter your name" />
            </FormGroup>
            <FormGroup>
              <Label for="message">Message</Label>
              <Input
                onChange={props.valueChanged}
                type="textarea"
                name="message"
                id="message"
                placeholder="Enter a message" />
            </FormGroup>
            <Button type="cancel" color="danger" onClick={props.cancelMessage}>Cancel</Button> {' '}
            <Button type="submit" color="info" disabled={!props.formIsValid()}>Send</Button>
          </Form> :
          props.sendingMessage || !props.haveUsersLocation ? 
            <video
              autoPlay
              loop
              src="https://i.giphy.com/media/BCIRKxED2Y2JO/giphy.mp4"></video> :
            <CardText>Message sent!</CardText>
      }
    </Card>
  );
};

export default MessageCardForm;