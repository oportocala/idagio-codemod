import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import classnames from 'classnames';
import { FormattedMessage, intlShape, injectIntl, defineMessages } from 'react-intl';
import { Link } from 'react-router';

import * as Shapes from '../shapes';

import { loadPlaylist, loadWeeklyMix } from '../actions/playlist';
import * as playerActions from '../actions/player';
import { toggleTrackInCollection, togglePlaylistInCollection } from '../actions/collection';

import Head from '../components/chrome/Head';
import List from '../components/util/List';
import PlaylistItem from '../components/playlist/PlaylistItem';
import PlayAllButton from '../components/common/PlayAllButton';
import PlaylistPremiumBanner from '../components/premium/PlaylistPremiumBanner';
import ImgixImage from 'react-imgix';
import CollectionButton from '../components/common/CollectionButton';
import ImageCredit from '../components/common/ImageCredit';

import isDuplicatePiece from '../utils/isDuplicatePiece';

import RedirectInstruction from '../lib/routing/RedirectInstruction';

import { selectEntityIsInCollection, selectCollectionIds } from '../selectors/collection';
import { selectUserIsPatron, selectUserIsAuthenticated } from '../selectors/user';
import { selectPlayerCurrentQueueItem } from '../selectors/player';
import {
  selectPlaylist,
  selectIdFromSlug,
  selectPlaylistIsPlayable,
  selectPlaylistIsPlaying,
  selectPlaylistIsQueued,
  selectPlaylistImageAnnotaion,
} from '../selectors/playlist';

import { QUEUE_TYPE_PLAYLIST_ITEM, CHROME_GLASS } from '../constants';

const messages = defineMessages({
  playAllButton: {
    id: 'playlist.play-all',
    defaultMessage: 'Play playlist',
  },
  metaDescription: {
    id: 'playlist.meta.description',
    defaultMessage: 'Listen to {title} playlist on IDAGIO. {description}',
  },
});

export class Playlist extends Component {
  static chrome = {
    type: CHROME_GLASS,
    background: (state, { slug }) => {
      const id = selectIdFromSlug(state, slug);
      return state.entities.playlists[id].imageUrl;
    },
  };

  static propTypes = {
    userIsPatron: PropTypes.bool.isRequired,
    playlist: Shapes.Playlist.isRequired,
    isPlayable: PropTypes.bool.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    isQueued: PropTypes.bool.isRequired,
    queueItem: PropTypes.object,

    containsPremium: PropTypes.bool.isRequired,
    containsOnlyPremium: PropTypes.bool.isRequired,

    setQueueAndPlay: PropTypes.func.isRequired,
    pause: PropTypes.func.isRequired,
    play: PropTypes.func.isRequired,
    toggleTrackInCollection: PropTypes.func.isRequired,
    togglePlaylistInCollection: PropTypes.func.isRequired,

    playlistIsInCollection: PropTypes.bool.isRequired,
    collectionIds: Shapes.CollectionIds,
    intl: intlShape,

    imageAnnotation: PropTypes.object,

    hideCollectionButton: PropTypes.bool.isRequired,
    pathname: PropTypes.string.isRequired,
  };

  static fetchData(store, { slug }) {
    if (slug === 'weekly-mix') {
      if (selectUserIsAuthenticated(store.getState())) {
        return [
          store.dispatch(loadWeeklyMix()),
        ];
      }
      const loginTo = encodeURIComponent('playlists/weekly-mix');
      return Promise.reject(new RedirectInstruction(`/login?to=${loginTo}`));
    }

    return [
      store.dispatch(loadPlaylist(slug)),
    ];
  }

  getQueueOrigin = () => ({
    type: QUEUE_TYPE_PLAYLIST_ITEM,
    id: this.props.playlist.id,
  });

  renderTrackItem = (track) => {
    const { playlist, containsOnlyPremium, isPlaying, isQueued, queueItem, collectionIds } = this.props;
    const isCurrentTrack = isQueued &&
      track.id.toString() === queueItem.track.toString();
    // toString() is used because of strings inside of playlist.trackIds
    // vs int ids inside of track object

    return (
      <PlaylistItem
        key={track.id}
        track={track}
        isCurrentTrack={isCurrentTrack}
        playing={isPlaying && isCurrentTrack}
        playFromTrack={this.playFromTrack(track.id)}
        pause={this.props.pause}
        play={this.props.play}
        onCollectionButtonClick={this.props.toggleTrackInCollection.bind(this, track.id, 'Playlist')}
        trackIsInCollection={selectEntityIsInCollection('track', collectionIds, track.id)}
        isDuplicatePiece={isDuplicatePiece(playlist.tracks, track.piece.id)}
        playlistContainsOnlyPremium={containsOnlyPremium}
      />
    );
  };

  renderLongDescription = (longDescriptionParts) => longDescriptionParts
    .map((part, i) => part ? <p key={i}>{part}</p> : <br key={i}/>);

