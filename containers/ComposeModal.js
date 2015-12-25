import React, { Component } from 'react';
import { Modal } from '../components/shared/Modal';
import { sendEmail } from '../actionCreators';

export class ComposeModal extends Component {

  componentDidMount () {
    const { store } = this.context;
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate();
    });
  }

  componentWillUnmount () {
    this.unsubscribe();
  }

  render () {
    const { store } = this.context;
    const refs = {};
    return <Modal
      idName="compose-email-content"
      elements={[{
        label: 'To',
        ref: node => {
          refs['to'] = node;
        },
        id: 'compose-email-to',
        placeholder: ''
      }, {
        label: 'Subject',
        ref: node => {
          refs['subject'] = node;
        },
        id: 'compose-email-subject',
        placeholder: ''
      }, {
        label: '',
        ref: node => {
          refs['text'] = node;
        },
        id: 'compose-email-body',
        placeholder: ''
      }]}
      onButtonClick={e => {
        e.preventDefault();
        const text = refs.text.value || '';
        const subject = refs.subject.value || '';
        const to = refs.to ? refs.to.value.split(',') : null;
        if (!(to && to.length > 0))
          alert('Please specify atleast one email address');
        store.dispatch(sendEmail(to, text, subject));
        panel.hide();
      }}
      buttonName="Send"
    />;
  }
}
ComposeModal.contextTypes = {
  store: React.PropTypes.object
};
