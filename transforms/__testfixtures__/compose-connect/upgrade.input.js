import React, { Component, PropTypes } from 'react';
import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import {
  selectUserIsPremium,
  selectUserIsTrialOptIn,
  selectUserIsTrialOptOut,
  selectUserIsExpiredOptInTrial,
  selectUserIsFree,
  selectUserIsAllowedTrial,
} from '../selectors/user';

import Head from '../components/chrome/Head';
import Price from '../components/common/Price';

import ConversionForm from '../components/premium/ConversionForm';

import {
  LOGIN_INTENT,
  SUBSCRIPTION_PLAN_TRIAL_OPT_OUT,
  SIGNUP_INTENT,
  SUBSCRIPTION_TRIAL_DURATION_DAYS,
} from '../constants';
import { selectUser } from '../selectors/user';

const LANDING_PAGE_DEFAULT_ID = 'lp-idagio-trial-upgrade-1';

import RedirectInstruction from '../lib/routing/RedirectInstruction';

const messages = defineMessages({
  headerDefault: {
    id: 'upgrade.header.default',
    defaultMessage: 'IDAGIO Premium',
  },
  subHeaderDefault: {
    id: 'upgrade.sub-header.default',
    defaultMessage: 'Access to premium recordings, HD audio, offline listening and more...',
  },

  headerFreeUser: {
    id: 'upgrade.header.free-user',
    defaultMessage: 'Try IDAGIO Premium',
  },
  subHeaderFreeUser: {
    id: 'upgrade.sub-header.free-user',
    defaultMessage: '{trialDays} days free access to IDAGIO Premium. Only {price} / month afterwards.',
  },

  headerNoUser: {
    id: 'upgrade.header.no-user',
    defaultMessage: 'IDAGIO Premium',
  },
  subHeaderNoUser: {
    id: 'upgrade.sub-header.no-user',
    defaultMessage: 'Access to premium recordings, HD audio, offline listening and more...',
  },

  headerExpiredUser: {
    id: 'upgrade.header.expired-trial-user',
    defaultMessage: 'Join IDAGIO Premium',
  },
  subHeaderExpiredUser: {
    id: 'upgrade.sub-header.expired-trial-user',
    defaultMessage: 'Regain access to premium recordings and features.',
  },

  headerTrialOptOutUser: {
    id: 'upgrade.header.trial-opt-user',
    defaultMessage: 'Join IDAGIO Premium',
  },
  subHeaderTrialOptOutUser: {
    id: 'upgrade.sub-header.trial-opt-user',
    defaultMessage: 'Secure your access to premium recordings and features.',
  },

  metaTitle: {
    id: 'upgrade.meta.title',
    defaultMessage: 'Upgrade to premium',
  },
});


