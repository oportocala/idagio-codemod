import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';

import { selectUserIsPatron } from '../selectors/user';

import Head from '../components/chrome/Head';

import DetailsEN from '../components/premium/DetailsEN';
import DetailsDE from '../components/premium/DetailsDE';

import RedirectInstruction from '../lib/routing/RedirectInstruction';

class PremiumSignupInfo extends Component {
  static propTypes = {
    intl: intlShape,
  };

  static fetchData(store) {
    if (selectUserIsPatron(store.getState())) {
      return Promise.reject(new RedirectInstruction('/premium'));
    }

    return [];
  }

  render() {
    const { locale } = this.props.intl;
    return (
      <div>
      <Head title="Premium" />
      <div className="premium-container">
      { locale === 'de-DE' && <DetailsDE /> }
    { locale !== 'de-DE' && <DetailsEN /> }
  </div>
    </div>
  );
  }
}

export default injectIntl(PremiumSignupInfo);
