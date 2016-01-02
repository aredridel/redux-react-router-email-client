import { pushPath } from 'redux-simple-router';
import fetch from 'isomorphic-fetch';

export const login = (email) => (
  dispatch => 
  fetch('/get-user-info', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email
    })
  })
  .then(response => response.json())
  .then(json => {
    dispatch({
      type: 'LOG_IN'
    });
    return json;
  })
  .then((info) => {
    dispatch({
      type: 'SET_USER_INFO',
      info
    });
    return info.email;
  })
  .then((email) => {
    dispatch(fetchAndSelectBox('inbox', email));
  })
  .then(() => {
    dispatch(fetchUnread(email))
  })
);

export const fetchAndSelectBox = (box, email) => (
  dispatch => 
  fetch(`/${box}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email
    })
  })
  .then(response => response.json())
  .then(json => {
    dispatch({
      type: 'FETCH_BOX',
      box: box,
      emails: json
    })
  })
  .then(() => 
        dispatch({
          type: 'SELECT_EMAIL_TO_READ',
          index: 0
        })
       )
            .then(() => 
                  dispatch({
                    type: 'SELECT_BOX',
                    box
                  })
                 )
       .then(() => 
             dispatch( 
                               pushPath(`/${box}`)
                     )
            )
);

export const selectEmailToRead = index => (
  {
    type: 'SELECT_EMAIL_TO_READ',
    index
  }
);

export const sendEmail = (to, text, subject, from) => (
  dispatch =>
  fetch('/compose', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to,
      text,
      subject,
      from
    })
  })
  .then(response => response.json())
  .then(json => 
        dispatch({
          type: 'SEND_EMAIL',
          email: json
        })
       )
       .then(() => {
         dispatch({
           type: 'HIDE_COMPOSE_DISPLAY'
         });
       })
);

export const sendReply = (to, text, subject, thread_id, from) => (
  dispatch =>
  fetch('/reply', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to,
      text,
      subject,
      thread_id,
      from
    })
  })
  .then(response => response.json())
  .then(json =>  {
        dispatch({
          type: 'SEND_REPLY',
          reply: json
        })
  }
       )
       .then(() => {
         dispatch({
           type: 'HIDE_REPLY_DISPLAY'
         });
       })
);

export const forwardEmail = (to, html, text, subject, from) => (
  dispatch =>
  fetch('/forward', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to,
      html,
      text,
      subject,
      from
    })
  })
  .then(response => response.json())
  .then(json => 
        dispatch({
          type: 'FORWARD_EMAIL',
          email: json
        })
       )
       .then(() => {
         dispatch({
           type: 'HIDE_FORWARD_DISPLAY'
         });
       })
);

export const fetchUnread = (email) => (
  dispatch => {
    fetch(`/unread`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": email
      })
    })
    .then(response => response.json())
    .then(json => 
          dispatch({
            type: 'GET_UNREAD',
            unread: json
          })
         )
  }
);

export const logout = () => (
  dispatch => {
    dispatch({
      type: 'LOG_OUT'
    })
    dispatch(pushPath('/'))
  }
);
