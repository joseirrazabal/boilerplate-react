import React from 'react';
import PropTypes from 'prop-types';
import ModalWrapper, { withOnClose } from './ModalWrapper';
import Translator from '../../requests/apa/Translator';
import EpisodeSelection from "../EpisodeSelection/index";

const ModalEpisodeSelect = ({ serieData,playButton, handleEpisodeClick, handleClose, onClose,setMetricsEvent }) => {
  const modalProps = {
    buttons: [{
      styles: { padding: '6px 10px' },
      content: Translator.get('btn_modal_close', 'Cerrar'),
      props: {
        onClick: (e) => {
          handleClose(e);
          if (typeof onClose == 'function') {
            onClose(e);
          }
        }
      }
    }]
  };
  return (
    <ModalWrapper {...modalProps}>
      <div className={"modal-episode-selection"}>

      <EpisodeSelection
            data={serieData}
            visibleEpisodes={4}
            handleEpisodeClick={(episode) => {
              handleEpisodeClick(episode);
              handleClose();
            }}
            setMetricsEvent={(payload)=>{
              setMetricsEvent(payload)
            }}
            handlePlay={this.handlePlay}
            getPlayButton={playButton}
          />
      </div>
    </ModalWrapper>
  );
};

ModalEpisodeSelect.propTypes = {
  serieData: PropTypes.shape({
    seasons: PropTypes.arrayOf(
      PropTypes.shape({
        number: PropTypes.string.isRequired,
        episodes: PropTypes.array.isRequired,
      })
    ).isRequired,
    seasonNumber: PropTypes.string.isRequired,
    episodeNumber: PropTypes.string.isRequired,
  }),
  handleEpisodeClick: PropTypes.func.isRequired,
};

export default withOnClose(ModalEpisodeSelect);
