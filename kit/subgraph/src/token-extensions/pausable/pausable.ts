import { Token } from "../../../generated/schema";
import {
  Paused,
  Unpaused,
} from "../../../generated/templates/Pausable/Pausable";
import { fetchEvent } from "../../event/fetch/event";
import { updateSystemStatsForTokenLaunch } from "../../stats/system-stats";
import { fetchPausable } from "./fetch/pausable";

export function handlePaused(event: Paused): void {
  fetchEvent(event, "Paused");
  const pausable = fetchPausable(event.address);
  pausable.paused = true;
  pausable.save();
}

export function handleUnpaused(event: Unpaused): void {
  fetchEvent(event, "Unpaused");
  const pausable = fetchPausable(event.address);
  pausable.paused = false;
  pausable.save();

  let token = Token.load(event.address);
  if (token) {
    updateSystemStatsForTokenLaunch(token);
  }
}
