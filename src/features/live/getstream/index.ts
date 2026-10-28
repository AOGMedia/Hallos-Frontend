/**
 * GetStream live classes — the second provider beside ZegoCloud.
 *
 * Everything GetStream-specific lives in this folder; the shared live pages
 * (room, lobby, create form) only import from here. ZegoCloud code
 * (components/zego-room, services/zegoService) is separate and untouched.
 */
export { GetStreamRoomClient } from "./GetStreamRoomClient";
export { RecordingsList } from "./components/RecordingsList";
export { endGetStreamLive, joinGetStreamCall, startGetStreamLive, type GetStreamTarget } from "./api";
