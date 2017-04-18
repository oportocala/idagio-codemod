import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';

import { loadSoloists } from '../actions/soloist';
import { selectSoloists } from '../selectors/categories';

import * as Shapes from '../shapes';

import Head from '../components/chrome/Head';
import List from '../components/util/List';

const messages = defineMessages({
  metaTitle: {
    id: 'soloists.meta.title',
    defaultMessage: 'Soloists',
  },
  metaDescription: {
    id: 'soloists.meta.description',
    defaultMessage: 'Find and play curated classical music from hundreds of soloists. Compare alternative recordings and browse by soloist.',
  },
});

class Soloists extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(Shapes.Person).isRequired,
    intl: intlShape,
  };

  static fetchData(store) {
    return [
      store.dispatch(loadSoloists()),
    ];
  }

  static chrome = {
    type: CHROME_GLASS,
    background: (state, { slug }) => {
      const id = selectPlaylistIdFromSlug(state, slug);
      return state.entities.playlists[id].imageUrl;
    },
  };

  renderItem(soloist) {
    return (
      <li key={soloist.id}>
        <Link to={`/${soloist.id}`}><strong>{soloist.surname}</strong>, {soloist.forename}</Link>
      </li>
    );
  }

  render() {
    const { intl, items } = this.props;
    const { formatMessage } = intl;
    return (
      <div className="u-page-container">
        <Head
          title={formatMessage(messages.metaTitle)}
          description={formatMessage(messages.metaDescription)}
        />
        <h2>
          <FormattedMessage id="soloists.title" defaultMessage="Soloists"/>
        </h2>
        <List items={items} renderItem={this.renderItem} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    items: selectSoloists(state),
  };
}

export default connect(mapStateToProps)(injectIntl(Soloists));