  renderTrackList() {
    const { description, tracks, longDescription } = this.props.playlist;

    let longDescriptionParts;
    let longDescriptionClassNames;
    if (longDescription) {
      longDescriptionParts = longDescription.split(/(?:\r\n|\r|\n)/g);
      longDescriptionClassNames = classnames('playlist-long-description', {
        'playlist-long-description--center': longDescriptionParts.length === 1,
      });
    }
    return (
      <div className="playlist-tracks u-page-container">

        <div className="playlist-description u-serif">
          { description }
          {longDescription &&
            <p className="playlist-description__text">
              <Link to={`/${this.props.pathname}#long-description`} className="c-text-link--is-white-and-visible">
                <FormattedMessage id="playlist.description.read-more" defaultMessage="Read more…"/>
              </Link>
            </p>
          }
        </div>

        { this.renderPremiumBanner() }
        <List renderItem={this.renderTrackItem} items={tracks}/>
        {longDescription &&
          <div className={longDescriptionClassNames} id="long-description">
            { this.renderLongDescription(longDescriptionParts) }
          </div>
        }
      </div>
    );
  }

  renderHeader() {
    const { playlist, isPlaying, playlistIsInCollection, intl, imageAnnotation, hideCollectionButton } = this.props;
    const { title, imageUrl } = playlist;
    const playButtonClassNames = classnames('playlist-header-play-button play-all-button--text');

    return (
      <div className="playlist-header">
        <ImgixImage
          src={imageUrl}
          className="playlist-header__image"
          width="720"
          height="720"
          bg
        />
        <div className="playlist-header-info">
          <h1 className="playlist-header-title">{ title }</h1>
          <div className="playlist-header-buttons">
            <PlayAllButton
              onClick={this.togglePlayAll}
              playing={isPlaying}
              className={playButtonClassNames}
              title={intl.formatMessage(messages.playAllButton)}
            />
            { !hideCollectionButton &&
              <CollectionButton
                active={playlistIsInCollection}
                onClick={this.togglePlaylistInCollection}
              />
            }
          </div>
          <ImageCredit className="playlist-header-image-credit" annotation={imageAnnotation}/>
        </div>
      </div>
    );
  }

  renderPremiumBanner() {
    const { containsPremium, containsOnlyPremium, userIsPatron } = this.props;
    if (!containsPremium || userIsPatron) {
      return null;
    }

    return (
      <PlaylistPremiumBanner className="premium-banner--playlist"  containsOnlyPremium={containsOnlyPremium} />
    );
  }

  render() {
    const { playlist, intl } = this.props;
    const bgStyle = {
      backgroundImage: `url(${playlist.imageUrl}?auto=format&dpr=1&blur=1600&crop=faces&fit=crop&w=2000&h=2000)`,
    };

    const ogImage = `${playlist.imageUrl}?auto=format&dpr=1&crop=faces&fit=crop&w=1200&h=630`;

    return (
      <div className="playlist">
        <Head
          title={playlist.title}
          description={
            intl.formatMessage(messages.metaDescription, {
              title: playlist.title,
              description: playlist.description,
            })}
          imageUrl={ogImage}
        />
        <div className="playlist-bg c-image-overlay--is-static" style={bgStyle} />
        { this.renderHeader() }
        { this.renderTrackList() }
      </div>
    );
  }

  playFromTrack = (trackId) => () => {
    this.props.setQueueAndPlay(this.getQueueOrigin(), this.props.playlist.trackIds, trackId);
  };

  togglePlaylistInCollection = () => {
    this.props.togglePlaylistInCollection(this.props.playlist.id, 'Playlist');
  };

  togglePlayAll = () => {
    const { playlist, isQueued, isPlaying } = this.props;
    const { play, pause, setQueueAndPlay } = this.props;

    if (isQueued) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      setQueueAndPlay(this.getQueueOrigin(), playlist.trackIds, playlist.trackIds[0]);
    }
  };
}

function mapStateToProps(state, ownProps) {
  const slug = ownProps.params.slug;
  return {
    userIsPatron: selectUserIsPatron(state),
    playlist: selectPlaylist(state, slug),
    isPlayable: selectPlaylistIsPlayable(state, slug),
    isPlaying: selectPlaylistIsPlaying(state, slug),
    isQueued: selectPlaylistIsQueued(state, slug),
    queueItem: selectPlayerCurrentQueueItem(state),
    playlistIsInCollection: selectEntityIsInCollection('playlist', selectCollectionIds(state),  selectPlaylist(state, slug).id),
    collectionIds: selectCollectionIds(state),
    imageAnnotation: selectPlaylistImageAnnotaion(state, slug),
    hideCollectionButton: slug === 'weekly-mix',
    pathname: ownProps.location.pathname,
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const premiumFlags = stateProps.playlist.tracks.map(track => track.recording.isPremium);
  const containsPremium = premiumFlags.some(isPremium => isPremium);
  const containsOnlyPremium = premiumFlags.every(isPremium => isPremium);

  return {
    ...stateProps,
    ...ownProps,
    ...dispatchProps,

    containsPremium,
    containsOnlyPremium,
  };
}

export default compose(
  connect(
    mapStateToProps,
    {
      setQueueAndPlay: playerActions.setQueueAndPlay,
      pause: playerActions.pause,
      play: playerActions.play,
      toggleTrackInCollection,
      togglePlaylistInCollection,
    },
    mergeProps,
  ),
  injectIntl,
)(Playlist);
