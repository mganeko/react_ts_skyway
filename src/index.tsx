import React from 'react';
import ReactDOM from 'react-dom';
import Video from './video'; // video.js
import Peer from 'skyway-js';
import { MouseEvent } from 'react';

import './index.css';

// ----
// TODO
// ----

const appKey = '';

// ------ params -----
let roomId = 'skyway-test';
const roomFromUrl = getRoomFromUrl();
if (roomFromUrl && (roomFromUrl !== '')) {
  roomId = roomFromUrl;
}
let signalingKey = appKey; //'';
const keyFromUrl = getKeyFromUrl();
if (keyFromUrl && (keyFromUrl !== '')) {
  signalingKey = keyFromUrl;
}

// ---- URL ----
function getRoomFromUrl(): string {
  const search = window.location.search;
  const re = new RegExp('room=([^&=]+)');
  const results = re.exec(search);
  let room = '';
  if (results) {
    room = results[1];
  }
  return room;
}

function getKeyFromUrl(): string | null {
  const search = window.location.search;
  const re = new RegExp('key=([^&=]+)');
  const results = re.exec(search);
  let key = null;
  if (results) {
    key = results[1];
  }
  return key;
}

// --- Skyway -----
const debug = 2;

interface SkywayMediaStream extends MediaStream {
  peerId: string;
}



// ------ App class ------
interface SkywayAppStateInterface {
  playing: boolean;
  connected: boolean;
  roomId: string;
  signalingKey: string;
  //videoCodec: VideoCodecType;
  remoteStreams: { [key: string]: SkywayMediaStream; }
}

class App extends React.Component {
  localStream: MediaStream | null;
  room: any;
  peer: any;
  state: SkywayAppStateInterface;

  constructor(props: object) {
    super(props);
    this.localStream = null;
    this.state = {
      playing: false,
      connected: false,
      roomId: roomId,
      signalingKey: signalingKey,
      //videoCodec: 'VP9',
      remoteStreams: {},
    };

    // This binding is necessary to make `this` work in the callback
    this.startVideo = this.startVideo.bind(this);
    this.stopVideoHandler = this.stopVideoHandler.bind(this);
    this.stopVideo = this.stopVideo.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleRoomChange = this.handleRoomChange.bind(this);
    this.handleKeyChange = this.handleKeyChange.bind(this);
    //this.handleCodecChange = this.handleCodecChange.bind(this);
    this.addRemoteStream = this.addRemoteStream.bind(this);
    this.removeRemoteStream = this.removeRemoteStream.bind(this);
    this.removeAllRemoteStream = this.removeAllRemoteStream.bind(this);

    // -- Skyway connection --
    this.room = null;
    this.peer = null;
  }

  componentDidMount() {
    console.log('App DidMound()');
  }

  componentWillUnmount() {
    console.log('App WillUnmount()');
    if (this.localStream) {
      this.stopVideo();
    }
  }

