import {
  Map,
  List,
  fromJS
} from 'immutable';
import generateRandomString from '../lib/generateRandomString';
import { 
  fetchInbox,
  fetchSentItems,
  fetchUnread
} from '../lib/fetchDocuments';

const FETCH_BOX = 'FETCH_BOX';

export const inbox = (state = List([]), action) => {
  switch (action.type) {
    case FETCH_BOX:
       if (state.size > 0)
        return state;
      return List(fromJS(action.emails));
    default:
      return state;
  }
};
