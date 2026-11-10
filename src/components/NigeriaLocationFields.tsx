"use client";

import { useId, useMemo } from "react";
import {
  NIGERIAN_STATES,
  NIGERIAN_LGAS,
} from "@/data/nigeria-locations";

type Props = {
  stateValue: string;
  lgaValue: string;
  communityValue: string;
  onStateChange: (value: string) => void;
  onLgaChange: (value: string) => void;
  onCommunityChange: (value: string) => void;
  required?: boolean;
};

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en-NG");
}

export function isValidNigeriaLocation(
  stateValue: string,
  lgaValue: string
) {
  const state = NIGERIAN_STATES.find(
    (item) => normalize(item.name) === normalize(stateValue)
  );

  if (!state) return false;

  return NIGERIAN_LGAS.some(
    (item) =>
      item.stateId === state.id &&
      normalize(item.name) === normalize(lgaValue)
  );
}

export default function NigeriaLocationFields({
  stateValue,
  lgaValue,
  communityValue,
  onStateChange,
  onLgaChange,
  onCommunityChange,
  required = false,
}: Props) {
  const id = useId().replace(/:/g, "");
  const stateListId = `wy-states-${id}`;
  const lgaListId = `wy-lgas-${id}`;

  const selectedState = useMemo(
    () =>
      NIGERIAN_STATES.find(
        (item) => normalize(item.name) === normalize(stateValue)
      ),
    [stateValue]
  );

  const availableLgas = useMemo(
    () =>
      selectedState
        ? NIGERIAN_LGAS.filter(
            (item) => item.stateId === selectedState.id
          )
        : [],
    [selectedState]
  );

  function handleStateChange(value: string) {
    const previousState = NIGERIAN_STATES.find(
      (item) => normalize(item.name) === normalize(stateValue)
    );

    const nextState = NIGERIAN_STATES.find(
      (item) => normalize(item.name) === normalize(value)
    );

    onStateChange(nextState?.name || value);

    if (previousState?.id !== nextState?.id) {
      onLgaChange("");
    }
  }

  function handleLgaChange(value: string) {
    const selected = availableLgas.find(
      (item) => normalize(item.name) === normalize(value)
    );

    onLgaChange(selected?.name || value);
  }

  return (
    <div className="wy-location-fields">
      <label className="wy-profile-field">
        <span>Search and select your state</span>
        <input
          type="text"
          list={stateListId}
          value={stateValue}
          onChange={(event) => handleStateChange(event.target.value)}
          placeholder="Start typing a Nigerian state..."
          autoComplete="off"
          maxLength={80}
          required={required}
        />
        <datalist id={stateListId}>
          {NIGERIAN_STATES.map((state) => (
            <option key={state.id} value={state.name} />
          ))}
        </datalist>
      </label>

      <label className="wy-profile-field">
        <span>
          Search and select your Local Government Area (LGA)
        </span>
        <input
          type="text"
          list={lgaListId}
          value={lgaValue}
          onChange={(event) => handleLgaChange(event.target.value)}
          placeholder={
            selectedState
              ? `Search LGAs in ${selectedState.name}...`
              : "Select a state first"
          }
          autoComplete="off"
          maxLength={100}
          disabled={!selectedState}
          required={required}
        />
        <datalist id={lgaListId}>
          {availableLgas.map((lga) => (
            <option key={lga.id} value={lga.name} />
          ))}
        </datalist>
      </label>

      <label className="wy-profile-field">
        <span>Community / area / nearest landmark</span>
        <input
          type="text"
          value={communityValue}
          onChange={(event) => onCommunityChange(event.target.value)}
          maxLength={120}
          placeholder="e.g. Akungba-Akoko, Iwaro-Oka or a nearby landmark"
          required={required}
        />
      </label>
    </div>
  );
}
