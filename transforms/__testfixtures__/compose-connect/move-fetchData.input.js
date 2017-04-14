import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class X extends Component {

  static fetchData(store, { slug }) {
    return [
      store.dispatch(loadPlaylist(slug)),
    ];
  }

  static chrome() {

  }
}
