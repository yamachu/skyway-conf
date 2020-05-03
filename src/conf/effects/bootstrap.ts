import { EffectCallback } from "react";
import { toJS, reaction, observe } from "mobx";
import debug from "debug";
import { getUserDevices, getUserAudioTrack } from "../utils/webrtc";
import { initPeer } from "../utils/skyway";
import RootStore from "../stores";
import { AuthContextValue } from "../../shared/contexts";
import { getMeetings } from "../utils/firestore";

const log = debug("effect:bootstrap");

export const checkRoomSetting = (
  { ui, room }: RootStore,
  authContextValue: AuthContextValue
): EffectCallback => () => {
  log("checkRoomSetting()");
  const params = new URLSearchParams(location.search);

  (async () => {
    if (authContextValue === undefined || authContextValue.user === null) {
      return;
    }

    const meetings = await getMeetings(authContextValue.user.uid);
    if (meetings.length === 0) {
      return;
    }
    const latestMeeting = meetings.sort((a, b) => {
      const ad = a.createdAt.getUTCMinutes();
      const bd = b.createdAt.getUTCMinutes();
      if (ad < bd) {
        return 1;
      } else if (ad > bd) {
        return -1;
      }
      return 0;
    })[0];

    const token = await authContextValue.user.getIdToken();
    const peerUserId = authContextValue.user.uid;
    const roomId = latestMeeting.roomId;
    const roomType = latestMeeting.roomType;
    const peerId = `${roomId}_${peerUserId}`;

    const peer = await fetch("http://localhost:8080/authenticate", {
      method: "POST",
      body: JSON.stringify({
        peerId,
      }),
      headers: new Headers([
        ["Authorization", `Bearer ${token}`],
        ["Content-Type", "application/json"],
      ]),
      mode: "cors",
    })
      .then((v) => v.json())
      .then((credential) => initPeer(params.has("turn"), peerId, credential))
      .catch((err) => {
        throw ui.showError(err);
      });
    // just log it, do not trust them
    peer.on("error", console.error);
    room.load(
      {
        mode: roomType,
        id: roomId,
        useH264: params.has("h264"),
      },
      peer
    );

    log(`room: ${roomType}/${roomId}`);
    log("peer instance created");
  })();
};

export const initAudioDeviceAndClient = ({
  ui,
  client,
  media,
}: RootStore): EffectCallback => () => {
  log("ensureAudioDevice()");

  (async () => {
    // check at least audio input exists
    const { videoInDevices, audioInDevices } = await getUserDevices({
      video: true,
      audio: true,
    }).catch((err) => {
      throw ui.showError(err);
    });

    // must not be happened
    if (videoInDevices === null) {
      throw ui.showError(new Error("getUserDevices() returns null"));
    }
    if (audioInDevices === null) {
      throw ui.showError(new Error("getUserDevices() returns null"));
    }
    if (audioInDevices.length === 0) {
      throw ui.showError(new Error("At least one audio input device needed!"));
    }

    log(
      "%s audio + %s video builtin devices are found",
      audioInDevices.length,
      videoInDevices.length
    );

    // keep audio track
    const [{ deviceId }] = audioInDevices;
    const audioTrack = await getUserAudioTrack(deviceId).catch((err) => {
      throw ui.showError(err);
    });
    media.setAudioTrack(audioTrack, deviceId);

    // and get valid labels...
    const devices = await getUserDevices({ audio: true }).catch((err) => {
      throw ui.showError(err);
    });
    media.setAudioDevices(devices);
    log("audio devices", devices.audioInDevices);

    // load client
    client.load({
      ua: navigator.userAgent,
      hasUserVideoDevice: videoInDevices.length !== 0,
      hasGetDisplayMedia:
        typeof navigator.mediaDevices.getDisplayMedia === "function",
      name: (localStorage.getItem("SkyWayConf.dispName") || "").trim(),
    });
    log("client loaded", toJS(client));
  })();
};

export const listenStoreChanges = ({
  client,
  media,
  room,
  notification,
}: RootStore): EffectCallback => () => {
  log("listenStoreChanges()");

  const disposers = [
    reaction(
      () => room.isJoined,
      (isJoined) =>
        isJoined && notification.showInfo(`You joined the room ${room.name}`)
    ),
    reaction(
      () => media.isAudioTrackMuted,
      (muted) =>
        notification.showInfo(`Mic input was ${muted ? "muted" : "unmuted"}`)
    ),
    reaction(
      () => media.isVideoTrackMuted,
      (muted) =>
        notification.showInfo(`Video was ${muted ? "muted" : "unmuted"}`)
    ),
    observe(media, "audioDeviceId", (change) => {
      if (change.oldValue === null) {
        // skip initial value
        return;
      }
      notification.showInfo("Mic input was changed");
    }),
    observe(media, "videoDeviceId", (change) => {
      if (change.oldValue === null) {
        notification.showInfo("Video input was enabled");
        return;
      }
      if (change.newValue !== null) {
        notification.showInfo("Video input was changed");
      } else {
        notification.showInfo("Video input was disabled");
      }
    }),
    reaction(
      () => room.castRequestCount,
      () => notification.showInfo("Your video was casted to everyone")
    ),
    reaction(
      () => room.myLastReaction,
      (reaction) =>
        reaction &&
        notification.showInfo(`You reacted with ${reaction.reaction}`)
    ),
    reaction(
      () => client.displayName,
      (name) => {
        localStorage.setItem("SkyWayConf.dispName", name.trim());
        notification.showInfo("Display name saved");
      },
      { delay: 2000 }
    ),
  ];

  return () => disposers.forEach((d) => d());
};

export const listenGlobalEvents = ({
  media,
  ui,
}: RootStore): EffectCallback => () => {
  log("listenGlobalEvents()");

  const reloadOnHashChange = () => location.reload(true);
  const reloadOnDeviceAddOrRemoved = async () => {
    log("devicechange event fired");
    const { audioInDevices, videoInDevices } = await getUserDevices({
      video: true,
      audio: true,
    }).catch((err) => {
      throw ui.showError(err);
    });

    // must not be happened
    if (audioInDevices === null || videoInDevices === null) {
      throw ui.showError(new Error("getUserDevices() returns null"));
    }

    const curAudioInDevices = media.audioInDevices;
    const curVideoInDevices = media.videoInDevices;

    // Safari fires this event on updating label(num of devices are not changed)
    if (
      curAudioInDevices.length &&
      audioInDevices.length !== curAudioInDevices.length
    ) {
      location.reload(true);
    }
    if (
      curVideoInDevices.length &&
      videoInDevices.length !== curVideoInDevices.length
    ) {
      location.reload(true);
    }
  };

  window.addEventListener("hashchange", reloadOnHashChange, false);
  navigator.mediaDevices.addEventListener(
    "devicechange",
    reloadOnDeviceAddOrRemoved,
    false
  );

  return () => {
    log("listener removed");
    window.removeEventListener("hashchange", reloadOnHashChange);
    navigator.mediaDevices.removeEventListener(
      "devicechange",
      reloadOnDeviceAddOrRemoved
    );
  };
};