export class Upgrade extends Component {
  static propTypes = {
    userIsTrialOptIn: PropTypes.bool.isRequired,
    userIsFree: PropTypes.bool.isRequired,
    userIsExpiredOptIn: PropTypes.bool.isRequired,
    userIsAllowedTrial: PropTypes.bool.isRequired,
    user: PropTypes.object,
    landingPageId: PropTypes.string.isRequired,
    intent: PropTypes.string.isRequired,
    isIOSLanding: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  static fetchData(store) {
    const state = store.getState();
    const shouldRedirect = selectUserIsPremium(state) || selectUserIsTrialOptOut(state);
    if (shouldRedirect) {
      return Promise.reject(new RedirectInstruction('/premium'));
    }

    return [];
  }

  state = {
    complete: false,
  };

  onComplete = () => {
    if (this.props.isIOSLanding) {
      this.context.router.push('/premium-ios-success');
    }

    this.setState({
      complete: true,
    });
  };

  renderHeader() {
    const { formatMessage } = this.props.intl;

    let title = formatMessage(messages.headerDefault);
    let subTitle = formatMessage(messages.subHeaderDefault);

    if (this.props.userIsFree && this.props.user.previous_plan === null) {
      title = formatMessage(messages.headerFreeUser);
      subTitle = (
        <FormattedMessage
          id="upgrade.sub-header.free-user"
          defaultMessage="{trialDays} days free access to IDAGIO Premium. Only {price} / month afterwards."
          values={
            {
              trialDays: SUBSCRIPTION_TRIAL_DURATION_DAYS,
              price: <Price/>,
            }
          }
        />
      );
    }

    if (!this.props.user) {
      title = formatMessage(messages.headerNoUser);
      subTitle = formatMessage(messages.subHeaderNoUser);
    }

    if (this.props.user && !this.props.userIsAllowedTrial) {
      title = formatMessage(messages.headerExpiredUser);
      subTitle = formatMessage(messages.subHeaderExpiredUser);
    }

    if (this.props.userIsTrialOptIn || this.props.isIOSLanding) {
      title = formatMessage(messages.headerTrialOptOutUser);
      subTitle = formatMessage(messages.subHeaderTrialOptOutUser);
    }

    if (this.state.complete) {
      title = '';
      subTitle = '';
    }

    return (
      <div>
        <h1 className="upgrade-header__title">{ title }</h1>
        <p className="upgrade-header__subtitle u-subheading">{ subTitle }</p>
      </div>
    );
  }

  renderSubscribe = () => {
    const { landingPageId, intent } = this.props;

    return (
      <div className="upgrade">
        <div className="upgrade-bg" />
        <div className="upgrade-header u-page-container">
          { this.renderHeader() }
        </div>
        <div className="upgrade__container u-page-container">
          <div className="upgrade__form" id="start">
            <ConversionForm
              targetPlan={SUBSCRIPTION_PLAN_TRIAL_OPT_OUT}
              landingPageId={landingPageId}
              accountIntent={intent}
              onComplete={this.onComplete}
              showPaymentDetails
            />
          </div>
        </div>
        <div className="u-page-container upgrade-featured u-flex--is-center">
          <h4 className="upgrade-featured__heading">
            <FormattedMessage id="upgrade.featured.heading" defaultMessage="Featured in"/>
          </h4>
          <div className="u-hide-text upgrade-featured__logo upgrade-featured__logo--sdz">S&uuml;ddeutsche Zeitung</div>
          <div className="u-hide-text upgrade-featured__logo upgrade-featured__logo--times">The Times</div>
          <div className="u-hide-text upgrade-featured__logo upgrade-featured__logo--faz">Frankfurter Allgemeine</div>
          <div className="u-hide-text upgrade-featured__logo upgrade-featured__logo--inyt">International New York Times</div>
        </div>
      </div>
    );
  }

  render() {
    const { formatMessage } = this.props.intl;
    return (
      <div className="premium">
        <Head title={formatMessage(messages.metaTitle)} />
        { this.renderSubscribe() }
      </div>
    );
  }

  static trackingProps = (state, params, location) => {
    let landingPageId = LANDING_PAGE_DEFAULT_ID;
    if (location.query.landing_page_id) {
      landingPageId = location.query.landing_page_id;
    }

    return { landing_page_id: landingPageId };
  };
}

function mapStateToProps(state) {
  return {
    user: selectUser(state),
    userIsTrialOptIn: selectUserIsTrialOptIn(state),
    userIsFree: selectUserIsFree(state),
    userIsExpiredOptIn: selectUserIsExpiredOptInTrial(state),
    userIsAllowedTrial: selectUserIsAllowedTrial(state),
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  let intent = LOGIN_INTENT;
  let landingPageId = LANDING_PAGE_DEFAULT_ID;
  let isIOSLanding = false;

  if (ownProps.location.query) {
    const query = ownProps.location.query;
    if (query.intent === 'signup') {
      intent = SIGNUP_INTENT;
    }

    if (query.from === 'ios') {
      isIOSLanding = true;
    }

    if (query.landing_page_id) {
      landingPageId = query.landing_page_id;
    }
  }

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,

    intent,
    landingPageId,
    isIOSLanding,
  };
}

export default connect(
  mapStateToProps,
  {},
  mergeProps
)(injectIntl(Upgrade));
