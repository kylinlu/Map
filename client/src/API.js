const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production_url';

export function getMessages() {
	return fetch(API_URL)
      .then(res => res.json())
      .then(messages => {
        const haveSeenLocation = {};
        return messages = messages.reduce((all, message) => {
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
      });
}

export function getLocation() {
	return new Promise((resolve) => {
		navigator.geolocation.getCurrentPosition((position) => {
			resolve({
				lat: position.coords.latitude,
          		lng: position.coords.longitude
          	});
    }, () => {
      resolve(fetch('https://ipapi.co/json')
        .then(res => res.json())
        .then(location => {
          this.setState({
            return {
            	lat: position.coords.latitude,
          		lng: position.coords.longitude
            };
          }));
        });
	});
}

export function sendMessage(message) {
	return fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(message)
      }).then(res => res.json())
}