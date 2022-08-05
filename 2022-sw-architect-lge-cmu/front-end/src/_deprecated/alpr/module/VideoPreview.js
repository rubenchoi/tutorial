/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState, Fragment } from 'react'
import { Row, Col } from 'reactstrap';
import videojs from 'video.js';

const TEST_URL = 'http://localhost:3000/video/beaver1.avi';

class VideoPlayer extends React.Component {
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.videoNode, this.props, function onPlayerReady() {
      console.log('onPlayerReady', this)
      if (this.player) {
        this.player.src({
          type: 'video/avi',
          src: TEST_URL
        });
      } 
    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  componentWillReceiveProps(newProps) {
    // When a user moves from one title to the next, the VideoPlayer component will not be unmounted,
    // instead its properties will be updated with the details of the new video. In this case,
    // we can update the src of the existing player with the new video URL.
    // if (this.player) {
    //   this.player.src({
    //     type: newProps.video.mime_type,
    //     src: newProps.video.video_url
    //   });
    // } 
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  
  // use `ref` to give Video JS a reference to the video DOM element: https://reactjs.org/docs/refs-and-the-dom
  render() {
    return (
      <div data-vjs-player>
        <video ref={ node => this.videoNode = node } className="video-js"></video>
      </div>
    )
  }
}

export default VideoPlayer;
// export const VideoPreviewComponent = (props) => {
//   useEffect(() => {
//     alert(ReactPlayer.canPlay(TEST_URL));
//   }, []);

//   return (<>
//     {/* <video
//       ref={refVideo}
//       autoPlay
//       style={props.showDetail ? { float: 'left', width: '20vw' } : {}}
//     /> */}
//   </>);
// }
