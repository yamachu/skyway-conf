import * as React from "react";
import { useState } from "react";
import { FunctionComponent } from "react";
import { css } from "@emotion/core";
import { globalColors } from "../../shared/global-style";
import { RoomInit } from "../utils/types";

interface Props {
  onSubmit: (init: RoomInit) => void;
}
const RoomCreate: FunctionComponent<Props> = (props) => {
  const [targetUid, setTargetUid] = useState("");
  const [roomType, setRoomType] = useState("sfu");

  return (
    <form
      css={wrapperStyle}
      onSubmit={(ev) => {
        ev.preventDefault();
        props.onSubmit({ mode: roomType as RoomInit["mode"], targetUid });
      }}
    >
      <div css={itemStyle}>
        <div>TARGET UID</div>
        <input
          type="text"
          value={targetUid}
          placeholder="target uid"
          onChange={(ev) => setTargetUid(ev.target.value)}
          required
          css={roomIdStyle}
        />
      </div>
      <span css={tipStyle}>
        {targetUid !== "" ? "" : "target uid is required!"}
      </span>

      <div css={itemStyle}>
        <div>ROOM TYPE</div>
        <div>
          {["sfu", "mesh"].map((type) => (
            <label key={type} css={roomTypeStyle}>
              <input
                type="radio"
                onChange={() => setRoomType(type)}
                value={roomType}
                checked={roomType === type}
                name="room-type"
              />{" "}
              {type}
            </label>
          ))}
        </div>
      </div>

      <div css={buttonWrapStyle}>
        <button
          css={createButtonStyle}
          type="submit"
          disabled={targetUid === ""}
        >
          CREATE ROOM
        </button>
      </div>
    </form>
  );
};

export default RoomCreate;

const wrapperStyle = css({
  backgroundColor: globalColors.white,
  border: `1px solid ${globalColors.gray}`,
  padding: 16,
  borderRadius: 2,
});

const itemStyle = css({
  display: "grid",
  alignItems: "center",
  gridTemplateColumns: "88px 1fr",
  height: 40,
  marginBottom: 4,
});

const roomIdStyle = css({
  width: "100%",
  boxSizing: "border-box",
  appearance: "none",
  border: 0,
  borderBottom: `1px solid ${globalColors.gray}`,
  fontSize: "1.2rem",
  padding: "4px 8px",
  "&:focus": {
    borderColor: globalColors.blue,
  },
});

const tipStyle = css({
  color: globalColors.red,
  fontSize: ".8rem",
});

const roomTypeStyle = css({
  margin: "0 8px",
  fontSize: "1.2rem",
  "& > input": {
    verticalAlign: "middle",
  },
});

const buttonWrapStyle = css({
  marginTop: 24,
});

const createButtonStyle = css({
  backgroundColor: globalColors.blue,
  color: globalColors.white,
  height: 40,
  border: 0,
  cursor: "pointer",
  padding: "0 24px",
  fontSize: "1.2rem",
  borderRadius: 2,
  "&:disabled": {
    backgroundColor: globalColors.gray,
    cursor: "not-allowed",
  },
});
