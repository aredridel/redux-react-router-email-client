import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Map, List, fromJS } from 'immutable';
import generateRandomString from './lib/generateRandomString';
import { fetchInbox, fetchSentItems, fetchUnread } from './lib/fetchDocuments';

const FETCH_BOX = 'FETCH_BOX';
const SEND_EMAIL = 'SEND_EMAIL';
const SELECT_BOX = 'SELECT_BOX';

const reducer = (state = fromJS({
  selectedBox: 'inbox',
  userInfo: {
    email: 'a@example.com',
    name: 'A'
  },
  emails: {
    inbox: fetchInbox('a@example.com'),
    outbox: List([]),
    sent: List([])
  },
  unread: fetchUnread('a@example.com')
}), action) => {
  switch (action.type) {
    case SEND_EMAIL: 
      return state
      .updateIn([
        'emails',
        'sent'],
        list => list.push(fromJS({
          id: generateRandomString(),
          thread_id: action.thread_id,
          message: {
            "html": `<p>${action.text}</p>`,
            "text": action.text,
            "subject": action.subject,
            "from": state.getIn(['userInfo']),
            "unread": true,
            "to": action.to,
            "timestamp": action.timestamp,
            "headers": {
              "Reply-To": action.replyTo
            },
            "important": false
          }
        })));
      case FETCH_BOX:
        switch (action.box) {
          case 'inbox':
            return state.updateIn([
              'emails',
              action.box],
              value =>
              value.size > 0 ?
                value :
                  fromJS(fetchInbox('a@example.com')))
                case 'sent':
                  return state.updateIn([
                    'emails',
                    action.box],
                    value =>
                    value.size > 0 ?
                      value :
                        fromJS(fetchSentItems('a@example.com')))
        }
      case SELECT_BOX:
        switch (action.box) {
          case 'inbox':
            return state.set('selectedBox', action.box);
          case 'sent':
            return state.set('selectedBox', action.box);
        }
      default:
        return state;
  }
};

const storeWithMiddleware = applyMiddleware(thunk)(createStore);
const store = storeWithMiddleware(reducer);

const fetchAndSelectBox = box => (
  dispatch => {
    dispatch({
      type: 'FETCH_BOX',
      box: box
    });
    dispatch({
      type: 'SELECT_BOX',
      box: box
    });
  }
);

const ComposeModal = ({
  onClick,
  buttonName
}) => {
  let to, subject, text;
  return <div id="compose-email-content">
    <div className="yui3-widget-bd">
      <form>
        <fieldset>
          <p>
            <label>To</label><br/>
            <input ref={node => {
              to = node;
            }} type="email" id="compose-email-to" placeholder="" />
          </p>
          <p>
            <label>Subject</label><br/>
            <input ref={node => {
              subject = node;
            }} type="text" id="compose-email-subject" placeholder="" />
          </p>
          <p>
            <textarea ref={node => {
              text = node;
            }} id="compose-email-body" placeholder=""></textarea>
          </p>
        </fieldset>
        <button onClick={e => {
          e.preventDefault();
          onClick(['b@example.com'], 'Test text', 'Test subject', undefined)
        }}>{buttonName}</button>
      </form>
    </div>
  </div>;
};

const Nav = ({
  unread,
  onClick
}) => (
  <div className="pure-u id-nav">
    <a href="#nav" className="nav-menu-button">Menu</a>

    <div className="nav-inner">
      <button id="compose-button" className="pure-button primary-button" href="#">Compose</button>

      <div className="pure-menu pure-menu-open">
        <ul>
          <li><a onClick={e => {
            e.preventDefault();
            onClick('inbox')
          }} href="#">Inbox <span className="email-count">({unread})</span></a></li>
          <li><a href="#">Important</a></li>
          <li><a onClick={e => {
            e.preventDefault();
            onClick('sent');
          }} href="#">Sent</a></li>
          <li><a href="#">Drafts</a></li>
          <li><a href="#">Trash</a></li>
          <li className="pure-menu-heading">Labels</li>
          <li><a href="#"><span className="email-label-personal"></span>Personal</a></li>
          <li><a href="#"><span className="email-label-work"></span>Work</a></li>
          <li><a href="#"><span className="email-label-travel"></span>Travel</a></li>
        </ul>
      </div>
    </div>
  </div>
);

const EmailItem = ({
  name,
  unread,
  subject,
  children,
}) => {
  let classes = 'email-item pure-g';
  if (false)
    classes += ' email-item-selected';
  if (unread)
    classes += ' email-item-unread';
  return (
    <div className={classes}>
      <div className="pure-u">
        <img className="email-avatar" alt={name + '\'s avatar'} src="https://avatars3.githubusercontent.com/u/8316625?v=3&s=460" height="65" width="65"/>
      </div>
      <div className="pure-u-3-4">
        <h5 className="email-name">{name}</h5>
        <h4 className="email-subject">{subject}</h4>
        <p className="email-desc">
          {children}
        </p>
      </div>
    </div>
  );
};

const EmailList = ({
  emails
}) => (
  <div className="pure-u id-list"> 
    <div className="content">
      {emails ? emails.map((email, i) => {
        return <EmailItem
          key={i}
          name={email.getIn(['message', 'from', 'name'])}
          unread={false}
          subject={email.getIn(['message', 'subject'])}>
          {email.getIn(['message', 'text'])}
        </EmailItem>
        }) : ''}
      </div>
  </div> 
);

const Reader = ({
  email
}) => (
  <div className="pure-u id-main"> 
    <div className="content">
      <div className="email-content pure-g">
        <div className="email-content-header pure-g">
          <div className="pure-u-1-2">
            <h1 className="email-content-title">{email ? email.getIn(['message', 'subject']) : ''}</h1>
            <p className="email-content-subtitle">
              From <a>{email ? email.getIn(['message', 'from', 'name']): ''}</a> at <span>{email ? email.getIn(['message', 'timestamp']): ''}</span>
            </p>
          </div>

          <div className="pure-u-1-2 email-content-controls">
            <a className="pure-button secondary-button">Reply</a>
            <a className="pure-button secondary-button">Forward</a>
            <a className="pure-button secondary-button">Move to</a>
          </div>
        </div>

        <div className="email-content-body pure-u-1" dangerouslySetInnerHTML={{__html: email ? email.getIn(['message', 'html']): ''}} />
      </div>
    </div>
  </div> 
);

const App = ({
  emails,
  selectedBox,
  unread,
  selectedMailIndex
}) => {
  const selectedEmails = emails.get(selectedBox);
  const selectedEmail = selectedEmails.get(selectedMailIndex || 0);
  return <div className="pure-g-r content id-layout">
    <Nav 
      unread={unread}
      onClick={(box) => {
        store.dispatch(fetchAndSelectBox(box));
      }}
    />
    <EmailList emails={selectedEmails} />
    <Reader email={selectedEmail} />
    <ComposeModal
      onClick={(to, text, subject, thread_id) => 
        store.dispatch({
          type: 'SEND_EMAIL',
          to,
          text,
          subject,
          thread_id,
          timestamp: new Date().toISOString()
        })
      }
      buttonName="Send"
    />
  </div>
};

const render = () => {
  const state = store.getState().toObject();
  const t = state.selectedBox;
  ReactDOM.render(
    <App {...state}/>,
    document.getElementById('app')
  );
};

render();

store.subscribe(render);
