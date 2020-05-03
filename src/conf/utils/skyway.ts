import Peer, { SfuRoom, PeerCredential } from "skyway-js";

export const initPeer = (
  forceTurn: boolean,
  peerId: string,
  credential: PeerCredential
): Promise<Peer> => {
  return new Promise((resolve, reject) => {
    const peer = new Peer(peerId, {
      key: "<YOUR_SKYWAY_API_KEY>",
      debug: 2,
      config: {
        iceTransportPolicy: forceTurn ? "relay" : "all",
      },
      credential,
    });

    peer.once("open", () => {
      peer.removeListener("error", reject);
      resolve(peer);
    });
    // for onOpen error
    peer.once("error", reject);
  });
};

export const getPeerConnectionFromSfuRoom = (
  room: SfuRoom
): RTCPeerConnection => {
  // @ts-ignore: to get private refs
  return room._negotiator._pc;
};
