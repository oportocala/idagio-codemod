import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

class X extends Component {
  static otherStaicFunction() {

  }

  static chrome = {};

  fetchData() {

  }
}

function fetchData(store, { slug }) {
  return [
    store.dispatch(loadPlaylist(slug)),
  ];
}

connect(function () {} , {}, (X));
