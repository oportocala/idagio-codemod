import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';

class X extends Component {}

function mapStateToProps() {
  return {}
}

function mergeProps() {

}

connect(mapStateToProps, {}, mergeProps)(X);