  // -----------
  startVideo(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log('start Video');
    if (this.localStream) {
      console.warn('localVideo ALREADY started');
      return;
    }

    const constraints = { video: true, audio: true };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.localStream = stream;
        this.setState({ playing: true });
      })
      .catch(err => console.error('media ERROR:', err));
  }

  stopVideoHandler(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log('stop Video');
    this.stopVideo();
  }

  stopVideo() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this.setState({ playing: false });
    }
  }

  // -----------------
  connect(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log('connect');
    if (this.room) {
      console.warn('ALREADY connected');
      return;
    }

    // const options = {
    //   audio: true,
    //   multistream: true,
    //   video: true,
    //   videoCodecType: this.state.videoCodec,
    //   videoBitRate: 1000,
    // };

    console.log('connecting roomId=%s key=%s', this.state.roomId, this.state.signalingKey);
    this.peer = new Peer({
      key: this.state.signalingKey,
      debug: debug
    });
    this.peer.on('open', () => {
      console.log('peer open. id=', this.peer.id);
      this.joinRoom();
    });
    this.peer.on('error', console.error);
  }

  joinRoom() {
    const room = this.peer.joinRoom(this.state.roomId, {
      mode: 'sfu',
      stream: this.localStream,
    });
    room.on('open', () => {
      console.log('room open');
      this.setState({ connected: true });
    });
    room.on('peerJoin', (peerId: string) => {
      console.log(`= new Peer id=${peerId} joined ===`)
    });

    room.on('stream', (stream: SkywayMediaStream) => {
      console.log('addstream id=%s', stream.id, stream.peerId);

      // --- for multi stream ---
      const id = 'remote_' + stream.peerId;
      this.addRemoteStream(id, stream);
    });

    room.on('peerLeave', (peerId: string) => {
      console.log('peerLeave peerId=%s', peerId);

      // --- for multi stream ---
      const id = 'remote_' + peerId;
      this.removeRemoteStream(id);
    });

    room.on('close', () => {
      console.log('room closed');
      //this.handleDisconnect();
    });

    this.room = room;
  }

  disconnect(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    console.log('disconnect');
    this.handleDisconnect();
  }

  handleDisconnect() {
    if (this.room) {
      this.room.close();
      this.room = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this.setState({ playing: false });
    }

    this.removeAllRemoteStream();
    this.setState({ connected: false });
  }

  handleRoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ roomId: e.target.value });
  }

  handleKeyChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ signalingKey: e.target.value });
  }

  // handleCodecChange(e) {
  //   this.setState({ videoCodec: e.target.value });
  // }

  addRemoteStream(id: string, stream: SkywayMediaStream) {
    const clonedStreams = Object.assign({}, this.state.remoteStreams);
    clonedStreams[id] = stream;
    this.setState({ remoteStreams: clonedStreams });
  }

  removeRemoteStream(id: string) {
    const clonedStreams = Object.assign({}, this.state.remoteStreams);
    delete clonedStreams[id];
    this.setState({ remoteStreams: clonedStreams });
  }

  removeAllRemoteStream() {
    const newStreams = {};
    this.setState({ remoteStreams: newStreams });
  }

  // -----------------
  render() {
    console.log('App render()');

    const remoteVideos: JSX.Element[] = [];
    //Object.keys(this.state.remoteStreams).forEach(function (key) {
    Object.keys(this.state.remoteStreams).forEach(function (this: { [key: string]: SkywayMediaStream; }, key: string) {
      const stream: SkywayMediaStream = this[key]; // this は this.state.remoteStream
      console.log('key=id=%s, stream.id=%s', key, stream.id);
      remoteVideos.push(
        <Video id={key} key={key} width={"320px"} height={"240px"} volume={0.5} controls={true} stream={stream}>
        </Video>
      );
    }, this.state.remoteStreams);

    return (
      <div className="App" >
        React - Skyway example<br />
        { /*Video Codec:
        <select value={this.state.videoCodec} onChange={this.handleCodecChange} disabled={this.state.connected} >
          <option value="VP8">VP8</option>
          <option value="VP9">VP9</option>
          <option value="H264">H264</option>
          <option value="H265">H265</option>
        </select>
        &nbsp;*/ }
        <button onClick={this.startVideo} disabled={this.state.playing || this.state.connected}> Start Video</button >
        <button onClick={this.stopVideo} disabled={!this.state.playing || this.state.connected}>Stop Video</button>
        <br />
        SignalingKey: <input id="signaling_key" type="text" size={32} value={this.state.signalingKey} onChange={this.handleKeyChange} disabled={this.state.connected}></input>
        <br />
        Room: <input id="room_id" type="text" value={this.state.roomId} onChange={this.handleRoomChange} disabled={this.state.connected}></input>
        <button onClick={this.connect} disabled={this.state.connected || !this.state.playing}> Connect</button >
        <button onClick={this.disconnect} disabled={!this.state.connected}>Disconnect</button>
        <br />
        <div className="VideoContainer">
          <Video id={"local_video"} width={"160px"} height={"120px"} stream={this.localStream}>
          </Video>
          <div className="RemoteContainer">
            {remoteVideos}
          </div>
        </div>
      </div >
    );
  }
}

// ====================== ReactDOM rendering ====================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
